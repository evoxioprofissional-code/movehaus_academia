import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function reader({ type = "digital", access = true, expired = false, published = true } = {}) {
  const queries = [];
  const tables = {
    products: [{ id: "product", slug: "full-body", name: "Full Body", type }],
    digital_access: access ? [{ user_id: "buyer", product_id: "product", status: "active", permanent: !expired, expires_at: expired ? "2020-01-01T00:00:00Z" : null }] : [],
    ebook_chapters: [{ id: "lesson", product_id: "product", title: "Aula 1", position: 1, content: "Conteúdo reservado aos compradores" }],
    profiles: [{ id: "buyer", full_name: "Aluno" }],
    ebooks: [{ product_id: "product", status: published ? "published" : "draft" }],
    reading_progress: [], access_logs: [],
  };
  class Query {
    constructor(table) { this.table = table; this.filters = []; queries.push(table); }
    select() { return this; }
    eq(key, value) { this.filters.push(row => row[key] === value); return this; }
    in(key, values) { this.filters.push(row => values.includes(row[key])); return this; }
    order() { return this; }
    insert() { return Promise.resolve({ error: null }); }
    data() { return tables[this.table].filter(row => this.filters.every(filter => filter(row))); }
    maybeSingle() { return Promise.resolve({ data: this.data()[0] ?? null, error: null }); }
    then(resolve, reject) { return Promise.resolve({ data: this.data(), error: null }).then(resolve, reject); }
  }
  const exports = {};
  const require = name => {
    if (name === "server-only") return {};
    if (name === "react") return { cache: fn => fn };
    if (name === "@/lib/auth/user") return { requireUser: async () => ({ id: "buyer", email: "buyer@example.com" }) };
    if (name === "@/lib/supabase/server") return { createClient: async () => ({ from: table => new Query(table) }) };
    throw new Error(name);
  };
  const code = ts.transpileModule(fs.readFileSync("src/lib/customer/data.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext("(function(require,exports){" + code + "\n})", { Date })(require, exports);
  return { get: () => exports.getProtectedEbook("full-body"), queries };
}

test("a purchased digital program opens its published lessons", async () => {
  const data = await reader().get();
  assert.equal(data.denied, false);
  assert.equal(data.product.type, "digital");
  assert.equal(data.chapters[0].title, "Aula 1");
});

test("a visitor without purchased access cannot read lessons", async () => {
  const r = reader({ access: false });
  assert.equal((await r.get()).denied, true);
  assert.equal(r.queries.includes("ebook_chapters"), false);
});

test("expired access cannot read lessons", async () => {
  const r = reader({ expired: true });
  assert.equal((await r.get()).denied, true);
  assert.equal(r.queries.includes("ebook_chapters"), false);
});

test("draft lessons are not presented as published content", async () => {
  const data = await reader({ published: false }).get();
  assert.equal(data.denied, false);
  assert.equal(data.chapters.length, 0);
});

test("ebooks still work and physical products have no protected reader", async () => {
  assert.equal((await reader({ type: "ebook" }).get()).chapters.length, 1);
  assert.equal(await reader({ type: "physical" }).get(), null);
});
