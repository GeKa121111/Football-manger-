(() => {
const initial = {
 day: 1, month: 7, year: 2026, cash: 18500000, reputation: 42, morale: 76, tactic: "4-2-3-1",
 played: 0, wins: 0, draws: 0, losses: 0, points: 0, lastResult: null,
 squad: [
  ["Omar Hassan","GK",72,25,18000],["Karim Adel","RB",67,23,9000],["Youssef Nabil","CB",70,27,13000],["Hany Mostafa","CB",69,26,11000],["Ziad Samir","LB",66,21,7500],
  ["Mahmoud Fathy","DM",73,28,19000],["Ali Tarek","CM",71,24,15000],["Mina Ashraf","AM",74,22,21000],["Hossam Reda","RW",70,23,16000],["Seif Emad","LW",72,25,18000],["Adam Khaled","ST",75,26,23000],
  ["Nour Ibrahim","GK",61,19,2500],["Bassem Wael","CB",63,20,3500],["Mostafa Ehab","CM",65,20,5000],["Fares Ahmed","ST",64,19,4500]
 ].map((p,i)=>({id:i+1,name:p[0],pos:p[1],ovr:p[2],age:p[3],wage:p[4],fitness:92,form:6.8,starter:i<11})),
 transferTargets:[
  {name:"Tamer Farouk",pos:"RW",ovr:71,age:22,fee:4200000,wage:9000},
  {name:"Peter Nasser",pos:"CB",ovr:70,age:24,fee:3500000,wage:8000},
  {name:"Khaled Mostafa",pos:"ST",ovr:73,age:25,fee:6000000,wage:13000}
 ],
 log:["بدأت فترة الإعداد للموسم الجديد. راجع الفريق وحدد أولوياتك."]
};
let state;
try { state = JSON.parse(localStorage.getItem("touchline-save")) || structuredClone(initial); } catch { state = structuredClone(initial); }
const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat("ar-EG",{style:"currency",currency:"EGP",maximumFractionDigits:0}).format(n);
const save = () => localStorage.setItem("touchline-save",JSON.stringify(state));
const dateText = () => new Date(state.year,state.month-1,state.day).toLocaleDateString("ar-EG",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const upcoming = () => ["Alexandria United","Delta Sporting","Canal City","Giza Stars","Port Said FC","Mansoura Athletic"][(state.played)%6];
function stat(label,value,sub,cls=""){return `<div class="stat"><div class="label">${label}</div><strong class="${cls}">${value}</strong><div class="muted">${sub}</div></div>`}
function panel(title,body,tag=""){return `<section class="panel"><div class="panel-head"><h2>${title}</h2>${tag?`<span class="tag">${tag}</span>`:""}</div>${body}</section>`}
function table(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`}
function overview(){
 const wage=state.squad.reduce((a,p)=>a+p.wage,0);
 const next=upcoming();
 const rows=state.squad.slice(0,5).map((p,i)=>`<tr><td>${i+1}</td><td><b>${p.name}</b></td><td>${p.pos}</td><td class="rating">${p.ovr}</td><td>${p.age}</td><td>${p.fitness}%</td></tr>`).join("");
 return `<div class="grid">${stat("رصيد النادي",money(state.cash),"الميزانية المتاحة",state.cash<0?"negative":"positive")}${stat("مركز الدوري",state.played?Math.max(1,12-Math.floor(state.points/4)):"—",`${state.points} نقطة • ${state.played} مباراة`)}${stat("معنويات الفريق",state.morale+"%","روح الفريق",state.morale>65?"positive":"")}${stat("فاتورة الرواتب",money(wage*4),"تقدير شهري")}</div>
 <div class="layout-two">${panel("المباراة القادمة",`<div class="match-card"><div class="team"><span class="emoji">🦅</span><b>Cairo Eagles</b></div><div class="score">VS<small>بعد ${state.day%3+1} أيام</small></div><div class="team"><span class="emoji">🛡️</span><b>${next}</b></div></div><div class="action-row" style="margin-top:12px"><div><b>خطة المباراة</b><small>${state.tactic} • جاهزية الفريق ${Math.round(state.squad.reduce((a,p)=>a+p.fitness,0)/state.squad.length)}%</small></div><button class="secondary" data-go="tactics">تعديل التكتيك</button></div>`,"المباراة التالية")}
 ${panel("إدارة سريعة",`<div class="action-list"><div class="action-row"><div><b>تدريب خفيف</b><small>يرفع اللياقة والمعنويات</small></div><button class="secondary" data-action="train">بدء التدريب</button></div><div class="action-row"><div><b>اجتماع الفريق</b><small>تحسين الروح المعنوية</small></div><button class="secondary" data-action="teamtalk">عقد اجتماع</button></div><div class="action-row"><div><b>محاكاة المباراة</b><small>العب المباراة التالية</small></div><button class="primary" data-action="match">بدء المباراة</button></div></div>`,"مركز القرار")}</div>
 ${panel("الفريق الأول",table(["#","اللاعب","المركز","التقييم","العمر","اللياقة"],rows),`${state.squad.length} لاعب`)}`;
}
function squadPage(){
 const rows=state.squad.map((p,i)=>`<tr><td>${i+1}</td><td><b>${p.name}</b></td><td>${p.pos}</td><td class="rating">${p.ovr}</td><td>${p.age}</td><td>${p.form.toFixed(1)}</td><td>${p.fitness}%</td><td><button class="secondary" data-player="${p.id}">${p.starter?"أساسي":"احتياطي"}</button></td></tr>`).join("");
 return `${panel("قائمة الفريق",table(["#","اللاعب","المركز","OVR","العمر","التقييم","اللياقة","الحالة"],rows),`${state.squad.filter(p=>p.starter).length} أساسي`)}<p class="muted">اضغط على حالة اللاعب لتبديل الأساسي والاحتياطي. حافظ على توازن المراكز واللياقة قبل كل مباراة.</p>`;
}
function fixturesPage(){
 const results=state.log.filter(x=>x.includes("المباراة:")).map(x=>`<div class="action-row"><b>${x}</b><span class="tag">انتهت</span></div>`).join("");
 return `${panel("جدول المباريات",`<div class="action-row"><div><b>المباراة ${state.played+1}: Cairo Eagles × ${upcoming()}</b><small>الدوري الممتاز • ملعب النادي</small></div><button class="primary" data-action="match">العب المباراة</button></div><div class="action-list" style="margin-top:12px">${results||'<div class="empty">لسه مفيش مباريات اتلعبت. ابدأ أول مباراة من هنا.</div>'}</div>`,"الموسم 2026/27")}${panel("سجل الإدارة",`<div class="action-list">${state.log.slice(-6).reverse().map(x=>`<div class="action-row"><b>${x}</b></div>`).join("")}</div>`) }`;
}
function tacticsPage(){
 const options=["4-2-3-1","4-3-3","4-4-2","3-5-2","5-3-2"];
 return `${panel("لوحة التكتيك",`<div class="notice">اختيار الخطة يؤثر على احتمالات الفوز في المحاكاة. الخطة الأنسب تعتمد على قوة الفريق وتوازن المراكز.</div><div class="tabs">${options.map(x=>`<button class="tab ${state.tactic===x?"active":""}" data-tactic="${x}">${x}</button>`).join("")}</div><div class="layout-two"><div><h2>أسلوب اللعب</h2><div class="action-list" style="margin-top:12px"><div class="action-row"><div><b>استحواذ وبناء هادئ</b><small>تحكم أكبر في إيقاع المباراة</small></div><span class="tag">متوازن</span></div><div class="action-row"><div><b>ضغط عالٍ</b><small>فرص أكثر مع استهلاك لياقة أعلى</small></div><button class="secondary" data-style="press">اختيار</button></div><div class="action-row"><div><b>هجمات مرتدة</b><small>مناسب أمام الخصم الأقوى</small></div><button class="secondary" data-style="counter">اختيار</button></div></div></div><div class="match-card" style="min-height:220px;flex-direction:column"><div class="tag">التشكيل الحالي</div><b>${state.tactic}</b><div>🧤 GK</div><div>🛡️ RB · CB · CB · LB</div><div>⚙️ DM · CM</div><div>⚡ RW · AM · LW</div><div>🎯 ST</div></div></div>`,"الإعدادات")}`;
}
function transfersPage(){
 const rows=state.transferTargets.map((p,i)=>`<tr><td><b>${p.name}</b></td><td>${p.pos}</td><td class="rating">${p.ovr}</td><td>${p.age}</td><td>${money(p.fee)}</td><td><button class="secondary" data-sign="${i}">تقديم عرض</button></td></tr>`).join("");
 return `${panel("سوق الانتقالات",`<div class="notice">أي صفقة تخصم رسوم الانتقال من الميزانية وتضيف اللاعب للفريق. راجع الرواتب قبل التعاقد.</div>${table(["اللاعب","المركز","OVR","العمر","قيمة الصفقة","الإجراء"],rows)}`,"أهداف مقترحة")}${panel("إرشادات السوق","<p class='muted'>ابدأ بتغطية المراكز الضعيفة. التعاقدات الكبيرة قد تحسن الفريق لكنها تضغط على ميزانية الرواتب.</p>")}`;
}
function financesPage(){
 const wages=state.squad.reduce((a,p)=>a+p.wage,0);
 return `<div class="grid">${stat("رصيد النادي",money(state.cash),"الرصيد الحالي")}${stat("رواتب أسبوعية",money(wages),"كل الفريق")}${stat("رواتب شهرية تقريبية",money(wages*4),"تقدير")}${stat("دخل آخر مباراة",state.played?money(650000):money(0),"تذاكر ورعاية")}</div>${panel("الميزانية",`<div class="action-row"><div><b>ميزانية الانتقالات</b><small>الأموال المتاحة للتعاقدات</small></div><strong class="positive">${money(state.cash)}</strong></div><div class="action-row" style="margin-top:10px"><div><b>الرواتب الأسبوعية</b><small>التزام الفريق الحالي</small></div><strong>${money(wages)}</strong></div><div class="progress"><span style="width:${Math.min(100,wages/120000*100)}%"></span></div><p class="muted">المؤشر يوضح نسبة فاتورة الرواتب من سقف تقديري قدره 120 ألف جنيه أسبوعيًا.</p>`,"التقارير المالية")}`;
}
const pages={overview:["مركز القيادة",overview],squad:["الفريق الأول",squadPage],fixtures:["المباريات والنتائج",fixturesPage],tactics:["التكتيك والتشكيل",tacticsPage],transfers:["الانتقالات",transfersPage],finances:["مالية النادي",financesPage]};
let page="overview";
function render(){ $("#dateLabel").textContent=dateText();$("#pageTitle").textContent=pages[page][0];$("#content").innerHTML=pages[page][1]();document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===page));save();}
function log(msg){state.log.push(msg);if(state.log.length>60)state.log=state.log.slice(-60);}
function action(type){
 if(type==="train"){state.squad.forEach(p=>p.fitness=Math.min(100,p.fitness+5));state.morale=Math.min(100,state.morale+2);log("اكتملت حصة تدريب خفيف: تحسنت اللياقة والمعنويات.");}
 if(type==="teamtalk"){state.morale=Math.min(100,state.morale+7);log("اجتماع الفريق نجح وارتفعت المعنويات.");}
 if(type==="match"){
  const starters=state.squad.filter(p=>p.starter);const avg=starters.reduce((a,p)=>a+p.ovr,0)/Math.max(1,starters.length);const fit=starters.reduce((a,p)=>a+p.fitness,0)/Math.max(1,starters.length);
  const tacticBonus=state.tactic==="4-2-3-1"?2:state.tactic==="4-3-3"?3:0;
  const strength=avg+(fit-80)*.08+state.morale*.025+tacticBonus;
  const home=Math.max(0,Math.round(Math.random()*3+(strength-68)/9));const away=Math.max(0,Math.round(Math.random()*2+(Math.random()-.65)));
  state.played++;state.cash+=650000;state.morale=Math.max(35,Math.min(100,state.morale+(home>away?5:home===away?1:-6)));
  if(home>away){state.wins++;state.points+=3;log(`المباراة: فوز على ${upcoming()} بنتيجة ${home}-${away}.`);}else if(home===away){state.draws++;state.points++;log(`المباراة: تعادل مع ${upcoming()} بنتيجة ${home}-${away}.`);}else{state.losses++;log(`المباراة: خسارة أمام ${upcoming()} بنتيجة ${home}-${away}.`);}
  starters.forEach(p=>p.fitness=Math.max(45,p.fitness-12-Math.floor(Math.random()*8)));state.squad.filter(p=>!p.starter).forEach(p=>p.fitness=Math.min(100,p.fitness+3));
  alert(`انتهت المباراة!\nCairo Eagles ${home} - ${away} ${upcoming()}\n${home>away?"مبروك الفوز!":home===away?"نقطة من التعادل.":"هارد لك، راجع التكتيك واللياقة."}`);
 }
 render();
}
document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-page]");if(nav){page=nav.dataset.page;render();return;}
 const go=e.target.closest("[data-go]");if(go){page=go.dataset.go;render();return;}
 const act=e.target.closest("[data-action]");if(act){action(act.dataset.action);return;}
 const player=e.target.closest("[data-player]");if(player){const p=state.squad.find(x=>x.id===Number(player.dataset.player));p.starter=!p.starter;render();return;}
 const tactic=e.target.closest("[data-tactic]");if(tactic){state.tactic=tactic.dataset.tactic;render();return;}
 const style=e.target.closest("[data-style]");if(style){state.playStyle=style.dataset.style;log("تم تغيير أسلوب اللعب إلى "+(style.dataset.style==="press"?"الضغط العالي":"الهجمات المرتدة")+".");render();return;}
 const sign=e.target.closest("[data-sign]");if(sign){const p=state.transferTargets[Number(sign.dataset.sign)];if(state.cash<p.fee){alert("الميزانية لا تكفي لإتمام الصفقة.");return;}if(state.squad.some(x=>x.name===p.name)){alert("اللاعب موجود بالفعل في الفريق.");return;}state.cash-=p.fee;state.squad.push({...p,id:Math.max(...state.squad.map(x=>x.id))+1,wage:p.wage,fitness:95,form:6.7,starter:false});state.transferTargets.splice(Number(sign.dataset.sign),1);log("تم التعاقد مع "+p.name+" مقابل "+money(p.fee)+".");render();return;}
});
$("#nextDay").addEventListener("click",()=>{state.day++;if(state.day>30){state.day=1;state.month++;if(state.month>12){state.month=1;state.year++;}}state.squad.forEach(p=>p.fitness=Math.min(100,p.fitness+2));if(state.day%7===0){const wages=state.squad.reduce((a,p)=>a+p.wage,0);state.cash-=wages;log("تم خصم الرواتب الأسبوعية: "+money(wages)+".");}log("يوم جديد في النادي. راجع التدريب والاستعداد للمباراة.");render();});
render();
})();