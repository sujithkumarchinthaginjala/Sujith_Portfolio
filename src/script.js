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

  // --- Scroll Animations (Intersection Observer) ---
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
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


  // --- Ambient Particle System ---
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];

  // Theme-based colors
  let particleColor = 'rgba(255, 255, 255, 0.15)'; // Dark mode default

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function updateParticlesTheme() {
    const isLight = body.getAttribute('data-theme') === 'light';
    if (isLight) {
      particleColor = 'rgba(0, 0, 0, 0.4)'; // Increased visibility for light mode
    } else {
      particleColor = 'rgba(139, 92, 246, 0.6)'; // Increased visibility for dark mode
    }
  }

  // Initial setup
  updateParticlesTheme();

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height; // Start anywhere vertically
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height * -1; // Start above screen
      this.speed = 1 + Math.random() * 2; // Faster downward speed for snow
      this.size = 1 + Math.random() * 2; // Varying snowflake sizes
      this.opacity = 0.6 + Math.random() * 0.4; // Increased base opacity
      this.drift = (Math.random() - 0.5) * 0.5; // Slight horizontal wind
    }

    update() {
      this.y += this.speed; // Move down
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

  function initParticles() {
    particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 10), 100); // Responsive count
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  resize();
  initParticles();
  animate();

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
