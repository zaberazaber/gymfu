import { PaymentModel } from '../models/Payment';

// Test commission calculation
function testCommissionCalculation() {
  console.log('🧪 Testing Payment Commission Calculation\n');

  const testCases = [
    { amount: 100, expectedCommission: 15, expectedEarnings: 85 },
    { amount: 500, expectedCommission: 75, expectedEarnings: 425 },
    { amount: 1000, expectedCommission: 150, expectedEarnings: 850 },
    { amount: 250.50, expectedCommission: 37.57, expectedEarnings: 212.93 },
    { amount: 99.99, expectedCommission: 15, expectedEarnings: 84.99 },
  ];

  let allPassed = true;

  testCases.forEach((testCase, index) => {
    const result = PaymentModel.calculateCommission(testCase.amount);
    
    const commissionMatch = result.platformCommission === testCase.expectedCommission;
    const earningsMatch = result.gymEarnings === testCase.expectedEarnings;
    
    const passed = commissionMatch && earningsMatch;
    allPassed = allPassed && passed;

    console.log(`Test ${index + 1}: Amount ₹${testCase.amount}`);
    console.log(`  Platform Commission: ₹${result.platformCommission} ${commissionMatch ? '✅' : '❌'} (expected ₹${testCase.expectedCommission})`);
    console.log(`  Gym Earnings: ₹${result.gymEarnings} ${earningsMatch ? '✅' : '❌'} (expected ₹${testCase.expectedEarnings})`);
    console.log(`  Total: ₹${result.platformCommission + result.gymEarnings} (should equal ₹${testCase.amount})`);
    console.log('');
  });

  // Test commission rates
  console.log('📊 Commission Rates:');
  console.log('  Platform: 15%');
  console.log('  Gym: 85%');
  console.log('');

  if (allPassed) {
    console.log('✅ All commission calculation tests passed!');
  } else {
    console.log('❌ Some tests failed!');
  }

  return allPassed;
}

// Run tests
if (require.main === module) {
  const passed = testCommissionCalculation();
  process.exit(passed ? 0 : 1);
}

export { testCommissionCalculation };
