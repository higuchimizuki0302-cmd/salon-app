const STORES = [
  { id:"honten", name:"Hair 本店", color:"#7B61FF", bg:"#F3F0FF" },
  { id:"tuelu",  name:"tuelu",    color:"#5B8DEF", bg:"#EFF4FF" },
  { id:"nail",   name:"Nail",     color:"#E8537A", bg:"#FFF0F4" },
  { id:"eye",    name:"Eye",      color:"#3BAED4", bg:"#EFF9FF" },
  { id:"esthe",  name:"Esthe",    color:"#3DBD8A", bg:"#EDFBF4" },
];

const STAFF = [
  { id:1,  pin:"2",  name:"百田 沙弥香", store:"honten", av:"百" },
  { id:2,  pin:"8",  name:"箕浦 黎也",   store:"honten", av:"箕" },
  { id:3,  pin:"3",  name:"森永 久美",   store:"honten", av:"森" },
  { id:4,  pin:"9",  name:"辻 貴音",     store:"honten", av:"辻" },
  { id:5,  pin:"13", name:"秋山 裕香",   store:"honten", av:"秋" },
  { id:6,  pin:"1",  name:"富永 隆幸",   store:"honten", av:"富" },
  { id:7,  pin:"7",  name:"松原 彰大",   store:"tuelu",  av:"松" },
  { id:8,  pin:"21", name:"阿比倉 梨恵", store:"honten", av:"阿" },
  { id:9,  pin:"4",  name:"濱岡 恭子",   store:"tuelu",  av:"濱" },
  { id:10, pin:"11", name:"佐藤 翔太",   store:"tuelu",  av:"佐" },
  { id:11, pin:"12", name:"野本 晴香",   store:"tuelu",  av:"野" },
  { id:12, pin:"14", name:"河原 澄真",   store:"tuelu",  av:"河" },
  { id:13, pin:"15", name:"末永 咲希",   store:"tuelu",  av:"末" },
  { id:14, pin:"5",  name:"樋口 瑞貴",   store:"tuelu",  av:"樋" },
  { id:15, pin:"18", name:"家門 麻理奈", store:"nail",   av:"家" },
  { id:16, pin:"19", name:"大中 瑞希",   store:"nail",   av:"大" },
  { id:17, pin:"20", name:"大西 あかね", store:"nail",   av:"西" },
  { id:18, pin:"6",  name:"沖原 菜都美", store:"nail",   av:"沖" },
  { id:19, pin:"23", name:"梅原 美琳",   store:"eye",    av:"梅" },
  { id:20, pin:"17", name:"高橋 ミク",   store:"eye",    av:"高" },
  { id:21, pin:"28", name:"富永 幸生",   store:"esthe",  av:"富" },
  { id:22, pin:"50", name:"瀬口 加奈",   store:"honten", av:"瀬" },
];

const fmt = n => n > 0 ? "¥" + Number(n).toLocaleString() : "¥0";
const getStore = id => STORES.find(s => s.id === id);
const DOW = ["日","月","火","水","木","金","土"];
const today = new Date();
const todayStr = `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日（${DOW[today.getDay()]}）`;

const STORAGE_SALES = 'diptyMOILA_sales';
const STORAGE_DAILY = 'diptyMOILA_daily';

const defaultSales = () => {
  const d = {};
  STAFF.forEach(s => { d[s.pin] = { total:0, gijutsu:0, shohin:0, shinki:0, rairai:0, kotei:0, target:500000 }; });
  return d;
};

const loadSales = () => {
  try { const s = localStorage.getItem(STORAGE_SALES); if(s) return JSON.parse(s); } catch(e){}
  return defaultSales();
};
const saveSales = d => { try { localStorage.setItem(STORAGE_SALES, JSON.stringify(d)); } catch(e){} };

const loadDaily = () => {
  try { const s = localStorage.getItem(STORAGE_DAILY); if(s) return JSON.parse(s); } catch(e){}
  return genDailyDefault();
};
const saveDaily = d => { try { localStorage.setItem(STORAGE_DAILY, JSON.stringify(d)); } catch(e){} };

const genDailyDefault = () => {
  const d = {};
  STAFF.forEach(s => {
    d[s.pin] = { instaTarget:20, instaCurrent:0, remaining:0, newClients:0,
      hotpepper:0, instagram:0, referral:0, lp:0,
      nextShinki_in:0, nextShinki_out:0, nextRairai_in:0, nextRairai_out:0,
      nextKotei_in:0, nextKotei_out:0, shop_in:0, shop_out:0, saved:false };
  });
  return d;
};

const parseCSVData = (text) => {
  const lines = text.split('\n');
  const newData = defaultSales();
  let currentPin = null;
  let qtyRow = null;

  lines.forEach(line => {
    const cols = line.split('\t');
    const col1 = cols[1]?.trim() || '';
    const col2 = cols[2]?.trim() || '';
    const col4 = cols[4]?.trim() || '';
    const col5 = cols[5]?.trim() || '';

    if (col1 && /^\d+$/.test(col2)) {
      currentPin = col2;
    } else if (col1 && !col2) {
      const found = STAFF.find(s => s.name.replace(/\s/g,'') === col1.replace(/\s/g,'') || col1.includes(s.name.split(' ')[0]));
      if (found) currentPin = found.pin;
    }

    if (currentPin && col4 === '数量' && col5 === '実績') {
      qtyRow = cols;
    }
    if (currentPin && col4 === '金額' && col5 === '実績' && newData[currentPin]) {
      const n = i => parseInt((cols[i]||'').replace(/[,\s]/g,'')) || 0;
      newData[currentPin].total   = n(6);
      newData[currentPin].gijutsu = n(7) + n(9);
      newData[currentPin].shohin  = n(8) + n(10);
      if (qtyRow) {
        const q = i => parseInt((qtyRow[i]||'').replace(/[,\s]/g,'')) || 0;
        newData[currentPin].shinki = q(13);
        newData[currentPin].rairai = q(14);
        newData[currentPin].kotei  = q(15);
      }
      // targetは既存を維持
      const existing = loadSales();
      if (existing[currentPin]?.target) newData[currentPin].target = existing[currentPin].target;
      currentPin = null;
      qtyRow = null;
    }
  });
  return newData;
};

let SALES_DATA = loadSales();
let dailyData = loadDaily();
let currentUser = null;
let currentTab = 'daily';
let currentStore = null;
let currentStaffPin = null;

function el(tag, props, ...children) {
  const e = document.createElement(tag);
  if (props) Object.entries(props).forEach(([k, v]) => {
    if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k === 'onclick') e.onclick = v;
    else if (k === 'onchange') e.onchange = v;
    else e[k] = v;
  });
  children.flat().forEach(c => c && e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
}

function render() {
  const root = document.getElementById('root');
  root.innerHTML = '';
  root.appendChild(currentUser ? renderApp() : renderLogin());
}

function renderLogin() {
  let pinInput = '';
  const wrap = el('div', { style: { minHeight:'100vh', background:'#1A1A2E', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }});
  const box = el('div', { style: { background:'#fff', borderRadius:'20px', padding:'40px 32px', width:'100%', maxWidth:'340px', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }});
  box.appendChild(el('div', { style: { fontFamily:'"DM Serif Display",serif', fontSize:'32px', textAlign:'center', letterSpacing:'0.08em' }}, 'dipty', el('em', { style: { color:'#7B61FF' }}, 'MOILA')));
  box.appendChild(el('div', { style: { fontSize:'11px', color:'#A0A0B0', textAlign:'center', letterSpacing:'0.15em' }}, '南船場グループ 管理システム'));
  const display = el('div', { style: { fontSize:'36px', fontFamily:'"DM Serif Display",serif', letterSpacing:'0.4em', color:'#1A1A2E', minHeight:'56px', textAlign:'center', width:'100%', padding:'12px', background:'#F7F7F9', borderRadius:'12px', border:'1.5px solid #EBEBEF' }}, '—');
  const errMsg = el('div', { style: { fontSize:'12px', color:'#E8537A', minHeight:'18px', textAlign:'center' }}, '');
  box.appendChild(display);
  box.appendChild(errMsg);
  const keypad = el('div', { style: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', width:'100%' }});
  ['1','2','3','4','5','6','7','8','9','','0','⌫'].forEach(k => {
    if (!k) { keypad.appendChild(el('div',{})); return; }
    keypad.appendChild(el('button', {
      style: { padding:'18px', fontSize:'22px', fontFamily:'"DM Serif Display",serif', border:'1.5px solid #EBEBEF', borderRadius:'12px', background:'#fff', cursor:'pointer', color:'#1A1A2E' },
      onclick: () => {
        if (k==='⌫') pinInput = pinInput.slice(0,-1);
        else if (pinInput.length < 4) pinInput += k;
        display.textContent = pinInput.length > 0 ? '●'.repeat(pinInput.length) : '—';
        errMsg.textContent = '';
      }
    }, k));
  });
  box.appendChild(keypad);
  box.appendChild(el('button', {
    style: { width:'100%', padding:'14px', background:'#7B61FF', color:'#fff', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor:'pointer' },
    onclick: () => {
      const found = STAFF.find(s => s.pin === pinInput);
      if (found) { currentUser = found; render(); }
      else { errMsg.textContent = 'IDが正しくありません'; pinInput = ''; display.textContent = '—'; }
    }
  }, 'ログイン'));
  wrap.appendChild(box);
  return wrap;
}

function renderApp() {
  const st = getStore(currentUser.store);
  const TABS = [
    {key:'daily',icon:'✏️',label:'日報'},
    {key:'sales',icon:'📊',label:'売上'},
    {key:'analytics',icon:'📈',label:'分析'},
    {key:'shift',icon:'📅',label:'シフト'},
    {key:'profile',icon:'👤',label:'マイページ'},
  ];
  const titles = {daily:'日報',sales:'売上',analytics:'スタッフ分析',shift:'シフト管理',profile:'マイページ'};
  const content = el('div', { style: { flex:'1', padding:'16px 16px 80px', overflowY:'auto' }});
  content.appendChild(el('div', { style: { fontFamily:'"DM Serif Display",serif', fontSize:'22px', color:'#1A1A2E', marginBottom:'16px' }}, titles[currentTab]));
  if (currentTab==='daily') content.appendChild(renderDaily());
  else if (currentTab==='sales') content.appendChild(renderSales());
  else if (currentTab==='analytics') content.appendChild(renderAnalytics());
  else if (currentTab==='shift') content.appendChild(renderShift());
  else if (currentTab==='profile') content.appendChild(renderProfile());
  const nav = el('nav', { style: { display:'flex', background:'#fff', borderTop:'1px solid #EBEBEF', position:'fixed', bottom:'0', left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'430px', zIndex:'100' }});
  TABS.forEach(t => nav.appendChild(el('button', {
    style: { flex:'1', padding:'10px 2px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', cursor:'pointer', border:'none', background:'none', color:currentTab===t.key?'#7B61FF':'#A0A0B0', fontSize:'7.5px', borderTop:`2.5px solid ${currentTab===t.key?'#7B61FF':'transparent'}` },
    onclick: () => { currentTab=t.key; currentStore=null; currentStaffPin=null; render(); }
  }, el('span',{style:{fontSize:'18px'}},t.icon), t.label)));
  return el('div', { style: { display:'flex', flexDirection:'column', minHeight:'100vh', maxWidth:'430px', margin:'0 auto', background:'#F7F7F9' }},
    el('div', { style: { padding:'16px 20px 12px', background:'#fff', borderBottom:'1px solid #EBEBEF', position:'sticky', top:'0', zIndex:'100' }},
      el('div', { style: { display:'flex', alignItems:'center', justifyContent:'space-between' }},
        el('div', {},
          el('div', { style: { fontFamily:'"DM Serif Display",serif', fontSize:'20px', letterSpacing:'0.08em' }}, 'dipty', el('em', { style: { color:'#7B61FF' }}, 'MOILA')),
          el('div', { style: { fontSize:'11px', color:'#A0A0B0', marginTop:'2px' }}, todayStr)
        ),
        el('div', { style: { display:'flex', alignItems:'center', gap:'8px' }},
          el('div', { style: { width:'32px', height:'32px', borderRadius:'50%', background:st.color+'22', border:`1.5px solid ${st.color}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:st.color }}, currentUser.av),
          el('button', { style: { width:'36px', height:'36px', border:'1.5px solid #EBEBEF', borderRadius:'50%', background:'#fff', cursor:'pointer', fontSize:'14px' }, onclick: () => { currentUser=null; render(); }}, '🚪')
        )
      )
    ),
    content, nav
  );
}

function card(children, style={}) {
  return el('div', { style: { background:'#fff', border:'1px solid #EBEBEF', borderRadius:'16px', padding:'18px', marginBottom:'12px', ...style }}, ...children);
}

function storeGrid(onClick, badge) {
  return el('div', { style: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }},
    ...STORES.map(s => {
      const members = STAFF.filter(m => m.store === s.id);
      return el('div', { style: { background:'#fff', border:`2px solid ${s.color}33`, borderRadius:'16px', padding:'24px 16px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }, onclick: () => onClick(s.id) },
        el('div', { style: { fontSize:'16px', fontWeight:'700', color:s.color }}, s.name),
        el('div', { style: { fontSize:'10px', color:'#6B6B80' }}, badge ? badge(s, members) : `${members.length}名`)
      );
    })
  );
}

function breadcrumb(items) {
  const wrap = el('div', { style: { display:'flex', alignItems:'center', gap:'6px', marginBottom:'16px', flexWrap:'wrap' }});
  items.forEach((item, i) => {
    if (i>0) wrap.appendChild(el('span', { style: { color:'#A0A0B0', fontSize:'14px' }}, '›'));
    if (item.onClick) wrap.appendChild(el('button', { style: { padding:'5px 12px', borderRadius:'20px', border:'1.5px solid #EBEBEF', background:'#fff', cursor:'pointer', fontSize:'12px', fontWeight:'500', color:'#6B6B80' }, onclick: item.onClick }, item.label));
    else wrap.appendChild(el('span', { style: { fontSize:'12px', fontWeight:'700', color:'#1A1A2E' }}, item.label));
  });
  return wrap;
}

function stepper(val, onChange) {
  const display = el('div', { style: { width:'52px', height:'36px', border:'1.5px solid #EBEBEF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', background:'#fff' }}, String(val));
  return el('div', { style: { display:'flex', alignItems:'center' }},
    el('button', { style: { width:'36px', height:'36px', border:'1.5px solid #EBEBEF', borderRight:'none', borderRadius:'10px 0 0 10px', background:'#F7F7F9', color:'#7B61FF', fontSize:'20px', cursor:'pointer' }, onclick: () => { val=Math.max(0,val-1); display.textContent=val; onChange(val); }}, '−'),
    display,
    el('button', { style: { width:'36px', height:'36px', border:'1.5px solid #EBEBEF', borderLeft:'none', borderRadius:'0 10px 10px 0', background:'#F7F7F9', color:'#7B61FF', fontSize:'20px', cursor:'pointer' }, onclick: () => { val=val+1; display.textContent=val; onChange(val); }}, '＋')
  );
}

function renderDaily() {
  const wrap = el('div',{});
  if (currentStaffPin) {
    const member = STAFF.find(s => s.pin === currentStaffPin);
    const st = getStore(member.store);
    const d = dailyData[currentStaffPin] || genDailyDefault()[currentStaffPin];
    wrap.appendChild(breadcrumb([
      {label:'← 店舗', onClick:()=>{currentStore=null;currentStaffPin=null;render();}},
      {label:st.name, onClick:()=>{currentStaffPin=null;render();}},
      {label:member.name.split(' ')[0]}
    ]));
    const instaPct = Math.min(100, d.instaTarget>0?Math.round(d.instaCurrent/d.instaTarget*100):0);
    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'14px',paddingBottom:'10px',borderBottom:'1.5px solid #EBEBEF'}},'📸 インスタ投稿数'),
      el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}},
        el('div',{},el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'6px'}},'今月の目標'),stepper(d.instaTarget,v=>{d.instaTarget=v;})),
        el('div',{},el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'6px'}},'現在の投稿数'),stepper(d.instaCurrent,v=>{d.instaCurrent=v;}))
      ),
      el('div',{style:{height:'8px',background:'#F7F7F9',borderRadius:'4px',overflow:'hidden'}},
        el('div',{style:{height:'100%',width:`${instaPct}%`,background:'linear-gradient(90deg,#7B61FF,#E8537A)',borderRadius:'4px'}})
      ),
      el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'6px',textAlign:'right'}},`${d.instaCurrent}/${d.instaTarget}件 — ${instaPct}%`)
    ]));
    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'14px',paddingBottom:'10px',borderBottom:'1.5px solid #EBEBEF'}},'📅 予約・新規'),
      ...['残りの予約件数:remaining','新規のお客様数:newClients'].map(s=>{
        const [label,field]=s.split(':');
        return el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}},
          el('div',{style:{fontSize:'13px'}},label), stepper(d[field],v=>{d[field]=v;})
        );
      })
    ]));
    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'14px',paddingBottom:'10px',borderBottom:'1.5px solid #EBEBEF'}},'🔀 新規 流入経路'),
      el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}},
        ...['🌶️ ホットペッパー:hotpepper','📸 インスタ:instagram','🤝 紹介:referral','🔗 LP:lp'].map(s=>{
          const [label,field]=s.split(':');
          return el('div',{style:{background:'#F7F7F9',border:'1px solid #EBEBEF',borderRadius:'12px',padding:'12px'}},
            el('div',{style:{fontSize:'11px',color:'#6B6B80',marginBottom:'8px'}},label),
            stepper(d[field],v=>{d[field]=v;})
          );
        })
      )
    ]));
    wrap.appendChild(el('button',{
      style:{width:'100%',padding:'15px',border:'none',borderRadius:'14px',background:st.color,color:'#fff',fontSize:'14px',fontWeight:'700',cursor:'pointer'},
      onclick:()=>{ d.saved=true; dailyData[currentStaffPin]=d; saveDaily(dailyData); currentStaffPin=null; render(); }
    },'入力を保存する'));
    return wrap;
  }
  if (currentStore) {
    const st = getStore(currentStore);
    const members = STAFF.filter(s=>s.store===currentStore);
    wrap.appendChild(breadcrumb([{label:'← 店舗',onClick:()=>{currentStore=null;render();}},{label:st.name}]));
    const grid = el('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}});
    members.forEach(m=>{
      const d = dailyData[m.pin] || {};
      grid.appendChild(el('div',{
        style:{background:'#fff',border:`2px solid ${d.saved?st.color+'55':'#EBEBEF'}`,borderRadius:'14px',padding:'14px 8px',cursor:'pointer',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'},
        onclick:()=>{currentStaffPin=m.pin;render();}
      },
        el('div',{style:{width:'44px',height:'44px',borderRadius:'50%',background:(d.saved?st.color:'#ccc')+'22',border:`1.5px solid ${d.saved?st.color:'#ccc'}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'700',color:d.saved?st.color:'#ccc'}},m.av),
        el('div',{style:{fontSize:'11px',fontWeight:'500',lineHeight:'1.4'}},m.name),
        el('div',{style:{fontSize:'9px',color:d.saved?'#3DBD8A':'#F5A623',fontWeight:'600'}},d.saved?'入力済':'未入力')
      ));
    });
    wrap.appendChild(grid);
    return wrap;
  }
  wrap.appendChild(storeGrid(id=>{currentStore=id;render();},(s,members)=>{
    const n=members.filter(m=>dailyData[m.pin]?.saved).length;
    return `${n}/${members.length}名 入力済`;
  }));
  return wrap;
}

function renderSales() {
  const wrap = el('div',{});

  // オーナー/マネージャーのみCSVアップロード表示
  if (currentUser.pin === '1' || currentUser.pin === '50') {
    const csvSection = card([
      el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px',paddingBottom:'10px',borderBottom:'1.5px solid #EBEBEF'}},'📂 POSデータ取り込み'),
      el('div',{style:{fontSize:'12px',color:'#A0A0B0',marginBottom:'10px'}},'POSシステムのCSVデータを貼り付けてください'),
      el('textarea',{
        style:{width:'100%',height:'120px',padding:'10px',border:'1.5px solid #EBEBEF',borderRadius:'10px',fontSize:'11px',resize:'vertical',fontFamily:'monospace'},
        placeholder:'ここにCSVデータを貼り付け...',
        id:'csv-input'
      }),
      el('button',{
        style:{width:'100%',padding:'12px',background:'#7B61FF',color:'#fff',border:'none',borderRadius:'10px',fontSize:'13px',fontWeight:'700',cursor:'pointer',marginTop:'8px'},
        onclick:()=>{
          const text = document.getElementById('csv-input').value;
          if (!text.trim()) return;
          const newData = parseCSVData(text);
          SALES_DATA = newData;
          saveSales(newData);
          document.getElementById('csv-input').value = '';
          alert('✓ データを取り込みました！');
          render();
        }
      },'取り込む')
    ]);
    wrap.appendChild(csvSection);
  }

  if (currentStaffPin) {
    const member = STAFF.find(s=>s.pin===currentStaffPin);
    const st = getStore(member.store);
    const d = SALES_DATA[currentStaffPin] || {total:0,gijutsu:0,shohin:0,shinki:0,rairai:0,kotei:0,target:500000};
    const clientTotal = d.shinki+d.rairai+d.kotei;
    const pct = d.target>0?Math.round(d.total/d.target*100):0;
    wrap.appendChild(breadcrumb([
      {label:'← 店舗',onClick:()=>{currentStore=null;currentStaffPin=null;render();}},
      {label:st.name,onClick:()=>{currentStaffPin=null;render();}},
      {label:member.name.split(' ')[0]}
    ]));
    wrap.appendChild(el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'12px'}},
      el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'14px',padding:'16px',textAlign:'center'}},
        el('div',{style:{fontSize:'10px',color:'#A0A0B0',marginBottom:'4px'}},'月次売上'),
        el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'22px',color:st.color}},fmt(d.total))
      ),
      el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'14px',padding:'16px',textAlign:'center'}},
        el('div',{style:{fontSize:'10px',color:'#A0A0B0',marginBottom:'4px'}},'達成率'),
        el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'22px',color:pct>=100?'#3DBD8A':'#F5A623'}},`${pct}%`)
      )
    ));
    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'8px'}},'目標達成率'),
      el('div',{style:{height:'10px',background:'#F7F7F9',borderRadius:'5px',overflow:'hidden'}},
        el('div',{style:{height:'100%',width:`${Math.min(pct,100)}%`,background:pct>=100?'#3DBD8A':st.color,borderRadius:'5px'}})
      ),
      el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'6px'}},`目標 ${fmt(d.target)}`)
    ]));
    if (clientTotal > 0) {
      wrap.appendChild(card([
        el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'12px'}},'客数内訳'),
        ...[{label:'新規',val:d.shinki,color:'#E8537A'},{label:'再来',val:d.rairai,color:'#F5A623'},{label:'固定',val:d.kotei,color:'#7B61FF'}].map(item=>{
          const p=clientTotal>0?Math.round(item.val/clientTotal*100):0;
          return el('div',{style:{marginBottom:'12px'}},
            el('div',{style:{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'5px'}},
              el('span',{style:{fontWeight:'600',color:item.color}},item.label),
              el('span',{style:{color:'#A0A0B0'}},`${item.val}名 (${p}%)`)
            ),
            el('div',{style:{height:'8px',background:'#F7F7F9',borderRadius:'4px',overflow:'hidden'}},
              el('div',{style:{height:'100%',width:`${p}%`,background:item.color,borderRadius:'4px'}})
            )
          );
        })
      ]));
    }
    return wrap;
  }

  if (currentStore) {
    const st = getStore(currentStore);
    const members = STAFF.filter(s=>s.store===currentStore);
    wrap.appendChild(breadcrumb([{label:'← 店舗',onClick:()=>{currentStore=null;render();}},{label:st.name}]));
    const list = el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'16px',overflow:'hidden'}});
    members.forEach(m=>{
      const d=SALES_DATA[m.pin]||{total:0,target:500000};
      const p=d.target>0?Math.round(d.total/d.target*100):0;
      list.appendChild(el('div',{style:{display:'flex',alignItems:'center',padding:'13px 16px',borderBottom:'1px solid #EBEBEF',cursor:'pointer'},onclick:()=>{currentStaffPin=m.pin;render();}},
        el('div',{style:{width:'36px',height:'36px',borderRadius:'50%',background:st.color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',color:st.color,marginRight:'10px'}},m.av),
        el('div',{style:{flex:'1'}},
          el('div',{style:{fontSize:'13px',fontWeight:'600'}},m.name),
          el('div',{style:{fontSize:'10px',color:'#A0A0B0'}},`客数 ${(SALES_DATA[m.pin]?.shinki||0)+(SALES_DATA[m.pin]?.rairai||0)+(SALES_DATA[m.pin]?.kotei||0)}名`)
        ),
        el('div',{style:{textAlign:'right',marginRight:'8px'}},
          el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'16px'}},fmt(d.total)),
          el('div',{style:{fontSize:'10px',color:p>=100?'#3DBD8A':'#F5A623',fontWeight:'600'}},`${p}%`)
        ),
        el('span',{style:{color:'#A0A0B0'}},'›')
      ));
    });
    wrap.appendChild(list);
    return wrap;
  }

  const totalAll = STAFF.reduce((a,s)=>a+(SALES_DATA[s.pin]?.total||0),0);
  const targetAll = STAFF.reduce((a,s)=>a+(SALES_DATA[s.pin]?.target||500000),0);
  const pctAll = targetAll>0?Math.round(totalAll/targetAll*100):0;
  wrap.appendChild(el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'14px',padding:'18px',marginBottom:'12px',position:'relative',overflow:'hidden'}},
    el('div',{style:{position:'absolute',top:'0',left:'0',right:'0',height:'3px',background:'#7B61FF'}}),
    el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'8px'}},'全社月次売上'),
    el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'32px',marginBottom:'8px'}},fmt(totalAll)),
    el('div',{style:{height:'8px',background:'#F7F7F9',borderRadius:'4px',overflow:'hidden'}},
      el('div',{style:{height:'100%',width:`${Math.min(pctAll,100)}%`,background:'#7B61FF',borderRadius:'4px'}})
    ),
    el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'6px'}},`目標 ${fmt(targetAll)} — ${pctAll}%`)
  ));
  wrap.appendChild(storeGrid(id=>{currentStore=id;render();},(s,members)=>fmt(members.reduce((a,m)=>a+(SALES_DATA[m.pin]?.total||0),0))));
  return wrap;
}

function renderAnalytics() {
  const wrap = el('div',{});
  if (currentStaffPin) {
    const member = STAFF.find(s=>s.pin===currentStaffPin);
    const st = getStore(member.store);
    const d = SALES_DATA[currentStaffPin]||{total:0,shinki:0,rairai:0,kotei:0};
    const total = d.shinki+d.rairai+d.kotei;
    const repeat = total>0?Math.round((d.rairai+d.kotei)/total*100):0;
    const shopRate = total>0?Math.round((d.shohin||0)/d.total*100)||0:0;
    wrap.appendChild(breadcrumb([
      {label:'← 店舗',onClick:()=>{currentStore=null;currentStaffPin=null;render();}},
      {label:st.name,onClick:()=>{currentStaffPin=null;render();}},
      {label:member.name.split(' ')[0]}
    ]));
    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px',paddingBottom:'10px',borderBottom:'1.5px solid #EBEBEF'}},'🔁 リピート率'),
      el('div',{style:{display:'flex',alignItems:'baseline',gap:'4px',marginBottom:'8px'}},
        el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'52px',color:'#7B61FF',lineHeight:'1'}},String(repeat)),
        el('div',{style:{fontSize:'18px',color:'#7B61FF'}},'%')
      ),
      el('div',{style:{height:'10px',background:'#F7F7F9',borderRadius:'5px',overflow:'hidden'}},
        el('div',{style:{height:'100%',width:`${repeat}%`,background:'linear-gradient(90deg,#7B61FF,#B39DFD)',borderRadius:'5px'}})
      ),
      el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'6px'}},repeat>=70?'✓ 優秀':'△ 改善中')
    ]));
    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px',paddingBottom:'10px',borderBottom:'1.5px solid #EBEBEF'}},'🛍️ 店販購買率'),
      el('div',{style:{display:'flex',alignItems:'baseline',gap:'4px'}},
        el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'36px',color:'#3DBD8A'}},String(shopRate)),
        el('div',{style:{fontSize:'18px',color:'#3DBD8A'}},'%')
      ),
      el('div',{style:{height:'10px',background:'#F7F7F9',borderRadius:'5px',overflow:'hidden',marginTop:'8px'}},
        el('div',{style:{height:'100%',width:`${shopRate}%`,background:'linear-gradient(90deg,#3DBD8A,#7BE8C0)',borderRadius:'5px'}})
      ),
      el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'6px'}},shopRate>=35?'✓ 目標達成':`目標35% まで残り${35-shopRate}%`)
    ]));
    return wrap;
  }
  if (currentStore) {
    const st = getStore(currentStore);
    const members = STAFF.filter(s=>s.store===currentStore);
    wrap.appendChild(breadcrumb([{label:'← 店舗',onClick:()=>{currentStore=null;render();}},{label:st.name}]));
    const grid = el('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}});
    members.forEach(m=>{
      grid.appendChild(el('div',{style:{background:'#fff',border:'2px solid #EBEBEF',borderRadius:'14px',padding:'14px 8px',cursor:'pointer',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'},onclick:()=>{currentStaffPin=m.pin;render();}},
        el('div',{style:{width:'44px',height:'44px',borderRadius:'50%',background:st.color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'700',color:st.color}},m.av),
        el('div',{style:{fontSize:'11px',fontWeight:'500',lineHeight:'1.4'}},m.name)
      ));
    });
    wrap.appendChild(grid);
    return wrap;
  }
  wrap.appendChild(storeGrid(id=>{currentStore=id;render();}));
  return wrap;
}

function renderShift() {
  const wrap = el('div',{});
  const DOW_SHORT=['日','月','火','水','木','金','土'];
  const dates = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-d.getDay()+i);
    return {day:DOW_SHORT[d.getDay()],num:d.getDate(),active:d.toDateString()===today.toDateString()};
  });
  const genShifts = storeId => STAFF.filter(s=>s.store===storeId).map(m=>{
    const r=(m.id*7+3)%10;
    return {...m,status:r<1?'有休':r<2?'休み':'出勤',start:m.id%2===0?'10:00':'09:00',end:m.id%2===0?'19:00':'18:00'};
  });
  if (currentStore) {
    const st = getStore(currentStore);
    const shifts = genShifts(currentStore);
    wrap.appendChild(breadcrumb([{label:'← 店舗一覧',onClick:()=>{currentStore=null;render();}},{label:st.name}]));
    const dateRow = el('div',{style:{display:'flex',gap:'8px',marginBottom:'14px',overflowX:'auto'}});
    dates.forEach(d=>dateRow.appendChild(el('div',{style:{flexShrink:'0',width:'50px',padding:'10px 0',textAlign:'center',border:`1.5px solid ${d.active?'#7B61FF':'#EBEBEF'}`,borderRadius:'12px',background:d.active?'#7B61FF':'#fff',color:d.active?'#fff':'#1A1A2E'}},
      el('div',{style:{fontSize:'10px'}},d.day),
      el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'22px',lineHeight:'1.1'}},String(d.num))
    )));
    wrap.appendChild(dateRow);
    const stats = el('div',{style:{display:'flex',gap:'10px',marginBottom:'14px'}});
    [{val:shifts.filter(s=>s.status==='出勤').length,label:'出勤',color:'#3DBD8A'},{val:shifts.filter(s=>s.status==='有休').length,label:'有休',color:'#F5A623'},{val:shifts.filter(s=>s.status==='休み').length,label:'休み',color:'#E8537A'},{val:shifts.length,label:'総員',color:'#1A1A2E'}].forEach(item=>
      stats.appendChild(el('div',{style:{flex:'1',padding:'14px 8px',borderRadius:'14px',textAlign:'center',background:'#fff',border:'1px solid #EBEBEF'}},
        el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'28px',color:item.color,lineHeight:'1'}},String(item.val)),
        el('div',{style:{fontSize:'10px',color:'#A0A0B0',marginTop:'4px'}},item.label)
      ))
    );
    wrap.appendChild(stats);
    const list = el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'16px',overflow:'hidden'}});
    shifts.forEach(m=>list.appendChild(el('div',{style:{display:'flex',alignItems:'center',padding:'13px 16px',borderBottom:'1px solid #EBEBEF'}},
      el('div',{style:{width:'40px',height:'40px',borderRadius:'50%',background:m.status==='出勤'?st.color+'22':'#F7F7F9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'700',color:m.status==='出勤'?st.color:'#A0A0B0',marginRight:'12px'}},m.av),
      el('div',{style:{flex:'1'}},
        el('div',{style:{fontSize:'13px',fontWeight:'500'}},m.name),
        m.status==='出勤'?el('div',{style:{fontSize:'11px',color:'#A0A0B0'}},`${m.start} – ${m.end}`):el('span',{})
      ),
      el('span',{style:{padding:'2px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:'500',background:m.status==='出勤'?'rgba(61,189,138,0.12)':m.status==='有休'?'rgba(232,83,122,0.1)':'rgba(160,160,176,0.12)',color:m.status==='出勤'?'#3DBD8A':m.status==='有休'?'#E8537A':'#A0A0B0'}},m.status)
    )));
    wrap.appendChild(list);
    return wrap;
  }
  wrap.appendChild(storeGrid(id=>{currentStore=id;render();},(s,members)=>{
    const shifts=genShifts(s.id);
    return `出勤 ${shifts.filter(s=>s.status==='出勤').length}/${members.length}名`;
  }));
  return wrap;
}

function renderProfile() {
  const st = getStore(currentUser.store);
  const d = SALES_DATA[currentUser.pin]||{total:0,target:500000};
  const pct = d.target>0?Math.round(d.total/d.target*100):0;
  const wrap = el('div',{});
  wrap.appendChild(el('div',{style:{display:'flex',alignItems:'center',gap:'14px',padding:'18px',background:'#fff',border:'1px solid #EBEBEF',borderRadius:'16px',marginBottom:'12px'}},
    el('div',{style:{width:'56px',height:'56px',borderRadius:'50%',background:st.color+'33',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'700',color:st.color}},currentUser.av),
    el('div',{},
      el('div',{style:{fontSize:'16px',fontWeight:'700',marginBottom:'2px'}},currentUser.name),
      el('div',{style:{fontSize:'12px',color:st.color,fontWeight:'500'}},st.name),
      el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'2px'}},`ID: ${currentUser.pin}`)
    )
  ));
  wrap.appendChild(card([
    el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'12px'}},'個人売上実績'),
    el('div',{style:{display:'flex',gap:'10px',marginBottom:'10px'}},
      el('div',{style:{flex:'1',background:st.bg,borderRadius:'12px',padding:'14px',textAlign:'center'}},
        el('div',{style:{fontSize:'10px',color:st.color,fontWeight:'700',marginBottom:'4px'}},'月次売上'),
        el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'20px',color:st.color}},fmt(d.total))
      ),
      el('div',{style:{flex:'1',background:'#F7F7F9',borderRadius:'12px',padding:'14px',textAlign:'center'}},
        el('div',{style:{fontSize:'10px',color:'#A0A0B0',fontWeight:'700',marginBottom:'4px'}},'達成率'),
        el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'20px',color:pct>=100?'#3DBD8A':'#F5A623'}},`${pct}%`)
      )
    ),
    el('div',{style:{height:'8px',background:'#F7F7F9',borderRadius:'4px',overflow:'hidden'}},
      el('div',{style:{height:'100%',width:`${Math.min(pct,100)}%`,background:pct>=100?'#3DBD8A':st.color,borderRadius:'4px'}})
    )
  ]));
  ['📅 勤怠記録','📨 シフト希望提出','📢 お知らせ','⚙️ 設定'].forEach(label=>{
    wrap.appendChild(el('div',{style:{display:'flex',alignItems:'center',padding:'15px 18px',background:'#fff',border:'1px solid #EBEBEF',borderRadius:'14px',marginBottom:'8px',cursor:'pointer'}},
      el('span',{style:{flex:'1',fontSize:'13px',fontWeight:'500'}},label),
      el('span',{style:{color:'#A0A0B0',fontSize:'18px'}},'›')
    ));
  });
  return wrap;
}

render();
