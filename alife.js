/* ===== A-Life: punti d'interesse, fazioni che si muovono, controllo dei luoghi ===== */
const AL_F={s:"Stalker liberi",d:"Dovere",l:"Libertà",b:"Banditi",m:"Mercenari",e:"Esercito",c:"Scienziati",o:"Monolite",x:"Mutanti"};
const AL_COL={"Stalker liberi":"#d9c27a","Dovere":"#d0493b","Libertà":"#5fbf5a","Banditi":"#9a7b5a","Mercenari":"#5f87c9","Esercito":"#8a9a6a","Scienziati":"#e8e8e8","Monolite":"#b06ad8","Mutanti":"#e07b2a"};
const AL_SIG={"Stalker liberi":"Stalker","Dovere":"Dovere","Libertà":"Libertà","Banditi":"Banditi","Mercenari":"Merc.","Esercito":"Esercito","Scienziati":"Scienz.","Monolite":"Monolite","Mutanti":"Mutanti"};
const AL_T={B:"base",M:"mercante",R:"rifugio",A:"campo di anomalie",T:"tana",V:"rovine",P:"posto di blocco",L:"laboratorio",D:"deposito",S:"ferrovia",F:"fattoria",K:"bunker",C:"accampamento",Q:"luogo selvaggio"};
/* nome~tipo~fazione iniziale (- vuoto), * = punto principale (visibile da lontano) */
const AL_RAW={
"Cordone":"*Villaggio dei novellini~B~s|*Posto di blocco sul ponte~P~e|*Bunker del Mercante~M~s|Ponte ferroviario crollato~S~-|Tunnel sotto il terrapieno~A~-|Fattoria dei Petrenko~F~b|Deposito ATP~D~b|Mulino ad acqua~V~-|Collina dei pali elettrici~Q~-|Cimitero di Dytjatky~V~-|Torre dell'acqua~V~s|Stazione di servizio abbandonata~V~-|Tana dei cani ciechi~T~x|Campo dei Trampolini~A~-|Galleria elettrica~A~-|Capanno della guardia~R~-|Chiesa senza tetto~V~s|Fosso dei carri armati~Q~-|Cantina del pescatore~R~-|Recinto delle mucche morte~T~x",
"Discarica":"*Cimitero dei veicoli~V~s|*Deposito della ferrovia~D~b|*Hangar degli scavatori~B~b|Collina delle carcasse~Q~-|Ponte della strada per il Bar~P~-|Fossa dei rottami~A~-|Campo del Bruciatore~A~-|Garage dei liquidatori~R~s|Caserma dei pompieri~V~-|Gru caduta~V~-|Tunnel del canale~T~x|Rifugio dei saccheggiatori~R~b|Cisterna del gasolio~D~-|Officina di Zhorik~M~s|Pozzo di raccolta~A~-|Baracche degli autisti~V~-|Bosco dei pseudocani~T~x|Tralicci spezzati~Q~-|Autobus giallo~R~-|Cava di sabbia~Q~-",
"Agroprom":"*Istituto Agroprom~L~e|*Sotterranei dell'Agroprom~T~x|*Accampamento degli stalker~C~s|Arnie dell'istituto~A~-|Silos del grano~V~-|Palude delle canne~A~-|Torre di guardia nord~P~e|Serre crollate~V~-|Laghetto dei pesci ciechi~Q~-|Capannone dei trattori~D~-|Casa del direttore~R~-|Stalla delle sanguisughe~T~x|Pozzo di aerazione~K~x|Frutteto morto~Q~-|Strada dei pali~Q~-|Posto di ristoro~R~s|Officina del kolchoz~D~b|Recinto dei campioni~L~-|Mulino rosso~V~-|Fosso degli Elettro~A~-",
"Valle Oscura":"*Fabbrica di trattori~B~b|*Fattoria di Borov~D~b|*Ingresso del laboratorio X-18~L~x|Villaggio di Gorodišče~V~-|Stazione di pompaggio~V~-|Ponte di ferro~P~b|Campo dei Vortici~A~-|Bosco dei succhiasangue~T~x|Silos della fabbrica~V~-|Cava di argilla~Q~-|Rifugio del cacciatore~R~s|Cimitero dei trattori~V~-|Pozzo nero~A~-|Depuratore~V~x|Collina della croce~Q~-|Stalla bruciata~T~x|Mercato nero di Borov~M~b|Torre dell'antenna~V~-|Fossa delle carcasse~T~x|Casello ferroviario~R~-",
"Bar e Rostok":"*Bar «Cento Raggi»~M~d|*Arena~B~d|*Posto di blocco del Dovere~P~d|Fabbrica Rostok~V~d|Hangar del Barman~D~d|Deposito delle lamiere~V~-|Fossato dei cani~T~x|Strada per i Magazzini~Q~-|Garage del meccanico~M~s|Ponte sull'Uzh~P~-|Cimitero dietro il Bar~V~-|Capannone dei Gravi~A~-|Ferrovia della Rostok~S~-|Bunker sotto la fabbrica~K~x|Cantina di Petrukha~R~s|Torre delle sirene~V~d|Casermette del Dovere~B~d|Campo delle scintille~A~-|Mensa della fabbrica~R~-|Vecchia pesa~V~-",
"Yantar":"*Bunker degli scienziati~L~c|*Lago Yantar~A~-|*Fabbrica sulle rive~V~x|Tunnel del laboratorio X-16~L~x|Molo dei pescatori~R~-|Palude degli zombie~T~x|Torre di rilevamento~L~c|Capannone delle pompe~V~-|Sentiero dei pali~Q~-|Cisterne arrugginite~D~-|Isola delle canne~Q~-|Rifugio di Prokhor~R~s|Campo delle bolle~A~-|Ponte di cemento di Yantar~P~-|Recinto delle sonde~L~c|Stazione meteo~V~-|Tana dei pseudogiganti~T~x|Barca rovesciata~R~-|Canale dei rifiuti~A~-|Collina degli occhi~Q~-",
"Magazzini dell'esercito":"*Base della Libertà~B~l|*Magazzini militari~D~l|*Villaggio dei succhiasangue~T~x|Fattoria del pino storto~R~l|Posto di guardia della Libertà~P~l|Cava dei mercenari~C~m|Torre di avvistamento~V~-|Hangar dei blindati~D~-|Campo del vento~A~-|Ponte rotto sull'Uzh~Q~-|Bosco delle chimere~T~x|Pista d'atterraggio~V~-|Depositi di carburante~D~-|Caserma vuota~V~-|Radar di quota~V~-|Mercante della Libertà~M~l|Strada per il Radar~P~-|Silos dei missili~K~-|Fiume avvelenato~A~-|Cascina dei fratelli~R~s",
"Radar":"*Antenna Duga~V~o|*Bruciacervelli~L~o|*Cancello del Radar~P~o|Bunker di comando~K~o|Caserma dei tecnici~V~-|Cimitero delle antenne~V~-|Bosco degli sbalzi psi~A~-|Strada delle betulle~Q~-|Garage dei generatori~D~-|Torre dell'acqua del Radar~V~-|Mensa ufficiali~V~-|Recinto dei cani del Radar~T~x|Ripetitore secondario~V~-|Tunnel dei cavi~K~x|Laghetto di raffreddamento~A~-|Villaggio di Lubjanka~V~-|Casa dei fucilieri~R~m|Sbarramento anticarro~P~-|Fossa comune~V~-|Rifugio dei pellegrini~R~s",
"Foresta Rossa":"*Ponte della Foresta Rossa~P~m|*Miniera abbandonata~K~x|*Forestale~R~s|Radura rossa~A~-|Carro armato nel bosco~V~-|Villaggio sepolto~V~-|Tana del Controllore~T~x|Pini caduti~Q~-|Torre del fuoco~V~-|Campo degli Elettro~A~-|Stalla nel bosco~R~-|Strada di Janiv~Q~-|Bunker dei mercenari~B~m|Fosso delle ossa~T~x|Cerchio dei pini bianchi~A~-|Capanna del cacciatore~R~-|Cimitero dei liquidatori~V~-|Torbiera~Q~-|Recinto del rimboschimento~Q~-|Altare del Monolite~V~o",
"Janiv e Jupiter":"*Stazione di Janiv~B~s|*Fabbrica Jupiter~V~-|*Bunker scientifico del Jupiter~L~c|Deposito delle locomotive~D~-|Tunnel di Kopači~K~x|Villaggio di Kopači~V~-|Galleria per Pripjat'~S~-|Silos di cemento~V~-|Campo del Trampolino rosso~A~-|Piazzale dei vagoni~V~-|Asilo di Kopači~V~x|Stazione di trasformazione~A~-|Torre dell'acqua di Janiv~V~-|Ufficio della stazione~M~s|Cava di ghiaia~Q~-|Casello sud~R~-|Bosco dei burer~T~x|Ponte ferroviario di Janiv~P~d|Recinto delle cisterne~D~-|Caserma del Jupiter~R~l",
"Pripjat'":"*Piazza Lenin~V~o|*Ospedale n. 126~V~x|*Hotel Polissja~K~o|Ruota panoramica~A~-|Palazzo della Cultura «Energetik»~V~o|Stadio Avangard~A~-|Supermercato~V~-|Lavanderia~V~x|Scuola n. 3~V~-|Piscina Azzurro~V~-|Porto fluviale~V~-|Palazzone di via Kurčatov~R~-|Centrale telefonica~V~-|Asilo «Pesciolino d'oro»~V~-|Caserma dei pompieri di Pripjat'~V~-|Ristorante sul fiume~V~-|Cimitero di Pripjat'~V~x|Parco dei divertimenti~V~-|Covo dei cecchini~B~e|Garage dei filobus~D~-",
"La centrale":"*Sarcofago~A~o|*Quarto blocco~V~o|*Sala controllo~L~o|Torri di raffreddamento~V~-|Canale di raffreddamento~A~-|Deposito delle scorie~A~-|Quinto blocco incompiuto~V~o|Gru del quinto blocco~V~-|Mensa della centrale~V~-|Sottostazione elettrica~A~-|Posto di guardia est~P~o|Tunnel di servizio~K~x|Parcheggio dei bus~V~-|Ingresso amministrazione~V~o|Silos del carburante~D~-|Laboratorio di dosimetria~L~-|Cimitero dei robot~V~-|Ponte di cemento della centrale~P~o|Bacino dello stagno~A~-|Rifugio dei liquidatori~R~-",
"Zaton":"*Skadovsk~B~s|*Sultansk~B~b|*Stazione meteo di Zaton~L~c|Chiatta «Kirov»~V~-|Fabbrica di cemento~V~-|Gru del porto~V~-|Palude di sinistra~A~-|Torre della centrale idrica~V~-|Banco di sabbia~Q~-|Cantiere dei mercenari~C~m|Villaggio di Zaton~V~-|Tana delle chimere~T~x|Rimorchiatore affondato~R~-|Pontile dei pescatori~R~s|Ferrovia sul fiume~S~-|Campo degli Elettro della palude~A~-|Silos di Zaton~V~-|Barcone dei mercanti~M~s|Albero del corvo~Q~-|Draga di Shevchenko~D~b"};
/* zone preferite: dove ogni fazione manda le sue squadre */
const AL_PREF={"Stalker liberi":["Cordone","Discarica","Agroprom","Bar e Rostok","Yantar","Janiv e Jupiter","Zaton"],"Dovere":["Bar e Rostok","Discarica","Agroprom","Janiv e Jupiter","Magazzini dell'esercito"],"Libertà":["Magazzini dell'esercito","Radar","Janiv e Jupiter","Bar e Rostok"],"Banditi":["Discarica","Valle Oscura","Cordone","Agroprom","Zaton"],"Mercenari":["Foresta Rossa","Magazzini dell'esercito","Zaton","Radar","Valle Oscura"],"Esercito":["Cordone","Agroprom","Pripjat'"],"Monolite":["Radar","Pripjat'","La centrale","Foresta Rossa","Janiv e Jupiter"],"Mutanti":[]};
const AL_STR={"Stalker liberi":1,"Dovere":1.25,"Libertà":1.15,"Banditi":.85,"Mercenari":1.3,"Esercito":1.3,"Scienziati":.4,"Monolite":1.45,"Mutanti":.8};
const AL_CAP={"Stalker liberi":5,"Dovere":4,"Libertà":4,"Banditi":4,"Mercenari":3,"Esercito":2,"Scienziati":0,"Monolite":3,"Mutanti":4};
const AL_ENE={"Stalker liberi":"Banditi|Esercito|Monolite|Mutanti","Dovere":"Libertà|Banditi|Mercenari|Monolite|Mutanti","Libertà":"Dovere|Banditi|Mercenari|Esercito|Monolite|Mutanti","Banditi":"Stalker liberi|Dovere|Libertà|Esercito|Scienziati|Monolite|Mutanti","Mercenari":"Dovere|Libertà|Esercito|Monolite|Mutanti","Esercito":"Stalker liberi|Libertà|Banditi|Mercenari|Monolite|Mutanti","Scienziati":"Banditi|Monolite|Mutanti","Monolite":"Stalker liberi|Dovere|Libertà|Banditi|Mercenari|Esercito|Scienziati|Mutanti","Mutanti":"Stalker liberi|Dovere|Libertà|Banditi|Mercenari|Esercito|Scienziati|Monolite"};
const alEne=(a,b)=>!!a&&!!b&&a!==b&&(AL_ENE[a]||"").split("|").includes(b);
const AL_MUT=["cani ciechi","pseudocani","cinghiali","carne","succhiasangue","snork","zombie","burer","chimera","Controllore"];

/* ---- punti: posizione dentro il confine della zona (seme fisso) ---- */
const AL_P=[],AL_BY={};
(function(){const ZB0={"Cordone":[[51.205,30.03],[51.20,30.12],[51.185,30.20],[51.15,30.245],[51.10,30.235],[51.085,30.17],[51.10,30.07],[51.14,30.02],[51.18,30.015]],"Discarica":[[51.262,29.985],[51.265,30.06],[51.255,30.105],[51.225,30.115],[51.205,30.095],[51.203,30.02],[51.225,29.98]],"Agroprom":[[51.285,29.87],[51.285,29.95],[51.27,29.985],[51.235,29.985],[51.21,29.96],[51.215,29.885],[51.245,29.86]],"Valle Oscura":[[51.245,30.235],[51.24,30.33],[51.215,30.365],[51.17,30.36],[51.155,30.30],[51.17,30.24],[51.21,30.215]],"Bar e Rostok":[[51.312,30.08],[51.31,30.165],[51.295,30.19],[51.265,30.18],[51.26,30.11],[51.27,30.075]],"Yantar":[[51.365,29.87],[51.36,29.96],[51.345,29.99],[51.31,29.985],[51.295,29.94],[51.305,29.875],[51.335,29.855]],"Magazzini dell'esercito":[[51.385,30.16],[51.38,30.245],[51.36,30.27],[51.325,30.26],[51.318,30.18],[51.335,30.145],[51.365,30.14]],"Radar":[[51.345,30.005],[51.34,30.075],[51.32,30.095],[51.29,30.085],[51.285,30.03],[51.30,29.995],[51.325,29.99]],"Foresta Rossa":[[51.392,29.975],[51.39,30.02],[51.383,30.045],[51.365,30.05],[51.35,30.02],[51.352,29.98],[51.37,29.965]],"Janiv e Jupiter":[[51.405,30.018],[51.404,30.045],[51.397,30.075],[51.388,30.078],[51.386,30.05],[51.392,30.022]],"Pripjat'":[[51.42,30.03],[51.42,30.075],[51.41,30.085],[51.398,30.078],[51.403,30.045],[51.405,30.025]],"La centrale":[[51.398,30.085],[51.396,30.12],[51.385,30.13],[51.372,30.12],[51.372,30.09],[51.385,30.08]],"Zaton":[[51.48,30.09],[51.48,30.18],[51.465,30.215],[51.435,30.21],[51.425,30.15],[51.435,30.095],[51.46,30.08]]};
  let seed=1987;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const inP=(la,lo,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [a1,b1]=P[i],[a2,b2]=P[j];if((b1>lo)!==(b2>lo)&&la<(a2-a1)*(lo-b1)/(b2-b1)+a1)c=!c;}return c;};
  Object.entries(AL_RAW).forEach(([z,raw],zi)=>{const P=ZB0[z];const las=P.map(p=>p[0]),los=P.map(p=>p[1]);const la0=Math.min(...las),la1=Math.max(...las),lo0=Math.min(...los),lo1=Math.max(...los);const cla=(la0+la1)/2,clo=(lo0+lo1)/2;
    raw.split("|").forEach((s,i)=>{const main=s[0]==="*";const [n,t,f]=(main?s.slice(1):s).split("~");let la,lo,best=null;
      for(let k=0;k<60;k++){la=la0+(la1-la0)*(.08+.84*rnd());lo=lo0+(lo1-lo0)*(.08+.84*rnd());if(main){la=cla+(la-cla)*.45;lo=clo+(lo-clo)*.45;}if(!inP(la,lo,P))continue;
        const dmin=Math.min(1,...AL_P.filter(q=>q.z===z).map(q=>Math.hypot(q.la-la,(q.lo-lo)*.62)));if(!best||dmin>best[2])best=[la,lo,dmin];if(dmin>.0045)break;}
      if(!best)best=[cla,clo,0];const id=`${zi.toString(36)}${i.toString(36)}`;const p={id,n,t,f0:f==="-"?"":AL_F[f],z,main,la:best[0],lo:best[1]};AL_P.push(p);AL_BY[id]=p;});});})();
const alZ=z=>AL_P.filter(p=>p.z===z);
const alMain=z=>alZ(z).find(p=>p.main)||alZ(z)[0];
const alFind=n=>{if(!n)return null;if(AL_BY[n])return AL_BY[n];const q=String(n).toLowerCase();return AL_P.find(p=>p.n.toLowerCase()===q)||AL_P.find(p=>p.n.toLowerCase().includes(q));};

/* ---- stato ---- */
function alS(){if(!S.al||!S.al.c){S.al={c:{},q:[],n:1,log:[],t:(S.clock.data||"2012-10-15")+" "+(S.clock.ora||"07:30"),news:""};
    AL_P.forEach(p=>{const f=p.f0;S.al.c[p.id]=[f,!f?0:p.t==="B"?8:p.t==="P"||p.t==="L"&&f!=="Scienziati"?6:p.t==="M"?5:f==="Mutanti"?3+Math.floor(Math.random()*3):3];});}
  return S.al;}
const alCtl=id=>(alS().c[id]||["",0]);
const alHere=()=>{const p=AL_BY[S.clock.poi];if(p&&p.z===S.clock.luogo)return p;const m=alMain(S.clock.luogo);if(m)S.clock.poi=m.id;return m||null;};
const alForza=n=>n<=0?"nessuno":n<=2?"pochi":n<=4?"un gruppo":n<=7?"molti":"una guarnigione";
const alClk=()=>(S.clock.data||"")+" "+(S.clock.ora||"");
function alLog(p,txt,imp){const A=alS();A.log.unshift({t:alClk(),z:p.z,p:p.id,txt});A.log=A.log.slice(0,60);
  if((p.z===S.clock.luogo||(imp&&p.main))&&Math.random()<.6){const last=A.news||"";if(!last||(typeof minTo==="function"?-minTo(last)>180:true)){A.news=alClk();try{add("pda",{tipo:"radio",canale:"stalker",da:typeof pk==="function"?pk(NOMI):"uno stalker",testo:txt,data:S.clock.data,ora:S.clock.ora});}catch(_){}}}}
const alRand=a=>a[Math.floor(Math.random()*a.length)];
function alZoneH(a,b){if(a===b)return 1;try{const p=path(a,b);if(p&&p.length>1)return p.slice(1).reduce((t,zz,i)=>t+edge(p[i],zz)[3],0);}catch(_){}return 99;}

/* ---- un'ora di vita ---- */
function alHour(){const A=alS();
  // squadre in marcia
  for(const s of A.q.slice()){s.eta--;if(s.eta>0)continue;const p=AL_BY[s.to];A.q.splice(A.q.indexOf(s),1);if(!p)continue;alArrive(s,p);}
  // nuove squadre
  for(const f of Object.keys(AL_CAP)){const cap=AL_CAP[f];if(!cap)continue;const mine=A.q.filter(s=>s.f===f).length;if(mine>=cap||Math.random()>(f==="Mutanti"?.1:.14))continue;
    const homes=AL_P.filter(p=>alCtl(p.id)[0]===f&&alCtl(p.id)[1]>=(f==="Mutanti"?2:4));if(!homes.length)continue;const h=alRand(homes);const c=A.c[h.id];
    const n=Math.max(1,Math.min(c[1]-1,2+Math.floor(Math.random()*4)));const to=alTarget(f,h);if(!to)continue;c[1]-=n;
    const eta=Math.max(1,alZoneH(h.z,to.z)+(h.z===to.z?Math.floor(Math.random()*2):0));A.q.push({id:A.n++,f,n,da:h.id,to:to.id,eta,cap:f==="Mutanti"?alRand(AL_MUT):(typeof pk==="function"?pk(NOMI):"")});}
  // tane nuove nei posti vuoti, più facili lontano dal Cordone
  if(Math.random()<.035){const vuoti=AL_P.filter(p=>!alCtl(p.id)[0]&&p.id!==S.clock.poi);if(vuoti.length){const p=alRand(vuoti);const per=typeof perOf==="function"?(+perOf(p.z)||2):2;if(Math.random()<.25+per*.1){A.c[p.id]=["Mutanti",2+Math.floor(Math.random()*3)];alLog(p,`Si dice che a ${p.n} (${p.z}) si siano fatti la tana dei mutanti.`);}}}
  // le basi richiamano gente
  if(Math.random()<.25){const bs=AL_P.filter(p=>(p.t==="B"||p.t==="P"||p.t==="M"||p.t==="T")&&alCtl(p.id)[0]);if(bs.length){const c=A.c[alRand(bs).id];if(c[1]<10)c[1]++;}}
  // presidi che si consumano
  if(Math.random()<.15){const occ=AL_P.filter(p=>alCtl(p.id)[1]>0&&p.t!=="B");if(occ.length){const p=alRand(occ);const c=A.c[p.id];c[1]--;if(c[1]<=0){const f=c[0];A.c[p.id]=["",0];alLog(p,`${p.n} (${p.z}) è rimasto vuoto: ${f==="Mutanti"?"i mutanti se ne sono andati":"quelli di "+f+" se ne sono andati"}.`);}}}}
function alTarget(f,h){const pref=AL_PREF[f]||[];const cand=[];for(const p of AL_P){if(p.id===h.id)continue;const hh=alZoneH(h.z,p.z);if(hh>(f==="Mutanti"?2:9))continue;const [g,n]=alCtl(p.id);let w=0;
    if(!g)w=3;else if(g===f)w=n<4?1.5:0;else if(alEne(f,g)){if(f==="Mutanti"&&n>3)continue;w=(g==="Mutanti"?1.6:1)*(n<=3?4:n<=6?1.5:.4);}else continue;
    if(f==="Scienziati")continue;if(f!=="Mutanti"&&pref.length)w*=pref.includes(p.z)?3:.25;if(p.main)w*=1.4;if(p.t==="A")w*=.4;w/=(1+hh/3);if(w>0)cand.push([p,w]);}
  if(!cand.length)return null;let t=cand.reduce((a,c)=>a+c[1],0)*Math.random();for(const [p,w] of cand){t-=w;if(t<=0)return p;}return cand[0][0];}
function alArrive(s,p){const A=alS();const c=A.c[p.id]||["",0];const [g,n]=c;const chi=s.f==="Mutanti"?`un branco di ${s.cap}`:`una squadra di ${s.f}${s.cap?" guidata da "+s.cap:""}`;
  if(p.id===S.clock.poi&&s.f!==g){try{toast(`Arriva ${chi} (${s.n}) a ${p.n}.`);}catch(_){}ui.alWarn={p:p.id,f:s.f,n:s.n};}
  if(!g){A.c[p.id]=[s.f,s.n];alLog(p,`${s.f==="Mutanti"?"I mutanti":"Quelli di "+s.f} hanno occupato ${p.n} (${p.z}).`,1);return;}
  if(g===s.f){c[1]=Math.min(12,n+s.n);return;}
  if(!alEne(s.f,g)){return;}
  const a=s.n*AL_STR[s.f]*(.6+Math.random()*.8),b=Math.max(.5,n)*AL_STR[g]*1.3*(.6+Math.random()*.8);
  if(p.id===S.clock.poi){ui.alWarn={p:p.id,f:s.f,n:s.n,lotta:g};}
  if(a>b){A.c[p.id]=[s.f,Math.max(1,Math.round(s.n*(1-b/a/1.5)))];alLog(p,`Sparatoria a ${p.n} (${p.z}): ${s.f} ${s.f==="Mutanti"?"hanno sbranato":"hanno cacciato"} ${g}. Ora il posto è loro.`,1);}
  else{c[1]=Math.max(1,Math.round(n*(1-a/b/1.5)));alLog(p,`A ${p.n} (${p.z}) ${g} hanno respinto ${s.f==="Mutanti"?"i mutanti":s.f}.`);}}
function alTick(){const A=alS();const now=alClk();let h=0;try{h=Math.floor(-minTo(A.t)/60);}catch(_){h=0;}if(h<=0)return;h=Math.min(h,96);
  for(let i=0;i<h;i++)alHour();A.t=now;alHere();}
function alEmission(){const A=alS();A.q.forEach(s=>{if(s.f!=="Mutanti"&&s.f!=="Monolite")s.n=Math.floor(s.n*.3);});A.q=A.q.filter(s=>s.n>0);
  AL_P.filter(p=>!alCtl(p.id)[0]&&Math.random()<.3).forEach(p=>A.c[p.id]=["Mutanti",2+Math.floor(Math.random()*3)]);alLog(alMain(S.clock.luogo),"Dopo l'Emissione i mutanti sono usciti dalle tane. Molti posti vuoti adesso hanno padroni con i denti.",1);}

/* ---- tempo: aggancio ad adv ---- */
(function hook(){if(typeof adv!=="function"){setTimeout(hook,300);return;}if(adv._al)return;const _a=adv;adv=function(min){const e0=+S.emiss||0;const r=_a(min);try{if((+S.emiss||0)>=6&&e0<6)alEmission();alTick();}catch(e){console.error(e);}return r;};adv._al=1;for(const k in _a)try{adv[k]=_a[k];}catch(_){}})();

/* ---- andare a un punto ---- */
function alGo(id){const p=AL_BY[id];if(!p)return;if(p.z!==S.clock.luogo){try{zoneDest(p.z);}catch(_){}return;}if(S.clock.poi===id)return;
  const min=15+Math.floor(Math.random()*36);S.clock.poi=id;ui.alWarn=null;adv(min);const [g,n]=alCtl(id);
  if(g&&n>0&&alEne(alSide(),g))ui.alWarn={p:id,f:g,n,qui:1};
  setTimeout(()=>{try{const E=evS();const cand=EVD.list.filter(e=>e.se&&e.se.poi&&!e.solo_seguito&&evOk(e,{luogo:S.clock.luogo})).sort((a,b)=>(a.ordine||0)-(b.ordine||0));
    if(cand.length&&!ui.ev){evShow(cand[0]);render();}else if(!ui.ev&&Math.random()<.35){const e=evPick({luogo:S.clock.luogo});if(e)evShow(e);render();}}catch(e){console.error(e);}},60);
  toast(`Sei a ${p.n} (${min}′).`);}
/* da che parte sta il personaggio: la fazione col Rapporto più alto (2+), altrimenti stalker libero */
function alSide(){const r=S.rap||{};let best="Stalker liberi",v=1;for(const f of ["Dovere","Libertà","Mercenari","Banditi","Esercito"])if((+r[f]||0)>=2&&(+r[f]||0)>v){best=f;v=+r[f];}return best;}

/* ---- motore delle storie: condizioni ed esiti nuovi ---- */
(function hookEv(){if(typeof evCond!=="function"||typeof evApply!=="function"){setTimeout(hookEv,300);return;}if(evCond._al)return;
  const _c=evCond;evCond=function(c,ctx){if(c){const h=alHere();
      if(c.poi&&!(h&&[].concat(c.poi).some(n=>h.n.toLowerCase().includes(String(n).toLowerCase()))))return false;
      if(c.tipo&&!(h&&[].concat(c.tipo).includes(AL_T[h.t])))return false;
      if(c.controllo){const g=h?alCtl(h.id)[0]||"vuoto":"vuoto";if(![].concat(c.controllo).includes(g))return false;}
      if(c.ctl){for(const n in c.ctl){const p=alFind(n);const g=p?alCtl(p.id)[0]||"vuoto":"vuoto";if(![].concat(c.ctl[n]).includes(g))return false;}}}
    return _c(c,ctx);};evCond._al=1;
  const _ap=evApply;evApply=function(o,log){_ap(o,log);if(!o)return;
    if(o.prendi){[].concat(o.prendi).forEach(x=>{const p=alFind(x.poi);if(!p)return;alS().c[p.id]=[x.f||"",x.f?(x.forza||4):0];alLog(p,x.f?`${p.n} (${p.z}) adesso è di ${x.f}.`:`${p.n} (${p.z}) è stato ripulito.`,1);log&&log.push(`${p.n}: ${x.f||"vuoto"}`);});}
    if(o.vai){const p=alFind(o.vai);if(p){S.clock.luogo=p.z;S.clock.poi=p.id;log&&log.push(`ora sei a ${p.n}`);}}};})();

/* ---- mappa: punti visibili zoomando ---- */
function alMapInstall(){const M=window.Map3D;if(!M||M._al)return;const inn=M.el.querySelector(".m2d-in"),box=M.el.querySelector(".m2d");if(!inn||!box)return;M._al=1;
  const st=document.createElement("style");st.textContent=`.m2d-in .al{position:absolute;inset:0;pointer-events:none}
.m2d-in .al i{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;border:2px solid #10140c;background:var(--c,#777);transform:scale(calc(1 / var(--k,1)));pointer-events:auto;cursor:pointer;box-shadow:0 0 0 1px #eef3df88}
.m2d-in .al i.mn{width:9px;height:9px;margin:-4.5px 0 0 -4.5px}.m2d-in .al i.vu{background:#10140c;border-color:#9fb07a}.m2d-in .al i.me{box-shadow:0 0 0 3px #ffb199}
.m2d-in .al b{position:absolute;transform:translate(9px,-50%) scale(calc(1 / var(--k,1)));transform-origin:0 50%;font:600 10px var(--f-h);color:#eef3df;background:#141a10cc;border-left:3px solid var(--c,#777);padding:0 4px;border-radius:2px;white-space:nowrap;pointer-events:none}
.m2d-in .al b.mn{display:none}.m2d-in .al i.mn{display:none}.m2d.zz .m2d-in .al i.mn,.m2d.zz2 .m2d-in .al b.mn{display:block}.m2d:not(.zz) .m2d-in .al b:not(.mn){display:none}.m2d.zz .m2d-in .al b:not(.mn){display:block}
.m2d-in .al b small{opacity:.75;font-weight:500}
.al-pop{position:absolute;left:8px;right:56px;bottom:8px;z-index:3;background:#141a10ee;border:1px solid #9fb07a;border-radius:6px;color:#eef3df;padding:8px 10px;font:500 13px var(--f-b)}
.al-pop b{font-family:var(--f-h)}.al-pop .r{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.al-pop button{border:1px solid #9fb07a;background:#2a3320;color:#eef3df;border-radius:5px;padding:4px 8px;font:600 12px var(--f-h);cursor:pointer}
.al-leg{display:flex;flex-wrap:wrap;gap:4px 10px;margin:6px 0 0;font-size:12px}.al-leg span{display:inline-flex;align-items:center;gap:4px}.al-leg span i{width:9px;height:9px;border-radius:50%;background:var(--c)}`;document.head.appendChild(st);
  const lay=document.createElement("div");lay.className="al";inn.appendChild(lay);M._alLay=lay;
  const pop=document.createElement("div");pop.className="al-pop";pop.hidden=true;box.appendChild(pop);M._alPop=pop;
  const merc=(lat,lon)=>{const Z0=12,X0=2384,Y0=1361,PW=3328,PH=2560,n=2**Z0*256,r=lat*Math.PI/180;return [((lon+180)/360*n-X0*256)/PW,((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n-Y0*256)/PH];};
  lay.innerHTML=AL_P.map(p=>{const [u,v]=merc(p.la,p.lo);const L=`left:${(u*100).toFixed(3)}%;top:${(v*100).toFixed(3)}%`;return `<i data-alp="${p.id}" class="${p.main?"":"mn"}" style="${L}" title="${esc(p.n)}"></i><b data-alb="${p.id}" class="${p.main?"":"mn"}" style="${L}"></b>`;}).join("");
  const W=1664,H=1280;new MutationObserver(()=>{const k=+inn.style.getPropertyValue("--k")||1;const base=Math.max(box.clientWidth/W,box.clientHeight/H)*1.6;box.classList.toggle("zz",k>base*1.9);box.classList.toggle("zz2",k>base*3.2);}).observe(inn,{attributes:true,attributeFilter:["style"]});
  let down=null;box.addEventListener("pointerdown",e=>{const t=e.target.closest("[data-alp]");down=t?{id:t.dataset.alp,x:e.clientX,y:e.clientY}:null;},true);
  box.addEventListener("pointerup",e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<8){ui.alSel=down.id;alPop();}down=null;});
  pop.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;e.stopPropagation();if(b.dataset.alx){ui.alSel=null;pop.hidden=true;return;}if(b.dataset.algo){alGo(b.dataset.algo);render();}});
  pop.addEventListener("pointerdown",e=>e.stopPropagation());}
function alPop(){const M=window.Map3D;if(!M||!M._alPop)return;const pop=M._alPop;const p=AL_BY[ui.alSel];if(!p){pop.hidden=true;return;}const [g,n]=alCtl(p.id);const A=alS();
  const arr=A.q.filter(s=>s.to===p.id);const nw=A.log.filter(l=>l.p===p.id).slice(0,2);const qui=S.clock.poi===p.id&&S.clock.luogo===p.z;
  pop.innerHTML=`<b>${esc(p.n)}</b> <span class="small">· ${AL_T[p.t]} · ${esc(p.z)}</span><br>${g?`<span style="color:${AL_COL[g]}">■</span> ${esc(g)}: ${alForza(n)}`:"Nessuno, per ora."}${arr.length?`<br><span class="small">In marcia verso qui: ${arr.map(s=>`${esc(s.f)} (${s.n}, ${s.eta} h)`).join(", ")}</span>`:""}${nw.length?`<br><span class="small">${nw.map(l=>esc(l.txt)).join(" · ")}</span>`:""}
  <div class="r">${qui?`<span class="small"><b>sei qui</b></span>`:p.z===S.clock.luogo?`<button data-algo="${p.id}">Vai qui</button>`:`<button data-algo="${p.id}">Meta: ${esc(p.z)}</button>`}<button data-alx="1">✕</button></div>`;pop.hidden=false;}
function alMapUpdate(){const M=window.Map3D;if(!M)return;alMapInstall();if(!M._alLay)return;const here=alHere();
  M._alLay.querySelectorAll("[data-alp]").forEach(i=>{const [g]=alCtl(i.dataset.alp);i.style.setProperty("--c",g?AL_COL[g]:"#10140c");i.classList.toggle("vu",!g);i.classList.toggle("me",!!here&&here.id===i.dataset.alp);});
  M._alLay.querySelectorAll("[data-alb]").forEach(b=>{const p=AL_BY[b.dataset.alb];const [g,n]=alCtl(p.id);b.style.setProperty("--c",g?AL_COL[g]:"#555");b.innerHTML=`${esc(p.n)} <small>${g?AL_SIG[g]+" · "+n:"vuoto"}</small>`;});
  if(ui.alSel)alPop();}

/* ---- linguetta Zona: punti della zona e notizie ---- */
function alPanel(){try{alTick();}catch(_){}const z=S.clock.luogo;const here=alHere();const A=alS();const W=ui.alWarn&&ui.alWarn.p===S.clock.poi?ui.alWarn:null;
  const pts=alZ(z).sort((a,b)=>(b.main-a.main)||a.n.localeCompare(b.n));
  const fz={};AL_P.forEach(p=>{const [g]=alCtl(p.id);if(g)fz[g]=(fz[g]||0)+1;});
  return `<section class="card"><h3>Punti d'interesse · ${esc(z||"")}</h3>
  ${here?`<p>Sei a <b>${esc(here.n)}</b> <span class="small muted">(${AL_T[here.t]}${alCtl(here.id)[0]?`, di ${esc(alCtl(here.id)[0])}`:""})</span>.</p>`:""}
  ${W?`<p class="small" style="border-left:3px solid #c44;padding-left:8px">${W.lotta?`Si spara: ${esc(W.f)} contro ${esc(W.lotta)}, proprio qui.`:`Qui ci sono ${esc(W.f)}: ${alForza(W.n)}.`} ${alEne(alSide(),W.f)?"Non sono amici. Puoi aprire lo Scontro dai Dadi, passare di nascosto o andartene.":""}
   <br><button class="btn g s" data-al="via">Me ne vado</button> <button class="btn g s" data-al="pulito">L'ho ripulito</button> <button class="btn g s" data-al="ok">Va bene</button></p>`:""}
  <div class="small" style="display:grid;gap:3px">${pts.map(p=>{const [g,n]=alCtl(p.id);const inc=A.q.filter(s=>s.to===p.id).length;return `<div class="row" style="justify-content:space-between;gap:6px;border-bottom:1px dashed var(--line);padding:2px 0"><span>${p.main?"<b>":""}${esc(p.n)}${p.main?"</b>":""} <span class="muted">${AL_T[p.t]}</span></span><span><span style="color:${g?AL_COL[g]:"inherit"}">${g?esc(g)+" · "+alForza(n):"vuoto"}</span>${inc?` <span class="muted">↣${inc}</span>`:""} ${here&&here.id===p.id?"<b>qui</b>":`<button class="btn g s" data-al="go" data-alid="${p.id}">Vai</button>`}</span></div>`;}).join("")}</div>
  <p class="small muted" style="margin:6px 0 0">Sulla mappa da lontano vedi solo i punti principali; avvicinandoti compaiono tutti, col colore di chi li tiene.</p>
  <div class="al-leg">${Object.keys(AL_COL).map(f=>`<span style="--c:${AL_COL[f]}"><i></i>${f} ${fz[f]||0}</span>`).join("")}<span style="--c:#10140c"><i style="border:1px solid #9fb07a"></i>vuoti ${AL_P.length-Object.values(fz).reduce((a,b)=>a+b,0)}</span></div>
  </section><section class="card"><h3>Voci dalla Zona</h3>${A.log.length?`<div class="small" style="display:grid;gap:4px">${A.log.slice(0,10).map(l=>`<div><span class="muted num">${esc(l.t.slice(5))}</span> ${esc(l.txt)}</div>`).join("")}</div>`:`<p class="small muted">Ancora niente. La Zona si muove quando passa il tempo.</p>`}</section>`;}
document.addEventListener("click",e=>{const b=e.target.closest("[data-al]");if(!b)return;const a=b.dataset.al;
  if(a==="go")alGo(b.dataset.alid);
  else if(a==="via"){ui.alWarn=null;const m=alMain(S.clock.luogo);if(m&&m.id!==S.clock.poi)alGo(m.id);}
  else if(a==="pulito"){const p=alHere();if(p){alS().c[p.id]=["",0];alLog(p,`${p.n} (${p.z}) è stato ripulito da ${S.pg.sopr||"uno stalker"}.`,1);S.nomeRep=(+S.nomeRep||0)+(p.main?1:0);}ui.alWarn=null;}
  else if(a==="ok")ui.alWarn=null;
  save();});

/* ---- aggancio alla vista Zona ---- */
(function hookV(){if(typeof V!=="object"||!V.mappa||typeof render!=="function"){setTimeout(hookV,300);return;}if(V.mappa._al)return;
  const _v=V.mappa;V.mappa=function(){return _v.apply(this,arguments)+alPanel();};V.mappa._al=1;
  const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(ui.tab==="mappa"){alMapUpdate();if(window.Map3D&&!window.Map3D._al)setTimeout(alMapUpdate,400);}}catch(e){console.error(e);}return r;};})();
