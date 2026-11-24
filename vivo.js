/* ===== La Zona viva, seconda parte: persone che si spostano, squadre sulla mappa,
   Scontro che sa di mezzi, armi pesanti e contratti ===== */

/* ---- 1. le persone con un nome si spostano tra i punti ---- */
const VV_FISSI=/mercante|barman|scienziat/i;
const vvFaz=p=>{const f=(p.fazione||"").toLowerCase();return f.includes("dovere")?"Dovere":f.includes("libert")?"Libertà":f.includes("bandit")?"Banditi":f.includes("mercen")?"Mercenari":f.includes("milit")||f.includes("esercit")?"Esercito":f.includes("scienz")?"Scienziati":"Stalker liberi";};
const vvVaga=p=>p.stato!=="morto"&&!p.con&&p.ruolo!=="guardia"&&!/uscit|partit|scompars/.test(p.stato||"")&&!VV_FISSI.test(p.fazione||"")&&(p.vaga||!(typeof tramaOn==="function"&&tramaOn()));
function vvCasa(p){const f=vvFaz(p);const z=p.luogo||S.clock.luogo;const cand=alZ(z).filter(q=>{const g=alCtl(q.id)[0];return g===f||(f==="Stalker liberi"&&!g&&["rifugio","accampamento","rovine","fattoria"].includes(AL_T[q.t]))||(g&&!alEne(f,g)&&["base","mercante","rifugio"].includes(AL_T[q.t]));});return (cand.length?alRand(cand):alMain(z)||{}).id;}
function vvDay(){L.png.forEach(p=>{if(!vvVaga(p))return;const ch={};if(!p.poi||!AL_BY[p.poi]||AL_BY[p.poi].z!==p.luogo){ch.poi=vvCasa(p);}
    if(Math.random()<.3){let z=p.luogo||S.clock.luogo;if(Math.random()<.2){try{const nb=EDGES.filter(e=>e[0]===z||e[1]===z).map(e=>e[0]===z?e[1]:e[0]).filter(x=>!["La centrale","Pripjat'"].includes(x)||vvFaz(p)==="Monolite");if(nb.length)z=alRand(nb);}catch(_){}}
      const old=AL_BY[p.poi]?AL_BY[p.poi].n:"";ch.luogo=z;const tmp={...p,luogo:z};ch.poi=vvCasa(tmp);const nw=AL_BY[ch.poi];
      if(nw&&p.imp&&(p.fiducia||0)>=1&&Math.random()<.35){try{add("pda",{tipo:"msg",da:p.nome,fazione:p.fazione||"",testo:alRand([`Sono a ${nw.n} (${nw.z}), se passi.`,`Mi sono spostato a ${nw.n}. Qui almeno si dorme.`,`Ti scrivo da ${nw.n}. Se hai bisogno, sai dove trovarmi.`]),data:S.clock.data,ora:S.clock.ora});}catch(_){}}}
    if(Object.keys(ch).length){upd("png",p.id,ch);Object.assign(p,ch);}});}
const vvQui=poi=>L.png.filter(p=>p.stato!=="morto"&&!p.con&&(p.poi===poi||(p.ruolo==="guardia"&&p.guardia===poi)));

/* ---- 2. squadre in marcia visibili sulla mappa ---- */
(function hookSq(){if(typeof alMapUpdate!=="function"||typeof alHour!=="function"||!alHour._mz){setTimeout(hookSq,300);return;}if(alMapUpdate._vv)return;
  const _h=alHour;alHour=function(){const A=alS();const n0=A.q.length;_h();A.q.forEach(s=>{if(s.e0==null)s.e0=Math.max(1,s.eta);});};alHour._ct=1;alHour._mz=1;alHour._vv=1;
  const _u=alMapUpdate;alMapUpdate=function(){_u();try{vvSquads();}catch(e){console.error(e);}};alMapUpdate._vv=1;})();
function vvSquads(){const M=window.Map3D;if(!M||!M._alLay)return;let L2=M._vvLay;if(!L2){L2=document.createElement("div");L2.className="al vv";M._alLay.parentNode.appendChild(L2);M._vvLay=L2;const st=document.createElement("style");st.textContent=`.m2d-in .vv{pointer-events:none}.m2d-in .vv u{position:absolute;width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:12px solid var(--c);margin:-6px 0 0 -7px;transform:scale(calc(1 / var(--k,1))) rotate(var(--r,0deg));filter:drop-shadow(0 0 1px #000);text-decoration:none}.m2d-in .vv s{position:absolute;transform:translate(8px,-50%) scale(calc(1 / var(--k,1)));transform-origin:0 50%;font:600 9px var(--f-h);color:#eef3df;background:#141a10bb;padding:0 3px;border-radius:2px;text-decoration:none;white-space:nowrap;display:none}.m2d.zz .m2d-in .vv s{display:block}.m2d-in .vv i{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;transform:scale(calc(1 / var(--k,1)));font-style:normal;font-size:20px;line-height:26px;text-align:center;filter:drop-shadow(0 0 2px #000)}`;document.head.appendChild(st);}
  const merc=(lat,lon)=>{const Z0=12,X0=2384,Y0=1361,PW=3328,PH=2560,n=2**Z0*256,r=lat*Math.PI/180;return [((lon+180)/360*n-X0*256)/PW,((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n-Y0*256)/PH];};
  const A=alS();let h="";A.q.forEach(s=>{const a=AL_BY[s.da],b=AL_BY[s.to];if(!a||!b)return;const e0=s.e0||s.eta+1;const f=Math.max(.05,Math.min(.95,1-s.eta/e0));const la=a.la+(b.la-a.la)*f,lo=a.lo+(b.lo-a.lo)*f;const [u,v]=merc(la,lo);const [ub,vb]=merc(b.la,b.lo);const ang=Math.atan2(vb-v,ub-u)*180/Math.PI+90;
    h+=`<u style="left:${(u*100).toFixed(3)}%;top:${(v*100).toFixed(3)}%;--c:${AL_COL[s.f]||"#999"};--r:${ang.toFixed(0)}deg"></u><s style="left:${(u*100).toFixed(3)}%;top:${(v*100).toFixed(3)}%">${esc(AL_SIG[s.f]||s.f)} ${s.n} → ${esc(b.n)}</s>`;});
  try{const H=mzS().heli;if(H){const m=alMain(H.z);if(m){const [u,v]=merc(m.la+.004,m.lo+.006);h+=`<i style="left:${(u*100).toFixed(3)}%;top:${(v*100).toFixed(3)}%" title="${esc(H.t)}">🚁</i>`;}}}catch(_){}
  L2.innerHTML=h;}

/* il popup del punto mostra anche chi c'è */
(function hookPop(){if(typeof alPop!=="function"){setTimeout(hookPop,300);return;}if(alPop._vv)return;const _p=alPop;alPop=function(){_p();try{const M=window.Map3D;const pop=M&&M._alPop;if(!pop||pop.hidden||!ui.alSel)return;const q=vvQui(ui.alSel);if(q.length){const d=document.createElement("div");d.className="small";d.textContent="Qui: "+q.map(p=>p.nome).join(", ");pop.insertBefore(d,pop.querySelector(".r"));}}catch(_){}};alPop._vv=1;})();

/* ---- 3. Scontro: mezzo come riparo e KPVT, OG-7V su più bersagli, contratti e punti chiusi da soli ---- */
let VV_OG=0;
(function hookSc(){if(typeof scStart!=="function"||typeof hitNpc!=="function"||typeof scClose!=="function"||typeof mzSk!=="function"){setTimeout(hookSc,300);return;}if(scStart._vv)return;
  const _s=scStart;scStart=function(k,mut,opt){_s(k,mut,opt);try{const C=S.scontro;if(!C)return;const v=typeof mzAct==="function"?mzAct():null;C.poi=S.clock.poi;
      if(v&&v.luogo===S.clock.luogo){const V=MZ_V[v.t];const cop=v.t==="brdm"?2:1;C.ent.filter(e=>e.lato==="noi").forEach(e=>e.cop=Math.max(e.cop||0,cop));
        sgLog(C.log,`Il ${V.n} fa da riparo: ${cop===2?"riparo pesante":"riparo leggero"} per tutto il gruppo.`);
        if(v.t==="brdm"&&v.kpvt){C.ent.push({id:"mzk",n:"KPVT del BRDM",lato:"noi",d:"B",D:4,P:5,raff:3,t:2,dmg:0,stato:"ok",cop:2,ini:d(10)});sgLog(C.log,"La KPVT sulla torretta entra nello scontro.");}}}catch(e){console.error(e);}};scStart._vv=1;
  const _k=mzSk;mzSk=function(W){try{const x=L.inv.find(y=>y.id===W.id)||W;VV_OG=/OG-7V/.test(x.mun||"")?1:0;setTimeout(()=>{VV_OG=0;},0);}catch(_){}return _k(W);};
  const _h=hitNpc;hitNpc=function(t,dmg,P,txt,zona){const og=VV_OG&&t.lato==="loro";VV_OG=0;_h(t,dmg,P,txt,zona);
    if(og){const C=S.scontro;C.ent.filter(e=>e.lato==="loro"&&e!==t&&e.stato==="ok").slice(0,3).forEach(e=>{if(Math.random()<.6)_h(e,Math.max(1,dmg-1),Math.max(1,P-1),"Schegge dell'OG-7V");});}};
  const _c=scClose;scClose=function(){const C=S.scontro;let win=false,mut=false,poi=null;try{if(C){const loro=C.ent.filter(e=>e.lato==="loro");win=loro.length>0&&loro.every(e=>e.stato!=="ok");mut=!!C.mut;poi=C.poi||S.clock.poi;}}catch(_){}
    _c();try{if(win&&poi&&AL_BY[poi]&&poi===S.clock.poi)vvVittoria(poi,mut);}catch(e){console.error(e);}};})();
function vvVittoria(poi,mut){const p=AL_BY[poi];const [g]=alCtl(poi);const A=ctS();
  const c=A.ctr.find(c=>c.stato==="preso"&&c.poi===poi&&(c.k==="ripulisci"?mut:c.k==="prendi"?!mut:false));
  if(c){if(c.k==="prendi"){A.c[poi]=[c.f,3];alLog(p,`${p.n} (${p.z}) adesso è di ${c.f}: l'ha preso ${S.pg.sopr||"uno stalker"}.`,1);}else{A.c[poi]=["",0];alLog(p,`${S.pg.sopr||"Uno stalker"} ha ripulito la tana a ${p.n} (${p.z}).`,1);}ctEnd(c,true);return;}
  if(g&&(mut?g==="Mutanti":g!=="Mutanti"&&alEne(alSide(),g))){A.c[poi]=["",0];alLog(p,`${S.pg.sopr||"Uno stalker"} ha ripulito ${p.n} (${p.z}).`,1);ui.alWarn=null;toast(`${p.n}: ripulito. Ora è vuoto.`);
    try{const B=bsS();if(B&&B.poi===poi&&B.persa){toast("È la tua base: puoi riprenderla.");}}catch(_){}}}

/* ---- 4. armi pesanti in mano: −1 Mobilità nei Dadi ---- */
(function hookPen(){if(typeof eqPen!=="function"){setTimeout(hookPen,300);return;}if(eqPen._vv)return;const _e=eqPen;eqPen=function(a,s){const o=_e(a,s)||[];try{if(s==="mobilita")L.inv.forEach(x=>{if(x.dove!=="in mano"&&x.dove!=="addosso")return;const e=armOf(x.nome);if(e&&e.g==="pesanti"&&!o.some(y=>y.n===e.n))o.push({n:e.n,v:1});});}catch(_){}return o;};eqPen._vv=1;})();

/* ---- 5. mezzi: posti, bagagliaio, sovraccarico ---- */
function vvBag(v){return "mz-"+v.id;}
function vvBagSync(){const M=mzS();S.nasc=S.nasc||[];M.veh.forEach(v=>{const id=vvBag(v);let n=S.nasc.find(x=>x.id===id);if(v.rubato){if(n){L.inv.filter(y=>y.dove==="nasc:"+id).forEach(y=>{try{del("inv",y.id);}catch(_){}});S.nasc=S.nasc.filter(x=>x.id!==id);}return;}
  if(!n){n={id,nome:`Bagagliaio del ${MZ_V[v.t].n}`,zona:v.luogo,ultimo:S.clock.data,mz:1};S.nasc.push(n);}n.zona=v.luogo;});}
const vvLoad=v=>L.inv.filter(y=>y.dove==="nasc:"+vvBag(v)).reduce((a,y)=>a+(+y.slot||0),0);
(function hookTrip(){if(typeof adv!=="function"||!adv._mz){setTimeout(hookTrip,300);return;}if(adv._vv)return;const _a=adv;
  adv=function(min){const v=typeof mzAct==="function"?mzAct():null;let tooMany=false;if(MZ_TRIP&&v){const pos=MZ_V[v.t].posti;const n=1+gruppo().length;if(n>pos){tooMany=true;const T=MZ_TRIP;MZ_TRIP=null;toast(`Nel ${MZ_V[v.t].n} ci stanno ${pos} persone, voi siete ${n}: si va a piedi.`);v.att=0;}
      else if(vvLoad(v)>MZ_V[v.t].car){v.segni=Math.min(6,(+v.segni||0)+1);toast(`${MZ_V[v.t].n} sovraccarico: le sospensioni soffrono.`);}}
    const d0=S.clock.data;const r=_a(min);try{vvBagSync();const n=Math.round((Date.parse(S.clock.data)-Date.parse(d0))/864e5);for(let i=0;i<Math.min(n,7);i++)vvDay();}catch(e){console.error(e);}return r;};for(const k in _a)try{adv[k]=_a[k];}catch(_){}adv._vv=1;})();
/* la riga del mezzo nel pannello mostra il carico */
(function hookMzP(){if(typeof mzPanel!=="function"){setTimeout(hookMzP,300);return;}if(mzPanel._vv)return;const _p=mzPanel;mzPanel=function(){vvBagSync();let h=_p();try{mzS().veh.filter(v=>!v.rubato).forEach(v=>{const V=MZ_V[v.t];h=h.replace(`<b>${V.n}</b>${v.kpvt?" con KPVT":""} <span class="small muted">a ${esc(v.luogo)}`,`<b>${V.n}</b>${v.kpvt?" con KPVT":""} <span class="small muted">${V.posti} posti · bagagliaio ${vvLoad(v)}/${V.car} slot · a ${esc(v.luogo)}`);});}catch(_){}return h;};mzPanel._vv=1;})();

/* ---- 6. il pannello Zona mostra chi c'è nel punto ---- */
(function hookV6(){if(typeof V!=="object"||!V.mappa||!V.mappa._mz){setTimeout(hookV6,300);return;}if(V.mappa._vv)return;const _m=V.mappa;
  V.mappa=function(){let h=_m.apply(this,arguments);try{const here=alHere();if(here){const q=vvQui(here.id);if(q.length){const add=`<p class="small">Qui ci sono: ${q.map(p=>`<b>${esc(p.nome)}</b>${p.fazione?` <span class="muted">(${esc(p.fazione)})</span>`:""}`).join(", ")}. Puoi parlarci dal Registro.</p>`;h=h.replace(/(<section class="card"><h3>Punti d'interesse[^<]*<\/h3>)/,"$1"+add);}}}catch(e){console.error(e);}return h;};V.mappa._al=1;V.mappa._ct=1;V.mappa._bs=1;V.mappa._mz=1;V.mappa._vv=1;})();

/* ---- 7. i dialoghi coi modelli sanno della base, del gruppo e della mappa ---- */
(function hookLlm(){if(typeof llmCtx!=="function"){setTimeout(hookLlm,500);return;}if(llmCtx._vv)return;const _c=llmCtx;llmCtx=function(pid){let s=_c(pid);try{const here=alHere();const [g,n]=here?alCtl(here.id):["",0];const B=typeof bsS==="function"?bsS():null;const G=L.png.filter(p=>p.con&&p.stato!=="morto").map(p=>p.nome);const v=typeof mzAct==="function"?mzAct():null;
    const fz={};AL_P.forEach(p=>{const [f]=alCtl(p.id);if(f)fz[f]=(fz[f]||0)+1;});
    const x=`\nSituazione: il giocatore è a ${here?here.n:"?"} (${S.clock.luogo}), ${g?`tenuto da ${g} (${alForza(n)})`:"un posto vuoto"}. ${G.length?`Con lui: ${G.join(", ")}.`:"È da solo."}${v?` Viaggia con un ${MZ_V[v.t].n}.`:""}${B&&!B.persa?` Ha una base a ${B.nome}.`:""} Chi controlla più punti nella Zona: ${Object.entries(fz).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([f,c])=>`${f} ${c}`).join(", ")}. Voci recenti: ${alS().log.slice(0,4).map(l=>l.txt).join(" ")}`;
    s=s.replace(/\nFatti recenti/,x+"\nFatti recenti");}catch(_){}return s;};llmCtx._vv=1;})();
