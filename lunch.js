let lunchOffset=0;
function lunchDate(){
 const d=dt(today());d.setDate(d.getDate()+lunchOffset);
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function lunchCard(){
 const day=lunchDate(),meal=D.menu.find(m=>m[0]===day),weekend=[0,6].includes(dt(day).getDay());
 const heading=lunchOffset===0?'Σήμερα για μεσημεριανό':lunchOffset===1?'Αύριο για μεσημεριανό':lunchOffset===-1?'Χθες για μεσημεριανό':'Μεσημεριανό ημέρας';
 const missing=weekend?'Σαββατοκύριακο · Δεν υπάρχει προγραμματισμένο γεύμα':lunchOffset===0?'Δεν έχει αναρτηθεί μενού για σήμερα':'Δεν έχει αναρτηθεί μενού για αυτή την ημέρα';
 return `<section class="card today lunch-card" id="home-lunch" aria-label="Μεσημεριανό ανά ημέρα"><div class="lunch-heading"><span class="eyebrow" style="color:#d4e2d9">${heading}</span><span class="lunch-icon" aria-hidden="true">${icon('meal')}</span></div><div class="lunch-day-nav"><button class="day-arrow" id="lunch-prev" aria-label="Προηγούμενη ημέρα"><span class="reverse-arrow">${icon('arrow')}</span></button><p class="muted" aria-live="polite">${date(day,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p><button class="day-arrow" id="lunch-next" aria-label="Επόμενη ημέρα">${icon('arrow')}</button></div><div class="${meal && meal[1].trim().toLocaleLowerCase('el-GR')==='αργία'?'lunch-holiday':'lunch-meal'}" aria-live="polite" aria-atomic="true"><h2>${meal?esc(meal[1]):missing}</h2><p class="muted">${meal?esc(meal[2]):'Δείτε τα διαθέσιμα μενού.'}</p></div><div class="lunch-actions"><a class="btn" id="lunch-month" href="#menu-month">Όλο το μενού του μήνα →</a>${lunchOffset!==0?'<button class="lunch-reset" id="lunch-today">Σήμερα</button>':''}</div></section>`;
}
function bindLunch(){
 const change=(delta,focus)=>{lunchOffset+=delta;render();$(focus)?.focus({preventScroll:true})};
 $('#lunch-prev').onclick=()=>change(-1,'#lunch-prev');
 $('#lunch-next').onclick=()=>change(1,'#lunch-next');
 if(lunchOffset!==0)$('#lunch-today').onclick=()=>{lunchOffset=0;render();$('#lunch-next')?.focus({preventScroll:true})};
 $('#lunch-month').onclick=()=>{const month=lunchDate().slice(0,7);if(availableMenuMonths().includes(month)){menuMonth=month;week=0}};
}
