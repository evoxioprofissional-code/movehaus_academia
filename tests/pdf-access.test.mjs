import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function loadModule(file, require, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext("(function(require,exports){" + code + "\n})", { Response, ...globals })(require, exports);
  return exports;
}

const pdf = loadModule("src/lib/customer/pdf.ts", () => { throw new Error("Unexpected import"); });
const productId = "11111111-1111-4111-8111-111111111111";
const chapterId = "22222222-2222-4222-8222-222222222222";
const path = `pdfs/${productId}/${chapterId}.pdf`;
const content = pdf.pdfChapterContent({ path, name: "receitas.pdf" });

test("PDF metadata accepts only document paths and preserves text chapters", () => {
  assert.equal(pdf.pdfAttachment("Receita com ingredientes e preparo"), null);
  assert.equal(pdf.pdfAttachment('MOVEHAUS_PDF_V1\n{"path":"../../secrets","name":"arquivo.pdf"}'), null);
  assert.equal(pdf.pdfAttachment("MOVEHAUS_PDF_V1\n{"), null);
  assert.equal(pdf.pdfAttachment(content).path, path);
});

function route(data) {
  let downloads = 0;
  const handler = loadModule("src/app/(member)/minha-area/ler/[slug]/pdf/[chapterId]/route.ts", (name) => {
    if (name === "@/lib/customer/pdf") return pdf;
    if (name === "@/lib/customer/data") return { getProtectedEbook: async () => data };
    if (name === "@/lib/supabase/server") return { createAdminClient: () => ({
      storage: { from: (bucket) => {
        assert.equal(bucket, "reader-documents");
        return { download: async (requested) => {
          downloads++;
          assert.equal(requested, path);
          return { data: new Blob(["%PDF-1.7\nprivate content"]), error: null };
        } };
      } },
    }) };
    throw new Error(name);
  });
  return {
    get: () => handler.GET(new Request("https://movehaus.test/reader"), {
      params: Promise.resolve({ slug: "receitas", chapterId }),
    }),
    downloads: () => downloads,
  };
}

test("an authorized buyer receives an inline PDF with private caching", async () => {
  const r = route({ denied: false, product: { id: productId }, chapters: [{ id: chapterId, content }] });
  const response = await r.get();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "application/pdf");
  assert.equal(response.headers.get("Content-Disposition"), "inline");
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.equal(await response.text(), "%PDF-1.7\nprivate content");
  assert.equal(r.downloads(), 1);
});

test("missing or expired purchase access cannot download a PDF", async () => {
  for (const data of [null, { denied: true, product: { id: productId } }]) {
    const r = route(data);
    assert.equal((await r.get()).status, 403);
    assert.equal(r.downloads(), 0);
  }
});

test("unpublished chapters and files belonging to another product are blocked", async () => {
  const drafts = route({ denied: false, product: { id: productId }, chapters: [] });
  assert.equal((await drafts.get()).status, 404);
  assert.equal(drafts.downloads(), 0);
  const other = route({ denied: false, product: { id: chapterId }, chapters: [{ id: chapterId, content }] });
  assert.equal((await other.get()).status, 404);
  assert.equal(other.downloads(), 0);
});
