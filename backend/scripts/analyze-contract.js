const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

async function analyzeContract() {
  const pdfPath = path.join(__dirname, '../../sample-contracts/unicampus-contract.pdf');
  const dataBuffer = await fs.readFile(pdfPath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;

  console.log('🔍 Analyzing Unicampus Contract Structure\n');

  // Extract sample sections to understand the pattern
  const sections = [
    { name: 'Guest Name', regex: /(?:Il\/La Sig\.\/Sig\.ra|E:\s+Il\/La Sig\.\/Sig\.ra)\s+([A-Z\s]+),?\s+nato\/a/i },
    { name: 'Birth Date', regex: /nato\/a\s+a[^\d]*(\d{2}\/\d{2}\/\d{4})/i },
    { name: 'Total Rent', regex: /canone\s+(?:di|totale|complessivo)?[^\d€]*€?\s*(\d+[.,]\d{2})/i },
    { name: 'Start Date', regex: /dal\s+(\d{2}\/\d{2}\/\d{4})/i },
    { name: 'End Date', regex: /(?:al|fino al)\s+(\d{2}\/\d{2}\/\d{4})/i },
    { name: 'Security Deposit', regex: /deposito\s+cauzionale[^\d€]*€?\s*(\d+[.,]\d{2})/i },
    { name: 'Address', regex: /(?:presso|sito in|Via|Viale|Piazza)\s+([A-Za-z\s]+(?:n\.|numero)?\s*\d+)/i },
  ];

  console.log('📋 Pattern Matching Results:\n');
  sections.forEach(({ name, regex }) => {
    const match = text.match(regex);
    if (match) {
      console.log(`✅ ${name}: "${match[1]?.trim()}"`);
    } else {
      console.log(`❌ ${name}: Not found`);
    }
  });

  // Show context around "canone" to understand rent structure
  console.log('\n💰 Context around "canone" (rent):');
  console.log('─'.repeat(80));
  const canoneIndex = text.toLowerCase().indexOf('canone');
  if (canoneIndex !== -1) {
    console.log(text.substring(canoneIndex, canoneIndex + 400));
  }
  console.log('─'.repeat(80));

  // Show context around guest name
  console.log('\n👤 Context around guest info:');
  console.log('─'.repeat(80));
  const guestIndex = text.toLowerCase().indexOf('e: il/la sig');
  if (guestIndex !== -1) {
    console.log(text.substring(guestIndex, guestIndex + 400));
  }
  console.log('─'.repeat(80));

  // Look for payment terms
  console.log('\n💳 Looking for payment schedule keywords:');
  const paymentKeywords = ['rata', 'acconto', 'saldo', 'pagamento', 'scadenza', 'sconto'];
  paymentKeywords.forEach(keyword => {
    const count = (text.match(new RegExp(keyword, 'gi')) || []).length;
    if (count > 0) {
      console.log(`  - "${keyword}": ${count} occurrences`);
    }
  });
}

analyzeContract().catch(console.error);
