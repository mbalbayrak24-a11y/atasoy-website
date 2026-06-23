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

  /* Contact form: Web3Forms (sends directly to info@atasoy-heizungsbau.de, no mail app needed) */
  var form = document.querySelector("[data-contact-form]");
  if (form){
    var statusEl = form.querySelector("[data-form-status]");
    var btn = form.querySelector("button[type=submit]");
    var btnText = btn ? btn.textContent : "";
    function setStatus(msg, ok){
      if (!statusEl) return;
      statusEl.hidden = false;
      statusEl.textContent = msg;
      statusEl.style.color = ok ? "var(--champagne, #c8a35b)" : "#e06a5a";
    }
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var data = new FormData(form);
      data.set("subject", "Anfrage über atasoy-heizungsbau.de — " + (data.get("thema")||"Allgemein"));
      if (btn){ btn.disabled = true; btn.textContent = "Wird gesendet …"; }
      setStatus("Ihre Anfrage wird gesendet …", true);
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data
      })
      .then(function(r){ return r.json(); })
      .then(function(res){
        if (res && res.success){
          form.reset();
          setStatus("Vielen Dank! Ihre Anfrage ist bei uns eingegangen – wir melden uns schnellstmöglich bei Ihnen.", true);
        } else {
          setStatus("Es gab ein Problem beim Senden. Bitte rufen Sie uns an: 07131 405 78 87.", false);
        }
      })
      .catch(function(){
        setStatus("Senden fehlgeschlagen. Bitte rufen Sie uns an: 07131 405 78 87 oder per E-Mail an info@atasoy-heizungsbau.de.", false);
      })
      .finally(function(){
        if (btn){ btn.disabled = false; btn.textContent = btnText; }
      });
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
