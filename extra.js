/* ===== extra.js: Paura dei clienti, fame del gruppo, granate e cure, furtività e rinforzi, accampamento, lavori all'arrivo,
   salvataggi automatici, riepilogo del mattino, fazioni che reagiscono, compagni, mappa viva, diario dal PDA, difficoltà, rete viva,
   musica, baratto, contrabbando, mutanti che tornano, casa al villaggio, lettere da fuori, tema notte ===== */

const xClienti=()=>gruppo().filter(p=>ruolo(p)==="cliente");
const xComp=()=>gruppo().filter(p=>ruolo(p)==="compagno");
function xPau(p,n,why){const v=Math.max(0,Math.min(5,gPau(p)+n));if(v===gPau(p))return;upd("png",p.id,{paura:v});if(why)xLog(`${p.nome}: Paura ${v}/5 (${why})${v>=5?" — PANICO":""}.`);}
function xPauAll(n,why){xClienti().forEach(p=>xPau(p,n,why));}
function xFid(p,n,why){const v=Math.max(-3,Math.min(3,(+p.fiducia||0)+n));upd("png",p.id,{fiducia:v});if(why)xLog(`${p.nome}: fiducia ${v>0?"+":""}${v} (${why}).`);
  if(v<=-2&&ruolo(p)==="compagno"&&p.con){upd("png",p.id,{con:false,luogo:S.clock.luogo});add("pda",{tipo:"msg",da:p.nome,fazione:p.fazione||"",testo:pk(["Me ne vado. Non è niente di personale. Cioè sì.","Trovati un altro. Io torno al villaggio.","Non ti seguo più, guida. Mi tieni la paga, tienila pure."]),data:S.clock.data,ora:S.clock.ora});xLog(`${p.nome} se ne va dal gruppo.`);}}
let XLOG=[];function xLog(t){XLOG.unshift(t);if(XLOG.length>6)XLOG.length=6;try{toast(t);}catch(_){}}
const xOpz=()=>S.opz=S.opz||{eco:"normale",morte:"normale",tema:""};

/* ---------- 1. clienti: calmare, panico, anomalie ---------- */
function xCalma(){if(ui.xCalmato===S.clock.data+S.clock.luogo){toast("Una volta per scena: li hai già calmati.");return;}const cl=xClienti().filter(p=>gPau(p)>0);if(!cl.length){toast("Nessuno ha paura.");return;}
  const R=qRoll("empatia","comando",pgSpec("Pastore")?1:0,"",0);if(!R)return;ui.xCalmato=S.clock.data+S.clock.luogo;adv(10);
  cl.forEach(p=>xPau(p,-R.base,`parli con calma (${R.dv})`));if(!R.base)toast(`Non ti ascoltano (${R.dv}).`);}
function xPanico(p){const r=d(3);const t=r===1?"scappa":r===2?"si blocca, non si muove":"spara a caso";
  if(r===1&&S.scontro){const e=S.scontro.ent.find(x=>x.pid===p.id);if(e)e.stato="fuggito";}if(r===3)S.allerta=Math.min(6,(+S.allerta||0)+2);return `${p.nome} è nel panico: ${t}.`;}
function xAnomClienti(){const N=S.anom;if(!N)return;const rischio=xClienti().filter(p=>gPau(p)>=3);rischio.forEach(p=>{const v=d(DIE[gDado(p)]);if(!succ(v)){N.pied=N.pied||[];if(!N.pied.includes(p.id))N.pied.push(p.id);N.log.unshift(`${p.nome} ha paura (${gPau(p)}/5), tira ${v}: sta per mettere un piede dove non deve.`);}});}
function xFerma(id,ok){const N=S.anom;if(!N)return;N.pied=(N.pied||[]).filter(x=>x!==id);const p=L.png.find(x=>x.id===id);if(!p)return;
  if(ok){const R=qRoll("agilita","mobilita",0,"",0);if(R&&R.base){N.log.unshift(`Prendi ${p.nome} per lo zaino e lo tiri indietro (${R.dv}).`);return;}N.log.unshift(`Non arrivi in tempo (${R?R.dv:""}).`);}
  const A=pk(ANOM.filter(a=>N.tipi.includes(a[0])))||pk(ANOM);const fe=(+p.fer||0)+Math.min(3,A[1]);upd("png",p.id,{fer:fe,stato:fe>=4?"morto":fe>=3?"ferito":p.stato});N.log.unshift(`${p.nome} finisce in un ${A[0]}: ${A[1]} dann${A[1]>1?"i":"o"}${fe>=4?". È morto.":fe>=3?", a terra.":"."}`);
  xPauAll(fe>=4?2:1,"un compagno ferito");if(fe>=4)S.nomeRep=(+S.nomeRep||0)-3;}

/* ---------- 2. scontro: granate, pronto soccorso, furtività, rinforzi ---------- */
function xGranata(){const C=S.scontro;if(!C||C.fine)return;if(C.azL||C.supp||C.psi){toast("Niente azione lenta, questo turno.");return;}if(["lunga","estrema"].includes(C.dist)){toast("Troppo lontano: le granate arrivano a 25 m.");return;}
  const g=L.inv.find(x=>/^Granata (RGD|F1)/.test(x.nome||"")&&mine(x)&&["in mano","addosso"].includes(x.dove));if(!g){toast("Nessuna granata addosso o in mano.");return;}
  const F1=/F1/.test(g.nome);const R=qRoll("agilita","tiro",C.dist==="corta"?1:0,"",0);if(!R)return;C.azL=1;if((+g.qta||1)>1)upd("inv",g.id,{qta:(+g.qta)-1});else del("inv",g.id);S.allerta=Math.min(6,(+S.allerta||0)+3);sfx("shot");
  const tgs=alive("loro");if(!R.base){const r=d(6);if(r===1){trAdd({ferite:1});sgLog(C.log,`La granata (${R.dv}) rimbalza e scoppia vicino a te: una scheggia, +1 Ferite.`);}else sgLog(C.log,`La granata (${R.dv}) cade lontano: solo rumore e terra.`);return;}
  const n=Math.min(tgs.length,1+(R.base>=2?2:1));const hit=tgs.slice().sort(()=>Math.random()-.5).slice(0,n);hit.forEach((t,i)=>hitNpc(t,i===0&&C.dist==="corta"?(F1?3:2):1,F1?3:2,`Granata (${R.dv}) su ${t.n}`));}
function xCura(){const C=S.scontro;if(!C||C.fine)return;if(C.azL||C.supp||C.psi){toast("Niente azione lenta, questo turno.");return;}
  const t=C.ent.find(e=>e.lato==="noi"&&!e.pg&&e.dmg>0&&e.stato!=="morto"&&e.id===ui.xCuraT)||C.ent.find(e=>e.lato==="noi"&&!e.pg&&e.dmg>0&&e.stato!=="morto");if(!t){toast("Nessun compagno ferito. Per te: Salute, nella Scheda.");return;}
  const k=L.inv.find(x=>/^(Benda|Kit medico)/.test(x.nome||"")&&mine(x)&&x.dove!=="deposito");if(!k){toast("Non hai bende né kit medici.");return;}
  const R=qRoll("empatia","pronto",/Kit medico/.test(k.nome)?1:0,"",0);if(!R)return;C.azL=1;if((+k.qta||1)>1)upd("inv",k.id,{qta:(+k.qta)-1});else del("inv",k.id);
  if(!R.base){sgLog(C.log,`Provi a medicare ${t.n} (${R.dv}): non basta.`);return;}const was=t.stato;t.dmg=Math.max(0,t.dmg-1);if(t.stato==="fuori"&&t.dmg<3)t.stato="ok";upd("png",t.pid,{fer:t.dmg});sgLog(C.log,`Medichi ${t.n} (${R.dv}): danni ${t.dmg}${was==="fuori"&&t.stato==="ok"?", torna in piedi":""}.`);}
function xFurtivo(){const z=S.clock.luogo;const k=ui.scK&&NEMU[ui.scK]?ui.scK:zNem(z,0)[0];const T=NEMU[k];const al=+S.allerta||0;const notte=(()=>{const h=+String(S.clock.ora).slice(0,2);return h>=19||h<6;})();
  const loro=rDie(T.d,(al>=4?2:al>=2?1:0)-(notte||/nebbia|pioggia/i.test(S.clock.meteo||"")?1:0)-(+(ui.scCop||0)?0:0));const R=qRoll("agilita","mobilita",pgSpec("Passo leggero")?1:0,"",0);if(!R)return;adv(10);
  if(R.base>loro.s){ui.xStealth={k,ok:1};ui.scSorp="noi";ui.scDist="corta";toast(`Arrivi a pochi metri senza farti vedere (${R.dv} contro ${loro.v}).`);}
  else if(R.base===loro.s){S.allerta=Math.min(6,al+1);ui.xStealth={k,ok:0};toast(`Ti fermi: qualcuno ha sentito qualcosa (${R.dv} contro ${loro.v}). Allerta +1.`);}
  else{ui.xStealth={k,ok:-1};ui.scSorp="loro";S.allerta=Math.min(6,al+2);toast(`Ti hanno visto (${R.dv} contro ${loro.v}).`);}}
function xSentinella(){const st=ui.xStealth;if(!st||st.ok!==1)return;const W=L.inv.find(x=>mine(x)&&["in mano","addosso"].includes(x.dove)&&/coltell|Baionett|NR-40/i.test(x.nome||""));
  const R=qRoll("forza","corpo",W&&/NR-40/.test(W.nome)?1:0,"",0);if(!R)return;ui.xStealth=null;
  if(R.base>=2){ui.xKill={k:st.k,quiet:1};toast(`Silenzio (${R.dv}). Uno in meno, e nessuno se n'è accorto.`);}
  else if(R.base===1){ui.xKill={k:st.k,quiet:0};S.allerta=Math.min(6,(+S.allerta||0)+1);toast(`Lo fai, ma cade facendo rumore (${R.dv}).`);}
  else{ui.xKill=null;S.allerta=Math.min(6,(+S.allerta||0)+2);ui.scSorp="";toast(`Lotta (${R.dv}): grida. Adesso sanno che ci sei.`);}}
const BASI=/Cordone|Bar e Rostok|Yantar|Magazzini|Janiv|Zaton|Agroprom/;
function xRinforzi(){const C=S.scontro;if(!C||C.fine||C.mut)return;if((+S.allerta||0)>=5&&BASI.test(C.z)&&!C.rinf){C.rinf=C.r+d(6);sgLog(C.log,"Allerta alta vicino a una base: arriveranno rinforzi.");}
  if(C.rinf&&C.r>=C.rinf&&!C.rinfOk){C.rinfOk=1;const T=NEMU[C.k];const pd=ammoPD(T.mun);const n=1+d(2);for(let i=0;i<n;i++){const id="r"+i;C.ent.push({id,n:`${T.n} (rinforzo ${i+1})`,lato:"loro",k:C.k,mut:false,d:T.d,D:pd.D,P:pd.P,raff:T.raff,t:T.t,e:T.e,hp:4,dmg:0,stato:"ok",cop:1,spari:0,ini:d(10)});C.ord.push(id);}sgLog(C.log,`Arrivano i rinforzi: ${n} × ${T.n}.`);}}

/* ---------- 3. notte: incontri, turni di guardia, accampamento ---------- */
function xNotteDopo(o){if(!o||o.dove==="base")return;const G=gruppo().length;let r=d(6);if(o.fuoco)r++;if(o.dove==="riparo")r--;if(r<6)return;
  const z=S.clock.luogo;const mut=d(3)>1;const k=pk(zNem(z,mut));S.xNotteInc={k,mut,guardia:G>0};add("diario",{testo:`Notte: qualcosa si è avvicinato al campo (${(mut?MUT:NEMU)[k].n.toLowerCase()}).`,data:S.clock.data,ora:S.clock.ora,luogo:z});}
function xNotteBox(){const I=S.xNotteInc;if(!I)return "";const T=(I.mut?MUT:NEMU)[I.k];
  return `<div class="evbox scban"><span><b>Nella notte</b> · ${esc(T.n)}${I.guardia?": chi era di guardia vi sveglia in tempo.":": eri da solo, ti sveglia il rumore."}</span><button class="btn s" data-x="xnf">Affronta</button><button class="btn g s" data-x="xnh">Resta immobile</button></div>`;}

/* ---------- 4. lavori all'arrivo ---------- */
const XCOMPL=["Il destinatario non c'è: torna tra un giorno, o lascia la roba a qualcuno di cui non ti fidi.","Ti pagano metà adesso e metà «la settimana prossima».","Qualcuno vi ha seguito fin qui: due figure sul limitare.","Il pacco è stato aperto, dicono. Non da te, ma lo devi spiegare.","Pagano in natura: munizioni e una scatoletta invece dei rubli.","Tutto bene, e ti chiedono un altro favore subito.","Tutto liscio. Ti offrono da bere.","Tutto liscio. Ti offrono da bere."];
function xJobBox(){const q=L.pda.filter(j=>j.tipo==="lavoro"&&(j.stato==="accettato")&&!j.chiuso&&j.luogo===S.clock.luogo&&!(ui.xJobHide||{})[j.id]);if(!q.length)return "";
  S.xCompl=S.xCompl||{};return q.map(j=>{if(!S.xCompl[j.id])S.xCompl[j.id]=d(6)<=2?pk(XCOMPL.slice(0,6)):"Tutto liscio.";return `<div class="evbox scban"><span><b>Sei a ${esc(j.luogo)}</b>: «${esc(j.titolo)}» si chiude qui. <span class="small">${esc(S.xCompl[j.id])}</span></span><button class="btn s" data-a="job" data-k="${j.id}" data-v="fatto">Fatto, incassa</button><button class="btn g s" data-x="xjh" data-k="${j.id}">Non ancora</button></div>`;}).join("");}

/* ---------- 5. salvataggi automatici ---------- */
function xAutoSnap(){if(db)return;try{const arr=LS.get("pda.auto")||[];const snap=JSON.parse(backupTxt());arr.unshift({q:`${S.clock.data} ${S.clock.ora}`,r:new Date().toISOString().slice(0,16).replace("T"," "),s:snap});LS.set("pda.auto",arr.slice(0,5));}catch(e){console.error(e);}}
function xAutoPane(){if(db)return "";const arr=LS.get("pda.auto")||[];return `<section class="pane"><h2>Salvataggi automatici</h2><p class="small muted" style="margin-top:0">Il PDA tiene da solo le ultime 5 copie (una a ogni giorno di gioco e prima di ogni scontro). Stanno nel browser: se lo svuoti spariscono, quindi ogni tanto «Salva su file».</p>
  ${arr.length?`<ul class="items">${arr.map((a,i)=>`<li class="row small" style="justify-content:space-between"><span>Partita al ${esc(dataIt(a.q.slice(0,10)))} ${esc(a.q.slice(11))} <span class="muted">· salvata ${esc(a.r)}</span></span><button class="btn g s" data-x="xrest" data-k="${i}">${ui.xRestSure===i?"Sicuro?":"Torna qui"}</button></li>`).join("")}</ul>`:`<p class="empty">Ancora nessuna.</p>`}</section>`;}
function xSaveBox(){if(db||ui.tab==="sistema")return "";const last=LS.get("pda.lastfile")||"";if(ui.xSaveLater)return "";if(!last&&L.diario.length<3)return "";const n=last?Math.round((Date.parse(S.clock.data)-Date.parse(last))/864e5):99;if(n<2)return "";
  return `<div class="evbox scban"><span><b>Salva la partita su file</b> <span class="small muted">${last?`ultimo file: ${esc(dataIt(last))}`:"non l'hai ancora mai salvata su file"}</span></span><button class="btn s" data-x="xsave">Salva adesso</button><button class="btn g s" data-x="xsavel">Dopo</button></div>`;}

/* ---------- 6. riepilogo del mattino ---------- */
function xMattino(){const M=S.xMat;if(!M||M.visto||ui.tab==="crea")return "";const jobs=L.pda.filter(j=>j.tipo==="lavoro"&&["offerto","accettato"].includes(j.stato||"offerto")&&!j.chiuso).map(j=>({j,m:jobLeft(j)})).filter(x=>x.m!=null&&x.m<2880);
  const fer=gruppo().filter(p=>+p.fer);const G=gruppo().length+1;const nc=STAG(month())==="inverno"?2:1;const gg=Math.floor((+S.scorte.cibo||0)/(nc*G));const msg=L.pda.filter(m=>m.tipo==="msg"&&m.data===S.clock.data).length;
  const righe=[`Tempo: <b>${esc(S.clock.meteo||"—")}</b>, ${LUCE[month()][2]}/${LUCE[month()][3]} °C, buio alle ${LUCE[month()][1]}.`,`Cibo per ${gg} giorn${gg===1?"o":"i"}${G>1?` (siete in ${G})`:""}, acqua ${S.scorte.acqua||0} l.`,
   jobs.length?`Lavori in scadenza: ${jobs.map(x=>`${esc(x.j.titolo)} (${leftTxt(x.m)})`).join(", ")}.`:"",fer.length?`Feriti: ${fer.map(p=>`${esc(p.nome)} (${p.fer})`).join(", ")}.`:"",(+S.emiss||0)>=3?`<span class="warn">Emissione a ${S.emiss}/6.</span>`:"",msg?`${msg} messaggi oggi sulla rete.`:"",
   ...xClienti().filter(p=>gPau(p)>=3).map(p=>`${esc(p.nome)} ha paura (${gPau(p)}/5).`)].filter(Boolean);
  return `<div class="daybox mattino"><b>Buongiorno, ${esc(S.pg.sopr||S.pg.nome||"guida")}.</b> ${esc(dataIt(S.clock.data))}, ${esc(S.clock.luogo)}.<ul class="small" style="margin:4px 0 6px;padding-left:1.2em">${righe.map(r=>`<li>${r}</li>`).join("")}</ul><button class="btn g s" data-x="xmok">Chiudi</button></div>`;}

/* ---------- 7. fazioni che reagiscono ---------- */
const FBASE={"Dovere":"Bar e Rostok","Libertà":"Magazzini dell'esercito","Scienziati":"Yantar","Mercante del Cordone":"Cordone","Barman":"Bar e Rostok","Banditi":"Valle Oscura","Esercito":"Cordone"};
const FMSG={"Dovere":["Il Dovere ha messo il tuo nome su una lista. Al Bar ti guarderanno storto.","C'è una taglia del Dovere su di te. Piccola, per ora."],"Libertà":["La Libertà non ti vuole più ai Magazzini. Non è un consiglio."],"Scienziati":["Gli scienziati di Yantar hanno cancellato il tuo nome dalla lista dei fornitori."],"Mercante del Cordone":["Il Mercante ha alzato i prezzi solo per te. Lo sanno tutti al villaggio."],"Barman":["Il Barman ti ha fatto sapere che al Bar non c'è più posto per te, per un po'."],"Banditi":["I banditi della Valle hanno messo una taglia su di te. Occhio sulla strada."],"Esercito":["Al posto di blocco ti conoscono. In negativo. Le mazzette costeranno il doppio."]};
function xFazCheck(){S.xRap=S.xRap||{};Object.entries(S.rap||{}).forEach(([f,v])=>{const old=S.xRap[f]??v;if(v<=-2&&old>-2&&FMSG[f])add("pda",{tipo:"msg",da:"rete",fazione:f,testo:pk(FMSG[f]),data:S.clock.data,ora:S.clock.ora});
  if(v>=3&&old<3)add("pda",{tipo:"msg",da:f,fazione:f,testo:pk(["Ti abbiamo notato, guida. Passa a trovarci: abbiamo roba che non mostriamo a tutti.","Hai fatto un buon lavoro per noi. Ricorderemo."]),data:S.clock.data,ora:S.clock.ora});S.xRap[f]=v;});}
function xFazPrezzo(p){const M=mercQui();if(!M)return p;const r=rapCon(M);const eco={facile:.85,normale:1,dura:1.25}[xOpz().eco]||1;return Math.round(p*eco*(r<0?1+Math.min(.5,-r*.1):1)/10)*10;}

/* ---------- 8. compagni: paga, umore, voce ---------- */
function xGiornoCompagni(){xComp().forEach(p=>{const pg=+String(gPaga(p)).replace(/\./g,"")||0;if(!pg)return;if((+S.rubli||0)>=pg){S.rubli-=pg;}else xFid(p,-1,"non l'hai pagato");});}
const XVOCI={stanco:["«Guida, quanto manca?»","«Mi fanno male i piedi da ieri.»"],ferito:["«Non è niente. Credo.»","«Se muoio, la moneta è tua.»"],bene:["«Oggi è una bella giornata, per la Zona.»","«Ho sentito un cane. Forse.»","«Al Bar mi devono ancora un giro.»"],paura:["«Torniamo indietro. Per favore.»","«Hai sentito? Hai sentito anche tu?»"]};
function xVoce(){const G=gruppo();if(!G.length||d(4)>1)return;const p=pk(G);const k=+p.fer?"ferito":ruolo(p)==="cliente"&&gPau(p)>=3?"paura":(+S.tr.fatica||0)>=3?"stanco":"bene";S.xVoce={n:p.nome,t:pk(XVOCI[k])};}

/* ---------- 9. rete viva, voci vere, lettere ---------- */
const RETE=[["«Emissione in arrivo, sento le orecchie fischiare. Tutti sotto terra stanotte.»",s=>(+s.emiss||0)>=4],["«Chi ha munizioni 5,45 da vendere? Pago bene al Bar.»",()=>1],["«{n} non è tornato da {z}. Se lo trovate, la sua roba la diamo alla madre.»",()=>1],["«Il Mercante del Cordone ha alzato il prezzo degli antirad. Ladro.»",()=>1],["«Visto un succhiasangue vicino a {z}. Non scherzo.»",()=>1],["«Neve sul Radar. Chi sale adesso è pazzo.»",()=>STAG(month())==="inverno"],["«C'è un nascondiglio pieno a {z}, me l'ha detto uno che ci è stato. Forse.»",()=>1,"voce"],["«Campo di anomalie nuovo a {z} dopo l'ultima Emissione. Brilla di notte.»",()=>1,"campo"]];
function xRete(){const ok=RETE.filter(r=>r[1](S));const R=pk(ok);const z=pk(ZONE.slice(0,9)).at(0);const txt=R[0].replace("{z}",z).replace("{n}",pk(["Grisha","Borys","il Muto","Taras","Vadim"]));
  let vera=0;if(R[2]){vera=d(3)===1;if(vera){S.xVoci=S.xVoci||[];S.xVoci.push({z,t:R[2]});}}add("pda",{tipo:"msg",da:pk(["Ščupak","anonimo","Ryžyj","Kuzja","stalker sconosciuto"]),fazione:"Stalker liberi",testo:txt,data:S.clock.data,ora:S.clock.ora});}
function xVoceArrivo(){const V=(S.xVoci||[]).find(v=>v.z===S.clock.luogo);if(!V)return;S.xVoci=S.xVoci.filter(v=>v!==V);if(V.t==="campo"){anStart(V.z,40);toast("La voce era vera: il campo di anomalie è qui.");}else{const n=pk(["Kit medico AI-2","Antirad","Cibo (1 unità)","Vodka"]);add("inv",{nome:n,qta:1,slot:0.5,dove:"zaino",stato:"ok",nota:"dal nascondiglio della voce"});S.rubli=(+S.rubli||0)+d(6)*500;toast(`La voce era vera: un nascondiglio. ${n} e qualche rublo.`);}}
const LETT=[["Leonid «Rybak»","{n}, qui a Novi Sad piove da una settimana. Mia figlia ha cominciato la scuola. Quando torni, il primo giro è mio. Non farti ammazzare, che poi chi mi racconta le storie?"],["Leonid «Rybak»","Ho visto alla tv un servizio sulla Zona. Sembrava un posto tranquillo. Mentivano, vero?"],["tua madre","{n}, accendo una candela per te ogni domenica. Mangi? Ti copri? Scrivimi due righe, anche solo due."],["un vecchio commilitone","{io}. Ho saputo che fai la guida lassù. C'è chi dice che sei matto, io dico che sei sempre stato così. Se ti serve qualcosa da fuori, sai dove trovarmi."]];
function xLettere(){const my=L.png.find(p=>/Mychajlo/.test(p.nome)&&p.stato!=="morto");if(!my||S.clock.luogo!=="Cordone")return;const last=S.xLett||"2012-10-10";if((Date.parse(S.clock.data)-Date.parse(last))/864e5<6||d(3)>1)return;S.xLett=S.clock.data;const [da,t0]=pk(LETT);const t=t0.replace(/\{n\}/g,(S.pg.nome||"").split(" ")[0]||S.pg.sopr||"figlio mio").replace(/\{io\}/g,S.pg.sopr||S.pg.nome||"");
  add("pda",{tipo:"msg",da:`${da} (lettera, col furgone di Mychajlo)`,fazione:"",testo:t,data:S.clock.data,ora:S.clock.ora});trAdd({nervi:-1});}

/* ---------- 10. mutanti che tornano ---------- */
function xRitorni(){const h=+String(S.clock.ora).slice(0,2);if(!(h>=21||h<5))return;const due=(S.xRit||[]).find(r=>r.d<=S.clock.data);if(!due||S.scontro)return;S.xRit=S.xRit.filter(r=>r!==due);S.xNotteInc={k:due.k,mut:true,guardia:gruppo().length>0,torna:due.dmg};}

/* ---------- 11. baratto e contrabbando ---------- */
function xBaratto(){const z=S.clock.luogo;if(ui.xBar&&ui.xBar.z===z&&ui.xBar.d===S.clock.data)return;const pool=ARM.filter(x=>["C","NC"].includes(x.r)&&["munizioni","medicine","campo","strumenti"].includes(x.c)&&x.p<6000);
  ui.xBar={z,d:S.clock.data,chi:`${pk(NOMI)} «${pk(SOPR)}»`,off:[...pool].sort(()=>Math.random()-.5).slice(0,4).map(x=>({n:x.n,v:Math.round(x.p*.9)}))};}
function xBarPane(){xBaratto();const B=ui.xBar;const mine0=L.inv.filter(y=>mine(y)&&["zaino","addosso"].includes(y.dove||"zaino")&&sellBase(y)>0);const tot=(ui.xBarMine||[]).reduce((t,id)=>{const y=L.inv.find(z=>z.id===id);return t+(y?sellBase(y)*(y.stato==="usurato"?.5:y.stato==="rotto"?.1:1):0);},0);
  return `<details class="acc" data-acc="baratto" ${ui.aopen&&ui.aopen.baratto?"open":""}><summary><span>Baratto con ${esc(B.chi)}</span><span class="small muted">stalker di passaggio · niente rubli</span></summary><div style="padding:8px 10px">
  <p class="small muted" style="margin-top:0">Lui offre roba, tu metti sul piatto la tua. Con Empatia + Persuasione puoi strappare uno scambio migliore.</p>
  <div class="grid" style="grid-template-columns:1fr 1fr;gap:8px"><div><div class="lbl">Lui offre</div>${B.off.map((o,i)=>`<label class="row small"><input type="radio" name="xbo" data-xs="xBarOff" value="${i}" ${+ui.xBarOff===i?"checked":""} style="width:auto;min-height:0"> ${esc(o.n)} <span class="muted num">~${fmtR(o.v)}</span></label>`).join("")}</div>
  <div><div class="lbl">Tu dai</div>${mine0.slice(0,14).map(y=>`<label class="row small"><input type="checkbox" data-xb="${y.id}" ${(ui.xBarMine||[]).includes(y.id)?"checked":""} style="width:auto;min-height:0"> ${esc(y.nome)}</label>`).join("")||`<p class="empty">Niente da dare.</p>`}<div class="small">Valore: <b class="num">~${fmtR(Math.round(tot))}</b></div></div></div>
  <div class="row" style="gap:6px;margin-top:6px"><button class="btn s" data-x="xbar">Proponi lo scambio</button></div></div></details>`;}
function xBarFai(){const B=ui.xBar;const o=B&&B.off[+ui.xBarOff||0];const ids=ui.xBarMine||[];if(!o||!ids.length){toast("Scegli cosa vuoi e cosa dai.");return;}const its=ids.map(id=>L.inv.find(z=>z.id===id)).filter(Boolean);
  const tot=its.reduce((t,y)=>t+sellBase(y)*(y.stato==="usurato"?.5:y.stato==="rotto"?.1:1),0);let need=o.v;if(tot<need){const R=qRoll("empatia","persuasione",pgSpec("Contrattare")?1:0,"",0);if(!R)return;need=o.v*(1-.15*R.base);if(tot<need){toast(`Non ci sta (${R.dv}): vuole di più.`);return;}}
  its.forEach(y=>del("inv",y.id));const x=ARM.find(a=>a.n===o.n);add("inv",{nome:o.n,qta:1,slot:x?x.slot:1,dove:"zaino",stato:"ok",nota:(x&&x.s)||"",tipo:x?tipoOf(x):"altro"});B.off=B.off.filter(z=>z!==o);ui.xBarMine=[];toast(`Scambio fatto: ${o.n}.`);}
const SCOTTA=y=>/^Artefatto|Cassa sigillata|Dati di un laboratorio/i.test(y.nome||"")||(y.tipo==="arma"&&/AK-74|SVD|VSS|AS Val|SR-3|PKM|RPK/i.test(y.nome||""));
function xControllo(da,a){if(!(da==="Cordone"||a==="Cordone")||d(6)>2)return;const roba=L.inv.filter(y=>mine(y)&&y.dove!=="deposito"&&SCOTTA(y));if(!roba.length)return;S.xCtrl={roba:roba.map(y=>y.id),dove:a};}
function xCtrlBox(){const C=S.xCtrl;if(!C)return "";const roba=C.roba.map(id=>L.inv.find(y=>y.id===id)).filter(Boolean);if(!roba.length){S.xCtrl=null;return "";}const ho=L.png.find(p=>/Hrytsenko/.test(p.nome)&&p.stato!=="morto");
  return `<div class="evbox scban"><span><b>Pattuglia del Cordone</b>: «Fermo. Apri lo zaino.» Hai addosso roba che scotta: ${roba.map(y=>esc(y.nome)).join(", ")}.</span><button class="btn s" data-x="xct" data-k="paga">Mazzetta (${fmtR(xMazzetta())})</button><button class="btn g s" data-x="xct" data-k="bluff">Bluffa</button><button class="btn g s" data-x="xct" data-k="nascondi">Nascondi al volo</button>${ho?`<button class="btn g s" data-x="xct" data-k="nome">Nomina Hrytsenko</button>`:""}</div>`;}
const xMazzetta=()=>((+(S.rap||{}).Esercito||0)<=-2?2000:1000);
function xCtrlFai(k){const C=S.xCtrl;if(!C)return;const roba=C.roba.map(id=>L.inv.find(y=>y.id===id)).filter(Boolean);const perdi=()=>{const y=pk(roba);del("inv",y.id);toast(`Ti sequestrano: ${y.nome}.`);S.rap.Esercito=(+S.rap.Esercito||0)-1;};S.xCtrl=null;
  if(k==="paga"){const m=xMazzetta();if((+S.rubli||0)<m){perdi();return;}S.rubli-=m;toast("Il soldato conta i soldi e guarda dall'altra parte.");return;}
  if(k==="nome"){if(d(6)>=3){toast("«Del sergente? Va bene, passa.»");return;}perdi();return;}
  const R=k==="bluff"?qRoll("empatia","persuasione",pgSpec("Faccia da poker|Posti di blocco")?1:0,"",0):qRoll("agilita","mobilita",0,"",0);if(!R)return;if(R.base)toast(`Passi (${R.dv}).`);else perdi();}

/* ---------- 12. casa al villaggio ---------- */
function xCasaPane(){if(S.clock.luogo!=="Cordone")return "";const n=+S.nomeRep||0;const lv=n>=25?["Una stanza tua nel capannone, con la stufa",3]:n>=12?["Un angolo tuo nella cantina di Djadja Vasja, con una branda e un baule",2]:n>=5?["Una branda al villaggio, tenuta per te",1]:["Un posto per terra vicino al fuoco, quando c'è",0];
  const tro=L.inv.filter(y=>y.dove==="deposito"&&/trofeo/i.test(y.nota||""));const parti=L.inv.filter(y=>mine(y)&&y.dove!=="deposito"&&/^(Coda|Zampa|Zoccolo|Occhio|Tentacoli|Mano|Artiglio) di/.test(y.nome||""));
  return `<section class="pane"><h3>La tua casa al villaggio</h3><p class="small" style="margin-top:0">${lv[0]}. <span class="muted">Cresce col Nome (5, 12, 25).</span></p>
  ${lv[1]>=1?`<button class="btn g s" data-x="xcasa">Dormi a casa (al caldo e al sicuro)</button>`:""}
  ${tro.length?`<p class="small"><b>Trofei appesi:</b> ${tro.map(y=>esc(y.nome)).join(" · ")}</p>`:""}
  ${parti.length?`<div class="row small" style="gap:6px">${parti.map(y=>`<button class="btn g s" data-x="xtro" data-k="${y.id}">Appendi: ${esc(y.nome)}</button>`).join("")}</div>`:""}</section>`;}

/* ---------- 13. musica alla radio ---------- */
let XMUS=null;function xMusica(){if(XMUS){clearTimeout(XMUS);XMUS=null;toast("Radio spenta.");return;}if(!SND.on){toast("Accendi il suono (in alto).");return;}
  const sc=[[220,262,294,330,392],[196,233,262,294,349],[247,294,330,370,440]];const S0=pk(sc);let i=0;const step=()=>{const c=actx();if(!c){XMUS=null;return;}const base=pk(S0);[0,.5,1,1.5].forEach((t,j)=>tone(pk(S0)*(j===3?2:1),.42,{type:"triangle",vol:.035,at:t}));tone(base/2,1.9,{type:"sine",vol:.03});noise(2,{ft:"bandpass",f:1800,vol:.006});i++;XMUS=i<16?setTimeout(step,2000):null;};step();toast("Alla radio, una vecchia canzone.");}

/* ---------- 14. diario scritto dal PDA ---------- */
function xBozza(){const oggi=S.clock.data;const ev=[...L.solo].filter(x=>x.data===oggi).sort((a,b)=>(a.ts||0)-(b.ts||0));const txt=ev.map(x=>`${x.ora} · ${x.tit}: ${(x.righe||[]).map(r=>String(r).replace(/<[^>]+>/g,"")).join(" ").slice(0,260)}`).join("\n");
  ui.dt=`${dataIt(oggi)}, ${S.clock.luogo}.\n${txt||"Una giornata senza niente da segnare."}`;toast("Bozza pronta nel diario: correggila e premi «Scrivi».");}

/* ---------- mappa viva ---------- */
function xSegno(z,t){S.xSegni=S.xSegni||[];S.xSegni.unshift({z,t:`${t} (${dataIt(S.clock.data)})`});S.xSegni=S.xSegni.slice(0,30);}
function xMarks(){const out=[];const seen={};(S.xSegni||[]).forEach(s=>{const k=s.z+s.t.split(" (")[0];if(seen[k])return;seen[k]=1;out.push({zona:s.z,txt:s.t,cls:"seg"});});
  (S.xVoci||[]).forEach(v=>out.push({zona:v.z,txt:v.t==="campo"?"? voce: campo nuovo":"? voce: nascondiglio",cls:"seg"}));return out.slice(0,24);}

/* ---------- mappa: zona selezionata ---------- */
function zoneInfo(z){const q=S.clock.luogo;const per=perOf(z);let tempo="";try{const p=path(q,z);if(p&&p.length>1){const h=p.slice(1).reduce((a,zz,i)=>a+edge(p[i],zz)[3],0);tempo=` · da qui ${h} h, ${p.length-1} tratt${p.length>2?"i":"o"}`;}}catch(_){}
  const tip=(ZNEM[z]||[[],[]]).map((l,i)=>l.map(k=>(i?MUT:NEMU)[k].n.toLowerCase()).slice(0,2).join(", ")).filter(Boolean).join(" · ");
  return `<span class="small">pericolo ${per}${tempo}${tip?`<br>${esc(tip)}`:""}</span>${z===q?`<span class="small"><b>sei qui</b></span>`:`<button data-mzd="${esc(z)}">Meta</button>`}`;}
function zoneDest(z){ui.dest=z;render();toast(`Meta: ${z}. Ora «Parti, tappa per tappa».`);}

/* ---------- comandi ---------- */
Object.assign(XA,{
 xcalma:()=>xCalma(),xpan:b=>{const p=L.png.find(x=>x.id===b.dataset.k);if(p)toast(xPanico(p));},
 xfermo:b=>xFerma(b.dataset.k,true),xlascia:b=>xFerma(b.dataset.k,false),
 xgran:()=>xGranata(),xcura:()=>xCura(),xfurt:()=>xFurtivo(),xsent:()=>xSentinella(),
 xnf:()=>{const I=S.xNotteInc;S.xNotteInc=null;scStart(I.k,I.mut,{dist:"corta",sorp:I.guardia?"":"loro",n:I.torna!=null?1:0});if(I.torna!=null){const e=S.scontro.ent.find(x=>x.lato==="loro");if(e)e.dmg=I.torna;}location.hash="dadi";},
 xnh:()=>{const I=S.xNotteInc;S.xNotteInc=null;const R=qRoll("agilita","mobilita",0,"",0);if(R&&R.base)toast(`Resti immobile (${R.dv}). Dopo un'ora se ne va.`);else{toast(`Ti ha sentito (${R?R.dv:""}).`);scStart(I.k,I.mut,{dist:"corta",sorp:"loro"});location.hash="dadi";}},
 xjh:b=>{ui.xJobHide=ui.xJobHide||{};ui.xJobHide[b.dataset.k]=1;},
 xsave:()=>{const ok=dlFile(`pda-zona-${S.clock.data}-${(S.clock.ora||"").replace(":","")}.json`,backupTxt());LS.set("pda.lastfile",S.clock.data);toast(ok?"Salvata: cerca il file nei Download.":"Non riesco a scaricare: usa Sistema.");},xsavel:()=>{ui.xSaveLater=1;},
 xrest:async b=>{const i=+b.dataset.k;if(ui.xRestSure!==i){ui.xRestSure=i;return;}ui.xRestSure=null;const a=(LS.get("pda.auto")||[])[i];if(a)await importAll(a.s);},
 xmok:()=>{if(S.xMat)S.xMat.visto=1;},
 xbar:()=>xBarFai(),xct:b=>xCtrlFai(b.dataset.k),
 xcasa:()=>{notte({dove:"base",ore:8});},xtro:b=>{upd("inv",b.dataset.k,{dove:"deposito",nota:"trofeo appeso a casa"});toast("Appeso sopra la branda.");},
 xpal:b=>{const k=b.dataset.k;LS.set("pda.pal",k||null);if(k)document.documentElement.dataset.pal=k;else delete document.documentElement.dataset.pal;},xtrama:b=>{xOpz().trama=b.dataset.k==="1";},xmus:()=>xMusica(),xbozza:()=>xBozza(),
 xeco:b=>{xOpz().eco=b.dataset.k;},xmorte:b=>{xOpz().morte=b.dataset.k;},xtema:b=>{LS.set("pda.theme",b.dataset.k||null);xTema();},
 xcampo:()=>{location.hash="salute";setTimeout(()=>document.querySelector(".nottebox,#salute")?.scrollIntoView({behavior:"smooth"}),80);},
});
document.addEventListener("change",e=>{const t=e.target.closest("[data-xb]");if(!t)return;const id=t.dataset.xb;ui.xBarMine=ui.xBarMine||[];ui.xBarMine=t.checked?[...new Set([...ui.xBarMine,id])]:ui.xBarMine.filter(x=>x!==id);render();});
function xTema(){const t=LS.get("pda.theme");const h=document.documentElement;h.classList.remove("tnotte");if(t)h.dataset.theme=t;else delete h.dataset.theme;const m=document.querySelector('meta[name="theme-color"]');}

/* ---------- pannelli aggiunti alle viste ---------- */
function xGruppoTop(){const cl=xClienti();const pan=cl.filter(p=>gPau(p)>=5);if(!gruppo().length)return "";
  return `<section class="pane" style="margin-bottom:12px"><div class="row" style="gap:8px;align-items:center">${cl.length?`<button class="btn s" data-x="xcalma">Calma i clienti (Empatia + Comando)</button>`:""}${pan.map(p=>`<button class="btn s warn" data-x="xpan" data-k="${p.id}">${esc(p.nome)} è nel panico: cosa fa?</button>`).join("")}<span class="small muted">${cl.length?"La Paura sale da sola con l'Emissione, i mutanti, i feriti e le notti senza fuoco; scende con una notte vera.":""}${S.xVoce?` <i>${esc(S.xVoce.n)}: ${esc(S.xVoce.t)}</i>`:""}</span></div></section>`;}
function xSistemaPane(){const o=xOpz();return `<section class="pane"><h2>Difficoltà e aspetto</h2>
  <div class="lbl">Economia</div><div class="chips">${[["facile","Facile (−15%)"],["normale","Normale"],["dura","Dura (+25%)"]].map(([k,n])=>`<button class="chip" data-x="xeco" data-k="${k}" aria-pressed="${o.eco===k}">${n}</button>`).join("")}</div>
  <div class="lbl">Morte</div><div class="chips">${[["normale","Come da regole"],["clemente","Clemente: un colpo mortale diventa «morente»"]].map(([k,n])=>`<button class="chip" data-x="xmorte" data-k="${k}" aria-pressed="${o.morte===k}">${n}</button>`).join("")}</div>
  ${(EVD.atti&&EVD.atti.length)?`<div class="lbl">Trama in tre atti</div><div class="chips"><button class="chip" data-x="xtrama" data-k="1" aria-pressed="${tramaOn()}">Accesa</button><button class="chip" data-x="xtrama" data-k="0" aria-pressed="${!tramaOn()}">Spenta: solo storie casuali</button></div><p class="small muted" style="margin:2px 0 6px">La trama è scritta per Sokolov: con un altro personaggio resta spenta, così non ti rovini la storia.</p>`:`<div class="lbl">Zona libera</div><p class="small muted" style="margin:2px 0 6px">Questa è la versione sandbox: nessuna trama, solo la Zona che vive da sola. Storie casuali e personaggi che tornano.</p>`}
  <div class="lbl">Colori</div><div class="chips">${[["","Oliva (originale)"],["ambra","Ambra"],["carta","Carta e ruggine"],["grigio","Grigio militare"]].map(([k,n])=>`<button class="chip" data-x="xpal" data-k="${k}" aria-pressed="${(LS.get("pda.pal")||"")===k}">${n}</button>`).join("")}</div>
  <div class="lbl">Schermo</div><div class="chips">${[["","Automatico (come il telefono)"],["light","Giorno"],["dark","Notte"]].map(([k,n])=>`<button class="chip" data-x="xtema" data-k="${k}" aria-pressed="${(LS.get("pda.theme")||"")===k}">${n}</button>`).join("")}</div>
  <p class="small muted">Quante storie escono si regola in Storie («Il regista»). Caratteri più grandi: il bottone A+ in alto.</p></section>`;}

/* ---------- agganci ---------- */
window.addEventListener("load",()=>{
  const W=(name,fn)=>{if(typeof window[name]==="function"&&!window[name]._x){const o=window[name];const w=fn(o);w._x=1;w._v=o._v;window[name]=w;}};
  W("adv",o=>function(min){const d0=S.clock.data,e0=+S.emiss||0,h0=S.clock.ora;o(min);try{
    if((+S.emiss||0)>e0)xPauAll((+S.emiss||0)-e0,"segnale dell'Emissione");
    if(S.clock.data!==d0){xAutoSnap();xGiornoCompagni();xLettere();S.xMat={d:S.clock.data,visto:0};ui.xCalmato=null;}
    if(min>=60&&d(3)===1)xVoce();S.xRm=(+S.xRm||0)+min;if(S.xRm>=360){S.xRm=0;if(d(2)===1)xRete();}xRitorni();xFazCheck();}catch(e){console.error(e);}});
  W("scStart",o=>function(k,mut,opt){xAutoSnap();o(k,mut,opt);try{if(mut)xPauAll(1,"mutanti in vista");const K=ui.xKill;if(K&&K.k===k&&!mut){const e=S.scontro.ent.find(x=>x.lato==="loro");if(e){e.stato="morto";e.dmg=4;sgLog(S.scontro.log,`${e.n} era già a terra: l'hai preso prima che iniziasse.`);}}ui.xKill=null;ui.xStealth=null;
    gruppo().filter(p=>(+p.fiducia||0)>=2).forEach(p=>{const e=S.scontro.ent.find(x=>x.pid===p.id);if(e)e.d=gstep(e.d,1);});}catch(e){console.error(e);}});
  W("hitAlly",o=>function(t,dmg,P,txt){const s0=t.stato;o(t,dmg,P,txt);try{if(t.stato!==s0)xPauAll(t.stato==="morto"?2:1,t.stato==="morto"?"un compagno morto":"un compagno a terra");else if(t.dmg)xPauAll(1,"un compagno ferito");}catch(_){}});
  W("hitApply",o=>function(h){const n0=(S.corpo||[]).length;const r=o(h);try{const w=(S.corpo||[])[n0];if(w&&w.morto&&xOpz().morte==="clemente"){w.morto=false;w.morente=true;w.x=(w.x||"")+" (clemente: morente, non morto)";save();}}catch(_){}return r;});
  W("npcAct",o=>function(e){try{if(e.lato==="noi"&&e.pid){const p=L.png.find(x=>x.id===e.pid);if(p&&ruolo(p)==="cliente"){if(gPau(p)>=5){sgLog(S.scontro.log,xPanico(p));return;}sgLog(S.scontro.log,`${p.nome} si tiene giù.`);return;}}}catch(_){}o(e);});
  W("scNext",o=>function(){o();try{xRinforzi();}catch(_){}});
  W("scClose",o=>function(){const C=S.scontro;try{if(C){xSegno(C.z,`✕ ${C.tn}`);const persi=C.ent.some(e=>e.lato==="noi"&&!e.pg&&e.stato==="morto");xComp().forEach(p=>{const e=C.ent.find(x=>x.pid===p.id);if(!e||e.stato==="morto")return;xFid(p,persi?-1:e.dmg?0:1,persi?"un compagno morto":"scontro vinto");});
    C.ent.filter(e=>e.lato==="loro"&&e.mut&&e.stato==="fuggito"&&["succhiasangue","chimera"].includes(e.k)).forEach(e=>{S.xRit=S.xRit||[];const t=new Date(Date.parse(S.clock.data)+864e5*d(3)).toISOString().slice(0,10);S.xRit.push({k:e.k,d:t,dmg:e.dmg});});}}catch(_){}o();});
  W("anStart",o=>function(z,ex){o(z,ex);try{xSegno(z||S.clock.luogo,"◎ campo di anomalie");}catch(_){}});
  W("anPass",o=>function(m){o(m);try{xAnomClienti();}catch(_){}});
  W("notte",o=>function(op){const fu=op&&op.dove==="fuori"&&!op.fuoco;o(op);try{if(op&&op.dove!=="fuori")xPauAll(-1,"una notte vera");else if(fu)xPauAll(1,"notte all'aperto senza fuoco");xNotteDopo(op);}catch(_){}});
  W("vgLeg",o=>function(){const V=S.viaggio;const a=V&&V.p[V.i],z=V&&V.p[V.i+1];const i0=V&&V.i;o();try{if(z&&(!S.viaggio||S.viaggio.i!==i0)){if(xClienti().some(p=>gPau(p)>=3)){S.allerta=Math.min(6,(+S.allerta||0)+1);adv(30);xLog("I clienti spaventati rallentano: Allerta +1, mezz'ora in più.");}xControllo(a,z);xVoceArrivo();}}catch(e){console.error(e);}});
  W("eatDay",o=>function(n,withG){const g=withG?gruppo().length:0;const nc=STAG(month())==="inverno"?2:1;const short=withG&&g&&(+S.scorte.cibo||0)<(nc+g)*n;o(n,withG);try{if(short){xComp().forEach(p=>xFid(p,-1,"è rimasto senza mangiare"));xPauAll(1,"fame");}}catch(_){}});
  W("prezzo",o=>function(x){return xFazPrezzo(o(x));});
  W("vendeQui",o=>function(x){const r=o(x);if(!r.ok)return r;const M=mercQui();if(M&&rapCon(M)<=-3)return {ok:false,why:"con te non tratta (Rapporto troppo basso)"};return r;});
  W("cassa",o=>function(){const c=o();if(!c._x){c._x=1;c.n=Math.round(c.n*({facile:1.3,normale:1,dura:.75}[xOpz().eco]||1));}return c;});
  W("scBanner",o=>function(){return xMattino()+xNotteBox()+xCtrlBox()+xJobBox()+xSaveBox()+o();});
  W("vScontro",o=>function(){const h=o();const C=S.scontro;try{
    if(!C){const st=ui.xStealth;const k=ui.scK&&NEMU[ui.scK]?ui.scK:zNem(S.clock.luogo||"Cordone",0)[0];return h.replace('<button class="btn g" data-x="scrand">',`${!ui.scMut?`<button class="btn g" data-x="xfurt">Avvicinati di nascosto</button>${st&&st.ok===1?`<button class="btn g" data-x="xsent">Elimina la sentinella (coltello)</button>`:""}${ui.xKill?`<span class="small">Uno è già a terra${ui.xKill.quiet?" e nessuno se n'è accorto":""}.</span>`:""}`:""}<button class="btn g" data-x="scrand">`);}
    const hurt=C.ent.filter(e=>e.lato==="noi"&&!e.pg&&e.dmg>0&&e.stato!=="morto");
    return h.replace('<button class="btn g" data-x="screl">Ricarica</button>',`<button class="btn g" data-x="screl">Ricarica</button><button class="btn g" data-x="xgran">Granata</button>${hurt.length?`<button class="btn g" data-x="xcura">Medica ${esc(hurt[0].n)}</button>`:""}`);}catch(_){return h;}});
  W("anomHtml",o=>function(){const h=o();const N=S.anom;if(!N||!(N.pied||[]).length)return h;const ps=N.pied.map(id=>L.png.find(p=>p.id===id)).filter(Boolean);
    return h.replace('<ul class="sclog small">',`<div class="row" style="gap:6px;margin:6px 0">${ps.map(p=>`<span class="small"><b>${esc(p.nome)}</b> sta per sbagliare:</span><button class="btn s" data-x="xfermo" data-k="${p.id}">Fermalo (Agilità + Mobilità)</button><button class="btn g s" data-x="xlascia" data-k="${p.id}">Lascia stare</button>`).join("")}</div><ul class="sclog small">`);});
  W("viaggioHtml",o=>function(){const h=o();if(!S.viaggio)return h;return h.replace('<button class="btn g" data-x="vgstop">Fermati qui</button>','<button class="btn g" data-x="vgstop">Fermati qui</button><button class="btn g" data-x="xcampo">Accampati</button>');});
  if(typeof V==="object"){
    const og=V.gruppo;V.gruppo=()=>xGruppoTop()+og();
    const oz=V.zaino;V.zaino=()=>{const h=oz();return ui.zsub==="armeria"?h.replace('<details class="acc"',xBarPane()+'<details class="acc"'):h;};
    const om=V.mappa;V.mappa=()=>om()+xCasaPane();
    const os=V.sistema;V.sistema=()=>os().replace('<div class="grid">','<div class="grid">'+xSistemaPane()+xAutoPane());
    const or=V.registro;V.registro=()=>{const h=or();return (!ui.rv)?h.replace('<button class="btn" data-a="dadd" style="margin:6px 0 10px">Scrivi</button>','<span class="row" style="gap:6px;margin:6px 0 10px"><button class="btn" data-a="dadd">Scrivi</button><button class="btn g" data-x="xbozza">Bozza della giornata dal PDA</button></span>'):h;};
    const op=V.pda;V.pda=()=>{const h=op();return ui.pdaTab==="radio"&&["Cordone","Bar e Rostok","Janiv e Jupiter","Zaton","Magazzini dell'esercito","Yantar"].includes(S.clock.luogo)?h.replace('<section><h2>Rete degli stalker</h2>','<section><h2>Rete degli stalker</h2><div class="row" style="margin-bottom:8px"><button class="btn g s" data-x="xmus">'+(XMUS?"Spegni la musica":"Metti un po\' di musica")+'</button></div>'):h;};}
  if(typeof mapMarks==="function"){}
  try{xTema();}catch(_){}
});

/* ===== Annunci sulla rete: cerco lavoro, compro, vendo, chiedo voci; risposte con offerte ===== */
const ANNT=[["compro","Compro"],["vendo","Vendo"],["lavoro","Cerco lavoro"],["info","Chiedo voci"]];
const xNome=()=>`${pk(NOMI)} «${pk(SOPR)}»`;
const clkPlus=min=>clkAdd(min);
function annPub(){const t=ui.annT||"compro";const z=S.clock.luogo;const a={id:uid(),tipo:t,z,t0:clk(),fine:clkPlus(1440),off:[],acc:0};
  if(t==="compro"){const x=ARM.find(y=>y.n===(ui.annCosa||"").trim());if(!x){toast("Scegli dall'elenco cosa compri.");return;}a.cosa=x.n;a.n=Math.max(1,Math.min(20,+ui.annN||1));}
  if(t==="vendo"){const y=L.inv.find(v=>v.id===ui.annInv);if(!y){toast("Scegli cosa vendi.");return;}a.cosa=y.nome;a.inv=y.id;const pr=(y.nota||"").match(/([\d.]+)\s*[–-]\s*([\d.]+)\s*₽/);const b0=sellBase(y)||(pr?(+pr[1].replace(/\./g,"")+ +pr[2].replace(/\./g,""))/2:0);a.val=Math.max(100,b0*(y.stato==="usurato"?.6:y.stato==="rotto"?.15:1));}
  S.ann=S.ann||[];S.ann.unshift(a);S.ann=S.ann.slice(0,12);
  const txt=t==="compro"?`Compro ${a.n>1?a.n+" × ":""}${a.cosa}. Sono a ${z}. Offerte qui.`:t==="vendo"?`Vendo ${a.cosa}. Sono a ${z}. Fate un'offerta.`:t==="lavoro"?`Guida libera a ${z}. Cerco lavoro: scorte, consegne, recuperi.`:`Cerco notizie su ${z} e dintorni. Pago chi sa qualcosa di vero.`;
  add("pda",{tipo:"msg",da:`${S.pg.sopr||S.pg.nome||"Tu"} (tu)`,mio:true,testo:txt,data:S.clock.data,ora:S.clock.ora});ui.annCosa="";toast("Annuncio pubblicato: le risposte arrivano col tempo.");}
function annOffer(a){const near=[a.z,...nbr(a.z)];let o={id:uid(),da:xNome(),z:d(2)===1?a.z:pk(near),stato:"nuova",t:clk(),fine:clkPlus(2880)};
  if(a.tipo==="compro"){const x=ARM.find(y=>y.n===a.cosa);if(!x)return null;const nord=/Yantar|Janiv|Zaton|Radar|Pripjat|Foresta|centrale/.test(o.z);const disp={C:1,NC:.7,R:nord?.4:.15,MR:.05}[x.r]??.5;if(Math.random()>disp)return null;
    const f=x.r==="MR"?2+Math.random():.7+Math.random()*.65;o.prezzo=Math.round(x.p*a.n*f/50)*50;o.scam=f<.8?d(3)===1:x.r==="MR"?d(2)===1:d(12)===1;o.testo=`Ho ${a.n>1?a.n+" × ":""}${a.cosa}. ${fmtR(o.prezzo)}${o.z===a.z?", sono qui vicino.":`, ci vediamo a ${o.z}.`}${f<.8?" Prezzo d'amico, ma fai in fretta.":""}`;}
  else if(a.tipo==="vendo"){const f=.4+Math.random()*.55;o.prezzo=Math.round(a.val*f/50)*50;o.scam=d(10)===1;o.testo=`Per «${a.cosa}» ti do ${fmtR(o.prezzo)}${o.z===a.z?". Sono qui.":`. Portamelo a ${o.z}.`}`;}
  else if(a.tipo==="lavoro"){const L0=S.clock.luogo;S.clock.luogo=a.z;const keep=ui.lastJob;try{lavoro();}catch(_){}const j=ui.lastJob;ui.lastJob=keep;S.clock.luogo=L0;if(!j)return null;o.job=j;o.z=a.z;o.da=j.da||o.da;o.testo=`${j.titolo}: ${j.testo} Paga ${fmtR(j.paga)}.`;o.prezzo=0;}
  else{o.prezzo=200+d(8)*100;o.vera=d(2)===1;o.vz=pk(near);o.tipoV=pk(["voce","campo"]);o.testo=`So una cosa su ${o.vz}: ${o.tipoV==="campo"?"un campo di anomalie nuovo":"un nascondiglio pieno"}. ${fmtR(o.prezzo)} e te lo dico.`;o.z=a.z;}
  return o;}
function annTick(min){(S.ann||[]).forEach(a=>{if(a.chiuso)return;if(minTo(a.fine)<0){a.chiuso=1;return;}a.acc=(+a.acc||0)+min;while(a.acc>=60){a.acc-=60;if(a.off.length<3&&Math.random()<.15){const o=annOffer(a);if(o){a.off.push(o);add("pda",{tipo:"msg",da:o.da,fazione:"Stalker liberi",testo:o.testo,data:S.clock.data,ora:S.clock.ora});try{sfx("job");}catch(_){}}}}});}
function annFind(id){for(const a of (S.ann||[]))for(const o of a.off)if(o.id===id)return [a,o];return [null,null];}
function annTratta(id){const [a,o]=annFind(id);if(!o||o.trattato)return;o.trattato=1;const R=qRoll("empatia","persuasione",pgSpec("Contrattare|Ricettatore")?1:0,"",0);if(!R)return;
  if(!R.base){if(d(2)===1){o.stato="rifiutata";toast(`«Allora niente.» (${R.dv}) Se n'è andato.`);}else toast(`Non si muove dal prezzo (${R.dv}).`);return;}
  const f=a.tipo==="vendo"?1+.1*R.base:1-.1*R.base;o.prezzo=Math.round(o.prezzo*f/50)*50;toast(`D'accordo (${R.dv}): ${fmtR(o.prezzo)}.`);}
function annAccetta(id){const [a,o]=annFind(id);if(!o)return;if(o.job){add("pda",{...o.job,stato:"accettato",data:S.clock.data,ora:S.clock.ora});o.stato="fatta";a.chiuso=1;toast("Lavoro accettato: è nei Lavori.");return;}
  if(a.tipo==="compro"&&(+S.rubli||0)<o.prezzo){toast("Non hai abbastanza rubli.");return;}
  if(o.z!==S.clock.luogo){o.stato="appuntamento";toast(`Appuntamento con ${o.da} a ${o.z}, entro due giorni.`);return;}annScambio(o.id);}
function annScambio(id){const [a,o]=annFind(id);if(!o)return;o.stato="fatta";a.chiuso=1;
  if(o.scam){const R=qRoll("intelletto","ricognizione",0,"",0);if(R&&R.base){toast(`Qualcosa non torna (${R.dv}): troppi uomini in giro, nessuna merce. Te ne vai prima.`);return;}
    if(a.tipo==="compro"){S.rubli-=o.prezzo;toast(`Paghi, ${o.da} va «a prendere la roba» e non torna. −${fmtR(o.prezzo)}.`);return;}
    toast("Era un agguato.");scStart("bandito",false,{n:2+d(2),dist:"corta",sorp:"loro"});location.hash="dadi";return;}
  if(a.tipo==="compro"){const x=ARM.find(y=>y.n===a.cosa);S.rubli-=o.prezzo;if(x.sc){S.scorte[x.sc]=(+S.scorte[x.sc]||0)+a.n;}
    else if(x.c==="munizioni"){const box=+((x.s.match(/(\d+) (colpi|cartucce)/)||[])[1])||20;add("inv",{nome:x.n,qta:1,slot:x.slot*a.n,colpi:box*a.n,dove:"zaino",stato:"ok",nota:x.s,tipo:"altro"});}
    else add("inv",{nome:x.n,qta:a.n,slot:x.slot,dove:"zaino",stato:"ok",nota:x.s,tipo:tipoOf(x),classe:classeOf(x.n),segni:0});toast(`Comprato da ${o.da}: ${a.n>1?a.n+" × ":""}${a.cosa}.`);}
  else if(a.tipo==="vendo"){const y=L.inv.find(v=>v.id===a.inv);if(!y){toast("Non ce l'hai più.");return;}if((+y.qta||1)>1)upd("inv",y.id,{qta:(+y.qta)-1});else del("inv",y.id);S.rubli=(+S.rubli||0)+o.prezzo;toast(`Venduto a ${o.da}: +${fmtR(o.prezzo)}.`);}
  else if(a.tipo==="info"){if((+S.rubli||0)<o.prezzo){toast("Non hai abbastanza rubli.");o.stato="nuova";a.chiuso=0;return;}S.rubli-=o.prezzo;if(o.vera){S.xVoci=S.xVoci||[];S.xVoci.push({z:o.vz,t:o.tipoV});toast(`Ti dice dove guardare a ${o.vz}. Sembra sincero.`);}else toast(`Ti racconta una storia su ${o.vz}. Chissà.`);}}
function annBox(){const ap=[];(S.ann||[]).forEach(a=>a.off.forEach(o=>{if(o.stato==="appuntamento"&&o.z===S.clock.luogo)ap.push([a,o]);}));if(!ap.length)return "";
  return ap.map(([a,o])=>`<div class="evbox scban"><span><b>Incontro</b> con ${esc(o.da)}: ${esc(a.cosa||"")} per ${fmtR(o.prezzo)}.</span><button class="btn s" data-x="anns" data-k="${o.id}">Fai lo scambio</button><button class="btn g s" data-x="annr" data-k="${o.id}">Lascia perdere</button></div>`).join("");}
function annPane(){const t=ui.annT||"compro";const mieiI=L.inv.filter(y=>mine(y)&&["zaino","addosso"].includes(y.dove||"zaino")&&sellBase(y)>0);const A=(S.ann||[]).filter(a=>!a.chiuso||a.off.some(o=>o.stato==="appuntamento"));
  const SO={nuova:"",appuntamento:"appuntamento",fatta:"fatto",rifiutata:"rifiutata"};
  return `<details class="acc" data-acc="annunci" ${ui.aopen&&ui.aopen.annunci===false?"":"open"} style="margin-bottom:10px"><summary><span>Annunci: compra, vendi, cerca lavoro</span><span class="small muted">${A.length?`${A.length} apert${A.length>1?"i":"o"}`:"le risposte arrivano col tempo"}</span></summary><div style="padding:8px 10px">
  <div class="chips">${ANNT.map(([k,n])=>`<button class="chip" data-x="annt" data-k="${k}" aria-pressed="${t===k}">${n}</button>`).join("")}</div>
  ${t==="compro"?`<div class="row" style="gap:6px"><input list="annlist" data-xs="annCosa" value="${esc(ui.annCosa||"")}" placeholder="cosa (es. 12/70 pallettoni)" style="flex:1 1 14em"><input type="number" min="1" max="20" data-xs="annN" value="${esc(ui.annN||1)}" style="width:5em" title="quanti (scatole per le munizioni)"></div><datalist id="annlist">${ARM.filter(x=>x.r!=="MR").map(x=>`<option value="${esc(x.n)}">`).join("")}</datalist>`:""}
  ${t==="vendo"?`<select data-xs="annInv">${mieiI.map(y=>`<option value="${y.id}" ${ui.annInv===y.id?"selected":""}>${esc(y.nome)}</option>`).join("")}</select>`:""}
  <div class="row" style="margin-top:6px"><button class="btn s" data-x="annp">Pubblica da ${esc(S.clock.luogo)}</button><span class="small muted">Rispondono nell'arco di un giorno. Occhio ai prezzi troppo belli.</span></div>
  ${A.map(a=>`<div class="annc"><b>${esc(ANNT.find(x=>x[0]===a.tipo)[1])}${a.cosa?`: ${esc(a.cosa)}${a.n>1?` × ${a.n}`:""}`:""}</b> <span class="small muted">· ${esc(a.z)}${a.chiuso?"":` · ${leftTxt(minTo(a.fine))}`}</span>
    ${a.off.length?`<ul class="items">${a.off.map(o=>`<li class="small"><b>${esc(o.da)}</b>: ${esc(o.testo)} ${SO[o.stato]?`<span class="tag">${SO[o.stato]}</span>`:""}${o.stato==="nuova"&&!a.chiuso?`<span class="row" style="gap:4px;margin-top:3px"><button class="btn s" data-x="anna" data-k="${o.id}">Accetta</button>${o.prezzo&&!o.trattato?`<button class="btn g s" data-x="annt2" data-k="${o.id}">Tratta</button>`:""}<button class="btn g s" data-x="annr" data-k="${o.id}">No</button></span>`:""}</li>`).join("")}</ul>`:`<p class="small muted" style="margin:2px 0">Nessuna risposta, per ora.</p>`}
    <button class="btn g s" data-x="annc" data-k="${a.id}">Chiudi l'annuncio</button></div>`).join("")}</div></details>`;}
Object.assign(XA,{annt:b=>{ui.annT=b.dataset.k;},annp:()=>annPub(),anna:b=>annAccetta(b.dataset.k),annt2:b=>annTratta(b.dataset.k),annr:b=>{const [a,o]=annFind(b.dataset.k);if(o)o.stato="rifiutata";},anns:b=>annScambio(b.dataset.k),annc:b=>{const a=(S.ann||[]).find(x=>x.id===b.dataset.k);if(a){a.chiuso=1;a.off.forEach(o=>{if(o.stato==="appuntamento")o.stato="rifiutata";});}}});
window.addEventListener("load",()=>{
  if(typeof adv==="function"&&!adv._ann){const o=adv;const w=function(min){o(min);try{annTick(+min||0);(S.ann||[]).forEach(a=>a.off.forEach(x=>{if(x.stato==="appuntamento"&&minTo(x.fine)<0)x.stato="rifiutata";}));}catch(e){console.error(e);}};w._ann=1;w._x=o._x;w._v=o._v;window.adv=w;}
  if(typeof scBanner==="function"&&!scBanner._ann){const o=scBanner;const w=function(){return annBox()+o();};w._ann=1;window.scBanner=w;}
  if(typeof V==="object"&&!V._ann){V._ann=1;const op=V.pda;V.pda=()=>{const h=op();return (!ui.pdaTab||ui.pdaTab==="rete")?h.replace('>Radio</button></div>','>Radio</button></div>'+annPane()):h;};}
});
