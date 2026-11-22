/* ===== La vita nella Zona: prezzi vivi, pulire e riparare, meteo che cambia, suoni d'ambiente, statistiche e diario finale ===== */

/* ---------- prezzi vivi ---------- */
const MTET={"Cordone":{f:"Mercante del Cordone",P:3,cl:2,nord:0},"Valle Oscura":{f:"Banditi",P:3,cl:2,nord:0,ric:1.2},"Bar e Rostok":{f:"Barman",P:4,cl:3,nord:0},"Magazzini dell'esercito":{f:"Libertà",P:4,cl:3,nord:0},"Yantar":{f:"Scienziati",P:5,cl:4,nord:1},"Janiv e Jupiter":{f:["Dovere","Libertà"],P:5,cl:4,nord:1},"Zaton":{f:"Stalker liberi",P:5,cl:4,nord:1}};
const MCASH={"Cordone":25000,"Valle Oscura":20000,"Bar e Rostok":60000,"Magazzini dell'esercito":40000,"Yantar":80000,"Janiv e Jupiter":70000,"Zaton":70000};
const mercQui=()=>MTET[S.clock.luogo]||null;
const rapCon=M=>Math.max(...[].concat(M.f).map(f=>+((S.rap||{})[f])||0));
const inverno=()=>STAG(month())==="inverno"||(month()===11&&+String(S.clock.data).slice(8,10)>=15);
const INVR=/^Cibo|^Acqua|^Scatolett|^Pane|^Salame|^Tè|^Combustibile|Sacco a pelo|termic|invernal|Guanti|Berretto di lana|^Kit per il fuoco|^Vodka/i;
function prezzo(x){const M=mercQui();let p=x.p;if(M&&M.ric)p*=M.ric;if(inverno()&&(x.sc==="cibo"||x.sc==="acqua"||x.sc==="comb"||INVR.test(x.n)))p*=1.5;return p===x.p?x.p:Math.round(p/10)*10;}
function vendeQui(x){const M=mercQui();if(!M)return {ok:false,why:"qui non c'è un mercante"};const r=rapCon(M);
  if(x.r==="MR")return {ok:false,why:"non si compra: bottino o favori"};if(x.r==="R"&&!(r>=8||M.nord))return {ok:false,why:"raro: Rapporto 8 o un mercante del nord"};if(x.r==="NC"&&r<3)return {ok:false,why:`non comune: Rapporto 3 (ora ${r})`};
  const P=+(((x.s||"").match(/\bP(\d)\b/)||[])[1]||0);if(x.c==="munizioni"&&P>M.P)return {ok:false,why:`qui al massimo P${M.P}`};
  const cl=x.c==="armature"?classeOf(x.n):0;if(cl>M.cl)return {ok:false,why:`qui al massimo classe ${M.cl}`};return {ok:true};}
function cassa(){const z=S.clock.luogo;S.mcassa=S.mcassa||{};const c=S.mcassa[z];if(!c||c.d!==S.clock.data)S.mcassa[z]={d:S.clock.data,n:MCASH[z]||0};return S.mcassa[z];}
function mercHead(){const M=mercQui();if(!M)return `<p class="small warn" style="margin:4px 0 10px">Qui non c'è un mercante: puoi guardare il listino, ma comprare e vendere si fa dove c'è qualcuno (Cordone, Bar, Yantar, Magazzini, Janiv, Zaton, Valle Oscura).</p>`;
  return `<p class="small muted" style="margin:4px 0 10px">Qui compri da ${esc(MERC[S.clock.luogo]||"un mercante")}: munizioni fino a P${M.P}, armature fino alla classe ${M.cl}, Rapporto ${rapCon(M)}${M.nord?" (mercante del nord: anche roba rara)":""}${M.ric?", prezzi +20%":""}${inverno()?" · inverno: cibo e roba invernale +50%":""} · oggi ha in cassa ${fmtR(cassa().n)} per comprare da te.</p>`;}

/* ---------- pulire e riparare ---------- */
const kitOf=re=>L.inv.find(x=>re.test(x.nome||"")&&mine(x)&&x.dove!=="deposito");
function kitUse(k,max){const u=(k.usi!=null?+k.usi:max)-1;if(u<=0){if((+k.qta||1)>1)upd("inv",k.id,{qta:(+k.qta||1)-1,usi:max});else del("inv",k.id);}else upd("inv",k.id,{usi:u});}
function fixRow(x){const m=wMax(x);if(!m)return "";const s=+x.segni||0;const cl=kitOf(/^Kit di pulizia/),kr=kitOf(x.tipo==="arma"?/^Kit riparazione armi/:/^Kit riparazione armature/),at=kitOf(/^Attrezzi/);
  const oggi=x.pulito===S.clock.data;
  return `<span class="fixrow">${x.tipo==="arma"?`<button class="btn g s" data-x="wclean" data-k="${x.id}" ${!cl||!s||oggi||wStato(x)==="rotto"?"disabled":""} title="${!cl?"serve un kit di pulizia":oggi?"già pulita oggi":""}">Pulisci (30′)${cl?` · ${cl.usi!=null?cl.usi:10} usi`:""}</button>`:""}
  <button class="btn g s" data-x="wfix" data-k="${x.id}" ${(!kr&&!at)||!s?"disabled":""} title="${!kr&&!at?"servono attrezzi o un kit di riparazione":""}">Ripara (1 h)${kr?` · kit ${kr.usi!=null?kr.usi:3} usi`:at?" · attrezzi":""}</button></span>`;}
function wClean(id){const x=L.inv.find(y=>y.id===id);const k=kitOf(/^Kit di pulizia/);if(!x||!k)return;const ns=Math.max(0,(+x.segni||0)-1);upd("inv",id,{segni:ns,stato:wStato({...x,segni:ns}),pulito:S.clock.data});kitUse(k,10);adv(30);toast(`${x.nome} pulita: −1 segno.`);}
function wFix(id){const x=L.inv.find(y=>y.id===id);if(!x)return;const kr=kitOf(x.tipo==="arma"?/^Kit riparazione armi/:/^Kit riparazione armature/),at=kitOf(/^Attrezzi/);if(!kr&&!at)return;
  const R=qRoll("intelletto","tecnica",at?1:0,"",0);if(!R)return;adv(60);if(kr)kitUse(kr,3);let s=+x.segni||0;const was=wStato(x);
  if(!R.base){s=Math.min(wMax(x),s+1);toast(`Ripari male (${R.dv}): +1 segno.`);}
  else if(kr){const per=x.tipo==="arma"?2:1;if(was==="rotto"&&R.base<2&&x.tipo==="arma"){toast(`Non basta (${R.dv}): un'arma rotta torna usurata solo con 2 successi.`);}else{s=Math.max(0,s-per*R.base);if(was==="rotto")s=Math.min(s,wMax(x)-1);toast(`Riparata (${R.dv}): ${wStato({...x,segni:s})}.`);}}
  else{const floor=was==="ok"?0:wSoglia(x);s=Math.max(floor,s-R.base);toast(`Sistemata con gli attrezzi (${R.dv})${was!=="ok"?": resta usurata, ma non peggiora":""}.`);}
  upd("inv",id,{segni:s,stato:wStato({...x,segni:s})});}

/* ---------- meteo che cambia da solo ---------- */
const BAGNA=/pioggia|temporale|neve|nevicata|nevischio|tormenta/i;
function meteoGiorno(prev){const st=STAG(month()),r=d(6),m=METEO[st][r-1];const old=S.clock.meteo||"";
  if(BAGNA.test(old)){let n=0;L.inv.filter(x=>x.tipo==="arma"&&mine(x)&&["in mano","addosso"].includes(x.dove)&&x.pulito!==prev).forEach(x=>{const ns=Math.min(wMax(x),(+x.segni||0)+1);upd("inv",x.id,{segni:ns,stato:wStato({...x,segni:ns})});n++;});if(n)toast(`Ieri ${old}, e ${n>1?"le armi non sono state pulite":"l'arma non è stata pulita"}: +1 segno.`);}
  S.clock.meteo=m;S.stat=S.stat||{};}
const METEOMOD=()=>{const m=S.clock.meteo||"";return /tormenta/i.test(m)?2:/pioggia forte|temporale|nevicata|nebbia/i.test(m)?1:0;};

/* ---------- statistiche ---------- */
function stat(k,n){S.stat=S.stat||{};S.stat[k]=(+S.stat[k]||0)+(n==null?1:n);}

/* ---------- suoni d'ambiente ---------- */
const AMB={on:false,t:null};
function ambLoop(){clearTimeout(AMB.t);if(!AMB.on||!SND.on||document.hidden){AMB.t=setTimeout(ambLoop,4000);return;}
  try{const m=S.clock.meteo||"",z=S.clock.luogo,per=perOf(z),h=+String(S.clock.ora||"12").slice(0,2),notte=h>=19||h<6,em=+S.emiss||0;
    const wv=/tormenta/i.test(m)?.09:/temporale|pioggia forte|nevicata/i.test(m)?.06:.03;noise(3.5,{ft:"lowpass",f:/tormenta/i.test(m)?900:420,vol:wv});
    if(/pioggia|temporale/i.test(m))for(let i=0;i<14;i++)noise(.01,{ft:"highpass",f:5000,vol:.05,at:Math.random()*3.5});
    const g=haveIt(/Geiger|Contatore|dosimetr/i);if(g){const n=Math.round(per*per*.8+(+S.tr.rad>=3?4:0));if(n)SFX.geiger(n);}
    if(notte&&d(6)===1){const f=380+Math.random()*120;tone(f,1.2,{type:"sine",vol:.025,to:f*.7,at:.5});tone(f*.98,1.4,{type:"sine",vol:.018,to:f*.6,at:1.9});}
    if(!notte&&d(8)===1)for(let i=0;i<3;i++)tone(2600+Math.random()*800,.06,{type:"sine",vol:.012,at:.3+i*.16});
    if(em>=3){tone(42,3.2,{type:"sine",vol:em>=5?.14:.07});if(em>=5&&d(3)===1)noise(1.2,{ft:"lowpass",f:160,vol:.2,at:1});}
    if(d(10)===1&&per>=3)tone(90,.4,{type:"triangle",vol:.03,to:70,at:2});
  }catch(_){}AMB.t=setTimeout(ambLoop,3600+Math.random()*1200);}

/* ---------- diario di fine partita ---------- */
function vPartita(){const st=S.stat||{};const E=typeof evS==="function"?evS():{};const morti=L.png.filter(p=>p.stato==="morto").map(p=>p.nome);const p=S.pg;
  const B=S.bestia||{};const ab=Object.keys(MUT).reduce((a,k)=>a+(+(B[k]||{}).uccisi||0),0);
  const righe=[["Giorni nella Zona",S.giorni||0],["Chilometri a piedi",st.km||0],["Tratti di viaggio",st.tratti||0],["Scontri",st.scontri||0],["Uomini messi fuori combattimento",st.uomini||0],["Mutanti abbattuti",ab],["Colpi sparati",st.colpi||0],["Campi di anomalie attraversati",st.campi||0],["Artefatti presi",st.artefatti||0],["Emissioni viste arrivare",st.emissioni||0],["Ferite critiche",st.critiche||0],["Nome",`${S.nomeRep||0} · ${NOMELV(+S.nomeRep||0)}`],["Rubli in tasca",fmtR(S.rubli||0)]];
  const ult=[...L.diario].sort((a,b)=>(a.ts||0)-(b.ts||0));
  return `<section class="pane partita" style="grid-column:1/-1"><div class="row" style="justify-content:space-between"><h2>La partita di ${esc(p.nome||"—")}${p.sopr?` «${esc(p.sopr)}»`:""}</h2><button class="btn g s noprint" data-x="stampa">Stampa o salva in PDF</button></div>
  ${E.fine?`<div class="fine"><b>${esc(E.fine.t)}</b><p>${esc(E.fine.testo||"")}</p></div>`:`<p class="small muted">La partita è ancora aperta. Quando arriverai a un finale, questa pagina diventa il tuo epilogo.</p>`}
  <table class="stat"><tbody>${righe.map(([k,v])=>`<tr><td>${k}</td><td class="num"><b>${esc(v)}</b></td></tr>`).join("")}</tbody></table>
  ${morti.length?`<h3>Chi è rimasto nella Zona</h3><p>${morti.map(esc).join(" · ")}</p>`:""}
  ${ult.length?`<h3>Dal diario</h3>${ult.map(x=>`<p class="small"><span class="muted num">${esc(dataIt(x.data))}${x.luogo?` · ${esc(x.luogo)}`:""}</span><br>${esc(x.testo)}</p>`).join("")}`:""}</section>`;}

/* ---------- agganci ---------- */
Object.assign(XA,{wclean:b=>wClean(b.dataset.k),wfix:b=>wFix(b.dataset.k),stampa:()=>setTimeout(()=>window.print(),50),
  amb:()=>{AMB.on=!AMB.on;LS.set("pda.amb",AMB.on);if(AMB.on){actx();ambLoop();toast("Suoni d'ambiente accesi.");}}});
window.addEventListener("load",()=>{
  if(typeof adv==="function"&&!adv._v){const _adv=adv;adv=function(min){const d0=S.clock.data,e0=+S.emiss||0,c0=(S.corpo||[]).filter(w=>w.crit).length;_adv(min);try{if(S.clock.data!==d0)meteoGiorno(d0);if((+S.emiss||0)>=6&&e0<6)stat("emissioni");}catch(e){console.error(e);}};adv._v=1;}
  if(typeof hitApply==="function"&&!hitApply._v){const _h=hitApply;hitApply=function(h){const c0=(S.corpo||[]).filter(w=>w.crit).length;const r=_h(h);try{if((S.corpo||[]).filter(w=>w.crit).length>c0)stat("critiche");}catch(_){}return r;};hitApply._v=1;}
  if(typeof vgLeg==="function"&&!vgLeg._v){const _l=vgLeg;vgLeg=function(){const V=S.viaggio;const i0=V&&V.i;const a=V&&V.p[V.i],z=V&&V.p[V.i+1];const k=1+METEOMOD()*.5;_l();try{const V2=S.viaggio;if(a&&z&&(!V2||V2.i!==i0)){const e=edge(a,z);stat("km",e[2]);stat("tratti");if(k>1){adv(Math.round(e[3]*(k-1)*60));(V2||{log:[]}).log&&V2&&V2.log.unshift(`Col tempo (${S.clock.meteo}) ci mettete di più.`);}}}catch(_){}};vgLeg._v=1;}
  if(typeof scStart==="function"&&!scStart._v){const _s=scStart;scStart=function(...a){_s(...a);stat("scontri");};scStart._v=1;}
  if(typeof scClose==="function"&&!scClose._v){const _c=scClose;scClose=function(){const C=S.scontro;if(C&&!C.mut)stat("uomini",C.ent.filter(e=>e.lato==="loro"&&["morto","fuori"].includes(e.stato)).length);_c();};scClose._v=1;}
  if(typeof anStart==="function"&&!anStart._v){const _a=anStart;anStart=function(...a){_a(...a);stat("campi");};anStart._v=1;}
  if(typeof anTake==="function"&&!anTake._v){const _t=anTake;anTake=function(){const had=S.anom&&S.anom.art;_t();if(had&&S.anom&&!S.anom.art)stat("artefatti");};anTake._v=1;}
  if(typeof qRoll==="function"&&!qRoll._v){const _q=qRoll;qRoll=function(...a){const R=_q(...a);if(R&&R.R&&R.R.spent)stat("colpi",R.R.spent);return R;};qRoll._v=1;}
  try{AMB.on=LS.get("pda.amb")===true;}catch(_){}ambLoop();});
