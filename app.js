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
let aiPri=false,aiRes=null,adm=false,role="user",tab="report",selCat=0,notes=[],unread=0,img=null,mine="-";
const $=s=>document.querySelector(s),fmt=t=>new Date(t).toLocaleString("th-TH",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const loc=t=>`${t.b} ชั้น ${t.f} ${t.r}`,ago=t=>{const h=Math.round((Date.now()-t)/H);return h<24?h+" ชม.":Math.floor(h/24)+" วัน"};
function toast(m){const e=$("#toast");e.textContent=m;e.classList.remove("hide");clearTimeout(toast.k);toast.k=setTimeout(()=>e.classList.add("hide"),2800)}
function notify(m){notes.unshift([Date.now(),m]);unread++;renderBell()}
function renderBell(){const b=$("#bn");b.textContent=unread;b.classList.toggle("hide",!unread);$("#panel").innerHTML=notes.length?notes.map(n=>`<p>${n[1]}<br><small class="mut">${fmt(n[0])}</small></p>`).join(""):'<p class="mut">ยังไม่มีการแจ้งเตือน เมื่อสถานะเรื่องที่แจ้งเปลี่ยน ข้อความจะแสดงที่นี่</p>'}
$("#bell").onclick=()=>{$("#panel").classList.toggle("hide");unread=0;renderBell()};
function tabs(){syncSeg();const L=role=="user"?[["report","📝 แจ้งปัญหา"],["track","🔍 ติดตามสถานะ"]]:adm?[["dash","📊 Dashboard"],["queue","🛠️ จัดการสถานะ"],["out","🚪 ออกจากระบบ"]]:[["login","🔐 เข้าสู่ระบบแอดมิน"]];
 if(!L.some(x=>x[0]==tab))tab=L[0][0];
 $("#tabs").innerHTML=L.map(x=>`<button data-t="${x[0]}" class="${x[0]==tab?"on":""}">${x[1]}</button>`).join("");
 $("#hero").classList.toggle("hide",role!="user");["report","track","dash","queue"].forEach(k=>$("#v-"+k).classList.toggle("hide",k!=tab));render()}
$("#tabs").onclick=e=>{const k=e.target.dataset.t;if(!k)return;if(k=="out"){logout();return}tab=k;tabs()};
$("#roleSeg").onclick=e=>{if(!e.target.dataset.r)return;role=e.target.dataset.r;document.querySelectorAll("#roleSeg button").forEach(b=>b.classList.toggle("on",b==e.target));tabs()};
function pill(s){return `<span class="pill s${s}">${ST[s]}</span>`}
function steps(t){return `<div class="steps">${ST.map((s,i)=>`<div class="${i<=t.st?"on":""}">${s}</div>`).join("")}</div><ul class="log">${t.log.map(l=>`<li>${fmt(l[0])} – ${ST[l[1]]}</li>`).join("")}</ul>`}
// report form
function initForm(){
 $("#cats").innerHTML=CATS.map((c,i)=>`<button data-i="${i}" class="${i==selCat?"on":""}"><span style="font-size:28px">${c[0]}</span><br>${c[1]}</button>`).join("");
 $("#bld").innerHTML=Object.keys(BLD).map(b=>`<option>${b}</option>`).join("");$("#quick").innerHTML=Object.keys(BLD).map(b=>`<button data-b="${b}">${b}</button>`).join("");fl();mk()}
function fl(){$("#flr").innerHTML=Array.from({length:BLD[$("#bld").value]},(_,i)=>`<option value="${i+1}">ชั้น ${i+1}</option>`).join("")}
$("#cats").onclick=e=>{const b=e.target.closest("button");if(b){selCat=+b.dataset.i;keepForm();dup()}};
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
 const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,800/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);img=cv.toDataURL("image/jpeg",.7);$("#prev").src=img;$("#prev").classList.remove("hide")};im.src=r.result};r.readAsDataURL(f)};
$("#send").onclick=async()=>{
 const d=$("#desc").value.trim(),room=$("#room").value.trim();
 if(!room||!d){toast("กรอกห้อง และรายละเอียดปัญหาก่อนส่ง");return}
 mine=$("#who").value.trim()||mine;
 const t={id:T.length+1,cat:selCat,b:$("#bld").value,f:$("#flr").value,r:room,d,who:mine,st:0,t:Date.now(),img,pri:aiPri,log:[[Date.now(),0]]};
 if(SB()){try{const r=await sb("tickets",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({cat:t.cat,b:t.b,f:t.f,r:t.r,d:t.d,who:t.who,st:0,pri:!!t.pri,img:t.img||null,log:t.log})});t.id=r[0].id}catch(e){toast("บันทึกลงฐานข้อมูลไม่สำเร็จ");return}}
 T.unshift(t);MY.add(String(t.id));aiPri=false;$("#aiBox").classList.add("hide");
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
 $("#qlist").innerHTML=L.map(t=>`<div class="card c${t.st}"><div class="tk" style="cursor:default"><div><b>#${t.id} ${CATS[t.cat][0]} ${CATS[t.cat][1]}</b>${t.pri?' <span class="pill s0">🔥 ด่วน</span>':''} → <small>${CATS[t.cat][2]}</small><br>${loc(t)}<br>${t.d}<br><small>แจ้งโดย ${t.who} · ${fmt(t.t)} (${ago(t.t)}ที่แล้ว)</small>${t.img?`<img class="thumb" src="${t.img}" alt="รูปประกอบ">`:""}</div>
 <div style="text-align:right">${pill(t.st)}<br><br><select class="st" data-id="${t.id}" aria-label="เปลี่ยนสถานะ">${ST.map((s,i)=>`<option value="${i}"${i==t.st?" selected":""}>${s}</option>`).join("")}</select></div></div></div>`).join("")||'<div class="card mut">ไม่มีรายการตามตัวกรองนี้</div>'}
$("#fDep").onchange=$("#fSt").onchange=renderQueue;
$("#qlist").onchange=async e=>{const id=e.target.dataset.id;if(!id)return;const t=T.find(x=>x.id==id),n=+e.target.value;if(n==t.st)return;
 if(SB()){try{await sb("rpc/set_status",{method:"POST",body:JSON.stringify({p_id:t.id,p_st:n,p_pin:ADM_PIN})})}catch(err){toast("อัปเดตไม่สำเร็จ");renderQueue();return}}
 t.st=n;t.log.push([Date.now(),t.st]);
 notify(`เรื่อง #${t.id} ${CATS[t.cat][1]} ${loc(t)} ${["ถูกปรับกลับเป็นรอตรวจสอบ","ได้รับการรับเรื่องแล้ว","กำลังดำเนินการ","ได้รับการแก้ไขแล้ว"][t.st]}`);toast("อัปเดตสถานะและแจ้งเตือนผู้แจ้งแล้ว");renderQueue()};
function render(){if(tab=="track")renderTrack();if(tab=="dash")renderDash();if(tab=="queue")renderQueue()}

// ===== Supabase (ฐานข้อมูล) =====
const SB=()=>!!(window.SUPABASE_URL&&window.SUPABASE_ANON_KEY),DEMO_PIN="12345678",MY=new Set();let ADM_PIN="";
async function sb(path,opt={}){const k=window.SUPABASE_ANON_KEY;
 const r=await fetch(window.SUPABASE_URL.replace(/\/$/,"")+"/rest/v1/"+path,{...opt,headers:{apikey:k,Authorization:"Bearer "+k,"Content-Type":"application/json",...(opt.headers||{})}});
 const tx=await r.text();if(!r.ok)throw new Error(tx||r.status);return tx?JSON.parse(tx):null}
const conv=x=>({id:x.id,cat:x.cat,b:x.b,f:x.f,r:x.r,d:x.d,who:x.who,st:x.st,pri:x.pri,img:x.img,t:Date.parse(x.created_at),log:x.log||[]});
async function staffOK(pw){if(!SB())return pw==DEMO_PIN;try{const ok=await sb("rpc/admin_check",{method:"POST",body:JSON.stringify({p_pin:pw})});if(ok===true){ADM_PIN=pw;return true}}catch(e){}return false}
async function refresh(){if(!SB())return;
 try{const rows=await sb("tickets?select=*&order=created_at.desc");
  if(document.activeElement&&document.activeElement.tagName=="SELECT"&&tab=="queue")return;
  const old=new Map(T.map(t=>[String(t.id),t.st])),nt=rows.map(conv);
  nt.forEach(t=>{const o=old.get(String(t.id));if(o!==undefined&&o!==t.st&&MY.has(String(t.id)))notify(`เรื่อง #${t.id} ${CATS[t.cat][1]} ${loc(t)} ${["กลับเป็นรอตรวจสอบ","ได้รับการรับเรื่องแล้ว","กำลังดำเนินการ","ได้รับการแก้ไขแล้ว"][t.st]}`)});
  T=nt;render()}catch(e){}}
// ===== Login =====
const S1={pw:"123",role:"user"},ACC={"123":S1,"123@spu.ac.th":S1,"12345678":{role:"staff"}};
async function doLogin(){const a=ACC[$("#lgid").value.trim().toLowerCase()],pw=$("#lgpw").value;let ok=false;
 if(a)ok=a.role=="staff"?await staffOK(pw):a.pw==pw;
 if(ok){role=a.role;adm=role=="staff";tab=adm?"dash":"report";$("#login").classList.add("hide");$("#app").classList.remove("hide");$("#lgerr").textContent="";$("#lgpw").value="";tabs();window.scrollTo(0,0);refresh();toast(adm?"เข้าสู่ระบบแอดมินแล้ว":"ยินดีต้อนรับ")}
 else $("#lgerr").textContent="รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"}
function logout(){adm=false;role="user";tab="report";$("#app").classList.add("hide");$("#login").classList.remove("hide");$("#lgpw").value="";window.scrollTo(0,0);toast("ออกจากระบบแล้ว")}
$("#lgbtn").onclick=doLogin;$("#lgpw").onkeydown=$("#lgid").onkeydown=e=>{if(e.key=="Enter")doLogin()};
$("#lgeye").onclick=()=>{const p=$("#lgpw");p.type=p.type=="password"?"text":"password"};
// ===== Forgot password + OTP =====
let otpCode="",otpExp=0,otpTry=0,otpMail="",otpKey="",otpT,cdT;
function fpStep(n){["fp1","fp2","fp3"].forEach((k,i)=>$("#"+k).classList.toggle("hide",i!=n-1));$("#fperr").textContent="";$("#fpt").textContent=["ลืมรหัสผ่าน","ยืนยันรหัส OTP","ตั้งรหัสผ่านใหม่"][n-1]}
function cd(){clearInterval(cdT);const b=$("#fpre");let n=30;b.disabled=true;const tick=()=>{if(n>0)b.textContent=`ส่งรหัสอีกครั้งได้ใน ${n--} วิ`;else{b.textContent="ส่งรหัสอีกครั้ง";b.disabled=false;clearInterval(cdT)}};tick();cdT=setInterval(tick,1000)}
function sendOTP(){const a=new Uint32Array(1);crypto.getRandomValues(a);otpCode=String(100000+a[0]%900000);otpExp=Date.now()+3e5;otpTry=0;
 const p=$("#otp");p.innerHTML=`<span style="font-size:28px">✉️</span><div><b>SPU FixIt · ข้อความใหม่</b><br>รหัส OTP ของคุณคือ <b style="font-size:22px;letter-spacing:3px;color:#c4006a">${otpCode}</b><br><small>ใช้ได้ 5 นาที · อย่าบอกรหัสนี้กับผู้อื่น</small></div>`;
 p.classList.remove("hide");clearTimeout(otpT);otpT=setTimeout(()=>p.classList.add("hide"),20000);
 $("#fpinfo").textContent="ส่งรหัสไปที่ "+otpMail+" แล้ว (ใช้ได้ 5 นาที)";$("#fpotp").value="";cd()}
$("#otp").onclick=()=>$("#otp").classList.add("hide");
$("#lgforgot").onclick=()=>{$("#fp").classList.remove("hide");fpStep(1);const v=$("#lgid").value.trim();$("#fpem").value=v.includes("@")?v:""};
$("#fpx").onclick=()=>{$("#fp").classList.add("hide");$("#otp").classList.add("hide");otpCode=""};
$("#fpsend").onclick=()=>{const v=$("#fpem").value.trim(),k=v.toLowerCase();
 if(!ACC[k]||ACC[k].role!="user"||!k.includes("@")){$("#fperr").textContent="ไม่พบอีเมลนักศึกษานี้ในระบบ (ทดลองใช้ 123@spu.ac.th)";return}
 otpMail=v;otpKey=k;sendOTP();fpStep(2)};
$("#fpre").onclick=sendOTP;
$("#fpver").onclick=()=>{const v=$("#fpotp").value.trim();
 if(!otpCode||Date.now()>otpExp){$("#fperr").textContent="รหัส OTP หมดอายุ กรุณากดส่งรหัสอีกครั้ง";return}
 if(otpTry>=5){$("#fperr").textContent="กรอกผิดเกินกำหนด กรุณากดส่งรหัสอีกครั้ง";return}
 if(v!==otpCode){otpTry++;$("#fperr").textContent=`รหัส OTP ไม่ถูกต้อง (เหลือ ${5-otpTry} ครั้ง)`;return}
 otpCode="";$("#otp").classList.add("hide");fpStep(3)};
$("#fpsave").onclick=()=>{const a=$("#fpn1").value,b=$("#fpn2").value;
 if(a.length<3){$("#fperr").textContent="รหัสผ่านต้องมีอย่างน้อย 3 ตัวอักษร";return}
 if(a!==b){$("#fperr").textContent="รหัสผ่านทั้งสองช่องไม่ตรงกัน";return}
 ACC[otpKey].pw=a;$("#fp").classList.add("hide");$("#lgid").value=otpMail;$("#lgpw").value="";$("#fpn1").value=$("#fpn2").value="";toast("ตั้งรหัสผ่านใหม่เรียบร้อย ลองเข้าสู่ระบบด้วยรหัสใหม่")};

$("#logout").onclick=logout;
function keepForm(){const b=$("#bld").value,f=$("#flr").value;initForm();$("#bld").value=b;fl();$("#flr").value=f;mk()}
// ===== AI (Free Tier) =====
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let SP;async function getAI(){if(SP===undefined){try{SP=await claude.use("sample")}catch(e){SP=null}}return SP}
const KW=[["แอร์|เย็น|เครื่องปรับ",0],["ไฟ|หลอด|ปลั๊ก|สวิตช์|มืด",1],["น้ำ|ก๊อก|ส้วม|ชักโครก|ท่อ|ประปา",2],["ขยะ|สกปรก|เหม็น|สะอาด",3],["โต๊ะ|เก้าอี้|เฟอร์|ตู้|กระดาน",4],["พื้น|ทางเดิน|บันได|แตก|ลื่น|หลุม",5]];
function localAI(d){let c=selCat;for(const[k,i]of KW)if(new RegExp(k).test(d)){c=i;break}
 const u=/ช็อต|ควัน|ไหม้|ประกายไฟ|อันตราย|ลื่นล้ม|น้ำท่วม/.test(d);
 return{category:c,urgent:u,improved:d.replace(/\s+/g," ").trim(),tip:u?"เรื่องนี้อาจอันตราย โปรดอยู่ห่างจากจุดเกิดเหตุจนกว่าเจ้าหน้าที่จะมา":"ระบบจะส่งเรื่องให้ฝ่ายที่รับผิดชอบทันทีหลังกดส่ง"}}
function showAI(r){aiRes=r;const b=$("#aiBox");b.classList.remove("hide");
 b.innerHTML=`<b>✨ ผลวิเคราะห์</b> <small class="mut">(${r.src})</small><br>ประเภท: <b>${CATS[r.category][0]} ${CATS[r.category][1]}</b> → ส่งต่อ ${CATS[r.category][2]}<br>ความเร่งด่วน: <b>${r.urgent?"🔥 ด่วน":"ปกติ"}</b><br>ข้อความแนะนำ: ${esc(r.improved)}<br>💡 ${esc(r.tip)}<br><button type="button" class="btn sm" id="aiApply" style="margin-top:8px">ใช้ผลนี้</button>`}
$("#aiBtn").onclick=async()=>{const d=$("#desc").value.trim();if(!d){toast("พิมพ์รายละเอียดก่อนให้ AI วิเคราะห์");return}
 const b=$("#aiBox");b.classList.remove("hide");b.textContent="✨ AI กำลังวิเคราะห์...";let r;
 try{const s=await getAI();if(!s)throw 0;
  r=await s.json(`คุณเป็นผู้ช่วยระบบแจ้งซ่อมของมหาวิทยาลัย วิเคราะห์ข้อความแจ้งปัญหา แล้วตอบเป็น JSON เท่านั้น รูปแบบ {"category":เลข 0-5,"urgent":true หรือ false,"improved":"ข้อความแจ้งซ่อมภาษาไทยที่ชัดเจนกระชับ","tip":"คำแนะนำสั้นๆ 1 ประโยคให้ผู้แจ้งระหว่างรอ"} หมวด: 0=เครื่องปรับอากาศ 1=ไฟฟ้า/แสงสว่าง 2=ห้องน้ำ/ประปา 3=ขยะ/ความสะอาด 4=เฟอร์นิเจอร์ 5=พื้น/ทางเดิน ข้อความ: "${d}"`);
  if(!r||!CATS[r.category])throw 0;r.src="Claude AI"}
 catch(e){r=localAI(d);r.src="AI ในเครื่อง (ออฟไลน์)"}
 showAI(r)};
$("#aiBox").onclick=e=>{if(e.target.id=="aiApply"&&aiRes){selCat=aiRes.category;aiPri=!!aiRes.urgent;keepForm();dup();$("#desc").value=aiRes.improved;toast("ใช้ผลวิเคราะห์ของ AI แล้ว")}};
$("#aiSum").onclick=async()=>{const o=$("#aiOut");o.classList.remove("hide");o.textContent="✨ AI กำลังสรุป...";
 const cnt=n=>T.filter(t=>t.st==n).length,by=k=>{const m={};T.forEach(t=>{const n=k(t);m[n]=(m[n]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])};
 const cats=by(t=>CATS[t.cat][1]),blds=by(t=>t.b),old=T.filter(t=>t.st<3).sort((a,b)=>a.t-b.t)[0];
 const data={total:T.length,waiting:cnt(0)+cnt(1),inProgress:cnt(2),done:cnt(3),urgentOpen:T.filter(t=>t.pri&&t.st<3).length,topCategories:cats.slice(0,3),topAreas:blds.slice(0,3),oldestOpen:old?`${CATS[old.cat][1]} ${loc(old)} (${ago(old.t)})`:"none"};
 const local=`📋 ทั้งหมด ${data.total} เรื่อง รอ ${data.waiting} · กำลังทำ ${data.inProgress} · เสร็จ ${data.done}\n🔝 พบมากสุด: ${cats[0]?cats[0][0]+" ("+cats[0][1]+" เรื่อง)":"-"}\n📍 พื้นที่ที่พบมากสุด: ${blds[0]?blds[0][0]:"-"}\n⏳ ค้างนานสุด: ${data.oldestOpen}\n💡 แนะนำ: จัดคิวเรื่องที่ค้างนานและเรื่องด่วนก่อน และตรวจพื้นที่ที่พบปัญหาซ้ำ ๆ`;
 try{const s=await getAI();if(!s)throw 0;const r=await s(`คุณเป็นผู้ช่วยวิเคราะห์ระบบแจ้งซ่อมของมหาวิทยาลัย สรุปข้อมูลนี้เป็นภาษาไทยไม่เกิน 6 บรรทัด ขึ้นต้นแต่ละบรรทัดด้วยอีโมจิ ปิดท้ายด้วยข้อเสนอแนะ 2 ข้อ ไม่ใช้ markdown\n`+JSON.stringify(data));o.textContent=(r.text||local).trim()+"\n\n— สรุปโดย Claude AI"}
 catch(e){o.textContent=local+"\n\n— สรุปโดย AI ในเครื่อง (ออฟไลน์)"}};
// ===== Admin switch =====
function syncSeg(){document.querySelectorAll("#roleSeg button").forEach(b=>b.classList.toggle("on",b.dataset.r==role))}
function setRole(r){if(r=="staff"&&!adm){$("#am").classList.remove("hide");$("#amu").focus();return}role=r;tab=r=="staff"?"dash":"report";tabs();window.scrollTo(0,0)}
$("#roleSeg").onclick=e=>{const r=e.target.dataset.r;if(r)setRole(r)};
async function amLogin(){const a=ACC[$("#amu").value.trim().toLowerCase()];
 if(a&&a.role=="staff"&&await staffOK($("#amp").value)){adm=true;$("#am").classList.add("hide");$("#amp").value="";$("#amerr").textContent="";setRole("staff");refresh();toast("เข้าสู่ระบบแอดมินแล้ว")}
 else $("#amerr").textContent="ชื่อผู้ใช้หรือรหัสผ่านแอดมินไม่ถูกต้อง"}
$("#amb").onclick=amLogin;$("#amp").onkeydown=e=>{if(e.key=="Enter")amLogin()};$("#amx").onclick=()=>$("#am").classList.add("hide");
if(SB()){T=[];setInterval(()=>{if(!document.hidden)refresh()},15000)}
initForm();initFilters();renderBell();tabs();
