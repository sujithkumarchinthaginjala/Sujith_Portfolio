document.addEventListener('DOMContentLoaded', () => {

  // --- Theme Toggle ---
  const themeToggleIdx = document.getElementById('theme-toggle');
  const body = document.body;

  // Check local storage or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
    body.setAttribute('data-theme', 'light');
  } else {
    body.removeAttribute('data-theme'); // Default is dark
  }

  // --- Particle Systems ---
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');

  let width, height;
  let snowParticles = [];
  let waveParticles = [];

  // Mouse State
  let mouse = { x: -1000, y: -1000 };
  let lastMouse = { x: -1000, y: -1000 };

  // Theme-based colors
  let particleColor = 'rgba(255, 255, 255, 0.15)'; // Dark mode default

  function updateParticlesTheme() {
    const isLight = body.getAttribute('data-theme') === 'light';
    if (isLight) {
      particleColor = 'rgba(0, 0, 0, 0.4)'; // Increased visibility for light mode
    } else {
      particleColor = 'rgba(139, 92, 246, 0.6)'; // Increased visibility for dark mode
    }
  }

  themeToggleIdx.addEventListener('click', () => {
    const isLight = body.getAttribute('data-theme') === 'light';
    if (isLight) {
      body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
    updateParticlesTheme();
  });

  // Initial setup
  updateParticlesTheme();

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  // --- Snow Particle (Ambient) ---
  class SnowParticle {
    constructor() {
      this.reset();
      this.y = Math.random() * height; // Start anywhere vertically
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height * -1; // Start above screen

      this.speed = 1 + Math.random() * 2; // Constant downward speed
      this.size = 1 + Math.random() * 2;
      this.opacity = 0.4 + Math.random() * 0.4;
      this.drift = (Math.random() - 0.5) * 0.5; // Slight drift
    }

    update() {
      this.y += this.speed;
      this.x += this.drift;

      // Wrap around
      if (this.y > height) {
        this.y = -10;
        this.x = Math.random() * width;
      }
      if (this.x > width) this.x = 0;
      if (this.x < 0) this.x = width;
    }

    draw() {
      ctx.fillStyle = particleColor;
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Wave Particle (Cursor Interaction) ---
  class WaveParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 3 + 1;
      this.opacity = 1;

      // Expand/Move outward
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      this.life = 1.0; // Life factor
      this.decay = 0.01 + Math.random() * 0.01;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;

      // Fade out
      this.opacity = Math.max(0, this.life);
    }

    draw() {
      // Use theme color but maybe brighter or distinct?
      // For now use same color
      ctx.fillStyle = particleColor;
      ctx.globalAlpha = this.opacity * 0.6; // Slightly more transparent trail
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    isDead() {
      return this.life <= 0;
    }
  }

  function initSnow() {
    snowParticles = [];
    const count = Math.min(Math.floor(window.innerWidth / 10), 100);
    for (let i = 0; i < count; i++) {
      snowParticles.push(new SnowParticle());
    }
  }

  // Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update Snow
    snowParticles.forEach(p => {
      p.update();
      p.draw();
    });

    // Update Wave
    for (let i = waveParticles.length - 1; i >= 0; i--) {
      const p = waveParticles[i];
      p.update();
      p.draw();
      if (p.isDead()) {
        waveParticles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    initSnow();
  });

  // Mouse Move - Spawn Wave
  window.addEventListener('mousemove', (e) => {
    const dist = Math.sqrt(Math.pow(e.clientX - lastMouse.x, 2) + Math.pow(e.clientY - lastMouse.y, 2));

    // Only spawn if moved enough to avoid clumping
    if (dist > 5) {
      // Spawn a few particles
      for (let i = 0; i < 3; i++) {
        waveParticles.push(new WaveParticle(e.clientX, e.clientY));
      }
      lastMouse.x = e.clientX;
      lastMouse.y = e.clientY;
    }
  });

  // --- Refined Typing Effect ---
  function initTypingEffect() {
    const nameElement = document.querySelector('.hero-name');
    if (!nameElement) return;

    const fullText = nameElement.textContent;
    nameElement.textContent = ''; // Clear to rebuild

    let chars = [];
    const words = fullText.split(' ');

    words.forEach((word, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word-wrapper';

      const wordChars = word.split('').map(char => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        wordSpan.appendChild(span);
        return span;
      });

      chars = [...chars, ...wordChars];
      nameElement.appendChild(wordSpan);

      // Add a non-breaking space after each word except the last
      if (wordIdx < words.length - 1) {
        const space = document.createElement('span');
        space.className = 'char';
        space.textContent = '\u00A0';
        nameElement.appendChild(space);
        chars.push(space);
      }
    });

    // Add Cursor
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    nameElement.prepend(cursor); // Start at the beginning

    let charIndex = 0;
    let lastTime = 0;
    let typingSpeed = 70; // Base speed ms

    function type(timeStamp) {
      if (!lastTime) lastTime = timeStamp;
      const elapsed = timeStamp - lastTime;

      if (elapsed >= typingSpeed) {
        if (charIndex < chars.length) {
          chars[charIndex].classList.add('revealed');
          chars[charIndex].after(cursor); // Move cursor after the revealed char

          // Human-like rhythm variation
          const char = chars[charIndex].textContent;
          if (char === '\u00A0') {
            typingSpeed = 160 + Math.random() * 100; // Pause at spaces
          } else if (charIndex === chars.length - 1) {
            typingSpeed = 1000; // Final pause
          } else {
            typingSpeed = 40 + Math.random() * 60; // Normal variation
          }

          charIndex++;
          lastTime = timeStamp;
          requestAnimationFrame(type);
        }
      } else {
        requestAnimationFrame(type);
      }
    }

    // Initial delay before typing starts
    setTimeout(() => {
      requestAnimationFrame(type);
    }, 800);
  }

  resize();
  initSnow();
  animate();
  initTypingEffect();

  // --- Scroll Animations (Intersection Observer) ---
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // Expand separators
  const separatorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelector('.separator-line').classList.add('expand');
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.section-separator').forEach(el => {
    separatorObserver.observe(el);
  });

  // --- Active Link Highlighting ---
  const sections = document.querySelectorAll("section, header");
  const navLinks = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= sectionTop - sectionHeight / 3) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").includes(current)) {
        link.classList.add("active");
      }
    });
  });

  // --- Mobile Menu Toggle ---
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-links");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-links a").forEach(n => n.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    }));
  }

});
