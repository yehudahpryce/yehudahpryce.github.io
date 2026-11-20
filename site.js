/* Menu, scroll reveals, and the gold-dust hero (ported from the site's original hero). */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  var btn = document.getElementById('menuBtn'), nav = document.getElementById('nav');
  if (btn && nav) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  var items = [].slice.call(document.querySelectorAll('.reveal'));
  var form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, note = document.getElementById('formNote'), ok = true;
    ['first', 'last', 'email', 'message'].forEach(function (n) {
      var bad = !f[n].value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f[n].value.trim()));
      f[n].classList.toggle('bad', bad);
      if (bad && ok) { f[n].focus(); ok = false; }
    });
    note.hidden = false;
    if (!ok) { note.textContent = 'Please fill in the fields marked with *.'; return; }
    var name = f.first.value.trim() + ' ' + f.last.value.trim();
    var body = 'Name: ' + name + '\nEmail: ' + f.email.value.trim() + '\nPhone: ' + (f.phone.value.trim() || '-') + '\n\n' + f.message.value.trim();
    note.textContent = 'Your email app should now open with your message ready to send. If it does not, please call 310-300-3125.';
    window.location.href = 'mailto:' + form.getAttribute('data-u') + '@' + form.getAttribute('data-d') + '?subject=' + encodeURIComponent('Website inquiry from ' + name) + '&body=' + encodeURIComponent(body);
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add('in'); });

  var hero = document.getElementById('hero'), canvas = document.getElementById('scene');
  if (!hero || !canvas || typeof THREE === 'undefined' || !window.WebGLRenderingContext) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = Math.min(window.innerWidth, window.innerHeight) < 600;
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0b0f, 0.055);
  var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 14;
  function size() {
    var w = hero.clientWidth, h = hero.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  size();
  window.addEventListener('resize', size);

  function sprite(inner, outer) {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, inner); g.addColorStop(0.35, outer); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  var gold = sprite('rgba(255,230,180,1)', 'rgba(201,161,90,0.55)');
  var pale = sprite('rgba(240,238,255,0.9)', 'rgba(140,130,180,0.35)');
  var defs = [
    { count: small ? 500 : 1400, spread: 26, size: 0.16, opacity: 0.85, tex: gold, drift: 0.0045, rot: 0.00022 },
    { count: small ? 300 : 900, spread: 34, size: 0.30, opacity: 0.45, tex: gold, drift: 0.0028, rot: 0.00014 },
    { count: small ? 200 : 600, spread: 44, size: 0.10, opacity: 0.55, tex: pale, drift: 0.0018, rot: 0.00009 }
  ];
  var layers = defs.map(function (d) {
    var pos = new Float32Array(d.count * 3);
    for (var i = 0; i < d.count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * d.spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * d.spread;
      pos[i * 3 + 2] = (Math.random() - 0.5) * d.spread * 0.8;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({
      size: d.size, map: d.tex, transparent: true, opacity: d.opacity,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    }));
    scene.add(pts);
    return { pts: pts, d: d, half: d.spread / 2 };
  });
  var ico = new THREE.Mesh(new THREE.IcosahedronGeometry(3.2, 1), new THREE.MeshBasicMaterial({ color: 0xc9a15a, wireframe: true, transparent: true, opacity: 0.10 }));
  ico.position.set(0, 0, 2); scene.add(ico);
  var inner = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 0), new THREE.MeshBasicMaterial({ color: 0xe0bc77, wireframe: true, transparent: true, opacity: 0.06 }));
  inner.position.copy(ico.position); scene.add(inner);

  var tx = 0, ty = 0, cx = 0, cy = 0, visible = true;
  function move(x, y) { tx = (x / window.innerWidth - 0.5) * 2; ty = (y / window.innerHeight - 0.5) * 2; }
  window.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (e.touches.length) move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(hero);

  var clock = new THREE.Clock();
  function frame() {
    var t = clock.getElapsedTime();
    cx += (tx - cx) * 0.035; cy += (ty - cy) * 0.035;
    camera.position.x = cx * 1.6;
    camera.position.y = -cy * 1.1 + Math.sin(t * 0.18) * 0.25;
    camera.lookAt(scene.position);
    layers.forEach(function (l) {
      l.pts.rotation.y += l.d.rot;
      var a = l.pts.geometry.attributes.position, arr = a.array;
      for (var i = 1; i < arr.length; i += 3) { arr[i] += l.d.drift * 0.6; if (arr[i] > l.half) arr[i] = -l.half; }
      a.needsUpdate = true;
    });
    ico.rotation.y += 0.0011; ico.rotation.x += 0.0004; inner.rotation.y -= 0.0016;
    ico.scale.setScalar(1 + Math.sin(t * 0.5) * 0.03);
    renderer.render(scene, camera);
  }
  if (reduced) frame();
  else (function loop() { requestAnimationFrame(loop); if (visible && !document.hidden) frame(); })();
})();
