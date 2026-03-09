// =====================
// データ
// =====================
const STORES = [
  { id: 1, name: "Hair Salon A", type: "美容室", color: "#C8956C" },
  { id: 2, name: "Hair Salon B", type: "美容室", color: "#8B7355" },
  { id: 3, name: "Eye Salon", type: "アイサロン", color: "#6B8E9F" },
  { id: 4, name: "Nail Salon", type: "ネイルサロン", color: "#A67B8A" },
  { id: 5, name: "Esthe Salon", type: "エステサロン", color: "#7A9E7E" },
];

let STAFF = [
  { id: 1, name: "田中 美咲", storeId: 1, role: "スタイリスト", sales: 485000, target: 500000 },
  { id: 2, name: "山本 佳奈", storeId: 1, role: "スタイリスト", sales: 320000, target: 380000 },
  { id: 3, name: "佐藤 彩",   storeId: 1, role: "アシスタント", sales: 95000,  target: 120000 },
  { id: 4, name: "鈴木 理恵", storeId: 2, role: "スタイリスト", sales: 560000, target: 500000 },
  { id: 5, name: "中村 葵",   storeId: 2, role: "スタイリスト", sales: 410000, target: 450000 },
  { id: 6, name: "小林 奈々", storeId: 2, role: "アシスタント", sales: 78000,  target: 100000 },
  { id: 7, name: "伊藤 真由", storeId: 3, role: "アイリスト",   sales: 290000, target: 300000 },
  { id: 8, name: "渡辺 沙織", storeId: 3, role: "アイリスト",   sales: 185000, target: 220000 },
  { id: 9, name: "加藤 ゆい", storeId: 4, role: "ネイリスト",   sales: 230000, target: 250000 },
  { id: 10, name: "高橋 莉子", storeId: 4, role: "ネイリスト",  sales: 195000, target: 200000 },
  { id: 11, name: "吉田 みき", storeId: 5, role: "セラピスト",  sales: 340000, target: 320000 },
  { id: 12, name: "松本 春奈", storeId: 5, role: "セラピスト",  sales: 210000, target: 280000 },
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const DOW = ["日","月","火","水","木","金","土"];
function getDow(d) { return (0 + d - 1) % 7; } // 2026年3月1日=日曜

function genShifts() {
  const s = {};
  STAFF.forEach(st => {
    s[st.id] = {};
    DAYS.forEach(d => {
      const dow = getDow(d);
      if (dow === 0) { s[st.id][d] = "休"; return; }
      const r = Math.random();
      if (r < 0.08) s[st.id][d] = "希望休";
      else if (r < 0.13) s[st.id][d] = "休";
      else s[st.id][d] = r < 0.5 ? "10:00-19:00" : "11:00-20:00";
    });
  });
  return s;
}

let shifts = genShifts();
let currentUser = null;
let storeFilter = 0;
let salesTab = "overview";
let shiftTab = "shift";

// =====================
// ユーティリティ
// =====================
const fmt = n => Number(n).toLocaleString("ja-JP");
const pct = (a, b) => b === 0 ? 0 : Math.round(a / b * 100);
const getStore = id => STORES.find(s => s.id === id);

// =====================
// ログイン・ログアウト
// =====================
function doLogin() {
  const name = document.getElementById("login-name").value.trim();
  const store = document.getElementById("login-store").value;
  const role = document.getElementById("login-role").value;
  if (!name || !store) { alert("お名前と店舗を入力してください"); return; }
  currentUser = { name, store, role };
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("app").style.display = "flex";
  document.getElementById("user-name-display").textContent = name;
  document.getElementById("user-store-display").textContent = store;
  const d = new Date();
  document.getElementById("today-date").textContent =
    `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
  showPage("sales", document.querySelector(".nav-item"));
}

function doLogout() {
  currentUser = null;
  document.getElementById("app").style.display = "none";
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("login-name").value = "";
}

// =====================
// ページ切替
// =====================
function showPage(page, el) {
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  if (el) el.classList.add("active");
  const titles = { sales: "売上管理", targets: "目標管理", shift: "シフト・勤怠管理" };
  document.getElementById("page-title").textContent = titles[page];
  const c = document.getElementById("main-content");
  if (page === "sales") c.innerHTML = renderSales();
  if (page === "targets") c.innerHTML = renderTargets();
  if (page === "shift") c.innerHTML = renderShift();
}

// =====================
// 売上ページ
// =====================
function renderSales() {
  return `
    <div class="tab-bar">
      <div class="tab ${salesTab==="overview"?"active":""}" onclick="setSalesTab('overview',this)">全社</div>
      <div class="tab ${salesTab==="stores"?"active":""}" onclick="setSalesTab('stores',this)">店舗別</div>
      <div class="tab ${salesTab==="staff"?"active":""}" onclick="setSalesTab('staff',this)">スタッフ別</div>
    </div>
    <div id="sales-body">${renderSalesBody()}</div>
  `;
}

function setSalesTab(tab) {
  salesTab = tab;
  document.querySelectorAll(".tab-bar .tab").forEach((t,i) => {
    t.classList.toggle("active", ["overview","stores","staff"][i] === tab);
  });
  document.getElementById("sales-body").innerHTML = renderSalesBody();
}

function renderSalesBody() {
  if (salesTab === "overview") return renderSalesOverview();
  if (salesTab === "stores") return renderSalesStores();
  return renderSalesStaff();
}

function renderSalesOverview() {
  const totalSales = STAFF.reduce((a,s) => a+s.sales, 0);
  const totalTarget = STAFF.reduce((a,s) => a+s.target, 0);
  const p = pct(totalSales, totalTarget);
  const achieved = STAFF.filter(s => s.sales >= s.target).length;
  return `
    <div class="kpi-grid">
      <div class="kpi-card" style="--accent:#C8956C">
        <div class="kpi-label">全社売上（月累計）</div>
        <div class="kpi-value">¥${fmt(totalSales)}</div>
        <div class="kpi-sub">達成率 <span class="badge ${p>=100?"badge-green":p>=80?"badge-yellow":"badge-red"}">${p}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(p,100)}%;background:#C8956C"></div></div>
      </div>
      <div class="kpi-card" style="--accent:#8B7355">
        <div class="kpi-label">月次目標</div>
        <div class="kpi-value">¥${fmt(totalTarget)}</div>
        <div class="kpi-sub">残り ¥${fmt(Math.max(totalTarget-totalSales,0))}</div>
      </div>
      <div class="kpi-card" style="--accent:#7A9E7E">
        <div class="kpi-label">目標達成スタッフ</div>
        <div class="kpi-value">${achieved}<span class="kpi-unit"> / ${STAFF.length}名</span></div>
        <div class="kpi-sub">達成率 ${Math.round(achieved/STAFF.length*100)}%</div>
      </div>
    </div>
    <div class="section-title">店舗別サマリー</div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
      ${STORES.map(store => {
        const ss = STAFF.filter(s=>s.storeId===store.id);
        const sales = ss.reduce((a,s)=>a+s.sales,0);
        const target = ss.reduce((a,s)=>a+s.target,0);
        const p2 = pct(sales,target);
        return `
          <div class="kpi-card" style="--accent:${store.color}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <div style="width:10px;height:10px;border-radius:50%;background:${store.color};flex-shrink:0"></div>
              <div style="font-size:13px;font-weight:500">${store.name}</div>
              <div style="font-size:11px;color:#9B8B80;margin-left:auto">${store.type}</div>
            </div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:24px">¥${fmt(sales)}</div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#9B8B80;margin:8px 0 4px">
              <span>目標 ¥${fmt(target)}</span>
              <span style="color:${p2>=100?"#3A7D44":"#C8956C"};font-weight:500">${p2}%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(p2,100)}%;background:${store.color}"></div></div>
          </div>`;
      }).join("")}
    </div>
  `;
}

function renderSalesStores() {
  return STORES.map(store => {
    const ss = STAFF.filter(s=>s.storeId===store.id);
    const sales = ss.reduce((a,s)=>a+s.sales,0);
    const target = ss.reduce((a,s)=>a+s.target,0);
    const p2 = pct(sales,target);
    return `
      <div class="section-title"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${store.color}"></span>${store.name}</div>
      <div class="kpi-grid" style="margin-bottom:24px">
        <div class="kpi-card" style="--accent:${store.color}">
          <div class="kpi-label">店舗売上</div>
          <div class="kpi-value" style="font-size:22px">¥${fmt(sales)}</div>
          <div class="progress-bar" style="margin-top:8px"><div class="progress-fill" style="width:${Math.min(p2,100)}%;background:${store.color}"></div></div>
        </div>
        <div class="kpi-card" style="--accent:${store.color}">
          <div class="kpi-label">達成率</div>
          <div class="kpi-value" style="color:${p2>=100?"#3A7D44":"#C8956C"}">${p2}%</div>
        </div>
        <div class="kpi-card" style="--accent:${store.color}">
          <div class="kpi-label">スタッフ数</div>
          <div class="kpi-value">${ss.length}<span class="kpi-unit">名</span></div>
        </div>
      </div>
    `;
  }).join("");
}

function renderSalesStaff() {
  const cols = "1fr 90px 120px 120px 70px";
  return `
    <div class="filter-bar">
      <button class="filter-btn ${storeFilter===0?"active":""}" onclick="setSalesFilter(0)">全店舗</button>
      ${STORES.map(s=>`<button class="filter-btn ${storeFilter===s.id?"active":""}" onclick="setSalesFilter(${s.id})">${s.name}</button>`).join("")}
    </div>
    <div class="data-table">
      <div class="table-head" style="grid-template-columns:${cols}">
        <div>スタッフ</div><div>役職</div><div>売上</div><div>目標</div><div>達成率</div>
      </div>
      ${STAFF.filter(s=>storeFilter===0||s.storeId===storeFilter).map(s => {
        const p2 = pct(s.sales,s.target);
        const store = getStore(s.storeId);
        return `
          <div class="table-row" style="grid-template-columns:${cols}">
            <div><div class="staff-name">${s.name}</div><div class="staff-store" style="color:${store.color}">${store.name}</div></div>
            <div style="font-size:12px;color:#9B8B80">${s.role}</div>
            <div class="cell-num">¥${fmt(s.sales)}</div>
            <div class="cell-num">¥${fmt(s.target)}</div>
            <div><span class="badge ${p2>=100?"badge-green":p2>=80?"badge-yellow":"badge-red"}">${p2}%</span></div>
          </div>`;
      }).join("")}
    </div>
  `;
}

function setSalesFilter(id) {
  storeFilter = id;
  document.getElementById("sales-body").innerHTML = renderSalesBody();
}

// =====================
// 目標ページ
// =====================
function renderTargets() {
  return `
    <div style="margin-bottom:20px;padding:14px 18px;background:#fff;border-radius:10px;border:1px solid rgba(44,36,32,0.07);font-size:13px;color:#9B8B80">
      💡 「目標を更新」ボタンから各自の月次目標を入力できます。達成状況は全員に公開されます。
    </div>
    <div class="filter-bar">
      <button class="filter-btn ${storeFilter===0?"active":""}" onclick="setTargetFilter(0)">全店舗</button>
      ${STORES.map(s=>`<button class="filter-btn ${storeFilter===s.id?"active":""}" onclick="setTargetFilter(${s.id})">${s.name}</button>`).join("")}
    </div>
    <div class="target-grid" id="target-grid">
      ${renderTargetCards()}
    </div>
  `;
}

function renderTargetCards() {
  return STAFF.filter(s=>storeFilter===0||s.storeId===storeFilter).map(s => {
    const p2 = pct(s.sales, s.target);
    const store = getStore(s.storeId);
    const color = p2>=100?"#3A7D44":p2>=80?"#C8956C":"#C0392B";
    return `
      <div class="target-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div>
            <div style="font-size:14px;font-weight:500">${s.name}</div>
            <div style="font-size:11px;color:${store.color};margin-top:2px">${store.name} · ${s.role}</div>
          </div>
          <button class="save-btn" style="margin-top:0" onclick="startEditTarget(${s.id})">目標を更新</button>
        </div>
        <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px">
          <div class="target-pct" style="color:${color}">${p2}</div>
          <div style="font-size:18px;color:#9B8B80">%</div>
        </div>
        <div class="progress-bar" style="height:8px;border-radius:4px">
          <div class="progress-fill" style="width:${Math.min(p2,100)}%;background:${color};border-radius:4px"></div>
        </div>
        <div style="display:flex;gap:16px;margin-top:10px;font-size:12px;color:#9B8B80">
          <span>売上 <strong style="color:#2C2420;font-size:14px">¥${fmt(s.sales)}</strong></span>
          <span>目標 <strong style="color:#2C2420;font-size:14px">¥${fmt(s.target)}</strong></span>
          <span>残り <strong style="color:#C8956C;font-size:14px">¥${fmt(Math.max(s.target-s.sales,0))}</strong></span>
        </div>
        <div id="edit-${s.id}"></div>
      </div>`;
  }).join("");
}

function setTargetFilter(id) {
  storeFilter = id;
  document.querySelectorAll(".filter-bar .filter-btn").forEach((b,i) => {
    b.classList.toggle("active", i===0?id===0:STORES[i-1].id===id);
  });
  document.getElementById("target-grid").innerHTML = renderTargetCards();
}

function startEditTarget(staffId) {
  const el = document.getElementById(`edit-${staffId}`);
  el.innerHTML = `
    <div style="margin-top:12px;padding:12px;background:#F9F5F2;border-radius:8px">
      <div style="font-size:11px;color:#9B8B80;margin-bottom:4px">新しい目標金額（円）</div>
      <input class="input-field" id="target-input-${staffId}" placeholder="例: 500000" type="number">
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="save-btn" onclick="saveTarget(${staffId})">保存</button>
        <button class="save-btn" style="background:transparent;border:1px solid rgba(44,36,32,0.15);color:#9B8B80" onclick="cancelEdit(${staffId})">キャンセル</button>
      </div>
    </div>`;
}

function saveTarget(staffId) {
  const val = parseInt(document.getElementById(`target-input-${staffId}`).value);
  if (!isNaN(val) && val > 0) {
    const s = STAFF.find(s => s.id === staffId);
    if (s) s.target = val;
  }
  document.getElementById("target-grid").innerHTML = renderTargetCards();
}

function cancelEdit(staffId) {
  document.getElementById(`edit-${staffId}`).innerHTML = "";
}

// =====================
// シフトページ
// =====================
function renderShift() {
  return `
    <div class="tab-bar">
      <div class="tab ${shiftTab==="shift"?"active":""}" onclick="setShiftTab('shift',this)">シフト管理</div>
      <div class="tab ${shiftTab==="att"?"active":""}" onclick="setShiftTab('att',this)">勤怠管理</div>
    </div>
    <div id="shift-body">${renderShiftBody()}</div>
  `;
}

function setShiftTab(tab) {
  shiftTab = tab;
  document.querySelectorAll(".tab-bar .tab").forEach((t,i) => {
    t.classList.toggle("active", ["shift","att"][i] === tab);
  });
  document.getElementById("shift-body").innerHTML = renderShiftBody();
}

function renderShiftBody() {
  return shiftTab === "shift" ? renderShiftTable() : renderAttendance();
}

function renderShiftTable() {
  const staff = storeFilter===0 ? STAFF : STAFF.filter(s=>s.storeId===storeFilter);
  return `
    <div class="filter-bar">
      <button class="filter-btn ${storeFilter===0?"active":""}" onclick="setShiftFilter(0)">全店舗</button>
      ${STORES.map(s=>`<button class="filter-btn ${storeFilter===s.id?"active":""}" onclick="setShiftFilter(${s.id})">${s.name}</button>`).join("")}
    </div>
    <div style="display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap">
      ${[["#E8F0F8","#2C5282","出勤"],["#F0EAE4","#9B8B80","休み"],["#FEF3C7","#92400E","希望休"],["#FDEAEA","#C0392B","定休日"]].map(([bg,c,label])=>
        `<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#9B8B80">
          <div style="width:10px;height:10px;border-radius:2px;background:${bg}"></div>${label}
        </div>`).join("")}
    </div>
    <div class="shift-wrap">
      <table class="shift-table">
        <thead>
          <tr>
            <th class="staff-th">スタッフ</th>
            ${DAYS.map(d => {
              const dow = getDow(d);
              return `<th class="${dow===0?"sun":dow===6?"sat":""}"><div>${d}</div><div style="font-size:9px">${DOW[dow]}</div></th>`;
            }).join("")}
          </tr>
        </thead>
        <tbody>
          ${staff.map(s => {
            const store = getStore(s.storeId);
            return `
              <tr>
                <td class="staff-td">
                  <div style="font-size:13px;font-weight:500">${s.name}</div>
                  <div style="font-size:10px;color:${store.color}">${store.name}</div>
                </td>
                ${DAYS.map(d => {
                  const val = shifts[s.id]?.[d] || "";
                  let cls = "sc";
                  if (val==="休"||val==="") cls+=" sc-off";
                  else if (val==="希望休") cls+=" sc-req";
                  else if (getDow(d)===0) cls+=" sc-sun";
                  else cls+=" sc-work";
                  const short = val==="希望休"?"希望":val.includes(":")?val.split("-")[0]:val||"休";
                  return `<td><span class="${cls}">${short}</span></td>`;
                }).join("")}
              </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function setShiftFilter(id) {
  storeFilter = id;
  document.getElementById("shift-body").innerHTML = renderShiftBody();
}

function renderAttendance() {
  const allVals = Object.values(shifts).flatMap(Object.values);
  const workDays = allVals.filter(v=>v.includes(":")).length;
  const offDays = allVals.filter(v=>v==="休").length;
  const reqOff = allVals.filter(v=>v==="希望休").length;
  const cols = "1fr 70px 70px 70px 90px 90px";
  return `
    <div class="att-grid">
      <div class="att-card"><div class="att-label">総出勤日数</div><div class="att-value">${workDays}<span class="att-unit">日</span></div></div>
      <div class="att-card"><div class="att-label">総休日数</div><div class="att-value">${offDays}<span class="att-unit">日</span></div></div>
      <div class="att-card"><div class="att-label">希望休申請</div><div class="att-value">${reqOff}<span class="att-unit">件</span></div></div>
      <div class="att-card"><div class="att-label">スタッフ数</div><div class="att-value">12<span class="att-unit">名</span></div></div>
    </div>
    <div class="section-title">スタッフ別勤怠（3月）</div>
    <div class="data-table">
      <div class="table-head" style="grid-template-columns:${cols}">
        <div>スタッフ</div><div>出勤</div><div>休日</div><div>希望休</div><div>早番</div><div>遅番</div>
      </div>
      ${STAFF.map(s => {
        const vals = Object.values(shifts[s.id]||{});
        const work = vals.filter(v=>v.includes(":")).length;
        const off = vals.filter(v=>v==="休").length;
        const req = vals.filter(v=>v==="希望休").length;
        const early = vals.filter(v=>v==="10:00-19:00").length;
        const late = vals.filter(v=>v==="11:00-20:00").length;
        const store = getStore(s.storeId);
        return `
          <div class="table-row" style="grid-template-columns:${cols}">
            <div><div class="staff-name">${s.name}</div><div class="staff-store" style="color:${store.color}">${store.name}</div></div>
            <div class="cell-num">${work}<span style="font-size:11px;color:#9B8B80">日</span></div>
            <div class="cell-num">${off}<span style="font-size:11px;color:#9B8B80">日</span></div>
            <div class="cell-num" style="color:#92400E">${req}<span style="font-size:11px;color:#9B8B80">件</span></div>
            <div style="font-size:12px;color:#9B8B80">${early}日</div>
            <div style="font-size:12px;color:#9B8B80">${late}日</div>
          </div>`;
      }).join("")}
    </div>
  `;
}
