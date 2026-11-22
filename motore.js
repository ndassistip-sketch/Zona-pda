/* ===== Motore delle storie: eventi a condizioni, regista, seguiti ===== */
const EVP=["eventi/cordone.json","eventi/strada.json"];
const EVD={list:[],byId:{},ok:false};
async function evLoad(){try{const r=await fetch("eventi/trama.txt");if(r.ok){const t=(await r.text()).trim().split("").reverse().join("");const j=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(t),c=>c.charCodeAt(0))));(j.eventi||[]).forEach(e=>{e.trama=true;e._pack="trama";EVD.list.push(e);EVD.byId[e.id]=e;});EVD.atti=j.atti||[];}}catch(_){}
  for(const p of EVP){try{const r=await fetch(p);if(!r.ok)continue;const a=await r.json();(a.eventi||a).forEach(e=>{e._pack=p;EVD.list.push(e);EVD.byId[e.id]=e;});}catch(_){}}EVD.ok=true;try{render();}catch(_){}}
evLoad();
const evS=()=>{S.ev=S.ev||{};S.ev.flag=S.ev.flag||{};S.ev.visti=S.ev.visti||{};S.ev.coda=S.ev.coda||[];if(!S.ev.auto)S.ev.auto="normale";return S.ev;};
const pngBy=n=>{if(!n)return null;const q=String(n).toLowerCase();return L.png.find(p=>p.id===n)||L.png.find(p=>(p.nome||"").toLowerCase().includes(q));};
const haveN=n=>L.inv.find(y=>(typeof mine==="function"?mine(y):true)&&y.dove!=="deposito"&&(armOf(y.nome)?.n===n||(y.nome||"").toLowerCase().includes(String(n).toLowerCase()))&&y.stato!=="rotto");
const hourNow=()=>+((S.clock.ora||"12:00").split(":")[0]);
function evCond(c,ctx){if(!c)return true;const E=evS();
  if(c.luogo){const L0=[].concat(c.luogo);if(!L0.includes("*")&&!L0.includes(ctx.luogo||S.clock.luogo))return false;}
  if(c.momento&&c.momento!==(ctx.momento||"qui"))return false;
  if(c.ore){const [a,b]=c.ore,h=hourNow();if(a<=b?(h<a||h>=b):(h<a&&h>=b))return false;}
  if(c.data){const dd=S.clock.data||"";if((c.data[0]&&dd<c.data[0])||(c.data[1]&&dd>c.data[1]))return false;}
  if(c.visto&&![].concat(c.visto).every(id=>evS().visti[id]))return false;
  if(c.stagione&&![].concat(c.stagione).includes(STAG(month())))return false;
  if(c.meteo&&![].concat(c.meteo).some(m=>(S.clock.meteo||"").toLowerCase().includes(m)))return false;
  if(c.emiss&&((+S.emiss||0)<c.emiss[0]||(+S.emiss||0)>c.emiss[1]))return false;
  if(c.tensione&&((+S.tensione||5)<c.tensione[0]||(+S.tensione||5)>c.tensione[1]))return false;
  if(c.flag&&![].concat(c.flag).every(f=>E.flag[f]))return false;
  if(c.noflag&&[].concat(c.noflag).some(f=>E.flag[f]))return false;
  if(c.oggetto&&![].concat(c.oggetto).every(n=>haveN(n)))return false;
  if(c.senza&&[].concat(c.senza).some(n=>haveN(n)))return false;
  if(c.png){for(const n of [].concat(c.png)){const p=pngBy(n);if(!p||p.stato==="morto")return false;}}
  if(c.gruppo){for(const n of [].concat(c.gruppo)){const p=pngBy(n);if(!p||!p.con)return false;}}
  if(c.rubli&&(+S.rubli||0)<c.rubli)return false;
  if(c.nome&&(+S.nomeRep||0)<c.nome)return false;
  if(c.rapporto){for(const f in c.rapporto)if((+(S.rap||{})[f]||0)<c.rapporto[f])return false;}
  if(c.traccia){for(const k in c.traccia){const v=+S.tr[k]||0,[a,b]=c.traccia[k];if(v<a||v>b)return false;}}
  return true;}
function evOk(e,ctx){const E=evS();const v=E.visti[e.id];if(v){if(e.ripeti==="mai"||e.ripeti==null&&e.unico)return false;const cd=(e.ripeti&&+e.ripeti)||24;if(-minTo(v.last)<cd*60)return false;}return evCond(e.se,ctx);}
function evTrama(ctx={}){if(S.ev&&S.ev.fine)return null;return EVD.list.filter(e=>e.trama&&!e.solo_seguito&&!evS().visti[e.id]&&evCond(e.se,ctx)).sort((a,b)=>(a.ordine||0)-(b.ordine||0))[0]||null;}
function evPick(ctx={}){const tr=evTrama(ctx);if(tr)return tr;const t=+S.tensione||5;const cand=EVD.list.filter(e=>!e.trama&&!e.solo_seguito&&evOk(e,ctx));if(!cand.length)return null;
  const w=e=>(e.peso||10)*(e.tono==="guaio"?(t>=7?1.6:t<=3?.6:1):e.tono==="calmo"?(t>=7?.5:t<=3?1.5:1):1);
  let tot=cand.reduce((a,e)=>a+w(e),0),r=Math.random()*tot;for(const e of cand){r-=w(e);if(r<=0)return e;}return cand[0];}
const evFill=s=>String(s||"").replace(/\{io\}/g,S.pg.sopr||S.pg.nome||"stalker").replace(/\{luogo\}/g,S.clock.luogo||"").replace(/\{stalker\}/g,()=>pk(NOMI)).replace(/\{png:([^}]+)\}/g,(_,n)=>pngBy(n)?.nome||n);
function evShow(e,forced){if(!e)return false;const E=evS();E.visti[e.id]={n:((E.visti[e.id]||{}).n||0)+1,last:clk()};const testo=evFill(Array.isArray(e.testo)?pk(e.testo):e.testo);
  ui.ev={id:e.id,testo,fase:"scelta"};if(e.effetti)evApply(e.effetti,[]);try{sfx(e.tono==="guaio"?"job":"beep");}catch(_){}save();if(ui.tab!=="storie")toast(e.trama?`★ ${e.titolo}`:`Succede qualcosa: ${e.titolo}`);return true;}
function evRoll(spec){const [a,s]=String(spec.tiro).split("+").map(x=>x.trim());const sp=spec.spec&&new RegExp(spec.spec,"i").test(S.pg.spec||"")?1:0;const mal=malus(a);const steps=Math.max(-4,Math.min(4,(+spec.passi||0)+sp-mal));
  const [ga,gs]=grades(a,s&&s!=="-"?s:"",steps);const v=[d(DIE[ga])].concat(gs?[d(DIE[gs])]:[]);const n=v.reduce((t,x)=>t+succ(x),0);
  const txt=`${ATN[a]} ${ga}${gs?` + ${SKN[s]} ${gs}`:""}${sp?" (con "+spec.spec+")":""}${mal?` (malus −${mal})`:""}: ${v.join(", ")} → ${n} success${n===1?"o":"i"}`;
  add("tiri",{testo:`Storia «${EVD.byId[ui.ev.id]?.titolo||""}»: ${txt}`,succ:n,data:S.clock.data,ora:S.clock.ora});if(n===0){S.pe=(+S.pe||0)+1;}return {n,txt};}
function evApply(o,log){if(!o)return;const E=evS();
  if(o.tr){trAdd(o.tr);log.push(Object.entries(o.tr).map(([k,v])=>`${k} ${v>0?"+":""}${v}`).join(", "));}
  if(o.rubli){S.rubli=Math.max(0,(+S.rubli||0)+o.rubli);log.push(`${o.rubli>0?"+":""}${fmtR(o.rubli)}`);}
  if(o.pe){S.pe=(+S.pe||0)+o.pe;log.push(`+${o.pe} PE`);}
  if(o.nome){S.nomeRep=(+S.nomeRep||0)+o.nome;log.push(`Nome ${o.nome>0?"+":""}${o.nome}`);}
  if(o.rap){S.rap=S.rap||{};for(const f in o.rap){S.rap[f]=(+S.rap[f]||0)+o.rap[f];log.push(`Rapporto ${f} ${o.rap[f]>0?"+":""}${o.rap[f]}`);}}
  if(o.fid){for(const n in o.fid){const p=pngBy(n);if(p){upd("png",p.id,{fiducia:Math.max(-2,Math.min(2,(+p.fiducia||0)+o.fid[n]))});log.push(`${p.nome}: fiducia ${o.fid[n]>0?"+":""}${o.fid[n]}`);}}}
  if(o.flag)[].concat(o.flag).forEach(f=>E.flag[f]=clk());
  if(o.noflag)[].concat(o.noflag).forEach(f=>delete E.flag[f]);
  if(o.emiss){S.emiss=Math.max(0,Math.min(6,(+S.emiss||0)+o.emiss));}
  if(o.tensione){S.tensione=Math.max(1,Math.min(9,(+S.tensione||5)+o.tensione));}
  if(o.allerta){S.allerta=Math.max(0,Math.min(6,(+S.allerta||0)+o.allerta));log.push(`Allerta ${o.allerta>0?"+":""}${o.allerta}`);}
  if(o.oggetto)[].concat(o.oggetto).forEach(x=>{const it=typeof x==="string"?{n:x}:x;const e=armOf(it.n);add("inv",{nome:it.n,qta:it.qta||1,slot:e?e.slot:.5,dove:"zaino",stato:it.stato||"ok",nota:it.nota||(e?e.s:""),tipo:e?tipoOf(e):"altro",classe:e?classeOf(e.n):0,segni:0,...(it.colpi?{colpi:it.colpi}:{})});log.push(`preso: ${it.n}${(it.qta||1)>1?" ×"+it.qta:""}`);});
  if(o.togli)[].concat(o.togli).forEach(n=>{const y=haveN(n);if(y){useItem(y);log.push(`dato: ${y.nome}`);}});
  if(o.scorte){for(const k in o.scorte)S.scorte[k]=Math.max(0,(+S.scorte[k]||0)+o.scorte[k]);log.push(Object.entries(o.scorte).map(([k,v])=>`${k} ${v>0?"+":""}${v}`).join(", "));}
  if(o.msg)add("pda",{tipo:"msg",da:evFill(o.msg.da),fazione:o.msg.fazione||"",testo:evFill(o.msg.testo),data:S.clock.data,ora:S.clock.ora});
  if(o.radio)add("pda",{tipo:"radio",canale:o.radio.canale||"stalker",da:o.radio.da||"",testo:evFill(o.radio.testo),data:S.clock.data,ora:S.clock.ora,mio:true});
  if(o.lavoro)add("pda",{tipo:"lavoro",stato:"offerto",chiuso:false,luogo:S.clock.luogo,dim:0,...o.lavoro,titolo:evFill(o.lavoro.titolo),testo:evFill(o.lavoro.testo),da:evFill(o.lavoro.da),scadenza:o.lavoro.giorni?clkAdd(o.lavoro.giorni*1440).slice(0,10):o.lavoro.scadenza||""});
  if(o.png&&!pngBy(o.png.nome))add("png",{fiducia:0,stato:"vivo",luogo:S.clock.luogo,...o.png,nome:evFill(o.png.nome)});
  if(o.pngstato){for(const n in o.pngstato){const p=pngBy(n);if(p)upd("png",p.id,{stato:o.pngstato[n]});}}
  if(o.gruppo){for(const n in o.gruppo){const p=pngBy(n);if(p)upd("png",p.id,{con:!!o.gruppo[n],luogo:S.clock.luogo});}}
  if(o.seguito){E.coda.push({id:o.seguito,at:clkAdd((+o.dopo||60))});}
  if(o.colpo){try{const h={D:o.colpo.D||1,P:o.colpo.P||0,ex:0,...hitRoll()};hitApply(h);log.push("colpito: guarda la Salute");}catch(_){}}
  if(o.luogo){S.clock.luogo=o.luogo;gruppo().forEach(p=>upd("png",p.id,{luogo:o.luogo}));log.push(`ora sei a ${o.luogo}`);}
  if(o.fine){E.fine={t:o.fine,testo:evFill(o.fine_testo||""),quando:clk()};log.push("FINE");}
  if(o.tempo){adv(+o.tempo);log.push(`passano ${durTxt(+o.tempo)}`);}}
function evChoose(i){const e=EVD.byId[ui.ev.id];if(!e)return;const c=e.scelte[i];const log=[];let txt="",rr=null;
  if(c.tiro){rr=evRoll(c);const ok=rr.n>=(c.min||1);const r=ok?(rr.n>=2&&c.ottimo?c.ottimo:c.ok):c.ko;txt=evFill(r&&r.testo||"");evApply(r,log);try{sfx("dice");}catch(_){}}
  else{txt=evFill(c.esito&&c.esito.testo||"");evApply(c.esito,log);}
  ui.ev={...ui.ev,fase:"esito",scelta:evFill(c.t),esito:txt,tiro:rr&&rr.txt,log};
  soloPush(`Storia · ${e.titolo}`,[esc(ui.ev.testo),`<b>${esc(ui.ev.scelta)}</b>${rr?` — ${esc(rr.txt)}`:""}`,esc(txt),log.length?`<span class="muted">${esc(log.join(" · "))}</span>`:""].filter(Boolean));
  add("diario",{testo:`${e.titolo}: ${ui.ev.scelta}. ${txt}${log.length?" ("+log.join(", ")+")":""}`,data:S.clock.data,ora:S.clock.ora,luogo:S.clock.luogo});save();}
/* il regista: dopo il tempo che passa, a volte succede qualcosa */
const AUTO={spento:0,raro:.06,normale:.12,spesso:.22};
function evTick(min,ctx={}){if(!EVD.ok||ui.ev)return;const E=evS();
  const due=E.coda.filter(q=>minTo(q.at)<=0);if(due.length){E.coda=E.coda.filter(q=>!due.includes(q));const e=EVD.byId[due[0].id];if(e&&evCond(e.se,ctx)){evShow(e,true);return;}}
  if(min>=15){const tr=evTrama(ctx);if(tr){evShow(tr,true);return;}}
  const ph=AUTO[E.auto]??.12;if(!ph||min<15)return;const p=1-Math.pow(1-ph*(0.7+(+S.tensione||5)/10),Math.min(min,360)/60);if(Math.random()<Math.min(.6,p))evShow(evPick(ctx));}
function evBox(){const v=ui.ev;if(!v)return "";const e=EVD.byId[v.id];if(!e){ui.ev=null;return "";}
  const sc=(e.scelte||[]).map((c,i)=>[c,i]).filter(([c])=>evCond(c.se,{}));
  return `<div class="evbox ${e.tono||""}${e.trama?" trama":""}"><div class="row" style="justify-content:space-between"><b class="evt">${e.trama?"★ ":""}${esc(e.titolo)}</b><span class="small muted">${esc(S.clock.luogo||"")} · ${esc(S.clock.ora||"")}</span></div>
    <p class="evtx">${esc(v.testo)}</p>
    ${v.fase==="scelta"?`<div class="evsc">${sc.map(([c,i])=>`<button class="btn ${c.tiro?"":"g"}" data-a="evc" data-k="${i}">${esc(evFill(c.t))}${c.tiro?`<small>${esc(c.tiro.split("+").map(x=>ATN[x.trim()]||SKN[x.trim()]||x).join(" + "))}${c.spec?" · "+esc(c.spec):""}</small>`:""}</button>`).join("")||`<button class="btn" data-a="evx">Va bene</button>`}</div>`
    :`<p class="small"><b>${esc(v.scelta)}</b>${v.tiro?` — ${esc(v.tiro)}`:""}</p><p class="evtx">${esc(v.esito)}</p>${v.log&&v.log.length?`<p class="small muted">${esc(v.log.join(" · "))}</p>`:""}<button class="btn" data-a="evx">Continua</button>`}</div>`;}
function vStorie(){const E=evS();const nv=EVD.list.filter(e=>!e.trama).length;const fl=Object.keys(E.flag);const atto=E.flag.atto3?3:E.flag.atto2?2:1;const AT=(EVD.atti||[])[atto-1]||{};const tappe=EVD.list.filter(e=>e.trama&&E.visti[e.id]).length;
  return `<div class="grid"><section class="pane"><h2>La Zona viva</h2>
    ${E.fine?`<div class="fine"><h3>${esc(E.fine.t)}</h3><p>${esc(E.fine.testo)}</p><p class="small muted">${esc(dataIt(E.fine.quando.slice(0,10)))}</p></div>`:`<p class="atto"><b>Atto ${atto}${AT.titolo?" — "+esc(AT.titolo):""}</b><br><span class="small">${esc(AT.spunto||"")}</span><br><span class="small muted">Tappe della storia vissute: ${tappe}</span></p>`}
    <p class="small muted" style="margin-top:0">Il PDA racconta la Zona da solo: ${nv} storie caricate. Quando fai passare il tempo, a volte succede qualcosa; puoi anche chiederlo tu.</p>
    <button class="btn" data-a="evgo" style="width:100%">Cosa succede qui?</button>
    <div class="row" style="gap:6px;margin-top:10px"><span class="lbl" style="margin:0">Il regista</span>${Object.keys(AUTO).map(k=>`<button class="chip" data-a="evauto" data-k="${k}" aria-pressed="${E.auto===k}">${k}</button>`).join("")}</div>
    <p class="small muted">Più alta la Tensione (Oracolo), più guai e meno quiete.</p>
    ${E.coda.length?`<h3>In arrivo</h3><p class="small">${E.coda.length} seguit${E.coda.length===1?"o":"i"} di storie già cominciate.</p>`:""}</section>
  <section class="pane"><h2>Il narratore</h2>${typeof chatBox==="function"?chatBox("narratore"):""}</section></div>`;}
