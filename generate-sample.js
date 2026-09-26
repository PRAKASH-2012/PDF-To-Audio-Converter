const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function generateSamplePDF() {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Page 1
  const page1 = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page1.getSize();

  // Header band
  page1.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.08, 0.12, 0.25),
  });

  page1.drawText('VOYAGES ACROSS THE COSMOS', {
    x: 50,
    y: height - 55,
    size: 22,
    font: helveticaBold,
    color: rgb(0.95, 0.96, 1.0),
  });

  page1.drawText('An Exploration of Exoplanets, Nebula Clouds, and Stellar Evolution', {
    x: 50,
    y: height - 80,
    size: 11,
    font: helveticaOblique,
    color: rgb(0.65, 0.75, 0.95),
  });

  let currentY = height - 140;

  function writeSectionHeader(page, title) {
    page.drawText(title, {
      x: 50,
      y: currentY,
      size: 14,
      font: helveticaBold,
      color: rgb(0.12, 0.2, 0.4),
    });
    currentY -= 22;
  }

  function writeParagraph(page, text) {
    const words = text.split(' ');
    let line = '';
    for (const w of words) {
      const test = line + (line ? ' ' : '') + w;
      if (helvetica.widthOfTextAtSize(test, 10.5) > 495) {
        page.drawText(line, { x: 50, y: currentY, size: 10.5, font: helvetica, color: rgb(0.2, 0.22, 0.26) });
        currentY -= 17;
        line = w;
      } else {
        line = test;
      }
    }
    if (line) {
      page.drawText(line, { x: 50, y: currentY, size: 10.5, font: helvetica, color: rgb(0.2, 0.22, 0.26) });
      currentY -= 26;
    }
  }

  writeSectionHeader(page1, '1. The Golden Age of Astronomical Discovery');
  writeParagraph(page1, 'Throughout recorded human history, civilization looked toward the night sky with wonder and reverence. Over the last three decades, modern astrophysics has converted ancient myths into empirical reality. With the launch of space observatories such as Hubble and the James Webb Space Telescope, scientists have discovered more than five thousand confirmed planets outside our solar system.');
  writeParagraph(page1, 'These alien worlds display staggering diversity. Astronomers have identified gas giants tidally locked to scorching stars, worlds where liquid iron rains from violet skies, and super-Earths enveloped in perpetual oceans of warm liquid water.');

  writeSectionHeader(page1, '2. The Quest for Biosignatures');
  writeParagraph(page1, 'Searching for life beyond Earth requires analyzing atmospheric spectra. When an exoplanet transits its host star, starlight filters through its atmosphere. Chemical elements and molecules absorb specific wavelengths of light, creating distinct dark absorption lines like a cosmic barcode.');
  writeParagraph(page1, 'By decoding these subtle spectral fingerprints, researchers can detect atmospheric gases such as oxygen, water vapor, methane, and carbon dioxide. Detecting multiple gases out of thermodynamic equilibrium could signal the presence of biological metabolism.');

  // Page 2
  const page2 = pdfDoc.addPage([595, 842]);
  currentY = height - 60;

  writeSectionHeader(page2, '3. Robotic Pioneers and Autonomous Rovers');
  writeParagraph(page2, 'Closer to home, automated robotic probes and rovers spearhead planetary geology on Mars. Autonomous vehicles like Curiosity and Perseverance utilize computer vision, laser spectrometers, and robotic sample drills to traverse crater beds once filled with ancient lakes.');
  writeParagraph(page2, 'Equipped with artificial intelligence, modern rovers navigate treacherous fields of boulders without human intervention. They evaluate navigation hazards, optimize energy conservation during frigid Martian nights, and store core samples for future retrieval.');

  writeSectionHeader(page2, '4. The Horizon of Interstellar Travel');
  writeParagraph(page2, 'Looking forward, innovative initiatives such as Breakthrough Starshot propose deploying micro-probes accelerated by ultra-powerful phased laser arrays. Flying at twenty percent the speed of light, these miniature spacecraft could reach the Alpha Centauri system in just over twenty years.');
  writeParagraph(page2, 'As humanity continues to advance speech synthesis, language translation, and artificial intelligence, the stories and knowledge we create can transcend planetary barriers, bridging cultures across continents and generations.');

  // Save to public/
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(publicDir, 'sample.pdf');
  fs.writeFileSync(filePath, pdfBytes);
  console.log('Sample PDF created at:', filePath, 'Size:', pdfBytes.length, 'bytes');
}

generateSamplePDF().catch(console.error);
