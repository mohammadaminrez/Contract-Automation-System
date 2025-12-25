const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

async function testExtraction() {
  const pdfPath = path.join(__dirname, '../../sample-contracts/unicampus-contract.pdf');

  try {
    console.log('🔄 Testing PDF extraction...');
    console.log(`File: ${pdfPath}`);

    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);

    console.log('\n✅ PDF extraction successful!');
    console.log(`📄 Pages: ${data.numpages}`);
    console.log(`📝 Characters: ${data.text.length}`);
    console.log(`🔤 Words: ${data.text.trim().split(/\s+/).length}`);

    console.log('\n📋 First 500 characters of extracted text:');
    console.log('─'.repeat(80));
    console.log(data.text.substring(0, 500));
    console.log('─'.repeat(80));

    // Look for Italian contract keywords
    const keywords = ['contratto', 'locazione', 'affitto', 'canone', 'locatore', 'conduttore'];
    console.log('\n🔍 Italian contract keywords found:');
    keywords.forEach((keyword) => {
      const count = (data.text.match(new RegExp(keyword, 'gi')) || []).length;
      if (count > 0) {
        console.log(`  - "${keyword}": ${count} times`);
      }
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('❌ PDF file not found at:', pdfPath);
      console.log('📝 Please add the Unicampus contract PDF to sample-contracts/');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testExtraction().catch(console.error);
