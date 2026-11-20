// 🏅 Track Run's arcade titles: 🏁 Track Champion (win 10 races) · 🤫 🎲 Lucky Sixes (three 6s in a row).
// Run: node tools/test-titles.js   (pulls the real functions out of index.html and runs them with fakes)
const fs = require("fs"), vm = require("vm");
const html = fs.readFileSync(__dirname + "/../index.html", "utf8");
const cut = (from, to) => { const a = html.indexOf(from), b = html.indexOf(to, a); if (a < 0 || b < 0) throw new Error("not found: " + from); return html.slice(a, b); };
const store = {};
const ctx = {
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
  document: { createElement: () => ({ style: {}, remove() {} }), body: { appendChild() {} } },
  setTimeout: () => 0, JSON, Math, String, Object, Array,
  localPlayerIdx: 0, isBot: [false, true], currentPlayer: 0, lastDieFace: 0, matchOver: false, winnerIdx: null,
  $: () => ({ innerHTML: "", textContent: "" }), showEndControls() {}, updateAllUI() {}, maybeShowReward() {}, renderDie() {}, updateInventoryButtons() {},
  scheduleBroadcast() {}, moveAndResolve() {}, netRole: "", playerNames: ["You", "Bot"], busy: false,
};
vm.createContext(ctx);
const code = cut("  // 🏅 Arcade titles", "  function declareWinner") + cut("  function declareWinner", "\n  }\n") + "\n  }\n" + cut("  function doRoll(_isAuto) {", "\n  }\n") + "\n  }\n";
vm.runInContext(code + "\nthis.declareWinner = declareWinner; this.doRoll = doRoll;", ctx);
let ok = true; const check = (p, l) => { if (!p) ok = false; console.log(`  ${p ? "PASS" : "FAIL"} ${l}`); };
const owned = () => (JSON.parse(store["daniels-arcade-v1"] || "{}").owned || []);
for (let i = 0; i < 9; i++) ctx.declareWinner(0, "reaches");
check(!owned().includes("tr-champ"), "9 wins: not yet");
ctx.declareWinner(1, "reaches");
check(!owned().includes("tr-champ"), "a bot's win doesn't count");
ctx.declareWinner(0, "reaches");
check(owned().includes("tr-champ"), "the 10th win → 🏁 Track Champion");
const roll = (face) => { ctx.Math = Object.create(Math); ctx.Math.random = () => (face - 1) / 6 + 0.01; vm.runInContext("Math = this.Math", ctx); ctx.doRoll(false); };
roll(6); roll(6); roll(3); roll(6); roll(6);
check(!owned().includes("tr-sixes"), "6, 6, 3, 6, 6: not three in a row");
roll(6);
check(owned().includes("tr-sixes"), "🤫 three 6s in a row → 🎲 Lucky Sixes");
check(JSON.parse(store["daniels-arcade-v1"]).equipped.title === "tr-sixes", "…and it's put on");
console.log(ok ? "\nTRACK RUN TITLES PASS" : "\nTRACK RUN TITLES FAIL"); process.exit(ok ? 0 : 1);
