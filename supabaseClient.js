import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";
import {
  CalendarDays, ListChecks, BarChart3, Plus, Search, X, Pencil, Bell, AlertTriangle,
  CheckCircle2, Clock, Store, UserCheck, RotateCcw,
} from "lucide-react";
import { supabase } from "./supabaseClient";



const STORES = ["本店", "tuelu"];
const BOOKING = ["仮予約", "予約確定"];
const STATUSES = ["予定", "来店済み", "キャンセル", "無断キャンセル"];
const AGES = ["10代", "20代", "30代", "40代", "50代", "60代", "70代", "不明"];
const MENUS = ["カット", "カット+カラー", "カラー", "白髪染め", "パーマ", "縮毛矯正", "トリートメント", "ヘッドスパ", "髪質改善", "ブリーチ"];

const STATUS_COLOR = {
  "来店済み": "#3F7A5E", "予定": "#4A7BA6", "キャンセル": "#B05B47", "無断キャンセル": "#7E2E22",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.app{--ink:#2B2420;--sub:#7A6F64;--line:#E4DCCE;--paper:#F5EFE4;--card:#FFFFFF;
  --green:#34564E;--green-d:#274039;--clay:#C0795B;--gold:#B8923E;--red:#B05B47;--redbg:#FBEEE9;
  font-family:'Zen Kaku Gothic New',-apple-system,sans-serif;color:var(--ink);background:var(--paper);min-height:100vh}
.serif{font-family:'Shippori Mincho B1',serif}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px 64px}
.topbar{background:var(--green);color:#F5EFE4;padding:22px 0 18px}
.topbar .wrap{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px}
.brand{font-size:23px;font-weight:700;letter-spacing:.04em}
.brand small{display:block;font-size:11px;font-weight:400;letter-spacing:.16em;opacity:.75;margin-top:3px;font-family:'Zen Kaku Gothic New'}
.shared{font-size:11px;opacity:.8}
.tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin:0 0 18px;flex-wrap:wrap}
.tab{display:flex;align-items:center;gap:7px;padding:13px 16px;background:none;border:none;cursor:pointer;
  font-family:inherit;font-size:14px;color:var(--sub);border-bottom:2px solid transparent;margin-bottom:-1px}
.tab.on{color:var(--green);border-bottom-color:var(--clay);font-weight:700}
.tab .n{background:#EFE6D6;color:#8a5c2e;font-size:11px;padding:1px 7px;border-radius:10px;font-weight:700}
.tab .n.alert{background:#F3D8CE;color:#9c3a22}
.alertbar{display:flex;align-items:center;gap:10px;background:var(--redbg);border:1px solid #E9CFC4;
  border-radius:12px;padding:12px 16px;margin-bottom:18px;cursor:pointer}
.alertbar b{color:#9c3a22}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:13px;margin-bottom:24px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:15px 17px}
.kpi .lab{font-size:12px;color:var(--sub);display:flex;align-items:center;gap:6px}
.kpi .val{font-size:28px;font-weight:700;margin-top:6px;line-height:1;font-family:'Shippori Mincho B1'}
.kpi .sfx{font-size:11px;color:var(--sub);margin-top:4px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media(max-width:760px){.grid2{grid-template-columns:1fr}}
.panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px}
.panel h3{font-size:15px;margin-bottom:4px;font-weight:700}
.panel .desc{font-size:12px;color:var(--sub);margin-bottom:14px}
.bar2{display:flex;gap:10px;margin-top:24px}
.store-card{flex:1;border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center}
.store-card .nm{font-size:13px;color:var(--sub)}
.store-card .big{font-size:26px;font-weight:700;margin-top:4px;font-family:'Shippori Mincho B1'}
.toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
.search{flex:1;min-width:190px;display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:9px 12px}
.search input{border:none;outline:none;font-family:inherit;font-size:14px;width:100%;background:none;color:var(--ink)}
.sel{font-family:inherit;font-size:13px;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)}
.btn{font-family:inherit;font-size:14px;font-weight:700;border:none;cursor:pointer;border-radius:10px;padding:10px 16px;display:inline-flex;align-items:center;gap:7px}
.btn.primary{background:var(--green);color:#F5EFE4}.btn.primary:hover{background:var(--green-d)}
.btn.ghost{background:none;border:1px solid var(--line);color:var(--green)}
.btn.sm{padding:7px 11px;font-size:12px}
.btn.clay{background:var(--clay);color:#fff}
.list{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.row{display:grid;grid-template-columns:1fr 30px;column-gap:10px;row-gap:1px;align-items:center;padding:8px 14px;border-bottom:1px solid var(--line)}
.row:last-child{border-bottom:none}
.rmain{display:flex;align-items:center;gap:8px;min-width:0}
.rdate{font-size:12px;color:var(--sub);white-space:nowrap;font-variant-numeric:tabular-nums}
.rmain .nm{font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}
.rmain .tags{display:flex;gap:5px;flex-shrink:0}
.rsub{grid-column:1;font-size:11px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row .c-edit{grid-column:2;grid-row:1 / span 2;justify-self:end}
.urg{width:7px;height:7px;border-radius:50%;background:var(--red);display:inline-block;flex-shrink:0}
.chips{display:flex;gap:5px;flex-wrap:wrap}
.chip{font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;color:#fff;display:inline-block;white-space:nowrap}
.chip.line{background:none;border:1px solid var(--line);color:var(--sub)}
.chip.kari{background:#EFE6D6;color:#8a5c2e}
.chip.kakutei{background:#E1ECE5;color:#2f5d52}
.iconbtn{background:none;border:none;cursor:pointer;color:var(--sub);padding:6px;border-radius:8px}
.iconbtn:hover{background:#F1EADB;color:var(--green)}
.empty{padding:40px;text-align:center;color:var(--sub);font-size:14px}
@media(max-width:760px){
  .row .rsub{white-space:normal}
}
.asec{margin-bottom:20px}
.asec .ah{display:flex;align-items:center;gap:8px;font-weight:700;font-size:14px;margin-bottom:8px}
.asec .ah .badge{font-size:11px;padding:1px 8px;border-radius:10px;font-weight:700}
.arow{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid var(--line)}
.arow:last-child{border-bottom:none}
.arow .acts{display:flex;gap:7px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end}
.overlay{position:fixed;inset:0;background:rgba(40,32,26,.45);display:flex;align-items:flex-start;justify-content:center;padding:28px 16px;z-index:50;overflow:auto}
.modal{background:var(--paper);border-radius:18px;width:100%;max-width:580px;overflow:hidden}
.modal .mh{background:var(--green);color:#F5EFE4;padding:16px 22px;display:flex;justify-content:space-between;align-items:center}
.modal .mh h3{font-size:17px;font-weight:700}
.mbody{padding:22px;max-height:65vh;overflow:auto}
.field{margin-bottom:15px}
.field label{display:block;font-size:12px;color:var(--sub);margin-bottom:5px;font-weight:500}
.field input,.field select,.field textarea{width:100%;font-family:inherit;font-size:14px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);outline:none}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--green)}
.field.err input,.field.err select{border-color:var(--red);background:#FCF2EF}
.errmsg{color:var(--red);font-size:11px;margin-top:4px}
.f2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.f3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
@media(max-width:540px){.f3{grid-template-columns:1fr}}
.seg{display:flex;gap:6px}
.seg button{flex:1;font-family:inherit;font-size:13px;padding:9px;border:1px solid var(--line);background:#fff;border-radius:9px;cursor:pointer;color:var(--sub)}
.seg button.on{background:var(--green);color:#fff;border-color:var(--green);font-weight:700}
.seg.clay button.on{background:var(--clay);border-color:var(--clay)}
.toggle{display:flex;align-items:center;gap:9px;cursor:pointer;font-size:14px}
.toggle .sw{width:42px;height:24px;border-radius:14px;background:#D8CEBD;position:relative;transition:.15s}
.toggle .sw b{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.15s}
.toggle.on .sw{background:var(--green)}.toggle.on .sw b{left:21px}
.mfoot{display:flex;justify-content:flex-end;gap:10px;padding:16px 22px;border-top:1px solid var(--line)}
`;

const ymKey = (iso) => { if (!iso) return null; const [y, m] = iso.split("-"); return `${y}/${parseInt(m, 10)}`; };
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysUntil = (iso) => {
  if (!iso) return null;
  const a = new Date(todayISO() + "T00:00:00");
  const b = new Date(iso + "T00:00:00");
  return Math.round((b - a) / 86400000);
};
const fmtMD = (iso) => (iso ? iso.slice(5).replace("-", "/") : "—");
const ageToGroup = (age) => {
  const n = parseInt(age, 10);
  if (!n || n < 5) return "不明";
  if (n >= 70) return "70代";
  return `${Math.floor(n / 10) * 10}代`;
};

function BookingChip({ t }) {
  return <span className={"chip " + (t === "予約確定" ? "kakutei" : "kari")}>{t}</span>;
}
function StatusChip({ s }) {
  return <span className="chip" style={{ background: STATUS_COLOR[s] || "#999" }}>{s}</span>;
}

function Modal({ rec, staffList, onClose, onSave, onDelete }) {
  const blank = {
    name: "", bookingType: "仮予約", bookingDate: todayISO(), visitDate: "", visitTime: "",
    bookedBy: "", servedBy: "", status: "予定", nextBooked: null, nextDate: "",
    age: "", ageGroup: "不明", menu: "", remindedAfterCancel: false, store: "本店", area: "", note: "",
  };
  const [f, setF] = useState(rec ? { ...blank, ...rec } : blank);
  const [tried, setTried] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const errs = { name: !f.name.trim(), visitDate: !f.visitDate };
  const submit = () => {
    setTried(true);
    if (Object.values(errs).some(Boolean)) return;
    onSave({ ...f, ageGroup: f.age ? ageToGroup(f.age) : f.ageGroup });
  };
  const isCancel = f.status === "キャンセル" || f.status === "無断キャンセル";
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mh">
          <h3 className="serif">{rec ? "予約を編集" : "新規予約"}</h3>
          <button className="iconbtn" style={{ color: "#F5EFE4" }} onClick={onClose}><X size={20} /></button>
        </div>
        <div className="mbody">
          <div className={"field" + (tried && errs.name ? " err" : "")}>
            <label>① お名前 *</label>
            <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="山田 花子" />
            {tried && errs.name && <div className="errmsg">お名前は必須です</div>}
          </div>
          <div className="field">
            <label>② 予約区分</label>
            <div className="seg">
              {BOOKING.map((b) => (
                <button key={b} className={f.bookingType === b ? "on" : ""} onClick={() => set("bookingType", b)}>{b}</button>
              ))}
            </div>
          </div>
          <div className="f3">
            <div className="field"><label>③ 予約日</label>
              <input type="date" value={f.bookingDate || ""} onChange={(e) => set("bookingDate", e.target.value)} /></div>
            <div className={"field" + (tried && errs.visitDate ? " err" : "")}><label>③ 来店予定日 *</label>
              <input type="date" value={f.visitDate || ""} onChange={(e) => set("visitDate", e.target.value)} />
              {tried && errs.visitDate && <div className="errmsg">必須</div>}</div>
            <div className="field"><label>時間</label>
              <input type="time" value={f.visitTime || ""} onChange={(e) => set("visitTime", e.target.value)} /></div>
          </div>
          <div className="f2">
            <div className="field"><label>⑤ 予約担当(誰が取ったか)</label>
              <input list="staff" value={f.bookedBy} onChange={(e) => set("bookedBy", e.target.value)} placeholder="百田" /></div>
            <div className="field"><label>⑥ 入客担当(誰が入客したか)</label>
              <input list="staff" value={f.servedBy} onChange={(e) => set("servedBy", e.target.value)} placeholder="山本" /></div>
          </div>
          <div className="field">
            <label>⑪ 来店ステータス</label>
            <div className="seg" style={{ flexWrap: "wrap" }}>
              {STATUSES.map((s) => (
                <button key={s} className={f.status === s ? "on" : ""} onClick={() => set("status", s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="f2">
            <div className="field"><label>⑦ 次回予約</label>
              <div className="seg clay">
                <button className={f.nextBooked === true ? "on" : ""} onClick={() => set("nextBooked", true)}>取れた</button>
                <button className={f.nextBooked === false ? "on" : ""} onClick={() => set("nextBooked", false)}>取れてない</button>
                <button className={f.nextBooked === null ? "on" : ""} onClick={() => set("nextBooked", null)}>未定</button>
              </div></div>
            <div className="field"><label>⑧ 次回予約日</label>
              <input value={f.nextDate} onChange={(e) => set("nextDate", e.target.value)} placeholder="6/20 など" /></div>
          </div>
          <div className="f3">
            <div className="field"><label>⑨ 年齢</label>
              <input type="number" value={f.age} onChange={(e) => set("age", e.target.value)} placeholder="例:34" /></div>
            <div className="field"><label>⑩ メニュー</label>
              <input list="menus" value={f.menu} onChange={(e) => set("menu", e.target.value)} placeholder="カット+カラー" /></div>
            <div className="field"><label>店舗</label>
              <select value={f.store} onChange={(e) => set("store", e.target.value)}>{STORES.map((s) => <option key={s}>{s}</option>)}</select></div>
          </div>
          {isCancel && (
            <div className={"toggle" + (f.remindedAfterCancel ? " on" : "")} style={{ marginBottom: 15 }} onClick={() => set("remindedAfterCancel", !f.remindedAfterCancel)}>
              <span className="sw"><b /></span> ⑫ キャンセルの方へリマインドを送信済み
            </div>
          )}
          <div className="f2">
            <div className="field"><label>地域(任意)</label>
              <input value={f.area} onChange={(e) => set("area", e.target.value)} placeholder="大阪市北区" /></div>
            <div className="field"><label>⑬ メモ</label>
              <input value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="その他メモ" /></div>
          </div>
        </div>
        <div className="mfoot">
          {rec && <button className="btn ghost" style={{ marginRight: "auto", color: "#B05B47", borderColor: "#E3C7BC" }} onClick={() => onDelete(rec.id)}>削除</button>}
          <button className="btn ghost" onClick={onClose}>キャンセル</button>
          <button className="btn primary" onClick={submit}>保存</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("list");
  const [q, setQ] = useState("");
  const [fStore, setFStore] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fBooking, setFBooking] = useState("");
  const [editing, setEditing] = useState(undefined);

  const fetchAll = async () => {
    const { data, error } = await supabase.from("bookings").select("id,data").order("id", { ascending: false });
    if (!error && data) setRecords(data.map((r) => ({ id: r.id, ...r.data })));
    setLoaded(true);
  };
  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel("bookings-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  const upsert = async (rec) => {
    const { id, ...rest } = rec;
    await supabase.from("bookings").upsert({ id, data: rest });
  };
  const update = (id, patch) => {
    const r = records.find((x) => x.id === id); if (!r) return;
    setRecords(records.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    upsert({ ...r, ...patch });
  };
  const removeRec = async (id) => {
    setRecords(records.filter((x) => x.id !== id));
    await supabase.from("bookings").delete().eq("id", id);
  };
  const save = (f) => {
    const rec = f.id ? f : { ...f, id: Date.now() };
    setRecords((prev) => (f.id ? prev.map((r) => (r.id === f.id ? rec : r)) : [rec, ...prev]));
    upsert(rec);
    setEditing(undefined);
  };

  const staffList = useMemo(() => {
    const s = new Set();
    records.forEach((r) => { if (r.bookedBy) s.add(r.bookedBy); if (r.servedBy) s.add(r.servedBy); });
    return [...s].sort();
  }, [records]);

  // ---- alerts ----
  const alerts = useMemo(() => {
    const urgent = [], soon = [], stale = [], followup = [];
    records.forEach((r) => {
      const d = daysUntil(r.visitDate);
      if (r.status === "予定" && r.bookingType === "仮予約") {
        if (d !== null && (d === 0 || d === 1)) urgent.push(r);
        else if (d !== null && d >= 2 && d <= 4) soon.push(r);
      }
      if (r.status === "予定" && d !== null && d < 0) stale.push(r);
      if ((r.status === "キャンセル" || r.status === "無断キャンセル") && !r.remindedAfterCancel) followup.push(r);
    });
    const ord = (a, b) => (a.visitDate || "").localeCompare(b.visitDate || "");
    return { urgent: urgent.sort(ord), soon: soon.sort(ord), stale: stale.sort(ord), followup: followup.sort(ord) };
  }, [records]);
  const alertTotal = alerts.urgent.length + alerts.soon.length + alerts.stale.length + alerts.followup.length;

  const m = useMemo(() => {
    const total = records.length;
    const visited = records.filter((r) => r.status === "来店済み").length;
    const cancelled = records.filter((r) => r.status === "キャンセル").length;
    const noShow = records.filter((r) => r.status === "無断キャンセル").length;
    const decided = visited + cancelled + noShow;
    const cancelRate = decided ? Math.round(((cancelled + noShow) / decided) * 100) : 0;
    const nextRate = visited ? Math.round((records.filter((r) => r.status === "来店済み" && r.nextBooked === true).length / visited) * 100) : 0;
    const kari = records.filter((r) => r.bookingType === "仮予約").length;

    const bm = {}; records.forEach((r) => { if (r.status === "キャンセル" || r.status === "無断キャンセル") return; const k = ymKey(r.visitDate); if (k) bm[k] = (bm[k] || 0) + 1; });
    const monthData = Object.entries(bm).sort((a, b) => new Date(a[0].replace("/", "/1/")) - new Date(b[0].replace("/", "/1/"))).map(([k, v]) => ({ name: k.split("/")[1] + "月", v }));
    const bs = {}; records.forEach((r) => { if (r.status === "来店済み" && r.servedBy) bs[r.servedBy] = (bs[r.servedBy] || 0) + 1; });
    const staffData = Object.entries(bs).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ name: k, v }));
    const ba = {}; AGES.forEach((a) => (ba[a] = 0)); records.forEach((r) => (ba[r.ageGroup] = (ba[r.ageGroup] || 0) + 1));
    const ageData = AGES.filter((a) => ba[a]).map((a) => ({ name: a, v: ba[a] }));
    const store = {}; STORES.forEach((s) => (store[s] = records.filter((r) => r.store === s).length));
    return { total, visited, cancelled, noShow, cancelRate, nextRate, kari, monthData, staffData, ageData, store };
  }, [records]);

  const filtered = useMemo(() => records.filter((r) => {
    if (q && !(`${r.name}${r.area}${r.servedBy}${r.bookedBy}${r.menu}${r.note}`.includes(q))) return false;
    if (fStore && r.store !== fStore) return false;
    if (fStatus && r.status !== fStatus) return false;
    if (fBooking && r.bookingType !== fBooking) return false;
    return true;
  }).sort((a, b) => (b.visitDate || "").localeCompare(a.visitDate || "")), [records, q, fStore, fStatus, fBooking]);

  const isUrgent = (r) => alerts.urgent.includes(r);

  if (!loaded) return <div className="app"><div className="wrap" style={{ paddingTop: 40 }}>読み込み中…</div></div>;

  const AlertSection = ({ icon, color, title, items, hint, action }) => items.length > 0 && (
    <div className="asec">
      <div className="ah">{icon}<span>{title}</span><span className="badge" style={{ background: color + "22", color }}>{items.length}件</span></div>
      <div className="list">
        {items.map((r) => (
          <div className="arow" key={r.id}>
            <div>
              <div className="nm" style={{ fontWeight: 700, fontSize: 14 }}>{r.name}
                <span style={{ color: "var(--sub)", fontWeight: 400, fontSize: 12 }}> ／ 来店予定 {fmtMD(r.visitDate)}{r.visitTime ? " " + r.visitTime : ""}・{r.store}</span></div>
              <div style={{ fontSize: 12, color: "var(--sub)", marginTop: 3 }}>{hint(r)}</div>
            </div>
            <div className="acts">
              {action && action(r)}
              <button className="btn ghost sm" onClick={() => setEditing(r)}><Pencil size={13} /> 編集</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="app">
      <style>{CSS}</style>
      <datalist id="staff">{staffList.map((s) => <option key={s} value={s} />)}</datalist>
      <datalist id="menus">{MENUS.map((s) => <option key={s} value={s} />)}</datalist>

      <div className="topbar"><div className="wrap">
        <div className="brand serif">予約管理<small>LP CUSTOMER &amp; BOOKING MANAGER</small></div>
        <button className="btn ghost" style={{ borderColor: "rgba(245,239,228,.4)", color: "#F5EFE4", padding: "7px 12px", fontSize: 12 }} onClick={() => supabase.auth.signOut()}>ログアウト</button>
      </div></div>

      <div className="wrap">
        <div className="tabs">
          <button className={"tab" + (tab === "list" ? " on" : "")} onClick={() => setTab("list")}><ListChecks size={17} /> 予約一覧 <span className="n">{records.length}</span></button>
          <button className={"tab" + (tab === "alert" ? " on" : "")} onClick={() => setTab("alert")}><Bell size={17} /> アラート {alertTotal > 0 && <span className="n alert">{alertTotal}</span>}</button>
          <button className={"tab" + (tab === "dash" ? " on" : "")} onClick={() => setTab("dash")}><BarChart3 size={17} /> 集計</button>
        </div>

        {tab !== "alert" && alerts.urgent.length > 0 && (
          <div className="alertbar" onClick={() => setTab("alert")}>
            <AlertTriangle size={18} color="#9c3a22" />
            <div><b>{alerts.urgent.length}件</b> 来店予定が明日(または今日)なのに仮予約のままです。タップして確認 →</div>
          </div>
        )}

        {tab === "list" && (
          <>
            <div className="toolbar">
              <div className="search"><Search size={16} color="#7A6F64" />
                <input placeholder="名前・担当・メニュー・メモで検索" value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <select className="sel" value={fBooking} onChange={(e) => setFBooking(e.target.value)}><option value="">区分：すべて</option>{BOOKING.map((s) => <option key={s}>{s}</option>)}</select>
              <select className="sel" value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="">状態：すべて</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
              <select className="sel" value={fStore} onChange={(e) => setFStore(e.target.value)}><option value="">店舗：すべて</option>{STORES.map((s) => <option key={s}>{s}</option>)}</select>
              <button className="btn primary" onClick={() => setEditing(null)}><Plus size={16} /> 新規追加</button>
            </div>
            <div className="list">
              {filtered.length === 0 && <div className="empty">該当する予約がありません</div>}
              {filtered.map((r) => (
                <div className="row" key={r.id}>
                  <div className="rmain">
                    {isUrgent(r) && <span className="urg" title="明日来店・仮予約" />}
                    <span className="rdate">{fmtMD(r.visitDate)}{r.visitTime ? ` ${r.visitTime}` : ""}</span>
                    <span className="nm">{r.name}</span>
                    <span className="tags"><BookingChip t={r.bookingType} /><StatusChip s={r.status} /></span>
                  </div>
                  <div className="rsub">{[r.menu, r.age ? r.age + "歳" : (r.ageGroup !== "不明" ? r.ageGroup : ""), r.servedBy || r.bookedBy, r.store].filter(Boolean).join(" ・ ") || "—"}</div>
                  <div className="c-edit"><button className="iconbtn" onClick={() => setEditing(r)}><Pencil size={15} /></button></div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "alert" && (
          <>
            {alertTotal === 0 && <div className="list"><div className="empty">対応が必要な予約はありません 🎉</div></div>}
            <AlertSection icon={<AlertTriangle size={17} color="#B05B47" />} color="#B05B47"
              title="最優先：来店が明日/今日なのに仮予約のまま" items={alerts.urgent}
              hint={(r) => `来店予定 ${fmtMD(r.visitDate)}（${daysUntil(r.visitDate) === 0 ? "本日" : "明日"}）/ 仮予約 ・ 予約担当 ${r.bookedBy || "未入力"}`}
              action={(r) => <button className="btn primary sm" onClick={() => update(r.id, { bookingType: "予約確定" })}><CheckCircle2 size={13} /> 確定にする</button>} />
            <AlertSection icon={<Clock size={17} color="#B8923E" />} color="#B8923E"
              title="近日（数日以内）で仮予約" items={alerts.soon}
              hint={(r) => `来店予定 ${fmtMD(r.visitDate)}（${daysUntil(r.visitDate)}日後）/ 仮予約`}
              action={(r) => <button className="btn ghost sm" onClick={() => update(r.id, { bookingType: "予約確定" })}>確定にする</button>} />
            <AlertSection icon={<RotateCcw size={17} color="#4A7BA6" />} color="#4A7BA6"
              title="来店予定日を過ぎたまま「予定」：結果を入力" items={alerts.stale}
              hint={(r) => `来店予定 ${fmtMD(r.visitDate)} は過ぎています。来店結果を入れてください`}
              action={(r) => <button className="btn clay sm" onClick={() => update(r.id, { status: "来店済み" })}>来店済みに</button>} />
            <AlertSection icon={<Bell size={17} color="#7E2E22" />} color="#7E2E22"
              title="キャンセル/無断キャンセルでリマインド未送信" items={alerts.followup}
              hint={(r) => `${r.status} ・ ${fmtMD(r.visitDate)} ・ まだリマインド未送信`}
              action={(r) => <button className="btn primary sm" onClick={() => update(r.id, { remindedAfterCancel: true })}>送信済みにする</button>} />
          </>
        )}

        {tab === "dash" && (
          <>
            <div className="kpis">
              <div className="kpi"><div className="lab"><CalendarDays size={14} />総予約</div><div className="val">{m.total}</div></div>
              <div className="kpi"><div className="lab"><CheckCircle2 size={14} />来店済み</div><div className="val" style={{ color: "#3F7A5E" }}>{m.visited}</div></div>
              <div className="kpi"><div className="lab"><X size={14} />キャンセル率</div><div className="val" style={{ color: "#B05B47" }}>{m.cancelRate}%</div><div className="sfx">無断{m.noShow}件含む</div></div>
              <div className="kpi"><div className="lab"><UserCheck size={14} />次回予約率</div><div className="val" style={{ color: "#34564E" }}>{m.nextRate}%</div><div className="sfx">来店者のうち</div></div>
              <div className="kpi"><div className="lab"><Clock size={14} />仮予約のまま</div><div className="val" style={{ color: "#B8923E" }}>{m.kari}</div></div>
            </div>
            <div className="grid2" style={{ marginBottom: 18 }}>
              <div className="panel"><h3 className="serif">月別の来店数</h3><p className="desc">キャンセル除き。来店予定日ベースで自動集計。</p>
                <ResponsiveContainer width="100%" height={210}><BarChart data={m.monthData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEE6D6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7A6F64" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#7A6F64" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "#F1EADB" }} /><Bar dataKey="v" fill="#34564E" radius={[5, 5, 0, 0]} name="来店" />
                </BarChart></ResponsiveContainer></div>
              <div className="panel"><h3 className="serif">店舗別</h3><p className="desc">本店 / tuelu の内訳。</p>
                <div className="bar2">{STORES.map((s, i) => (
                  <div className="store-card" key={s}><div className="nm"><Store size={13} style={{ verticalAlign: -2 }} /> {s}</div>
                    <div className="big" style={{ color: i === 0 ? "#34564E" : "#C0795B" }}>{m.store[s]}</div></div>))}</div></div>
            </div>
            <div className="grid2">
              <div className="panel"><h3 className="serif">入客担当別の件数</h3><p className="desc">来店済みベース。負荷の偏りを把握。</p>
                <ResponsiveContainer width="100%" height={Math.max(170, m.staffData.length * 30)}><BarChart data={m.staffData} layout="vertical" margin={{ top: 0, right: 16, left: 6, bottom: 0 }}>
                  <XAxis type="number" hide allowDecimals={false} /><YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 12, fill: "#2B2420" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#F1EADB" }} /><Bar dataKey="v" fill="#C0795B" radius={[0, 5, 5, 0]} name="入客">
                    {m.staffData.map((_, i) => <Cell key={i} fill={i === 0 ? "#34564E" : "#C0795B"} />)}</Bar>
                </BarChart></ResponsiveContainer></div>
              <div className="panel"><h3 className="serif">年代の分布</h3><p className="desc">LP集客の客層把握に。</p>
                <ResponsiveContainer width="100%" height={210}><BarChart data={m.ageData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEE6D6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7A6F64" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#7A6F64" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "#F1EADB" }} /><Bar dataKey="v" fill="#B8923E" radius={[5, 5, 0, 0]} name="人数" />
                </BarChart></ResponsiveContainer></div>
            </div>
          </>
        )}
      </div>

      {editing !== undefined && <Modal rec={editing} staffList={staffList} onClose={() => setEditing(undefined)} onSave={save} onDelete={(id) => { if (window.confirm("この予約を削除しますか？")) { removeRec(id); setEditing(undefined); } }} />}
    </div>
  );
}
