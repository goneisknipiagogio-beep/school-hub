const lostPropertyItems=[
 {
  "src": "lost-property-20261103-1.webp",
  "width": 960,
  "height": 1280,
  "alt": "Μπλε φούτερ με κουκούλα και σχέδιο μπάλας μπάσκετ."
 },
 {
  "src": "lost-property-20261103-2.webp",
  "width": 960,
  "height": 1253,
  "alt": "Γκρι ζακέτα με κουκούλα και φερμουάρ."
 },
 {
  "src": "lost-property-20261103-3.webp",
  "width": 960,
  "height": 1280,
  "alt": "Κόκκινη ζακέτα με κουκούλα και γράμμα S."
 },
 {
  "src": "lost-property-20261103-4.webp",
  "width": 960,
  "height": 1191,
  "alt": "Φούξια ζακέτα με κουκούλα και σχέδιο στο στήθος."
 }
];
function lostPropertyPage(){return head('Απολεσθέντα','Μήπως είναι δικό σας; Ζητήστε το από το σχολείο.')+'<section class="card"><div class="sample-grid lost-property-grid">'+lostPropertyItems.map((item,i)=>'<button type="button" class="sample-preview" data-lost-property="'+i+'" aria-label="Μεγέθυνση φωτογραφίας '+(i+1)+'"><img src="'+item.src+'" width="'+item.width+'" height="'+item.height+'" alt="'+esc(item.alt)+'" loading="lazy" decoding="async"></button>').join('')+'</div></section>'}
function lostPropertyLink(){return '<a class="card feature info-section" href="#lost-property"><h2>Απολεσθέντα</h2><p>Μήπως είναι δικό σας; →</p></a>'}
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
