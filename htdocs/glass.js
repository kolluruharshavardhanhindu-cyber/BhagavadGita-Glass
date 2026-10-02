/* Glass UI behaviour layer — header, theme, footer, scroll effects.
   Purely additive: it never touches app data or app logic. */
(function(){
  'use strict';
  var root = document.documentElement;
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  /* theme (dark is the primary experience) */
  var theme = 'dark';
  try { theme = localStorage.getItem('gitaTheme') || 'dark'; } catch(e){}
  root.setAttribute('data-theme', theme);

  function build(){
    var body = document.body;
    if (!body || document.querySelector('.g-header')) return;

    /* ambient particles (few, CSS-animated) */
    var stars = document.createElement('div');
    stars.className = 'g-stars'; stars.setAttribute('aria-hidden','true');
    for (var i=0;i<14;i++){
      var s = document.createElement('i');
      s.style.left = (Math.random()*100)+'%'; s.style.top = (Math.random()*100)+'%';
      s.style.animationDelay = (Math.random()*6)+'s';
      s.style.transform = 'scale('+(0.6+Math.random()*1.2)+')';
      stars.appendChild(s);
    }
    body.appendChild(stars);

    /* floating glass header */
    var links = [
      ['index.html','Home','home'],
      ['GitaTest.html','Sloka Test','quiz'],
      ['inspiration.html','Inspiration','auto_awesome'],
      ['aboutus.html','About','info']
    ];
    var h = document.createElement('header');
    h.className = 'g-header'; h.setAttribute('role','banner');
    var nav = links.map(function(l){
      return '<a href="'+l[0]+'"'+(page===l[0].toLowerCase()?' aria-current="page"':'')+'>'+l[1]+'</a>';
    }).join('');
    h.innerHTML =
      '<a class="g-brand" href="index.html" aria-label="Bhagavad Gita – Home"><img src="Krishna.webp" alt="" width="34" height="34"><span>Bhagavad Gita</span></a>'+
      '<nav class="g-nav" id="gNav" aria-label="Main">'+nav+'</nav>'+
      '<button class="g-icon-btn" id="gTheme" type="button" aria-label="Toggle light/dark theme"><span class="material-symbols-outlined" aria-hidden="true">'+(theme==='dark'?'light_mode':'dark_mode')+'</span></button>'+
      '<button class="g-icon-btn g-burger" id="gBurger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="gNav"><span class="material-symbols-outlined" aria-hidden="true">menu</span></button>'+
      '<div class="g-progress" aria-hidden="true"><b></b></div>';
    body.insertBefore(h, body.firstChild);

    var navEl = h.querySelector('#gNav'), burger = h.querySelector('#gBurger');
    function closeMenu(){ navEl.classList.remove('open'); burger.setAttribute('aria-expanded','false'); burger.firstChild.textContent='menu'; }
    burger.addEventListener('click', function(){
      var open = navEl.classList.toggle('open');
      burger.setAttribute('aria-expanded', open); burger.firstChild.textContent = open ? 'close' : 'menu';
    });
    navEl.addEventListener('click', function(e){ if (e.target.tagName==='A') closeMenu(); });
    document.addEventListener('keydown', function(e){ if (e.key==='Escape') closeMenu(); });
    document.addEventListener('click', function(e){ if (!h.contains(e.target)) closeMenu(); });

    h.querySelector('#gTheme').addEventListener('click', function(){
      theme = (root.getAttribute('data-theme')==='dark') ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      this.firstChild.textContent = theme==='dark' ? 'light_mode' : 'dark_mode';
      try { localStorage.setItem('gitaTheme', theme); } catch(e){}
    });

    /* scroll: header solidifies + progress bar (one rAF-throttled handler) */
    var bar = h.querySelector('.g-progress b'), ticking = false;
    function onScroll(){
      if (ticking) return; ticking = true;
      requestAnimationFrame(function(){
        var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
        h.classList.toggle('scrolled', y > 12);
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y/max) : 0) + ')';
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

    /* footer */
    var f = document.createElement('footer');
    f.className = 'g-footer';
    f.innerHTML =
      '<div><b>Bhagavad Gita</b><br>Read, listen and learn the sacred verses.</div>'+
      '<nav aria-label="Footer"><a href="index.html">Chapters</a><a href="GitaTest.html">Sloka Test</a><a href="inspiration.html">Inspiration</a><a href="aboutus.html">About</a></nav>'+
      '<div class="g-sans">© '+new Date().getFullYear()+' Bhagavad Gita · ॐ श्रीकृष्णार्पणमस्तु</div>';
    body.appendChild(f);

    /* cursor-follow glow on cards (delegated, cheap) */
    document.addEventListener('pointermove', function(e){
      var c = e.target.closest && e.target.closest('.card');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, {passive:true});

    /* reveal-on-scroll for footer / static blocks */
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(es){
        es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
      }, {threshold:.12});
      [f].concat([].slice.call(document.querySelectorAll('.wrapper .grid > .card'))).forEach(function(el){
        el.classList.add('g-reveal'); io.observe(el);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
