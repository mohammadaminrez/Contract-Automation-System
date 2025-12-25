// Test payment schedule generation
// Simulates the PaymentScheduleService logic

function generatePaymentSchedule(totalAmount, startDate, customDates) {
  console.log('💳 Testing Payment Schedule Generation\n');
  console.log(`Total Amount: €${totalAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`);
  console.log(`Start Date: ${startDate}\n`);

  // Option 1: 3 installments (40%, 30%, 30%)
  console.log('📊 Option 1: Payment in 3 Installments (40%, 30%, 30%)\n');

  const percentages = [40, 30, 30];
  let cumulativeAmount = 0;

  for (let i = 0; i < 3; i++) {
    const percentage = percentages[i];
    let amount;

    if (i === 2) {
      // Last installment gets remainder
      amount = totalAmount - cumulativeAmount;
    } else {
      amount = Math.round((totalAmount * percentage) / 100 * 100) / 100;
      cumulativeAmount += amount;
    }

    const dueDate = customDates?.[i] || calculateDueDate(i, startDate);

    console.log(`   ${i + 1}° Rata (${percentage}%): €${amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`);
    console.log(`   Due Date: ${dueDate}\n`);
  }

  console.log(`   Total: €${totalAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}\n`);

  // Option 2: Single payment with 3% discount
  console.log('💰 Option 2: Single Payment with 3% Discount\n');

  const discountPercentage = 3;
  const discountAmount = Math.round(totalAmount * (discountPercentage / 100) * 100) / 100;
  const finalAmount = totalAmount - discountAmount;

  console.log(`   Original Amount: €${totalAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`);
  console.log(`   Discount (${discountPercentage}%): -€${discountAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`);
  console.log(`   Final Amount: €${finalAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`);
  console.log(`   Due Date: ${normalizeDate(startDate)}`);
  console.log(`   💵 Savings: €${discountAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}\n`);

  // Recommendation
  const recommended = totalAmount > 5000 ? 'installments' : 'single payment';
  console.log(`✅ Recommended: ${recommended}`);
}

function calculateDueDate(installmentIndex, startDate) {
  const date = new Date(normalizeDate(startDate));
  const monthsToAdd = installmentIndex * 4;
  date.setMonth(date.getMonth() + monthsToAdd);
  return date.toISOString().split('T')[0];
}

function normalizeDate(italianDate) {
  // Handle formats like "10 ottobre 2025" or "10/10/2025"
  if (italianDate.includes('/')) {
    const [day, month, year] = italianDate.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const monthMap = {
    gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
    maggio: '05', giugno: '06', luglio: '07', agosto: '08',
    settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
  };

  const match = italianDate.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
  if (match) {
    const [, day, monthName, year] = match;
    const month = monthMap[monthName.toLowerCase()];
    if (month) {
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  }

  // If already in ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(italianDate)) {
    return italianDate;
  }

  return new Date().toISOString().split('T')[0];
}

// Test with Unicampus contract data
console.log('═'.repeat(80));
console.log('TEST 1: Unicampus Contract (€12,360)');
console.log('═'.repeat(80));
console.log();

generatePaymentSchedule(
  12360,
  '10 ottobre 2025',
  ['25 settembre 2025', '25 gennaio 2026', '25 aprile 2026']
);

console.log('\n');
console.log('═'.repeat(80));
console.log('TEST 2: Smaller Amount (€3,000)');
console.log('═'.repeat(80));
console.log();

generatePaymentSchedule(
  3000,
  '01/09/2025'
);
