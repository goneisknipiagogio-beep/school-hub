const lostPropertyItems=[
 {
  "src": "lost-property-20261111-1.webp",
  "added": "2026-11-11",
  "width": 960,
  "height": 1280,
  "alt": "Κρεμ ζακέτα με κουκούλα, πολύχρωμες καρδιές και γράμματα."
 },
 {
  "src": "lost-property-20261111-2.webp",
  "added": "2026-11-11",
  "width": 960,
  "height": 1280,
  "alt": "Πράσινο φούτερ με κουκούλα και σχέδιο Boston Celtics."
 },
 {
  "src": "lost-property-20261111-3.webp",
  "added": "2026-11-11",
  "width": 960,
  "height": 1280,
  "alt": "Ροζ μεταλλιζέ αμάνικο μπουφάν με φερμουάρ."
 },
 {
  "src": "lost-property-20261103-4.webp",
  "width": 960,
  "height": 1191,
  "alt": "Φούξια ζακέτα με κουκούλα και σχέδιο στο στήθος."
 }
];
function lostPropertyHasNew(){return lostPropertyItems.some(item=>announcementIsNew(item.added))}
function lostPropertyNewLabel(){return lostPropertyHasNew()?'<span class="new-badge">Νέα αντικείμενα</span>':''}
function lostPropertyPage(){return head('Απολεσθέντα','Μήπως είναι δικό σας; Ζητήστε το από το σχολείο.')+'<section class="card"><div class="sample-grid lost-property-grid">'+lostPropertyItems.map((item,i)=>'<button type="button" class="sample-preview lost-property-preview" data-lost-property="'+i+'" aria-label="Μεγέθυνση φωτογραφίας '+(i+1)+(announcementIsNew(item.added)?' — Νέο αντικείμενο':'')+'">'+(announcementIsNew(item.added)?'<span class="new-badge lost-property-badge">Νέο</span>':'')+'<img src="'+item.src+'" width="'+item.width+'" height="'+item.height+'" alt="'+esc(item.alt)+'" loading="lazy" decoding="async"></button>').join('')+'</div></section>'}
function lostPropertyLink(){return '<a class="card feature info-section" href="#lost-property"><h2>Απολεσθέντα</h2>'+lostPropertyNewLabel()+'<p>Μήπως είναι δικό σας; →</p></a>'}
function bindLostProperty(){
 const buttons=document.querySelectorAll('[data-lost-property]');if(!buttons.length)return;
 const dialog=document.createElement('dialog');dialog.className='sample-lightbox';dialog.setAttribute('aria-label','Φωτογραφία απολεσθέντος αντικειμένου');
 dialog.innerHTML='<button type="button" class="btn sample-close" autofocus>Κλείσιμο ×</button><img alt="">';
 document.querySelector('#content').appendChild(dialog);let opener;
 dialog.querySelector('button').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 buttons.forEach(button=>button.onclick=()=>{const item=lostPropertyItems[Number(button.dataset.lostProperty)];if(!item)return;opener=button;const image=dialog.querySelector('img');image.src=item.src;image.alt=item.alt;dialog.showModal()});
}
