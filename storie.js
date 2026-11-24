/* ===== Storie in corso (taccuino delle catene aperte) e archivio lavori ===== */
const ST_F={
 "radar-coordinate":["Le coordinate del Radar","Un punto a Janiv. «SCORTA.»","Janiv e Jupiter"],
 "jupiter-casse":["Le casse sotto il Jupiter","Qualcuno accumula qualcosa da ventisei anni.","Janiv e Jupiter"],
 "segreti-della-valle":["I segreti della Valle","Sai dove Borov tiene i soldi. O la usi, o te la tolgono.","Valle Oscura"],
 "zs-debito-1":["Il debito del Mercante","Zhorik aspetta la busta all'officina.","Discarica"],
 "zs-debito-mio":["Quello che il Mercante ti deve","Ottomila di tasca tua. Passa al bunker.","Cordone"],
 "zs-debito-guerra":["I ragazzi di Zhorik","Ti cercano sulla strada.","Cordone o Discarica"],
 "lapide-dytjatky":["L'uomo della lapide","La faccia della foto l'hai vista al Bar.","Bar e Rostok"],
 "quaderni-maestro":["I quaderni","Il maestro dell'autobus giallo chiede quaderni (500 ₽).","Discarica"],
 "staffetta":["La staffetta","Il siero ai Magazzini, l'artefatto dal Barman, poi di corsa all'Agroprom.","Bar · Magazzini"],
 "segreti-del-mercante":["I segreti del Mercante","Sai abbastanza da farlo uccidere. Lui lo sa.",""]
};
function stHtml(){const E=evS();const rows=Object.keys(ST_F).filter(f=>E.flag[f]).map(f=>{const [t,x,dove]=ST_F[f];
  let tm="";if(f==="staffetta"){const q=E.coda.find(q=>q.id==="zs-staffetta-tardi");if(q){const m=minTo(q.at);tm=` · <span class="warn">${m>0?Math.ceil(m/60)+" ore":"scaduto"}</span>`;}}
  return `<li><b>${esc(t)}</b>${tm}<br><span class="small muted">${esc(x)}${dove?` — ${esc(dove)}`:""}</span></li>`;});
  const n=E.coda.length;if(!rows.length&&!n)return "";
  return `<article class="card" style="margin-bottom:8px"><h3 style="margin:0">Storie in corso</h3>${rows.length?`<ul style="margin:6px 0;padding-left:18px">${rows.join("")}</ul>`:""}${n?`<p class="small muted" style="margin:0">${n} seguit${n===1?"o":"i"} in arrivo.</p>`:""}</article>`;}
document.addEventListener("click",e=>{const b=e.target.closest('[data-a="archj"],[data-a="archv"]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
  if(b.dataset.a==="archv"){ui.arch=!ui.arch;render();return;}
  const j=L.pda.find(x=>x.id===b.dataset.k||String(x.id)===b.dataset.k);if(!j)return;j.arch=!j.arch;upd("pda",j.id,{arch:j.arch});toast(j.arch?"Lavoro archiviato.":"Lavoro ripristinato.");render();},true);
/* mappa: i nomi non coprono i punti da toccare */
(function(){const st=document.createElement("style");st.textContent=`.m2d-in .al{z-index:2}.m2d-in .al i{z-index:2}.m2d-in .al b{z-index:1;opacity:.9}
.m2d.zz .m2d-in>span{pointer-events:none!important;opacity:.45}.m2d.zz2 .m2d-in>span:not(.mk){display:none}.m2d.zz .m2d-in>span.mk{opacity:.6}`;document.head.appendChild(st);})();
/* Chiedi lavoro: massimo 3 richieste ogni 24 ore di gioco */
const CJ_MAX=3;
function cjLeft(){const A=ctS();A.cj=(A.cj||[]).filter(t=>minTo(t)>-1440);return CJ_MAX-A.cj.length;}
function cjAsk(){if(cjLeft()<=0){toast("Hai già chiesto abbastanza oggi. Torna domani.");return;}const A=ctS();const z=S.clock.luogo;const pre=new Set(A.ctr.map(c=>c.id));let nuovo=null;
  for(let i=0;i<40&&!nuovo;i++){A.ctr.filter(c=>c.stato==="offerto"&&!pre.has(c.id)&&!(AL_BY[c.da].z===z||AL_BY[c.poi].z===z)).forEach(c=>{A.ctr.splice(A.ctr.indexOf(c),1);});
    const off=A.ctr.filter(c=>c.stato==="offerto");if(off.length>=8){const o=off[off.length-1];if(!(AL_BY[o.da].z===z||AL_BY[o.poi].z===z))A.ctr.splice(A.ctr.indexOf(o),1);}
    try{ctGen();}catch(_){}nuovo=A.ctr.find(c=>!pre.has(c.id)&&c.stato==="offerto"&&ctOk(c.f)&&(AL_BY[c.da].z===z||AL_BY[c.poi].z===z));}
  A.cj.push(clk());save();toast(nuovo?`${nuovo.f} ha un lavoro per te.`:"Oggi qui nessuno ha lavoro. Prova in un'altra zona.");render();}
(function hk(){if(typeof ctPanel!=="function"){setTimeout(hk,300);return;}if(ctPanel._cj)return;const _p=ctPanel;ctPanel=function(){let h=_p.apply(this,arguments);const n=cjLeft();
  return h.replace(`<h4 style="margin:10px 0 2px">Offerte qui intorno</h4>`,`<div class="row" style="justify-content:space-between;margin:10px 0 2px"><h4 style="margin:0">Offerte qui intorno</h4><button class="btn g s" data-cj="1" ${n>0?"":"disabled"}>Chiedi lavoro (${n}/${CJ_MAX})</button></div>`);};ctPanel._cj=1;})();
document.addEventListener("click",e=>{const b=e.target.closest("[data-cj]");if(!b)return;e.stopImmediatePropagation();cjAsk();},true);
/* effetto schermo catodico (Sistema → Colori) */
(function(){const st=document.createElement("style");st.textContent=`
html.crt body::before{content:"";position:fixed;inset:0;z-index:9998;pointer-events:none;background:repeating-linear-gradient(to bottom,#0000 0 2px,#0000001f 2px 3px),radial-gradient(ellipse at center,#0000 60%,#00000059 100%);animation:crtF 6s steps(1) infinite}
html.crt body::after{content:"";position:fixed;left:0;right:0;top:0;height:70px;z-index:9999;pointer-events:none;background:linear-gradient(to bottom,#fff0,#ffffff14 45%,#ffffff26 50%,#ffffff14 55%,#fff0);transform:translateY(-80px);animation:crtR 11s linear infinite}
html.crt .screen{text-shadow:0 0 1px currentColor}
@keyframes crtR{0%{transform:translateY(-80px)}22%{transform:translateY(105vh)}100%{transform:translateY(105vh)}}
@keyframes crtF{0%{opacity:1}47%{opacity:.82}48%{opacity:1}91%{opacity:.88}92%{opacity:1}}
@media (prefers-reduced-motion:reduce){html.crt body::before,html.crt body::after{animation:none}html.crt body::after{display:none}}`;document.head.appendChild(st);
  let on=false;try{on=localStorage.getItem("pda.crt")==="1";}catch(_){}document.documentElement.classList.toggle("crt",on);})();
function crtSet(v){try{localStorage.setItem("pda.crt",v?"1":"0");}catch(_){}document.documentElement.classList.toggle("crt",v);render();}
document.addEventListener("click",e=>{const b=e.target.closest("[data-crt]");if(!b)return;e.stopImmediatePropagation();crtSet(b.dataset.crt==="1");},true);
/* suoni da vecchio schermo: attivi con lo schermo catodico */
const crtOn=()=>document.documentElement.classList.contains("crt");
SFX.tv=()=>{noise(.18,{f:2600,q:.3,vol:.05});noise(.06,{ft:"highpass",f:5000,vol:.03,at:.02});tone(60,.2,{type:"sine",vol:.03});};
SFX.crack=()=>{const n=2+Math.floor(Math.random()*4);for(let i=0;i<n;i++)noise(.012+Math.random()*.02,{ft:"highpass",f:3000+Math.random()*3000,vol:.04,at:Math.random()*.5});};
SFX.accendi=()=>{noise(.35,{f:1800,q:.4,vol:.06});tone(15000,.6,{type:"sine",vol:.006});tone(120,.25,{type:"sine",vol:.05,to:60,at:.05});};
(function hk(){if(typeof render!=="function"||typeof evShow!=="function"){setTimeout(hk,300);return;}if(render._crt)return;
  let last=null;const _r=render;render=function(){const k=(ui.tab||"")+"/"+(ui.pdaTab||"")+"/"+(ui.dsub||"");if(last!==null&&k!==last&&crtOn())sfx("tv");last=k;return _r.apply(this,arguments);};render._crt=1;
  const _e=evShow;evShow=function(e,f){const r=_e.apply(this,arguments);if(r!==false&&crtOn())sfx("tv");return r;};for(const k in _e)evShow[k]=_e[k];
  (function amb(){setTimeout(()=>{if(crtOn()&&!document.hidden&&(typeof AMBF!=="number"||AMBF>0))sfx("crack");amb();},25000+Math.random()*50000);})();})();
document.addEventListener("click",e=>{const b=e.target.closest('[data-crt="1"]');if(b)setTimeout(()=>sfx("accendi"),50);});
/* suoni più forti e più veri, e rumori d'ambiente del PDA */
Object.assign(SFX,{
  key:()=>{noise(.012,{ft:"highpass",f:4200,vol:.09});noise(.02,{f:1400,q:2,vol:.04,at:.006});},
  beep:()=>{[[1320,0],[1760,.09],[1320,.32],[1760,.41]].forEach(([f,a])=>{tone(f,.07,{vol:.08,at:a});tone(f*2.01,.05,{type:"sine",vol:.012,at:a});});noise(.04,{f:2000,vol:.03});},
  job:()=>{[988,1319,1568].forEach((f,i)=>tone(f,.09,{vol:.08,at:i*.1}));noise(.05,{f:1800,vol:.03});},
  stat:()=>{noise(.9,{f:1100,q:.35,vol:.11});noise(.4,{ft:"highpass",f:5000,vol:.03,at:.2});tone(800+Math.random()*400,.15,{type:"sine",vol:.03,at:.35});},
  tv:()=>{noise(.2,{f:2600,q:.3,vol:.09});noise(.07,{ft:"highpass",f:5200,vol:.05,at:.02});tone(60,.22,{type:"sine",vol:.05});},
  crack:()=>{const n=2+Math.floor(Math.random()*5);for(let i=0;i<n;i++)noise(.01+Math.random()*.02,{ft:"highpass",f:3000+Math.random()*3500,vol:.08,at:Math.random()*.6});},
  /* contatore geiger: scatti secchi, irregolari */
  tick:n=>{let t=0;for(let i=0;i<n;i++){t+=-Math.log(1-Math.random())*(1.2/n);noise(.0025,{ft:"highpass",f:3500,vol:.35,at:t});tone(2400,.004,{type:"square",vol:.02,at:t});}},
  /* il PDA perde e ritrova la rete */
  riconn:()=>{noise(.25,{f:900,q:.6,vol:.07});tone(1200,.05,{vol:.05,at:.3});tone(2100,.05,{vol:.05,at:.36});tone(1200,.05,{vol:.05,at:.42});tone(2400,.08,{vol:.045,at:.5});
    for(let i=0;i<6;i++)tone(1400+Math.random()*1400,.025,{vol:.03,at:.62+i*.035});noise(.015,{ft:"highpass",f:4000,vol:.1,at:.9});tone(1760,.06,{type:"sine",vol:.05,at:.95});}});
(function amb(){setTimeout(()=>{try{if(SND.on&&AMBF>0&&!document.hidden&&!ui.ev){const r=Math.random();const per=+perOf(S.clock.luogo)||1;
  if(r<.55)sfx("tick",1+Math.floor(Math.random()*(per+1)));else if(r<.75)sfx("riconn");else if(crtOn())sfx("crack");}}catch(_){}amb();},(20000+Math.random()*40000)/Math.max(.5,typeof AMBF==="number"?AMBF:1));})();
/* volume generale e frequenza dei rumori di fondo */
var VOL=1,AMBF=1;try{VOL=+(localStorage.getItem("pda.vol")??1);AMBF=+(localStorage.getItem("pda.amb")??1);}catch(_){}
(function(){const _t=tone,_n=noise;tone=function(f,d,o={}){if(VOL<=0)return;return _t(f,d,{...o,vol:Math.max(.0002,(o.vol||.05)*VOL)});};noise=function(d,o={}){if(VOL<=0)return;return _n(d,{...o,vol:Math.max(.0002,(o.vol||.08)*VOL)});};})();
function volHtml(){return `<div class="lbl">Volume <b class="num">${Math.round(VOL*100)}%</b></div><input type="range" min="0" max="200" step="10" value="${Math.round(VOL*100)}" data-vol="1" style="width:100%">
<div class="lbl">Rumori di fondo (Geiger, rete, schermo)</div><div class="chips">${[[0,"Spenti"],[.5,"Rari"],[1,"Normali"],[2,"Spessi"]].map(([v,n])=>`<button class="chip" data-amb="${v}" aria-pressed="${AMBF===v}">${n}</button>`).join("")}</div>`;}
document.addEventListener("input",e=>{const r=e.target.closest("[data-vol]");if(!r)return;VOL=+r.value/100;try{localStorage.setItem("pda.vol",VOL);}catch(_){}const l=r.previousElementSibling&&r.previousElementSibling.querySelector("b");if(l)l.textContent=Math.round(VOL*100)+"%";});
document.addEventListener("change",e=>{if(e.target.closest("[data-vol]"))sfx("beep");});
document.addEventListener("click",e=>{const b=e.target.closest("[data-amb]");if(!b)return;e.stopImmediatePropagation();AMBF=+b.dataset.amb;try{localStorage.setItem("pda.amb",AMBF);}catch(_){}if(AMBF>0)sfx("tick",3);render();},true);
