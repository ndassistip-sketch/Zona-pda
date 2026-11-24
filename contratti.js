/* ===== Contratti dalla mappa e Ambizioni ===== */
const CT_K={prendi:"Prendere",ripulisci:"Ripulire",difendi:"Difendere",rifornisci:"Rifornire"};
const CT_RAP=["Stalker liberi","Dovere","Libertà","Banditi","Mercenari","Esercito","Scienziati"];
const ctS=()=>{const A=alS();A.ctr=A.ctr||[];A.vis=A.vis||{};A.cfatti=A.cfatti||0;return A;};
const ctAddH=h=>{try{return clkAdd(h*60);}catch(_){return alClk();}};
const ctPast=t=>{try{return minTo(t)<0;}catch(_){return false;}};
const ctOk=f=>{const r=+(S.rap||{})[f]||0;return f==="Banditi"||f==="Mercenari"?r>=1:r>=-1;};
const ctTxt=c=>{const p=AL_BY[c.poi];const [g,n]=alCtl(c.poi);return c.k==="prendi"?`Cacciare ${g||"chi c'è"} da ${p.n} (${p.z}) e tenerlo per ${c.f}.`:c.k==="ripulisci"?`Ripulire la tana a ${p.n} (${p.z}).`:c.k==="difendi"?`Essere a ${p.n} (${p.z}) quando arriva l'attacco di ${c.ne||"nemici"}, e tenerlo.`:`Portare ${c.need.q} ${c.need.n} al presidio di ${p.n} (${p.z}).`;};

/* generazione: una volta ogni tanto, dalle fazioni che hanno basi */
function ctGen(){const A=ctS();if(A.ctr.filter(c=>c.stato==="offerto").length>=8)return;
  const f=alRand(CT_RAP.filter(f=>f!=="Scienziati"||Math.random()<.4));if(!ctOk(f))return;
  const mine=AL_P.filter(p=>alCtl(p.id)[0]===f);if(!mine.length)return;const hub=alRand(mine.filter(p=>"BMP".includes(p.t)).length?mine.filter(p=>"BMP".includes(p.t)):mine);
  const near=AL_P.filter(p=>alZoneH(hub.z,p.z)<=6);let c=null;const r=Math.random();
  if(r<.35&&f!=="Scienziati"){const t=near.filter(p=>{const [g,n]=alCtl(p.id);return g&&g!=="Mutanti"&&alEne(f,g)&&n<=5;});if(t.length){const p=alRand(t);const n=alCtl(p.id)[1];c={k:"prendi",poi:p.id,paga:2500+n*1200,ore:72};}}
  if(!c&&r<.65){const t=near.filter(p=>alCtl(p.id)[0]==="Mutanti");if(t.length){const p=alRand(t);const n=alCtl(p.id)[1];c={k:"ripulisci",poi:p.id,paga:1500+n*800,ore:72};}}
  if(!c&&r<.85){const s=A.q.find(s=>s.eta>=3&&mine.some(p=>p.id===s.to)&&alEne(s.f,f));if(s){c={k:"difendi",poi:s.to,paga:3500+s.n*700,ore:s.eta,sq:s.id,ne:s.f};}}
  if(!c){const t=mine.filter(p=>alCtl(p.id)[1]<=3);if(t.length){const p=alRand(t);const need=Math.random()<.5?{n:"cibo",q:3}:{n:"munizioni",q:2};c={k:"rifornisci",poi:p.id,paga:need.n==="cibo"?1800:2600,ore:96,need};}}
  if(!c)return;if(A.ctr.some(x=>x.poi===c.poi&&x.stato!=="fatto"&&x.stato!=="fallito"))return;
  Object.assign(c,{id:A.n++,f,da:hub.id,stato:"offerto",scad:ctAddH(c.ore),off:ctAddH(48)});A.ctr.unshift(c);A.ctr=A.ctr.slice(0,30);}
function ctHour(){const A=ctS();if(Math.random()<.3)ctGen();
  A.ctr.forEach(c=>{if(c.stato==="offerto"&&ctPast(c.off))c.stato="scaduto";
    if(c.stato==="preso"&&ctPast(c.scad)&&c.k!=="difendi"){c.stato="fallito";S.rap=S.rap||{};if(c.f in S.rap||CT_RAP.includes(c.f))S.rap[c.f]=(+S.rap[c.f]||0)-1;alLog(AL_BY[c.poi],`${S.pg.sopr||"Uno stalker"} non ha mantenuto la parola con ${c.f}.`);}
    if(c.stato==="preso"&&c.k==="difendi"&&!A.q.some(s=>s.id===c.sq)&&c.stato==="preso"){const [g]=alCtl(c.poi);ctEnd(c,g===c.f&&c.c,true);}
    if(c.stato==="preso"&&c.k==="prendi"&&alCtl(c.poi)[0]===c.f&&!c.mio){/* qualcun altro l'ha preso per loro: metà paga */c.paga=Math.round(c.paga/2);}});}
function ctEnd(c,ok,auto){c.stato=ok?"fatto":"fallito";S.rap=S.rap||{};const p=AL_BY[c.poi];
  if(ok){S.rubli=(+S.rubli||0)+c.paga;S.rap[c.f]=(+S.rap[c.f]||0)+1;S.pe=(+S.pe||0)+1;ctS().cfatti++;if(c.paga>=5000)S.nomeRep=(+S.nomeRep||0)+1;
    const nem=c.vec;if(nem&&CT_RAP.includes(nem))S.rap[nem]=(+S.rap[nem]||0)-1;
    try{add("solo",{tit:`Contratto chiuso: ${CT_K[c.k]} ${p.n}`,righe:[ctTxt(c),`Paga ${fmtR(c.paga)} da ${c.f}. Rapporto ${c.f} +1. +1 PE.`],data:S.clock.data,ora:S.clock.ora});}catch(_){}toast(`Contratto chiuso: +${fmtR(c.paga)}`);try{sfx("cash");}catch(_){}}
  else{S.rap[c.f]=(+S.rap[c.f]||0)-1;toast(`Contratto fallito: ${p.n}. Rapporto ${c.f} −1.`);}
  ambCheck();save();}

/* arrivo di una squadra su un punto che stai difendendo: conti come rinforzo */
(function hookArr(){if(typeof alArrive!=="function"){setTimeout(hookArr,300);return;}if(alArrive._ct)return;const _a=alArrive;
  alArrive=function(s,p){const A=ctS();const c=A.ctr.find(c=>c.stato==="preso"&&c.k==="difendi"&&c.sq===s.id);
    if(c&&S.clock.poi===p.id&&S.clock.luogo===p.z){const cc=A.c[p.id];if(cc&&cc[0]===c.f){cc[1]+=4;_a(s,p);c.c=A.c[p.id][0]===c.f;ui.alWarn={p:p.id,f:s.f,n:s.n,lotta:c.f};ctEnd(c,c.c);if(c.c)A.c[p.id][1]=Math.max(1,A.c[p.id][1]-2);return;}}
    _a(s,p);if(c){c.c=false;}};alArrive._ct=1;})();
(function hookH(){if(typeof alHour!=="function"){setTimeout(hookH,300);return;}if(alHour._ct)return;const _h=alHour;alHour=function(){_h();try{ctHour();}catch(e){console.error(e);}};alHour._ct=1;})();
(function hookGo(){if(typeof alGo!=="function"){setTimeout(hookGo,300);return;}if(alGo._ct)return;const _g=alGo;alGo=function(id){_g(id);try{const A=ctS();if(AL_BY[id]&&AL_BY[id].z===S.clock.luogo&&!A.vis[id]){A.vis[id]=1;ambCheck();}}catch(_){}};alGo._ct=1;})();

/* ---- Ambizioni ---- */
const AMBZ={
 guida:{t:"La Guida",d:"Diventare la guida di cui si parla nei rifugi.",m:"Nome",v:()=>+S.nomeRep||0,s:[3,6,10,15],fine:"Ormai nei rifugi non dicono più «uno stalker». Dicono il tuo nome, e chi arriva al Cordone con i soldi in tasca chiede di te. Non sei il più forte né il più ricco. Sei quello che torna, e che riporta indietro gli altri. Nella Zona è la cosa più vicina a una leggenda."},
 ricco:{t:"Il Ricco",d:"Mettere insieme abbastanza da uscire per sempre.",m:"Rubli",v:()=>+S.rubli||0,s:[50000,150000,400000,1000000],fine:"Un milione. Lo conti tre volte, in un bunker, alla luce di una lampada a petrolio. È abbastanza per una casa, per una vita, per dimenticare. Il posto di blocco è a mezza giornata di cammino. Dietro di te, la Zona respira. Non dice niente. Non ti trattiene. È questo che fa più paura."},
 carto:{t:"Il Cartografo",d:"Mettere piede in ogni angolo della Zona.",m:"Punti visitati",v:()=>Object.keys(ctS().vis).length,s:[20,60,120,200],fine:"Duecento posti. Li hai visti tutti con i tuoi occhi: le tane, i bunker, le chiese senza tetto, i pontili dove non attracca più niente. La tua mappa è la più completa che esista, ed è fatta di cose che nessuno ti ha raccontato. La Zona non ha più segreti per te. Ne ha soltanto di nuovi."},
 soldato:{t:"Il Soldato di ventura",d:"Vendere il fucile a chi paga, e spostare i confini.",m:"Contratti chiusi",v:()=>ctS().cfatti||0,s:[3,10,20,35],fine:"Trentacinque contratti. Hai preso posti, li hai difesi, li hai ripuliti, e la mappa della Zona porta i segni delle tue mani. Le fazioni ti chiamano per nome e ti temono un poco. Nessuno sa più da che parte stai. Forse neanche tu. Ma sanno tutti che, quando arrivi, le cose cambiano."},
 cronista:{t:"Il Cronista",d:"Esserci, quando succedono le storie che contano.",m:"Missioni concluse",v:()=>Object.keys(evS().flag).filter(k=>/^q\d\d-fine$/.test(k)).length,s:[3,8,14,20],fine:"Venti storie, dall'inizio alla fine. Il vecchio che voleva seminare, il gruista che nessuno faceva scendere, il telefono che chiedeva di chiudere le finestre. Le hai viste chiudersi una per una. Qualcuno deve ricordarle. Adesso è il tuo lavoro, e non finisce mai."}};
const AMBPE=[2,3,4,6];
function ambCheck(){const A=ctS();const a=AMBZ[A.amb];if(!a)return;A.ambl=A.ambl||0;const v=a.v();while(A.ambl<4&&v>=a.s[A.ambl]){S.pe=(+S.pe||0)+AMBPE[A.ambl];A.ambl++;try{toast(`Ambizione «${a.t}»: traguardo ${A.ambl} di 4. +${AMBPE[A.ambl-1]} PE`);add("diario",{testo:A.ambl===4?`«${a.t}» — ${a.fine}`:`Ambizione «${a.t}»: traguardo ${A.ambl} di 4 (${a.m} ${a.s[A.ambl-1].toLocaleString("it-IT")}).`,data:S.clock.data,ora:S.clock.ora,luogo:S.clock.luogo});}catch(_){}}}
function ambBox(){const A=ctS();const a=AMBZ[A.amb];
  if(!a)return `<section class="card"><h3>Ambizione</h3><p class="small">Senza trama, il tuo personaggio ha bisogno di un perché. Scegline uno: ogni ambizione ha quattro traguardi, con PE a ogni passo e un epilogo alla fine.</p><div style="display:grid;gap:6px">${Object.entries(AMBZ).map(([k,x])=>`<button class="btn g" data-ct="amb" data-k="${k}" style="text-align:left"><b>${x.t}</b><br><span class="small">${x.d} · ${x.m}: ${x.s.map(n=>n.toLocaleString("it-IT")).join(" / ")}</span></button>`).join("")}</div></section>`;
  const v=a.v(),l=A.ambl||0,nx=a.s[Math.min(3,l)];
  return `<section class="card"><h3>Ambizione: ${a.t}</h3><p class="small">${a.d}</p><p>${a.m}: <b class="num">${v.toLocaleString("it-IT")}</b>${l<4?` / ${nx.toLocaleString("it-IT")} <span class="small muted">(traguardo ${l+1} di 4)</span>`:""}</p>
  <div style="height:8px;border:1px solid var(--line);border-radius:4px;overflow:hidden"><div style="height:100%;width:${Math.min(100,l*25+(l<4?Math.min(25,25*v/nx):0))}%;background:var(--ink)"></div></div>
  ${l>=4?`<p><i>${a.fine}</i></p>`:""}<p class="small muted" style="margin-top:6px"><button class="btn g s" data-ct="ambx">Cambia ambizione</button> (i traguardi raggiunti si perdono)</p></section>`;}

/* ---- pannello contratti nella linguetta Zona ---- */
function ctPanel(){const A=ctS();const z=S.clock.luogo;const here=alHere();
  const off=A.ctr.filter(c=>c.stato==="offerto"&&(AL_BY[c.da].z===z||AL_BY[c.poi].z===z)&&ctOk(c.f));
  const mine=A.ctr.filter(c=>c.stato==="preso");const chiusi=A.ctr.filter(c=>c.stato==="fatto"||c.stato==="fallito").slice(0,4);
  const row=(c,btns)=>{const p=AL_BY[c.poi];const qui=here&&here.id===c.poi;return `<div style="border-left:3px solid ${AL_COL[c.f]||"#999"};padding:4px 8px;margin:6px 0"><b>${CT_K[c.k]}: ${esc(p.n)}</b> <span class="small muted">per ${esc(c.f)} · ${fmtR(c.paga)}${c.stato==="preso"?` · entro ${esc(dataIt(c.scad.slice(0,10)))} ${esc(c.scad.slice(11))}`:""}</span><br><span class="small">${esc(ctTxt(c))}</span>${qui?` <b class="small">sei qui</b>`:""}<div class="row" style="gap:6px;margin-top:4px">${btns}</div></div>`;};
  return `<section class="card"><h3>Contratti</h3>
  ${mine.length?mine.map(c=>{const p=AL_BY[c.poi];const qui=here&&here.id===c.poi;const [g]=alCtl(c.poi);let b="";
    if(c.k==="prendi")b=qui?`${g&&g!==c.f?`<button class="btn g s" data-ct="sc">Apri lo Scontro</button>`:""}<button class="btn s" data-ct="fatto" data-id="${c.id}">Fatto: il posto è nostro</button>`:`<button class="btn g s" data-ct="go" data-id="${c.id}">${p.z===z?"Vai":"Meta"}</button>`;
    if(c.k==="ripulisci")b=qui?`<button class="btn g s" data-ct="sc">Apri lo Scontro</button><button class="btn s" data-ct="fatto" data-id="${c.id}">Fatto: ripulito</button>`:`<button class="btn g s" data-ct="go" data-id="${c.id}">${p.z===z?"Vai":"Meta"}</button>`;
    if(c.k==="difendi"){const s=A.q.find(s=>s.id===c.sq);b=s?`<span class="small">Arrivano tra ${s.eta} h.</span> `+(qui?`<span class="small">Aspettali qui (fai passare il tempo).</span>`:`<button class="btn g s" data-ct="go" data-id="${c.id}">${p.z===z?"Vai":"Meta"}</button>`):"";}
    if(c.k==="rifornisci")b=qui?`<button class="btn s" data-ct="fatto" data-id="${c.id}">Consegna ${c.need.q} ${c.need.n}</button>`:`<button class="btn g s" data-ct="go" data-id="${c.id}">${p.z===z?"Vai":"Meta"}</button>`;
    return row(c,b+`<button class="btn g s" data-ct="molla" data-id="${c.id}">Rinuncia</button>`);}).join(""):`<p class="small muted">Nessun contratto in corso.</p>`}
  <h4 style="margin:10px 0 2px">Offerte qui intorno</h4>${off.length?off.map(c=>row(c,`<button class="btn s" data-ct="prendi" data-id="${c.id}">Accetta</button>`)).join(""):`<p class="small muted">Nessuna, per ora. Le fazioni offrono lavoro quando la mappa si muove: torna più tardi, o passa da un'altra base.</p>`}
  ${chiusi.length?`<p class="small muted">Ultimi: ${chiusi.map(c=>`${CT_K[c.k]} ${esc(AL_BY[c.poi].n)} (${c.stato})`).join(" · ")}</p>`:""}</section>`;}
document.addEventListener("click",e=>{const b=e.target.closest("[data-ct]");if(!b)return;const A=ctS();const a=b.dataset.ct;const c=A.ctr.find(x=>String(x.id)===b.dataset.id);
  if(a==="amb"){A.amb=b.dataset.k;A.ambl=0;ambCheck();}
  else if(a==="ambx"){A.amb=null;A.ambl=0;}
  else if(a==="sc"){ui.tab="dadi";ui.dsub="scontro";}
  else if(a==="prendi"&&c){c.stato="preso";c.vec=alCtl(c.poi)[0]||"";if(c.k==="prendi")c.mio=1;toast(`Contratto accettato con ${c.f}.`);}
  else if(a==="molla"&&c){c.stato="fallito";S.rap=S.rap||{};S.rap[c.f]=(+S.rap[c.f]||0)-1;}
  else if(a==="go"&&c)alGo(c.poi);
  else if(a==="fatto"&&c){const p=AL_BY[c.poi];
    if(c.k==="rifornisci"){if(c.need.n==="cibo"){if((+S.scorte.cibo||0)<c.need.q){toast("Non hai abbastanza cibo.");return;}S.scorte.cibo-=c.need.q;}else{const am=L.inv.filter(y=>y.colpi!=null&&y.car==null&&y.dove!=="deposito"&&!String(y.dove||"").startsWith("png:"));if(am.length<c.need.q){toast("Servono scatole di munizioni nello zaino.");return;}am.slice(0,c.need.q).forEach(y=>{try{useItem(y);}catch(_){del("inv",y.id);}});}
      const cc=A.c[c.poi];if(cc&&cc[0]===c.f)cc[1]=Math.min(12,cc[1]+2);}
    else if(c.k==="prendi"){A.c[c.poi]=[c.f,3];alLog(p,`${p.n} (${p.z}) adesso è di ${c.f}: l'ha preso ${S.pg.sopr||"uno stalker"}.`,1);}
    else if(c.k==="ripulisci"){A.c[c.poi]=["",0];alLog(p,`${S.pg.sopr||"Uno stalker"} ha ripulito la tana a ${p.n} (${p.z}).`,1);setTimeout(()=>{const cc=A.c[c.poi];if(cc&&!cc[0]&&c.f!=="Scienziati")A.c[c.poi]=[c.f,2];},0);}
    ctEnd(c,true);}
  save();});

/* ---- aggancio alle viste ---- */
(function hookV2(){if(typeof V!=="object"||!V.mappa||!V.mappa._al||!V.storie){setTimeout(hookV2,300);return;}if(V.mappa._ct)return;
  const _m=V.mappa;V.mappa=function(){let h=_m.apply(this,arguments);const i=h.indexOf(`<section class="card"><h3>Voci dalla Zona`);const cp=(()=>{try{return ctPanel();}catch(e){console.error(e);return"";}})();return i>=0?h.slice(0,i)+cp+h.slice(i):h+cp;};V.mappa._ct=1;V.mappa._al=1;
  const _s=V.storie;V.storie=function(){const h=_s.apply(this,arguments);if(ui.ssub==="oracolo")return h;let a="";try{if(!(typeof tramaOn==="function"&&tramaOn()))a=ambBox();}catch(e){console.error(e);}return a+h;};})();
