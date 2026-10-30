import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const exports = {};
const code = ts.transpileModule(fs.readFileSync("src/lib/commerce/receipts.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext("(function(exports){" + code + "\n})")(exports);
const { receiptCode, receiptOrderNumber, canPresentReceipt, hasPhysicalItems, academyWhatsappAvailable } = exports;

test("receipt codes are stable and identify the order without exposing customer data", () => {
  const order = { id: "a1b2c3d4-1111-4111-8111-111111111111", order_number: 123 };
  assert.equal(receiptCode(order), "MH-123-A1B2C3D4");
  assert.equal(receiptOrderNumber(receiptCode(order)), 123);
  assert.equal(receiptOrderNumber(" mh-123-a1b2c3d4 "), 123);
  assert.equal(receiptOrderNumber("MH-123-wrong"), null);
  assert.equal(receiptOrderNumber("MH-999999999999999999999-A1B2C3D4"), null);
});

test("only confirmed, non-cancelled physical purchases qualify for pickup proof", () => {
  assert.equal(canPresentReceipt({ payment_status: "approved", status: "pending" }, true), true);
  for (const payment_status of ["pending", "failed", "refunded", "cancelled"]) {
    assert.equal(canPresentReceipt({ payment_status, status: "pending" }, true), false);
  }
  assert.equal(canPresentReceipt({ payment_status: "approved", status: "cancelled" }, true), false);
  assert.equal(canPresentReceipt({ payment_status: "approved", status: "pending" }, false), false);
});

test("physical detection works from purchase snapshots and legacy catalog references", () => {
  assert.equal(hasPhysicalItems([{ metadata: { type: "physical" }, product_id: null }]), true);
  assert.equal(hasPhysicalItems([{ metadata: {}, product_id: "supplement" }], [{ id: "supplement", type: "physical" }]), true);
  assert.equal(hasPhysicalItems([{ metadata: { type: "digital" }, product_id: "program" }]), false);
});

test("the real academy WhatsApp is accepted and placeholder contacts are blocked", () => {
  assert.equal(academyWhatsappAvailable("5517996548450"), true);
  assert.equal(academyWhatsappAvailable("5599999999999"), false);
  assert.equal(academyWhatsappAvailable(""), false);
});
