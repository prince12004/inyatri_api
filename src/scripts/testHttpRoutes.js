import http from 'http';
import app from '../app.js';
import { User, Car, City } from '../models/index.js';
import jwt from 'jsonwebtoken';

async function testHttpRoutes() {
  console.log('=== TESTING HTTP ROUTES FOR MONTHLY & PART PAYMENT FLOW ===\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Search monthly cars with city_id only (no dates)
    console.log('--- 1. POST /api/user/v1/self-drive/search (Monthly, no dates) ---');
    const searchRes = await fetch(`${baseUrl}/api/user/v1/self-drive/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city_id: 8, type: 'monthly' }),
    });
    const searchData = await searchRes.json();
    console.log('Status:', searchRes.status, 'Rental Type:', searchData.data?.rental_type, 'Total cars:', searchData.data?.total_available_cars);
    if (searchRes.status !== 200 || searchData.data?.rental_type !== 'monthly') {
      throw new Error('Search API failed for monthly');
    }

    // 2. List monthly cars
    console.log('\n--- 2. GET /api/user/v1/self-drive/cars?city_id=8&type=monthly ---');
    const listRes = await fetch(`${baseUrl}/api/user/v1/self-drive/cars?city_id=8&type=monthly`);
    const listData = await listRes.json();
    console.log('Status:', listRes.status, 'Cars count:', listData.data?.cars?.length);
    if (listRes.status !== 200) throw new Error('List cars API failed');
    const firstMonthlyCar = listData.data?.cars?.[0];
    if (firstMonthlyCar) {
      console.log('First Car:', {
        id: firstMonthlyCar.id,
        name: firstMonthlyCar.car_name,
        enable_monthly: firstMonthlyCar.enable_monthly_subscription,
        badge: firstMonthlyCar.discount_badge,
        monthly_discounts: firstMonthlyCar.monthly_discounts,
      });
    }

    // 3. Get Car By ID for monthly
    if (firstMonthlyCar) {
      console.log(`\n--- 3. GET /api/user/v1/self-drive/cars/${firstMonthlyCar.id}?type=monthly ---`);
      const detailRes = await fetch(`${baseUrl}/api/user/v1/self-drive/cars/${firstMonthlyCar.id}?type=monthly`);
      const detailData = await detailRes.json();
      console.log('Status:', detailRes.status, 'Rental Type:', detailData.data?.rental_type, 'Plans count:', detailData.data?.car?.subscription_plans?.length);
      if (detailRes.status !== 200 || !detailData.data?.car?.subscription_plans) {
        throw new Error('Car detail API failed for monthly');
      }
    }

    // 4. Booking Summary with Monthly & Part payment options
    const testUser = await User.findOne();
    if (testUser && firstMonthlyCar) {
      const { default: ENV } = await import('../config/env.js');
      const token = jwt.sign(
        { id: testUser.id, mobile: testUser.mobile },
        ENV.JWT.SECRET_USER
      );
      await testUser.update({ token });

      console.log('\n--- 4. POST /api/user/v1/self-drive/bookings/summary (Monthly) ---');
      const summaryRes = await fetch(`${baseUrl}/api/user/v1/self-drive/bookings/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          car_id: firstMonthlyCar.id,
          city_id: firstMonthlyCar.city?.id || 8,
          type: 'monthly',
          plan_type: '1_month',
          pickup_at: '2026-10-01T10:00:00.000Z',
          drop_at: '2026-10-31T10:00:00.000Z',
          pickup_location: 'City Center',
          drop_location: 'City Center',
        }),
      });
      const summaryData = await summaryRes.json();
      console.log('Status:', summaryRes.status, {
        rental_type: summaryData.data?.rental_type,
        total_amount: summaryData.data?.fare_breakdown?.total_amount,
        part_payment: summaryData.data?.payment_options?.part_payment,
        full_payment: summaryData.data?.payment_options?.full_payment,
      });

      if (summaryRes.status !== 200 || !summaryData.data?.payment_options?.part_payment) {
        throw new Error('Booking summary API failed for monthly');
      }
    }

    console.log('\n=== ALL HTTP ROUTE TESTS PASSED SUCCESSFULLY! ===');
  } finally {
    server.close();
  }
}

testHttpRoutes().catch(err => {
  console.error('HTTP route test failed:', err);
  process.exit(1);
});
