// Server v2 — includes profile update, account deletion, and multi-CV routes
require('dotenv').config();

const bcrypt = require('bcryptjs');
const cors = require('cors');
const express = require('express');

const { createToken, getPublicUser, requireAuth } = require('./auth');
const { connectDatabase } = require('./db');
const { cloneInitialCVData, sanitizeCVData } = require('./initialCV');
const { CV, User } = require('./models');

const app = express();
const port = Number(process.env.PORT) || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CVS = 10;

app.use(
  cors({
    origin: clientUrl === '*' ? true : clientUrl,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ─── Auth routes ─────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    return res.status(201).json({
      token: createToken(user),
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error('Registration failed', error);

    if (error?.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.json({
      token: createToken(user),
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error('Login failed', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Session restore failed', error);
    return res.status(500).json({ error: 'Failed to restore session' });
  }
});

// DELETE /api/auth/account — permanently delete the user and all their CVs
app.delete('/api/auth/account', requireAuth, async (req, res) => {
  try {
    await CV.deleteMany({ userId: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Account deletion failed', error);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

// PATCH /api/auth/profile — update the user's display name
app.patch('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'Name must be 100 characters or fewer' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return fresh token so the client reflects the updated name immediately
    return res.json({
      user: getPublicUser(user),
      token: createToken(user),
    });
  } catch (error) {
    console.error('Profile update failed', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─── CV helpers ──────────────────────────────────────────────────────────────

function serializeCV(cv) {
  return {
    id: cv._id.toString(),
    name: cv.name || 'My CV',
    data: sanitizeCVData(cv),
  };
}

// ─── CV routes (multi-CV) ────────────────────────────────────────────────────

// GET /api/cvs — list all CVs for the current user
app.get('/api/cvs', requireAuth, async (req, res) => {
  try {
    let cvs = await CV.find({ userId: req.user.id }).lean().sort({ createdAt: 1 });

    // New user: create a default CV so they always have at least one
    if (cvs.length === 0) {
      const user = await User.findById(req.user.id).select('name').lean();
      const initialData = cloneInitialCVData();
      const defaultCV = await CV.create({
        userId: req.user.id,
        name: 'My CV',
        ...initialData,
        personal: { ...initialData.personal, fullName: user?.name || '' },
      });
      cvs = [defaultCV];
    }

    return res.json(cvs.map(serializeCV));
  } catch (error) {
    console.error('Failed to fetch CVs', error);
    return res.status(500).json({ error: 'Failed to fetch CVs' });
  }
});

// POST /api/cvs — create a new CV
app.post('/api/cvs', requireAuth, async (req, res) => {
  try {
    const count = await CV.countDocuments({ userId: req.user.id });

    if (count >= MAX_CVS) {
      return res.status(400).json({ error: `Maximum of ${MAX_CVS} CVs allowed` });
    }

    const name = String(req.body?.name || 'New CV').trim().slice(0, 100) || 'New CV';

    const user = await User.findById(req.user.id).select('name').lean();
    const initialData = cloneInitialCVData();
    const cv = await CV.create({
      userId: req.user.id,
      name,
      ...initialData,
      personal: { ...initialData.personal, fullName: user?.name || '' },
    });

    return res.status(201).json(serializeCV(cv));
  } catch (error) {
    console.error('Failed to create CV', error);
    return res.status(500).json({ error: 'Failed to create CV' });
  }
});

// PUT /api/cvs/:id — save CV data
app.put('/api/cvs/:id', requireAuth, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Invalid CV payload' });
    }

    const sanitized = sanitizeCVData(req.body);

    const cv = await CV.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      sanitized,
      { new: true, runValidators: true }
    ).lean();

    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    return res.json({ success: true, cv: serializeCV(cv) });
  } catch (error) {
    console.error('Failed to save CV', error);
    return res.status(500).json({ error: 'Failed to save CV' });
  }
});

// PATCH /api/cvs/:id/name — rename a CV
app.patch('/api/cvs/:id/name', requireAuth, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim().slice(0, 100);

    if (!name) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    const cv = await CV.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name },
      { new: true, runValidators: true }
    ).lean();

    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    return res.json({ success: true, cv: serializeCV(cv) });
  } catch (error) {
    console.error('Failed to rename CV', error);
    return res.status(500).json({ error: 'Failed to rename CV' });
  }
});

// DELETE /api/cvs/:id — delete a CV (must keep at least 1)
app.delete('/api/cvs/:id', requireAuth, async (req, res) => {
  try {
    const count = await CV.countDocuments({ userId: req.user.id });

    if (count <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last CV' });
    }

    const cv = await CV.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete CV', error);
    return res.status(500).json({ error: 'Failed to delete CV' });
  }
});

// ─── Fallback ─────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Startup ──────────────────────────────────────────────────────────────────

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  await connectDatabase();

  // Drop the old unique index on userId (migration: one CV → many CVs per user).
  // Safe to run every start — silently ignored if the index no longer exists.
  try {
    await CV.collection.dropIndex('userId_1');
    console.log('Dropped legacy unique index on cvs.userId');
  } catch {
    // Index didn't exist or was already dropped — that's fine.
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
