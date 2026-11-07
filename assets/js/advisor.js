// Admission advisor wizard - 4 questions, then a WhatsApp handoff.
import { i18n } from './i18n.js?v=88.0';
import { CONFIG } from './config.js?v=88.0';

export class AdmissionAdvisor {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.answers = {
      country: 'any',
      level: 'bachelor',
      english: 'intermediate',
      budget: 'budget_mid'
    };
    this.advisorData = null;
  }

  async init() {
    try {
      const res = await fetch('./data/advisor.json');
      this.advisorData = await res.json();
    } catch (err) {
      console.warn('[Advisor] Could not load advisor.json:', err);
    }
    this.bindEvents();
    this.renderStep(1);
  }

  bindEvents() {
    const nextBtn = document.getElementById('advisor-next-btn');
    const prevBtn = document.getElementById('advisor-prev-btn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;
          this.renderStep(this.currentStep);
        } else {
          this.showResult();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentStep > 1) {
          this.currentStep--;
          this.renderStep(this.currentStep);
        }
      });
    }

    window.addEventListener('languageChanged', () => {
      this.renderStep(this.currentStep);
    });
  }

  renderStep(step) {
    this.currentStep = step;
    const fill = document.getElementById('advisor-progress-fill');
    if (fill) {
      fill.style.width = `${(step / this.totalSteps) * 100}%`;
    }

    const titleEl = document.getElementById('advisor-step-title');
    const optionsGrid = document.getElementById('advisor-options-grid');
    const prevBtn = document.getElementById('advisor-prev-btn');
    const nextBtn = document.getElementById('advisor-next-btn');
    const resultBox = document.getElementById('advisor-result-box');

    if (resultBox) resultBox.style.display = 'none';
    if (optionsGrid) optionsGrid.style.display = 'grid';

    if (prevBtn) prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.textContent = step === this.totalSteps ? i18n.t('advisor_btn_result') : i18n.t('advisor_btn_next');

    if (!this.advisorData || !this.advisorData.questions) return;
    const currentQ = this.advisorData.questions[step - 1];

    if (titleEl) {
      titleEl.textContent = i18n.t(currentQ.key);
    }

    if (optionsGrid) {
      optionsGrid.innerHTML = '';
      currentQ.options.forEach((opt) => {
        const card = document.createElement('div');
        card.className = `option-card ${this.answers[currentQ.id] === opt.value ? 'selected' : ''}`;
        card.textContent = i18n.t(opt.key);
        card.addEventListener('click', () => {
          this.answers[currentQ.id] = opt.value;
          this.renderStep(step);
        });
        optionsGrid.appendChild(card);
      });
    }
  }

  showResult() {
    const optionsGrid = document.getElementById('advisor-options-grid');
    const titleEl = document.getElementById('advisor-step-title');
    const resultBox = document.getElementById('advisor-result-box');
    const prevBtn = document.getElementById('advisor-prev-btn');
    const nextBtn = document.getElementById('advisor-next-btn');

    if (optionsGrid) optionsGrid.style.display = 'none';
    if (prevBtn) prevBtn.style.visibility = 'visible';
    if (nextBtn) nextBtn.style.display = 'none';

    if (titleEl) titleEl.textContent = i18n.t('advisor_result_title');

    const countryText = this.answers.country === 'any' ? i18n.t('advisor_opt_any') : i18n.t(`dest_${this.answers.country}`);
    const levelText = i18n.t(`level_${this.answers.level}`);
    const engText = i18n.t(`eng_${this.answers.english}`);
    const budgetText = i18n.t(`${this.answers.budget}_label`);

    const waMessage = i18n.t('wa_advisor_msg', {
      country: countryText,
      level: levelText,
      english: engText,
      budget: budgetText
    });

    const waLink = CONFIG.getWhatsAppLink(waMessage);

    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="background:#FFFDF5; border:1px solid #F5B000; padding:1.5rem; border-radius:16px; margin-bottom:1.5rem;">
          <h4 style="font-size:1.2rem; font-weight:700; margin-bottom:0.75rem;">${countryText} - ${levelText}</h4>
          <p style="font-size:0.95rem; color:#4B5563; margin-bottom:1rem;">
            ${i18n.t('advisor_step_3')}: <strong>${engText}</strong> | ${i18n.t('advisor_step_4')}: <strong>${budgetText}</strong>
          </p>
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-hero-whatsapp" style="display:inline-flex; width:100%; justify-content:center;">
            ${i18n.t('advisor_result_btn')}
          </a>
        </div>
      `;
    }
  }
}
