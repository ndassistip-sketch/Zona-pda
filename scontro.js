/* ===== Scontro a turni, viaggio a tappe, anomalie col bullone, bestiario, riassunto per il GM ===== */
/* Usa le funzioni di app.js (S, L, ui, doRoll, hitApply, trAdd, adv, save, render…): si chiamano solo a gioco avviato. */

const GR=["D","C","B","A"];
const gstep=(g,s)=>GR[Math.max(0,Math.min(3,GR.indexOf(g||"C")+(+s||0)))];
const rDie=(g,s)=>{const gg=gstep(g,s);const v=d(DIE[gg]);return {g:gg,v,s:succ(v)};};
const DIST=[["corta","corta (≤5 m)",1],["media","media (≤25 m)",0],["lunga","lunga (≤100 m)",-1],["estrema","estrema (oltre)",-2]];
const DM=Object.fromEntries(DIST.map(x=>[x[0],x[2]]));
const DMAX={corta:5,media:25,lunga:100,estrema:9999};
const COPN=["allo scoperto","riparo leggero","riparo pesante"];
const ammoPD=n=>{const a=(ARM||[]).find(x=>x.n===n);const s=a?a.s:"";return {P:+((s.match(/P(\d+)/)||[])[1]||1),D:+((s.match(/D(\d+)/)||[])[1]||1)};};

/* umani: chiavi come KIT (bottino) */
const NEMU={
 novellino:{n:"Stalker novellino",d:"D",m:"D",t:1,e:0,mun:"9×18 P",raff:0,q:[2,4],ced:"scappa o si arrende piangendo"},
 bandito:{n:"Bandito",d:"C",m:"D",t:1,e:0,mun:"5,45 PRS",raff:2,q:[3,6],ced:"fuggono; arresi mentono"},
 veterano:{n:"Stalker veterano",d:"B",m:"C",t:2,e:2,mun:"5,45 PS",raff:2,q:[2,3],ced:"tratta"},
 militare:{n:"Militare di leva",d:"C",m:"C",t:2,e:2,mun:"5,45 PS",raff:2,q:[2,4],ced:"si chiudono nel posto di blocco"},
 speciali:{n:"Forze speciali",d:"B",m:"B",t:3,e:3,mun:"5,45 PP",raff:2,q:[3,5],ced:"ritirata ordinata, tornano in più"},
 dovere:{n:"Dovere",d:"B",m:"B",t:3,e:2,mun:"5,45 PS",raff:2,q:[2,4],ced:"accetta la resa, rispetta i patti"},
 liberta:{n:"Libertà",d:"C",m:"C",t:2,e:1,mun:"5,56 M855",raff:2,q:[2,4],ced:"tratta subito"},
 mercenario:{n:"Mercenario",d:"B",m:"B",t:3,e:2,mun:"5,56 M855",raff:2,q:[2,4],ced:"ritirata ordinata, tratta se cambia il prezzo"},
 monolite:{n:"Monolite",d:"B",m:null,t:3,e:3,mun:"5,45 BS",raff:2,q:[3,5],ced:"mai"},
 cecchino:{n:"Cecchino",d:"A",m:"C",t:2,e:1,mun:"7,62×54R 7N1",raff:0,q:[1,1],dist:"lunga",kit:"mercenario",ced:"dopo due colpi si sposta"}};
/* mutanti: d dado · hp danni per abbatterlo · D/P · cl pelle · fuga · parte, prezzo · dove, segni, caccia, teme */
const MUT={
 cane:{n:"Cane cieco",d:"C",hp:2,D:1,P:1,q:[4,8],fuga:"branco",sensi:"C · fiuto e udito",parte:"Coda di cane cieco",pr:[150,300],dove:"Ovunque all'aperto, Cordone compreso, giorno e notte.",segni:"Latrati lontani, ossa rosicchiate, tane sotto i ruderi.",caccia:"Accerchia; attacca tutto insieme chi cade, resta solo o scappa. Ciechi: nascondersi alla vista non serve.",teme:"Il fuoco."},
 pseudocane:{n:"Pseudocane",d:"B",hp:4,D:2,P:2,q:[1,1],fuga:"solo",sensi:"B · fiuto e vista",parte:"Coda di pseudocane",pr:[400,700],dove:"Discarica, Valle Oscura, Agroprom e più a nord; raro al Cordone.",segni:"Un ululato più basso, impronte grandi tra quelle dei cani.",caccia:"Manda avanti i cani ed entra quando sei impegnato. A nord alcuni fanno copie psichiche di sé.",teme:"Il fuoco, meno dei cani."},
 cinghiale:{n:"Cinghiale mutante",d:"B",hp:4,D:2,P:3,q:[1,3],fuga:"terr",sensi:"C · udito e fiuto",parte:"Zoccolo di cinghiale",pr:[300,500],dove:"Discarica, Agroprom, Valle Oscura, di giorno.",segni:"Terra smossa, alberi scortecciati, grugniti.",caccia:"Difende il territorio e carica in linea retta. Schivato dietro un ostacolo, resta stordito.",teme:"Niente; gira intorno alle anomalie."},
 carne:{n:"Carne",d:"D",hp:3,D:1,P:1,q:[3,6],fuga:"primo",sensi:"D · vista",parte:"Occhio di carne",pr:[150,300],dove:"Cordone, Agroprom, fattorie e campi, di giorno.",segni:"Grugniti, erba strappata, odore di stalla.",caccia:"Non caccia: ignora chi resta oltre i 20 m, attacca solo se chiusa in un angolo.",teme:"Il rumore, il fuoco."},
 ratti:{n:"Ratti e tushkano",d:"D",hp:1,D:1,P:0,q:[6,10],fuga:"branco",sensi:"C · fiuto",parte:"",pr:[0,0],dove:"Cantine, sotterranei, fogne.",segni:"Squittii, escrementi, cavi rosicchiati.",caccia:"Lo sciame sale dal buio e morde le gambe.",teme:"Il fuoco."},
 succhiasangue:{n:"Succhiasangue",d:"A",hp:6,D:2,P:3,q:[1,1],fuga:"solo",inv:2,sensi:"A · udito, vista al buio",parte:"Tentacoli di succhiasangue",pr:[1500,3000],dove:"Rari dalla Discarica in su, comuni nei sotterranei.",segni:"Un respiro dove non c'è nessuno, cadaveri svuotati.",caccia:"Quasi invisibile (−2 a colpirlo). Colpisce da dietro e torna; ferito a metà si ritira e torna di notte.",teme:"La luce puntata addosso."},
 snork:{n:"Snork",d:"B",hp:4,D:2,P:2,q:[1,3],fuga:"mai",salta:1,sensi:"B · fiuto e udito",parte:"Zampa di snork",pr:[600,1000],dove:"Yantar, Magazzini, Rostok e nord; sotterranei.",segni:"Un ringhio dentro una maschera antigas, salti nel buio.",caccia:"Salta da 10 m; chi non lo vede finisce a terra. Non scappa mai.",teme:"Niente."},
 controllore:{n:"Controllore",d:"C",hp:5,D:1,P:0,q:[1,1],fuga:"solo",psi:"A",sensi:"psi · sente le menti entro 50 m",parte:"Mano di controllore",pr:[3000,6000],dove:"Raro: Yantar, nord, sotterranei.",segni:"Zombi che camminano in fila, mal di testa, voci.",caccia:"Attacca la mente da lontano (Sangue freddo per resistere). Ferito da vicino scappa.",teme:"Chi gli arriva addosso."},
 burer:{n:"Burer",d:"B",hp:6,D:2,P:3,q:[1,1],fuga:"terr",sensi:"B · udito",parte:"Mano di burer",pr:[2000,4000],dove:"Sotterranei e laboratori.",segni:"Oggetti che volano, un borbottio sotto il cappuccio.",caccia:"Strappa le armi di mano, fa scudo. Debole da vicino. Non lascia la tana.",teme:"Il corpo a corpo."},
 chimera:{n:"Chimera",d:"A",hp:10,D:3,P:4,q:[1,1],fuga:"solo",salta:1,sensi:"A · udito, vista notturna",parte:"Artiglio di chimera",pr:[5000,10000],dove:"Raro: Foresta Rossa, Radar, nord.",segni:"Erba schiacciata in cerchi, prede a due morsi.",caccia:"Salta, colpisce, sparisce nell'erba. Ferita torna la notte dopo.",teme:"Niente."},
 pseudogigante:{n:"Pseudogigante",d:"A",hp:12,D:3,P:5,cl:2,q:[1,1],fuga:"mai",sensi:"C · udito",parte:"Mano di pseudogigante",pr:[6000,12000],dove:"Raro: nord e sotterranei.",segni:"La terra trema a ritmo, alberi spezzati all'altezza di un uomo.",caccia:"Onda d'urto che butta a terra. Lento a girarsi. Pelle classe 2.",teme:"Niente."},
 poltergeist:{n:"Poltergeist",d:"C",hp:3,D:1,P:1,q:[1,1],fuga:"mai",inv:2,sensi:"sa dove sei nel suo edificio",parte:"",pr:[0,0],dove:"Edifici abbandonati, sotterranei.",segni:"Luci che tremano, oggetti spostati.",caccia:"Lancia oggetti, invisibile; si vede un turno quando lo colpisci. Non esce mai.",teme:"Uscire dall'edificio."},
 zombi:{n:"Zombi",d:"D",hp:3,D:2,P:2,q:[2,4],fuga:"mai",spara:1,raff:2,sensi:"D · vista",parte:"",pr:[0,0],kit:"zombi",dove:"Yantar, Foresta Rossa, Radar, nord.",segni:"Borbottii, passi strascicati, spari senza senso.",caccia:"Avanzano sparando senza ripararsi (−1 al tiro). Erano stalker.",teme:"Niente."}};
const ZNEM={"Cordone":[["novellino","bandito","militare"],["cane","carne","ratti"]],"Discarica":[["bandito","veterano"],["cane","pseudocane","cinghiale","carne"]],"Agroprom":[["veterano","militare","speciali"],["cane","pseudocane","cinghiale","carne"]],"Valle Oscura":[["bandito"],["cane","pseudocane","cinghiale","succhiasangue"]],"Bar e Rostok":[["dovere","veterano"],["pseudocane","snork","zombi"]],"Yantar":[["mercenario","veterano"],["zombi","snork","controllore"]],"Magazzini dell'esercito":[["liberta","veterano","mercenario"],["pseudocane","cinghiale","snork"]],"Foresta Rossa":[["monolite","mercenario"],["zombi","snork","chimera"]],"Radar":[["monolite","mercenario","cecchino"],["zombi","snork","pseudogigante"]],"Pripjat'":[["monolite","mercenario","cecchino"],["snork","zombi","controllore","succhiasangue"]],"La centrale":[["monolite"],["pseudogigante","snork"]],"Janiv e Jupiter":[["mercenario","bandito"],["snork","chimera","burer"]],"Zaton":[["bandito","mercenario"],["chimera","snork","burer"]],"Sotterranei e laboratori":[["mercenario"],["ratti","snork","succhiasangue","burer","poltergeist","controllore"]]};
const zNem=(z,mut)=>{const t=ZNEM[z]||ZNEM["Cordone"];return t[mut?1:0];};
const between=([a,b])=>a+Math.floor(Math.random()*(b-a+1));

/* ---------- tiri del PG: passano dal tiro normale (bonus, ferite, PE, munizioni, registro) ---------- */
function qRoll(a,s,p,w,m){const o={...ui.dr};Object.assign(ui.dr,{a,s:s||"",p:Math.max(-4,Math.min(4,+p||0)),m:+m||0,w:w||"",tr:true});const prev=ui.roll;try{doRoll();}catch(e){console.error(e);}const R=ui.roll;Object.assign(ui.dr,o);if(!R||R===prev)return null;const st=rollStats(R);return {R,base:st.base,hits:st.hits,jam:st.jam,dv:R.dice.map(x=>`${x.g}:${x.v}`).join(" ")};}
const pgSpec=re=>new RegExp(re,"i").test(S.pg.spec||"");
const haveIt=re=>L.inv.find(x=>re.test(x.nome||"")&&mine(x)&&["in mano","addosso","zaino","indossato"].includes(x.dove||"zaino"));
const sgLog=(arr,t)=>{arr.unshift(t);if(arr.length>40)arr.length=40;};

/* ---------- SCONTRO ---------- */
function scNew(){const z=S.clock.luogo||"Cordone";const mut=ui.scMut!=null?!!ui.scMut:false;const lst=zNem(z,mut);const k=lst.includes(ui.scK)?ui.scK:lst[0];return {z,mut,k};}
function scStart(k,mut,opt={}){const T=mut?MUT[k]:NEMU[k];if(!T)return;try{const st=clone(S);st.scontro=null;LS.set("pda.scsnap",{stato:st,inv:clone(L.inv),png:clone(L.png),tiri:clone(L.tiri),solo:clone(L.solo),quando:S.clock.ora});}catch(_){}const n=Math.max(1,+opt.n||+ui.scN||between(T.q));const ent=[];
  ent.push({id:"pg",n:S.pg.nome?`${S.pg.nome}${S.pg.sopr?` «${S.pg.sopr}»`:""}`:"Tu",lato:"noi",pg:1,cop:0,stato:"ok"});
  gruppo().forEach(p=>{const dd=((p.nota||"").match(/Dado ([A-D])/)||[])[1]||"C";ent.push({id:"png:"+p.id,pid:p.id,n:p.nome,lato:"noi",d:dd,D:2,P:3,raff:1,t:2,dmg:+p.fer||0,stato:(+p.fer||0)>=3?"fuori":"ok",cop:0});});
  const pd=mut?{P:T.P,D:T.D}:ammoPD(T.mun);
  for(let i=0;i<n;i++)ent.push({id:"e"+i,n:n>1?`${T.n} ${i+1}${i===0&&n>2?" (capo)":""}`:T.n,lato:"loro",k,mut:!!mut,d:i===0&&n>2&&!mut&&T.d!=="A"?gstep(T.d,1):T.d,D:pd.D,P:pd.P,raff:mut?(T.raff||0):T.raff,t:mut?(T.cl||0):T.t,e:mut?(T.cl||0):T.e,hp:mut?T.hp:4,dmg:0,stato:"ok",cop:+opt.cop||+ui.scCop||0,spari:0});
  const sorp=opt.sorp||ui.scSorp||"";ent.forEach(e=>{e.ini=d(10)+(sorp===e.lato?100:0)+(e.pg&&pgSpec("Tattica di squadra")?1:0);});
  ent.sort((a,b)=>b.ini-a.ini);
  S.scontro={k,mut:!!mut,r:1,i:0,ord:ent.map(e=>e.id),ent,dist:opt.dist||ui.scDist||(T.dist||"media"),log:[],mor:0,fine:false,tn:T.n,z:S.clock.luogo};
  if(mut){S.bestia=S.bestia||{};const b=S.bestia[k]=S.bestia[k]||{visti:0,uccisi:0};b.visti++;}
  sgLog(S.scontro.log,`Scontro con ${n} × ${T.n} a distanza ${S.scontro.dist}${sorp?`, sorpresa: ${sorp==="noi"?"voi":"loro"} per primi`:""}. Iniziativa: ${ent.map(e=>`${e.n} ${e.ini>99?e.ini-100+"★":e.ini}`).join(", ")}.`);
  sfx("beep");ui.dsub="scontro";npcRun();}
const scE=id=>S.scontro.ent.find(e=>e.id===id);
const scCur=()=>S.scontro&&scE(S.scontro.ord[S.scontro.i]);
const alive=l=>S.scontro.ent.filter(e=>e.lato===l&&e.stato==="ok");
function scNext(){const C=S.scontro;if(!C||C.fine)return;C.i++;if(C.i>=C.ord.length){C.i=0;C.r++;sgLog(C.log,`— Round ${C.r} —`);}npcRun();}
function npcRun(){const C=S.scontro;let guard=0;while(C&&!C.fine&&guard++<60){scCheck();if(C.fine)break;const e=scCur();if(!e||e.stato!=="ok"){C.i++;if(C.i>=C.ord.length){C.i=0;C.r++;sgLog(C.log,`— Round ${C.r} —`);}continue;}if(e.pg){if(pgDown()){sgLog(C.log,"Sei a terra: non agisci.");C.i++;if(C.i>=C.ord.length){C.i=0;C.r++;}continue;}C.azL=0;C.azV=0;C.mira=0;break;}
    npcAct(e);C.i++;if(C.i>=C.ord.length){C.i=0;C.r++;sgLog(C.log,`— Round ${C.r} —`);}}save();}
const pgDown=()=>(S.corpo||[]).some(w=>w.morto||w.morente&&!w.stab)||(+S.tr.ferite||0)>=6;
function closer(){const C=S.scontro;const i=DIST.findIndex(x=>x[0]===C.dist);if(i>0){C.dist=DIST[i-1][0];return true;}return false;}
function npcAct(e){const C=S.scontro;const T=e.mut?MUT[e.k]:NEMU[e.k];
  if(e.lato==="noi"){const tg=pk(alive("loro"));if(!tg)return;const r=rDie(e.d,DM[C.dist]-(tg.cop||0)-(tg.mut?(MUT[tg.k].inv||0):0));let extra=0;if(r.s>0&&e.raff)for(let j=0;j<e.raff;j++)if(d(6)===6)extra++;
    if(!r.s){sgLog(C.log,`${e.n} spara a ${tg.n}: ${r.g}=${r.v}, mancato.`);return;}hitNpc(tg,e.D+(r.s-1),e.P,`${e.n} colpisce ${tg.n}`);if(extra){const t2=pk(alive("loro"));if(t2)hitNpc(t2,e.D,e.P,`${e.n}, raffica, colpisce anche ${t2.n}`);}C.allerta=1;S.allerta=Math.min(6,(+S.allerta||0)+1);return;}
  /* nemici */
  if(T.psi){const r=rDie(T.psi,0);const [g]=grades("sf","",0);const v=d(DIE[g]);const s=succ(v);if(r.s>s){trAdd({nervi:2});sgLog(C.log,`${e.n}: attacco psi (${r.v} contro il tuo Sangue freddo ${v}). Perdi: +2 Nervi. Perdi l'azione lenta.`);C.psi=1;sfx("hit");}else sgLog(C.log,`${e.n}: attacco psi, resisti (Sangue freddo ${v} contro ${r.v}).`);return;}
  if(e.mut&&!T.spara){if(C.dist!=="corta"&&!(T.salta&&C.dist==="media")){closer();sgLog(C.log,`${e.n} si avvicina: ora distanza ${C.dist}.`);return;}}
  if(!e.mut&&T.k!=="cecchino"&&e.k==="bandito"&&C.dist==="lunga"&&d(2)===1){closer();sgLog(C.log,`${e.n} avanza gridando: distanza ${C.dist}.`);return;}
  const targets=alive("noi").filter(t=>!(t.pg&&pgDown()));if(!targets.length)return;const pool=[];targets.forEach(t=>{pool.push(t);if(t.pg)pool.push(t);});const tg=pk(pool);
  const melee=e.mut&&!T.spara;const st=melee?0:DM[C.dist]-(tg.cop||0)-(T.spara?1:0);const r=rDie(e.d,st);let extra=0;if(r.s>0&&e.raff)for(let j=0;j<e.raff;j++)if(d(6)===6)extra++;
  const verbo=melee?(T.salta&&C.dist==="media"?"salta addosso a":"attacca"):"spara a";if(T.salta&&C.dist==="media"){C.dist="corta";}
  if(!melee){e.spari++;}
  if(!r.s){sgLog(C.log,`${e.n} ${verbo} ${tg.pg?"te":tg.n}: ${r.g}=${r.v}, a vuoto.`);if(!melee&&tg.pg&&e.raff)scSupp(`raffica di ${e.n}`);return;}
  const dmg=e.D+(r.s-1);for(let h=0;h<=extra;h++){const t=h===0?tg:pk(targets);if(!t)break;if(t.pg){const hr=hitRoll();const before=(S.corpo||[]).length;hitApply({p:hr.p,r:hr.r,D:h===0?dmg:e.D,P:e.P,ex:0});const w=(S.corpo||[])[before];sgLog(C.log,`${e.n} ${verbo} te${h?" (raffica)":""}: ${r.g}=${r.v} · ${PN[hr.p].toLowerCase()} · D${h===0?dmg:e.D} P${e.P}${w?` → ${w.t}${w.crit?` (critico ${w.crit})`:""}`:" → fermato dall'armatura"}.`);sfx("hit");scSupp(`colpo di ${e.n}`);}
    else hitAlly(t,h===0?dmg:e.D,e.P,`${e.n} ${verbo} ${t.n}`);}
  if(T.k==="cecchino"||e.k==="cecchino"){if(e.spari>=2){e.spari=0;e.cop=2;sgLog(C.log,`${e.n} ha sparato due volte e cambia posto: per ritrovarlo serve Ricognizione −1 (riparo pesante finché non lo trovi).`);}}}
function scSupp(why){const C=S.scontro;const [g]=grades("sf","",0);const v=d(DIE[g]);if(succ(v)){sgLog(C.log,`Soppressione (${why}): Sangue freddo ${g}=${v}, tieni.`);return;}trAdd({nervi:1});C.supp=1;sgLog(C.log,`Soppressione (${why}): Sangue freddo ${g}=${v}, 0 successi. +1 Nervi, perdi la prossima azione lenta.`);}
function armorHit(cl,P,dmg){if(P>cl)return {dmg,t:cl?`passa la classe ${cl}`:"senza protezione"};if(P===cl)return {dmg:Math.max(1,dmg-1),t:`P uguale alla classe ${cl}, −1`};return {dmg:0,t:`fermato dalla classe ${cl}`};}
function hitAlly(t,dmg,P,txt){const C=S.scontro;const z=zonaOf(hitRoll().p);const a=armorHit(z==="testa"?0:t.t,P,dmg);if(!a.dmg){sgLog(C.log,`${txt}: ${z}, ${a.t}.`);return;}t.dmg=(+t.dmg||0)+a.dmg;
  if(t.dmg>=4){t.stato="morto";upd("png",t.pid,{stato:"morto",fer:t.dmg});}else if(t.dmg>=3){t.stato="fuori";upd("png",t.pid,{fer:t.dmg});}else upd("png",t.pid,{fer:t.dmg});
  sgLog(C.log,`${txt}: ${z}, ${a.dmg} dann${a.dmg>1?"i":"o"} (${t.dmg} in tutto)${t.stato==="morto"?". È morto.":t.stato==="fuori"?". È a terra, fuori combattimento.":"."}`);sfx("hit");}
function hitNpc(t,dmg,P,txt,zona){const C=S.scontro;const z=zona||zonaOf(hitRoll().p);const cl=z==="testa"?t.e:t.t;const a=armorHit(cl||0,P,dmg);
  if(!a.dmg){sgLog(C.log,`${txt}: ${z}, ${a.t}. Solo soppressione.`);if(!t.mut&&d(2)===1)t.cop=Math.min(2,(t.cop||0)+1);return;}
  t.dmg+=a.dmg;const T=t.mut?MUT[t.k]:NEMU[t.k];let fine="";
  if(t.mut){if(t.dmg>=t.hp){t.stato="morto";fine=" Abbattuto.";}else if(T.fuga==="solo"&&t.dmg>=t.hp/2){t.stato="fuggito";fine=` Ferito a metà, si ritira${t.k==="succhiasangue"||t.k==="chimera"?": tornerà, di notte":""}.`;}else if(T.fuga==="primo"){t.stato="fuggito";fine=" Scappa.";}}
  else{if(t.dmg>=4){t.stato="morto";fine=" Morto.";}else if(t.dmg>=3){t.stato="fuori";fine=" A terra, fuori combattimento.";}}
  sgLog(C.log,`${txt}: ${z}, ${a.t}, ${a.dmg} dann${a.dmg>1?"i":"o"}.${fine}`);if(t.stato!=="ok")morale(t);}
function morale(t){const C=S.scontro;const all=C.ent.filter(e=>e.lato==="loro");const down=all.filter(e=>e.stato!=="ok").length;const T=C.mut?MUT[C.k]:NEMU[C.k];
  const capo=t.id==="e0"&&all.length>2;if(C.mor>=2||!(capo||down*2>=all.length))return;if(C.mut?["mai","terr"].includes(T.fuga)||T.fuga==="solo":!T.m)return;C.mor++;
  const g=C.mut?T.d:T.m;const ok=alive("loro");const r=rDie(g,(ok.some(e=>e.cop>=2)?1:0)-(ok.some(e=>e.dmg)?1:0));const s=r.s;const r1=r,r2={v:r.g};
  if(s>=2){sgLog(C.log,`Morale (${r2.v}=${r1.v}): tengono.`);return;}
  if(s===1){ok.forEach(e=>e.cop=2);sgLog(C.log,`Morale (${r2.v}=${r1.v}): arretrano dietro un riparo pesante e smettono di avanzare. Potrebbero chiedere una tregua.`);return;}
  ok.forEach(e=>{e.stato=C.mut?"fuggito":(["bandito","novellino"].includes(e.k)?(d(2)===1?"arreso":"fuggito"):["liberta","mercenario","veterano","dovere"].includes(e.k)?"arreso":"fuggito");});sgLog(C.log,`Morale (${r2.v}=${r1.v}): cedono. ${C.mut?"Il branco scappa.":T.ced[0].toUpperCase()+T.ced.slice(1)+"."}`);}
function scCheck(){const C=S.scontro;if(!C||C.fine)return;if(!alive("loro").length){C.fine=true;sgLog(C.log,"Scontro finito.");if(C.mut){S.bestia=S.bestia||{};const b=S.bestia[C.k]=S.bestia[C.k]||{visti:1,uccisi:0};b.uccisi+=C.ent.filter(e=>e.lato==="loro"&&e.stato==="morto").length;}sfx("job");}
  else if(pgDown()&&!alive("noi").some(e=>!e.pg)){C.fine=true;sgLog(C.log,"Sei a terra e non c'è nessuno in piedi con te. Lo scontro finisce qui: decide il GM, o l'Oracolo.");}}
/* azioni del PG */
function inHand(){if(!armaSel()){const a=L.inv.find(x=>mine(x)&&x.dove==="in mano"&&(x.tipo==="arma"||armOf(x.nome)?.c==="armi"));if(a)ui.dr.w=a.id;}return armaSel();}
function pgShoot(){const C=S.scontro;const W=inHand();const tg=scE(ui.scT)&&scE(ui.scT).stato==="ok"?scE(ui.scT):alive("loro")[0];if(!tg)return;
  if(C.supp||C.psi){toast("Hai perso l'azione lenta di questo turno.");return;}if(C.azL){toast("Hai già fatto l'azione lenta.");return;}
  if(!W){toast("Prendi un'arma in mano (qui sotto).");return;}const w=armOf(W.nome);const fire=isFire(w);
  if(!fire){toast("Con quest'arma: corpo a corpo.");return;}
  const rng=+(((w.s||"").match(/(\d+) m/)||[])[1]||100);if(DMAX[C.dist]>rng*2&&C.dist!=="corta"){toast(`Troppo lontano per ${W.nome} (${rng} m).`);return;}
  const testa=!!ui.scTesta;const steps=DM[C.dist]+(C.mira?1:0)-(tg.cop||0)-(testa?2:0)-(tg.mut?(MUT[tg.k].inv||0):0);const maxR=+(((w.s||"").match(/raffica (\d)/)||[])[1]||0);const m=Math.min(maxR,+ui.scRaff||0);
  const R=qRoll("agilita","tiro",steps,W.id,m);if(!R)return;C.azL=1;C.mira=0;const pd=ammoPD(W.mun||"");const noise=(w.g==="pistola"?1:2)+(m?1:0);if(!/Silenziatore|silenziat/i.test((W.acc||[]).join(" "))){S.allerta=Math.min(6,(+S.allerta||0)+noise);}
  if(!R.base){sgLog(C.log,`Spari a ${tg.n} (${R.dv}, passi ${steps>=0?"+":""}${steps}): mancato.`);if(R.jam)sgLog(C.log,"L'arma si inceppa: serve un'azione lenta.");return;}
  hitNpc(tg,pd.D+(R.base-1)+(C.dist==="corta"&&/pallettoni/.test(W.mun||"")?1:0),pd.P,`Spari a ${tg.n} (${R.dv})`,testa?"testa":null);
  for(let h=0;h<R.hits;h++){const t2=tg.stato==="ok"?tg:alive("loro")[0];if(!t2)break;hitNpc(t2,pd.D,pd.P,`Raffica, colpo in più su ${t2.n}`);}
  if(R.jam)sgLog(C.log,"L'arma si inceppa: serve un'azione lenta.");if(C.k==="cecchino"&&tg.stato==="ok")tg.stato="ok";}
function pgMelee(){const C=S.scontro;const tg=scE(ui.scT)&&scE(ui.scT).stato==="ok"?scE(ui.scT):alive("loro")[0];if(!tg)return;if(C.azL||C.supp||C.psi){toast("Niente azione lenta, questo turno.");return;}if(C.dist!=="corta"){toast("Devi essere a distanza corta: avvicinati.");return;}
  const W=inHand();const ms=W?(armOf(W.nome)||{}).s||"":"";const mm=ms.match(/(\d) dann[oi] P(\d)/);const D=mm?+mm[1]:1,P=mm?+mm[2]:0;
  const R=qRoll("forza","corpo",C.mira?1:0,W&&!isFire(armOf(W.nome))?W.id:"",0);if(!R)return;C.azL=1;C.mira=0;const def=rDie(tg.d,0);const net=Math.max(0,R.base-def.s);
  if(!net){sgLog(C.log,`Corpo a corpo con ${tg.n} (${R.dv}) contro ${def.v}: niente.`);return;}hitNpc(tg,D+(net-1),P,`Corpo a corpo con ${tg.n} (${R.dv}, lui ${def.v})`);}
function pgReload(){const C=S.scontro;const W=inHand();if(!W)return;const w=armOf(W.nome);if(!isFire(w))return;if(C.azL&&C.azV){toast("Niente azioni rimaste.");return;}const cap=capOf(w,W),car=carOf(W);if(car>=cap){toast("È già pieno.");return;}
  const got=takeAmmo(wCal(w),W.mun||"",cap-car);if(!got){toast("Niente munizioni di quel calibro addosso o nello zaino.");return;}upd("inv",W.id,{car:car+got});const sciolti=/sciolt/.test(w.s||"");if(sciolti)C.azL=1;else if(!C.azV)C.azV=1;else C.azL=1;sgLog(C.log,`Ricarichi ${W.nome}: ${car+got}/${cap}.`);}
function pgQuick(k){const C=S.scontro;if(C.azV&&C.azL){toast("Hai già usato le due azioni.");return;}const use=()=>{if(!C.azV)C.azV=1;else C.azL=1;};
  if(k==="mira"){C.mira=1;use();sgLog(C.log,"Prendi la mira: +1 al prossimo tiro.");}
  else if(k==="ripL"||k==="ripP"){const me=scE("pg");me.cop=k==="ripP"?2:1;use();sgLog(C.log,`Ti butti dietro un ${k==="ripP"?"riparo pesante":"riparo leggero"}.`);}
  else if(k==="scop"){scE("pg").cop=0;use();sgLog(C.log,"Esci allo scoperto.");}
  else if(k==="avv"){if(closer()){use();sgLog(C.log,`Avanzi: distanza ${C.dist}.`);}}
  else if(k==="all"){const i=DIST.findIndex(x=>x[0]===C.dist);if(i<3){C.dist=DIST[i+1][0];use();sgLog(C.log,`Arretri: distanza ${C.dist}.`);}}}
function pgEnd(){const C=S.scontro;C.supp=0;C.psi=0;scNext();}
function scClose(){const C=S.scontro;if(!C)return;const sum=C.ent.filter(e=>e.lato==="loro").map(e=>`${e.n}: ${e.stato}`).join(", ");const noi=C.ent.filter(e=>e.lato==="noi"&&!e.pg).map(e=>`${e.n}: ${e.stato}`).join(", ");
  soloPush(`Scontro: ${C.tn}`,[`${C.z} · ${C.r} round`,sum,noi?`Gruppo: ${noi}`:"",`Ferite ${S.tr.ferite} · Nervi ${S.tr.nervi} · Allerta ${S.allerta}`].filter(Boolean));S.scontro=null;ui.lastLoot=null;}
function scLoot(id){const e=scE(id);if(!e||e.looted)return;e.looted=1;if(e.mut){const T=MUT[e.k];if(!T.parte){toast("Niente da prendere.");return;}const R=qRoll("intelletto","sopravvivenza",pgSpec("Macellaio")?1:0,"",0);adv(15);if(!R||!R.base){sgLog(S.scontro.log,`Provi a prendere ${T.parte.toLowerCase()}: rovinata.`);return;}
  add("inv",{nome:T.parte,qta:1,slot:0.5,dove:"zaino",stato:"ok",nota:`al mercante ${T.pr[0]}–${T.pr[1]} ₽`});sgLog(S.scontro.log,`Prendi: ${T.parte}.`);return;}
  const T=NEMU[e.k];kit(T.kit||e.k,true);adv(10);sgLog(S.scontro.log,`Frughi ${e.n}: il bottino è nell'Oracolo, o «Prendi tutto» qui sotto.`);}

function vScontro(){const C=S.scontro;
  if(!C){const z=S.clock.luogo||"Cordone";const mut=!!ui.scMut;const lst=Object.keys(mut?MUT:NEMU);const zl=zNem(z,mut);const k=lst.includes(ui.scK)?ui.scK:zl[0];const T=(mut?MUT:NEMU)[k];
    return `<section class="pane"><h2>Nuovo scontro</h2><p class="small muted" style="margin-top:0">Il gruppo entra da solo. Prima di cominciare metti in mano l'arma che usi.</p>
    <div class="chips"><button class="chip" data-x="scmut" data-v="0" aria-pressed="${!mut}">Umani</button><button class="chip" data-x="scmut" data-v="1" aria-pressed="${mut}">Mutanti</button></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(11em,1fr));gap:8px">
      <label class="f"><span class="lbl">Chi</span><select data-xs="scK">${lst.map(x=>`<option value="${x}" ${x===k?"selected":""}>${esc((mut?MUT:NEMU)[x].n)}${zl.includes(x)?" ·":""}</option>`).join("")}</select></label>
      <label class="f"><span class="lbl">Quanti (vuoto = a caso ${T.q[0]}–${T.q[1]})</span><input type="number" min="1" max="12" data-xs="scN" value="${esc(ui.scN||"")}"></label>
      <label class="f"><span class="lbl">Distanza</span><select data-xs="scDist">${DIST.map(x=>`<option value="${x[0]}" ${(ui.scDist||T.dist||"media")===x[0]?"selected":""}>${x[1]}</option>`).join("")}</select></label>
      <label class="f"><span class="lbl">Loro sono</span><select data-xs="scCop">${COPN.map((x,i)=>`<option value="${i}" ${+(ui.scCop||0)===i?"selected":""}>${x}</option>`).join("")}</select></label>
      <label class="f"><span class="lbl">Sorpresa</span><select data-xs="scSorp"><option value="">nessuna</option><option value="noi" ${ui.scSorp==="noi"?"selected":""}>voi per primi</option><option value="loro" ${ui.scSorp==="loro"?"selected":""}>loro per primi</option></select></label></div>
    <p class="small muted">Con il punto (·) quelli tipici di ${esc(z)}. ${mut?esc(T.caccia||""):`Dado ${T.d} · Morale ${T.m||"nessuno"} · classe ${T.t}/${T.e} · ${esc(T.mun)}`}</p>
    <div class="row"><button class="btn" data-x="scgo">Comincia</button><button class="btn g" data-x="scrand">A caso per ${esc(z)}</button></div></section>`;}
  const cur=scCur();const me=scE("pg");const W=armaSel();const w=W&&armOf(W.nome);const maxR=w?+(((w.s||"").match(/raffica (\d)/)||[])[1]||0):0;
  const tgs=alive("loro");if(!tgs.find(t=>t.id===ui.scT))ui.scT=tgs[0]&&tgs[0].id;
  const row=e=>{const st=e.stato==="ok"?"":` <span class="tag">${e.stato}</span>`;const T=e.lato==="loro"?(e.mut?MUT[e.k]:NEMU[e.k]):null;const hp=e.pg?`Ferite ${S.tr.ferite}`:e.lato==="noi"?`danni ${e.dmg||0}/3`:e.mut?`danni ${e.dmg}/${e.hp}`:`danni ${e.dmg}/3`;
    return `<li class="sce ${cur&&cur.id===e.id?"cur":""} ${e.stato!=="ok"?"giu":""} ${e.lato}"><span class="num ini">${e.ini>99?e.ini-100:e.ini}</span><span><b>${esc(e.n)}</b>${st}<br><span class="small muted">${e.pg?esc(COPN[e.cop||0]):`dado ${e.d} · D${e.D} P${e.P} · classe ${e.t}${e.lato==="loro"&&!e.mut?`/${e.e}`:""} · ${COPN[e.cop||0]}`} · ${hp}</span></span>${e.lato==="loro"&&C.fine&&(e.stato==="morto"||e.stato==="fuori")&&!e.looted&&(e.mut?MUT[e.k].parte:1)?`<button class="btn g s" data-x="scloot" data-k="${e.id}">${e.mut?"Prendi la parte":"Fruga"}</button>`:""}</li>`;};
  const mio=cur&&cur.pg&&!C.fine;
  const armi=L.inv.filter(x=>mine(x)&&x.dove==="in mano"&&(x.tipo==="arma"||armOf(x.nome)?.c==="armi"));if(armi.length&&!armi.find(x=>x.id===ui.dr.w))ui.dr.w=armi[0].id;
  return `<div class="grid scgrid"><section class="pane"><h2>Scontro · round ${C.r}</h2>
    <div class="row small" style="gap:6px;margin-bottom:6px"><span>Distanza <b>${esc(C.dist)}</b> (${DM[C.dist]>=0?"+":""}${DM[C.dist]})</span><span>· Allerta <b>${S.allerta||0}</b></span>${C.mira?`<span class="tag">mira +1</span>`:""}${C.supp||C.psi?`<span class="tag warn">niente azione lenta</span>`:""}</div>
    <ol class="items scord">${C.ord.map(id=>row(scE(id))).join("")}</ol>
    ${C.fine?`<div class="row" style="margin-top:8px">${ui.lastLoot?`<button class="btn" data-a="prendi">Prendi tutto</button>`:""}<button class="btn g" data-x="scclose">Chiudi lo scontro e scrivilo</button></div>`:""}</section>
  <section class="pane">${C.fine?`<h3>Fine</h3><p class="small">Fruga i corpi o prendi le parti, poi chiudi. Lo scontro finisce nell'Oracolo.</p>`:mio?`<h3>Tocca a te</h3>
    <p class="small muted" style="margin-top:0">Un turno: un'azione lenta e una veloce, o due veloci. ${C.azL?"Lenta usata. ":""}${C.azV?"Veloce usata.":""}</p>
    <label class="f"><span class="lbl">Arma in mano</span><select data-xs="drw">${armi.length?armi.map(x=>`<option value="${x.id}" ${ui.dr.w===x.id?"selected":""}>${esc(x.nome)}${isFire(armOf(x.nome))?` · ${carOf(x)}/${capOf(armOf(x.nome),x)}`:""}</option>`).join(""):`<option value="">mani nude</option>`}</select></label>
    <label class="f"><span class="lbl">Bersaglio</span><select data-xs="scT">${tgs.map(t=>`<option value="${t.id}" ${ui.scT===t.id?"selected":""}>${esc(t.n)}</option>`).join("")}</select></label>
    <div class="row small" style="gap:8px;margin:6px 0"><label class="row"><input type="checkbox" data-xs="scTesta" ${ui.scTesta?"checked":""} style="width:auto;min-height:0"> alla testa (−2)</label>${maxR?`<label class="row">raffica <select data-xs="scRaff" style="width:auto;min-height:30px">${[0,1,2,3].slice(0,maxR+1).map(n=>`<option value="${n}" ${+(ui.scRaff||0)===n?"selected":""}>${n?n+" dadi":"colpo singolo"}</option>`).join("")}</select></label>`:""}</div>
    <div class="lbl">Azioni lente</div><div class="row" style="gap:6px"><button class="btn" data-x="scshoot">Spara</button><button class="btn" data-x="scmelee">Corpo a corpo</button><button class="btn g" data-x="screl">Ricarica</button></div>
    <div class="lbl" style="margin-top:8px">Azioni veloci</div><div class="row" style="gap:6px"><button class="btn g s" data-x="scq" data-k="mira">Mira</button><button class="btn g s" data-x="scq" data-k="ripL">Riparo leggero</button><button class="btn g s" data-x="scq" data-k="ripP">Riparo pesante</button><button class="btn g s" data-x="scq" data-k="avv">Avanza</button><button class="btn g s" data-x="scq" data-k="all">Arretra</button>${me.cop?`<button class="btn g s" data-x="scq" data-k="scop">Esci allo scoperto</button>`:""}</div>
    <div class="row" style="margin-top:10px"><button class="btn big2" data-x="scend">Fine del mio turno ▸</button></div>
    <p class="small muted">Cure, droghe e granate: usale dalla Salute o dallo Zaino, poi «Fine del mio turno». I tiri finiscono anche in Dadi.</p>`:`<p class="empty">…</p>`}
    <h3 style="margin-top:12px">Cosa succede</h3><ul class="sclog small">${C.log.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>
    <div class="row" style="gap:6px;margin-top:6px">${C.fine?"":`<button class="btn g s" data-x="scabort">Interrompi (fuga, tregua, resa)</button>`}${LS.get("pda.scsnap")?`<button class="btn g s" data-x="scundo">${ui.scUndoSure?"Sicuro? Torna a prima dello scontro":"Annulla tutto lo scontro"}</button>`:""}</div></section></div>`;}

/* ---------- ANOMALIE ---------- */
const ANOM=[["Trampolino",2,"g","ti schiaccia e ti scaraventa: a terra, l'oggetto in mano vola via"],["Vortice",4,"torace","ti risucchia: critico al torace"],["Bruciatore",2,"torace","getto di fuoco: vestiti in fiamme"],["Elettro",2,"torace","scarica: soppressione, l'elettronica rischia"],["Punch",1,"g","pozza acida: +2 Radiazioni, la roba a contatto si usura"],["Gas",1,"testa","nube velenosa: +1 Fatica"]];
const ANOMD={"Trampolino":"Foglie e polvere che girano in cerchio, aria che ondeggia. Schiaccia e scaraventa.","Vortice":"Quasi invisibile, una bolla nell'aria. Risucchia, solleva, fa a pezzi. Spesso mortale.","Bruciatore":"Aria tremolante, fiammelle a terra. Getto di fuoco.","Elettro":"Scintille sul terreno e sugli oggetti, odore di ozono. Scarica.","Punch":"Pozza verde luminosa che sfrigola. Corrode e scioglie.","Gas":"Nebbia velenosa che si muove piano."};
function anStart(z,extra){const per=perOf(z||S.clock.luogo);const types=[...ANOM].sort(()=>Math.random()-.5).slice(0,2+(per>=3?1:0)).map(a=>a[0]);
  S.anom={z:z||S.clock.luogo,per,passi:1+Math.ceil(per/2),fatti:0,tipi:types,art:null,cercato:0,extra:+extra||0,log:[`Campo di anomalie (pericolo ${per}). Si vedono: ${types.join(", ")}.`]};S.bestia=S.bestia||{};types.forEach(t=>{S.bestia["a:"+t]=S.bestia["a:"+t]||{visti:0};S.bestia["a:"+t].visti++;});ui.zsub="";}
function bolts(){const b=L.inv.find(x=>/^Bulloni/.test(x.nome||"")&&mine(x)&&x.dove!=="deposito");return b;}
function anHit(tipo){const A=ANOM.find(a=>a[0]===tipo)||pk(ANOM);const p=A[2]==="g"?"g"+(d(2)===1?"sx":"dx"):A[2];hitApply({p,D:A[1],P:99,ex:0});if(A[0]==="Punch")trAdd({rad:2});if(A[0]==="Gas")trAdd({fatica:1});sfx("hit");return `${A[0]}: ${A[3]}.`;}
function anPass(m){const N=S.anom;if(!N||N.fatti>=N.passi)return;let steps=0;const det=haveIt(/^Rivelatore/);if(det)steps++;if(pgSpec("Lettore di anomalie"))steps++;if(ui.anFretta)steps--;if(/neve/i.test(S.clock.meteo||""))steps++;
  if(m==="bull"){const b=bolts();if(!b){toast("Non hai bulloni addosso o nello zaino.");return;}if(pgSpec("Mano del bullone"))steps++;const u=(b.usi!=null?+b.usi:20)-2;if(u<=0){if((+b.qta||1)>1)upd("inv",b.id,{qta:(+b.qta||1)-1,usi:20});else del("inv",b.id);}else upd("inv",b.id,{usi:u});}
  if(m==="occhio")steps--;const R=qRoll("intelletto","ricognizione",steps,"",0);if(!R)return;adv(m==="bull"?10:3);
  if(R.base>=1||(m==="bull"&&R.base===0&&false)){N.fatti++;N.log.unshift(`Passo ${N.fatti}/${N.passi}${m==="bull"?" col bullone":m==="occhio"?" a occhio":""} (${R.dv}): pulito.`);if(R.base>=2&&!N.art&&!N.cercato)N.log.unshift("Hai visto bene il campo: +1 se cerchi l'artefatto.");if(R.base>=2)N.bonus=1;return;}
  if(m==="bull"){adv(20);N.log.unshift(`Il bullone sparisce in un ${pk(N.tipi)} (${R.dv}): giri intorno, ci metti di più. Riprova.`);return;}
  N.fatti++;N.log.unshift(`Passo ${N.fatti}/${N.passi} (${R.dv}): ci entri dentro. ${anHit(pk(N.tipi))}`);}
function anSearch(){const N=S.anom;if(!N||N.cercato)return;N.cercato=1;const ch=[0,10,25,40,55,70][N.per]+(ui.dopoEm?25:0)+N.extra;const r=d(100);adv(30);
  if(r>ch){N.log.unshift(`Cerchi per mezz'ora (d100 ${r} contro ${ch}%): niente. Il campo è battuto.`);return;}
  let st=(N.bonus?1:0)+(pgSpec("Fiuto per gli artefatti")?1:0)+(haveIt(/Orso|Veles/)?1:0);const auto=haveIt(/Veles/);const R=auto?{base:1,dv:"Veles"}:qRoll("intelletto","ricognizione",st,"",0);if(!R)return;
  if(!R.base){N.log.unshift(`Qualcosa c'è (d100 ${r}), ma non lo trovi (${R.dv}).`);return;}const rr=d(6)+N.per;const rar=rr>=11?"unico":rr>=9?"raro":"comune";const pool=ART.filter(a=>a[2]===rar&&a[0]!=="Cuore dell'oasi"&&(N.tipi.includes(a[1])||rar!=="comune"));const A=pk(pool.length?pool:ART.filter(a=>a[2]===rar&&a[0]!=="Cuore dell'oasi"));
  N.art=A[0];N.artT=A[1];N.log.unshift(`Lo vedi: ${A[0]} (${rar}), dentro un ${A[1]}. Ora va strappato.`);}
function anTake(){const N=S.anom;if(!N||!N.art)return;const st=haveIt(/Perline della mamma/)?1:0;const R=qRoll("agilita","mobilita",st,"",0);if(!R)return;adv(5);
  if(!R.base){N.log.unshift(`Allunghi la mano (${R.dv}) e l'anomalia scatta. ${anHit(N.artT)}`);return;}const A=ART.find(a=>a[0]===N.art);
  add("inv",{nome:`Artefatto: ${A[0]}`,qta:1,slot:1,dove:"zaino",stato:"ok",nota:`${A[2]} · ${A[3]} · costo: ${A[4]} · mercante: ${A[5]} ₽`});N.log.unshift(`Preso: ${A[0]}. È nello zaino.`);N.art=null;sfx("job");}
function anClose(){const N=S.anom;if(!N)return;soloPush(`Campo di anomalie (${N.z})`,N.log.slice().reverse());S.anom=null;}
function anomHtml(){const N=S.anom;if(!N)return "";const b=bolts();const det=haveIt(/^Rivelatore/);
  return `<section class="pane anpane"><h2>Campo di anomalie</h2><p class="small muted" style="margin-top:0">${esc(N.z)} · pericolo ${N.per} · ${N.tipi.join(", ")} · ${b?`bulloni: ${b.usi!=null?b.usi:20}${(+b.qta||1)>1?` (+${(+b.qta)-1} sacchetti)`:""}`:"niente bulloni"}${det?` · ${esc(det.nome)} +1`:""}</p>
  ${N.fatti<N.passi?`<p>Passo ${N.fatti+1} di ${N.passi}.</p><div class="row" style="gap:6px"><button class="btn" data-x="anp" data-k="bull" ${b?"":"disabled"}>Lancia il bullone (10′)</button><button class="btn g" data-x="anp" data-k="occhio">A occhio, senza bullone (−1)</button></div>
  <label class="row small" style="margin-top:6px"><input type="checkbox" data-xs="anFretta" ${ui.anFretta?"checked":""} style="width:auto;min-height:0"> notte, nebbia o fretta (−1)</label>`:`<p>Sei passato.</p>`}
  <div class="row" style="gap:6px;margin-top:8px">${!N.cercato&&N.fatti>0?`<button class="btn g" data-x="ans">Cerca l'artefatto (30′)</button>`:""}${N.art?`<button class="btn" data-x="ant">Strappalo (Agilità + Mobilità)</button>`:""}<button class="btn g" data-x="anc">${N.fatti>=N.passi?"Esci dal campo":"Torna indietro"}</button></div>
  <ul class="sclog small">${N.log.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></section>`;}

/* ---------- VIAGGIO A TAPPE ---------- */
function vgStart(){const p=path(S.clock.luogo,ui.dest);if(!p||p.length<2)return;S.viaggio={p,i:0,notte:!!ui.notteV,log:[`Partenza da ${p[0]} per ${p[p.length-1]}: ${p.length-1} tratt${p.length>2?"i":"o"}.`],att:null};}
function vgLeg(){const V=S.viaggio;if(!V)return;if(S.scontro&&!S.scontro.fine){toast("Prima finisci lo scontro.");return;}if(S.anom){toast("Prima esci dal campo di anomalie.");return;}
  const a=V.p[V.i],z=V.p[V.i+1];if(!z)return;const e=edge(a,z),per=perOf(z),k=V.notte?2:1;const r1=d(6),r2=d(6),tot=r1+r2+per+(V.notte?1:0);const idx=VIAGGIO.findIndex(x=>tot<=x[0]);const res=VIAGGIO[idx][1];
  const em=d(6);const up=em===6||(V.notte&&em>=5);adv(e[3]*k*60);if(up)S.emiss=Math.min(6,(+S.emiss||0)+1);
  S.clock.luogo=z;gruppo().forEach(p=>upd("png",p.id,{luogo:z}));V.i++;if(V.i>=3)trAdd({fatica:1+(V.notte?1:0)});
  V.att=["calma","segni","anom","umani","mut","scoperta","due"][idx];const tag=V.att;
  let extra="";if(tag==="segni"){const m=MUT[pk(zNem(z,1))];extra=` Sembrano di: ${m.n.toLowerCase()}. ${m.segni}`;}if(tag==="umani")V.nem=pk(zNem(z,0));if(tag==="mut"||tag==="due")V.nem=pk(zNem(z,1));
  V.log.unshift(`${a} → ${z} (${e[2]} km, ${e[3]*k} h): ${r1}+${r2}+${per}${V.notte?"+1":""} = ${tot}. ${res}${extra}${up?` Emissione ${S.emiss}/6.`:""}${V.i>=3?" +1 Fatica.":""}`);
  if(tag==="scoperta"&&typeof evPick==="function"&&d(2)===1){try{const ev=evPick({});if(ev){evShow(ev);V.log.unshift("Qualcosa vi ferma per strada: guarda la storia in alto.");V.att=null;}}catch(_){}}
  if(V.i>=V.p.length-1&&!V.att){vgEnd();}else if(V.i>=V.p.length-1)V.arrivo=1;}
function vgEnd(){const V=S.viaggio;if(!V)return;toast(`Arrivato: ${V.p[V.p.length-1]}.`);soloPush("Viaggio",V.log.slice().reverse());S.viaggio=null;}
function vgAct(k){const V=S.viaggio;if(!V)return;const z=S.clock.luogo;
  if(k==="anom")anStart(z,V.att==="scoperta"?40:0);
  else if(k==="aggira"){adv(60);V.log.unshift("Giri al largo: un'ora in più.");}
  else if(k==="fight"){const mut=V.att!=="umani";scStart(V.nem,mut,{dist:mut?"media":pk(["media","lunga"]),sorp:""});ui.tab="dadi";location.hash="dadi";}
  else if(k==="evita"){const mut=V.att!=="umani";const T=mut?MUT[V.nem]:NEMU[V.nem];const R=qRoll("agilita","mobilita",V.notte?1:0,"",0);if(!R)return;const them=rDie(T.d,0);
    if(R.base>them.s){V.log.unshift(`Passate senza farvi vedere (${R.dv} contro ${them.v}).`);}else{V.log.unshift(`Vi hanno visti (${R.dv} contro ${them.v}).`);scStart(V.nem,mut,{dist:"media",sorp:"loro"});ui.tab="dadi";location.hash="dadi";}}
  if(V.att==="due"&&k!=="anom"){V.att="anom";return;}V.att=null;if(V.arrivo&&!V.att)vgEnd();}
function viaggioHtml(){const V=S.viaggio;if(!V)return "";const nx=V.p[V.i+1];const T=V.nem&&(V.att==="umani"?NEMU[V.nem]:MUT[V.nem]);
  const act=V.att==="anom"||V.att==="scoperta"?`<button class="btn" data-x="vga" data-k="anom">${V.att==="scoperta"?"Guarda cosa c'è (campo di anomalie)":"Attraversa il campo"}</button>${V.att==="anom"?`<button class="btn g" data-x="vga" data-k="aggira">Giraci intorno (+1 h)</button>`:`<button class="btn g" data-x="vga" data-k="">Lascia perdere</button>`}`
   :V.att==="umani"||V.att==="mut"||V.att==="due"?`<span class="small">${esc(T?T.n:"")}${V.att==="umani"?"":""}</span><button class="btn" data-x="vga" data-k="fight">Affronta</button><button class="btn g" data-x="vga" data-k="evita">Passa di nascosto (Agilità + Mobilità)</button>`
   :V.att?`<button class="btn g" data-x="vga" data-k="">Avanti</button>`:"";
  return `<section class="pane vgpane"><h2>In viaggio: ${esc(V.p[0])} → ${esc(V.p[V.p.length-1])}</h2>
  <ol class="vgsteps">${V.p.map((z,i)=>`<li class="${i<V.i?"ok":i===V.i?"cur":""}">${esc(z)}</li>`).join("")}</ol>
  ${act?`<div class="row" style="gap:6px;margin:8px 0">${act}</div>`:nx?`<div class="row" style="gap:6px;margin:8px 0"><button class="btn" data-x="vgl">Prossimo tratto: ${esc(nx)} (${edge(V.p[V.i],nx)[3]*(V.notte?2:1)} h)</button><button class="btn g" data-x="vgstop">Fermati qui</button></div>`:""}
  <ul class="sclog small">${V.log.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></section>`;}

/* ---------- BESTIARIO ---------- */
function vBestia(){const B=S.bestia||{};const ks=Object.keys(MUT);const n=ks.filter(k=>B[k]).length;
  return `<section class="pane" style="grid-column:1/-1"><h2>Bestiario</h2><p class="small muted" style="margin-top:0">Una scheda si apre quando incontri il mutante in uno scontro. ${n} su ${ks.length}.</p>
  <div class="bgrid">${ks.map(k=>{const M=MUT[k],b=B[k];if(!b)return `<div class="bcard lock"><b>???</b><div class="small muted">${esc(M.dove)}</div></div>`;
    return `<div class="bcard"><b>${esc(M.n)}</b> <span class="small muted">visti ${b.visti||0} · abbattuti ${b.uccisi||0}</span><div class="small">Dado ${M.d} · ${M.hp} danni per abbatterlo · morso D${M.D} P${M.P}${M.cl?` · pelle classe ${M.cl}`:""}</div><div class="small"><i>Sensi:</i> ${esc(M.sensi)}</div><div class="small"><i>Dove:</i> ${esc(M.dove)}</div><div class="small"><i>Segni:</i> ${esc(M.segni)}</div><div class="small"><i>Caccia:</i> ${esc(M.caccia)}</div><div class="small"><i>Teme:</i> ${esc(M.teme)}</div>${M.parte?`<div class="small"><i>Parte:</i> ${esc(M.parte.toLowerCase())}, ${M.pr[0]}–${M.pr[1]} ₽</div>`:""}</div>`;}).join("")}</div>
  <h3>Anomalie</h3><div class="bgrid">${ANOM.map(a=>{const b=B["a:"+a[0]];return b?`<div class="bcard"><b>${a[0]}</b> <span class="small muted">vista ${b.visti} volt${b.visti>1?"e":"a"}</span><div class="small">${esc(ANOMD[a[0]])}</div><div class="small"><i>Danno:</i> ${a[1]} · ${esc(a[3])}</div></div>`:`<div class="bcard lock"><b>???</b></div>`;}).join("")}</div></section>`;}

/* ---------- RIASSUNTO PER IL GM ---------- */
function gmTxt(){const p=S.pg,c=S.clock,E=(typeof evS==="function"?evS():{flag:{},visti:{}});const tr=Object.entries(S.tr).filter(([k,v])=>+v).map(([k,v])=>`${k} ${v}`).join(", ")||"nessuna traccia";
  const inv=L.inv.filter(x=>mine(x)&&["in mano","indossato","addosso"].includes(x.dove)).map(x=>`${x.nome}${x.dove==="in mano"?" (in mano)":""}${x.stato&&x.stato!=="ok"?` [${x.stato}]`:""}${x.car!=null?` ${x.car} colpi`:""}`).join("; ");
  const ws=(S.corpo||[]).map(w=>`${PN[w.p]}: ${w.t}${w.stab?" (stabilizzata)":""}`).join("; ");const G=gruppo().map(x=>`${x.nome}${x.fer?` (danni ${x.fer})`:""}`).join(", ");
  const jobs=L.pda.filter(j=>j.tipo==="lavoro"&&j.stato==="accettato").map(j=>j.titolo).join("; ");
  const last=[...L.solo].sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,6).map(x=>`- ${x.data} ${x.ora} ${x.tit}: ${(x.righe||[]).map(r=>String(r).replace(/<[^>]+>/g,"")).join(" · ").slice(0,220)}`).join("\n");
  const dia=[...L.diario].sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,3).map(x=>`- ${x.data} ${x.ora||""}: ${String(x.testo).slice(0,300)}`).join("\n");
  const fl=Object.keys(E.flag||{}).join(", ");const tp=Object.keys(E.visti||{}).filter(k=>/^t\d/.test(k)).join(", ");
  return `RIASSUNTO PER IL GM — PDA v${typeof APPV!=="undefined"?APPV:"?"}
Quando: ${c.data} ${c.ora}, ${c.luogo}${c.meteo?`, ${c.meteo}`:""}
Chi: ${p.nome} «${p.sopr}» · Nome ${S.nomeRep||0} · PE ${S.pe||0} · ${S.rubli||0} ₽ · fortuna ${S.fortuna?"sì":"usata"}
Tracce: ${tr}${ws?`\nFerite sul corpo: ${ws}`:""}
Emissione ${S.emiss||0}/6 · Allerta ${S.allerta||0} · Tensione ${S.tensione||5}
Gruppo: ${G||"da solo"}
Addosso: ${inv||"—"}
Lavori in corso: ${jobs||"—"}
${S.viaggio?`In viaggio: ${S.viaggio.p.join(" → ")} (tratto ${S.viaggio.i})\n`:""}${S.scontro?`Scontro in corso: ${S.scontro.tn}, round ${S.scontro.r}\n`:""}Trama (codificata, la legge solo il GM): ${btoa(unescape(encodeURIComponent(JSON.stringify({flag:fl,tappe:tp,fine:E.fine||""})))).split("").reverse().join("")}
Ultime cose successe:
${last||"—"}
Diario:
${dia||"—"}`;}
function gmPane(){return `<section class="pane"><h2>Per il GM</h2><p class="small muted" style="margin-top:0">Copia lo stato della partita e incollalo in chat a Claude: riprende da qui.</p><div class="row" style="gap:6px"><button class="btn" data-x="gm">Copia il riassunto</button><button class="btn g" data-x="amb">Suoni d'ambiente: ${typeof AMB!=="undefined"&&AMB.on?"sì":"no"}</button></div>${ui.gmT?`<textarea readonly style="margin-top:8px;min-height:14em;font-size:.8rem">${esc(ui.gmT)}</textarea>`:""}</section>`;}

/* ---------- banner e comandi ---------- */
function scBanner(){let h="";if(S.scontro&&!(ui.tab==="dadi"&&ui.dsub==="scontro"))h+=`<div class="evbox scban"><b>Scontro in corso</b> · round ${S.scontro.r}${scCur()&&scCur().pg&&!S.scontro.fine?" · tocca a te":""} <button class="btn s" data-x="goscontro">Vai</button></div>`;
  if(S.viaggio&&ui.tab!=="mappa")h+=`<div class="evbox scban"><b>In viaggio</b> verso ${esc(S.viaggio.p[S.viaggio.p.length-1])} · tratto ${S.viaggio.i}/${S.viaggio.p.length-1} <button class="btn s" data-x="gomappa">Vai</button></div>`;
  if(S.anom&&ui.tab!=="mappa")h+=`<div class="evbox scban"><b>Sei in un campo di anomalie</b> <button class="btn s" data-x="gomappa">Vai</button></div>`;return h;}
const XA={
 scmut:b=>{ui.scMut=b.dataset.v==="1";ui.scK="";},scgo:()=>{const z=S.clock.luogo||"Cordone";const mut=!!ui.scMut;const k=ui.scK&&(mut?MUT:NEMU)[ui.scK]?ui.scK:zNem(z,mut)[0];scStart(k,mut);},
 scrand:()=>{const z=S.clock.luogo||"Cordone";const mut=d(2)===1;scStart(pk(zNem(z,mut)),mut,{n:0,dist:pk(["media","lunga","media","corta"]),cop:d(3)-1,sorp:""});},
 scshoot:()=>pgShoot(),scmelee:()=>pgMelee(),screl:()=>pgReload(),scq:b=>pgQuick(b.dataset.k),scend:()=>pgEnd(),scclose:()=>scClose(),scloot:b=>scLoot(b.dataset.k),
 scundo:async()=>{if(!ui.scUndoSure){ui.scUndoSure=1;return;}ui.scUndoSure=0;const sn=LS.get("pda.scsnap");if(!sn)return;await importAll({stato:sn.stato,inv:sn.inv,png:sn.png,tiri:sn.tiri,solo:sn.solo,pda:clone(L.pda),diario:clone(L.diario)});LS.set("pda.scsnap",null);ui.lastLoot=null;toast("Scontro annullato: tutto come prima.");render();},
 scabort:()=>{const C=S.scontro;if(!C)return;C.fine=true;sgLog(C.log,"Interrotto: fuga, tregua o resa. Decidi tu, o chiedi all'Oracolo.");},
 gopart:()=>{ui.rv="partita";location.hash="registro";},goscontro:()=>{ui.dsub="scontro";location.hash="dadi";},gomappa:()=>{location.hash="mappa";},
 anp:b=>anPass(b.dataset.k),ans:()=>anSearch(),ant:()=>anTake(),anc:()=>anClose(),anstart:()=>anStart(S.clock.luogo),
 vgo:()=>vgStart(),vgl:()=>vgLeg(),vga:b=>vgAct(b.dataset.k),vgstop:()=>{soloPush("Viaggio",S.viaggio.log.slice().reverse());S.viaggio=null;},
 gm:()=>{ui.gmT=gmTxt();try{navigator.clipboard.writeText(ui.gmT).then(()=>toast("Copiato: incollalo in chat."),()=>toast("Selezionalo e copialo a mano."));}catch(_){toast("Selezionalo e copialo a mano.");}},
};
document.addEventListener("click",e=>{const b=e.target.closest("[data-x]");if(!b||b.disabled)return;const f=XA[b.dataset.x];if(!f)return;sfx("key");try{f(b);}catch(err){console.error(err);toast("Errore: "+err.message);}save();render();});
document.addEventListener("change",e=>{const t=e.target.closest("[data-xs]");if(!t)return;const k=t.dataset.xs;const v=t.type==="checkbox"?t.checked:t.value;if(k==="drw")ui.dr.w=v;else ui[k]=v;render();});
