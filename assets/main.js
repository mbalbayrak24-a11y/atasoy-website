/* =====================================================================
   ATASOY — shared interactions (all pages)
   No scroll-jacking, no GSAP. Lightweight & smooth.
   ===================================================================== */
(function(){
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.toggle("no-motion", prefersReduced);

  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  /* Navbar: solid state + hide on scroll-down / reveal on scroll-up */
  var nav = document.querySelector("[data-nav]");
  var burger = document.querySelector("[data-burger]");
  var solidNav = nav && nav.hasAttribute("data-nav-solid");
  var lastY = window.scrollY;
  function onScroll(){
    if(!nav) return;
    var cy = window.scrollY;
    nav.classList.toggle("is-scrolled", cy > 40);
    if (cy > lastY + 6 && cy > 120){ nav.classList.add("is-hidden"); }
    else if (cy < lastY - 6 || cy <= 120){ nav.classList.remove("is-hidden"); }
    lastY = cy;
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

  /* Reveal on scroll — IntersectionObserver only (no scroll handlers, no jank) */
  var reveals = document.querySelectorAll("[data-reveal]");
  if (prefersReduced || !("IntersectionObserver" in window)){
    reveals.forEach(function(el){ el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin:"0px 0px -8% 0px", threshold:0.04 });
    reveals.forEach(function(el){ io.observe(el); });
  }

  /* Pause the intro slideshow when it's scrolled out of view (saves GPU, no off-screen work) */
  var intro = document.querySelector(".intro");
  if (intro && "IntersectionObserver" in window){
    var iv = new IntersectionObserver(function(entries){
      intro.classList.toggle("intro--paused", !entries[0].isIntersecting);
    }, { threshold:0 });
    iv.observe(intro);
  }
})();
