import jsPDF from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function sanitizeFilename(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeLineItems(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim().replace(/^[*-]\s*/, ''))
    .filter(Boolean);
}

export async function generatePDF(data, cvName) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 20;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 5;
  let y = margin;

  function ensureSpace(heightNeeded) {
    if (y + heightNeeded > 270) {
      doc.addPage();
      y = margin;
    }
  }

  function addSectionHeader(title) {
    ensureSpace(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;
  }

  function addParagraph(text, fontSize = 10, fontStyle = 'normal', indent = 0) {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    ensureSpace(lines.length * lineHeight);
    doc.text(lines, margin + indent, y);
    y += lines.length * lineHeight;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text((data.personal.fullName || '').toUpperCase(), margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const contactInfo = [
    data.personal.location,
    data.personal.email,
    data.personal.phone,
    data.personal.linkedin,
    data.personal.github,
    data.personal.website,
  ]
    .filter(Boolean)
    .join(' | ');

  if (contactInfo) {
    y = addWrappedText(doc, contactInfo, margin, y, contentWidth, lineHeight);
  }

  if (data.summary) {
    y += 5;
    addSectionHeader('Professional Summary');
    addParagraph(data.summary);
  }

  function renderExperience() {
    if (!data.experience.length) {
      return;
    }

    y += 5;
    addSectionHeader('Professional Experience');

    data.experience.forEach((item) => {
      ensureSpace(15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(item.jobTitle || '', margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const dateText = `${item.startDate || ''} - ${item.isCurrent ? 'Present' : item.endDate || ''}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, pageWidth - margin - dateWidth, y);
      y += 5;

      doc.setFont('helvetica', 'italic');
      doc.text(item.company || '', margin, y);
      y += 5;

      normalizeLineItems(item.description).forEach((line) => {
        addParagraph(`- ${line}`, 10, 'normal', 5);
      });

      y += 3;
    });
  }

  function renderEducation() {
    if (!data.education.length) {
      return;
    }

    y += 5;
    addSectionHeader('Education');

    data.education.forEach((item) => {
      ensureSpace(10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(item.institution || '', margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const dateText = `${item.startYear || ''} - ${item.endYear || ''}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, pageWidth - margin - dateWidth, y);
      y += 5;

      doc.setFont('helvetica', 'italic');
      let degreeText = `${item.degree || ''} in ${item.fieldOfStudy || ''}`.trim();
      if (item.gpa) {
        degreeText += ` | GPA: ${item.gpa}`;
      }
      addParagraph(degreeText);
      y += 3;
    });
  }

  if (data.sectionOrder === 'experience') {
    renderExperience();
    renderEducation();
  } else {
    renderEducation();
    renderExperience();
  }

  if (data.skills.length) {
    y += 5;
    addSectionHeader('Skills');
    addParagraph(data.skills.join(', '));
  }

  if (data.certifications.length) {
    y += 5;
    addSectionHeader('Certifications');
    data.certifications.forEach((item) => {
      addParagraph(`- ${item.name} - ${item.issuer} (${item.year})`, 10, 'normal', 5);
    });
  }

  if (data.languages.length) {
    y += 5;
    addSectionHeader('Languages');
    addParagraph(
      data.languages.map((item) => `${item.language} (${item.proficiency})`).join(', ')
    );
  }

  const filenameBase = sanitizeFilename(cvName || data.personal.fullName || 'cv');
  const fileName = `${filenameBase || 'cv'}.pdf`;

  if (!Capacitor.isNativePlatform()) {
    // If running in browser, just use standard browser download
    doc.save(fileName);
    return;
  }

  try {
    const dataUri = doc.output('datauristring');
    const base64Data = dataUri.split(',')[1];
    
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    });
    
    alert(`PDF saved successfully to Documents/${fileName}`);
  } catch (error) {
    console.error('Error saving PDF via Capacitor:', error);
    // Fallback if permissions fail
    doc.save(fileName);
  }
}
