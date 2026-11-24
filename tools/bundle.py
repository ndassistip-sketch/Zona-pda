"""Crea dist/PDA-Zona.html: un file solo, si apre con doppio clic, funziona offline."""
import json,base64,os,re,sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd=lambda p:open(os.path.join(R,p),encoding="utf-8").read()
def uri(p,mime):return f"data:{mime};base64,"+base64.b64encode(open(os.path.join(R,p),"rb").read()).decode()
arm=json.loads(rd("armeria.json"))
for x in arm:
    if x.get("i"):x["i"]=uri(x["i"],"image/webp")
B={"armeria.json":json.dumps(arm,ensure_ascii=False)}
for f in sorted(os.listdir(os.path.join(R,"eventi"))):
    if f.endswith((".json",".txt")):B["eventi/"+f]=rd("eventi/"+f)
js=lambda s:s.replace("</script","<\\/script")
pre="<script>window.__B="+js(json.dumps(B,ensure_ascii=False))+""";window.__BUNDLE=1;(function(){const f0=window.fetch.bind(window);window.fetch=function(u,o){const k=typeof u==="string"?u.replace(/^\\.\\//,""):"";if(k in window.__B)return Promise.resolve(new Response(window.__B[k],{status:200,headers:{"content-type":k.endsWith(".json")?"application/json":"text/plain"}}));return f0(u,o);};})();</script>"""
h=rd("index.html")
h=re.sub(r'<link rel="manifest"[^>]*>\n?','',h)
ico=uri("icona-192.png","image/png")
h=h.replace('href="icona-192.png"',f'href="{ico}"')
def inl(m):return "<script>"+js(rd(m.group(1)))+"</script>"
h=re.sub(r'<script src="([a-z0-9]+\.js)"></script>',inl,h)
mp=js(rd("mappa.js")).replace('src="zona.jpg"','src="'+uri("zona.jpg","image/jpeg")+'"')
h=h.replace("<script>",pre+"<script>"+mp+"</script><script>",1) if False else h
i=h.index("<script>")
h=h[:i]+pre+"<script>"+mp+"</script>"+h[i:]
out=os.path.join(R,"dist","PDA-Zona.html")
if len(sys.argv)>2:
    seed=json.load(open(sys.argv[1],encoding="utf-8"));out=sys.argv[2]
    sd="<script>(function(){var SEED="+js(json.dumps(seed,ensure_ascii=False))+";try{var st=JSON.parse(localStorage.getItem('pda.stato')||'null');if(!st||!st.pg||!st.pg.nome){Object.keys(SEED).forEach(function(k){localStorage.setItem('pda.'+k,JSON.stringify(SEED[k]));});}}catch(e){}})();</script>"
    i=h.index("<script>");h=h[:i]+sd+h[i:]
os.makedirs(os.path.dirname(out),exist_ok=True)
open(out,"w",encoding="utf-8").write(h)
print(len(h)//1024,"KB")
