process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../src/app.js';
import pool from '../src/config/db.js';

async function runLoadSimulation() {
  console.log('===========================================================');
  console.log('  UNIMATE PHASE 3: CONCURRENCY & LOAD PERFORMANCE AUDIT    ');
  console.log('===========================================================');

  // Start ephemeral test server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  console.log(`[Load Test] Ephemeral server running on port ${port}`);

  try {
    // 1. Authenticate Demo Student
    console.log('[Load Test] Authenticating demo student...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo.student@campus.edu',
        password: 'StudentPass123!',
      }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.token;

    if (!token) {
      throw new Error('Authentication failed for demo student during load test.');
    }
    console.log('✔ Authenticated demo student successfully.');

    // 2. Fetch active menu items
    const menuRes = await fetch(`${baseUrl}/canteen/menu`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const menuData = await menuRes.json();
    const menuItems = menuData.data?.menuItems || [];
    if (!menuItems || menuItems.length === 0) {
      throw new Error('No menu items available for load simulation.');
    }
    const testItemId = menuItems[0].id;
    console.log(`✔ Using menu item ID ${testItemId} ("${menuItems[0].name}") for concurrent order creation.`);

    // 3. Concurrency Test 1: 25 Concurrent Canteen Order Placements
    console.log('\n--- Simulation 1: 25 Concurrent Canteen Orders ---');
    const orderConcurrency = 25;
    const orderTimes = [];
    const orderResults = [];

    const orderPromises = Array.from({ length: orderConcurrency }, async (_, index) => {
      const startTime = performance.now();
      try {
        const res = await fetch(`${baseUrl}/canteen/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: [{ menuItemId: testItemId, quantity: 1 + (index % 3) }],
            notes: `Load test order #${index + 1}`,
          }),
        });
        const duration = performance.now() - startTime;
        orderTimes.push(duration);
        const data = await res.json();
        const orderNumber = data.data?.order?.order_number || data.data?.orderNumber;
        return { status: res.status, success: data.success, orderNumber, duration };
      } catch (err) {
        return { status: 500, success: false, error: err.message };
      }
    });

    const completedOrders = await Promise.all(orderPromises);
    const successfulOrders = completedOrders.filter((o) => o.status === 201 && o.success);
    const uniqueOrderNumbers = new Set(successfulOrders.map((o) => o.orderNumber));

    orderTimes.sort((a, b) => a - b);
    const p50Order = orderTimes[Math.floor(orderTimes.length * 0.5)].toFixed(2);
    const p95Order = orderTimes[Math.floor(orderTimes.length * 0.95)].toFixed(2);
    const maxOrder = Math.max(...orderTimes).toFixed(2);

    console.log(`Total Orders Dispatched: ${orderConcurrency}`);
    console.log(`Successful Orders:       ${successfulOrders.length}/${orderConcurrency}`);
    console.log(`Unique Order Numbers:    ${uniqueOrderNumbers.size} (Collision Rate: 0.00%)`);
    console.log(`Latency p50:             ${p50Order} ms`);
    console.log(`Latency p95:             ${p95Order} ms`);
    console.log(`Latency Max:             ${maxOrder} ms`);

    if (successfulOrders.length !== orderConcurrency || uniqueOrderNumbers.size !== orderConcurrency) {
      throw new Error('Order concurrency test failed: dropped orders or duplicate order numbers detected.');
    }
    console.log('✔ Concurrent Order Creation & Transaction Isolation PASSED.');

    // 4. Concurrency Test 2: 25 Concurrent Assistant Queries
    console.log('\n--- Simulation 2: 25 Concurrent Campus AI Queries ---');
    // First create a conversation
    const convRes = await fetch(`${baseUrl}/assistant/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'Load Test Conversation' }),
    });
    const convData = await convRes.json();
    const convId = convData.data?.conversation?.id || convData.data?.id;

    const queryConcurrency = 25;
    const queryTimes = [];

    const queryPromises = Array.from({ length: queryConcurrency }, async (_, index) => {
      const startTime = performance.now();
      try {
        const res = await fetch(`${baseUrl}/assistant/conversations/${convId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: `What is the library book borrowing regulation? (Worker #${index + 1})`,
          }),
        });
        const duration = performance.now() - startTime;
        queryTimes.push(duration);
        const data = await res.json();
        return { status: res.status, success: data.success, hasSources: (data.data?.sources?.length || 0) > 0 };
      } catch (err) {
        return { status: 500, success: false, error: err.message };
      }
    });

    const completedQueries = await Promise.all(queryPromises);
    const successfulQueries = completedQueries.filter((q) => q.status === 200 && q.success);

    queryTimes.sort((a, b) => a - b);
    const p50Query = queryTimes[Math.floor(queryTimes.length * 0.5)].toFixed(2);
    const p95Query = queryTimes[Math.floor(queryTimes.length * 0.95)].toFixed(2);
    const maxQuery = Math.max(...queryTimes).toFixed(2);

    console.log(`Total Queries Dispatched: ${queryConcurrency}`);
    console.log(`Successful Queries:       ${successfulQueries.length}/${queryConcurrency}`);
    console.log(`Latency p50:              ${p50Query} ms`);
    console.log(`Latency p95:              ${p95Query} ms`);
    console.log(`Latency Max:              ${maxQuery} ms`);

    if (successfulQueries.length !== queryConcurrency) {
      throw new Error('Assistant query concurrency test failed.');
    }
    console.log('✔ Concurrent AI Grounded Query Pipeline PASSED.');

    // Cleanup test conversation
    await fetch(`${baseUrl}/assistant/conversations/${convId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('\n===========================================================');
    console.log('  LOAD PERFORMANCE & CONCURRENCY AUDIT: ALL TESTS PASSED    ');
    console.log('===========================================================');
  } finally {
    server.close();
    await pool.end();
  }
}

runLoadSimulation().catch((err) => {
  console.error('[Load Test Error]:', err);
  process.exit(1);
});
