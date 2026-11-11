const photographyId='photography-2026-11-12';
const photographySamples=[
 {src:'photography-sample-1.webp',width:983,height:723,alt:'Δείγμα φωτογράφισης με χριστουγεννιάτικα δέντρα, δώρα και φωτισμένο παράθυρο.'},
 {src:'photography-sample-2.webp',width:1200,height:829,alt:'Δεύτερο δείγμα του χριστουγεννιάτικου σκηνικού με δέντρα, φαναράκια και δώρα.'}
];
function photographyAnnouncement(n){return n.title==='Χριστουγεννιάτικη φωτογράφιση · 12 Νοεμβρίου'}
function announcementId(n){return photographyAnnouncement(n)?photographyId:invitationFor(n)?.id}
function photographyHomeCard(){const day=today();if(day<'2026-11-11'||day>'2026-11-12')return '';return '<section class="card info-section photography-promo"><span class="new-badge">'+(day==='2026-11-11'?'Αύριο':'Σήμερα')+'</span><h2>Χριστουγεννιάτικη φωτογράφιση</h2><p>Πέμπτη 12 Νοεμβρίου · Από τις 08:00</p><a class="btn announcement-details" href="#news/'+photographyId+'">Δείτε τα δείγματα και τις πληροφορίες →</a></section>'}
function photographyEventLink(e){return e[0]==='2026-11-12'&&e[1]==='Χριστουγεννιάτικη φωτογράφιση'?'<p><a href="#news/'+photographyId+'">Δείτε τα δείγματα →</a></p>':''}
function photographyGallery(n){if(!photographyAnnouncement(n))return '';return '<section class="photography-gallery"><h3>Δείγματα φωτογράφισης</h3><p class="muted">Ενδεικτικές φωτογραφίες από τον φωτογράφο. Πατήστε μια φωτογραφία για μεγέθυνση.</p><div class="sample-grid">'+photographySamples.map((p,i)=>'<button type="button" class="sample-preview" data-photo-sample="'+i+'" aria-label="Μεγέθυνση δείγματος '+(i+1)+'"><img src="'+p.src+'" width="'+p.width+'" height="'+p.height+'" alt="'+p.alt+'" loading="lazy" decoding="async"></button>').join('')+'</div></section>'}
function bindPhotography(){
 const buttons=document.querySelectorAll('[data-photo-sample]');if(!buttons.length)return;
 const dialog=document.createElement('dialog');dialog.className='sample-lightbox';dialog.setAttribute('aria-label','Δείγμα χριστουγεννιάτικης φωτογράφισης');
 dialog.innerHTML='<button type="button" class="btn sample-close" autofocus>Κλείσιμο ×</button><img alt="">';
 document.querySelector('#content').appendChild(dialog);
 let opener;
 dialog.querySelector('button').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 buttons.forEach(button=>button.onclick=()=>{const p=photographySamples[Number(button.dataset.photoSample)];if(!p)return;opener=button;const img=dialog.querySelector('img');img.src=p.src;img.alt=p.alt;dialog.showModal()});
}
