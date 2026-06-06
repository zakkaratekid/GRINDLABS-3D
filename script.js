(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const accentSets = [
    ["#ff4fa3", "#31d7ff", "#b7ff45"],
    ["#ff9d31", "#49f2c2", "#f9ff6a"],
    ["#8f6cff", "#ff5d73", "#5bf0ff"]
  ];

  function setActiveNav() {
    const current = location.pathname.split("/").pop() || "index.html";
    const page = current.startsWith("project-") ? "projects.html" : current;
    document.querySelectorAll("nav a").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === page);
    });
  }

  function addRevealEffects() {
    const items = document.querySelectorAll(".page-content, .fs-form, .project-card, .stat, .hero > *");
    items.forEach((item) => item.classList.add("reveal"));

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    items.forEach((item) => observer.observe(item));
  }

  function addTypewriter() {
    const target = document.querySelector("[data-typewriter]");
    if (!target || prefersReducedMotion) return;

    const phrases = ["print", "prototype", "ride", "invent"];
    let phraseIndex = 0;
    let letterIndex = 0;
    let deleting = false;

    function tick() {
      const phrase = phrases[phraseIndex];
      target.textContent = phrase.slice(0, letterIndex);

      if (!deleting && letterIndex < phrase.length) {
        letterIndex += 1;
      } else if (!deleting) {
        deleting = true;
        setTimeout(tick, 900);
        return;
      } else if (letterIndex > 0) {
        letterIndex -= 1;
      } else {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }

      setTimeout(tick, deleting ? 55 : 90);
    }

    tick();
  }

  function addProjectTilt() {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  function addContactCounter() {
    const message = document.querySelector("#message");
    if (!message) return;

    const counter = document.createElement("p");
    counter.className = "char-count";
    message.insertAdjacentElement("afterend", counter);

    function updateCounter() {
      counter.textContent = `${message.value.length} characters`;
    }

    message.addEventListener("input", updateCounter);
    updateCounter();
  }

  function addImageFallbacks() {
    document.querySelectorAll("img").forEach((image) => {
      function replaceBrokenImage() {
        const fallback = document.createElement("div");
        fallback.className = "image-fallback";
        fallback.textContent = image.alt || "GRINDLABS 3D project image";
        image.replaceWith(fallback);
      }

      image.addEventListener("error", replaceBrokenImage, { once: true });

      if (image.complete && image.naturalWidth === 0) {
        replaceBrokenImage();
      }
    });
  }

  function addLabPanel() {
    const panel = document.createElement("div");
    panel.className = "lab-panel";
    panel.innerHTML = `
      <button type="button" data-action="spark" title="Spark burst">+</button>
      <button type="button" data-action="grid" title="Toggle motion">G</button>
      <button type="button" data-action="accent" title="Change colours">C</button>
    `;
    document.body.append(panel);

    panel.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      if (button.dataset.action === "grid") {
        document.body.classList.toggle("grid-off");
      }

      if (button.dataset.action === "accent") {
        const set = accentSets[Math.floor(Math.random() * accentSets.length)];
        document.documentElement.style.setProperty("--pink", set[0]);
        document.documentElement.style.setProperty("--cyan", set[1]);
        document.documentElement.style.setProperty("--lime", set[2]);
      }

      if (button.dataset.action === "spark") {
        window.dispatchEvent(new CustomEvent("lab:spark"));
      }
    });
  }

  function addMotionCanvas() {
    if (prefersReducedMotion) return;

    const canvas = document.createElement("canvas");
    canvas.className = "motion-canvas";
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let particles = [];

    function resize() {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      particles = Array.from({ length: Math.min(72, Math.floor(window.innerWidth / 18)) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        r: Math.random() * 2 + 1
      }));
    }

    function spark() {
      for (let i = 0; i < 18; i += 1) {
        particles.push({
          x: pointer.x,
          y: pointer.y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          r: Math.random() * 2.5 + 1
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((particle, index) => {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 140) {
          particle.vx += dx / 5200;
          particle.vy += dy / 5200;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.992;
        particle.vy *= 0.992;

        if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
        if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fillStyle = index % 3 === 0 ? "rgba(183, 255, 69, 0.8)" : "rgba(49, 215, 255, 0.72)";
        ctx.fill();

        for (let j = index + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const gap = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (gap < 116) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.13 * (1 - gap / 116)})`;
            ctx.stroke();
          }
        }
      });

      if (particles.length > 96) particles.splice(0, particles.length - 96);
      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    });
    window.addEventListener("lab:spark", spark);

    resize();
    draw();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    addRevealEffects();
    addTypewriter();
    addProjectTilt();
    addContactCounter();
    addImageFallbacks();
    addLabPanel();
    addMotionCanvas();
  });
})();