const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

// Simplified version of the extraction service for testing
async function extractUnicampusData(text) {
  const data = {};

  // Guest name
  const guestNameMatch = text.match(/(?:E:\s*)?Il\/La Sig\.\/Sig\.ra\s+([A-Z][A-Z\s]+),?\s+nato\/a/i);
  data.guest_name = guestNameMatch?.[1]?.trim();

  // Birth info
  const birthMatch = text.match(/nato\/a\s+a\s+([A-Z\s]+)\s+il\s+(\d{2}\/\d{2}\/\d{4})/i);
  data.birth_place = birthMatch?.[1]?.trim();
  data.birth_date = birthMatch?.[2];

  // Fiscal code
  const fiscalCodeMatch = text.match(/C\.F\.\s+([A-Z0-9]{16})/i);
  data.fiscal_code = fiscalCodeMatch?.[1];

  // Residence
  const residenceMatch = text.match(/residente in\s+([A-Z\s]+),\s+([A-Z\s]+\d+)/i);
  data.residence_city = residenceMatch?.[1]?.trim();
  data.residence_address = residenceMatch?.[2]?.trim();

  // Total rent
  const rentMatch = text.match(/retta\s+di\s+euro\s+([\d.,]+)/i);
  data.rent_total = rentMatch ? parseFloat(rentMatch[1].replace(',', '.')) : null;

  // Installments
  const installment1Match = text.match(/€(\d+)\s+prima rata entro il (\d{2} \w+ \d{4}|\d{2}\/\d{2}\/\d{4})/i);
  const installment2Match = text.match(/€(\d+)\s+seconda rata entro il (\d{2} \w+ \d{4}|\d{2}\/\d{2}\/\d{4})/i);
  const installment3Match = text.match(/€(\d+)\s+terza rata entro il (\d{2} \w+ \d{4}|\d{2}\/\d{2}\/\d{4})/i);

  data.installment_1 = installment1Match ? { amount: parseFloat(installment1Match[1]), date: installment1Match[2] } : null;
  data.installment_2 = installment2Match ? { amount: parseFloat(installment2Match[1]), date: installment2Match[2] } : null;
  data.installment_3 = installment3Match ? { amount: parseFloat(installment3Match[1]), date: installment3Match[2] } : null;

  // Security deposit - look for €250 pattern
  const depositMatch = text.match(/perdita\s+di\s+€\s*([\d.,]+)/i);
  data.security_deposit = depositMatch ? parseFloat(depositMatch[1].replace(',', '.')) : null;

  // Contract period
  const periodMatch = text.match(/godimento.*?dal\s+(\d{1,2}\s+\w+\s+\d{4}),?\s+al\s+(\d{1,2}\s+\w+\s+\d{4})/i);
  data.start_date = periodMatch?.[1];
  data.end_date = periodMatch?.[2];

  // Accommodation
  const accommodationMatch = text.match(/Via\s+Nomentum\s+([\d\/]+)/i);
  data.accommodation_address = accommodationMatch ? `Via Nomentum ${accommodationMatch[1]}` : null;

  // University
  const universityMatch = text.match(/Università\s+([A-Z]+).*?anno accademico\s+([\d\/]+)/i);
  data.university = universityMatch?.[1];
  data.academic_year = universityMatch?.[2];

  return data;
}

async function testExtraction() {
  console.log('🧪 Testing Unicampus Contract Extraction\n');

  const pdfPath = path.join(__dirname, '../../sample-contracts/unicampus-contract.pdf');
  const dataBuffer = await fs.readFile(pdfPath);
  const pdfData = await pdfParse(dataBuffer);

  const extracted = await extractUnicampusData(pdfData.text);

  console.log('✅ Extraction Results:\n');
  console.log('👤 Guest Information:');
  console.log(`   Name: ${extracted.guest_name || 'NOT FOUND'}`);
  console.log(`   Birth Date: ${extracted.birth_date || 'NOT FOUND'}`);
  console.log(`   Birth Place: ${extracted.birth_place || 'NOT FOUND'}`);
  console.log(`   Fiscal Code: ${extracted.fiscal_code || 'NOT FOUND'}`);
  console.log(`   Residence: ${extracted.residence_address}, ${extracted.residence_city || 'NOT FOUND'}`);

  console.log('\n🏠 Accommodation:');
  console.log(`   Address: ${extracted.accommodation_address || 'NOT FOUND'}`);
  console.log(`   Period: ${extracted.start_date} → ${extracted.end_date}`);

  console.log('\n💰 Financial Information:');
  console.log(`   Total Rent: €${extracted.rent_total || 'NOT FOUND'}`);
  console.log(`   Security Deposit: €${extracted.security_deposit || 'NOT FOUND'}`);

  console.log('\n📅 Payment Schedule:');
  if (extracted.installment_1) {
    console.log(`   1st Installment: €${extracted.installment_1.amount} (due: ${extracted.installment_1.date})`);
  }
  if (extracted.installment_2) {
    console.log(`   2nd Installment: €${extracted.installment_2.amount} (due: ${extracted.installment_2.date})`);
  }
  if (extracted.installment_3) {
    console.log(`   3rd Installment: €${extracted.installment_3.amount} (due: ${extracted.installment_3.date})`);
  }

  console.log('\n🎓 University:');
  console.log(`   University: ${extracted.university || 'NOT FOUND'}`);
  console.log(`   Academic Year: ${extracted.academic_year || 'NOT FOUND'}`);

  // Calculate confidence
  const fields = Object.keys(extracted);
  const foundFields = fields.filter(key => extracted[key] !== null && extracted[key] !== undefined);
  const confidence = (foundFields.length / fields.length * 100).toFixed(1);

  console.log(`\n📊 Extraction Confidence: ${confidence}% (${foundFields.length}/${fields.length} fields)`);
}

testExtraction().catch(console.error);
