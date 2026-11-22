'use strict';

// Data kota dan properti ada di data.js.


const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const icon = (name, className = '') => `<svg class="icon ${className}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const rupiah = value => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value);
const state = {city:defaultCity,mode:'dijual',category:'',galleryIndex:0,property:null};
const cityData = () => cities[state.city];
const slugOk = key => Object.prototype.hasOwnProperty.call(cities,key);
const grid = $('#property-grid');
const propertyDialog = $('#property-dialog');
const contactDialog = $('#contact-dialog');
const articleDialog = $('#article-dialog');
let toastTimeout;

function cardTemplate(property) {
  return `<article class="property-card">
    <a href="?properti=${property.id}" class="property-image-link" data-property="${property.id}">
      <img src="/assets/${property.image}.jpg" alt="Ilustrasi ${property.title}" loading="lazy" width="950" height="647">
      <span class="property-badges"><span class="badge">${property.mode === 'disewa' ? 'Disewa' : 'Dijual'}</span>${property.featured ? '<span class="badge badge-light">Pilihan Teras</span>' : property.isNew ? '<span class="badge badge-light">Proyek Baru</span>' : ''}</span>
      <span class="property-image-count">${icon('image')} ${property.gallery.length} foto ilustrasi</span>
      <span class="property-view">${icon('arrow-up')}</span>
    </a>
    <div class="property-body"><span class="property-kind">${property.type} ${property.mode}</span><div class="property-price">${property.priceLabel}${property.mode === 'disewa' ? ' <small>/ tahun</small>' : ''}</div><h3><a href="?properti=${property.id}" data-property="${property.id}">${property.title}</a></h3><p class="property-address">${icon('pin')} ${property.address}</p><div class="property-specs">${property.beds ? `<span>${icon('bed')} <b>${property.beds}</b> KT</span>` : `<span>${icon('file')} ${property.certificate}</span>`}${property.baths ? `<span>${icon('bath')} <b>${property.baths}</b> KM</span>` : ''}<span class="spec-area">${icon('area')} LT <b>${property.land}</b> m²</span>${property.building ? `<span>LB <b>${property.building}</b> m²</span>` : ''}</div></div>
  </article>`;
}

function renderProperties({announce = false} = {}) {
  const area = $('#location').value;
  const type = $('#property-type').value || state.category;
  const range = $('#price').value.split('-').map(Number);
  const filtered = properties.filter(p => {
    const modeMatch = state.mode === 'baru' ? p.isNew : p.mode === state.mode;
    return p.city === state.city && modeMatch && (!area || p.area === area) && (!type || p.type === type) && (!$('#price').value || (p.price >= range[0] && p.price <= range[1]));
  });
  const sort = $('#sort').value;
  if (sort !== 'recommended') filtered.sort((a,b) => sort === 'low' ? a.price-b.price : b.price-a.price);
  grid.innerHTML = filtered.map(cardTemplate).join('');
  $('#empty-state').hidden = filtered.length > 0;
  grid.hidden = !filtered.length;
  const filteredView = area || type || $('#price').value || state.mode !== 'dijual' || sort !== 'recommended';
  $('#results-summary').textContent = filteredView || announce ? `${filtered.length} properti ${state.mode === 'disewa' ? 'disewa' : state.mode === 'baru' ? 'proyek baru' : 'dijual'}${area ? ` di ${area}` : ` di ${cityData().name}`}${type ? ` · ${type}` : ''}` : '';
  $$('.category').forEach(button => {
    const active = button.dataset.category === type;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}

function setMode(mode) {
  state.mode = mode;
  $$('.search-tab').forEach(button => {
    const selected = button.dataset.mode === mode;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  $('#price').innerHTML = mode === 'disewa'
    ? '<option value="">Semua harga / tahun</option><option value="0-50000000">Di bawah Rp 50 juta</option><option value="50000000-100000000">Rp 50 – 100 juta</option><option value="100000000-999999999999">Di atas Rp 100 juta</option>'
    : '<option value="">Semua harga</option><option value="0-500000000">Di bawah Rp 500 juta</option><option value="500000000-1000000000">Rp 500 juta – 1 miliar</option><option value="1000000000-2000000000">Rp 1 – 2 miliar</option><option value="2000000000-999999999999">Di atas Rp 2 miliar</option>';
  renderProperties({announce:true});
}

function renderAreas() {
  const areas = cityData().areas;
  const imgs = ['area-bukit','area-marpoyan','area-tampan','area-tenayan'];
  const alts = ['Inspirasi arsitektur modern di kawasan perkotaan','Inspirasi lingkungan hunian dengan pepohonan rindang','Inspirasi rumah dengan halaman hijau','Inspirasi rumah dengan taman dan lingkungan yang tenang'];
  const cls = ['area-card area-tall','area-card','area-card','area-card area-wide'];
  const dims = ['width="720" height="960"','width="720" height="480"','width="720" height="480"','width="1440" height="480"'];
  $('#area-grid').innerHTML = areas.slice(0,4).map((a,i) => `<button class="${cls[i]}" data-area="${a.name}"><img src="/assets/${imgs[i]}.jpg" alt="${alts[i]}" loading="lazy" ${dims[i]}><span class="area-copy">${i===0?`<small>${a.kicker||'HIDUP DI TENGAH KEMUDAHAN'}</small>`:''}<strong>${a.name}</strong><span>${a.note} ${icon('arrow-up')}</span></span></button>`).join('');
  $('#location').innerHTML = '<option value="">Semua area ' + cityData().name + '</option>' + areas.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
}
function applyCity() {
  const c = cityData();
  $('#city').value = state.city;
  $$('[data-city]').forEach(el => el.textContent = c.name);
  $$('[data-city-upper]').forEach(el => el.textContent = c.name.toUpperCase());
  $$('[data-city-place]').forEach(el => el.textContent = `${c.name}, ${c.province}`);
  $('#search-form').setAttribute('aria-label', `Cari properti di ${c.name}`);
  const brand = document.querySelector('.brand'); if (brand) brand.setAttribute('aria-label', `Teras ${c.name}, beranda`);
  renderAreas();
}
function setCity(key, {updateUrl = true, reset = true} = {}) {
  if (!slugOk(key)) key = defaultCity;
  state.city = key;
  try { localStorage.setItem('teras-kota', key); } catch (e) {}
  if (updateUrl) { const url = new URL(location.href); url.searchParams.set('kota', key); history.replaceState(null, '', url); }
  applyCity();
  if (reset) { state.category = ''; $('#property-type').value = ''; $('#sort').value = 'recommended'; setMode('dijual'); }
}

function resetFilters() {
  state.category='';
  $('#location').value='';
  $('#property-type').value='';
  $('#sort').value='recommended';
  setMode('dijual');
}
function scrollToProperties() { $('#properti').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}); }

$('#search-form').addEventListener('submit', event => {
  event.preventDefault();
  state.category = $('#property-type').value;
  renderProperties({announce:true});
  scrollToProperties();
});
$$('.search-tab').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
$('.search-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const tabs=$$('.search-tab');
  const current=tabs.findIndex(tab=>tab.getAttribute('aria-selected')==='true');
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  tabs[next].focus();setMode(tabs[next].dataset.mode);
});
$$('.category').forEach(button => button.addEventListener('click', () => {
  state.category = button.dataset.category;
  $('#property-type').value = state.category;
  renderProperties({announce:true});
}));
$('#sort').addEventListener('change',() => renderProperties({announce:true}));
$('#show-all').addEventListener('click', () => { resetFilters();scrollToProperties(); });
$('#reset-filters').addEventListener('click', resetFilters);
$('#area-grid').addEventListener('click',event => {
  const button = event.target.closest('[data-area]'); if(!button)return;
  resetFilters();$('#location').value=button.dataset.area;renderProperties({announce:true});scrollToProperties();
});
$('#city').addEventListener('change',event => { setCity(event.target.value); });
$$('[data-footer-mode]').forEach(button => button.addEventListener('click',() => {
  resetFilters();setMode(button.dataset.footerMode);state.category='Rumah';$('#property-type').value='Rumah';renderProperties({announce:true});scrollToProperties();
}));
$$('[data-footer-type]').forEach(button => button.addEventListener('click',() => {
  resetFilters();state.category=button.dataset.footerType;$('#property-type').value=state.category;renderProperties({announce:true});scrollToProperties();
}));

// Menu ponsel dan navigasi.
const menuToggle=$('.menu-toggle');
function closeMenu(){ $('#main-nav').classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Buka menu'); }
menuToggle.addEventListener('click',() => {
  const opened=$('#main-nav').classList.toggle('open');
  menuToggle.setAttribute('aria-expanded',String(opened));menuToggle.setAttribute('aria-label',opened?'Tutup menu':'Buka menu');
});
$$('.nav-link').forEach(link => link.addEventListener('click',() => {
  closeMenu();$$('.nav-link').forEach(item=>item.classList.toggle('active',item===link));
}));
document.addEventListener('click',event=>{if(!$('.nav-wrap').contains(event.target))closeMenu()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});

// Galeri utama dengan kontrol manual.
const heroSlides=[{src:'hero',alt:'Inspirasi hunian modern dengan taman hijau dan ruang keluarga terbuka'},{src:'pool',alt:'Inspirasi rumah modern dengan kolam renang dan teras terbuka'},{src:'interior',alt:'Inspirasi ruang keluarga hangat dengan pencahayaan alami'}];
let heroSlide=0;
$$('[data-slide]').forEach(button=>button.addEventListener('click',()=>{
  heroSlide=(heroSlide+Number(button.dataset.slide)+heroSlides.length)%heroSlides.length;
  const slide=heroSlides[heroSlide];$('#hero-image').src=`/assets/${slide.src}.jpg`;$('#hero-image').alt=slide.alt;
  $('#slide-number').textContent=String(heroSlide+1).padStart(2,'0');
}));

function syncModalState(){document.body.classList.toggle('modal-open',$$('dialog[open]').length>0)}
function showDialog(dialog){if(!dialog.open)dialog.showModal();syncModalState();dialog.scrollTop=0;}
$$('dialog').forEach(dialog=>{
  dialog.addEventListener('close',syncModalState);
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)dialog.close();
  });
});
document.addEventListener('click',event=>{
  const closeButton=event.target.closest('[data-close]');
  if(closeButton)closeButton.closest('dialog').close();
  const propertyLink=event.target.closest('[data-property]');
  if(propertyLink && !event.metaKey && !event.ctrlKey && !event.shiftKey){event.preventDefault();openProperty(propertyLink.dataset.property)}
  const contactButton=event.target.closest('[data-contact]');
  if(contactButton)openContact(contactButton.dataset.contact,contactButton.dataset.inquiry||'');
});

function openProperty(id, updateUrl=true){
  const property=properties.find(p=>p.id===id);if(!property)return false;
  if(property.city!==state.city)setCity(property.city,{updateUrl:false});
  state.property=property;state.galleryIndex=0;
  $('#property-detail').innerHTML=`<div class="detail-gallery"><img id="detail-image" src="/assets/${property.gallery[0]}.jpg" alt="Ilustrasi ${property.title}" width="1200" height="650"><div class="gallery-controls"><span class="gallery-count" id="gallery-count">1 / ${property.gallery.length} foto ilustrasi</span><div class="gallery-buttons"><button class="icon-button" data-gallery="-1" aria-label="Foto properti sebelumnya">${icon('arrow-left')}</button><button class="icon-button" data-gallery="1" aria-label="Foto properti berikutnya">${icon('arrow-right')}</button></div></div></div><div class="detail-content"><div class="detail-main"><span class="eyebrow green">${property.type.toUpperCase()} ${property.mode.toUpperCase()} · ${cities[property.city].name.toUpperCase()}</span><h2 id="detail-title">${property.title}</h2><p class="property-address">${icon('pin')}${property.address}</p><div class="detail-specs">${property.beds?`<div>Kamar tidur<strong>${property.beds} kamar</strong></div>`:`<div>Sertifikat<strong>${property.certificate}</strong></div>`}${property.baths?`<div>Kamar mandi<strong>${property.baths} kamar</strong></div>`:''}<div>Luas tanah<strong>${property.land} m²</strong></div>${property.building?`<div>Luas bangunan<strong>${property.building} m²</strong></div>`:''}</div><h3>Ruang untuk cerita Anda</h3><p>${property.description}</p><div class="detail-features">${property.features.map(feature=>`<span>${feature}</span>`).join('')}</div><p class="detail-demo">Listing contoh. Foto adalah ilustrasi dan tidak menggambarkan properti di lokasi yang disebutkan. Harga, spesifikasi, serta sertifikat merupakan data demonstrasi.</p></div><aside class="detail-aside"><span>${property.mode==='disewa'?'Harga sewa ilustrasi':'Harga penawaran ilustrasi'}</span><div class="property-price">${property.priceLabel}${property.mode==='disewa'?' <small>/ tahun</small>':''}</div><button class="button button-dark" data-contact="${property.mode==='disewa'?'sewa':'beli'}" data-inquiry="${property.id}">Tanya properti ini ${icon('arrow-up')}</button><button class="button button-outline" id="share-property">${icon('share')} Bagikan properti</button>${property.mode==='dijual'&&property.type==='Rumah'?`<button class="button button-outline" id="detail-calculator">${icon('wallet')} Simulasi KPR</button>`:''}<p class="detail-note">Tertarik dengan konsep seperti ini? Sampaikan kebutuhan Anda melalui formulir untuk memulai konsultasi.</p></aside></div>`;
  showDialog(propertyDialog);
  if(updateUrl){const url=new URL(location.href);url.searchParams.set('properti',id);url.searchParams.set('kota',property.city);history.replaceState(null,'',url)}
  $$('[data-gallery]',propertyDialog).forEach(button=>button.addEventListener('click',()=>{
    state.galleryIndex=(state.galleryIndex+Number(button.dataset.gallery)+property.gallery.length)%property.gallery.length;
    $('#detail-image').src=`/assets/${property.gallery[state.galleryIndex]}.jpg`;
    $('#detail-image').alt=`Foto ilustrasi ${state.galleryIndex+1}, ${property.title}`;
    $('#gallery-count').textContent=`${state.galleryIndex+1} / ${property.gallery.length} foto ilustrasi`;
  }));
  $('#share-property').addEventListener('click',async()=>{
    const url=new URL(location.href);url.hash='';url.searchParams.set('properti',property.id);url.searchParams.set('kota',property.city);
    try{
      if(navigator.share){await navigator.share({title:property.title,text:'Inspirasi properti di Teras',url:url.href})}
      else if(navigator.clipboard){await navigator.clipboard.writeText(url.href);toast('Tautan properti berhasil disalin.')}
      else{toast('Salin alamat halaman ini untuk membagikan properti.')}
    }catch(error){if(error.name!=='AbortError')toast('Belum bisa membagikan. Salin tautan dari alamat halaman.')}
  });
  const calcButton=$('#detail-calculator');
  if(calcButton)calcButton.addEventListener('click',()=>{
    $('#calc-price').value=property.price;propertyDialog.close();openCalculator();
  });
  return true;
}
propertyDialog.addEventListener('close',()=>{
  const url=new URL(location.href);if(url.searchParams.has('properti')){url.searchParams.delete('properti');history.replaceState(null,'',url)}
});
window.addEventListener('popstate',()=>{
  const id=new URLSearchParams(location.search).get('properti');if(id)openProperty(id,false);else if(propertyDialog.open)propertyDialog.close();
});

function openContact(purpose='konsultasi',propertyId=''){
  $$('dialog[open]').forEach(dialog=>dialog.close());
  const form=$('#contact-form');form.reset();
  $('#contact-content').hidden=false;$('#form-success').hidden=true;$('#form-error').hidden=true;
  $('#contact-purpose').value=['beli','sewa','jual','konsultasi'].includes(purpose)?purpose:'konsultasi';
  $('#contact-property').value=propertyId;
  const prop0=properties.find(p=>p.id===propertyId);
  $('#contact-city').value=cities[prop0?prop0.city:state.city].name;
  const titles={jual:'Rumah Anda,<br><em>cerita berikutnya.</em>',beli:'Mari cari rumah<br>yang <em>tepat.</em>',sewa:'Ruang baru untuk<br>keseharian <em>Anda.</em>',konsultasi:'Ada yang bisa<br>kami <em>bantu?</em>'};
  $('#contact-title').innerHTML=titles[purpose]||titles.konsultasi;
  const property=properties.find(p=>p.id===propertyId);
  if(property)form.elements.pesan.value=`Saya tertarik dengan konsep ${property.title} di ${property.area}. Mohon informasi pilihan properti yang sesuai.`;
  showDialog(contactDialog);
}
$('#contact-form').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget;
  if(!form.reportValidity())return;
  const submit=$('button[type="submit"]',form);const label=$('span',submit);const error=$('#form-error');
  submit.disabled=true;label.textContent='Mengirim permintaan…';error.hidden=true;form.setAttribute('aria-busy','true');
  try{
    const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});
    if(!response.ok)throw new Error('submission_failed');
    $('#contact-content').hidden=true;$('#form-success').hidden=false;contactDialog.scrollTop=0;
    $('#form-success button').focus();form.reset();
  }catch{
    error.textContent='Permintaan belum berhasil dikirim. Periksa koneksi internet Anda, lalu coba lagi. Isian Anda tetap tersimpan di formulir ini.';error.hidden=false;
  }finally{submit.disabled=false;label.textContent='Kirim permintaan konsultasi';form.removeAttribute('aria-busy')}
});

function calculateMortgage(){
  const form=$('#calculator-form');if(!form.checkValidity())return;
  const price=Number($('#calc-price').value),down=Number($('#calc-down').value),rate=Number($('#calc-interest').value)/100/12,months=Number($('#calc-years').value)*12;
  const deposit=price*down/100,principal=price-deposit;
  const monthly=rate===0?principal/months:principal*rate/(1-Math.pow(1+rate,-months));
  $('#calc-result').textContent=rupiah(monthly);$('#calc-down-result').textContent=rupiah(deposit);$('#calc-loan-result').textContent=rupiah(principal);
}
function openCalculator(){calculateMortgage();showDialog($('#calculator-dialog'))}
$('#open-calculator').addEventListener('click',openCalculator);
$('#calculator-form').addEventListener('submit',event=>{event.preventDefault();calculateMortgage()});
$('#calculator-form').addEventListener('input',calculateMortgage);

const guides={
  pertama:{label:'PANDUAN MEMBELI RUMAH',title:'Rumah pertama?<br>Mulai dari <em>sini.</em>',body:'<p>Rumah pertama dimulai dari kebutuhan yang jelas. Luangkan waktu untuk menyusun prioritas sebelum jatuh hati pada sebuah foto.</p><h3>1. Kenali kebutuhan, bukan hanya keinginan</h3><p>Tentukan jumlah kamar, jarak ke tempat kerja, akses sekolah, dan lingkungan yang mendukung kegiatan sehari-hari. Buat daftar hal yang wajib ada dan hal yang masih bisa dikompromikan.</p><h3>2. Tentukan anggaran menyeluruh</h3><p>Selain harga rumah, sisihkan dana untuk uang muka, pajak, notaris, biaya bank, asuransi, renovasi, dan dana darurat. Jika memakai KPR, uji kemampuan membayar saat bunga berubah, bukan hanya saat masa promosi.</p><h3>3. Survei rumah dan lingkungan</h3><p>Datangi lokasi pada waktu berbeda. Perhatikan drainase, riwayat genangan, kualitas air, akses kendaraan, kebisingan, dan kondisi bangunan. Tanyakan batas tanah serta biaya lingkungan.</p><h3>4. Periksa dokumen sebelum membayar</h3><p>Cocokkan identitas penjual dengan sertifikat, pastikan status tanah, dan periksa PBB serta dokumen bangunan. Minta bantuan notaris atau PPAT independen sebelum menandatangani perjanjian dan mentransfer dana.</p>'},
  legalitas:{label:'PANDUAN LEGALITAS',title:'Pahami dokumennya.<br>Tenang <em>langkahnya.</em>',body:'<p>Foto yang menarik perlu dilengkapi dokumen yang jelas. Berikut beberapa istilah yang sering ditemui saat mencari properti.</p><h3>SHM — Sertifikat Hak Milik</h3><p>SHM menunjukkan hak milik atas tanah. Tetap periksa nama pemegang hak, batas, luas, catatan, serta kesesuaian data sertifikat dengan kondisi lapangan melalui PPAT dan kantor pertanahan.</p><h3>HGB — Hak Guna Bangunan</h3><p>HGB memiliki jangka waktu. Periksa sisa masa berlaku, dasar tanah, persyaratan perpanjangan, dan kemungkinan peningkatan hak. Tidak semua HGB otomatis dapat ditingkatkan menjadi SHM.</p><h3>PBG, SLF, dan PBB</h3><p>Periksa Persetujuan Bangunan Gedung (atau IMB sesuai ketentuan yang berlaku), Sertifikat Laik Fungsi bila dipersyaratkan, serta bukti pembayaran PBB. PBB adalah dokumen perpajakan dan bukan bukti kepemilikan tanah.</p><h3>Periksa status transaksi</h3><p>Pastikan properti tidak dalam sengketa, blokir, atau jaminan yang belum diselesaikan. Bila penjual diwakilkan, periksa dasar kuasanya. Hindari membayar uang tanda jadi tanpa ketentuan pengembalian dan identitas penerima yang jelas.</p>'},
  jual:{label:'PANDUAN MENJUAL PROPERTI',title:'Siap bertemu<br>cerita <em>berikutnya.</em>',body:'<p>Persiapan yang baik membantu calon pembeli memahami nilai rumah Anda dan membuat proses penjualan lebih terarah.</p><h3>1. Rapikan dokumen sejak awal</h3><p>Siapkan sertifikat, identitas pemilik, bukti PBB, dokumen bangunan, dan persetujuan pihak yang berhak bila diperlukan. Sampaikan secara terbuka jika masih ada cicilan, sengketa, atau batasan pemanfaatan.</p><h3>2. Tentukan harga dengan pembanding</h3><p>Bandingkan properti dengan lokasi, luas, kondisi, dan status hak yang serupa. Pisahkan harga penawaran dari harga transaksi yang benar-benar terjadi. Sisakan ruang negosiasi yang realistis.</p><h3>3. Tampilkan kondisi sebenarnya</h3><p>Rapikan ruangan, gunakan cahaya alami saat memotret, dan tulis spesifikasi yang akurat. Jelaskan kerusakan atau kebutuhan perbaikan agar pembeli dapat memperhitungkannya.</p><h3>4. Atur survei dan transaksi dengan jelas</h3><p>Jadwalkan kunjungan, catat kesepakatan tertulis, dan gunakan notaris atau PPAT untuk menyiapkan transaksi. Pastikan dana serta syarat pembayaran terverifikasi sebelum menyerahkan dokumen asli dan kunci.</p>'}
};
$$('[data-guide]').forEach(button=>button.addEventListener('click',()=>{
  const guide=guides[button.dataset.guide];
  $('#article-content').innerHTML=`<span class="eyebrow green">${guide.label}</span><h2 id="article-title">${guide.title}</h2>${guide.body}<p class="article-note">Panduan ini bersifat umum. Ketentuan bisa berbeda sesuai kondisi properti dan regulasi yang berlaku. Konfirmasikan dengan notaris/PPAT, bank, atau instansi terkait sebelum transaksi.</p><button class="button button-dark" data-contact="konsultasi">Diskusikan kebutuhan Anda ${icon('arrow-up')}</button>`;
  showDialog(articleDialog);
}));
$('#privacy-button').addEventListener('click',()=>{
  $('#article-content').innerHTML='<span class="eyebrow green">TERAS</span><h2 id="article-title">Privasi &amp;<br><em>data Anda.</em></h2><p>Formulir konsultasi meminta nama, nomor telepon, email opsional, kebutuhan properti, dan pesan agar pengelola website dapat menanggapi permintaan Anda.</p><h3>Penggunaan data</h3><p>Data dikirim melalui Netlify Forms dan dapat diakses oleh pengelola website. Data tidak ditampilkan secara publik. Kirim hanya informasi yang diperlukan untuk konsultasi; jangan sertakan dokumen identitas, data pembayaran, atau dokumen kepemilikan.</p><h3>Persetujuan Anda</h3><p>Dengan mencentang persetujuan dan mengirim formulir, Anda mengizinkan pengelola menghubungi Anda terkait permintaan tersebut. Untuk meminta koreksi atau penghapusan data, gunakan formulir konsultasi dengan menyebutkan permintaan Anda.</p><h3>Foto dan informasi properti</h3><p>Website ini merupakan contoh. Seluruh listing, harga, spesifikasi, dan foto adalah ilustrasi. Foto arsitektur bersumber dari Unsplash dan tidak menunjukkan lokasi properti aktual di kota yang disebutkan.</p><p class="article-note">Terakhir diperbarui: 19 November 2026.</p>';
  showDialog(articleDialog);
});
function toast(message){clearTimeout(toastTimeout);$('#toast').textContent=message;$('#toast').hidden=false;toastTimeout=setTimeout(()=>{$('#toast').hidden=true},4500)}

(function initCity(){
  let key = new URLSearchParams(location.search).get('kota');
  if(!key){ try{ key = localStorage.getItem('teras-kota'); }catch(e){} }
  const pid = new URLSearchParams(location.search).get('properti');
  const pp = pid && properties.find(p=>p.id===pid);
  if(pp) key = pp.city;
  setCity(slugOk(key)?key:defaultCity,{updateUrl:false,reset:true});
})();
renderProperties();calculateMortgage();
const initialProperty=new URLSearchParams(location.search).get('properti');
if(initialProperty && !openProperty(initialProperty,false))toast('Properti tidak ditemukan. Jelajahi pilihan lainnya.');
