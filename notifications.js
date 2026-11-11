// The delivery SDK is loaded only after an explicit opt-in on this device.
(()=>{
 const storageKey='school-push-consent';let sdkPromise=null,sdkReady=false,sdkFailed=false,busy=false,lastError='';
 const config=()=>window.SCHOOL_NOTIFICATIONS||{};
 const stored=()=>{try{return localStorage.getItem(storageKey)==='1'}catch{return false}};
 const remember=value=>{try{if(value)localStorage.setItem(storageKey,'1');else localStorage.removeItem(storageKey)}catch{}};
 const standalone=()=>!!navigator.standalone||matchMedia('(display-mode: standalone)').matches;
 const ios=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const supported=()=>typeof isSecureContext!=='undefined'&&isSecureContext&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;
 const subscribed=()=>{const sub=window.OneSignal?.User?.PushSubscription;return sdkReady&&Notification.permission==='granted'&&!!sub?.optedIn&&!!sub.id&&!!sub.token};
 function waitForSubscription(sdk){
  if(subscribed())return Promise.resolve();
  return new Promise((resolve,reject)=>{
   const sub=sdk.User.PushSubscription;
   const finish=()=>{if(subscribed()){clearTimeout(timer);sub.removeEventListener('change',finish);resolve()}};
   const timer=setTimeout(()=>{sub.removeEventListener('change',finish);reject(Error('registration-incomplete'))},12000);
   sub.addEventListener('change',finish);finish();
  });
 }
 async function register(sdk){await sdk.setConsentGiven(true);await sdk.User.PushSubscription.optIn();await waitForSubscription(sdk)}
 function loadSdk(){
  if(sdkPromise)return sdkPromise;
  sdkPromise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';script.async=true;
   const timer=setTimeout(()=>reject(Error('Η σύνδεση καθυστέρησε. Δοκιμάστε ξανά.')),15000);
   window.OneSignalDeferred=window.OneSignalDeferred||[];
   window.OneSignalDeferred.push(async sdk=>{
    try{
     await sdk.setConsentRequired(true);
     await sdk.init({appId:config().appId,safari_web_id:config().safariWebId,serviceWorkerPath:'OneSignalSDKWorker.js',serviceWorkerParam:{scope:'/'},notifyButton:{enable:false},welcomeNotification:{disable:true},promptOptions:{slidedown:{prompts:[{type:'push',autoPrompt:false}]}}});
     await sdk.setConsentGiven(true);
     sdkReady=true;sdkFailed=false;
     sdk.User.PushSubscription.addEventListener('change',()=>paint());
     sdk.Notifications.addEventListener('permissionChange',()=>paint());
     clearTimeout(timer);resolve(sdk);paint();
    }catch(error){clearTimeout(timer);reject(error)}
   });
   script.onerror=()=>{clearTimeout(timer);script.remove();reject(Error('Δεν ήταν δυνατή η σύνδεση. Δοκιμάστε ξανά.'))};
   document.head.appendChild(script);
  }).catch(error=>{sdkPromise=null;sdkFailed=true;throw error});
  return sdkPromise;
 }
 function card(){
  if(!config().enabled||!config().appId)return '';
  const instructions=ios()&&!standalone();
  return '<section class="card info-section" id="school-notifications"><h2>2. Ειδοποιήσεις</h2><p>Ανοίξτε την ιστοσελίδα από το εικονίδιό της και ενεργοποιήστε τις ειδοποιήσεις για νέες ανακοινώσεις και υπενθυμίσεις σημαντικών ημερομηνιών.</p>'+
   (instructions?'<p class="muted">Στο iPhone, προσθέστε πρώτα την ιστοσελίδα στην οθόνη Αφετηρίας και ανοίξτε την από το εικονίδιό της.</p><a href="#info">Οδηγίες προσθήκης στην αρχική οθόνη →</a>':supported()?'<p class="muted" data-push-status role="status" aria-live="polite"></p><button type="button" class="btn" data-push-toggle>Ενεργοποίηση ειδοποιήσεων</button>':'<p class="muted">Οι ειδοποιήσεις δεν υποστηρίζονται σε αυτό το πρόγραμμα περιήγησης. Δοκιμάστε στο Chrome ή στο Safari από την αρχική οθόνη.</p>')+
   '</section>';
 }
 function paint(){
  window.refreshShortcutIntro?.();
  const section=document.querySelector('#school-notifications');if(!section)return;
  const button=section.querySelector('[data-push-toggle]'),status=section.querySelector('[data-push-status]');if(!button)return;
  const sdk=window.OneSignal,active=subscribed();
  button.disabled=busy;
  button.className=active?'push-disable':'btn';
  button.textContent=busy?(active?'Απενεργοποίηση…':'Σύνδεση…'):active?'Απενεργοποίηση':sdkReady&&Notification.permission==='default'?'Να επιτρέπονται οι ειδοποιήσεις':stored()&&!sdk?'Σύνδεση ειδοποιήσεων…':'Ενεργοποίηση ειδοποιήσεων';
  status.className=active&&!lastError?'push-active-status':'muted';
  status.textContent=lastError||(Notification.permission==='denied'?'Οι ειδοποιήσεις είναι αποκλεισμένες. Μπορείτε να αλλάξετε την άδεια από τις ρυθμίσεις του κινητού ή του προγράμματος περιήγησης.':active?'✓ Οι ειδοποιήσεις είναι ενεργές':sdkReady&&Notification.permission==='default'?'Πατήστε για να επιτρέψετε τις ειδοποιήσεις σε αυτή τη συσκευή.':'');
  button.onclick=async()=>{
   if(busy)return;
   if(Notification.permission==='denied'){paint();return}
   if(active&&!window.confirm('Θέλετε να απενεργοποιήσετε τις ειδοποιήσεις;'))return;
   busy=true;lastError='';paint();
   try{
    if(active){await sdk.User.PushSubscription.optOut();remember(false);await sdk.setConsentGiven(false)}
    else{
     remember(true);
     if(!sdkReady){
      const ready=await loadSdk();
      // Keep permission prompting on a fresh tap, even if subscription events repaint the controls.
      if(Notification.permission==='default')return;
      await register(ready);
     }else{
      // Invoke before the first await so Chrome/Safari retain the direct user gesture.
      if(Notification.permission==='default')await sdk.Notifications.requestPermission();
      if(Notification.permission==='granted')await register(sdk);
      else{remember(false);await sdk.setConsentGiven(false)}
     }
    }
   }catch{lastError='Η ενεργοποίηση δεν ολοκληρώθηκε. Δοκιμάστε ξανά. Αν δεν εμφανιστεί αίτημα άδειας, ελέγξτε τις ειδοποιήσεις στις ρυθμίσεις του Chrome.'}finally{busy=false;paint()}
  };
 }
 window.notificationCard=card;
 window.schoolNotificationState=()=>({active:subscribed(),pending:stored()&&!sdkReady&&!sdkFailed&&supported()});
 window.bindNotifications=paint;
 window.initNotifications=()=>{
  if(!config().enabled||!config().appId||!stored()||!supported())return;
  // Returning subscribers initialise after the main page has loaded, never prompting automatically.
  addEventListener('load',()=>loadSdk().catch(()=>paint()),{once:true});
 };
})();
