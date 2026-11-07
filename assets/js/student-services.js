// StudyCo Student Care — Services Manager & Multilingual Engine
import { CONFIG } from './config.js?v=88.0';
import { i18n } from './i18n.js?v=88.0';

const UI_TEXT = {
  imgBadge: {
    ar: 'خدمة معتمدة 360°',
    en: '360° Certified Service',
    id: 'Layanan Terverifikasi 360°',
    ko: '360° 인증 공식 서비스',
    ja: '360° 認定公式サービス',
    zh: '360° 官方认证服务',
    ru: 'Сертифицированная услуга 360°',
    fr: 'Service Certifié 360°',
    es: 'Servicio Certificado 360°'
  },
  viewDetails: {
    ar: 'عرض تفاصيل الخدمة كاملة ←',
    en: 'View Full Service Details →',
    id: 'Lihat Detail Lengkap Layanan →',
    ko: '서비스 전체 상세 보기 →',
    ja: 'サービス詳細をすべて見る →',
    zh: '查看该服务完整详情 →',
    ru: 'Подробное описание услуги →',
    fr: 'Voir tous les détails du service →',
    es: 'Ver todos los detalles del servicio →'
  },
  bookServiceWa: {
    ar: 'طلب واستشارة الخدمة عبر واتساب',
    en: 'Book Service via WhatsApp',
    id: 'Pesan Layanan via WhatsApp',
    ko: 'WhatsApp으로 서비스 신청 및 상담',
    ja: 'WhatsAppで相談・予約',
    zh: '通过 WhatsApp 预约与咨询',
    ru: 'Заказать услугу в WhatsApp',
    fr: 'Demander le service sur WhatsApp',
    es: 'Solicitar servicio por WhatsApp'
  },
  choosePackage: {
    ar: 'حجز هذه الباقة الآن',
    en: 'Choose This Package',
    id: 'Pilih Paket Ini',
    ko: '이 패키지 선택하기',
    ja: 'このプランを選択',
    zh: '立即选购该套餐',
    ru: 'Выбрать этот пакет',
    fr: 'Choisir cette formule',
    es: 'Elegir este paquete'
  }
};

export class StudentServicesManager {
  constructor() {
    this.data = null;
    this.currentLang = (window.i18n && window.i18n.currentLang) || document.documentElement.lang || 'ar';
  }

  async init() {
    try {
      const res = await fetch('./data/student-services.json?v=88.0');
      this.data = await res.json();
    } catch (err) {
      console.error('[StudentServices] Error loading student-services.json:', err);
      return;
    }

    const urlLang = new URLSearchParams(window.location.search).get('lang');
    this.currentLang = (urlLang && CONFIG.supportedLanguages.includes(urlLang))
      ? urlLang
      : ((window.i18n && window.i18n.currentLang) || localStorage.getItem('studyco_lang') || document.documentElement.lang || 'ar');

    this.renderAll();
    this.setupForm();
    this.setupFaq();
    this.setupStatsAnimation();
    this.setupLanguageListener();
  }

  setupLanguageListener() {
    const onLang = (lang) => {
      const targetLang = lang || (window.i18n && window.i18n.currentLang) || document.documentElement.lang || 'ar';
      if (targetLang && targetLang !== this.currentLang) {
        this.currentLang = targetLang;
        this.renderAll();
      }
    };

    window.addEventListener('languageChanged', (e) => onLang(e.detail?.lang));
    document.addEventListener('languageChanged', (e) => onLang(e.detail?.lang));

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'lang') {
          onLang(document.documentElement.lang);
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  getText(obj, prefix = '') {
    if (!obj) return '';
    const lang = this.currentLang;
    if (prefix) {
      return obj[`${prefix}_${lang}`] || obj[`${prefix}_ar`] || obj[`${prefix}_en`] || obj[`${prefix}_id`] || '';
    }
    return obj[lang] || obj['ar'] || obj['en'] || obj['id'] || '';
  }

  getUi(key) {
    const dict = UI_TEXT[key] || {};
    return dict[this.currentLang] || dict['ar'] || dict['en'] || '';
  }

  renderAll() {
    if (!this.data) return;
    this.renderStats();
    this.renderServices();
    this.renderTimeline();
    this.renderPackages();
    this.renderFaqs();
  }

  renderStats() {
    const container = document.getElementById('ss-stats-grid');
    if (!container || !this.data.stats) return;

    container.innerHTML = this.data.stats.map(s => {
      const suffix = s['suffix_' + this.currentLang] || s.suffix || '';
      const label = this.getText(s, 'label');
      return `
        <div class="ss-stat-card">
          <div class="ss-stat-num-wrap">
            <span class="ss-stat-number" data-target="${s.number}">${s.number}</span>
            <span class="ss-stat-suffix">${suffix}</span>
          </div>
          <p class="ss-stat-label">${label}</p>
        </div>
      `;
    }).join('');
  }

  renderServices() {
    const container = document.getElementById('ss-services-grid');
    if (!container || !this.data.services) return;

    const icons = {
      'plane-arrival': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M17 3l4 4-10 10H7v-4L17 3z"/></svg>',
      'home': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      'shield-check': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
      'book-open': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      'map-pin': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      'briefcase': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      'heart-handshake': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'
    };

    container.innerHTML = this.data.services.map((srv) => {
      const features = srv[`features_${this.currentLang}`] || srv.features_ar || srv.features_en || [];
      const iconSvg = icons[srv.icon] || icons['shield-check'];
      const pageUrl = srv.slug || 'student-services.html';
      const imgPath = srv.image || 'assets/photo/services/airport_pickup.jpg';

      return `
        <div class="ss-service-card" id="${srv.id}">
          <div class="ss-card-img-wrap">
            <img src="${imgPath}" alt="${this.getText(srv, 'title')}" class="ss-card-img" loading="lazy" decoding="async">
            <span class="ss-card-img-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="#f5b000" style="flex-shrink:0" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span>${this.getUi('imgBadge')}</span></span>
          </div>

          <div class="ss-card-top">
            <span class="ss-service-badge">${this.getText(srv, 'badge')}</span>
            <div class="ss-card-icon-wrap">
              ${iconSvg}
            </div>
          </div>

          <h3 class="ss-service-title">${this.getText(srv, 'title')}</h3>
          <p class="ss-service-desc">${this.getText(srv, 'desc')}</p>

          <ul class="ss-service-features">
            ${features.map(f => `
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5b000" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>

          <div class="ss-card-actions">
            <a href="${pageUrl}" class="btn-service-details">
              <span>${this.getUi('viewDetails')}</span>
            </a>
            <button class="btn-select-service" data-service-id="${srv.id}" data-service-title="${this.getText(srv, 'title')}">
              <span>${this.getUi('bookServiceWa')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events to buttons
    container.querySelectorAll('.btn-select-service').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('data-service-title');
        const formSelect = document.getElementById('ss-input-service');
        if (formSelect) {
          formSelect.value = title;
        }
        const formSec = document.getElementById('booking-form-section');
        if (formSec) {
          formSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  renderTimeline() {
    const container = document.getElementById('ss-timeline-steps');
    if (!container || !this.data.timeline) return;

    container.innerHTML = this.data.timeline.map((step) => `
      <div class="ss-timeline-item">
        <div class="ss-timeline-marker">
          <span class="ss-marker-num">${step.step}</span>
        </div>
        <div class="ss-timeline-content">
          <h4 class="ss-step-title">${this.getText(step, 'title')}</h4>
          <p class="ss-step-desc">${this.getText(step, 'desc')}</p>
        </div>
      </div>
    `).join('');
  }

  renderPackages() {
    const container = document.getElementById('ss-packages-grid');
    if (!container || !this.data.packages) return;

    const packageIcons = {
      essential: '<div class="ss-package-icon ss-pkg-icon-essential" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h4M2 17h12M17.8 12.2l2.4-2.4a1.5 1.5 0 0 0 0-2.1l-.7-.7a1.5 1.5 0 0 0-2.1 0L15 9.4l-7.3-3.6-1.4 1.4 4.5 4.5-3.6 3.6-2.1-.7-1.4 1.4 3.5 1.8 1.8 3.5 1.4-1.4-.7-2.1 3.6-3.6 4.5 4.5 1.4-1.4z"/></svg></div>',
      comprehensive: '<div class="ss-package-icon ss-pkg-icon-popular" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/><polygon points="12 4 13.5 7.5 17 8 14.5 10.5 15 14 12 12.2 9 14 9.5 10.5 7 8 10.5 7.5" fill="#f5b000" stroke="#f5b000"/></svg></div>',
      vip_family: '<div class="ss-package-icon ss-pkg-icon-vip" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.769a1 1 0 0 1-.968.745H5.82a1 1 0 0 1-.968-.745L2.019 6.019a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg></div>'
    };

    container.innerHTML = this.data.packages.map((pkg) => {
      const iconMarkup = packageIcons[pkg.id] || packageIcons.essential;
      const features = pkg[`features_${this.currentLang}`] || pkg.features_ar || pkg.features_en || [];
      const popularClass = pkg.popular ? 'ss-package-popular' : '';
      const popularBadge = pkg.popular ? `<div class="ss-popular-tag">${this.getText(pkg, 'tag')}</div>` : `<div class="ss-pkg-tag">${this.getText(pkg, 'tag')}</div>`;

      return `
        <div class="ss-package-card ${popularClass}">
          ${popularBadge}
          ${iconMarkup}
          <h3 class="ss-package-name">${this.getText(pkg, 'name')}</h3>
          <ul class="ss-package-list">
            ${features.map(f => `
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5b000" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>
          <div class="ss-pkg-action">
            <button class="btn-choose-package ${pkg.popular ? 'btn-popular' : ''}" data-package-name="${this.getText(pkg, 'name')}">
              <span>${this.getUi('choosePackage')}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-choose-package').forEach(btn => {
      btn.addEventListener('click', () => {
        const pkgName = btn.getAttribute('data-package-name');
        const formSelect = document.getElementById('ss-input-service');
        if (formSelect) {
          formSelect.value = pkgName;
        }
        const formSec = document.getElementById('booking-form-section');
        if (formSec) {
          formSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  renderFaqs() {
    const container = document.getElementById('ss-faqs-accordion');
    if (!container || !this.data.faqs) return;

    container.innerHTML = this.data.faqs.map((faq, idx) => `
      <div class="ss-faq-item ${idx === 0 ? 'active' : ''}">
        <button class="ss-faq-question" aria-expanded="${idx === 0 ? 'true' : 'false'}">
          <span>${this.getText(faq, 'q')}</span>
          <svg class="ss-faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="ss-faq-answer" style="${idx === 0 ? 'max-height: 500px; padding-bottom: 1.25rem;' : ''}">
          <p>${this.getText(faq, 'a')}</p>
        </div>
      </div>
    `).join('');

    this.setupFaq();
  }

  setupFaq() {
    const container = document.getElementById('ss-faqs-accordion');
    if (!container) return;

    container.querySelectorAll('.ss-faq-question').forEach(btn => {
      // Avoid stacking duplicate listeners
      if (btn._hasFaqListener) return;
      btn._hasFaqListener = true;

      btn.addEventListener('click', () => {
        const item = btn.closest('.ss-faq-item');
        const isActive = item.classList.contains('active');
        const ans = item.querySelector('.ss-faq-answer');

        container.querySelectorAll('.ss-faq-item').forEach(i => {
          i.classList.remove('active');
          const a = i.querySelector('.ss-faq-answer');
          if (a) a.style.maxHeight = null;
          const q = i.querySelector('.ss-faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });

        if (!isActive) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          ans.style.maxHeight = ans.scrollHeight + 'px';
          ans.style.paddingBottom = '1.25rem';
        }
      });
    });
  }

  setupForm() {
    const form = document.getElementById('ss-booking-form');
    if (!form || form._hasSubmitListener) return;
    form._hasSubmitListener = true;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('ss-input-name')?.value.trim() || '';
      const phone = document.getElementById('ss-input-phone')?.value.trim() || '';
      const country = document.getElementById('ss-input-country')?.value || '';
      const date = document.getElementById('ss-input-date')?.value || '';
      const service = document.getElementById('ss-input-service')?.value || '';
      const notes = document.getElementById('ss-input-notes')?.value.trim() || '';

      const lines = [
        `🎓 *StudyCo Student Services & Settlement Booking*`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `👤 *Name:* ${name || 'N/A'}`,
        `📱 *Contact:* ${phone || 'N/A'}`,
        `🌍 *Destination Country:* ${country || 'N/A'}`,
        `📦 *Service / Package:* ${service || 'General Inquiry'}`,
        `📅 *Expected Arrival Date:* ${date || 'TBD'}`
      ];

      if (notes) {
        lines.push(`📝 *Notes:* ${notes}`);
      }

      lines.push(`━━━━━━━━━━━━━━━━━━━━`);
      lines.push(`_Sent via StudyCo Student Services Portal_`);

      const messageText = lines.join('\n');
      const waLink = CONFIG.getWhatsAppLink(messageText);

      window.open(waLink, '_blank', 'noopener,noreferrer');
    });
  }

  setupStatsAnimation() {
    // Already rendered with full target numbers, ensuring visibility
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const manager = new StudentServicesManager();
  manager.init();
});
