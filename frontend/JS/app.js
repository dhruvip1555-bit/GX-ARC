  function showViewer(type){
    const viewer = document.getElementById('viewer');
    const img = document.getElementById('studioShot');
    const label = document.getElementById('viewerLabel');
    const toggleBtn = document.getElementById('themeToggleBtn');
    const placeholder = document.getElementById('agentPlaceholder');

    viewer.classList.remove('viewer-hidden');

    if(type === 'studio'){
      img.style.display = 'block';
      placeholder.style.display = 'none';
      toggleBtn.style.display = 'flex';
      img.src = 'studio-dark.png';
      document.getElementById('toggleIcon').textContent = '☾';
      document.getElementById('toggleLabel').textContent = 'Dark canvas';
      label.innerHTML = 'GXP_01 <span>· built in GX Studio</span>';
    } else {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
      toggleBtn.style.display = 'none';
      label.innerHTML = 'GXA_01 <span>· built in GX Agent</span>';
    }

    setTimeout(() => viewer.scrollIntoView({behavior:'smooth', block:'center'}), 30);
  }

  function closeViewer(){
    const viewer = document.getElementById('viewer');
    viewer.classList.add('viewer-hidden');
    document.getElementById('products').scrollIntoView({behavior:'smooth', block:'start'});
  }

  function openModal(e, title){
    if(e) e.preventDefault();
    document.getElementById('modalTitle').textContent = title || 'Talk to the Team';
    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('modalStatus').textContent = '';
    document.getElementById('modalStatus').className = 'modal-status';
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('modalOverlay').addEventListener('click', function(e){
    if(e.target === this) closeModal();
  });

  /* ---------- API base (same origin in production, override for dev) ---------- */
  var API_BASE = window.GX_API_BASE || '';

  function submitModal(e){
    e.preventDefault();
    var form = e.target;
    var status = document.getElementById('modalStatus');
    var submitBtn = form.querySelector('button[type="submit"]');
    var modalTitle = document.getElementById('modalTitle').textContent;

    status.textContent = 'Sending…';
    status.className = 'modal-status';
    submitBtn.disabled = true;

    /* choose endpoint by modal title */
    var endpoint = modalTitle === 'Request Access' ? '/api/request-access' : '/api/contact';

    var payload = {
      person_name:     form.person_name.value.trim(),
      contact_number:  form.contact_number.value.trim(),
      email:           form.email.value.trim(),
      company_name:    form.company_name.value.trim(),
      query:           form.query.value.trim(),
      subject:         modalTitle,
      notify:          form.notify.checked
    };

    fetch(API_BASE + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(res){ return res.json().then(function(data){ return { ok: res.ok, data: data }; }); })
    .then(function(result){
      if(result.ok){
        status.textContent = 'Request submitted successfully.';
        status.className = 'modal-status success';
        setTimeout(function(){ closeModal(); form.reset(); }, 1600);
      } else {
        status.textContent = result.data.error || 'Something went wrong. Please try again.';
        status.className = 'modal-status';
      }
    })
    .catch(function(){
      status.textContent = 'Network error — please try again.';
      status.className = 'modal-status';
    })
    .finally(function(){
      submitBtn.disabled = false;
    });

    return false;
  }

  function toggleStudioShot(){
    const img = document.getElementById('studioShot');
    const icon = document.getElementById('toggleIcon');
    const label = document.getElementById('toggleLabel');
    const isDark = img.src.includes('studio-dark');
    img.src = isDark ? 'studio-light.png' : 'studio-dark.png';
    icon.textContent = isDark ? '☀' : '☾';
    label.textContent = isDark ? 'Light canvas' : 'Dark canvas';
  }
  function toggleSiteTheme(){
    var html = document.documentElement;
    var current = html.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try{ localStorage.setItem('gx-arc-theme', next); }catch(e){}
    document.getElementById('siteThemeIcon').textContent = next === 'dark' ? '☀' : '☾';
  }
  function togglePlatform(id){
    var detail = document.getElementById('detail-' + id);
    var chip = document.getElementById('chip-' + id);
    var wasOpen = detail.classList.contains('open');

    // close all
    document.querySelectorAll('.platform-detail').forEach(function(d){ d.classList.remove('open'); });
    document.querySelectorAll('.platform-chip').forEach(function(c){ c.classList.remove('active'); });

    // if it wasn't open, open it
    if(!wasOpen){
      detail.classList.add('open');
      chip.classList.add('active');
      setTimeout(function(){ detail.scrollIntoView({behavior:'smooth', block:'nearest'}); }, 80);
    }
  }

  function toggleModel(id){
    var detail = document.getElementById('mdetail-' + id);
    var card = document.getElementById('mcard-' + id);
    var wasOpen = detail.classList.contains('open');

    // close all
    document.querySelectorAll('.model-detail').forEach(function(d){ d.classList.remove('open'); });
    document.querySelectorAll('.category-card').forEach(function(c){ c.classList.remove('active'); });

    if(!wasOpen){
      detail.classList.add('open');
      card.classList.add('active');
      setTimeout(function(){ detail.scrollIntoView({behavior:'smooth', block:'nearest'}); }, 80);
    }
  }

  (function(){
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    document.addEventListener('DOMContentLoaded', function(){
      document.getElementById('siteThemeIcon').textContent = current === 'dark' ? '☀' : '☾';
    });
  })();
