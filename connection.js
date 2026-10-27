// Public, read-only Google Sheet. No API keys or account credentials are used.
window.SCHOOL_CONNECTION = {
 spreadsheetId:'1EChLMgamxLXwmHuBRREZoId57VhzskICm_9Vuy40zP4',
 folderUrl:'https://drive.google.com/drive/folders/1oBVE_DIlJEZNZvB7iqEimNa585acwRQh'
};
const sheetTabs = {
 menu:['Μενού',['Ημερομηνία','Φαγητό','Επιδόρπιο']],
 news:['Ανακοινώσεις',['Ημερομηνία','Τίτλος','Κείμενο','Τμήματα','Πηγή','Ενότητα']],
 events:['Ημερολόγιο',['Ημερομηνία','Τίτλος','Λεπτομέρειες','Λήξη']],
 teachers:['Εκπαιδευτικοί',['Τμήμα','Όνομα','Ημέρα','Ώρες']],
 fees:['Σίτιση',['Μήνας','Ποσό']],
 sources:['Έγγραφα',['Κωδικός','Τίτλος','Σύνδεσμος']]
};
function sheetCell(cell) {
 if (cell?.v == null) return '';
 const value=cell.v;
 if(typeof value==='string' && /^Date\(/.test(value)) {
  const parts=value.match(/^Date\((\d+),(\d+),(\d+)/);
  if(!parts) throw Error('Μη έγκυρη ημερομηνία');
  return `${parts[1]}-${String(Number(parts[2])+1).padStart(2,'0')}-${parts[3].padStart(2,'0')}`;
 }
 return value;
}
function sheetDate(value) {
 const s=String(value).trim();
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s) || !Number.isFinite(Date.parse(s+'T12:00:00Z')) || new Date(s+'T12:00:00Z').toISOString().slice(0,10)!==s) throw Error('Χρησιμοποιήστε ημερομηνίες YYYY-MM-DD');
 return s;
}
function sheetRows(response,headers) {
 if(response.status!=='ok'||!response.table) throw Error('Το φύλλο δεν είναι διαθέσιμο');
 if(!headers.every((h,i)=>response.table.cols[i]?.label===h)) throw Error('Οι επικεφαλίδες του φύλλου έχουν αλλάξει');
 return (response.table.rows||[]).map(row=>headers.map((_,i)=>sheetCell(row.c?.[i]))).filter(row=>row.some(v=>v!==''));
}
function transformSheetData(all) {
 const text=v=>String(v??'').trim();
 const required=v=>{const s=text(v);if(!s)throw Error('Λείπει υποχρεωτικό πεδίο');return s};
 const normalizeClass=v=>text(v).toUpperCase().replace(/^A/,'Α');
 const menu=all.menu.map(r=>[sheetDate(r[0]),required(r[1]),text(r[2])]).sort((a,b)=>a[0].localeCompare(b[0]));
 if(new Set(menu.map(m=>m[0])).size!==menu.length)throw Error('Διπλή ημερομηνία στο μενού');
 const teachers=all.teachers.map(r=>({class:normalizeClass(required(r[0])),name:required(r[1]),day:required(r[2]),time:required(r[3])}));
 if(teachers.some(t=>!/^Α[1-5]$/.test(t.class))||new Set(teachers.map(t=>t.class)).size!==teachers.length)throw Error('Ελέγξτε τα τμήματα εκπαιδευτικών');
 const news=all.news.map(r=>{
  const classes=text(r[3])?text(r[3]).split(',').map(normalizeClass):[];
  if(classes.some(c=>!/^Α[1-5]$/.test(c)))throw Error('Ελέγξτε τα τμήματα της ανακοίνωσης');
  return {date:sheetDate(r[0]),title:required(r[1]),text:required(r[2]),classes,source:text(r[4]),section:['home','menu','teachers','afterschool','news','calendar','info'].includes(text(r[5]))?text(r[5]):'info'};
 }).sort((a,b)=>b.date.localeCompare(a.date));
 const events=all.events.map(r=>{const start=sheetDate(r[0]),end=r[3]?sheetDate(r[3]):'';if(end&&end<start)throw Error('Η λήξη προηγείται της έναρξης');return [start,required(r[1]),text(r[2]),end]}).sort((a,b)=>a[0].localeCompare(b[0]));
 const fees=all.fees.map(r=>{if(r[1]===''||!Number.isFinite(Number(r[1]))||Number(r[1])<0)throw Error('Μη έγκυρο ποσό σίτισης');return [required(r[0]),Number(r[1])]});
 const sources=all.sources.map(r=>{const url=new URL(required(r[2]));if(url.protocol!=='https:'||!['drive.google.com','docs.google.com'].includes(url.hostname))throw Error('Μη έγκυρος σύνδεσμος εγγράφου');return {id:required(r[0]),label:required(r[1]),file:url.href}});
 return {menu,teachers,news,events,fees,sources,preview:false};
}
let queryNumber=0;
function querySheet(tab,headers) {
 return new Promise((resolve,reject)=>{
  const name='schoolSheetResponse'+(++queryNumber);
  const script=document.createElement('script');
  const cleanup=()=>{clearTimeout(timer);script.remove();delete window[name]};
  const timer=setTimeout(()=>{cleanup();reject(Error('Λήξη χρόνου σύνδεσης'))},12000);
  window[name]=response=>{try{resolve(sheetRows(response,headers))}catch(e){reject(e)}finally{cleanup()}};
  script.onerror=()=>{cleanup();reject(Error('Αποτυχία σύνδεσης'))};
  const url=new URL('https://docs.google.com/spreadsheets/d/'+window.SCHOOL_CONNECTION.spreadsheetId+'/gviz/tq');
  url.searchParams.set('sheet',tab);url.searchParams.set('headers','1');url.searchParams.set('tqx','out:json;responseHandler:'+name);url.searchParams.set('_',String(Date.now()));
  script.src=url.href;document.head.appendChild(script);
 });
}
let schoolDataLoading=false;
let schoolDataLive=false;
async function loadSchoolData() {
 if(schoolDataLoading) return;
 schoolDataLoading=true;
 const status=document.querySelector('#data-status');
 status.textContent='Φόρτωση ενημερώσεων από το σχολικό αρχείο…';
 try {
  const entries=await Promise.all(Object.entries(sheetTabs).map(async([key,[tab,headers]])=>[key,await querySheet(tab,headers)]));
  const next=transformSheetData(Object.fromEntries(entries));
  Object.assign(window.SCHOOL_DATA,next);
  schoolDataLive=true;
  if(typeof resetMenuPeriod==='function')resetMenuPeriod();
  render();status.textContent='Οι πληροφορίες φορτώθηκαν από το σχολικό αρχείο.';
 } catch(e) {
  status.textContent=schoolDataLive?'Δεν ήταν δυνατή η ανανέωση. Εμφανίζονται τα στοιχεία που φορτώθηκαν στην αρχή αυτής της επίσκεψης.':'Δεν ήταν δυνατή η σύνδεση με το Google Sheets. Εμφανίζεται το αρχικό αποθηκευμένο αντίγραφο της 27/10/2026.';
  const retry=document.createElement('button');retry.className='btn';retry.textContent='Δοκιμή ξανά';retry.onclick=loadSchoolData;status.appendChild(retry);
  console.warn('School data could not refresh:',e.message);
 } finally {schoolDataLoading=false}
}
