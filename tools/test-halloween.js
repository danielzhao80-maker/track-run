// 🎃 Track Run's Halloween reward: the FIRST win of the event gives Monster Attack!'s Halloween Pass
// 10 candy (11 with Nullp's treat boost), and only during Halloween. Run: node tools/test-halloween.js
const html = require("fs").readFileSync(require("path").join(__dirname, "..", "index.html"), "utf8");
const a = html.indexOf("  function halloweenWinCandy() {"), b = html.indexOf("\n  function maybeShowReward()");
if (a < 0 || b < 0) { console.log("FAIL could not find halloweenWinCandy"); process.exit(1); }
const store = {};
global.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
const win = new Function(html.slice(a, b) + "; return halloweenWinCandy;")();
const Y = new Date().getFullYear();
let ok = true;
const check = (name, cond) => { console.log((cond ? "PASS " : "FAIL ") + name); ok = ok && cond; };
store.monster_attack_event_force = "halloween";
check("first win at Halloween: +10 candy", win() === 10 && store.monster_attack_candy === "10");
check("second win: nothing (one time only)", win() === 0 && store.monster_attack_candy === "10");
delete store["monster_attack_hw_once_trackrun_" + Y]; store["monster_attack_hw_treat_" + Y] = "1";
check("with Nullp's treat boost: +11 (and it counts for the pass)", win() === 11 && store.monster_attack_candy === "21" && store["monster_attack_hw_earned_" + Y] === "21");
delete store["monster_attack_hw_once_trackrun_" + Y]; store.monster_attack_event_force = "off";
check("outside Halloween: nothing, and the reward is not used up", win() === 0 && store["monster_attack_hw_once_trackrun_" + Y] === undefined);
check("the win screen shows it", /const candyWon = halloweenWinCandy\(\);/.test(html) && /one time only/.test(html));
console.log(ok ? "TRACK RUN HALLOWEEN PASS" : "TRACK RUN HALLOWEEN FAIL");
process.exit(ok ? 0 : 1);
