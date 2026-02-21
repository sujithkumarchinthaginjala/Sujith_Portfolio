document.addEventListener('DOMContentLoaded', () => {

  // --- State & Constants ---
  const body = document.body;
  const themeSwitcher = document.querySelector('.theme-switcher');
  const themeMenuBtn = document.getElementById('theme-menu-btn');
  const themeOptions = document.querySelectorAll('.theme-option');
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  const scrollBar = document.querySelector('.scroll-progress-bar');

  let width, height;
  let snowParticles = [];
  let waveParticles = [];
  let mouse = { x: -1000, y: -1000 };
  let lastMouse = { x: -1000, y: -1000 };
  let particleColor = 'rgba(139, 92, 246, 0.6)'; // Default

  const themeColors = {
    obsidian: 'rgba(139, 92, 246, 0.6)',
    midnight: 'rgba(59, 130, 246, 0.6)',
    emerald: 'rgba(16, 185, 129, 0.6)',
    rose: 'rgba(244, 63, 120, 0.6)',
    amber: 'rgba(245, 158, 11, 0.6)'
  };

  // --- Multi-Theme Engine ---
  function updateParticlesTheme(themeName) {
    particleColor = themeColors[themeName] || themeColors.obsidian;
  }

  function setTheme(themeName) {
    // Reset active state on buttons
    themeOptions.forEach(opt => opt.classList.remove('active'));

    // Apply theme attribute
    body.setAttribute('data-theme', themeName);

    // Find and activate the correct menu option
    const activeOption = document.querySelector(`.theme-option.${themeName}`);
    if (activeOption) activeOption.classList.add('active');

    // Persist
    localStorage.setItem('portfolio-theme', themeName);

    // Update visuals
    updateParticlesTheme(themeName);
  }

  // Initial Theme Load
  const savedTheme = localStorage.getItem('portfolio-theme') || 'obsidian';
  setTheme(savedTheme);

  // Toggle Menu Visibility
  if (themeMenuBtn) {
    themeMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeSwitcher.classList.toggle('active');
    });
  }

  // Handle Theme Selection
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      setTheme(theme);
      if (themeSwitcher) themeSwitcher.classList.remove('active');
    });
  });

  // Global Click to Close Menu
  document.addEventListener('click', () => {
    if (themeSwitcher) themeSwitcher.classList.remove('active');
  });

  // --- Particle Systems Logic ---
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
    nameElement.prepend(cursor);

    let charIndex = 0;
    let lastTime = 0;
    let typingSpeed = 70;

    function type(timeStamp) {
      if (!lastTime) lastTime = timeStamp;
      const elapsed = timeStamp - lastTime;

      if (elapsed >= typingSpeed) {
        if (charIndex < chars.length) {
          chars[charIndex].classList.add('revealed');
          chars[charIndex].after(cursor);

          const char = chars[charIndex].textContent;
          if (char === '\u00A0') {
            typingSpeed = 160 + Math.random() * 100;
          } else if (charIndex === chars.length - 1) {
            typingSpeed = 1000;
          } else {
            typingSpeed = 40 + Math.random() * 60;
          }

          charIndex++;
          lastTime = timeStamp;
          requestAnimationFrame(type);
        }
      } else {
        requestAnimationFrame(type);
      }
    }

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

  const separatorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const line = entry.target.querySelector('.separator-line');
        if (line) line.classList.add('expand');
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
  const navOverlay = document.querySelector(".nav-overlay");

  function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    if (navOverlay) navOverlay.classList.remove("active");
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = navMenu.classList.contains("active");
      if (isOpen) {
        closeMenu();
      } else {
        hamburger.classList.add("active");
        navMenu.classList.add("active");
        if (navOverlay) navOverlay.classList.add("active");
      }
    });

    document.querySelectorAll(".nav-links a").forEach(n => n.addEventListener("click", closeMenu));
    if (navOverlay) navOverlay.addEventListener("click", closeMenu);
  }


  // --- Custom Cursor Logic ---
  const dot = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.cursor-follower');

  let cursorX = 0, cursorY = 0, dotX = 0, dotY = 0, followerX = 0, followerY = 0;

  window.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
  });

  function animateCursor() {
    dotX += (cursorX - dotX) * 0.2;
    dotY += (cursorY - dotY) * 0.2;
    if (dot) dot.style.transform = `translate(${dotX}px, ${dotY}px)`;

    followerX += (cursorX - followerX) * 0.1;
    followerY += (cursorY - followerY) * 0.1;
    if (follower) follower.style.transform = `translate(${followerX}px, ${followerY}px)`;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const interactiveElements = document.querySelectorAll('a, button, .btn, .highlight, .holographic-card, .project-item');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => { if (follower) follower.classList.add('active'); });
    el.addEventListener('mouseleave', () => { if (follower) follower.classList.remove('active'); });
  });

  const spotlightCards = document.querySelectorAll('.holographic-card, .cert-card');
  spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });

  // --- Magnetic Interaction ---
  class Magnetic {
    constructor(el, strength = 0.3) {
      this.el = el;
      this.strength = strength;
      this.x = 0;
      this.y = 0;
      this.init();
    }
    init() {
      this.el.addEventListener('mousemove', (e) => this.onMouseMove(e));
      this.el.addEventListener('mouseleave', () => this.onMouseLeave());
    }
    onMouseMove(e) {
      const rect = this.el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      this.x = (e.clientX - centerX) * this.strength;
      this.y = (e.clientY - centerY) * this.strength;
      if (this.el.classList.contains('mag-capsule')) {
        this.el.style.setProperty('--mag-x', `${this.x}px`);
        this.el.style.setProperty('--mag-y', `${this.y}px`);
      } else {
        this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
      }
    }
    onMouseLeave() {
      if (this.el.classList.contains('mag-capsule')) {
        this.el.style.setProperty('--mag-x', `0px`);
        this.el.style.setProperty('--mag-y', `0px`);
      } else {
        this.el.style.transform = `translate(0px, 0px)`;
      }
    }
  }

  document.querySelectorAll('.btn, .logo, .social-links a, .mag-capsule').forEach(el => new Magnetic(el));

  // --- 3D Perspective ---
  document.querySelectorAll('.holographic-card, .cert-card').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });
  });

  // --- Parallax & Scroll ---
  const bgShapes = document.querySelectorAll('.shape');
  const titleFills = document.querySelectorAll('.title-fill');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    bgShapes.forEach((shape, index) => {
      const speed = (index + 1) * 0.1;
      shape.style.transform = `translateY(${scrollY * speed}px)`;
    });

    titleFills.forEach(fill => {
      const rect = fill.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = 1 - (rect.top / window.innerHeight);
        const pos = Math.min(Math.max(progress * 100, 0), 100);
        fill.style.backgroundPosition = `${100 - pos}% 0%`;
      }
    });

    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (scrollBar) scrollBar.style.width = scrolled + "%";
  });
});
