const fs = require("fs");
const vm = require("vm");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "hires.js"), "utf8");
const sandbox = {
  console: { log: (...a) => console.log("  [module]", ...a) },
  fetch: globalThis.fetch,
  Widget: { http: { get: async (url) => {
    const r = await globalThis.fetch(url, { headers: { "User-Agent": "RexHiresTest/2.0" } });
    const t = await r.text();
    try { return { data: JSON.parse(t) }; } catch { return { data: t }; }
  } } },
};
sandbox.globalThis = sandbox;
const ctx = vm.createContext(sandbox);
vm.runInContext(src, ctx);
const REQUIRED = ["id", "mediaType", "title", "description", "posterPath", "videoUrl"];
function validate(name, items, allowEmpty) {
  if (!Array.isArray(items)) throw new Error(`${name}: 非数组`);
  if (!items.length) { if (allowEmpty) { console.log(`  ✓ ${name}: 0 条（符合预期）`); return items; } throw new Error(`${name}: 空数组`); }
  const seen = new Set();
  items.forEach((it, i) => {
    REQUIRED.forEach((k) => { if (!(k in it)) throw new Error(`${name}[${i}] 缺 ${k}`); });
    if (!/^https?:\/\//.test(it.videoUrl)) throw new Error(`${name}[${i}] videoUrl 非法: ${it.videoUrl}`);
    if (seen.has(it.id)) throw new Error(`${name}: id 重复 ${it.id}`);
    seen.add(it.id);
  });
  console.log(`  ✓ ${name}: ${items.length} 条，字段齐、URL 合法`);
  return items;
}
(async () => {
  const cases = [
    ["dv4k", {}, false],
    ["lab", {}, false],
    ["cms", { site: "0" }, false],
    ["live", { site: "0" }, false],
    ["archive", { category: "classic" }, false],
    ["mine", {}, true],
  ];
  let fail = 0;
  console.log("跑模块函数：");
  for (const [fn, params, allowEmpty] of cases) {
    const label = `${fn}(${JSON.stringify(params)})`;
    try {
      const out = await ctx[fn]({ ...params });
      const items = validate(label, out, allowEmpty);
      items.slice(0, 3).forEach((it) => console.log(`      · ${it.title}  [${it.tagline || "-"}]  ${it.videoUrl.slice(0, 70)}`));
    } catch (e) { fail++; console.log(`  ✗ ${label}: ${e.message}`); }
  }
  console.log(fail ? `\n失败 ${fail}` : "\n全部通过");
  process.exit(fail ? 1 : 0);
})();
