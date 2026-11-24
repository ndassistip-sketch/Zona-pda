/* ===== Armi pesanti, veicoli, elicotteri dell'Esercito ===== */
try{if(typeof AGRP!=="undefined"&&!AGRP.some(g=>g[0]==="pesanti"))AGRP.push(["pesanti","Armi pesanti"]);if(typeof RNG_CL!=="undefined")RNG_CL.pesanti={n:"arma pesante",t:[-1,1,0,-1]};}catch(_){}
/* le armi pesanti si tirano con Forza + Armi pesanti */
function mzSk(W){try{const e=armOf(W.nome);if(e&&e.g==="pesanti")return["forza","armi_pesanti"];}catch(_){}return["agilita","tiro"];}

const MZ_V={
 niva:{n:"Lada Niva",p:180000,cons:1,posti:3,car:12,furto:.07,def:0,d:"Piccola, parca, si ripara con niente. Tre posti stretti."},
 uaz:{n:"UAZ-469",p:250000,cons:2,posti:5,car:20,furto:.08,def:0,d:"Il caprone dell'esercito: va dappertutto dove c'è una strada, e anche un po' dove non c'è."},
 zil:{n:"ZIL-131",p:400000,cons:3,posti:10,car:40,furto:.05,def:1,d:"Un camion a tre assi. Porta un gruppo intero e il bottino di una settimana. Si sente da un chilometro."},
 brdm:{n:"BRDM-2",p:1200000,cons:4,posti:6,car:10,furto:.02,def:4,off:1,d:"Blindato da ricognizione. Passa anche nella Foresta Rossa. La torretta è vuota: la KPVT si trova a parte."}};
const MZ_KPVT={n:"Mitragliatrice KPVT per BRDM",p:150000};
const MZ_NO=["Foresta Rossa","Pripjat'","La centrale"];
/* chi vende: zona → mezzi, e condizione */
const MZ_SHOP={"Bar e Rostok":{v:["niva","uaz","zil"],ok:()=>(+(S.rap||{})["Barman"]||0)>=0||(+(S.rap||{})["Dovere"]||0)>=1,chi:"il Barman"},
 "Magazzini dell'esercito":{v:["uaz","zil","brdm"],kpvt:1,ok:()=>(+(S.rap||{})["Libertà"]||0)>=1,chi:"la Libertà (Rapporto 1+)"},
 "Zaton":{v:["niva","uaz"],ok:()=>(+(S.rap||{})["Stalker liberi"]||0)>=0,chi:"i mercanti dello Skadovsk"},
 "Cordone":{v:["niva"],ok:()=>(+(S.rap||{})["Mercante del Cordone"]||0)>=2,chi:"il Mercante (Rapporto 2+)"}};
const MZ_GAR=["Cordone","Bar e Rostok","Zaton","Janiv e Jupiter","Yantar"];
const mzS=()=>{const A=alS();A.mz=A.mz||{veh:[],heli:null,n:1};return A.mz;};
const mzAct=()=>mzS().veh.find(v=>v.att&&!v.guasto&&!v.rubato);
const mzBaseDef=()=>{try{const B=bsS();if(!B)return 0;const z=AL_BY[B.poi].z;return mzS().veh.filter(v=>!v.rubato&&!v.att&&v.luogo===z&&v.base).reduce((a,v)=>a+MZ_V[v.t].def+(v.kpvt?4:0),0);}catch(_){return 0;}};
const mzSafe=v=>{try{const B=bsS();if(B&&!B.persa&&B.st.officina&&AL_BY[B.poi].z===v.luogo&&v.base)return true;}catch(_){}return !!v.gar;};
function mzRoute(a,b,v){const p=path(a,b);if(!p)return false;return p.every(z=>!MZ_NO.includes(z)||(MZ_V[v.t].off&&z==="Foresta Rossa"));}

/* viaggi: metà tempo col mezzo, se la strada lo permette */
let MZ_TRIP=null;
document.addEventListener("click",e=>{const b=e.target.closest('[data-a="arriva"],[data-x="vgl"]');if(!b)return;try{if(b.dataset.a==="arriva")MZ_TRIP={a:S.clock.luogo,b:ui.dest};else{const V=S.viaggio;if(V)MZ_TRIP={a:V.p[V.i],b:V.p[V.i+1]};}}catch(_){MZ_TRIP=null;}setTimeout(()=>{MZ_TRIP=null;},0);},true);
(function hookMz(){if(typeof adv!=="function"||!adv._bs){setTimeout(hookMz,300);return;}if(adv._mz)return;const _a=adv;
  adv=function(min){const T=MZ_TRIP;MZ_TRIP=null;const v=mzAct();let used=null;
    if(T&&v&&v.luogo===T.a&&T.b&&mzRoute(T.a,T.b,v)){const need=Math.max(1,Math.ceil(min/120*MZ_V[v.t].cons));if((+S.scorte.comb||0)>=need){S.scorte.comb-=need;min=Math.ceil(min/2);used={v,need,T};}else toast(`${MZ_V[v.t].n}: serbatoio vuoto. Si va a piedi.`);}
    else if(T&&v&&v.luogo===T.a&&T.b&&!mzRoute(T.a,T.b,v)){v.att=0;toast(`${MZ_V[v.t].n}: di là non passa. Resta a ${v.luogo}.`);}
    const d0=S.clock.data;const r=_a(min);
    try{if(used){const {v,need,T}=used;v.luogo=T.b;S.allerta=Math.min(6,(+S.allerta||0)+(v.t==="zil"||v.t==="brdm"?3:2));
        if(Math.random()<.05+.04*(+v.segni||0)){v.guasto=1;toast(`${MZ_V[v.t].n} si è fermato appena arrivati: guasto. Serve una riparazione.`);}else if(Math.random()<.25)v.segni=Math.min(6,(+v.segni||0)+1);
        try{add("solo",{tit:`In ${MZ_V[v.t].n}`,righe:[`${T.a} → ${T.b}: metà tempo, −${need} combustibile, Allerta su (il motore si sente).`],data:S.clock.data,ora:S.clock.ora});}catch(_){}}
      const n=Math.round((Date.parse(S.clock.data)-Date.parse(d0))/864e5);if(n>0)mzDay(n);}catch(e){console.error(e);}return r;};for(const k in _a)try{adv[k]=_a[k];}catch(_){}adv._mz=1;})();
function mzDay(n){const M=mzS();for(let i=0;i<Math.min(n,7);i++)M.veh.forEach(v=>{if(v.rubato||v.att&&v.luogo===S.clock.luogo)return;
  if(v.gar){if((+S.rubli||0)>=300)S.rubli-=300;else{v.gar=0;toast(`Garage non pagato: ${MZ_V[v.t].n} è di nuovo in strada.`);}}
  if(!mzSafe(v)&&Math.random()<MZ_V[v.t].furto*(v.luogo===S.clock.luogo?.5:1)){v.rubato=1;v.att=0;try{add("pda",{tipo:"msg",da:"uno stalker",testo:`Il tuo ${MZ_V[v.t].n} a ${v.luogo}? L'hanno portato via stanotte. Due tipi, a fari spenti.`,data:S.clock.data,ora:S.clock.ora});}catch(_){}toast(`Ti hanno rubato il ${MZ_V[v.t].n}.`);}});}

/* ---- elicotteri dell'Esercito ---- */
function mzHeliHour(){const M=mzS();const A=alS();
  if(!M.heli){if(Math.random()<.035&&AL_P.some(p=>alCtl(p.id)[0]==="Esercito")){const zs=["Cordone","Agroprom","Discarica","Valle Oscura","Bar e Rostok","Yantar","Magazzini dell'esercito","Radar","Pripjat'"];const zd=["Cordone","Agroprom","Pripjat'"];const z=alRand(zs);const t=Math.random()<.6?"Mi-24":"Mi-8";M.heli={t,z,h:3+Math.floor(Math.random()*4)};
      alLog(alMain(z),`Un ${t} dell'Esercito sorvola ${z}.`,1);
      if(t==="Mi-8"&&zd.includes(z)){const to=alTarget("Esercito",alMain(z));if(to){A.q.push({id:A.n++,f:"Esercito",n:4+Math.floor(Math.random()*3),da:alMain(z).id,to:to.id,eta:1,cap:"un tenente sceso dal Mi-8"});alLog(to,`Il Mi-8 ha sbarcato una squadra dell'Esercito diretta a ${to.n} (${to.z}).`,1);}}}return;}
  const H=M.heli;H.h--;if(H.h<=0){M.heli=null;return;}if(Math.random()<.5){try{const nb=EDGES.filter(e=>e[0]===H.z||e[1]===H.z).map(e=>e[0]===H.z?e[1]:e[0]);if(nb.length)H.z=alRand(nb);}catch(_){}}
  if(H.z===S.clock.luogo&&!ui.ev){const B=typeof bsS==="function"?bsS():null;const aBase=B&&S.clock.poi===B.poi&&!B.persa;if(!aBase&&((+S.allerta||0)>=3||mzAct()||Math.random()<.2)){try{const e=EVD.byId[H.t==="Mi-24"?"mz-heli-24":"mz-heli-8"];if(e&&evOk(e,{luogo:S.clock.luogo}))evShow(e);}catch(_){}}}}
(function hookH2(){if(typeof alHour!=="function"||!alHour._ct){setTimeout(hookH2,300);return;}if(alHour._mz)return;const _h=alHour;alHour=function(){_h();try{mzHeliHour();}catch(e){console.error(e);}};alHour._ct=1;alHour._mz=1;})();

/* ---- storie: condizioni ed esiti nuovi ---- */
(function hookEv3(){if(typeof evCond!=="function"||!evCond._al||typeof evApply!=="function"||!evApply._al){setTimeout(hookEv3,300);return;}if(evCond._mz)return;const _c=evCond;
  evCond=function(c,ctx){if(c){if(c.heli){const H=mzS().heli;if(!H||H.z!==S.clock.luogo||(c.heli!==true&&H.t!==c.heli))return false;}
      if(c.mezzo&&!mzAct())return false;
      if(c.base){const B=typeof bsS==="function"?bsS():null;if(!B||B.persa||S.clock.poi!==B.poi)return false;if(c.base!==true&&!B.st[c.base])return false;}}
    return _c(c,ctx);};evCond._al=1;evCond._mz=1;
  const _ap=evApply;evApply=function(o,log){_ap(o,log);if(!o)return;
    if(o.abbatti){const M=mzS();if(M.heli){alLog(alMain(M.heli.z),`Un ${M.heli.t} dell'Esercito è caduto a ${M.heli.z}. Fumo nero fino al tramonto.`,1);M.heli=null;}S.rap=S.rap||{};S.rap.Esercito=(+S.rap.Esercito||0)-3;log&&log.push("Rapporto Esercito −3");}
    if(o.viaheli){mzS().heli=null;}
    if(o.basesc){const B=typeof bsS==="function"?bsS():null;if(B)for(const k in o.basesc)B.sc[k]=Math.max(0,(B.sc[k]||0)+o.basesc[k]);}
    if(o.mezzoseg){const v=mzAct();if(v)v.segni=Math.min(6,(+v.segni||0)+o.mezzoseg);}};evApply._al=1;evApply._mz=1;})();

/* ---- pannello Mezzi ---- */
function mzPanel(){const M=mzS();const z=S.clock.luogo;const sh=MZ_SHOP[z];const B=typeof bsS==="function"?bsS():null;const atBase=B&&!B.persa&&AL_BY[B.poi].z===z;
  const vs=M.veh.filter(v=>!v.rubato);
  const row=v=>{const V=MZ_V[v.t];const qui=v.luogo===z;return `<div style="border-left:3px solid #8a9a6a;padding:4px 8px;margin:6px 0"><b>${V.n}</b>${v.kpvt?" con KPVT":""} <span class="small muted">a ${esc(v.luogo)}${v.att?" · <b>con te</b>":""}${v.guasto?" · <b style='color:#c44'>guasto</b>":""} · usura ${v.segni||0}/6${v.gar?" · in garage (300 ₽/giorno)":""}${v.base&&atBase?" · alla base":""}${!v.att&&!mzSafe(v)?" · <b>incustodito</b>":""}</span>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:4px">${qui?`${v.att?`<button class="btn g s" data-mz="lascia" data-id="${v.id}">Lascia qui</button>`:`<button class="btn s" data-mz="prendi" data-id="${v.id}">Prendilo</button>`}
    ${v.guasto||(v.segni||0)>0?`<button class="btn g s" data-mz="ripara" data-id="${v.id}">Ripara (2 h, Intelletto + Tecnica)</button>`:""}
    ${!v.att&&MZ_GAR.includes(z)&&!v.gar?`<button class="btn g s" data-mz="garage" data-id="${v.id}">Garage (300 ₽/g)</button>`:""}${v.gar?`<button class="btn g s" data-mz="nogar" data-id="${v.id}">Togli dal garage</button>`:""}
    ${!v.att&&atBase&&!v.base?`<button class="btn g s" data-mz="base" data-id="${v.id}">Parcheggia alla base</button>`:""}`:`<span class="small muted">È a ${esc(v.luogo)}.</span>`}</div></div>`;};
  return `<section class="card"><h3>Mezzi</h3>${vs.length?vs.map(row).join(""):`<p class="small muted">Non hai mezzi. Si comprano al Bar, ai Magazzini (dalla Libertà), allo Skadovsk e, con un buon Rapporto, dal Mercante del Cordone.</p>`}
  <p class="small muted">Col mezzo il viaggio dura la metà, se la strada non passa per la Foresta Rossa, Pripjat' o la centrale (il BRDM passa anche nella Foresta). Consuma combustibile, alza l'Allerta e si consuma. Lasciato incustodito, prima o poi sparisce: il garage, o l'officina della base, lo tengono al sicuro. Un BRDM parcheggiato alla base la difende.</p>
  ${sh?`<h4 style="margin:10px 0 2px">In vendita qui</h4>${sh.ok()?sh.v.map(k=>{const V=MZ_V[k];return `<div class="row small" style="justify-content:space-between;gap:6px;border-bottom:1px dashed var(--line);padding:3px 0"><span><b>${V.n}</b> · ${V.posti} posti · ${V.car} slot di carico · ${V.cons} combustibile ogni 2 ore<br><span class="muted">${esc(V.d)}</span></span><button class="btn g s" data-mz="compra" data-k="${k}">${fmtR(V.p)}</button></div>`;}).join("")+(sh.kpvt?`<div class="row small" style="justify-content:space-between"><span><b>${MZ_KPVT.n}</b> · difesa della base +4 col BRDM parcheggiato</span><button class="btn g s" data-mz="kpvt">${fmtR(MZ_KPVT.p)}</button></div>`:""):`<p class="small muted">Vende ${sh.chi}: per ora non a te.</p>`}`:""}</section>`;}
document.addEventListener("click",e=>{const b=e.target.closest("[data-mz]");if(!b)return;const M=mzS();const a=b.dataset.mz;const v=M.veh.find(x=>String(x.id)===b.dataset.id);
  if(a==="compra"){const V=MZ_V[b.dataset.k];if((+S.rubli||0)<V.p){toast(`Servono ${fmtR(V.p)}.`);return;}S.rubli-=V.p;M.veh.forEach(x=>x.att=0);M.veh.push({id:M.n++,t:b.dataset.k,luogo:S.clock.luogo,segni:0,att:1});try{sfx("cash");}catch(_){}toast(`${V.n} è tuo. Riempi il serbatoio: ogni due ore di strada ne mangia ${V.cons}.`);try{add("diario",{testo:`Ho comprato un ${V.n}. Nella Zona, un motore che parte è più raro di un artefatto.`,data:S.clock.data,ora:S.clock.ora,luogo:S.clock.luogo});}catch(_){}}
  else if(a==="kpvt"){const br=M.veh.find(x=>x.t==="brdm"&&!x.rubato&&!x.kpvt);if(!br){toast("Serve un BRDM senza mitragliatrice.");return;}if((+S.rubli||0)<MZ_KPVT.p){toast(`Servono ${fmtR(MZ_KPVT.p)}.`);return;}S.rubli-=MZ_KPVT.p;br.kpvt=1;toast("KPVT montata sulla torretta.");}
  else if(v&&a==="prendi"){M.veh.forEach(x=>x.att=0);v.att=1;v.gar=0;v.base=0;}
  else if(v&&a==="lascia"){v.att=0;}
  else if(v&&a==="garage"){v.gar=1;v.att=0;}
  else if(v&&a==="nogar"){v.gar=0;}
  else if(v&&a==="base"){v.base=1;v.att=0;v.gar=0;}
  else if(v&&a==="ripara"){const B=typeof bsS==="function"?bsS():null;const off=B&&!B.persa&&B.st.officina&&AL_BY[B.poi].z===v.luogo&&S.clock.poi===B.poi;const R=off?{base:1,dv:"officina della base"}:qRoll("intelletto","tecnica",0,"",0);adv(120);if(R&&R.base){v.guasto=0;v.segni=Math.max(0,(+v.segni||0)-2);toast(`${MZ_V[v.t].n}: riparato (${R.dv}).`);}else toast(`Niente da fare, per ora (${R?R.dv:""}). Riprova, o portalo all'officina della base.`);}
  save();});
(function hookV5(){if(typeof V!=="object"||!V.mappa||!V.mappa._bs){setTimeout(hookV5,300);return;}if(V.mappa._mz)return;const _m=V.mappa;
  V.mappa=function(){let h=_m.apply(this,arguments);let mp="";try{mp=mzPanel();}catch(e){console.error(e);}const i=h.indexOf(`<section class="card"><h3>Contratti`);return i>=0?h.slice(0,i)+mp+h.slice(i):h+mp;};V.mappa._al=1;V.mappa._ct=1;V.mappa._bs=1;V.mappa._mz=1;})();
