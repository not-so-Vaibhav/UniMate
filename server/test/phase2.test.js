import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../src/app.js';
import pool from '../src/config/db.js';

let server;
let baseUrl;
let studentToken;
let student2Token;
let canteenOpToken;
let printingOpToken;
let adminToken;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/v1`;
      resolve();
    });
  });

  // Login demo users to obtain tokens
  const login = async (email, password) => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    return body.data.token;
  };

  studentToken = await login('demo.student@campus.edu', 'StudentPass123!');
  canteenOpToken = await login('demo.canteen@campus.edu', 'OperatorPass123!');
  printingOpToken = await login('demo.xerox@campus.edu', 'OperatorPass123!');
  adminToken = await login('demo.admin@campus.edu', 'AdminPass123!');

  // Register second student for privacy/ownership testing
  const s2Res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `student2.${Date.now()}@campus.edu`,
      password: 'Student2Pass123!',
      full_name: 'Second Student',
      student_id: `STU-P2-${Date.now().toString().slice(-4)}`,
    }),
  });
  const s2Body = await s2Res.json();
  student2Token = s2Body.data.token;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

// ==========================================
// WORKSTREAM 1: CAMPUS NAVIGATION TESTS
// ==========================================
describe('Phase 2 - Workstream 1: Campus Navigation', () => {
  test('GET /locations lists verified locations and categories', async () => {
    const res = await fetch(`${baseUrl}/locations`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.locations));
    assert.ok(body.data.locations.length > 0);
    assert.ok(Array.isArray(body.data.categories));
  });

  test('GET /locations supports category and search filtering', async () => {
    const res = await fetch(`${baseUrl}/locations?category=academic&search=Aryabhata`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.locations.every((l) => l.name.includes('Aryabhata') || l.category === 'academic'));
  });

  test('POST /locations by student is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Building',
        category: 'academic',
      }),
    });
    assert.equal(res.status, 403);
  });

  test('POST /locations by admin creates new verified location', async () => {
    const testLocationName = `Test Lab ${Date.now()}`;
    const testCode = `TL-${Date.now().toString().slice(-4)}`;
    const res = await fetch(`${baseUrl}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: testLocationName,
        code: testCode,
        category: 'academic',
        building: 'Science Block',
        floor: 'Floor 3',
        description: 'Automated test laboratory',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.location.name, testLocationName);
  });
});

// ==========================================
// WORKSTREAM 2: CANTEEN PRE-ORDERING TESTS
// ==========================================
describe('Phase 2 - Workstream 2: Canteen Pre-ordering', () => {
  let createdOrderId;

  test('GET /canteen/menu returns verified menu items with prices in INR', async () => {
    const res = await fetch(`${baseUrl}/canteen/menu`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.menuItems.length > 0);
    assert.ok(body.data.menuItems[0].price > 0);
  });

  test('POST /canteen/orders calculates price server-side and creates order', async () => {
    // Fetch menu to get valid item IDs
    const menuRes = await fetch(`${baseUrl}/canteen/menu`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const menuBody = await menuRes.json();
    const item1 = menuBody.data.menuItems[0];
    const item2 = menuBody.data.menuItems[1];

    const res = await fetch(`${baseUrl}/canteen/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        items: [
          { menuItemId: item1.id, quantity: 2 },
          { menuItemId: item2.id, quantity: 1 },
        ],
        specialInstructions: 'Test order without onions',
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.order.order_number.startsWith('ORD-'));
    assert.equal(body.data.order.status, 'placed');

    // Expected total calculated strictly from database unit prices
    const expectedTotal = (parseFloat(item1.price) * 2) + (parseFloat(item2.price) * 1);
    assert.equal(parseFloat(body.data.order.total_amount), expectedTotal);
    createdOrderId = body.data.order.id;
  });

  test('Printing operator CANNOT access canteen operator queue (RBAC)', async () => {
    const res = await fetch(`${baseUrl}/canteen/operator/orders`, {
      headers: { Authorization: `Bearer ${printingOpToken}` },
    });
    assert.equal(res.status, 403);
  });

  test('Canteen operator CAN view queue and advance order status', async () => {
    const res = await fetch(`${baseUrl}/canteen/operator/orders`, {
      headers: { Authorization: `Bearer ${canteenOpToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);

    // Transition created order to 'accepted'
    const statusRes = await fetch(`${baseUrl}/canteen/operator/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${canteenOpToken}`,
      },
      body: JSON.stringify({
        status: 'accepted',
        comment: 'Kitchen confirmed preparation',
      }),
    });
    assert.equal(statusRes.status, 200);
    const statusBody = await statusRes.json();
    assert.equal(statusBody.data.newStatus, 'accepted');
  });
});

// ==========================================
// WORKSTREAM 3: XEROX / PRINTING TESTS
// ==========================================
describe('Phase 2 - Workstream 3: Xerox / Printing', () => {
  test('GET /printing/specs returns verified paper and rate parameters', async () => {
    const res = await fetch(`${baseUrl}/printing/specs`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.pricing.bw_per_page, 1.0);
    assert.equal(body.data.pricing.color_per_page, 5.0);
  });

  test('GET /printing/requests returns student print jobs list', async () => {
    const res = await fetch(`${baseUrl}/printing/requests`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.requests));
  });

  test('Canteen operator CANNOT access printing operator queue (RBAC)', async () => {
    const res = await fetch(`${baseUrl}/printing/operator/queue`, {
      headers: { Authorization: `Bearer ${canteenOpToken}` },
    });
    assert.equal(res.status, 403);
  });

  test('Printing operator CAN access printing operator queue', async () => {
    const res = await fetch(`${baseUrl}/printing/operator/queue`, {
      headers: { Authorization: `Bearer ${printingOpToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.requests));
  });
});

// ==========================================
// WORKSTREAM 4: LOST & FOUND TESTS
// ==========================================
describe('Phase 2 - Workstream 4: Lost & Found', () => {
  let createdItemId;

  test('GET /lost-found lists reported items with category filters', async () => {
    const res = await fetch(`${baseUrl}/lost-found`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.items));
  });

  test('POST /lost-found allows student to report an item', async () => {
    const res = await fetch(`${baseUrl}/lost-found`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        item_type: 'lost',
        title: 'Blue Water Bottle (Milton)',
        category: 'accessories',
        description: 'Left near study carrel #14',
        date_occurred: new Date().toISOString().slice(0, 10),
        location_detail: 'Central Library Floor 2',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.item.title, 'Blue Water Bottle (Milton)');
    createdItemId = body.data.item.id;
  });

  test('GET /lost-found/:id protects contact privacy from other students', async () => {
    const res = await fetch(`${baseUrl}/lost-found/${createdItemId}`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    // Raw phone/contact should be protected for non-owners/non-admins
    assert.ok(body.data.item.contact_info.includes('Protected'));
    assert.equal(body.data.item.isOwner, false);
  });

  test('POST /lost-found/:id/claim submits student verification claim', async () => {
    const res = await fetch(`${baseUrl}/lost-found/${createdItemId}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`,
      },
      body: JSON.stringify({
        verificationProof: 'Bottle has a small sticker of Linux Penguin at the bottom.',
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
  });
});

// ==========================================
// WORKSTREAM 5: AI CAMPUS ASSISTANT TESTS
// ==========================================
describe('Phase 2 - Workstream 5: AI Campus Assistant', () => {
  let convId;

  test('POST /assistant/conversations initializes a private inquiry thread', async () => {
    const res = await fetch(`${baseUrl}/assistant/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ title: 'Library Timings Inquiry' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.conversation.id > 0);
    convId = body.data.conversation.id;
  });

  test('POST /assistant/conversations/:id/messages grounds grounded query and returns citations', async () => {
    const res = await fetch(`${baseUrl}/assistant/conversations/${convId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        content: 'What are the library borrowing rules for undergraduate students?',
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.userMessage.sender, 'user');
    assert.equal(body.data.assistantMessage.sender, 'assistant');
    assert.equal(body.data.assistantMessage.grounded, true);
    assert.ok(body.data.assistantMessage.sources.length > 0);
    assert.ok(body.data.assistantMessage.content.includes('Central Library Regulation Manual'));
  });

  test('POST /assistant/conversations/:id/messages refuses to hallucinate unverified queries', async () => {
    const res = await fetch(`${baseUrl}/assistant/conversations/${convId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        content: 'What is the secret recipe for chocolate cake on the moon?',
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.assistantMessage.grounded, false);
    assert.equal(body.data.assistantMessage.sources.length, 0);
    assert.ok(body.data.assistantMessage.content.includes('could not find an official campus circular'));
  });

  test('Student 2 CANNOT access Student 1 assistant conversation (Data Isolation)', async () => {
    const res = await fetch(`${baseUrl}/assistant/conversations/${convId}`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert.equal(res.status, 403);
  });

  test('DELETE /assistant/conversations/:id deletes thread and cascades messages', async () => {
    const res = await fetch(`${baseUrl}/assistant/conversations/${convId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
  });
});

// ==========================================
// WORKSTREAM 6: SECURITY AUDIT & WORKFLOW EDGE CASES
// ==========================================
describe('Phase 2 - Security Audit & Advanced Workflow Tests', () => {
  let testPrintJobId;

  // 1. Canteen Order Restrictions
  test('Student cannot cancel an already cancelled order (400 Bad Request)', async () => {
    // Create new order to cancel
    const menuRes = await fetch(`${baseUrl}/canteen/menu`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const menu = await menuRes.json();
    const item = menu.data.menuItems[0];

    const createRes = await fetch(`${baseUrl}/canteen/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        items: [{ menuItemId: item.id, quantity: 1 }],
      }),
    });
    const orderData = await createRes.json();
    const orderId = orderData.data.order.id;

    // First cancel succeeds
    const cancel1 = await fetch(`${baseUrl}/canteen/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(cancel1.status, 200);

    // Second cancel is rejected
    const cancel2 = await fetch(`${baseUrl}/canteen/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(cancel2.status, 400);

    // Operator cannot transition terminal cancelled order
    const opUpdate = await fetch(`${baseUrl}/canteen/operator/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${canteenOpToken}`,
      },
      body: JSON.stringify({ status: 'accepted' }),
    });
    assert.equal(opUpdate.status, 400);
  });

  test('Order with invalid or zero quantity is rejected (400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/canteen/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        items: [{ menuItemId: 6, quantity: 0 }],
      }),
    });
    assert.equal(res.status, 400);
  });

  // 2. Printing Upload Security & Authorized Access
  test('Malicious file upload (.exe / forbidden MIME) is rejected (400 Bad Request)', async () => {
    const form = new FormData();
    const maliciousBlob = new Blob(['MZ dummy executable content'], { type: 'application/x-msdownload' });
    form.append('document', maliciousBlob, 'exploit.exe');
    form.append('colorMode', 'bw');
    form.append('printType', 'single_sided');

    const res = await fetch(`${baseUrl}/printing/requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: form,
    });
    assert.equal(res.status, 400);
  });

  test('Valid PDF upload creates print request and registers in uploaded_files', async () => {
    const form = new FormData();
    const validBlob = new Blob(['%PDF-1.4 official document content'], { type: 'application/pdf' });
    form.append('document', validBlob, 'course-syllabus.pdf');
    form.append('documentName', 'Course Syllabus 2026');
    form.append('pagesCount', '4');
    form.append('copiesCount', '1');
    form.append('colorMode', 'bw');
    form.append('printType', 'double_sided');

    const res = await fetch(`${baseUrl}/printing/requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: form,
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.request.request_number.startsWith('PRT-'));
    testPrintJobId = body.data.request.id;
  });

  test('Student 2 CANNOT download Student 1 print file (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/printing/requests/${testPrintJobId}/download`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert.equal(res.status, 403);
  });

  test('Canteen operator CANNOT download Student 1 print file (403 Forbidden - Role Isolation)', async () => {
    const res = await fetch(`${baseUrl}/printing/requests/${testPrintJobId}/download`, {
      headers: { Authorization: `Bearer ${canteenOpToken}` },
    });
    assert.equal(res.status, 403);
  });

  test('Xerox Printing operator CAN securely download Student 1 print file', async () => {
    const res = await fetch(`${baseUrl}/printing/requests/${testPrintJobId}/download`, {
      headers: { Authorization: `Bearer ${printingOpToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/pdf');
    const content = await res.text();
    assert.ok(content.includes('%PDF-1.4'));
  });

  test('Student can cancel submitted print request (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/printing/requests/${testPrintJobId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);

    // Second cancel is rejected
    const res2 = await fetch(`${baseUrl}/printing/requests/${testPrintJobId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res2.status, 400);
  });

  // 3. Lost & Found Security
  test('Non-owner non-admin student CANNOT update listing status (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/lost-found/1/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`,
      },
      body: JSON.stringify({ status: 'closed' }),
    });
    assert.equal(res.status, 403);
  });

  test('Claim submission with empty proof details is rejected (400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/lost-found/1/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`,
      },
      body: JSON.stringify({ verificationProof: '   ' }),
    });
    assert.equal(res.status, 400);
  });

  // 4. AI Assistant Edge Cases
  test('Query with empty or whitespace content is rejected (400 Bad Request)', async () => {
    const convRes = await fetch(`${baseUrl}/assistant/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ title: 'Edge Case Inquiry' }),
    });
    const convData = await convRes.json();
    const cId = convData.data.conversation.id;

    const res = await fetch(`${baseUrl}/assistant/conversations/${cId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ content: '   ' }),
    });
    assert.equal(res.status, 400);

    // Clean up
    await fetch(`${baseUrl}/assistant/conversations/${cId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
  });
});
