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
