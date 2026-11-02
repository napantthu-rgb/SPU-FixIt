const CATS=[["❄️","เครื่องปรับอากาศ","ช่างเครื่องปรับอากาศ"],["💡","ไฟฟ้า/แสงสว่าง","ฝ่ายไฟฟ้า"],["🚽","ห้องน้ำ/ประปา","ฝ่ายประปา"],["🗑️","ขยะ/ความสะอาด","ฝ่ายแม่บ้าน"],["🪑","เฟอร์นิเจอร์","ฝ่ายอาคาร"],["🧱","พื้น/ทางเดิน","ฝ่ายอาคาร"]];
const BLD={"อาคาร 1 (A)":4,"อาคาร 2 (B)":4,"อาคาร 3 (C)":4,"อาคาร 4 (D)":4,"ห้องสมุด":2,"โรงอาหาร":1,"สนามกีฬา":1,"ที่จอดมอเตอร์ไซค์":1,"ห้องพยาบาล":1,"ห้องน้ำ":1,"ห้องสวัสดิการนักศึกษา":1,"ที่จอดรถโซน A":1,"ที่จอดรถโซน B":1,"ที่จอดรถโซน C":1};
const ST=["รอตรวจสอบ","รับเรื่องแล้ว","กำลังดำเนินการ","แก้ไขแล้ว"];
const H=36e5,now=Date.now();
let T=[
{id:1,cat:0,b:"อาคาร 2 (B)",f:"3",r:"2-301",d:"แอร์ไม่เย็น มีน้ำหยด",who:"นภา (อาจารย์)",st:2,t:now-50*H,log:[[now-50*H,0],[now-46*H,1],[now-30*H,2]]},
{id:2,cat:1,b:"อาคาร 3 (C)",f:"2",r:"3-204",d:"ไฟในห้องเรียนไม่ติด 2 ดวง",who:"วิชัย (นักศึกษา)",st:1,t:now-20*H,log:[[now-20*H,0],[now-18*H,1]]},
{id:3,cat:2,b:"อาคาร 1 (A)",f:"1",r:"ห้องน้ำใกล้ 1-104",d:"ก๊อกน้ำรั่ว",who:"มานี (นักศึกษา)",st:3,t:now-90*H,log:[[now-90*H,0],[now-80*H,1],[now-70*H,2],[now-60*H,3]]},
{id:4,cat:2,b:"ห้องสมุด",f:"2",r:"ห้องน้ำ",d:"น้ำไม่ไหล",who:"ปิยะ (บุคลากร)",st:0,t:now-3*H,log:[[now-3*H,0]]},
{id:5,cat:3,b:"อาคาร 3 (C)",f:"1",r:"FOOD COURT",d:"ถังขยะล้น",who:"ศิริ (นักศึกษา)",st:0,t:now-2*H,log:[[now-2*H,0]]},
{id:6,cat:0,b:"อาคาร 2 (B)",f:"2",r:"2-206",d:"แอร์ไม่ทำงาน",who:"ธีระ (อาจารย์)",st:2,t:now-26*H,log:[[now-26*H,0],[now-24*H,1],[now-5*H,2]]}];
let adm=false,role="user",tab="report",selCat=0,notes=[],unread=0,img=null,mine="-";
const $=s=>document.querySelector(s),fmt=t=>new Date(t).toLocaleString("th-TH",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const loc=t=>`${t.b} ชั้น ${t.f} ${t.r}`,ago=t=>{const h=Math.round((Date.now()-t)/H);return h<24?h+" ชม.":Math.floor(h/24)+" วัน"};
function toast(m){const e=$("#toast");e.textContent=m;e.classList.remove("hide");clearTimeout(toast.k);toast.k=setTimeout(()=>e.classList.add("hide"),2800)}
function notify(m){notes.unshift([Date.now(),m]);unread++;renderBell()}
function renderBell(){const b=$("#bn");b.textContent=unread;b.classList.toggle("hide",!unread);$("#panel").innerHTML=notes.length?notes.map(n=>`<p>${n[1]}<br><small class="mut">${fmt(n[0])}</small></p>`).join(""):'<p class="mut">ยังไม่มีการแจ้งเตือน เมื่อสถานะเรื่องที่แจ้งเปลี่ยน ข้อความจะแสดงที่นี่</p>'}
$("#bell").onclick=()=>{$("#panel").classList.toggle("hide");unread=0;renderBell()};
function tabs(){const L=role=="user"?[["report","📝 แจ้งปัญหา"],["track","🔍 ติดตามสถานะ"]]:adm?[["dash","📊 Dashboard"],["queue","🛠️ จัดการสถานะ"],["out","🚪 ออกจากระบบ"]]:[["login","🔐 เข้าสู่ระบบแอดมิน"]];
 if(!L.some(x=>x[0]==tab))tab=L[0][0];
 $("#tabs").innerHTML=L.map(x=>`<button data-t="${x[0]}" class="${x[0]==tab?"on":""}">${x[1]}</button>`).join("");
 $("#hero").classList.toggle("hide",role!="user");["report","track","dash","queue","login"].forEach(k=>$("#v-"+k).classList.toggle("hide",k!=tab));render()}
$("#tabs").onclick=e=>{const k=e.target.dataset.t;if(!k)return;if(k=="out"){adm=false;tab="login";tabs();toast("ออกจากระบบแล้ว");return}tab=k;tabs()};
$("#roleSeg").onclick=e=>{if(!e.target.dataset.r)return;role=e.target.dataset.r;document.querySelectorAll("#roleSeg button").forEach(b=>b.classList.toggle("on",b==e.target));tabs()};
function pill(s){return `<span class="pill s${s}">${ST[s]}</span>`}
function steps(t){return `<div class="steps">${ST.map((s,i)=>`<div class="${i<=t.st?"on":""}">${s}</div>`).join("")}</div><ul class="log">${t.log.map(l=>`<li>${fmt(l[0])} – ${ST[l[1]]}</li>`).join("")}</ul>`}
// report form
function initForm(){
 $("#cats").innerHTML=CATS.map((c,i)=>`<button data-i="${i}" class="${i==selCat?"on":""}"><span style="font-size:28px">${c[0]}</span><br>${c[1]}</button>`).join("");
 $("#bld").innerHTML=Object.keys(BLD).map(b=>`<option>${b}</option>`).join("");$("#quick").innerHTML=Object.keys(BLD).map(b=>`<button data-b="${b}">${b}</button>`).join("");fl();mk()}
function fl(){$("#flr").innerHTML=Array.from({length:BLD[$("#bld").value]},(_,i)=>`<option value="${i+1}">ชั้น ${i+1}</option>`).join("")}
$("#cats").onclick=e=>{const b=e.target.closest("button");if(b){selCat=+b.dataset.i;initForm();dup()}};
function mk(){document.querySelectorAll("#quick button").forEach(b=>b.classList.toggle("on",b.dataset.b==$("#bld").value));setTimeout(()=>{$("#locsum").innerHTML="📍 "+$("#bld").value+" · ชั้น "+$("#flr").value},0);document.querySelectorAll("#map g").forEach(g=>g.classList.toggle("on",g.dataset.b==$("#bld").value));const lib=$("#bld").value=="ห้องสมุด";if(lib)$("#flr").value="2";$("#room").placeholder=lib?"โซน/จุด เช่น โซนอ่านหนังสือ (ชั้น 2)":($("#bld").value.match(/\d/)?"ห้อง/จุด เช่น "+$("#bld").value.match(/\d/)[0]+"-"+$("#flr").value+"01":"ระบุจุดที่พบปัญหา")}
$("#quick").onclick=e=>{const b=e.target.closest("button");if(b){$("#bld").value=b.dataset.b;fl();mk();dup()}};
$("#zoomMap").onclick=()=>{$("#mmb").innerHTML=$("#map").outerHTML.replace('id="map"','id="map2"');document.querySelectorAll("#map2 g").forEach(g=>g.classList.toggle("on",g.dataset.b==$("#bld").value));$("#mm").classList.remove("hide")};
$("#mmx").onclick=()=>$("#mm").classList.add("hide");
$("#mmb").onclick=e=>{const g=e.target.closest("g");if(g){$("#bld").value=g.dataset.b;fl();mk();dup();$("#mm").classList.add("hide");toast("เลือก "+g.dataset.b+" แล้ว")}};
$("#map").onclick=e=>{const g=e.target.closest("g");if(g){$("#bld").value=g.dataset.b;fl();mk();dup()}};
$("#bld").onchange=()=>{fl();mk();dup()};$("#flr").onchange=()=>{mk();dup()};$("#room").oninput=dup;
function dup(){const r=$("#room").value.trim(),m=T.filter(t=>t.st<3&&t.cat==selCat&&t.b==$("#bld").value&&t.f==$("#flr").value&&(!r||t.r.includes(r)));
 const d=$("#dup");d.classList.toggle("hide",!m.length);
 d.innerHTML=m.length?`⚠️ พบเรื่องที่คล้ายกันและยังไม่เสร็จ ${m.length} รายการ:<br>${m.map(t=>`• ${loc(t)} – ${t.d} ${pill(t.st)}`).join("<br>")}<br><small>หากเป็นปัญหาเดียวกัน ไม่ต้องแจ้งซ้ำ ติดตามได้ที่แท็บ "ติดตามสถานะ"</small>`:""}
$("#img").onchange=e=>{const f=e.target.files[0];if(!f){img=null;$("#prev").classList.add("hide");return}
 const r=new FileReader();r.onload=()=>{img=r.result;$("#prev").src=img;$("#prev").classList.remove("hide")};r.readAsDataURL(f)};
$("#send").onclick=()=>{
 const d=$("#desc").value.trim(),room=$("#room").value.trim();
 if(!room||!d){toast("กรอกห้อง และรายละเอียดปัญหาก่อนส่ง");return}
 mine=$("#who").value.trim()||mine;
 const t={id:T.length+1,cat:selCat,b:$("#bld").value,f:$("#flr").value,r:room,d,who:mine,st:0,t:Date.now(),img,log:[[Date.now(),0]]};
 T.unshift(t);
 const f=$("#flow");f.classList.remove("hide");
 f.innerHTML=`✅ ส่งเรื่อง #${t.id} แล้ว<br>Automation: ตรวจพบประเภท "${CATS[t.cat][1]}" → ส่งต่อ <b>${CATS[t.cat][2]}</b> → แจ้งเตือนเจ้าหน้าที่แล้ว`;
 notify(`ส่งเรื่อง #${t.id} (${loc(t)}) ให้ ${CATS[t.cat][2]} แล้ว`);
 $("#desc").value="";$("#room").value="";$("#img").value="";img=null;$("#prev").classList.add("hide");dup();toast("ส่งเรื่องเรียบร้อย")};
// tracking
function renderTrack(){const q=$("#q").value.trim().toLowerCase();
 const L=T.filter(t=>!q||(CATS[t.cat][1]+loc(t)+t.d).toLowerCase().includes(q.replace(/\s+/g," ")) || q.split(" ").every(w=>(CATS[t.cat][1]+" "+loc(t)+" "+t.d).toLowerCase().includes(w)));
 $("#tlist").innerHTML=L.length?L.map(t=>`<div class="card c${t.st}"><div class="tk"><div><b>#${t.id} ${CATS[t.cat][0]} ${CATS[t.cat][1]}</b><br>${loc(t)}<br><small>${t.d}</small></div>${pill(t.st)}</div>${steps(t)}${t.img?`<img class="thumb" src="${t.img}" alt="รูปประกอบ">`:""}</div>`).join(""):'<div class="card mut">ไม่พบเรื่องที่ตรงกับคำค้น หากเป็นปัญหาใหม่ ไปที่แท็บ "แจ้งปัญหา"</div>'}
$("#q").oninput=renderTrack;
// dashboard
function bars(el,map){const m=Math.max(1,...Object.values(map));$(el).innerHTML=Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar"><span>${k}</span><i style="width:${v/m*55}%"></i><b>${v}</b></div>`).join("")||'<span class="mut">ไม่มีข้อมูล</span>'}
function renderDash(){const c=n=>T.filter(t=>t.st==n).length;
 $("#kpis").innerHTML=[["📋 ทั้งหมด",T.length],["⏳ รอตรวจสอบ",c(0)+c(1)],["🔧 กำลังดำเนินการ",c(2)],["✅ แก้ไขแล้ว",c(3)]].map(k=>`<div class="kpi"><b>${k[1]}</b>${k[0]}</div>`).join("");
 const cm={},bm={};T.forEach(t=>{cm[CATS[t.cat][1]]=(cm[CATS[t.cat][1]]||0)+1;bm[t.b]=(bm[t.b]||0)+1});bars("#bCat",cm);bars("#bBld",bm);
 const o=T.filter(t=>t.st<3).sort((a,b)=>a.t-b.t).slice(0,4);
 $("#old").innerHTML=o.map(t=>`<div class="tk" style="padding:6px 0"><span>#${t.id} ${CATS[t.cat][1]} – ${loc(t)}</span><span>${pill(t.st)} <b>${ago(t.t)}</b></span></div>`).join("")||'<span class="mut">ไม่มีเรื่องค้าง</span>'}
// staff queue
function initFilters(){$("#fDep").innerHTML='<option value="">ทุกฝ่าย</option>'+[...new Set(CATS.map(c=>c[2]))].map(d=>`<option>${d}</option>`).join("");
 $("#fSt").innerHTML='<option value="">ทุกสถานะ</option>'+ST.map((s,i)=>`<option value="${i}">${s}</option>`).join("")}
function renderQueue(){const d=$("#fDep").value,s=$("#fSt").value;
 const L=T.filter(t=>(!d||CATS[t.cat][2]==d)&&(s===""||t.st==+s)).sort((a,b)=>a.st-b.st||a.t-b.t);
 $("#qlist").innerHTML=L.map(t=>`<div class="card c${t.st}"><div class="tk" style="cursor:default"><div><b>#${t.id} ${CATS[t.cat][0]} ${CATS[t.cat][1]}</b> → <small>${CATS[t.cat][2]}</small><br>${loc(t)}<br>${t.d}<br><small>แจ้งโดย ${t.who} · ${fmt(t.t)} (${ago(t.t)}ที่แล้ว)</small>${t.img?`<img class="thumb" src="${t.img}" alt="รูปประกอบ">`:""}</div>
 <div style="text-align:right">${pill(t.st)}<br><br><select class="st" data-id="${t.id}" aria-label="เปลี่ยนสถานะ">${ST.map((s,i)=>`<option value="${i}"${i==t.st?" selected":""}>${s}</option>`).join("")}</select></div></div></div>`).join("")||'<div class="card mut">ไม่มีรายการตามตัวกรองนี้</div>'}
$("#fDep").onchange=$("#fSt").onchange=renderQueue;
$("#qlist").onchange=e=>{const id=e.target.dataset.id;if(!id)return;const t=T.find(x=>x.id==id),n=+e.target.value;if(n==t.st)return;t.st=n;t.log.push([Date.now(),t.st]);
 notify(`เรื่อง #${t.id} ${CATS[t.cat][1]} ${loc(t)} ${["ถูกปรับกลับเป็นรอตรวจสอบ","ได้รับการรับเรื่องแล้ว","กำลังดำเนินการ","ได้รับการแก้ไขแล้ว"][t.st]}`);toast("อัปเดตสถานะและแจ้งเตือนผู้แจ้งแล้ว");renderQueue()};
function render(){if(tab=="track")renderTrack();if(tab=="dash")renderDash();if(tab=="queue")renderQueue()}
function doLogin(){if($("#un").value.trim()=="12345678"&&$("#pw").value=="12345678"){adm=true;$("#pw").value="";$("#lerr").textContent="";tab="dash";tabs();toast("เข้าสู่ระบบแอดมินแล้ว")}else $("#lerr").textContent="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"}
$("#login").onclick=doLogin;$("#pw").onkeydown=e=>{if(e.key=="Enter")doLogin()};
initForm();initFilters();renderBell();tabs();
