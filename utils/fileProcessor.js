const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

exports.extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return extractFromPDF(filePath);
  } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
    return extractFromImage(filePath);
  } else {
    throw new Error('Unsupported file format');
  }
};

async function extractFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text || '';
}

async function extractFromImage(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const processed = await sharp(buffer).grayscale().normalize().toBuffer();

    const { data } = await Tesseract.recognize(processed, 'eng', {
      logger: () => {}
    });

    return data.text || '';
  } catch (err) {
    const { data } = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {}
    });
    return data.text || '';
  }
}
