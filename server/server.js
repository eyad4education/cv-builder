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

app.use(
  cors({
    origin: clientUrl === '*' ? true : clientUrl,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

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
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

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

app.get('/api/cv', requireAuth, async (req, res) => {
  try {
    const cv = await CV.findOne({ userId: req.user.id }).lean();

    if (!cv) {
      return res.json(cloneInitialCVData());
    }

    return res.json(sanitizeCVData(cv));
  } catch (error) {
    console.error('Failed to fetch CV', error);
    return res.status(500).json({ error: 'Failed to fetch CV' });
  }
});

app.put('/api/cv', requireAuth, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Invalid CV payload' });
    }

    const sanitizedCV = sanitizeCVData(req.body);
    const savedCV = await CV.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        ...sanitizedCV,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    ).lean();

    return res.json({
      success: true,
      cv: sanitizeCVData(savedCV),
    });
  } catch (error) {
    console.error('Failed to save CV', error);
    return res.status(500).json({ error: 'Failed to save CV' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  await connectDatabase();

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
