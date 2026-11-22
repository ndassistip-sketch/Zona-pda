const APPV="0.3";
/* ===== utili ===== */
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const d=n=>1+Math.floor(Math.random()*n);
const pk=a=>a[Math.floor(Math.random()*a.length)];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const fmtR=n=>(+n||0).toLocaleString("it-IT")+" ₽";
const fs=n=>(+n||0).toLocaleString("it-IT",{maximumFractionDigits:2});
const clone=o=>JSON.parse(JSON.stringify(o));
function deep(a,b){for(const k in b){if(b[k]&&typeof b[k]==="object"&&!Array.isArray(b[k])){a[k]=deep(a[k]&&typeof a[k]==="object"?a[k]:{},b[k]);}else a[k]=b[k];}return a;}
let toastT;function toast(t){let el=document.querySelector(".toast");if(!el){el=document.createElement("div");el.className="toast";document.body.appendChild(el);}el.textContent=t;clearTimeout(toastT);toastT=setTimeout(()=>el.remove(),2600);}

/* ===== regole ===== */
const DIE={A:12,B:10,C:8,D:6};
const DN={A:"B",B:"C",C:"D",D:null},UP={D:"C",C:"B",B:"A",A:"A"};
const ATTR=[["forza","Forza"],["agilita","Agilità"],["intelletto","Intelletto"],["empatia","Empatia"]];
const SK={forza:[["armi_pesanti","Armi pesanti"],["corpo","Corpo a corpo"],["resistenza","Resistenza"]],agilita:[["guida","Guida"],["mobilita","Mobilità"],["tiro","Tiro"]],intelletto:[["ricognizione","Ricognizione"],["sopravvivenza","Sopravvivenza"],["tecnica","Tecnica"]],empatia:[["comando","Comando"],["persuasione","Persuasione"],["pronto","Pronto soccorso"]]};
const SKN=Object.fromEntries(Object.values(SK).flat());
const ATN=Object.fromEntries(ATTR);ATN.sf="Sangue freddo";
const TR=[["ferite","Ferite"],["fatica","Fatica"],["nervi","Nervi"],["freddo","Freddo"],["fame","Fame"],["sete","Sete"],["rad","Radiazioni"]];
const FAZ=["Mercante del Cordone","Barman","Dovere","Libertà","Scienziati","Esercito","Stalker liberi","Banditi","Mercenari"];
const NOMELV=n=>n>=40?"Guida di nome":n>=25?"Rispettato":n>=12?"Affidabile":n>=5?"Conosciuto":"Novellino";
const RAPLV=n=>n>=8?"livello 3":n>=3?"livello 2":"livello 1";
const ZONE=[["Cordone",1],["Discarica",2],["Agroprom",2],["Valle Oscura",3],["Bar e Rostok",2],["Yantar",3],["Magazzini dell'esercito",3],["Foresta Rossa",4],["Radar",5],["Pripjat'",5],["La centrale",5],["Janiv e Jupiter",3],["Zaton",3],["Sotterranei e laboratori",4]];
const EDGES=[["Cordone","Discarica",6,3,"ponte ferroviario o galleria (militari sul ponte)"],["Discarica","Agroprom",5,3,"strada a ovest"],["Discarica","Valle Oscura",6,3,"strada a est, banditi"],["Discarica","Bar e Rostok",4,2,"cancello a nord, posto del Dovere"],["Agroprom","Bar e Rostok",6,4,"sotterranei o bosco"],["Bar e Rostok","Yantar",6,4,"terre selvagge"],["Bar e Rostok","Magazzini dell'esercito",6,3,"strada a nord"],["Magazzini dell'esercito","Radar",6,4,"la Barriera"],["Magazzini dell'esercito","Foresta Rossa",7,4,"bosco, campi di anomalie"],["Radar","Foresta Rossa",4,3,"bosco morto"],["Foresta Rossa","Janiv e Jupiter",5,3,"lungo la ferrovia"],["Janiv e Jupiter","Zaton",6,4,"paludi lungo il fiume"],["Janiv e Jupiter","Pripjat'",4,3,"strada della stazione"],["Radar","Pripjat'",8,5,"strada del radar, esposta"],["Pripjat'","La centrale",4,3,"l'ultimo tratto"]];
const SERV={"Cordone":"mercante (P3, classe 2) · tecnico improvvisato 30% · bunker 300 ₽","Valle Oscura":"mercante dei banditi (+20%, niente domande)","Bar e Rostok":"Barman (P4, classe 3) · tecnico del Dovere · medico · Bar 500 ₽","Yantar":"scienziati (P5, classe 4, artefatti +20%) · tecnico · medico","Magazzini dell'esercito":"Libertà (P4, classe 3) · tecnico · medico · 300 ₽","Janiv e Jupiter":"stazione di Janiv (P5, classe 4) · tecnico famoso 10% · medico · 500 ₽","Zaton":"la nave (P5, classe 4) · tecnico 15% · medico · 500 ₽"};
const nbr=z=>EDGES.filter(e=>e[0]===z||e[1]===z).map(e=>e[0]===z?e[1]:e[0]);
function path(a,b){const dist={[a]:0},prev={},q=[a],seen=new Set();while(q.length){q.sort((x,y)=>dist[x]-dist[y]);const u=q.shift();if(seen.has(u))continue;seen.add(u);if(u===b)break;for(const e of EDGES){if(e[0]!==u&&e[1]!==u)continue;const v=e[0]===u?e[1]:e[0];const nd=dist[u]+e[3];if(dist[v]==null||nd<dist[v]){dist[v]=nd;prev[v]=u;q.push(v);}}}
  if(dist[b]==null)return null;const p=[b];while(p[0]!==a)p.unshift(prev[p[0]]);return p;}
const edge=(a,b)=>EDGES.find(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a));
const perOf=z=>ZONE.find(x=>x[0]===z)?.[1]||1;
/* luce e temperature per mese: alba, buio, min, max */
const LUCE=[0,["7:50","16:15",-8,-1],["7:10","17:10",-7,0],["6:10","18:00",-2,6],["6:15","20:00",4,15],["5:15","20:45",9,21],["4:45","21:15",13,24],["5:00","21:15",15,26],["5:45","20:20",14,25],["6:30","19:15",8,19],["7:15","18:00",3,13],["6:50","16:15",-1,5],["7:50","15:50",-5,0]];
const STAG=m=>m>=9&&m<=11?"autunno":m===12||m<=2?"inverno":m<=5?"primavera":"estate";
const METEO={autunno:["sereno","nuvoloso","nebbia al mattino","pioggia leggera","pioggia forte","temporale (da metà novembre: nevischio)"],inverno:["sereno gelido","nuvoloso","nuvoloso","nevicata","nebbia","tormenta"],primavera:["sereno","sereno","nuvoloso","pioggia","nebbia","temporale"],estate:["sereno, caldo","sereno, caldo","sereno, caldo","afoso","pioggia","temporale"]};

/* ===== tabelle del solitario (nostre) ===== */
const AZ=["cercare","nascondere","tradire","proteggere","fuggire","chiedere","offrire","rubare","aspettare","inseguire","ingannare","curare","rompere","aprire","seguire","attaccare","trattare","perdere","trovare","avvertire","mentire","pagare","minacciare","abbandonare","tornare","sorvegliare","scambiare","salvare","uccidere","spiare"];
const TE=["un debito","un artefatto","una rotta","il cibo","il freddo","le radiazioni","la fiducia","la paura","i soldi","le munizioni","un morto","un segreto","una fazione","il mercante","una mappa","l'Emissione","una tana","un ferito","la notte","il silenzio","un PDA","un nome","una promessa","la fame","un rifugio","una trappola","l'esercito","un amico","un'anomalia","il nord"];
const FOCUS=["Un PNG che conosci fa una mossa","Arriva qualcuno di nuovo","Un pericolo si avvicina","Torna un filo aperto","Il tempo cambia","Un segno dell'Emissione (vero o falso)","Una notizia sulla rete del PDA","Qualcosa si rompe o si perde","Un'occasione inattesa","Mutanti","Una fazione si muove","La Zona cambia: un'anomalia nuova"];
const FA=["Fa quello che aveva detto","Cambia idea all'ultimo","Chiede qualcosa in cambio","Se ne va, o sparisce","Dice la verità, ma non tutta","Mente per paura","Offre un aiuto non richiesto","Si mette in mezzo","Aspetta e guarda","Fa la cosa più pericolosa"];
const REAZ=[[4,"Rifiuta, e si offende o diventa ostile"],[6,"Diffidente: no, per ora"],[9,"Accetta, ma con un prezzo"],[11,"Accetta volentieri"],[99,"Accetta e offre di più"]];
const VIAGGIO=[[5,"Calma. La strada è vuota."],[7,"Segni: tracce, versi, una carcassa. Qualcosa è passato da qui."],[8,"Un'anomalia sulla strada."],[9,"Umani: stalker, banditi o una pattuglia."],[10,"Mutanti."],[11,"Una scoperta: un nascondiglio, un cadavere con lo zaino, un campo di anomalie con qualcosa dentro."],[99,"Due guai insieme."]];
const NOMI=["Andrij","Serhij","Mykola","Oleh","Taras","Vasyl'","Dmytro","Pavlo","Jurij","Roman","Viktor","Bohdan","Kostja","Fedir","Ihor","Leonid"];
const SOPR=["Kuznec","Sych","Bes","Chudoj","Pečnik","Lis","Grach","Molčun","Doc","Kozak","Šustryj","Rybak","Vint","Sapog","Muchа","Tichij"];
const FAZN=["stalker libero","stalker libero","novellino","bandito","Dovere","Libertà","mercenario","scienziato","militare","mercante"];
const CAR=["parla troppo","non guarda negli occhi","ride sempre, anche quando non c'è da ridere","prega prima di mangiare","conta i soldi due volte","zoppica e non dice perché","gentile con tutti, di nessuno si fida","beve dalla mattina","silenzioso, osserva","nervoso, mano sempre sull'arma","racconta storie che nessuno crede","stanco morto"];
const VUOLE=["soldi per uscire dalla Zona","ritrovare un amico sparito","un artefatto preciso","vendetta","un posto in una fazione","pagare un debito","arrivare a nord","proteggere qualcuno","sapere cosa c'è al centro","un lavoro sicuro","farsi un nome","dimenticare"];
const TEME=["l'Emissione","i militari","un creditore","il buio","le anomalie","morire solo","i controllori","il Monolite","perdere la ragione","essere scoperto","la fame","tornare a casa"];
const SEGR=["ha venduto un compagno","ha un artefatto nascosto","è ricercato fuori","lavora per qualcun altro","sa una rotta che nessuno sa","ha visto il centro, o crede di sì","è malato","ha un figlio fuori","ha ucciso per un PDA","deve la vita a un mutante","non è chi dice di essere","sente voci dopo l'ultima Emissione"];

/* ===== stato ===== */
const DEF={pg:{nome:"",sopr:"",chi:"",att:{forza:"C",agilita:"C",intelletto:"C",empatia:"C"},sf:"D",sk:{},spec:"",note:""},
tr:{ferite:0,fatica:0,nervi:0,freddo:0,fame:0,sete:0,rad:0},pe:0,fortuna:true,rubli:0,nomeRep:0,rap:{},
scorte:{cibo:0,acqua:0,comb:0},cap:{addosso:8,zaino:24},
clock:{data:"2012-10-15",ora:"07:30",meteo:"",luogo:"Cordone"},emiss:0,allerta:0,tensione:5,lastBuy:null,corpo:[],eff:[],amb:{fuori:true},nasc:[],artUso:{},scontro:null,viaggio:null,anom:null,bestia:{}};
let db=null,conn="loading",S=clone(DEF),ARM=[];
const L={inv:[],pda:[],tiri:[],solo:[],diario:[],png:[]};
const ui={tab:"scheda",roll:null,acat:"armi",arar:"tutte",pdaTab:"rete",solo:[],dr:{a:"agilita",s:"tiro",p:0,m:0,tr:true}};
let saveT=null,dirty=false;
const LS={get(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
function save(){dirty=true;clearTimeout(saveT);saveT=setTimeout(async()=>{const snap=clone(S);if(db){try{await db.doc("stato/main").set(snap);}catch(e){toast("Non salvato: riprovo alla prossima modifica.");}}else LS.set("pda.stato",snap);dirty=false;},450);render();}
function set(path,val){const p=path.split(".");let o=S;p.slice(0,-1).forEach(k=>o=o[k]=o[k]&&typeof o[k]==="object"?o[k]:{});o[p.at(-1)]=val;save();}
async function add(c,data){const id=uid();const doc={...data,ts:Date.now()};if(db){try{await db.collection(c).doc(id).set(doc);}catch(e){toast("Non salvato.");}}else{L[c].push({id,...doc});LS.set("pda."+c,L[c]);render();}return id;}
async function upd(c,id,data){if(db){try{await db.collection(c).doc(id).update(data);}catch(e){toast("Non salvato.");}}else{const x=L[c].find(y=>y.id===id);if(x)Object.assign(x,data);LS.set("pda."+c,L[c]);render();}}
async function del(c,id){if(db){try{await db.collection(c).doc(id).delete();}catch(e){}}else{L[c]=L[c].filter(y=>y.id!==id);LS.set("pda."+c,L[c]);render();}}

/* ===== tempo ===== */
const month=()=>+(S.clock.data||"2012-10-15").slice(5,7)||10;
function adv(min){const d0=S.clock.data;try{bleedTick(min);}catch(_){}try{ambTick(min);}catch(_){}const [y,m,dd]=(S.clock.data||"2012-10-15").split("-").map(Number);const [h,mi]=(S.clock.ora||"00:00").split(":").map(Number);const t=new Date(Date.UTC(y,m-1,dd,h||0,mi||0)+min*60000);
  S.clock.data=t.toISOString().slice(0,10);S.clock.ora=t.toISOString().slice(11,16);try{if(typeof evTick==="function")setTimeout(()=>evTick(min),0);}catch(_){}const nDays=Math.round((Date.parse(S.clock.data)-Date.parse(d0))/864e5);if(nDays>0){S.giorni=(+S.giorni||0)+nDays;ui.dayLater=false;}save();}
const dataIt=s=>{const [y,m,dd]=(s||"").split("-");return dd?`${+dd} ${["","gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"][+m]} ${y}`:"";};

/* ===== dadi ===== */
const succ=v=>v>=10?2:v>=6?1:0;
function malus(a){const t=S.tr;const lv=(v,f)=>f?(v>=5?2:v>=3?1:0):(v>=4?2:v>=3?1:0);let m=lv(t.fame)+lv(t.sete);
  if(a==="forza"||a==="agilita"){let fe=lv(t.ferite,1),fa=lv(t.fatica);try{fe=Math.max(0,fe-ferRid());if(fatIgn())fa=0;}catch(_){}m+=fa+lv(t.freddo)+fe;}else m+=lv(t.nervi);return Math.min(3,m);}
function grades(a,s,steps){let ga=a==="sf"?S.pg.sf:S.pg.att[a],gs=s?(S.pg.sk[s]||null):null;
  for(let i=0;i<-steps;i++){if(gs)gs=DN[gs];else ga=DN[ga]||"D";}
  for(let i=0;i<steps;i++){if(s&&!gs)gs="D";else if(gs&&gs!=="A")gs=UP[gs];else if(ga!=="A")ga=UP[ga];}
  return [ga,gs];}
const inMano=()=>L.inv.filter(x=>x.dove==="in mano");
const armaSel=()=>{const w=L.inv.find(x=>x.id===ui.dr.w&&x.dove==="in mano");return w||null;};
const isMischia=x=>/^mischia/.test(x.nota||"")||ARM.find(y=>y.n===x.nome)?.g==="mischia";
/* ===== suoni (sintetizzati, niente file) ===== */
const SND={on:LS.get("pda.snd")!==false,ctx:null};
function actx(){if(!SND.ctx){try{SND.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(_){return null;}}if(SND.ctx.state==="suspended")SND.ctx.resume().catch(()=>{});return SND.ctx;}
document.addEventListener("pointerdown",()=>{if(SND.on)actx();},{passive:true});
function tone(f,dur,o={}){const c=SND.on&&actx();if(!c||c.state!=="running")return;const t=c.currentTime+(o.at||0);const g=c.createGain();const os=c.createOscillator();os.type=o.type||"square";os.frequency.setValueAtTime(f,t);if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(o.vol||.05,t+.008);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);os.connect(g).connect(c.destination);os.start(t);os.stop(t+dur+.02);}
function noise(dur,o={}){const c=SND.on&&actx();if(!c||c.state!=="running")return;const t=c.currentTime+(o.at||0);const n=Math.max(1,Math.floor(c.sampleRate*dur));const b=c.createBuffer(1,n,c.sampleRate);const d0=b.getChannelData(0);for(let i=0;i<n;i++)d0[i]=Math.random()*2-1;
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type=o.ft||"bandpass";f.frequency.value=o.f||1800;f.Q.value=o.q||.8;const g=c.createGain();g.gain.setValueAtTime(o.vol||.08,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f).connect(g).connect(c.destination);s.start(t);s.stop(t+dur+.02);}
const SFX={
  key:()=>noise(.025,{f:3500,vol:.04,ft:"highpass"}),
  beep:()=>{tone(1320,.07,{vol:.04});tone(1760,.09,{vol:.04,at:.09});tone(1320,.07,{vol:.04,at:.32});tone(1760,.09,{vol:.04,at:.41});},
  job:()=>{[988,1319,1568].forEach((f,i)=>tone(f,.09,{vol:.04,at:i*.1}));},
  dice:()=>{for(let i=0;i<6;i++)noise(.03,{f:2200+Math.random()*1500,vol:.07,at:i*.05+Math.random()*.03});},
  shot:()=>{noise(.18,{ft:"lowpass",f:2200,vol:.35});tone(90,.18,{type:"sine",vol:.25,to:40});},
  hit:()=>{tone(70,.25,{type:"sine",vol:.3,to:35});noise(.12,{ft:"lowpass",f:600,vol:.15});},
  geiger:n=>{for(let i=0;i<n;i++)noise(.006,{ft:"highpass",f:4000,vol:.25,at:Math.random()*1.4});},
  siren:()=>{tone(420,1.1,{type:"sawtooth",vol:.03,to:820});tone(820,1.1,{type:"sawtooth",vol:.03,to:420,at:1.1});tone(420,1.1,{type:"sawtooth",vol:.03,to:820,at:2.2});},
  rumble:()=>{noise(1.8,{ft:"lowpass",f:120,vol:.5,q:.3});tone(45,1.6,{type:"sine",vol:.2,to:30});},
  stat:()=>{noise(.7,{f:1200,q:.4,vol:.06});tone(800+Math.random()*400,.15,{type:"sine",vol:.015,at:.3});},
  heal:()=>{tone(660,.12,{type:"triangle",vol:.05});tone(880,.16,{type:"triangle",vol:.05,at:.12});},
  cash:()=>{tone(1568,.12,{type:"triangle",vol:.05});tone(2093,.25,{type:"triangle",vol:.05,at:.1});},
  mag:()=>{noise(.04,{f:2500,vol:.12});noise(.05,{f:1500,vol:.12,at:.12});}};
const sfx=(k,a)=>{try{if(SND.on&&SFX[k])SFX[k](a);}catch(_){}};
/* osserva i cambiamenti: messaggi nuovi, radiazioni, Emissione */
const EMSEG=["","Il tempo si guasta, gli animali tacciono.","Mal di testa, sangue dal naso, la radio gracchia.","Tuoni lontani, la terra trema.","Il cielo diventa rosso. Sirene. Circa dieci minuti all'onda.","L'onda è vicina: al riparo, adesso.","EMISSIONE."];
let WATCH=null;
function watch(){if(conn==="loading")return;const ids=new Set(L.pda.map(m=>m.id));const rad=+S.tr.rad||0,em=+S.emiss||0;
  if(!WATCH){WATCH={ids,rad,em};return;}
  const nuovi=L.pda.filter(m=>!WATCH.ids.has(m.id)&&!m.mio);if(nuovi.length){const m=nuovi[nuovi.length-1];sfx(m.tipo==="lavoro"?"job":"beep");toast(m.tipo==="lavoro"?`Lavoro nuovo: ${m.titolo||""}`:m.tipo==="radio"?`Radio · ${m.canale||""}`:`Messaggio da ${m.da||"?"}`);}
  if(rad>WATCH.rad)sfx("geiger",6+rad*4);
  if(em>WATCH.em){sfx(em>=4?"siren":em>=3?"rumble":"stat");const radio=radioIt();toast(`Emissione ${em}/6: ${EMSEG[Math.min(6,em)]}${radio&&em<4?" La radio avvisa: preparati.":""}`);}
  WATCH={ids,rad,em};}
/* ===== notte, freddo, vendita, radio, artefatti, nascondigli ===== */
const mine2=y=>!/^(png|nasc):/.test(String(y.dove||""));
const have=n=>L.inv.find(y=>mine2(y)&&y.dove!=="deposito"&&armOf(y.nome)?.n===n&&y.stato!=="rotto");
const tempNow=()=>{const lu=LUCE[month()];const h=+((S.clock.ora||"12:00").split(":")[0]);const day=h>=10&&h<18;return day?Math.round((lu[2]+2*lu[3])/3):lu[2];};
const band=t=>t>10?0:t>=0?1:t>=-10?2:3;
function protFreddo(){const w=L.inv.filter(y=>y.dove==="indossato"&&y.stato!=="rotto").map(y=>armOf(y.nome)?.n||y.nome);const inv=w.includes("Vestiti invernali"),chiusa=w.some(n=>/SEVA|Esoscheletro/.test(n)),giacca=w.some(n=>/Giacca|Giubbotto|Tuta|Vento|Guardiano|PS5|Skat/.test(n));
  let p=inv&&chiusa?3:inv||chiusa?2:giacca?1:0;if(artBelt().some(a=>a[0]==="Palla di fuoco"))p++;return Math.min(3,p);}
function freddoOgni(){const A=S.amb||{};if(!A.fuori)return 0;if(artBelt().some(a=>a[0]==="Cristallo")&&tempNow()>=-20)return 0;const h=+((S.clock.ora||"12:00").split(":")[0]);const notte=h<7||h>=19;
  let b=band(tempNow())+(A.bagnato?1:0)+(notte?1:0)+(A.fermo&&STAG(month())==="inverno"?1:0);const p=protFreddo();if(b<=0)return 0;
  if(b===1)return p===0?4:0;if(b===2)return p<=1?2:p===2?4:0;if(b===3)return p<=1?1:p===2?2:4;return p<=1?.5:p===2?1:2;}
function ambTick(min){const A=S.amb||{};let msg=[];
  if(A.fuoco){A.fAcc=(+A.fAcc||0)+min;const n=Math.floor(A.fAcc/60);if(n){A.fAcc-=n*60;if(S.tr.freddo>0){trAdd({freddo:-n});msg.push(`fuoco: −${n} Freddo`);}}}
  else{const ogni=freddoOgni();if(ogni){A.cAcc=(+A.cAcc||0)+min;const n=Math.floor(A.cAcc/(ogni*60));if(n){A.cAcc-=n*ogni*60;trAdd({freddo:n});msg.push(`freddo: +${n}`);}}}
  if((+S.tr.freddo||0)>=5){A.iAcc=(+A.iAcc||0)+min;const n=Math.floor(A.iAcc/60);if(n){A.iAcc-=n*60;trAdd({ferite:n});msg.push(`ipotermia: +${n} Ferite`);}}
  S.amb=A;
  S.artAcc=(+S.artAcc||0)+min;const days=Math.floor(S.artAcc/1440);if(days){S.artAcc-=days*1440;let dr=0,df=0,dn=0;artBelt().forEach(a=>{const all=a[3]+" · "+a[4];const p=all.match(/\+(\d) Radiazioni al giorno/);const m=all.match(/−(\d) Radiazioni al giorno/);if(p)dr+=+p[1]*days;if(m)dr-=+m[1]*days;if(a[0]==="Kolobok")df-=days;if(a[0]==="Bussola")dn+=days;});
    if(dr||df||dn){trAdd({rad:dr,ferite:df,nervi:dn});msg.push(`artefatti: ${dr?`${dr>0?"+":""}${dr} Radiazioni`:""}${df?` ${df} Ferite`:""}${dn?` +${dn} Nervi`:""}`);}}
  if(msg.length)toast(msg.join(" · "));}
/* notte */
function notteCalc(o){const tmin=LUCE[month()][2];const need=tmin>10?0:tmin>=0?1:tmin>=-10?2:3;const bag=["Sacco a pelo invernale","Sacco a pelo estivo","Coperta"].find(have);let p=bag==="Sacco a pelo invernale"?2:bag==="Sacco a pelo estivo"?1:0;const parts=[bag?`${bag} ${p}`:"niente sacco 0"];
  if(o.dove!=="base"){if(o.tenda&&(have("Tenda da una persona")||have("Tenda da due o tre"))){p++;parts.push("tenda +1");}
    if(o.stufa&&have("Stufa da tenda a legna")&&o.tenda){p+=2;parts.push("stufa +2");}else if(o.forn&&have("Fornelletto")&&o.tenda&&(+S.scorte.comb||0)>0){p++;parts.push("fornelletto +1 (−1 combustibile)");}else if(o.fuoco){p++;parts.push("fuoco +1");}
    if(o.bagnato){p--;parts.push("bagnati −1");}}
  const caldo=o.dove==="base";const diff=caldo?0:p-need;let q=caldo?2:diff>=0?2:diff===-1?1:0;const fr=caldo?0:diff>=0?0:diff===-1?1:2;
  return {need,p,parts,q,fr,caldo};}
function notte(o){const C=notteCalc(o);const lines=[];let q=C.q;
  if(o.dove!=="base"){const g=grades("intelletto","sopravvivenza",0);const v=[d(DIE[g[0]]),g[1]?d(DIE[g[1]]):0];const s=succ(v[0])+(g[1]?succ(v[1]):0);const pq=s>=2?2:s===1?1:0;lines.push(`Il posto (Intelletto ${g[0]} + Sopravvivenza ${g[1]||"—"}: ${v.filter(Boolean).join(", ")}): ${s} success${s===1?"o":"i"} → ${pq===2?"buono":pq===1?"notte disturbata":"disturbata e incontro +1"}`);q=Math.min(q,pq||1);if(pq===0)lines.push("Incontro possibile (+1): tira «Tappa» di notte nell'Oracolo.");add("tiri",{testo:`Campo per la notte: Intelletto ${g[0]} + Sopravvivenza ${g[1]||"—"}: ${s} successi`,succ:s,data:S.clock.data,ora:S.clock.ora});}
  if(C.fr)lines.push(`Freddo per dormire: servono ${C.need}, hai ${C.p} (${C.parts.join(", ")}) → Freddo +${C.fr}`);else if(!C.caldo)lines.push(`Freddo per dormire: servono ${C.need}, hai ${C.p}: basta.`);
  if(effs().some(e=>e.n==="Pervitin")){q=0;lines.push("Pervitin in corpo: niente sonno.");}else if(effs().some(e=>e.n==="Energetica")&&q>1){q=1;lines.push("Energetica: dormi male.");}
  if(C.fr>=2)q=0;
  const out={fatica:q>=1?-(+S.tr.fatica||0):1,nervi:q===2?-1:0,freddo:C.caldo?-(+S.tr.freddo||0):C.fr};
  if(q===2&&artBelt().some(a=>a[0]==="Anima")){out.ferite=-1;lines.push("Anima: −1 Ferite.");}
  if(q===1&&artBelt().some(a=>a[0]==="Fiocco di neve")){out.nervi+=1;lines.push("Fiocco di neve: +1 Nervi.");}
  if(o.forn&&o.tenda&&!(o.stufa&&have("Stufa da tenda a legna"))&&have("Fornelletto")&&(+S.scorte.comb||0)>0&&o.dove!=="base")S.scorte.comb--;
  trAdd(out);S.amb={...(S.amb||{}),fuori:o.dove==="fuori",bagnato:false,fuoco:false};
  if(o.dove!=="base"){const r=d(6);if(r===6){S.emiss=Math.min(6,(+S.emiss||0)+1);lines.push(`Emissione: d6 = 6, l'orologio sale a ${S.emiss}.`);}else lines.push(`Emissione: d6 = ${r}, niente.`);}
  lines.unshift(`${q===2?"Sonno vero":q===1?"Notte disturbata":"Niente sonno"} (${o.ore} ore, ${o.dove==="base"?"al caldo e al sicuro":o.dove==="riparo"?"in un riparo":"all'aperto"}): Fatica ${q>=1?"a 0":"+1"}${q===2?", Nervi −1":""}${C.caldo?", Freddo a 0":""}.`);
  adv(o.ore*60);soloPush("Notte",lines.map(esc));add("diario",{testo:"Notte: "+lines.join(" "),data:S.clock.data,ora:S.clock.ora,luogo:S.clock.luogo});toast(lines[0]);}
function notteHtml(){const o=ui.notte||(ui.notte={dove:"fuori",ore:8,tenda:true,forn:true,stufa:true,fuoco:false,bagnato:false});const C=notteCalc(o);const A=S.amb||{};const ogni=freddoOgni();const t=tempNow();
  const ck=(k,l,dis)=>`<label class="row small"><input type="checkbox" data-nt="${k}" ${o[k]?"checked":""} ${dis?"disabled":""} style="width:auto;min-height:0"> ${l}</label>`;
  const ak=(k,l)=>`<label class="row small"><input type="checkbox" data-am="${k}" ${A[k]?"checked":""} style="width:auto;min-height:0"> ${l}</label>`;
  return `<h2 style="margin-top:16px">Freddo</h2><p class="small" style="margin:0">Adesso circa <b>${t} °C</b> · protezione <b>${protFreddo()}</b> ${ogni?`· <span class="warn">+1 Freddo ogni ${ogni>=1?ogni+" h":"mezz'ora"}</span>`:A.fuori?"· non ti raffreddi":""}</p>
    <div class="row" style="gap:10px;margin-top:4px">${ak("fuori","all'aperto")}${ak("bagnato","bagnato")}${ak("fuoco","vicino al fuoco")}${ak("fermo","fermo a lungo")}</div>
    <p class="small muted" style="margin:2px 0 0">Il Freddo sale e scende da solo quando fai passare il tempo (6.10). Protezione: giacca o tuta 1, vestiti invernali o tuta chiusa 2, tutti e due 3.</p>
    <h2 style="margin-top:16px">Notte</h2>
    <div class="row" style="gap:6px"><select data-nt="dove" style="width:auto">${[["base","al caldo e al sicuro (base, bunker)"],["riparo","in un riparo (rovine, cantina)"],["fuori","all'aperto"]].map(([v,l])=>`<option value="${v}" ${o.dove===v?"selected":""}>${l}</option>`).join("")}</select><select data-nt="ore" style="width:auto">${[4,6,8,10].map(h=>`<option value="${h}" ${+o.ore===h?"selected":""}>${h} ore</option>`).join("")}</select></div>
    ${o.dove!=="base"?`<div class="row" style="gap:10px;margin-top:4px">${ck("tenda","tenda",!have("Tenda da una persona")&&!have("Tenda da due o tre"))}${ck("stufa","stufa",!have("Stufa da tenda a legna"))}${ck("forn","fornelletto",!have("Fornelletto"))}${ck("fuoco","fuoco")}${ck("bagnato","bagnati")}</div>
    <p class="small" style="margin:4px 0 0">Per dormire servono <b>${C.need}</b> (minima ${LUCE[month()][2]} °C), hai <b>${C.p}</b>: ${esc(C.parts.join(", "))} → ${C.q===2?"basta":C.q===1?"notte disturbata, Freddo +1":"niente sonno, Freddo +2"}. Poi si tira il posto (Intelletto + Sopravvivenza) e l'Emissione.</p>`:`<p class="small" style="margin:4px 0 0">Sonno vero: Fatica a 0, Nervi −1, Freddo a 0.</p>`}
    <button class="btn" data-a="notte" style="width:100%;margin-top:6px">Dormi ${o.ore} ore</button>`;}
/* vendita */
const MERC={"Cordone":"il Mercante","Valle Oscura":"il mercante dei banditi","Bar e Rostok":"il Barman","Yantar":"gli scienziati","Magazzini dell'esercito":"la Libertà","Janiv e Jupiter":"la stazione di Janiv","Zaton":"la nave"};
function sellBase(y){const a=artOf(y);if(a){const m=(a[5]||"").match(/([\d.]+)\D+([\d.]+)/);return m?Math.round((+m[1].replace(/\./g,"")+ +m[2].replace(/\./g,""))/2):0;}const e=armOf(y.nome);if(!e)return 0;if(e.c==="munizioni"){const box=+((e.s.match(/(\d+) (colpi|cartucce)/)||[])[1])||20;return Math.round(e.p*colpiOf(y)/box);}return e.p*(+y.qta||1);}
function sellPrice(y,pct){let b=sellBase(y);const st=y.tipo==="arma"||y.tipo==="armatura"?wStato(y):y.stato;b*=st==="rotto"?.1:st==="usurato"?.5:1;if(artOf(y)&&S.clock.luogo==="Yantar")b*=1.2;return Math.round(b*pct/100/50)*50;}
function sellHtml(){const y=L.inv.find(z=>z.id===ui.sell);if(!y)return "";const m=MERC[S.clock.luogo];const pct=ui.sellPct||40;const base=sellBase(y);
  return `<div class="sellbox"><div class="row" style="justify-content:space-between"><b>Vendi: ${esc(y.nome)}</b><button class="btn g s" data-a="sellx">Chiudi</button></div>
    ${!m?`<p class="small warn">A ${esc(S.clock.luogo||"—")} non c'è nessuno che compra.</p>`:!base?`<p class="small">Non ha un prezzo di listino: si tratta a voce.</p>`:`<p class="small" style="margin:4px 0">Compra ${esc(m)}. Listino ${fmtR(base)}${(y.tipo==="arma"||y.tipo==="armatura")&&wStato(y)!=="ok"?` · ${wStato(y)}`:y.stato&&y.stato!=="ok"?` · ${y.stato}`:""} · ${ui.sellRoll?esc(ui.sellRoll):"senza trattare paga il 40%"}</p>
    <div class="row" style="gap:6px"><button class="btn g s" data-a="sellroll" ${ui.sellRoll?"disabled":""}>Contratta (Empatia + Persuasione)</button><b class="num">${pct}% = ${fmtR(sellPrice(y,pct))}</b><button class="btn s" data-a="sellok">Vendi</button></div>`}</div>`;}
/* radio */
const radioIt=()=>L.inv.find(y=>mine2(y)&&y.dove!=="deposito"&&armOf(y.nome)?.n==="Ricevitore radio"&&y.stato!=="rotto"&&(y.carica==null||+y.carica>0));
const CAN=[["stalker","Stalker liberi"],["militari","Militari del Cordone"],["banditi","Banditi"],["fazioni","Dovere e Libertà"],["scienziati","Scienziati"]];
const RTAB={stalker:["«…chi è vicino a {z}? Ho un ferito, pago in cartucce.»","«Attenti ai cani tra {z} e la ferrovia, un branco grosso.»","«{n} non è tornato da {z}. Se lo vedete, ditegli che lo aspettiamo.»","«Hanno visto un campo nuovo verso {z}, dopo l'ultima tempesta.»","«Qualcuno compra pelli di carne? Vendo a metà prezzo.»","«La strada per {z} è pulita stamattina. Stamattina.»","«Ho sentito spari a {z}, raffiche lunghe.»","Una chitarra, qualcuno che canta stonato, poi silenzio."],
  militari:["«Pattuglia due, rientro alle {h}. Il ponte resta chiuso.»","«Elicottero in ricognizione su {z}, nessuno deve muoversi lì sotto.»","«Chi ha preso le razioni di ieri? Il sergente vuole i nomi.»","«Movimento a {z}. Non ingaggiate, segnalate.»","«Cambio di turno al posto di blocco alle {h}.»","Codici a numeri, letti piano, ripetuti due volte.","«Dicono che a nord stia arrivando brutto tempo. Tenetevi pronti.»","«Il furgone del rancio arriva in ritardo, guasto.»"],
  banditi:["«…lo stronzetto passa da {z} col PDA nuovo, lo aspettiamo al sottopasso.»","«Chi ha la roba del colpo di ieri la porta in fabbrica entro sera.»","«C'è un novellino che si crede furbo, a {z}. Insegniamogli qualcosa.»","«Due di noi sono rimasti a {z}. Se non rispondono, andate a vedere.»","Risate, una bestemmia, la musica di un'altra stazione sopra.","«Il capo vuole i nomi di chi lavora col Mercante.»"],
  fazioni:["«Pattuglia del Dovere in uscita verso {z}. Nessun contatto con la Libertà.»","«Libertà, qui la base: chi va a {z} porti indietro le casse.»","«Il Barman cerca qualcuno per un lavoro pulito. Chiedete al banco.»","«Mutanti in aumento a nord di {z}. Il Dovere chiede volontari.»","Un discorso lungo sul dovere e sulla Zona da chiudere, poi interferenze.","«La tregua di Janiv tiene. Per ora.»"],
  scienziati:["«…letture anomale vicino a {z}, ci servirebbe una scorta.»","«Yantar a tutti: compriamo campioni intatti, buon prezzo.»","«Il segnale psi è più forte oggi. Chi è a nord stia attento.»","«Cerchiamo la sonda numero 4, persa verso {z}. Ricompensa.»","Numeri, coordinate, la parola «emissione» ripetuta in mezzo a dati.","«Picco di radiazioni registrato a {z} stanotte.»"]};
function radioAscolta(){const R=radioIt();if(!R){toast("Ti serve un ricevitore radio carico.");return;}const c=ui.can||"stalker";const near=(typeof nbr==="function"?nbr(S.clock.luogo):[])||[];const z=pk(near.length?near:[S.clock.luogo||"Cordone"]);
  const tpl=pk(RTAB[c]);const h=String((+S.clock.ora.slice(0,2)+d(3))%24).padStart(2,"0")+":00";const txt=tpl.replace(/\{z\}/g,z).replace(/\{n\}/g,pk(NOMI)).replace(/\{h\}/g,h);
  upd("inv",R.id,{carica:(R.carica==null?10:+R.carica)-1});sfx("stat");adv(15);add("pda",{tipo:"radio",canale:c,da:CAN.find(x=>x[0]===c)[1],testo:txt,data:S.clock.data,ora:S.clock.ora,mio:true});}
function radioHtml(){const R=L.inv.find(y=>mine2(y)&&armOf(y.nome)?.n==="Ricevitore radio");const c=ui.can||"stalker";const msgs=L.pda.filter(m=>m.tipo==="radio"&&(m.canale||"stalker")===c).sort((a,b)=>b.ts-a.ts).slice(0,30);const pile=have("Pile");
  if(!R)return `<p class="empty">Non hai un ricevitore radio. Lo trovi in Armeria (strumenti).</p>`;
  const car=R.carica==null?10:+R.carica;
  return `<div class="radio"><div class="row" style="justify-content:space-between"><span class="small">Ricevitore ${R.stato==="rotto"?'<span class="warn">rotto</span>':""} · pile <b class="num">${car}/10</b></span>${car<10?`<button class="btn g s" data-a="rpile" ${pile?"":"disabled"} title="serve una confezione di Pile">Cambia le pile</button>`:""}</div>
    <div class="chips">${CAN.map(([k,n])=>`<button class="chip" data-a="rcan" data-k="${k}" aria-pressed="${c===k}">${n}</button>`).join("")}</div>
    <button class="btn" data-a="rlisten" ${car>0&&R.stato!=="rotto"?"":"disabled"} style="width:100%">Ascolta (+15′, 1 pila)</button>
    <div style="margin-top:8px">${msgs.map(m=>`<div class="msg"><div class="h">${esc(m.da||"")} · ${esc(dataIt(m.data))} ${esc(m.ora||"")}</div><div>${esc(m.testo)}</div></div>`).join("")||`<p class="small muted">Solo fruscio, per ora.</p>`}</div>
    <p class="small muted">Col ricevitore l'Emissione si sente prima: la radio avvisa a ogni segnale. Anche il GM può scrivere qui (messaggi con tipo "radio" e il canale).</p></div>`;}
/* artefatti */
const artOf=y=>{const n=(y.nome||"").replace(/^Artefatto:\s*/,"").trim().toLowerCase();return ART.find(a=>a[0].toLowerCase()===n)||null;};
const artBelt=()=>L.inv.filter(y=>y.dove==="cintura"&&artOf(y)).map(artOf);
const beltCap=()=>3+(L.inv.some(y=>y.dove==="indossato"&&/SEVA|Esoscheletro/.test(armOf(y.nome)?.n||""))?2:0);
const capZ=()=>(+S.cap.zaino||24)+artBelt().reduce((t,a)=>{const m=a[3].match(/\+(\d) slot nello zaino/);return t+(m?+m[1]:0);},0);
const ARTC={Vortice:"#8a5ad0",Bruciatore:"#e0782a",Elettro:"#4aa8f0",Gas:"#7ad03a",Trampolino:"#b08a5a",Punch:"#aab0b4"};
const artIco=a=>`<span class="ico svg"><svg viewBox="0 0 64 48"><defs><radialGradient id="ag${a[0].length}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="${ARTC[a[1]]||"#ccc"}"/><stop offset="1" stop-color="${ARTC[a[1]]||"#ccc"}" stop-opacity="0"/></radialGradient></defs><rect width="64" height="48" fill="#232a2a"/><circle cx="32" cy="24" r="20" fill="url(#ag${a[0].length})"/><path d="M26 18 L34 14 L40 22 L36 32 L27 31 L23 24Z" fill="${ARTC[a[1]]||"#ccc"}" stroke="#0008" stroke-width=".8"/><path d="M28 19 L33 17" stroke="#fff" stroke-opacity=".6"/></svg></span>`;
function artHtml(){const all=L.inv.filter(y=>mine2(y)&&artOf(y)&&y.dove!=="deposito");if(!all.length)return "";const belt=all.filter(y=>y.dove==="cintura"),rest=all.filter(y=>y.dove!=="cintura");const cap=beltCap();const oggi=S.clock.data;S.artUso=S.artUso||{};
  const row=(y,on)=>{const a=artOf(y);const daily=/una volta al giorno/.test(a[3]);return `<div class="drug">${artIco(a)}<div><b>${esc(a[0])}</b> <span class="small muted">${esc(a[2])} · ${esc(a[1])}</span><div class="small">${esc(a[3])}</div><div class="small warn">${esc(a[4])}</div></div>${on&&daily?`<button class="btn g s" data-a="artuse" data-k="${y.id}" ${S.artUso[a[0]]===oggi?"disabled":""}>Usa oggi</button>`:""}<button class="btn ${on?"g ":""}s" data-a="artbelt" data-k="${y.id}" ${!on&&belt.length>=cap?"disabled":""}>${on?"Togli":"In cintura"}</button></div>`;};
  return `<section class="pane" style="grid-column:1/-1"><div class="row" style="justify-content:space-between"><h3>Cintura degli artefatti</h3><span class="small num">${belt.length}/${cap}</span></div>
    ${belt.map(y=>row(y,true)).join("")||`<p class="small muted">Cintura vuota.</p>`}${rest.length?`<div class="plab">Nello zaino (non fanno effetto)</div>${rest.map(y=>row(y,false)).join("")}`:""}
    <p class="small muted">Solo quelli in cintura fanno effetto. Radiazioni e altri costi «al giorno» si applicano da soli quando passa il tempo; i bonus ai tiri si accendono nei Dadi. SEVA o esoscheletro: 5 posti.</p></section>`;}
/* nascondigli */
function nascHtml(){S.nasc=S.nasc||[];const qui=S.clock.luogo;const mineHere=L.inv.filter(y=>mine2(y)&&["zaino","addosso"].includes(y.dove||"zaino"));
  return `<section class="pane"><h3>Nascondigli</h3>${S.nasc.map(n=>{const it=L.inv.filter(y=>y.dove==="nasc:"+n.id);const here=n.zona===qui;return `<div class="nasc"><div class="row" style="justify-content:space-between"><b>${esc(n.nome)}</b><span class="small muted">${esc(n.zona)}${n.ultimo?` · visto ${esc(dataIt(n.ultimo))}`:""}</span></div>
      ${it.length?`<ul class="items">${it.map(y=>`<li class="row small" style="gap:6px;flex-wrap:nowrap">${ico(y.nome)}<span style="flex:1;min-width:0">${esc(y.nome)}${(+y.qta||1)>1?` ×${y.qta}`:""}</span>${here?`<button class="btn g s" data-a="nprendi" data-k="${y.id}">Prendi</button>`:""}</li>`).join("")}</ul>`:`<p class="small muted" style="margin:4px 0">Vuoto.</p>`}
      ${here?`<div class="row" style="gap:6px"><select data-ni="${n.id}" style="flex:1 1 10em;min-height:36px">${mineHere.map(y=>`<option value="${y.id}">${esc(y.nome)}</option>`).join("")}</select><button class="btn s" data-a="nlascia" data-k="${n.id}">Lascia qui</button><button class="btn g s" data-a="ncheck" data-k="${n.id}">È ancora tutto lì?</button></div>`:`<p class="small muted" style="margin:0">Per usarlo devi essere a ${esc(n.zona)}.</p>`}
      <button class="btn g s" data-a="ndel" data-k="${n.id}" style="margin-top:4px">Dimentica</button></div>`;}).join("")||`<p class="small muted">Nessun nascondiglio.</p>`}
    <div class="row" style="gap:6px;margin-top:8px"><input data-dr="nnome" value="${esc(ui.nnome||"")}" placeholder="nome del posto (cantina dietro la chiesa…)" style="flex:1 1 12em"><button class="btn s" data-a="nadd">Nuovo a ${esc(qui||"—")}</button></div>
    <p class="small muted">«È ancora tutto lì?» tira un d6: con un risultato sotto il pericolo della zona qualcuno l'ha trovato, e il GM dice cosa resta (proposta).</p></section>`;}
/* ===== qualità della vita ===== */
async function put(c,id,data){if(db){try{await db.collection(c).doc(id).set(data);}catch(e){toast("Non salvato.");}}else{const i=L[c].findIndex(y=>y.id===id);const doc={id,...data};if(i>=0)L[c][i]=doc;else L[c].push(doc);LS.set("pda."+c,L[c]);render();}}
function snap(label){ui.undo={label,S:clone(S),inv:clone(L.inv),png:clone(L.png)};}
async function undoLast(){const u=ui.undo;if(!u)return;ui.undo=null;S=deep(clone(DEF),u.S);save();
  for(const c of ["inv","png"]){const old=u[c],cur=L[c].slice();const om=new Map(old.map(x=>[x.id,x]));for(const x of cur)if(!om.has(x.id))await del(c,x.id);
    for(const x of old){const now=cur.find(y=>y.id===x.id);if(!now||JSON.stringify(now)!==JSON.stringify(x)){const {id,...d}=x;await put(c,id,d);}}}
  toast("Annullato: "+u.label+".");}
const UNDO={notte:"la notte",sellok:"la vendita",happly:"il colpo",cure:"la cura",drug:"il farmaco",buy:"l'acquisto",wmount:"il montaggio",wun:"lo smontaggio",wric:"la ricarica",giorno:"il pasto",dayeat:"il pasto",dayno:"il digiuno",artuse:"l'artefatto",artbelt:"la cintura",nlascia:"il nascondiglio",nprendi:"il nascondiglio",ggive:"il passaggio",gback:"il passaggio",geat:"il pasto del gruppo",gpay:"la paga",prendi:"il bottino",idel:"la cancellazione",arriva:"il viaggio",adv:"il tempo",zmove:"lo spostamento",wheal:"la guarigione",wdel:"la ferita tolta",gjoin:"il gruppo",gleave:"il gruppo",rlisten:"l'ascolto",rpile:"le pile",mcol:"le munizioni"};
/* giorni che passano */
function eatDay(n,withG){const st=STAG(month());const g=withG?gruppo().length:0;const nc=(st==="inverno"?2:1),na=(st==="estate"?3:2);const sc=S.scorte;const msg=[];
  for(let i=0;i<n;i++){if(sc.cibo>=nc+g){sc.cibo-=nc+g;}else{const left=Math.max(0,sc.cibo-g);sc.cibo=Math.max(0,sc.cibo-g);if(left<nc){sc.cibo=0;trAdd({fame:1});msg.push("Fame +1");}else sc.cibo-=nc;}
    if(sc.acqua>=na){sc.acqua-=na;}else{const man=na-sc.acqua;sc.acqua=0;const up=man>=na?2:1;trAdd({sete:up});msg.push(`Sete +${up}`);}}
  save();toast(msg.length?msg.join(", ")+".":`Mangiato e bevuto${g?" (anche il gruppo)":""}.`);}
function dayBanner(){const n=+S.giorni||0;if(!n||ui.dayLater)return "";const G=gruppo().length;return `<div class="daybox"><b>${n===1?"È passata la mezzanotte":`Sono passati ${n} giorni`}.</b> Avete mangiato e bevuto? <span class="small muted">(${STAG(month())==="inverno"?2:1} cibo e ${STAG(month())==="estate"?3:2} l d'acqua a testa al giorno · hai ${S.scorte.cibo||0} cibo, ${S.scorte.acqua||0} l)</span>
  <div class="row" style="gap:6px;margin-top:6px"><button class="btn s" data-a="dayeat">Sì, dalle scorte${G?` (con il gruppo: ${G})`:""}</button><button class="btn g s" data-a="dayno">No: Fame +${n}, Sete +${2*n}</button><button class="btn g s" data-a="daylater">Dopo</button></div></div>`;}
/* scadenze dei lavori */
const jobLeft=j=>/^\d{4}-\d{2}-\d{2}$/.test(j.scadenza||"")?minTo(`${j.scadenza} 23:59`):null;
const leftTxt=m=>m<0?"scaduto":m<60?`scade tra ${m}′`:m<1440?`scade tra ${Math.floor(m/60)} h`:`scade tra ${Math.floor(m/1440)} g ${Math.floor(m%1440/60)} h`;
function jobWatch(){ui.jw=ui.jw||{};L.pda.filter(j=>j.tipo==="lavoro"&&["offerto","accettato"].includes(j.stato||"offerto")).forEach(j=>{const m=jobLeft(j);if(m==null)return;const lv=m<0?"x":m<360?"6h":"";if(lv&&ui.jw[j.id]!==lv){ui.jw[j.id]=lv;if(WATCH){sfx("job");toast(`${j.titolo}: ${leftTxt(m)}.`);}}});}
/* striscia di stato */
function stripHtml(){const t=S.tr,ab=[["ferite","Fer"],["fatica","Fat"],["nervi","Ner"],["freddo","Fre"],["fame","Fam"],["sete","Set"],["rad","Rad"]];const sl=slots();const W=L.inv.find(x=>x.dove==="in mano"&&x.tipo==="arma");const w=W&&armOf(W.nome);
  const mal=["forza","agilita","intelletto","empatia"].map(a=>malus(a)).map((v,i)=>v?`${"FAIE"[i]}−${v}`:"").filter(Boolean).join(" ");const E=effs();
  return `<div class="strip">${ab.map(([k,n])=>{const v=+t[k]||0;return `<span class="tk${v>=5?" crit":v>=3?" hot":v?" on":""}" title="${k}">${n} <b>${v}</b></span>`;}).join("")}
    ${mal?`<span class="tk hot">malus ${mal}</span>`:""}<span class="tk${sl.addosso>S.cap.addosso||sl.zaino>capZ()?" hot":""}">carico <b>${fs(sl.addosso)}/${S.cap.addosso}</b> · <b>${fs(sl.zaino)}/${capZ()}</b></span>
    ${W&&isFire(w)?`<span class="tk">${esc(w.n)} <b>${carOf(W)}/${capOf(w,W)||"?"}</b></span>`:""}${E.length?`<span class="tk on">${E.length} farmac${E.length===1?"o":"i"}</span>`:""}<a class="tk" href="#salute" title="vai alla Salute">salute ↓</a><span class="tk${(+S.emiss||0)>=3?" hot":""}">Emiss. <b>${S.emiss||0}/6</b></span>
    <span class="sp"></span>${ui.undo?`<button class="btn g s" data-a="undo" title="tasto U">Annulla ${esc(ui.undo.label)}</button>`:""}<button class="btn g s" data-a="big" aria-pressed="${!!LS.get("pda.big")}" title="testo più grande">A+</button></div>`;}
/* tiri rapidi */
const QR=[["agilita","tiro","Sparare"],["intelletto","ricognizione","Cercare"],["agilita","mobilita","Muoversi"],["intelletto","sopravvivenza","Sopravvivere"],["intelletto","tecnica","Aggiustare"],["empatia","persuasione","Convincere"],["empatia","pronto","Curare"],["forza","resistenza","Resistere"],["forza","corpo","Corpo a corpo"],["sf","","Sangue freddo"]];
/* cronologia */
function vCrono(){const f=ui.cf||"tutto";const ev=[];
  if(f==="tutto"||f==="tiri")L.tiri.forEach(x=>ev.push({k:"tiri",d:x.data,o:x.ora,ts:x.ts,t:"Tiro",x:x.testo}));
  if(f==="tutto"||f==="oracolo")L.solo.forEach(x=>ev.push({k:"oracolo",d:x.data,o:x.ora,ts:x.ts,t:x.tit,x:(x.righe||[]).map(r=>String(r).replace(/<[^>]+>/g,"")).join(" · ")}));
  if(f==="tutto"||f==="diario")L.diario.forEach(x=>ev.push({k:"diario",d:x.data,o:x.ora,ts:x.ts,t:"Diario"+(x.luogo?` · ${x.luogo}`:""),x:x.testo}));
  if(f==="tutto"||f==="rete")L.pda.forEach(x=>ev.push({k:"rete",d:x.data||"",o:x.ora||"",ts:x.ts,t:x.tipo==="lavoro"?`Lavoro · ${x.titolo}`:x.tipo==="radio"?`Radio · ${x.da||""}`:`${x.da||"?"}`,x:x.tipo==="lavoro"?`${x.stato||"offerto"} · ${fmtR(x.paga)}`:x.testo}));
  const q=(ui.cq||"").toLowerCase();const list=ev.filter(e=>!q||(e.t+" "+e.x).toLowerCase().includes(q)).sort((a,b)=>((b.d||"")+(b.o||"")).localeCompare((a.d||"")+(a.o||""))||(b.ts||0)-(a.ts||0)).slice(0,250);
  let last="";const rows=list.map(e=>{const h=e.d!==last?`<h3 class="cday">${esc(dataIt(e.d)||"senza data")}</h3>`:"";last=e.d;return h+`<div class="cev c-${e.k}"><span class="num muted small">${esc(e.o||"")}</span><div><b>${esc(e.t||"")}</b><div class="small" style="white-space:pre-wrap">${esc(e.x||"")}</div></div></div>`;}).join("");
  return `<section class="pane"><h2>Cronologia</h2><div class="row" style="gap:6px;margin-bottom:8px"><div class="chips" style="margin:0">${[["tutto","Tutto"],["tiri","Tiri"],["oracolo","Oracolo"],["diario","Diario"],["rete","Rete"]].map(([k,n])=>`<button class="chip" data-a="cf" data-k="${k}" aria-pressed="${f===k}">${n}</button>`).join("")}</div><input data-dr="cq" value="${esc(ui.cq||"")}" placeholder="cerca" style="flex:1 1 10em"></div>${rows||`<p class="empty">Niente.</p>`}</section>`;}
/* copia di sicurezza */
function backupTxt(){return JSON.stringify({quando:new Date().toISOString(),stato:S,...L},null,1);}
/* zaino */
const DOVE=[["in mano","In mano"],["indossato","Indossato"],["addosso","Addosso"],["zaino","Zaino"],["deposito","Deposito"]];
function zMeta(x){const e=armOf(x.nome);const bits=[];if((+x.qta||1)>1)bits.push(`×${x.qta}`);bits.push(`${fs((+x.slot||0)*(+x.qta||1))} slot`);
  if(x.tipo==="arma"&&isFire(e))bits.push(`carico ${carOf(x)}/${capOf(e,x)||"?"}`);if(x.tipo==="armatura")bits.push(`classe ${+x.classe||0}`);if((x.acc||[]).length)bits.push(`${x.acc.length} access.`);if(x.carica!=null)bits.push(`pile ${x.carica}/10`);
  const st=x.tipo==="arma"||x.tipo==="armatura"?wStato(x):x.stato||"ok";const m=wMax(x);
  return {txt:bits.join(" · "),st,wear:m?`<span class="wear">${Array.from({length:m},(_,i)=>`<i class="${i<(+x.segni||0)?"on":""}"></i>`).join("")}</span>`:""};}
function zRow(x){const M=zMeta(x);const key="zi."+x.id;const e=armOf(x.nome);
  return `<details class="zit${M.st!=="ok"?" "+M.st:""}" data-acc="${key}" ${ui.aopen&&ui.aopen[key]?"open":""}><summary>${ico(x.nome)}<span class="zn"><b>${esc(x.nome)}</b><span class="small muted">${M.txt}</span></span>${M.wear}${M.st!=="ok"?`<span class="badge ${M.st}">${M.st}</span>`:""}${e&&e.p?`<span class="small muted num zp">${fmtR(e.p)}</span>`:""}</summary>
    <div class="zbody"><div class="chips" style="margin:0 0 6px">${DOVE.concat(artOf(x)?[["cintura","Cintura"]]:[]).map(([k,n])=>`<button class="chip" data-a="zmove" data-k="${x.id}" data-v="${k}" aria-pressed="${(x.dove||"zaino")===k}">${n}</button>`).join("")}</div>
      <div class="zedit"><label class="f"><span class="lbl">Nome</span><input data-u="${x.id}" data-k="nome" value="${esc(x.nome)}"></label><label class="f"><span class="lbl">Quantità</span><input type="number" min="0" data-u="${x.id}" data-k="qta" value="${esc(x.qta??1)}"></label><label class="f"><span class="lbl">Slot</span><input type="number" min="0" step="0.25" data-u="${x.id}" data-k="slot" value="${esc(x.slot??1)}"></label><label class="f"><span class="lbl">Stato</span><select data-u="${x.id}" data-k="stato">${["ok","usurato","rotto"].map(o=>`<option ${x.stato===o?"selected":""}>${o}</option>`).join("")}</select></label></div>
      <label class="f" style="margin-top:6px"><span class="lbl">Nota</span><input data-u="${x.id}" data-k="nota" value="${esc(x.nota||"")}" placeholder="modifiche, provenienza…"></label>
      ${e&&e.s?`<p class="small muted" style="margin:6px 0 0">${esc(e.s)}</p>`:""}
      ${wearRow(x)}${x.tipo==="arma"?weaponPanel(x):""}
      <div class="row" style="gap:6px;margin-top:8px">${MERC[S.clock.luogo]?`<button class="btn g s" data-a="sell" data-k="${x.id}">Vendi</button>`:""}<button class="btn g s" data-a="idel" data-k="${x.id}">Butta via</button></div></div></details>`;}
/* ===== Sistema: salvataggi, import/export, app offline ===== */
function dlFile(name,txt){try{const b=new Blob([txt],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);return true;}catch(_){return false;}}
async function importAll(o){if(!o||!o.stato)throw new Error("Non è un salvataggio del PDA.");const cols=["inv","png","pda","tiri","solo","diario"];
  if(db){for(const c of cols){for(const x of L[c].slice())await del(c,x.id);for(const x of (o[c]||[])){const {id,...d}=x;await put(c,id||uid(),d);}}}
  else{cols.forEach(c=>{L[c]=(o[c]||[]).map(x=>({...x,id:x.id||uid()}));LS.set("pda."+c,L[c]);});}
  S=deep(clone(DEF),o.stato);save();toast("Partita caricata.");}
function vSistema(){const online=navigator.onLine;const inst=window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches;
  return `<div class="grid">${gmPane()}<section class="pane"><h2>Partita</h2>
    <p class="small muted" style="margin-top:0">${db?"Sei nel PDA dentro claude.ai: si salva nel database dell'artifact, e il GM (Claude) lo legge.":"Sei nell'app: si salva in questo browser, anche offline."}</p>
    <div class="row" style="gap:6px"><button class="btn" data-a="exfile">Salva su file</button><label class="btn g" style="display:inline-flex;align-items:center">Carica da file<input type="file" accept=".json,application/json" data-imp="1" hidden></label></div>
    <details style="margin-top:10px"><summary class="small">Incolla una copia di sicurezza (dal PDA di claude.ai o da un file)</summary><textarea data-dr="impTxt" style="min-height:90px;margin-top:6px" placeholder='{"stato":…}'>${esc(ui.impTxt||"")}</textarea><button class="btn g s" data-a="impTxt" style="margin-top:6px">Carica questo testo</button></details>
    <p class="small muted">Caricare una partita sostituisce quella attuale. Prima salva su file, se ti serve.</p>
    <h3 style="margin-top:14px">Giocare col GM</h3><p class="small">Per una sessione con Claude: «Salva su file» e manda il file in chat (o la copia di sicurezza). A fine sessione Claude ti ridà il file aggiornato: «Carica da file».</p>
    <h3 style="margin-top:14px">Nuova partita</h3><button class="btn g s" data-a="newgame">${ui.ngSure?"Sicuro? Cancella tutto (salva prima)":"Ricomincia da zero"}</button></section>
  ${llmPane()}
  <section class="pane"><h2>L'app</h2><p class="small">${online?"In linea.":"<b>Offline</b>: funziona tutto tranne i dialoghi col modello."} ${inst?"Installata.":"Per installarla: nel browser, menu → «Installa app» (Chrome, Edge) o «Aggiungi alla schermata Home» (telefono)."}</p>
    <p class="small muted">Storie caricate: ${EVD.list.length}. Versione ${APPV}.</p></section></div>`;}
/* ===== gruppo: chi viaggia con te ===== */
const mine=y=>!/^(png|nasc):/.test(String(y.dove||""));
const ruolo=p=>{const f=(p.fazione||"").toLowerCase();return /client/.test(f)?"cliente":/compagn/.test(f)?"compagno":"altro";};
const nv=(p,k,re,def)=>{if(p[k]!=null&&p[k]!=="")return p[k];const m=(p.nota||"").match(re);return m?m[1]:def;};
const gDado=p=>nv(p,"dado",/Dado ([A-D])/,"C"),gMor=p=>nv(p,"morale",/Morale ([A-D])/,"C"),gPau=p=>+nv(p,"paura",/Paura (\d)/,0),gPorta=p=>+nv(p,"porta",/porta (\d+) slot/,ruolo(p)==="compagno"?6:2);
const gPaga=p=>nv(p,"paga",/Paga: ([\d.]+) ₽ al giorno/,"");
const carried=p=>L.inv.filter(y=>y.dove==="png:"+p.id);
const gruppo=()=>L.png.filter(p=>p.con&&p.stato!=="morto");
function gRoll(p,what){const g=what==="morale"?gMor(p):gDado(p);const fd=+p.fiducia||0;const one=()=>d(DIE[g]);let v=[one()];if(what==="morale"&&fd<0)v.push(one());
  const sc=x=>succ(x);let s=what==="morale"&&fd<0?Math.min(...v.map(sc)):sc(v[0]);
  const lab=what==="morale"?"Morale":"dado";const txt=`${p.nome}: ${lab} ${g} → ${v.join(" e ")}${v.length>1?" (fiducia negativa: tiene il peggiore)":""} = ${s} success${s===1?"o":"i"}${what==="morale"&&s===0?" · CEDE":""}${what!=="morale"&&fd>=2?" · fiducia 2: +1 gradino se aiuta":""}`;
  soloPush(`Gruppo · ${lab}`,[esc(txt)]);add("tiri",{testo:txt,succ:s,data:S.clock.data,ora:S.clock.ora});toast(txt);}
function vGruppo(){const G=gruppo();const qui=L.png.filter(p=>!p.con&&p.stato!=="morto"&&p.luogo&&p.luogo===S.clock.luogo);const altri=L.png.filter(p=>!p.con&&p.stato!=="morto"&&!(p.luogo&&p.luogo===S.clock.luogo));
  const giveable=L.inv.filter(y=>mine(y)&&["zaino","addosso"].includes(y.dove||"zaino"));
  const pips=(id,v,max,k,warn)=>`<span class="row" style="gap:3px">${Array.from({length:max},(_,i)=>`<button class="pip${i<v?" on":""}${warn&&i>=warn?" w":""}" data-a="gset" data-k="${id}" data-v="${k}:${i+1===v?i:i+1}" aria-label="${k} ${i+1}"></button>`).join("")}</span>`;
  const card=p=>{const r=ruolo(p),c=carried(p),cs=c.reduce((t,y)=>t+(+y.slot||0)*(+y.qta||1),0),po=gPorta(p),pa=gPau(p),fe=+p.fer||0,fd=+p.fiducia||0;
    return `<article class="gcard${p.stato==="ferito"||fe?" hurt":""}"><div class="row" style="gap:10px;flex-wrap:nowrap">${avHtml(p,"av")}<div style="flex:1;min-width:0"><b>${esc(p.nome)}</b><div class="small muted">${esc(p.fazione||"—")} · fiducia ${fd>0?"+":""}${fd}${fd>=2?" (+1 quando aiuta)":fd<0?" (Morale tirato due volte, il peggiore)":""}</div></div><button class="btn g s" data-a="gleave" data-k="${p.id}">Lascia qui</button></div>
      <div class="gstats"><label class="f"><span class="lbl">Dado</span><select data-g="${p.id}" data-gk="dado">${["D","C","B","A"].map(g=>`<option ${gDado(p)===g?"selected":""}>${g}</option>`).join("")}</select></label>
        ${r!=="cliente"?`<label class="f"><span class="lbl">Morale</span><select data-g="${p.id}" data-gk="morale">${["D","C","B","A"].map(g=>`<option ${gMor(p)===g?"selected":""}>${g}</option>`).join("")}</select></label>`:""}
        <label class="f"><span class="lbl">Porta (slot)</span><input type="number" min="0" data-g="${p.id}" data-gk="porta" value="${po}"></label>
        ${r==="compagno"?`<label class="f"><span class="lbl">Paga al giorno</span><input type="number" min="0" step="100" data-g="${p.id}" data-gk="paga" value="${esc(String(gPaga(p)).replace(/\./g,""))}"></label>`:""}</div>
      ${r==="cliente"?`<div class="row small" style="gap:6px;margin-top:6px"><b>Paura</b>${pips(p.id,pa,5,"paura",3)}<span class="${pa>=5?"warn":""}">${pa>=5?"PANICO: scappa, si blocca o spara a caso":pa>=3?"lento e rumoroso: Allerta +1 a tappa":"tranquillo"}</span>${pa>=5?`<button class="btn g s" data-a="gpanic" data-k="${p.id}">Cosa fa?</button>`:""}</div>`:""}
      <div class="row small" style="gap:6px;margin-top:6px"><b>Danni</b>${pips(p.id,fe,4,"fer",3)}<span class="${fe>=3?"warn":""}">${fe>=4?"morto":fe>=3?"fuori combattimento":fe?"ferito":"illeso"}</span></div>
      <div class="row small" style="gap:6px;margin-top:6px"><button class="btn g s" data-a="groll" data-k="${p.id}">Tira il suo dado (${gDado(p)})</button>${r!=="cliente"?`<button class="btn g s" data-a="gmor" data-k="${p.id}">Tira il Morale (${gMor(p)})</button>`:""}</div>
      <div class="small" style="margin-top:8px"><b>Porta</b> <span class="num ${cs>po?"warn":""}">${fs(cs)}/${po} slot</span></div>
      ${c.length?`<ul class="items">${c.map(y=>`<li class="row small" style="gap:6px;flex-wrap:nowrap">${ico(y.nome)}<span style="flex:1;min-width:0">${esc(y.nome)}${(+y.qta||1)>1?` ×${y.qta}`:""}${ammoOf(y)?` · ${colpiOf(y)} colpi`:""}</span><button class="btn g s" data-a="gback" data-k="${y.id}">Riprendi</button></li>`).join("")}</ul>`:""}
      ${giveable.length?`<div class="row" style="gap:6px;margin-top:4px"><select data-gi="${p.id}" style="flex:1 1 10em;min-height:36px">${giveable.map(y=>`<option value="${y.id}">${esc(y.nome)} (${fs((+y.slot||0)*(+y.qta||1))} slot)</option>`).join("")}</select><button class="btn s" data-a="ggive" data-k="${p.id}">Dagli</button></div>`:""}
      <div style="margin-top:6px"><button class="btn g s" data-a="parla" data-k="${p.id}">${ui.chatWith===p.id?"Chiudi il dialogo":"Parla"}</button>${ui.chatWith===p.id?chatBox(p.id):""}</div><details class="gnote"><summary class="small muted">nota</summary><textarea data-u="${p.id}" data-c="png" data-k="nota" style="min-height:56px">${esc(p.nota||"")}</textarea></details></article>`;};
  const clienti=G.filter(p=>ruolo(p)==="cliente"),comp=G.filter(p=>ruolo(p)==="compagno");const paga=comp.reduce((t,p)=>t+(+String(gPaga(p)).replace(/\./g,"")||0),0);
  return `<div class="grid"><section class="pane" style="grid-column:1/-1"><div class="row" style="justify-content:space-between"><h2>Il gruppo</h2><span class="small">a <b>${esc(S.clock.luogo||"—")}</b> · ${G.length?`${G.length} con te`:"sei da solo"}</span></div>
    <p class="small muted" style="margin-top:0">Chi è nel gruppo si sposta con te quando premi «Arrivato» nella Zona. Chi lasci resta dove l'hai lasciato.</p>
    ${G.length?`<div class="gcards">${G.map(card).join("")}</div>`:`<p class="empty">Nessuno con te.</p>`}
    ${G.length?`<div class="row" style="gap:6px;margin-top:10px">${clienti.length?`<span class="lbl" style="margin:0">Paura dei clienti</span><button class="btn g s" data-a="gpau" data-v="1" title="segnale dell'Emissione, mutanti in vista, notte senza fuoco">+1 a tutti</button><button class="btn g s" data-a="gpau" data-v="2" title="uno del gruppo morto">+2 a tutti</button><button class="btn g s" data-a="gpau" data-v="-1" title="una notte vera">−1 a tutti</button>`:""}
      <button class="btn g s" data-a="geat">Mangiano (−${G.length} cibo)</button>${paga?`<button class="btn g s" data-a="gpay">Paga la giornata (${fmtR(paga)})</button>`:""}</div>`:""}</section>
  <section class="pane"><h3>Qui a ${esc(S.clock.luogo||"—")}</h3>${qui.length?qui.map(p=>`<div class="row" style="gap:8px;flex-wrap:nowrap;padding:4px 0">${avHtml(p,"av sm")}<span style="flex:1;min-width:0"><b>${esc(p.nome)}</b><br><span class="small muted">${esc(p.fazione||"—")}</span></span><button class="btn s" data-a="gjoin" data-k="${p.id}">Con me</button></div>`).join(""):`<p class="small muted">Nessuno segnato qui. Le persone prendono un luogo quando le lasci da qualche parte, o con «Segna qui» qui sotto.</p>`}</section>
  <section class="pane"><h3>Altre persone</h3><div class="row" style="gap:6px"><select data-dr="gsel" style="flex:1 1 12em">${altri.map(p=>`<option value="${p.id}" ${ui.gsel===p.id?"selected":""}>${esc(p.nome)}${p.luogo?` · ${esc(p.luogo)}`:""}</option>`).join("")}</select><button class="btn s" data-a="gjoin" data-k="">Con me</button><button class="btn g s" data-a="ghere">Segna qui</button></div>
    <p class="small muted">«Con me» lo aggiunge al gruppo (è qui con te). «Segna qui» dice solo che si trova a ${esc(S.clock.luogo||"—")}.</p></section></div>`;}
/* ===== salute: dove colpisce, ferite per parte, medicine ed effetti ===== */
const PARTI=[["testa","Testa"],["torace","Torace"],["bsx","Braccio sinistro"],["bdx","Braccio destro"],["gsx","Gamba sinistra"],["gdx","Gamba destra"]];
const PN=Object.fromEntries(PARTI);
const zonaOf=p=>p==="testa"?"testa":p==="torace"?"torace":p[0]==="b"?"braccia":"gambe";
const CRIT={torace:[null,{t:"costola incrinata",pen:{forza:1},x:"−1 a Forza"},{t:"costola incrinata",pen:{forza:1},x:"−1 a Forza"},{t:"costola rotta",rotto:1,x:"niente corsa, ogni sforzo +1 Fatica"},{t:"ventre aperto",sang:"ora",x:"+1 Ferite ogni ora senza Pronto soccorso"},{t:"polmone",pen:{forza:1,agilita:1},x:"fiato corto, −1 a tutto ciò che è fisico"},{t:"arteria o organo",sang:"art",morente:1,x:"MORENTE: Pronto soccorso entro pochi minuti, poi chirurgia"}],
 braccia:[null,{t:"braccio ferito",pen:{tiro:1,corpo:1},x:"−1 a Tiro e Corpo a corpo"},{t:"braccio ferito",pen:{tiro:1,corpo:1},x:"−1 a Tiro e Corpo a corpo"},{t:"braccio ferito",pen:{tiro:1,corpo:1},x:"−1 a Tiro e Corpo a corpo"},{t:"osso rotto",rotto:1,pen:{tiro:2,corpo:2},x:"niente armi a due mani"},{t:"osso rotto",rotto:1,pen:{tiro:2,corpo:2},x:"niente armi a due mani"},{t:"arteria",sang:"art",x:"+1 Ferite a turno finché non si lega"}],
 gambe:[null,{t:"gamba ferita",pen:{mobilita:1},x:"−1 a Mobilità, niente corsa"},{t:"gamba ferita",pen:{mobilita:1},x:"−1 a Mobilità, niente corsa"},{t:"gamba ferita",pen:{mobilita:1},x:"−1 a Mobilità, niente corsa"},{t:"osso rotto",rotto:1,pen:{mobilita:3},x:"non cammini"},{t:"osso rotto",rotto:1,pen:{mobilita:3},x:"non cammini"},{t:"femorale",sang:"art",morente:1,x:"MORENTE: va legata subito"}],
 testa:[null,{t:"commozione",pen:{intelletto:1},x:"−1 a Intelletto, nausea"},{t:"commozione",pen:{intelletto:1},x:"−1 a Intelletto, nausea"},{t:"occhio o orecchio",pen:{ricognizione:1},x:"forse permanente"},{t:"occhio o orecchio",pen:{ricognizione:1},x:"forse permanente"},{t:"trauma cranico",x:"svenuto"},{t:"colpo mortale",morto:1,x:"morte"}]};
const MEDF={ /* f: farmaco da usare su di sé; w: cura una ferita */
 "Benda":{w:1,txt:"ferma il sangue di un braccio, o lega una ferita"},
 "Laccio emostatico":{w:1,txt:"ferma l'arteria di braccio o gamba, anche la femorale"},
 "Stecca":{w:1,txt:"blocca una frattura di braccio o gamba"},
 "Kit medico AI-2":{w:1,txt:"−1 Ferite, chiude il ventre aperto"},
 "Kit medico militare":{w:1,txt:"−1 Ferite, chiude il ventre, stabilizza un morente"},
 "Kit medico scientifico":{w:1,txt:"−1 Ferite, chiude il ventre, −1 Radiazioni"},
 "Kit chirurgico":{w:1,txt:"chirurgia sul campo: toglie l'effetto di una ferita critica"},
 "Antidolorifici":{f:1,dur:240,ferRid:1,txt:"4 ore: malus delle Ferite −1 gradino"},
 "Morfina":{f:1,dur:60,ferRid:9,poi:{fatica:1},txt:"1 ora senza malus delle Ferite · poi +1 Fatica"},
 "Adrenalina":{f:1,dur:10,ferRid:9,fatIgn:1,poi:{fatica:1,nervi:1},txt:"10 minuti senza malus di Ferite e Fatica · poi +1 Fatica, +1 Nervi"},
 "Pervitin":{f:1,dur:240,mods:{forza:1,agilita:1},poi:{fatica:2,nervi:1},txt:"4 ore: +1 gradino a Forza e Agilità, niente sonno · poi +2 Fatica, +1 Nervi"},
 "Fenazepam":{f:1,now:{nervi:-2},dur:240,mods:{intelletto:-1,agilita:-1},txt:"−2 Nervi · 4 ore: −1 gradino a Intelletto e Agilità"},
 "Stimolante":{f:1,now:{fatica:-2},dur:240,poi:{fatica:2,nervi:1},txt:"−2 Fatica · dopo 4 ore +2 Fatica, +1 Nervi"},
 "Antirad":{f:1,now:{rad:-2,fatica:1},txt:"−2 Radiazioni · +1 Fatica"},
 "Radioprotettore":{f:1,dur:60,txt:"un'ora: −1 alle Radiazioni prese"},
 "Psi-block":{f:1,dur:60,txt:"un'ora: +1 Sangue freddo contro il psi (accendilo nei Dadi come passo)"},
 "Antibiotici":{f:1,dur:7*1440,txt:"una settimana: +1 gradino ai tiri di guarigione"},
 "Vodka":{f:1,now:{rad:-1},dur:60,mods:{intelletto:-1},txt:"−1 Radiazioni · un'ora −1 gradino a Intelletto"},
 "Energetica":{f:1,now:{fatica:-1},dur:480,txt:"−1 Fatica · stanotte dormi male"}};
const clk=()=>`${S.clock.data} ${S.clock.ora}`;
const clkAdd=min=>{const [y,m,dd]=S.clock.data.split("-").map(Number);const [h,mi]=S.clock.ora.split(":").map(Number);const t=new Date(Date.UTC(y,m-1,dd,h,mi)+min*60000);return t.toISOString().slice(0,10)+" "+t.toISOString().slice(11,16);};
const minTo=f=>{const p=s=>{const [d,o]=s.split(" ");const [y,m,dd]=d.split("-").map(Number);const [h,mi]=o.split(":").map(Number);return Date.UTC(y,m-1,dd,h,mi);};return Math.round((p(f)-p(clk()))/60000);};
const durTxt=m=>m>=1440?`${Math.round(m/1440)} g`:m>=60?`${Math.floor(m/60)} h${m%60?` ${m%60}′`:""}`:`${m}′`;
const trAdd=o=>{for(const k in o)S.tr[k]=Math.max(0,Math.min(6,(+S.tr[k]||0)+o[k]));};
const effs=()=>(S.eff||[]).filter(e=>minTo(e.fino)>0);
function effTick(){if(conn==="loading"||!S.eff||!S.eff.length)return;const done=S.eff.filter(e=>minTo(e.fino)<=0);if(!done.length)return;S.eff=S.eff.filter(e=>minTo(e.fino)>0);
  done.forEach(e=>{if(e.poi){trAdd(e.poi);toast(`Finito: ${e.n} (${Object.entries(e.poi).map(([k,v])=>`${v>0?"+":""}${v} ${k}`).join(", ")}).`);}});save();}
const effMod=a=>effs().reduce((t,e)=>t+((e.mods||{})[a]||0),0);
const ferRid=()=>effs().reduce((t,e)=>Math.max(t,e.ferRid||0),0);
const fatIgn=()=>effs().some(e=>e.fatIgn);
function woundPen(a,s){const out=[];(S.corpo||[]).forEach(w=>{const P=w.pen||{};let v=(P[a]||0)+(s?(P[s]||0):0);if(w.stecca&&w.rotto)v=Math.min(v,1);if(v>0)out.push({n:`${w.t} (${PN[w.p].toLowerCase()})`,v});});return out;}
/* armatura sulla parte: tuta su tutto, piastra e giubbotti sul torace, elmetto in testa */
function armorAt(p){let best={cl:0,it:null};L.inv.forEach(x=>{if(x.dove!=="indossato")return;const e=armOf(x.nome);const n=e?e.n:x.nome;let cl=+x.classe||classeOf(n)||0;const st=x.tipo==="armatura"?wStato(x):x.stato;if(st==="rotto")cl=0;else if(st==="usurato")cl=Math.max(0,cl-1);
    let covers=false;if(/^(Elmetto|Berretto)/.test(n))covers=p==="testa";else if(/^Piastra|^Portapiastre/.test(n))covers=p==="torace";else if(n==="Giubbotto con piastra leggera"){covers=p!=="testa";if(p!=="torace")cl=Math.min(cl,1);}else if(/^Maschera|^Filtro/.test(n))covers=false;else covers=x.tipo==="armatura"&&p!=="testa";
    if(covers&&cl>best.cl)best={cl,it:x};});return best;}
function hitRoll(){const r=d(6);const z=r===1?"gambe":r<=4?"torace":r===5?"braccia":"testa";const side=d(2)===1?"sx":"dx";return {r,p:z==="gambe"?"g"+side:z==="braccia"?"b"+side:z};}
function hitCalc(h){const A=armorAt(h.p);const P=+h.P||0,D=+h.D||0,ex=+h.ex||0;let dmg=0,esito;
  if(P>A.cl){dmg=D+ex;esito=A.cl?`passa la classe ${A.cl}`:"nessuna armatura";}else if(P===A.cl){dmg=Math.max(1,D+ex-1);esito=`P uguale alla classe ${A.cl}: −1 danno`;}else if(P===A.cl-1){esito=`fermato dalla classe ${A.cl}: +1 Fatica e soppressione`;}else esito=`fermato dalla classe ${A.cl}: solo soppressione`;
  return {A,dmg,esito,fat:P===A.cl-1?1:0};}
function hitApply(h){const c=hitCalc(h);const lines=[`Colpito: ${PN[h.p].toLowerCase()}${h.r?` (d6 = ${h.r})`:""} · D${h.D} P${h.P}${+h.ex?` +${h.ex}`:""} · ${c.esito}`];
  if(c.A.it&&c.A.cl>0&&c.A.it.tipo==="armatura"){const it=c.A.it;const ns=(+it.segni||0)+1;upd("inv",it.id,{segni:ns,stato:wStato({...it,segni:ns})});lines.push(`${it.nome}: +1 segno di usura`);}
  if(c.fat)trAdd({fatica:1});
  if(c.dmg>0){const before=+S.tr.ferite||0;trAdd({ferite:c.dmg});const w={id:uid(),p:h.p,d:c.dmg,t:"ferita",x:"",quando:clk(),acc:0};lines.push(`${c.dmg} dann${c.dmg>1?"i":"o"}: Ferite ${before} → ${S.tr.ferite}`);
    if(c.dmg>=2||before+c.dmg>=3){const r=d(6);const C=CRIT[zonaOf(h.p)][r];Object.assign(w,{t:C.t,x:C.x,pen:C.pen||null,sang:C.sang||"",rotto:!!C.rotto,morente:!!C.morente,morto:!!C.morto,crit:r});lines.push(`Ferita critica, d6 = ${r}: ${C.t} — ${C.x}`);}
    S.corpo=(S.corpo||[]).concat(w);}
  lines.push("Tira Sangue freddo per la soppressione (0 = perdi la prossima azione lenta e +1 Nervi).");
  sfx("hit");soloPush("Colpo ricevuto",lines.map(esc));ui.hit=null;save();toast(lines[c.dmg>0?1:0]||"Colpo segnato.");}
function curable(w,n){const z=zonaOf(w.p);if(n==="Benda")return (w.sang==="art"&&z==="braccia"&&!w.legata)||(!w.sang&&!w.bendata&&w.d>0);
  if(n==="Laccio emostatico")return w.sang==="art"&&(z==="braccia"||z==="gambe")&&!w.legata;
  if(n==="Stecca")return w.rotto&&!w.stecca&&z!=="torace"&&z!=="testa";
  if(/^Kit medico/.test(n))return w.d>0||w.sang==="ora"||(n==="Kit medico militare"&&w.morente);
  if(n==="Kit chirurgico")return !!(w.crit&&(w.pen||w.sang||w.morente))&&!w.morto;return false;}
function cureApply(w,item){const n=armOf(item.nome).n;const out=[];const S0=(S.corpo||[]);const W=S0.find(z=>z.id===w.id);if(!W)return;
  if(n==="Benda"){if(W.sang&&zonaOf(W.p)==="braccia"){W.legata=true;out.push("sangue fermato");}else{W.bendata=true;out.push("bendata");}}
  if(n==="Laccio emostatico"){W.legata=true;out.push("arteria legata");if(W.morente)out.push("resta morente finché non la stabilizza un kit militare o chirurgico");}
  if(n==="Stecca"){W.stecca=true;out.push("frattura steccata: −1 invece del blocco");}
  if(/^Kit medico/.test(n)){if(W.d>0){W.d--;trAdd({ferite:-1});out.push("−1 Ferite");}if(W.sang==="ora"){W.sang="";out.push("ventre chiuso");}if(n==="Kit medico militare"&&W.morente){W.morente=false;W.operare=true;out.push("stabilizzato: serve un chirurgo o un kit chirurgico");}if(n==="Kit medico scientifico"){trAdd({rad:-1});out.push("−1 Radiazioni");}}
  if(n==="Kit chirurgico"){W.pen=null;W.sang="";W.morente=false;W.operare=false;W.x=(W.x?W.x+" · ":"")+"operata";out.push("ferita operata: niente più effetto");}
  if(W.d<=0&&!W.sang&&!W.morente&&!(W.rotto&&!W.stecca)&&!W.pen)S.corpo=S0.filter(z=>z.id!==W.id);
  sfx("heal");useItem(item);soloPush(`Cura: ${n} su ${PN[W.p].toLowerCase()}`,[esc(`${W.t}: ${out.join(", ")}`)]);save();toast(`${n}: ${out.join(", ")}.`);}
function useItem(it){if((+it.qta||1)>1)upd("inv",it.id,{qta:(+it.qta)-1});else del("inv",it.id);}
function drugApply(item){const n=armOf(item.nome).n,M=MEDF[n];if(!M)return;if(M.now)trAdd(M.now);if(M.dur)S.eff=(S.eff||[]).concat({n,fino:clkAdd(M.dur),mods:M.mods||null,ferRid:M.ferRid||0,fatIgn:!!M.fatIgn,poi:M.poi||null,txt:M.txt});sfx("heal");useItem(item);soloPush(`Preso: ${n}`,[esc(M.txt)]);save();toast(`${n}: ${M.txt}`);}
function bleedTick(min){let add=0;(S.corpo||[]).forEach(w=>{if(!w.sang||w.legata)return;w.acc=(+w.acc||0)+min;const per=w.sang==="art"?10:60;const n=Math.floor(w.acc/per);if(n){w.acc-=n*per;w.d+=n;add+=n;}});if(add){trAdd({ferite:add});toast(`Perdi sangue: +${add} Ferite.`);}}
function bodySvg(sel){const sum=p=>(S.corpo||[]).filter(w=>w.p===p).reduce((t,w)=>t+w.d,0);const flag=(p,k)=>(S.corpo||[]).some(w=>w.p===p&&w[k]);
  const col=p=>{if(flag(p,"morto")||flag(p,"morente"))return "#5a0f0f";const s=sum(p);return s>=3?"#c0392b":s===2?"#e0782a":s===1?"#d9b84a":(S.corpo||[]).some(w=>w.p===p)?"#b8a15a":"#7f9a6c";};
  const shape={testa:`<circle cx="80" cy="34" r="22"/>`,torace:`<path d="M52 62 H108 Q114 64 114 74 L110 150 Q80 158 50 150 L46 74 Q46 64 52 62Z"/>`,bsx:`<path d="M44 66 Q30 70 28 84 L20 150 Q22 158 30 156 L40 100 L46 76Z"/>`,bdx:`<path d="M116 66 Q130 70 132 84 L140 150 Q138 158 130 156 L120 100 L114 76Z"/>`,
    gsx:`<path d="M52 154 Q66 160 78 158 L74 260 Q72 270 62 270 Q54 270 54 260Z"/>`,gdx:`<path d="M82 158 Q94 160 108 154 L106 260 Q106 270 98 270 Q88 270 86 260Z"/>`};
  const ctr={testa:[80,34],torace:[80,108],bsx:[30,118],bdx:[130,118],gsx:[66,214],gdx:[94,214]};
  return `<svg class="body" viewBox="0 0 160 280" role="img" aria-label="Il corpo e le ferite">${PARTI.map(([p,nm])=>`<g class="bp${sel===p?" sel":""}" data-a="cpart" data-k="${p}" fill="${col(p)}" stroke="#0b0c0c" stroke-width="1.6"><title>${nm}</title>${shape[p]}</g>`).join("")}
    ${PARTI.map(([p])=>{const [x,y]=ctr[p];const s=sum(p);let t="";if(s)t+=`<text x="${x}" y="${y+5}" text-anchor="middle" class="bn">${s}</text>`;if(flag(p,"sang")&&(S.corpo||[]).some(w=>w.p===p&&w.sang&&!w.legata))t+=`<path d="M${x+14} ${y-14} q4 6 0 9 q-4 -3 0 -9z" fill="#e33" stroke="#300" stroke-width=".8"/>`;if(flag(p,"rotto"))t+=`<text x="${x-16}" y="${y-8}" class="bi">${(S.corpo||[]).some(w=>w.p===p&&w.rotto&&!w.stecca)?"✕":"▭"}</text>`;return t;}).join("")}</svg>`;}
function vSalute(){S.corpo=S.corpo||[];const sel=ui.cpart||"torace";const ws=S.corpo.filter(w=>w.p===sel);const meds=L.inv.filter(x=>{const e=armOf(x.nome);return e&&MEDF[e.n]&&mine(x)&&x.dove!=="deposito";});
  const cureBtns=w=>meds.filter(it=>MEDF[armOf(it.nome).n].w&&curable(w,armOf(it.nome).n)).map(it=>`<button class="btn s" data-a="cure" data-k="${w.id}" data-v="${it.id}" title="${esc(MEDF[armOf(it.nome).n].txt)}">${ico(it.nome)} ${esc(armOf(it.nome).n)}</button>`).join("");
  const h=ui.hit||{D:2,P:2,ex:0,p:"",r:0};const hc=h.p?hitCalc(h):null;const tot=S.corpo.reduce((t,w)=>t+w.d,0);const fer=+S.tr.ferite||0;
  const pen=(()=>{const m={};S.corpo.forEach(w=>{const P=w.pen||{};for(const k in P){let v=P[k];if(w.stecca&&w.rotto)v=Math.min(v,1);m[k]=(m[k]||0)+v;}});return Object.entries(m);})();const E=effs();
  return `<div class="grid"><section class="pane"><div class="row" style="justify-content:space-between"><h2>Salute</h2><span class="small">Ferite <b class="num ${fer>=5?"warn":""}">${fer}/6</b>${fer!==tot?` <span class="muted">(${tot} segnate sul corpo)</span>`:""}</span></div>
    <div class="bodywrap">${bodySvg(sel)}<div class="small"><div class="leg"><i style="background:#7f9a6c"></i>illeso</div><div class="leg"><i style="background:#d9b84a"></i>1 danno</div><div class="leg"><i style="background:#e0782a"></i>2</div><div class="leg"><i style="background:#c0392b"></i>3+</div><div class="leg"><i style="background:#5a0f0f"></i>morente</div><div class="leg"><span style="color:#e33">●</span> perde sangue</div><div class="leg">✕ osso rotto · ▭ steccato</div>
      ${E.length?`<h3 style="margin-top:10px">In corpo</h3>${E.map(e=>`<div class="eff"><b>${esc(e.n)}</b> <span class="muted num">ancora ${durTxt(minTo(e.fino))}</span><div class="muted">${esc(e.txt||"")}</div></div>`).join("")}`:""}
      ${pen.length?`<p class="warn" style="margin-top:8px">Dalle ferite: ${pen.map(([a,v])=>`${ATN[a]||SKN[a]} −${v}`).join(", ")}</p>`:""}</div></div>
    <h3 style="margin-top:6px">${PN[sel]}</h3>
    ${ws.length?ws.map(w=>`<div class="wound${w.morente?" mor":""}"><div class="row" style="justify-content:space-between"><b>${esc(w.t)}${w.crit?` <span class="small muted">(critico ${w.crit})</span>`:""}</b><span class="num small">${w.d} dann${w.d===1?"o":"i"}</span></div>
      <div class="small">${esc(w.x||"")}${w.sang&&!w.legata?` · <span class="warn">${w.sang==="art"?"emorragia: +1 Ferite ogni 10 minuti":"sanguina: +1 Ferite ogni ora"}</span>`:""}${w.legata?" · legata":""}${w.bendata?" · bendata":""}${w.stecca?" · steccata":""}${w.operare?" · <span class=\"warn\">da operare</span>":""}</div>
      <div class="row" style="gap:6px;margin-top:6px">${cureBtns(w)||`<span class="small muted">Nessuna cura adatta nello zaino.</span>`}<button class="btn g s" data-a="wheal" data-k="${w.id}" title="guarigione col tempo o dal medico">−1 guarisce</button><button class="btn g s" data-a="wdel" data-k="${w.id}">Togli</button></div></div>`).join(""):`<p class="small muted">Niente su ${PN[sel].toLowerCase()}. Tocca una parte del corpo per vederla.</p>`}</section>
  <section class="pane"><h2>Colpo ricevuto</h2><p class="small muted" style="margin-top:0">Danno e P sono della munizione (o del mutante). I successi extra li aggiunge chi ti ha colpito. L'armatura indossata sulla parte si calcola da sola (6.7).</p>
    <div class="grid" style="gap:8px;grid-template-columns:repeat(3,minmax(0,1fr))"><label class="f"><span class="lbl">Danno D</span><input type="number" min="0" data-h="D" value="${h.D}"></label><label class="f"><span class="lbl">Perforazione P</span><input type="number" min="0" data-h="P" value="${h.P}"></label><label class="f"><span class="lbl">Successi extra</span><input type="number" min="0" data-h="ex" value="${h.ex}"></label></div>
    <div class="row" style="margin-top:8px"><button class="btn g" data-a="hroll">Tira dove colpisce (d6)</button><select data-h="p" style="width:auto"><option value="">o scegli la parte</option>${PARTI.map(([k,n])=>`<option value="${k}" ${h.p===k?"selected":""}>${n}</option>`).join("")}</select></div>
    ${hc?`<div class="res" style="margin-top:8px"><b>${PN[h.p]}</b>${h.r?` (d6 = ${h.r})`:""} · armatura classe ${hc.A.cl}${hc.A.it?` (${esc(hc.A.it.nome)})`:""}<br>${esc(hc.esito)} → <b>${hc.dmg} dann${hc.dmg===1?"o":"i"}</b>${hc.dmg>=2||(+S.tr.ferite||0)+hc.dmg>=3&&hc.dmg>0?" · <span class=\"warn\">ferita critica</span>":""}</div><button class="btn" data-a="happly" style="width:100%;margin-top:6px">Segna il colpo</button>`:""}
    <h2 style="margin-top:16px">Farmaci</h2>
    ${meds.filter(it=>MEDF[armOf(it.nome).n].f).map(it=>{const n=armOf(it.nome).n;return `<div class="drug">${ico(it.nome)}<div><b>${esc(n)}</b>${(+it.qta||1)>1?` <span class="muted">×${it.qta}</span>`:""}<div class="small muted">${esc(MEDF[n].txt)}</div></div><button class="btn s" data-a="drug" data-k="${it.id}">Prendi</button></div>`;}).join("")||`<p class="small muted">Nessun farmaco nello zaino. Kit e bende si usano dalla ferita, a sinistra.</p>`}
    <p class="small muted">Gli effetti a tempo finiscono da soli quando l'orologio del PDA passa l'ora: il conto («poi +2 Fatica…») si applica allora. Il sangue scende quando fai passare il tempo con +15′ / +1 h / +1 g o col viaggio.</p>${notteHtml()}</section></div>`;}
/* ===== bonus automatici da equipaggiamento e specializzazioni ===== */
const BON={"Contatore Geiger":["ricognizione","trovare chiazze e fonti di radiazioni"],"Rivelatore «Eco»":["ricognizione","anomalie"],"Rivelatore «Orso»":["ricognizione","anomalie e artefatti"],"Rivelatore «Veles»":["ricognizione","anomalie e artefatti"],
 "Ricevitore radio":["sopravvivenza","avvisi dell'Emissione"],"Torcia":["ricognizione","al buio"],"Binocolo":["ricognizione","da lontano"],"Visore notturno 1ª gen.":["ricognizione","al buio, fino a media"],"Visore notturno 2ª gen.":["ricognizione","al buio, fino a lunga"],
 "Attrezzi":["tecnica","lavoro sul campo"],"Kit riparazione armi":["tecnica","riparare armi"],"Kit riparazione armature":["tecnica","riparare armature"],"Kit medico AI-2":["pronto","curare"],"Kit medico militare":["pronto","curare, stabilizzare"],"Kit medico scientifico":["pronto","curare"],
 "Maschera PBF":["resistenza","gas e polvere"],"Maschera M40":["resistenza","gas e polvere"],"Tuta SEVA":["resistenza","anomalie, gas, radiazioni"],"Kit per il fuoco":["sopravvivenza","accendere un fuoco"],"Tenda da una persona":["sopravvivenza","dormire all'asciutto"],"Tenda da due o tre":["sopravvivenza","dormire all'asciutto"],
 "Torcia sull'arma":["tiro","al buio, a corta"],"Laser":["tiro","al buio, a corta"],"Torcia e laser":["tiro","al buio, a corta"],"Ottica notturna NSPU":["tiro","di notte"]};
const SPSK={"Tiratore scelto":"tiro","Marcia forzata":"resistenza","Mitragliere":"tiro","Cacciatore":"sopravvivenza","Passo leggero":"mobilita","Macellaio":"sopravvivenza","Armaiolo":"tecnica","Mani da meccanico":"tecnica","Elettricista":"tecnica","Chirurgo da campo":"pronto","Dosimetrista":"ricognizione","Contrattare":"persuasione","Ricettatore":"persuasione","Faccia da poker":"persuasione","Mano del bullone":"ricognizione","Naso per l'Emissione":"sopravvivenza","Fiuto per gli artefatti":"ricognizione","Strada vecchia":"sopravvivenza","Lingua del Bar":"persuasione","Pastore":"comando","Posti di blocco":"persuasione","Tattica di squadra":"comando","Lettore di anomalie":"ricognizione"};
const PEN={"Skat-9 militare":["mobilita",1],"Esoscheletro":["mobilita",1],"Elmetto Altyn con visiera":["ricognizione",1]};
function eqBonus(sk,W){if(!sk)return [];const out=[],seen=new Set();const ARTB={"Gocce":["resistenza","marce lunghe"],"Stella della notte":["ricognizione","di notte"],"Perline della mamma":["mobilita","schivare, buttarsi al riparo"],"Pezzo di carne":["resistenza","gas e acidi"],"Luce di luna":["sf","contro il psi"],"Scintilla":["*","contro gli Elettro"],"Fiocco di neve":["*","contro gli Elettro"]};
  artBelt().forEach(a=>{const B=ARTB[a[0]];if(B&&(B[0]===sk||B[0]==="*"))out.push({k:"it:"+a[0],n:a[0],c:B[1],t:"artefatto"});});
  L.inv.forEach(x=>{if(!mine(x)||x.dove==="deposito"||wStato(x)==="rotto"||x.stato==="rotto")return;const e=armOf(x.nome);if(!e||!BON[e.n]||BON[e.n][0]!==sk||seen.has(e.n))return;if(BON[e.n][0]==="tiro")return;seen.add(e.n);out.push({k:"it:"+e.n,n:e.n,c:BON[e.n][1],t:"oggetto"});});
  if(W&&sk==="tiro")(W.acc||[]).forEach(n=>{if(BON[n]&&BON[n][0]==="tiro"&&!seen.has(n)){seen.add(n);out.push({k:"it:"+n,n,c:BON[n][1],t:"sull'arma"});}});
  (S.pg.spec||"").split("\n").map(l=>l.trim()).filter(Boolean).forEach(l=>{const nm=Object.keys(SPSK).find(k=>l.toLowerCase().startsWith(k.toLowerCase()));const skl=nm?SPSK[nm]:null;if(skl===sk)out.push({k:"sp:"+nm,n:nm,c:SPD[nm]||"",t:"specializzazione"});});
  return out;}
function eqPen(a,s){const out=[];L.inv.forEach(x=>{if(x.dove!=="indossato")return;const e=armOf(x.nome);if(e&&PEN[e.n]&&PEN[e.n][0]===s)out.push({n:e.n,v:PEN[e.n][1]});});
  const sl=slots();if((sl.addosso>S.cap.addosso||sl.zaino>capZ())&&s==="mobilita")out.push({n:"sovraccarico",v:1});try{out.push(...woundPen(a,s));}catch(_){}return out;}
function eqState(){const r=ui.dr,s=r.a==="sf"?"sf":r.s;const W=armaSel();const bon=eqBonus(s,W);r.on=r.on||{};const act=bon.filter(b=>r.on[b.k]);const bv=Math.min(2,act.length);const pen=r.pen===false?[]:eqPen(r.a,s);const pv=pen.reduce((t,p)=>t+p.v,0);return {bon,act,bv,pen,pv,W};}
function eqHtml(){const r=ui.dr,E=eqState();const W=E.W;const accTxt=W&&(W.acc||[]).length?`<p class="small" style="margin:6px 0 0"><b>Sull'arma:</b> ${(W.acc||[]).map(n=>{const e=ARM.find(y=>y.n===n);return `${esc(n)} <span class="muted">(${esc(e?e.s:"")})</span>`;}).join(" · ")}</p>`:"";
  return `<div class="eqbox"><div class="row small" style="justify-content:space-between"><b>Equipaggiamento e specializzazioni</b><span class="num">${E.bv?`+${E.bv}`:"0"}${E.pv?` · −${E.pv}`:""} gradini</span></div>
    ${E.bon.length?`<div class="chips">${E.bon.map(b=>`<button class="chip" data-a="eqon" data-k="${esc(b.k)}" aria-pressed="${!!r.on[b.k]}" title="${esc(b.t)}">+1 ${esc(b.n)}<small> · ${esc(b.c)}</small></button>`).join("")}</div><p class="small muted" style="margin:2px 0 0">Accendi solo quelli che valgono in questa situazione. Al massimo +2 in tutto${E.act.length>2?' · <span class="warn">ne contano 2</span>':""}.</p>`:`<p class="small muted" style="margin:4px 0">Niente nello zaino o nelle specializzazioni che aiuti ${r.s&&r.a!=="sf"?esc(SKN[r.s]):"questo tiro"}.</p>`}
    ${(()=>{const dm=effMod(r.a);return dm?`<p class="small" style="margin:4px 0 0"><b>Farmaci:</b> ${dm>0?"+":""}${dm} gradini a ${esc(ATN[r.a])} (${effs().filter(e=>(e.mods||{})[r.a]).map(e=>esc(e.n)).join(", ")})</p>`:"";})()}${E.pen.length||r.pen===false?`<label class="row small" style="margin-top:4px"><input type="checkbox" data-d="pen" ${r.pen===false?"":"checked"} style="width:auto;min-height:0"> Malus da equipaggiamento${E.pen.length?`: ${E.pen.map(p=>`${esc(p.n)} −${p.v}`).join(", ")}`:""}</label>`:""}${accTxt}</div>`;}
function doRoll(){const r=ui.dr;const a=r.a,s=a==="sf"?"":r.s;const mal=r.tr?malus(a):0;const W=armaSel();const ws=W?(W.tipo==="arma"?wStato(W):W.stato||"ok"):"ok";if(ws==="rotto"){toast(`${W.nome} è rotta: non spara.`);return;}const E=eqState();const dm=effMod(a);const steps=Math.max(-4,Math.min(4,+r.p-mal-(ws==="usurato"?1:0)+E.bv-E.pv+dm));
  const [ga,gs]=grades(a,s,steps);const dice=[{l:ATN[a],g:ga,v:d(DIE[ga])}];if(gs)dice.push({l:SKN[s],g:gs,v:d(DIE[gs])});
  const ammo=Array.from({length:+r.m},()=>d(6));
  ui.roll={a,s,dice,ammo,steps,mal,forced:false,one:false,luck:false,w:W?{id:W.id,n:W.nome,u:ws==="usurato"}:null,eq:E.act.slice(0,2).map(b=>b.n).concat(dm>0?effs().filter(e=>(e.mods||{})[a]>0).map(e=>e.n):[]),pen:E.pen.map(p=>p.n).concat(dm<0?effs().filter(e=>(e.mods||{})[a]<0).map(e=>e.n):[])};
  if(W&&s==="tiro"&&isFire(armOf(W.nome))){const c=carOf(W),use=+r.m?3*(+r.m):1;if(c>0){const n=Math.max(0,c-use);upd("inv",W.id,{car:n});ui.roll.spent=Math.min(c,use);toast(`−${Math.min(c,use)} colpi: ne restano ${n}.`);}else toast("Il caricatore risulta vuoto: ricarica nello Zaino.");}
  sfx("dice");if(W&&s==="tiro"&&isFire(armOf(W.nome)))setTimeout(()=>sfx("shot"),320);finishRoll(true);}
function rollStats(R){const base=R.dice.reduce((x,y)=>x+succ(y.v),0);const hits=base>0?R.ammo.filter(v=>v===6).length:0;const jam=R.ammo.filter(v=>v===1||(R.w&&R.w.u&&v===2)).length>=2;return {base,hits,jam};}
function rollText(R){const st=rollStats(R);return `${R.w?`${R.w.n}${R.w.u?" (usurata, −1)":""} · `:""}${R.dice.map(x=>`${x.l} ${x.g}`).join(" + ")}${R.steps?` (passi ${R.steps>0?"+":""}${R.steps})`:""}${R.eq&&R.eq.length?` [+${R.eq.join(", +")}]`:""}${R.pen&&R.pen.length?` [−${R.pen.join(", −")}]`:""}: ${st.base} successi${R.ammo.length?`, colpi in più ${st.hits}${st.jam?", INCEPPATA":""}`:""}${R.spent?` · ${R.spent} colpi`:""}${R.forced?" · forzato":""}${R.one?" · è uscito un 1":""}${R.luck?" · punto fortuna":""}`;}
function finishRoll(){const R=ui.roll;const st=rollStats(R);if(st.base===0){S.pe=(+S.pe||0)+1;save();}if(st.jam&&R.w&&!R.jamMarked){R.jamMarked=true;const it=L.inv.find(x=>x.id===R.w.id);if(it&&it.tipo==="arma"){const ns=Math.min(wMax(it),(+it.segni||0)+1);upd("inv",it.id,{segni:ns,stato:wStato({...it,segni:ns})});toast(`Inceppata: ${it.nome} +1 segno di usura.`);}}add("tiri",{testo:rollText(R),succ:st.base,data:S.clock.data,ora:S.clock.ora});render();}
function force(){const R=ui.roll;if(!R||R.forced)return;R.forced=true;R.dice.forEach(x=>{if(succ(x.v)===0){x.v=d(DIE[x.g]);if(x.v===1)R.one=true;}});
  const k=(R.a==="forza"||R.a==="agilita")?"fatica":"nervi";S.tr[k]=Math.min(6,(+S.tr[k]||0)+1);toast(`Forzato: +1 ${k==="fatica"?"Fatica":"Nervi"}.`);if(R.one&&R.w){const it=L.inv.find(x=>x.id===R.w.id);if(it&&it.tipo==="arma"){const ns=Math.min(wMax(it),(+it.segni||0)+1);upd("inv",it.id,{segni:ns,stato:wStato({...it,segni:ns})});toast(`Forzato con un 1: ${it.nome} +1 segno di usura.`);}}finishRoll();}
function luck(){if(!S.fortuna||!ui.roll)return;S.fortuna=false;const R=ui.roll;R.dice.forEach(x=>x.v=d(DIE[x.g]));R.ammo=R.ammo.map(()=>d(6));R.forced=false;R.one=false;R.luck=true;finishRoll();}

/* ===== solitario ===== */
const PROB=[["Certo",90],["Quasi certo",80],["Probabile",65],["50/50",50],["Improbabile",35],["Quasi impossibile",20],["Impossibile",10]];
function soloPush(tit,righe){const e={tit,righe,ora:S.clock.ora,data:S.clock.data};ui.solo.unshift(e);add("solo",e);render();}
const meaning=()=>`${pk(AZ)} · ${pk(TE)}`;
function evento(){return [`${pk(FOCUS)}.`,`Significato: ${meaning()}.`];}
function oracolo(){const q=(ui.q||"").trim();const ch=+(ui.prob||50);const r=d(100);let t;
  if(r<=Math.ceil(ch*.2))t="Sì, e…";else if(r<=ch-8)t="Sì.";else if(r<=ch)t="Sì, ma…";else if(r<=ch+8)t="No, ma…";else if(r>100-Math.ceil((100-ch)*.2))t="No, e…";else t="No.";
  const righe=[`${q?`«${q}» `:""}(${ch}%, tiro ${r}): <b>${t}</b>`];const dg=r%11===0&&r<100&&r/11<=+S.tensione;if(dg)righe.push("Evento casuale!",...evento());soloPush("Oracolo",righe);}
function scena(){const r=d(10),t=+S.tensione;soloPush("Nuova scena",[r>t?`d10 = ${r}: va come previsto.`:r%2?`d10 = ${r}: la scena è <b>alterata</b>. Cambia un dettaglio importante.`:`d10 = ${r}: la scena è <b>interrotta</b>.`,...(r<=t&&r%2===0?evento():[])]);}
function reazione(){const f=+(ui.fid||0),r=d(6)+d(6),tot=r+f;soloPush("Reazione",[`2d6 = ${r}${f?` ${f>0?"+":""}${f} fiducia`:""} → ${tot}: <b>${REAZ.find(x=>tot<=x[0])[1]}</b>`]);}
function viaggio(){const p=+(ui.per||ZONE.find(z=>z[0]===S.clock.luogo)?.[1]||1),nt=!!ui.notte,r=d(6)+d(6),tot=r+p+(nt?1:0);const res=VIAGGIO.find(x=>tot<=x[0])[1];
  const e=d(6),em=e===6||(nt&&e>=5);const righe=[`2d6 = ${r} + pericolo ${p}${nt?" + notte":""} → ${tot}: <b>${res}</b>`];
  if(em){S.emiss=Math.min(6,(+S.emiss||0)+1);save();righe.push(`d6 = ${e}: l'orologio dell'Emissione avanza (${S.emiss}/6).`);}soloPush("Tappa di viaggio",righe);}
function tappe(){const a=S.clock.luogo,b=ui.dest;const p=a&&b&&path(a,b);if(!p||p.length<2)return;const nt=!!ui.notteV;const righe=[];
  p.slice(1).forEach((z,i)=>{const e=edge(p[i],z),per=perOf(z),r=d(6)+d(6),tot=r+per+(nt?1:0);const res=VIAGGIO.find(x=>tot<=x[0])[1];const em=d(6);const up=em===6||(nt&&em>=5);if(up)S.emiss=Math.min(6,(+S.emiss||0)+1);
    righe.push(`<b>${esc(p[i])} → ${esc(z)}</b> (${e[2]} km, ${e[3]*(nt?2:1)} h): 2d6 ${r} + ${per}${nt?" + notte":""} = ${tot} · ${res}${up?` <span class="warn">Emissione ${S.emiss}/6</span>`:""}`);});
  if(p.length-1>=3)righe.push(`Dalla terza tappa in poi: +1 Fatica a tappa${nt?", e +1 a tappa di notte":""}.`);save();soloPush("Viaggio",righe);}
function meteo(){const st=STAG(month()),r=d(6),m=METEO[st][r-1];S.clock.meteo=m;save();soloPush("Meteo",[`${st}, d6 = ${r}: <b>${m}</b>`]);}
function png(){const p={nome:`${pk(NOMI)} «${pk(SOPR)}»`,fazione:pk(FAZN),nota:`${pk(CAR)}. Vuole ${pk(VUOLE)}; teme ${pk(TEME)}. Segreto: ${pk(SEGR)}. Prima reazione: ${REAZ.find(x=>d(6)+d(6)<=x[0])[1].toLowerCase()}.`};ui.lastPng=p;soloPush("Persona",[`<b>${esc(p.nome)}</b>, ${p.fazione}.`,esc(p.nota)]);}

/* ===== equipaggiamento dei PNG e bottino ===== */
const KIT={
 novellino:{n:"Stalker novellino",a:[["Makarov PM","9×18 P",8],["Doppietta TOZ-34","12/70 pallettoni",2],["TOZ-66 a canne mozze","12/70 pallettoni",2]],t:["Giacca di pelle","Giubbotto da novellino"],h:[""],x:["Cibo (1 unità)","Antirad","Benda","Bulloni (venti)","Vodka","Kit medico AI-2"],r:[50,400]},
 veterano:{n:"Stalker veterano",a:[["AK-74","5,45 PS",30],["AKS-74U","5,45 PRS",30],["TOZ-194 a pompa","12/70 palla unica",6],["SKS","7,62×39 HP",10]],t:["Tuta «Alba»","Giubbotto con piastra leggera"],h:["Elmetto SSh-68",""],x:["Kit medico AI-2","Antirad","Rivelatore «Eco»","Contenitore di piombo","Cibo (1 unità)","Granata RGD-5"],r:[300,2500]},
 bandito:{n:"Bandito",a:[["TOZ-66 a canne mozze","12/70 pallettoni",2],["Makarov PM","9×18 P",8],["AKS-74U","5,45 PRS",30]],t:["Giacca di pelle","Giubbotto da novellino"],h:[""],x:["Vodka","Sigarette","Coltello NR-40","Benda","Roba rubata a qualcuno (chi la rivuole?)"],r:[100,1500]},
 militare:{n:"Militare di leva",a:[["AK-74","5,45 PS",30]],t:["Tuta militare da campo (classe 2)"],h:["Elmetto SSh-68"],x:["Granata F1","Kit medico militare","Cibo (1 unità)","Ricevitore radio","Sigarette"],r:[0,300]},
 speciali:{n:"Forze speciali",a:[["AK-74","5,45 PP",30],["AS Val","9×39 SP-5",20]],t:["Corazza delle forze speciali (classe 3)"],h:["Elmetto Sfera-08"],x:["Granata F1","Kit medico militare","Visore notturno 1ª gen.","Morfina"],r:[0,500]},
 dovere:{n:"Dovere",a:[["AK-74","5,45 PS",30],["AK-74","5,45 PP",30],["TOZ-194 a pompa","12/70 palla unica",6]],t:["PS5-M del Dovere"],h:["Elmetto SSh-68"],x:["Kit medico AI-2","Antirad","Granata RGD-5","Vodka"],r:[200,1500]},
 liberta:{n:"Libertà",a:[["AK-74","5,45 PS",30],["LR-300","5,56 M855",30],["MP5","9×19 Pst",30]],t:["Vento della Libertà"],h:["","Elmetto SSh-68"],x:["Sigarette","Vodka","Energetica","Kit medico AI-2"],r:[200,2000]},
 mercenario:{n:"Mercenario",a:[["M4A1","5,56 M855",30],["SIG 550","5,56 M855",30],["MP5","9×19 Pst",30]],t:["Tuta da mercenario"],h:["Elmetto SSh-68","Elmetto Sfera-08"],x:["PDA (con contratti)","Kit medico militare","Granata F1","Stimolante","Silenziatore 9 mm"],r:[500,4000]},
 monolite:{n:"Monolite",a:[["AK-74","5,45 BS",30],["SVD Dragunov","7,62×54R 7N1",10],["PKM","7,62×54R LPS",100]],t:["Corazza del Monolite (classe 3)"],h:["Elmetto Sfera-08"],x:["Granata F1","Kit medico militare","Psi-block","Antirad"],r:[0,0]},
 scienziato:{n:"Scienziato",a:[["",""],["Makarov PM","9×18 P",8]],t:["Tuta da laboratorio (classe 0, chiusa)"],h:[""],x:["Kit medico scientifico","Contatore Geiger","Rivelatore «Orso»","Appunti di misure (si vendono agli scienziati)","Antirad","Psi-block"],r:[500,3000]},
 zombi:{n:"Zombi",a:[["AKS-74U","5,45 PRS",30],["Makarov PM","9×18 P",8],["Doppietta TOZ-34","12/70 pallettoni",2]],t:["Tuta «Alba»","Giacca di pelle"],h:[""],x:["PDA (rotto)","Bulloni (venti)"],r:[0,300],z:1}};
/* usura: armi 5 segni (3 usurata, 5 rotta); armature 2×classe (classe = usurata) */
const classeOf=n=>{const x=ARM.find(y=>y.n===n);const m=(((x&&x.s)||"")+" "+(n||"")).match(/classe (\d)/);return m?+m[1]:0;};
const tipoOf=x=>x.c==="armi"&&!/^Granata/.test(x.n)?"arma":x.c==="armature"&&/classe|Piastra/.test(x.s+x.n)?"armatura":"altro";
const wMax=it=>it.tipo==="arma"?5:it.tipo==="armatura"?2*(+it.classe||0):0;
const wSoglia=it=>it.tipo==="arma"?3:+it.classe||0;
const wStato=it=>{const s=+it.segni||0,m=wMax(it);return !m?"ok":s>=m?"rotto":s>=wSoglia(it)?"usurato":"ok";};
const segniDa=(it,st)=>st==="rotto"?wMax(it):st==="usurato"?wSoglia(it):0;
const armOf=n=>{if(!n)return null;const e=ARM.find(y=>y.n===n);if(e)return e;let b=null;for(const y of ARM)if(n.toLowerCase().startsWith(y.n.toLowerCase())&&(!b||y.n.length>b.n.length))b=y;if(b)return b;
  /* poi per sigla del modello (TOZ-194, SKS, AK-74…), senza calibri: «Fucile a pompa TOZ-194 (12/70)» → TOZ-194 a pompa */
  const nl=" "+n.toLowerCase().replace(/[()«»,]/g," ")+" ";let bl=0;
  for(const y of ARM){for(const t of y.n.split(" ")){if(t.length<3||/[\/×,]/.test(t)||!/[0-9A-Z]/.test(t)||/^\d+$/.test(t))continue;if(nl.includes(" "+t.toLowerCase()+" ")&&t.length>bl){bl=t.length;b=y;}}}
  return b;};
const icoMode=()=>{try{return LS.get("pda.icone")||"dis";}catch(_){return "dis";}};
const ico=(n,cls="ico")=>{const ar=artOf({nome:n});if(ar)return artIco(ar).replace('class="ico svg"',`class="${cls} svg"`);const a=armOf(n);if(a&&icoMode()==="dis")return `<span class="${cls} svg">${itSvg(a)}</span>`;return a&&a.i?`<img class="${cls}" src="${a.i}" alt="" loading="lazy" decoding="async">`:`<span class="${cls} none"></span>`;};
const armSlot=n=>{const x=ARM.find(y=>y.n===n);return x?x.slot:1;};
const statoArma=z=>{const r=d(6);return z?(r<=3?"rotto":"usurato"):r<=2?"rotto":r<=5?"usurato":"ok";};
function kit(tipo,dead){const K=KIT[tipo];if(!K)return;const [an,mun,cap]=pk(K.a),tuta=pk(K.t),elm=pk(K.h);const righe=[],items=[];
  if(an){const st=dead?statoArma(K.z):(d(6)===1?"usurato":"ok");const dentro=dead?Math.floor(cap*(d(6)-1)/6):cap;
    righe.push(`<b>${esc(an)}</b> (${st}), caricato con ${esc(mun)}: ${dentro}/${cap}`);items.push({nome:an,slot:armSlot(an),stato:st,tipo:"arma",segni:segniDa({tipo:"arma"},st),nota:`${mun}: ${dentro}/${cap} nel caricatore`});
    const sc=dead?Math.max(0,d(3)-1):d(3);const sciolti=dead?sc*5*d(4):0;
    if(dead&&sciolti){righe.push(`${sciolti} colpi ${esc(mun)} sciolti`);items.push({nome:`${mun} ×${sciolti}`,slot:Math.round(sciolti/20*100)/100,stato:"ok",nota:""});}
    if(!dead)righe.push(`${sc} caricatori di riserva`);}
  else righe.push("Disarmato.");
  const tst=dead?(d(6)<=2?"rotto":"usurato"):"ok";righe.push(`${esc(tuta)}${dead?` (${tst})`:""}${elm?` · ${esc(elm)}`:""}`);
  if(dead){const ct=classeOf(tuta);items.push({nome:tuta,slot:0,stato:ct?tst:"ok",tipo:ct?"armatura":"altro",classe:ct,segni:segniDa({tipo:"armatura",classe:ct},tst),nota:"bucata: almeno usurata"});
    if(elm){const ce=classeOf(elm),se=d(6)<=2?"usurato":"ok";items.push({nome:elm,slot:0,stato:ce?se:"ok",tipo:ce?"armatura":"altro",classe:ce,segni:segniDa({tipo:"armatura",classe:ce},se),nota:""});}}
  const n=dead?d(3):2;const xs=[...K.x].sort(()=>Math.random()-.5).slice(0,n);righe.push(`${dead?"In tasca":"Porta"}: ${xs.map(esc).join(", ")}`);
  if(dead)xs.forEach(x=>items.push({nome:x,slot:armSlot(x),stato:x.includes("rotto")?"rotto":"ok",nota:""}));
  const rub=dead&&K.r[1]?Math.round((K.r[0]+Math.random()*(K.r[1]-K.r[0]))/50)*50:0;if(rub)righe.push(`${fmtR(rub)}`);
  if(dead){righe.push(`<span class="small muted">Equipaggiamento di alto livello ha amici: se lo porti in giro, si viene a sapere.</span>`);ui.lastLoot={items,rub};}
  soloPush(dead?`Cadavere: ${K.n}`:`Equipaggiamento: ${K.n}`,righe);}
/* artefatti: nome, anomalia, rarità, effetto, costo addosso, prezzo al mercante */
const ART=[
["Medusa","Vortice","comune","+2 slot nello zaino","+1 Radiazioni al giorno","3.000–5.000"],
["Crosta","Trampolino","comune","−1 danno da cadute e dal Trampolino","+1 Radiazioni al giorno","3.000–4.000"],
["Gocce","Bruciatore","comune","+1 gradino a Resistenza contro la fatica nelle marce lunghe","+1 Radiazioni al giorno","3.500–5.000"],
["Palla di fuoco","Bruciatore","comune","scalda: un passo di freddo in meno, di giorno e di notte","+1 Radiazioni al giorno","4.000–6.000"],
["Scintilla","Elettro","comune","+1 gradino contro gli Elettro; l'elettronica addosso non si rompe","+1 Radiazioni al giorno","3.000–4.500"],
["Batteria","Elettro","comune","una volta al giorno −1 Fatica","+1 Radiazioni al giorno","4.000–6.000"],
["Pezzo di carne","Gas","comune","+1 gradino contro gas e acidi","+1 Radiazioni al giorno","3.000–4.000"],
["Pietra di sangue","Gas","comune","+1 gradino ai tiri di guarigione","+1 Radiazioni al giorno","5.000–8.000"],
["Spina","Gas","comune","−1 Radiazioni al giorno","le ferite che sanguinano fanno +1 Ferite in più","5.000–7.000"],
["Stella della notte","Vortice","raro","+1 gradino a Ricognizione di notte","+1 Radiazioni al giorno","15.000–20.000"],
["Perline della mamma","Trampolino","raro","+1 gradino a Mobilità per schivare e buttarsi al riparo","+1 Radiazioni al giorno","20.000–30.000"],
["Conchiglia","Elettro","raro","una volta al giorno −1 Nervi","+1 Radiazioni al giorno","18.000–25.000"],
["Luce di luna","Elettro","raro","+1 gradino a Sangue freddo contro il psi","+1 Radiazioni al giorno","20.000–30.000"],
["Fiore di pietra","Vortice","raro","−1 Radiazioni presa a scena (come una SEVA)","nessuno","20.000–28.000"],
["Anima","Gas","raro","ogni notte di sonno vero −1 Ferite in più","+1 Radiazioni al giorno","25.000–40.000"],
["Bolla","Punch","raro","−1 Radiazioni al giorno","nessuno","30.000–40.000"],
["Pesce d'oro","Vortice","raro","+3 slot nello zaino","+1 Radiazioni al giorno","25.000–35.000"],
["Fiocco di neve","Elettro","raro","+1 gradino contro gli Elettro e −1 Radiazioni al giorno","+1 Nervi dopo ogni notte disturbata","30.000–40.000"],
["Kolobok","Gas","unico","−1 Ferite al giorno, anche senza riposo","+2 Radiazioni al giorno","si tratta"],
["Cristallo","Bruciatore","unico","niente Freddo fino a −20 °C","+2 Radiazioni al giorno","si tratta"],
["Bussola","Vortice","unico","in un campo di anomalie, col bullone il passaggio è sempre pulito","+1 Nervi al giorno: senti la Zona","si tratta"],
["Cuore dell'oasi","Gas","unico","una volta: una ferita critica perde il suo effetto","si consuma","si tratta"]];
const RARW={1:[80,18,2,0],2:[65,28,7,0],3:[50,35,13,2],4:[35,38,22,5],5:[25,35,30,10]};
function rar(per){const w=RARW[per]||RARW[1];let r=d(100);for(let i=0;i<4;i++){if(r<=w[i])return ["C","NC","R","MR"][i];r-=w[i];}return "C";}
function nascondiglio(){const per=+(ui.per||ZONE.find(z=>z[0]===S.clock.luogo)?.[1]||1);const pool=ARM.filter(x=>["munizioni","medicine","strumenti","campo","accessori"].includes(x.c));
  const n=d(3)+(per>=3?1:0),items=[],righe=[];
  for(let i=0;i<n;i++){let rr=rar(per),cand=pool.filter(x=>x.r===rr);while(!cand.length&&rr!=="C"){rr={MR:"R",R:"NC",NC:"C"}[rr];cand=pool.filter(x=>x.r===rr);}const x=pk(cand);if(!x)continue;
    if(x.sc){const q=d(3);righe.push(`${esc(x.n.replace(/\s*\(1.*\)/,""))} ×${q}`);items.push({sc:x.sc,q});}else{righe.push(`<b>${esc(x.n)}</b> <span class="rar ${x.r}">${x.r}</span>`);items.push({nome:x.n,slot:x.slot,stato:d(6)===1?"usurato":"ok",nota:x.s});}}
  const rub=d(6)*100*per;righe.push(fmtR(rub));ui.lastLoot={items,rub};soloPush(`Nascondiglio (pericolo ${per})`,righe);}
function campo(){const per=+(ui.per||ZONE.find(z=>z[0]===S.clock.luogo)?.[1]||1);const ch=[0,10,25,40,55,70][per]+(ui.dopoEm?25:0),r=d(100);
  if(r>ch){soloPush(`Campo di anomalie (pericolo ${per})`,[`d100 = ${r} su ${ch}%: niente. ${per===1?"Al Cordone i campi sono battuti da anni.":"Qualcuno è passato prima di te, o non c'è niente."}`]);return;}
  const t=d(6)+per,q=t>=11?"unico":t>=9?"raro":"comune";const a=pk(ART.filter(x=>x[2]===q));
  ui.lastLoot={items:[{nome:`Artefatto: ${a[0]}`,slot:1,stato:"ok",nota:`${a[2]} · ${a[3]} · costo: ${a[4]} · mercante: ${a[5]} ₽`}],rub:0};
  soloPush(`Campo di anomalie (pericolo ${per})`,[`d100 = ${r} su ${ch}%: <b>${a[0]}</b> (${a[2]}, nato in un ${a[1]}).`,`Effetto: ${a[3]}. Costo addosso: ${a[4]}. Al mercante: ${a[5]} ₽.`,"Prima si passa il campo (6.3), poi Agilità + Mobilità per strapparlo (6.4). Se non lo prendi, non cliccare «Prendi tutto».",q==="unico"?"Unico: qualcuno lo vorrà, e lo saprà.":""].filter(Boolean));}
function prendi(){const lt=ui.lastLoot;if(!lt)return;ui.lastLoot=null;lt.items.forEach(x=>{if(x.sc)S.scorte[x.sc]=(+S.scorte[x.sc]||0)+x.q;else add("inv",{nome:x.nome,qta:1,slot:x.slot,dove:"zaino",stato:x.stato,nota:x.nota||"",tipo:x.tipo||"altro",classe:x.classe||0,segni:x.segni||0});});S.rubli=(+S.rubli||0)+(lt.rub||0);save();toast("Preso tutto: controlla lo zaino.");}

/* ===== generatori: lavori, voci, clienti, compagni ===== */
const TIER={"Cordone":0,"Discarica":1,"Agroprom":1,"Valle Oscura":1,"Bar e Rostok":2,"Yantar":2,"Magazzini dell'esercito":2};
const PAGHE=[[[500,2000],[2000,5000],[6000,10000]],[[2000,5000],[5000,12000],[15000,25000]],[[4000,8000],[10000,20000],[25000,40000]],[[15000,20000],[20000,40000],[50000,80000]]];
const COMM=["il mercante della zona","uno stalker del posto","un novellino","una fazione della zona","gli scienziati","un militare che arrotonda","un bandito che vuole restare pulito","un barista"];
const COSA=["una cassetta chiusa","medicine","un PDA","munizioni","documenti in una busta","pezzi di ricambio","un artefatto da consegnare intatto"];
const CHI=["un novellino","uno scienziato","un giornalista","un ragazzo che cerca il padre","un contrabbandiere"];
const LTIPI=[["Consegna",(m)=>`Portare ${pk(COSA)} a ${m}.`],["Recupero",(m)=>`Recuperare ${pk(COSA)} da ${m}: era di qualcuno che non è tornato.`],["Scorta",(m)=>`Accompagnare ${pk(CHI)} fino a ${m}.`],["Strada libera",(m)=>`Liberare la strada verso ${m}: ${pk(["un branco di cani","dei banditi","una tana di carne","un'anomalia nuova da segnare"])}. Ci passa la gente.`],["Informazioni",(m)=>`Scoprire cosa succede a ${m} e tornare a raccontarlo.`],["Ricerca",(m)=>`Trovare ${pk(["uno stalker","un novellino","un cliente di un'altra guida","un fratello"])} sparito verso ${m}.`],["Misure",(m)=>`Portare un sensore in un campo di anomalie a ${m} e riportarlo indietro.`]];
const COMPL=["il carico non è quello detto","qualcun altro vuole la stessa cosa","il committente non può pagare tutto","il posto è cambiato dopo l'ultima Emissione","c'è un ferito che chiede aiuto","una pattuglia sulla strada","un branco ha fatto la tana lì","il committente ha mentito sul pericolo","nessuna: va liscia","nessuna: va liscia"];
function lavoro(){const z=S.clock.luogo||"Cordone";const metas=[z,...nbr(z)];const meta=pk(metas);const r=d(6),sz=r<=3?0:r<=5?1:2;const tier=Math.max(TIER[z]??3,TIER[meta]??3);
  const [lo,hi]=PAGHE[tier][sz];const paga=Math.round((lo+Math.random()*(hi-lo))/100)*100;const [tit,f]=pk(LTIPI);const da=pk(COMM);
  const j={tipo:"lavoro",dim:sz,titolo:tit,da,testo:f(meta===z?`un posto qui, a ${z}`:meta),paga,luogo:meta,scadenza:["stasera o domani","2–3 giorni","3–5 giorni"][sz],stato:"offerto"};
  ui.lastJob=j;soloPush(`Lavoro ${["piccolo","medio","grande"][sz]}`,[`<b>${tit}</b> per ${esc(da)}: ${esc(j.testo)}`,`Paga: ${fmtR(paga)} (da contrattare) · entro ${j.scadenza}.`,"La complicazione si tira all'arrivo."]);}
const VOCI=[()=>`Hanno visto ${pk(["un branco grosso","uno pseudocane","un succhiasangue","una chimera","degli snork"])} vicino a ${pk(ZONE)[0]}.`,()=>`${pk(["Il Dovere","La Libertà","I militari","I banditi","I mercenari"])} ${pk(["cercano gente","pagano bene per informazioni","hanno chiuso una strada","si stanno muovendo"])} a ${pk(ZONE)[0]}.`,()=>`${pk(NOMI)} «${pk(SOPR)}» non è tornato da ${pk(ZONE)[0]}. Chi lo vede, scriva.`,()=>`Dopo l'ultima Emissione a ${pk(ZONE)[0]} c'è un campo nuovo. Qualcuno dice artefatti.`,()=>`Al ${pk(["Bar","bunker del mercante","Yantar","Janiv"])} ${pk(["le munizioni PS sono salite","non c'è più antirad","comprano parti di mutanti","cercano una guida"])}.`,()=>`I militari sparano a tutto vicino al ${pk(["ponte","posto di blocco","terrapieno"])}. Passate di notte o non passate.`,()=>`Qualcuno vende una rotta per ${pk(ZONE)[0]}. Due l'hanno comprata, uno è tornato.`,()=>`Radio dei militari: ${pk(["elicottero in giro sopra la Discarica","pattuglia nuova all'Agroprom","cercano un disertore"])}.`];
function voce(){const t=pk(VOCI)();add("pda",{tipo:"msg",da:`${pk(NOMI)} «${pk(SOPR)}»`,testo:t,data:S.clock.data,ora:S.clock.ora});soloPush("Voce sulla rete",[esc(t)]);}
const CTIPI=["scienziato","giornalista","ricco cercatore di artefatti","ex militare","fotografo","parente di un disperso","contrabbandiere","fanatico (non lo dice)"];
const CVUOLE=["vedere il centro","un artefatto preciso","fotografie della centrale","ritrovare qualcuno","misure dal Radar","sparire dal mondo","una storia da vendere","capire cosa sono le Emissioni"];
function cliente(){const g=pk(["D","D","C","C","B"]),pa=d(3)-1,sk=pk(Object.values(SKN)),porta=d(3)+1,paga=(4+d(6)+d(6))*5000;
  const p={nome:`${pk(NOMI)} ${pk(["Kravec'","Melnyk","Bondar","Šev'čuk","Kovalenko","Tkačenko","Lysenko","Hrycenko"])}`,fazione:"cliente",nota:`Cliente: ${pk(CTIPI)}. Dado ${g} · Paura ${pa}/5 · sa fare: ${sk} C · porta ${porta} slot · vuole ${pk(CVUOLE)}. Segreto: ${pk(SEGR)}. Paga: ${fmtR(paga)} (metà prima).`};
  ui.lastPng=p;soloPush("Cliente",[`<b>${esc(p.nome)}</b>`,esc(p.nota)]);}
function compagno(){const g=pk(["D","C","C","B"]),m=pk(["D","C","C","B"]);const p={nome:`${pk(NOMI)} «${pk(SOPR)}»`,fazione:"compagno",nota:`Compagno: ${pk(FAZN)}. Dado ${g} · Morale ${m} · bravo in ${pk(Object.values(SKN))}. ${pk(CAR)}. Vuole ${pk(VUOLE)}. Paga: ${fmtR((d(4)+1)*500)} al giorno più il cibo, o il ${pk([10,15,20,25,30])}% del lavoro.`};
  ui.lastPng=p;soloPush("Compagno",[`<b>${esc(p.nome)}</b>`,esc(p.nota)]);}

/* ===== viste ===== */
const tabsVis=()=>TABS.concat(TABS_END).filter(([k])=>k!=="crea"||!S.pg.nome||ui.tab==="crea");
const mapMarks=()=>[...(S.nasc||[]).map(n=>({zona:n.zona,txt:"▣ "+n.nome,cls:""})),...L.pda.filter(j=>j.tipo==="lavoro"&&["offerto","accettato"].includes(j.stato||"offerto")&&j.luogo).map(j=>({zona:j.luogo,txt:"✦ "+j.titolo,cls:"job"})),...L.png.filter(p=>p.luogo&&!p.con&&p.stato!=="morto"&&p.imp).map(p=>({zona:p.luogo,txt:"● "+p.nome,cls:"png"}))];
const TABS_END=[["sistema","Sistema"]];
const TABS=[["scheda","Scheda"],["dadi","Dadi"],["gruppo","Gruppo"],["storie","Storie"],["zaino","Zaino"],["pda","Rete"],["registro","Registro"],["mappa","Zona"],["crea","Creazione"]];
const pips=(k,v,max,act,hot)=>`<div class="pips">${Array.from({length:max},(_,i)=>`<button class="pip ${i<v?"on":""} ${hot&&i<v&&i>=hot-1?"hot":""}" data-a="${act}" data-k="${k}" data-v="${i+1}" aria-label="${k} ${i+1}"></button>`).join("")}</div>`;
const sel=(f,opts,cur)=>`<select data-f="${f}">${opts.map(([v,n])=>`<option value="${esc(v)}" ${String(cur)===String(v)?"selected":""}>${esc(n)}</option>`).join("")}</select>`;
const GOPT=[["A","A · d12"],["B","B · d10"],["C","C · d8"],["D","D · d6"]];
/* ===== icone disegnate (stile dei volti) ===== */
const IC={m:"#2c2f31",m2:"#4a4f52",m3:"#6d7376",w:"#8b4a26",w2:"#64341b",p:"#1d1f20",o:"#56603a",o2:"#3d4528",br:"#b08a3e",br2:"#d8b45a",cu:"#b5653a",st:"#9aa3a6",rd:"#a8321e",or:"#d4841c",wh:"#e6e2d6",gl:"#7fb0b8"};
const icBg=(c)=>`<defs><radialGradient id="ib" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient></defs><rect width="64" height="48" fill="${c}"/><rect width="64" height="48" fill="url(#ib)"/>`;
const BGC={armi:"#3a3c30",munizioni:"#3d3526",armature:"#33382c",accessori:"#30353a",strumenti:"#2f3a36",medicine:"#3f2d2b",campo:"#3a3328"};
const ln=`stroke="#0a0b0b" stroke-width=".8" stroke-linejoin="round"`;
const hl=(x,y,w)=>`<path d="M${x} ${y} h${w}" stroke="#fff" stroke-opacity=".28" stroke-width=".8"/>`;
/* fucile generico, punta a destra. o: {L lunghezza (0.7–1.1), wood, stock, mag, scope, bipod, sup, gl, short, drum, rail, kobra, col} */
function gun(o){const k=o.L||1,x0=32-28*k,X=t=>x0+t*56*k,y=21;const fur=o.wood?IC.w:o.col||IC.p,rec=o.rec||IC.m;let s="";
  const st=o.stock??"solid";
  if(st==="solid")s+=`<path d="M${X(0)} ${y-1} L${X(.25)} ${y-2} L${X(.25)} ${y+4} L${X(.08)} ${y+9} L${X(0)} ${y+9}Z" fill="${fur}"/>`;
  if(st==="fold")s+=`<path d="M${X(.03)} ${y-1} H${X(.25)} M${X(.03)} ${y+6} L${X(.25)} ${y+2} M${X(.03)} ${y-1} V${y+7}" fill="none" stroke="${rec}" stroke-width="2"/>`;
  if(st==="thumb")s+=`<path d="M${X(0)} ${y-2} L${X(.25)} ${y-2} L${X(.25)} ${y+4} L${X(.14)} ${y+4} L${X(.1)} ${y+9} L${X(0)} ${y+9}Z" fill="${fur}"/><path d="M${X(.12)} ${y+1} L${X(.2)} ${y+1}" stroke="#0007" stroke-width="2.5" stroke-linecap="round"/>`;
  if(st==="ar")s+=`<path d="M${X(.02)} ${y-1} H${X(.25)} V${y+3} L${X(.1)} ${y+4} V${y+8} H${X(.02)}Z" fill="${IC.p}"/><path d="M${X(.1)} ${y+1.5} H${X(.25)}" stroke="#555" stroke-width="1.5"/>`;
  if(st==="bullpup")s+=`<path d="M${X(.05)} ${y-2} H${X(.45)} V${y+6} H${X(.05)}Z" fill="${fur}"/>`;
  s+=`<rect x="${X(.25)}" y="${y-3}" width="${X(.55)-X(.25)}" height="7" rx="1" fill="${rec}" ${ln}/>`+hl(X(.26),y-2.4,X(.54)-X(.26));
  const gx=o.short?.32:.33;s+=`<path d="M${X(gx)} ${y+4} L${X(gx+.06)} ${y+4} L${X(gx+.03)} ${y+12} L${X(gx-.03)} ${y+12}Z" fill="${o.wood&&!o.blackgrip?IC.w2:IC.p}" ${ln}/>`;
  const hg=o.short?.7:.78;s+=`<rect x="${X(.55)}" y="${y-2.5}" width="${X(hg)-X(.55)}" height="6" rx="1.5" fill="${o.rail?IC.p:fur}" ${ln}/>`;
  if(o.rail)for(let i=0;i<5;i++)s+=`<rect x="${X(.57+i*.04)}" y="${y-3.4}" width="1.2" height="1.2" fill="#555"/>`;
  const be=o.short?.86:1;s+=`<rect x="${X(hg)}" y="${y-1}" width="${X(be)-X(hg)}" height="2.2" fill="${rec}" ${ln}/>`;
  if(o.gasTube!==false)s+=`<rect x="${X(.6)}" y="${y-4.3}" width="${X(hg)-X(.6)}" height="1.8" fill="${rec}"/>`;
  s+=`<rect x="${X(be)-1.5}" y="${y-2.2}" width="2.4" height="4.4" fill="${rec}"/>`;
  if(o.integ)s+=`<rect x="${X(.6)}" y="${y-3.4}" width="${X(1.02)-X(.6)}" height="6.8" rx="1.5" fill="${IC.m2}" ${ln}/><path d="M${X(.62)} ${y-2.6} H${X(1)}" stroke="#fff" stroke-opacity=".2"/>`;
  if(o.sup)s+=`<rect x="${X(be)}" y="${y-2.6}" width="${8*k}" height="5.2" rx="1.2" fill="${IC.m2}" ${ln}/>`;
  const mx=o.magX??.47;
  if(o.mag==="curved")s+=`<path d="M${X(mx-.05)} ${y+4} L${X(mx+.03)} ${y+4} Q${X(mx+.07)} ${y+11} ${X(mx+.11)} ${y+16} L${X(mx+.03)} ${y+18} Q${X(mx-.01)} ${y+11} ${X(mx-.05)} ${y+4}Z" fill="${o.magc||(o.wood?"#b0601e":IC.p)}" ${ln}/>`;
  if(o.mag==="long")s+=`<path d="M${X(mx-.05)} ${y+4} L${X(mx+.03)} ${y+4} Q${X(mx+.1)} ${y+15} ${X(mx+.16)} ${y+21} L${X(mx+.08)} ${y+23} Q${X(mx+.01)} ${y+15} ${X(mx-.05)} ${y+4}Z" fill="${o.magc||IC.p}" ${ln}/>`;
  if(o.mag==="straight")s+=`<path d="M${X(mx-.04)} ${y+4} H${X(mx+.03)} L${X(mx+.04)} ${y+14} H${X(mx-.03)}Z" fill="${o.magc||IC.p}" ${ln}/>`;
  if(o.mag==="drum")s+=`<circle cx="${X(mx)}" cy="${y+10}" r="6.5" fill="${IC.m2}" ${ln}/><circle cx="${X(mx)}" cy="${y+10}" r="2.5" fill="${IC.m}"/>`;
  if(o.mag==="box")s+=`<rect x="${X(mx-.08)}" y="${y+4}" width="${X(mx+.06)-X(mx-.08)}" height="9" rx="1" fill="${IC.o}" ${ln}/>`;
  if(o.scope)s+=`<path d="M${X(.3)} ${y-8} h${X(.56)-X(.3)}" stroke="${IC.p}" stroke-width="3.6" stroke-linecap="round"/><path d="M${X(.28)} ${y-8} h2.5 M${X(.56)} ${y-8} h2.5" stroke="${IC.p}" stroke-width="5"/><rect x="${X(.4)}" y="${y-6}" width="3" height="3" fill="${IC.m}"/>`;
  if(o.kobra)s+=`<rect x="${X(.36)}" y="${y-8}" width="6" height="5" rx="1" fill="${IC.p}" ${ln}/><circle cx="${X(.36)+3}" cy="${y-6}" r="1" fill="#e33"/>`;
  if(o.rearSight)s+=`<rect x="${X(.4)}" y="${y-5}" width="2" height="2" fill="${rec}"/>`;
  if(o.bipod)s+=`<path d="M${X(.82)} ${y+1} L${X(.76)} ${y+14} M${X(.82)} ${y+1} L${X(.9)} ${y+14}" stroke="${IC.m}" stroke-width="1.6"/>`;
  if(o.gl)s+=`<rect x="${X(.56)}" y="${y+3.5}" width="${X(.8)-X(.56)}" height="4.5" rx="2" fill="${IC.m2}" ${ln}/>`;
  if(o.carry)s+=`<path d="M${X(.3)} ${y-3} V${y-7} H${X(.5)} V${y-3}" fill="none" stroke="${IC.p}" stroke-width="2"/>`;
  if(o.belt)s+=`<path d="M${X(.42)} ${y+4} q-2 8 -8 13" fill="none" stroke="${IC.br}" stroke-width="3" stroke-dasharray="1.6 .8"/>`;
  return s;}
function pistol(o){let s="";const c=o.c||IC.m;
  if(o.stock)s+=`<path d="M6 24 L18 21 L18 31 L8 34Z" fill="${IC.w}" ${ln}/>`;
  s+=`<path d="M16 15 H${o.long?48:44} V22 H16Z" fill="${c}" ${ln}/>`+hl(17,16,o.long?30:26);
  s+=`<path d="M18 22 H${o.long?38:34} L${o.long?36:32} 27 H26 L24 36 H16 L18 22Z" fill="${o.g||IC.p}" ${ln}/>`;
  s+=`<path d="M26 22 q0 5 5 5" fill="none" stroke="${c}" stroke-width="1.4"/>`;
  if(o.grip)s+=`<path d="M18.5 24 H24 L22.5 34 H17.5Z" fill="${o.grip}"/>`;
  if(o.sup)s+=`<rect x="${o.long?48:44}" y="15.5" width="13" height="6" rx="1.5" fill="${IC.m2}" ${ln}/>`;
  if(o.ham)s+=`<path d="M16 15 l-2 -2.5 2 0.5z" fill="${c}"/>`;
  return s;}
const knife=o=>`<path d="M8 26 H24 V22 H8 q-3 2 0 4Z" fill="${o.h||IC.p}" ${ln}/><path d="M24 20 H27 V28 H24Z" fill="${IC.m2}" ${ln}/><path d="M27 22 H52 Q58 22 60 24 Q56 27 50 27 H27Z" fill="${IC.st}" ${ln}/><path d="M28 23.2 H52" stroke="#fff" stroke-opacity=".5" stroke-width=".7"/>${o.saw?`<path d="M34 22 l1.5 -1.5 1.5 1.5 1.5 -1.5 1.5 1.5 1.5 -1.5 1.5 1.5" fill="none" stroke="${IC.st}"/>`:""}`;
const axe=()=>`<path d="M10 34 L44 14" stroke="${IC.w}" stroke-width="3.4" stroke-linecap="round"/><path d="M38 10 Q46 6 52 10 L50 22 Q46 18 40 20Z" fill="${IC.st}" ${ln}/><path d="M42 11 L48 20" stroke="#fff" stroke-opacity=".35"/>`;
function grenade(t){if(t==="f1")return `<ellipse cx="32" cy="28" rx="10" ry="12" fill="${IC.o}" ${ln}/>${[0,1,2,3].map(i=>`<path d="M22 ${20+i*5} H42" stroke="${IC.o2}" stroke-width="1.2"/>`).join("")}<path d="M28 16 V22 M36 16 V22" stroke="${IC.o2}"/><rect x="29" y="10" width="6" height="6" fill="${IC.m2}" ${ln}/><path d="M35 12 Q42 12 40 24" fill="none" stroke="${IC.m3}" stroke-width="2"/><circle cx="27" cy="10" r="3" fill="none" stroke="${IC.st}" stroke-width="1.2"/>`;
  if(t==="rgd")return `<ellipse cx="32" cy="29" rx="10" ry="12" fill="${IC.o}" ${ln}/><path d="M22 29 H42" stroke="${IC.o2}" stroke-width="1.5"/><ellipse cx="28" cy="24" rx="3" ry="5" fill="#fff" opacity=".15"/><rect x="29" y="11" width="6" height="6" fill="${IC.m2}" ${ln}/><path d="M35 13 Q42 13 40 25" fill="none" stroke="${IC.m3}" stroke-width="2"/><circle cx="27" cy="11" r="3" fill="none" stroke="${IC.st}" stroke-width="1.2"/>`;
  return `<rect x="24" y="12" width="16" height="28" rx="2" fill="${IC.o}" ${ln}/><rect x="24" y="18" width="16" height="4" fill="${IC.wh}"/><path d="M28 12 V8 H36 V12" fill="${IC.m2}" ${ln}/><path d="M38 8 q6 -4 8 2" fill="none" stroke="${IC.st}" stroke-width="1.2"/>`;}
function cart(o){const n=o.n||3,L=o.L||22,w=o.w||5,neck=o.neck??true;let s="";for(let i=0;i<n;i++){const x=32-(n-1)*w*0.9+i*w*1.8,top=40-L;
  s+=`<rect x="${x-w/2}" y="${top+L*.35}" width="${w}" height="${L*.65}" fill="${o.steel?"#8c8f86":IC.br}" ${ln}/>`;
  if(neck)s+=`<path d="M${x-w/2} ${top+L*.35} L${x-w*.35} ${top+L*.28} H${x+w*.35} L${x+w/2} ${top+L*.35}Z" fill="${o.steel?"#8c8f86":IC.br}"/>`;
  s+=`<path d="M${x-w*.35} ${top+L*.28} V${top+L*.12} Q${x} ${top-L*.05} ${x+w*.35} ${top+L*.12} V${top+L*.28}Z" fill="${o.tip||IC.cu}" ${ln}/>`;
  if(o.tipc)s+=`<path d="M${x-w*.25} ${top+L*.05} Q${x} ${top-L*.05} ${x+w*.25} ${top+L*.05}Z" fill="${o.tipc}"/>`;
  s+=`<rect x="${x-w/2+.6}" y="${top+L*.4}" width="1" height="${L*.55}" fill="#fff" opacity=".35"/>`;}return s;}
const shells=c=>[0,1,2].map(i=>{const x=20+i*12;return `<rect x="${x}" y="12" width="9" height="20" rx="1" fill="${c}" ${ln}/><rect x="${x}" y="30" width="9" height="8" fill="${IC.br}" ${ln}/><rect x="${x+1.2}" y="13" width="1.2" height="17" fill="#fff" opacity=".3"/>`;}).join("");
const vog=c=>`<path d="M24 34 V20 Q24 10 32 10 Q40 10 40 20 V34Z" fill="${c}" ${ln}/><rect x="24" y="32" width="16" height="6" fill="${IC.br}" ${ln}/><path d="M24 26 H40" stroke="#0004"/>`;
function suit(o){let s=`<path d="M14 44 L16 22 Q18 14 26 13 H38 Q46 14 48 22 L50 44Z" fill="${o.c}" ${ln}/><path d="M32 14 V44" stroke="#0005"/>`;
  if(o.hood)s+=`<path d="M24 14 Q24 4 32 4 Q40 4 40 14 Q36 10 32 10 Q28 10 24 14Z" fill="${o.c2||o.c}" ${ln}/>`;
  if(o.collar)s+=`<path d="M26 13 L32 20 L38 13" fill="${o.c2||"#0003"}" ${ln}/>`;
  if(o.patch)s+=`<rect x="17" y="24" width="5" height="4" fill="${o.patch}"/>`;
  if(o.pockets)s+=`<rect x="21" y="30" width="8" height="6" fill="#0003" ${ln}/><rect x="35" y="30" width="8" height="6" fill="#0003" ${ln}/>`;
  if(o.plates)s+=`<rect x="22" y="18" width="20" height="18" rx="2" fill="${o.plates}" ${ln}/>`;
  if(o.visor)s+=`<path d="M24 14 Q24 2 32 2 Q40 2 40 14Z" fill="${o.c}" ${ln}/><ellipse cx="32" cy="9" rx="5" ry="4.5" fill="#1d2a2c"/><ellipse cx="30.5" cy="8" rx="1.5" ry="2" fill="#fff" opacity=".3"/>`;
  if(o.exo)s+=`<path d="M16 24 L12 40 M48 24 L52 40 M24 44 V34 M40 44 V34" stroke="${IC.m3}" stroke-width="2.4"/><circle cx="16" cy="24" r="2" fill="${IC.m3}"/><circle cx="48" cy="24" r="2" fill="${IC.m3}"/>`;
  if(o.camo)s+=`<path d="M20 26 q4 -3 7 0 q-3 3 -7 0Z M36 36 q4 -3 7 0 q-3 3 -7 0Z M30 20 q3 -2 5 0 q-2 3 -5 0Z" fill="${o.camo}"/>`;
  return s;}
const vest=(c,o={})=>`<path d="M18 8 H26 Q32 14 38 8 H46 L48 40 H16Z" fill="${c}" ${ln}/>${o.pouch?`<rect x="20" y="28" width="7" height="9" fill="#0003" ${ln}/><rect x="28.5" y="28" width="7" height="9" fill="#0003" ${ln}/><rect x="37" y="28" width="7" height="9" fill="#0003" ${ln}/>`:""}${o.camo?`<path d="M20 16 q4 -3 7 0 q-3 3 -7 0Z M36 22 q4 -3 7 0 q-3 3 -7 0Z" fill="${o.camo}"/>`:""}${o.collar?`<path d="M18 8 Q14 4 20 2 H26" fill="none" stroke="${c}" stroke-width="3"/>`:""}`;
const plate=(c,t)=>`<path d="M20 6 L26 4 H38 L44 6 V40 Q32 46 20 40Z" fill="${c}" ${ln}/><path d="M23 8 H41" stroke="#fff" stroke-opacity=".2"/>${t?`<text x="32" y="26" text-anchor="middle" font-size="9" font-family="sans-serif" font-weight="700" fill="#fff" fill-opacity=".55">${t}</text>`:""}`;
function helmet(t){if(t==="beret")return `<path d="M12 30 Q14 16 32 15 Q52 15 52 26 Q44 30 30 30Z" fill="${IC.rd}" ${ln}/><rect x="12" y="29" width="34" height="4" rx="2" fill="#2a1a16"/><circle cx="22" cy="24" r="2.5" fill="${IC.br2}"/>`;
  let s=`<path d="M12 32 Q12 10 32 10 Q52 10 52 32Z" fill="${t==="ssh"?IC.o:t==="altyn"?"#4f5a3a":"#3b4230"}" ${ln}/><path d="M18 18 Q24 13 30 13" stroke="#fff" stroke-opacity=".25" stroke-width="1.5" fill="none"/>`;
  if(t==="ssh")s+=`<path d="M10 32 H54" stroke="${IC.o2}" stroke-width="3" stroke-linecap="round"/>`;
  if(t==="sfera")s+=`<path d="M12 32 H52 V36 H12Z" fill="#2d3324" ${ln}/><path d="M20 12 V32 M44 12 V32" stroke="#0004"/>`;
  if(t==="altyn")s+=`<path d="M14 26 H50 V38 Q32 44 14 38Z" fill="#6f8a8e" fill-opacity=".85" ${ln}/><rect x="16" y="29" width="32" height="5" fill="#0005"/><path d="M50 26 L54 22" stroke="${IC.m}" stroke-width="2"/>`;
  return s;}
function mask(t){if(t==="filter")return `<rect x="22" y="12" width="20" height="26" rx="3" fill="${IC.o}" ${ln}/><path d="M22 18 H42 M22 32 H42" stroke="${IC.o2}" stroke-width="1.5"/><rect x="28" y="6" width="8" height="6" fill="${IC.m2}" ${ln}/>`;
  return `<path d="M18 14 Q32 4 46 14 L46 30 Q40 42 32 42 Q24 42 18 30Z" fill="${t==="pbf"?"#5e6253":"#2b2d2a"}" ${ln}/>${t==="m40"?`<path d="M21 17 Q32 12 43 17 L42 26 Q32 24 22 26Z" fill="${IC.gl}" ${ln}/>`:`<circle cx="26" cy="21" r="5" fill="${IC.gl}" ${ln}/><circle cx="38" cy="21" r="5" fill="${IC.gl}" ${ln}/>`}<rect x="28" y="32" width="8" height="8" rx="2" fill="${IC.m}" ${ln}/>${t==="m40"?`<circle cx="22" cy="33" r="4" fill="${IC.o}" ${ln}/>`:""}`;}
const supp=(L=30,c=IC.m2,w=8)=>`<rect x="${32-L/2}" y="${24-w/2}" width="${L}" height="${w}" rx="2" fill="${c}" ${ln}/><path d="M${33-L/2} ${25-w/2} h${L-2}" stroke="#fff" stroke-opacity=".25"/>${[1,2,3].map(i=>`<path d="M${32-L/2+i*L/4} ${24-w/2} v${w}" stroke="#0004"/>`).join("")}`;
const scope=(o={})=>`<path d="M${o.x0||12} 22 H${o.x1||52}" stroke="${o.c||IC.p}" stroke-width="${o.w||6}" stroke-linecap="round"/><path d="M${o.x0||12} 22 h4 M${(o.x1||52)-4} 22 h4" stroke="${o.c||IC.p}" stroke-width="${(o.w||6)+3}" stroke-linecap="round"/><rect x="28" y="${22-(o.w||6)/2-4}" width="5" height="4" fill="${IC.m}"/>${o.side?`<path d="M24 26 V34 H40 V26" fill="none" stroke="${IC.m}" stroke-width="2.5"/>`:`<rect x="22" y="26" width="4" height="5" fill="${IC.m}"/><rect x="38" y="26" width="4" height="5" fill="${IC.m}"/>`}<circle cx="${(o.x1||52)+2}" cy="22" r="${(o.w||6)/2}" fill="${IC.gl}" opacity=".7"/>${o.nv?`<circle cx="${(o.x1||52)+2}" cy="22" r="${(o.w||6)/2}" fill="#5f5" opacity=".5"/>`:""}`;
const redDot=(o={})=>`<rect x="20" y="${o.holo?16:14}" width="24" height="${o.holo?14:16}" rx="3" fill="${IC.p}" ${ln}/><rect x="${o.holo?30:28}" y="${o.holo?18:16}" width="${o.holo?12:8}" height="${o.holo?9:9}" fill="${IC.gl}" opacity=".6"/><circle cx="${o.holo?36:32}" cy="${o.holo?22.5:20.5}" r="1.3" fill="#f33"/><rect x="18" y="30" width="28" height="4" fill="${IC.m}" ${ln}/>`;
const mag=(t)=>t==="drum"?`<circle cx="32" cy="27" r="13" fill="${IC.m3}" ${ln}/><circle cx="32" cy="27" r="9" fill="${IC.m2}"/><circle cx="32" cy="27" r="3.5" fill="${IC.m}"/><rect x="28" y="6" width="8" height="10" fill="${IC.m3}" ${ln}/>`:t==="saiga"?`<rect x="16" y="14" width="32" height="28" rx="13" fill="#3a3d3f" ${ln}/><circle cx="32" cy="28" r="5" fill="${IC.p}"/><rect x="28" y="5" width="8" height="10" fill="#3a3d3f" ${ln}/>`:`<path d="M22 4 H34 Q${t==="60"?38:36} 24 ${t==="60"?50:48} 40 L37 45 Q${t==="60"?28:27} 28 22 4Z" fill="${t==="60"?IC.m2:"#8a4a1c"}" ${ln}/><path d="M26 6 Q30 26 40 40" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1.2"/>${[0,1,2].map(i=>`<path d="M${24+i*1.5} ${12+i*9} l9 -1" stroke="#0004"/>`).join("")}`;
const box=(c,o={})=>`<path d="M14 18 L32 12 L50 18 L50 36 L32 42 L14 36Z" fill="${c}" ${ln}/><path d="M14 18 L32 24 L50 18 M32 24 V42" stroke="#0005" fill="none"/>${o.cross?`<path d="M36 28 h6 M39 25 v6" stroke="${o.cross}" stroke-width="2.4"/>`:""}${o.rad?`<circle cx="40" cy="30" r="3" fill="#f2c14e"/><circle cx="40" cy="30" r="1" fill="#222"/>`:""}${o.lbl?`<rect x="18" y="24" width="10" height="7" fill="${o.lbl}" transform="skewY(18) translate(0 -6)"/>`:""}`;
function dev(o){let s=`<rect x="${o.x||18}" y="${o.y||8}" width="${o.w||28}" height="${o.h||34}" rx="3" fill="${o.c}" ${ln}/><rect x="${(o.x||18)+3}" y="${(o.y||8)+4}" width="${(o.w||28)-6}" height="${o.sh||12}" rx="1" fill="${o.scr||"#9bbf7a"}" ${ln}/>`;
  if(o.dial)s+=`<path d="M${(o.x||18)+6} ${(o.y||8)+13} Q${(o.x||18)+(o.w||28)/2} ${(o.y||8)+5} ${(o.x||18)+(o.w||28)-6} ${(o.y||8)+13}" fill="none" stroke="#222"/><path d="M${(o.x||18)+(o.w||28)/2} ${(o.y||8)+14} l5 -7" stroke="#a22" stroke-width="1.2"/>`;
  if(o.btn)for(let i=0;i<3;i++)s+=`<circle cx="${(o.x||18)+7+i*7}" cy="${(o.y||8)+(o.h||34)-7}" r="2" fill="${o.btn}"/>`;
  if(o.ant)s+=`<path d="M${(o.x||18)+(o.w||28)-4} ${o.y||8} V${(o.y||8)-8}" stroke="${IC.m}" stroke-width="2"/>`;
  if(o.probe)s+=`<path d="M${(o.x||18)+(o.w||28)} ${(o.y||8)+20} q8 0 10 10" fill="none" stroke="#222" stroke-width="1.5"/><rect x="${(o.x||18)+(o.w||28)+6}" y="${(o.y||8)+28}" width="8" height="10" rx="2" fill="${IC.m2}" ${ln}/>`;
  if(o.led)s+=`<circle cx="${(o.x||18)+(o.w||28)-6}" cy="${(o.y||8)+(o.h||34)-6}" r="2" fill="${o.led}"/>`;
  if(o.grille)for(let i=0;i<4;i++)s+=`<path d="M${(o.x||18)+4} ${(o.y||8)+(o.sh||12)+8+i*3} h${(o.w||28)-8}" stroke="#0005"/>`;
  return s;}
const torch=()=>`<path d="M10 20 H40 L48 16 V32 L40 28 H10Z" fill="${IC.m}" ${ln}/><ellipse cx="48" cy="24" rx="2.5" ry="8" fill="#f6e7a0"/><path d="M12 21 H38" stroke="#fff" stroke-opacity=".25"/><rect x="22" y="18" width="4" height="3" fill="${IC.rd}"/>`;
const binoc=()=>`<rect x="12" y="14" width="16" height="24" rx="4" fill="${IC.p}" ${ln}/><rect x="36" y="14" width="16" height="24" rx="4" fill="${IC.p}" ${ln}/><rect x="26" y="20" width="12" height="8" fill="${IC.m}" ${ln}/><ellipse cx="20" cy="38" rx="7" ry="2.5" fill="${IC.gl}" ${ln}/><ellipse cx="44" cy="38" rx="7" ry="2.5" fill="${IC.gl}" ${ln}/>`;
const nvg=(two)=>two?`<rect x="14" y="16" width="36" height="14" rx="4" fill="${IC.o}" ${ln}/><circle cx="22" cy="23" r="6" fill="${IC.p}" ${ln}/><circle cx="42" cy="23" r="6" fill="${IC.p}" ${ln}/><circle cx="22" cy="23" r="3" fill="#5f5" opacity=".6"/><circle cx="42" cy="23" r="3" fill="#5f5" opacity=".6"/><path d="M32 16 V8" stroke="${IC.m}" stroke-width="3"/>`:`<rect x="16" y="16" width="30" height="14" rx="5" fill="${IC.o}" ${ln}/><circle cx="46" cy="23" r="7" fill="${IC.p}" ${ln}/><circle cx="46" cy="23" r="3.5" fill="#5f5" opacity=".6"/><rect x="10" y="19" width="6" height="8" rx="2" fill="${IC.p}"/>`;
const pills=(c1,c2)=>`<rect x="14" y="12" width="36" height="24" rx="2" fill="#cfd3d6" ${ln}/>${[0,1,2,3].map(i=>[0,1].map(j=>`<rect x="${17+i*8.5}" y="${15+j*10}" width="7" height="7.5" rx="3.5" fill="${j?c2:c1}" ${ln}/>`).join("")).join("")}`;
const syringe=(c)=>`<path d="M8 24 H14 M14 20 V28" stroke="${IC.m3}" stroke-width="2"/><rect x="14" y="20" width="26" height="8" rx="1" fill="#dfe8ea" ${ln}/><rect x="26" y="21" width="14" height="6" fill="${c}" opacity=".8"/><path d="M40 24 H46 M46 24 H58" stroke="${IC.m3}" stroke-width="1.2"/><path d="M40 21 H44 V27 H40" fill="${IC.m2}"/>`;
const bottle=(c,lab)=>`<path d="M28 4 H36 V12 Q42 16 42 22 V42 H22 V22 Q22 16 28 12Z" fill="${c}" ${ln}/><rect x="27" y="2" width="10" height="4" fill="${IC.rd}" ${ln}/><rect x="22" y="24" width="20" height="10" fill="${lab||IC.wh}"/><path d="M25 18 V40" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>`;
const can=(c,lab)=>`<rect x="20" y="10" width="24" height="30" rx="2" fill="${c}" ${ln}/><ellipse cx="32" cy="10" rx="12" ry="3" fill="${IC.st}" ${ln}/><rect x="20" y="18" width="24" height="12" fill="${lab}"/><path d="M23 12 V38" stroke="#fff" stroke-opacity=".3" stroke-width="1.4"/>`;
const tent=(c,big)=>`<path d="M${big?6:12} 40 L32 ${big?8:12} L${big?58:52} 40Z" fill="${c}" ${ln}/><path d="M32 ${big?8:12} L28 40 H36Z" fill="#0006"/><path d="M${big?4:10} 40 H${big?60:54}" stroke="#2a241b" stroke-width="2"/>`;
const bag=(c,w)=>`<rect x="8" y="16" width="48" height="18" rx="9" fill="${c}" ${ln}/>${[1,2,3,4].map(i=>`<path d="M${8+i*9.6} 17 V33" stroke="#0004"/>`).join("")}${w?`<ellipse cx="14" cy="25" rx="5" ry="8" fill="${IC.p}" opacity=".5"/>`:""}`;
const stove=(o)=>o==="wood"?`<rect x="16" y="18" width="32" height="20" rx="1" fill="${IC.m}" ${ln}/><rect x="20" y="24" width="12" height="9" fill="#e07a2a"/><rect x="40" y="2" width="5" height="16" fill="${IC.m2}" ${ln}/><path d="M43 2 q3 -2 0 -4" stroke="#aaa" fill="none"/><path d="M18 38 V44 M46 38 V44" stroke="${IC.m}" stroke-width="2"/>`:`<path d="M20 40 L22 24 H42 L44 40Z" fill="${IC.br2}" ${ln}/><path d="M24 24 Q32 12 40 24" fill="#4a8ff0" opacity=".85"/><path d="M28 24 Q32 16 36 24" fill="#c9e3ff"/><path d="M18 24 H46" stroke="${IC.m}" stroke-width="2"/>`;
function item(e){const n=e.n;
  const T={
  "Baionetta 6H4":()=>knife({h:"#7a2a18",saw:1}),"Coltello NR-40":()=>knife({h:IC.p}),"Ascia da caccia":axe,
  "Makarov PM":()=>pistol({grip:"#6b3820",ham:1}),"Fort-17":()=>pistol({}),"PB silenziata":()=>pistol({grip:"#6b3820",sup:1}),"APS Stečkin":()=>pistol({long:1,grip:"#6b3820",stock:1}),"Glock 17":()=>pistol({c:IC.p}),
  "MP5":()=>gun({L:.8,stock:"ar",mag:"curved",magX:.45,col:IC.p,short:1,gasTube:false}),
  "TOZ-66 a canne mozze":()=>gun({L:.75,wood:1,stock:"solid",short:1,gasTube:false,blackgrip:0}),"Doppietta TOZ-34":()=>gun({L:1.05,wood:1,gasTube:false}),
  "TOZ-194 a pompa":()=>gun({L:.95,col:IC.p,stock:"solid",gasTube:false}),"Saiga-12":()=>gun({L:.95,col:IC.p,mag:"straight",stock:"fold"}),"SPAS-12":()=>gun({L:.95,col:IC.p,stock:"fold",gasTube:true}),
  "AKS-74U":()=>gun({L:.75,wood:1,stock:"fold",mag:"curved",short:1,magc:"#a65a1c"}),"AKS-74":()=>gun({wood:1,stock:"fold",mag:"curved",magc:"#a65a1c"}),"AK-74":()=>gun({wood:1,mag:"curved",magc:"#a65a1c"}),
  "RPK-74":()=>gun({L:1.08,wood:1,stock:"thumb",mag:"long",bipod:1,magc:"#a65a1c"}),"AN-94":()=>gun({col:IC.p,stock:"fold",mag:"curved"}),
  "LR-300":()=>gun({col:IC.p,stock:"ar",mag:"straight",rail:1,carry:1}),"M4A1":()=>gun({L:.95,col:IC.p,stock:"ar",mag:"straight",rail:1,carry:1}),"SIG 550":()=>gun({col:"#3d4a2c",stock:"fold",mag:"curved",magc:"#9aa58a"}),
  "SKS":()=>gun({L:1.05,wood:1,mag:"box",gasTube:true}),"AKM":()=>gun({wood:1,mag:"curved",magc:IC.m2}),"Mosin-Nagant":()=>gun({L:1.1,wood:1,gasTube:false,rec:IC.m}),
  "SVD Dragunov":()=>gun({L:1.1,wood:1,stock:"thumb",mag:"straight",scope:1}),"PKM":()=>gun({L:1.1,wood:1,stock:"thumb",mag:"box",bipod:1,belt:1,magX:.42}),
  "AS Val":()=>gun({col:IC.p,stock:"fold",mag:"straight",integ:1}),
  "VSS Vintorez":()=>gun({wood:1,stock:"thumb",mag:"straight",scope:1,integ:1}),"OTs-14 Groza":()=>gun({L:.75,col:IC.p,stock:"bullpup",mag:"curved",magX:.2,short:1}),
  "Granata RGD-5":()=>grenade("rgd"),"Granata F1":()=>grenade("f1"),"Granata fumogena RDG-2":()=>grenade("smoke"),
  "Giacca di pelle":()=>suit({c:"#2a2320",collar:1}),"Giubbotto da novellino":()=>suit({c:"#6a5a3c",collar:1,pockets:1}),"Tuta «Alba»":()=>suit({c:"#5c5238",hood:1,pockets:1}),
  "Tuta da mercenario":()=>suit({c:"#46566a",pockets:1,camo:"#2f3b4a"}),"Vento della Libertà":()=>suit({c:"#4f6b34",hood:1,camo:"#8fb84a"}),"Tuta SEVA":()=>suit({c:IC.or,visor:1}),
  "Giubbotto con piastra leggera":()=>vest(IC.o,{pouch:1}),"PS5-M del Dovere":()=>suit({c:"#2b2b2b",plates:"#3a1d1a",patch:IC.rd}),"Guardiano della Libertà":()=>suit({c:"#4f6b34",plates:"#3e5428",camo:"#8fb84a"}),
  "Skat-9 militare":()=>suit({c:IC.o,plates:IC.o2,pockets:1}),"Esoscheletro":()=>suit({c:"#3a3d37",plates:"#55594f",exo:1}),"Portapiastre":()=>vest("#4e5a32",{pouch:1,camo:"#2f3720"}),
  "Piastra di classe 3":()=>plate("#5a5e55","III"),"Piastra di classe 4":()=>plate("#3c4034","IV"),"Piastra pesante di classe 5":()=>plate("#2a2d27","V"),
  "Berretto":()=>helmet("beret"),"Elmetto SSh-68":()=>helmet("ssh"),"Elmetto Sfera-08":()=>helmet("sfera"),"Elmetto Altyn con visiera":()=>helmet("altyn"),
  "Maschera PBF":()=>mask("pbf"),"Maschera M40":()=>mask("m40"),"Filtro":()=>mask("filter"),
  "Slitta per AK":()=>`<rect x="10" y="20" width="44" height="8" fill="${IC.p}" ${ln}/>${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${12+i*5.2}" y="17" width="3" height="3" fill="${IC.p}"/>`).join("")}<path d="M16 28 V36 H22" fill="none" stroke="${IC.m}" stroke-width="2.5"/>`,
  "Canna filettata":()=>`<rect x="8" y="21" width="40" height="6" fill="${IC.m}" ${ln}/><rect x="48" y="21.5" width="10" height="5" fill="${IC.m3}"/>${[0,1,2,3,4].map(i=>`<path d="M${49+i*2} 21.5 v5" stroke="#222"/>`).join("")}`,
  "Silenziatore 9 mm":()=>supp(28,IC.m2,8),"Silenziatore PBS-4":()=>supp(34,IC.m,8),"Silenziatore PBS-1":()=>supp(36,IC.m,9),"Silenziatore occidentale":()=>supp(34,"#6b5d45",8),
  "Spegnifiamma":()=>`<rect x="18" y="20" width="26" height="8" fill="${IC.m}" ${ln}/>${[0,1,2].map(i=>`<rect x="${26+i*6}" y="20" width="3" height="5" fill="#111"/>`).join("")}<rect x="10" y="22" width="8" height="4" fill="${IC.m3}"/>`,
  "Freno di bocca":()=>`<rect x="16" y="18" width="30" height="12" rx="2" fill="${IC.m2}" ${ln}/>${[0,1,2].map(i=>`<circle cx="${23+i*8}" cy="24" r="2.4" fill="#111"/>`).join("")}<rect x="8" y="22" width="8" height="4" fill="${IC.m3}"/>`,
  "Collimatore Kobra":()=>redDot(),"Olografico EOTech":()=>redDot({holo:1}),
  "Ottica PU 3,5×":()=>scope({w:5}),"Ottica PSO-1 4×":()=>scope({w:6,side:1}),"Ottica 1P29 4×":()=>scope({w:7,x0:18,x1:46,side:1}),"Ottica ACOG 4×":()=>scope({w:7,x0:20,x1:44,c:"#4a4033"}),
  "Ottica variabile 1–4×":()=>scope({w:6}),"Ottica notturna NSPU":()=>scope({w:9,x0:14,x1:46,side:1,nv:1,c:IC.o}),
  "Lanciagranate GP-25":()=>`<rect x="10" y="18" width="38" height="9" rx="4" fill="${IC.m2}" ${ln}/><path d="M20 27 L22 38 H28 L28 27" fill="${IC.p}" ${ln}/><rect x="48" y="19" width="4" height="7" fill="${IC.m}"/>`,
  "Lanciagranate M203":()=>`<rect x="8" y="18" width="42" height="9" rx="4" fill="${IC.m}" ${ln}/><rect x="10" y="14" width="36" height="4" fill="${IC.p}"/><path d="M14 27 L16 36 H22 L22 27" fill="${IC.p}" ${ln}/>`,
  "Torcia sull'arma":()=>torch(),"Laser":()=>`<rect x="16" y="16" width="26" height="14" rx="2" fill="#a08a5e" ${ln}/><circle cx="44" cy="20" r="2.5" fill="#e33"/><path d="M46 20 H62" stroke="#f33" stroke-width=".8" opacity=".8"/><rect x="16" y="30" width="26" height="4" fill="${IC.m}"/>`,
  "Torcia e laser":()=>`<rect x="14" y="14" width="30" height="18" rx="2" fill="#a08a5e" ${ln}/><circle cx="46" cy="18" r="2.5" fill="#e33"/><ellipse cx="45" cy="27" rx="2" ry="4" fill="#f6e7a0"/><path d="M48 18 H62" stroke="#f33" stroke-width=".8"/>`,
  "Bipiede":()=>`<rect x="22" y="10" width="20" height="6" rx="2" fill="${IC.m}" ${ln}/><path d="M28 16 L16 40 M36 16 L48 40" stroke="${IC.m2}" stroke-width="3" stroke-linecap="round"/><path d="M14 40 h5 M45 40 h5" stroke="${IC.p}" stroke-width="3"/>`,
  "Calcio e impugnatura":()=>`<rect x="12" y="12" width="40" height="6" fill="${IC.p}" ${ln}/><path d="M26 18 H36 L35 38 H27Z" fill="${IC.p}" ${ln}/>${[0,1,2,3].map(i=>`<path d="M27 ${23+i*4} H35" stroke="#333"/>`).join("")}`,
  "Calcio pieghevole":()=>`<path d="M52 18 H12 V34 L20 30 L52 26" fill="none" stroke="${IC.m}" stroke-width="3.4" stroke-linejoin="round"/><circle cx="52" cy="22" r="3" fill="${IC.m2}" ${ln}/>`,
  "Caricatore da 45":()=>mag("45"),"Caricatore da 60":()=>mag("60"),"Tamburo da 75":()=>mag("drum"),"Tamburo Saiga da 20":()=>mag("saiga"),
  "Canna lunga":()=>`<rect x="4" y="22" width="56" height="4" fill="${IC.m}" ${ln}/><rect x="4" y="20" width="10" height="8" fill="${IC.m2}" ${ln}/><rect x="40" y="19" width="3" height="3" fill="${IC.m}"/>`,
  "Canna corta":()=>`<rect x="14" y="22" width="34" height="4" fill="${IC.m}" ${ln}/><rect x="14" y="20" width="10" height="8" fill="${IC.m2}" ${ln}/><rect x="46" y="20" width="5" height="8" fill="${IC.m2}"/>`,
  "Bulloni (venti)":()=>[[18,20],[30,28],[42,18],[24,34],[44,34]].map(([x,y],i)=>`<g transform="rotate(${i*37} ${x} ${y})"><rect x="${x-2}" y="${y-8}" width="4" height="12" fill="${IC.st}" ${ln}/><path d="M${x-4} ${y-10} h8 v3 h-8z" fill="${IC.m3}" ${ln}/></g>`).join("")+`<rect x="32" y="34" width="4" height="8" fill="#d8c" opacity=".0"/><path d="M41 18 l3 -6" stroke="#e8e0c8" stroke-width="2"/>`,
  "Contatore Geiger":()=>dev({c:"#c9b230",dial:1,probe:1,x:12,w:30,h:30,y:10,sh:10,scr:"#e8e4d0"}),"Rivelatore «Eco»":()=>dev({c:"#4c5658",led:"#3f3",btn:"#222",ant:1}),
  "Rivelatore «Orso»":()=>dev({c:"#5b4a35",led:"#fa3",btn:"#222",ant:1,scr:"#7fbf9a"}),"Rivelatore «Veles»":()=>dev({c:"#2c3d4a",led:"#3cf",btn:"#222",ant:1,scr:"#7fd0f0",sh:16}),
  "Ricevitore radio":()=>dev({c:"#3a3a36",x:10,w:44,h:28,y:12,sh:8,scr:"#c8b878",grille:1,ant:1}),"PDA":()=>dev({c:"#2d3530",sh:18,btn:"#556",scr:"#a5c88a"}),
  "Pile":()=>[0,1,2].map(i=>`<rect x="${18+i*10}" y="12" width="8" height="26" rx="1.5" fill="#c9a22e" stroke="#0a0b0b" stroke-width=".8"/><rect x="${20+i*10}" y="9" width="4" height="3" fill="${IC.m3}"/><rect x="${18+i*10}" y="20" width="8" height="8" fill="#222"/>`).join(""),"Torcia":()=>torch(),"Binocolo":()=>binoc(),"Visore notturno 1ª gen.":()=>nvg(0),"Visore notturno 2ª gen.":()=>nvg(1),
  "Contenitore di piombo":()=>`<rect x="22" y="12" width="20" height="28" rx="3" fill="#6f7478" ${ln}/><rect x="20" y="9" width="24" height="6" rx="2" fill="#555b60" ${ln}/><circle cx="32" cy="27" r="4" fill="#f2c14e"/><circle cx="32" cy="27" r="1.3" fill="#222"/>`,
  "Contenitore per artefatti":()=>box("#4f5a44",{rad:1}),"Attrezzi":()=>`<rect x="10" y="16" width="44" height="22" rx="2" fill="#7a2a1c" ${ln}/><path d="M26 16 V10 H38 V16" fill="none" stroke="${IC.m}" stroke-width="2.5"/><path d="M14 26 H50" stroke="#0005"/><rect x="28" y="22" width="8" height="4" fill="${IC.st}"/>`,
  "Kit di pulizia armi":()=>`<rect x="10" y="14" width="44" height="22" rx="3" fill="#3d4530" ${ln}/><path d="M16 22 H48" stroke="${IC.br}" stroke-width="1.8"/><path d="M16 28 H44" stroke="${IC.m3}" stroke-width="1.8"/><rect x="44" y="26" width="6" height="5" fill="${IC.wh}"/>`,
  "Kit riparazione armi":()=>`<path d="M14 36 L36 14" stroke="${IC.m3}" stroke-width="4" stroke-linecap="round"/><path d="M34 10 a6 6 0 1 0 6 6 l-4 0 0 -4z" fill="${IC.m3}" ${ln}/><path d="M24 14 L46 36" stroke="${IC.rd}" stroke-width="4" stroke-linecap="round"/><rect x="20" y="10" width="8" height="8" fill="${IC.m2}" ${ln} transform="rotate(45 24 14)"/>`,
  "Kit riparazione armature":()=>`<rect x="12" y="14" width="40" height="22" rx="2" fill="#5c5238" ${ln}/><path d="M18 20 q14 10 28 0" stroke="${IC.wh}" stroke-dasharray="2 2" fill="none"/><path d="M40 30 L52 12" stroke="${IC.st}" stroke-width="1.5"/><circle cx="20" cy="30" r="3" fill="${IC.br}"/>`,
  "Kit per il fuoco":()=>`<rect x="14" y="16" width="16" height="22" rx="1" fill="#c9a46a" ${ln}/><rect x="16" y="18" width="12" height="6" fill="${IC.rd}"/><path d="M38 38 L46 12" stroke="${IC.m2}" stroke-width="4" stroke-linecap="round"/><path d="M42 30 q4 -6 8 -2 q-2 -6 2 -10" fill="none" stroke="#f6b13a" stroke-width="1.5"/>`,
  "Laccio emostatico":()=>`<path d="M10 30 Q32 10 54 30" fill="none" stroke="#1d1f20" stroke-width="7" stroke-linecap="round"/><rect x="26" y="14" width="12" height="10" rx="2" fill="${IC.rd}" ${ln}/><path d="M32 8 V30" stroke="${IC.m3}" stroke-width="2.5"/>`,
  "Stecca":()=>`<rect x="12" y="18" width="40" height="12" rx="3" fill="#e08a2a" ${ln}/><path d="M16 24 H48" stroke="#fff" stroke-opacity=".4"/>${[0,1,2].map(i=>`<rect x="${18+i*12}" y="16" width="4" height="16" fill="#e8e0cc" ${ln}/>`).join("")}`,
  "Kit chirurgico":()=>box("#2a3a4a",{cross:"#e33"}),"Adrenalina":()=>syringe("#f2c14e"),"Pervitin":()=>pills("#3a7bd5","#3a7bd5"),"Fenazepam":()=>pills("#d9d2c0","#8fb0c8"),
  "Benda":()=>`<circle cx="26" cy="26" r="13" fill="#e8e0cc" ${ln}/><circle cx="26" cy="26" r="5" fill="#cfc4aa" ${ln}/><path d="M36 34 Q46 38 56 32 V38 Q46 44 36 40Z" fill="#e8e0cc" ${ln}/>`,
  "Kit medico AI-2":()=>box(IC.or,{cross:"#fff"}),"Kit medico militare":()=>box(IC.o,{cross:IC.rd}),"Kit medico scientifico":()=>box("#c9cfd2",{cross:"#2a7bc0"}),
  "Antidolorifici":()=>pills("#f2f0e6","#f2f0e6"),"Morfina":()=>syringe("#d9c37a"),"Antibiotici":()=>pills("#c0392b","#f2c14e"),"Stimolante":()=>syringe("#5ad0e0"),
  "Antirad":()=>syringe("#e05a8a"),"Radioprotettore":()=>pills("#f2f0e6","#e8d15a"),"Psi-block":()=>pills("#8e5ad0","#c9a6f0"),
  "Cibo (1 unità)":()=>can("#9aa0a2","#c33a1e"),"Acqua (1 litro)":()=>bottle("#9fd0e8aa","#2a7bc0"),"Combustibile (1 unità)":()=>`<rect x="16" y="22" width="32" height="16" rx="1" fill="#3a6fb0" ${ln}/>${[0,1,2].map(i=>`<rect x="${19+i*9}" y="12" width="8" height="10" fill="#f0ede2" ${ln}/>`).join("")}`,
  "Vestiti invernali":()=>suit({c:"#7a6a4a",hood:1,c2:"#cfc6b0",pockets:1}),"Mantella antipioggia":()=>`<path d="M32 4 Q24 4 24 12 L8 44 H56 L40 12 Q40 4 32 4Z" fill="#4a5a34" ${ln}/><path d="M24 12 Q32 16 40 12" fill="none" stroke="#0005"/><path d="M20 30 q4 -3 7 0 M36 36 q4 -3 7 0" stroke="#2f3a20" stroke-width="2" fill="none"/>`,
  "Coperta":()=>`<path d="M10 14 H54 V38 H10Z" fill="#7a4a2e" ${ln}/><path d="M10 20 H54 M10 32 H54" stroke="#c9a46a" stroke-width="2"/><path d="M10 14 Q32 22 54 14" fill="#8a5a3e" opacity=".6"/>`,
  "Sacco a pelo estivo":()=>bag("#3b6fa0"),"Sacco a pelo invernale":()=>bag("#30353a",1),"Tenda da una persona":()=>tent(IC.o),"Tenda da due o tre":()=>tent("#6a5a3c",1),
  "Fornelletto":()=>stove(),"Stufa da tenda a legna":()=>stove("wood"),"Vodka":()=>bottle("#e8f2f2cc","#e8e2d0"),"Energetica":()=>can("#2a2a2a","#7ad03a"),
  "Sigarette":()=>`<rect x="18" y="12" width="28" height="28" rx="1" fill="#e8e2d0" ${ln}/><rect x="18" y="12" width="28" height="10" fill="#b03a2a"/>${[0,1,2].map(i=>`<rect x="${22+i*7}" y="6" width="5" height="8" fill="#e8c88a" ${ln}/>`).join("")}`,
  };
  if(T[n])return T[n]();
  if(e.c==="munizioni"){const m=n.match(/^([^ ]+)/)[1];
    if(/^12\/70/.test(n))return shells(/pallett/.test(n)?"#2f6fb0":/palla/.test(n)?"#c0392b":/flech/.test(n)?"#3a8a3a":"#222");
    if(/VOG|M433/.test(n))return vog(/M433/.test(n)?"#6a6a2a":/saltante/.test(n)?"#3d4a2c":IC.o);
    const T2={"9×18":{L:16,w:6,neck:false},"9×19":{L:17,w:6,neck:false},"5,45":{L:28,w:5},"5,56":{L:28,w:5},"7,62×39":{L:28,w:6},"7,62×54R":{L:34,w:6},"9×39":{L:28,w:7,neck:false}}[m]||{L:24,w:5};
    const tipc=/BS|BP|AP|PP|SNB|7N1|M995|M855A1|Igolnik|PBM/.test(n)?"#222":/US|SP-5/.test(n)?"#2a7a3a":/HP/.test(n)?"#c8a070":/LPS|M855$/.test(n)?"#c9c9c9":/PPe|SP-6/.test(n)?"#c0392b":null;
    return cart({...T2,n:3,steel:/^(5,45|7,62×39|9×39)/.test(n)&&!/M193|M855/.test(n),tipc});}
  return `<circle cx="32" cy="24" r="10" fill="${IC.m2}" ${ln}/>`;}
function itSvg(e){return `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${icBg(BGC[e.c]||"#333")}${item(e)}</svg>`;}
/* ===== avatar: ritratto disegnato dal nome e dalla fazione, oppure foto caricata ===== */
const hsh=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
const AVF={dovere:{bg:"#4a2a24",jk:"#2b2b2b",ac:"#9b2f17",hg:["helmet","helmet","hood"],mk:["gas","none","resp"]},
 liberta:{bg:"#34472a",jk:"#4f6b34",ac:"#8fb84a",hg:["hood","cap","none"],mk:["none","bala","gas"]},
 banditi:{bg:"#2a2622",jk:"#1d1a17",ac:"#6b5a45",hg:["hood","cap","none"],mk:["none","bala","none"]},
 mercenari:{bg:"#2c3640",jk:"#46566a",ac:"#9fb3c8",hg:["cap","helmet","none"],mk:["bala","none","resp"]},
 scienziati:{bg:"#4a3b1c",jk:"#d48a1c",ac:"#f2c14e",hg:["seva"],mk:["none"]},
 esercito:{bg:"#3a3d27",jk:"#5b5f36",ac:"#a3a86a",hg:["helmet","helmet","cap"],mk:["none","gas","none"]},
 mercante:{bg:"#3d3226",jk:"#5a4632",ac:"#c9a46a",hg:["none","cap"],mk:["none"]},
 stalker:{bg:"#36382a",jk:"#5c5238",ac:"#b8a77a",hg:["hood","hood","cap","none"],mk:["none","gas","resp","none"]}};
const avKey=f=>{f=(f||"").toLowerCase();return /dover/.test(f)?"dovere":/libert/.test(f)?"liberta":/band/.test(f)?"banditi":/merc(enar)/.test(f)?"mercenari":/scienz/.test(f)?"scienziati":/eserc|milit/.test(f)?"esercito":/mercante|barman/.test(f)?"mercante":"stalker";};
function avSvg(name,faz,seed){const F=AVF[avKey(faz)],h=hsh((name||"?")+"|"+(seed||0));const r=n=>(h>>>n)%997;const pick=(a,n)=>a[r(n)%a.length];
  const skin=pick(["#f2d6bc","#eccaa8","#e5bf9a","#ddb48e","#d6a985","#e9c3a3"],1),hair=pick(["#2a1d14","#4a3220","#6b4a2e","#8a6a44","#b89a6a","#1a1a1a","#8a8a8a","#5a3a24"],3);
  const hg=pick(F.hg,5),mk=pick(F.mk,7),beard=[0,1,1,2,3,4,4,5][r(9)%8],longH=r(27)%3===0,scar=r(11)%5===0,eyeY=31+(r(13)%3),jw=r(15)%3,brow=r(17)%3;
  const dk=c=>"#"+c.slice(1).match(/../g).map(x=>Math.round(parseInt(x,16)*.68).toString(16).padStart(2,"0")).join("");
  let s=`<rect width="64" height="64" fill="${F.bg}"/><rect width="64" height="64" fill="url(#avg${h%9})"/>`;
  s+=`<defs><radialGradient id="avg${h%9}" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>`;
  s+=`<path d="M6 64 C8 50 18 45 32 45 C46 45 56 50 58 64Z" fill="${F.jk}"/><path d="M26 45 L32 56 L38 45Z" fill="${dk(F.jk)}"/><rect x="${r(19)%2?40:16}" y="52" width="7" height="5" rx="1" fill="${F.ac}"/>`;
  s+=`<rect x="27" y="38" width="10" height="9" fill="${dk(skin)}"/>`;
  if(hg==="seva"){s+=`<ellipse cx="32" cy="31" rx="17" ry="18" fill="${F.jk}"/><ellipse cx="32" cy="31" rx="12" ry="12.5" fill="#1d2a2c"/><ellipse cx="28" cy="27" rx="4" ry="6" fill="#fff" opacity=".25"/><circle cx="32" cy="46" r="4" fill="${dk(F.jk)}"/>`;return wrap(s);}
  if(hg==="hood")s+=`<path d="M13 46 C10 26 18 12 32 12 C46 12 54 26 51 46 Z" fill="${dk(F.jk)}"/>`;
  const fw=jw===0?11:jw===1?12:13;
  if(longH&&mk!=="bala"&&hg!=="helmet")s+=`<path d="M${32-fw-2} 25 C${32-fw-4} 38 ${32-fw-3} 46 ${32-fw+1} 49 L${32+fw-1} 49 C${32+fw+3} 46 ${32+fw+4} 38 ${32+fw+2} 25 C${32+fw} 13 ${32-fw} 13 ${32-fw-2} 25Z" fill="${hair}"/>`;
  s+=`<ellipse cx="32" cy="31" rx="${fw}" ry="14" fill="${skin}"/>`;
  if(hg==="none"&&(longH||r(21)%3))s+=`<path d="M${32-fw} 28 C${32-fw} 16 ${32+fw} 16 ${32+fw} 28 C${32+fw-3} 21 ${32-fw+3} 21 ${32-fw} 28Z" fill="${hair}"/>`;
  if(mk==="bala")s+=`<ellipse cx="32" cy="31" rx="${fw+0.5}" ry="14.5" fill="#1c1c1c"/><rect x="${32-fw+2}" y="${eyeY-3}" width="${2*fw-4}" height="6" rx="3" fill="${skin}"/>`;
  s+=`<circle cx="27" cy="${eyeY}" r="1.6" fill="#141414"/><circle cx="37" cy="${eyeY}" r="1.6" fill="#141414"/>`;
  if(mk!=="bala"){s+=`<path d="M23.5 ${eyeY-4+(brow===2?1:0)} L30 ${eyeY-4-(brow===1?1:0)} M34 ${eyeY-4-(brow===1?1:0)} L40.5 ${eyeY-4+(brow===2?1:0)}" stroke="${hair}" stroke-width="1.6" stroke-linecap="round"/>`;
    s+=`<path d="M32 ${eyeY+2} L30.5 ${eyeY+7} L33 ${eyeY+7}" fill="none" stroke="${dk(skin)}" stroke-width="1"/>`;
    if(beard===1)s+=`<path d="M${32-fw+1} 33 C${32-fw+2} 46 ${32+fw-2} 46 ${32+fw-1} 33 C${32+fw-4} 40 ${32-fw+4} 40 ${32-fw+1} 33Z" fill="${hair}" opacity=".85"/>`;
    else if(beard===4)s+=`<path d="M${32-fw+1} 32 C${32-fw} 48 ${28} 56 32 58 C${36} 56 ${32+fw} 48 ${32+fw-1} 32 C${32+fw-4} 40 ${32-fw+4} 40 ${32-fw+1} 32Z" fill="${hair}"/><path d="M30 46 q2 6 2 10 M34 46 q-1 5 -1 9" stroke="#0003" fill="none"/>`;
    else if(beard===5)s+=`<path d="M29 ${eyeY+12} Q32 ${eyeY+19} 35 ${eyeY+12}Z" fill="${hair}"/>`;
    else if(beard===2)s+=`<path d="M${32-fw+2} 36 C${32-fw+4} 44 ${32+fw-4} 44 ${32+fw-2} 36" fill="none" stroke="${hair}" stroke-width="3" opacity=".35"/>`;
    s+=`<path d="M28.5 ${eyeY+11} Q32 ${eyeY+12-(r(23)%3)} 35.5 ${eyeY+11}" fill="none" stroke="#5a2c22" stroke-width="1.3" stroke-linecap="round"/>`;
    if(beard===3||beard===5||(beard===4&&r(29)%2))s+=`<path d="M26.5 ${eyeY+9.6} Q32 ${eyeY+7} 37.5 ${eyeY+9.6} Q32 ${eyeY+10.8} 26.5 ${eyeY+9.6}Z" fill="${hair}"/>`;
    if(scar)s+=`<path d="M38 ${eyeY-6} L42 ${eyeY+5}" stroke="#a5523e" stroke-width="1.2"/>`;}
  if(mk==="gas")s+=`<path d="M${32-fw} 26 C${32-fw} 18 ${32+fw} 18 ${32+fw} 26 L${32+fw-1} 38 C${32+fw-3} 46 ${32-fw+3} 46 ${32-fw+1} 38Z" fill="#4a4d3c"/><circle cx="27" cy="${eyeY-1}" r="4" fill="#9fb0a8" stroke="#222" stroke-width="1.5"/><circle cx="37" cy="${eyeY-1}" r="4" fill="#9fb0a8" stroke="#222" stroke-width="1.5"/><circle cx="26" cy="${eyeY-2}" r="1.3" fill="#fff" opacity=".6"/><circle cx="36" cy="${eyeY-2}" r="1.3" fill="#fff" opacity=".6"/><rect x="28" y="42" width="8" height="8" rx="2" fill="#2f3226"/><path d="M29 44 h6 M29 46 h6 M29 48 h6" stroke="#4a4d3c"/>`;
  if(mk==="resp")s+=`<path d="M${32-fw+2} 36 C${32-fw+3} 44 ${32+fw-3} 44 ${32+fw-2} 36 L32 33Z" fill="#3c3f33"/><circle cx="${32-5}" cy="40" r="3" fill="#2a2c24"/><circle cx="${32+5}" cy="40" r="3" fill="#2a2c24"/>`;
  if(hg==="hood")s+=`<path d="M13 46 C10 26 18 12 32 12 C46 12 54 26 51 46 L46 46 C48 30 44 19 32 19 C20 19 16 30 18 46Z" fill="${F.jk}"/>`;
  if(hg==="helmet")s+=`<path d="M${32-fw-3} 27 C${32-fw-3} 11 ${32+fw+3} 11 ${32+fw+3} 27 Z" fill="${F===AVF.dovere?"#2e3324":dk(F.jk)}"/><path d="M${32-fw-4} 27 H${32+fw+4}" stroke="#111" stroke-width="2"/>`;
  if(hg==="cap")s+=`<path d="M${32-fw-1} 25 C${32-fw-1} 13 ${32+fw+1} 13 ${32+fw+1} 25 Z" fill="${r(25)%2?"#222":F.ac}"/><rect x="${32-fw-1}" y="23" width="${2*fw+2}" height="3.5" rx="1.5" fill="${dk(r(25)%2?"#444":F.ac)}"/>`;
  return wrap(s);
  function wrap(x){return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${x}</svg>`;}}
const avHtml=(o,cls="av")=>`<span class="${cls}${o.stato==="morto"?" dead":""}">${o.av?`<img src="${esc(o.av)}" alt="">`:avSvg(o.nome,o.fazione,o.avs)}</span>`;
function avFile(file,cb){const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas");c.width=c.height=96;const m=Math.min(im.width,im.height);c.getContext("2d").drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,96,96);cb(c.toDataURL("image/jpeg",.82));};im.src=rd.result;};rd.readAsDataURL(file);}
const avCtl=(key,o)=>`<span class="avctl"><button class="btn g s" data-a="avnew" data-k="${key}" title="Un altro volto disegnato">Volto</button><label class="btn g s" style="display:inline-flex;align-items:center">Foto<input type="file" accept="image/*" data-av="${key}" hidden></label>${o.av?`<button class="btn g s" data-a="avdel" data-k="${key}">Togli foto</button>`:""}</span>`;
/* crescita: costo in PE del passo successivo (regole 3) */
const NEXTG={"":"D",D:"C",C:"B",B:"A"},SKC={"":1,D:2,C:3,B:4};
const upCost=(kind,cur)=>{cur=cur||"";if(!NEXTG[cur])return null;const c=SKC[cur];return kind==="sk"?c:2*(cur?c:1);};
const upInfo=path=>{const kind=path.startsWith("pg.sk.")?"sk":"att";const cur=path.split(".").reduce((o,k)=>o?.[k],S)||"";return{kind,cur,next:NEXTG[cur],cost:upCost(kind,cur)};};
function upBtn(path){const u=upInfo(path);if(!u.next)return `<span class="up max">al massimo</span>`;const pe=+S.pe||0,arm=ui.upArm===path;
  return `<button class="up${arm?" arm":""}" data-a="up" data-k="${path}" ${pe<u.cost?"disabled":""} title="${u.cur||"—"} → ${u.next}: ${u.cost} PE">${arm?`conferma −${u.cost} PE`:`▲ ${u.next} · ${u.cost} PE`}</button>`;}
const inp=(f,v,type="text",extra="")=>`<input type="${type}" data-f="${f}" value="${esc(v)}" ${extra}>`;

function vScheda(){const p=S.pg;
  return `<div class="grid">
  <section class="pane"><div class="row" style="gap:12px;flex-wrap:nowrap;margin-bottom:10px">${avHtml({nome:(p.nome||"")+(p.sopr||""),fazione:"stalker",av:p.av,avs:p.avs},"av big")}<div><h2 style="margin:0 0 6px">${esc(p.nome||"Senza nome")}${p.sopr?` «${esc(p.sopr)}»`:""}</h2>${avCtl("pg",p)}</div></div>
    <div class="grid" style="gap:8px"><label class="f"><span class="lbl">Nome</span>${inp("pg.nome",p.nome)}</label><label class="f"><span class="lbl">Soprannome</span>${inp("pg.sopr",p.sopr)}</label></div>
    <label class="f" style="margin-top:8px"><span class="lbl">Chi è</span><textarea data-f="pg.chi">${esc(p.chi)}</textarea></label>
    <label class="f" style="margin-top:8px"><span class="lbl">Specializzazioni (una per riga)</span><textarea data-f="pg.spec">${esc(p.spec)}</textarea></label></section>
  <section class="pane"><h3>Caratteristiche e abilità</h3>
    ${ATTR.map(([k,n])=>`<div style="margin-bottom:8px"><div class="row" style="justify-content:space-between"><b style="font-family:var(--f-h)">${n}</b><div style="width:8.5em">${sel("pg.att."+k,GOPT,p.att[k])}${upBtn("pg.att."+k)}</div></div>
      <div class="row" style="gap:6px;margin-top:4px">${SK[k].map(([sk,sn])=>`<label class="f" style="flex:1 1 30%"><span class="lbl">${sn}</span>${sel("pg.sk."+sk,[["","—"],...GOPT.map(([g])=>[g,g])],p.sk[sk]||"")}${upBtn("pg.sk."+sk)}</label>`).join("")}</div></div>`).join("")}
    <div class="row" style="justify-content:space-between"><b style="font-family:var(--f-h)">Sangue freddo</b><div style="width:8.5em">${sel("pg.sf",GOPT,p.sf)}${upBtn("pg.sf")}</div></div>
    <div class="upbox"><p class="small" style="margin:0"><b>${+S.pe||0} PE</b> da spendere · abilità 1/2/3/4 PE (fino a D/C/B/A), caratteristiche e Sangue freddo il doppio, specializzazione 3 PE. Primo clic sceglie, secondo conferma.</p>
      <div class="row" style="margin-top:6px;flex-wrap:nowrap"><input data-dr="newSpec" value="${esc(ui.newSpec||"")}" placeholder="nuova specializzazione (abilità: situazione)"><button class="btn s${ui.upArm==="spec"?" arm":""}" data-a="upspec" ${(+S.pe||0)<3?"disabled":""}>${ui.upArm==="spec"?"conferma −3 PE":"Impara · 3 PE"}</button></div>
      ${ui.lastUp?`<p class="small" style="margin:6px 0 0">Ultimo: ${esc(ui.lastUp.txt)} <button class="btn g s" data-a="upundo">Annulla</button></p>`:""}</div></section>
  <section class="pane"><h3>Tracce</h3>${TR.map(([k,n])=>`<div class="trk"><span class="lbl" style="margin:0">${n}</span>${pips(k,+S.tr[k]||0,6,"tr",k==="ferite"?5:4)}<span class="num">${S.tr[k]||0}</span></div>`).join("")}
    <p class="small muted">Malus attuale: Forza ${malus("forza")} · Agilità ${malus("agilita")} · Intelletto ${malus("intelletto")} · Empatia ${malus("empatia")} gradini.</p></section>
  <section class="pane"><h3>Reputazione e crescita</h3>
    <div class="grid" style="gap:8px;grid-template-columns:repeat(3,minmax(0,1fr))"><label class="f"><span class="lbl">PE</span>${inp("pe",S.pe,"number",'min="0"')}</label><label class="f"><span class="lbl">Rubli</span>${inp("rubli",S.rubli,"number",'min="0" step="100"')}</label><label class="f"><span class="lbl">Nome</span>${inp("nomeRep",S.nomeRep,"number")}</label></div>
    <p class="small"><b>${NOMELV(+S.nomeRep||0)}</b> · punto fortuna: <button class="chip" data-a="fort" aria-pressed="${!!S.fortuna}">${S.fortuna?"disponibile":"usato"}</button></p>
    <ul class="items">${FAZ.map(f=>{const n=+(S.rap[f]||0);return `<li class="row" style="justify-content:space-between"><span>${f}</span><span class="row"><span class="small muted">${RAPLV(n)}</span><button class="btn g s" data-a="rap" data-k="${f}" data-v="-1" aria-label="meno">−</button><b class="num" style="width:2em;text-align:center">${n}</b><button class="btn g s" data-a="rap" data-k="${f}" data-v="1" aria-label="più">+</button></span></li>`;}).join("")}</ul></section>
  <section class="pane"><h3>Orologi</h3>
    <div class="trk"><span class="lbl" style="margin:0">Emissione</span>${pips("emiss",+S.emiss||0,6,"clk",4)}<span class="num">${S.emiss||0}/6</span></div>
    <div class="trk"><span class="lbl" style="margin:0">Allerta</span>${pips("allerta",+S.allerta||0,6,"clk",3)}<span class="num">${S.allerta||0}</span></div>
    <label class="f" style="margin-top:8px"><span class="lbl">Note</span><textarea data-f="pg.note">${esc(S.pg.note)}</textarea></label></section>
  <section class="pane"><h3>Sicurezza e altro</h3><div class="row" style="gap:6px"><button class="btn g" data-a="backup">Copia di sicurezza</button><button class="btn g" data-tab="crea">Creazione del personaggio</button></div>
    ${ui.bk?`<textarea readonly style="min-height:120px;margin-top:8px;font-size:12px">${esc(backupTxt())}</textarea><p class="small muted">Se la copia automatica non è partita, seleziona tutto qui sopra e copialo a mano.</p>`:`<p class="small muted">Copia tutto il PDA (scheda, zaino, persone, rete, tiri, diario) come testo: incollalo in un file o in una chat. Per ripristinarlo lo passi al GM.</p>`}</section></div>`;}

function vDadi(){const r=ui.dr;const R=ui.roll;const st=R&&rollStats(R);const mal=r.tr?malus(r.a):0;
  return `<div class="grid"><section class="pane"><h2>Tiro a gradini</h2>
    ${(()=>{const im=inMano(),W=armaSel();const ws=W?(W.tipo==="arma"?wStato(W):W.stato||"ok"):"";return `<label class="f" style="margin-bottom:8px"><span class="lbl">In mano</span><select data-d="w"><option value="">niente (tiro libero)</option>${im.map(x=>`<option value="${x.id}" ${W&&W.id===x.id?"selected":""}>${esc(x.nome)}</option>`).join("")}</select></label>
      ${W?`<p class="small" style="margin:0 0 8px">${isFire(armOf(W.nome))?`<b>carico ${carOf(W)}/${capOf(armOf(W.nome),W)||"?"}</b> · `:""}${esc(W.nota||"")}${ws&&ws!=="ok"?` · <span class="warn">${ws}${ws==="usurato"?": −1 gradino, si inceppa anche col 2":": non si può usare"}</span>`:""}</p>`:im.length?"":`<p class="small muted" style="margin:0 0 8px">Nello Zaino metti un'arma «in mano» per sceglierla qui.</p>`}`;})()}
    <div class="chips qr">${QR.map(([a,s2,n])=>`<button class="chip" data-a="qroll" data-k="${a}|${s2}" title="${esc(ATN[a])}${s2?" + "+esc(SKN[s2]):""}">${n}</button>`).join("")}</div>
    <div class="grid" style="gap:8px;grid-template-columns:repeat(2,minmax(0,1fr))">
      <label class="f"><span class="lbl">Caratteristica</span><select data-d="a">${[...ATTR,["sf","Sangue freddo"]].map(([k,n])=>`<option value="${k}" ${r.a===k?"selected":""}>${n} ${k==="sf"?S.pg.sf:S.pg.att[k]}</option>`).join("")}</select></label>
      <label class="f"><span class="lbl">Abilità</span><select data-d="s" ${r.a==="sf"?"disabled":""}><option value="">nessuna</option>${(SK[r.a]||[]).map(([k,n])=>`<option value="${k}" ${r.s===k?"selected":""}>${n} ${S.pg.sk[k]||"—"}</option>`).join("")}</select></label>
      <label class="f"><span class="lbl">Passi di situazione</span><select data-d="p">${[2,1,0,-1,-2,-3].map(n=>`<option value="${n}" ${+r.p===n?"selected":""}>${n>0?"+":""}${n}</option>`).join("")}</select></label>
      <label class="f"><span class="lbl">Dadi munizioni</span><select data-d="m">${[0,1,2,3].map(n=>`<option value="${n}" ${+r.m===n?"selected":""}>${n}</option>`).join("")}</select></label></div>
    ${eqHtml()}
    <label class="row small" style="margin:8px 0"><input type="checkbox" data-d="tr" ${r.tr?"checked":""} style="width:auto;min-height:0"> Applica il malus delle tracce (adesso ${mal})</label>
    <button class="btn" data-a="roll" style="width:100%">Tira</button>
    ${R?`<div style="margin-top:14px"><div>${R.dice.map(x=>`<span class="die s${succ(x.v)} ${x.v===1?"one":""}">${x.v}<small>${esc(x.l.slice(0,5))} ${x.g}</small></span>`).join("")}${R.ammo.map(v=>`<span class="die am ${v===6?"s1":""} ${v===1?"one":""}">${v}<small>munizioni</small></span>`).join("")}</div>
      <p><span class="big">${st.base}</span> ${st.base===1?"successo":"successi"} — ${st.base===0?"fallimento, +1 PE":st.base===1?"ce la fai, con un prezzo se c'è pericolo":"pulito"}${R.ammo.length?` · colpi in più: <b>${st.hits}</b>`:""}${st.jam?` · <span class="warn">arma inceppata</span>`:""}${R.one?` · <span class="warn">è uscito un 1 dopo la forzatura</span>`:""}</p>
      <div class="row"><button class="btn g" data-a="force" ${R.forced||!R.dice.some(x=>succ(x.v)===0)?"disabled":""}>Forza (${R.a==="forza"||R.a==="agilita"?"+1 Fatica":"+1 Nervi"})</button><button class="btn g" data-a="luck" ${S.fortuna?"":"disabled"}>Punto fortuna</button></div></div>`:""}</section>
  <section class="pane"><h3>Ultimi tiri</h3><ul class="items">${L.tiri.slice().sort((a,b)=>b.ts-a.ts).slice(0,25).map(t=>`<li class="small"><span class="muted num">${esc(t.ora||"")}</span> ${esc(t.testo)}</li>`).join("")||`<li class="empty">Nessun tiro.</li>`}</ul></section></div>`;}

/* ===== armi: accessori, colpi nel caricatore; munizioni ===== */
const SOV=/AK|RPK|SVD|PKM|AS Val|VSS|Groza|AN-94|Saiga/,WEST=/M4|LR-300|SIG|MP5|Glock|SPAS/;
const calOf=e=>e&&e.c==="armi"?(e.s.split(" · ")[0]||""):"";
const isFire=e=>e&&e.c==="armi"&&!["mischia","granate"].includes(e.g);
const isLong=e=>isFire(e)&&e.g!=="pistole";
const modMax=e=>{const m=(e&&e.s||"").match(/mod (\d)/);return m?+m[1]:0;};
const ACCG=n=>/^Silenziatore|Spegnifiamma|Freno/.test(n)?"volata":/^Collimatore|^Olografico|^Ottica/.test(n)?"ottica":/^Lanciagranate/.test(n)?"lg":/^Caricatore|^Tamburo/.test(n)?"car":/^Canna (lunga|corta)/.test(n)?"canna":/^Calcio/.test(n)?"calcio":/^Torcia|^Laser/.test(n)?"luce":n;
const ACC0=n=>/^Slitta|^Canna filettata/.test(n)?0:1;
const ACCSL={"Lanciagranate GP-25":1,"Lanciagranate M203":1,"Tamburo da 75":1,"Tamburo Saiga da 20":1,"Calcio pieghevole":-1,"Canna lunga":.5,"Canna corta":-.5};
function accOk(w,a,mounted){const n=a.n,c=calOf(w),wn=w.n;if(!isFire(w))return false;
  if(n==="Slitta per AK")return /AK|AN-94|RPK|Saiga/.test(wn);
  if(n==="Canna filettata"||/^Canna (lunga|corta)/.test(n))return true;
  if(n==="Silenziatore 9 mm")return /^9×1[89]/.test(c);
  if(n==="Silenziatore PBS-4")return c==="5,45";if(n==="Silenziatore PBS-1")return c==="7,62×39";if(n==="Silenziatore occidentale")return c==="5,56";
  if(/Spegnifiamma|Freno/.test(n))return isLong(w)&&w.g!=="pompa";
  if(n==="Ottica PU 3,5×")return /Mosin|SKS/.test(wn);
  if(/Kobra|PSO-1|NSPU/.test(n))return SOV.test(wn);
  if(/1P29/.test(n))return /AK|AN-94|RPK/.test(wn);
  if(/EOTech|ACOG|variabile/.test(n))return WEST.test(wn)&&w.g!=="pistole"||mounted.includes("Slitta per AK");
  if(n==="Lanciagranate GP-25")return /^(AK-74|AKS-74|AKM|AN-94)$/.test(wn);
  if(n==="Lanciagranate M203")return /^(M4A1|LR-300)$/.test(wn);
  if(/Caricatore da (45|60)/.test(n))return ["5,45","5,56"].includes(c);
  if(n==="Tamburo da 75")return c==="7,62×39"&&/AK|RPK/.test(wn);if(n==="Tamburo Saiga da 20")return wn==="Saiga-12";
  return isLong(w);}
const ammoOf=x=>{const e=armOf(x.nome);return e&&e.c==="munizioni"?e:null;};
const ammoCal=e=>e.n.startsWith("12/70")?"12/70":/VOG/.test(e.n)?"VOG-25":/M433/.test(e.n)?"M433":e.n.split(" ")[0];
const wCal=w=>{const c=calOf(w);return c==="12/70"?"12/70":c;};
const colpiOf=x=>{if(x.colpi!=null)return +x.colpi||0;const m=(x.nota||"").match(/(\d+)\s*(colpi|cartucce|granate)/);if(m)return +m[1];const q=+x.qta||1;if(q>1)return q;const e=ammoOf(x);const b=e&&(e.s.match(/(\d+) (colpi|cartucce)/)||[])[1];return b?+b:1;};
const capOf=(w,x)=>{const acc=x.acc||[];if(acc.includes("Caricatore da 60"))return 60;if(acc.includes("Tamburo da 75"))return 75;if(acc.includes("Caricatore da 45"))return 45;if(acc.includes("Tamburo Saiga da 20"))return 20;const m=(w.s||"").match(/(\d+) (colpi|cartucce)/);return m?+m[1]:0;};
const carOf=x=>{if(x.car!=null)return +x.car||0;const n=x.nota||"";const m=n.match(/nel (?:serbatoio|caricatore|tubo)\D{0,3}(\d+)/i)||n.match(/(\d+) (?:cartucce|colpi) nel (?:tubo|caricatore|serbatoio)/i);return m?+m[1]:0;};
function wSlot(w,acc){return Math.max(w.g==="pistole"?.5:1,(+w.slot||1)+acc.reduce((a,n)=>a+(ACCSL[n]||0),0));}
function weaponPanel(x){const w=armOf(x.nome);if(!isFire(w))return "";const acc=x.acc||[];const mm=modMax(w),used=acc.reduce((a,n)=>a+ACC0(n),0);
  const accE=acc.map(n=>ARM.find(y=>y.n===n)).filter(Boolean);const val=(w.p||0)+accE.reduce((a,e)=>a+e.p,0);
  const owned=n=>L.inv.filter(y=>y.id!==x.id&&mine(y)&&armOf(y.nome)?.n===n&&y.dove!=="deposito").length;
  const opts=ARM.filter(a=>a.c==="accessori"&&!acc.includes(a.n)&&accOk(w,a,acc));
  const cal=wCal(w),cap=capOf(w,x),car=carOf(x);
  const ammoIt=L.inv.filter(y=>{const e=ammoOf(y);return e&&mine(y)&&ammoCal(e)===cal&&y.dove!=="deposito";});
  const tipi=[...new Set(ammoIt.map(y=>ammoOf(y).n))];const mun=x.mun&&tipi.includes(x.mun)?x.mun:tipi[0]||"";
  const scorta=ammoIt.reduce((a,y)=>a+colpiOf(y),0);
  const key="wp."+x.id;
  return `<details class="wpan" data-acc="${key}" ${ui.aopen&&ui.aopen[key]?"open":""} style="grid-column:1/-1"><summary><span>Arma</span><span class="small muted num">carico ${car}/${cap||"?"} · mod ${used}/${mm} · ${fs(wSlot(w,acc))} slot · ${fmtR(val)}</span></summary>
    <div class="wbody"><div class="row small" style="gap:6px"><b>Colpi</b><button class="btn g s" data-a="wcar" data-k="${x.id}" data-v="-1">−1</button><button class="btn g s" data-a="wcar" data-k="${x.id}" data-v="-3">−3 raffica</button><b class="num">${car}/${cap||"?"}</b><button class="btn g s" data-a="wcar" data-k="${x.id}" data-v="1">+1</button>
      ${tipi.length?`<select data-wm="${x.id}" style="width:auto;min-height:32px;padding:2px 6px">${tipi.map(t=>`<option ${t===mun?"selected":""}>${esc(t)}</option>`).join("")}</select><button class="btn s" data-a="wric" data-k="${x.id}" ${car>=cap?"disabled":""}>Ricarica</button><span class="muted">scorta ${cal}: ${scorta}</span>`:`<span class="muted">niente munizioni ${esc(cal)} addosso o nello zaino</span>`}</div>
    <div class="row small" style="gap:6px;margin-top:8px"><b>Accessori</b><span class="muted">slot di modifica ${used}/${mm}${used>mm?' · <span class="warn">troppi</span>':""}</span></div>
    ${accE.length?`<ul class="items">${accE.map(a=>`<li class="arow">${ico(a.n,"ico")}<div><b>${esc(a.n)}</b><div class="small muted">${esc(a.s)}${ACC0(a.n)?"":" · 0 slot"}${ACCSL[a.n]?` · carico ${ACCSL[a.n]>0?"+":""}${fs(ACCSL[a.n])}`:""}</div></div><span class="row" style="flex-wrap:nowrap"><span class="num small">${fmtR(a.p)}</span><button class="btn g s" data-a="wun" data-k="${x.id}" data-v="${esc(a.n)}">Smonta</button></span></li>`).join("")}</ul>`:`<p class="small muted" style="margin:4px 0">Nessun accessorio.</p>`}
    ${mm||opts.some(a=>!ACC0(a.n))?`<div class="row" style="gap:6px;margin-top:6px"><select data-wa="${x.id}" style="flex:1 1 14em;min-height:36px">${opts.map(a=>{const o=owned(a.n);const grp=ACCG(a.n);const clash=acc.find(n=>ACCG(n)===grp&&grp!==n);return `<option value="${esc(a.n)}" ${(ui.wsel||{})[x.id]===a.n?"selected":""}>${esc(a.n)} — ${o?"nello zaino":fmtR(a.p)}${ACC0(a.n)?" · 1 slot":" · 0 slot"}${clash?` · sostituisce ${clash}`:""}</option>`;}).join("")}</select><button class="btn s" data-a="wmount" data-k="${x.id}">Monta</button></div>
    <p class="small muted" style="margin:4px 0 0">Se l'accessorio è nello zaino lo prende da lì, se no lo compra al prezzo di listino. «Smonta» lo rimette nello zaino. Silenziatori, freni e spegnifiamma vogliono la canna filettata dove l'arma non l'ha già.</p>`:`<p class="small muted">Quest'arma non prende accessori.</p>`}
    <p class="small" style="margin:6px 0 0">Valore: arma ${fmtR(w.p)} + accessori ${fmtR(val-w.p)} = <b>${fmtR(val)}</b></p></div></details>`;}
function ammoPane(){const it=L.inv.filter(y=>ammoOf(y)&&mine(y));if(!it.length)return "";const by={};it.forEach(y=>{const c=ammoCal(ammoOf(y));(by[c]=by[c]||[]).push(y);});
  const guns=L.inv.filter(y=>y.tipo==="arma"&&isFire(armOf(y.nome)));
  return `<section class="pane" style="grid-column:1/-1"><h3>Munizioni</h3>${Object.entries(by).map(([c,a])=>{const tot=a.filter(y=>y.dove!=="deposito").reduce((s,y)=>s+colpiOf(y),0);const g=guns.filter(y=>wCal(armOf(y.nome))===c);const inArmi=g.reduce((s,y)=>s+carOf(y),0);
    return `<div class="mcal"><div class="row" style="justify-content:space-between"><b>${esc(c)}</b><span class="small"><b class="num">${tot}</b> di scorta${inArmi?` · ${inArmi} nelle armi`:""}${g.length?` · per ${g.map(y=>esc(armOf(y.nome).n)).join(", ")}`:` · <span class="muted">nessuna arma</span>`}</span></div>
    <ul class="items">${a.map(y=>{const e=ammoOf(y);return `<li class="mrow">${ico(y.nome)}<div class="mn"><b>${esc(y.nome)}</b><span class="small muted">${esc(e.s.split(" · ").slice(0,2).join(" · "))}${y.nota&&y.nota!==e.s?` · ${esc(y.nota)}`:""}</span></div>
      <span class="row" style="flex-wrap:nowrap;gap:4px"><button class="btn g s" data-a="mcol" data-k="${y.id}" data-v="-1" aria-label="meno">−</button><input type="number" min="0" data-mc="${y.id}" value="${colpiOf(y)}" style="width:4.2em;min-height:32px;padding:2px 6px"><button class="btn g s" data-a="mcol" data-k="${y.id}" data-v="1" aria-label="più">+</button></span>
      <select data-u="${y.id}" data-k="dove" style="width:auto;min-height:32px;padding:2px 6px">${["addosso","zaino","deposito","in mano"].map(o=>`<option ${y.dove===o?"selected":""}>${o}</option>`).join("")}</select><button class="btn g s" data-a="idel" data-k="${y.id}" aria-label="togli">✕</button></li>`;}).join("")}</ul></div>`;}).join("")}
    <p class="small muted">I colpi si contano qui. Le scatole dello stesso tipo si possono unire: metti il totale in una e togli l'altra. Il peso si aggiorna da solo (una scatola da 20 = il suo slot di listino).</p></section>`;}
const ammoSlot=(y,n)=>{const e=ammoOf(y);const box=+((e.s.match(/(\d+) (colpi|cartucce)/)||[])[1])||(/VOG|M433/.test(e.n)?5:20);return Math.max(0,Math.round((+e.slot||0.25)*n/box*4)/4);};
function setColpi(y,n){n=Math.max(0,Math.round(n));upd("inv",y.id,{colpi:n,qta:1,slot:ammoSlot(y,n)});}
function takeAmmo(cal,name,need){let got=0;const src=L.inv.filter(y=>{const e=ammoOf(y);return e&&mine(y)&&ammoCal(e)===cal&&(!name||e.n===name)&&y.dove!=="deposito"&&colpiOf(y)>0;}).sort((a,b)=>({"in mano":0,addosso:1,zaino:2}[a.dove]??3)-({"in mano":0,addosso:1,zaino:2}[b.dove]??3));
  for(const y of src){if(got>=need)break;const c=colpiOf(y),t=Math.min(c,need-got);got+=t;setColpi(y,c-t);}return got;}
function slots(){const s={addosso:0,zaino:0};L.inv.forEach(x=>{const w=x.dove==="in mano"?"addosso":x.dove;if(s[w]!=null)s[w]+=(+x.slot||0)*(+x.qta||1);});s.zaino+=((+S.scorte.cibo||0)+(+S.scorte.comb||0))/3+(+S.scorte.acqua||0)/2;return s;}
function wearRow(x){const t=x.tipo||"altro",m=wMax(x),s=+x.segni||0,st=wStato(x);const p=armOf(x.nome)?.p;
  return `<div class="row small" style="grid-column:1/-1;gap:6px"><select data-u="${x.id}" data-k="tipo" style="width:auto;min-height:32px;padding:2px 6px">${[["altro","oggetto"],["arma","arma"],["armatura","armatura"]].map(([v,n])=>`<option value="${v}" ${t===v?"selected":""}>${n}</option>`).join("")}</select>
  ${t==="armatura"?`<label class="row" style="gap:4px">classe <input type="number" min="0" max="6" data-u="${x.id}" data-k="classe" value="${+x.classe||0}" style="width:4em;min-height:32px;padding:2px 6px"></label>`:""}
  ${m?`<span class="lbl" style="margin:0">usura</span>${pips(x.id,s,m,"wear",wSoglia(x)+1)}<b class="${st==="ok"?"":"warn"}">${st}</b>${p&&st!=="ok"?`<span class="muted">tecnico: ${st==="rotto"?fmtR(p*.5):fmtR(p*.15)+"–"+fmtR(p*.3)}</span>`:""}`:t==="armatura"?`<span class="muted">classe 0: niente usura</span>`:""}</div>`;}
function vZaino(){const s=slots();ui.aopen=ui.aopen||{};const q=(ui.zq||"").toLowerCase().trim();const ord=ui.zord||"ts";
  const P=x=>armOf(x.nome)?.p||0,W=x=>(+x.slot||0)*(+x.qta||1),SR={rotto:0,usurato:1,ok:2};
  const sorter={ts:(a,b)=>(a.ts||0)-(b.ts||0),nome:(a,b)=>(a.nome||"").localeCompare(b.nome||""),peso:(a,b)=>W(b)-W(a),prezzo:(a,b)=>P(b)-P(a),stato:(a,b)=>(SR[zMeta(a).st]??2)-(SR[zMeta(b).st]??2)}[ord];
  const by=k=>L.inv.filter(x=>(x.dove||"zaino")===k&&!ammoOf(x)&&(!q||((x.nome||"")+" "+(x.nota||"")).toLowerCase().includes(q))).sort(sorter);
  const bar=(v,m)=>`<span class="meter"><i style="width:${Math.min(100,v/m*100)}%" class="${v>m?"over":""}"></i></span>`;
  const sc=(k,n)=>`<div class="row" style="justify-content:space-between"><span>${n}</span><span class="row"><button class="btn g s" data-a="sc" data-k="${k}" data-v="-1">−</button><b class="num" style="width:2.5em;text-align:center">${S.scorte[k]||0}</b><button class="btn g s" data-a="sc" data-k="${k}" data-v="1">+</button></span></div>`;
  const carried=L.inv.filter(y=>!mine(y)).length;
  return `<div class="grid"><section class="pane" style="grid-column:1/-1">${sellHtml()}<div class="row" style="justify-content:space-between;align-items:flex-end"><h2 style="margin:0">Zaino</h2>
    <div class="caps"><span class="small">Addosso <b class="num ${s.addosso>S.cap.addosso?"warn":""}">${fs(s.addosso)}/${S.cap.addosso}</b>${bar(s.addosso,S.cap.addosso)}</span><span class="small">Zaino <b class="num ${s.zaino>capZ()?"warn":""}">${fs(s.zaino)}/${capZ()}</b>${bar(s.zaino,capZ())}</span></div></div>
    <div class="row" style="gap:6px;margin:10px 0 4px"><input data-dr="zq" value="${esc(ui.zq||"")}" placeholder="cerca nello zaino" style="flex:1 1 12em"><select data-dr="zord" style="width:auto">${[["ts","ordine d'arrivo"],["nome","nome"],["peso","peso"],["prezzo","prezzo"],["stato","stato"]].map(([v,n])=>`<option value="${v}" ${ord===v?"selected":""}>${n}</option>`).join("")}</select></div>
    ${carried?`<p class="small muted" style="margin:0 0 6px">Il gruppo e i nascondigli tengono ${carried} cos${carried===1?"a":"e"} tua: vedi Gruppo e Zona.</p>`:""}
    ${DOVE.map(([k,n])=>{const a=by(k);if(!a.length)return "";const key="z."+k;const op=ui.aopen[key]??(k!=="deposito");const sl=a.reduce((t,x)=>t+W(x),0);return `<details class="acc" data-acc="${key}" ${op?"open":""}><summary><span>${n}</span><span class="small muted num">${a.length} · ${fs(sl)} slot</span></summary><div class="sub">${a.map(zRow).join("")}</div></details>`;}).join("")||`<p class="empty">${q?"Niente con questo nome.":"Zaino vuoto."}</p>`}
    <div class="row" style="margin-top:8px"><input data-dr="nn" placeholder="oggetto nuovo (nome del listino per icona e scheda)" style="flex:2 1 12em" value="${esc(ui.nn||"")}"><button class="btn" data-a="iadd">Aggiungi</button></div></section>
    ${artHtml()}${ammoPane()}
  <section class="pane"><h3>Scorte</h3>${sc("cibo","Cibo (unità)")}${sc("acqua","Acqua (litri)")}${sc("comb","Combustibile (unità)")}
    ${s.addosso>S.cap.addosso||s.zaino>capZ()?`<p class="warn small">Sovraccarico: niente corsa, −1 Mobilità, +1 Fatica a tappa.</p>`:""}
    <button class="btn g" data-a="giorno" style="margin-top:10px;width:100%">Mangia e bevi adesso</button>
    <p class="small muted">${STAG(month())==="inverno"?"Inverno: 2 unità di cibo al giorno.":"1 unità di cibo al giorno."} ${STAG(month())==="estate"?"Estate: 3 litri.":"2 litri d'acqua."} A mezzanotte il PDA te lo chiede da solo.</p></section></div>`;}
const ACAT=[["armi","Armi"],["munizioni","Munizioni"],["armature","Armature"],["accessori","Accessori"],["strumenti","Strumenti"],["medicine","Medicine"],["campo","Campo e scorte"]];
const AGRP=[["mischia","Mischia"],["pistole","Pistole"],["mitra","Mitra"],["pompa","Canna liscia"],["assalto","Fucili d'assalto"],["precisione","Precisione"],["mitragliatrici","Mitragliatrici"],["granate","Granate"]];
function vArmeria(){const r=+S.rubli||0;ui.aopen=ui.aopen||{};const rf=x=>ui.arar==="tutte"||x.r===ui.arar;
  const row=x=>`<li class="arow">${ico(x.n,"ico big")}<div><div class="row" style="gap:6px"><b>${esc(x.n)}</b><span class="rar ${x.r}">${x.r}</span></div><div class="small">${esc(x.s)}</div><div class="small muted">${x.sc?"nelle scorte":x.slot?fs(x.slot)+" slot":"indossato o 0 slot"}</div></div>
    <div class="row" style="flex-wrap:nowrap"><b class="num">${fmtR(x.p)}</b><button class="btn s" data-a="buy" data-k="${ARM.indexOf(x)}" ${x.p>r?"disabled":""}>Compra</button></div></li>`;
  const box=(id,title,items,inner)=>{const n=items.length;return `<details class="acc" data-acc="${id}" ${ui.aopen[id]?"open":""}><summary><span>${title}</span><span class="small muted num">${n} ${n===1?"voce":"voci"}</span></summary>${inner??(n?`<ul class="items">${items.map(row).join("")}</ul>`:`<p class="empty">Niente con questa rarità.</p>`)}</details>`;};
  const cats=ACAT.map(([k,nm])=>{const it=ARM.filter(x=>x.c===k&&rf(x));
    if(k==="armi"){const grp=AGRP.map(([g,gn])=>box("armi."+g,gn,it.filter(x=>x.g===g))).join("");const altre=it.filter(x=>!AGRP.some(([g])=>g===x.g));
      return box("armi",nm,it,`<div class="sub">${grp}${altre.length?box("armi.altro","Altre",altre):""}</div>`);}
    return box(k,nm,it);}).join("");
  return `<section><div class="row" style="justify-content:space-between"><h2>Armeria</h2><span class="big num" style="font-size:24px">${fmtR(r)}</span></div>
    <p class="small muted">C comune, NC non comune (Rapporto 3+), R raro (Rapporto 8+ o nord), MR molto raro (non si compra: bottino o favori). Il mercante del Cordone non va oltre P3 e classe 2.</p>
    ${S.lastBuy?`<p class="small">Comprato <b>${esc(S.lastBuy.n)}</b> per ${fmtR(S.lastBuy.p)}. <button class="btn g s" data-a="bundo">Annulla</button></p>`:""}
    <div class="row" style="margin-bottom:8px"><span class="row small"><span class="lbl" style="margin:0">Icone</span><button class="chip" data-a="icom" data-k="dis" aria-pressed="${icoMode()==="dis"}">disegnate</button><button class="chip" data-a="icom" data-k="foto" aria-pressed="${icoMode()==="foto"}">foto</button></span><label class="row small"><span class="lbl" style="margin:0">Rarità</span><select data-dr="arar" style="width:auto">${[["tutte","Tutte"],["C","C · comune"],["NC","NC · non comune"],["R","R · raro"],["MR","MR · molto raro"]].map(([v,t])=>`<option value="${v}" ${ui.arar===v?"selected":""}>${t}</option>`).join("")}</select></label>
      <button class="btn g s" data-a="accall" data-v="0">Chiudi tutto</button></div>
    ${cats}</section>`;}

function vPda(){const t=ui.pdaTab;const msgs=L.pda.filter(m=>m.tipo!=="lavoro"&&m.tipo!=="radio").sort((a,b)=>a.ts-b.ts);const jobs=L.pda.filter(m=>m.tipo==="lavoro").sort((a,b)=>b.ts-a.ts);
  const ST={offerto:"Offerto",accettato:"Accettato",fatto:"Fatto",fallito:"Fallito",rifiutato:"Rifiutato"};
  return `<section><h2>Rete degli stalker</h2><div class="chips"><button class="chip" data-a="pt" data-k="rete" aria-pressed="${t==="rete"}">Messaggi</button><button class="chip" data-a="pt" data-k="lavori" aria-pressed="${t==="lavori"}">Lavori (${jobs.filter(j=>(j.stato||"offerto")==="offerto").length})</button><button class="chip" data-a="pt" data-k="radio" aria-pressed="${t==="radio"}">Radio</button></div>${t==="radio"?radioHtml():""}
  ${t==="radio"?"":t==="rete"?`<div>${msgs.map(m=>`<div class="msg ${m.mio?"mio":""}"><div class="h">${m.mio?"":(()=>{const q=L.png.find(x=>x.nome===m.da);return avHtml(q||{nome:m.da,fazione:m.fazione},"av xs");})()}${esc(m.da||"?")}${m.fazione?` · ${esc(m.fazione)}`:""} · ${esc(dataIt(m.data))} ${esc(m.ora||"")}</div><div>${esc(m.testo)}</div></div>`).join("")||`<p class="empty">Silenzio sulla rete.</p>`}</div>
    <div class="row" style="margin-top:10px"><input data-dr="msg" value="${esc(ui.msg||"")}" placeholder="scrivi sulla rete" style="flex:1 1 14em"><button class="btn" data-a="send">Invia</button></div>`
  :`<div class="cards">${jobs.map(j=>{const s=j.stato||"offerto";return `<article class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(j.titolo)}</h3><span class="rar">${ST[s]}</span></div><span class="small muted">${esc(j.da||"")}${j.luogo?` · ${esc(j.luogo)}`:""}${j.scadenza?(()=>{const m=jobLeft(j);return m==null||!["offerto","accettato"].includes(s)?` · entro ${esc(j.scadenza)}`:` · <span class="${m<1440?"warn":""}">${leftTxt(m)}</span>`;})():""}</span><p style="margin:0;white-space:pre-wrap">${esc(j.testo||"")}</p><b class="num">${fmtR(j.paga)}</b>
    <div class="row">${s==="offerto"?`<button class="btn s" data-a="job" data-k="${j.id}" data-v="accettato">Accetta</button><button class="btn g s" data-a="job" data-k="${j.id}" data-v="rifiutato">Rifiuta</button>`:s==="accettato"?`<button class="btn s" data-a="job" data-k="${j.id}" data-v="fatto">Fatto</button><button class="btn g s" data-a="job" data-k="${j.id}" data-v="fallito">Fallito</button>`:""}</div></article>`;}).join("")||`<p class="empty">Nessun lavoro.</p>`}</div>`}
  <p class="small muted">I messaggi degli altri e i lavori li scrive il GM. Accettare qui vale come dirlo in gioco. «Fatto» incassa la paga e alza il Nome (+1, +2, +3 secondo la grandezza; +1 con testimoni lo aggiunge il GM); «Fallito» toglie 1 al Nome.</p></section>`;}

function vOracolo(){const t=+S.tensione;const hist=(ui.solo.length?ui.solo:L.solo.slice().sort((a,b)=>b.ts-a.ts)).slice(0,30);
  return `<div class="grid"><section class="pane"><div class="row" style="justify-content:space-between"><h2>Oracolo</h2><span class="row"><span class="lbl" style="margin:0">Tensione</span><button class="btn g s" data-a="ten" data-v="-1">−</button><b class="big num" style="font-size:26px">${t}</b><button class="btn g s" data-a="ten" data-v="1">+</button></span></div>
    <p class="small muted">A fine scena −1 se hai il controllo, +1 se no. Più è alta, più la Zona sorprende.</p>
    <label class="f"><span class="lbl">Domanda sì/no</span><input data-dr="q" value="${esc(ui.q||"")}" placeholder="Il mercante ha munizioni PS?"></label>
    <div class="chips">${PROB.map(([n,v])=>`<button class="chip" data-a="prob" data-k="${v}" aria-pressed="${+(ui.prob||50)===v}">${n}</button>`).join("")}</div>
    <button class="btn" data-a="or" style="width:100%">Chiedi all'oracolo</button>
    <div class="row" style="margin-top:10px"><button class="btn g" data-a="scena">Nuova scena</button><button class="btn g" data-a="ev">Evento casuale</button><button class="btn g" data-a="sig">Significato</button></div>
    <h3 style="margin-top:14px">Persone</h3>
    <div class="row"><button class="btn g" data-a="fa">Cosa fa?</button><select data-dr="fid" style="width:auto">${[-2,-1,0,1,2].map(n=>`<option value="${n}" ${+(ui.fid||0)===n?"selected":""}>fiducia ${n>0?"+":""}${n}</option>`).join("")}</select><button class="btn g" data-a="reaz">Reazione</button><button class="btn g" data-a="png">Persona nuova</button><button class="btn g" data-a="cli">Cliente</button><button class="btn g" data-a="comp">Compagno</button></div>
    ${ui.lastPng?`<button class="btn s" data-a="pngsave" style="margin-top:6px">Salva ${esc(ui.lastPng.nome)} nel registro</button>`:""}
    <h3 style="margin-top:14px">Lavori e rete</h3>
    <div class="row"><button class="btn g" data-a="lav">Lavoro qui</button><button class="btn g" data-a="compl">Complicazione</button><button class="btn g" data-a="voce">Voce sulla rete</button></div>
    ${ui.lastJob?`<button class="btn s" data-a="jobpda" style="margin-top:6px">Metti «${esc(ui.lastJob.titolo)}» nel PDA</button>`:""}
    <h3 style="margin-top:14px">Strada</h3>
    <div class="row"><select data-dr="per" style="width:auto">${[1,2,3,4,5].map(n=>`<option value="${n}" ${+(ui.per||ZONE.find(z=>z[0]===S.clock.luogo)?.[1]||1)===n?"selected":""}>pericolo ${n}</option>`).join("")}</select><label class="row small"><input type="checkbox" data-dr="notte" ${ui.notte?"checked":""} style="width:auto;min-height:0"> di notte</label><button class="btn g" data-a="via">Tappa</button><button class="btn g" data-a="met">Meteo</button></div>
    <h3 style="margin-top:14px">Scontri e bottino</h3>
    <div class="row"><select data-dr="chi" style="width:auto">${Object.entries(KIT).map(([k,v])=>`<option value="${k}" ${(ui.chi||"bandito")===k?"selected":""}>${v.n}</option>`).join("")}</select><button class="btn g" data-a="kit">Cosa porta</button><button class="btn g" data-a="cad">Perquisisci il cadavere</button></div>
    <div class="row" style="margin-top:6px"><button class="btn g" data-a="nasc">Nascondiglio</button><button class="btn g" data-a="campo">Campo di anomalie</button><label class="row small"><input type="checkbox" data-dr="dopoEm" ${ui.dopoEm?"checked":""} style="width:auto;min-height:0"> dopo un'Emissione</label></div>
    <p class="small muted">Il pericolo è quello scelto in «Strada». Dai cadaveri le armi escono quasi sempre usurate o rotte e i caricatori mezzi vuoti (6.6).</p>
    ${ui.lastLoot?`<button class="btn" data-a="prendi" style="width:100%">Prendi tutto${ui.lastLoot.rub?` (${fmtR(ui.lastLoot.rub)})`:""}</button>`:""}</section>
  <section class="pane"><h3>Risposte</h3>${hist.map(e=>`<div class="res"><b>${esc(e.tit)}</b> <span class="small muted num">${esc(e.ora||"")}</span>${(e.righe||[]).map(r=>`<div>${r}</div>`).join("")}</div>`).join("")||`<p class="empty">Fai una domanda.</p>`}</section></div>`;}

const PGRP=[["compagni","Compagni"],["clienti","Clienti"],["amici","Amici"],["nemici","Nemici"],["dovere","Dovere"],["liberta","Libertà"],["banditi","Banditi"],["mercenari","Mercenari"],["scienziati","Scienziati"],["esercito","Esercito"],["mercanti","Mercanti e baristi"],["stalker","Stalker"],["altri","Altri"]];
const pGrp=p=>{const f=(p.fazione||"").toLowerCase();return /compagn/.test(f)?"compagni":/client/.test(f)?"clienti":/amic/.test(f)?"amici":/nemic/.test(f)?"nemici":/dover/.test(f)?"dovere":/libert/.test(f)?"liberta":/band/.test(f)?"banditi":/mercenar/.test(f)?"mercenari":/scienz/.test(f)?"scienziati":/eserc|milit/.test(f)?"esercito":/mercant|barman|barist/.test(f)?"mercanti":/stalker|novellin|guida/.test(f)?"stalker":"altri";};
const FIDN=["nemico giurato","ostile","neutro","amico","fidato"];
function vPersone(){ui.aopen=ui.aopen||{};const q=(ui.pq||"").toLowerCase().trim();const all=L.png.filter(p=>!q||((p.nome||"")+" "+(p.fazione||"")+" "+(p.nota||"")).toLowerCase().includes(q));
  const sorted=a=>a.slice().sort((x,y)=>(+!!y.imp)-(+!!x.imp)||(x.nome||"").localeCompare(y.nome||""));
  const card=p=>{const id="pp."+p.id;return `<details class="pcard${p.imp?" imp":""}" data-acc="${id}" ${ui.aopen[id]?"open":""}><summary>${avHtml(p,"av sm")}<span class="pn"><b>${esc(p.nome||"?")}</b><span class="small muted">${esc(p.fazione||"—")}${p.stato&&p.stato!=="vivo"?` · <span class="${p.stato==="morto"?"":"warn"}">${esc(p.stato)}</span>`:""}</span></span><span class="fid f${(+p.fiducia||0)+2}" title="fiducia: ${FIDN[(+p.fiducia||0)+2]}">${(+p.fiducia||0)>0?"+":""}${+p.fiducia||0}</span></summary>
    <div class="pbody"><div class="row small" style="gap:6px"><button class="btn ${p.imp?"":"g"} s" data-a="pimp" data-k="${p.id}">${p.imp?"★ importante":"☆ secondario"}</button>
      <select data-u="${p.id}" data-c="png" data-k="stato" style="width:auto;min-height:32px;padding:2px 6px">${["vivo","ferito","sparito","morto"].map(o=>`<option ${p.stato===o?"selected":""}>${o}</option>`).join("")}</select>
      <span class="row" style="gap:4px">fiducia <button class="btn g s" data-a="fid" data-k="${p.id}" data-v="-1" aria-label="meno">−</button><b class="num">${+p.fiducia||0}</b><button class="btn g s" data-a="fid" data-k="${p.id}" data-v="1" aria-label="più">+</button><span class="muted">${FIDN[(+p.fiducia||0)+2]}</span></span></div>
      <div class="grid" style="gap:6px;grid-template-columns:minmax(0,1fr) minmax(0,1fr);margin:6px 0"><input data-u="${p.id}" data-c="png" data-k="nome" value="${esc(p.nome||"")}" aria-label="nome"><input data-u="${p.id}" data-c="png" data-k="fazione" value="${esc(p.fazione||"")}" list="fazl" placeholder="fazione o ruolo" aria-label="fazione"></div>
      <textarea data-u="${p.id}" data-c="png" data-k="nota" style="min-height:56px">${esc(p.nota||"")}</textarea>${avCtl(p.id,p)}${p.stato!=="morto"?`<div style="margin-top:6px"><button class="btn g s" data-a="parla" data-k="${p.id}">${ui.chatWith===p.id?"Chiudi il dialogo":"Parla"}</button>${ui.chatWith===p.id?chatBox(p.id):""}</div>`:""}</div></details>`;};
  const list=(a,flat)=>{const im=sorted(a.filter(p=>p.imp)),se=sorted(a.filter(p=>!p.imp));if(flat)return sorted(a).map(card).join("");if(ui.pimp)return im.map(card).join("")||`<p class="empty">Nessuno importante.</p>`;
    return (im.length?`<div class="plab">Importanti</div>${im.map(card).join("")}`:"")+(se.length?`<div class="plab">Secondari</div>${se.map(card).join("")}`:"");};
  const vivi=all.filter(p=>p.stato!=="morto"),morti=all.filter(p=>p.stato==="morto");
  const box=(id,title,a,open)=>{const n=a.length,ni=a.filter(p=>p.imp).length;if(!n)return "";const key="pg."+id;const op=ui.aopen[key]??open;return `<details class="acc" data-acc="${key}" ${op?"open":""}><summary><span>${title}</span><span class="small muted num">${ni?`★${ni} · `:""}${n}</span></summary><div class="sub">${list(a,id==="imp")}</div></details>`;};
  let body;
  if(ui.pvista==="stato")body=[["vivo","Vivi"],["ferito","Feriti"],["sparito","Spariti"]].map(([k,t])=>box("st."+k,t,vivi.filter(p=>(p.stato||"vivo")===k),k!=="vivo"||!!q)).join("");
  else if(ui.pvista==="fiducia")body=[2,1,0,-1,-2].map(f=>box("fd."+f,FIDN[f+2][0].toUpperCase()+FIDN[f+2].slice(1),vivi.filter(p=>(+p.fiducia||0)===f),!!q)).join("");
  else body=box("imp","★ Importanti",vivi.filter(p=>p.imp),true)+PGRP.map(([k,t])=>box("g."+k,t,vivi.filter(p=>pGrp(p)===k),!!q)).join("");
  body+=box("morti","✝ Morti",morti,!!q);
  return `<section class="pane"><h2>Persone</h2>
    <div class="row" style="margin-bottom:8px"><input data-dr="pq" value="${esc(ui.pq||"")}" placeholder="cerca nome, fazione, nota" style="flex:1 1 12em">
      <select data-dr="pvista" style="width:auto"><option value="gruppi" ${!ui.pvista||ui.pvista==="gruppi"?"selected":""}>per gruppo e fazione</option><option value="stato" ${ui.pvista==="stato"?"selected":""}>per stato</option><option value="fiducia" ${ui.pvista==="fiducia"?"selected":""}>per fiducia</option></select>
      <label class="row small"><input type="checkbox" data-dr="pimp" ${ui.pimp?"checked":""} style="width:auto;min-height:0"> solo importanti</label></div>
    <p class="small muted" style="margin:0 0 8px">${vivi.length} vivi · ${morti.length} morti · ${L.png.filter(p=>p.imp).length} importanti</p>
    ${body||`<p class="empty">${L.png.length?"Nessuno corrisponde.":"Nessuno ancora."}</p>`}
    <datalist id="fazl">${["compagno","cliente","amico","nemico","Dovere","Libertà","bandito","mercenario","scienziato","militare","mercante","Barman","stalker libero","novellino"].map(f=>`<option value="${f}">`).join("")}</datalist>
    <div class="row" style="margin-top:8px"><input data-dr="pn" value="${esc(ui.pn||"")}" placeholder="nome" style="flex:1 1 10em"><input data-dr="pf" value="${esc(ui.pf||"")}" list="fazl" placeholder="fazione" style="flex:1 1 8em"><button class="btn" data-a="padd">Aggiungi</button></div></section>`;}
function vRegistro(){const ds=L.diario.slice().sort((a,b)=>b.ts-a.ts);const sw=`<div class="chips" style="grid-column:1/-1;margin:0"><button class="chip" data-a="rv" data-k="" aria-pressed="${!ui.rv}">Persone e diario</button><button class="chip" data-a="rv" data-k="crono" aria-pressed="${ui.rv==="crono"}">Cronologia</button><button class="chip" data-a="rv" data-k="best" aria-pressed="${ui.rv==="best"}">Bestiario</button></div>`;
  if(ui.rv==="best")return `<div class="grid">${sw}${vBestia()}</div>`;
  if(ui.rv==="crono")return `<div class="grid">${sw}<div style="grid-column:1/-1">${vCrono()}</div></div>`;
  return `<div class="grid">${sw}${vPersone()}
  <section class="pane"><h2>Diario</h2><textarea data-dr="dt" placeholder="Cosa è successo">${esc(ui.dt||"")}</textarea><button class="btn" data-a="dadd" style="margin:6px 0 10px">Scrivi</button>
    <ul class="items">${ds.map(x=>`<li><div class="small muted num">${esc(dataIt(x.data))} ${esc(x.ora||"")}${x.luogo?` · ${esc(x.luogo)}`:""}</div><div style="white-space:pre-wrap">${esc(x.testo)}</div></li>`).join("")||`<li class="empty">Pagine bianche.</li>`}</ul></section></div>`;}

function vMappa(){const q=S.clock.luogo;const dests=ZONE.map(z=>z[0]).filter(z=>z!==q&&!/Sotterranei/.test(z));const dest=dests.includes(ui.dest)?ui.dest:(ui.dest=nbr(q)[0]||dests[0]);
  const p=q&&path(q,dest);let tot=[0,0,0];if(p)p.slice(1).forEach((z,i)=>{const e=edge(p[i],z);tot[0]+=e[2];tot[1]+=e[3];tot[2]=Math.max(tot[2],perOf(z));});const k=ui.notteV?2:1;
  return `<section><h2>La Zona</h2>${viaggioHtml()}${anomHtml()}<div id="mapslot"></div>
  <div class="grid" style="margin-top:14px"><section class="pane"><h3>Viaggio da ${esc(q||"—")}</h3>
    <div class="row"><select data-dr="dest" style="width:auto">${dests.map(z=>`<option ${z===dest?"selected":""}>${esc(z)}</option>`).join("")}</select><label class="row small"><input type="checkbox" data-dr="notteV" ${ui.notteV?"checked":""} style="width:auto;min-height:0"> di notte o con clienti lenti</label></div>
    ${p?`<ol class="small" style="padding-left:1.2em">${p.slice(1).map((z,i)=>{const e=edge(p[i],z);return `<li><b>${esc(z)}</b> · ${e[2]} km · ${e[3]*k} h · pericolo ${perOf(z)} · <span class="muted">${esc(e[4])}</span></li>`;}).join("")}</ol>
    <p><b class="num">${tot[0]} km · ${tot[1]*k} h · ${p.length-1} tapp${p.length>2?"e":"a"}</b> · il punto peggiore: pericolo ${tot[2]}${p.length-1>=3?` · <span class="warn">dalla terza tappa +1 Fatica</span>`:""}</p>
    <div class="row"><button class="btn" data-x="vgo" ${S.viaggio?"disabled":""}>Parti, tappa per tappa</button><button class="btn g" data-a="tappe">Tira solo le tappe</button><button class="btn g" data-a="arriva">Arrivato di colpo</button></div>`:`<p class="empty">Segna prima dove sei.</p>`}
    <p class="small muted">«Parti» ti porta tratto per tratto: a ogni tratto passa il tempo, si tira cosa succede e decidi tu. Alla fine tutto va nell'Oracolo.</p><button class="btn g s" data-x="anstart" ${S.anom?"disabled":""}>Campo di anomalie qui</button></section>
  <section class="pane"><h3>Dove sei</h3><ul class="items">${ZONE.map(([n,pp])=>`<li><div class="row" style="justify-content:space-between"><span><b>${n}</b> <span class="small muted">pericolo ${"●".repeat(pp)}${"○".repeat(5-pp)}</span></span><button class="btn ${q===n?"":"g"} s" data-a="qui" data-k="${esc(n)}">${q===n?"Sei qui":"Segna qui"}</button></div>${SERV[n]?`<div class="small muted">${esc(SERV[n])}</div>`:""}</li>`).join("")}</ul></section>${nascHtml()}</div></section>`;}


/* ===== creazione (percorso di vita) ===== */
const SPD={"Tiratore scelto":"colpo mirato da fermo, oltre i 100 m","Marcia forzata":"Resistenza nelle marce lunghe","Mitragliere":"fuoco di soppressione","Cacciatore":"seguire tracce e cacciare","Passo leggero":"muoversi in silenzio nel bosco","Macellaio":"prendere parti di mutanti intatte","Armaiolo":"riparare e pulire armi","Mani da meccanico":"motori, veicoli, generatori","Elettricista":"impianti, radio, elettronica","Chirurgo da campo":"ferite gravi e stabilizzare","Dosimetrista":"leggere radiazioni e contaminazione","Contrattare":"prezzi con mercanti e committenti","Ricettatore":"vendere roba che scotta","Faccia da poker":"mentire e bluffare","Mano del bullone":"passare un campo di anomalie col bullone","Naso per l'Emissione":"sentire i segnali dell'Emissione prima","Fiuto per gli artefatti":"trovare l'artefatto in un campo","Strada vecchia":"orientarsi su strade già fatte","Lingua del Bar":"trattare con stalker e fazioni del Bar","Pastore":"tenere calmi e in fila i clienti","Posti di blocco":"turni, mazzette e passaggi dei militari","Tattica di squadra":"comandare un gruppo nello scontro","Lettore di anomalie":"riconoscere un'anomalia e la sua ricarica"};
const CARR=[
 {k:"coscritto",n:"Coscritto",z:0,sk:["tiro","resistenza","corpo","armi_pesanti"],sp:["Tiratore scelto","Marcia forzata","Mitragliere"]},
 {k:"cacciatore",n:"Cacciatore di Polesia",z:0,sk:["sopravvivenza","ricognizione","tiro","mobilita"],sp:["Cacciatore","Passo leggero","Macellaio"]},
 {k:"meccanico",n:"Meccanico, operaio",z:0,sk:["tecnica","guida","resistenza"],sp:["Armaiolo","Mani da meccanico","Elettricista"]},
 {k:"infermiere",n:"Infermiere, soccorritore",z:0,sk:["pronto","persuasione","resistenza"],sp:["Chirurgo da campo","Dosimetrista"]},
 {k:"malavita",n:"Malavita, contrabbando",z:0,sk:["persuasione","corpo","guida","mobilita"],sp:["Contrattare","Ricettatore","Faccia da poker"]},
 {k:"cercatore",n:"Cercatore",z:1,sk:["ricognizione","sopravvivenza","mobilita","tecnica"],sp:["Mano del bullone","Naso per l'Emissione","Fiuto per gli artefatti"]},
 {k:"guida",n:"Guida",z:1,sk:["ricognizione","sopravvivenza","comando","persuasione"],sp:["Mano del bullone","Naso per l'Emissione","Strada vecchia","Lingua del Bar","Pastore","Cacciatore","Passo leggero"],req:"un termine già nella Zona, oppure Ricognizione D"},
 {k:"militare",n:"Militare del cordone",z:1,sk:["tiro","comando","guida","resistenza"],sp:["Posti di blocco","Tiratore scelto"]},
 {k:"gregario",n:"Gregario di una fazione",z:1,sk:["tiro","corpo","comando","persuasione"],sp:["Lingua del Bar","Tattica di squadra"],faz:1},
 {k:"assistente",n:"Assistente degli scienziati",z:1,sk:["tecnica","pronto","ricognizione"],sp:["Dosimetrista","Lettore di anomalie"],req:"Intelletto B"}];
const CARK=Object.fromEntries(CARR.map(c=>[c.k,c]));
const SCHEMI=[["BBCC","B-B-C-C"],["ACCC","A-C-C-C"],["ABCD","A-B-C-D"]];
const EVF=["Ferita o lutto: +1 Sangue freddo, e un nemico o un morto","Debito: −5.000 ₽, e qualcuno li rivuole","Un amico fidato","Impari un mestiere: +1 specializzazione","Lavoro pagato bene: +5.000 ₽","Ti distingui: +1 a un'abilità della carriera"];
const EVZ=["Un compagno muore: +1 Sangue freddo, un morto tra le Persone","Tradito: un nemico, −5.000 ₽","Un colpo buono: +10.000 ₽","Impari un mestiere: +1 specializzazione","Un amico nella Zona (fazione a scelta)","Hai visto una cosa che non dovevi: +1 Sangue freddo e un segreto (per il GM)"];
const FAZC=["Dovere","Libertà","Mercenari","Banditi"];
const CRDEF=()=>({nome:"Alexander",sopr:"Sokolov",orig:"",origSk:"",schema:"",att:{forza:"",agilita:"",intelletto:"",empatia:""},gio:["",""],n:4,t:[],sp:[],done:false});
let CR=null;
function crGet(){if(!CR){CR=deep(CRDEF(),LS.get("pda.cr")||{});}while(CR.t.length<5)CR.t.push({c:"",s:["",""],ev:null,x:{}});return CR;}
function crSave(r){LS.set("pda.cr",CR);if(r!==false)render();}
const SKORD=Object.values(SK).flat().map(x=>x[0]);
const skOpt=(list,cur)=>[["","—"],...list.map(k=>[k,SKN[k]])];
const nascita=n=>2012-19-3*n;
const termY=(n,i)=>nascita(n)+19+3*i;

function crCalc(){const c=crGet(),n=Math.max(2,Math.min(5,+c.n||4));const err=[],warn=[];const sk={};let sf="D",rub=40000;const pers=[],storia=[],specOpts=new Set();let mest=0;
  const bump=(k,src)=>{if(!k){err.push(`Manca un'abilità: ${src}.`);return;}if(!sk[k]){sk[k]="D";return;}if(sk[k]==="B"||sk[k]==="A"){err.push(`${SKN[k]} è già a B (${src}): il gradino andrebbe perso, scegline un'altra.`);return;}sk[k]=UP[sk[k]];};
  if(!c.nome)err.push("Manca il nome.");
  if(!c.orig)err.push("Manca l'origine.");
  bump(c.origSk,"origine");
  const sch=SCHEMI.find(s=>s[0]===c.schema);const att={...c.att};
  if(!sch)err.push("Scegli uno schema di caratteristiche.");else{const got=ATTR.map(([k])=>att[k]||"").sort().join("");if(got!==sch[0].split("").sort().join(""))err.push(`Le caratteristiche non tornano con lo schema ${sch[1]}.`);}
  c.gio.forEach((k,i)=>bump(k,`giovinezza ${i+1}`));
  if(c.gio[0]&&c.gio[0]===c.gio[1])warn.push("Giovinezza: stessa abilità due volte (vale come +2 gradini).");
  let zona=0,guida=false;
  for(let i=0;i<n;i++){const t=c.t[i],y=termY(n,i),car=CARK[t.c];const lab=`termine ${i+1} (${y}–${y+3})`;
    if(!car){err.push(`Scegli la carriera del ${lab}.`);continue;}
    if(car.z&&y<2006){err.push(`${lab}: la Zona nasce nel 2006, ${car.n} non si può fare prima.`);}
    if(car.k==="guida"&&!(zona>0||sk.ricognizione))err.push(`${lab}: per fare la Guida serve ${car.req}.`);
    if(car.k==="assistente"&&!["A","B"].includes(att.intelletto))err.push(`${lab}: per l'Assistente degli scienziati serve Intelletto B.`);
    if(t.s[0]&&t.s[0]===t.s[1])err.push(`${lab}: due abilità diverse.`);
    t.s.forEach(k=>{if(k&&!car.sk.includes(k))err.push(`${lab}: ${SKN[k]} non è un'abilità di ${car.n}.`);bump(k,lab);});
    car.sp.forEach(s=>specOpts.add(s));
    if(car.k==="guida")guida=true;
    let evTxt="";
    if(!t.ev)err.push(`${lab}: tira l'evento.`);
    else{const tab=t.ev.z?EVZ:EVF,r=t.ev.r,x=t.x||{};evTxt=tab[r-1];
      if(!t.ev.z){
        if(r===1){sf=UP[sf]==="A"?"B":UP[sf];pers.push({nome:x.nome,tipo:x.tipo||"nemico",nota:`${x.tipo==="morto"?"Morto":"Nemico"} dagli anni di ${car.n} (${y}–${y+3}).`});}
        if(r===2){rub-=5000;pers.push({nome:x.nome,tipo:"nemico",nota:`Creditore: gli devi 5.000 ₽ dal ${y}–${y+3} (${car.n}).`});}
        if(r===3)pers.push({nome:x.nome,tipo:"amico",nota:`Amico fidato dagli anni di ${car.n} (${y}–${y+3}).`});
        if(r===4)mest++;
        if(r===5)rub+=5000;
        if(r===6){if(x.skill&&!car.sk.includes(x.skill))err.push(`${lab}: l'abilità in più deve essere di ${car.n}.`);bump(x.skill,`${lab}, evento`);if(x.skill)evTxt+=`: ${SKN[x.skill]}`;}
      }else{
        if(r===1){sf=UP[sf]==="A"?"B":UP[sf];pers.push({nome:x.nome,tipo:"morto",nota:`Compagno morto nella Zona (${y}–${y+3}).`});}
        if(r===2){rub-=5000;pers.push({nome:x.nome,tipo:"nemico",nota:`Ti ha tradito e derubato nella Zona (${y}–${y+3}).`});}
        if(r===3)rub+=10000;
        if(r===4)mest++;
        if(r===5)pers.push({nome:x.nome,tipo:"amico",fazione:x.faz||"Stalker liberi",nota:`Amico nella Zona (${y}–${y+3}).`});
        if(r===6){sf=UP[sf]==="A"?"B":UP[sf];if(x.seg)evTxt+=`: ${x.seg}`;}
      }}
    if(car.z){zona++;rub+=10000;}
    storia.push(`${y}–${y+3} · ${car.n}${car.faz&&t.x.cf?` (${t.x.cf})`:""} · +${t.s.filter(Boolean).map(k=>SKN[k]).join(", +")}${evTxt?` · ${evTxt}`:""}`);
  }
  pers.forEach(p=>{if(!p.nome)err.push("Dai un nome a tutte le persone degli eventi.");});
  const nsp=1+mest;const sp=c.sp.slice(0,nsp);
  if(sp.filter(Boolean).length<nsp)err.push(`Scegli ${nsp} specializzazion${nsp>1?"i":"e"}.`);
  if(new Set(sp.filter(Boolean)).size<sp.filter(Boolean).length)err.push("Specializzazioni ripetute.");
  sp.forEach(s=>{if(s&&!specOpts.has(s))err.push(`${s} non viene dalle tue carriere.`);});
  return {n,att,sf,sk,rub,pers,storia,sp,nsp,specOpts:[...specOpts],err:[...new Set(err)],warn,eta:19+3*n,nato:nascita(n),zona};}

function crEvento(i){const c=crGet(),t=c.t[i],car=CARK[t.c];if(!car||t.ev)return;const r=d(6);t.ev={r,z:car.z};const tab=car.z?EVZ:EVF;
  t.x={...(t.x||{}),nome:[1,2,3].includes(r)&&!car.z||[1,2,5].includes(r)&&car.z?`${pk(NOMI)} «${pk(SOPR)}»`:""};
  soloPush(`Creazione · evento del termine ${i+1}`,[`${car.n}, tabella «${car.z?"Zona":"fuori Zona"}», d6 = ${r}: <b>${esc(tab[r-1])}</b>`]);crSave(false);}

function crConferma(){const R=crCalc(),c=crGet();if(R.err.length)return;
  const sk={};SKORD.forEach(k=>{if(R.sk[k])sk[k]=R.sk[k];});
  S.pg={nome:c.nome,sopr:c.sopr,chi:`${c.orig}. ${R.eta} anni, nato nel ${R.nato}. Guida.`,att:R.att,sf:R.sf,sk,spec:R.sp.join("\n"),note:`Percorso di vita:\n${R.storia.join("\n")}`};
  S.tr={ferite:0,fatica:0,nervi:0,freddo:0,fame:0,sete:0,rad:0};S.pe=0;S.fortuna=true;S.rubli=R.rub;S.nomeRep=0;S.rap=Object.fromEntries(FAZ.map(f=>[f,0]));
  S.clock={...S.clock,data:"2012-10-15",ora:"07:30",luogo:"Cordone"};S.emiss=0;S.allerta=0;S.tensione=5;S.lastBuy=null;save();
  R.pers.forEach(p=>add("png",{nome:p.nome,fazione:p.fazione||(p.tipo==="amico"?"amico":p.tipo==="nemico"?"nemico":""),fiducia:p.tipo==="amico"?1:p.tipo==="nemico"?-2:0,stato:p.tipo==="morto"?"morto":"vivo",nota:p.nota}));
  add("diario",{testo:`Creazione di ${c.nome} «${c.sopr}». ${c.orig}, ${R.eta} anni.\n${R.storia.join("\n")}\nRubli di partenza: ${fmtR(R.rub)}.`,data:"2012-10-15",ora:"07:30",luogo:"Cordone"});
  c.done=true;ui.crSure=false;crSave(false);toast("Scheda scritta. Ora l'Armeria.");location.hash="scheda";}

function vCrea(){const c=crGet(),R=crCalc(),n=R.n;const s=(f,opts,cur,dis)=>`<select data-cr="${f}" ${dis?"disabled":""}>${opts.map(([v,t])=>`<option value="${esc(v)}" ${String(cur)===String(v)?"selected":""}>${esc(t)}</option>`).join("")}</select>`;
  const ti=(f,v,ph="")=>`<input data-cr="${f}" value="${esc(v)}" placeholder="${esc(ph)}">`;
  const letters=c.schema?c.schema.split(""):["A","B","C","D"];
  const terms=Array.from({length:n},(_,i)=>{const t=c.t[i],y=termY(n,i),car=CARK[t.c];const ok=CARR.filter(k=>!k.z||y>=2006);
    let ev="";if(t.ev){const r=t.ev.r,z=t.ev.z,tab=z?EVZ:EVF;ev=`<div class="res"><b>d6 = ${r}</b> · ${esc(tab[r-1])}`;
      const needNome=(!z&&[1,2,3].includes(r))||(z&&[1,2,5].includes(r));
      if(!z&&r===1)ev+=`<div class="row" style="margin-top:4px">${s(`t.${i}.x.tipo`,[["nemico","un nemico"],["morto","un morto"]],t.x.tipo||"nemico")}</div>`;
      if(needNome)ev+=`<label class="f" style="margin-top:4px"><span class="lbl">Chi</span>${ti(`t.${i}.x.nome`,t.x.nome||"")}</label>`;
      if(z&&r===5)ev+=`<label class="f"><span class="lbl">Fazione</span>${s(`t.${i}.x.faz`,["Stalker liberi","Dovere","Libertà","Scienziati","Mercenari","Esercito"].map(f=>[f,f]),t.x.faz||"Stalker liberi")}</label>`;
      if(!z&&r===6)ev+=`<label class="f" style="margin-top:4px"><span class="lbl">Abilità in più</span>${s(`t.${i}.x.skill`,skOpt(car?car.sk:[]),t.x.skill||"")}</label>`;
      if(z&&r===6)ev+=`<label class="f" style="margin-top:4px"><span class="lbl">Cosa hai visto (facoltativo, se no lo decide il GM)</span>${ti(`t.${i}.x.seg`,t.x.seg||"")}</label>`;
      ev+=`</div>`;}
    return `<li><div class="row" style="justify-content:space-between"><b>Termine ${i+1}</b><span class="small muted num">${y}–${y+3} · ${19+3*i}–${22+3*i} anni${y>=2006?" · può essere nella Zona":""}</span></div>
      <div class="row" style="gap:6px;margin-top:4px"><label class="f" style="flex:1 1 14em"><span class="lbl">Carriera</span>${s(`t.${i}.c`,[["","—"],...ok.map(k=>[k.k,`${k.n}${k.z?" (Zona)":""}`])],t.c,!!t.ev)}</label>
      ${car&&car.faz?`<label class="f" style="flex:1 1 8em"><span class="lbl">Fazione</span>${s(`t.${i}.x.cf`,[["","—"],...FAZC.map(f=>[f,f])],t.x.cf||"")}</label>`:""}</div>
      ${car?`<div class="small muted">${car.req?`Requisito: ${esc(car.req)}. `:""}Specializzazioni: ${car.sp.map(esc).join(" · ")}</div>
      <div class="row" style="gap:6px;margin-top:4px">${[0,1].map(j=>`<label class="f" style="flex:1 1 40%"><span class="lbl">+1 gradino</span>${s(`t.${i}.s.${j}`,skOpt(car.sk),t.s[j])}</label>`).join("")}</div>
      ${t.ev?ev:`<button class="btn g s" data-a="crev" data-k="${i}" style="margin-top:6px">Tira l'evento (${car.z?"Zona":"fuori Zona"})</button>`}`:""}</li>`;}).join("");
  const sheet=`${ATTR.map(([k,nm])=>`<div><b>${nm} ${esc(R.att[k]||"—")}</b> <span class="small muted">${SK[k].filter(([sk])=>R.sk[sk]).map(([sk,sn])=>`${sn} ${R.sk[sk]}`).join(" · ")||"—"}</span></div>`).join("")}<div><b>Sangue freddo ${R.sf}</b></div>`;
  return `<div class="grid">
  ${c.done?`<section class="pane" style="grid-column:1/-1"><p><b>Creazione già confermata.</b> La scheda è scritta. Se rifai tutto, la conferma sovrascrive di nuovo la scheda e aggiunge persone al registro.</p><button class="btn g s" data-a="crreset">Ricomincia da capo</button></section>`:""}
  <section class="pane"><h2>1 · Chi sei</h2>
    <div class="grid" style="gap:8px"><label class="f"><span class="lbl">Nome</span>${ti("nome",c.nome)}</label><label class="f"><span class="lbl">Soprannome</span>${ti("sopr",c.sopr)}</label></div>
    <label class="f" style="margin-top:8px"><span class="lbl">Origine</span>${ti("orig",c.orig,"es. sfollato di Pripjat', russo di Brjansk…")}</label>
    <label class="f" style="margin-top:8px"><span class="lbl">Abilità dell'origine (a D)</span>${s("origSk",skOpt(SKORD),c.origSk)}</label>
    <h2 style="margin-top:14px">2 · Caratteristiche</h2>
    <div class="row">${SCHEMI.map(([k,t])=>`<button class="chip" data-a="crsch" data-k="${k}" aria-pressed="${c.schema===k}">${t}</button>`).join("")}</div>
    <div class="grid" style="gap:8px;grid-template-columns:repeat(2,minmax(0,1fr));margin-top:8px">${ATTR.map(([k,nm])=>`<label class="f"><span class="lbl">${nm}</span>${s(`att.${k}`,[["","—"],...[...new Set(letters)].map(g=>[g,`${g} · d${DIE[g]}`])],c.att[k])}</label>`).join("")}</div>
    <p class="small muted">Sangue freddo parte da D.</p>
    <h2 style="margin-top:14px">3 · Giovinezza</h2>
    <div class="row" style="gap:6px">${[0,1].map(j=>`<label class="f" style="flex:1 1 40%"><span class="lbl">Abilità ${j+1} (D, o +1 gradino)</span>${s(`gio.${j}`,skOpt(SKORD),c.gio[j])}</label>`).join("")}</div></section>
  <section class="pane"><h2>4 · Termini di 3 anni</h2>
    <div class="row"><span class="lbl" style="margin:0">Quanti</span>${[2,3,4,5].map(k=>`<button class="chip" data-a="crn" data-k="${k}" aria-pressed="${n===k}">${k}</button>`).join("")}<span class="small muted">→ ${R.eta} anni, nato nel ${R.nato}</span></div>
    <p class="small muted">Si parte a 19 anni. La Zona c'è dal 2006: solo i termini da lì in poi possono essere nella Zona (+10.000 ₽ l'uno). Al massimo B in un'abilità.</p>
    <ul class="items">${terms}</ul></section>
  <section class="pane"><h2>5 · Specializzazioni</h2>
    <p class="small muted">${R.nsp} da scegliere (1${R.nsp>1?` + ${R.nsp-1} per «impari un mestiere»`:""}), tra quelle delle tue carriere.</p>
    ${Array.from({length:R.nsp},(_,j)=>`<label class="f" style="margin-top:6px"><span class="lbl">Specializzazione ${j+1}</span>${s(`sp.${j}`,[["","—"],...R.specOpts.map(x=>[x,`${x}${SPD[x]?` — ${SPD[x]}`:""}`])],c.sp[j]||"")}</label>`).join("")}
    <h2 style="margin-top:14px">6 · Riepilogo</h2>
    <div class="res">${sheet}<div style="margin-top:6px">Rubli di partenza: <b class="num">${fmtR(R.rub)}</b> <span class="small muted">(40.000 + ${R.zona} × 10.000 + eventi)</span></div>
      ${R.pers.length?`<div class="small" style="margin-top:6px">Persone: ${R.pers.map(p=>`${esc(p.nome||"?")} (${p.tipo})`).join(" · ")}</div>`:""}
      ${R.storia.length?`<div class="small muted" style="margin-top:6px;white-space:pre-wrap">${esc(R.storia.join("\n"))}</div>`:""}</div>
    ${R.warn.map(w=>`<p class="small">${esc(w)}</p>`).join("")}
    ${R.err.length?`<ul class="small warn" style="padding-left:1.2em">${R.err.map(e=>`<li>${esc(e)}</li>`).join("")}</ul>`:`<p class="small">Tutto in regola.</p>`}
    <button class="btn" data-a="crok" ${R.err.length?"disabled":""} style="width:100%;margin-top:6px">${ui.crSure?"Sicuro? Sovrascrive scheda, tracce, rubli e data":"Conferma e scrivi la scheda"}</button></section></div>`;}

function crSet(path,val){const c=crGet();const p=path.split(".");let o=c;p.slice(0,-1).forEach(k=>{o=o[k]=o[k]&&typeof o[k]==="object"?o[k]:(/^\d+$/.test(k)?{}:{});});o[p.at(-1)]=val;ui.crSure=false;}
document.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b||b.disabled)return;const a=b.dataset.a,k=b.dataset.k;const c=crGet();
  if(a==="crsch"){c.schema=k;c.att={forza:"",agilita:"",intelletto:"",empatia:""};crSave();}
  else if(a==="crn"){if(c.t.some(t=>t.ev)&&+k!==+c.n){toast("Hai già tirato degli eventi: per cambiare i termini ricomincia da capo.");return;}c.n=+k;crSave();}
  else if(a==="crev")crEvento(+k);
  else if(a==="crreset"){CR=CRDEF();crSave();}
  else if(a==="crok"){if(!ui.crSure){ui.crSure=true;render();}else crConferma();}
});
document.addEventListener("change",e=>{const el=e.target;if(!el.dataset)return;
  if(el.dataset.llm!=null){const c=LLM.get();c[el.dataset.llm]=el.value;if(el.dataset.llm==="prov"&&!c.model)c.model=LLMP[el.value]?.def||"";LLM.set(c);render();}
  if(el.dataset.imp&&el.files&&el.files[0]){const r=new FileReader();r.onload=()=>{try{importAll(JSON.parse(r.result));}catch(err){toast("File non valido.");}};r.readAsText(el.files[0]);}
  if(el.dataset.nt!=null){ui.notte=ui.notte||{};ui.notte[el.dataset.nt]=el.type==="checkbox"?el.checked:el.dataset.nt==="ore"?+el.value:el.value;render();}
  if(el.dataset.am!=null){S.amb=S.amb||{};S.amb[el.dataset.am]=el.checked;save();}
  if(el.dataset.g!=null){const k=el.dataset.gk;let v=el.value;if(el.type==="number")v=+v||0;upd("png",el.dataset.g,{[k]:v});}
  if(el.dataset.h!=null){ui.hit=ui.hit||{D:2,P:2,ex:0,p:"",r:0};const k=el.dataset.h;ui.hit[k]=k==="p"?el.value:+el.value||0;if(k==="p")ui.hit.r=0;render();}
  if(el.dataset.mc!=null){const y=L.inv.find(z=>z.id===el.dataset.mc);if(y)setColpi(y,+el.value||0);}
  if(el.dataset.wa!=null){ui.wsel=ui.wsel||{};ui.wsel[el.dataset.wa]=el.value;}
  if(el.dataset.wm!=null)upd("inv",el.dataset.wm,{mun:el.value});});
document.addEventListener("change",e=>{const el=e.target;if(el.dataset&&el.dataset.av!=null&&el.files&&el.files[0]){const k=el.dataset.av;avFile(el.files[0],url=>{if(k==="pg"){S.pg.av=url;save();}else upd("png",k,{av:url});toast("Foto salvata.");});}});
let pqT;document.addEventListener("input",e=>{const el=e.target;if(el.dataset&&el.dataset.dr==="pq"){ui.pq=el.value;clearTimeout(pqT);pqT=setTimeout(()=>{const pos=el.selectionStart;render();const n=document.querySelector('[data-dr="pq"]');if(n){n.focus();try{n.setSelectionRange(pos,pos);}catch(_){}}},250);}});
document.addEventListener("input",e=>{const el=e.target;if(el.dataset.cr!=null&&el.tagName==="INPUT"){crSet(el.dataset.cr,el.value);crSave(false);}});
document.addEventListener("change",e=>{const el=e.target;if(el.dataset.cr!=null){crSet(el.dataset.cr,el.value);crSave();}});

const SUBH={armeria:["zaino","zsub"],oracolo:["storie","ssub"]};
function subBar(k,o){const c=ui[k]||o[0][0];return `<div class="chips subbar">${o.map(([v,n])=>`<button class="chip" data-a="sub" data-k="${k}" data-v="${v}" aria-pressed="${c===v}">${n}</button>`).join("")}</div>`;}
function hashTab(h){if(h==="salute")return"scheda";if(SUBH[h]){ui[SUBH[h][1]]=h;return SUBH[h][0];}return h||"scheda";}
const V={scheda:()=>vScheda()+`<div id="salute" class="sezsal"><h2 class="seztit">Salute</h2></div>`+vSalute(),dadi:()=>subBar("dsub",[["dadi","Dadi"],["scontro","Scontro"+(S.scontro?" ●":"")]])+(ui.dsub==="scontro"?vScontro():vDadi()),salute:vSalute,gruppo:vGruppo,storie:()=>subBar("ssub",[["storie","Storie"],["oracolo","Oracolo"]])+(ui.ssub==="oracolo"?vOracolo():vStorie()),sistema:vSistema,zaino:()=>subBar("zsub",[["zaino","Zaino"],["armeria","Compra · Armeria"]])+(ui.zsub==="armeria"?vArmeria():vZaino()),armeria:vArmeria,pda:vPda,oracolo:vOracolo,registro:vRegistro,mappa:vMappa,crea:vCrea};
function render(){try{effTick();}catch(_){}try{watch();}catch(_){}document.documentElement.dataset.em=String(Math.min(6,+S.emiss||0));
  if(!V[ui.tab])ui.tab="scheda";
  const unread=L.pda.filter(j=>j.tipo==="lavoro"&&(j.stato||"offerto")==="offerto").length;
  document.documentElement.classList.toggle("big",!!LS.get("pda.big"));try{jobWatch();}catch(_){}
  document.getElementById("keys").innerHTML=tabsVis().map(([k,n])=>`<button data-tab="${k}" aria-current="${ui.tab===k}">${n}${k==="pda"&&unread?`<b>${unread}</b>`:""}</button>`).join("");
  const lu=LUCE[month()];const c=S.clock;
  document.getElementById("bar").innerHTML=`<span>${esc(c.luogo||"—")}</span><span class="tm num">${esc(c.ora||"")}</span><span class="num">${esc(dataIt(c.data))}</span><span class="muted">${esc(c.meteo||STAG(month()))}</span><span class="muted small">alba ${lu[0]} · buio ${lu[1]} · ${lu[2]}/${lu[3]} °C</span><span class="sp"></span>
    <span class="row" style="gap:4px"><button class="btn g s" data-a="adv" data-v="15">+15′</button><button class="btn g s" data-a="adv" data-v="60">+1 h</button><button class="btn g s" data-a="adv" data-v="1440">+1 g</button></span><b class="num">${fmtR(S.rubli)}</b><button class="btn g s" data-a="snd" title="suoni del PDA">${SND.on?"suono sì":"suono no"}</button>${stripHtml()}`;
  const ae=document.activeElement;const keep=ae&&(ae.dataset.f||ae.dataset.dr||ae.dataset.u)?{f:ae.dataset.f,dr:ae.dataset.dr,u:ae.dataset.u,k:ae.dataset.k,s:ae.selectionStart}:null;
  document.getElementById("view").innerHTML=conn==="loading"?`<p class="empty">Accensione…</p>`:dayBanner()+scBanner()+(typeof evBox==="function"?evBox():"")+V[ui.tab]();
  if(keep){const q=keep.f?`[data-f="${keep.f}"]`:keep.dr?`[data-dr="${keep.dr}"]`:`[data-u="${keep.u}"][data-k="${keep.k}"]`;const el=document.querySelector(q);if(el&&el!==document.body){el.focus();try{if(keep.s!=null&&el.setSelectionRange)el.setSelectionRange(keep.s,keep.s);}catch(e){}}}
  document.querySelector(".screen").classList.toggle("map",ui.tab==="mappa");
  if(ui.tab==="mappa"){const slot=document.getElementById("mapslot");const put=()=>{if(window.Map3D&&slot&&slot.isConnected){slot.appendChild(window.Map3D.el);window.Map3D.setQui(S.clock.luogo);try{window.Map3D.setMarks&&window.Map3D.setMarks(mapMarks());}catch(_){}window.Map3D.wake&&window.Map3D.wake();}};
    if(window.Map3D)put();else if(!window._m3d){window._m3d=1;const sc=document.createElement("script");sc.src="mappa.js";sc.onload=()=>render();document.head.appendChild(sc);}}
  const net=document.getElementById("led-net");net.className="led "+(conn==="on"?"on":conn==="off"?"red":"blink on");
  const em=+S.emiss||0;document.getElementById("led-em").className="led "+(em>=5?"red blink":em>=3?"red":"");
}

/* ===== eventi ===== */
document.addEventListener("click",e=>{
  const tb=e.target.closest("[data-tab]");if(tb){sfx("key");location.hash=tb.dataset.tab;return;}
  if(e.target.closest("[data-a]"))sfx("key");
  const b=e.target.closest("[data-a]");if(!b||b.disabled)return;const a=b.dataset.a,k=b.dataset.k,v=+b.dataset.v;if(UNDO[a])snap(UNDO[a]);if(ui.upArm&&a!=="up"&&a!=="upspec")ui.upArm=null;else if(ui.upArm&&a==="up"&&ui.upArm!==k)ui.upArm=null;
  switch(a){
    case"tr":S.tr[k]=(+S.tr[k]===v?v-1:v);save();break;
    case"clk":S[k]=(+S[k]===v?v-1:v);save();break;
    case"fort":S.fortuna=!S.fortuna;save();break;
    case"undo":undoLast();break;
    case"evc":evChoose(+k);break;
    case"evx":ui.ev=null;render();break;
    case"evgo":{const e=evPick({});if(e)evShow(e);else toast("Per ora non succede niente.");render();break;}
    case"evauto":evS().auto=k;save();break;
    case"csend":chatSend(k);break;
    case"cend":chatEnd(k);break;
    case"parla":ui.chatWith=ui.chatWith===k?null:k;render();break;
    case"llmls":{ui.llmMsg="…";render();llmModels().then(l=>{ui.llmList=l;ui.llmMsg=`${l.length} modelli: scegline uno dal campo «Modello».`;render();},e=>{ui.llmMsg="Errore: "+e.message;render();});break;}
    case"llmtest":{ui.llmMsg="…";render();llmCall("Rispondi solo: «ricevuto, stalker».",[{r:"io",t:"prova"}],30).then(t=>{ui.llmMsg="Funziona: "+t;render();},e=>{ui.llmMsg="Errore: "+e.message;render();});break;}
    case"exfile":{const ok=dlFile(`pda-zona-${S.clock.data}-${(S.clock.ora||"").replace(":","")}.json`,backupTxt());if(!ok||db){ui.bk=true;location.hash="scheda";toast("Qui i file non si scaricano: copia dalla Scheda.");}break;}
    case"impTxt":{try{const o=JSON.parse(ui.impTxt||document.querySelector('[data-dr="impTxt"]').value);importAll(o);ui.impTxt="";}catch(e){toast("Testo non valido: "+e.message);}break;}
    case"sub":ui[k]=b.dataset.v;render();window.scrollTo({top:0});break;
    case"newgame":if(!ui.ngSure){ui.ngSure=true;render();}else{ui.ngSure=false;importAll({stato:clone(DEF)});location.hash="crea";}break;
    case"big":LS.set("pda.big",!LS.get("pda.big"));render();break;
    case"dayeat":{const n=+S.giorni||0;S.giorni=0;eatDay(n||1,true);break;}
    case"dayno":{const n=+S.giorni||0;S.giorni=0;trAdd({fame:n,sete:2*n});save();toast(`Fame +${n}, Sete +${2*n}.`);break;}
    case"daylater":ui.dayLater=true;render();break;
    case"zmove":upd("inv",k,{dove:b.dataset.v});break;
    case"qroll":{const [qa,qs]=k.split("|");ui.dr.a=qa;ui.dr.s=qs;if(qs!=="tiro")ui.dr.m=0;const rb=document.querySelector('[data-a="roll"]');doRoll();break;}
    case"cf":ui.cf=k;render();break;
    case"rv":ui.rv=k;render();break;
    case"backup":{ui.bk=true;render();try{navigator.clipboard.writeText(backupTxt()).then(()=>toast("Copiato: incollalo dove vuoi."),()=>toast("Copia a mano dal riquadro."));}catch(_){toast("Copia a mano dal riquadro.");}break;}
    case"snd":SND.on=!SND.on;LS.set("pda.snd",SND.on);if(SND.on){actx();sfx("beep");}render();break;
    case"notte":notte(ui.notte||{dove:"fuori",ore:8});break;
    case"sell":ui.sell=k;ui.sellPct=40;ui.sellRoll="";render();window.scrollTo({top:0});break;
    case"sellx":ui.sell=null;render();break;
    case"sellroll":{const spec=/Contrattare/.test(S.pg.spec||"");const g=grades("empatia","persuasione",spec?1:0);const v=[d(DIE[g[0]]),g[1]?d(DIE[g[1]]):0];const sc=succ(v[0])+(g[1]?succ(v[1]):0);ui.sellPct=sc>=2?50:sc===1?40:30;ui.sellRoll=`trattato (Empatia ${g[0]} + Persuasione ${g[1]||"—"}${spec?", Contrattare":""}: ${v.filter(Boolean).join(", ")} = ${sc}) → ${ui.sellPct}%`;add("tiri",{testo:"Contrattare la vendita: "+ui.sellRoll,succ:sc,data:S.clock.data,ora:S.clock.ora});sfx("dice");render();break;}
    case"sellok":{const y=L.inv.find(z=>z.id===ui.sell);if(!y)break;const p=sellPrice(y,ui.sellPct||40);if(!p)break;S.rubli=(+S.rubli||0)+p;if(!ammoOf(y)&&(+y.qta||1)>1)upd("inv",y.id,{qta:(+y.qta)-1});else del("inv",y.id);soloPush("Vendita",[esc(`${y.nome} a ${MERC[S.clock.luogo]}: ${fmtR(p)}.`)]);ui.sell=null;sfx("cash");save();break;}
    case"rcan":ui.can=k;render();break;
    case"rlisten":radioAscolta();break;
    case"rpile":{const R=L.inv.find(y=>mine2(y)&&armOf(y.nome)?.n==="Ricevitore radio");const P=have("Pile");if(R&&P){useItem(P);upd("inv",R.id,{carica:10});toast("Pile nuove.");}break;}
    case"artbelt":{const y=L.inv.find(z=>z.id===k);if(y)upd("inv",k,{dove:y.dove==="cintura"?"zaino":"cintura"});break;}
    case"artuse":{const y=L.inv.find(z=>z.id===k);const a=y&&artOf(y);if(!a)break;S.artUso=S.artUso||{};S.artUso[a[0]]=S.clock.data;if(/Fatica/.test(a[3]))trAdd({fatica:-1});if(/Nervi/.test(a[3]))trAdd({nervi:-1});sfx("heal");save();break;}
    case"nadd":{const n=(ui.nnome||"").trim()||"Nascondiglio";S.nasc=(S.nasc||[]).concat({id:uid(),nome:n,zona:S.clock.luogo,ultimo:S.clock.data});ui.nnome="";save();break;}
    case"nlascia":{const sel=document.querySelector(`[data-ni="${k}"]`);if(sel&&sel.value){upd("inv",sel.value,{dove:"nasc:"+k});const n=(S.nasc||[]).find(z=>z.id===k);if(n){n.ultimo=S.clock.data;save();}}break;}
    case"nprendi":upd("inv",k,{dove:"zaino"});break;
    case"ncheck":{const n=(S.nasc||[]).find(z=>z.id===k);if(!n)break;const per=ZONE.find(z=>z[0]===n.zona)?.[1]||1;const r=d(6);const ok=r>=per;n.ultimo=S.clock.data;save();const t=`${n.nome}: d6 = ${r} (pericolo ${per}) → ${ok?"tutto com'era":"qualcuno ci ha messo le mani: il GM dice cosa resta"}.`;soloPush("Nascondiglio",[esc(t)]);toast(t);break;}
    case"ndel":{L.inv.filter(y=>y.dove==="nasc:"+k).forEach(y=>upd("inv",y.id,{dove:"deposito"}));S.nasc=(S.nasc||[]).filter(z=>z.id!==k);save();break;}
    case"gjoin":{const id=k||(document.querySelector('[data-dr="gsel"]')||{}).value;if(id)upd("png",id,{con:true,luogo:S.clock.luogo});break;}
    case"ghere":{const id=(document.querySelector('[data-dr="gsel"]')||{}).value;if(id){upd("png",id,{luogo:S.clock.luogo});toast("Segnato qui.");}break;}
    case"gleave":upd("png",k,{con:false,luogo:S.clock.luogo});break;
    case"gset":{const [f,val]=b.dataset.v.split(":");upd("png",k,{[f]:+val,...(f==="fer"&&+val>=4?{stato:"morto",con:false}:f==="fer"&&+val>0?{stato:"ferito"}:f==="fer"?{stato:"vivo"}:{})});break;}
    case"groll":{const p=L.png.find(x=>x.id===k);if(p)gRoll(p,"dado");break;}
    case"gmor":{const p=L.png.find(x=>x.id===k);if(p)gRoll(p,"morale");break;}
    case"gpanic":{const p=L.png.find(x=>x.id===k);if(p){const r=pk(["scappa","scappa","si blocca","si blocca","spara a caso","spara a caso"]);soloPush("Panico",[esc(`${p.nome}: ${r}.`)]);toast(`${p.nome}: ${r}.`);}break;}
    case"gpau":gruppo().filter(p=>ruolo(p)==="cliente").forEach(p=>upd("png",p.id,{paura:Math.max(0,Math.min(5,gPau(p)+v))}));break;
    case"geat":{const n=gruppo().length;if((+S.scorte.cibo||0)<n){toast(`Servono ${n} unità di cibo.`);break;}S.scorte.cibo-=n;save();toast(`Il gruppo ha mangiato: −${n} cibo.`);break;}
    case"gpay":{const t=gruppo().filter(p=>ruolo(p)==="compagno").reduce((a,p)=>a+(+String(gPaga(p)).replace(/\./g,"")||0),0);if(t>(+S.rubli||0)){toast(`Servono ${fmtR(t)}.`);break;}S.rubli-=t;save();soloPush("Gruppo",[esc(`Pagata la giornata: ${fmtR(t)}.`)]);break;}
    case"ggive":{const sel=document.querySelector(`[data-gi="${k}"]`);if(sel&&sel.value)upd("inv",sel.value,{dove:"png:"+k});break;}
    case"gback":upd("inv",k,{dove:"zaino"});break;
    case"cpart":ui.cpart=k;render();break;
    case"hroll":{const r=hitRoll();ui.hit={...(ui.hit||{D:2,P:2,ex:0}),...r};render();break;}
    case"happly":if(ui.hit&&ui.hit.p)hitApply(ui.hit);break;
    case"cure":{const w=(S.corpo||[]).find(z=>z.id===k),it=L.inv.find(z=>z.id===b.dataset.v);if(w&&it)cureApply(w,it);break;}
    case"drug":{const it=L.inv.find(z=>z.id===k);if(it)drugApply(it);break;}
    case"wheal":{const w=(S.corpo||[]).find(z=>z.id===k);if(!w)break;if(w.d>0){w.d--;trAdd({ferite:-1});}if(w.d<=0&&!w.sang&&!w.morente&&!(w.rotto&&!w.stecca))S.corpo=S.corpo.filter(z=>z.id!==k);save();break;}
    case"wdel":S.corpo=(S.corpo||[]).filter(z=>z.id!==k);save();break;
    case"eqon":{ui.dr.on=ui.dr.on||{};ui.dr.on[k]=!ui.dr.on[k];render();break;}
    case"wcar":{const x=L.inv.find(y=>y.id===k);if(!x)break;const w=armOf(x.nome);const cap=capOf(w,x)||999;upd("inv",k,{car:Math.max(0,Math.min(cap,carOf(x)+v))});break;}
    case"wric":{const x=L.inv.find(y=>y.id===k);if(!x)break;const w=armOf(x.nome);const cap=capOf(w,x),car=carOf(x);const sel=document.querySelector(`[data-wm="${k}"]`);const name=sel?sel.value:x.mun;
      const got=takeAmmo(wCal(w),name,cap-car);sfx("mag");upd("inv",k,{car:car+got,mun:name});toast(got?`Ricaricato: +${got} ${name}.`:"Niente da caricare.");break;}
    case"wmount":{const x=L.inv.find(y=>y.id===k);if(!x)break;const w=armOf(x.nome);const sel=document.querySelector(`[data-wa="${k}"]`);const n=sel&&sel.value;const a=ARM.find(y=>y.n===n);if(!a)break;
      let acc=(x.acc||[]).slice();const grp=ACCG(n);const old=acc.filter(m=>ACCG(m)===grp&&grp!==m);
      const used=acc.filter(m=>!old.includes(m)).reduce((t,m)=>t+ACC0(m),0)+ACC0(n);if(used>modMax(w)){toast(`Slot di modifica pieni (${modMax(w)}): smonta qualcosa prima.`);break;}
      const own=L.inv.find(y=>y.id!==k&&mine(y)&&armOf(y.nome)?.n===n&&y.dove!=="deposito");
      if(own){if((+own.qta||1)>1)upd("inv",own.id,{qta:(+own.qta)-1});else del("inv",own.id);}
      else{if(a.p>(+S.rubli||0)){toast(`Servono ${fmtR(a.p)}.`);break;}S.rubli=(+S.rubli||0)-a.p;save();}
      old.forEach(m=>{const e=ARM.find(y=>y.n===m);add("inv",{nome:m,qta:1,slot:e?e.slot:0.25,dove:"zaino",stato:"ok",nota:e?e.s:"",tipo:"altro"});});
      acc=acc.filter(m=>!old.includes(m));acc.push(n);upd("inv",k,{acc,slot:wSlot(w,acc)});toast(`${n} montato${own?" (dallo zaino)":` (−${fmtR(a.p)})`}.`);break;}
    case"wun":{const x=L.inv.find(y=>y.id===k);if(!x)break;const w=armOf(x.nome);const n=b.dataset.v;const acc=(x.acc||[]).filter(m=>m!==n);const e=ARM.find(y=>y.n===n);
      add("inv",{nome:n,qta:1,slot:e?e.slot:0.25,dove:"zaino",stato:"ok",nota:e?e.s:"",tipo:"altro"});upd("inv",k,{acc,slot:wSlot(w,acc)});toast(`${n} nello zaino.`);break;}
    case"mcol":{const y=L.inv.find(z=>z.id===k);if(y)setColpi(y,colpiOf(y)+v);break;}
    case"icom":LS.set("pda.icone",k);render();break;
    case"avnew":if(k==="pg"){S.pg.avs=(+S.pg.avs||0)+1;S.pg.av="";save();}else{const q=L.png.find(x=>x.id===k);if(q)upd("png",k,{avs:(+q.avs||0)+1,av:""});}break;
    case"avdel":if(k==="pg"){S.pg.av="";save();}else upd("png",k,{av:""});break;
    case"up":{const u=upInfo(k);if(!u.next||(+S.pe||0)<u.cost)break;if(ui.upArm!==k){ui.upArm=k;render();break;}
      ui.upArm=null;const nm=k==="pg.sf"?"Sangue freddo":k.startsWith("pg.sk.")?SKN[k.slice(6)]:ATTR.find(x=>"pg.att."+x[0]===k)[1];
      const txt=`${nm} ${u.cur||"—"} → ${u.next} (−${u.cost} PE)`;ui.lastUp={k,old:u.cur,cost:u.cost,txt};
      S.pe=(+S.pe||0)-u.cost;set(k,u.next);add("diario",{testo:"Crescita: "+txt,data:S.clock.data,ora:S.clock.ora,luogo:S.clock.luogo});toast(txt);break;}
    case"upspec":{const inS=document.querySelector('[data-dr="newSpec"]');if(inS)ui.newSpec=inS.value;const t=(ui.newSpec||"").trim();if(!t){toast("Scrivi prima la specializzazione.");break;}if((+S.pe||0)<3)break;if(ui.upArm!=="spec"){ui.upArm="spec";render();break;}
      ui.upArm=null;const oldSpec=S.pg.spec||"";const txt=`specializzazione «${t}» (−3 PE)`;ui.lastUp={k:"pg.spec",old:oldSpec,cost:3,txt};ui.newSpec="";
      S.pe=(+S.pe||0)-3;set("pg.spec",(oldSpec.trim()?oldSpec.trim()+"\n":"")+t);add("diario",{testo:"Crescita: "+txt,data:S.clock.data,ora:S.clock.ora,luogo:S.clock.luogo});toast(txt);break;}
    case"upundo":{const L0=ui.lastUp;if(!L0)break;ui.lastUp=null;S.pe=(+S.pe||0)+L0.cost;set(L0.k,L0.old);toast("Annullato: "+L0.txt);break;}
    case"rap":S.rap[k]=(+(S.rap[k]||0))+v;save();break;
    case"adv":adv(v);break;
    case"roll":doRoll();break;case"force":force();break;case"luck":luck();break;
    case"sc":S.scorte[k]=Math.max(0,(+S.scorte[k]||0)+v);save();break;
    case"giorno":eatDay(1,false);break;
    case"iadd":{const n=(ui.nn||"").trim();if(!n)break;ui.nn="";add("inv",{nome:n,qta:1,slot:1,dove:"zaino",stato:"ok",nota:""});break;}
    case"idel":del("inv",k);break;
    case"wear":{const it=L.inv.find(x=>x.id===k);if(!it)break;const ns=(+it.segni===v?v-1:v);upd("inv",k,{segni:ns,stato:wStato({...it,segni:ns})});break;}
    case"accall":ui.aopen={};render();break;case"acat":ui.acat=k;render();break;case"ag":ui.ag=k;render();break;case"arar":ui.arar=k;render();break;
    case"buy":{const x=ARM[+k];if(!x||x.p>(+S.rubli||0))break;S.rubli=(+S.rubli||0)-x.p;
      if(x.sc){S.scorte[x.sc]=(+S.scorte[x.sc]||0)+1;S.lastBuy={n:x.n,p:x.p,sc:x.sc};save();}
      else add("inv",{nome:x.n,qta:1,slot:x.slot,dove:x.w?"indossato":"zaino",stato:"ok",nota:x.s,tipo:tipoOf(x),classe:classeOf(x.n),segni:0}).then(id=>{S.lastBuy={n:x.n,p:x.p,inv:id};save();});
      toast(`Comprato: ${x.n}.`);break;}
    case"bundo":{const lb=S.lastBuy;if(!lb)break;S.rubli=(+S.rubli||0)+lb.p;if(lb.sc)S.scorte[lb.sc]=Math.max(0,(+S.scorte[lb.sc]||0)-1);if(lb.inv)del("inv",lb.inv);S.lastBuy=null;save();break;}
    case"pt":ui.pdaTab=k;render();break;
    case"send":{const t=(ui.msg||"").trim();if(!t)break;ui.msg="";add("pda",{tipo:"msg",da:S.pg.sopr||S.pg.nome||"io",mio:true,testo:t,data:S.clock.data,ora:S.clock.ora});break;}
    case"job":{const j=L.pda.find(x=>x.id===k);const nv=b.dataset.v;if(!j)break;const ch={stato:nv};
      if(nv==="fatto"&&!j.chiuso){let dm=j.dim;if(dm==null){const t=TIER[j.luogo]??3,p=+j.paga||0;dm=p>PAGHE[t][1][1]?2:p>PAGHE[t][0][1]?1:0;}
        S.rubli=(+S.rubli||0)+(+j.paga||0);S.nomeRep=(+S.nomeRep||0)+[1,2,3][dm];ch.chiuso=true;save();toast(`Pagato ${fmtR(j.paga)} · Nome +${[1,2,3][dm]}.`);}
      else if(nv==="fallito"&&!j.chiuso){S.nomeRep=(+S.nomeRep||0)-1;ch.chiuso=true;save();toast("Lavoro fallito: Nome −1.");}
      upd("pda",k,ch);break;}
    case"ten":S.tensione=Math.max(1,Math.min(9,(+S.tensione||5)+v));save();break;
    case"prob":ui.prob=+k;render();break;
    case"or":oracolo();break;case"scena":scena();break;case"ev":soloPush("Evento casuale",evento());break;case"sig":soloPush("Significato",[meaning()]);break;
    case"fa":soloPush("Cosa fa?",[`<b>${pk(FA)}</b>.`]);break;case"reaz":reazione();break;case"png":png();break;
    case"pngsave":{const p=ui.lastPng;if(!p)break;ui.lastPng=null;add("png",{...p,fiducia:0,stato:"vivo"});toast("Salvato nel registro.");break;}
    case"kit":kit(ui.chi||"bandito",false);break;case"cad":kit(ui.chi||"bandito",true);break;
    case"nasc":nascondiglio();break;case"campo":campo();break;case"prendi":prendi();break;
    case"lav":lavoro();break;case"compl":soloPush("Complicazione",[`<b>${pk(COMPL)}</b>.`]);break;case"voce":voce();break;
    case"jobpda":{const j=ui.lastJob;if(!j)break;ui.lastJob=null;add("pda",{...j,data:S.clock.data,ora:S.clock.ora});toast("Lavoro nel PDA.");break;}
    case"cli":cliente();break;case"comp":compagno();break;
    case"tappe":tappe();break;case"arriva":{const p=path(S.clock.luogo,ui.dest);if(!p)break;const ore=p.slice(1).reduce((a,z,i)=>a+edge(p[i],z)[3],0)*(ui.notteV?2:1);S.clock.luogo=ui.dest;gruppo().forEach(p=>upd("png",p.id,{luogo:ui.dest}));adv(ore*60);toast(`Arrivato: ${ui.dest}${gruppo().length?`, con ${gruppo().length} del gruppo`:""}.`);break;}
    case"via":viaggio();break;case"met":meteo();break;
    case"fid":{const p=L.png.find(x=>x.id===k);if(p)upd("png",k,{fiducia:Math.max(-2,Math.min(2,(+p.fiducia||0)+v))});break;}
    case"padd":{const n=(ui.pn||"").trim();if(!n)break;const f=(ui.pf||"").trim();ui.pn="";ui.pf="";add("png",{nome:n,fazione:f,fiducia:0,stato:"vivo",nota:""});break;}
    case"pimp":{const p=L.png.find(x=>x.id===k);if(p)upd("png",k,{imp:!p.imp});break;}
    case"dadd":{const t=(ui.dt||"").trim();if(!t)break;ui.dt="";add("diario",{testo:t,data:S.clock.data,ora:S.clock.ora,luogo:S.clock.luogo});break;}
    case"qui":S.clock.luogo=k;save();break;
  }
});
document.addEventListener("input",e=>{const el=e.target;if(el.dataset.dr!=null&&el.type!=="checkbox"&&el.tagName!=="SELECT")ui[el.dataset.dr]=el.value;});
document.addEventListener("change",e=>{const el=e.target;
  if(el.dataset.f){let v=el.value;if(el.type==="number")v=v===""?0:+v;set(el.dataset.f,v);return;}
  if(el.dataset.d){const k=el.dataset.d;ui.dr[k]=el.type==="checkbox"?el.checked:el.value;if(k==="a")ui.dr.s=(SK[el.value]||[])[0]?.[0]||"";if(k==="w"){const W=armaSel();if(W&&W.tipo==="arma"){if(isMischia(W)){ui.dr.a="forza";ui.dr.s="corpo";ui.dr.m=0;}else{ui.dr.a="agilita";ui.dr.s="tiro";}}}render();return;}
  if(el.dataset.dr!=null){ui[el.dataset.dr]=el.type==="checkbox"?el.checked:el.value;render();return;}
  if(el.dataset.u){let v=el.value;if(el.type==="number")v=v===""?0:+v;upd(el.dataset.c||"inv",el.dataset.u,{[el.dataset.k]:v});}
});
document.addEventListener("toggle",e=>{const el=e.target;if(el.dataset&&el.dataset.acc){ui.aopen=ui.aopen||{};ui.aopen[el.dataset.acc]=el.open;}},true);
window.addEventListener("hashchange",()=>{const h=location.hash.slice(1);if(h==="salute"){ui.tab="scheda";render();setTimeout(()=>document.getElementById("salute")?.scrollIntoView({behavior:"smooth"}),30);return;}ui.tab=hashTab(h);render();window.scrollTo({top:0});});
ui.tab=hashTab(location.hash.slice(1));

/* ===== avvio ===== */
fetch("armeria.json").then(r=>r.json()).then(a=>{ARM=a;render();}).catch(()=>{});
render();
(async()=>{
  const t=setTimeout(()=>{if(conn==="loading"){conn="off";startLocal();}},10000);
  try{db=window.claude?.use?await window.claude.use("db"):null;}catch(e){db=null;}
  if(!db){clearTimeout(t);conn="off";startLocal();return;}
  db.doc("stato/main").onSnapshot(s=>{clearTimeout(t);conn="on";if(!dirty)S=deep(clone(DEF),s.exists?s.data():{});render();},()=>{clearTimeout(t);conn="off";render();});
  Object.keys(L).forEach(c=>db.collection(c).onSnapshot(s=>{L[c]=s.docs.map(x=>({id:x.id,...x.data()}));render();},()=>{}));
})();
function startLocal(){S=deep(clone(DEF),LS.get("pda.stato")||{});Object.keys(L).forEach(c=>L[c]=LS.get("pda."+c)||[]);render();}

document.addEventListener("keydown",e=>{const t=e.target;if(e.ctrlKey||e.metaKey||e.altKey)return;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;
  if(/^[1-9]$/.test(e.key)||e.key==="0"){const vs=tabsVis();const i=e.key==="0"?9:+e.key-1;if(vs[i]){location.hash=vs[i][0];e.preventDefault();}}
  else if((e.key==="t"||e.key==="T")&&ui.tab==="dadi"){const b=document.querySelector('[data-a="roll"]');if(b){b.click();e.preventDefault();}}
  else if(e.key==="u"||e.key==="U"){if(ui.undo){undoLast();e.preventDefault();}}
  else if(e.key==="Escape"){if(ui.sell){ui.sell=null;render();}}});

document.addEventListener("keydown",e=>{const t=e.target;if(e.key==="Enter"&&t&&t.dataset&&t.dataset.dr&&t.dataset.dr.startsWith("cin_")){e.preventDefault();ui[t.dataset.dr]=t.value;chatSend(t.dataset.dr.slice(4));}});
if("serviceWorker" in navigator&&!window.claude&&location.protocol.startsWith("http")){window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));}
window.addEventListener("online",()=>render());window.addEventListener("offline",()=>render());
