/* ===== Anime: carattere, bisogni, segreti, rapporti, memoria, vite che vanno avanti ===== */
const AN_CAR={
 avido:{n:"avido",d:"conta tutto, anche gli amici"},leale:{n:"leale",d:"non tradisce chi lo ha aiutato"},codardo:{n:"codardo",d:"scappa prima, si giustifica dopo"},
 orgoglioso:{n:"orgoglioso",d:"non chiede, non ringrazia, non dimentica"},mitomane:{n:"mitomane",d:"ogni storia diventa una leggenda, la sua"},pio:{n:"pio",d:"prega, e giudica"},
 vendicativo:{n:"vendicativo",d:"tiene un registro dei torti"},generoso:{n:"generoso",d:"divide l'ultima scatoletta"},paranoico:{n:"paranoico",d:"vede complotti dappertutto, a volte ha ragione"},
 ubriacone:{n:"ubriacone",d:"la verità gli esce col terzo bicchiere"},curioso:{n:"curioso",d:"vuole sapere, e paga per sapere"},cinico:{n:"cinico",d:"crede solo ai soldi e alle pallottole"},
 sentimentale:{n:"sentimentale",d:"parla di casa, piange sulle canzoni"},collerico:{n:"collerico",d:"prima spara, poi chiede"},taciturno:{n:"taciturno",d:"parla poco, ma quando parla conta"},chiacchierone:{n:"chiacchierone",d:"sa tutto di tutti, e lo dice"}};
const AN_BIS={
 soldi:{n:"ha bisogno di soldi",f:"prestito"},debito:{n:"deve soldi a qualcuno",f:"prestito"},vendetta:{n:"vuole vendicarsi di qualcuno",f:"vendetta"},disperso:{n:"un amico è disperso",f:"cerca"},
 uscire:{n:"vuole uscire dalla Zona",f:"prestito"},medicine:{n:"è ferito e senza medicine",f:"consegna",obj:"Kit medico"},fame:{n:"non mangia da giorni",f:"consegna",obj:"cibo"},
 munizioni:{n:"è a secco di munizioni",f:"consegna",obj:"munizioni"},bere:{n:"ha bisogno di bere per dimenticare",f:"consegna",obj:"Vodka"},onore:{n:"deve riscattare il suo nome",f:"vendetta"},nessuno:{n:"per ora sta bene",f:null}};
const AN_SEG={
 ucciso:{n:"ha ucciso {x} e non l'ha detto a nessuno",g:3},ruba:{n:"ruba dalle casse del mercante",g:2},spia:{n:"passa informazioni ai banditi",g:3},informatore:{n:"fa la spia per l'Esercito",g:3},
 disertore:{n:"è un disertore del Dovere",g:2},monolite:{n:"è stato del Monolite, e ogni tanto sente ancora la voce",g:3},artefatto:{n:"ha un artefatto raro nascosto e non lo dice",g:1},
 debito:{n:"deve una fortuna a {x}",g:1},paura:{n:"non è mai entrato in un campo di anomalie: le sue storie sono inventate",g:1},famiglia:{n:"ha una famiglia fuori e manda tutto a casa, anche quello che non è suo",g:1},
 tradito:{n:"ha lasciato morire un compagno per salvarsi",g:2},nome:{n:"non si chiama come dice: è ricercato in Russia",g:2}};
const AN_SOPR=["Barbagianni","Kerosene","Lumaca","Ago","Ciclope","Fischio","Bottone","Pinne","Scheggia","Tamburo","Fango","Zarina","Gatto","Lanterna","Rospo","Scarpa","Cometa","Mosca","Cardinale","Granchio","Dinamo","Cetriolo","Tosse","Ombra","Nespola","Cipolla","Bracco","Cucchiaio","Saetta","Muschio","Ruggero","Becco","Tarlo","Polvere","Furetto","Ciocco","Faina","Sorcio","Vampa","Tenente"];
const AN_FZ=[["stalker libero",9],["Dovere",4],["Libertà",4],["bandito",4],["mercenario",2],["scienziato",1],["militare",1]];
const anS=()=>{S.an=S.an||{p:{},fatti:[],init:0,n:1};return S.an;};
const anOf=pid=>{const A=anS();if(!A.p[pid]){const p=L.png.find(x=>x.id===pid);if(!p)return null;A.p[pid]=anNew(p);}return A.p[pid];};
const anRandK=o=>alRand(Object.keys(o));
const anSh=p=>(p&&p.nome?(p.nome.match(/«([^»]+)»/)||[])[1]||p.nome.split(" ")[0]:"qualcuno");
function anNew(p){const ks=Object.keys(AN_CAR);const c1=alRand(ks);let c2=alRand(ks);if(c2===c1)c2=alRand(ks);
  return {car:[c1,c2].filter((v,i,a)=>a.indexOf(v)===i),bis:{k:Math.random()<.55?anRandK(AN_BIS):"nessuno",x:null,t:S.clock.data},seg:{k:anRandK(AN_SEG),x:null,sv:0},op:{},mem:[],um:0,ric:1+Math.floor(Math.random()*3)};}
const anHas=(a,k)=>a&&a.car.includes(k);
const anVivi=()=>L.png.filter(p=>p.stato!=="morto"&&!/uscit|partit/.test(p.stato||""));

/* il cast: in sandbox, una quarantina di persone con un nome, sparse per la Zona */
function anCast(){const A=anS();if(A.init)return;A.init=1;if(typeof tramaOn==="function"&&tramaOn())return;
  const zs=["Cordone","Cordone","Cordone","Discarica","Discarica","Agroprom","Valle Oscura","Bar e Rostok","Bar e Rostok","Bar e Rostok","Yantar","Magazzini dell'esercito","Magazzini dell'esercito","Janiv e Jupiter","Zaton","Zaton","Radar","Foresta Rossa"];
  const tot=AN_FZ.reduce((a,f)=>a+f[1],0);const usati=new Set(L.png.map(p=>p.nome));
  for(let i=0;i<40;i++){let r=Math.random()*tot,fz="stalker libero";for(const [f,w] of AN_FZ){r-=w;if(r<=0){fz=f;break;}}
    let z=alRand(zs);if(fz==="Libertà")z=alRand(["Magazzini dell'esercito","Magazzini dell'esercito","Janiv e Jupiter","Bar e Rostok"]);if(fz==="Dovere")z=alRand(["Bar e Rostok","Bar e Rostok","Discarica","Janiv e Jupiter"]);if(fz==="bandito")z=alRand(["Discarica","Valle Oscura","Valle Oscura","Cordone","Zaton"]);if(fz==="mercenario")z=alRand(["Foresta Rossa","Zaton","Magazzini dell'esercito"]);if(fz==="scienziato")z="Yantar";if(fz==="militare")z=alRand(["Cordone","Agroprom"]);
    let nm;for(let k=0;k<10;k++){nm=`${pk(NOMI)} «${AN_SOPR[(i+k*7)%AN_SOPR.length]}»`;if(!usati.has(nm))break;}usati.add(nm);
    add("png",{nome:nm,fazione:fz,fiducia:0,stato:"vivo",luogo:z,imp:false,cast:1,nota:"",vaga:true});}
  setTimeout(anRel,500);}
/* rapporti: ognuno ha uno o due amici e, spesso, un nemico; i bisogni puntano a persone vere */
function anRel(){const V=anVivi().filter(p=>!p.con);V.forEach(p=>{const a=anOf(p.id);if(!a||Object.keys(a.op).length)return;const vicini=V.filter(q=>q.id!==p.id&&(q.luogo===p.luogo||Math.random()<.25));
    const pick=()=>vicini.length?alRand(vicini):null;for(let i=0;i<1+(Math.random()<.5);i++){const q=pick();if(q){a.op[q.id]=2;const b=anOf(q.id);if(b&&b.op[p.id]==null)b.op[p.id]=1+(Math.random()<.5);}}
    if(Math.random()<.6){const q=pick();if(q&&a.op[q.id]==null){a.op[q.id]=-2-(Math.random()<.4);const b=anOf(q.id);if(b&&b.op[p.id]==null)b.op[p.id]=Math.random()<.5?-1:0;}}
    const nem=Object.keys(a.op).find(k=>a.op[k]<=-2),am=Object.keys(a.op).find(k=>a.op[k]>=2);
    if(["vendetta","onore"].includes(a.bis.k))a.bis.x=nem||null;if(a.bis.k==="debito")a.bis.x=nem||am||null;if(a.bis.k==="disperso")a.bis.x=am||null;
    if(["vendetta","debito","disperso","onore"].includes(a.bis.k)&&!a.bis.x)a.bis.k="soldi";
    if(["ucciso","debito"].includes(a.seg.k)){a.seg.x=(a.seg.k==="ucciso"?"un compagno di squadra, a Yantar, nel 2010":(nem?L.png.find(x=>x.id===nem).nome:"i banditi di Borov"));}});save();}
const anNome=pid=>{const p=L.png.find(x=>x.id===pid);return p?p.nome:"qualcuno";};
const anSeg=a=>AN_SEG[a.seg.k].n.replace("{x}",a.seg.x||"qualcuno");
const anBis=a=>{const b=AN_BIS[a.bis.k];if(!b)return"";let t=b.n;if(a.bis.x){const n=anNome(a.bis.x);t=a.bis.k==="vendetta"||a.bis.k==="onore"?`vuole regolare i conti con ${n}`:a.bis.k==="disperso"?`${n} è disperso, e lui lo cerca`:a.bis.k==="debito"?`deve soldi a ${n}`:t;}return t;};

/* memoria del personaggio e passaparola tra amici */
function anRicorda(pid,txt,v,noGossip){const a=anOf(pid);if(!a)return;a.mem.unshift({t:S.clock.data,txt,v});a.mem=a.mem.slice(0,8);
  if(!noGossip&&v){for(const q of anVivi()){if(q.id===pid)continue;const b=anOf(q.id);const o=b&&b.op[pid];if(o==null||Math.abs(o)<1)continue;const dv=Math.sign(o)*Math.sign(v)*(Math.abs(v)>=2?1:Math.random()<.5?1:0);if(!dv)continue;
    const f=Math.max(-2,Math.min(2,(+q.fiducia||0)+dv));if(f!==(+q.fiducia||0)){upd("png",q.id,{fiducia:f});q.fiducia=f;}b.mem.unshift({t:S.clock.data,txt:`ha sentito da ${anSh(L.png.find(x=>x.id===pid))} che ${txt}`,v:dv,s:1});b.mem=b.mem.slice(0,8);}}}
/* le storie che cambiano la fiducia diventano ricordi */
(function hookFid(){if(typeof evApply!=="function"||!evApply._al){setTimeout(hookFid,300);return;}if(evApply._an)return;const _ap=evApply;
  evApply=function(o,log){_ap(o,log);try{if(o&&o.fid)for(const n in o.fid){const p=pngBy(n);if(p&&o.fid[n])anRicorda(p.id,o.fid[n]>0?"l'hai aiutato quando contava":"lo hai deluso",o.fid[n]);}}catch(e){console.error(e);}};evApply._al=1;evApply._an=1;})();
/* i contratti contro una fazione si ricordano */
(function hookCt(){if(typeof ctEnd!=="function"){setTimeout(hookCt,300);return;}if(ctEnd._an)return;const _e=ctEnd;ctEnd=function(c,ok,auto){_e(c,ok,auto);try{if(ok&&c.vec){const fz=c.vec.toLowerCase();anVivi().filter(p=>(p.fazione||"").toLowerCase().startsWith(fz.slice(0,5))).forEach(p=>{const f=Math.max(-2,(+p.fiducia||0)-1);upd("png",p.id,{fiducia:f});p.fiducia=f;const a=anOf(p.id);if(a){a.mem.unshift({t:S.clock.data,txt:`hai cacciato i suoi da ${AL_BY[c.poi].n}`,v:-1});a.mem=a.mem.slice(0,8);}});}
    if(ok){anVivi().filter(p=>(p.fazione||"").toLowerCase().startsWith(c.f.toLowerCase().slice(0,5))).slice(0,6).forEach(p=>{const a=anOf(p.id);if(a){a.mem.unshift({t:S.clock.data,txt:`hai lavorato per i suoi a ${AL_BY[c.poi].n}`,v:1});a.mem=a.mem.slice(0,8);}});}}catch(_){}};ctEnd._an=1;})();

/* un fatto del mondo: lo sanno in giro, la rete ne parla */
function anFatto(o){const A=anS();o.t=S.clock.data;o.id=A.n++;A.fatti.unshift(o);A.fatti=A.fatti.slice(0,40);try{if(typeof rtFatto==="function")rtFatto(o);}catch(e){console.error(e);}}
function anMuore(p,come,chi){if(!p||p.stato==="morto")return;upd("png",p.id,{stato:"morto",con:false});p.stato="morto";p.con=false;
  anFatto({k:"morte",pid:p.id,chi:chi||null,txt:`${p.nome} è morto ${come}.`,dove:p.luogo});
  for(const q of anVivi()){const b=anOf(q.id);if(!b||b.op[p.id]==null)continue;if(b.op[p.id]>=2){b.um=Math.max(-2,b.um-1);if(chi&&!["vendetta"].includes(b.bis.k)&&Math.random()<.6){b.bis={k:"vendetta",x:chi,t:S.clock.data};b.op[chi]=-3;}}}}

/* ---- la vita, un giorno alla volta ---- */
function anDay(){anCast();const A=anS();const V=anVivi().filter(p=>!p.con&&(p.cast||p.vaga||!(typeof tramaOn==="function"&&tramaOn())));
  V.forEach(p=>{const a=anOf(p.id);if(!a)return;a.um=Math.max(-2,Math.min(2,a.um+(Math.random()<.5?0:Math.random()<.5?1:-1)));
    // un bisogno nuovo, ogni tanto
    if(a.bis.k==="nessuno"&&Math.random()<.06){a.bis={k:alRand(["soldi","medicine","fame","munizioni","bere","uscire"]),x:null,t:S.clock.data};}
    const here=V.filter(q=>q.id!==p.id&&q.luogo===p.luogo);
    // l'odio, quando si incontra, finisce male
    const nem=here.find(q=>(a.op[q.id]||0)<=-2);
    if(nem&&Math.random()<(anHas(a,"collerico")||anHas(a,"vendicativo")?.06:.02)){const forte=Math.random()<.5?p:nem,debole=forte===p?nem:p;
      if(Math.random()<.3){anMuore(debole,`a ${AL_BY[debole.poi]?AL_BY[debole.poi].n:debole.luogo}, in una lite con ${forte.nome}`,forte.id);const fa=anOf(forte.id);if(fa&&Math.random()<.5){fa.seg={k:"ucciso",x:debole.nome,sv:0};}}
      else anFatto({k:"rissa",pid:forte.id,chi:debole.id,txt:`${forte.nome} e ${debole.nome} sono venuti alle mani a ${p.luogo}. Nessun morto, per stavolta.`,dove:p.luogo});return;}
    // l'amicizia si coltiva
    const am=here.find(q=>(a.op[q.id]||0)>=1);if(am&&Math.random()<.08){a.op[am.id]=Math.min(3,(a.op[am.id]||0)+1);}
    // la Zona uccide
    const per=(typeof perOf==="function"?(+perOf(p.luogo)||2):2);if(Math.random()<.0012*per*(anHas(a,"codardo")?.5:1)){anMuore(p,`a ${p.luogo}, ${alRand(["in un campo di anomalie","sbranato dai cani","per un colpo arrivato da lontano","durante un'Emissione, fuori dal rifugio","senza che nessuno sappia come"])}`);return;}
    // un artefatto cambia la vita
    if(Math.random()<.012){a.ric=Math.min(5,a.ric+2);anFatto({k:"artefatto",pid:p.id,txt:`${p.nome} ha trovato un artefatto ${anHas(a,"mitomane")?"«grosso come un melone», dice lui":"che vale parecchio"}.`,dove:p.luogo});if(a.bis.k==="soldi"||a.bis.k==="debito")a.bis={k:"nessuno",x:null,t:S.clock.data};}
    // chi può, se ne va
    if(a.bis.k==="uscire"&&a.ric>=4&&Math.random()<.15){upd("png",p.id,{stato:"uscito dalla Zona"});p.stato="uscito dalla Zona";anFatto({k:"uscito",pid:p.id,txt:`${p.nome} è uscito dalla Zona. Ha detto che non torna. Lo dicono tutti.`,dove:p.luogo});return;}
    // sparire
    if(Math.random()<.002*per){const fr=V.filter(q=>(anOf(q.id)||{op:{}}).op[p.id]>=2);upd("png",p.id,{stato:"disperso"});p.stato="disperso";p.vaga=false;a.disp={dal:S.clock.data,poi:alRand(AL_P.filter(x=>x.z===p.luogo||alZoneH(p.luogo,x.z)<=3)).id};
      anFatto({k:"disperso",pid:p.id,txt:`${p.nome} non risponde da due giorni. Era a ${p.luogo}.`,dove:p.luogo});fr.forEach(q=>{const b=anOf(q.id);if(b&&b.bis.k==="nessuno")b.bis={k:"disperso",x:p.id,t:S.clock.data};});return;}
    // cambiar bandiera
    if((anHas(a,"cinico")||anHas(a,"avido"))&&Math.random()<.006){const nf=alRand(["stalker libero","bandito","mercenario","Libertà","Dovere"].filter(f=>f!==p.fazione));anFatto({k:"bandiera",pid:p.id,txt:`${p.nome} ha lasciato ${p.fazione} per ${nf}. Dice che è una questione di principio. Il principio è la paga.`,dove:p.luogo});upd("png",p.id,{fazione:nf});p.fazione=nf;}
    // i debiti si pagano, o no
    if(a.prestito){const gg=Math.round((Date.parse(S.clock.data)-Date.parse(a.prestito.t))/864e5);if(gg>=a.prestito.g){const paga=anHas(a,"leale")||anHas(a,"orgoglioso")||(!anHas(a,"avido")&&!anHas(a,"cinico")&&Math.random()<.6);
        if(paga){S.rubli=(+S.rubli||0)+Math.round(a.prestito.q*1.1);try{add("pda",{tipo:"msg",da:p.nome,fazione:p.fazione,testo:alRand([`Ti ho rimandato i soldi, più qualcosa. Non dire che ${anSh(p)} non paga i debiti.`,"Eccoti i tuoi soldi. Contali, se vuoi. Io non mi offendo.","Pagato. Siamo pari. Anzi no: ti devo un favore."]),data:S.clock.data,ora:S.clock.ora});}catch(_){}anRicorda(p.id,"ti ha prestato soldi quando nessuno l'avrebbe fatto",1,1);}
        else{try{add("pda",{tipo:"msg",da:p.nome,fazione:p.fazione,testo:alRand(["Quei soldi... senti, è stato un mese difficile. Il prossimo, giuro.","Quali soldi? Ah, quelli. Ne parliamo di persona, eh.","Non ce li ho. E se li avessi, avrei altre priorità. Non prenderla male."]),data:S.clock.data,ora:S.clock.ora});}catch(_){}a.prestito.g+=7;a.prestito.mancati=(a.prestito.mancati||0)+1;if(a.prestito.mancati>=2)delete a.prestito;}
        if(paga)delete a.prestito;}}});
  // arrivano novellini: la Zona si riempie sempre
  if(!(typeof tramaOn==="function"&&tramaOn())&&L.png.filter(p=>p.cast&&p.stato!=="morto"&&!/uscit/.test(p.stato||"")).length<36&&Math.random()<.35){const nm=`${pk(NOMI)} «${alRand(AN_SOPR)}»`;if(!L.png.some(p=>p.nome===nm)){const fz=alRand(["stalker libero","stalker libero","stalker libero","bandito","Dovere","Libertà"]);add("png",{nome:nm,fazione:fz,fiducia:0,stato:"vivo",luogo:"Cordone",cast:1,vaga:true,nota:""});setTimeout(()=>{const p=L.png.find(x=>x.nome===nm);if(!p)return;const a=anOf(p.id);const vec=alRand(anVivi().filter(q=>q.cast&&q.id!==p.id));if(vec&&a){a.op[vec.id]=1;}try{if(typeof rtPost==="function"){const th=rtPost(p,"Nuovo",alRand(["Salve a tutti. Sono arrivato ieri. Qualcuno mi spiega come funziona qui?","Primo giorno nella Zona. Ho già perso un guanto e la dignità.","Mi hanno detto di presentarmi sulla rete. Eccomi. Non sparatemi."]),"vita",{kind:"nuovo",pid:p.id});const v=alRand(rtUsers().filter(q=>q.id!==p.id));if(v)rtLater(th.id,v.id,alRand(["Benvenuto. Ascolta tutti, non fidarti di nessuno.","Un altro. Vediamo quanto dura.","Comprati dei bulloni. Tanti."]),2);}}catch(_){}},200);}}
  // i dispersi muoiono, se nessuno li cerca
  anVivi().filter(p=>p.stato==="disperso").forEach(p=>{const a=anOf(p.id);if(a&&a.disp){const gg=Math.round((Date.parse(S.clock.data)-Date.parse(a.disp.dal))/864e5);if(gg>=8&&Math.random()<.2)anMuore(p,`a ${AL_BY[a.disp.poi]?AL_BY[a.disp.poi].n:"chissà dove"}: lo cercavano, non l'hanno trovato in tempo`);}});
  save();}
(function hookDayAn(){if(typeof adv!=="function"||!adv._vv){setTimeout(hookDayAn,300);return;}if(adv._an)return;const _a=adv;
  adv=function(min){const d0=S.clock.data;const r=_a(min);try{const n=Math.round((Date.parse(S.clock.data)-Date.parse(d0))/864e5);for(let i=0;i<Math.min(n,5);i++)anDay();}catch(e){console.error(e);}return r;};for(const k in _a)try{adv[k]=_a[k];}catch(_){}adv._an=1;})();
/* i dispersi si trovano: se arrivi nel punto dove sono, c'è una storia */
(function hookGoAn(){if(typeof alGo!=="function"||!alGo._ct){setTimeout(hookGoAn,300);return;}if(alGo._an)return;const _g=alGo;alGo=function(id){_g(id);try{const p=L.png.find(q=>q.stato==="disperso"&&(anOf(q.id)||{}).disp&&anOf(q.id).disp.poi===id);if(p)setTimeout(()=>anTrovato(p),120);}catch(e){console.error(e);}};alGo._ct=1;alGo._an=1;})();
function anTrovato(p){const a=anOf(p.id);const e={id:"an-trov-"+p.id,titolo:`${p.nome}`,tono:"guaio",peso:1,ripeti:"mai",testo:[alRand([`Tra le macerie, una mano che si muove. È ${p.nome}: la gamba presa in una trappola, le labbra spaccate dalla sete, gli occhi che non credono a quello che vedono. «Pensavo che nessuno...» Non finisce la frase.`,`Lo trovi seduto contro un muro, il fucile scarico sulle ginocchia. ${p.nome}. Sei giorni da solo, dice, a contare i colpi e a sentire i cani girare intorno. Ride quando ti vede, una risata rotta, e poi smette di colpo.`])],
   scelte:[{t:"Portarlo via",tiro:"forza+resistenza",ok:{testo:`Lo carichi sulle spalle. Pesa meno di quanto dovrebbe. Per tutta la strada non dice niente; poi, al primo rifugio, ti stringe il braccio. «Questo non lo dimentico.» E i suoi amici neanche.`,tr:{fatica:2},nome:1,pe:1},ko:{testo:`Ce la fate, a fatica, con lui che si trascina appoggiato a te. Arrivate stremati. Ma vivi.`,tr:{fatica:3},pe:1}},
    {t:"Dargli da mangiare e bere, e lasciarlo riposare qui",se:{oggetto:"Cibo"},esito:{testo:`Mangia piano, come ti insegnano a fare dopo la fame. Quando si alza, ti guarda con una gratitudine che mette quasi a disagio. «Il resto della strada la faccio da solo. Tu hai già fatto abbastanza.»`,scorte:{cibo:-1},pe:1}}]};
  e.scelte.forEach(s=>["ok","ko","esito"].forEach(k=>{if(s[k])s[k].anTrov=p.id;}));EVD.byId[e.id]=e;evShow(e);render();}
(function hookApTrov(){if(typeof evApply!=="function"||!evApply._an){setTimeout(hookApTrov,300);return;}if(evApply._an2)return;const _ap=evApply;evApply=function(o,log){_ap(o,log);try{if(o&&o.anTrov){const p=L.png.find(x=>x.id===o.anTrov);if(p){const f=2;upd("png",p.id,{stato:"vivo",vaga:true,fiducia:f,luogo:S.clock.luogo,poi:S.clock.poi});Object.assign(p,{stato:"vivo",vaga:true,fiducia:f});const a=anOf(p.id);if(a)delete a.disp;anRicorda(p.id,"gli hai salvato la vita quando era disperso",3);anFatto({k:"salvato",pid:p.id,txt:`${p.nome} è vivo: l'ha trovato ${S.pg.sopr||"uno stalker"}.`,dove:S.clock.luogo});}}}catch(e){console.error(e);}};evApply._al=1;evApply._an=1;evApply._an2=1;})();
setTimeout(function anBoot(){if(typeof L!=="object"||!L.png||typeof alS!=="function"){setTimeout(anBoot,500);return;}try{anCast();anRel();}catch(e){console.error(e);}},2500);
