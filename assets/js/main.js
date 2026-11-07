import { CONFIG } from './config.js?v=88.0';
import { i18n } from './i18n.js?v=88.0';
import { AdmissionAdvisor } from './advisor.js?v=88.0';
import { CostCalculator } from './calculator.js?v=88.0';
import { ChatbotAdvisor } from './chatbot.js?v=88.0';

const initApp = async () => {
  setupLanguageSwitcher();
  setupHeader();
  setupMobileNav();
  setupToolTabs();
  setupWhatsAppButtons();
  setupStatsCounter();
  setupSliders();

  await i18n.loadLanguage(i18n.detectLanguage());

  const advisor = new AdmissionAdvisor();
  await advisor.init();

  const calculator = new CostCalculator();
  await calculator.init();

  const chatbot = new ChatbotAdvisor();
  await chatbot.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function setupMobileNav() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const closeBtn = document.getElementById('mobile-drawer-close');

  if (!hamburgerBtn || !drawer || !backdrop) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Mobile Accordion dropdowns
  document.querySelectorAll('.mobile-accordion-toggle').forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = toggle.closest('.mobile-nav-item');
      if (!parent) return;
      const isOpen = parent.classList.contains('open');

      document.querySelectorAll('.mobile-nav-item.has-accordion').forEach((item) => {
        if (item !== parent) {
          item.classList.remove('open');
          const t = item.querySelector('.mobile-accordion-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      parent.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Close drawer on link click
  document.querySelectorAll('.mobile-sub-link, .mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });
}

function setupLanguageSwitcher() {
  const langSelectors = document.querySelectorAll('.lang-selector');

  langSelectors.forEach((selector) => {
    const btn = selector.querySelector('.lang-btn');
    const menu = selector.querySelector('.lang-menu');
    if (!btn || !menu) return;

    const items = Array.from(menu.querySelectorAll('.lang-item button'));

    const updateActiveItem = (currentLang) => {
      const activeLang = currentLang || i18n.currentLang || 'id';
      items.forEach((itemBtn) => {
        const isActive = itemBtn.getAttribute('data-lang') === activeLang;
        itemBtn.classList.toggle('active', isActive);
        if (isActive) {
          itemBtn.setAttribute('aria-current', 'true');
        } else {
          itemBtn.removeAttribute('aria-current');
        }
      });
    };

    updateActiveItem(i18n.currentLang);
    window.addEventListener('languageChanged', (e) => {
      updateActiveItem(e.detail?.lang || i18n.currentLang);
    });

    const openMenu = () => {
      selector.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      const activeItem = items.find((i) => i.classList.contains('active')) || items[0];
      if (activeItem) activeItem.focus();
    };

    const closeMenu = (returnFocus = false) => {
      if (selector.classList.contains('open')) {
        selector.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        if (returnFocus) btn.focus();
      }
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selector.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      }
    });

    items.forEach((itemBtn, index) => {
      itemBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const selectedLang = itemBtn.getAttribute('data-lang');
        if (selectedLang) {
          await i18n.loadLanguage(selectedLang);
          closeMenu(true);
          const url = new URL(window.location);
          url.searchParams.set('lang', selectedLang);
          window.history.pushState({}, '', url);
        }
      });

      itemBtn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[(index + 1) % items.length].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          items[(index - 1 + items.length) % items.length].focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          items[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeMenu(true);
        } else if (e.key === 'Tab') {
          closeMenu(false);
        }
      });
    });
  });

  document.addEventListener('click', (e) => {
    langSelectors.forEach((selector) => {
      if (!selector.contains(e.target)) {
        selector.classList.remove('open');
        const btn = selector.querySelector('.lang-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      langSelectors.forEach((selector) => {
        if (selector.classList.contains('open')) {
          selector.classList.remove('open');
          const btn = selector.querySelector('.lang-btn');
          if (btn) {
            btn.setAttribute('aria-expanded', 'false');
            btn.focus();
          }
        }
      });
    }
  });
}

function setupHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let isScrolled = false;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset || 0;
        if (!isScrolled && scrollY > 50) {
          isScrolled = true;
          header.classList.add('scrolled');
        } else if (isScrolled && scrollY < 20) {
          isScrolled = false;
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function setupToolTabs() {
  document.querySelectorAll('[data-tool-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tool-tab');
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('tool-' + tabName);
      if (panel) panel.classList.add('active');
    });
  });
}

// WhatsApp CTA links carry a prefilled message matching the button context.
function setupWhatsAppButtons() {
  const updateButtons = () => {
    document.querySelectorAll('[data-wa-service]').forEach((btn) => {
      const serviceText = i18n.t(btn.getAttribute('data-wa-service'));
      btn.href = CONFIG.getWhatsAppLink(i18n.t('wa_service_msg', { service: serviceText }));
      btn.setAttribute('rel', 'noopener noreferrer');
      btn.setAttribute('target', '_blank');
    });

    document.querySelectorAll('[data-wa-country]').forEach((btn) => {
      const countryText = i18n.t(btn.getAttribute('data-wa-country'));
      btn.href = CONFIG.getWhatsAppLink(i18n.t('wa_country_msg', { country: countryText }));
      btn.setAttribute('rel', 'noopener noreferrer');
      btn.setAttribute('target', '_blank');
    });

    document.querySelectorAll('[data-wa-general]').forEach((btn) => {
      btn.href = CONFIG.getWhatsAppLink(i18n.t('wa_general_msg'));
      btn.setAttribute('rel', 'noopener noreferrer');
      btn.setAttribute('target', '_blank');
    });
  };

  updateButtons();
  window.addEventListener('languageChanged', updateButtons);
}

function setupStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach((el) => {
          const target = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          let current = 0;
          const step = Math.ceil(target / 40);

          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            // id-ID grouping (10.000) matches the static markup
            el.textContent = current.toLocaleString('id-ID') + suffix;
          }, 35);
        });
      }
    });
  }, { threshold: 0.4 });

  const statsSection = document.querySelector('.stats-bar-section');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

function setupSliders() {
  const setupSliderControl = (containerSelector, prevBtnId, nextBtnId, stepWidth = 380) => {
    const container = document.querySelector(containerSelector);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (!container) return;

    const scrollByStep = (forward) => {
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      const amount = (forward ? 1 : -1) * (isRTL ? -stepWidth : stepWidth);
      container.scrollBy({ left: amount, behavior: 'smooth' });
    };

    if (prevBtn) prevBtn.addEventListener('click', () => scrollByStep(false));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollByStep(true));

    // drag to scroll with the mouse
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
      isDown = false;
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      container.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
  };

  setupSliderControl('.testimonials-slider-container', 'testi-prev', 'testi-next', 380);
  setupSliderControl('.universities-slider-container', 'uni-prev', 'uni-next', 240);
}
