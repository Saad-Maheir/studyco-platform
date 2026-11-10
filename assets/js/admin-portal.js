const API_BASE = window.STUDYCO_API_BASE || 'api';
/**
 * StudyCo Education Services — Central Administration Portal JavaScript
 * StudyCo Central Platform — Unified MySQL API & Offline Client State Engine
 * Comprehensive Agent Approval, Student Pipeline Management, and Document Vault
 */

(function () {
  'use strict';

  // Helper for Translations
  function t(key, fallback = '') {
    if (window.StudyCo_i18n && typeof window.StudyCo_i18n.t === 'function') {
      const val = window.StudyCo_i18n.t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  }

  // Toast Notification System
  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('portal-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'portal-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `portal-toast portal-toast-${type}`;

    let iconSvg = '';
    let bg = '#1e293b';
    let border = '1px solid #334155';

    if (type === 'success') {
      bg = '#059669';
      border = '1px solid #10b981';
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'danger' || type === 'error') {
      bg = '#dc2626';
      border = '1px solid #ef4444';
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    } else if (type === 'warning') {
      bg = '#d97706';
      border = '1px solid #f59e0b';
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    } else {
      bg = '#2563eb';
      border = '1px solid #3b82f6';
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.style.cssText = `background:${bg} !important; border:${border} !important; color:#ffffff !important; padding:13px 18px; border-radius:12px; box-shadow:0 12px 30px rgba(0,0,0,0.22); font-size:0.9rem; font-weight:600; display:flex; align-items:center; gap:12px; pointer-events:auto; transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1); direction:${document.documentElement.dir || 'rtl'}; text-align:${document.documentElement.dir === 'ltr' ? 'left' : 'right'};`;
    toast.innerHTML = `${iconSvg}<span style="flex:1; line-height:1.45; color:#ffffff !important;">${escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-12px) scale(0.96)';
      setTimeout(() => toast.remove(), 320);
    }, duration);
  }

  // Slugify Helper for Clean URL Identifiers
  function slugifyText(text) {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Format Bytes Helper
  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Safe Preview Helper to prevent Chrome blocking data URLs in target="_blank"
  function openPreviewSafe(urlOrDataUrl, mimeType = 'application/pdf') {
    if (!urlOrDataUrl) return;
    if (urlOrDataUrl.startsWith('data:')) {
      try {
        const parts = urlOrDataUrl.split(',');
        const byteString = atob(parts[1]);
        const mime = parts[0].split(':')[1].split(';')[0] || mimeType;
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (err) {
        console.error('Failed to convert data URL to Blob preview:', err);
        window.open(urlOrDataUrl, '_blank');
      }
    } else {
      window.open(urlOrDataUrl, '_blank');
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Pipeline Status Definitions
  const STATUS_META = {
    submitted: { key: 'status_submitted', defaultAr: 'تم الإرسال', class: 'status-submitted' },
    under_review: { key: 'status_under_review', defaultAr: 'قيد التدقيق الأكاديمي', class: 'status-under_review' },
    conditional_offer: { key: 'status_conditional_offer', defaultAr: 'قبول مشروط', class: 'status-conditional_offer' },
    unconditional_offer: { key: 'status_unconditional_offer', defaultAr: 'قبول غير مشروط', class: 'status-unconditional_offer' },
    awaiting_payment: { key: 'status_awaiting_payment', defaultAr: 'بانتظار سداد الرسوم', class: 'status-awaiting_payment' },
    visa_processing: { key: 'status_visa_processing', defaultAr: 'معالجة تأشيرة الطالب', class: 'status-visa_processing' },
    enrolled: { key: 'status_enrolled', defaultAr: 'تم الالتحاق وبدء الدراسة', class: 'status-enrolled' },
    rejected: { key: 'status_rejected', defaultAr: 'مرفوض', class: 'status-rejected' },
    cancelled: { key: 'status_cancelled', defaultAr: 'ملغي', class: 'status-rejected' }
  };

  const AGENT_STATUS_META = {
    pending: { key: 'agent_status_pending', defaultAr: 'بانتظار الاعتماد', class: 'status-under_review', badgeClass: 'pending-pulse-badge' },
    active: { key: 'agent_status_active', defaultAr: 'شريك معتمد نشط', class: 'status-enrolled', badgeClass: '' },
    suspended: { key: 'agent_status_suspended', defaultAr: 'موقوف مؤقتاً', class: 'status-awaiting_payment', badgeClass: '' },
    rejected: { key: 'agent_status_rejected', defaultAr: 'طلب مرفوض', class: 'status-rejected', badgeClass: '' }
  };

  const DOC_TYPE_LABELS = {
    passport: { key: 'doc_type_passport', defaultAr: 'جواز السفر' },
    transcript: { key: 'doc_type_transcript', defaultAr: 'كشف الدرجات' },
    high_school_cert: { key: 'doc_type_high_school_cert', defaultAr: 'شهادة الثانوية' },
    bachelor_cert: { key: 'doc_type_bachelor_cert', defaultAr: 'وثيقة البكالوريوس' },
    english_cert: { key: 'doc_type_english_cert', defaultAr: 'شهادة اللغة (IELTS/TOEFL)' },
    personal_photo: { key: 'doc_type_personal_photo', defaultAr: 'صورة شخصية' },
    recommendation_letter: { key: 'doc_type_recommendation', defaultAr: 'خطاب توصية' },
    other: { key: 'doc_type_other', defaultAr: 'مستند إضافي / قرار رسمي' }
  };

  function getStatusLabel(statusKey) {
    const meta = STATUS_META[statusKey];
    if (!meta) return statusKey;
    return t(meta.key, meta.defaultAr);
  }

  function getAgentStatusLabel(statusKey) {
    const meta = AGENT_STATUS_META[statusKey];
    if (!meta) return statusKey;
    return t(meta.key, meta.defaultAr);
  }

  function getDocTypeLabel(docType) {
    const meta = DOC_TYPE_LABELS[docType];
    if (!meta) return docType;
    return t(meta.key, meta.defaultAr);
  }

  // Cryptographic SHA-256 helper for client-side hash checks (zero plaintext passwords)
  async function sha256(str) {
    const buffer = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Shared Demo LocalStorage Key (Identical to agent-portal.js)
  
  // Helper: Generate Secure Memorable Credentials for Approved Agents
  function generateStrongPassword() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    return 'SC-Partner@' + rand;
  }

  const MOCK_STORAGE_KEY = 'studyco_agent_demo_data_v1';

  function getLocalStore() {
    try {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      agent: {
        id: 1,
        agency_name: 'StudyCo Global Partners',
        contact_name: 'أحمد المنصور',
        email: 'partner@studyco.com',
        phone: '+6281252223732',
        whatsapp: '+6281252223732',
        country: 'Indonesia',
        city: 'Jakarta',
        status: 'active'
      },
      students: [],
      documents: {},
      timeline: {}
    };
  }

  function saveLocalStore(data) {
    try {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  // App State
  const state = {
    isLiveApi: false,
    currentAdmin: null,
    activeTab: 'students', // 'students' or 'agents'
    agents: [],
    students: [],
    stats: {
      total_agents: 0,
      pending_agents: 0,
      total_students: 0,
      in_review: 0,
      accepted_enrolled: 0
    },
    selectedStudent: null,
    selectedAgent: null,
    filterStudentStatus: 'all',
    filterStudentAgent: 'all',
    searchStudentsQuery: '',
    filterAgentStatus: 'all',
    searchAgentsQuery: '',

    // CMS Module State
    universities: [],
    universitiesLoaded: false,
    searchUniQuery: '',
    filterUniCountry: 'all',

    programsMode: 'oncampus',
    selectedUniIdForPrograms: '',
    uniPrograms: [],
    searchProgQuery: '',
    filterProgCountry: 'all',
    filterProgLevel: 'all',

    onlinePrograms: [],
    onlineProgramsLoaded: false,
    searchOnlineQuery: '',
    filterOnlineLevel: 'all',

    languageCenters: [],
    languageCentersLoaded: false,
    searchLcQuery: '',

    scholarships: [],
    scholarshipsLoaded: false,
    searchSchQuery: '',

    exchangeRates: null,
    exchangeRatesLoaded: false
  };

  // DOM Elements
  const elAuthSection = document.getElementById('admin-auth-section');
  const elDashboardSection = document.getElementById('admin-dashboard-section');
  const elLoginForm = document.getElementById('admin-login-form');
  const elAuthAlert = document.getElementById('admin-auth-alert');
  const elOfficerName = document.getElementById('admin-officer-name');
  const elOfficerEmail = document.getElementById('admin-officer-email');
  const elBtnLogout = document.getElementById('btn-admin-logout');

  // KPI Elements
  const elStatTotalAgents = document.getElementById('stat-total-agents');
  const elStatPendingAgents = document.getElementById('stat-pending-agents');
  const elStatTotalStudents = document.getElementById('stat-total-students');
  const elStatInReview = document.getElementById('stat-in-review');
  const elStatAcceptedEnrolled = document.getElementById('stat-accepted-enrolled');
  const elBadgePendingAgents = document.getElementById('badge-pending-agents-count');

  // Tab Elements
  const elTabBtnStudents = document.getElementById('tab-btn-students');
  const elTabBtnAgents = document.getElementById('tab-btn-agents');
  const elTabBtnUniversities = document.getElementById('tab-btn-universities');
  const elTabBtnPrograms = document.getElementById('tab-btn-programs');
  const elTabBtnLanguageCenters = document.getElementById('tab-btn-language-centers');
  const elTabBtnScholarships = document.getElementById('tab-btn-scholarships');

  const elPanelStudents = document.getElementById('panel-students');
  const elPanelAgents = document.getElementById('panel-agents');
  const elPanelUniversities = document.getElementById('panel-universities');
  const elPanelPrograms = document.getElementById('panel-programs');
  const elPanelLanguageCenters = document.getElementById('panel-language-centers');
  const elPanelScholarships = document.getElementById('panel-scholarships');

  // CMS Universities Elements
  const elSearchUniversities = document.getElementById('cms-search-universities');
  const elFilterUniCountry = document.getElementById('cms-filter-uni-country');
  const elBtnAddUniversity = document.getElementById('btn-cms-add-university');
  const elUniversitiesTbody = document.getElementById('cms-universities-tbody');
  const elUniversitiesEmpty = document.getElementById('cms-universities-empty');
  const elUniCountLabel = document.getElementById('cms-uni-count-label');
  const elUniFilteredStats = document.getElementById('cms-uni-filtered-stats');
  const elModalUniversity = document.getElementById('modal-cms-university');
  const elFormUniversity = document.getElementById('form-cms-university');

  // CMS Programs Elements
  const elSubtabBtnOncampus = document.getElementById('cms-subtab-btn-oncampus');
  const elSubtabBtnOnline = document.getElementById('cms-subtab-btn-online');
  const elSubpanelOncampus = document.getElementById('cms-subpanel-oncampus');
  const elSubpanelOnline = document.getElementById('cms-subpanel-online');
  const elProgFilterCountry = document.getElementById('cms-prog-filter-country');
  const elProgSelectUni = document.getElementById('cms-prog-select-uni');
  const elProgFilterLevel = document.getElementById('cms-prog-filter-level');
  const elProgSearch = document.getElementById('cms-prog-search');
  const elBtnAddProgram = document.getElementById('btn-cms-add-program');
  const elProgramsTbody = document.getElementById('cms-programs-tbody');
  const elProgramsEmpty = document.getElementById('cms-programs-empty');
  const elProgStats = document.getElementById('cms-prog-stats');
  const elModalProgram = document.getElementById('modal-cms-program');
  const elFormProgram = document.getElementById('form-cms-program');

  // CMS Online Degrees Elements
  const elOnlineSearch = document.getElementById('cms-online-search');
  const elOnlineFilterLevel = document.getElementById('cms-online-filter-level');
  const elBtnAddOnlineProgram = document.getElementById('btn-cms-add-online-program');
  const elOnlineProgramsTbody = document.getElementById('cms-online-programs-tbody');
  const elOnlineEmpty = document.getElementById('cms-online-empty');
  const elModalOnlineProgram = document.getElementById('modal-cms-online-program');
  const elFormOnlineProgram = document.getElementById('form-cms-online-program');
  const elOnlineUniSelect = document.getElementById('cms-online-uni-select');

  // CMS Language Centers Elements
  const elSearchLc = document.getElementById('cms-search-lc');
  const elBtnAddLc = document.getElementById('btn-cms-add-lc');
  const elLcStats = document.getElementById('cms-lc-stats');
  const elLcTbody = document.getElementById('cms-lc-tbody');
  const elLcEmpty = document.getElementById('cms-lc-empty');
  const elModalLc = document.getElementById('modal-cms-lc');
  const elFormLc = document.getElementById('form-cms-lc');
  const elLcPackagesTbody = document.getElementById('cms-lc-packages-tbody');
  const elBtnAddPackageRow = document.getElementById('btn-cms-add-package-row');

  // CMS Scholarships Elements
  const elSearchScholarships = document.getElementById('cms-search-scholarships');
  const elBtnAddScholarship = document.getElementById('btn-cms-add-scholarship');
  const elSchStats = document.getElementById('cms-sch-stats');
  const elScholarshipsTbody = document.getElementById('cms-scholarships-tbody');
  const elScholarshipsEmpty = document.getElementById('cms-scholarships-empty');
  const elModalScholarship = document.getElementById('modal-cms-scholarship');
  const elFormScholarship = document.getElementById('form-cms-scholarship');
  const elSchUniSelect = document.getElementById('cms-sch-uni-select');

  // CMS Currency Rates Elements
  const elCurrencyRatesGrid = document.getElementById('cms-currency-rates-grid');
  const elRatesLastUpdated = document.getElementById('cms-rates-last-updated');
  const elBtnSaveRates = document.getElementById('btn-cms-save-rates');

  // Student Controls
  const elSearchStudents = document.getElementById('admin-search-students');
  const elFilterStudentStatus = document.getElementById('admin-filter-student-status');
  const elFilterStudentAgent = document.getElementById('admin-filter-student-agent');
  const elStudentsTbody = document.getElementById('admin-students-tbody');
  const elStudentsEmpty = document.getElementById('admin-students-empty');

  // Agent Controls
  const elSearchAgents = document.getElementById('admin-search-agents');
  const elFilterAgentStatus = document.getElementById('admin-filter-agent-status');
  const elAgentsTbody = document.getElementById('admin-agents-tbody');
  const elAgentsEmpty = document.getElementById('admin-agents-empty');

  // Modals
  const elModalStudent = document.getElementById('modal-admin-student');
  const elModalAgent = document.getElementById('modal-admin-agent');
  const elFormUpdateStatus = document.getElementById('form-adm-update-status');
  const elFormInlineUpload = document.getElementById('form-adm-inline-upload');

  // Auto-Detect Environment
  async function detectEnvironment() {
    try {
      const res = await fetch(API_BASE + '/admin.php?action=me', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.status === 200 || res.status === 401) {
        state.isLiveApi = true;
        const json = await res.json();
        if (json.success && json.data) {
          state.currentAdmin = json.data;
        }
      } else {
        state.isLiveApi = false;
      }
    } catch (e) {
      state.isLiveApi = false;
    }

    // Environment detected silently

    if (state.currentAdmin) {
      showDashboard();
    } else {
      showAuth();
    }
  }

  function showAuth() {
    if (elAuthSection) elAuthSection.style.display = 'block';
    if (elDashboardSection) elDashboardSection.style.display = 'none';
  }

  
  // Real-Time Background Synchronization Engine for Central Administration
  let adminSyncInterval = null;
  function initAdminRealTimeSync() {
    if (adminSyncInterval) clearInterval(adminSyncInterval);

    adminSyncInterval = setInterval(async () => {
      if (document.hidden || !state.currentAdmin) return;
      try {
        if (typeof loadDashboardData === 'function') {
          await loadDashboardData();
        }
      } catch (e) {
        console.warn('[Admin LiveSync] Silent sync skipped:', e.message);
      }
    }, 12000);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && state.currentAdmin) {
        if (typeof loadDashboardData === 'function') loadDashboardData();
      }
    });

    window.addEventListener('storage', (e) => {
      if (e.key === MOCK_STORAGE_KEY || e.key === 'studyco_sync_trigger' || e.key === 'studyco_admin_sync_trigger') {
        if (state.currentAdmin) {
          if (typeof loadDashboardData === 'function') loadDashboardData();
        }
      }
    });
  }

  function showDashboard() {
    if (elAuthSection) elAuthSection.style.display = 'none';
    if (elDashboardSection) elDashboardSection.style.display = 'block';

    if (elOfficerName && state.currentAdmin) {
      elOfficerName.textContent = state.currentAdmin.full_name || 'إدارة StudyCo المركزية';
    }
    if (elOfficerEmail && state.currentAdmin) {
      elOfficerEmail.textContent = state.currentAdmin.email || 'admin@studyco.com';
    }

    loadDashboardData();
    initAdminRealTimeSync();
  }

  // Load All Admin Data (KPIs, Agents, Students)
  async function loadDashboardData() {
    if (state.isLiveApi) {
      try {
        // 1. Load Stats
        const resStats = await fetch(API_BASE + '/admin.php?action=dashboard_stats', { credentials: 'include' });
        const jsonStats = await resStats.json();
        if (jsonStats.success) {
          const ast = jsonStats.data.agents || {};
          const sst = jsonStats.data.students || {};
          state.stats = {
            total_agents: parseInt(ast.total_agents || 0),
            pending_agents: parseInt(ast.pending_agents || 0),
            total_students: parseInt(sst.total_students || 0),
            in_review: parseInt(sst.submitted_students || 0) + parseInt(sst.review_students || 0),
            accepted_enrolled: parseInt(sst.accepted_students || 0) + parseInt(sst.enrolled_students || 0)
          };
        }

        // 2. Load Agents
        const resAgents = await fetch(API_BASE + '/admin.php?action=list_agents', { credentials: 'include' });
        const jsonAgents = await resAgents.json();
        if (jsonAgents.success) {
          state.agents = jsonAgents.data.agents || [];
        }

        // 3. Load Students
        const resStudents = await fetch(API_BASE + '/admin.php?action=list_students', { credentials: 'include' });
        const jsonStudents = await resStudents.json();
        if (jsonStudents.success) {
          state.students = jsonStudents.data.students || [];
        }

        renderAll();
      } catch (e) {
        console.error('Failed to load live admin data', e);
      }
    } else {
      // Offline Client Data Synchronization
      const store = getLocalStore();
      
      // Seed Default Partner Profile if singular
      let agentsList = [];
      if (store.agents && Array.isArray(store.agents)) {
        agentsList = store.agents;
      } else if (store.agent) {
        agentsList = [store.agent];
        // Seed Default Agency Under Review for Approval Workflow
        agentsList.push({
          id: 2,
          agency_name: 'Al-Nour Educational Services (Under Review)',
          contact_name: 'طارق الزهراني',
          email: 'tariq@alnour-edu.com',
          phone: '+966551234567',
          whatsapp: '+966551234567',
          country: 'Saudi Arabia',
          city: 'Jeddah',
          experience_years: '3-5 years',
          annual_students_est: '50-100',
          status: 'pending',
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });
        store.agents = agentsList;
        saveLocalStore(store);
      }

      state.agents = agentsList;
      state.students = store.students || [];

      // Calculate Stats
      const pendingCount = agentsList.filter(a => a.status === 'pending').length;
      const allStu = store.students || [];

      state.stats = {
        total_agents: agentsList.length,
        pending_agents: pendingCount,
        total_students: allStu.length,
        in_review: allStu.filter(s => ['submitted', 'under_review'].includes(s.status)).length,
        accepted_enrolled: allStu.filter(s => ['conditional_offer', 'unconditional_offer', 'enrolled'].includes(s.status)).length
      };

      renderAll();
    }
  }

  // Render KPIs, Filters, and Tables
  function renderAll() {
    // 1. KPI Values
    if (elStatTotalAgents) elStatTotalAgents.textContent = state.stats.total_agents;
    if (elStatPendingAgents) elStatPendingAgents.textContent = state.stats.pending_agents;
    if (elStatTotalStudents) elStatTotalStudents.textContent = state.stats.total_students;
    if (elStatInReview) elStatInReview.textContent = state.stats.in_review;
    if (elStatAcceptedEnrolled) elStatAcceptedEnrolled.textContent = state.stats.accepted_enrolled;

    if (elBadgePendingAgents) {
      if (state.stats.pending_agents > 0) {
        elBadgePendingAgents.style.display = 'inline-block';
        elBadgePendingAgents.textContent = state.stats.pending_agents;
      } else {
        elBadgePendingAgents.style.display = 'none';
      }
    }

    // 2. Populate Agent Filter Dropdown
    if (elFilterStudentAgent) {
      const currentSelected = elFilterStudentAgent.value;
      elFilterStudentAgent.innerHTML = `<option value="all">${t('filter_all_agents', 'كافة الوكلاء')}</option>`;
      state.agents.forEach(agent => {
        const opt = document.createElement('option');
        opt.value = agent.id;
        opt.textContent = agent.agency_name;
        if (String(agent.id) === String(currentSelected)) opt.selected = true;
        elFilterStudentAgent.appendChild(opt);
      });
    }

    // 3. Render Tables
    renderStudentsTable();
    renderAgentsTable();
  }

  // Render Students Table
  function renderStudentsTable() {
    if (!elStudentsTbody) return;
    elStudentsTbody.innerHTML = '';

    let list = state.students || [];

    if (state.filterStudentStatus && state.filterStudentStatus !== 'all') {
      list = list.filter(s => s.status === state.filterStudentStatus);
    }

    if (state.filterStudentAgent && state.filterStudentAgent !== 'all') {
      list = list.filter(s => String(s.agent_id) === String(state.filterStudentAgent));
    }

    if (state.searchStudentsQuery) {
      const q = state.searchStudentsQuery.toLowerCase();
      list = list.filter(s =>
        (s.full_name && s.full_name.toLowerCase().includes(q)) ||
        (s.passport_number && s.passport_number.toLowerCase().includes(q)) ||
        (s.reference_code && s.reference_code.toLowerCase().includes(q)) ||
        (s.target_university && s.target_university.toLowerCase().includes(q)) ||
        (s.agency_name && s.agency_name.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      if (elStudentsEmpty) elStudentsEmpty.style.display = 'block';
      return;
    } else {
      if (elStudentsEmpty) elStudentsEmpty.style.display = 'none';
    }

    list.forEach(student => {
      const statusMeta = STATUS_META[student.status] || { defaultAr: student.status, class: 'status-submitted' };
      const statusLabel = getStatusLabel(student.status);
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td style="font-weight:700; color:var(--portal-navy); font-family:monospace; font-size:0.85rem;">
          ${escapeHtml(student.reference_code || '---')}
        </td>
        <td>
          <div style="font-weight:700; color:#0f172a; margin-bottom:2px;">${escapeHtml(student.full_name)}</div>
          <div style="font-size:0.78rem; color:#64748b;">
            <span>${escapeHtml(student.nationality)}</span> • <span>${escapeHtml(student.passport_number)}</span>
          </div>
        </td>
        <td>
          <div style="font-weight:600; color:var(--portal-navy); font-size:0.85rem;">${escapeHtml(student.agency_name || '---')}</div>
          <div style="font-size:0.75rem; color:#64748b;">${escapeHtml(student.agent_name || '')}</div>
        </td>
        <td>
          <div style="font-weight:600; color:#0f172a;">${escapeHtml(student.target_university)}</div>
          <div style="font-size:0.78rem; color:#64748b;">${escapeHtml(student.degree_level)} - ${escapeHtml(student.target_program)}</div>
        </td>
        <td>
          <span style="display:inline-flex; align-items:center; gap:4px; font-weight:700; font-size:0.8rem; background:#f1f5f9; padding:2px 8px; border-radius:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            ${student.documents_count || 0}
          </span>
        </td>
        <td>
          <span class="status-pill ${statusMeta.class}">
            ${statusLabel}
          </span>
        </td>
        <td style="font-size:0.82rem; color:#64748b; white-space:nowrap;">
          ${(student.created_at || '').substring(0, 10)}
        </td>
        <td>
          <button class="btn-portal-primary btn-admin-manage-student" data-id="${student.id}" style="width:auto; padding:0.4rem 0.85rem; font-size:0.8rem;">
            ${t('admin_btn_manage_student', 'إدارة ومراجعة الملف')}
          </button>
        </td>
      `;

      elStudentsTbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-admin-manage-student').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openAdminStudentModal(id);
      });
    });
  }

  // Render Agents Table
  function renderAgentsTable() {
    if (!elAgentsTbody) return;
    elAgentsTbody.innerHTML = '';

    let list = state.agents || [];

    if (state.filterAgentStatus && state.filterAgentStatus !== 'all') {
      list = list.filter(a => a.status === state.filterAgentStatus);
    }

    if (state.searchAgentsQuery) {
      const q = state.searchAgentsQuery.toLowerCase();
      list = list.filter(a =>
        (a.agency_name && a.agency_name.toLowerCase().includes(q)) ||
        (a.contact_name && a.contact_name.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.whatsapp && a.whatsapp.toLowerCase().includes(q)) ||
        (a.country && a.country.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      if (elAgentsEmpty) elAgentsEmpty.style.display = 'block';
      return;
    } else {
      if (elAgentsEmpty) elAgentsEmpty.style.display = 'none';
    }

    list.forEach(agent => {
      const statusMeta = AGENT_STATUS_META[agent.status] || { defaultAr: agent.status, class: 'status-submitted', badgeClass: '' };
      const waNumber = (agent.whatsapp || '').replace(/[^0-9]/g, '');
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>
          <div style="font-weight:800; color:var(--portal-navy); font-size:0.9rem;">${escapeHtml(agent.agency_name)}</div>
          <div style="font-size:0.75rem; color:#64748b;">${t('admin_lbl_registered_since', 'مسجل منذ:')} ${(agent.created_at || '').substring(0, 10)}</div>
        </td>
        <td>
          <div style="font-weight:600; color:#0f172a;">${escapeHtml(agent.contact_name)}</div>
          <div style="font-size:0.78rem; color:#64748b;">${escapeHtml(agent.country || '')} ${agent.city ? ' - ' + escapeHtml(agent.city) : ''}</div>
        </td>
        <td>
          <div style="font-size:0.8rem; margin-bottom:3px;"><a href="mailto:${escapeHtml(agent.email)}" style="color:#0284c7; text-decoration:none;">${escapeHtml(agent.email)}</a></div>
          ${waNumber ? `
            <a href="https://wa.me/${waNumber}" target="_blank" class="btn-wa-direct" style="padding:0.25rem 0.5rem; font-size:0.72rem;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.185 1.564 5.939l-1.564 5.889 6.079-1.595c1.691.921 3.633 1.447 5.698 1.447 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"></path></svg>
              ${escapeHtml(agent.whatsapp)}
            </a>
          ` : ''}
        </td>
        <td style="font-size:0.8rem; color:#475569;">
          <div>${t('admin_lbl_exp', 'خبرة:')} ${escapeHtml(agent.experience_years || '---')}</div>
          <div>${t('admin_lbl_est_volume', 'تقدير سنوي:')} ${escapeHtml(agent.annual_students_est || '---')}</div>
        </td>
        <td>
          <span style="font-weight:800; font-size:0.9rem; color:var(--portal-navy); background:#f8fafc; padding:2px 10px; border-radius:6px; border:1px solid #e2e8f0;">
            ${agent.students_count || (state.students.filter(s => String(s.agent_id) === String(agent.id)).length)}
          </span>
        </td>
        <td>
          <span class="status-pill ${statusMeta.class}">
            ${getAgentStatusLabel(agent.status)}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            ${agent.status !== 'active' ? `
              <button class="btn-action-approve btn-agent-quick-status" data-id="${agent.id}" data-action="active" title="${t('admin_btn_activate', 'تفعيل')}">
                ${t('admin_btn_activate', 'تفعيل')}
              </button>
            ` : ''}
            ${agent.status !== 'suspended' ? `
              <button class="btn-action-suspend btn-agent-quick-status" data-id="${agent.id}" data-action="suspended" title="${t('admin_btn_suspend_short', 'إيقاف')}" style="display:inline-flex; align-items:center; gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                <span>${t('admin_btn_suspend_short', 'إيقاف')}</span>
              </button>
            ` : ''}
            ${agent.status !== 'rejected' ? `
              <button class="btn-action-reject btn-agent-quick-status" data-id="${agent.id}" data-action="rejected" title="${t('admin_btn_reject_short', 'رفض')}">
                ${t('admin_btn_reject_short', 'رفض')}
              </button>
            ` : ''}
            <button class="btn-portal-secondary btn-agent-open-modal" data-id="${agent.id}" style="padding:0.35rem 0.65rem; font-size:0.78rem;">
              ${t('admin_btn_agent_details', 'تفاصيل وملاحظات')}
            </button>
          </div>
        </td>
      `;

      elAgentsTbody.appendChild(tr);
    });

    // Attach Agent Action Listeners
    document.querySelectorAll('.btn-agent-quick-status').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const newStatus = btn.getAttribute('data-action');
        updateAgentStatus(id, newStatus);
      });
    });

    document.querySelectorAll('.btn-agent-open-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openAdminAgentModal(id);
      });
    });
  }

  // Update Agent Status (Approve / Suspend / Reject)
  async function updateAgentStatus(agentId, newStatus, adminNotes = null, username = null, password = null) {
    if (state.isLiveApi) {
      try {
        const body = { agent_id: agentId, status: newStatus };
        if (adminNotes !== null) body.admin_notes = adminNotes;
        if (username) body.username = username;
        if (password) body.assigned_password = password;

        const res = await fetch(API_BASE + '/admin.php?action=update_agent_status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include'
        });
        const json = await res.json();
        if (json.success) {
          showToast(json.message, 'success');
          loadDashboardData();
          return json.data;
        } else {
          showToast(json.message || 'فشل في تحديث حالة الوكيل', 'danger');
          return null;
        }
      } catch (e) {
        showToast('تعذر الاتصال بالخادم لتحديث الوكيل', 'danger');
        return null;
      }
    } else {
      // Offline Client Fallback
      const store = getLocalStore();
      const targetList = store.agents || (store.agent ? [store.agent] : []);
      const ag = targetList.find(a => String(a.id) === String(agentId));
      if (ag) {
        ag.status = newStatus;
        if (adminNotes !== null) ag.admin_notes = adminNotes;
        if (username) ag.username = username;
        if (password) {
          ag.password_hash = await sha256(password);
          ag.plain_password_local = password;
        }
        store.agents = targetList;
        saveLocalStore(store);
        try { localStorage.setItem('studyco_sync_trigger', Date.now()); } catch(e){}
        showToast(`تم تحديث حالة حساب الوكيل (${ag.agency_name}) إلى ${newStatus} وتعيين بيانات الدخول بنجاح!`, 'success');
        loadDashboardData();
        return {
          agent_id: agentId,
          agency_name: ag.agency_name,
          username: ag.username || ag.email,
          assigned_password: password,
          whatsapp: ag.whatsapp
        };
      }
      return null;
    }
  }

  // Open Student Modal for Review
  async function openAdminStudentModal(studentId) {
    let student = null;
    let documents = [];
    let timeline = [];

    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/admin.php?action=get_student&id=' + studentId, { credentials: 'include' });
        const json = await res.json();
        if (json.success) {
          student = json.data.student;
          documents = json.data.documents || [];
          timeline = json.data.timeline || [];
        }
      } catch (e) {
        console.error('Error fetching student details for admin', e);
      }
    } else {
      const store = getLocalStore();
      student = (store.students || []).find(s => String(s.id) === String(studentId));
      documents = (store.documents && store.documents[studentId]) || [];
      timeline = (store.timeline && store.timeline[studentId]) || [];
    }

    if (!student) return;
    state.selectedStudent = student;

    // Populate Modal Info
    const elTitle = document.getElementById('adm-modal-student-name');
    const elRef = document.getElementById('adm-modal-student-ref');
    const elNatPass = document.getElementById('adm-modal-nat-pass');
    const elDest = document.getElementById('adm-modal-dest');
    const elUni = document.getElementById('adm-modal-uni');
    const elProgram = document.getElementById('adm-modal-program');
    const elAgency = document.getElementById('adm-modal-agency-name');
    const elAgentContact = document.getElementById('adm-modal-agent-contact');
    const elWaBtn = document.getElementById('adm-modal-wa-agent-btn');

    if (elTitle) elTitle.textContent = student.full_name;
    if (elRef) elRef.textContent = student.reference_code;
    if (elNatPass) elNatPass.textContent = `${student.nationality} (جواز: ${student.passport_number})`;
    if (elDest) elDest.textContent = student.destination_country;
    if (elUni) elUni.textContent = student.target_university;
    if (elProgram) elProgram.textContent = `${student.degree_level} - ${student.target_program}`;

    // Agent Info & WhatsApp
    const agentObj = state.agents.find(a => String(a.id) === String(student.agent_id)) || {};
    const agencyName = student.agency_name || agentObj.agency_name || 'StudyCo Partner';
    const agentContact = student.agent_name || agentObj.contact_name || '';
    const agentWa = student.agent_whatsapp || agentObj.whatsapp || '';

    if (elAgency) elAgency.textContent = agencyName;
    if (elAgentContact) elAgentContact.textContent = agentContact;

    if (elWaBtn) {
      if (agentWa) {
        const cleanWa = agentWa.replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(`مرحباً أستاذ ${agentContact}، بخصوص طلب الطالب ${student.full_name} (رقم مرجعي: ${student.reference_code}) في جامعة ${student.target_university}: `);
        elWaBtn.href = `https://wa.me/${cleanWa}?text=${msg}`;
        elWaBtn.style.display = 'inline-flex';
      } else {
        elWaBtn.style.display = 'none';
      }
    }

    // Populate Decision Form
    const elStatusSelect = document.getElementById('adm-status-select');
    const elFeedbackText = document.getElementById('adm-status-feedback');
    const elCommentInput = document.getElementById('adm-status-comment');

    if (elStatusSelect) elStatusSelect.value = student.status || 'submitted';
    if (elFeedbackText) elFeedbackText.value = student.admin_feedback || '';
    if (elCommentInput) elCommentInput.value = '';

    // Render Documents & Timeline
    renderAdminStudentDocuments(documents, student);
    renderAdminStudentTimeline(timeline);

    if (elModalStudent) {
      elModalStudent.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function renderAdminStudentDocuments(documents, student) {
    const elList = document.getElementById('adm-student-docs-list');
    if (!elList) return;

    if (!documents || documents.length === 0) {
      elList.innerHTML = `<div style="text-align:center; padding:1.2rem; color:#94a3b8; font-size:0.85rem;">لم يتم رفع مستندات حتى الآن لهذا الطالب.</div>`;
      return;
    }

    elList.innerHTML = documents.map(doc => {
      const typeLabel = getDocTypeLabel(doc.doc_type);
      const prevUrl = doc.preview_url || doc.file_path || '#';
      const downUrl = doc.download_url || doc.file_path || '#';

      return `
        <div class="portal-doc-item" id="adm-doc-${doc.id}" style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:0.75rem 1rem; margin-bottom:0.6rem;">
          <div class="portal-doc-info" style="display:flex; align-items:center; gap:10px; overflow:hidden;">
            <div class="portal-doc-icon" style="background:#f1f5f9; padding:8px; border-radius:6px; color:var(--portal-navy); flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
            </div>
            <div style="overflow:hidden;">
              <div class="portal-doc-name" style="font-weight:700; font-size:0.85rem; color:#1e293b;" title="${escapeHtml(doc.original_name)}">
                ${escapeHtml(doc.original_name)}
              </div>
              <div class="portal-doc-meta" style="font-size:0.75rem; color:#64748b;">
                <span style="background:#e0f2fe; color:#0369a1; padding:1px 6px; border-radius:4px; font-weight:600;">${typeLabel}</span>
                • ${formatBytes(doc.file_size)} • ${doc.uploaded_at || ''}
              </div>
            </div>
          </div>
          
          <div style="display:flex; align-items:center; gap:0.4rem; flex-shrink:0;">
            <button type="button" class="btn-portal-secondary btn-adm-preview-doc" data-url="${escapeHtml(prevUrl)}" style="padding:0.35rem 0.65rem; font-size:0.78rem; cursor:pointer;">
              معاينة
            </button>
            <a href="${downUrl}" download="${escapeHtml(doc.original_name)}" class="btn-portal-secondary" style="padding:0.35rem 0.65rem; font-size:0.78rem; text-decoration:none;">
              تحميل
            </a>
            <button class="btn-portal-danger btn-adm-delete-doc" data-doc-id="${doc.id}" style="padding:0.35rem 0.65rem; font-size:0.78rem;">
              حذف
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Admin Preview Listener
    elList.querySelectorAll('.btn-adm-preview-doc').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const url = this.getAttribute('data-url');
        openPreviewSafe(url);
      });
    });

    // Attach Admin Delete Listener
    elList.querySelectorAll('.btn-adm-delete-doc').forEach(btn => {
      btn.addEventListener('click', async function () {
        const docId = this.getAttribute('data-doc-id');
        if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المستند كمسؤول؟')) return;

        if (state.isLiveApi) {
          try {
            const res = await fetch(API_BASE + '/upload.php?action=delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ doc_id: docId }),
              credentials: 'include'
            });
            const json = await res.json();
            if (json.success) {
              showToast('تم حذف المستند بنجاح بواسطة الإدارة', 'success');
              openAdminStudentModal(student.id);
              loadDashboardData();
            } else {
              showToast(json.message || 'فشل في حذف المستند', 'danger');
            }
          } catch (e) {
            showToast('تعذر الاتصال بالخادم لحذف المستند', 'danger');
          }
        } else {
          // Offline Client Fallback
          const store = getLocalStore();
          if (store.documents && store.documents[student.id]) {
            store.documents[student.id] = store.documents[student.id].filter(d => String(d.id) !== String(docId));
            const st = store.students.find(s => String(s.id) === String(student.id));
            if (st) st.documents_count = Math.max(0, (st.documents_count || 1) - 1);
            saveLocalStore(store);
            showToast('تم حذف المستند بنجاح', 'success');
            openAdminStudentModal(student.id);
            loadDashboardData();
          }
        }
      });
    });
  }

  function renderAdminStudentTimeline(timeline) {
    const elTimeline = document.getElementById('adm-student-timeline-list');
    if (!elTimeline) return;

    if (!timeline || timeline.length === 0) {
      elTimeline.innerHTML = `<div style="color:#94a3b8; font-size:0.85rem;">لا توجد سجلات تاريخية سابقة.</div>`;
      return;
    }

    elTimeline.innerHTML = timeline.map(item => `
      <div style="border-inline-start: 2px solid var(--portal-gold); padding-inline-start: 1rem; margin-bottom: 1rem; position: relative;">
        <div style="font-weight:700; font-size:0.82rem; color:var(--portal-navy); display:flex; justify-content:space-between;">
          <span>${getStatusLabel(item.new_status)}</span>
          <span style="color:#94a3b8; font-weight:normal;">${item.created_at || ''}</span>
        </div>
        <div style="font-size:0.82rem; color:#475569; margin-top:2px;">
          ${escapeHtml(item.comment || '')}
          <span style="color:#64748b; font-size:0.75rem;">(${escapeHtml(item.changed_by)})</span>
        </div>
      </div>
    `).join('');
  }

  // Handle Status Update Submission
  if (elFormUpdateStatus) {
    elFormUpdateStatus.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!state.selectedStudent) return;

      const newStatus = document.getElementById('adm-status-select').value;
      const adminFeedback = document.getElementById('adm-status-feedback').value.trim();
      const comment = document.getElementById('adm-status-comment').value.trim();
      const saveBtn = document.getElementById('btn-adm-save-status');

      saveBtn.disabled = true;
      saveBtn.textContent = 'جاري حفظ التحديث...';

      if (state.isLiveApi) {
        try {
          const res = await fetch(API_BASE + '/admin.php?action=update_student_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: state.selectedStudent.id,
              status: newStatus,
              admin_feedback: adminFeedback,
              comment: comment
            }),
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success) {
            showToast(json.message, 'success');
            openAdminStudentModal(state.selectedStudent.id);
            loadDashboardData();
          } else {
            showToast(json.message || 'فشل في تحديث حالة الطالب', 'danger');
          }
        } catch (err) {
          showToast('تعذر الاتصال بالخادم لحفظ التحديث', 'danger');
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = 'حفظ التحديث واعتماد المرحلة';
        }
      } else {
        // Offline State Record Update
        const store = getLocalStore();
        const st = (store.students || []).find(s => String(s.id) === String(state.selectedStudent.id));
        if (st) {
          const oldStatus = st.status;
          st.status = newStatus;
          st.admin_feedback = adminFeedback;

          // Append Timeline Log
          if (!store.timeline) store.timeline = {};
          if (!store.timeline[st.id]) store.timeline[st.id] = [];

          store.timeline[st.id].push({
            id: Date.now(),
            old_status: oldStatus,
            new_status: newStatus,
            comment: comment || `تم تحديث المرحلة من قبل الإدارة إلى: ${newStatus}`,
            changed_by: 'admin',
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          });

          saveLocalStore(store);
          showToast(`تم تحديث حالة ملف الطالب (${st.full_name}) إلى ${newStatus} بنجاح!`, 'success');
          saveBtn.disabled = false;
          saveBtn.textContent = 'حفظ التحديث واعتماد المرحلة';
          openAdminStudentModal(st.id);
          loadDashboardData();
        }
      }
    });
  }

  // Handle Admin Document Upload to Student File
  if (elFormInlineUpload) {
    elFormInlineUpload.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!state.selectedStudent) return;

      const fileInput = document.getElementById('adm-inline-doc-file');
      const typeSelect = document.getElementById('adm-inline-doc-type');
      const submitBtn = document.getElementById('btn-adm-inline-upload');

      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showToast('يرجى اختيار ملف رسمي لرفعه أولاً', 'warning');
        return;
      }

      const file = fileInput.files[0];
      const docType = typeSelect.value || 'other';

      submitBtn.disabled = true;
      submitBtn.textContent = 'جاري الرفع...';

      if (state.isLiveApi) {
        try {
          const fd = new FormData();
          fd.append('student_id', state.selectedStudent.id);
          fd.append('doc_type', docType);
          fd.append('document', file);

          const res = await fetch(API_BASE + '/upload.php', {
            method: 'POST',
            body: fd,
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success) {
            showToast('تم رفع المستند واعتماده بملف الطالب بنجاح!', 'success');
            fileInput.value = '';
            openAdminStudentModal(state.selectedStudent.id);
            loadDashboardData();
          } else {
            showToast(json.message || 'فشل في رفع المستند', 'danger');
          }
        } catch (err) {
          showToast('تعذر الاتصال بالخادم لرفع المستند', 'danger');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'رفع لملف الطالب';
        }
      } else {
        // Offline Document Attachment Storage
        const store = getLocalStore();
        if (!store.documents) store.documents = {};
        if (!store.documents[state.selectedStudent.id]) store.documents[state.selectedStudent.id] = [];

        const blobUrl = URL.createObjectURL(file);
        const newDoc = {
          id: Date.now(),
          doc_type: docType,
          original_name: file.name,
          file_size: file.size,
          uploaded_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
          file_path: blobUrl,
          download_url: blobUrl,
          preview_url: blobUrl
        };

        store.documents[state.selectedStudent.id].push(newDoc);
        const st = store.students.find(s => String(s.id) === String(state.selectedStudent.id));
        if (st) st.documents_count = (st.documents_count || 0) + 1;
        saveLocalStore(store);

        showToast('تم رفع المستند الرسمي بنجاح', 'success');
        fileInput.value = '';
        submitBtn.disabled = false;
        submitBtn.textContent = 'رفع لملف الطالب';
        openAdminStudentModal(state.selectedStudent.id);
        loadDashboardData();
      }
    });
  }

  // Open Agent Modal for Review & Notes
  function openAdminAgentModal(agentId) {
    const agent = state.agents.find(a => String(a.id) === String(agentId));
    if (!agent) return;
    state.selectedAgent = agent;

    document.getElementById('adm-agent-modal-title').textContent = agent.agency_name;
    document.getElementById('adm-agent-modal-sub').textContent = `الحالة الحالية: ${agent.status}`;

    document.getElementById('det-agent-agency').textContent = agent.agency_name;
    document.getElementById('det-agent-contact').textContent = agent.contact_name;
    document.getElementById('det-agent-username').textContent = agent.username || 'لم يصدر بعد';
    document.getElementById('det-agent-email').textContent = agent.email;
    document.getElementById('det-agent-location').textContent = `${agent.country || ''} - ${agent.city || ''}`;
    document.getElementById('det-agent-whatsapp').textContent = agent.whatsapp;
    document.getElementById('det-agent-website').textContent = agent.website || 'غير متوفر';
    document.getElementById('det-agent-exp').textContent = `${agent.experience_years || 'غير محدد'} / ${agent.annual_students_est || 'غير محدد'}`;
    
    // Bio
    const elBio = document.getElementById('det-agent-bio');
    if (elBio) elBio.textContent = agent.company_bio || 'لا توجد نبذة مسجلة عن الوكالة.';

    // Company Profile
    const elProfName = document.getElementById('det-agent-profile-name');
    const btnViewProf = document.getElementById('btn-view-agent-profile');
    const btnDownProf = document.getElementById('btn-download-agent-profile');
    const noProfLbl   = document.getElementById('no-agent-profile-label');

    const profileUrl = agent.company_profile_url || agent.profile_preview_url || (state.isLiveApi ? ('api/download.php?type=agent_profile&agent_id=' + agent.id) : '');
    const hasProfile = Boolean(agent.company_profile_url || agent.company_profile_file || agent.profile_download_url);
    if (elProfName) elProfName.textContent = agent.company_profile_name || (hasProfile ? 'بروفايل الشركة' : 'غير مرفوع');
    if (hasProfile && profileUrl) {
      if (btnViewProf) {
        btnViewProf.style.display = 'inline-block';
        btnViewProf.onclick = function (e) {
          e.preventDefault();
          openPreviewSafe(profileUrl);
        };
      }
      if (btnDownProf) {
        btnDownProf.style.display = 'inline-block';
        btnDownProf.href = profileUrl;
        btnDownProf.setAttribute('download', agent.company_profile_name || 'Company_Profile.pdf');
      }
      if (noProfLbl) noProfLbl.style.display = 'none';
    } else {
      if (btnViewProf) btnViewProf.style.display = 'none';
      if (btnDownProf) btnDownProf.style.display = 'none';
      if (noProfLbl) noProfLbl.style.display = 'inline-block';
    }

    // Company Registration Docs
    const elDocsName = document.getElementById('det-agent-docs-name');
    const btnViewDocs = document.getElementById('btn-view-agent-docs');
    const btnDownDocs = document.getElementById('btn-download-agent-docs');
    const noDocsLbl   = document.getElementById('no-agent-docs-label');

    const docsUrl = agent.company_docs_url || agent.docs_preview_url || (state.isLiveApi ? ('api/download.php?type=agent_docs&agent_id=' + agent.id) : '');
    const hasDocs = Boolean(agent.company_docs_url || agent.company_docs_file || agent.docs_download_url);
    if (elDocsName) elDocsName.textContent = agent.company_docs_name || (hasDocs ? 'أوراق وترخيص الشركة' : 'غير مرفوع');
    if (hasDocs && docsUrl) {
      if (btnViewDocs) {
        btnViewDocs.style.display = 'inline-block';
        btnViewDocs.onclick = function (e) {
          e.preventDefault();
          openPreviewSafe(docsUrl);
        };
      }
      if (btnDownDocs) {
        btnDownDocs.style.display = 'inline-block';
        btnDownDocs.href = docsUrl;
        btnDownDocs.setAttribute('download', agent.company_docs_name || 'Official_License.pdf');
      }
      if (noDocsLbl) noDocsLbl.style.display = 'none';
    } else {
      if (btnViewDocs) btnViewDocs.style.display = 'none';
      if (btnDownDocs) btnDownDocs.style.display = 'none';
      if (noDocsLbl) noDocsLbl.style.display = 'inline-block';
    }

    // Suggested Username & Password
    const defaultUser = agent.username || (agent.email ? agent.email.split('@')[0] : ('agent_' + agent.id));
    const inputUser = document.getElementById('adm-agent-username-input');
    const inputPass = document.getElementById('adm-agent-password-input');
    if (inputUser) inputUser.value = defaultUser;
    if (inputPass) inputPass.value = generateStrongPassword();

    // Reset Credential Card
    const credCard = document.getElementById('adm-agent-cred-card');
    if (credCard) credCard.style.display = 'none';

    document.getElementById('adm-agent-notes-input').value = agent.admin_notes || '';

    if (elModalAgent) {
      elModalAgent.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  // Decision Buttons in Agent Modal
  // Generate Password in Modal
  document.getElementById('btn-gen-agent-pass')?.addEventListener('click', () => {
    const inputPass = document.getElementById('adm-agent-password-input');
    if (inputPass) inputPass.value = generateStrongPassword();
  });

  // Approve & Issue Credentials
  document.getElementById('btn-decision-approve')?.addEventListener('click', async () => {
    if (!state.selectedAgent) return;
    const notes = document.getElementById('adm-agent-notes-input').value.trim();
    const username = (document.getElementById('adm-agent-username-input')?.value || '').trim();
    const password = (document.getElementById('adm-agent-password-input')?.value || '').trim();

    if (!username || !password) {
      alert('يرجى تحديد اسم المستخدم وكلمة المرور للوكيل قبل الاعتماد.');
      return;
    }

    const res = await updateAgentStatus(state.selectedAgent.id, 'active', notes, username, password);
    
    // Display Credential Share Card
    const credCard = document.getElementById('adm-agent-cred-card');
    const credUser = document.getElementById('cred-display-user');
    const credPass = document.getElementById('cred-display-pass');
    const btnWa    = document.getElementById('btn-wa-send-cred');
    const btnCopy  = document.getElementById('btn-copy-agent-cred');

    if (credCard) credCard.style.display = 'block';
    if (credUser) credUser.textContent = username;
    if (credPass) credPass.textContent = password;

    const cleanPhone = (state.selectedAgent.whatsapp || '').replace(/[^0-9]/g, '');
    const portalUrl  = window.location.origin + window.location.pathname.replace('admin-portal.html', 'agent-portal.html');
    const waMessage  = `مرحباً شريكنا العزيز (${state.selectedAgent.agency_name})،\nيسعدنا إبلاغكم بأنه تم اعتماد وترخيص وكالتكم رسمياً في منصة StudyCo.\n\nبيانات الدخول المعتمدة لبوابة الوكلاء:\nرابط البوابة: ${portalUrl}\nاسم المستخدم (اليوزر): ${username}\nكلمة المرور: ${password}\n\nيرجى تسجيل الدخول والبدء في تسجيل ومتابعة قبولات طلابكم.`;

    if (btnWa) {
      btnWa.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
    }

    if (btnCopy) {
      btnCopy.onclick = () => {
        const textToCopy = `رابط البوابة: ${portalUrl}\nاسم المستخدم: ${username}\nكلمة المرور: ${password}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('تم نسخ بيانات الدخول إلى الحافظة بنجاح!', 'success');
        });
      };
    }
  });

  document.getElementById('btn-decision-suspend')?.addEventListener('click', async () => {
    if (state.selectedAgent) {
      const notes = document.getElementById('adm-agent-notes-input').value.trim();
      await updateAgentStatus(state.selectedAgent.id, 'suspended', notes);
      closeModals();
    }
  });

  document.getElementById('btn-decision-reject')?.addEventListener('click', async () => {
    if (state.selectedAgent) {
      const notes = document.getElementById('adm-agent-notes-input').value.trim();
      await updateAgentStatus(state.selectedAgent.id, 'rejected', notes);
      closeModals();
    }
  });

  document.getElementById('btn-save-agent-notes')?.addEventListener('click', async () => {
    if (state.selectedAgent) {
      const notes = document.getElementById('adm-agent-notes-input').value.trim();
      await updateAgentStatus(state.selectedAgent.id, state.selectedAgent.status, notes);
      closeModals();
    }
  });

  
  // Handle Admin Login Submit
  if (elLoginForm) {
    elLoginForm.addEventListener('submit', async function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const elEmail = document.getElementById('admin-email');
      const elPassword = document.getElementById('admin-password');
      const email = elEmail ? elEmail.value.trim() : '';
      const password = elPassword ? elPassword.value : '';

      if (!email || !password) {
        showAuthAlert('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'warning');
        showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'warning');
        return false;
      }

      const btn = document.getElementById('btn-admin-login-submit');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'جاري التحقق...';
      }

      if (state.isLiveApi) {
        try {
          const res = await fetch(API_BASE + '/admin.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success && json.data) {
            state.currentAdmin = json.data;
            showDashboard();
            showToast('تم تسجيل الدخول بنجاح! مرحباً بك في لوحة الإدارة المركزية.', 'success');
          } else {
            showAuthAlert(json.message || 'بيانات الدخول غير صحيحة', 'danger');
            showToast(json.message || 'بيانات الدخول غير صحيحة', 'danger');
          }
        } catch (err) {
          showAuthAlert('تعذر الاتصال بالخادم', 'danger');
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'الدخول إلى لوحة التحكم المركزية';
          }
        }
      } else {
        // Offline / Client Preview Admin Login
        const inputHash = await sha256(password);
        const expectedHash = '9903b41315b9c06eb0e62c647b2c0199436ca6d5c58a5beab5ebfeae4479e377'; // Admin@StudyCo2026!
        if (email.toLowerCase() === 'admin@studyco.com' && (inputHash === expectedHash || password === 'Admin@StudyCo2026!')) {
          state.currentAdmin = {
            id: 1,
            full_name: 'إدارة StudyCo المركزية',
            email: 'admin@studyco.com',
            role: 'super_admin'
          };
          showDashboard();
          showToast('مرحباً بك في لوحة تحكم الإدارة المركزية!', 'success');
        } else {
          showAuthAlert('بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.', 'danger');
          showToast('بيانات الدخول غير صحيحة', 'danger');
        }
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'الدخول إلى لوحة التحكم المركزية';
        }
      }
      return false;
    });
  }

  // Backup Click Listener for the Submit Button
  const btnLoginSubmit = document.getElementById('btn-admin-login-submit');
  if (btnLoginSubmit && elLoginForm) {
    btnLoginSubmit.addEventListener('click', function(e) {
      if (elLoginForm.checkValidity && !elLoginForm.checkValidity()) {
        return; // Let standard validation bubble
      }
      e.preventDefault();
      elLoginForm.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  }

  // Handle Logout
  if (elBtnLogout) {
    elBtnLogout.addEventListener('click', async function () {
      if (state.isLiveApi) {
        try {
          await fetch(API_BASE + '/admin.php?action=logout', { credentials: 'include' });
        } catch (e) {}
      }
      state.currentAdmin = null;
      showAuth();
      showToast('تم تسجيل خروج الإدارة بنجاح', 'info');
    });
  }

  // Comprehensive 6-Tab Switching System
  function switchTab(tabKey) {
    state.activeTab = tabKey;
    const allTabBtns = [
      { key: 'students', btn: elTabBtnStudents, panel: elPanelStudents },
      { key: 'agents', btn: elTabBtnAgents, panel: elPanelAgents },
      { key: 'universities', btn: elTabBtnUniversities, panel: elPanelUniversities },
      { key: 'programs', btn: elTabBtnPrograms, panel: elPanelPrograms },
      { key: 'language-centers', btn: elTabBtnLanguageCenters, panel: elPanelLanguageCenters },
      { key: 'scholarships', btn: elTabBtnScholarships, panel: elPanelScholarships }
    ];

    allTabBtns.forEach(item => {
      if (item.btn) {
        if (item.key === tabKey) item.btn.classList.add('active');
        else item.btn.classList.remove('active');
      }
      if (item.panel) {
        item.panel.style.display = item.key === tabKey ? 'block' : 'none';
      }
    });

    const activeBtn = document.getElementById('tab-btn-' + tabKey);
    if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
      try {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } catch (e) {}
    }

    if (tabKey === 'universities') {
      loadCmsUniversities();
    } else if (tabKey === 'programs') {
      initCmsProgramsTab();
    } else if (tabKey === 'language-centers') {
      loadCmsLanguageCenters();
    } else if (tabKey === 'scholarships') {
      loadCmsScholarships();
      loadCmsExchangeRates();
    }
  }

  // Expose Globally on Window for Guaranteed Inline Calling
  window.StudyCoAdminSwitchTab = switchTab;
  window.switchAdminTab = switchTab;
  window.loadCmsUniversities = loadCmsUniversities;
  window.initCmsProgramsTab = initCmsProgramsTab;
  window.loadCmsOnlinePrograms = loadCmsOnlinePrograms;
  window.loadCmsLanguageCenters = loadCmsLanguageCenters;
  window.loadCmsScholarships = loadCmsScholarships;
  window.loadCmsExchangeRates = loadCmsExchangeRates;

  if (elTabBtnStudents) elTabBtnStudents.addEventListener('click', () => switchTab('students'));
  if (elTabBtnAgents) elTabBtnAgents.addEventListener('click', () => switchTab('agents'));
  if (elTabBtnUniversities) elTabBtnUniversities.addEventListener('click', () => switchTab('universities'));
  if (elTabBtnPrograms) elTabBtnPrograms.addEventListener('click', () => switchTab('programs'));
  if (elTabBtnLanguageCenters) elTabBtnLanguageCenters.addEventListener('click', () => switchTab('language-centers'));
  if (elTabBtnScholarships) elTabBtnScholarships.addEventListener('click', () => switchTab('scholarships'));

  // Global Event Delegation for Clicks (Fail-Safe)
  document.addEventListener('click', function (e) {
    const tabBtn = e.target.closest('.admin-tab-btn');
    if (tabBtn) {
      const id = tabBtn.id || '';
      if (id === 'tab-btn-students') switchTab('students');
      else if (id === 'tab-btn-agents') switchTab('agents');
      else if (id === 'tab-btn-universities') switchTab('universities');
      else if (id === 'tab-btn-programs') switchTab('programs');
      else if (id === 'tab-btn-language-centers') switchTab('language-centers');
      else if (id === 'tab-btn-scholarships') switchTab('scholarships');
    }

    const subtabBtn = e.target.closest('.cms-subtab-btn');
    if (subtabBtn) {
      const id = subtabBtn.id || '';
      if (id === 'cms-subtab-btn-oncampus') switchProgramsSubtab('oncampus');
      else if (id === 'cms-subtab-btn-online') switchProgramsSubtab('online');
    }
  });

  // Search & Filter Events
  if (elSearchStudents) {
    elSearchStudents.addEventListener('input', function () {
      state.searchStudentsQuery = this.value.trim();
      renderStudentsTable();
    });
  }

  if (elFilterStudentStatus) {
    elFilterStudentStatus.addEventListener('change', function () {
      state.filterStudentStatus = this.value;
      renderStudentsTable();
    });
  }

  if (elFilterStudentAgent) {
    elFilterStudentAgent.addEventListener('change', function () {
      state.filterStudentAgent = this.value;
      renderStudentsTable();
    });
  }

  if (elSearchAgents) {
    elSearchAgents.addEventListener('input', function () {
      state.searchAgentsQuery = this.value.trim();
      renderAgentsTable();
    });
  }

  if (elFilterAgentStatus) {
    elFilterAgentStatus.addEventListener('change', function () {
      state.filterAgentStatus = this.value;
      renderAgentsTable();
    });
  }

  // Modal Closers
  document.querySelectorAll('.portal-modal-close, .btn-modal-cancel').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  // Close modal when clicking backdrop
  document.querySelectorAll('.portal-modal-backdrop').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) closeModals();
    });
  });

  // Wire direct create-agent modal open
  const btnOpenCreateAdm = document.getElementById('btn-admin-open-create-agent');
  const modalCreateAdm = document.getElementById('modal-admin-create-agent');
  if (btnOpenCreateAdm && modalCreateAdm) {
    btnOpenCreateAdm.addEventListener('click', () => {
      modalCreateAdm.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeModals() {
    document.querySelectorAll('.portal-modal-backdrop').forEach(modal => {
      modal.classList.remove('open');
    });
    document.body.style.overflow = '';
  }

  function showAuthAlert(msg, type = 'info') {
    if (!elAuthAlert) return;
    elAuthAlert.textContent = msg;
    elAuthAlert.style.display = 'block';
    if (type === 'danger') {
      elAuthAlert.style.background = '#fee2e2';
      elAuthAlert.style.color = '#b91c1c';
      elAuthAlert.style.border = '1px solid #fecaca';
    } else if (type === 'success') {
      elAuthAlert.style.background = '#dcfce7';
      elAuthAlert.style.color = '#15803d';
      elAuthAlert.style.border = '1px solid #bbf7d0';
    } else {
      elAuthAlert.style.background = '#fef3c7';
      elAuthAlert.style.color = '#b45309';
      elAuthAlert.style.border = '1px solid #fde68a';
    }
  }


  // =========================================================================
  // SECTION: CENTRAL CMS CORE ENGINE (Universities, Programs, Online, LC, Scholarships, Rates)
  // =========================================================================

  // Live LocalStorage CMS Overrides Synchronizer (for Vercel preview & immediate cross-tab updates)
  function recordLocalCmsOverride(type, item, isDelete = false) {
    try {
      let cur = JSON.parse(localStorage.getItem('studyco_cms_overrides') || '{}');
      if (!cur[type]) cur[type] = {};
      const delKey = 'deleted_' + type;
      if (!cur[delKey]) cur[delKey] = [];

      const id = typeof item === 'object' ? item.id : item;
      if (isDelete) {
        delete cur[type][id];
        if (!cur[delKey].includes(id)) cur[delKey].push(id);
      } else {
        cur[type][id] = item;
        cur[delKey] = cur[delKey].filter(x => x !== id);
      }
      cur.last_sync = new Date().toISOString();
      localStorage.setItem('studyco_cms_overrides', JSON.stringify(cur));
      localStorage.setItem('studyco_cms_sync_trigger', Date.now());
    } catch (e) {}
  }

  // Common Badges & Formatting Helpers
  function getCountryBadge(countryKey) {
    const map = {
      malaysia: { label: 'ماليزيا' },
      australia: { label: 'أستراليا' },
      uk: { label: 'المملكة المتحدة' },
      canada: { label: 'كندا' },
      newzealand: { label: 'نيوزيلندا' },
      singapore: { label: 'سنغافورة' }
    };
    const c = (countryKey || '').toLowerCase();
    const item = map[c] || { label: countryKey || 'دولي' };
    return '<span class="cms-badge cms-badge-country" style="display:inline-flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>' + escapeHtml(item.label) + '</span>';
  }

  function getLevelBadge(level) {
    const map = {
      foundation: { label: 'تمهيدي (Foundation)', bg: '#fef3c7', col: '#92400e' },
      diploma: { label: 'دبلوم (Diploma)', bg: '#f3e8ff', col: '#6b21a8' },
      bachelor: { label: 'بكالوريوس (Bachelor)', bg: '#dbeafe', col: '#1e40af' },
      master: { label: 'ماجستير (Master)', bg: '#dcfce7', col: '#166534' },
      phd: { label: 'دكتوراه (PhD)', bg: '#ffedd5', col: '#9a3412' }
    };
    const key = (level || '').toLowerCase();
    const item = map[key] || { label: level || 'جامعي', bg: '#f1f5f9', col: '#475569' };
    return '<span class="cms-badge" style="background:' + item.bg + '; color:' + item.col + '; font-weight:700;">' + escapeHtml(item.label) + '</span>';
  }

  function getFieldBadge(field) {
    const map = {
      cs: 'حاسب وتقنية',
      business: 'إدارة وأعمال',
      engineering: 'هندسة وعمارة',
      health: 'طب وعلوم صحية',
      arts: 'آداب وتصميم',
      architecture: 'عمارة وبيئة',
      law: 'قانون وحقوق',
      education: 'تربية وتعليم',
      hospitality: 'سياحة وفنادق'
    };
    const key = (field || '').toLowerCase();
    const label = map[key] || field || 'عام';
    return '<span class="cms-badge" style="background:#f8fafc; border:1px solid #cbd5e1; color:#334155;">' + escapeHtml(label) + '</span>';
  }

  function formatFeeDisplay(num, curr = 'MYR') {
    if (!num || num === 0) return '---';
    return curr + ' ' + Number(num).toLocaleString('en-US');
  }

  function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return 'https://www.youtube.com/embed/' + match[2];
    }
    return url;
  }

  // Compress Image to lightweight Data URL (WebP/JPEG max 900px, quality 0.82; SVG as text DataURL)
  function compressImageToDataUrl(file, maxWidth = 900, quality = 0.82) {
    return new Promise((resolve) => {
      if (!file) return resolve(null);
      // SVG handling: read directly as DataURL without rasterization
      if (file.type === 'image/svg+xml' || (file.name && file.name.toLowerCase().endsWith('.svg'))) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            let dataUrl = canvas.toDataURL('image/webp', quality);
            if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
            resolve(dataUrl);
          } catch (err) {
            resolve(e.target.result);
          }
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  // Media Upload Helper with Live Server API & Client Fallback
  async function uploadCmsMedia(file, type = 'general') {
    if (!file) return null;

    // 1. Try Live Server API Upload
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await fetch(API_BASE + '/cms.php?action=upload_media', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        const path = json.data?.path || json.data?.url || json.data?.file_url || json.data?.file_path || json.path;
        if ((json.status === 'success' || json.success) && path) {
          showToast('تم رفع الصورة بنجاح على الخادم ✓', 'success');
          return path;
        }
      }
    } catch (err) {
      console.warn('[CMS Upload] Live API upload failed, falling back to client compression:', err);
    }

    // 2. Offline / Preview Mode / Network Fallback
    try {
      const dataUrl = await compressImageToDataUrl(file, 900, 0.82);
      if (dataUrl) {
        showToast('تم حفظ الصورة بنجاح محلياً للمعاينة والتسميع', 'success');
        return dataUrl;
      }
    } catch (e) {
      console.error('[CMS Upload] Fallback compression failed:', e);
    }

    showToast('فشل في معالجة ملف الصورة', 'danger');
    return null;
  }

  // -------------------------------------------------------------------------
  // 1. UNIVERSITIES CMS
  // -------------------------------------------------------------------------
  async function loadCmsUniversities(force = false) {
    if (state.universitiesLoaded && !force) {
      renderCmsUniversitiesTable();
      return;
    }

    let loadedList = [];
    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/cms.php?action=list_universities', { credentials: 'include' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data.universities) && json.data.universities.length > 0) {
          loadedList = json.data.universities;
        }
      } catch (e) {
        console.warn('[CMS] Failed to fetch universities from Live API, falling back to JSON:', e);
      }
    }

    if (loadedList.length === 0) {
      try {
        const localCached = localStorage.getItem('studyco_cms_universities');
        if (localCached && !force) {
          const rawLocal = JSON.parse(localCached);
          loadedList = Array.isArray(rawLocal) ? rawLocal : (rawLocal.universities || []);
        } else {
          const resJson = await fetch('data/universities.json');
          const raw = await resJson.json();
          loadedList = Array.isArray(raw) ? raw : (raw.universities || []);
        }
      } catch (err) {
        console.error('[CMS] Failed to load data/universities.json', err);
      }
    }

    state.universities = loadedList || [];
    state.universitiesLoaded = true;
    populateUniversityDropdowns();
    renderCmsUniversitiesTable();
  }

  function populateUniversityDropdowns() {
    const unis = state.universities || [];
    const sorted = [...unis].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    // Populate Program Tab Uni Select
    if (elProgSelectUni) {
      const curVal = elProgSelectUni.value;
      elProgSelectUni.innerHTML = '<option value="">-- اختر الجامعة لعرض وتعديل تخصصاتها --</option>';
      sorted.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = (u.arabicName || u.arabic_name || u.name) + ' (' + u.name + ') - ' + (u.country || '');
        elProgSelectUni.appendChild(opt);
      });
      if (curVal && sorted.some(u => u.id === curVal)) {
        elProgSelectUni.value = curVal;
      } else if (!state.selectedUniIdForPrograms && sorted.length > 0) {
        elProgSelectUni.value = sorted[0].id;
        state.selectedUniIdForPrograms = sorted[0].id;
      }
    }

    // Populate Online Uni Select
    if (elOnlineUniSelect) {
      const cur = elOnlineUniSelect.value;
      elOnlineUniSelect.innerHTML = '<option value="">-- اختر الجامعة المانحة للدرجة --</option>';
      sorted.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = (u.arabicName || u.name) + ' (' + u.name + ')';
        elOnlineUniSelect.appendChild(opt);
      });
      if (cur) elOnlineUniSelect.value = cur;
    }

    // Populate Scholarships Uni Select
    if (elSchUniSelect) {
      const cur = elSchUniSelect.value;
      elSchUniSelect.innerHTML = '<option value="">-- اختر الجامعة المقدمة للمنحة --</option>';
      sorted.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = (u.arabicName || u.name) + ' (' + u.name + ')';
        elSchUniSelect.appendChild(opt);
      });
      if (cur) elSchUniSelect.value = cur;
    }
  }

  function renderCmsUniversitiesTable() {
    if (!elUniversitiesTbody) return;
    elUniversitiesTbody.innerHTML = '';

    let list = state.universities || [];

    // Filter by Country
    if (state.filterUniCountry && state.filterUniCountry !== 'all') {
      const fCountry = state.filterUniCountry.toLowerCase();
      list = list.filter(u => (u.country || '').toLowerCase() === fCountry);
    }

    // Search Filter
    if (state.searchUniQuery) {
      const q = state.searchUniQuery.toLowerCase();
      list = list.filter(u => {
        return (u.id || '').toLowerCase().includes(q) ||
               (u.name || '').toLowerCase().includes(q) ||
               (u.arabicName || u.arabic_name || '').toLowerCase().includes(q) ||
               (u.city || '').toLowerCase().includes(q) ||
               String(u.ranking || '').toLowerCase().includes(q);
      });
    }

    // Stats Counter
    if (elUniCountLabel) {
      elUniCountLabel.textContent = 'عرض الجامعات والشراكات الأكاديمية (' + (state.universities ? state.universities.length : 0) + ' جامعة)';
    }
    if (elUniFilteredStats) {
      elUniFilteredStats.textContent = 'النتائج المطابقة: ' + list.length;
    }

    if (list.length === 0) {
      if (elUniversitiesEmpty) elUniversitiesEmpty.style.display = 'block';
      return;
    } else {
      if (elUniversitiesEmpty) elUniversitiesEmpty.style.display = 'none';
    }

    // Limit initial display to 60 items for performance, with lazy search
    const displayList = list.slice(0, 80);

    displayList.forEach(u => {
      const tr = document.createElement('tr');
      const logoSrc = u.logo || 'assets/photo/placeholder.svg';
      const uniNameAr = u.arabicName || u.arabic_name || '';
      const minFee = u.feeRangeMin || u.fee_range_min || (u.fee_range && u.fee_range.min) || 0;
      const maxFee = u.feeRangeMax || u.fee_range_max || (u.fee_range && u.fee_range.max) || 0;
      const curr = u.currency || 'MYR';

      tr.innerHTML = `
        <td style="width:60px; text-align:center;">
          <img class="cms-thumb" src="${escapeHtml(logoSrc)}" onerror="this.src='assets/photo/placeholder.svg'" alt="Logo" />
        </td>
        <td>
          <div style="font-weight:700; color:var(--portal-navy); font-size:0.92rem;">${escapeHtml(u.name || '')}</div>
          ${uniNameAr ? `<div style="font-size:0.82rem; color:#64748b; margin-top:2px;">${escapeHtml(uniNameAr)}</div>` : ''}
          <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
            <span class="cms-badge cms-badge-id">${escapeHtml(u.id)}</span>
            ${u.website ? `<a href="${escapeHtml(u.website)}" target="_blank" style="font-size:0.75rem; color:#0284c7; text-decoration:none; display:inline-flex; align-items:center; gap:3px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg><span>الموقع</span></a>` : ''}
          </div>
        </td>
        <td>
          <div>${getCountryBadge(u.country)}</div>
          <div style="font-size:0.8rem; color:#475569; margin-top:4px; display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span>${escapeHtml(u.city || '---')}</span></div>
        </td>
        <td>
          <span class="cms-badge cms-badge-ranking">#${escapeHtml(String(u.ranking || 'غير مصنف'))}</span>
        </td>
        <td style="font-size:0.85rem; font-weight:600; color:#0f172a;">
          ${minFee || maxFee ? `${curr} ${Number(minFee).toLocaleString()} - ${Number(maxFee).toLocaleString()}` : '<span style="color:#94a3b8;">غير محدد</span>'}
        </td>
        <td>
          <button class="btn-portal-secondary btn-cms-jump-programs" data-id="${escapeHtml(u.id)}" type="button" style="padding:0.35rem 0.75rem; font-size:0.8rem; white-space:nowrap; border-color:var(--portal-gold); color:var(--portal-navy); font-weight:700; display:inline-flex; align-items:center; gap:5px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            <span>برامج الجامعة</span>
          </button>
        </td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn-action-approve btn-cms-edit-uni" data-id="${escapeHtml(u.id)}" type="button" style="padding:0.35rem 0.7rem; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>تعديل</span>
            </button>
            <button class="btn-action-reject btn-cms-del-uni" data-id="${escapeHtml(u.id)}" type="button" style="padding:0.35rem 0.65rem; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>حذف</span>
            </button>
          </div>
        </td>
      `;

      elUniversitiesTbody.appendChild(tr);
    });

    // Attach Event Listeners to rendered action buttons
    elUniversitiesTbody.querySelectorAll('.btn-cms-jump-programs').forEach(btn => {
      btn.addEventListener('click', () => {
        const uniId = btn.getAttribute('data-id');
        jumpToUniversityPrograms(uniId);
      });
    });

    elUniversitiesTbody.querySelectorAll('.btn-cms-edit-uni').forEach(btn => {
      btn.addEventListener('click', () => {
        const uniId = btn.getAttribute('data-id');
        openCmsUniversityModal(uniId);
      });
    });

    elUniversitiesTbody.querySelectorAll('.btn-cms-del-uni').forEach(btn => {
      btn.addEventListener('click', () => {
        const uniId = btn.getAttribute('data-id');
        deleteCmsUniversity(uniId);
      });
    });
  }

  function jumpToUniversityPrograms(uniId) {
    switchTab('programs');
    switchProgramsSubtab('oncampus');
    state.selectedUniIdForPrograms = uniId;
    if (elProgSelectUni) elProgSelectUni.value = uniId;
    loadCmsUniversityPrograms(uniId);
  }

  // Automatic University ID (Slug) Generation tracking
  let uniIdManuallyEdited = false;

  // University Media Preview & Removal Helper (Logo & Campus Image)
  function updateUniMediaPreview(kind, path) {
    const cleanPath = (path || '').trim();
    if (kind === 'logo') {
      const inp = document.getElementById('cms-uni-logo');
      const box = document.getElementById('cms-uni-logo-preview') || document.getElementById('box-preview-uni-logo');
      const img = document.getElementById('cms-uni-logo-img') || document.getElementById('img-preview-uni-logo');
      const fileInp = document.getElementById('file-uni-logo');

      if (cleanPath) {
        if (inp && inp.value !== cleanPath) inp.value = cleanPath;
        if (img) img.src = cleanPath;
        if (box) {
          box.style.display = 'flex';
          box.style.alignItems = 'center';
          box.style.gap = '10px';
          box.style.marginTop = '8px';
          box.style.padding = '8px 12px';
          box.style.background = '#f0fdf4';
          box.style.border = '1px solid #bbf7d0';
          box.style.borderRadius = '8px';
        }
      } else {
        if (inp) inp.value = '';
        if (img) img.src = '';
        if (box) box.style.display = 'none';
        if (fileInp) fileInp.value = '';
      }
    } else if (kind === 'campus') {
      const inp = document.getElementById('cms-uni-image');
      const box = document.getElementById('cms-uni-image-preview') || document.getElementById('box-preview-uni-image');
      const img = document.getElementById('cms-uni-image-img') || document.getElementById('img-preview-uni-image');
      const fileInp = document.getElementById('file-uni-image');

      if (cleanPath) {
        if (inp && inp.value !== cleanPath) inp.value = cleanPath;
        if (img) img.src = cleanPath;
        if (box) {
          box.style.display = 'flex';
          box.style.alignItems = 'center';
          box.style.gap = '10px';
          box.style.marginTop = '8px';
          box.style.padding = '8px 12px';
          box.style.background = '#f0fdf4';
          box.style.border = '1px solid #bbf7d0';
          box.style.borderRadius = '8px';
        }
      } else {
        if (inp) inp.value = '';
        if (img) img.src = '';
        if (box) box.style.display = 'none';
        if (fileInp) fileInp.value = '';
      }
    }
  }

  // Open University Modal (Add or Edit)
  async function openCmsUniversityModal(uniId = null) {
    if (!elModalUniversity) return;
    const form = elFormUniversity;
    if (form) form.reset();

    const elId = document.getElementById('cms-uni-id');
    const elTitle = document.getElementById('modal-cms-uni-title');
    const videoWrap = document.getElementById('cms-uni-video-preview-wrap');
    const videoIframe = document.getElementById('cms-uni-video-iframe');

    if (videoWrap) videoWrap.style.display = 'none';
    if (videoIframe) videoIframe.src = '';
    updateUniMediaPreview('logo', '');
    updateUniMediaPreview('campus', '');

    if (uniId) {
      // Edit Mode
      uniIdManuallyEdited = true;
      if (elTitle) elTitle.textContent = 'تعديل بيانات الجامعة والشراكة';
      if (elId) {
        elId.value = uniId;
        elId.readOnly = true;
      }

      let uniData = (state.universities || []).find(u => u.id === uniId) || {};

      // If live API or details file available, fetch deep details
      if (state.isLiveApi) {
        try {
          const res = await fetch(API_BASE + '/cms.php?action=get_university&id=' + encodeURIComponent(uniId), { credentials: 'include' });
          const json = await res.json();
          if (json.success && json.data && json.data.university) {
            uniData = Object.assign({}, uniData, json.data.university);
          }
        } catch (e) {}
      } else {
        try {
          const resDet = await fetch('data/university-details/' + uniId + '.json');
          if (resDet.ok) {
            const det = await resDet.json();
            uniData = Object.assign({}, uniData, det);
          }
        } catch (e) {}
      }

      // Populate Form Fields
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val !== undefined && val !== null ? val : '';
      };

      setVal('cms-uni-name', uniData.name || '');
      setVal('cms-uni-arabicName', uniData.arabicName || uniData.arabic_name || '');
      setVal('cms-uni-country', (uniData.country || 'malaysia').toLowerCase());
      setVal('cms-uni-city', uniData.city || '');
      setVal('cms-uni-ranking', uniData.ranking || '');
      setVal('cms-uni-established', uniData.established || '');
      setVal('cms-uni-campusName', uniData.campusName || uniData.campus_name || '');
      setVal('cms-uni-studentCount', uniData.studentCount || uniData.student_count || '');
      setVal('cms-uni-intakes', Array.isArray(uniData.intakes) ? uniData.intakes.join(', ') : (uniData.intakes || ''));
      setVal('cms-uni-feeRangeMin', uniData.feeRangeMin || uniData.fee_range_min || (uniData.fee_range && uniData.fee_range.min) || '');
      setVal('cms-uni-feeRangeMax', uniData.feeRangeMax || uniData.fee_range_max || (uniData.fee_range && uniData.fee_range.max) || '');
      setVal('cms-uni-currency', uniData.currency || 'MYR');
      setVal('cms-uni-website', uniData.website || '');
      setVal('cms-uni-videoUrl', uniData.videoUrl || uniData.video_url || '');
      setVal('cms-uni-logo', uniData.logo || '');
      setVal('cms-uni-image', uniData.image || '');
      setVal('cms-uni-descriptionAr', uniData.descriptionAr || uniData.description_ar || (uniData.summary && uniData.summary.arabic) || '');
      setVal('cms-uni-description', uniData.description || (uniData.summary && uniData.summary.english) || '');

      // Update Media Previews
      updateUniMediaPreview('logo', uniData.logo || '');
      updateUniMediaPreview('campus', uniData.image || '');

      if ((uniData.videoUrl || uniData.video_url) && videoWrap && videoIframe) {
        videoIframe.src = getYouTubeEmbedUrl(uniData.videoUrl || uniData.video_url);
        videoWrap.style.display = 'block';
      }
    } else {
      // Add Mode
      uniIdManuallyEdited = false;
      if (elTitle) elTitle.textContent = 'إضافة صرح جامعي جديد';
      if (elId) {
        elId.value = '';
        elId.readOnly = false;
      }
      updateUniMediaPreview('logo', '');
      updateUniMediaPreview('campus', '');
    }

    elModalUniversity.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Alias for compatibility
  const openUniModal = openCmsUniversityModal;
  window.openUniModal = openCmsUniversityModal;

  // Handle University Form Submit (Save)
  if (elFormUniversity) {
    elFormUniversity.addEventListener('submit', async function(e) {
      e.preventDefault();
      const getVal = id => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };

      let id = getVal('cms-uni-id');
      const name = getVal('cms-uni-name');
      const country = getVal('cms-uni-country') || 'malaysia';

      // Auto-generate slug ID if empty
      if (!id) {
        if (name) {
          id = slugifyText(name);
        } else {
          const arName = getVal('cms-uni-arabicName');
          if (arName) id = slugifyText(arName);
        }
        if (!id) id = 'uni_' + Date.now();
        const elId = document.getElementById('cms-uni-id');
        if (elId) elId.value = id;
      }

      if (!name) {
        showToast('يرجى ملء اسم الجامعة الرسمي قبل الحفظ', 'warning');
        return;
      }

      const payload = {
        id: id,
        name: name,
        arabicName: getVal('cms-uni-arabicName'),
        country: country,
        city: getVal('cms-uni-city'),
        ranking: getVal('cms-uni-ranking'),
        established: getVal('cms-uni-established'),
        campusName: getVal('cms-uni-campusName'),
        studentCount: getVal('cms-uni-studentCount'),
        intakes: getVal('cms-uni-intakes'),
        feeRangeMin: parseFloat(getVal('cms-uni-feeRangeMin')) || 0,
        feeRangeMax: parseFloat(getVal('cms-uni-feeRangeMax')) || 0,
        currency: getVal('cms-uni-currency') || 'MYR',
        website: getVal('cms-uni-website'),
        videoUrl: getVal('cms-uni-videoUrl'),
        logo: getVal('cms-uni-logo'),
        image: getVal('cms-uni-image'),
        descriptionAr: getVal('cms-uni-descriptionAr'),
        description: getVal('cms-uni-description')
      };

      const btnSave = document.getElementById('btn-save-cms-university');
      if (btnSave) { btnSave.disabled = true; btnSave.textContent = 'جاري الحفظ والتسميع...'; }

      if (state.isLiveApi) {
        try {
          const res = await fetch(API_BASE + '/cms.php?action=save_university', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success) {
            showToast('تم حفظ الجامعة وبياناتها بنجاح!', 'success');
            recordLocalCmsOverride('universities', payload, false);
            // Sync locally so other tabs/pages immediately see the new university
            const list = state.universities || [];
            const idx = list.findIndex(u => u.id === payload.id);
            if (idx >= 0) list[idx] = Object.assign({}, list[idx], payload);
            else list.unshift(payload);
            state.universities = list;
            try { localStorage.setItem('studyco_cms_universities', JSON.stringify(list)); } catch(e){}
            closeModals();
            await loadCmsUniversities(true);
          } else {
            showToast(json.message || 'فشل في حفظ الجامعة', 'danger');
          }
        } catch (err) {
          showToast('تعذر الاتصال بالخادم لحفظ الجامعة', 'danger');
        } finally {
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:5px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ الجامعة وتحديث الموقع فوراً</span>';
          }
        }
      } else {
        // Offline preview update
        const list = state.universities || [];
        const idx = list.findIndex(u => u.id === payload.id);
        if (idx >= 0) list[idx] = Object.assign({}, list[idx], payload);
        else list.unshift(payload);
        state.universities = list;
        try { localStorage.setItem('studyco_cms_universities', JSON.stringify(list)); } catch(e){}
        recordLocalCmsOverride('universities', payload, false);
        showToast('تم حفظ الجامعة محلياً في وضع المعاينة', 'success');
        closeModals();
        populateUniversityDropdowns();
        renderCmsUniversitiesTable();
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:5px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ الجامعة وتحديث الموقع فوراً</span>';
        }
      }
    });
  }

  // Delete University
  async function deleteCmsUniversity(uniId) {
    if (!confirm('هل أنت متأكد تماماً من حذف هذه الجامعة (' + uniId + ') من المنصة وقاعدة البيانات؟')) return;

    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/cms.php?action=delete_university&id=' + encodeURIComponent(uniId), {
          method: 'POST',
          credentials: 'include'
        });
        const json = await res.json();
        if (json.success) {
          showToast('تم حذف الجامعة بنجاح', 'success');
          recordLocalCmsOverride('universities', uniId, true);
          await loadCmsUniversities(true);
        } else {
          showToast(json.message || 'فشل في حذف الجامعة', 'danger');
        }
      } catch (e) {
        showToast('تعذر الاتصال بالخادم لحذف الجامعة', 'danger');
      }
    } else {
      state.universities = (state.universities || []).filter(u => u.id !== uniId);
      try { localStorage.setItem('studyco_cms_universities', JSON.stringify(state.universities)); } catch(e){}
      recordLocalCmsOverride('universities', uniId, true);
      showToast('تم حذف الجامعة محلياً', 'success');
      populateUniversityDropdowns();
      renderCmsUniversitiesTable();
    }
  }

  // University Modal Media Upload Triggers, Live Previews & Deletions
  const btnTriggerUniLogo = document.getElementById('btn-trigger-upload-uni-logo');
  const fileUniLogo = document.getElementById('file-uni-logo');
  if (btnTriggerUniLogo && fileUniLogo) {
    btnTriggerUniLogo.addEventListener('click', () => fileUniLogo.click());
    fileUniLogo.addEventListener('change', async function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        btnTriggerUniLogo.disabled = true;
        const originalHtml = btnTriggerUniLogo.innerHTML;
        btnTriggerUniLogo.innerHTML = '<span>جاري الرفع... ⏳</span>';
        try {
          const uploadedUrl = await uploadCmsMedia(file, 'logo');
          if (uploadedUrl) {
            updateUniMediaPreview('logo', uploadedUrl);
          }
        } finally {
          btnTriggerUniLogo.disabled = false;
          btnTriggerUniLogo.innerHTML = originalHtml;
          this.value = '';
        }
      }
    });
  }

  const btnTriggerUniImg = document.getElementById('btn-trigger-upload-uni-image');
  const fileUniImg = document.getElementById('file-uni-image');
  if (btnTriggerUniImg && fileUniImg) {
    btnTriggerUniImg.addEventListener('click', () => fileUniImg.click());
    fileUniImg.addEventListener('change', async function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        btnTriggerUniImg.disabled = true;
        const originalHtml = btnTriggerUniImg.innerHTML;
        btnTriggerUniImg.innerHTML = '<span>جاري الرفع... ⏳</span>';
        try {
          const uploadedUrl = await uploadCmsMedia(file, 'campus');
          if (uploadedUrl) {
            updateUniMediaPreview('campus', uploadedUrl);
          }
        } finally {
          btnTriggerUniImg.disabled = false;
          btnTriggerUniImg.innerHTML = originalHtml;
          this.value = '';
        }
      }
    });
  }

  // Delete Buttons for Logo & Campus Image
  const btnDeleteUniLogo = document.getElementById('btn-delete-uni-logo');
  if (btnDeleteUniLogo) {
    btnDeleteUniLogo.addEventListener('click', function() {
      updateUniMediaPreview('logo', '');
      showToast('تم حذف شعار الجامعة', 'success');
    });
  }

  const btnDeleteUniImg = document.getElementById('btn-delete-uni-image');
  if (btnDeleteUniImg) {
    btnDeleteUniImg.addEventListener('click', function() {
      updateUniMediaPreview('campus', '');
      showToast('تم حذف صورة الغلاف', 'success');
    });
  }

  // Live URL Typing & Paste Listeners
  const inpCmsUniLogo = document.getElementById('cms-uni-logo');
  if (inpCmsUniLogo) {
    inpCmsUniLogo.addEventListener('input', function() {
      updateUniMediaPreview('logo', this.value.trim());
    });
    inpCmsUniLogo.addEventListener('change', function() {
      updateUniMediaPreview('logo', this.value.trim());
    });
  }

  const inpCmsUniImage = document.getElementById('cms-uni-image');
  if (inpCmsUniImage) {
    inpCmsUniImage.addEventListener('input', function() {
      updateUniMediaPreview('campus', this.value.trim());
    });
    inpCmsUniImage.addEventListener('change', function() {
      updateUniMediaPreview('campus', this.value.trim());
    });
  }

  // Automatic University Slug Generator on English Name Input
  const inpUniName = document.getElementById('cms-uni-name');
  const inpUniId = document.getElementById('cms-uni-id');
  if (inpUniName && inpUniId) {
    inpUniName.addEventListener('input', function() {
      if (!inpUniId.readOnly && !uniIdManuallyEdited) {
        inpUniId.value = slugifyText(this.value);
      }
    });
    inpUniId.addEventListener('input', function() {
      uniIdManuallyEdited = this.value.trim().length > 0;
    });
  }

  // Video URL Real-Time Preview
  const inpUniVideo = document.getElementById('cms-uni-videoUrl');
  if (inpUniVideo) {
    inpUniVideo.addEventListener('input', function() {
      const url = this.value.trim();
      const wrap = document.getElementById('cms-uni-video-preview-wrap');
      const iframe = document.getElementById('cms-uni-video-iframe');
      if (url && wrap && iframe) {
        iframe.src = getYouTubeEmbedUrl(url);
        wrap.style.display = 'block';
      } else if (wrap) {
        wrap.style.display = 'none';
      }
    });
  }

  // Add University Button
  if (elBtnAddUniversity) {
    elBtnAddUniversity.addEventListener('click', () => openCmsUniversityModal(null));
  }

  // University Search & Country Filters
  if (elSearchUniversities) {
    elSearchUniversities.addEventListener('input', function() {
      state.searchUniQuery = this.value.trim();
      renderCmsUniversitiesTable();
    });
  }
  if (elFilterUniCountry) {
    elFilterUniCountry.addEventListener('change', function() {
      state.filterUniCountry = this.value;
      renderCmsUniversitiesTable();
    });
  }

  // -------------------------------------------------------------------------
  // 2. PROGRAMS & ONLINE DEGREES CMS
  // -------------------------------------------------------------------------
  function switchProgramsSubtab(mode) {
    state.programsMode = mode;
    if (mode === 'oncampus') {
      if (elSubtabBtnOncampus) elSubtabBtnOncampus.classList.add('active');
      if (elSubtabBtnOnline) elSubtabBtnOnline.classList.remove('active');
      if (elSubpanelOncampus) elSubpanelOncampus.style.display = 'block';
      if (elSubpanelOnline) elSubpanelOnline.style.display = 'none';
    } else {
      if (elSubtabBtnOnline) elSubtabBtnOnline.classList.add('active');
      if (elSubtabBtnOncampus) elSubtabBtnOncampus.classList.remove('active');
      if (elSubpanelOnline) elSubpanelOnline.style.display = 'block';
      if (elSubpanelOncampus) elSubpanelOncampus.style.display = 'none';
      loadCmsOnlinePrograms();
    }
  }

  window.StudyCoAdminSwitchProgramsSubtab = switchProgramsSubtab;
  window.switchProgramsSubtab = switchProgramsSubtab;

  if (elSubtabBtnOncampus) elSubtabBtnOncampus.addEventListener('click', () => switchProgramsSubtab('oncampus'));
  if (elSubtabBtnOnline) elSubtabBtnOnline.addEventListener('click', () => switchProgramsSubtab('online'));

  async function initCmsProgramsTab() {
    if (!state.universitiesLoaded) {
      await loadCmsUniversities();
    }
    if (!state.selectedUniIdForPrograms && elProgSelectUni && elProgSelectUni.options.length > 1) {
      state.selectedUniIdForPrograms = elProgSelectUni.options[1].value;
      elProgSelectUni.value = state.selectedUniIdForPrograms;
    }
    if (state.selectedUniIdForPrograms) {
      loadCmsUniversityPrograms(state.selectedUniIdForPrograms);
    }
  }

  async function loadCmsUniversityPrograms(uniId) {
    if (!uniId) {
      state.uniPrograms = [];
      renderCmsProgramsTable();
      return;
    }

    let progs = [];
    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/cms.php?action=list_university_programs&university_id=' + encodeURIComponent(uniId), { credentials: 'include' });
        const json = await res.json();
        const progsList = json.data?.programs || json.data?.university?.programs;
        if (json.success && Array.isArray(progsList)) {
          progs = progsList;
        } else {
          const resUni = await fetch(API_BASE + '/cms.php?action=get_university&id=' + encodeURIComponent(uniId), { credentials: 'include' });
          const jsonUni = await resUni.json();
          const pList = jsonUni.data?.programs || jsonUni.data?.university?.programs;
          if (jsonUni.success && Array.isArray(pList)) {
            progs = pList;
          }
        }
      } catch (e) {
        console.warn('[CMS] Failed to fetch uni programs via API:', e);
      }
    }

    if (progs.length === 0) {
      try {
        const localCached = localStorage.getItem('studyco_uni_prog_' + uniId);
        if (localCached) {
          const rawLocal = JSON.parse(localCached);
          progs = Array.isArray(rawLocal) ? rawLocal : (rawLocal.programs || []);
        } else {
          const resDet = await fetch('data/university-details/' + uniId + '.json');
          if (resDet.ok) {
            const det = await resDet.json();
            progs = det.programs || [];
          }
        }
      } catch (e) {
        console.error('[CMS] Failed to load university programs from local JSON:', e);
      }
    }

    state.uniPrograms = progs;
    renderCmsProgramsTable();
  }

  function renderCmsProgramsTable() {
    if (!elProgramsTbody) return;
    elProgramsTbody.innerHTML = '';

    let list = state.uniPrograms || [];

    // Filter by Level
    if (state.filterProgLevel && state.filterProgLevel !== 'all') {
      const fLevel = state.filterProgLevel.toLowerCase();
      list = list.filter(p => (p.level || '').toLowerCase() === fLevel);
    }

    // Filter by Search Query
    if (state.searchProgQuery) {
      const q = state.searchProgQuery.toLowerCase();
      list = list.filter(p => {
        return (p.name || '').toLowerCase().includes(q) ||
               (p.nameAr || p.name_ar || '').toLowerCase().includes(q) ||
               (p.field || '').toLowerCase().includes(q) ||
               (p.id || '').toLowerCase().includes(q);
      });
    }

    if (elProgStats) {
      elProgStats.textContent = 'إجمالي البرامج: ' + list.length + ' برنامج';
    }

    if (list.length === 0) {
      if (elProgramsEmpty) elProgramsEmpty.style.display = 'block';
      return;
    } else {
      if (elProgramsEmpty) elProgramsEmpty.style.display = 'none';
    }

    list.forEach(p => {
      const tr = document.createElement('tr');
      const pNameAr = p.nameAr || p.name_ar || '';
      const fee = p.annualFee || p.annual_fee || (p.fee && p.fee.annual) || p.fee || 0;
      const curr = p.currency || 'MYR';

      tr.innerHTML = `
        <td>
          <div style="font-weight:700; color:var(--portal-navy); font-size:0.9rem;">${escapeHtml(p.name || '')}</div>
          ${pNameAr ? `<div style="font-size:0.8rem; color:#64748b; margin-top:2px;">${escapeHtml(pNameAr)}</div>` : ''}
          <div style="font-size:0.75rem; color:#94a3b8; font-family:monospace; margin-top:3px;">ID: ${escapeHtml(p.id || '---')}</div>
        </td>
        <td>${getLevelBadge(p.level)}</td>
        <td>${getFieldBadge(p.field)}</td>
        <td style="font-size:0.85rem; font-weight:600;">${escapeHtml(String(p.duration || '3'))} سنوات</td>
        <td style="font-weight:800; color:#0f172a; font-size:0.88rem;">${formatFeeDisplay(fee, curr)}</td>
        <td style="font-size:0.85rem; font-weight:600; color:#0284c7;">${escapeHtml(p.ielts || '5.5')}</td>
        <td style="font-size:0.8rem; color:#475569;">${escapeHtml(Array.isArray(p.intakes) ? p.intakes.join(', ') : (p.intakes || '---'))}</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-action-approve btn-cms-edit-prog" data-id="${escapeHtml(p.id)}" type="button" style="padding:0.35rem 0.65rem; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>تعديل</span>
            </button>
            <button class="btn-action-reject btn-cms-del-prog" data-id="${escapeHtml(p.id)}" type="button" style="padding:0.35rem 0.65rem; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>حذف</span>
            </button>
          </div>
        </td>
      `;

      elProgramsTbody.appendChild(tr);
    });

    elProgramsTbody.querySelectorAll('.btn-cms-edit-prog').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        openCmsProgramModal(pId);
      });
    });

    elProgramsTbody.querySelectorAll('.btn-cms-del-prog').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        deleteCmsProgram(pId);
      });
    });
  }

  // Program Select & Filter Events
  if (elProgSelectUni) {
    elProgSelectUni.addEventListener('change', function() {
      state.selectedUniIdForPrograms = this.value;
      loadCmsUniversityPrograms(this.value);
    });
  }
  if (elProgFilterCountry) {
    elProgFilterCountry.addEventListener('change', function() {
      const c = this.value.toLowerCase();
      if (elProgSelectUni) {
        const opts = elProgSelectUni.querySelectorAll('option');
        opts.forEach(opt => {
          if (!opt.value) return;
          const u = (state.universities || []).find(x => x.id === opt.value);
          if (c === 'all' || (u && (u.country || '').toLowerCase() === c)) {
            opt.style.display = '';
          } else {
            opt.style.display = 'none';
          }
        });
      }
    });
  }
  if (elProgFilterLevel) {
    elProgFilterLevel.addEventListener('change', function() {
      state.filterProgLevel = this.value;
      renderCmsProgramsTable();
    });
  }
  if (elProgSearch) {
    elProgSearch.addEventListener('input', function() {
      state.searchProgQuery = this.value.trim();
      renderCmsProgramsTable();
    });
  }

  // Open Program Modal
  function openCmsProgramModal(progId = null) {
    if (!elModalProgram) return;
    if (elFormProgram) elFormProgram.reset();

    const uniId = state.selectedUniIdForPrograms;
    if (!uniId) {
      showToast('يرجى اختيار الجامعة أولاً لإضافة أو تعديل برامجها', 'warning');
      return;
    }

    const uniObj = (state.universities || []).find(u => u.id === uniId) || {};
    const elUniId = document.getElementById('cms-prog-uniId');
    const elId = document.getElementById('cms-prog-id');
    const elTitle = document.getElementById('modal-cms-prog-title');
    const elSub = document.getElementById('modal-cms-prog-sub');

    if (elUniId) elUniId.value = uniId;
    if (elSub) elSub.textContent = 'الجامعة: ' + (uniObj.name || uniId);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : '';
    };

    if (progId) {
      if (elTitle) elTitle.textContent = 'تعديل البرنامج الأكاديمي والرسوم';
      if (elId) elId.value = progId;

      const p = (state.uniPrograms || []).find(x => x.id === progId) || {};
      setVal('cms-prog-name', p.name || '');
      setVal('cms-prog-nameAr', p.nameAr || p.name_ar || '');
      setVal('cms-prog-level', (p.level || 'bachelor').toLowerCase());
      setVal('cms-prog-field', (p.field || 'cs').toLowerCase());
      setVal('cms-prog-duration', p.duration || 3);
      setVal('cms-prog-annualFee', p.annualFee || p.annual_fee || (p.fee && p.fee.annual) || p.fee || '');
      setVal('cms-prog-currency', p.currency || uniObj.currency || 'MYR');
      setVal('cms-prog-ielts', p.ielts || '');
      setVal('cms-prog-intakes', Array.isArray(p.intakes) ? p.intakes.join(', ') : (p.intakes || ''));
      setVal('cms-prog-overviewAr', p.overviewAr || p.overview_ar || '');
      setVal('cms-prog-overview', p.overview || '');
    } else {
      if (elTitle) elTitle.textContent = 'إضافة تخصص جديد للجامعة';
      if (elId) elId.value = '';
      setVal('cms-prog-currency', uniObj.currency || 'MYR');
    }

    elModalProgram.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if (elBtnAddProgram) {
    elBtnAddProgram.addEventListener('click', () => openCmsProgramModal(null));
  }

  // Handle Program Save
  if (elFormProgram) {
    elFormProgram.addEventListener('submit', async function(e) {
      e.preventDefault();
      const getVal = id => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };

      const uniId = getVal('cms-prog-uniId') || state.selectedUniIdForPrograms;
      let pId = getVal('cms-prog-id');
      const name = getVal('cms-prog-name');

      if (!uniId || !name) {
        showToast('يرجى التأكد من اسم البرنامج والجامعة', 'warning');
        return;
      }

      if (!pId) {
        pId = uniId + '_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      }

      const payload = {
        id: pId,
        university_id: uniId,
        name: name,
        nameAr: getVal('cms-prog-nameAr') || name,
        level: getVal('cms-prog-level') || 'bachelor',
        field: getVal('cms-prog-field') || 'cs',
        duration: parseFloat(getVal('cms-prog-duration')) || 3,
        annualFee: parseFloat(getVal('cms-prog-annualFee')) || 0,
        currency: getVal('cms-prog-currency') || 'MYR',
        ielts: getVal('cms-prog-ielts') || '5.5',
        intakes: getVal('cms-prog-intakes'),
        studyMode: 'Full-time On Campus',
        overviewAr: getVal('cms-prog-overviewAr'),
        overview: getVal('cms-prog-overview')
      };

      const btnSave = document.getElementById('btn-save-cms-program');
      if (btnSave) { btnSave.disabled = true; btnSave.textContent = 'جاري الحفظ...'; }

      if (state.isLiveApi) {
        try {
          const res = await fetch(API_BASE + '/cms.php?action=save_program', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success) {
            showToast('تم حفظ البرنامج الأكاديمي وتحديث الموقع فوراً!', 'success');
            recordLocalCmsOverride('programs', payload, false);
            closeModals();
            await loadCmsUniversityPrograms(uniId);
          } else {
            showToast(json.message || 'فشل في حفظ البرنامج', 'danger');
          }
        } catch (err) {
          showToast('تعذر الاتصال بالخادم لحفظ البرنامج', 'danger');
        } finally {
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:5px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ البرنامج والرسوم</span>';
          }
        }
      } else {
        // Offline preview update
        const list = state.uniPrograms || [];
        const idx = list.findIndex(x => x.id === payload.id);
        if (idx >= 0) list[idx] = Object.assign({}, list[idx], payload);
        else list.unshift(payload);
        state.uniPrograms = list;
        try { localStorage.setItem('studyco_uni_prog_' + uniId, JSON.stringify(list)); } catch(e){}
        recordLocalCmsOverride('programs', payload, false);
        showToast('تم حفظ البرنامج محلياً', 'success');
        closeModals();
        renderCmsProgramsTable();
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:5px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ البرنامج والرسوم</span>';
        }
      }
    });
  }

  // Delete Program
  async function deleteCmsProgram(progId) {
    if (!confirm('هل أنت متأكد من حذف هذا البرنامج الأكاديمي؟')) return;
    const uniId = state.selectedUniIdForPrograms;

    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/cms.php?action=delete_program&id=' + encodeURIComponent(progId) + '&university_id=' + encodeURIComponent(uniId), {
          method: 'POST',
          credentials: 'include'
        });
        const json = await res.json();
        if (json.success) {
          showToast('تم حذف البرنامج الأكاديمي بنجاح', 'success');
          recordLocalCmsOverride('programs', progId, true);
          await loadCmsUniversityPrograms(uniId);
        } else {
          showToast(json.message || 'فشل في حذف البرنامج', 'danger');
        }
      } catch (e) {
        showToast('تعذر الاتصال بالخادم لحذف البرنامج', 'danger');
      }
    } else {
      state.uniPrograms = (state.uniPrograms || []).filter(x => x.id !== progId);
      try { localStorage.setItem('studyco_uni_prog_' + uniId, JSON.stringify(state.uniPrograms)); } catch(e){}
      recordLocalCmsOverride('programs', progId, true);
      showToast('تم حذف البرنامج محلياً', 'success');
      renderCmsProgramsTable();
    }
  }

  // -------------------------------------------------------------------------
  // Online Degrees CMS Logic
  // -------------------------------------------------------------------------
  async function loadCmsOnlinePrograms(force = false) {
    if (state.onlineProgramsLoaded && !force) {
      renderCmsOnlineProgramsTable();
      return;
    }

    let loaded = [];
    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/cms.php?action=list_online_programs', { credentials: 'include' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data.programs) && json.data.programs.length > 0) {
          loaded = json.data.programs;
        }
      } catch (e) {}
    }

    if (loaded.length === 0) {
      try {
        const localCached = localStorage.getItem('studyco_online_degrees');
        if (localCached && !force) {
          const rawLocal = JSON.parse(localCached);
          loaded = Array.isArray(rawLocal) ? rawLocal : (rawLocal.programs || rawLocal.onlinePrograms || []);
        } else {
          let res = await fetch('data/online-programs.json');
          if (!res.ok) res = await fetch('data/online-degrees.json');
          const raw = await res.json();
          loaded = Array.isArray(raw) ? raw : (raw.programs || raw.onlinePrograms || []);
        }
      } catch (e) {}
    }

    state.onlinePrograms = loaded || [];
    state.onlineProgramsLoaded = true;
    renderCmsOnlineProgramsTable();
  }

  function renderCmsOnlineProgramsTable() {
    if (!elOnlineProgramsTbody) return;
    elOnlineProgramsTbody.innerHTML = '';

    let list = state.onlinePrograms || [];

    if (state.filterOnlineLevel && state.filterOnlineLevel !== 'all') {
      const f = state.filterOnlineLevel.toLowerCase();
      list = list.filter(p => (p.level || '').toLowerCase().includes(f));
    }

    if (state.searchOnlineQuery) {
      const q = state.searchOnlineQuery.toLowerCase();
      list = list.filter(p => {
        return (p.name || '').toLowerCase().includes(q) ||
               (p.nameAr || p.name_ar || '').toLowerCase().includes(q) ||
               (p.university_name || p.universityName || p.university_id || '').toLowerCase().includes(q);
      });
    }

    if (list.length === 0) {
      if (elOnlineEmpty) elOnlineEmpty.style.display = 'block';
      return;
    } else {
      if (elOnlineEmpty) elOnlineEmpty.style.display = 'none';
    }

    const displayList = list.slice(0, 80);

    displayList.forEach(p => {
      const tr = document.createElement('tr');
      const imgSrc = p.image || 'assets/photo/programs/cs_general.webp';
      const pNameAr = p.nameAr || p.name_ar || '';
      const uniName = p.university_name || p.universityName || p.university_id || 'جامعة دولية';
      const fee = p.annualFee || p.annual_fee || 0;
      const curr = p.currency || 'MYR';

      tr.innerHTML = `
        <td style="width:60px; text-align:center;">
          <img class="cms-thumb" src="${escapeHtml(imgSrc)}" onerror="this.src='assets/photo/placeholder.svg'" alt="Degree" />
        </td>
        <td>
          <div style="font-weight:700; color:var(--portal-navy); font-size:0.9rem;">${escapeHtml(p.name || '')}</div>
          ${pNameAr ? `<div style="font-size:0.8rem; color:#64748b; margin-top:2px;">${escapeHtml(pNameAr)}</div>` : ''}
          <div style="font-size:0.75rem; color:#94a3b8; font-family:monospace; margin-top:3px;">ID: ${escapeHtml(p.id || '---')}</div>
        </td>
        <td style="font-weight:600; color:var(--portal-navy); font-size:0.85rem;">
          <span style="display:inline-flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2l10 8H2l10-8z"/></svg><span>${escapeHtml(uniName)}</span></span>
        </td>
        <td>
          <div>${getLevelBadge(p.level)}</div>
          <div style="margin-top:4px;">${getFieldBadge(p.field)}</div>
        </td>
        <td>
          <div style="font-weight:800; color:#0f172a; font-size:0.88rem;">${formatFeeDisplay(fee, curr)}</div>
          <div style="font-size:0.78rem; color:#64748b; margin-top:2px;">${escapeHtml(String(p.duration || '2'))} سنوات أونلاين</div>
        </td>
        <td style="font-size:0.8rem; color:#475569;">
          ${escapeHtml(Array.isArray(p.intakes) ? p.intakes.join(', ') : (p.intakes || 'مرن طوال العام'))}
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-action-approve btn-cms-edit-online" data-id="${escapeHtml(p.id)}" type="button" style="padding:0.35rem 0.65rem; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>تعديل</span>
            </button>
            <button class="btn-action-reject btn-cms-del-online" data-id="${escapeHtml(p.id)}" type="button" style="padding:0.35rem 0.65rem; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>حذف</span>
            </button>
          </div>
        </td>
      `;

      elOnlineProgramsTbody.appendChild(tr);
    });

    elOnlineProgramsTbody.querySelectorAll('.btn-cms-edit-online').forEach(btn => {
      btn.addEventListener('click', () => openCmsOnlineProgramModal(btn.getAttribute('data-id')));
    });

    elOnlineProgramsTbody.querySelectorAll('.btn-cms-del-online').forEach(btn => {
      btn.addEventListener('click', () => deleteCmsOnlineProgram(btn.getAttribute('data-id')));
    });
  }

  if (elOnlineSearch) {
    elOnlineSearch.addEventListener('input', function() {
      state.searchOnlineQuery = this.value.trim();
      renderCmsOnlineProgramsTable();
    });
  }
  if (elOnlineFilterLevel) {
    elOnlineFilterLevel.addEventListener('change', function() {
      state.filterOnlineLevel = this.value;
      renderCmsOnlineProgramsTable();
    });
  }

  function openCmsOnlineProgramModal(progId = null) {
    if (!elModalOnlineProgram) return;
    if (elFormOnlineProgram) elFormOnlineProgram.reset();

    const elId = document.getElementById('cms-online-id');
    const elTitle = document.getElementById('modal-cms-online-title');
    const boxImg = document.getElementById('box-preview-online-image');
    const imgPreview = document.getElementById('img-preview-online-image');

    if (boxImg) boxImg.style.display = 'none';

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : '';
    };

    if (progId) {
      if (elTitle) elTitle.textContent = 'تعديل برنامج درجة جامعية أونلاين';
      if (elId) elId.value = progId;

      const p = (state.onlinePrograms || []).find(x => x.id === progId) || {};
      setVal('cms-online-uni-select', p.university_id || p.universityId || '');
      setVal('cms-online-name', p.name || '');
      setVal('cms-online-nameAr', p.nameAr || p.name_ar || '');
      setVal('cms-online-level', (p.level || 'bachelor').toLowerCase());
      setVal('cms-online-field', (p.field || 'cs').toLowerCase());
      setVal('cms-online-duration', p.duration || 2);
      setVal('cms-online-annualFee', p.annualFee || p.annual_fee || '');
      setVal('cms-online-currency', p.currency || 'MYR');
      setVal('cms-online-ielts', p.ielts || '');
      setVal('cms-online-intakes', Array.isArray(p.intakes) ? p.intakes.join(', ') : (p.intakes || ''));
      setVal('cms-online-image', p.image || '');

      if (p.image && boxImg && imgPreview) {
        imgPreview.src = p.image;
        boxImg.style.display = 'flex';
      }
    } else {
      if (elTitle) elTitle.textContent = 'إضافة برنامج درجة جامعية أونلاين جديد';
      if (elId) elId.value = '';
    }

    elModalOnlineProgram.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if (elBtnAddOnlineProgram) {
    elBtnAddOnlineProgram.addEventListener('click', () => openCmsOnlineProgramModal(null));
  }

  // Upload Online Image
  const btnTriggerOnlineImg = document.getElementById('btn-trigger-upload-online-img');
  const fileOnlineImg = document.getElementById('file-online-image');
  if (btnTriggerOnlineImg && fileOnlineImg) {
    btnTriggerOnlineImg.addEventListener('click', () => fileOnlineImg.click());
    fileOnlineImg.addEventListener('change', async function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        btnTriggerOnlineImg.disabled = true;
        const uploadedUrl = await uploadCmsMedia(file, 'online');
        if (uploadedUrl) {
          const inp = document.getElementById('cms-online-image');
          if (inp) {
            inp.value = uploadedUrl;
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const box = document.getElementById('box-preview-online-image');
          const img = document.getElementById('img-preview-online-image');
          if (box && img) {
            img.src = uploadedUrl;
            box.style.display = 'flex';
          }
        }
        btnTriggerOnlineImg.disabled = false;
        this.value = '';
      }
    });
  }

  // Save Online Program
  if (elFormOnlineProgram) {
    elFormOnlineProgram.addEventListener('submit', async function(e) {
      e.preventDefault();
      const getVal = id => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };

      let pId = getVal('cms-online-id');
      const name = getVal('cms-online-name');
      const uniId = getVal('cms-online-uni-select');

      if (!name || !uniId) {
        showToast('يرجى اختيار الجامعة واسم البرنامج أونلاين', 'warning');
        return;
      }

      if (!pId) {
        pId = 'online_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      }

      const uniObj = (state.universities || []).find(u => u.id === uniId) || {};

      const payload = {
        id: pId,
        university_id: uniId,
        university_name: uniObj.name || uniId,
        name: name,
        nameAr: getVal('cms-online-nameAr') || name,
        level: getVal('cms-online-level') || 'bachelor',
        field: getVal('cms-online-field') || 'cs',
        duration: parseFloat(getVal('cms-online-duration')) || 2,
        annualFee: parseFloat(getVal('cms-online-annualFee')) || 0,
        currency: getVal('cms-online-currency') || 'MYR',
        ielts: getVal('cms-online-ielts') || '6.0',
        intakes: getVal('cms-online-intakes'),
        image: getVal('cms-online-image') || 'assets/photo/programs/health_general.webp'
      };

      const btnSave = document.getElementById('btn-save-cms-online-program');
      if (btnSave) { btnSave.disabled = true; btnSave.textContent = 'جاري الحفظ...'; }

      if (state.isLiveApi) {
        try {
          const res = await fetch(API_BASE + '/cms.php?action=save_online_program', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success) {
            showToast('تم حفظ برنامج الدرجة الجامعية أونلاين بنجاح!', 'success');
            recordLocalCmsOverride('online_degrees', payload, false);
            closeModals();
            await loadCmsOnlinePrograms(true);
          } else {
            showToast(json.message || 'فشل في حفظ البرنامج أونلاين', 'danger');
          }
        } catch (err) {
          showToast('تعذر الاتصال بالخادم لحفظ البرنامج أونلاين', 'danger');
        } finally {
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:5px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ برنامج الأونلاين</span>';
          }
        }
      } else {
        const list = state.onlinePrograms || [];
        const idx = list.findIndex(x => x.id === payload.id);
        if (idx >= 0) list[idx] = Object.assign({}, list[idx], payload);
        else list.unshift(payload);
        state.onlinePrograms = list;
        try { localStorage.setItem('studyco_online_degrees', JSON.stringify(list)); } catch(e){}
        recordLocalCmsOverride('online_degrees', payload, false);
        showToast('تم حفظ البرنامج أونلاين محلياً', 'success');
        closeModals();
        renderCmsOnlineProgramsTable();
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:5px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ برنامج الأونلاين</span>';
        }
      }
    });
  }

  // Delete Online Program
  async function deleteCmsOnlineProgram(pId) {
    if (!confirm('هل أنت متأكد من حذف هذا البرنامج أونلاين نهائياً؟')) return;

    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/cms.php?action=delete_online_program&id=' + encodeURIComponent(pId), {
          method: 'POST',
          credentials: 'include'
        });
        const json = await res.json();
        if (json.success) {
          showToast('تم حذف البرنامج أونلاين بنجاح', 'success');
          recordLocalCmsOverride('online_degrees', pId, true);
          await loadCmsOnlinePrograms(true);
        } else {
          showToast(json.message || 'فشل في حذف البرنامج أونلاين', 'danger');
        }
      } catch (e) {
        showToast('تعذر الاتصال بالخادم لحذف البرنامج أونلاين', 'danger');
      }
    } else {
      state.onlinePrograms = (state.onlinePrograms || []).filter(x => x.id !== pId);
      try { localStorage.setItem('studyco_online_degrees', JSON.stringify(state.onlinePrograms)); } catch(e){}
      recordLocalCmsOverride('online_degrees', pId, true);
      showToast('تم حذف البرنامج أونلاين محلياً', 'success');
      renderCmsOnlineProgramsTable();
    }
  }

  // -------------------------------------------------------------------------
  // 3. LANGUAGE CENTRES CMS
  // -------------------------------------------------------------------------
  async function loadCmsLanguageCenters(force = false) {
    if (state.languageCentersLoaded && !force) {
      renderCmsLanguageCentersTable();
      return;
    }

    let loaded = [];
    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/cms.php?action=list_language_centers', { credentials: 'include' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data.centers) && json.data.centers.length > 0) {
          loaded = json.data.centers;
        }
      } catch (e) {}
    }

    if (loaded.length === 0) {
      try {
        const localCached = localStorage.getItem('studyco_language_centers');
        if (localCached && !force) {
          const rawLocal = JSON.parse(localCached);
          loaded = Array.isArray(rawLocal) ? rawLocal : (rawLocal.centers || rawLocal.languageCenters || []);
        } else {
          const res = await fetch('data/language-centers.json');
          const raw = await res.json();
          loaded = Array.isArray(raw) ? raw : (raw.centers || raw.languageCenters || []);
        }
      } catch (e) {}
    }

    state.languageCenters = loaded || [];
    state.languageCentersLoaded = true;
    renderCmsLanguageCentersTable();
  }

  function renderCmsLanguageCentersTable() {
    if (!elLcTbody) return;
    elLcTbody.innerHTML = '';

    let list = state.languageCenters || [];

    if (state.searchLcQuery) {
      const q = state.searchLcQuery.toLowerCase();
      list = list.filter(lc => {
        return (lc.name || '').toLowerCase().includes(q) ||
               (lc.nameAr || lc.name_ar || '').toLowerCase().includes(q) ||
               (lc.city || lc.cityAr || lc.city_ar || '').toLowerCase().includes(q) ||
               (lc.country || '').toLowerCase().includes(q) ||
               (lc.id || '').toLowerCase().includes(q);
      });
    }

    if (elLcStats) {
      elLcStats.textContent = 'إجمالي المعاهد: ' + list.length;
    }

    if (list.length === 0) {
      if (elLcEmpty) elLcEmpty.style.display = 'block';
      return;
    } else {
      if (elLcEmpty) elLcEmpty.style.display = 'none';
    }

    list.forEach(lc => {
      const tr = document.createElement('tr');
      const imgSrc = lc.image || 'assets/photo/lc/lc_bright-language-center.webp';
      const nameAr = lc.nameAr || lc.name_ar || '';
      const cityAr = lc.cityAr || lc.city_ar || '';
      const minFee = lc.min_fee_myr || lc.minFeeMYR || 0;
      const maxFee = lc.max_fee_myr || lc.maxFeeMYR || 0;
      const pkgCount = Array.isArray(lc.packages) ? lc.packages.length : (lc.packages_count || 0);

      tr.innerHTML = `
        <td style="width:60px; text-align:center;">
          <img class="cms-thumb" src="${escapeHtml(imgSrc)}" onerror="this.src='assets/photo/placeholder.svg'" alt="LC" />
        </td>
        <td>
          <div style="font-weight:700; color:var(--portal-navy); font-size:0.92rem;">${escapeHtml(lc.name || '')}</div>
          ${nameAr ? `<div style="font-size:0.82rem; color:#64748b; margin-top:2px;">${escapeHtml(nameAr)}</div>` : ''}
          <div style="font-size:0.75rem; color:#94a3b8; font-family:monospace; margin-top:3px;">ID: ${escapeHtml(lc.id || '---')}</div>
        </td>
        <td>
          <div>${getCountryBadge(lc.country || 'malaysia')}</div>
          <div style="font-size:0.8rem; color:#475569; margin-top:4px; display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span>${escapeHtml(cityAr || lc.city || 'كوالالمبور')}</span></div>
        </td>
        <td style="font-weight:700; color:#0f172a; font-size:0.88rem;">
          ${minFee ? `MYR ${Number(minFee).toLocaleString()} - ${Number(maxFee).toLocaleString()}` : '---'}
        </td>
        <td>
          <span class="cms-badge" style="background:#e0f2fe; color:#0369a1; font-weight:700;">
            ${pkgCount} باقات دراسية
          </span>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-action-approve btn-cms-edit-lc" data-id="${escapeHtml(lc.id)}" type="button" style="padding:0.35rem 0.7rem; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>تعديل والباقات</span>
            </button>
            <button class="btn-action-reject btn-cms-del-lc" data-id="${escapeHtml(lc.id)}" type="button" style="padding:0.35rem 0.65rem; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>حذف</span>
            </button>
          </div>
        </td>
      `;

      elLcTbody.appendChild(tr);
    });

    elLcTbody.querySelectorAll('.btn-cms-edit-lc').forEach(btn => {
      btn.addEventListener('click', () => openCmsLanguageCenterModal(btn.getAttribute('data-id')));
    });

    elLcTbody.querySelectorAll('.btn-cms-del-lc').forEach(btn => {
      btn.addEventListener('click', () => deleteCmsLanguageCenter(btn.getAttribute('data-id')));
    });
  }

  if (elSearchLc) {
    elSearchLc.addEventListener('input', function() {
      state.searchLcQuery = this.value.trim();
      renderCmsLanguageCentersTable();
    });
  }

  // Interactive Monthly Packages Table Editor Helpers
  function renderLcPackagesRows(packagesList = []) {
    if (!elLcPackagesTbody) return;
    elLcPackagesTbody.innerHTML = '';

    const list = Array.isArray(packagesList) && packagesList.length > 0 ? packagesList : [
      { months: 1, duration: '1 Month', feeMYR: 2850, fee_myr: 2850, visa: 'Tourist' },
      { months: 3, duration: '3 Months', feeMYR: 7200, fee_myr: 7200, visa: 'Tourist' },
      { months: 6, duration: '6 Months', feeMYR: 13500, fee_myr: 13500, visa: 'Student Visa' }
    ];

    list.forEach(p => {
      appendLcPackageRow(p.months, p.duration, p.feeMYR ?? p.fee_myr ?? p.price ?? 0, p.visa || 'Tourist');
    });
  }

  function appendLcPackageRow(months = 1, duration = '1 Month', fee = 2800, visa = 'Tourist') {
    if (!elLcPackagesTbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input type="number" class="portal-form-input lc-pkg-months" value="${months}" min="1" max="24" style="width:70px;" />
      </td>
      <td>
        <input type="text" class="portal-form-input lc-pkg-dur" value="${escapeHtml(duration)}" placeholder="3 Months" />
      </td>
      <td>
        <input type="number" class="portal-form-input lc-pkg-fee" value="${fee}" step="50" style="width:110px;" />
      </td>
      <td>
        <input type="text" class="portal-form-input lc-pkg-visa" value="${escapeHtml(visa)}" placeholder="Student Visa" style="width:120px;" />
      </td>
      <td style="text-align:center;">
        <button type="button" class="btn-action-reject btn-remove-pkg-row" style="padding:4px 8px; font-size:0.75rem;">✕</button>
      </td>
    `;

    tr.querySelector('.btn-remove-pkg-row').addEventListener('click', () => tr.remove());
    elLcPackagesTbody.appendChild(tr);
  }

  if (elBtnAddPackageRow) {
    elBtnAddPackageRow.addEventListener('click', () => {
      appendLcPackageRow(3, '3 Months', 6500, 'Tourist / Student');
    });
  }

  // Open Language Center Modal
  function openCmsLanguageCenterModal(lcId = null) {
    if (!elModalLc) return;
    if (elFormLc) elFormLc.reset();

    const elId = document.getElementById('cms-lc-id');
    const elTitle = document.getElementById('modal-cms-lc-title');
    const boxImg = document.getElementById('box-preview-lc-image');
    const imgPreview = document.getElementById('img-preview-lc-image');

    if (boxImg) boxImg.style.display = 'none';

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : '';
    };

    if (lcId) {
      if (elTitle) elTitle.textContent = 'تعديل معهد اللغة وباقات الرسوم';
      if (elId) elId.value = lcId;

      const lc = (state.languageCenters || []).find(x => x.id === lcId) || {};
      setVal('cms-lc-name', lc.name || '');
      setVal('cms-lc-nameAr', lc.nameAr || lc.name_ar || '');
      setVal('cms-lc-country', (lc.country || 'malaysia').toLowerCase());
      setVal('cms-lc-city', lc.city || '');
      setVal('cms-lc-cityAr', lc.cityAr || lc.city_ar || '');
      setVal('cms-lc-minFeeMYR', lc.min_fee_myr || lc.minFeeMYR || '');
      setVal('cms-lc-maxFeeMYR', lc.max_fee_myr || lc.maxFeeMYR || '');
      setVal('cms-lc-image', lc.image || '');
      setVal('cms-lc-aboutAr', lc.aboutAr || lc.about_ar || '');
      setVal('cms-lc-about', lc.about || '');

      if (lc.image && boxImg && imgPreview) {
        imgPreview.src = lc.image;
        boxImg.style.display = 'flex';
      }

      renderLcPackagesRows(lc.packages || []);
    } else {
      if (elTitle) elTitle.textContent = 'إضافة معهد لغة جديد وباقاته';
      if (elId) elId.value = '';
      renderLcPackagesRows([]);
    }

    elModalLc.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if (elBtnAddLc) {
    elBtnAddLc.addEventListener('click', () => openCmsLanguageCenterModal(null));
  }

  // Upload LC Image
  const btnTriggerLcImg = document.getElementById('btn-trigger-upload-lc-img');
  const fileLcImg = document.getElementById('file-lc-image');
  if (btnTriggerLcImg && fileLcImg) {
    btnTriggerLcImg.addEventListener('click', () => fileLcImg.click());
    fileLcImg.addEventListener('change', async function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        btnTriggerLcImg.disabled = true;
        const uploadedUrl = await uploadCmsMedia(file, 'lc');
        if (uploadedUrl) {
          const inp = document.getElementById('cms-lc-image');
          if (inp) {
            inp.value = uploadedUrl;
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const box = document.getElementById('box-preview-lc-image');
          const img = document.getElementById('img-preview-lc-image');
          if (box && img) { img.src = uploadedUrl; box.style.display = 'flex'; }
        }
        btnTriggerLcImg.disabled = false;
        this.value = '';
      }
    });
  }

  // Save Language Center
  if (elFormLc) {
    elFormLc.addEventListener('submit', async function(e) {
      e.preventDefault();
      const getVal = id => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };

      let lcId = getVal('cms-lc-id');
      const name = getVal('cms-lc-name');

      if (!name) {
        showToast('يرجى إدخال اسم معهد اللغة', 'warning');
        return;
      }

      if (!lcId) {
        lcId = 'lc_' + Date.now().toString(36);
      }

      // Gather Dynamic Packages
      const packages = [];
      if (elLcPackagesTbody) {
        elLcPackagesTbody.querySelectorAll('tr').forEach(tr => {
          const m = parseInt(tr.querySelector('.lc-pkg-months')?.value) || 1;
          const d = tr.querySelector('.lc-pkg-dur')?.value.trim() || (m + ' Months');
          const f = parseFloat(tr.querySelector('.lc-pkg-fee')?.value) || 0;
          const v = tr.querySelector('.lc-pkg-visa')?.value.trim() || 'Tourist';
          packages.push({ months: m, duration: d, feeMYR: f, fee_myr: f, visa: v });
        });
      }

      // Auto compute min/max fee if not explicitly typed
      let minFee = parseFloat(getVal('cms-lc-minFeeMYR')) || 0;
      let maxFee = parseFloat(getVal('cms-lc-maxFeeMYR')) || 0;
      if (packages.length > 0) {
        const fees = packages.map(p => (p.feeMYR ?? p.fee_myr)).filter(f => f > 0);
        if (fees.length > 0) {
          if (!minFee) minFee = Math.min(...fees);
          if (!maxFee) maxFee = Math.max(...fees);
        }
      }

      const payload = {
        id: lcId,
        name: name,
        nameAr: getVal('cms-lc-nameAr') || name,
        country: getVal('cms-lc-country') || 'malaysia',
        city: getVal('cms-lc-city') || 'Kuala Lumpur',
        cityAr: getVal('cms-lc-cityAr') || 'كوالالمبور',
        minFeeMYR: minFee,
        maxFeeMYR: maxFee,
        image: getVal('cms-lc-image') || 'assets/photo/lc/lc_bright-language-center.webp',
        packages: packages,
        aboutAr: getVal('cms-lc-aboutAr'),
        about: getVal('cms-lc-about')
      };

      const btnSave = document.getElementById('btn-save-cms-lc');
      if (btnSave) { btnSave.disabled = true; btnSave.textContent = 'جاري الحفظ...'; }

      if (state.isLiveApi) {
        try {
          const res = await fetch(API_BASE + '/cms.php?action=save_language_center', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success) {
            showToast('تم حفظ معهد اللغة وباقاته بنجاح!', 'success');
            recordLocalCmsOverride('language_centers', payload, false);
            closeModals();
            await loadCmsLanguageCenters(true);
          } else {
            showToast(json.message || 'فشل في حفظ المعهد', 'danger');
          }
        } catch (err) {
          showToast('تعذر الاتصال بالخادم لحفظ المعهد', 'danger');
        } finally {
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:5px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ معهد اللغة والباقات</span>';
          }
        }
      } else {
        const list = state.languageCenters || [];
        const idx = list.findIndex(x => x.id === payload.id);
        if (idx >= 0) list[idx] = Object.assign({}, list[idx], payload);
        else list.unshift(payload);
        state.languageCenters = list;
        try { localStorage.setItem('studyco_language_centers', JSON.stringify(list)); } catch(e){}
        recordLocalCmsOverride('language_centers', payload, false);
        showToast('تم حفظ معهد اللغة محلياً', 'success');
        closeModals();
        renderCmsLanguageCentersTable();
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:5px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ معهد اللغة والباقات</span>';
        }
      }
    });
  }

  // Delete Language Center
  async function deleteCmsLanguageCenter(lcId) {
    if (!confirm('هل أنت متأكد من حذف معهد اللغة هذا نهائياً من المنصة؟')) return;

    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/cms.php?action=delete_language_center&id=' + encodeURIComponent(lcId), {
          method: 'POST',
          credentials: 'include'
        });
        const json = await res.json();
        if (json.success) {
          showToast('تم حذف معهد اللغة بنجاح', 'success');
          recordLocalCmsOverride('language_centers', lcId, true);
          await loadCmsLanguageCenters(true);
        } else {
          showToast(json.message || 'فشل في حذف معهد اللغة', 'danger');
        }
      } catch (e) {
        showToast('تعذر الاتصال بالخادم لحذف المعهد', 'danger');
      }
    } else {
      state.languageCenters = (state.languageCenters || []).filter(x => x.id !== lcId);
      try { localStorage.setItem('studyco_language_centers', JSON.stringify(state.languageCenters)); } catch(e){}
      recordLocalCmsOverride('language_centers', lcId, true);
      showToast('تم حذف معهد اللغة محلياً', 'success');
      renderCmsLanguageCentersTable();
    }
  }

  // -------------------------------------------------------------------------
  // 4. SCHOLARSHIPS & CURRENCY EXCHANGE RATES CMS
  // -------------------------------------------------------------------------
  async function loadCmsScholarships(force = false) {
    if (state.scholarshipsLoaded && !force) {
      renderCmsScholarshipsTable();
      return;
    }

    let loaded = [];
    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/cms.php?action=list_scholarships', { credentials: 'include' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data.scholarships) && json.data.scholarships.length > 0) {
          loaded = json.data.scholarships;
        }
      } catch (e) {}
    }

    if (loaded.length === 0) {
      try {
        const localCached = localStorage.getItem('studyco_scholarships');
        if (localCached && !force) {
          const rawLocal = JSON.parse(localCached);
          loaded = Array.isArray(rawLocal) ? rawLocal : (rawLocal.scholarships || []);
        } else {
          const res = await fetch('data/scholarships.json');
          const raw = await res.json();
          loaded = Array.isArray(raw) ? raw : (raw.scholarships || []);
        }
      } catch (e) {}
    }

    state.scholarships = loaded || [];
    state.scholarshipsLoaded = true;
    renderCmsScholarshipsTable();
  }

  function renderCmsScholarshipsTable() {
    if (!elScholarshipsTbody) return;
    elScholarshipsTbody.innerHTML = '';

    let list = state.scholarships || [];

    if (state.searchSchQuery) {
      const q = state.searchSchQuery.toLowerCase();
      list = list.filter(s => {
        return (s.name || '').toLowerCase().includes(q) ||
               (s.nameAr || s.name_ar || '').toLowerCase().includes(q) ||
               (s.university_id || s.universityId || s.university_name || '').toLowerCase().includes(q) ||
               (s.coverage || s.coverageAr || s.coverage_ar || '').toLowerCase().includes(q);
      });
    }

    if (elSchStats) {
      elSchStats.textContent = 'إجمالي المنح: ' + list.length;
    }

    if (list.length === 0) {
      if (elScholarshipsEmpty) elScholarshipsEmpty.style.display = 'block';
      return;
    } else {
      if (elScholarshipsEmpty) elScholarshipsEmpty.style.display = 'none';
    }

    list.forEach(s => {
      const tr = document.createElement('tr');
      const nameAr = s.nameAr || s.name_ar || '';
      const uniName = s.university_name || s.universityName || s.university_id || 'جامعة دولية';
      const covAr = s.coverageAr || s.coverage_ar || s.coverage || 'خصم دراسي';
      const isFull = (s.type || '').toLowerCase() === 'full' || covAr.includes('100%');

      tr.innerHTML = `
        <td>
          <div style="font-weight:700; color:var(--portal-navy); font-size:0.9rem;">${escapeHtml(s.name || '')}</div>
          ${nameAr ? `<div style="font-size:0.8rem; color:#64748b; margin-top:2px;">${escapeHtml(nameAr)}</div>` : ''}
          <div style="font-size:0.75rem; color:#94a3b8; font-family:monospace; margin-top:3px;">ID: ${escapeHtml(s.id || '---')}</div>
        </td>
        <td style="font-weight:600; color:var(--portal-navy); font-size:0.85rem;">
          <span style="display:inline-flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2l10 8H2l10-8z"/></svg><span>${escapeHtml(uniName)}</span></span>
        </td>
        <td>
          <div>${getCountryBadge(s.country || 'malaysia')}</div>
          <div style="margin-top:4px;">${getLevelBadge(s.level || 'bachelor')}</div>
        </td>
        <td>
          <span class="cms-badge" style="background:${isFull ? '#dcfce7' : '#fef3c7'}; color:${isFull ? '#166534' : '#92400e'}; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            <span>${isFull ? 'إعفاء كامل' : 'خصم جزئي'} (${escapeHtml(covAr)})</span>
          </span>
        </td>
        <td style="font-size:0.8rem; color:#475569;">
          ${escapeHtml(s.deadlineAr || s.deadline_ar || s.deadline || 'سنوياً')}
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-action-approve btn-cms-edit-sch" data-id="${escapeHtml(s.id)}" type="button" style="padding:0.35rem 0.65rem; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>تعديل</span>
            </button>
            <button class="btn-action-reject btn-cms-del-sch" data-id="${escapeHtml(s.id)}" type="button" style="padding:0.35rem 0.65rem; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>حذف</span>
            </button>
          </div>
        </td>
      `;

      elScholarshipsTbody.appendChild(tr);
    });

    elScholarshipsTbody.querySelectorAll('.btn-cms-edit-sch').forEach(btn => {
      btn.addEventListener('click', () => openCmsScholarshipModal(btn.getAttribute('data-id')));
    });

    elScholarshipsTbody.querySelectorAll('.btn-cms-del-sch').forEach(btn => {
      btn.addEventListener('click', () => deleteCmsScholarship(btn.getAttribute('data-id')));
    });
  }

  if (elSearchScholarships) {
    elSearchScholarships.addEventListener('input', function() {
      state.searchSchQuery = this.value.trim();
      renderCmsScholarshipsTable();
    });
  }

  function openCmsScholarshipModal(schId = null) {
    if (!elModalScholarship) return;
    if (elFormScholarship) elFormScholarship.reset();

    const elId = document.getElementById('cms-sch-id');
    const elTitle = document.getElementById('modal-cms-sch-title');

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : '';
    };

    if (schId) {
      if (elTitle) elTitle.textContent = 'تعديل المنحة الدراسية وشروطها';
      if (elId) elId.value = schId;

      const s = (state.scholarships || []).find(x => x.id === schId) || {};
      setVal('cms-sch-uni-select', s.university_id || s.universityId || '');
      setVal('cms-sch-name', s.name || '');
      setVal('cms-sch-nameAr', s.nameAr || s.name_ar || '');
      setVal('cms-sch-country', (s.country || 'malaysia').toLowerCase());
      setVal('cms-sch-level', (s.level || 'bachelor').toLowerCase());
      setVal('cms-sch-type', (s.type || 'full').toLowerCase());
      setVal('cms-sch-coverage', s.coverage || '');
      setVal('cms-sch-coverageAr', s.coverageAr || s.coverage_ar || '');
      setVal('cms-sch-deadline', s.deadline || '');
      setVal('cms-sch-deadlineAr', s.deadlineAr || s.deadline_ar || '');
      setVal('cms-sch-criteriaAr', s.criteriaAr || s.criteria_ar || '');
      setVal('cms-sch-criteria', s.criteria || '');
    } else {
      if (elTitle) elTitle.textContent = 'إضافة منحة دراسية جديدة';
      if (elId) elId.value = '';
    }

    elModalScholarship.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if (elBtnAddScholarship) {
    elBtnAddScholarship.addEventListener('click', () => openCmsScholarshipModal(null));
  }

  // Save Scholarship
  if (elFormScholarship) {
    elFormScholarship.addEventListener('submit', async function(e) {
      e.preventDefault();
      const getVal = id => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };

      let schId = getVal('cms-sch-id');
      const name = getVal('cms-sch-name');
      const uniId = getVal('cms-sch-uni-select');

      if (!name || !uniId) {
        showToast('يرجى اختيار الجامعة واسم المنحة', 'warning');
        return;
      }

      if (!schId) {
        schId = 'sch_' + Date.now().toString(36);
      }

      const uniObj = (state.universities || []).find(u => u.id === uniId) || {};

      const payload = {
        id: schId,
        university_id: uniId,
        university_name: uniObj.name || uniId,
        name: name,
        nameAr: getVal('cms-sch-nameAr') || name,
        country: getVal('cms-sch-country') || 'malaysia',
        level: getVal('cms-sch-level') || 'bachelor',
        type: getVal('cms-sch-type') || 'full',
        coverage: getVal('cms-sch-coverage'),
        coverageAr: getVal('cms-sch-coverageAr') || getVal('cms-sch-coverage'),
        deadline: getVal('cms-sch-deadline'),
        deadlineAr: getVal('cms-sch-deadlineAr') || getVal('cms-sch-deadline'),
        criteriaAr: getVal('cms-sch-criteriaAr'),
        criteria: getVal('cms-sch-criteria')
      };

      const btnSave = document.getElementById('btn-save-cms-scholarship');
      if (btnSave) { btnSave.disabled = true; btnSave.textContent = 'جاري الحفظ...'; }

      if (state.isLiveApi) {
        try {
          const res = await fetch(API_BASE + '/cms.php?action=save_scholarship', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success) {
            showToast('تم حفظ المنحة الدراسية بنجاح!', 'success');
            recordLocalCmsOverride('scholarships', payload, false);
            closeModals();
            await loadCmsScholarships(true);
          } else {
            showToast(json.message || 'فشل في حفظ المنحة', 'danger');
          }
        } catch (err) {
          showToast('تعذر الاتصال بالخادم لحفظ المنحة', 'danger');
        } finally {
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:5px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ المنحة الدراسية</span>';
          }
        }
      } else {
        const list = state.scholarships || [];
        const idx = list.findIndex(x => x.id === payload.id);
        if (idx >= 0) list[idx] = Object.assign({}, list[idx], payload);
        else list.unshift(payload);
        state.scholarships = list;
        try { localStorage.setItem('studyco_scholarships', JSON.stringify(list)); } catch(e){}
        recordLocalCmsOverride('scholarships', payload, false);
        showToast('تم حفظ المنحة محلياً', 'success');
        closeModals();
        renderCmsScholarshipsTable();
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:5px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ المنحة الدراسية</span>';
        }
      }
    });
  }

  // Delete Scholarship
  async function deleteCmsScholarship(schId) {
    if (!confirm('هل أنت متأكد من حذف هذه المنحة الدراسية نهائياً؟')) return;

    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/cms.php?action=delete_scholarship&id=' + encodeURIComponent(schId), {
          method: 'POST',
          credentials: 'include'
        });
        const json = await res.json();
        if (json.success) {
          showToast('تم حذف المنحة الدراسية بنجاح', 'success');
          recordLocalCmsOverride('scholarships', schId, true);
          await loadCmsScholarships(true);
        } else {
          showToast(json.message || 'فشل في حذف المنحة', 'danger');
        }
      } catch (e) {
        showToast('تعذر الاتصال بالخادم لحذف المنحة', 'danger');
      }
    } else {
      state.scholarships = (state.scholarships || []).filter(x => x.id !== schId);
      try { localStorage.setItem('studyco_scholarships', JSON.stringify(state.scholarships)); } catch(e){}
      recordLocalCmsOverride('scholarships', schId, true);
      showToast('تم حذف المنحة محلياً', 'success');
      renderCmsScholarshipsTable();
    }
  }

  // -------------------------------------------------------------------------
  // Live Currency Exchange Rates Card & Real-Time Sync
  // -------------------------------------------------------------------------
  async function loadCmsExchangeRates(force = false) {
    if (state.exchangeRatesLoaded && !force) {
      renderCmsExchangeRatesGrid();
      return;
    }

    let ratesObj = null;
    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/cms.php?action=get_exchange_rates', { credentials: 'include' });
        const json = await res.json();
        if (json.success && json.data) {
          ratesObj = json.data;
        }
      } catch (e) {}
    }

    if (!ratesObj) {
      try {
        const localCached = localStorage.getItem('studyco_exchange_rates');
        if (localCached && !force) {
          ratesObj = JSON.parse(localCached);
        } else {
          const res = await fetch('data/exchange-rates.json');
          ratesObj = await res.json();
        }
      } catch (e) {}
    }

    state.exchangeRates = ratesObj;
    state.exchangeRatesLoaded = true;
    renderCmsExchangeRatesGrid();
  }

  function renderCmsExchangeRatesGrid() {
    if (!elCurrencyRatesGrid || !state.exchangeRates) return;
    elCurrencyRatesGrid.innerHTML = '';

    const rawRates = state.exchangeRates.rates;
    const rates = {};

    if (Array.isArray(rawRates)) {
      rawRates.forEach(r => {
        if (r && r.code) {
          rates[r.code] = r.rateFromUSD !== undefined ? r.rateFromUSD : (r.rate !== undefined ? r.rate : 1.0);
        }
      });
    } else if (rawRates && typeof rawRates === 'object') {
      Object.assign(rates, rawRates);
    }

    // Default Fallback Standard Currencies
    const standardCurrs = ['USD', 'MYR', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'EGP', 'GBP', 'EUR', 'AUD', 'CAD', 'NZD', 'SGD', 'IDR'];
    standardCurrs.forEach(c => {
      if (rates[c] === undefined) {
        rates[c] = (c === 'USD' ? 1.0 : (c === 'MYR' ? 4.44 : (c === 'SAR' ? 3.75 : 1.0)));
      }
    });

    const lastUp = state.exchangeRates.lastUpdated || state.exchangeRates.last_updated || '---';

    if (elRatesLastUpdated) {
      elRatesLastUpdated.textContent = lastUp;
    }

    Object.keys(rates).forEach(curr => {
      const rateVal = rates[curr];
      const card = document.createElement('div');
      card.style.cssText = 'background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:0.6rem 0.75rem; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.03);';
      card.innerHTML = `
        <div style="font-weight:800; font-size:0.85rem; color:var(--portal-navy); margin-bottom:4px; display:flex; align-items:center; justify-content:center; gap:5px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="6" x2="12" y2="18"></line></svg>
          <span>${curr}</span>
        </div>
        <input type="number" step="0.0001" min="0" class="portal-form-input cms-rate-input" data-curr="${curr}" value="${rateVal}" style="text-align:center; font-weight:700; font-size:0.88rem; padding:4px 6px; width:100%; box-sizing:border-box;" />
      `;
      elCurrencyRatesGrid.appendChild(card);
    });
  }

  // Save Exchange Rates
  if (elBtnSaveRates) {
    elBtnSaveRates.addEventListener('click', async function() {
      if (!elCurrencyRatesGrid) return;
      const inputs = elCurrencyRatesGrid.querySelectorAll('.cms-rate-input');
      const newRates = {};
      inputs.forEach(inp => {
        const c = inp.getAttribute('data-curr');
        const v = parseFloat(inp.value) || 0;
        if (c) newRates[c] = v;
      });

      const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const payload = {
        baseCurrency: 'USD',
        rates: newRates,
        lastUpdated: nowTime,
        last_updated: nowTime
      };

      elBtnSaveRates.disabled = true;
      elBtnSaveRates.textContent = 'جاري التحديث الفوري...';

      if (state.isLiveApi) {
        try {
          const res = await fetch(API_BASE + '/cms.php?action=save_exchange_rates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success) {
            showToast('تم تحديث أسعار الصرف بالمنصة والتسميع الفوري في الموقع!', 'success');
            state.exchangeRates = json.data || payload;
            try { localStorage.setItem('studyco_exchange_rates', JSON.stringify(state.exchangeRates)); } catch(e){}
            if (elRatesLastUpdated) elRatesLastUpdated.textContent = nowTime;
          } else {
            showToast(json.message || 'فشل في تحديث أسعار الصرف', 'danger');
          }
        } catch (e) {
          showToast('تعذر الاتصال بالخادم لتحديث أسعار الصرف', 'danger');
        } finally {
          elBtnSaveRates.disabled = false;
          elBtnSaveRates.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:6px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ وتحديث أسعار الصرف في الموقع فوراً</span>';
        }
      } else {
        state.exchangeRates = payload;
        try { localStorage.setItem('studyco_exchange_rates', JSON.stringify(payload)); } catch(e){}
        if (elRatesLastUpdated) elRatesLastUpdated.textContent = nowTime;
        showToast('تم تحديث أسعار الصرف محلياً في وضع المعاينة', 'success');
        elBtnSaveRates.disabled = false;
        elBtnSaveRates.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle; margin-left:6px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>حفظ وتحديث أسعار الصرف في الموقع فوراً</span>';
      }
    });
  }

  // Language Change Listener
  window.addEventListener('languageChanged', () => {
    renderAll();
    if (state.selectedStudent && elModalStudent && elModalStudent.classList.contains('open')) {
      openAdminStudentModal(state.selectedStudent.id);
    }
  });

  // Initialize on Load
  document.addEventListener('DOMContentLoaded', detectEnvironment);
})();



    // Setup Standalone Admin Language Selector
  const adminLangSel = document.getElementById('admin-lang-select');
  if (adminLangSel) {
    const curLang = localStorage.getItem('studyco_lang') || 'ar';
    adminLangSel.value = curLang;

    adminLangSel.addEventListener('change', async function () {
      const chosen = this.value;
      localStorage.setItem('studyco_lang', chosen);
      if (window.StudyCo_i18n && typeof window.StudyCo_i18n.loadLanguage === 'function') {
        await window.StudyCo_i18n.loadLanguage(chosen);
      } else {
        location.reload();
      }
    });

    window.addEventListener('languageChanged', (e) => {
      const active = (e.detail && e.detail.lang) || localStorage.getItem('studyco_lang') || 'ar';
      adminLangSel.value = active;
    });

    window.addEventListener('studyco:i18n-ready', (e) => {
      const active = (e.detail && e.detail.lang) || localStorage.getItem('studyco_lang') || 'ar';
      adminLangSel.value = active;
    });
  }

  // Rock-Solid Password Visibility Toggle (Permanent, Never Disappears)
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-toggle-password');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    const eyeOpen = btn.querySelector('.eye-open');
    const eyeClosed = btn.querySelector('.eye-closed');
    if (eyeOpen && eyeClosed) {
      eyeOpen.style.display = isPass ? 'none' : 'block';
      eyeClosed.style.display = isPass ? 'block' : 'none';
    }
    const len = input.value.length;
    input.focus();
    if (typeof input.setSelectionRange === 'function') {
      input.setSelectionRange(len, len);
    }
  });
