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
const st=document.createElement("style");st.textContent=`.m2d{position:relative;height:min(68vh,620px);border:2px solid var(--line);border-radius:8px;overflow:hidden;background:#0d120c;touch-action:none;cursor:grab;user-select:none}
.m2d.drag{cursor:grabbing}.m2d-in{position:absolute;left:0;top:0;width:${PW/2}px;height:${PH/2}px;transform-origin:0 0;will-change:transform}
.m2d-in img{width:100%;height:100%;display:block;pointer-events:none}
.m2d-in span{position:absolute;transform:translate(-50%,-100%) scale(calc(1 / var(--k,1)));transform-origin:50% 100%;font:600 12px var(--f-h);color:#eef3df;background:#141a10d9;border:1px solid #9fb07a;border-radius:4px;padding:1px 6px;white-space:nowrap;pointer-events:none;margin-top:-6px}
.m2d-in span.gm{border-style:dashed;color:#d9dfc6}.m2d-in span.mk{transform:translate(-50%,calc(var(--i,0)*110% + 40%)) scale(calc(1 / var(--k,1)));transform-origin:50% 0;font-size:11px;background:#2a2210e6;border-color:#d9b84a;color:#f6e7a0;margin-top:0}.m2d-in span.mk.job{border-color:#8fd16a;color:#cfeeb8;background:#16240fe6}.m2d-in span.mk.png{border-color:#9fb0c8;color:#dde6f2;background:#141a24e6}.m2d-in span.qui{background:#9b2f17;border-color:#ffb199;color:#fff}
.m2d-btn{position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:6px;z-index:2}.m2d-btn button{width:40px;height:40px;border-radius:6px;border:1px solid #9fb07a;background:#141a10d9;color:#eef3df;font:700 18px var(--f-h);cursor:pointer}`;
document.head.appendChild(st);
const el=document.createElement("div");
el.innerHTML=`<div class="m2d"><div class="m2d-in"><img src="zona.jpg" alt="Immagine satellitare della Zona di esclusione" draggable="false">${POI.map(([n,la,lo,z,real])=>{const [u,v]=merc(la,lo);return `<span class="${real?"":"gm"}" data-z="${z}" style="left:${(u*100).toFixed(2)}%;top:${(v*100).toFixed(2)}%">${n}</span>`;}).join("")}</div>
<div class="m2d-btn"><button data-m="in" aria-label="avvicina">+</button><button data-m="out" aria-label="allontana">−</button><button data-m="home" aria-label="centra" style="font-size:13px">⌂</button></div></div>
<p class="small muted" style="margin:6px 0 0">Trascina per spostare, rotella o due dita per lo zoom. Etichette piene: luoghi veri; tratteggiate: posizione di gioco, indicativa.<br>Immagini: Sentinel-2 cloudless 2020 di EOX IT Services GmbH (contiene dati Copernicus Sentinel modificati, 2020), CC BY-NC-SA 4.0.</p>`;
const box=el.querySelector(".m2d"),inn=el.querySelector(".m2d-in");
let k=1,x=0,y=0,inited=false;
const W=PW/2,H=PH/2;
function clamp(){const bw=box.clientWidth,bh=box.clientHeight;k=Math.max(Math.max(bw/W,bh/H),Math.min(4,k));x=Math.min(0,Math.max(bw-W*k,x));y=Math.min(0,Math.max(bh-H*k,y));}
function apply(){clamp();inn.style.transform=`translate3d(${x}px,${y}px,0) scale(${k})`;inn.style.setProperty("--k",k);}
function zoomAt(f,cx,cy){const nk=Math.max(.1,Math.min(4,k*f));x=cx-(cx-x)*nk/k;y=cy-(cy-y)*nk/k;k=nk;apply();}
function home(){const bw=box.clientWidth,bh=box.clientHeight;if(!bw)return;k=Math.max(bw/W,bh/H)*1.6;const [u,v]=merc(51.30,30.10);x=bw/2-u*W*k;y=bh/2-v*H*k;apply();inited=true;}
const ptr=new Map();let pd=0;
box.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;box.setPointerCapture(e.pointerId);ptr.set(e.pointerId,[e.clientX,e.clientY]);box.classList.add("drag");});
box.addEventListener("pointermove",e=>{if(!ptr.has(e.pointerId))return;const p=ptr.get(e.pointerId);const nx=e.clientX,ny=e.clientY;
 if(ptr.size===2){const [a,b]=[...ptr.values()];const d0=Math.hypot(a[0]-b[0],a[1]-b[1]);ptr.set(e.pointerId,[nx,ny]);const [c,d]=[...ptr.values()];const d1=Math.hypot(c[0]-d[0],c[1]-d[1]);const r=box.getBoundingClientRect();if(d0)zoomAt(d1/d0,(c[0]+d[0])/2-r.left,(c[1]+d[1])/2-r.top);return;}
 x+=nx-p[0];y+=ny-p[1];ptr.set(e.pointerId,[nx,ny]);apply();});
const up=e=>{ptr.delete(e.pointerId);if(!ptr.size)box.classList.remove("drag");};
box.addEventListener("pointerup",up);box.addEventListener("pointercancel",up);
box.addEventListener("wheel",e=>{e.preventDefault();const r=box.getBoundingClientRect();zoomAt(e.deltaY<0?1.15:1/1.15,e.clientX-r.left,e.clientY-r.top);},{passive:false});
el.querySelector(".m2d-btn").addEventListener("click",e=>{const m=e.target.dataset.m;if(!m)return;const bw=box.clientWidth/2,bh=box.clientHeight/2;if(m==="in")zoomAt(1.4,bw,bh);else if(m==="out")zoomAt(1/1.4,bw,bh);else home();});
new ResizeObserver(()=>{if(!inited)home();else apply();}).observe(box);
window.Map3D={el,setMarks(list){inn.querySelectorAll("span.mk").forEach(x=>x.remove());const cnt={};(list||[]).forEach(m=>{const p=POI.find(q=>q[3]===m.zona);if(!p)return;const i=cnt[m.zona]=(cnt[m.zona]||0)+1;const [u,v]=merc(p[1],p[2]);const s=document.createElement("span");s.className="mk "+(m.cls||"");s.style.left=(u*100).toFixed(2)+"%";s.style.top=(v*100).toFixed(2)+"%";s.style.setProperty("--i",i-1);s.textContent=m.txt;inn.appendChild(s);});},setQui(n){el.querySelectorAll(".m2d-in span").forEach(s=>s.classList.toggle("qui",!!n&&s.dataset.z===n));},wake(){if(!inited)home();}};
}
