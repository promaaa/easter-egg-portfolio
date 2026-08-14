/**
 * Main Application Engine
 * 
 * Core interactive features:
 *  - Email one-click clipboard copy with feedback
 *  - Floating dock navigation observer
 *  - Work / project card click delegation
 *  - WebGL Raymarching Gradient Waves initialization
 */

(function () {
  'use strict';

  // Global reference for WebGL Waves Controller
  window.wavesController = null;

  // Clipboard copy helper with fallback
  window.copyEmail = function (btn, event) {
    if (event) {
      event.stopPropagation();
    }
    const email = 'marc.duboc.pro@proton.me';
    const applySuccess = () => {
      if (!btn) return;
      const originalText = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = '<span>Copied!</span>';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = originalText;
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(applySuccess).catch(() => {
        window.location.href = 'mailto:' + email;
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = email;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        applySuccess();
      } catch (e) {
        window.location.href = 'mailto:' + email;
      }
      document.body.removeChild(textarea);
    }
  };

  // DOMContentLoaded initialization
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Floating Dock Visibility Observer
    const dock = document.getElementById('floating-dock');
    const hero = document.querySelector('.hero-viewport');
    if (dock && hero) {
      const dockObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            dock.classList.add('is-scrolled');
          } else {
            dock.classList.remove('is-scrolled');
          }
        });
      }, { threshold: 0.1 });
      dockObserver.observe(hero);
    }

    // 2. Work / Project Card Click Delegation
    document.querySelectorAll('.work-card[data-href]').forEach((card) => {
      card.addEventListener('click', (e) => {
        const clickedLink = e.target.closest('a');
        if (clickedLink) {
          return;
        }
        const href = card.getAttribute('data-href');
        if (href) {
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      });
    });

    // 3. Initialize Native WebGL 2.0 Sine Wave Field
    const container = document.getElementById('waves-container');
    if (container && window.initGradientWaves) {
      window.wavesController = window.initGradientWaves(container, {
        horizonColor: '#5227FF',
        waveColor: '#FF9FFC',
        crestColor: '#FFFFFF',
        speed: 0.4,
        amplitude: 2.5,
        waveScale: 0.6,
        waveRatio: 0.9,
        swell: 35,
        turbulence: 20,
        tilt: 1.11,
        zoom: 1.0,
        height: 5.5,
        fogDepth: 15,
        brightness: 1.0,
        opacity: 1.0,
        grain: true,
        grainIntensity: 0.05,
        mouseInteraction: true,
        parallaxStrength: 0.5
      });
    }
  });
})();
