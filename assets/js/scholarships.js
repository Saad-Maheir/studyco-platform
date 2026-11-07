/**
 * StudyCo Academic Directory — Scholarships Portal Engine
 * Benchmark: Hotcourses Abroad Scholarships Directory
 * - Filterable scholarships by country, degree level, and coverage type
 * - Pre-filled WhatsApp consultation per scholarship
 */

import { i18n } from './i18n.js?v=88.0';
import { CONFIG } from './config.js?v=88.0';

const COUNTRY_FLAGS = {
  malaysia: 'assets/photo/flag-malaysia.svg',
  australia: 'assets/photo/flag-australia.svg',
  uk: 'assets/photo/flag-uk.svg',
  canada: 'assets/photo/flag-canada.svg',
  usa: 'assets/photo/flag-usa.svg',
  newzealand: 'assets/photo/flag-newzealand.svg',
  singapore: 'assets/photo/flag-singapore.svg'
};

const COUNTRY_NAMES = {
  malaysia: 'Malaysia',
  australia: 'Australia',
  uk: 'United Kingdom',
  canada: 'Canada',
  usa: 'USA',
  newzealand: 'New Zealand',
  singapore: 'Singapura'
};

class ScholarshipsPortal {
  constructor() {
    this.scholarships = [];
    this.universities = [];
    this.filtered = [];
    this.filters = {
      keyword: '',
      country: '',
      type: ''
    };
  }

  async init() {
    try {
      const [schRes, uniRes] = await Promise.all([
        fetch('./data/scholarships.json'),
        fetch('./data/universities.json')
      ]);

      const schData = await schRes.json();
      const uniData = await uniRes.json();

      this.universities = uniData.universities || [];
      const uniMap = Object.fromEntries(this.universities.map(u => [u.id, u]));

      this.scholarships = (schData.scholarships || []).map(s => ({
        ...s,
        _uni: uniMap[s.universityId] || {
          name: 'Partner University',
          arabicName: 'جامعة شريكة',
          logo: 'assets/photo/logo-dark.webp',
          city: 'Global Campus'
        }
      }));

      this.filtered = [...this.scholarships];
    } catch (err) {
      console.warn('[Scholarships] Direct fetch failed (e.g. file:// protocol), using fallback dataset:', err);
      this.scholarships = [
        {
          id: "taylors-world-class",
          universityId: "taylors",
          name: "Taylor's World Class Scholarship (100% Full Waiver)",
          nameAr: "منحة تايلور العالمية للتميز الأكاديمي (إعفاء 100% كامل)",
          country: "malaysia",
          level: "bachelor",
          type: "full",
          coverage: "100% Tuition Fee Waiver",
          coverageAr: "إعفاء كامل 100% من الرسوم الدراسية",
          deadline: "31 May & 31 Oct Annual",
          deadlineAr: "31 مايو و 31 أكتوبر سنوياً",
          criteria: "High school GPA 3.8/4.0 or equivalent + IELTS 6.5. Strong leadership and extracurricular portfolio.",
          criteriaAr: "معدل ثانوية عامة 3.8/4.0 أو أكثر + آيلتس 6.5، وسجل متميز في القيادة والأنشطة.",
          applicableFields: ["cs", "business", "engineering", "hospitality", "arts"],
          _uni: { name: "Taylor's University", arabicName: "جامعة تايلور", logo: "assets/photo/uni-taylors.svg", city: "Subang Jaya" }
        },
        {
          id: "apu-merit-international",
          universityId: "apu",
          name: "APU International Student Merit Scholarship",
          nameAr: "منحة جامعة آسيا باسيفيك للجدارة الأكاديمية الدولية",
          country: "malaysia",
          level: "bachelor",
          type: "partial",
          coverage: "Up to 50% Tuition Fee Reduction",
          coverageAr: "خصم يصل إلى 50% من الرسوم الدراسية",
          deadline: "Rolling (Before Each Intake)",
          deadlineAr: "مستمر قبل كل دورة قبول",
          criteria: "High school score 85%+ or GPA 3.5+. Awarded based on academic interview and academic merits.",
          criteriaAr: "معدل ثانوية 85%+ أو 3.5+. تُمنح بناءً على المقابلة والجدارة العلمية.",
          applicableFields: ["cs", "engineering", "business", "arts"],
          _uni: { name: "Asia Pacific University (APU)", arabicName: "جامعة آسيا باسيفيك", logo: "assets/photo/uni-apu.webp", city: "Kuala Lumpur" }
        },
        {
          id: "sunway-excellence",
          universityId: "sunway",
          name: "Sunway University Excellence Scholarship",
          nameAr: "منحة التميز من جامعة صنواي ماليزيا",
          country: "malaysia",
          level: "bachelor",
          type: "partial",
          coverage: "25% to 50% Tuition Waiver",
          coverageAr: "إعفاء من 25% إلى 50% من الرسوم",
          deadline: "15 Jan, 15 Jun Annual",
          deadlineAr: "15 يناير و 15 يونيو سنوياً",
          criteria: "Outstanding A-Level / IB / High School results, IELTS 6.0+, active community participation.",
          criteriaAr: "درجات متفوقة في الثانوية العامة أو البكالوريا الدولية + آيلتس 6.0 ومشاركات مجتمعية.",
          applicableFields: ["business", "cs", "engineering", "arts", "health"],
          _uni: { name: "Sunway University", arabicName: "جامعة صنواي", logo: "assets/photo/uni-sunway.webp", city: "Sunway City" }
        },
        {
          id: "sydney-international-excellence",
          universityId: "sydney",
          name: "Sydney International Student Award (Australia)",
          nameAr: "جائزة جامعة سيدني الأسترالية للطلاب الدوليين",
          country: "australia",
          level: "master",
          type: "partial",
          coverage: "20% Tuition Fee Contribution",
          coverageAr: "مساهمة 20% في الرسوم الدراسية للبرنامج بأكمله",
          deadline: "15 January & 30 June",
          deadlineAr: "15 يناير و 30 يونيو",
          criteria: "Unconditional admission offer for eligible postgraduate programs at University of Sydney.",
          criteriaAr: "قبول غير مشروط في برامج الدراسات العليا المؤهلة في جامعة سيدني.",
          applicableFields: ["business", "cs", "engineering", "health", "law"],
          _uni: { name: "The University of Sydney", arabicName: "جامعة سيدني", logo: "assets/photo/uni-sydney.svg", city: "Sydney, NSW" }
        }
      ];
      this.filtered = [...this.scholarships];
    }

    this.bindEvents();
    this.render();

    window.addEventListener('languageChanged', () => {
      this.render();
    });
  }

  bindEvents() {
    const searchInput = document.getElementById('scholarship-search-input');
    const countrySelect = document.getElementById('scholarship-filter-country');
    const typeSelect = document.getElementById('scholarship-filter-type');
    const searchBtn = document.getElementById('btn-search-scholarships');

    const handleFilter = () => {
      this.filters.keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      this.filters.country = countrySelect ? countrySelect.value : '';
      this.filters.type = typeSelect ? typeSelect.value : '';

      this.filtered = this.scholarships.filter(s => {
        if (this.filters.country && s.country !== this.filters.country) return false;
        if (this.filters.type && s.type !== this.filters.type) return false;
        if (this.filters.keyword) {
          const nameEn = (s.name || '').toLowerCase();
          const nameAr = (s.nameAr || '').toLowerCase();
          const uniName = (s._uni.name || '').toLowerCase();
          if (!nameEn.includes(this.filters.keyword) && !nameAr.includes(this.filters.keyword) && !uniName.includes(this.filters.keyword)) {
            return false;
          }
        }
        return true;
      });

      this.render();
    };

    if (searchBtn) searchBtn.addEventListener('click', handleFilter);
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleFilter();
      });
    }
    if (countrySelect) countrySelect.addEventListener('change', handleFilter);
    if (typeSelect) typeSelect.addEventListener('change', handleFilter);
  }

  render() {
    const container = document.getElementById('scholarships-container');
    const countEl = document.getElementById('scholarships-count');
    if (!container) return;

    if (countEl) countEl.textContent = this.filtered.length;

    const currentLang = i18n.currentLang || 'id';
    const isAr = currentLang === 'ar';

    if (this.filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: #ffffff; border-radius: 16px; border: 1.5px dashed #d1d5db;">
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #1f2937;">Tidak Ada Beasiswa Ditemukan</h3>
          <p style="color: #6b7280; margin: 0.5rem 0 1.5rem;">Coba ubah filter atau hubungi konsultan kami untuk cek peluang beasiswa lainnya.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.filtered.map(s => {
      const uni = s._uni;
      const schTitle = isAr ? (s.nameAr || s.name) : s.name;
      const uniName = isAr ? (uni.arabicName || uni.name) : uni.name;
      const flagSrc = COUNTRY_FLAGS[s.country] || 'assets/photo/flag-malaysia.svg';
      const countryName = COUNTRY_NAMES[s.country] || s.country;
      const coverageText = isAr ? (s.coverageAr || s.coverage) : s.coverage;
      const deadlineText = isAr ? (s.deadlineAr || s.deadline) : s.deadline;
      const criteriaText = isAr ? (s.criteriaAr || s.criteria) : s.criteria;

      const badgeColor = s.type === 'full' ? '#10B981' : '#b45309';
      const badgeBg = s.type === 'full' ? '#d1fae5' : '#fef3c7';
      const badgeLabel = s.type === 'full' ? (isAr ? 'منحة كاملة 100%' : '100% Full Scholarship') : (isAr ? 'منحة جزئية' : 'Partial Scholarship');

      // WhatsApp link
      const waMsg = isAr
        ? `مرحباً StudyCo، أود الاستفسار والتسجيل على: ${s.name} في جامعة ${uni.arabicName || uni.name}. ما هي الشروط والمستندات المطلوبة؟`
        : `Halo StudyCo, saya tertarik mendaftar untuk beasiswa: ${s.name} di ${uni.name}. Mohon informasi syarat dan panduan pendaftarannya.`;
      const waLink = CONFIG.getWhatsAppLink(waMsg);

      return `
        <article class="search-program-card" style="border-left: 4px solid var(--color-primary);">
          <div class="search-card-top-row">
            <div class="search-card-uni-meta">
              <img class="search-card-uni-logo" src="${uni.logo || 'assets/photo/logo-dark.webp'}" alt="${uniName} Logo" loading="lazy" />
              <div class="search-card-uni-text">
                <h4>${uniName}</h4>
                <p>
                  <img src="${flagSrc}" alt="${countryName}" width="16" height="11" style="border-radius:2px; vertical-align:middle; display:inline-block;" />
                  <span>${uni.city || countryName}</span>
                </p>
              </div>
            </div>
            <span style="background:${badgeBg}; color:${badgeColor}; font-size:0.8rem; font-weight:800; padding:0.3rem 0.75rem; border-radius:9999px;">
              ${badgeLabel}
            </span>
          </div>

          <h3 class="search-card-title" style="color: #111827;">${schTitle}</h3>

          <div class="search-card-details-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="search-card-detail-item">
              <span class="search-card-detail-label">${isAr ? 'قيمة المنحة / التغطية' : 'Nilai / Cakupan Beasiswa'}</span>
              <span class="search-card-detail-value" style="color: #b45309; font-weight: 800;">${coverageText}</span>
            </div>
            <div class="search-card-detail-item">
              <span class="search-card-detail-label">${isAr ? 'الموعد النهائي' : 'Batas Waktu (Deadline)'}</span>
              <span class="search-card-detail-value">${deadlineText}</span>
            </div>
            <div class="search-card-detail-item">
              <span class="search-card-detail-label">${isAr ? 'المرحلة الدراسية' : 'Jenjang Studi'}</span>
              <span class="search-card-detail-value" style="text-transform: capitalize;">${s.level}</span>
            </div>
          </div>

          <div style="background:#f9fafb; padding:0.75rem 1rem; border-radius:10px; border:1px solid #f3f4f6; font-size:0.85rem; color:#4b5563;">
            <strong style="color:#1f2937;">${isAr ? 'شروط ومعايير القبول:' : 'Kriteria Kelayakan:'}</strong> ${criteriaText}
          </div>

          <div class="search-card-actions-row">
            <a href="university.html?id=${s.universityId}" class="btn-search-detail">
              <span>${isAr ? 'تفاصيل الجامعة' : 'Profil Kampus'}</span>
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-search-wa">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"/>
              </svg>
              <span>${isAr ? 'استشارة المنحة عبر واتساب' : 'Bimbingan Beasiswa WhatsApp'}</span>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const portal = new ScholarshipsPortal();
  portal.init();
});
