/* =====================================================================
   ATASOY — shared interactions (all pages)
   Intro timeline runs only on pages that contain [data-intro].
   ===================================================================== */
(function(){
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 620px)").matches;
  document.documentElement.classList.toggle("no-motion", prefersReduced);

  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  /* Navbar */
  var nav = document.querySelector("[data-nav]");
  var burger = document.querySelector("[data-burger]");
  var solidNav = nav && nav.hasAttribute("data-nav-solid"); // subpages: solid from start
  var lastY = window.scrollY;
  function onScroll(){
    if(!nav) return;
    var y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    // hide on scroll down, reveal on scroll up — stay visible near the top
    if (y > lastY + 6 && y > 120){ nav.classList.add("is-hidden"); }
    else if (y < lastY - 6 || y <= 120){ nav.classList.remove("is-hidden"); }
    lastY = y;
  }
  if (nav){
    if (solidNav) nav.classList.add("is-solid");
    onScroll();
    window.addEventListener("scroll", onScroll, { passive:true });
  }
  if (burger){
    burger.addEventListener("click", function(){
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav__mobile a").forEach(function(a){
      a.addEventListener("click", function(){ nav.classList.remove("is-open"); burger.setAttribute("aria-expanded","false"); });
    });
  }

  /* Contact form: friendly mailto fallback (no backend) */
  var form = document.querySelector("[data-contact-form]");
  if (form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var d = new FormData(form);
      var subj = encodeURIComponent("Anfrage über atasoyheizung.de — " + (d.get("thema")||"Allgemein"));
      var body = encodeURIComponent(
        "Name: "+(d.get("name")||"")+"\n"+
        "E-Mail: "+(d.get("email")||"")+"\n"+
        "Telefon: "+(d.get("telefon")||"")+"\n"+
        "Thema: "+(d.get("thema")||"")+"\n\n"+
        (d.get("nachricht")||""));
      window.location.href = "mailto:atasoy.heizung@outlook.de?subject="+subj+"&body="+body;
    });
  }

  function init(){
    if (!window.gsap || !window.ScrollTrigger){ revealFallback(); return; }
    gsap.registerPlugin(ScrollTrigger);
    /* Intro is now a pure-CSS auto crossfade on all viewports — no scroll-jack (buildIntro retired) */
    buildReveals();
    window.addEventListener("load", function(){ ScrollTrigger.refresh(); });
  }

  function buildIntro(){
    var layers = gsap.utils.toArray(".intro__layer");
    var scenes = gsap.utils.toArray(".intro__scene");
    var dip = document.querySelector("[data-dip]");
    var hint = document.querySelector("[data-hint]");
    if (!layers.length) return;

    var scrollLen = isMobile ? "+=180%" : "+=260%";
    var pushBig = isMobile ? 1.12 : 1.22;
    var pushMid = isMobile ? 1.08 : 1.14;
    var blurMax = isMobile ? 6 : 12;

    layers.forEach(function(l){
      var cs = getComputedStyle(l);
      var fx = (cs.getPropertyValue("--focus-x")||"50%").trim();
      var fy = (cs.getPropertyValue("--focus-y")||"50%").trim();
      gsap.set(l, { transformOrigin: fx+" "+fy, force3D:true });
    });
    gsap.set(layers[0], { opacity:1, scale:1, filter:"blur(0px)" });
    gsap.set(layers[1], { opacity:0, scale:1.06, filter:"blur("+blurMax+"px)" });
    gsap.set(layers[2], { opacity:0, scale:1.06, filter:"blur("+blurMax+"px)" });
    gsap.set(scenes[1], { opacity:0, y:30 });
    gsap.set(scenes[2], { opacity:0, y:30 });

    var EZ = "sine.inOut";   // cinematic accel/decel for camera pushes
    var XF = "power2.inOut"; // smooth dissolves
    var tl = gsap.timeline({ defaults:{ease:"none"},
      scrollTrigger:{ trigger:".intro", start:"top top", end:scrollLen,
        pin:".intro__viewport", pinSpacing:true, scrub:1.1, anticipatePin:1 }});

    /* Scene 1 — slow continuous push-in toward the shower */
    tl.to(layers[0], { scale:pushBig, duration:3.2, ease:EZ }, 0);
    tl.to(hint, { opacity:0, duration:0.5, ease:"power1.out" }, 0.15);
    tl.to(scenes[0], { opacity:0, y:-30, filter:"blur(6px)", duration:1, ease:"power2.in" }, 2.2);

    /* Transition 1 — dip through shadow → shower */
    tl.to(dip, { opacity:0.82, duration:0.9, ease:"power2.in" }, 2.6)
      .to(layers[0], { opacity:0, duration:1.1, ease:XF }, 2.85)
      .to(layers[1], { opacity:1, duration:1.1, ease:XF }, 2.85)
      .fromTo(layers[1], { filter:"blur("+blurMax+"px)" }, { filter:"blur(0px)", duration:1.3, ease:"power2.out" }, 2.95)
      .to(dip, { opacity:0, duration:1.0, ease:"power2.out" }, 3.45);

    /* Scene 2 — keep pushing in */
    tl.fromTo(layers[1], { scale:1.06 }, { scale:pushMid+0.07, duration:3.2, ease:EZ }, 2.85);
    tl.fromTo(scenes[1], { opacity:0, y:30, filter:"blur(6px)" }, { opacity:1, y:0, filter:"blur(0px)", duration:1.1, ease:"power2.out" }, 3.4);
    tl.to(scenes[1], { opacity:0, y:-30, filter:"blur(6px)", duration:1, ease:"power2.in" }, 5.0);

    /* Transition 2 — match cut via water → faucet */
    tl.to(dip, { opacity:0.88, duration:0.9, ease:"power2.in" }, 5.4)
      .to(layers[1], { opacity:0, duration:1.1, ease:XF }, 5.6)
      .to(layers[2], { opacity:1, duration:1.1, ease:XF }, 5.6)
      .fromTo(layers[2], { filter:"blur("+blurMax+"px)", scale:1.12, xPercent:5 },
                         { filter:"blur(0px)", scale:pushMid, xPercent:0, duration:1.5, ease:"power2.out" }, 5.6)
      .to(dip, { opacity:0, duration:1.0, ease:"power2.out" }, 6.25);

    /* Scene 3 — detail + clean settle */
    tl.fromTo(scenes[2], { opacity:0, y:30, filter:"blur(6px)" }, { opacity:1, y:0, filter:"blur(0px)", duration:1.1, ease:"power2.out" }, 6.15);
    tl.to(layers[2], { scale:pushMid+0.06, duration:2.4, ease:EZ }, 6.0);
    tl.to(scenes[2], { opacity:0, y:-26, filter:"blur(6px)", duration:1, ease:"power2.in" }, 7.7);
    /* NB: 3rd image stays visible to the end — no fade-to-black after it */
  }

  function buildReveals(){
    if (prefersReduced){ revealFallback(); return; }
    gsap.utils.toArray("[data-reveal]").forEach(function(el){
      ScrollTrigger.create({ trigger:el, start:"top 88%", once:true,
        onEnter:function(){ el.classList.add("is-in"); }});
    });
  }
  function revealFallback(){
    document.documentElement.classList.add("no-motion");
    document.querySelectorAll("[data-reveal]").forEach(function(el){ el.classList.add("is-in"); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  var rt;
  window.addEventListener("resize", function(){ clearTimeout(rt); rt=setTimeout(function(){ if(window.ScrollTrigger) ScrollTrigger.refresh(); },200); });
})();
