let shortcutDismissed=false;
const shortcutInstalled=()=>typeof navigator!=='undefined'&&!!(navigator.standalone||(typeof matchMedia==='function'&&matchMedia('(display-mode: standalone)').matches));
function shortcutSteps(){
 const guided=typeof location!=='undefined'&&location.hash==='#info/app';
 const iphone=typeof navigator!=='undefined'&&(/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1));
 const android=typeof navigator!=='undefined'&&/Android/i.test(navigator.userAgent);
 return '<p>Ανοίξτε το <a href="https://goneisknip.com/">goneisknip.com</a> στο πρόγραμμα περιήγησης του κινητού σας.</p><details'+(guided&&iphone?' open':'')+'><summary>iPhone · Safari</summary><ol><li>Πατήστε το κουμπί κοινής χρήσης (τετράγωνο με βέλος προς τα πάνω). Αν δεν φαίνεται, ανοίξτε πρώτα το μενού της σελίδας ή το κουμπί με τις τρεις τελείες.</li><li>Επιλέξτε «Προσθήκη στην οθόνη Αφετηρίας» (Add to Home Screen).</li><li>Πατήστε «Προσθήκη» (Add).</li></ol></details><details'+(guided&&android?' open':'')+'><summary>Android · Chrome</summary><ol><li>Ανοίξτε το μενού με τις τρεις τελείες ⋮.</li><li>Επιλέξτε «Εγκατάσταση εφαρμογής» (Install app) ή «Προσθήκη στην αρχική οθόνη» (Add to Home screen) και μετά «Εγκατάσταση». Αν εμφανίζεται ήδη εγκατεστημένη εφαρμογή, επιλέξτε να την ανοίξετε.</li><li>Επιβεβαιώστε την εγκατάσταση όταν σας ζητηθεί.</li></ol></details><p class="muted">Αν ανοίξατε τη σελίδα μέσα από το Viber, ανοίξτε την πρώτα στο Safari ή στο Chrome. Οι ονομασίες μπορεί να διαφέρουν ανάλογα με τη γλώσσα και την έκδοση του κινητού.</p>';
}
function shortcutCard(){
 let dismissed=shortcutDismissed;try{dismissed=dismissed||localStorage.getItem('school-app-intro-dismissed')==='1'}catch{}
 const installed=shortcutInstalled(),push=window.schoolNotificationState?.()||{active:false,pending:false};
 if(dismissed||(installed&&(push.active||push.pending)))return '';
 const title=installed?'Ενεργοποιήστε τις ειδοποιήσεις':'Η ιστοσελίδα μας, σαν εφαρμογή';
 const text=installed?'Νέες ανακοινώσεις και χρήσιμες υπενθυμίσεις στο κινητό σας.':'Προσθέστε την ιστοσελίδα στην αρχική οθόνη για πρόσβαση με ένα πάτημα.'+(push.active?'':' Ενεργοποιήστε και τις ειδοποιήσεις για νέες ανακοινώσεις και χρήσιμες υπενθυμίσεις.');
 return '<section class="card shortcut-card" id="home-app-intro" aria-labelledby="home-app-intro-heading"><button type="button" class="shortcut-close" id="shortcut-dismiss" aria-label="Κλείσιμο πρότασης εφαρμογής και ειδοποιήσεων">×</button><h2 id="home-app-intro-heading">'+title+'</h2><p>'+text+'</p><a class="btn" href="#info/app">Δείτε πώς →</a></section>';
}
function shortcutInfo(){
 if(shortcutInstalled())return '<section class="card info-section"><h2>1. Στην αρχική οθόνη σας</h2><p>Ανοίξατε ήδη την ιστοσελίδα σαν εφαρμογή. Συνεχίστε με τις ειδοποιήσεις παρακάτω.</p></section>';
 return '<section class="card info-section"><h2>1. Προσθήκη στην αρχική οθόνη</h2><p>Ανοίξτε την ιστοσελίδα με ένα πάτημα από το κινητό σας.</p><details'+(typeof location!=='undefined'&&location.hash==='#info/app'?' open':'')+'><summary>Δείτε πώς</summary>'+shortcutSteps()+'</details></section>';
}
function bindShortcut(){const close=document.querySelector('#shortcut-dismiss');if(close)close.onclick=()=>{shortcutDismissed=true;try{localStorage.setItem('school-app-intro-dismissed','1')}catch{}render();document.querySelector('#lunch-month')?.focus({preventScroll:true})}}
window.refreshShortcutIntro=()=>{const slot=document.querySelector('#home-app-intro-slot');if(slot){slot.innerHTML=shortcutCard();bindShortcut()}};
