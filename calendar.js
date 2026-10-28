let calendarMonth = null;
let selectedCalendarDay = null;
function eventsOnDay(day) {
  return D.events.filter(e => day >= e[0] && day <= (e[3] || e[0]));
}
function changeCalendarMonth(delta) {
  const d = dt(calendarMonth + '-01');
  d.setMonth(d.getMonth() + delta);
  calendarMonth = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  selectedCalendarDay = null;
  render();
}
function calendar() {
  if (!calendarMonth) calendarMonth = today().slice(0,7);
  const first = dt(calendarMonth + '-01');
  const count = new Date(first.getFullYear(), first.getMonth()+1, 0).getDate();
  const offset = (first.getDay()+6)%7;
  const last = `${calendarMonth}-${count}`;
  const monthEvents = D.events.filter(e => e[0] <= last && (e[3] || e[0]) >= calendarMonth+'-01').sort((a,b)=>a[0].localeCompare(b[0]));
  const upcoming = D.events.filter(e => (e[3] || e[0]) >= today()).sort((a,b)=>a[0].localeCompare(b[0]));
  const past = D.events.filter(e => (e[3] || e[0]) < today());
  const selected = selectedCalendarDay ? eventsOnDay(selectedCalendarDay) : [];
  let cells = '<span class="calendar-blank" aria-hidden="true"></span>'.repeat(offset);
  for (let n=1;n<=count;n++) {
    const day = `${calendarMonth}-${String(n).padStart(2,'0')}`;
    const events = eventsOnDay(day);
    const label = date(day,{weekday:'long',day:'numeric',month:'long'}) + (events.length ? ': '+events.map(e=>e[1]).join(', ') : ': Δεν υπάρχουν καταχωρισμένες πληροφορίες');
    cells += `<button class="calendar-day ${events.length?'has-event':''} ${day===today()?'is-today':''}" data-calendar-day="${day}" aria-label="${esc(label)}" aria-pressed="${day===selectedCalendarDay}">${n}${events.length?'<span class="event-dot" aria-hidden="true"></span>':''}</button>`;
  }
  return head('Σχολικό ημερολόγιο','Γιορτές, συναντήσεις, αργίες και σημαντικές ημερομηνίες. Πατήστε μια ημέρα για λεπτομέρειες.') +
    `<section class="card"><div class="toolbar"><button class="btn" id="calendar-prev" aria-label="Προηγούμενος μήνας">←</button><h2 class="calendar-title">${date(calendarMonth+'-01',{month:'long',year:'numeric'})}</h2><button class="btn" id="calendar-next" aria-label="Επόμενος μήνας">→</button></div><button class="btn" id="calendar-today">Τρέχων μήνας</button><div class="calendar-grid" aria-label="${date(calendarMonth+'-01',{month:'long',year:'numeric'})}">${['Δευ','Τρι','Τετ','Πεμ','Παρ','Σαβ','Κυρ'].map(d=>`<span class="calendar-weekday">${d}</span>`).join('')}${cells}</div><p class="muted">● Ημέρα με σημαντική ημερομηνία · Περίγραμμα: σήμερα</p><div aria-live="polite">${selectedCalendarDay?`<h3>${date(selectedCalendarDay,{weekday:'long',day:'numeric',month:'long'})}</h3>${selected.length?selected.map(eventCard).join(''):'<p class="muted">Δεν υπάρχουν καταχωρισμένες πληροφορίες για αυτή την ημέρα.</p>'}`:''}</div></section>` +
    `<section class="card" style="margin-top:20px"><h2>Αυτόν τον μήνα</h2>${monthEvents.length?monthEvents.map(eventCard).join(''):'<p class="muted">Δεν έχουν αναρτηθεί σημαντικές ημερομηνίες για αυτόν τον μήνα.</p>'}</section>` +
    `<section class="card" style="margin-top:20px"><h2>Σημαντικές ημερομηνίες</h2>${upcoming.length?upcoming.map(eventCard).join(''):'<p>Δεν υπάρχουν άλλες καταχωρισμένες ημερομηνίες.</p>'}</section><details><summary>Προηγούμενες ημερομηνίες (${past.length})</summary>${past.map(eventCard).join('')}</details>${source('notice')}`;
}
function bindCalendar() {
  $('#calendar-prev').onclick=()=>changeCalendarMonth(-1);
  $('#calendar-next').onclick=()=>changeCalendarMonth(1);
  $('#calendar-today').onclick=()=>{calendarMonth=today().slice(0,7);selectedCalendarDay=null;render()};
  document.querySelectorAll('[data-calendar-day]').forEach(button=>button.onclick=()=>{
    selectedCalendarDay=button.getAttribute('data-calendar-day');render();
    document.querySelector(`[data-calendar-day="${selectedCalendarDay}"]`)?.focus({preventScroll:true});
  });
}
