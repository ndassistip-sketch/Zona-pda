/* ===== La base: fondarla, costruirla, difenderla ===== */
const BS_F="La tua gente";
AL_COL[BS_F]="#3fd0d0";AL_SIG[BS_F]="Tua gente";AL_STR[BS_F]=1.2;AL_CAP[BS_F]=0;AL_ENE[BS_F]="Banditi|Monolite|Mutanti";
const BS_TIPI=["rifugio","bunker","fattoria","accampamento","deposito"];
const BS_ST={
 brande:{n:"Brande e stufa",p:8000,g:2,d:"Dormire al caldo e al sicuro. +1 al presidio.",def:1},
 officina:{n:"Officina",p:25000,g:4,d:"Riparare senza kit (1 ora, −2 segni). Garage sicuro per i mezzi."},
 infermeria:{n:"Infermeria",p:30000,g:4,d:"Ogni giorno passato alla base: −1 Ferite in più."},
 deposito:{n:"Deposito",p:15000,g:3,d:"Un magazzino che nessuno svuota: un nascondiglio sicuro."},
 radio:{n:"Stazione radio",p:20000,g:3,d:"Voci e contratti in più; avvisa degli attacchi prima che arrivino."},
 orto:{n:"Orto",p:12000,g:5,d:"+1 cibo al giorno nelle scorte della base."},
 serra:{n:"Serra",p:30000,g:5,d:"+2 cibo al giorno, anche d'inverno.",req:"orto"},
 sacchi:{n:"Sacchi di sabbia",p:10000,g:2,d:"Difesa +3.",def:3},
 mitra:{n:"Mitragliatrice fissa",p:45000,g:2,d:"Una PKM su treppiede alla finestra. Difesa +6.",def:6,req:"sacchi"},
 mine:{n:"Campo minato",p:18000,g:1,d:"Difesa +4. Dopo ogni attacco va rimesso.",def:4}};
const bsS=()=>{const A=alS();return A.base||null;};
const bsShort=p=>(p.nome.match(/«([^»]+)»/)||[])[1]||p.nome;
function bsGuards(){const B=bsS();if(!B)return[];return L.png.filter(p=>p.stato!=="morto"&&p.ruolo==="guardia"&&p.guardia===B.poi);}
function bsDef(){const B=bsS();if(!B)return 0;let d=1+2*bsGuards().length;for(const k in B.st)if(B.st[k]&&BS_ST[k].def)d+=BS_ST[k].def;if(S.clock.poi===B.poi)d+=3+L.png.filter(p=>p.con&&p.stato!=="morto").length;try{if(typeof mzBaseDef==="function")d+=mzBaseDef();}catch(_){}return d;}
function bsSync(){const B=bsS();if(!B||B.persa)return;const c=alS().c[B.poi];if(!c||c[0]!==BS_F){B.persa=1;return;}c[1]=bsDef();}
/* chi è ostile alla tua gente: sempre banditi, Monolite e mutanti; gli altri con Rapporto −2 o peggio */
function bsHost(){const hs=["Banditi","Monolite","Mutanti"];for(const f of ["Dovere","Libertà","Mercenari","Esercito","Stalker liberi","Scienziati"])if((+(S.rap||{})[f]||0)<=-2)hs.push(f);
  AL_ENE[BS_F]=hs.join("|");for(const f in AL_ENE){if(f===BS_F)continue;const l=AL_ENE[f].split("|").filter(x=>x&&x!==BS_F);if(hs.includes(f))l.push(BS_F);AL_ENE[f]=l.join("|");}}

function bsFonda(){const p=alHere();if(!p)return;if(bsS()&&!bsS().persa){toast("Hai già una base.");return;}const [g]=alCtl(p.id);
  if(!BS_TIPI.includes(AL_T[p.t])){toast("Qui non si può fare una base: serve un rifugio, un bunker, una fattoria, un accampamento o un deposito.");return;}
  if(g&&g!==BS_F){toast(`Qui comandano ${g}. Prima va ripulito.`);return;}if((+S.rubli||0)<5000){toast("Servono 5.000 ₽ di materiali.");return;}
  S.rubli-=5000;const old=bsS();const A=alS();A.base={poi:p.id,nome:p.n,st:old&&old.poi===p.id?old.st:{},cant:null,sc:{cibo:0,comb:0},fond:S.clock.data,log:[]};A.c[p.id]=[BS_F,1];bsHost();bsSync();
  alLog(p,`${S.pg.sopr||"Uno stalker"} ha fatto di ${p.n} (${p.z}) la sua base.`,1);try{add("diario",{testo:`Da oggi ${p.n} è casa mia. Quattro muri, un tetto che perde, e il primo posto nella Zona dove posso chiudere gli occhi.`,data:S.clock.data,ora:S.clock.ora,luogo:p.z});}catch(_){}
  adv(240);toast("La base è tua.");}
function bsBuild(k){const B=bsS();const r=BS_ST[k];if(!B||!r||B.persa)return;if(B.cant){toast("C'è già un cantiere aperto.");return;}if(r.req&&!B.st[r.req]){toast(`Prima serve: ${BS_ST[r.req].n}.`);return;}if(B.st[k]){toast("C'è già.");return;}
  if((+S.rubli||0)<r.p){toast(`Servono ${fmtR(r.p)}.`);return;}S.rubli-=r.p;B.cant={k,g:r.g};toast(`Cantiere aperto: ${r.n}. ${r.g} giorni di lavoro, meno se c'è gente alla base.`);}
function bsLog(t){const B=bsS();if(!B)return;B.log=B.log||[];B.log.unshift(`${S.clock.data.slice(5)} · ${t}`);B.log=B.log.slice(0,12);}

/* ogni giorno: cantiere, orto, scorte, guarigione */
function bsDay(n){const B=bsS();if(!B||B.persa)return;bsHost();const G=bsGuards();const inv=[10,11,0,1,2].includes(new Date(S.clock.data).getMonth())||new Date(S.clock.data).getMonth()===9;
  for(let i=0;i<Math.min(n,7);i++){
    if(B.cant){const w=1+G.reduce((a,p)=>a+(p.ruolo==="guardia"&&(p.tratti||[]).includes("mani")?1:.5),0)+(S.clock.poi===B.poi?1:0);B.cant.g-=w;if(B.cant.g<=0){B.st[B.cant.k]=1;bsLog(`Finito: ${BS_ST[B.cant.k].n}.`);toast(`Alla base è pronto: ${BS_ST[B.cant.k].n}.`);if(B.cant.k==="deposito"){S.nasc=S.nasc||[];if(!S.nasc.some(x=>x.id==="base"))S.nasc.push({id:"base",nome:"Deposito della base",zona:AL_BY[B.poi].z,ultimo:S.clock.data});}B.cant=null;}}
    if(B.st.orto)B.sc.cibo+=1;if(B.st.serra)B.sc.cibo+=2;
    const need=G.length;if(need){if(B.sc.cibo>=need)B.sc.cibo-=need;else{B.sc.cibo=0;G.forEach(p=>upd("png",p.id,{fiducia:Math.max(-2,(+p.fiducia||0)-1)}));bsLog("Le guardie hanno fatto la fame.");try{add("pda",{tipo:"msg",da:G[0].nome,testo:"Alla base non c'è più da mangiare. Gli uomini brontolano. Io pure.",data:S.clock.data,ora:S.clock.ora});}catch(_){}}}
    if(B.st.brande&&inv&&need){if(B.sc.comb>=1)B.sc.comb-=1;else{G.forEach(p=>upd("png",p.id,{fiducia:Math.max(-2,(+p.fiducia||0)-1)}));bsLog("Stufa spenta: freddo e malumore.");}}
    if(B.st.infermeria&&S.clock.poi===B.poi&&(+S.tr.ferite||0)>0){S.tr.ferite--;const w=(S.corpo||[]).find(w=>(+w.d||0)>0);if(w)w.d--;}
    if(B.st.radio&&typeof ctGen==="function"){ctGen();ctGen();}}
  bsSync();}
(function hookDay2(){if(typeof adv!=="function"||!adv._rc){setTimeout(hookDay2,300);return;}if(adv._bs)return;const _a=adv;
  adv=function(min){const d0=S.clock.data;const r=_a(min);try{const n=Math.round((Date.parse(S.clock.data)-Date.parse(d0))/864e5);if(n>0)bsDay(n);bsWarn();bsSync();}catch(e){console.error(e);}return r;};for(const k in _a)try{adv[k]=_a[k];}catch(_){}adv._bs=1;})();

/* avviso degli attacchi: con la radio subito, senza radio quando mancano 2 ore */
function bsWarn(){const B=bsS();if(!B||B.persa)return;alS().q.filter(s=>s.to===B.poi&&!s._bw&&alEne(s.f,BS_F)&&(B.st.radio||s.eta<=2)).forEach(s=>{s._bw=1;const t=`${s.f==="Mutanti"?`Un branco di ${s.cap}`:`Una squadra di ${s.f}`} (${s.n}) marcia verso la base. Arrivo tra ${s.eta} ${s.eta===1?"ora":"ore"}.`;
  try{add("pda",{tipo:"msg",da:bsGuards()[0]?bsGuards()[0].nome:"la radio della base",testo:t,data:S.clock.data,ora:S.clock.ora});}catch(_){}toast(t);bsLog(t);});}
/* l'attacco: il presidio conta guardie, difese e te, se ci sei */
(function hookArr2(){if(typeof alArrive!=="function"||!alArrive._ct){setTimeout(hookArr2,300);return;}if(alArrive._bs)return;const _a=alArrive;
  alArrive=function(s,p){const B=bsS();if(!B||B.persa||p.id!==B.poi||!alEne(s.f,BS_F)){_a(s,p);return;}bsSync();const d0=alS().c[p.id][1];_a(s,p);const c=alS().c[p.id];const G=bsGuards();
    if(c[0]===BS_F){c[1]=bsDef();bsLog(`Respinto l'attacco di ${s.f} (${s.n}).`);if(B.st.mine){B.st.mine=0;bsLog("Il campo minato è saltato: va rimesso.");}
      if(G.length&&Math.random()<.4){const g=alRand(G);upd("png",g.id,{fer:Math.min(4,(+g.fer||0)+1)});bsLog(`${g.nome} è ferito.`);}
      try{add("diario",{testo:`Hanno attaccato la base: ${s.f==="Mutanti"?"mutanti":s.f}, in ${s.n}. Li abbiamo respinti.${S.clock.poi===p.id?" Ero lì.":" Io non c'ero: l'hanno tenuta i miei."}`,data:S.clock.data,ora:S.clock.ora,luogo:p.z});}catch(_){}toast("La base ha respinto l'attacco.");}
    else{B.persa=1;const ks=Object.keys(B.st).filter(k=>B.st[k]);if(ks.length){const k=alRand(ks);B.st[k]=0;bsLog(`Distrutto: ${BS_ST[k].n}.`);}B.sc={cibo:0,comb:0};
      G.forEach(g=>{if(Math.random()<.5)upd("png",g.id,{stato:"morto",con:false});else upd("png",g.id,{ruolo:"scorta",guardia:null});});
      bsLog(`Base perduta: l'hanno presa ${s.f}.`);try{add("diario",{testo:`Abbiamo perso la base. ${s.f==="Mutanti"?"I mutanti":s.f} l'hanno presa. Chi era di guardia è morto o è scappato. Bisogna riprenderla.`,data:S.clock.data,ora:S.clock.ora,luogo:p.z});}catch(_){}toast("Hai perso la base.");}};
  alArrive._ct=1;alArrive._bs=1;})();

/* riprendere la base: quando il punto è di nuovo vuoto (o lo hai ripulito) */
function bsRiprendi(){const B=bsS();const p=alHere();if(!B||!p||p.id!==B.poi)return;const [g]=alCtl(p.id);if(g&&g!==BS_F){toast(`Ci sono ancora ${g}. Prima lo Scontro, poi «L'ho ripulito».`);return;}
  alS().c[p.id]=[BS_F,1];B.persa=0;bsSync();bsLog("Base ripresa.");toast("La base è di nuovo tua.");}
function bsRipara(id){const B=bsS();const y=L.inv.find(x=>x.id===id);if(!B||!B.st.officina||!y)return;const s=Math.max(0,(+y.segni||0)-2);upd("inv",y.id,{segni:s,stato:s>=4?"rotto":s>=2?"usurato":"ok"});adv(60);toast(`${y.nome}: riparato in officina.`);}
function bsDorme(){ui.notte={dove:"base",ore:8,tenda:false,forn:false,stufa:true,fuoco:false,bagnato:false};ui.tab="scheda";toast("Notte alla base impostata: la trovi in fondo alla Scheda.");}

/* ---- pannello ---- */
function bsPanel(){const B=bsS();const here=alHere();
  if(!B){const ok=here&&BS_TIPI.includes(AL_T[here.t])&&(!alCtl(here.id)[0]||alCtl(here.id)[0]===BS_F);
    return `<section class="card"><h3>La base</h3><p class="small">Non hai ancora una base. Ti serve un rifugio, un bunker, una fattoria, un accampamento o un deposito vuoto: lo sistemi con 5.000 ₽ di materiali e mezza giornata di lavoro, e da quel momento è casa tua, e sulla mappa è della tua gente.</p>${ok?`<button class="btn" data-bs="fonda">Fai di ${esc(here.n)} la tua base</button>`:`<p class="small muted">Qui non si può: ${here?esc(AL_T[here.t]):""}${here&&alCtl(here.id)[0]?`, tenuto da ${esc(alCtl(here.id)[0])}`:""}.</p>`}</section>`;}
  const p=AL_BY[B.poi];const qui=here&&here.id===B.poi;const G=bsGuards();const [g,n]=alCtl(B.poi);const inc=alS().q.filter(s=>s.to===B.poi&&alEne(s.f,BS_F));
  const worn=qui&&B.st.officina?L.inv.filter(y=>(+y.segni||0)>0&&y.dove!=="deposito"&&!String(y.dove||"").startsWith("png:")):[];
  return `<section class="card"><h3>La base · ${esc(p.n)}</h3><p class="small">${esc(p.z)} · fondata il ${esc(dataIt(B.fond))}${B.persa?` · <b style="color:#c44">perduta${g?`: ora è di ${esc(g)}`:""}</b>`:` · presidio: <b>${n}</b> (${G.length} di guardia)`}${qui?" · <b>sei qui</b>":""}</p>
  ${inc.length&&!B.persa?`<p class="small" style="border-left:3px solid #c44;padding-left:8px">In arrivo: ${inc.map(s=>`${esc(s.f)} (${s.n}) tra ${s.eta} h`).join(", ")}${B.st.radio?"":" — senza radio lo sapresti solo all'ultimo."}</p>`:""}
  ${B.persa?(qui?`<button class="btn" data-bs="riprendi">Riprendi la base</button>`:`<button class="btn g" data-bs="vai">${p.z===S.clock.luogo?"Vai":"Meta"}</button>`):`
  <div class="row" style="gap:6px;flex-wrap:wrap;margin:6px 0">${qui?`${B.st.brande?`<button class="btn g s" data-bs="dormi">Dormi alla base</button>`:""}`:`<button class="btn g s" data-bs="vai">${p.z===S.clock.luogo?"Vai alla base":"Meta: la base"}</button>`}</div>
  <h4 style="margin:8px 0 2px">Scorte della base</h4><p class="small">Cibo <b>${B.sc.cibo}</b> · combustibile <b>${B.sc.comb}</b> · al giorno: ${G.length} cibo${B.st.brande?`, 1 combustibile d'inverno`:""}${B.st.orto||B.st.serra?` · l'orto ne dà ${(B.st.orto?1:0)+(B.st.serra?2:0)}`:""}</p>
  ${qui?`<div class="row" style="gap:6px;flex-wrap:wrap">${[["cibo",1],["cibo",5],["comb",1],["comb",5]].map(([k,q])=>`<button class="btn g s" data-bs="dep" data-k="${k}" data-q="${q}">+${q} ${k==="cibo"?"cibo":"combustibile"}</button>`).join("")}<button class="btn g s" data-bs="ritira" data-k="cibo">Prendi 1 cibo</button></div>`:""}
  <h4 style="margin:10px 0 2px">Stanze</h4><div style="display:grid;gap:4px">${Object.entries(BS_ST).map(([k,r])=>{const has=B.st[k];const c=B.cant&&B.cant.k===k;return `<div class="row small" style="justify-content:space-between;gap:6px;border-bottom:1px dashed var(--line);padding:2px 0"><span><b>${r.n}</b> <span class="muted">${esc(r.d)}</span></span><span>${has?"✔":c?`cantiere: ${Math.max(0,Math.ceil(B.cant.g))} g`:`<button class="btn g s" data-bs="build" data-k="${k}" ${B.cant||(r.req&&!B.st[r.req])?"disabled":""}>${fmtR(r.p)} · ${r.g} g</button>`}</span></div>`;}).join("")}</div>
  <p class="small muted">Lavorano al cantiere ogni giorno: 1, più mezzo per ogni guardia (uno intero se ha Mani d'oro), più uno se ci sei tu. Le reclute con ruolo «Guardia» lasciate qui difendono la base e mangiano dalle sue scorte.</p>
  ${worn.length?`<h4 style="margin:10px 0 2px">Officina</h4>${worn.map(y=>`<div class="row small" style="justify-content:space-between"><span>${esc(y.nome)} · ${y.segni} segni</span><button class="btn g s" data-bs="ripara" data-id="${y.id}">Ripara (1 h)</button></div>`).join("")}`:""}`}
  ${(B.log||[]).length?`<h4 style="margin:10px 0 2px">Diario della base</h4><div class="small">${B.log.slice(0,6).map(esc).join("<br>")}</div>`:""}</section>`;}
document.addEventListener("click",e=>{const b=e.target.closest("[data-bs]");if(!b||b.disabled)return;const a=b.dataset.bs;const B=bsS();
  if(a==="fonda")bsFonda();else if(a==="build")bsBuild(b.dataset.k);else if(a==="riprendi")bsRiprendi();else if(a==="ripara")bsRipara(b.dataset.id);else if(a==="dormi")bsDorme();
  else if(a==="vai"&&B)alGo(B.poi);
  else if(a==="dep"&&B){const k=b.dataset.k,q=+b.dataset.q;if((+S.scorte[k]||0)<q){toast("Non ne hai abbastanza.");return;}S.scorte[k]-=q;B.sc[k]+=q;}
  else if(a==="ritira"&&B){if(B.sc.cibo<1)return;B.sc.cibo--;S.scorte.cibo=(+S.scorte.cibo||0)+1;}
  bsSync();save();});
(function hookV4(){if(typeof V!=="object"||!V.mappa||!V.mappa._ct){setTimeout(hookV4,300);return;}if(V.mappa._bs)return;const _m=V.mappa;
  V.mappa=function(){let h=_m.apply(this,arguments);let bp="";try{bp=bsPanel();}catch(e){console.error(e);}const i=h.indexOf(`<section class="card"><h3>Contratti`);return i>=0?h.slice(0,i)+bp+h.slice(i):h+bp;};V.mappa._al=1;V.mappa._ct=1;V.mappa._bs=1;setTimeout(()=>{try{bsHost();bsSync();}catch(_){}},1000);})();
