// Floating chat widget - walks through the advisor questions in a chat UI.
import { i18n } from './i18n.js?v=88.0';
import { CONFIG } from './config.js?v=88.0';

const ICONS = {
  australia: '',
  uk: '',
  canada: '',
  newzealand: '',
  malaysia: '',
  singapore: '',
  any: '',
  bachelor: '',
  master: '',
  english: '',
  online: '',
  beginner: '',
  intermediate: '',
  advanced: '',
  certified: '',
  budget_low: '',
  budget_mid: '',
  budget_high: ''
};

export class ChatbotAdvisor {
  constructor() {
    this.isOpen = false;
    this.currentStep = 1;
    this.answers = {
      country: '',
      level: '',
      english: '',
      budget: ''
    };
    this.advisorData = null;
  }

  async init() {
    try {
      const res = await fetch('./data/advisor.json');
      this.advisorData = await res.json();
    } catch (err) {
      console.warn('[Chatbot] Could not load advisor.json:', err);
    }
    this.renderWidgetHTML();
    this.bindEvents();
  }

  renderWidgetHTML() {
    if (document.getElementById('chatbot-widget-wrap')) return;

    const wrap = document.createElement('div');
    wrap.id = 'chatbot-widget-wrap';
    wrap.className = 'chatbot-widget-wrap';
    wrap.innerHTML = `
      <!-- Floating Trigger Button -->
      <button id="chatbot-trigger-btn" class="chatbot-trigger-btn" aria-label="Open Admission Advisor Chatbot">
        <span class="chatbot-pulse"></span>
        <svg class="chat-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
          <circle cx="8" cy="10" r="1.5"/>
          <circle cx="12" cy="10" r="1.5"/>
          <circle cx="16" cy="10" r="1.5"/>
        </svg>
        <span class="chatbot-badge-text" data-i18n="chatbot_floating_label">${i18n.t('chatbot_floating_label')}</span>
      </button>

      <!-- Floating Chatbot Window -->
      <div id="chatbot-window" class="chatbot-window" style="display:none;">
        <div class="chatbot-header">
          <div class="chatbot-avatar-box">
            <div class="chatbot-avatar">SC</div>
            <span class="online-indicator"></span>
          </div>
          <div class="chatbot-header-info">
            <h4 data-i18n="chatbot_title">${i18n.t('chatbot_title')}</h4>
            <span class="chatbot-status" data-i18n="chatbot_status">${i18n.t('chatbot_status')}</span>
          </div>
          <button id="chatbot-close-btn" class="chatbot-close-btn" aria-label="Close Chatbot">&times;</button>
        </div>

        <div id="chatbot-messages" class="chatbot-messages">
          <!-- Dynamic conversational chat bubbles rendered here -->
        </div>

        <div class="chatbot-footer">
          <button id="chatbot-restart-btn" class="chatbot-restart-btn" data-i18n="chatbot_restart">${i18n.t('chatbot_restart')}</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);
  }

  bindEvents() {
    const triggerBtn = document.getElementById('chatbot-trigger-btn');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const restartBtn = document.getElementById('chatbot-restart-btn');

    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => this.toggleChat());
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeChat());
    }
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.resetChat());
    }

    window.addEventListener('languageChanged', () => {
      // Re-translate static widget headers
      const titleEl = document.querySelector('[data-i18n="chatbot_title"]');
      const statusEl = document.querySelector('[data-i18n="chatbot_status"]');
      const restartEl = document.querySelector('[data-i18n="chatbot_restart"]');
      const badgeEl = document.querySelector('[data-i18n="chatbot_floating_label"]');
      if (titleEl) titleEl.textContent = i18n.t('chatbot_title');
      if (statusEl) statusEl.textContent = i18n.t('chatbot_status');
      if (restartEl) restartEl.textContent = i18n.t('chatbot_restart');
      if (badgeEl) badgeEl.textContent = i18n.t('chatbot_floating_label');

      if (this.isOpen) {
        this.renderStep(this.currentStep);
      }
    });
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.isOpen = true;
    const windowEl = document.getElementById('chatbot-window');
    if (windowEl) windowEl.style.display = 'flex';
    this.renderStep(this.currentStep);
  }

  closeChat() {
    this.isOpen = false;
    const windowEl = document.getElementById('chatbot-window');
    if (windowEl) windowEl.style.display = 'none';
  }

  resetChat() {
    this.currentStep = 1;
    this.answers = { country: '', level: '', english: '', budget: '' };
    this.renderStep(1);
  }

  renderStep(step) {
    this.currentStep = step;
    const msgContainer = document.getElementById('chatbot-messages');
    if (!msgContainer || !this.advisorData) return;

    msgContainer.innerHTML = '';

    this.appendBotBubble(i18n.t('chatbot_greeting'));

    // replay answered steps as chat history
    for (let s = 1; s < step; s++) {
      const q = this.advisorData.questions[s - 1];
      const val = this.answers[q.id];
      const opt = q.options.find(o => o.value === val);

      this.appendBotBubble(i18n.t(q.key));
      if (opt) {
        const icon = ICONS[opt.value] || '';
        this.appendUserBubble(`${icon}${i18n.t(opt.key)}`);
      }
    }

    if (step <= 4) {
      const currentQ = this.advisorData.questions[step - 1];
      this.appendBotBubble(i18n.t(currentQ.key));

      const optionsGrid = document.createElement('div');
      optionsGrid.className = 'chatbot-options-grid';

      const totalOpts = currentQ.options.length;
      currentQ.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        const icon = ICONS[opt.value] || '';
        const isLastOdd = (totalOpts % 2 !== 0) && (idx === totalOpts - 1);

        btn.className = `chatbot-option-card ${isLastOdd ? 'full-width' : ''}`;
        btn.innerHTML = `<span class="opt-icon">${icon}</span><span class="opt-text">${i18n.t(opt.key)}</span>`;
        btn.addEventListener('click', () => {
          this.answers[currentQ.id] = opt.value;
          this.renderStep(step + 1);
        });
        optionsGrid.appendChild(btn);
      });

      msgContainer.appendChild(optionsGrid);
    } else {
      this.renderFinalResult();
    }

    setTimeout(() => {
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 50);
  }

  appendBotBubble(text) {
    const msgContainer = document.getElementById('chatbot-messages');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot';
    bubble.textContent = text;
    msgContainer.appendChild(bubble);
  }

  appendUserBubble(text) {
    const msgContainer = document.getElementById('chatbot-messages');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';
    bubble.textContent = text;
    msgContainer.appendChild(bubble);
  }

  renderFinalResult() {
    const countryText = this.answers.country === 'any' ? i18n.t('advisor_opt_any') : i18n.t(`dest_${this.answers.country}`);
    const levelText = i18n.t(`level_${this.answers.level}`);
    const engText = i18n.t(`eng_${this.answers.english}`);
    const budgetText = i18n.t(`${this.answers.budget}_label`);

    this.appendBotBubble(i18n.t('chatbot_result_intro'));

    const waMessage = i18n.t('wa_advisor_msg', {
      country: countryText,
      level: levelText,
      english: engText,
      budget: budgetText
    });

    const waLink = CONFIG.getWhatsAppLink(waMessage);

    const resultCard = document.createElement('div');
    resultCard.className = 'chatbot-result-card';
    resultCard.innerHTML = `
      <div class="result-header">
        <span class="result-badge">${i18n.t('chatbot_result_badge')}</span>
        <h5>${countryText} - ${levelText}</h5>
      </div>
      <div class="result-details">
        <p><strong>${i18n.t('chatbot_label_english')}:</strong> ${engText}</p>
        <p><strong>${i18n.t('chatbot_label_budget')}:</strong> ${budgetText}</p>
      </div>
      <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-hero-whatsapp btn-result-wa">
        <span>${i18n.t('chatbot_result_wa_btn')}</span>
      </a>
    `;

    document.getElementById('chatbot-messages').appendChild(resultCard);
  }
}
