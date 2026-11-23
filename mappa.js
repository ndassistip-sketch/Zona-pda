{
/* Mappa satellitare della Zona, piatta: Sentinel-2 cloudless (EOX). Trascina, zoom con rotella, pizzico o tasti. */
const Z0=12,X0=2384,Y0=1361,PW=3328,PH=2560;
const POI=[
 ["Posto di blocco (Dytjatky)",51.118,30.153,"Cordone",1],["Villaggio dei novellini",51.16,30.10,"Cordone",0],
 ["Cimitero dei veicoli (Rassocha)",51.226,30.033,"Discarica",1],["Agroprom",51.24,29.93,"Agroprom",0],["Valle Oscura",51.19,30.29,"Valle Oscura",0],
 ["Bar e Rostok",51.285,30.12,"Bar e Rostok",0],["Yantar",51.33,29.92,"Yantar",0],["Magazzini dell'esercito",51.35,30.20,"Magazzini dell'esercito",0],
 ["Radar Duga (Černobyl'-2)",51.305,30.066,"Radar",1],["Foresta Rossa",51.383,30.025,"Foresta Rossa",1],["Pripjat'",51.405,30.057,"Pripjat'",1],
 ["Stazione di Janiv",51.396,30.033,"Janiv e Jupiter",1],["Zaton (Skadovsk)",51.45,30.14,"Zaton",0],["Centrale",51.389,30.099,"La centrale",1],["Černobyl' (città)",51.276,30.222,"",1],["Kopači",51.343,30.138,"",1]];
const merc=(lat,lon)=>{const n=2**Z0*256,r=lat*Math.PI/180;return [((lon+180)/360*n-X0*256)/PW,((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n-Y0*256)/PH];};

const ZB={
 "Cordone":[[51.205,30.03],[51.20,30.12],[51.185,30.20],[51.15,30.245],[51.10,30.235],[51.085,30.17],[51.10,30.07],[51.14,30.02],[51.18,30.015]],
 "Discarica":[[51.262,29.985],[51.265,30.06],[51.255,30.105],[51.225,30.115],[51.205,30.095],[51.203,30.02],[51.225,29.98]],
 "Agroprom":[[51.285,29.87],[51.285,29.95],[51.27,29.985],[51.235,29.985],[51.21,29.96],[51.215,29.885],[51.245,29.86]],
 "Valle Oscura":[[51.245,30.235],[51.24,30.33],[51.215,30.365],[51.17,30.36],[51.155,30.30],[51.17,30.24],[51.21,30.215]],
 "Bar e Rostok":[[51.312,30.08],[51.31,30.165],[51.295,30.19],[51.265,30.18],[51.26,30.11],[51.27,30.075]],
 "Yantar":[[51.365,29.87],[51.36,29.96],[51.345,29.99],[51.31,29.985],[51.295,29.94],[51.305,29.875],[51.335,29.855]],
 "Magazzini dell'esercito":[[51.385,30.16],[51.38,30.245],[51.36,30.27],[51.325,30.26],[51.318,30.18],[51.335,30.145],[51.365,30.14]],
 "Radar":[[51.345,30.005],[51.34,30.075],[51.32,30.095],[51.29,30.085],[51.285,30.03],[51.30,29.995],[51.325,29.99]],
 "Foresta Rossa":[[51.392,29.975],[51.39,30.02],[51.383,30.045],[51.365,30.05],[51.35,30.02],[51.352,29.98],[51.37,29.965]],
 "Janiv e Jupiter":[[51.405,30.018],[51.404,30.045],[51.397,30.075],[51.388,30.078],[51.386,30.05],[51.392,30.022]],
 "Pripjat'":[[51.42,30.03],[51.42,30.075],[51.41,30.085],[51.398,30.078],[51.403,30.045],[51.405,30.025]],
 "La centrale":[[51.398,30.085],[51.396,30.12],[51.385,30.13],[51.372,30.12],[51.372,30.09],[51.385,30.08]],
 "Zaton":[[51.48,30.09],[51.48,30.18],[51.465,30.215],[51.435,30.21],[51.425,30.15],[51.435,30.095],[51.46,30.08]]};
const st=document.createElement("style");st.textContent=`.m2d{position:relative;height:min(68vh,620px);border:2px solid var(--line);border-radius:8px;overflow:hidden;background:#0d120c;touch-action:none;cursor:grab;user-select:none}
.m2d.drag{cursor:grabbing}.m2d-in{position:absolute;left:0;top:0;width:${PW/2}px;height:${PH/2}px;transform-origin:0 0}
.m2d-in img{width:100%;height:100%;display:block;pointer-events:none}
.m2d-in span{position:absolute;transform:translate(-50%,-100%) scale(calc(1 / var(--k,1)));transform-origin:50% 100%;font:600 12px var(--f-h);color:#eef3df;background:#141a10d9;border:1px solid #9fb07a;border-radius:4px;padding:1px 6px;white-space:nowrap;pointer-events:none;margin-top:-6px}
.m2d-in span.gm{border-style:dashed;color:#d9dfc6}.m2d-in span.mk{transform:translate(-50%,calc(var(--i,0)*110% + 40%)) scale(calc(1 / var(--k,1)));transform-origin:50% 0;font-size:11px;background:#2a2210e6;border-color:#d9b84a;color:#f6e7a0;margin-top:0}.m2d-in span.mk.job{border-color:#8fd16a;color:#cfeeb8;background:#16240fe6}.m2d-in span.mk.png{border-color:#9fb0c8;color:#dde6f2;background:#141a24e6}.m2d-in span.qui{background:#9b2f17;border-color:#ffb199;color:#fff}
.m2d-in span[data-z]:not([data-z=""]){pointer-events:auto;cursor:pointer}.m2d-in svg.zb{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.m2d-in svg.zb .dim{fill:#000;fill-opacity:.5;fill-rule:evenodd}.m2d-in svg.zb .bord{fill:#d9b84a14;stroke:#f2d26b;stroke-width:calc(2.5px / var(--k,1));stroke-dasharray:calc(7px / var(--k,1)) calc(5px / var(--k,1));vector-effect:non-scaling-stroke}
.m2d.anim .m2d-in{transition:transform .55s cubic-bezier(.2,.7,.2,1)}
.m2d-info{position:absolute;left:8px;bottom:8px;z-index:2;background:#141a10e6;border:1px solid #d9b84a;border-radius:6px;color:#eef3df;padding:6px 10px;font:500 13px var(--f-b);display:flex;gap:8px;align-items:center;max-width:calc(100% - 70px)}
.m2d-info b{font-family:var(--f-h)}.m2d-info button{border:1px solid #9fb07a;background:#2a3320;color:#eef3df;border-radius:5px;padding:4px 8px;font:600 12px var(--f-h);cursor:pointer}
.m2d-btn{position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:6px;z-index:2}.m2d-btn button{width:40px;height:40px;border-radius:6px;border:1px solid #9fb07a;background:#141a10d9;color:#eef3df;font:700 18px var(--f-h);cursor:pointer}`;
document.head.appendChild(st);
const el=document.createElement("div");
el.innerHTML=`<div class="m2d"><div class="m2d-in"><img src="zona.jpg" alt="Immagine satellitare della Zona di esclusione" draggable="false">${POI.map(([n,la,lo,z,real])=>{const [u,v]=merc(la,lo);return `<span class="${real?"":"gm"}" data-z="${z}" style="left:${(u*100).toFixed(2)}%;top:${(v*100).toFixed(2)}%">${n}</span>`;}).join("")}<svg class="zb" viewBox="0 0 1 1" preserveAspectRatio="none"></svg></div>
<div class="m2d-info" hidden></div><div class="m2d-btn"><button data-m="in" aria-label="avvicina">+</button><button data-m="out" aria-label="allontana">−</button><button data-m="home" aria-label="centra" style="font-size:13px">⌂</button></div></div>
<p class="small muted" style="margin:6px 0 0">Trascina per spostare, rotella o due dita per lo zoom. Etichette piene: luoghi veri; tratteggiate: posizione di gioco, indicativa.<br>Immagini: Sentinel-2 cloudless 2020 di EOX IT Services GmbH (contiene dati Copernicus Sentinel modificati, 2020), CC BY-NC-SA 4.0.</p>`;
const box=el.querySelector(".m2d"),inn=el.querySelector(".m2d-in"),zb=el.querySelector("svg.zb"),info=el.querySelector(".m2d-info");let focus="";
let k=1,x=0,y=0,inited=false;
const W=PW/2,H=PH/2;
function clamp(){const bw=box.clientWidth,bh=box.clientHeight;k=Math.max(Math.max(bw/W,bh/H),Math.min(6,k));x=Math.min(0,Math.max(bw-W*k,x));y=Math.min(0,Math.max(bh-H*k,y));}
function apply(){clamp();inn.style.transform=`translate3d(${x}px,${y}px,0) scale(${k})`;inn.style.setProperty("--k",k);}
function zoomAt(f,cx,cy){const nk=Math.max(.1,Math.min(4,k*f));x=cx-(cx-x)*nk/k;y=cy-(cy-y)*nk/k;k=nk;apply();}
function zoneUV(z){return (ZB[z]||[]).map(([la,lo])=>merc(la,lo));}
function focusZone(z,anim=true){const P=zoneUV(z);if(!P.length)return;focus=z;const bw=box.clientWidth,bh=box.clientHeight;const us=P.map(p=>p[0]),vs=P.map(p=>p[1]);const u0=Math.min(...us),u1=Math.max(...us),v0=Math.min(...vs),v1=Math.max(...vs);
  const nk=Math.min(6,Math.min(bw/((u1-u0)*W),bh/((v1-v0)*H))*.72);const cu=(u0+u1)/2,cv=(v0+v1)/2;if(anim){box.classList.add("anim");setTimeout(()=>box.classList.remove("anim"),600);}k=nk;x=bw/2-cu*W*k;y=bh/2-cv*H*k;apply();
  const pts=P.map(p=>p.map(n=>n.toFixed(5)).join(",")).join(" ");zb.innerHTML=`<path class="dim" d="M-2 -2H3V3H-2Z M${P.map(p=>p[0].toFixed(5)+" "+p[1].toFixed(5)).join(" L")}Z"/><polygon class="bord" points="${pts}"/>`;
  const extra=typeof window.zoneInfo==="function"?window.zoneInfo(z):"";info.innerHTML=`<b>${z}</b>${extra}<button data-mz="x" aria-label="chiudi">✕</button>`;info.hidden=false;}
function unfocus(){focus="";zb.innerHTML="";info.hidden=true;}
function home(){unfocus();const bw=box.clientWidth,bh=box.clientHeight;if(!bw)return;k=Math.max(bw/W,bh/H)*1.6;const [u,v]=merc(51.30,30.10);x=bw/2-u*W*k;y=bh/2-v*H*k;apply();inited=true;}
const ptr=new Map();let pd=0;
let tap=null;box.addEventListener("pointerdown",e=>{if(e.target.closest("button,.m2d-info"))return;const sp=e.target.closest("span[data-z]");tap={z:sp&&sp.dataset.z,x:e.clientX,y:e.clientY};box.setPointerCapture(e.pointerId);ptr.set(e.pointerId,[e.clientX,e.clientY]);box.classList.add("drag");});
box.addEventListener("pointermove",e=>{if(!ptr.has(e.pointerId))return;const p=ptr.get(e.pointerId);const nx=e.clientX,ny=e.clientY;
 if(ptr.size===2){const [a,b]=[...ptr.values()];const d0=Math.hypot(a[0]-b[0],a[1]-b[1]);ptr.set(e.pointerId,[nx,ny]);const [c,d]=[...ptr.values()];const d1=Math.hypot(c[0]-d[0],c[1]-d[1]);const r=box.getBoundingClientRect();if(d0)zoomAt(d1/d0,(c[0]+d[0])/2-r.left,(c[1]+d[1])/2-r.top);return;}
 x+=nx-p[0];y+=ny-p[1];ptr.set(e.pointerId,[nx,ny]);apply();});
const up=e=>{if(tap&&e.type==="pointerup"&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<7){if(tap.z)focusZone(tap.z);else if(focus&&ptr.size===1)unfocus();}tap=null;ptr.delete(e.pointerId);if(!ptr.size)box.classList.remove("drag");};
box.addEventListener("pointerup",up);info.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.mz==="x"){unfocus();return;}if(b.dataset.mzd&&typeof window.zoneDest==="function")window.zoneDest(b.dataset.mzd);});box.addEventListener("pointercancel",up);
box.addEventListener("wheel",e=>{e.preventDefault();const r=box.getBoundingClientRect();zoomAt(e.deltaY<0?1.15:1/1.15,e.clientX-r.left,e.clientY-r.top);},{passive:false});
el.querySelector(".m2d-btn").addEventListener("click",e=>{const m=e.target.dataset.m;if(!m)return;const bw=box.clientWidth/2,bh=box.clientHeight/2;if(m==="in")zoomAt(1.4,bw,bh);else if(m==="out")zoomAt(1/1.4,bw,bh);else home();});
new ResizeObserver(()=>{if(!inited)home();else apply();}).observe(box);
window.Map3D={el,setMarks(list){inn.querySelectorAll("span.mk").forEach(x=>x.remove());const cnt={};(list||[]).forEach(m=>{const p=POI.find(q=>q[3]===m.zona);if(!p)return;const i=cnt[m.zona]=(cnt[m.zona]||0)+1;const [u,v]=merc(p[1],p[2]);const s=document.createElement("span");s.className="mk "+(m.cls||"");s.style.left=(u*100).toFixed(2)+"%";s.style.top=(v*100).toFixed(2)+"%";s.style.setProperty("--i",i-1);s.textContent=m.txt;inn.appendChild(s);});},setQui(n){el.querySelectorAll(".m2d-in span").forEach(s=>s.classList.toggle("qui",!!n&&s.dataset.z===n));},wake(){if(!inited)home();},focus(z){focusZone(z);},zones:Object.keys(ZB),info:null,onDest:null};
}
