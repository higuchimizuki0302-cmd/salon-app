const STORES = [
  { id:"honten", name:"Hair 本店", icon:"✂️", color:"#7B61FF", bg:"#F3F0FF" },
  { id:"tuelu",  name:"tuelu",    icon:"✂️", color:"#5B8DEF", bg:"#EFF4FF" },
  { id:"nail",   name:"Nail",     icon:"💅", color:"#E8537A", bg:"#FFF0F4" },
  { id:"eye",    name:"Eye",      icon:"👁️", color:"#3BAED4", bg:"#EFF9FF" },
  { id:"esthe",  name:"Esthe",    icon:"✨", color:"#3DBD8A", bg:"#EDFBF4" },
];

const STAFF = [
  { id:1,  name:"百田 沙弥香", store:"honten", av:"百" },
  { id:2,  name:"箕浦 黎也",   store:"honten", av:"箕" },
  { id:3,  name:"森永 久美",   store:"honten", av:"森" },
  { id:4,  name:"辻 貴音",     store:"honten", av:"辻" },
  { id:5,  name:"秋山 裕香",   store:"honten", av:"秋" },
  { id:6,  name:"山本 渉一郎", store:"honten", av:"山" },
  { id:7,  name:"山口 大輝",   store:"honten", av:"大" },
  { id:8,  name:"加藤 留那",   store:"honten", av:"加" },
  { id:9,  name:"沼澤 杏奈",   store:"honten", av:"沼" },
  { id:10, name:"澤田 摩里茄", store:"honten", av:"澤" },
  { id:11, name:"樋口 瑞貴",   store:"tuelu",  av:"樋" },
  { id:12, name:"濱岡 恭子",   store:"tuelu",  av:"濱" },
  { id:13, name:"佐藤 翔太",   store:"tuelu",  av:"佐" },
  { id:14, name:"野本 晴香",   store:"tuelu",  av:"野" },
  { id:15, name:"松原 彰大",   store:"tuelu",  av:"松" },
  { id:16, name:"河原 澄真",   store:"tuelu",  av:"河" },
  { id:17, name:"末永 咲希",   store:"tuelu",  av:"末" },
  { id:18, name:"益 英一郎",   store:"tuelu",  av:"益" },
  { id:19, name:"梶木 勇吾",   store:"tuelu",  av:"梶" },
  { id:20, name:"ライアン麻里奈", store:"nail", av:"ラ" },
  { id:21, name:"大中 瑞希",   store:"nail",   av:"大" },
  { id:22, name:"大西 あかね", store:"nail",   av:"西" },
  { id:23, name:"小林 里緒菜", store:"nail",   av:"小" },
  { id:24, name:"木村 采里",   store:"nail",   av:"木" },
  { id:25, name:"梅原 美琳",   store:"eye",    av:"梅" },
  { id:26, name:"高橋 ミク",   store:"eye",    av:"高" },
  { id:27, name:"富永 幸生",   store:"esthe",  av:"富" },
];

const seed = (id, min, max) => min + ((id * 37 + 13) % (max - min + 1));
const fmt = n => "¥" + Number(n).toLocaleString();
const getStore = id => STORES.find(s => s.id === id);
const DOW = ["日","月","火","水","木","金","土"];
const today = new Date();
const todayStr = `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日（${DOW[today.getDay()]}）`;

const genDaily = () => {
  const d = {};
  STAFF.forEach(s => {
    d[s.id] = {
      instaTarget: 20, instaCurrent: seed(s.id, 3, 18),
      remaining: seed(s.id, 2, 8), newClients: seed(s.id, 0, 5),
      hotpepper: seed(s.id, 0, 3), instagram: seed(s.id, 0, 2),
      referral: seed(s.id, 0, 2), lp: 0,
      nextShinki_in: seed(s.id, 0, 3), nextShinki_out: seed(s.id, 1, 5),
      nextRairai_in: seed(s.id, 1, 4), nextRairai_out: seed(s.id, 2, 6),
      nextKotei_in: seed(s.id, 2, 6), nextKotei_out: seed(s.id, 3, 8),
      shop_in: seed(s.id, 1, 4), shop_out: seed(s.id, 3, 8),
      saved: false,
    };
  });
  return d;
};

const genSales = () => {
  const d = {};
  STAFF.forEach(s => {
    d[s.id] = {
      total: seed(s.id, 180000, 580000),
      gijutsu: seed(s.id, 140000, 480000),
      shinki: seed(s.id, 3, 18),
      rairai: seed(s.id, 8, 22),
      kotei: seed(s.id, 10, 40),
      target: seed(s.id, 300000, 550000),
    };
  });
  return d;
};

let dailyData = genDaily();
const SALES_DATA = genSales();
let currentUser = null;
let currentTab = 'daily';
let currentStore = null;
let currentStaffId = null;

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
  let selStore = '';
  let selStaff = '';
  let selRole = 'staff';

  const staffSel = el('select', {
    style: { width:'100%', padding:'12px 16px', border:'1px solid #EBEBEF', borderRadius:'10px', fontSize:'14px', background:'#F7F7F9', marginBottom:'12px', display:'block' },
    onchange: e => selStaff = e.target.value
  }, el('option', { value:'' }, 'スタッフを選択'));

  const storeSel = el('select', {
    style: { width:'100%', padding:'12px 16px', border:'1px solid #EBEBEF', borderRadius:'10px', fontSize:'14px', background:'#F7F7F9', marginBottom:'12px', display:'block' },
    onchange: e => {
      selStore = e.target.value;
      staffSel.innerHTML = '<option value="">スタッフを選択</option>';
      STAFF.filter(s => s.store === selStore).forEach(m => {
        staffSel.appendChild(el('option', { value: m.id }, m.name));
      });
      selStaff = '';
    }
  },
    el('option', { value:'' }, '店舗を選択'),
    ...STORES.map(s => el('option', { value: s.id }, `${s.icon} ${s.name}`))
  );

  const roleSel = el('select', {
    style: { width:'100%', padding:'12px 16px', border:'1px solid #EBEBEF', borderRadius:'10px', fontSize:'14px', background:'#F7F7F9', marginBottom:'12px', display:'block' },
    onchange: e => selRole = e.target.value
  },
    el('option', { value:'staff' }, 'スタッフ'),
    el('option', { value:'manager' }, '店長'),
    el('option', { value:'owner' }, 'オーナー')
  );

  return el('div', { style: { minHeight:'100vh', background:'#1A1A2E', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }},
    el('div', { style: { background:'#fff', borderRadius:'20px', padding:'40px 32px', width:'100%', maxWidth:'340px', display:'flex', flexDirection:'column' }},
      el('div', { style: { fontFamily:'"DM Serif Display",serif', fontSize:'32px', textAlign:'center', marginBottom:'4px', letterSpacing:'0.08em' }}, 'dipty', el('em', { style: { color:'#7B61FF' }}, 'MOILA')),
      el('div', { style: { fontSize:'11px', color:'#A0A0B0', textAlign:'center', marginBottom:'24px', letterSpacing:'0.15em' }}, '南船場グループ 管理システム'),
      storeSel, staffSel, roleSel,
      el('button', {
        style: { width:'100%', padding:'14px', background:'#7B61FF', color:'#fff', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor:'pointer', marginTop:'8px' },
        onclick: () => {
          if (!selStore || !selStaff) return;
          currentUser = { ...STAFF.find(s => s.id === parseInt(selStaff)), role: selRole };
          render();
        }
      }, 'ログイン')
    )
  );
}

function renderApp() {
  const st = getStore(currentUser.store);
  const TABS = [
    {key:'daily', icon:'✏️', label:'日報'},
    {key:'sales', icon:'📊', label:'売上'},
    {key:'analytics', icon:'📈', label:'分析'},
    {key:'shift', icon:'📅', label:'シフト'},
    {key:'profile', icon:'👤', label:'マイページ'},
  ];
  const titles = {daily:'日報', sales:'売上', analytics:'スタッフ分析', shift:'シフト管理', profile:'マイページ'};

  const content = el('div', { style: { flex:'1', padding:'16px 16px 80px', overflowY:'auto' }});
  const titleEl = el('div', { style: { fontFamily:'"DM Serif Display",serif', fontSize:'22px', color:'#1A1A2E', marginBottom:'16px' }}, titles[currentTab]);
  content.appendChild(titleEl);

  if (currentTab === 'daily') content.appendChild(renderDaily());
  else if (currentTab === 'sales') content.appendChild(renderSales());
  else if (currentTab === 'analytics') content.appendChild(renderAnalytics());
  else if (currentTab === 'shift') content.appendChild(renderShift());
  else if (currentTab === 'profile') content.appendChild(renderProfile());

  const nav = el('nav', { style: { display:'flex', background:'#fff', borderTop:'1px solid #EBEBEF', position:'fixed', bottom:'0', left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'430px', zIndex:'100' }});
  TABS.forEach(t => {
    const btn = el('button', {
      style: { flex:'1', padding:'10px 2px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', cursor:'pointer', border:'none', background:'none', color: currentTab===t.key ? '#7B61FF' : '#A0A0B0', fontSize:'7.5px', borderTop: currentTab===t.key ? '2.5px solid #7B61FF' : '2.5px solid transparent' },
      onclick: () => { currentTab = t.key; currentStore = null; currentStaffId = null; render(); }
    }, el('span', { style: { fontSize:'18px' }}, t.icon), t.label);
    nav.appendChild(btn);
  });

  return el('div', { style: { display:'flex', flexDirection:'column', minHeight:'100vh', maxWidth:'430px', margin:'0 auto', background:'#F7F7F9' }},
    el('div', { style: { padding:'16px 20px 12px', background:'#fff', borderBottom:'1px solid #EBEBEF', position:'sticky', top:'0', zIndex:'100' }},
      el('div', { style: { display:'flex', alignItems:'center', justifyContent:'space-between' }},
        el('div', {},
          el('div', { style: { fontFamily:'"DM Serif Display",serif', fontSize:'20px', letterSpacing:'0.08em' }}, 'dipty', el('em', { style: { color:'#7B61FF' }}, 'MOILA')),
          el('div', { style: { fontSize:'11px', color:'#A0A0B0', marginTop:'2px' }}, todayStr)
        ),
        el('div', { style: { display:'flex', alignItems:'center', gap:'8px' }},
          el('div', { style: { width:'32px', height:'32px', borderRadius:'50%', background:st.color+'22', border:`1.5px solid ${st.color}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:st.color }}, currentUser.av),
          el('button', { style: { width:'36px', height:'36px', border:'1.5px solid #EBEBEF', borderRadius:'50%', background:'#fff', cursor:'pointer', fontSize:'14px' }, onclick: () => { currentUser = null; render(); }}, '🚪')
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
        el('div', { style: { fontSize:'15px', fontWeight:'700', color:s.color }}, s.name),
        el('div', { style: { fontSize:'10px', color:'#6B6B80' }}, badge ? badge(s, members) : `${members.length}名`)
      );
    })
  );
}

function breadcrumb(items) {
  const wrap = el('div', { style: { display:'flex', alignItems:'center', gap:'6px', marginBottom:'16px', flexWrap:'wrap' }});
  items.forEach((item, i) => {
    if (i > 0) wrap.appendChild(el('span', { style: { color:'#A0A0B0', fontSize:'14px' }}, '›'));
    if (item.onClick) {
      wrap.appendChild(el('button', { style: { padding:'5px 12px', borderRadius:'20px', border:'1.5px solid #EBEBEF', background:'#fff', cursor:'pointer', fontSize:'12px', fontWeight:'500', color:'#6B6B80' }, onclick: item.onClick }, item.label));
    } else {
      wrap.appendChild(el('span', { style: { fontSize:'12px', fontWeight:'700', color:'#1A1A2E' }}, item.label));
    }
  });
  return wrap;
}

function stepper(val, onChange) {
  const display = el('div', { style: { width:'52px', height:'36px', border:'1.5px solid #EBEBEF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', background:'#fff' }}, String(val));
  return el('div', { style: { display:'flex', alignItems:'center' }},
    el('button', { style: { width:'36px', height:'36px', border:'1.5px solid #EBEBEF', borderRight:'none', borderRadius:'10px 0 0 10px', background:'#F7F7F9', color:'#7B61FF', fontSize:'20px', cursor:'pointer' }, onclick: () => { val = Math.max(0, val-1); display.textContent = val; onChange(val); }}, '−'),
    display,
    el('button', { style: { width:'36px', height:'36px', border:'1.5px solid #EBEBEF', borderLeft:'none', borderRadius:'0 10px 10px 0', background:'#F7F7F9', color:'#7B61FF', fontSize:'20px', cursor:'pointer' }, onclick: () => { val = val+1; display.textContent = val; onChange(val); }}, '＋')
  );
}

function renderDaily() {
  const wrap = el('div', {});

  if (currentStaffId) {
    const member = STAFF.find(s => s.id === currentStaffId);
    const st = getStore(member.store);
    const d = dailyData[currentStaffId];

    wrap.appendChild(breadcrumb([
      { label:'← 店舗', onClick: () => { currentStore = null; currentStaffId = null; render(); }},
      { label:`${st.icon} ${st.name}`, onClick: () => { currentStaffId = null; render(); }},
      { label: member.name.split(' ')[0] }
    ]));

    // インスタ
    const instaBar = el('div', { style: { height:'8px', background:'#F7F7F9', borderRadius:'4px', overflow:'hidden', marginTop:'8px' }},
      el('div', { style: { height:'100%', width:`${Math.min(100,Math.round(d.instaCurrent/d.instaTarget*100))}%`, background:'linear-gradient(90deg,#7B61FF,#E8537A)', borderRadius:'4px' }})
    );

    wrap.appendChild(card([
      el('div', { style: { fontSize:'11px', fontWeight:'700', color:'#6B6B80', marginBottom:'14px', paddingBottom:'10px', borderBottom:'1.5px solid #EBEBEF' }}, '📸 インスタ投稿数'),
      el('div', { style: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }},
        el('div', {}, el('div', { style: { fontSize:'11px', color:'#A0A0B0', marginBottom:'6px' }}, '今月の目標'), stepper(d.instaTarget, v => { d.instaTarget = v; })),
        el('div', {}, el('div', { style: { fontSize:'11px', color:'#A0A0B0', marginBottom:'6px' }}, '現在の投稿数'), stepper(d.instaCurrent, v => { d.instaCurrent = v; }))
      ),
      instaBar
    ]));

    // 予約・新規
    wrap.appendChild(card([
      el('div', { style: { fontSize:'11px', fontWeight:'700', color:'#6B6B80', marginBottom:'14px', paddingBottom:'10px', borderBottom:'1.5px solid #EBEBEF' }}, '📅 予約・新規'),
      ...['残りの予約件数:remaining', '新規のお客様数:newClients'].map(s => {
        const [label, field] = s.split(':');
        return el('div', { style: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }},
          el('div', { style: { fontSize:'13px' }}, label),
          stepper(d[field], v => { d[field] = v; })
        );
      })
    ]));

    // 流入経路
    wrap.appendChild(card([
      el('div', { style: { fontSize:'11px', fontWeight:'700', color:'#6B6B80', marginBottom:'14px', paddingBottom:'10px', borderBottom:'1.5px solid #EBEBEF' }}, '🔀 新規 流入経路'),
      el('div', { style: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }},
        ...['🌶️ ホットペッパー:hotpepper', '📸 インスタ:instagram', '🤝 紹介:referral', '🔗 LP:lp'].map(s => {
          const [label, field] = s.split(':');
          return el('div', { style: { background:'#F7F7F9', border:'1px solid #EBEBEF', borderRadius:'12px', padding:'12px' }},
            el('div', { style: { fontSize:'11px', color:'#6B6B80', marginBottom:'8px' }}, label),
            stepper(d[field], v => { d[field] = v; })
          );
        })
      )
    ]));

    wrap.appendChild(el('button', {
      style: { width:'100%', padding:'15px', border:'none', borderRadius:'14px', background:st.color, color:'#fff', fontSize:'14px', fontWeight:'700', cursor:'pointer' },
      onclick: () => {
        dailyData[currentStaffId].saved = true;
        currentStaffId = null;
        render();
      }
    }, '入力を保存する'));
    return wrap;
  }

  if (currentStore) {
    const st = getStore(currentStore);
    const members = STAFF.filter(s => s.store === currentStore);
    wrap.appendChild(breadcrumb([{ label:'← 店舗', onClick: () => { currentStore = null; render(); }}, { label:`${st.icon} ${st.name}` }]));
    const grid = el('div', { style: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }});
    members.forEach(m => {
      const d = dailyData[m.id];
      grid.appendChild(el('div', {
        style: { background:'#fff', border:`2px solid ${d.saved?st.color+'55':'#EBEBEF'}`, borderRadius:'14px', padding:'14px 8px', cursor:'pointer', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' },
        onclick: () => { currentStaffId = m.id; render(); }
      },
        el('div', { style: { width:'44px', height:'44px', borderRadius:'50%', background:(d.saved?st.color:'#ccc')+'22', border:`1.5px solid ${d.saved?st.color:'#ccc'}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:'700', color:d.saved?st.color:'#ccc' }}, m.av),
        el('div', { style: { fontSize:'11px', fontWeight:'500', lineHeight:'1.4' }}, m.name),
        el('div', { style: { fontSize:'9px', color:d.saved?'#3DBD8A':'#F5A623', fontWeight:'600' }}, d.saved?'入力済':'未入力')
      ));
    });
    wrap.appendChild(grid);
    return wrap;
  }

  wrap.appendChild(storeGrid(id => { currentStore = id; render(); }, (s, members) => {
    const n = members.filter(m => dailyData[m.id].saved).length;
    return `${n}/${members.length}名 入力済`;
  }));
  return wrap;
}

function renderSales() {
  const wrap = el('div', {});

  if (currentStaffId) {
    const member = STAFF.find(s => s.id === currentStaffId);
    const st = getStore(member.store);
    const d = SALES_DATA[currentStaffId];
    const total = d.shinki + d.rairai + d.kotei;
    const pct = Math.round(d.total/d.target*100);

    wrap.appendChild(breadcrumb([
      { label:'← 店舗', onClick:()=>{currentStore=null;currentStaffId=null;render();}},
      { label:`${st.icon} ${st.name}`, onClick:()=>{currentStaffId=null;render();}},
      { label:member.name.split(' ')[0] }
    ]));

    wrap.appendChild(el('div', { style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'12px'}},
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
      )
    ]));

    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'12px'}},'客数内訳'),
      ...[{label:'新規',val:d.shinki,color:'#E8537A'},{label:'再来',val:d.rairai,color:'#F5A623'},{label:'固定',val:d.kotei,color:'#7B61FF'}].map(item => {
        const p = total>0?Math.round(item.val/total*100):0;
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
    return wrap;
  }

  if (currentStore) {
    const st = getStore(currentStore);
    const members = STAFF.filter(s => s.store === currentStore);
    wrap.appendChild(breadcrumb([{label:'← 店舗',onClick:()=>{currentStore=null;render();}},{label:`${st.icon} ${st.name}`}]));
    const list = el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'16px',overflow:'hidden'}});
    members.forEach(m => {
      const d = SALES_DATA[m.id];
      const p = Math.round(d.total/d.target*100);
      list.appendChild(el('div',{style:{display:'flex',alignItems:'center',padding:'13px 16px',borderBottom:'1px solid #EBEBEF',cursor:'pointer'},onclick:()=>{currentStaffId=m.id;render();}},
        el('div',{style:{width:'36px',height:'36px',borderRadius:'50%',background:st.color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',color:st.color,marginRight:'10px'}},m.av),
        el('div',{style:{flex:'1'}},
          el('div',{style:{fontSize:'13px',fontWeight:'600'}},m.name),
          el('div',{style:{fontSize:'10px',color:'#A0A0B0'}},`客数 ${d.shinki+d.rairai+d.kotei}名`)
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

  const totalAll = STAFF.reduce((a,s)=>a+SALES_DATA[s.id].total,0);
  const targetAll = STAFF.reduce((a,s)=>a+SALES_DATA[s.id].target,0);
  const pctAll = Math.round(totalAll/targetAll*100);

  wrap.appendChild(el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'14px',padding:'18px',marginBottom:'12px',position:'relative',overflow:'hidden'}},
    el('div',{style:{position:'absolute',top:'0',left:'0',right:'0',height:'3px',background:'#7B61FF'}}),
    el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'8px'}},'全社月次売上'),
    el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'32px',marginBottom:'8px'}},fmt(totalAll)),
    el('div',{style:{height:'8px',background:'#F7F7F9',borderRadius:'4px',overflow:'hidden'}},
      el('div',{style:{height:'100%',width:`${Math.min(pctAll,100)}%`,background:'#7B61FF',borderRadius:'4px'}})
    ),
    el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'6px'}},`目標 ${fmt(targetAll)} — ${pctAll}%`)
  ));
  wrap.appendChild(storeGrid(id=>{currentStore=id;render();}, (s,members)=>fmt(members.reduce((a,m)=>a+SALES_DATA[m.id].total,0))));
  return wrap;
}

function renderAnalytics() {
  const wrap = el('div',{});
  if (currentStaffId) {
    const member = STAFF.find(s=>s.id===currentStaffId);
    const st = getStore(member.store);
    const d = SALES_DATA[currentStaffId];
    const total = d.shinki+d.rairai+d.kotei;
    const repeat = total>0?Math.round((d.rairai+d.kotei)/total*100):0;
    const shopRate = seed(currentStaffId,15,55);
    wrap.appendChild(breadcrumb([
      {label:'← 店舗',onClick:()=>{currentStore=null;currentStaffId=null;render();}},
      {label:`${st.icon} ${st.name}`,onClick:()=>{currentStaffId=null;render();}},
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
      )
    ]));
    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px',paddingBottom:'10px',borderBottom:'1.5px solid #EBEBEF'}},'🛍️ 店販購買率'),
      el('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},
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
    wrap.appendChild(breadcrumb([{label:'← 店舗',onClick:()=>{currentStore=null;render();}},{label:`${st.icon} ${st.name}`}]));
    const grid = el('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}});
    members.forEach(m=>{
      grid.appendChild(el('div',{style:{background:'#fff',border:'2px solid #EBEBEF',borderRadius:'14px',padding:'14px 8px',cursor:'pointer',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'},onclick:()=>{currentStaffId=m.id;render();}},
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
  const DOW_SHORT = ['日','月','火','水','木','金','土'];
  const dates = Array.from({length:7},(_,i)=>{
    const d = new Date(2026,2,6+i);
    return {day:DOW_SHORT[d.getDay()],num:d.getDate(),active:i===3};
  });
  const genShifts = storeId => STAFF.filter(s=>s.store===storeId).map(m=>{
    const r=(m.id*7+3)%10;
    return {...m,status:r<1?'有休':r<2?'休み':'出勤',start:m.id%2===0?'10:00':'09:00',end:m.id%2===0?'19:00':'18:00'};
  });

  if (currentStore) {
    const st = getStore(currentStore);
    const shifts = genShifts(currentStore);
    wrap.appendChild(breadcrumb([{label:'← 店舗一覧',onClick:()=>{currentStore=null;render();}},{label:`${st.icon} ${st.name}`}]));
    const dateRow = el('div',{style:{display:'flex',gap:'8px',marginBottom:'14px',overflowX:'auto'}});
    dates.forEach(d=>{
      dateRow.appendChild(el('div',{style:{flexShrink:'0',width:'50px',padding:'10px 0',textAlign:'center',border:`1.5px solid ${d.active?'#7B61FF':'#EBEBEF'}`,borderRadius:'12px',background:d.active?'#7B61FF':'#fff',color:d.active?'#fff':'#1A1A2E',cursor:'pointer'}},
        el('div',{style:{fontSize:'10px'}},d.day),
        el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'22px',lineHeight:'1.1'}},String(d.num))
      ));
    });
    wrap.appendChild(dateRow);
    const stats = el('div',{style:{display:'flex',gap:'10px',marginBottom:'14px'}});
    [{val:shifts.filter(s=>s.status==='出勤').length,label:'出勤',color:'#3DBD8A'},{val:shifts.filter(s=>s.status==='有休').length,label:'有休',color:'#F5A623'},{val:shifts.filter(s=>s.status==='休み').length,label:'休み',color:'#E8537A'},{val:shifts.length,label:'総員',color:'#1A1A2E'}].forEach(item=>{
      stats.appendChild(el('div',{style:{flex:'1',padding:'14px 8px',borderRadius:'14px',textAlign:'center',background:'#fff',border:'1px solid #EBEBEF'}},
        el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'28px',color:item.color,lineHeight:'1'}},String(item.val)),
        el('div',{style:{fontSize:'10px',color:'#A0A0B0',marginTop:'4px'}},item.label)
      ));
    });
    wrap.appendChild(stats);
    const list = el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'16px',overflow:'hidden'}});
    shifts.forEach(m=>{
      list.appendChild(el('div',{style:{display:'flex',alignItems:'center',padding:'13px 16px',borderBottom:'1px solid #EBEBEF'}},
        el('div',{style:{width:'40px',height:'40px',borderRadius:'50%',background:m.status==='出勤'?st.color+'22':'#F7F7F9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'700',color:m.status==='出勤'?st.color:'#A0A0B0',marginRight:'12px'}},m.av),
        el('div',{style:{flex:'1'}},
          el('div',{style:{fontSize:'13px',fontWeight:'500'}},m.name),
          m.status==='出勤'?el('div',{style:{fontSize:'11px',color:'#A0A0B0'}},`${m.start} – ${m.end}`):el('span',{})
        ),
        el('span',{style:{padding:'2px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:'500',background:m.status==='出勤'?'rgba(61,189,138,0.12)':m.status==='有休'?'rgba(232,83,122,0.1)':'rgba(160,160,176,0.12)',color:m.status==='出勤'?'#3DBD8A':m.status==='有休'?'#E8537A':'#A0A0B0'}},m.status)
      ));
    });
    wrap.appendChild(list);
    return wrap;
  }
  wrap.appendChild(storeGrid(id=>{currentStore=id;render();}, (s,members)=>{
    const shifts=genShifts(s.id);
    return `出勤 ${shifts.filter(s=>s.status==='出勤').length}/${members.length}名`;
  }));
  return wrap;
}

function renderProfile() {
  const st = getStore(currentUser.store);
  const d = SALES_DATA[currentUser.id];
  const pct = Math.round(d.total/d.target*100);
  const wrap = el('div',{});
  wrap.appendChild(el('div',{style:{display:'flex',alignItems:'center',gap:'14px',padding:'18px',background:'#fff',border:'1px solid #EBEBEF',borderRadius:'16px',marginBottom:'12px'}},
    el('div',{style:{width:'56px',height:'56px',borderRadius:'50%',background:st.color+'33',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'700',color:st.color}},currentUser.av),
    el('div',{},
      el('div',{style:{fontSize:'16px',fontWeight:'700',marginBottom:'2px'}},currentUser.name),
      el('div',{style:{fontSize:'12px',color:st.color,fontWeight:'500'}},st.name)
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
