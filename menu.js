let menuMonth='';
function availableMenuMonths(){return [...new Set(D.menu.map(m=>m[0].slice(0,7)))].sort()}
function resetMenuPeriod(){const months=availableMenuMonths();menuMonth=months.includes(today().slice(0,7))?today().slice(0,7):months.at(-1)||'';const groups=menuWeeks();const index=groups.findIndex(g=>g.some(m=>m[0]===today()));week=index>=0?index:0}
function menuWeeks(){
 const groups=new Map();
 for(const m of D.menu){const day=dt(m[0]);day.setDate(day.getDate()-((day.getDay()+6)%7));const key=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(m)}
 return [...groups.values()].filter(g=>g.some(m=>m[0].startsWith(menuMonth))).map(g=>g.sort((a,b)=>a[0].localeCompare(b[0])));
}
function menu(){
 if(!menuMonth)resetMenuPeriod();
 const months=availableMenuMonths(),groups=menuWeeks();
 week=Math.max(0,Math.min(week,groups.length-1));
 const meals=menuView==='month'?D.menu.filter(m=>m[0].startsWith(menuMonth)):(groups[week]||[]);
 return head('Μενού σίτισης',(menuMonth?date(menuMonth+'-01',{month:'long',year:'numeric'})+' · ':'')+'Προαιρετικό ολοήμερο νηπιαγωγείο')+
 `<div class="toolbar"><label for="menu-month-select">Μήνας</label><select id="menu-month-select">${months.map(m=>`<option value="${m}" ${m===menuMonth?'selected':''}>${date(m+'-01',{month:'long',year:'numeric'})}</option>`).join('')}</select></div>`+
 `<div class="toolbar" aria-label="Προβολή μενού"><button class="btn ${menuView==='week'?'primary':''}" id="view-week" aria-pressed="${menuView==='week'}">Εβδομάδα</button><button class="btn ${menuView==='month'?'primary':''}" id="view-month" aria-pressed="${menuView==='month'}">Όλος ο μήνας</button></div>`+
 (menuView==='week'&&meals.length?`<div class="toolbar"><button class="btn" id="prev" aria-label="Προηγούμενη εβδομάδα" ${week===0?'disabled':''}>←</button><span class="week-label">${date(meals[0][0])} – ${date(meals.at(-1)[0])}</span><button class="btn" id="next" aria-label="Επόμενη εβδομάδα" ${week===groups.length-1?'disabled':''}>→</button></div>`:'')+
 (meals.length?`<div class="mealgrid">${meals.map(m=>`<article class="meal ${m[0]===today()?'current':''} ${m[1]==='Αργία'?'holiday':''}"><div><span class="day">${date(m[0],{weekday:'long'})}</span><span class="num">${date(m[0],{day:'2-digit',month:'2-digit'})}</span></div><h3>${esc(m[1])}</h3>${m[2]?`<div class="dessert">${esc(m[2])}</div>`:''}</article>`).join('')}</div>`:'<p class="empty">Δεν έχει αναρτηθεί ακόμη μενού.</p>')+
 `<details><summary>Σημειώσεις για τη σίτιση</summary><p>Τα γεύματα συνοδεύονται από ατομική σαλάτα και ψωμί, γιαούρτι και τριμμένο τυρί ανάλογα με το φαγητό της ημέρας.</p><p>Ο κιμάς είναι μοσχαρίσιος, εκτός αν αναφέρεται διαφορετικά. Για τα παιδιά που δεν τρώνε χοιρινό, το γεύμα αντικαθίσταται με κοτόπουλο.</p><p>Ενημερώστε την υπεύθυνη του ολοήμερου για αλλεργίες και διατροφικές προτιμήσεις.</p></details>${source('menu')}`;
}
function bindMenu(){
 $('#menu-month-select').onchange=e=>{menuMonth=e.target.value;week=0;render()};
 $('#view-week').onclick=()=>{menuView='week';if(location.hash==='#menu-month')location.hash='menu';else render()};
 $('#view-month').onclick=()=>{menuView='month';render()};
 if(menuView==='week'&&menuWeeks().length){$('#prev').onclick=()=>{week=Math.max(0,week-1);render()};$('#next').onclick=()=>{week=Math.min(menuWeeks().length-1,week+1);render()}};
}
