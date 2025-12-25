const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

async function extractFullText() {
  const pdfPath = path.join(__dirname, '../../sample-contracts/unicampus-contract.pdf');
  const dataBuffer = await fs.readFile(pdfPath);
  const data = await pdfParse(dataBuffer);

  // Save to temp file for analysis
  const outputPath = path.join(__dirname, '../../sample-contracts/extracted-text.txt');
  await fs.writeFile(outputPath, data.text);

  console.log(`✅ Full text saved to: ${outputPath}`);
  console.log(`📝 Length: ${data.text.length} characters`);
}

extractFullText().catch(console.error);
