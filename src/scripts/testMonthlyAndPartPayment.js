import * as selfDriveService from '../services/user/selfDrive.service.js';
import * as bookingService from '../services/user/booking.service.js';
import { User, Car, City } from '../models/index.js';
import { buildFarePreview, buildMonthlyPlansPreview } from '../utils/selfDrive/fare.util.js';
import { buildBookingFareBreakdown } from '../utils/booking/fareBreakdown.util.js';
import { resolveRentalMode } from '../utils/selfDrive/rental.util.js';

async function runTests() {
  console.log('=== STARTING AUTOMATED TESTS FOR MONTHLY & PART PAYMENT FLOW ===\n');

  // Test 1: Utility - resolveRentalMode
  console.log('--- TEST 1: resolveRentalMode ---');
  const rentalModeA = resolveRentalMode({ city_id: 4, type: 'monthly' });
  console.log('Monthly discovery mode (no dates):', {
    rental_type: rentalModeA.rental_type,
    mode: rentalModeA.mode,
    rental_days: rentalModeA.rental_days,
    is_estimated: rentalModeA.is_estimated,
  });
  if (rentalModeA.rental_type !== 'monthly' || rentalModeA.rental_days !== 30) {
    throw new Error('Test 1 failed: Monthly discovery mode unexpected output');
  }

  const rentalModeB = resolveRentalMode({
    city_id: 4,
    type: 'monthly',
    pickup_at: '2026-10-01T10:00:00Z',
    drop_at: '2026-10-31T10:00:00Z',
  });
  console.log('Monthly with dates (30 days):', {
    rental_type: rentalModeB.rental_type,
    mode: rentalModeB.mode,
    rental_days: rentalModeB.rental_days,
    is_estimated: rentalModeB.is_estimated,
  });
  if (rentalModeB.rental_days !== 30) {
    throw new Error('Test 1 failed: Expected 30 rental days');
  }
  console.log('Test 1 PASSED!\n');

  // Test 2: Utility - buildFarePreview and buildMonthlyPlansPreview
  console.log('--- TEST 2: Subscription Plans Preview ---');
  const mockCar = {
    price_per_day: 2500,
    price_per_hour: null,
    enable_monthly_subscription: 1,
    discount_15_days: 10,
    discount_1_month: 15,
    discount_3_months: 20,
    discount_6_months: 25,
    refundable_deposit: 10000,
    travelling_allowed_per_day: 250,
  };
  const plans = buildMonthlyPlansPreview(mockCar);
  console.log('Generated plans count:', plans.length);
  plans.forEach(p => {
    console.log(`- ${p.label}: original ₹${p.original_fare}, disc ${p.discount_percent}% (-₹${p.discount_amount}), trip fare ₹${p.trip_fare}, total ₹${p.total_amount}, 25% part payment ₹${p.part_payment.amount}, remaining ₹${p.part_payment.remaining_amount}, km allowed ${p.km_allowed}`);
  });
  if (plans.length !== 4) throw new Error('Test 2 failed: Expected 4 subscription plans');
  console.log('Test 2 PASSED!\n');

  // Test 3: Utility - buildBookingFareBreakdown
  console.log('--- TEST 3: buildBookingFareBreakdown (Monthly vs Rental) ---');
  const monthlyFare = buildBookingFareBreakdown({
    car: mockCar,
    rentalDays: 30,
    rentalType: 'monthly',
    planType: '1_month',
  });
  console.log('Monthly Fare 30 days:', {
    trip_fare: monthlyFare.trip_fare,
    plan_discount_percent: monthlyFare.plan_discount_percent,
    plan_discount_amount: monthlyFare.plan_discount_amount,
    security_deposit: monthlyFare.security_deposit_amount,
    total_amount: monthlyFare.total_amount,
    part_payment: monthlyFare.payment_options.part_payment,
    full_payment: monthlyFare.payment_options.full_payment,
  });
  // 30 * 2500 = 75000. 15% discount = 11250. trip_fare = 63750. GST 5% on 63750 = 3187.50. deposit = 10000. total = 63750 + 3187.5 + 10000 = 76937.50.
  // part payment 25% = 19234.38.
  if (monthlyFare.payment_options.part_payment.percentage !== 25) {
    throw new Error('Test 3 failed: Expected 25% part payment');
  }
  console.log('Test 3 PASSED!\n');

  // Test 4: Database & Service - listCars with monthly filter
  console.log('--- TEST 4: listCars API Service ---');
  const allCarsResult = await selfDriveService.listCars({ limit: 10 });
  console.log(`Total regular cars count: ${allCarsResult.rows.length}`);

  const monthlyCarsResult = await selfDriveService.listCars({ type: 'monthly', limit: 10 });
  console.log(`Total monthly cars count: ${monthlyCarsResult.rows.length}`);
  monthlyCarsResult.rows.forEach(c => {
    console.log(`- Car #${c.id}: ${c.car_name}, enable_monthly: ${c.enable_monthly_subscription}, badge: ${c.discount_badge}, monthly_discounts:`, c.monthly_discounts);
    if (!c.enable_monthly_subscription) {
      throw new Error(`Test 4 failed: Car ${c.id} does not have enable_monthly_subscription`);
    }
  });
  console.log('Test 4 PASSED!\n');

  // Test 5: Service - getCarById for Monthly
  console.log('--- TEST 5: getCarById API Service ---');
  if (monthlyCarsResult.rows.length > 0) {
    const monthlyCarId = monthlyCarsResult.rows[0].id;
    const carDetail = await selfDriveService.getCarById(monthlyCarId, { type: 'monthly' });
    console.log(`Car #${carDetail.id} details:`, {
      name: carDetail.car_name,
      enable_monthly_subscription: carDetail.enable_monthly_subscription,
      has_subscription_plans: Boolean(carDetail.subscription_plans),
      plans_count: carDetail.subscription_plans?.length,
      fare_preview: {
        rental_type: carDetail.fare_preview.rental_type,
        trip_fare: carDetail.fare_preview.trip_fare,
        payment_preview: carDetail.fare_preview.payment_preview,
      }
    });
    if (!carDetail.subscription_plans || carDetail.subscription_plans.length !== 4) {
      throw new Error('Test 5 failed: Expected 4 subscription plans in car detail');
    }
  }
  console.log('Test 5 PASSED!\n');

  // Test 6: Service - getBookingSummary with Monthly & Part Payment
  console.log('--- TEST 6: getBookingSummary API Service ---');
  const { Op } = await import('sequelize');
  const availableMonthlyCar = await Car.findOne({
    where: {
      enable_monthly_subscription: 1,
      status: 1,
      [Op.or]: [
        { price_per_day: { [Op.gt]: 0 } },
        { price_per_hour: { [Op.gt]: 0 } },
      ],
    },
  });

  if (availableMonthlyCar) {
    const testUser = await User.findOne();
    const userId = testUser ? testUser.id : 1;

    const summary = await bookingService.getBookingSummary({
      car_id: availableMonthlyCar.id,
      city_id: availableMonthlyCar.city_id,
      type: 'monthly',
      plan_type: '1_month',
      pickup_at: '2026-10-01T10:00:00.000Z',
      drop_at: '2026-10-31T10:00:00.000Z',
      pickup_location: 'Station Road',
      drop_location: 'Airport Terminal 1',
    }, userId);

    console.log('Booking Summary Result:', {
      rental_type: summary.rental_type,
      subscription_plan: summary.subscription_plan,
      car: summary.car.car_name,
      trip_fare: summary.fare_breakdown.trip_fare,
      plan_discount_percent: summary.fare_breakdown.plan_discount_percent,
      plan_discount_amount: summary.fare_breakdown.plan_discount_amount,
      total_amount: summary.fare_breakdown.total_amount,
      payment_options: summary.payment_options,
    });

    if (summary.rental_type !== 'monthly') {
      throw new Error('Test 6 failed: Expected rental_type to be monthly');
    }
    if (!summary.payment_options.part_payment || summary.payment_options.part_payment.percentage !== 25) {
      throw new Error('Test 6 failed: Expected 25% part payment in payment_options');
    }
  }
  console.log('Test 6 PASSED!\n');

  console.log('=== ALL TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
