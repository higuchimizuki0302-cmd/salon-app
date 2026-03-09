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

const EDU_STAFF = [
  { pin:"16", name:"山口 大輝",   store:"honten" },
  { pin:"17", name:"加藤 留那",   store:"honten" },
  { pin:"18", name:"沼澤 杏奈",   store:"honten" },
  { pin:"19", name:"澤田 摩里茄", store:"honten" },
  { pin:"15", name:"末永 咲希",   store:"tuelu"  },
  { pin:"20", name:"益 英一郎",   store:"tuelu"  },
  { pin:"21", name:"梶木 勇吾",   store:"tuelu"  },
];

const fmt = n => n > 0 ? "¥" + Number(n).toLocaleString() : "¥0";
const getStore = id => STORES.find(s => s.id === id);
const DOW = ["日","月","火","水","木","金","土"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const today = new Date();
const todayStr = `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日（${DOW[today.getDay()]}）`;

const STORAGE_SALES = 'diptyMOILA_sales';
const STORAGE_DAILY = 'diptyMOILA_daily';
const STORAGE_EDU   = 'diptyMOILA_edu';

const defaultSales = () => {
  const d = {};
  STAFF.forEach(s => { d[s.pin] = { total:0, gijutsu:0, shohin:0, gijutsu_clients:0, shohin_clients:0, shinki:0, rairai:0, kotei:0, gobusata:0, target:500000 }; });
  return d;
};
const loadSales = () => { try { const s = localStorage.getItem(STORAGE_SALES); if(s) return JSON.parse(s); } catch(e){} return defaultSales(); };
const saveSales = d => { try { localStorage.setItem(STORAGE_SALES, JSON.stringify(d)); } catch(e){} };

const genDailyDefault = () => {
  const d = {};
  STAFF.forEach(s => { d[s.pin] = { instaTarget:20, instaCurrent:0, remaining:0, newClients:0, hotpepper:0, instagram:0, referral:0, lp:0, saved:false }; });
  return d;
};
const loadDaily = () => { try { const s = localStorage.getItem(STORAGE_DAILY); if(s) return JSON.parse(s); } catch(e){} return genDailyDefault(); };
const saveDaily = d => { try { localStorage.setItem(STORAGE_DAILY, JSON.stringify(d)); } catch(e){} };

const loadEdu = () => { try { const s = localStorage.getItem(STORAGE_EDU); if(s) return JSON.parse(s); } catch(e){} return {}; };
const saveEdu = d => { try { localStorage.setItem(STORAGE_EDU, JSON.stringify(d)); } catch(e){} };

const parseCSVData = (text) => {
  const lines = text.split('\n');
  const newData = defaultSales();
  let currentPin = null, qtyRow = null;
  lines.forEach(line => {
    const cols = line.split('\t');
    const col1=cols[1]?.trim()||'', col2=cols[2]?.trim()||'', col4=cols[4]?.trim()||'', col5=cols[5]?.trim()||'';
    if (col1 && /^\d+$/.test(col2)) { currentPin=col2; }
    else if (col1 && !col2) { const f=STAFF.find(s=>s.name.replace(/\s/g,'')=== col1.replace(/\s/g,'')||col1.includes(s.name.split(' ')[0])); if(f) currentPin=f.pin; }
    if (currentPin && col4==='数量' && col5==='実績') qtyRow=cols;
    if (currentPin && col4==='金額' && col5==='実績' && newData[currentPin]) {
      const n=i=>parseInt((cols[i]||'').replace(/[,\s]/g,''))||0;
      newData[currentPin].total=n(6); newData[currentPin].gijutsu=n(7)+n(9); newData[currentPin].shohin=n(8)+n(10);
      if (qtyRow) {
        const q=i=>parseInt((qtyRow[i]||'').replace(/[,\s]/g,''))||0;
        newData[currentPin].gijutsu_clients=q(7)+q(9); newData[currentPin].shohin_clients=q(8)+q(10);
        newData[currentPin].shinki=q(13); newData[currentPin].rairai=q(14); newData[currentPin].kotei=q(15); newData[currentPin].gobusata=q(16)||0;
      }
      const ex=loadSales(); if(ex[currentPin]?.target) newData[currentPin].target=ex[currentPin].target;
      currentPin=null; qtyRow=null;
    }
  });
  return newData;
};

let SALES_DATA = loadSales();
let dailyData  = loadDaily();
let eduData    = loadEdu();
let currentUser = null;
let currentTab = 'daily';
let currentStore = null;
let currentStaffPin = null;
let currentEduPin = null;
let currentEduMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let showAddLesson = false;
let selectedDate = null;

function el(tag, props, ...children) {
  const e = document.createElement(tag);
  if (props) Object.entries(props).forEach(([k,v]) => {
    if (k==='style' && typeof v==='object') Object.assign(e.style, v);
    else if (k==='onclick') e.onclick=v;
    else if (k==='onchange') e.onchange=v;
    else if (k==='oninput') e.oninput=v;
    else e[k]=v;
  });
  children.flat().forEach(c => c!=null && e.appendChild(typeof c==='string'?document.createTextNode(c):c));
  return e;
}

function render() {
  const root = document.getElementById('root');
  root.innerHTML = '';
  root.appendChild(currentUser ? renderApp() : renderLogin());
}

function renderLogin() {
  let pinInput = '';
  const wrap = el('div',{style:{minHeight:'100vh',background:'#1A1A2E',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}});
  const box  = el('div',{style:{background:'#fff',borderRadius:'20px',padding:'40px 32px',width:'100%',maxWidth:'340px',display:'flex',flexDirection:'column',alignItems:'center',gap:'16px'}});
  box.appendChild(el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'32px',textAlign:'center',letterSpacing:'0.08em'}},'dipty',el('em',{style:{color:'#7B61FF'}},'MOILA')));
  box.appendChild(el('div',{style:{fontSize:'11px',color:'#A0A0B0',textAlign:'center',letterSpacing:'0.15em'}},'南船場グループ 管理システム'));
  const display=el('div',{style:{fontSize:'36px',fontFamily:'"DM Serif Display",serif',letterSpacing:'0.4em',color:'#1A1A2E',minHeight:'56px',textAlign:'center',width:'100%',padding:'12px',background:'#F7F7F9',borderRadius:'12px',border:'1.5px solid #EBEBEF'}},'—');
  const errMsg=el('div',{style:{fontSize:'12px',color:'#E8537A',minHeight:'18px',textAlign:'center'}},'');
  box.appendChild(display); box.appendChild(errMsg);
  const keypad=el('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',width:'100%'}});
  ['1','2','3','4','5','6','7','8','9','','0','⌫'].forEach(k=>{
    if(!k){keypad.appendChild(el('div',{}));return;}
    keypad.appendChild(el('button',{style:{padding:'18px',fontSize:'22px',fontFamily:'"DM Serif Display",serif',border:'1.5px solid #EBEBEF',borderRadius:'12px',background:'#fff',cursor:'pointer',color:'#1A1A2E'},
      onclick:()=>{
        if(k==='⌫') pinInput=pinInput.slice(0,-1);
        else if(pinInput.length<4) pinInput+=k;
        display.textContent=pinInput.length>0?'●'.repeat(pinInput.length):'—';
        errMsg.textContent='';
      }},k));
  });
  box.appendChild(keypad);
  box.appendChild(el('button',{style:{width:'100%',padding:'14px',background:'#7B61FF',color:'#fff',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'},
    onclick:()=>{
      const found=STAFF.find(s=>s.pin===pinInput);
      if(found){currentUser=found;render();}
      else{errMsg.textContent='IDが正しくありません';pinInput='';display.textContent='—';}
    }},'ログイン'));
  wrap.appendChild(box); return wrap;
}

function renderApp() {
  const st=getStore(currentUser.store);
  const TABS=[
    {key:'daily',icon:'✏️',label:'日報'},
    {key:'sales',icon:'📊',label:'売上'},
    {key:'edu',icon:'📚',label:'教育'},
    {key:'shift',icon:'📅',label:'シフト'},
    {key:'profile',icon:'👤',label:'マイページ'},
  ];
  const titles={daily:'日報',sales:'売上',edu:'教育',shift:'シフト管理',profile:'マイページ'};
  const content=el('div',{style:{flex:'1',padding:'16px 16px 80px',overflowY:'auto'}});
  content.appendChild(el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'22px',color:'#1A1A2E',marginBottom:'16px'}},titles[currentTab]));
  if(currentTab==='daily') content.appendChild(renderDaily());
  else if(currentTab==='sales') content.appendChild(renderSales());
  else if(currentTab==='edu') content.appendChild(renderEdu());
  else if(currentTab==='shift') content.appendChild(renderShift());
  else if(currentTab==='profile') content.appendChild(renderProfile());
  const nav=el('nav',{style:{display:'flex',background:'#fff',borderTop:'1px solid #EBEBEF',position:'fixed',bottom:'0',left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',zIndex:'100'}});
  TABS.forEach(t=>nav.appendChild(el('button',{
    style:{flex:'1',padding:'10px 2px 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',cursor:'pointer',border:'none',background:'none',color:currentTab===t.key?'#7B61FF':'#A0A0B0',fontSize:'7.5px',borderTop:`2.5px solid ${currentTab===t.key?'#7B61FF':'transparent'}`},
    onclick:()=>{currentTab=t.key;currentStore=null;currentStaffPin=null;currentEduPin=null;showAddLesson=false;selectedDate=null;render();}
  },el('span',{style:{fontSize:'18px'}},t.icon),t.label)));
  return el('div',{style:{display:'flex',flexDirection:'column',minHeight:'100vh',maxWidth:'430px',margin:'0 auto',background:'#F7F7F9'}},
    el('div',{style:{padding:'16px 20px 12px',background:'#fff',borderBottom:'1px solid #EBEBEF',position:'sticky',top:'0',zIndex:'100'}},
      el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between'}},
        el('div',{},
          el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'20px',letterSpacing:'0.08em'}},'dipty',el('em',{style:{color:'#7B61FF'}},'MOILA')),
          el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'2px'}},todayStr)
        ),
        el('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},
          el('div',{style:{width:'32px',height:'32px',borderRadius:'50%',background:st.color+'22',border:`1.5px solid ${st.color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'700',color:st.color}},currentUser.av),
          el('button',{style:{width:'36px',height:'36px',border:'1.5px solid #EBEBEF',borderRadius:'50%',background:'#fff',cursor:'pointer',fontSize:'14px'},onclick:()=>{currentUser=null;render();}},'🚪')
        )
      )
    ),
    content,nav
  );
}

function card(children,style={}){
  return el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'16px',padding:'18px',marginBottom:'12px',...style}},...children);
}
function storeGrid(onClick,badge){
  return el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'16px'}},
    ...STORES.map(s=>{
      const members=STAFF.filter(m=>m.store===s.id);
      return el('div',{style:{background:'#fff',border:`2px solid ${s.color}33`,borderRadius:'16px',padding:'24px 16px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'},onclick:()=>onClick(s.id)},
        el('div',{style:{fontSize:'16px',fontWeight:'700',color:s.color}},s.name),
        el('div',{style:{fontSize:'10px',color:'#6B6B80'}},badge?badge(s,members):`${members.length}名`)
      );
    })
  );
}
function breadcrumb(items){
  const wrap=el('div',{style:{display:'flex',alignItems:'center',gap:'6px',marginBottom:'16px',flexWrap:'wrap'}});
  items.forEach((item,i)=>{
    if(i>0) wrap.appendChild(el('span',{style:{color:'#A0A0B0',fontSize:'14px'}},'›'));
    if(item.onClick) wrap.appendChild(el('button',{style:{padding:'5px 12px',borderRadius:'20px',border:'1.5px solid #EBEBEF',background:'#fff',cursor:'pointer',fontSize:'12px',fontWeight:'500',color:'#6B6B80'},onclick:item.onClick},item.label));
    else wrap.appendChild(el('span',{style:{fontSize:'12px',fontWeight:'700',color:'#1A1A2E'}},item.label));
  });
  return wrap;
}
function stepper(val,onChange){
  const display=el('div',{style:{width:'52px',height:'36px',border:'1.5px solid #EBEBEF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',background:'#fff'}},String(val));
  return el('div',{style:{display:'flex',alignItems:'center'}},
    el('button',{style:{width:'36px',height:'36px',border:'1.5px solid #EBEBEF',borderRight:'none',borderRadius:'10px 0 0 10px',background:'#F7F7F9',color:'#7B61FF',fontSize:'20px',cursor:'pointer'},onclick:()=>{val=Math.max(0,val-1);display.textContent=val;onChange(val);}},'−'),
    display,
    el('button',{style:{width:'36px',height:'36px',border:'1.5px solid #EBEBEF',borderLeft:'none',borderRadius:'0 10px 10px 0',background:'#F7F7F9',color:'#7B61FF',fontSize:'20px',cursor:'pointer'},onclick:()=>{val=val+1;display.textContent=val;onChange(val);}},'＋')
  );
}
function statBox(label,value,color){
  return el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'14px',padding:'14px',textAlign:'center'}},
    el('div',{style:{fontSize:'10px',color:'#A0A0B0',marginBottom:'4px'}},label),
    el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'20px',color:color||'#1A1A2E'}},value)
  );
}

function renderDaily(){
  const wrap=el('div',{});
  if(currentStaffPin){
    const member=STAFF.find(s=>s.pin===currentStaffPin);
    const st=getStore(member.store);
    const d=dailyData[currentStaffPin]||genDailyDefault()[currentStaffPin];
    wrap.appendChild(breadcrumb([{label:'← 店舗',onClick:()=>{currentStore=null;currentStaffPin=null;render();}},{label:st.name,onClick:()=>{currentStaffPin=null;render();}},{label:member.name.split(' ')[0]}]));
    const instaPct=Math.min(100,d.instaTarget>0?Math.round(d.instaCurrent/d.instaTarget*100):0);
    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'14px',paddingBottom:'10px',borderBottom:'1.5px solid #EBEBEF'}},'📸 インスタ投稿数'),
      el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}},
        el('div',{},el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'6px'}},'今月の目標'),stepper(d.instaTarget,v=>{d.instaTarget=v;})),
        el('div',{},el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'6px'}},'現在の投稿数'),stepper(d.instaCurrent,v=>{d.instaCurrent=v;}))
      ),
      el('div',{style:{height:'8px',background:'#F7F7F9',borderRadius:'4px',overflow:'hidden'}},el('div',{style:{height:'100%',width:`${instaPct}%`,background:'linear-gradient(90deg,#7B61FF,#E8537A)',borderRadius:'4px'}})),
      el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'6px',textAlign:'right'}},`${d.instaCurrent}/${d.instaTarget}件 — ${instaPct}%`)
    ]));
    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'14px',paddingBottom:'10px',borderBottom:'1.5px solid #EBEBEF'}},'📅 予約・新規'),
      ...['残りの予約件数:remaining','新規のお客様数:newClients'].map(s=>{
        const [label,field]=s.split(':');
        return el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}},el('div',{style:{fontSize:'13px'}},label),stepper(d[field],v=>{d[field]=v;}));
      })
    ]));
    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'14px',paddingBottom:'10px',borderBottom:'1.5px solid #EBEBEF'}},'🔀 新規 流入経路'),
      el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}},
        ...['🌶️ ホットペッパー:hotpepper','📸 インスタ:instagram','🤝 紹介:referral','🔗 LP:lp'].map(s=>{
          const [label,field]=s.split(':');
          return el('div',{style:{background:'#F7F7F9',border:'1px solid #EBEBEF',borderRadius:'12px',padding:'12px'}},el('div',{style:{fontSize:'11px',color:'#6B6B80',marginBottom:'8px'}},label),stepper(d[field]||0,v=>{d[field]=v;}));
        })
      )
    ]));
    wrap.appendChild(el('button',{style:{width:'100%',padding:'15px',border:'none',borderRadius:'14px',background:st.color,color:'#fff',fontSize:'14px',fontWeight:'700',cursor:'pointer'},onclick:()=>{d.saved=true;dailyData[currentStaffPin]=d;saveDaily(dailyData);currentStaffPin=null;render();}},'入力を保存する'));
    return wrap;
  }
  if(currentStore){
    const st=getStore(currentStore);
    const members=STAFF.filter(s=>s.store===currentStore);
    wrap.appendChild(breadcrumb([{label:'← 店舗',onClick:()=>{currentStore=null;render();}},{label:st.name}]));
    const grid=el('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}});
    members.forEach(m=>{
      const d=dailyData[m.pin]||{};
      grid.appendChild(el('div',{style:{background:'#fff',border:`2px solid ${d.saved?st.color+'55':'#EBEBEF'}`,borderRadius:'14px',padding:'14px 8px',cursor:'pointer',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'},onclick:()=>{currentStaffPin=m.pin;render();}},
        el('div',{style:{width:'44px',height:'44px',borderRadius:'50%',background:(d.saved?st.color:'#ccc')+'22',border:`1.5px solid ${d.saved?st.color:'#ccc'}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'700',color:d.saved?st.color:'#ccc'}},m.av),
        el('div',{style:{fontSize:'11px',fontWeight:'500',lineHeight:'1.4'}},m.name),
        el('div',{style:{fontSize:'9px',color:d.saved?'#3DBD8A':'#F5A623',fontWeight:'600'}},d.saved?'入力済':'未入力')
      ));
    });
    wrap.appendChild(grid); return wrap;
  }
  wrap.appendChild(storeGrid(id=>{currentStore=id;render();},(s,members)=>{const n=members.filter(m=>dailyData[m.pin]?.saved).length;return `${n}/${members.length}名 入力済`;}));
  return wrap;
}

function renderSales(){
  const wrap=el('div',{});
  wrap.appendChild(card([
    el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px',paddingBottom:'10px',borderBottom:'1.5px solid #EBEBEF'}},'📂 POSデータ取り込み'),
    el('textarea',{style:{width:'100%',height:'100px',padding:'10px',border:'1.5px solid #EBEBEF',borderRadius:'10px',fontSize:'11px',resize:'vertical',fontFamily:'monospace',boxSizing:'border-box'},placeholder:'ここにCSVデータを貼り付け...',id:'csv-input'}),
    el('button',{style:{width:'100%',padding:'12px',background:'#7B61FF',color:'#fff',border:'none',borderRadius:'10px',fontSize:'13px',fontWeight:'700',cursor:'pointer',marginTop:'8px'},onclick:()=>{
      const text=document.getElementById('csv-input').value;
      if(!text.trim()) return;
      SALES_DATA=parseCSVData(text); saveSales(SALES_DATA);
      document.getElementById('csv-input').value='';
      alert('✓ データを取り込みました！'); render();
    }},'取り込む')
  ]));
  if(currentStaffPin){
    const member=STAFF.find(s=>s.pin===currentStaffPin);
    const st=getStore(member.store);
    const d=SALES_DATA[currentStaffPin]||{total:0,gijutsu:0,shohin:0,gijutsu_clients:0,shohin_clients:0,shinki:0,rairai:0,kotei:0,gobusata:0,target:500000};
    const totalClients=d.shinki+d.rairai+d.kotei+(d.gobusata||0);
    const pct=d.target>0?Math.round(d.total/d.target*100):0;
    const shopRate=totalClients>0?Math.round((d.shohin_clients||0)/totalClients*100):0;
    wrap.appendChild(breadcrumb([{label:'← 店舗',onClick:()=>{currentStore=null;currentStaffPin=null;render();}},{label:st.name,onClick:()=>{currentStaffPin=null;render();}},{label:member.name.split(' ')[0]}]));
    wrap.appendChild(card([el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px'}},'💰 売上'),el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}},statBox('総売上',fmt(d.total),st.color),statBox('技術売上',fmt(d.gijutsu),'#7B61FF'),statBox('店販売上',fmt(d.shohin),'#3DBD8A'))]));
    wrap.appendChild(card([el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'8px'}},`目標達成率 — 目標 ${fmt(d.target)}`),el('div',{style:{height:'10px',background:'#F7F7F9',borderRadius:'5px',overflow:'hidden'}},el('div',{style:{height:'100%',width:`${Math.min(pct,100)}%`,background:pct>=100?'#3DBD8A':st.color,borderRadius:'5px'}})),el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'28px',color:pct>=100?'#3DBD8A':'#F5A623',marginTop:'6px'}},`${pct}%`)]));
    wrap.appendChild(card([el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px'}},'📐 単価'),el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}},statBox('総単価',totalClients>0?fmt(Math.round(d.total/totalClients)):'—','#1A1A2E'),statBox('技術単価',d.gijutsu_clients>0?fmt(Math.round(d.gijutsu/d.gijutsu_clients)):'—','#7B61FF'),statBox('商品単価',d.shohin_clients>0?fmt(Math.round(d.shohin/d.shohin_clients)):'—','#3DBD8A'))]));
    wrap.appendChild(card([el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px'}},'👥 客数'),el('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'8px'}},statBox('総客数',String(totalClients),'#1A1A2E'),statBox('技術客数',String(d.gijutsu_clients||0),'#7B61FF'),statBox('店販客数',String(d.shohin_clients||0),'#3DBD8A')),el('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}},statBox('新規',String(d.shinki||0),'#E8537A'),statBox('再来',String(d.rairai||0),'#F5A623'),statBox('固定',String(d.kotei||0),'#7B61FF'),statBox('ごぶさた',String(d.gobusata||0),'#A0A0B0'))]));
    wrap.appendChild(card([el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'8px'}},'🛍️ 店販購買率'),el('div',{style:{display:'flex',alignItems:'baseline',gap:'4px'}},el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'48px',color:'#3DBD8A',lineHeight:'1'}},String(shopRate)),el('div',{style:{fontSize:'18px',color:'#3DBD8A'}},'%')),el('div',{style:{height:'8px',background:'#F7F7F9',borderRadius:'4px',overflow:'hidden',marginTop:'8px'}},el('div',{style:{height:'100%',width:`${shopRate}%`,background:'linear-gradient(90deg,#3DBD8A,#7BE8C0)',borderRadius:'4px'}})),el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'6px'}},`店販客数 ${d.shohin_clients||0}名 ÷ 総客数 ${totalClients}名`)]));
    return wrap;
  }
  if(currentStore){
    const st=getStore(currentStore);
    const members=STAFF.filter(s=>s.store===currentStore);
    const storeTotal=members.reduce((a,m)=>a+(SALES_DATA[m.pin]?.total||0),0);
    const storeGijutsu=members.reduce((a,m)=>a+(SALES_DATA[m.pin]?.gijutsu||0),0);
    const storeShohin=members.reduce((a,m)=>a+(SALES_DATA[m.pin]?.shohin||0),0);
    wrap.appendChild(breadcrumb([{label:'← 店舗',onClick:()=>{currentStore=null;render();}},{label:st.name}]));
    wrap.appendChild(card([el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px'}},'💰 店舗売上'),el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}},statBox('総売上',fmt(storeTotal),st.color),statBox('技術売上',fmt(storeGijutsu),'#7B61FF'),statBox('店販売上',fmt(storeShohin),'#3DBD8A'))]));
    const list=el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'16px',overflow:'hidden'}});
    members.forEach(m=>{
      const d=SALES_DATA[m.pin]||{total:0,target:500000};
      const p=d.target>0?Math.round(d.total/d.target*100):0;
      list.appendChild(el('div',{style:{display:'flex',alignItems:'center',padding:'13px 16px',borderBottom:'1px solid #EBEBEF',cursor:'pointer'},onclick:()=>{currentStaffPin=m.pin;render();}},
        el('div',{style:{width:'36px',height:'36px',borderRadius:'50%',background:st.color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',color:st.color,marginRight:'10px'}},m.av),
        el('div',{style:{flex:'1'}},el('div',{style:{fontSize:'13px',fontWeight:'600'}},m.name),el('div',{style:{fontSize:'10px',color:'#A0A0B0'}},`客数 ${(d.shinki||0)+(d.rairai||0)+(d.kotei||0)+(d.gobusata||0)}名`)),
        el('div',{style:{textAlign:'right',marginRight:'8px'}},el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'16px'}},fmt(d.total)),el('div',{style:{fontSize:'10px',color:p>=100?'#3DBD8A':'#F5A623',fontWeight:'600'}},`${p}%`)),
        el('span',{style:{color:'#A0A0B0'}},'›')
      ));
    });
    wrap.appendChild(list); return wrap;
  }
  const totalAll=STAFF.reduce((a,s)=>a+(SALES_DATA[s.pin]?.total||0),0);
  const gijutsuAll=STAFF.reduce((a,s)=>a+(SALES_DATA[s.pin]?.gijutsu||0),0);
  const shohinAll=STAFF.reduce((a,s)=>a+(SALES_DATA[s.pin]?.shohin||0),0);
  const targetAll=STAFF.reduce((a,s)=>a+(SALES_DATA[s.pin]?.target||500000),0);
  const pctAll=targetAll>0?Math.round(totalAll/targetAll*100):0;
  wrap.appendChild(card([el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px'}},'💰 全社売上'),el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'12px'}},statBox('総売上',fmt(totalAll),'#7B61FF'),statBox('技術売上',fmt(gijutsuAll),'#5B8DEF'),statBox('店販売上',fmt(shohinAll),'#3DBD8A')),el('div',{style:{height:'8px',background:'#F7F7F9',borderRadius:'4px',overflow:'hidden'}},el('div',{style:{height:'100%',width:`${Math.min(pctAll,100)}%`,background:'#7B61FF',borderRadius:'4px'}})),el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'6px'}},`目標 ${fmt(targetAll)} — ${pctAll}%`)]));
  wrap.appendChild(storeGrid(id=>{currentStore=id;render();},(s,members)=>{const t=members.reduce((a,m)=>a+(SALES_DATA[m.pin]?.total||0),0);return fmt(t);}));
  return wrap;
}

function renderEdu(){
  const wrap=el('div',{});
  const isEduStaff=EDU_STAFF.find(s=>s.pin===currentUser.pin);

  // アシスタント本人 → 自分のページへ直行
  if(isEduStaff && !currentEduPin){
    currentEduPin=currentUser.pin;
  }

  if(currentEduPin){
    const member=EDU_STAFF.find(s=>s.pin===currentEduPin);
    if(!member){ currentEduPin=null; render(); return wrap; }
    const st=getStore(member.store);
    const isOwn=currentUser.pin===currentEduPin;
    const year=currentEduMonth.getFullYear();
    const month=currentEduMonth.getMonth();
    const monthKey=`${currentEduPin}_${year}_${month+1}`;
    if(!eduData[monthKey]) eduData[monthKey]={lessons:[]};
    const data=eduData[monthKey];

    const backBtn = isEduStaff ? null : {label:'← 教育',onClick:()=>{currentEduPin=null;render();}};
    const crumbs=[{label:'← 教育',onClick:()=>{currentEduPin=null;render();}},{label:member.name}];
    if(!isEduStaff) wrap.appendChild(breadcrumb(crumbs));

    // 月切り替え
    wrap.appendChild(el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}},
      el('button',{style:{padding:'8px 16px',border:'1.5px solid #EBEBEF',borderRadius:'10px',background:'#fff',cursor:'pointer'},onclick:()=>{currentEduMonth=new Date(year,month-1,1);render();}},'◀'),
      el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'18px'}},`${year}年${month+1}月`),
      el('button',{style:{padding:'8px 16px',border:'1.5px solid #EBEBEF',borderRadius:'10px',background:'#fff',cursor:'pointer'},onclick:()=>{currentEduMonth=new Date(year,month+1,1);render();}},'▶')
    ));

    // カレンダー（レッスンがある日にドット）
    const firstDay=new Date(year,month,1).getDay();
    const daysInMonth=new Date(year,month+1,0).getDate();
    const calGrid=el('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px',marginBottom:'16px'}});
    ['日','月','火','水','木','金','土'].forEach(d=>calGrid.appendChild(el('div',{style:{textAlign:'center',fontSize:'10px',color:'#A0A0B0',padding:'4px'}},d)));
    for(let i=0;i<firstDay;i++) calGrid.appendChild(el('div',{}));
    for(let d=1;d<=daysInMonth;d++){
      const hasLesson=data.lessons.some(l=>l.date===d);
      const isToday=d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
      calGrid.appendChild(el('div',{style:{textAlign:'center',padding:'6px 2px',borderRadius:'8px',fontSize:'12px',fontWeight:isToday?'700':'400',background:isToday?'#7B61FF22':'transparent',color:isToday?'#7B61FF':'#1A1A2E',position:'relative',cursor:'pointer'},
        onclick:()=>{
          const el2=document.getElementById('lesson-list');
          if(el2) el2.scrollIntoView({behavior:'smooth'});
        }
      },
        String(d),
        hasLesson?el('div',{style:{width:'5px',height:'5px',borderRadius:'50%',background:'#7B61FF',margin:'2px auto 0'}}):null
      ));
    }
    wrap.appendChild(card([
      el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px'}},'📅 カレンダー'),
      calGrid
    ]));

    // レッスン追加ボタン（本人のみ）
    if(isOwn){
      wrap.appendChild(el('button',{
        style:{width:'100%',padding:'14px',border:'2px dashed #7B61FF55',borderRadius:'14px',background:'#F3F0FF',color:'#7B61FF',fontSize:'14px',fontWeight:'600',cursor:'pointer',marginBottom:'12px'},
        onclick:()=>{showAddLesson=!showAddLesson;render();}
      },'＋ レッスンを追加'));

      if(showAddLesson){
        let newTitle='', newSub='', newDate=today.getDate();
        const titleInput=el('input',{style:{width:'100%',padding:'10px',border:'1.5px solid #EBEBEF',borderRadius:'10px',fontSize:'13px',marginBottom:'8px',boxSizing:'border-box'},placeholder:'レッスン名（例：シャンプー練習）',oninput:e=>{newTitle=e.target.value;}});
        const subInput=el('input',{style:{width:'100%',padding:'10px',border:'1.5px solid #EBEBEF',borderRadius:'10px',fontSize:'13px',marginBottom:'8px',boxSizing:'border-box'},placeholder:'サブタイトル（例：泡立て・すすぎ）',oninput:e=>{newSub=e.target.value;}});
        const dateInput=el('input',{type:'number',min:'1',max:String(daysInMonth),style:{width:'100%',padding:'10px',border:'1.5px solid #EBEBEF',borderRadius:'10px',fontSize:'13px',marginBottom:'8px',boxSizing:'border-box'},placeholder:`日付（1〜${daysInMonth}）`,oninput:e=>{newDate=parseInt(e.target.value)||today.getDate();}});
        wrap.appendChild(card([
          el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'12px'}},'📝 新しいレッスン'),
          titleInput, subInput, dateInput,
          el('button',{
            style:{width:'100%',padding:'12px',background:'#7B61FF',color:'#fff',border:'none',borderRadius:'10px',fontSize:'13px',fontWeight:'700',cursor:'pointer'},
            onclick:()=>{
              if(!newTitle.trim()) return;
              data.lessons.push({id:Date.now(),date:newDate,title:newTitle,sub:newSub,result:null,memo:''});
              data.lessons.sort((a,b)=>a.date-b.date);
              eduData[monthKey]=data; saveEdu(eduData);
              showAddLesson=false; render();
            }
          },'追加する')
        ]));
      }
    }

    // レッスン一覧
    const listDiv=el('div',{id:'lesson-list'});
    if(data.lessons.length===0){
      listDiv.appendChild(el('div',{style:{textAlign:'center',color:'#A0A0B0',fontSize:'13px',padding:'24px'}},'レッスンがまだありません'));
    } else {
      data.lessons.forEach((lesson,idx)=>{
        const lessonCard=el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'16px',padding:'16px',marginBottom:'12px'}});
        // ヘッダー
        lessonCard.appendChild(el('div',{style:{display:'flex',alignItems:'flex-start',gap:'12px',marginBottom:'12px'}},
          el('div',{style:{background:'#7B61FF22',borderRadius:'10px',padding:'8px 10px',textAlign:'center',minWidth:'44px'}},
            el('div',{style:{fontSize:'10px',color:'#7B61FF',fontWeight:'600'}},MONTHS[month]),
            el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'22px',color:'#7B61FF',lineHeight:'1'}},String(lesson.date))
          ),
          el('div',{style:{flex:'1'}},
            el('div',{style:{fontSize:'14px',fontWeight:'700',marginBottom:'2px'}},lesson.title),
            lesson.sub?el('div',{style:{fontSize:'12px',color:'#A0A0B0'}},lesson.sub):null
          ),
          isOwn?el('button',{style:{background:'none',border:'none',color:'#E8537A',cursor:'pointer',fontSize:'18px',padding:'0'},onclick:()=>{
            data.lessons.splice(idx,1); eduData[monthKey]=data; saveEdu(eduData); render();
          }},'×'):null
        ));
        // できた/できなかった（本人のみ編集可）
        const okStyle=(active)=>({padding:'8px 18px',borderRadius:'20px',border:`1.5px solid ${active?'#3DBD8A':'#EBEBEF'}`,background:active?'#EDFBF4':'#fff',color:active?'#3DBD8A':'#A0A0B0',cursor:'pointer',fontSize:'13px',fontWeight:'600'});
        const ngStyle=(active)=>({padding:'8px 18px',borderRadius:'20px',border:`1.5px solid ${active?'#E8537A':'#EBEBEF'}`,background:active?'#FFF0F4':'#fff',color:active?'#E8537A':'#A0A0B0',cursor:'pointer',fontSize:'13px',fontWeight:'600'});
        const btnRow=el('div',{style:{display:'flex',gap:'10px',marginBottom:'10px'}},
          el('button',{style:okStyle(lesson.result==='ok'),onclick:isOwn?()=>{lesson.result=lesson.result==='ok'?null:'ok';eduData[monthKey]=data;saveEdu(eduData);render();}:null},'✓ できた'),
          el('button',{style:ngStyle(lesson.result==='ng'),onclick:isOwn?()=>{lesson.result=lesson.result==='ng'?null:'ng';eduData[monthKey]=data;saveEdu(eduData);render();}:null},'✗ できなかった')
        );
        lessonCard.appendChild(btnRow);
        // メモ
        if(isOwn){
          const memoInput=el('textarea',{style:{width:'100%',padding:'10px',border:'1.5px solid #EBEBEF',borderRadius:'10px',fontSize:'12px',resize:'none',height:'70px',boxSizing:'border-box'},placeholder:'コメントを入力...',oninput:e=>{lesson.memo=e.target.value;eduData[monthKey]=data;saveEdu(eduData);}});
          memoInput.value=lesson.memo||'';
          lessonCard.appendChild(memoInput);
        } else if(lesson.memo){
          lessonCard.appendChild(el('div',{style:{background:'#F7F7F9',borderRadius:'10px',padding:'10px',fontSize:'12px',color:'#6B6B80'}},lesson.memo));
        }
        listDiv.appendChild(lessonCard);
      });
    }
    wrap.appendChild(el('div',{style:{fontSize:'11px',fontWeight:'700',color:'#6B6B80',marginBottom:'10px'}},'📋 スケジュール一覧'));
    wrap.appendChild(listDiv);
    return wrap;
  }

  // 店舗選択 → スタッフ選択
  const eduStores=[{id:'honten',name:'Hair 本店',color:'#7B61FF'},{id:'tuelu',name:'tuelu',color:'#5B8DEF'}];
  if(currentStore){
    const st=getStore(currentStore);
    const members=EDU_STAFF.filter(s=>s.store===currentStore);
    wrap.appendChild(breadcrumb([{label:'← 教育',onClick:()=>{currentStore=null;render();}},{label:st.name}]));
    const grid=el('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}});
    members.forEach(m=>{
      const mSt=getStore(m.store);
      grid.appendChild(el('div',{style:{background:'#fff',border:'2px solid #EBEBEF',borderRadius:'14px',padding:'14px 8px',cursor:'pointer',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'},onclick:()=>{currentEduPin=m.pin;render();}},
        el('div',{style:{width:'44px',height:'44px',borderRadius:'50%',background:mSt.color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'700',color:mSt.color}},m.name[0]),
        el('div',{style:{fontSize:'11px',fontWeight:'500',lineHeight:'1.4'}},m.name)
      ));
    });
    wrap.appendChild(grid); return wrap;
  }
  wrap.appendChild(el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}},
    ...eduStores.map(s=>el('div',{style:{background:'#fff',border:`2px solid ${s.color}33`,borderRadius:'16px',padding:'24px 16px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'},onclick:()=>{currentStore=s.id;render();}},
      el('div',{style:{fontSize:'16px',fontWeight:'700',color:s.color}},s.name),
      el('div',{style:{fontSize:'10px',color:'#6B6B80'}},`${EDU_STAFF.filter(m=>m.store===s.id).length}名`)
    ))
  ));
  return wrap;
}

function renderShift(){
  const wrap=el('div',{});
  const DOW_SHORT=['日','月','火','水','木','金','土'];
  const dates=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-d.getDay()+i);return {day:DOW_SHORT[d.getDay()],num:d.getDate(),active:d.toDateString()===today.toDateString()};});
  const genShifts=storeId=>STAFF.filter(s=>s.store===storeId).map(m=>{const r=(m.id*7+3)%10;return {...m,status:r<1?'有休':r<2?'休み':'出勤',start:m.id%2===0?'10:00':'09:00',end:m.id%2===0?'19:00':'18:00'};});
  if(currentStore){
    const st=getStore(currentStore);
    const shifts=genShifts(currentStore);
    wrap.appendChild(breadcrumb([{label:'← 店舗一覧',onClick:()=>{currentStore=null;render();}},{label:st.name}]));
    const dateRow=el('div',{style:{display:'flex',gap:'8px',marginBottom:'14px',overflowX:'auto'}});
    dates.forEach(d=>dateRow.appendChild(el('div',{style:{flexShrink:'0',width:'50px',padding:'10px 0',textAlign:'center',border:`1.5px solid ${d.active?'#7B61FF':'#EBEBEF'}`,borderRadius:'12px',background:d.active?'#7B61FF':'#fff',color:d.active?'#fff':'#1A1A2E'}},el('div',{style:{fontSize:'10px'}},d.day),el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'22px',lineHeight:'1.1'}},String(d.num)))));
    wrap.appendChild(dateRow);
    const stats=el('div',{style:{display:'flex',gap:'10px',marginBottom:'14px'}});
    [{val:shifts.filter(s=>s.status==='出勤').length,label:'出勤',color:'#3DBD8A'},{val:shifts.filter(s=>s.status==='有休').length,label:'有休',color:'#F5A623'},{val:shifts.filter(s=>s.status==='休み').length,label:'休み',color:'#E8537A'},{val:shifts.length,label:'総員',color:'#1A1A2E'}].forEach(item=>stats.appendChild(el('div',{style:{flex:'1',padding:'14px 8px',borderRadius:'14px',textAlign:'center',background:'#fff',border:'1px solid #EBEBEF'}},el('div',{style:{fontFamily:'"DM Serif Display",serif',fontSize:'28px',color:item.color,lineHeight:'1'}},String(item.val)),el('div',{style:{fontSize:'10px',color:'#A0A0B0',marginTop:'4px'}},item.label))));
    wrap.appendChild(stats);
    const list=el('div',{style:{background:'#fff',border:'1px solid #EBEBEF',borderRadius:'16px',overflow:'hidden'}});
    shifts.forEach(m=>list.appendChild(el('div',{style:{display:'flex',alignItems:'center',padding:'13px 16px',borderBottom:'1px solid #EBEBEF'}},el('div',{style:{width:'40px',height:'40px',borderRadius:'50%',background:m.status==='出勤'?st.color+'22':'#F7F7F9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'700',color:m.status==='出勤'?st.color:'#A0A0B0',marginRight:'12px'}},m.av),el('div',{style:{flex:'1'}},el('div',{style:{fontSize:'13px',fontWeight:'500'}},m.name),m.status==='出勤'?el('div',{style:{fontSize:'11px',color:'#A0A0B0'}},`${m.start} – ${m.end}`):el('span',{})),el('span',{style:{padding:'2px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:'500',background:m.status==='出勤'?'rgba(61,189,138,0.12)':m.status==='有休'?'rgba(232,83,122,0.1)':'rgba(160,160,176,0.12)',color:m.status==='出勤'?'#3DBD8A':m.status==='有休'?'#E8537A':'#A0A0B0'}},m.status))));
    wrap.appendChild(list); return wrap;
  }
  wrap.appendChild(storeGrid(id=>{currentStore=id;render();},(s,members)=>{const shifts=genShifts(s.id);return `出勤 ${shifts.filter(s=>s.status==='出勤').length}/${members.length}名`;}));
  return wrap;
}

function renderProfile(){
  const st=getStore(currentUser.store);
  const d=SALES_DATA[currentUser.pin]||{total:0,target:500000};
  const pct=d.target>0?Math.round(d.total/d.target*100):0;
  const wrap=el('div',{});
  wrap.appendChild(el('div',{style:{display:'flex',alignItems:'center',gap:'14px',padding:'18px',background:'#fff',border:'1px solid #EBEBEF',borderRadius:'16px',marginBottom:'12px'}},
    el('div',{style:{width:'56px',height:'56px',borderRadius:'50%',background:st.color+'33',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'700',color:st.color}},currentUser.av),
    el('div',{},el('div',{style:{fontSize:'16px',fontWeight:'700',marginBottom:'2px'}},currentUser.name),el('div',{style:{fontSize:'12px',color:st.color,fontWeight:'500'}},st.name),el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginTop:'2px'}},`ID: ${currentUser.pin}`))
  ));
  wrap.appendChild(card([
    el('div',{style:{fontSize:'11px',color:'#A0A0B0',marginBottom:'12px'}},'個人売上実績'),
    el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'10px'}},statBox('総売上',fmt(d.total),st.color),statBox('技術',fmt(d.gijutsu||0),'#7B61FF'),statBox('店販',fmt(d.shohin||0),'#3DBD8A')),
    el('div',{style:{height:'8px',background:'#F7F7F9',borderRadius:'4px',overflow:'hidden'}},el('div',{style:{height:'100%',width:`${Math.min(pct,100)}%`,background:pct>=100?'#3DBD8A':st.color,borderRadius:'4px'}})),
    el('div',{style:{fontSize:'11px',color:pct>=100?'#3DBD8A':'#F5A623',fontWeight:'600',marginTop:'6px'}},`達成率 ${pct}%`)
  ]));
  ['📅 勤怠記録','📨 シフト希望提出','📢 お知らせ','⚙️ 設定'].forEach(label=>{
    wrap.appendChild(el('div',{style:{display:'flex',alignItems:'center',padding:'15px 18px',background:'#fff',border:'1px solid #EBEBEF',borderRadius:'14px',marginBottom:'8px',cursor:'pointer'}},el('span',{style:{flex:'1',fontSize:'13px',fontWeight:'500'}},label),el('span',{style:{color:'#A0A0B0',fontSize:'18px'}},'›')));
  });
  return wrap;
}

render();
