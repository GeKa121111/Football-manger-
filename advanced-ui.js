(function () {
  "use strict";
  const E = window.FM_ENGINE;
  const DATA = window.FM_WORLD_DATA;
  if (!E || !DATA) { console.error("Advanced mode dependencies are missing."); return; }
  const SAVE_KEY = "touchline-advanced-save-v1";

  const LANGUAGE_KEY = "touchline-ui-language-v1";
  let preferredLanguage = "ar";
  try { preferredLanguage = localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar"; } catch (e) {}
  const AR_UI = {"ADVANCED FOOTBALL DIRECTOR":"مدير كرة القدم المتقدم","FOOTBALL DIRECTOR":"إدارة كرة القدم","Manager's Hub":"مركز الإدارة","Home / Hub":"الرئيسية / مركز الإدارة","First Team Squad":"الفريق الأول","Squad":"الفريق","Tactics board":"لوحة التكتيك","Tactics & Match Plan":"التكتيك وخطة المباراة","Training & dynamics":"التدريب وديناميكية الفريق","Training & Team Dynamics":"التدريب وديناميكية الفريق","Scouting agency":"قسم الكشافة","Player Search & Scouting":"البحث عن اللاعبين والكشافة","Transfers & contracts":"الانتقالات والعقود","Transfer Centre":"مركز الانتقالات","Board, finances & staff":"الإدارة والمالية والموظفون","Club Operations":"إدارة النادي","Competitions & calendar":"البطولات والجدول","Competitions & Calendar":"البطولات والجدول","Database & settings":"قاعدة البيانات والإعدادات","World Database & Settings":"قاعدة بيانات العالم والإعدادات","Match Day":"يوم المباراة","CLUB MANAGEMENT":"إدارة النادي","AUTO-SAVE ON":"الحفظ التلقائي مفعّل","Save career now":"احفظ المسيرة الآن","Save career":"حفظ المسيرة","Export save JSON":"تصدير ملف الحفظ JSON","Import save / player database":"استيراد المسيرة / قاعدة اللاعبين","Start a new career":"بدء مسيرة جديدة","Continue":"متابعة","Save career files":"ملفات الحفظ والمسيرة","Game settings":"إعدادات اللعبة","Currency":"العملة","Wage display":"عرض الرواتب","Interface language":"لغة الواجهة","Arabic direction · RTL":"العربية · من اليمين لليسار","English · LTR":"الإنجليزية · من اليسار لليمين","Match speed":"سرعة المباراة","Real-world data importer":"استيراد بيانات اللاعبين الحقيقية","Important data-source limitation":"تنبيه مهم بخصوص مصادر البيانات","One competition code":"رمز بطولة واحدة","Bulk competition codes":"رموز البطولات للاستيراد الجماعي","Season start year":"سنة بداية الموسم","football-data.org token":"رمز الوصول إلى football-data.org","Enter your own API token":"أدخل رمز API الخاص بك","Fetch one competition":"استيراد بطولة واحدة","Apply bundled real-player data to this career":"تطبيق بيانات اللاعبين المرفقة على المسيرة","Import current Premier League players (free)":"استيراد لاعبي الدوري الإنجليزي الحاليين (مجانًا)","Import real squads from all codes":"استيراد القوائم الحقيقية لكل البطولات","Database report":"تقرير قاعدة البيانات","World clubs":"أندية العالم","World players":"لاعبو العالم","Seed/import profiles":"ملفات اللاعبين الأولية والمستوردة","Save data is stored locally in this browser, with an IndexedDB backup where supported. Export JSON before clearing browser data.":"يتم حفظ بياناتك محليًا في المتصفح، مع نسخة احتياطية عبر IndexedDB عند توفرها. صدّر ملف JSON قبل مسح بيانات المتصفح.","The bundled seed is not a verified live 2026/27 squad feed.":"قوائم اللاعبين المرفقة ليست مصدرًا مباشرًا موثّقًا لموسم 2026/27.","This importer loads actual squad names, positions, shirt numbers, nationality, date of birth, contract expiry and market value where supplied.":"تستورد الأداة أسماء اللاعبين ومراكزهم وأرقام القمصان وجنسياتهم وتواريخ الميلاد ونهاية العقود والقيم السوقية عند توفرها.","Weekly wages and detailed 1–20 attributes may not be provided by the source, so they remain estimates/unknown.":"قد لا يوفر المصدر الرواتب الأسبوعية والسمات التفصيلية من 1 إلى 20، لذا تظل تقديرية أو غير معروفة.","One competition":"بطولة واحدة","Bulk import runs sequentially to respect free-plan rate limits; 9 codes can take about one minute.":"يتم الاستيراد الجماعي بالتتابع احترامًا لحدود الخطة المجانية؛ وقد تستغرق 9 رموز نحو دقيقة.","Available competitions and squad fields depend on your API plan.":"تعتمد البطولات وحقول قوائم اللاعبين المتاحة على خطة واجهة API لديك.","The bundled list is not a live roster source.":"القائمة المرفقة ليست مصدرًا مباشرًا لقوائم الأندية.","Choose JSON file":"اختيار ملف JSON","Import JSON data / save file":"استيراد بيانات JSON / ملف حفظ","Accepted data: { clubs:[...], players:[...] } or the native Touchline save JSON format.":"البيانات المقبولة: { clubs:[...], players:[...] } أو تنسيق حفظ Touchline بصيغة JSON.","Home":"المضيف","Overview":"نظرة عامة","First Team":"الفريق الأول","Team":"الفريق","Tactics":"التكتيك","Training":"التدريب","Scouting":"الكشافة","Transfers":"الانتقالات","Finances":"المالية","Competitions":"البطولات","Calendar":"الجدول","Settings":"الإعدادات","Search":"بحث","Search players":"ابحث عن لاعبين","Player search":"البحث عن اللاعبين","Filter players":"تصفية اللاعبين","All positions":"كل المراكز","Goalkeeper":"حارس المرمى","Defender":"مدافع","Midfielder":"لاعب وسط","Forward":"مهاجم","Age":"العمر","Position":"المركز","Nationality":"الجنسية","Value":"القيمة","Wage":"الراتب","Contract":"العقد","Contract expires":"انتهاء العقد","Overall":"التقييم العام","Potential":"الإمكانات","Fitness":"اللياقة","M morale":"معنويات الفريق","Morale":"المعنويات","Sharpness":"الجاهزية الفنية","Appearances":"المشاركات","Goals":"الأهداف","Assists":"التمريرات الحاسمة","Yellow cards":"البطاقات الصفراء","Red cards":"البطاقات الحمراء","Injuries":"الإصابات","Unavailable":"غير متاح","Not available":"غير متاح","Free Agent":"لاعب حر","Retired":"معتزل","Unknown Club":"نادي غير معروف","Generated slot":"لاعب مولّد","Generated slots":"لاعبون مولّدون","Unknown source":"مصدر غير معروف","Real · WC 2026 squad":"حقيقي · قائمة كأس العالم 2026","Real · current PL data":"حقيقي · بيانات الدوري الإنجليزي الحالية","Imported / seed":"مستورد / بيانات أولية","Save now":"حفظ الآن","Save":"حفظ","Export":"تصدير","Import":"استيراد","Cancel":"إلغاء","Close":"إغلاق","Back":"رجوع","Next":"التالي","Previous":"السابق","Confirm":"تأكيد","Delete":"حذف","Apply":"تطبيق","Reset":"إعادة ضبط","Edit":"تعديل","View":"عرض","Details":"التفاصيل","More":"المزيد","None":"لا يوجد","All":"الكل","Select":"اختيار","Select club":"اختيار النادي","Choose club":"اختار النادي","Club":"النادي","Manager":"المدير الفني","Manager name":"اسم المدير الفني","Reputation":"السمعة","Training focus":"تركيز التدريب","Formation":"خطة اللعب","Mentality":"العقلية","Passing":"التمرير","Tempo":"الإيقاع","Width":"عرض الملعب","Pressing":"الضغط","Defensive line":"خط الدفاع","Tackling":"التدخلات","Offside trap":"مصيدة التسلل","Starting XI":"التشكيل الأساسي","Bench":"دكة البدلاء","Substitutions":"التبديلات","Captain":"القائد","Vice-captain":"نائب القائد","Role":"الدور","Team instructions":"تعليمات الفريق","Match plan":"خطة المباراة","Prepare for match":"الاستعداد للمباراة","View match report":"عرض تقرير المباراة","No upcoming league fixture found.":"لم يتم العثور على مباراة دوري قادمة.","Match report":"تقرير المباراة","Match statistics":"إحصائيات المباراة","Possession":"الاستحواذ","Shots":"التسديدات","Shots on target":"التسديدات على المرمى","Pass accuracy":"دقة التمرير","Fouls":"الأخطاء","Offside":"التسلل","Corner kicks":"الركلات الركنية","Half-time":"الشوط الأول","Full-time":"نهاية المباراة","Match day":"يوم المباراة","Scheduled":"مجدولة","League table":"جدول الدوري","Standings":"الترتيب","Played":"لعب","Won":"فاز","Drawn":"تعادل","Lost":"خسر","Goal difference":"فارق الأهداف","Points":"النقاط","Top scorers":"الهدافون","Fixtures":"المباريات","Results":"النتائج","Upcoming matches":"المباريات القادمة","Transfer market":"سوق الانتقالات","Transfer budget":"ميزانية الانتقالات","Wage budget":"ميزانية الرواتب","Make offer":"تقديم عرض","Submit offer":"إرسال العرض","Transfer offer":"عرض انتقال","Contract renewal":"تجديد العقد","Negotiate":"تفاوض","Scout player":"كشاف اللاعب","Scouting assignment":"مهمة الكشافة","Search players and assign scouts to identify transfer targets.":"ابحث عن اللاعبين وعيّن الكشافين لاكتشاف أهداف الانتقالات.","Training sessions":"الحصص التدريبية","Individual training":"التدريب الفردي","Team training":"تدريب الفريق","Player development":"تطوير اللاعبين","Team dynamics":"ديناميكية الفريق","Team morale":"معنويات الفريق","Financial overview":"نظرة عامة مالية","Club finances":"مالية النادي","Income":"الإيرادات","Expenses":"المصروفات","Balance":"الرصيد","Weekly income":"الإيرادات الأسبوعية","Weekly expenses":"المصروفات الأسبوعية","Sponsorship":"الرعاية","Board expectations":"توقعات مجلس الإدارة","Staff":"الموظفون","Board":"مجلس الإدارة","Club reputation":"سمعة النادي","Domestic cup":"الكأس المحلية","Continental competitions":"البطولات القارية","Competition":"البطولة","Database size":"حجم قاعدة البيانات","Small · faster loading":"صغيرة · تحميل أسرع","Medium · balanced depth":"متوسطة · توازن في التفاصيل","Large · deeper world":"كبيرة · عالم أوسع","Start career":"ابدأ المسيرة","Start match":"بدء المباراة","Continue to next day":"الانتقال لليوم التالي","Advance day":"تقدّم يومًا","Advance to next match":"التقدم إلى المباراة التالية","News & inbox":"الأخبار والبريد","Inbox":"صندوق الوارد","Read message":"قراءة الرسالة","Mark all as read":"تحديد الكل كمقروء","No messages":"لا توجد رسائل","Loading...":"جارٍ التحميل...","Loading":"جارٍ التحميل","Pending":"قيد الانتظار","Completed":"مكتمل","Success":"تم بنجاح","Warning":"تحذير","Error":"خطأ","Information":"معلومات","Unknown":"غير معروف","Available":"متاح","Yes":"نعم","No":"لا","Weekly":"أسبوعي","Yearly":"سنوي","Daily":"يومي","Monthly":"شهري","Details and history":"التفاصيل والسجل","Club overview":"نظرة عامة على النادي","Squad overview":"نظرة عامة على الفريق","Your next fixture":"مباراتك القادمة","Next fixture":"المباراة القادمة","Season objectives":"أهداف الموسم","Season progress":"تقدم الموسم","League position":"مركز الدوري","Current form":"النتائج الأخيرة","Home team":"الفريق المضيف","Away team":"الفريق الضيف","Goals scored":"الأهداف المسجلة","Goals conceded":"الأهداف المستقبلة","Manager's profile":"ملف المدير الفني","Career history":"تاريخ المسيرة","Career summary":"ملخص المسيرة","Saved successfully.":"تم الحفظ بنجاح.","Career save imported.":"تم استيراد ملف المسيرة.","Import failed:":"فشل الاستيراد:","Import complete:":"اكتمل الاستيراد:","Starting XI updated.":"تم تحديث التشكيل الأساسي.","Could not read this JSON file.":"تعذرت قراءة ملف JSON.","Unable to create career.":"تعذر إنشاء المسيرة.","Save data is stored locally in this browser":"يتم تخزين بيانات الحفظ محليًا في هذا المتصفح","Tactics & XI":"التكتيك والتشكيل","All caught up. Reports and club news will appear here.":"لا توجد تحديثات جديدة. ستظهر التقارير وأخبار النادي هنا.","Your first result will be recorded here.":"سيتم تسجيل أول نتيجة لك هنا.","Full table & results →":"جدول الدوري والنتائج كاملة ←","Recent club activity":"أحدث أنشطة النادي","Quick actions":"إجراءات سريعة","Run training":"بدء التدريب","Review budgets":"مراجعة الميزانيات","Export career":"تصدير المسيرة","World database status":"حالة قاعدة بيانات العالم","Review data source →":"مراجعة مصدر البيانات ←","Seeded sample players":"لاعبون من قاعدة البيانات الأولية","estimated transfer budget":"ميزانية انتقالات تقديرية","Suspended":"موقوف","match(es)":"مباراة/مباريات","Sort by rating":"الترتيب حسب التقييم","Sort by age":"الترتيب حسب العمر","Sort by value":"الترتيب حسب القيمة","Squad numbers":"أرقام قمصان الفريق","First Team · Reserves · Academy slots are clearly labelled":"يتم توضيح لاعبي الفريق الأول والاحتياطي والأكاديمية","players registered":"لاعب مسجّل","25-man list":"قائمة الـ25 لاعبًا","Return to Match":"العودة إلى المباراة","Formation & mentality":"الخطة والعقلية","Team mentality":"عقلية الفريق","Pressing intensity":"قوة الضغط","Passing style":"أسلوب التمرير","Team style":"أسلوب الفريق","Final third":"الثلث الهجومي","Use the offside trap":"استخدام مصيدة التسلل","Interactive tactics board":"لوحة تكتيك تفاعلية","DRAG & DROP":"اسحب وأفلت","Auto select":"اختيار تلقائي","Training schedule":"جدول التدريب","THIS SESSION":"الحصة الحالية","Attributes, fitness and development update based on the session.":"تتغير السمات واللياقة والتطور وفقًا للحصة التدريبية.","Run training session":"تنفيذ الحصة التدريبية","INDIVIDUAL + TEAM":"فردي + جماعي","Mentoring groups":"مجموعات التوجيه","Senior mentor":"اللاعب الموجّه","Youth player":"لاعب شاب","Create mentoring group":"إنشاء مجموعة توجيه","Dressing room":"غرفة الملابس","/100 harmony":"/100 انسجام","Praise the squad":"الإشادة بالفريق","Calm down":"تهدئة الأجواء","No training sessions recorded yet.":"لم يتم تسجيل أي حصص تدريبية بعد.","Maximum age":"أقصى عمر","Maximum value":"أقصى قيمة","Minimum rating (1–20)":"أقل تقييم (1–20)","Apply filters":"تطبيق عوامل التصفية","SCOUTING FILTERS":"عوامل تصفية الكشافة","Scout assignments":"مهام الكشافة","Search region":"منطقة البحث","South America":"أمريكا الجنوبية","Youth wonderkids":"المواهب الشابة الواعدة","First-team players":"لاعبو الفريق الأول","Expiring contracts":"عقود قاربت على الانتهاء","Affordable signings":"صفقات مناسبة للميزانية","Assign available scout":"تعيين كشاف متاح","Scouting results":"نتائج الكشافة","MATCHED":"نتائج مطابقة","TRANSFER WINDOW":"فترة الانتقالات","Available players":"اللاعبون المتاحون","Wage/wk":"الراتب/أسبوع","SHORTLIST":"القائمة المختصرة","Contract and budget notes":"ملاحظات العقود والميزانية","Advanced player search →":"بحث متقدم عن اللاعبين ←","My squad contracts":"عقود لاعبي فريقي","No active installment deals.":"لا توجد صفقات نشطة بنظام الأقساط.","Budget allocation":"توزيع الميزانية","Wage budget used":"المستخدم من ميزانية الرواتب","Move funds to wage budget":"تحويل أموال إلى ميزانية الرواتب","Apply budget shift":"تطبيق تحويل الميزانية","Season income":"دخل الموسم","Season costs":"تكاليف الموسم","Estimated net":"صافي تقديري","FINANCE CONTROL":"التحكم المالي","Board requests":"طلبات مجلس الإدارة","Request more transfer funds":"طلب زيادة ميزانية الانتقالات","Increase wage budget":"زيادة ميزانية الرواتب","Upgrade training facilities":"تطوير مرافق التدريب","Upgrade youth academy":"تطوير أكاديمية الناشئين","BOARDROOM":"مجلس الإدارة","Board confidence":"ثقة مجلس الإدارة","Board expectation:":"توقع مجلس الإدارة:","Avoid a sustained wage deficit.":"تجنّب استمرار العجز في الرواتب.","Staff role":"دور الموظف","Assistant Manager":"مساعد المدير الفني","Hire staff member":"تعيين موظف","Cup winner":"بطل الكأس","Simulate":"محاكاة","round":"جولة","No domestic cup created.":"لم يتم إنشاء بطولة كأس محلية.","Simulate next continental round":"محاكاة الجولة القارية التالية","Continental competition needs a large database.":"تحتاج البطولة القارية إلى قاعدة بيانات كبيرة.","Fixture calendar":"تقويم المباريات","World Cup real-player snapshot":"لقطة قوائم لاعبي كأس العالم","LOCAL-FIRST":"حفظ محلي أولًا","API + JSON":"واجهة API وملفات JSON","PREFERENCES":"التفضيلات","CURRENT":"الحالي","LEAGUE":"الدوري","MATCH CENTRE":"مركز المباراة","LIVE":"مباشر","INDIVIDUAL TRAINING":"تدريب فردي","TEAM TRAINING":"تدريب جماعي","Full table":"جدول كامل","View report":"عرض التقرير","Open inbox":"فتح صندوق الوارد","Mark as read":"تحديد كمقروء","No active offers":"لا توجد عروض نشطة","Offer rejected":"تم رفض العرض","Offer accepted":"تم قبول العرض","Offer submitted":"تم إرسال العرض","Contract signed":"تم توقيع العقد","Contract expires soon":"العقد سينتهي قريبًا","Insufficient funds":"الأموال غير كافية","Transfer complete":"اكتملت الصفقة","Loan":"إعارة","Permanent transfer":"انتقال نهائي","Loan offer":"عرض إعارة","Transfer fee":"قيمة الانتقال","Monthly instalment":"قسط شهري","Installments":"الأقساط","Add to shortlist":"إضافة للقائمة المختصرة","Remove from shortlist":"إزالة من القائمة المختصرة","Training completed":"اكتمل التدريب","Training cancelled":"تم إلغاء التدريب","Player unavailable":"اللاعب غير متاح","Player is injured":"اللاعب مصاب","Suspension":"الإيقاف","League phase":"مرحلة الدوري","Continental league phase":"مرحلة الدوري القاري","Round":"الجولة","Date":"التاريخ","Away":"الضيف","Central Defender":"قلب دفاع","Ball Playing Defender":"مدافع يجيد بناء اللعب","Libero":"ليبرو","Wing Back":"ظهير جناح","Inverted Wing Back":"ظهير مقلوب","Full Back":"ظهير","Anchor Man":"ارتكاز دفاعي","Ball Winning Midfielder":"لاعب وسط قاطع للكرات","Deep Lying Playmaker":"صانع ألعاب متأخر","Box-to-Box":"لاعب وسط شامل","Advanced Playmaker":"صانع ألعاب متقدم","Shadow Striker":"مهاجم ظل","Winger":"جناح","Inside Forward":"جناح عكسي","Poacher":"قناص","Target Man":"مهاجم محطة","Pressing Forward":"مهاجم ضاغط","Complete Forward":"مهاجم متكامل","False 9":"مهاجم وهمي"}
  const AR_UI_ENTRIES = Object.entries(AR_UI).sort((a,b)=>b[0].length-a[0].length);
  function translateUiText(value) {
    if (state?.settings?.language !== "ar") return value;
    const original = String(value == null ? "" : value);
    const trimmed = original.trim();
    if (!trimmed) return value;
    const exact = AR_UI_ENTRIES.find(([source]) => source.toLowerCase() === trimmed.toLowerCase());
    if (exact) return original.slice(0, original.indexOf(trimmed)) + exact[1] + original.slice(original.indexOf(trimmed) + trimmed.length);
    let result = original;
    for (const [source, target] of AR_UI_ENTRIES) {
      if (source.length < 8 || !source.includes(" ")) continue;
      const needle = source.toLowerCase();
      let from = 0;
      let position = result.toLowerCase().indexOf(needle, from);
      while (position !== -1) {
        result = result.slice(0, position) + target + result.slice(position + source.length);
        from = position + target.length;
        position = result.toLowerCase().indexOf(needle, from);
      }
    }
    return result;
  }
  function localizeUi(rootNode) {
    if (!rootNode || state?.settings?.language !== "ar") return;
    const visit = node => {
      if (!node) return;
      if (node.nodeType === 3) { node.nodeValue = translateUiText(node.nodeValue); return; }
      if (node.nodeType !== 1) return;
      const tag = String(node.tagName || "").toLowerCase();
      if (tag === "script" || tag === "style") return;
      ["placeholder","title","aria-label"].forEach(attr => {
        if (node.hasAttribute && node.hasAttribute(attr)) node.setAttribute(attr, translateUiText(node.getAttribute(attr)));
      });
      Array.from(node.childNodes || []).forEach(visit);
    };
    visit(rootNode);
  }

  let state = null, view = "overview", modal = null, live = null, animationFrame = null, lastFrame = 0;
  let search = "", marketFilters = {position:"all",age:40,value:300000000,attribute:"pace",minimum:10}, selectedNations = ["England","Egypt"];
  let setup = {mode:"career",challenge:"Relegation survival",managerName:"Alex Manager",managerNationality:"England",reputation:45,badge:"Tactician",primaryNation:"England",databaseSize:"medium",clubId:""};
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const num = v => Number(v||0).toLocaleString("en-GB");
  const money = v => {
    const currency = state?.settings?.currency || "GBP";
    return new Intl.NumberFormat(state?.settings?.language==="ar"?"ar-EG":"en-GB",{style:"currency",currency:currency,maximumFractionDigits:0,notation:Number(v)>999999?"compact":"standard"}).format(Number(v)||0);
  };
  const playerValueLabel = p => !p || !Number(p.value) ? "Not available" : (p.valueEstimated ? "~" : "") + money(p.value);
  const playerWageLabel = p => !p || !Number(p.wage) ? "Not available" : (p.wageEstimated || p.wageKnown !== true ? "~" : "") + money(p.wage);
  const dateLabel = value => new Intl.DateTimeFormat(state?.settings?.language==="ar"?"ar-EG":"en-GB",{weekday:"short",day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(value+"T12:00:00Z"));
  const club = id => state.clubs.find(c=>c.id===id) || {id:"?",name:"Unknown Club",primary:"#577",secondary:"#fff",country:"Unknown",league:"Unknown"};
  const playerClubLabel = p => p&&p.retired?"Retired":p&&p.clubId?club(p.clubId).name:"Free Agent";
  const player = id => state.players.find(p=>p.id===id);
  const myClub = () => club(state.userClubId);
  const mySquad = () => state.players.filter(p=>p.clubId===state.userClubId).sort((a,b)=>b.overall-a.overall);
  const myFixture = () => state.fixtures.find(f=>f.id===state.matchPending) || state.fixtures.find(f=>!f.played&&(f.homeId===state.userClubId||f.awayId===state.userClubId));
  const currentStandings = () => E.recalcStandings(state,state.fixtures);
  const generatedBadge = p => p.youthProspect ? '<span class="fm-tag is-generated">Youth intake · '+Number(p.youthIntakeYear||0)+'</span>' : p.generated ? '<span class="fm-tag is-generated">Generated slot</span>' : p.worldCupSnapshot ? '<span class="fm-tag is-real">Real · WC 2026 squad</span>' : String(p.source||"").includes("Fantasy Premier League") ? '<span class="fm-tag is-real">Real · current PL data</span>' : p.realData ? '<span class="fm-tag is-real">Imported / seed</span>' : '<span class="fm-tag">Unknown source</span>';
  const ratingClass = n => Number(n)>=15?"good":Number(n)>=10?"mid":"low";
  const stars = (n, color) => '<span class="fm-stars" style="--star-color:'+color+'">'+("★".repeat(Math.max(1,Math.min(5,Math.round(Number(n||0)/20*5))))).padEnd(5,"☆")+'</span>';
  function toast(message, kind="info") {
    let box=$("#fm-toast"); if(!box){box=document.createElement("div");box.id="fm-toast";box.className="fm-toast";document.body.appendChild(box);}
    box.className="fm-toast visible "+kind;box.textContent=message;window.setTimeout(()=>box.classList.remove("visible"),2800);
  }
  function save() {
    if(!state)return;
    state.savedAt=new Date().toISOString();
    const payload=JSON.stringify(state);
    try{localStorage.setItem(SAVE_KEY,payload);}catch(err){toast("Local save is full. Export your career file.","warning");}
    try{
      if("indexedDB"in window){
        const req=indexedDB.open("touchline-advanced-db",1);
        req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("careers"))req.result.createObjectStore("careers");};
        req.onsuccess=()=>{try{const tx=req.result.transaction("careers","readwrite");tx.objectStore("careers").put(payload,"active");tx.oncomplete=()=>req.result.close();}catch(e){req.result.close();}};
      }
    }catch(err){ /* LocalStorage remains the fallback. */ }
  }
  function load() {
    try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return null;const s=JSON.parse(raw);if(s&&s.schemaVersion===1&&s.players&&s.clubs&&s.fixtures)return s;}catch(err){console.warn("Advanced career save could not be loaded.",err);}
    return null;
  }
  function addInbox(title,text,kind="info") {
    state.inbox.unshift({id:"msg-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),day:state.day,title:title,text:text,kind:kind,read:false});
    state.inbox=state.inbox.slice(0,100);
  }
  function download(filename,text,type="application/json") {
    const blob=new Blob([text],{type:type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }
  function makeOverlay() {
    let overlay=$("#advanced-root");
    if(!overlay){overlay=document.createElement("div");overlay.id="advanced-root";document.body.appendChild(overlay);}
    return overlay;
  }
  function installLauncher() {
    if($("#open-advanced-manager"))return;
    const host=$(".topbar-right")||$(".topbar");
    if(!host)return;
    const btn=document.createElement("button");btn.id="open-advanced-manager";btn.className="fm-launcher";btn.type="button";btn.textContent="Advanced Career";btn.addEventListener("click",open);
    host.appendChild(btn);
  }
  function open() {
    makeOverlay().classList.add("is-open");
    state=load();
    view="overview";modal=null;
    if(!state){renderSetup();return;}
    repairState();
    if(!state.bundledRealDataImported&&E.mergeBundledRealPlayers){
      try{
        const migration=E.mergeBundledRealPlayers(state);
        if(!migration.alreadyImported){save();toast("Updated this saved career with "+migration.realPlayers+" real World Cup player records.","success");}
      }catch(err){console.warn("Bundled real-player migration skipped:",err);}
    }
    render();
    if(!state.fplImportedAt)runFPLImport(true);
  }
  function close() {
    stopMatch();const root=$("#advanced-root");if(root)root.classList.remove("is-open");
    if(state)save();
  }
  function repairState() {
    state.players=state.players.map(p=>E.normalizePlayer(p,p.clubId));
    
    state.world=state.world||{sourceSeason:DATA.dataSeason,notes:DATA.databaseNotes,clubs:state.clubs,players:state.players};
    state.fixtures=state.fixtures||[];
    state.inbox=state.inbox||[];
    state.tactics=Object.assign(E.defaultTactics(),state.tactics||{});
    state.settings=Object.assign({currency:"GBP",wageDisplay:"weekly",language:preferredLanguage,speed:1,highlightMode:"key"},state.settings||{});
    state.world.clubs=state.clubs;state.world.players=state.players;
  }
  function openNewCareer(skipConfirm) {
    if(!skipConfirm&&load()&&typeof window.confirm==="function"&&!window.confirm("إنشاء مسيرة جديدة هيستبدل المسيرة المتقدمة المحفوظة على الجهاز. هل تريد المتابعة؟"))return false;
    stopMatch();
    state=null;view="overview";modal=null;live=null;
    selectedNations=["England","Egypt"];
    renderSetup();
    return true;
  }
  function renderSetup() {
    const root=makeOverlay();root.classList.add("is-open");
    root.innerHTML='<div class="fm-setup-bg"><div class="fm-setup-shell"><div class="fm-setup-brand"><span class="fm-mark">TM</span><div><b>TOUCHLINE</b><small>ADVANCED FOOTBALL DIRECTOR</small></div><button class="fm-icon-btn" data-action="close">✕</button></div><div class="fm-setup-copy"><span class="fm-eyebrow">بداية مسيرتك</span><h1>اكتب اسمك في تاريخ الكرة.</h1><p>اختار الدولة والدوري والنادي، وحدد شخصيتك كمدير فني قبل بداية الموسم.</p></div><form class="fm-setup-form" id="career-setup"><div class="fm-field"><label for="fm-ui-language">لغة الواجهة</label><select id="fm-ui-language" name="language"><option value="ar">العربية</option><option value="en">English</option></select></div><div class="fm-field full"><label>نوع المسيرة</label><div class="fm-mode-pick"><label><input type="radio" name="mode" value="career" checked><span><b>مسيرة كروية</b><small>تولي إدارة نادٍ</small></span></label><label><input type="radio" name="mode" value="challenge"><span><b>تحديات</b><small>إنقاذ فريق أو إعادة بنائه</small></span></label><label><input type="radio" name="mode" value="myclub"><span><b>نادي من إنشائك</b><small>صمّم ناديك الخاص</small></span></label></div></div><div class="fm-field"><label for="fm-manager-name">اسم المدير الفني</label><input id="fm-manager-name" name="managerName" required maxlength="60" placeholder="اكتب اسمك هنا" value=""></div><div class="fm-field"><label for="fm-reputation">سمعتك عند بداية المسيرة</label><select id="fm-reputation" name="reputation"><option value="25">مدرب غير معروف (25)</option><option value="45" selected>مدرب صاحب خبرة (45)</option><option value="70">مدرب نخبة (70)</option></select></div><div class="fm-field"><label for="fm-badge">شخصيتك التدريبية</label><select id="fm-badge" name="badge"><option value="Tactician">تكتيكي</option><option value="Motivator">محفّز للاعبين</option><option value="Youth Developer">مطوّر للمواهب</option><option value="Fitness Coach">متخصص في اللياقة</option><option value="Disciplinarian">حازم ومنضبط</option></select></div><div class="fm-field"><label for="fm-nation">الدولة والدوري اللي هتدرب فيه</label><select id="fm-nation" name="primaryNation">'+DATA.nations.map(n=>'<option '+(n==="England"?"selected":"")+'>'+esc(n)+'</option>').join("")+'</select></div><div class="fm-field"><label for="fm-size">حجم قاعدة البيانات</label><select id="fm-size" name="databaseSize"><option value="small">صغيرة · تحميل أسرع</option><option value="medium" selected>متوسطة · توازن بين الأداء والعمق</option><option value="large">كبيرة · قاعدة أوسع</option></select></div><div class="fm-field full"><label>الدوريات النشطة · اختار حتى 5 دول</label><div class="fm-nations">'+DATA.nations.map((n,i)=>'<label><input type="checkbox" name="nations" value="'+esc(n)+'" '+(["England","Egypt"].includes(n)?"checked":"")+'><span>'+esc(n)+'</span></label>').join("")+'</div><small class="fm-help">اختيار دول إضافية يوسّع عالم المحاكاة وقد يزيد وقت التحميل. اختر الدول اللي عايز دورياتها تشتغل في مسيرتك.</small></div><div class="fm-field"><label for="fm-manager-nationality">جنسية المدير الفني</label><select id="fm-manager-nationality" name="managerNationality">'+DATA.nations.map(n=>'<option '+(n==="Egypt"?"selected":"")+'>'+esc(n)+'</option>').join("")+'</select></div><div class="fm-field full"><label for="fm-club-select">اختار النادي اللي هتدربه</label><select id="fm-club-select" name="clubId"></select><div id="fm-club-preview" class="fm-club-preview"></div></div><div class="fm-data-warning"><b>معلومة عن قاعدة البيانات</b><p>قاعدة اللعبة تضم أندية ولاعبين من مصادر متعددة، لكن مش كل قوائم الأندية مكتملة أو محدثة بنفس الدرجة. بعض الفرق فيها لاعبين مولّدين، وقيم الانتقالات والرواتب والتقييمات تعتبر تقديرية ما لم يتوفر مصدر موثوق يؤكدها.</p></div><div class="fm-setup-actions"><button type="button" class="fm-btn fm-btn-ghost" data-action="load-file">استيراد مسيرة أو قاعدة بيانات</button><button class="fm-btn fm-btn-primary" type="submit">ابدأ المسيرة <span>←</span></button></div><input type="file" id="fm-import-file" accept=".json,application/json" hidden></form></div></div>';
    root.dir="rtl";root.lang="ar";
    const languageSelect=$("#fm-ui-language",root);if(languageSelect)languageSelect.value=preferredLanguage;
    root.onclick=handleClick;
    const form=$("#career-setup",root);
    const checkboxes=$$('input[name="nations"]',form);
    checkboxes.forEach(cb=>cb.addEventListener("change",()=>{
      const checked=checkboxes.filter(x=>x.checked);
      if(checked.length>5){cb.checked=false;toast("اختار خمس دول كحد أقصى.", "warning");}
      selectedNations=checkboxes.filter(x=>x.checked).map(x=>x.value);
      if(!selectedNations.length){cb.checked=true;selectedNations=[cb.value];}
      const nationSel=$("#fm-nation",form);if(!selectedNations.includes(nationSel.value))nationSel.value=selectedNations[0];
      refreshClubOptions();
    }));
    $("#fm-nation",form).addEventListener("change",e=>{if(!selectedNations.includes(e.target.value)){if(selectedNations.length>=5)selectedNations[selectedNations.length-1]=e.target.value;else selectedNations.push(e.target.value);}refreshClubOptions();});
    $("#fm-club-select",form).addEventListener("change",refreshClubPreview);
    form.addEventListener("submit",e=>{
      e.preventDefault();const fd=new FormData(form);
      selectedNations=fd.getAll("nations").slice(0,5);
      const primary=String(fd.get("primaryNation"));
      if(!selectedNations.includes(primary))selectedNations.unshift(primary);
      selectedNations=selectedNations.slice(0,5);
      try{
        setup={mode:String(fd.get("mode")||"career"),managerName:String(fd.get("managerName")||"").trim(),managerNationality:String(fd.get("managerNationality")||"Egypt"),reputation:Number(fd.get("reputation")||45),badge:String(fd.get("badge")||"Tactician"),primaryNation:primary,databaseSize:String(fd.get("databaseSize")||"medium"),clubId:String(fd.get("clubId")||""),language:String(fd.get("language")||preferredLanguage)};
        if(!setup.managerName)throw new Error("اكتب اسم المدير الفني الأول.");
        if(!setup.clubId&&setup.mode!=="myclub")throw new Error("اختار النادي اللي هتدربه.");
        if(setup.mode==="myclub") setup.clubId=createMyClub(setup);
        preferredLanguage=setup.language==="en"?"en":"ar";
        try{localStorage.setItem(LANGUAGE_KEY,preferredLanguage);}catch(e){}
        state=E.newCareer(Object.assign({},setup,{nations:selectedNations}));
        state.settings=Object.assign({},state.settings||{},{language:preferredLanguage});
        if(setup.mode==="myclub"){state.manager.clubId=setup.clubId;}
        save();
        const welcomeScreen=document.getElementById("tm-start-screen");
        if(welcomeScreen&&typeof welcomeScreen.remove==="function")welcomeScreen.remove();
        view="overview";root.classList.add("is-open");render();toast("اتعملت المسيرة. جاري تحديث بيانات لاعبي الدوري الإنجليزي…","success");runFPLImport(true);
      }catch(err){toast(err.message||"Unable to create career.","warning");}
    });
    $("#fm-import-file",root).addEventListener("change",handleImportFile);
    refreshClubOptions();
  }
  function refreshClubOptions() {
    const select=$("#fm-club-select"), nation=$("#fm-nation");if(!select||!nation)return;
    const list=DATA.clubs.filter(c=>c.country===nation.value&&!c.unverifiedDivision);
    select.innerHTML=list.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+' · '+esc(c.league)+'</option>').join("");
    refreshClubPreview();
  }
  function refreshClubPreview() {
    const c=DATA.clubs.find(x=>x.id===$("#fm-club-select")?.value);const host=$("#fm-club-preview");if(!c||!host)return;
    const real=DATA.players.filter(p=>p.clubId===c.id).length;
    host.innerHTML='<span class="fm-preview-crest" style="--club-primary:'+c.primary+';--club-secondary:'+c.secondary+'">'+esc(c.code)+'</span><div><b>'+esc(c.name)+'</b><small>'+esc(c.stadium)+' · capacity '+num(c.capacity)+'</small><small>Seeded sample players: '+real+' · estimated transfer budget '+money(c.transferBudget)+'</small></div><span class="fm-predicted">الهدف المبدئي: النصف الأعلى</span>';
  }
  function createMyClub(config) {
    const name=prompt("Name your new club","New City FC");if(!name||!name.trim())throw new Error("Enter a club name to create My Club.");
    const country=config.primaryNation||"England",template=DATA.clubs.find(c=>c.country===country)||DATA.clubs[0];
    const id="custom-"+Date.now().toString(36);
    DATA.clubs.push(Object.assign({},template,{id:id,name:name.trim(),code:name.trim().split(/\s+/).slice(0,3).map(s=>s[0]).join("").toUpperCase(),transferBudget:25000000,wageBudget:600000,primary:"#6842D8",secondary:"#B7FF3C",stadium:"Custom Ground",seeded:false,source:"User-created club"}));
    return id;
  }
  function frameHeader() {
    const c=myClub(), unread=state.inbox.filter(m=>!m.read).length;
    return '<header class="fm-topbar"><div class="fm-head-brand"><span class="fm-mark">TM</span><div><b>TOUCHLINE</b><small>FOOTBALL DIRECTOR</small></div></div><div class="fm-clubhead"><span class="fm-mini-crest" style="--club-primary:'+c.primary+';--club-secondary:'+c.secondary+'">'+esc(c.code)+'</span><div><b>'+esc(c.name)+'</b><small>'+esc(c.league)+' · '+esc(state.season)+'/'+String((state.season+1)%100).padStart(2,"0")+'</small></div></div><div class="fm-datehead"><span>CAREER DATE</span><b>'+dateLabel(state.day)+'</b></div><div class="fm-managerhead"><b>'+esc(state.manager.name)+'</b><small>'+esc(state.manager.badge)+' · REP '+state.manager.reputation+'</small></div><button class="fm-inbox-btn" data-action="inbox" aria-label="Inbox">✉ <i>'+unread+'</i></button><button class="fm-btn fm-btn-primary fm-continue" data-action="continue">Continue <span>→</span></button><button class="fm-icon-btn" data-action="close" aria-label="Close advanced mode">×</button></header>';
  }
  const NAV=[["overview","⌂","Home / Hub"],["squad","♙","Squad"],["tactics","⌗","Tactics board"],["training","↗","Training & dynamics"],["scouting","◎","Scouting agency"],["transfers","⇄","Transfers & contracts"],["finances","◇","Board, finances & staff"],["competitions","▦","Competitions & calendar"],["settings","⚙","Database & settings"]];
  function render() {
    if(!state){renderSetup();return;}
    const root=makeOverlay();root.classList.add("is-open");
    root.dir=state.settings?.language==="ar"?"rtl":"ltr";root.lang=state.settings?.language==="ar"?"ar":"en";
    root.innerHTML=frameHeader()+'<div class="fm-app-layout"><aside class="fm-sidebar"><div class="fm-nav-label">CLUB MANAGEMENT</div><nav class="fm-nav">'+NAV.map(n=>'<button class="fm-nav-item '+(view===n[0]?"active":"")+'" data-view="'+n[0]+'"><span>'+n[1]+'</span>'+n[2]+(n[0]==="squad"?'<i>'+mySquad().length+'</i>':n[0]==="overview"&&state.inbox.some(m=>!m.read)?'<i class="has-new">•</i>':"")+'</button>').join("")+'</nav><div class="fm-sidebar-bottom"><div class="fm-data-status"><span class="fm-live-dot"></span><div><b>AUTO-SAVE ON</b><small>'+state.generatedCount+' generated slots</small></div></div><button class="fm-btn fm-btn-ghost fm-wide" data-action="save-now">Save career now</button><button class="fm-btn fm-btn-ghost fm-wide" data-action="export-save">Export save JSON</button><div class="fm-sidebar-version">ADVANCED SIM · LOCAL FIRST</div></div></aside><main class="fm-main"><div class="fm-view-title"><div><span class="fm-eyebrow">'+(NAV.find(n=>n[0]===view)?.[2]||"CLUB MANAGEMENT").toUpperCase()+'</span><h1>'+viewTitle()+'</h1></div><div class="fm-view-actions"><span class="fm-status-chip"><i></i>'+esc(state.day)+'</span></div></div>'+renderView()+'</main></div><div id="fm-modal-root"></div>';
    root.onclick=handleClick;
    root.onchange=handleChange;
    root.oninput=handleInput;
    if(view==="tactics")drawTacticsPitch();
    if(view==="match")drawLivePitch();
    if(modal)renderModal();
    localizeUi(root);
  }
  function viewTitle() {
    return {overview:"Manager's Hub",squad:"First Team Squad",tactics:"Tactics & Match Plan",training:"Training & Team Dynamics",scouting:"Player Search & Scouting",transfers:"Transfer Centre",finances:"Club Operations",competitions:"Competitions & Calendar",settings:"World Database & Settings",match:"Match Day"}[view]||"Manager's Hub";
  }
  function statCard(label,value,caption,accent="lime") {
    return '<article class="fm-stat-card accent-'+accent+'"><span>'+label+'</span><b>'+value+'</b><small>'+caption+'</small></article>';
  }
  function panel(title,body,tag="") {
    return '<section class="fm-panel"><header class="fm-panel-head"><h2>'+title+'</h2>'+(tag?'<span class="fm-tag">'+tag+'</span>':"")+'</header><div class="fm-panel-body">'+body+'</div></section>';
  }
  function nextFixture() {
    const fixture=state.matchPending?state.fixtures.find(f=>f.id===state.matchPending):state.fixtures.find(f=>!f.played&&(f.homeId===state.userClubId||f.awayId===state.userClubId));
    return fixture||null;
  }
  function renderView() {
    if(view==="overview")return renderOverview();
    if(view==="squad")return renderSquad();
    if(view==="tactics")return renderTactics();
    if(view==="training")return renderTraining();
    if(view==="scouting")return renderScouting();
    if(view==="transfers")return renderTransfers();
    if(view==="finances")return renderFinances();
    if(view==="competitions")return renderCompetitions();
    if(view==="settings")return renderSettings();
    if(view==="match")return renderMatch();
    return renderOverview();
  }
  function renderOverview() {
    const c=myClub(),ps=mySquad(),standing=currentStandings().findIndex(x=>x.clubId===c.id)+1;
    const wage=ps.reduce((a,p)=>a+p.wage,0),fix=nextFixture(),unread=state.inbox.filter(m=>!m.read).slice(0,5);
    const home=fix?club(fix.homeId):null,away=fix?club(fix.awayId):null;
    const matchBody=fix?'<div class="fm-match-hero"><div class="fm-match-date">'+(fix.date===state.day?"MATCH DAY":esc(fix.date||"Scheduled"))+' · '+esc(c.league)+'</div><div class="fm-matchup"><div class="fm-team-token"><span class="fm-crest big" style="--club-primary:'+home.primary+';--club-secondary:'+home.secondary+'">'+esc(home.code)+'</span><b>'+esc(home.name)+'</b></div><div class="fm-vs">VS<small>'+(fix.played?fix.homeGoals+" – "+fix.awayGoals:"90 MIN")+'</small></div><div class="fm-team-token"><span class="fm-crest big" style="--club-primary:'+away.primary+';--club-secondary:'+away.secondary+'">'+esc(away.code)+'</span><b>'+esc(away.name)+'</b></div></div><div class="fm-match-actions"><button class="fm-btn fm-btn-primary" data-action="'+(fix.played?"show-report":"open-match")+'" data-fixture="'+fix.id+'">'+(fix.played?"View match report":"Prepare for match")+' →</button><button class="fm-btn fm-btn-ghost" data-view="tactics">Tactics & XI</button></div></div>':'<div class="fm-empty">No upcoming league fixture found.</div>';
    const standings=currentStandings().slice(0,8).map((r,i)=>'<tr><td class="fm-place">'+(i+1)+'</td><td><b>'+esc(r.name)+'</b></td><td>'+r.played+'</td><td>'+r.GD+'</td><td><strong>'+r.points+'</strong></td></tr>').join("");
    const inboxBody=unread.length?unread.map(m=>'<button class="fm-inbox-row" data-action="open-inbox-item" data-message="'+esc(m.id)+'"><span class="fm-inbox-icon '+esc(m.kind||"info")+'">'+(m.kind==="success"?"✓":m.kind==="warning"?"!":"i")+'</span><span><b>'+esc(m.title)+'</b><small>'+esc(m.text)+'</small></span><i>›</i></button>').join(""):'<div class="fm-empty">All caught up. Reports and club news will appear here.</div>';
    const recent=state.careerHistory.filter(x=>x.score).slice(0,5).map(x=>'<div class="fm-history-row"><span>'+esc(x.day||"")+'</span><b>'+esc(x.home||"Club")+' '+esc(x.score||"")+' '+esc(x.away||"")+'</b></div>').join("")||'<div class="fm-empty">Your first result will be recorded here.</div>';
    return '<div class="fm-stat-grid">'+statCard("LEAGUE POSITION",standing||"—","points: "+num(currentStandings().find(x=>x.clubId===c.id)?.points||0),"lime")+statCard("TRANSFER BUDGET",money(state.finances.transferBudget),"Club funds available","purple")+statCard("WEEKLY WAGES",money(wage),"Wage budget: "+money(state.finances.wageBudget),"blue")+statCard("SQUAD HARMONY",state.harmony+"%","Dressing-room atmosphere","orange")+'</div><div class="fm-overview-grid"><div>'+panel("Next fixture",matchBody,"MATCH CENTRE")+panel("League table",'<div class="fm-table-wrap"><table class="fm-table"><thead><tr><th>#</th><th>Club</th><th>P</th><th>GD</th><th>Pts</th></tr></thead><tbody>'+standings+'</tbody></table></div><button class="fm-text-btn" data-view="competitions">Full table & results →</button>',"LIVE")+'</div><div>'+panel("Inbox",inboxBody,'UNREAD '+state.inbox.filter(m=>!m.read).length)+panel("Recent club activity",recent)+panel("Quick actions",'<div class="fm-quick-actions"><button data-view="scouting">⌕ Search players</button><button data-view="training">↗ Run training</button><button data-view="finances">◇ Review budgets</button><button data-action="export-save">⇧ Export career</button></div>')+'</div></div><div class="fm-data-note"><b>World database status</b><span>'+esc(state.world.sourceSeason)+'</span><span>'+state.players.length+' players in world · '+state.clubs.length+' clubs · '+state.generatedCount+' generated academy slots</span><button class="fm-text-btn" data-view="settings">Review data source →</button></div>';
  }
  function renderSquad() {
    const ps=mySquad().filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase())||p.position.toLowerCase().includes(search.toLowerCase()));
    const rows=ps.map((p,i)=>'<tr><td><span class="fm-shirt">'+(p.shirt||i+1)+'</span></td><td><button class="fm-player-link" data-action="profile" data-player="'+p.id+'">'+esc(p.name)+'</button><small class="fm-player-sub">'+esc(p.nationality)+' · '+(p.contractYears===0?"Free agent":p.contractYears+"y left")+'</small>'+(Number(p.suspendedMatches||0)>0?'<small class="fm-player-sub">Suspended · '+Number(p.suspendedMatches)+' match(es)</small>':'')+'</td><td><span class="fm-pos">'+esc(p.position)+'</span></td><td><b class="fm-overall">'+p.overall+'</b></td><td>'+p.age+'</td><td><div class="fm-condition"><span style="width:'+p.fitness+'%"></span></div><small>'+p.fitness+'%</small></td><td><span class="fm-form">'+p.form.slice(-5).map(f=>'<i class="'+(Number(f)>=7.5?"w":Number(f)<6.4?"l":"d")+'">'+(Number(f)>=7.5?"W":Number(f)<6.4?"L":"D")+'</i>').join("")+'</span></td><td>'+generatedBadge(p)+'</td><td><button class="fm-mini-btn" data-action="toggle-registration" data-player="'+p.id+'">'+(p.registered===false?'Unregistered':'Registered')+'</button></td><td><button class="fm-mini-btn" data-action="profile" data-player="'+p.id+'">Profile</button> <button class="fm-mini-btn" data-action="renew" data-player="'+p.id+'">Contract</button></td></tr>').join("");
    return '<div class="fm-squad-toolbar"><div class="fm-toolbar-copy"><b>'+mySquad().length+' players registered</b><small>First Team · Reserves · Academy slots are clearly labelled</small></div><div class="fm-toolbar-controls"><input class="fm-input" id="fm-squad-search" placeholder="Search player or position…" value="'+esc(search)+'"><select class="fm-select" id="fm-squad-sort"><option value="overall">Sort by rating</option><option value="age">Sort by age</option><option value="value">Sort by value</option></select><button class="fm-btn fm-btn-ghost" data-action="numbers">Squad numbers</button></div></div>'+panel("First team squad",'<div class="fm-table-wrap"><table class="fm-table"><thead><tr><th>No.</th><th>Player</th><th>Pos</th><th>OVR</th><th>Age</th><th>Condition</th><th>Form</th><th>Data</th><th>25-man list</th><th>Actions</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="fm-table-foot">Roster completeness: '+mySquad().length+'/25 · '+mySquad().filter(p=>!p.generated).length+' seeded/imported profiles · '+mySquad().filter(p=>p.generated).length+' generated slots</div>',"FIRST TEAM");
  }
  function renderTactics() {
    const ps=E.selectedXI(state,state.userClubId);
    const opts=E.FORMATIONS;
    const roster=mySquad().slice().sort((a,b)=>b.overall-a.overall);
    const lineup=ps.map((p,i)=>'<div class="fm-lineup-row"><span class="fm-shirt">'+(p.shirt||"—")+'</span><div><b>'+esc(p.name)+'</b><small>'+esc(p.assignedPosition)+' · OVR '+p.overall+'</small></div><select class="fm-select fm-starter-select" aria-label="Choose starter for '+esc(p.assignedPosition)+'" data-field="startingPlayer" data-slot="'+i+'">'+roster.map(q=>'<option value="'+q.id+'" '+(q.id===p.id?"selected":"")+(q.injuredWeeks>0||Number(q.suspendedMatches||0)>0||live&&live.started?" disabled":"")+'>'+esc(q.name)+' · '+esc(q.position)+' · '+q.overall+(q.injuredWeeks>0?" · Injured":Number(q.suspendedMatches||0)>0?" · Suspended ("+Number(q.suspendedMatches)+" match(es))":"")+'</option>').join("")+'</select><select class="fm-select fm-role-select" aria-label="Player role" data-field="role" data-player="'+p.id+'">'+(E.ROLES[p.assignedPosition]||["Balanced"]).map(r=>'<option '+((state.tactics.roles[p.id]||r)===r?"selected":"")+'>'+esc(r)+'</option>').join("")+'</select></div>').join("");
    return (live?'<div class="fm-tactics-livebar"><button class="fm-btn fm-btn-secondary" data-action="return-to-match">← Return to Match</button><span>Changes apply to the remaining match when you return.</span></div>':"")+'<div class="fm-tactic-layout"><div>'+panel("Formation & mentality",'<div class="fm-control-row"><label>Formation</label><select class="fm-select" data-field="formation">'+Object.keys(opts).map(f=>'<option '+(state.tactics.formation===f?"selected":"")+'>'+f+'</option>').join("")+'</select></div><div class="fm-control-row"><label>Team mentality</label><select class="fm-select" data-field="mentality">'+["Contain","Defensive","Balanced","Attacking","Overload"].map(x=>'<option '+(state.tactics.mentality===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div><div class="fm-range-row"><label for="fm-intensity">Pressing intensity</label><input id="fm-intensity" type="range" min="1" max="20" value="'+(state.tactics.pressIntensity||11)+'" data-field="pressIntensity"><b>'+ (state.tactics.pressIntensity||11)+'/20</b></div><div class="fm-control-row"><label>Width</label><select class="fm-select" data-field="width">'+["Narrow","Balanced","Wide"].map(x=>'<option '+(state.tactics.width===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div><div class="fm-control-row"><label>Tempo</label><select class="fm-select" data-field="tempo">'+["Slow","Normal","Fast"].map(x=>'<option '+(state.tactics.tempo===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div><div class="fm-control-row"><label>Passing style</label><select class="fm-select" data-field="passing">'+["Short","Mixed","Direct","Long Ball"].map(x=>'<option '+(state.tactics.passing===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div><div class="fm-control-row"><label>Team style</label><select class="fm-select" data-field="style">'+["Possession","Counter-Attack","Gegenpress","Wing Play","Route One"].map(x=>'<option '+(state.tactics.style===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div><div class="fm-control-row"><label>Final third</label><select class="fm-select" data-field="finalThird">'+["Work Ball Into Box","Shoot on Sight","Early Crosses","Run at Defence"].map(x=>'<option '+(state.tactics.finalThird===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div><div class="fm-control-row"><label>Defensive line</label><select class="fm-select" data-field="line">'+["Low Block","Balanced","High Line"].map(x=>'<option '+(state.tactics.line===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div><div class="fm-control-row"><label>Pressing</label><select class="fm-select" data-field="pressing">'+["Sit Back","Balanced","Press All Over"].map(x=>'<option '+(state.tactics.pressing===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div><div class="fm-control-row"><label>Tackling</label><select class="fm-select" data-field="tackling">'+["Cautious","Normal","Committed"].map(x=>'<option '+(state.tactics.tackling===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div><label class="fm-check-row"><input type="checkbox" data-field="offsideTrap" '+(state.tactics.offsideTrap?"checked":"")+'> Use the offside trap</label>',"TACTICAL PLAN")+panel("Set pieces & leadership",setPieceSelect("Captain","captainId")+setPieceSelect("Vice-captain","viceCaptainId")+setPieceSelect("Penalty taker","penaltyId")+setPieceSelect("Free-kick taker","freeKickId")+setPieceSelect("Corner taker","cornerId"))+'</div><div>'+panel("Interactive tactics board",'<canvas id="fm-tactics-canvas" width="600" height="420" aria-label="Drag players on the pitch"></canvas><div class="fm-canvas-help">Drag player markers to change their tactical position. Formation and roles are saved to this career.</div><div class="fm-lineup-grid">'+lineup+'</div>',"DRAG & DROP")+'</div></div>';
  }
  function setPieceSelect(label,key) {
    return '<div class="fm-control-row"><label>'+label+'</label><select class="fm-select" data-field="'+key+'"><option value="">Auto select</option>'+mySquad().map(p=>'<option value="'+p.id+'" '+(state.tactics[key]===p.id?"selected":"")+'>'+esc(p.name)+' · '+p.overall+'</option>').join("")+'</select></div>';
  }
  function renderTraining() {
    const ps=mySquad(), fit=Math.round(ps.reduce((a,p)=>a+p.fitness,0)/Math.max(1,ps.length)), focus=state.trainingFocus||"Balanced";
    const focusList=["Balanced","Attacking","Defending","Technical","Passing","Fitness","Recovery","Youth Development"];
    const leaders=ps.slice().sort((a,b)=>(b.attributes.leadership||10)-(a.attributes.leadership||10)).slice(0,6);
    return '<div class="fm-stat-grid">'+statCard("SQUAD CONDITION",fit+"%","Average fitness","lime")+statCard("TEAM MORALE",state.morale+"%","Club-wide morale","purple")+statCard("SQUAD HARMONY",state.harmony+"%","Social cohesion","blue")+statCard("TRAINING COMPLETED",state.trainingLog.length,"Career sessions","orange")+'</div><div class="fm-two-col"><div>'+panel("Training schedule",'<div class="fm-training-hero"><span>THIS SESSION</span><b>'+esc(focus)+'</b><small>Attributes, fitness and development update based on the session.</small></div><div class="fm-control-row"><label>Training focus</label><select class="fm-select" data-field="trainingFocus">'+focusList.map(x=>'<option '+(focus===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div><button class="fm-btn fm-btn-primary fm-wide" data-action="run-training" '+(state.lastTrainingDay===state.day?"disabled":"")+'>Run training session</button><p class="fm-help">One session per in-game day. Recovery restores fitness; high-intensity sessions consume fitness and may improve attributes.</p>',"INDIVIDUAL + TEAM")+panel("Mentoring groups",'<p class="fm-muted">Pair a senior leader with a younger player. A group adds a small morale and development modifier when training runs.</p><div class="fm-control-row"><label>Senior mentor</label><select id="fm-mentor" class="fm-select">'+leaders.map(p=>'<option value="'+p.id+'">'+esc(p.name)+' · age '+p.age+'</option>').join("")+'</select></div><div class="fm-control-row"><label>Youth player</label><select id="fm-mentee" class="fm-select">'+ps.filter(p=>p.age<25).map(p=>'<option value="'+p.id+'">'+esc(p.name)+' · age '+p.age+'</option>').join("")+'</select></div><button class="fm-btn fm-btn-secondary" data-action="add-mentoring">Create mentoring group</button><div class="fm-pills">'+(state.mentoringGroups||[]).map(g=>'<span>'+esc(player(g.mentorId)?.name||"Mentor")+' → '+esc(player(g.menteeId)?.name||"Youth")+'</span>').join("")+'</div>')+'</div><div>'+panel("Dressing room",'<div class="fm-harmony-bar"><span style="width:'+state.harmony+'%"></span></div><div class="fm-harmony-value">'+state.harmony+'<small>/100 harmony</small></div><div class="fm-leader-list">'+leaders.map(p=>'<div class="fm-leader-row"><span class="fm-leader-avatar">'+esc(p.name.split(" ").map(x=>x[0]).slice(0,2).join(""))+'</span><div><b>'+esc(p.name)+'</b><small>'+esc(p.position)+' · leadership '+(p.attributes.leadership||10)+'/20</small></div><strong>'+p.morale+'%</strong></div>').join("")+'</div><div class="fm-action-row"><button class="fm-btn fm-btn-ghost" data-action="shout" data-shout="Praise">Praise the squad</button><button class="fm-btn fm-btn-ghost" data-action="shout" data-shout="Calm Down">Calm down</button></div>',"TEAM DYNAMICS")+panel("Recent development",state.trainingLog.slice(0,7).map(x=>'<div class="fm-history-row"><span>'+esc(x.day)+'</span><b>'+esc(x.focus)+'</b><span>+'+x.gains+' attribute boosts</span></div>').join("")||'<div class="fm-empty">No training sessions recorded yet.</div>')+'</div></div>';
  }
  function renderScouting() {
    const all=state.players.filter(p=>p.clubId!==state.userClubId&&!p.generated&&!p.retired);
    const found=all.filter(p=>(!search||p.name.toLowerCase().includes(search.toLowerCase()))&&(marketFilters.position==="all"||p.position===marketFilters.position)&&p.age<=marketFilters.age&&p.value<=marketFilters.value&&(p.attributes[marketFilters.attribute]||0)>=marketFilters.minimum).sort((a,b)=>b.overall-a.overall).slice(0,80);
    const rows=found.map(p=>'<tr><td><button class="fm-player-link" data-action="profile" data-player="'+p.id+'">'+esc(p.name)+'</button><small class="fm-player-sub">'+esc(p.nationality)+' · '+esc(playerClubLabel(p))+'</small></td><td>'+esc(p.position)+'</td><td>'+p.age+'</td><td><b>'+p.overall+'</b></td><td>'+playerValueLabel(p)+'</td><td>'+p.contractYears+' y</td><td><button class="fm-mini-btn" data-action="negotiate" data-player="'+p.id+'">Make offer</button></td></tr>').join("");
    return '<div class="fm-scouting-layout"><div>'+panel("Player search",'<input class="fm-input fm-search-wide" id="fm-market-search" value="'+esc(search)+'" placeholder="Player name, nationality, or club"><div class="fm-filter-grid"><label>Position<select id="fm-filter-position" class="fm-select">'+["all","GK","RB","CB","LB","DM","CM","AM","RW","LW","ST"].map(x=>'<option value="'+x+'" '+(marketFilters.position===x?"selected":"")+'>'+x+'</option>').join("")+'</select></label><label>Maximum age<input type="number" class="fm-input" id="fm-filter-age" min="15" max="48" value="'+marketFilters.age+'"></label><label>Maximum value<input type="number" class="fm-input" id="fm-filter-value" min="0" value="'+marketFilters.value+'"></label><label>Attribute<select id="fm-filter-attribute" class="fm-select">'+E.ATTRS.map(x=>'<option value="'+x+'" '+(marketFilters.attribute===x?"selected":"")+'>'+E.ATTR_LABELS[x]+'</option>').join("")+'</select></label><label>Minimum rating (1–20)<input type="number" class="fm-input" id="fm-filter-minimum" min="1" max="20" value="'+marketFilters.minimum+'"></label></div><button class="fm-btn fm-btn-secondary" data-action="apply-market-filters">Apply filters</button>',"SCOUTING FILTERS")+panel("Scout assignments",'<div class="fm-control-row"><label>Search region</label><select class="fm-select" id="fm-scout-region"><option>Europe</option><option>Africa</option><option>Asia</option><option>South America</option><option>Worldwide</option></select></div><div class="fm-control-row"><label>Assignment</label><select class="fm-select" id="fm-scout-assignment"><option>Youth wonderkids</option><option>First-team players</option><option>Expiring contracts</option><option>Affordable signings</option></select></div><button class="fm-btn fm-btn-primary" data-action="assign-scout">Assign available scout</button><div class="fm-pills">'+(state.scoutAssignments||[]).map(x=>'<span>'+esc(x.region)+' · '+esc(x.assignment)+'</span>').join("")+'</div>')+'</div><div>'+panel("Scouting results",'<div class="fm-table-wrap"><table class="fm-table"><thead><tr><th>Player</th><th>Pos</th><th>Age</th><th>OVR</th><th>Value</th><th>Contract</th><th>Action</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="fm-table-foot">Showing '+found.length+' player(s) · generated academy slots excluded from real-world search.</div>',"MATCHED "+found.length)+'</div></div>';
  }
  function renderTransfers() {
    const windowStatus=E.transferWindowStatus(state.day);
    const targets=state.players.filter(p=>p.clubId!==state.userClubId&&!p.generated&&!p.retired).sort((a,b)=>a.value-b.value).slice(0,15);
    const rows=targets.map(p=>'<tr><td><button class="fm-player-link" data-action="profile" data-player="'+p.id+'">'+esc(p.name)+'</button><small class="fm-player-sub">'+esc(playerClubLabel(p))+' · '+esc(p.position)+'</small></td><td>'+p.age+'</td><td>'+p.overall+'</td><td>'+playerValueLabel(p)+'</td><td>'+playerWageLabel(p)+'</td><td><button class="fm-mini-btn" data-action="negotiate" data-player="'+p.id+'">Negotiate</button></td></tr>').join("");
    const own=mySquad().map(p=>'<tr><td><b>'+esc(p.name)+'</b><small class="fm-player-sub">'+esc(p.position)+' · '+p.contractYears+' years</small></td><td>'+playerWageLabel(p)+'</td><td>'+playerValueLabel(p)+'</td><td><button class="fm-mini-btn" data-action="renew" data-player="'+p.id+'">Renew</button> <button class="fm-mini-btn warn" data-action="sell" data-player="'+p.id+'">Sell</button></td></tr>').join("");
    return '<div class="fm-stat-grid">'+statCard("TRANSFER BUDGET",money(state.finances.transferBudget),"Available transfer funds","purple")+statCard("WAGE HEADROOM",money(Math.max(0,state.finances.wageBudget-state.finances.weeklyCosts)),"Weekly payroll space","lime")+statCard("REGISTERED",mySquad().length,"Minimum 18 players","blue")+statCard("ACTIVE DEALS",state.transfers.length,"Instalment schedules","orange")+'</div><div class="fm-data-note"><b>TRANSFER WINDOW</b><span>'+esc(windowStatus.label)+(windowStatus.open?' · closes '+windowStatus.closes+' · '+windowStatus.daysRemaining+' day(s) left':' · next opening '+windowStatus.nextOpen)+'</span></div><div class="fm-two-col"><div>'+panel("Available players",'<div class="fm-table-wrap"><table class="fm-table"><thead><tr><th>Player</th><th>Age</th><th>OVR</th><th>Value</th><th>Wage/wk</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>',"SHORTLIST")+panel("Contract and budget notes",'<p class="fm-muted">Transfer bids are checked against the selling club valuation and your wage budget. A rejected offer returns a counter-fee or wage request; accepted installments create a scheduled liability.</p><button class="fm-btn fm-btn-ghost" data-view="scouting">Advanced player search →</button>')+'</div><div>'+panel("My squad contracts",'<div class="fm-table-wrap"><table class="fm-table"><thead><tr><th>Player</th><th>Wage/wk</th><th>Value</th><th>Actions</th></tr></thead><tbody>'+own+'</tbody></table></div>')+panel("Installment commitments",state.transfers.filter(t=>t.type==="installments").map(t=>'<div class="fm-history-row"><b>'+esc(player(t.playerId)?.name||"Transfer")+'</b><span>'+money(t.monthly)+' / month</span><span>'+t.months+' months left</span></div>').join("")||'<div class="fm-empty">No active installment deals.</div>')+'</div></div>';
  }
  function renderFinances() {
    const wage=mySquad().reduce((a,p)=>a+p.wage,0),income=state.finances.weeklyIncome,ratio=state.finances.wageBudget?Math.min(100,wage/state.finances.wageBudget*100):100;
    return '<div class="fm-stat-grid">'+statCard("CLUB BALANCE",money(state.finances.balance),"All cash movements","lime")+statCard("TRANSFER BUDGET",money(state.finances.transferBudget),"Recruitment allocation","purple")+statCard("WEEKLY WAGES",money(wage),money(state.finances.wageBudget)+" wage budget","blue")+statCard("WEEKLY INCOME",money(income),"Sponsorship and media","orange")+'</div><div class="fm-two-col"><div>'+panel("Budget allocation",'<div class="fm-finance-bars"><div><label>Wage budget used</label><b>'+Math.round(ratio)+'%</b></div><div class="fm-progress"><span style="width:'+ratio+'%"></span></div></div><div class="fm-control-row"><label>Move funds to wage budget</label><input class="fm-input" id="fm-budget-shift" type="number" value="0" step="100000" min="'+(-state.finances.wageBudget)+'" max="'+state.finances.transferBudget+'"></div><button class="fm-btn fm-btn-primary" data-action="adjust-budget">Apply budget shift</button><div class="fm-finance-ledger"><div><span>Season income</span><b>'+money(state.finances.seasonIncome)+'</b></div><div><span>Season costs</span><b>'+money(state.finances.seasonCosts)+'</b></div><div><span>Estimated net</span><b>'+money(state.finances.seasonIncome-state.finances.seasonCosts)+'</b></div></div>',"FINANCE CONTROL")+panel("Board requests",'<div class="fm-board-requests"><button data-action="board-request" data-request="transfer">Request more transfer funds</button><button data-action="board-request" data-request="wages">Increase wage budget</button><button data-action="board-request" data-request="training">Upgrade training facilities</button><button data-action="board-request" data-request="youth">Upgrade youth academy</button></div><p class="fm-help">Requests depend on board confidence and available cash. Facilities require a one-time cost when approved.</p>',"BOARDROOM")+'</div><div>'+panel("Board confidence",'<div class="fm-board-meter"><span style="width:'+state.board.confidence+'%"></span></div><b class="fm-board-num">'+state.board.confidence+' / 100</b><p class="fm-muted">Board expectation: '+esc(state.board.expectation)+'</p><p class="fm-muted">Club balance '+money(state.finances.balance)+'. Avoid a sustained wage deficit.</p>',"CURRENT")+panel("Staff",'<div class="fm-staff-list">'+state.staff.map(s=>'<div class="fm-staff-row"><span class="fm-staff-rating">'+["","🥉","🥈","🥇","★"][s.rating]+'</span><div><b>'+esc(s.type)+'</b><small>'+esc(s.name)+' · '+money(s.salary)+'/wk</small></div><button class="fm-mini-btn" data-action="fire-staff" data-staff="'+s.id+'">Release</button></div>').join("")+'</div><div class="fm-control-row"><label>Staff role</label><select class="fm-select" id="fm-staff-type"><option>Assistant Manager</option><option>Coach</option><option>Physio</option><option>Scout</option></select></div><div class="fm-control-row"><label>Quality</label><select class="fm-select" id="fm-staff-rating"><option value="1">Bronze</option><option value="2">Silver</option><option value="3">Gold</option></select></div><button class="fm-btn fm-btn-secondary" data-action="hire-staff">Hire staff member</button>')+'</div></div>';
  }
  function renderCompetitions() {
    const cup=state.domesticCup;
    const cupBody=cup?'<div class="fm-history-row"><b>'+esc(cup.name)+'</b><span>'+esc(cup.stage)+'</span><span>'+(cup.complete?'Completed':cup.fixtures.filter(f=>f.round===cup.round&&!f.played).length+' tie(s) ready')+'</span></div>'+(cup.fixtures.filter(f=>f.round===cup.round).map(f=>'<div class="fm-history-row"><span>'+esc(f.date||'TBD')+'</span><b>'+esc(club(f.homeId).name)+' '+(f.played?f.homeGoals+'–'+f.awayGoals:'vs')+' '+esc(club(f.awayId).name)+'</b></div>').join(''))+'<p class="fm-help">'+esc(cup.note)+'</p>'+(cup.complete?'<div class="fm-data-note"><b>Cup winner</b><span>'+esc(club(cup.champion).name)+'</span></div>':'<button class="fm-btn fm-btn-primary" data-action="simulate-cup-round">Simulate '+esc(cup.stage)+' round</button>'):'<div class="fm-empty">No domestic cup created.</div>';
    const rows=currentStandings().map((r,i)=>'<tr><td class="fm-place">'+(i+1)+'</td><td><b>'+esc(r.name)+'</b>'+(r.clubId===state.userClubId?' <span class="fm-tag is-real">YOU</span>':'')+'</td><td>'+r.played+'</td><td>'+r.wins+'</td><td>'+r.draws+'</td><td>'+r.losses+'</td><td>'+r.GF+'</td><td>'+r.GA+'</td><td>'+r.GD+'</td><td><b>'+r.points+'</b></td><td>'+r.form.map(x=>'<i class="fm-form-pill '+x.toLowerCase()+'">'+x+'</i>').join("")+'</td></tr>').join("");
    const fixtures=state.fixtures.slice().sort((a,b)=>a.round-b.round).slice(0,80).map(f=>'<tr><td>'+esc(f.date||"TBD")+'</td><td>'+esc(club(f.homeId).name)+'</td><td><b>'+(f.played?f.homeGoals+" – "+f.awayGoals:"vs")+'</b></td><td>'+esc(club(f.awayId).name)+'</td><td>'+esc(String(f.round))+'</td></tr>').join("");
    const ucl=state.continental;
    const uclBody=ucl.fixtures.length?'<div class="fm-compact-list">'+ucl.fixtures.filter(f=>f.played).slice(0,10).map(f=>'<div class="fm-history-row"><b>'+esc(club(f.homeId).name)+'</b><span>'+f.homeGoals+'–'+f.awayGoals+'</span><b>'+esc(club(f.awayId).name)+'</b></div>').join("")+'</div><p class="fm-help">'+ucl.fixtures.length+' scheduled fixtures · 36-team league-phase schedule, 8 distinct opponents per club; seed strength/qualification is illustrative.</p><button class="fm-btn fm-btn-secondary" data-action="simulate-continental-round">Simulate next continental round</button>':'<div class="fm-data-warning"><b>Continental competition needs a large database.</b><p>'+esc(ucl.note)+'</p></div>';
    const topScorers=state.players.slice().sort((a,b)=>b.goals-a.goals).filter(p=>p.goals>0).slice(0,10).map(p=>'<div class="fm-history-row"><b>'+esc(p.name)+'</b><span>'+esc(playerClubLabel(p))+'</span><strong>'+p.goals+'</strong></div>').join("")||'<div class="fm-empty">No goals recorded yet.</div>';
    return panel(esc(state.domesticCup?.name||"Domestic Cup"),cupBody,"KNOCKOUT") + panel(esc(myClub().league)+" table",'<div class="fm-table-wrap"><table class="fm-table"><thead><tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th><th>Form</th></tr></thead><tbody>'+rows+'</tbody></table></div>',"LEAGUE")+ '<div class="fm-two-col">'+panel("Fixture calendar",'<div class="fm-table-wrap"><table class="fm-table"><thead><tr><th>Date</th><th>Home</th><th>Score</th><th>Away</th><th>Round</th></tr></thead><tbody>'+fixtures+'</tbody></table></div>')+panel("Continental league phase",uclBody,"36-TEAM FORMAT")+panel("Top scorers",topScorers)+'</div>';
  }
  function renderSettings() {
    return '<div class="fm-two-col"><div>'+panel("Save and career files",'<div class="fm-settings-actions"><button class="fm-btn fm-btn-primary" data-action="save-now">Save career</button><button class="fm-btn fm-btn-secondary" data-action="export-save">Export save JSON</button><button class="fm-btn fm-btn-secondary" data-action="load-file">Import save / player database</button><button class="fm-btn fm-btn-ghost" data-action="new-career">Start a new career</button></div><p class="fm-help">Save data is stored locally in this browser, with an IndexedDB backup where supported. Export JSON before clearing browser data.</p>',"LOCAL-FIRST")+panel("Game settings",'<div class="fm-control-row"><label>Currency</label><select class="fm-select" data-setting="currency">'+["GBP","EUR","USD","EGP","SAR"].map(x=>'<option '+(state.settings.currency===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div><div class="fm-control-row"><label>Wage display</label><select class="fm-select" data-setting="wageDisplay"><option value="weekly" '+(state.settings.wageDisplay==="weekly"?"selected":"")+'>Weekly</option><option value="yearly" '+(state.settings.wageDisplay==="yearly"?"selected":"")+'>Yearly</option></select></div><div class="fm-control-row"><label>Interface language</label><select class="fm-select" data-setting="language"><option value="en" '+(state.settings.language==="en"?"selected":"")+'>English · LTR</option><option value="ar" '+(state.settings.language==="ar"?"selected":"")+'>Arabic direction · RTL</option></select></div><div class="fm-control-row"><label>Match speed</label><select class="fm-select" data-setting="speed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></div>',"PREFERENCES")+'</div><div>'+panel("Real-world data importer",'<div class="fm-data-warning"><b>Important data-source limitation</b><p>The bundled seed is not a verified live 2026/27 squad feed. This importer loads actual squad names, positions, shirt numbers, nationality, date of birth, contract expiry and market value where supplied. Weekly wages and detailed 1–20 attributes may not be provided by the source, so they remain estimates/unknown. For a club with imported real squad players, generated placeholders are removed from that club roster.</p></div><div class="fm-control-row"><label>One competition code</label><input class="fm-input" id="fm-api-code" value="PL" maxlength="8"></div><div class="fm-control-row"><label>Bulk competition codes</label><input class="fm-input" id="fm-api-codes" value="PL, ELC, BL1, PD, SA, FL1, DED, PPL, BSA"></div><div class="fm-control-row"><label>Season start year</label><input class="fm-input" id="fm-api-season" type="number" min="2015" max="2035" value="2026"></div><div class="fm-control-row"><label>football-data.org token</label><input class="fm-input" id="fm-api-token" type="password" autocomplete="off" placeholder="Enter your own API token"></div><button class="fm-btn fm-btn-secondary" data-action="import-api">Fetch one competition</button><button class="fm-btn fm-btn-secondary" data-action="merge-bundled-player-data">Apply bundled real-player data to this career</button><button class="fm-btn fm-btn-primary" data-action="import-fpl">Import current Premier League players (free)</button><button class="fm-btn fm-btn-primary" data-action="import-api-batch">Import real squads from all codes</button><p class="fm-help">Bulk import runs sequentially to respect free-plan rate limits; 9 codes can take about one minute. Available competitions and squad fields depend on your API plan. The bundled list is not a live roster source.</p><div class="fm-divider"></div><label class="fm-input-label">Import JSON data / save file</label><button class="fm-btn fm-btn-secondary" data-action="load-file">Choose JSON file</button><p class="fm-help">Accepted data: { clubs:[...], players:[...] } or the native Touchline save JSON format. Team name, league, colors, venue, player name, age, nationality, position and shirt number are supported. Include value and wage fields in your own source if you need them imported.</p><input type="file" id="fm-import-file" accept=".json,application/json" hidden>',"API + JSON")+panel("Database report",'<div class="fm-database-metrics"><div><span>World clubs</span><b>'+state.clubs.length+'</b></div><div><span>World players</span><b>'+state.players.length+'</b></div><div><span>Seed/import profiles</span><b>'+state.players.filter(p=>!p.generated).length+'</b></div><div><span>World Cup real-player snapshot</span><b>'+state.players.filter(p=>p.worldCupSnapshot).length+'</b></div><div><span>Live PL / API real-squad clubs</span><b>'+(state.realSquadClubIds||[]).length+'</b></div><div><span>Generated academy slots</span><b>'+state.players.filter(p=>p.generated).length+'</b></div></div><p class="fm-muted">'+esc(state.world.sourceSeason||"User-imported world")+'</p><ul class="fm-notes">'+(state.world.notes||[]).map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>',"PROVENANCE")+'</div></div>';
  }
  function renderMatch() {
    const f=live?live.fixture:nextFixture();if(!f)return panel("No match scheduled",'<button class="fm-btn fm-btn-primary" data-action="continue">Continue career</button>');
    const h=club(f.homeId),a=club(f.awayId),isReady=live&&live.started,score=live?scoreAtMinute(live.minute):null;
    const events=live?live.commentary.slice(-7):[];
    const stats=live?matchStatsAtMinute(live.minute):null;
    return '<div class="fm-match-topline"><div><span class="fm-eyebrow">'+(live?"LIVE MATCH CENTRE":"PRE-MATCH BRIEFING")+'</span><h2>'+esc(h.name)+' <span>vs</span> '+esc(a.name)+'</h2><p>'+esc(h.league)+' · '+esc(f.date||state.day)+' · '+esc(h.stadium)+'</p></div><div class="fm-match-status">'+(isReady?'<b id="fm-live-minute" class="fm-minute">'+Math.min(90,Math.floor(live.minute))+'′</b>':'<b>90:00</b>')+'<small>'+esc(state.tactics.formation)+' · '+esc(state.tactics.mentality)+'</small></div></div><div class="fm-live-layout"><div class="fm-live-main"><div class="fm-scoreboard"><div class="fm-score-team"><span class="fm-crest" style="--club-primary:'+h.primary+';--club-secondary:'+h.secondary+'">'+esc(h.code)+'</span><b>'+esc(h.name)+'</b></div><strong id="fm-live-score" class="fm-score">'+(score?score[0]: "—")+' <i>:</i> '+(score?score[1]:"—")+'</strong><div class="fm-score-team away"><span class="fm-crest" style="--club-primary:'+a.primary+';--club-secondary:'+a.secondary+'">'+esc(a.code)+'</span><b>'+esc(a.name)+'</b></div></div><canvas id="fm-live-canvas" width="900" height="520" aria-label="2D live football match pitch"></canvas><div class="fm-live-controls">'+(!live||!live.started?'<button class="fm-btn fm-btn-primary" data-action="start-live-match">▶ Play Match</button>':live.halfTime&&!live.halfDone?'<button class="fm-btn fm-btn-primary" data-action="second-half">Start second half</button>':live.paused?'<button class="fm-btn fm-btn-primary" data-action="resume-match">Resume</button>':'<button class="fm-btn fm-btn-secondary" data-action="pause-match">Pause</button>')+'<div class="fm-speed-group">'+[1,2,4].map(n=>'<button class="'+((live?.speed||1)===n?"active":"")+'" data-action="speed" data-speed="'+n+'">'+n+'×</button>').join("")+'</div><select class="fm-select" data-setting="highlightMode"><option value="key">Key highlights</option><option value="extended">Extended highlights</option><option value="full">Full match</option><option value="commentary">Commentary only</option></select><button class="fm-btn fm-btn-ghost" data-action="subs">Substitutions ('+(live?live.subs:0)+'/5)</button>'+(live&&!live.finished?'<button class="fm-btn fm-btn-ghost" data-action="open-tactics">Tactics & Shape</button>':"")+'</div><div class="fm-touchline">'+["Praise","Fire Up","Demand More","Calm Down"].map(x=>'<button class="fm-btn fm-btn-ghost" data-action="touchline" data-shout="'+x+'">'+x+'</button>').join("")+'</div></div><div class="fm-live-side">'+panel("Match statistics",stats?'<div id="fm-match-live-stats">'+renderLiveStats(stats)+'</div>':'<div id="fm-match-live-stats" class="fm-empty">Live stats appear when the match kicks off.</div>',"LIVE")+panel("Commentary",'<div class="fm-commentary-list">'+events.map(e=>'<div class="fm-commentary-row '+esc(e.type||"")+'"><b>'+(e.minute||0)+'′</b><span>'+esc(e.text)+'</span></div>').join("")+'</div><div class="fm-commentary-feed">'+(live?esc(live.latest||"Waiting for kick-off…"):"Opposition report: "+esc(a.name)+" will be assessed during the match.")+'</div>',"MATCH FEED")+panel("Team talk",'<div class="fm-teamtalk-buttons">'+["Encourage","Demand More","No Pressure","Passionate"].map(x=>'<button data-action="team-talk" data-talk="'+x+'">'+x+'</button>').join("")+'</div>')+'</div></div>'+(live&&live.finished?'<div class="fm-fulltime-banner"><h2>Full time · '+scoreAtMinute(90).join(" – ")+'</h2><p>'+esc(live.motm||"Man of the Match to be confirmed")+'</p><button class="fm-btn fm-btn-primary" data-action="finish-match">Complete match & continue</button></div>':"");
  }
  function renderLiveStats(s) {
    return [["Possession",s.possession[0]+"% / "+s.possession[1]+"%"],["Shots",s.shots.join(" / ")],["On target",s.shotsOnTarget.join(" / ")],["Expected goals",s.xg.join(" / ")],["Corners",s.corners.join(" / ")],["Fouls",s.fouls.join(" / ")],["Yellow cards",s.yellow.join(" / ")],["Pass accuracy",s.passAccuracy.join("% / ")+"%"]].map(x=>'<div class="fm-stat-row"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join("");
  }
  function scoreAtMinute(minute) {
    if(!live?.result)return [0,0];
    let h=0,a=0;
    live.result.events.filter(e=>e.type==="goal"&&e.minute<=minute).forEach(e=>{if(e.clubId===live.fixture.homeId)h++;else a++;});
    return [h,a];
  }
  function matchStatsAtMinute(minute) {
    if(!live?.result)return null;
    const r=live.result.stats,frac=clamp(minute/90,0,1),base=live.statBase;
    if(base&&Number(minute)>=Number(base.minute)){
      const start=clamp(Number(base.minute)||0,0,90),played=Math.max(0,Number(minute)-start),den=Math.max(1,start+played);
      const counts=(key,decimal)=>Array.isArray(r[key])?r[key].map((v,i)=>{
        const current=Number(base.stats?.[key]?.[i]||0),projected=Number(v||0)*played/90;
        return decimal?Number((current+projected).toFixed(2)):Math.round(current+projected);
      }):[];
      const averages=key=>Array.isArray(r[key])?r[key].map((v,i)=>{
        const before=Number(base.stats?.[key]?.[i]??v),after=Number(v);
        return start>0?Math.round((before*start+after*played)/den):Math.round(after*frac);
      }):[];
      return {possession:averages("possession"),shots:counts("shots",false),shotsOnTarget:counts("shotsOnTarget",false),xg:counts("xg",true),corners:counts("corners",false),fouls:counts("fouls",false),yellow:counts("yellow",false),passAccuracy:averages("passAccuracy")};
    }
    const scale=arr=>arr.map(v=>Math.round(v*frac));
    return {possession:r.possession,shots:scale(r.shots),shotsOnTarget:scale(r.shotsOnTarget),xg:r.xg.map(v=>Number((v*frac).toFixed(2))),corners:scale(r.corners),fouls:scale(r.fouls),yellow:scale(r.yellow),passAccuracy:r.passAccuracy};
  }
  function startMatch(fixture) {
    const h=club(fixture.homeId),a=club(fixture.awayId);
    const ht=fixture.homeId===state.userClubId?state.tactics:E.aiTactics(h,state.season),at=fixture.awayId===state.userClubId?state.tactics:E.aiTactics(a,state.season);
    const result=E.simulateMatch(h,a,state.players,ht,at);
    live={fixture:fixture,minute:0,started:false,paused:true,halfTime:false,halfDone:false,finished:false,speed:Number(state.settings.speed||1),result:result,commentary:[],latest:"Match ready. Confirm your team talk and kick off.",subs:0,windows:0,shouts:[],lineup:E.selectedXI(state,state.userClubId),subbedOut:[],motm:null,seenEvents:new Set()};
    const opposition=fixture.homeId===state.userClubId?a:h;
    const opponentTactics=fixture.homeId===state.userClubId?at:ht;
    const report=opposition.name+" rated "+opposition.strength+" · "+opponentTactics.formation+" · "+opponentTactics.style+" · "+opponentTactics.mentality+" mentality. "+(opponentTactics.line==="High Line"?"Space may open behind the line.":opponentTactics.pressing==="Sit Back"?"Expect a compact defensive block.":"Watch transitions and set pieces.");
    addInbox("Opposition report: "+opposition.name,report,"info");
    save();
  }
  function refreshRemainingSimulation() {
    if(!live||live.finished)return;
    const fixture=live.fixture,home=club(fixture.homeId),away=club(fixture.awayId);
    const elapsed=clamp(Number(live.minute||0)/90,0,1);
    const displayedStats=matchStatsAtMinute(live.minute);
    const previous=live.result||null;
    const pastEvents=previous?(previous.events||[]).filter(e=>Number(e.minute||0)<=live.minute):[];
    const previousStats=previous&&previous.stats||null;
    if(live.started){
      const currentIds=(live.lineup||[]).map(p=>p.id).filter(Boolean);
      state.tactics.startingXI=currentIds;
    }
    live.lineup=E.selectedXI(state,state.userClubId);
    const homeT=fixture.homeId===state.userClubId?state.tactics:E.aiTactics(home,state.season);
    const awayT=fixture.awayId===state.userClubId?state.tactics:E.aiTactics(away,state.season);
    const next=E.simulateMatch(home,away,state.players,homeT,awayT);
    const futureEvents=(next.events||[]).filter(e=>Number(e.minute||0)>live.minute);
    const events=pastEvents.concat(futureEvents).sort((a,b)=>a.minute-b.minute);
    const stats=next.stats||{};
    const oldLineups=previous&&previous.lineups||{};
    const lineups=Object.assign({},oldLineups,next.lineups||{});
    const userId=state.userClubId;
    lineups[userId]=Array.from(new Set([...(oldLineups[userId]||[]),...live.lineup.map(p=>p.id)]));
    const ratings=Object.assign({},previousStats&&previousStats.ratings||{},next.stats&&next.stats.ratings||{});
    pastEvents.forEach(e=>{
      if(e.playerId&&previousStats?.ratings?.[e.playerId]!=null)ratings[e.playerId]=previousStats.ratings[e.playerId];
      if(e.assistId&&previousStats?.ratings?.[e.assistId]!=null)ratings[e.assistId]=previousStats.ratings[e.assistId];
    });
    const homeGoals=events.filter(e=>e.type==="goal"&&e.clubId===fixture.homeId).length;
    const awayGoals=events.filter(e=>e.type==="goal"&&e.clubId===fixture.awayId).length;
    live.result=Object.assign({},next,{events:events,homeGoals:homeGoals,awayGoals:awayGoals,stats:Object.assign({},stats,{ratings:ratings}),lineups:lineups});
    live.statBase=elapsed>0?{minute:live.minute,stats:displayedStats}:null;
    live.motm=null;
    live.latest="Tactical changes applied. "+(live.minute<45?"First-half plan updated.":"Second-half plan updated.");
    live.commentary.push({minute:Math.floor(live.minute),type:"tactics",text:live.latest});
    live.seenEvents=new Set(pastEvents);
    save();
  }
  function beginMatch() {
    if(!live)return;
    live.started=true;live.paused=false;live.latest="Kick-off! The referee gets us underway.";live.commentary.unshift({minute:0,type:"kickoff",text:live.latest});
    lastFrame=0;animateMatch();
  }
  function animateMatch(ts) {
    if(!live||!live.started||live.paused||live.finished)return;
    ts=ts||performance.now();if(!lastFrame)lastFrame=ts;
    const delta=Math.min(80,ts-lastFrame);lastFrame=ts;
    live.minute=Math.min(90,live.minute+delta/250*live.speed);
    live.result.events.filter(e=>!live.seenEvents.has(e)).forEach(e=>{
      if(e.minute<=live.minute){live.seenEvents.add(e);live.commentary.push(e);live.latest=e.text;}
    });
    if(Math.floor(live.minute)>=45&&!live.halfDone&&!live.halfTime){live.halfTime=true;live.paused=true;live.latest="Half-time. Adjust your approach and team talk.";live.commentary.push({minute:45,type:"halftime",text:live.latest});}
    if(live.minute>=90){live.finished=true;live.paused=true;live.latest="Full time. "+scoreAtMinute(90).join("–")+".";
      live.motm=player(live.result.manOfTheMatch)?.name||"Player of the Match";
      drawLivePitch();renderMatchDynamic();return;
    }
    if(Math.floor(live.minute)%5===0&&Math.floor(live.minute)!==Math.floor(live.minute-delta/250*live.speed)){
      if(live.commentary.length<40){const text=pick(["Patient build-up through midfield.","A sharp pass splits the defensive line.","The press forces a rushed clearance.","A cross is dealt with by the centre-back.","Both teams are competing for second balls.","The goalkeeper calls for support."]);live.latest=text;live.commentary.push({minute:Math.floor(live.minute),type:"play",text:text});}
    }
    drawLivePitch();renderMatchDynamic();
    animationFrame=requestAnimationFrame(animateMatch);
  }
  function stopMatch() {if(animationFrame&&"cancelAnimationFrame"in window)cancelAnimationFrame(animationFrame);animationFrame=null;lastFrame=0;}
  function renderMatchDynamic() {
    const root=$("#advanced-root");if(!root||!root.classList.contains("is-open")||view!=="match")return;
    const old= $("#fm-live-minute",root);if(old)old.textContent=Math.floor(live.minute)+"′";
    const score=$("#fm-live-score",root);if(score)score.textContent=scoreAtMinute(live.minute).join(" – ");
    const feed=$(".fm-commentary-list",root);if(feed)feed.innerHTML=live.commentary.slice(-7).map(e=>'<div class="fm-commentary-row '+esc(e.type||"")+'"><b>'+Math.floor(e.minute||0)+'′</b><span>'+esc(e.text)+'</span></div>').join("");
    const latest=$(".fm-commentary-feed",root);if(latest)latest.textContent=live.latest;
    const stat=$("#fm-match-live-stats",root);if(stat)stat.innerHTML=renderLiveStats(matchStatsAtMinute(live.minute));
    const controls=$(".fm-live-controls",root);if(controls){const btn=$('[data-action="resume-match"], [data-action="pause-match"], [data-action="second-half"], [data-action="finish-match"]',controls);if(btn){if(live.finished){btn.dataset.action="finish-match";btn.textContent="Complete match";}else if(live.halfTime&&!live.halfDone){btn.dataset.action="second-half";btn.textContent="Start second half";}else if(live.paused){btn.dataset.action="resume-match";btn.textContent="Resume";}else{btn.dataset.action="pause-match";btn.textContent="Pause";}}}
    if(live.finished){const banners=$$(".fm-fulltime-banner",root);if(!banners.length){view="match";render();}}
  }
  function finishLiveMatch() {
    if(!live||!live.finished)return;
    const fixture=live.fixture;E.applyResult(state,fixture,live.result);
    state.matchPending=null;
    const rounds=[...new Set(state.fixtures.map(f=>f.round))].sort((a,b)=>a-b);
    const current=rounds.find(r=>state.fixtures.some(f=>f.round===r&&!f.played));
    if(current&&state.fixtures.some(f=>f.round===current&&f.date<=state.day&& !f.played))E.simulateRound(state,current);
    state.currentRound=Math.max(state.currentRound||0,fixture.round);
    if(state.fixtures.every(f=>f.played))E.finishSeason(state);
    stopMatch();live=null;view="overview";save();render();toast("Match result and league table saved.","success");
  }
  function drawPitch(canvas, isTactics) {
    if(!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    const W=canvas.width,H=canvas.height;
    const gradient=ctx.createLinearGradient(0,0,W,H);gradient.addColorStop(0,"#174c3c");gradient.addColorStop(1,"#0d3329");
    ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
    for(let i=0;i<10;i++){ctx.fillStyle=i%2?"rgba(255,255,255,.025)":"rgba(0,0,0,.035)";ctx.fillRect(i*W/10,0,W/10,H);}
    ctx.strokeStyle="rgba(235,255,238,.72)";ctx.lineWidth=2;ctx.strokeRect(16,16,W-32,H-32);
    ctx.beginPath();ctx.moveTo(W/2,16);ctx.lineTo(W/2,H-16);ctx.stroke();
    ctx.beginPath();ctx.arc(W/2,H/2,H*.16,0,Math.PI*2);ctx.stroke();
    ctx.strokeRect(16,H*.28,W*.16,H*.44);ctx.strokeRect(W*.84,H*.28,W*.16,H*.44);
    ctx.strokeRect(16,H*.39,W*.07,H*.22);ctx.strokeRect(W*.91,H*.39,W*.07,H*.22);
    ctx.fillStyle="#d7f7df";ctx.beginPath();ctx.arc(W/2,H/2,3,0,Math.PI*2);ctx.fill();
    const lineup= isTactics ? E.selectedXI(state,state.userClubId) : (live?.lineup||E.selectedXI(state,state.userClubId));
    const opp= isTactics ? [] : E.selectedXI(state,live.fixture.homeId===state.userClubId?live.fixture.awayId:live.fixture.homeId);
    if(isTactics) {
      const positions=state.tactics.positions||{};
      const base=formationCoords(state.tactics.formation||"4-2-3-1");
      lineup.forEach((p,i)=>{
        const co=positions[p.id]||base[i]||[.5,.5];
        drawToken(ctx,co[0]*W,co[1]*H,String(p.shirt||i+1),myClub().primary,p.name,p.id,i,true);
      });
      canvas._fmHitMap=lineup.map((p,i)=>{const co=positions[p.id]||base[i]||[.5,.5];return {id:p.id,x:co[0]*W,y:co[1]*H};});
      return;
    }
    const h=club(live.fixture.homeId),a=club(live.fixture.awayId);
    const homePlayers=live.fixture.homeId===state.userClubId?lineup:opp,awayPlayers=live.fixture.awayId===state.userClubId?lineup:opp;
    const all=homePlayers.concat(awayPlayers);
    all.forEach((p,i)=>{
      const isHome=p.clubId===live.fixture.homeId;
      const posIndex=i%(isHome?homePlayers.length:Math.max(1,awayPlayers.length));
      const coords=formationCoords(isHome?state.tactics.formation:"4-3-3");
      const side=isHome?.28:.72, y=coords[posIndex]?.[1]||((posIndex+1)/(isHome?homePlayers.length:awayPlayers.length+1));
      const wave=Math.sin((live.minute/5)+(i*1.3))*.035;
      const x=side+(isHome?1:-1)*Math.sin(live.minute/13+i*.7)*.07+wave;
      const yy=clampCanvas(y+Math.cos(live.minute/10+i)*.025,H);
      drawToken(ctx,x*W,yy*H,String(p.shirt||((i%11)+1)),isHome?h.primary:a.primary,p.name,p.id,i,false);
    });
    const sx=W*(.5+.36*Math.sin(live.minute/8)),sy=H*(.5+.25*Math.cos(live.minute/7));
    ctx.fillStyle="#f6e84d";ctx.beginPath();ctx.arc(sx,sy,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#181818";ctx.lineWidth=2;ctx.stroke();
  }
  function clampCanvas(v,H){return Math.max(.1,Math.min(.9,v));}
  function drawToken(ctx,x,y,label,color,name,id,i,isTactics) {
    const W=ctx.canvas.width;
    ctx.save();ctx.shadowColor="rgba(0,0,0,.4)";ctx.shadowBlur=5;ctx.fillStyle=color||"#5764bc";ctx.beginPath();ctx.arc(x,y,isTactics?18:13,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle="#fff";ctx.font="bold "+(isTactics?12:10)+"px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(label).slice(0,3),x,y);
    if(isTactics&&id===selectedDragId){ctx.strokeStyle="#baff43";ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,23,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }
  let selectedDragId=null, dragging=false;
  function formationCoords(formation) {
    const ys={
      "4-3-3":[[.5,.9],[.22,.76],[.39,.8],[.61,.8],[.78,.76],[.5,.61],[.32,.53],[.68,.53],[.2,.3],[.5,.22],[.8,.3]],
      "4-2-3-1":[[.5,.9],[.22,.76],[.4,.79],[.6,.79],[.78,.76],[.4,.62],[.6,.62],[.22,.4],[.5,.36],[.78,.4],[.5,.17]],
      "4-4-2":[[.5,.9],[.22,.76],[.4,.79],[.6,.79],[.78,.76],[.2,.49],[.4,.52],[.6,.52],[.8,.49],[.4,.24],[.6,.24]],
      "3-5-2":[[.5,.9],[.3,.8],[.5,.82],[.7,.8],[.15,.56],[.38,.6],[.5,.54],[.62,.6],[.85,.56],[.4,.25],[.6,.25]],
      "4-1-4-1":[[.5,.9],[.22,.76],[.4,.79],[.6,.79],[.78,.76],[.5,.66],[.22,.46],[.4,.5],[.6,.5],[.78,.46],[.5,.21]]
    };
    return ys[formation]||ys["4-2-3-1"];
  }
  function drawTacticsPitch() {
    const canvas=$("#fm-tactics-canvas");if(!canvas)return;
    drawPitch(canvas,true);
    if(!canvas.dataset.dragReady){
      canvas.dataset.dragReady="1";
      const coords=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*canvas.width,y:(e.clientY-r.top)/r.height*canvas.height};};
      canvas.addEventListener("pointerdown",e=>{const p=coords(e),hits=canvas._fmHitMap||[];const found=hits.slice().sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(found&&Math.hypot(found.x-p.x,found.y-p.y)<32){selectedDragId=found.id;dragging=true;canvas.setPointerCapture(e.pointerId);drawPitch(canvas,true);}});
      canvas.addEventListener("pointermove",e=>{if(!dragging||!selectedDragId)return;const p=coords(e);state.tactics.positions=state.tactics.positions||{};state.tactics.positions[selectedDragId]=[Math.max(.07,Math.min(.93,p.x/canvas.width)),Math.max(.08,Math.min(.92,p.y/canvas.height))];drawPitch(canvas,true);});
      canvas.addEventListener("pointerup",()=>{if(dragging){dragging=false;selectedDragId=null;save();}});
    }
  }
  function drawLivePitch() { const canvas=$("#fm-live-canvas");if(canvas&&live)drawPitch(canvas,false); }
  function renderModal() {
    const host=$("#fm-modal-root");if(!host||!modal)return;
    if(modal.type==="profile") {
      const p=player(modal.playerId);if(!p){modal=null;return;}
      const attr=p.attributes||E.baseAttributes(p),groups=[["Technical",["crossing","dribbling","heading","passing","shooting","setPieces","tackling","technique"]],["Mental",["aggression","creativity","decisions","leadership","movement","positioning","teamwork"]],["Physical",["aerial","pace","stamina","strength"]],["Goalkeeping",["goalkeeping"]]];
      host.innerHTML=modalShell(esc(p.name),'<div class="fm-profile-head"><span class="fm-profile-avatar" style="--club-primary:'+club(p.clubId).primary+'">'+esc(p.position)+'</span><div><h2>'+esc(p.name)+'</h2><p>'+esc(playerClubLabel(p))+' · '+esc(p.nationality)+' · '+p.age+' years'+(p.nationalTeam?' · '+esc(p.nationalTeam)+' international':'')+'</p><div class="fm-profile-rating"><b>'+p.overall+'</b><span>CA '+stars(p.overall,"#f5c542")+'</span><span>PA '+stars(p.potential,"#68728c")+'</span></div>'+generatedBadge(p)+'</div></div><div class="fm-profile-summary"><div><small>Market value '+(p.valueEstimated? '(est.)':'')+'</small><b>'+playerValueLabel(p)+'</b></div><div><small>Weekly wage '+(p.wageEstimated||p.wageKnown!==true?'(est.)':'')+'</small><b>'+playerWageLabel(p)+'</b></div><div><small>Contract</small><b>'+p.contractYears+' years</b></div><div><small>Condition</small><b>'+p.fitness+'%</b></div>'+(p.fantasyPrice!=null?'<div><small>FPL price · not market value</small><b>£'+Number(p.fantasyPrice).toFixed(1)+'m</b></div>':'')+'</div>'+groups.map(g=>'<section class="fm-attribute-group"><h3>'+g[0]+'</h3><div class="fm-attribute-grid">'+g[1].map(k=>'<div class="fm-attribute '+ratingClass(attr[k]||1)+'"><span>'+esc(E.ATTR_LABELS[k])+'</span><b>'+(attr[k]||1)+'</b></div>').join("")+'</div></section>').join("")+'<div class="fm-profile-career"><b>Career record</b><span>Apps '+(p.appearances||0)+' · Goals '+(p.goals||0)+' · Assists '+(p.assists||0)+' · Clean sheets '+(p.cleanSheets||0)+' · Avg rating '+(p.averageRating?Number(p.averageRating).toFixed(2):'—')+' · Cards '+(p.yellowCards||0)+'Y / '+(p.redCards||0)+'R</span></div><div class="fm-profile-career"><b>Season '+esc(state.season)+' record</b><span>Apps '+(p.seasonStats?.appearances||0)+' · Goals '+(p.seasonStats?.goals||0)+' · Assists '+(p.seasonStats?.assists||0)+' · Clean sheets '+(p.seasonStats?.cleanSheets||0)+' · Avg rating '+(p.seasonStats?.averageRating?Number(p.seasonStats.averageRating).toFixed(2):'—')+' · Cards '+(p.seasonStats?.yellowCards||0)+'Y / '+(p.seasonStats?.redCards||0)+'R</span></div><div class="fm-profile-career"><b>Recent form</b><span>'+(p.form||[]).slice(-5).map(x=>Number(x).toFixed(1)).join(" / ")+'</span></div>','<button class="fm-btn fm-btn-ghost" data-action="close-modal">Close</button><button class="fm-btn fm-btn-secondary" data-action="renew" data-player="'+p.id+'">Offer renewal</button>'+ (p.clubId===state.userClubId?'<button class="fm-btn fm-btn-primary" data-action="sell" data-player="'+p.id+'">Sell player</button>':'<button class="fm-btn fm-btn-primary" data-action="negotiate" data-player="'+p.id+'">Negotiate transfer</button>'));
    } else if(modal.type==="negotiate") {
      const p=player(modal.playerId);if(!p)return;
      host.innerHTML=modalShell("Transfer & contract proposal",'<div class="fm-negotiation-target"><b>'+esc(p.name)+'</b><span>'+esc(playerClubLabel(p))+' · '+esc(p.position)+' · OVR '+p.overall+'</span><span>Estimated fee '+money(p.value)+' · Requested wage '+money(p.wage)+'/wk</span></div><div class="fm-form-grid"><label>'+(p.clubId?"Transfer fee":"Free-agent fee")+'<input id="fm-offer-fee" type="number" min="0" value="'+(p.clubId?Math.round(p.value*1.02):0)+'"></label><label>Upfront fee<input id="fm-offer-upfront" type="number" min="0" value="'+(p.clubId?Math.round(p.value*0.75):0)+'"></label><label>Installments<select id="fm-offer-months"><option value="0">No installments</option><option value="12">12 months</option><option value="24">24 months</option></select></label><label>Weekly wage<input id="fm-offer-wage" type="number" min="0" value="'+Math.max(p.wage,state.finances.wageBudget*0.1)+'"></label><label>Contract length<select id="fm-offer-years"><option>2</option><option>3</option><option selected>4</option><option>5</option></select></label><label>Appearance bonus<input id="fm-offer-appearance" type="number" min="0" value="0"></label><label>Goal bonus<input id="fm-offer-goal" type="number" min="0" value="0"></label><label>Sell-on clause %<input id="fm-offer-sellon" type="number" min="0" max="50" value="0"></label><label>Signing bonus<input id="fm-offer-signing-bonus" type="number" min="0" value="0"></label></div><p class="fm-help">The engine validates transfer-window rules, upfront cash, payroll headroom and seller/player acceptance. Add-on terms are recorded as part of the proposal note; cash/installment obligations affect the budget.</p>','<button class="fm-btn fm-btn-ghost" data-action="close-modal">Cancel</button><button class="fm-btn fm-btn-primary" data-action="confirm-negotiate" data-player="'+p.id+'">Submit offer</button>');
    } else if(modal.type==="renew") {
      const p=player(modal.playerId);if(!p)return;
      host.innerHTML=modalShell("Contract renewal",'<div class="fm-negotiation-target"><b>'+esc(p.name)+'</b><span>Current wage '+money(p.wage)+'/week · '+p.contractYears+' years left</span></div><div class="fm-form-grid"><label>Weekly wage<input id="fm-renew-wage" type="number" value="'+Math.round(p.wage*1.08)+'"></label><label>Contract years<select id="fm-renew-years">'+[1,2,3,4,5].map(n=>'<option '+(n===3?"selected":"")+'>'+n+'</option>').join("")+'</select></label><label>Release clause<input id="fm-renew-clause" type="number" value="0"></label><label>Signing bonus<input id="fm-renew-bonus" type="number" value="0"></label></div>','<button class="fm-btn fm-btn-ghost" data-action="close-modal">Cancel</button><button class="fm-btn fm-btn-primary" data-action="confirm-renew" data-player="'+p.id+'">Offer contract</button>');
    } else if(modal.type==="sell") {
      const p=player(modal.playerId);host.innerHTML=modalShell("Sell player",'<p>Submit a club offer for <b>'+esc(p.name)+'</b>. Keep at least 18 players in the first-team squad.</p><label class="fm-modal-field">Agreed fee<input id="fm-sale-fee" type="number" value="'+Math.round(p.value*0.95)+'"></label>','<button class="fm-btn fm-btn-ghost" data-action="close-modal">Cancel</button><button class="fm-btn fm-btn-primary" data-action="confirm-sale" data-player="'+p.id+'">Confirm sale</button>');
    } else if(modal.type==="inbox") {
      host.innerHTML=modalShell("Club inbox",'<div class="fm-modal-inbox">'+state.inbox.slice(0,40).map(m=>'<article class="fm-inbox-row '+(m.read?"":"unread")+'"><span class="fm-inbox-icon '+esc(m.kind||"info")+'">'+(m.kind==="success"?"✓":m.kind==="warning"?"!":"i")+'</span><div><b>'+esc(m.title)+'</b><p>'+esc(m.text)+'</p><small>'+esc(m.day||"")+'</small></div><button class="fm-mini-btn" data-action="mark-read" data-message="'+esc(m.id)+'">'+(m.read?"Read":"Mark read")+'</button></article>').join("")+'</div>','<button class="fm-btn fm-btn-ghost" data-action="mark-all-read">Mark all read</button><button class="fm-btn fm-btn-primary" data-action="close-modal">Close</button>');
    } else if(modal.type==="numbers") {
      host.innerHTML=modalShell("Squad numbers",'<div class="fm-form-grid"><label>Player<select id="fm-number-player" class="fm-select">'+mySquad().map(p=>'<option value="'+p.id+'">'+esc(p.name)+' · '+esc(p.position)+'</option>').join("")+'</select></label><label>Shirt number (1–99)<input id="fm-number-value" type="number" min="1" max="99" value="10"></label></div><p class="fm-help">Shirt numbers must be unique inside your first team.</p>','<button class="fm-btn fm-btn-ghost" data-action="close-modal">Cancel</button><button class="fm-btn fm-btn-primary" data-action="confirm-numbers">Save shirt number</button>');
    } else if(modal.type==="subs") {
      const xi=live?.lineup||[],bench=mySquad().filter(p=>!xi.some(x=>x.id===p.id)&&!live.subbedOut.includes(p.id));
      host.innerHTML=modalShell("Substitutions",'<p>Available: '+Math.max(0,5-live.subs)+' substitution(s) · stoppages used '+live.windows+'/3.</p><div class="fm-form-grid"><label>Player off<select class="fm-select" id="fm-sub-off">'+xi.map(p=>'<option value="'+p.id+'">'+esc(p.name)+' · '+p.assignedPosition+'</option>').join("")+'</select></label><label>Player on<select class="fm-select" id="fm-sub-on">'+bench.map(p=>'<option value="'+p.id+'">'+esc(p.name)+' · '+p.position+'</option>').join("")+'</select></label></div>','<button class="fm-btn fm-btn-ghost" data-action="close-modal">Cancel</button><button class="fm-btn fm-btn-primary" data-action="confirm-substitution">Make substitution</button>');
    }
  }
  function modalShell(title,body,actions) {return '<div class="fm-modal-shade" data-action="shade-close"><section class="fm-modal"><header class="fm-modal-head"><h2>'+title+'</h2><button class="fm-icon-btn" data-action="close-modal">×</button></header><div class="fm-modal-body">'+body+'</div><footer class="fm-modal-foot">'+actions+'</footer></section></div>';}
  function showModal(type,id) {modal={type:type,playerId:id};renderModal();}
  function toggleRegistration(id) {const p=player(id);if(!p||p.clubId!==state.userClubId)return;const count=mySquad().filter(x=>x.registered!==false).length;if(p.registered===false){if(count>=25){toast("The competition registration list is limited to 25 players.","warning");return;}p.registered=true;}else{p.registered=false;}save();render();toast(p.registered?"Player registered for competitions.":"Player removed from 25-man registration.","success");}
  function handleClick(event) {
    const nav=event.target.closest("[data-view]");if(nav){view=nav.dataset.view;render();return;}
    const action=event.target.closest("[data-action]");if(!action)return;
    const a=action.dataset.action;
    if(a==="close"){event.stopPropagation();close();return;}
    if(a==="close-modal"||a==="shade-close"){if(a==="shade-close"&&event.target!==action)return;modal=null;const host=$("#fm-modal-root");if(host)host.innerHTML="";return;}
    if(a==="profile"){showModal("profile",action.dataset.player);return;}
    if(a==="numbers"){modal={type:"numbers"};renderModal();return;}
    if(a==="confirm-numbers"){const id=$("#fm-number-player")?.value,value=Number($("#fm-number-value")?.value);if(!id||value<1||value>99||!Number.isInteger(value)){toast("Choose a unique shirt number from 1 to 99.","warning");return;}if(mySquad().some(p=>p.id!==id&&p.shirt===value)){toast("That shirt number is already in use.","warning");return;}const p=player(id);p.shirt=value;modal=null;save();render();toast("Shirt number saved.","success");return;}
    if(a==="toggle-registration"){toggleRegistration(action.dataset.player);return;}
    if(a==="negotiate"){showModal("negotiate",action.dataset.player);return;}
    if(a==="renew"){showModal("renew",action.dataset.player);return;}
    if(a==="sell"){showModal("sell",action.dataset.player);return;}
    if(a==="continue"){advanceDay();return;}
    if(a==="open-match"){const f=state.fixtures.find(x=>x.id===action.dataset.fixture)||nextFixture();if(!f)return;state.matchPending=f.id;startMatch(f);view="match";render();return;}
    if(a==="simulate-cup-round"){const res=E.simulateDomesticCupRound(state);save();render();toast(res.message,res.ok?"success":"warning");return;}
    if(a==="simulate-continental-round"){const res=E.simulateContinentalRound(state);save();render();toast(res.message,res.ok?"success":"warning");return;}
    if(a==="open-tactics"){if(live&&!live.finished){live.wasRunningBeforeTactics=!!(live.started&&!live.paused);live.tacticsOpenedAt=live.minute;if(live.started){live.paused=true;stopMatch();}view="tactics";render();}return;}
    if(a==="return-to-match"){if(live){refreshRemainingSimulation();view="match";const resume=!!live.wasRunningBeforeTactics;live.wasRunningBeforeTactics=false;render();if(resume&&!live.finished&&!live.halfTime){live.paused=false;lastFrame=0;animateMatch();}}return;}
    if(a==="start-live-match"){beginMatch();render();return;}
    if(a==="resume-match"){if(live){live.paused=false;live.halfTime=false;lastFrame=0;animateMatch();renderMatchDynamic();}return;}
    if(a==="pause-match"){if(live){live.paused=true;stopMatch();renderMatchDynamic();}return;}
    if(a==="second-half"){if(live){live.halfDone=true;live.halfTime=false;live.paused=false;lastFrame=0;live.latest="Second half begins.";live.commentary.push({minute:46,type:"kickoff",text:live.latest});animateMatch();renderMatchDynamic();}return;}
    if(a==="speed"){if(live){live.speed=Number(action.dataset.speed)||1;state.settings.speed=live.speed;render();if(!live.paused)animateMatch();}return;}
    if(a==="finish-match"){finishLiveMatch();return;}
    if(a==="subs"){if(live){modal={type:"subs"};renderModal();}return;}
    if(a==="confirm-substitution"){confirmSubstitution();return;}
    if(a==="touchline"||a==="shout"){const shout=action.dataset.shout;if(shout==="Praise")state.morale=Math.min(100,state.morale+2);if(shout==="Fire Up"||shout==="Demand More")state.morale=Math.min(100,state.morale+1);if(shout==="Calm Down")state.morale=Math.min(100,state.morale+1);state.harmony=Math.min(100,state.harmony+(shout==="Calm Down"?2:1));if(live){live.latest="Touchline shout: "+shout+".";live.commentary.push({minute:Math.floor(live.minute),type:"shout",text:live.latest});}save();toast(shout+" — team mood updated.");return;}
    if(a==="team-talk"){const talk=action.dataset.talk;if(talk==="Encourage"||talk==="Passionate")state.morale=Math.min(100,state.morale+3);else if(talk==="Demand More")state.morale=Math.max(0,state.morale-1);else state.morale=Math.min(100,state.morale+1);if(live){live.latest="Team talk: "+talk;live.commentary.push({minute:Math.floor(live.minute),type:"talk",text:live.latest});}save();toast("Team talk applied: "+talk);return;}
    if(a==="run-training"){const res=E.train(state,state.trainingFocus||"Balanced");if(res.ok){(state.mentoringGroups||[]).forEach(g=>{const p=player(g.menteeId);if(p){p.morale=Math.min(100,p.morale+1);if(p.age<24&&p.overall<p.potential&&Math.random()<.15)p.overall++;}});state.morale=Math.min(100,state.morale+1);state.harmony=Math.min(100,state.harmony+1);}save();render();toast(res.message,res.ok?"success":"warning");return;}
    if(a==="add-mentoring"){const mentor=$("#fm-mentor")?.value,mentee=$("#fm-mentee")?.value;if(!mentor||!mentee||mentor===mentee){toast("Choose two different players.","warning");return;}state.mentoringGroups=state.mentoringGroups||[];state.mentoringGroups.push({mentorId:mentor,menteeId:mentee});save();render();toast("Mentoring group created.","success");return;}
    if(a==="assign-scout"){state.scoutAssignments=state.scoutAssignments||[];state.scoutAssignments.push({region:$("#fm-scout-region")?.value||"Europe",assignment:$("#fm-scout-assignment")?.value||"First-team players",day:state.day});addInbox("Scout assignment started","Searching "+state.scoutAssignments[state.scoutAssignments.length-1].region+" for "+state.scoutAssignments[state.scoutAssignments.length-1].assignment+".");save();render();toast("Scout assignment added.","success");return;}
    if(a==="apply-market-filters"){marketFilters={position:$("#fm-filter-position").value,age:Number($("#fm-filter-age").value)||40,value:Number($("#fm-filter-value").value)||0,attribute:$("#fm-filter-attribute").value,minimum:Number($("#fm-filter-minimum").value)||1};search=$("#fm-market-search").value||"";render();return;}
    if(a==="adjust-budget"){const res=E.adjustBudget(state,Number($("#fm-budget-shift")?.value||0));save();render();toast(res.message,res.ok?"success":"warning");return;}
    if(a==="board-request"){handleBoardRequest(action.dataset.request);return;}
    if(a==="hire-staff"){const type=$("#fm-staff-type")?.value||"Coach",rating=Number($("#fm-staff-rating")?.value||1),salary=(rating===3?8000:rating===2?4200:1800);if(state.finances.balance<salary*12){toast("Insufficient club cash for the staff contract.","warning");return;}state.finances.balance-=salary*12;state.finances.weeklyCosts+=salary;state.staff.push({id:"staff-"+Date.now(),type:type,name:["Jordan Blake","Sam Taylor","Rami Hassan","Alex Morgan"][Math.floor(Math.random()*4)],rating:rating,salary:salary});save();render();toast("Staff member hired.","success");return;}
    if(a==="fire-staff"){const s=state.staff.find(x=>x.id===action.dataset.staff);if(s){state.staff=state.staff.filter(x=>x.id!==s.id);state.finances.weeklyCosts=Math.max(0,state.finances.weeklyCosts-s.salary);save();render();toast("Staff contract released.");}return;}
    if(a==="inbox"){showModal("inbox");return;}
    if(a==="open-inbox-item"){const msg=state.inbox.find(x=>x.id===action.dataset.message);if(msg){msg.read=true;showModal("inbox");save();}return;}
    if(a==="mark-read"){const msg=state.inbox.find(x=>x.id===action.dataset.message);if(msg)msg.read=true;save();showModal("inbox");return;}
    if(a==="mark-all-read"){state.inbox.forEach(x=>x.read=true);save();showModal("inbox");return;}
    if(a==="save-now"){save();toast("Career saved to this browser.","success");return;}
    if(a==="export-save"){save();download("touchline-career-"+state.day+".json",E.exportData(state));toast("Career JSON exported.","success");return;}
    if(a==="load-file"){const input=$("#fm-import-file");if(input)input.click();else{modal=null;renderSetup();}return;}
    if(a==="new-career"){if(confirm("Start a new career? Export the current save first if you need it.")){close();state=null;open();}return;}
    if(a==="confirm-negotiate"){confirmNegotiation(action.dataset.player);return;}
    if(a==="confirm-renew"){const id=action.dataset.player;const res=E.offerRenewal(state,id,{wage:$("#fm-renew-wage").value,years:$("#fm-renew-years").value,releaseClause:$("#fm-renew-clause").value,signingBonus:$("#fm-renew-bonus").value});if(res.ok){modal=null;save();render();toast(res.message,"success");}else toast(res.message,"warning");return;}
    if(a==="confirm-sale"){const id=action.dataset.player;const res=E.sellPlayer(state,id,Number($("#fm-sale-fee").value));if(res.ok){modal=null;save();render();toast(res.message,"success");}else toast(res.message,"warning");return;}
    if(a==="import-api"){runAPIImport();return;}
    if(a==="import-api-batch"){runAPIBatchImport();return;}
    if(a==="merge-bundled-player-data"){runBundledPlayerUpgrade();return;}
    if(a==="import-fpl"){runFPLImport();return;}
  }
  function confirmNegotiation(id) {
    const offer={fee:Number($("#fm-offer-fee").value),upfront:Number($("#fm-offer-upfront").value),installmentMonths:Number($("#fm-offer-months").value),wage:Number($("#fm-offer-wage").value),years:Number($("#fm-offer-years").value),appearanceBonus:Number($("#fm-offer-appearance").value),goalBonus:Number($("#fm-offer-goal").value),sellOn:Number($("#fm-offer-sellon").value),signingBonus:Number($("#fm-offer-signing-bonus")?.value||0)};
    if(offer.upfront>offer.fee){toast("Upfront fee cannot exceed the transfer fee.","warning");return;}
    const res=E.negotiateTransfer(state,id,offer);
    if(res.ok){modal=null;save();render();toast(res.message,"success");}
    else if(res.counter){$("#fm-offer-fee").value=res.counter;toast(res.message+" Counter fee: "+money(res.counter),"warning");}
    else if(res.counterWage){$("#fm-offer-wage").value=res.counterWage;toast(res.message+" Counter wage: "+money(res.counterWage),"warning");}
    else toast(res.message,"warning");
  }
  function confirmSubstitution() {
    if(!live)return;
    if(live.subs>=5||live.windows>=3){toast("Maximum five substitutions across three stoppages reached.","warning");return;}
    const offId=$("#fm-sub-off")?.value,onId=$("#fm-sub-on")?.value,off=live.lineup.find(p=>p.id===offId),on=player(onId);
    if(!off||!on||off.id===on.id)return;
    live.lineup=live.lineup.filter(p=>p.id!==off.id).concat([Object.assign({},on,{assignedPosition:off.assignedPosition})]);
    live.subbedOut.push(off.id);live.subs++;live.windows++;
    if(live.result){
      const appeared=live.result.lineups&&(live.result.lineups[myClub().id]||(live.result.lineups[myClub().id]=[]));
      if(appeared&&!appeared.includes(on.id))appeared.push(on.id);
      const priorRating=Number(live.result.stats.ratings[off.id]||6.5);
      live.result.stats.ratings[on.id]=Number(Math.max(6.0,priorRating-.2).toFixed(1));
      live.result.events.filter(e=>e.minute>live.minute&&e.type==="goal"&&e.playerId===off.id).forEach(e=>{
        e.playerId=on.id;e.text=on.name+" scores after coming on for "+off.name+"!";
      });
      live.result.events.filter(e=>e.minute>live.minute&&e.type==="goal"&&e.assistId===off.id).forEach(e=>{
        e.assistId=on.id;e.text=e.text.replace(off.name,on.name);
      });
    }
    modal=null;render();toast("Substitution made: "+on.name+" for "+off.name+".","success");
  }
  function handleBoardRequest(kind) {
    const confidence=state.board.confidence;
    if(confidence<45&&Math.random()>.6){toast("The board rejected the request. Improve results and confidence first.","warning");return;}
    const cost=kind==="training"?8000000:kind==="youth"?6000000:0;
    if(cost>0&&state.finances.balance<cost){toast("The club cannot afford this facility upgrade.","warning");return;}
    if(kind==="transfer"){state.finances.transferBudget+=Math.max(1000000,Math.round(state.finances.balance*.06));state.board.confidence-=2;addInbox("Board investment","The board approved additional transfer funds.");}
    if(kind==="wages"){state.finances.wageBudget+=100000;state.board.confidence-=1;addInbox("Wage budget increased","The board approved a weekly payroll increase.");}
    if(kind==="training"){state.finances.balance-=cost;state.board.trainingFacilities=(state.board.trainingFacilities||1)+1;addInbox("Training facilities upgraded","Training facilities improved. Development sessions become more effective.");}
    if(kind==="youth"){state.finances.balance-=cost;state.board.youthAcademy=(state.board.youthAcademy||1)+1;addInbox("Youth academy upgraded","Youth academy investment approved.");}
    save();render();toast("Board request processed.","success");
  }
  function advanceDay() {
    if(!state)return;
    if(live&&!live.finished){toast("Finish or pause the current match before advancing the calendar.","warning");return;}
    const out=E.continueDay(state);
    if(out.match){state.matchPending=out.fixture.id;view="match";startMatch(out.fixture);save();render();toast("Match day: "+club(out.fixture.homeId).name+" vs "+club(out.fixture.awayId).name,"success");return;}
    if(state.seasonDays>0&&state.seasonDays%365===0){E.finishSeason(state);addInbox("Season rollover","New season "+state.season+" has started.");}
    save();render();
  }
  function handleChange(event) {
    const t=event.target,field=t.dataset.field,setting=t.dataset.setting;
    if(setting){if(setting==="speed")state.settings.speed=Number(t.value);else if(setting==="language"){state.settings.language=t.value==="ar"?"ar":"en";preferredLanguage=state.settings.language;try{localStorage.setItem(LANGUAGE_KEY,preferredLanguage);}catch(e){}}else state.settings[setting]=t.value;save();render();return;}
    if(field==="formation"||field==="mentality"||field==="width"||field==="tempo"||field==="passing"||field==="finalThird"||field==="line"||field==="pressing"||field==="tackling"||field==="offsideTrap"||field==="style"){
      state.tactics[field]=t.type==="checkbox"?t.checked:t.value;save();render();return;
    }
    if(field==="pressIntensity"){state.tactics.pressIntensity=Number(t.value);save();const next=t.parentNode.querySelector("b");if(next)next.textContent=t.value+"/20";return;}
    if(field==="trainingFocus"){state.trainingFocus=t.value;save();render();return;}
    if(field==="startingPlayer"){
      const slot=Number(t.dataset.slot),current=E.selectedXI(state,state.userClubId).map(p=>p.id),chosen=t.value;
      if(!Number.isInteger(slot)||slot<0||slot>=11)return;
      const duplicate=current.indexOf(chosen);
      if(duplicate>=0&&duplicate!==slot){const old=current[slot];current[slot]=chosen;current[duplicate]=old;}
      else current[slot]=chosen;
      state.tactics.startingXI=current;save();render();toast("Starting XI updated.","success");return;
    }
    if(field==="role"){state.tactics.roles[t.dataset.player]=t.value;save();return;}
    if(["captainId","viceCaptainId","penaltyId","freeKickId","cornerId"].includes(field)){state.tactics[field]=t.value||null;save();return;}
    if(t.dataset.setting==="currency"||t.dataset.setting==="wageDisplay")return;
    if(t.id==="fm-squad-sort"){const sort=t.value;state.players.filter(p=>p.clubId===state.userClubId).sort((a,b)=>sort==="age"?a.age-b.age:sort==="value"?b.value-a.value:b.overall-a.overall);render();return;}
  }
  function handleInput(event) {
    if(event.target.id==="fm-squad-search"){search=event.target.value;const pos=event.target.selectionStart;const root=$("#advanced-root");if(root){const body=$(".fm-main",root);const y=body?.scrollTop;render();const input=$("#fm-squad-search");if(input){input.focus();input.setSelectionRange(pos,pos);}if(body&&y)body.scrollTop=y;}}
    if(event.target.id==="fm-market-search"){search=event.target.value;}
  }
  function handleImportFile(event) {
    const file=event.target.files&&event.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const data=JSON.parse(String(reader.result));
        if(data.format==="touchline-advanced-save"&&data.state){state=data.state;repairState();save();view="overview";modal=null;render();toast("Career save imported.","success");return;}
        if(data.state&&data.state.schemaVersion===1&&data.state.players){state=data.state;repairState();save();render();toast("Career save imported.","success");return;}
        if(!state)state=E.newCareer({managerName:"Imported Data Manager",primaryNation:"England",nations:["England","Spain","Egypt"],databaseSize:"medium"});
        const result=E.normalizeImportedWorld(data,state);state.world.clubs=state.clubs;state.world.players=state.players;state.world.sourceSeason=data.source||"JSON import";state.world.notes=state.world.notes||[];state.world.notes.unshift("Imported "+result.playersAdded+" players and "+result.clubs+" clubs from JSON.");state.generatedCount=result.generated;save();render();toast("Import complete: "+result.playersAdded+" new players, "+result.playersUpdated+" updated; "+result.generated+" generated roster slots.","success");
      }catch(err){toast("Import failed: "+err.message,"warning");}
    };
    reader.onerror=()=>toast("Could not read this JSON file.","warning");reader.readAsText(file);event.target.value="";
  }
  function runBundledPlayerUpgrade() {
    if(!state||!E.mergeBundledRealPlayers){toast("Bundled real-player data is unavailable.","warning");return;}
    try{
      const report=E.mergeBundledRealPlayers(state);
      save();render();
      toast(report.alreadyImported?"The bundled real-player snapshot is already applied.":"Added "+report.playersAdded+" player profiles, refreshed "+report.playersUpdated+" and reconciled "+report.playersMoved+" club affiliations.","success");
    }catch(err){toast("Could not update this career: "+err.message,"warning");}
  }
  async function runFPLImport(automatic) {
    if(!state||!E.importFantasyPremierLeague)return;
    const btn=$('[data-action="import-fpl"]'),single=$('[data-action="import-api"]'),batch=$('[data-action="import-api-batch"]');
    if(btn){btn.disabled=true;btn.textContent="Loading current PL players…";}
    if(single)single.disabled=true;if(batch)batch.disabled=true;
    try{
      const result=await E.importFantasyPremierLeague(state,progress=>{
        if(btn&&progress?.message)btn.textContent=progress.message;
      });
      state.generatedCount=state.players.filter(p=>p.generated).length;
      state.fplImportedAt=new Date().toISOString();
      save();
      if(!automatic){view="settings";}
      render();
      toast("Imported "+result.sourcePlayers+" current Premier League players across "+result.sourceClubs+" clubs. Market values and wages remain estimates unless sourced.", "success");
    }catch(err){
      toast("Could not fetch current Premier League data: "+err.message+". You can retry in Settings or import a JSON/API squad file.","warning");
      if(btn){btn.disabled=false;btn.textContent="Import current Premier League players (free)";}
      if(single)single.disabled=false;if(batch)batch.disabled=false;
    }
  }
  async function runAPIImport() {
    const code=$("#fm-api-code")?.value||"PL",year=Number($("#fm-api-season")?.value||2026),token=$("#fm-api-token")?.value||"";
    if(!token){toast("Enter your football-data.org token first.","warning");return;}
    const btn=$('[data-action="import-api"]');if(btn){btn.disabled=true;btn.textContent="Importing…";}
    try{
      const result=await E.importFootballData(code,year,token,state);
      state.world.clubs=state.clubs;state.world.players=state.players;state.world.sourceSeason="football-data.org API · "+code+" "+year;state.world.notes=state.world.notes||[];state.world.notes.unshift("API import on "+state.day+": "+result.playersAdded+" players added, "+result.playersUpdated+" updated.");
      if(!state.clubs.some(c=>c.id===state.userClubId))throw new Error("Imported world no longer contains your managed club.");
      state.generatedCount=state.players.filter(p=>p.generated).length;save();render();toast("API import complete.","success");
    }catch(err){toast("API import failed: "+err.message,"warning");if(btn){btn.disabled=false;btn.textContent="Fetch competition teams & squads";}}
  }
  async function runAPIBatchImport() {
    const codes=$("#fm-api-codes")?.value||"",year=Number($("#fm-api-season")?.value||2026),token=$("#fm-api-token")?.value||"";
    if(!token){toast("Enter your football-data.org token first.","warning");return;}
    if(!codes.trim()){toast("Enter competition codes, separated by commas.","warning");return;}
    const btn=$('[data-action="import-api-batch"]'),single=$('[data-action="import-api"]');
    if(btn){btn.disabled=true;btn.textContent="Preparing import…";}
    if(single)single.disabled=true;
    try{
      const report=await E.importFootballDataBatch(codes,year,token,state,progress=>{
        if(btn){btn.textContent="Importing "+progress.code+" ("+progress.index+"/"+progress.total+")…";}
      });
      state.generatedCount=state.players.filter(p=>p.generated).length;
      state.world.realSquadCount=report.realSquads;
      state.world.realPlayerCount=state.players.filter(p=>!p.generated&&p.realData!==false).length;
      save();view="settings";render();
      const summary="Loaded "+report.successes.length+" competition(s); "+report.playersAdded+" new real players, "+report.playersUpdated+" refreshed, "+report.realSquads+" clubs with real squads. "+report.failures.length+" source error(s).";
      toast(summary,report.failures.length?"warning":"success");
      if(report.failures.length)console.warn("Squad import warnings:",report.failures);
    }catch(err){
      toast("Bulk import failed: "+err.message,"warning");
      if(btn){btn.disabled=false;btn.textContent="Import real squads from all codes";}
      if(single)single.disabled=false;
    }
  }
  function readNativeImport(data) {
    return data?.format==="touchline-advanced-save"&&data.state?data.state:null;
  }
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(modal){modal=null;const m=$("#fm-modal-root");if(m)m.innerHTML="";}else close();}});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",installLauncher);else installLauncher();
  window.FM_ADVANCED={open:open,close:close,openNewCareer:openNewCareer,getState:()=>state,createCareer:options=>{state=E.newCareer(options||{});save();return state;},render:render};
})();
