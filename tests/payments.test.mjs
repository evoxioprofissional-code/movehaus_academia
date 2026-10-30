import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import crypto from 'node:crypto';

const orderId = '11111111-1111-4111-8111-111111111111';
const subId = '22222222-2222-4222-8222-222222222222';
const order = { id: orderId, customer_id: 'user', customer_email: 'customer@example.com', total: 21900, payment_status: 'pending', status: 'pending', order_number: 1 };

function harness() {
  const tables = { orders: [structuredClone(order)], payments: [], subscriptions: [], digital_access: [], order_items: [], products: [] };
  class Query {
    constructor(table) { this.table = table; this.filters = []; this.op = 'read'; }
    select() { return this; }
    eq(k, v) { this.filters.push(r => r[k] === v); return this; }
    neq(k, v) { this.filters.push(r => r[k] !== v); return this; }
    is(k, v) { this.filters.push(r => (r[k] ?? null) === v); return this; }
    contains(k, v) { this.filters.push(r => Object.entries(v).every(([a,b]) => r[k]?.[a] === b)); return this; }
    or(expr) { this.filters.push(r => expr.split(',').some(x => { const [, k, op, value] = x.match(/^(\w+)\.(is|lt|lte)\.(.*)$/); return op === 'is' ? r[k] == null : op === 'lt' ? r[k] < value : r[k] <= value; })); return this; }
    insert(value) { this.op = 'insert'; this.value = value; return this; }
    update(value) { this.op = 'update'; this.value = value; return this; }
    upsert(value, options = {}) { this.op = 'upsert'; this.value = value; this.options = options; return this; }
    async single() { const r = this.run(); return { ...r, data: r.data?.[0] ?? null }; }
    maybeSingle() { return this.single(); }
    then(resolve, reject) { return Promise.resolve().then(() => this.run()).then(resolve, reject); }
    run() {
      const rows = tables[this.table];
      let result = rows.filter(r => this.filters.every(f => f(r)));
      if (this.op === 'insert' || this.op === 'upsert') {
        const keys = (this.options?.onConflict ?? (this.table === 'payments' ? 'idempotency_key' : this.table === 'subscriptions' ? 'user_id,product_id' : 'id')).split(',');
        const found = rows.find(r => keys.every(k => r[k] === this.value[k]));
        if (found && this.op === 'insert') return { data: null, error: { code: '23505' } };
        if (found) { if (!this.options.ignoreDuplicates) Object.assign(found, this.value); result = [found]; }
        else { const r = { id: crypto.randomUUID(), status: 'pending', provider_subscription_id: null, provider_payment_id: null, current_period_end: null, permanent: false, ...structuredClone(this.value) }; rows.push(r); result = [r]; }
      } else if (this.op === 'update') result.forEach(r => Object.assign(r, structuredClone(this.value)));
      return { data: structuredClone(result), error: null };
    }
  }
  const db = { from: table => new Query(table) };
  const calls = [];
  const remote = new Map();
  let createStatus = 'pending';
  let loseResponse = false;
  const api = { MercadoPagoError: class extends Error {}, requirePaymentConfiguration() {}, async mercadoPagoRequest(url, options) {
    calls.push({ url, options });
    if (options?.method === 'POST' && url === '/v1/payments') {
      const p = { id: calls.length, status: createStatus, currency_id: 'BRL', date_approved: '2030-01-10T12:00:00Z', point_of_interaction: { transaction_data: { qr_code: 'pix-copy-code', qr_code_base64: 'png' } }, ...options.body };
      remote.set('/v1/payments/' + p.id, p);
      if (loseResponse) throw new Error('Network response lost');
      return p;
    }
    if (url.startsWith('/v1/payments/search')) return { results: [...remote.entries()].filter(([key]) => key.startsWith('/v1/payments/')).map(([, value]) => value) };
    if (!remote.has(url)) throw new Error('Unexpected API call: ' + url);
    return structuredClone(remote.get(url));
  } };
  const cache = {};
  function load(file) {
    file = path.resolve('src/lib/commerce', file + '.ts');
    if (cache[file]) return cache[file];
    const exports = {}; cache[file] = exports;
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const req = name => name === 'server-only' ? {} : name === 'node:crypto' ? crypto : name === '@/lib/env' ? { publicEnv: { siteUrl: 'https://example.com' } } : name === '@/lib/supabase/server' ? { createAdminClient: () => db } : name === './mercadopago' ? api : name.startsWith('./') ? load(name.slice(2)) : (() => { throw new Error(name); })();
    vm.runInNewContext('(function(require,exports){' + code + '\n})', { console, URL, Date })(req, exports);
    return exports;
  }
  return { tables, calls, remote, load, setStatus: value => { createStatus = value; }, loseResponse: () => { loseResponse = true; } };
}

test('client amounts and raw card fields are not forwarded', () => {
  const { parseCardInput } = harness().load('payment-rules');
  const parsed = parseCardInput({ token: 'secure-token-123456', payment_method_id: 'visa', transaction_amount: 0.01, installments: 99, card_number: 'raw-card-data' });
  assert.equal(parsed.token, 'secure-token-123456');
  assert.equal('transaction_amount' in parsed, false);
  assert.equal('card_number' in parsed, false);
  assert.throws(() => parseCardInput({ token: '', payment_method_id: 'pix' }));
});

test('concurrent Pix submissions create one charge and use stored order total', async () => {
  const h = harness(); const payments = h.load('payments');
  await Promise.all([payments.chargeOrder(order), payments.chargeOrder(order)]);
  const posts = h.calls.filter(c => c.options?.method === 'POST');
  assert.equal(posts.length, 1);
  assert.equal(posts[0].options.body.transaction_amount, 219);
  assert.ok(posts[0].options.idempotencyKey);
  const view = await payments.readOrderPayment(order);
  assert.equal(view.qrCode, 'pix-copy-code');
  assert.equal(view.status, 'pending');
});

test('a rejected card can retry with a new provider idempotency key', async () => {
  const h = harness(); h.setStatus('rejected'); const p = h.load('payments');
  await p.chargeOrder(order, { token: 'token-first', paymentMethodId: 'visa' });
  await p.chargeOrder(order, { token: 'token-second', paymentMethodId: 'visa' });
  const posts = h.calls.filter(c => c.options?.method === 'POST');
  assert.equal(posts.length, 2);
  assert.notEqual(posts[0].options.idempotencyKey, posts[1].options.idempotencyKey);
});

test('incorrect amount cannot approve an order', async () => {
  const h = harness(); h.remote.set('/v1/payments/7', { id: 7, status: 'approved', external_reference: orderId, currency_id: 'BRL', transaction_amount: 1 });
  await assert.rejects(h.load('payments').syncPayment('7'));
  assert.equal(h.tables.orders[0].payment_status, 'pending');
});

test('a lost provider response is recovered without a second charge', async () => {
  const h = harness(); h.loseResponse(); const p = h.load('payments');
  await assert.rejects(p.chargeOrder(order));
  const view = await p.readOrderPayment(order);
  assert.equal(view.qrCode, 'pix-copy-code');
  await p.chargeOrder(order);
  assert.equal(h.calls.filter(c => c.options?.method === 'POST').length, 1);
});

function subscriptionFixture(h) {
  h.tables.orders[0].total = 0;
  h.tables.subscriptions.push({ id: subId, user_id: 'user', product_id: 'product', monthly_amount: 9900, provider: 'mercadopago', provider_subscription_id: 'remote123', status: 'pending', current_period_end: null });
  h.tables.order_items.push({ order_id: orderId, product_id: 'product' });
  h.remote.set('/preapproval/remote123', { id: 'remote123', status: 'authorized', external_reference: `${orderId}:${subId}`, auto_recurring: { currency_id: 'BRL', transaction_amount: 99, frequency: 1, frequency_type: 'months' } });
}

test('card authorization without a paid invoice does not grant access', async () => {
  const h = harness(); subscriptionFixture(h);
  h.remote.set('/authorized_payments/search?preapproval_id=remote123&limit=100', { results: [] });
  await h.load('subscriptions').syncSubscription('remote123');
  assert.equal(h.tables.digital_access.length, 0);
  assert.equal(h.tables.orders[0].payment_status, 'pending');
});

test('paid monthly invoice renews access once; an old event cannot shorten it', async () => {
  const h = harness(); subscriptionFixture(h); const s = h.load('subscriptions');
  const invoice = { id: 9, preapproval_id: 'remote123', currency_id: 'BRL', transaction_amount: 99, debit_date: '2030-01-31T12:00:00Z', payment: { id: 10, status: 'approved' } };
  h.remote.set('/authorized_payments/9', invoice);
  await s.syncSubscription('remote123', '9'); await s.syncSubscription('remote123', '9');
  assert.equal(h.tables.digital_access.length, 1);
  assert.equal(h.tables.payments.length, 1);
  assert.equal(h.tables.digital_access[0].expires_at, '2030-02-28T12:00:00.000Z');
  assert.equal(h.tables.orders[0].payment_status, 'approved');
  h.remote.set('/authorized_payments/8', { ...invoice, id: 8, debit_date: '2029-12-31T12:00:00Z' });
  await s.syncSubscription('remote123', '8');
  assert.equal(h.tables.digital_access[0].expires_at, '2030-02-28T12:00:00.000Z');
});

test('provider cancellation preserves the already paid access period', async () => {
  const h = harness(); subscriptionFixture(h);
  h.tables.digital_access.push({ subscription_id: subId, expires_at: '2030-02-28T12:00:00.000Z' });
  h.remote.get('/preapproval/remote123').status = 'cancelled';
  await h.load('subscriptions').syncSubscription('remote123');
  assert.equal(h.tables.subscriptions[0].status, 'cancelled');
  assert.equal(h.tables.digital_access[0].expires_at, '2030-02-28T12:00:00.000Z');
});
