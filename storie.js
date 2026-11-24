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
