// The delivery SDK is loaded only after an explicit opt-in on this device.
(()=>{
 const storageKey='school-push-consent';let sdkPromise=null,sdkReady=false,sdkFailed=false,busy=false,lastError='',manage=false,dialogView='';
 const bellIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>';
 const config=()=>window.SCHOOL_NOTIFICATIONS||{};
 const stored=()=>{try{return localStorage.getItem(storageKey)==='1'}catch{return false}};
 const remember=value=>{try{if(value)localStorage.setItem(storageKey,'1');else localStorage.removeItem(storageKey)}catch{}};
 const standalone=()=>!!navigator.standalone||matchMedia('(display-mode: standalone)').matches;
 const ios=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const supported=()=>typeof isSecureContext!=='undefined'&&isSecureContext&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;
 const permission=()=>typeof Notification==='undefined'?'default':Notification.permission;
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
  paintBell();
  const section=document.querySelector('#school-notifications');if(!section)return;
  const button=section.querySelector('[data-push-toggle]'),status=section.querySelector('[data-push-status]');if(!button)return;
  const sdk=window.OneSignal,active=subscribed();
  button.disabled=busy;
  button.className=active?'push-disable':'btn';
  button.textContent=busy?(active?'Απενεργοποίηση…':'Σύνδεση…'):active?'Απενεργοποίηση':sdkReady&&Notification.permission==='default'?'Να επιτρέπονται οι ειδοποιήσεις':stored()&&!sdk?'Σύνδεση ειδοποιήσεων…':'Ενεργοποίηση ειδοποιήσεων';
  status.className=active&&!lastError?'push-active-status':'muted';
  status.textContent=lastError||(Notification.permission==='denied'?'Οι ειδοποιήσεις είναι αποκλεισμένες. Μπορείτε να αλλάξετε την άδεια από τις ρυθμίσεις του κινητού ή του προγράμματος περιήγησης.':active?'✓ Οι ειδοποιήσεις είναι ενεργές':sdkReady&&Notification.permission==='default'?'Πατήστε για να επιτρέψετε τις ειδοποιήσεις σε αυτή τη συσκευή.':'');
  button.onclick=toggle;
 }
 async function toggle(){
   const sdk=window.OneSignal,active=subscribed();
   if(busy)return;
   if(!supported()||permission()==='denied'){paint();return}
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
 }
 function paintBell(){
  const bell=document.querySelector('#school-notification-open');if(!bell)return;
  bell.hidden=!config().enabled||!config().appId;if(bell.hidden)return;
  const active=subscribed(),pending=busy||(stored()&&!sdkReady&&!sdkFailed&&supported());
  bell.className='bell-open'+(active?' is-active':'');
  bell.innerHTML=bellIcon+(active?'<span class="bell-check" aria-hidden="true">✓</span>':'');
  bell.setAttribute('aria-label',active?'Ειδοποιήσεις ενεργές':pending?'Σύνδεση ειδοποιήσεων':'Ειδοποιήσεις');
  bell.title=active?'Οι ειδοποιήσεις είναι ενεργές':'Ειδοποιήσεις';
  bell.onclick=()=>{
   let dialog=document.querySelector('#school-notification-dialog');
   if(!dialog){dialog=document.createElement('dialog');dialog.id='school-notification-dialog';dialog.className='bell-dialog';dialog.setAttribute('aria-labelledby','bell-title');document.body.appendChild(dialog);
    dialog.addEventListener('close',()=>{manage=false;bell.focus()});
    dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
   }
   manage=false;dialogView='';paintDialog(dialog);if(!dialog.open)dialog.showModal();
  };
  const dialog=document.querySelector('#school-notification-dialog');if(dialog?.open)paintDialog(dialog);
 }
 function paintDialog(dialog){
  const active=subscribed(),instructions=ios()&&!standalone(),pending=busy||(stored()&&!sdkReady&&!sdkFailed&&supported());
  const view=active?(manage?'manage':'active'):instructions?'ios':!supported()?'unsupported':permission()==='denied'?'denied':pending?'pending':sdkReady&&permission()==='default'?'permission':'inactive';
  // Keep the focused button in place while subscription events update its status.
  if(dialogView!==view){
   const hadFocus=dialog.contains(document.activeElement);dialogView=view;
   const title=active?(manage?'Διαχείριση ειδοποιήσεων':'Οι ειδοποιήσεις σας είναι ενεργές'):'Μείνετε ενήμεροι';
   let content;
   if(active)content='<p class="bell-success">✓ Ενεργές σε αυτή τη συσκευή</p>'+(manage?'<p>Θέλετε να σταματήσετε να λαμβάνετε ειδοποιήσεις σε αυτή τη συσκευή;</p><button type="button" class="btn primary" data-bell-keep>Να παραμείνουν ενεργές</button><button type="button" class="bell-manage" data-bell-toggle>Απενεργοποίηση ειδοποιήσεων</button>':'<p>Θα λαμβάνετε νέες ανακοινώσεις και υπενθυμίσεις για επιλεγμένες σημαντικές ημερομηνίες.</p><button type="button" class="btn primary" data-bell-done>Εντάξει</button><button type="button" class="bell-manage" data-bell-manage>Διαχείριση ειδοποιήσεων</button>');
   else if(instructions)content='<p>Για να λαμβάνετε ειδοποιήσεις στο iPhone, προσθέστε πρώτα την ιστοσελίδα στην οθόνη Αφετηρίας.</p><ol><li>Στο Safari, πατήστε Κοινή χρήση.</li><li>Επιλέξτε «Προσθήκη στην οθόνη Αφετηρίας».</li><li>Ανοίξτε την από το νέο εικονίδιο και πατήστε το καμπανάκι.</li></ol><button type="button" class="btn primary" data-bell-done>Εντάξει</button>';
   else if(!supported())content='<p>Οι ειδοποιήσεις δεν υποστηρίζονται σε αυτό το πρόγραμμα περιήγησης. Δοκιμάστε στο Chrome ή στο Safari από την αρχική οθόνη.</p><button type="button" class="btn primary" data-bell-done>Εντάξει</button>';
   else if(permission()==='denied')content='<p>Οι ειδοποιήσεις είναι αποκλεισμένες. Επιτρέψτε τις ειδοποιήσεις για το goneisknip.com από τις ρυθμίσεις του προγράμματος περιήγησης και ελέγξτε ότι είναι ενεργές και στις ρυθμίσεις της συσκευής.</p><button type="button" class="btn primary" data-bell-done>Εντάξει</button>';
   else content='<p>Ενεργοποιήστε τις ειδοποιήσεις για νέες ανακοινώσεις και υπενθυμίσεις σημαντικών ημερομηνιών.</p><button type="button" class="btn primary" data-bell-toggle'+(pending?' disabled':'')+'>'+(pending?'Σύνδεση…':view==='permission'?'Να επιτρέπονται οι ειδοποιήσεις':'Ενεργοποίηση ειδοποιήσεων')+'</button><small>Προαιρετικά, μόνο σε αυτή τη συσκευή. Μπορείτε να τις απενεργοποιήσετε όποτε θέλετε.</small>';
   dialog.innerHTML='<button type="button" class="bell-close" aria-label="Κλείσιμο">×</button><div class="bell-emblem">'+bellIcon+'</div><h2 id="bell-title">'+title+'</h2>'+content+'<p class="bell-error" data-bell-status role="status" aria-live="polite"></p>';
   dialog.querySelector('.bell-close').onclick=()=>dialog.close();
   const action=dialog.querySelector('[data-bell-toggle]');if(action)action.onclick=toggle;
   const done=dialog.querySelector('[data-bell-done]');if(done)done.onclick=()=>dialog.close();
   const settings=dialog.querySelector('[data-bell-manage]');if(settings)settings.onclick=()=>{manage=true;paintDialog(dialog)};
   const keep=dialog.querySelector('[data-bell-keep]');if(keep)keep.onclick=()=>dialog.close();
   if(hadFocus)(dialog.querySelector('[data-bell-toggle]:not(:disabled),[data-bell-keep],[data-bell-done]')||dialog.querySelector('.bell-close')).focus();
  }
  const action=dialog.querySelector('[data-bell-toggle]');if(action)action.disabled=pending;
  dialog.querySelector('[data-bell-status]').textContent=lastError;
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
