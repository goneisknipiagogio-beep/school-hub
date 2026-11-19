// Update this date whenever items are added or collected.
const lostPropertyUpdated="2026-11-19";
const lostPropertyItems=[
 {
  "src": "lost-property-20261119-1.webp",
  "added": "2026-11-19",
  "width": 960,
  "height": 1280,
  "alt": "Τζιν μπουφάν με κουμπιά και δύο τσέπες στο μπροστινό μέρος."
 },
 {
  "src": "lost-property-20261119-2.webp",
  "added": "2026-11-19",
  "width": 960,
  "height": 1280,
  "alt": "Μπορντό ζακέτα με κουκούλα και φερμουάρ."
 },
 {
  "src": "lost-property-20261119-3.webp",
  "added": "2026-11-19",
  "width": 960,
  "height": 1280,
  "alt": "Μαύρη ζακέτα Puma με φερμουάρ και λευκές λεπτομέρειες."
 }
];
function lostPropertyHasNew(){return lostPropertyItems.some(item=>announcementIsNew(item.added))}
function lostPropertyNewLabel(){return lostPropertyHasNew()?'<span class="new-badge">Νέα αντικείμενα</span>':''}
function lostPropertyPage(){return head('Απολεσθέντα','Μήπως είναι δικό σας; Ζητήστε το από το σχολείο.')+'<p class="muted lost-property-updated">Τελευταία ενημέρωση: <time datetime="'+lostPropertyUpdated+'">'+date(lostPropertyUpdated,{day:"numeric",month:"long",year:"numeric"})+'</time></p><section class="card"><div class="sample-grid lost-property-grid">'+lostPropertyItems.map((item,i)=>'<button type="button" class="sample-preview lost-property-preview" data-lost-property="'+i+'" aria-label="Μεγέθυνση φωτογραφίας '+(i+1)+(announcementIsNew(item.added)?' — Νέο αντικείμενο':'')+'">'+(announcementIsNew(item.added)?'<span class="new-badge lost-property-badge">Νέο</span>':'')+'<img src="'+item.src+'" width="'+item.width+'" height="'+item.height+'" alt="'+esc(item.alt)+'" loading="lazy" decoding="async"></button>').join('')+'</div></section>'}
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

function lostPropertyHomeCard(){return lostPropertyHasNew()?'<section class="card info-section lost-property-promo"><h2>Απολεσθέντα '+lostPropertyNewLabel()+'</h2><p>Μήπως κάποιο είναι δικό σας;</p><a class="btn announcement-details" href="#lost-property">Δείτε τα αντικείμενα →</a></section>':''}
