import * as bookingService from '../services/user/booking.service.js';
import * as payuService from '../services/payment/payu.service.js';
import { User, Car, Booking, BookingPayment, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import { generatePayuRequestHash } from '../utils/payment/payu.util.js';

async function testCheckoutAndCallback() {
  console.log('=== TESTING CHECKOUT AND CALLBACK FOR PART PAYMENT (25%) ===\n');

  const testUser = await User.findOne();
  if (!testUser) throw new Error('No user found in DB');

  const car = await Car.findOne({
    where: {
      enable_monthly_subscription: 1,
      status: 1,
      [Op.or]: [
        { price_per_day: { [Op.gt]: 0 } },
        { price_per_hour: { [Op.gt]: 0 } },
      ],
    },
  });
  if (!car) throw new Error('No priced monthly car found');

  // Set test payu keys if not set
  process.env.PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || 'gtKFFx';
  process.env.PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT || 'eCwWELxi';

  // Checkout with part payment (25%)
  const checkoutResult = await bookingService.checkoutBooking(
    {
      car_id: car.id,
      city_id: car.city_id,
      type: 'monthly',
      plan_type: '1_month',
      payment_option: 'part',
      pickup_at: '2026-11-01T10:00:00.000Z',
      drop_at: '2026-12-01T10:00:00.000Z',
      pickup_location: 'Station Rd, Delhi NCR',
      drop_location: 'IGI Airport, Delhi NCR',
      insurance_selected: false,
      home_delivery_selected: false,
    },
    testUser
  );

  console.log('Checkout Success:', {
    booking_id: checkoutResult.booking.id,
    booking_ref: checkoutResult.booking.booking_ref,
    rental_type: checkoutResult.booking.rental_type,
    subscription_plan: checkoutResult.booking.subscription_plan,
    payment_option: checkoutResult.booking.payment_option,
    part_payment_percent: checkoutResult.booking.part_payment_percent,
    total_booking_amount: checkoutResult.booking.total_booking_amount,
    paid_amount: checkoutResult.booking.paid_amount,
    remaining_amount: checkoutResult.booking.remaining_amount,
    payable_amount_now: checkoutResult.booking.fare_breakdown.payable_amount,
    payu_payment_amount: checkoutResult.payment.payable_amount,
    payu_txnid: checkoutResult.payment.payu.txnid,
  });

  if (checkoutResult.booking.payment_option !== 'part') {
    throw new Error('Expected payment_option to be part');
  }
  if (checkoutResult.booking.part_payment_percent !== 25) {
    throw new Error('Expected part_payment_percent to be 25');
  }
  if (checkoutResult.payment.payable_amount >= checkoutResult.booking.total_booking_amount) {
    throw new Error('Expected payable_amount_now to be less than total_booking_amount');
  }

  // Now test PayU callback with the part payment amount
  const payuPayload = {
    status: 'success',
    amount: String(checkoutResult.payment.payable_amount),
    txnid: checkoutResult.payment.payu.txnid,
    key: process.env.PAYU_MERCHANT_KEY,
    productinfo: checkoutResult.payment.payu.productinfo,
    firstname: checkoutResult.payment.payu.firstname,
    email: checkoutResult.payment.payu.email,
    mihpayid: 'mock_mihpayid_' + Date.now(),
    bank_ref_num: 'mock_bank_ref_' + Date.now(),
    udf1: String(checkoutResult.booking.id),
  };

  // Generate valid response hash: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const crypto = await import('crypto');
  const hashString = [
    process.env.PAYU_MERCHANT_SALT,
    payuPayload.status,
    "", "", "", "", "",
    "", "", "", "",
    payuPayload.udf1,
    payuPayload.email,
    payuPayload.firstname,
    payuPayload.productinfo,
    Number(payuPayload.amount).toFixed(2),
    payuPayload.txnid,
    payuPayload.key,
  ].join("|");
  payuPayload.hash = crypto.createHash('sha512').update(hashString).digest('hex');

  console.log('\n--- Simulating PayU Success Callback ---');
  const callbackResult = await payuService.handlePayuCallback(payuPayload);
  console.log('Callback Result:', callbackResult);

  // Verify Booking status in DB
  const updatedBooking = await Booking.findByPk(checkoutResult.booking.id);
  console.log('\nUpdated Booking from DB:', {
    id: updatedBooking.id,
    booking_status: updatedBooking.booking_status,
    payment_status: updatedBooking.payment_status,
    paid_amount: Number(updatedBooking.paid_amount),
    remaining_amount: Number(updatedBooking.remaining_amount),
    total_booking_amount: Number(updatedBooking.total_booking_amount),
  });

  if (updatedBooking.booking_status !== 5) {
    throw new Error('Expected booking_status to be 5 (confirmed)');
  }
  if (updatedBooking.payment_status !== 6) {
    throw new Error('Expected payment_status to be 6 (partially_paid)');
  }
  if (Number(updatedBooking.paid_amount) !== checkoutResult.payment.payable_amount) {
    throw new Error('Expected paid_amount to match payment attempt');
  }

  // Clean up test booking
  await BookingPayment.destroy({ where: { booking_id: updatedBooking.id } });
  await Booking.destroy({ where: { id: updatedBooking.id } });
  console.log('\nTest booking cleaned up.');

  console.log('\n=== CHECKOUT & CALLBACK TEST PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

testCheckoutAndCallback().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
