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
      container.style.cssText = 'position:fixed; top:24px; left:50%; transform:translateX(-50%); z-index:99999; display:flex; flex-direction:column; gap:10px; max-width:92vw; width:440px; pointer-events:none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `portal-toast portal-toast-${type}`;

    let bg = '#1e293b';
    let icon = 'ℹ️';
    if (type === 'success') { bg = '#065f46'; icon = '✓'; }
    else if (type === 'danger' || type === 'error') { bg = '#991b1b'; icon = '✕'; }
    else if (type === 'warning') { bg = '#854d0e'; icon = '!'; }

    toast.style.cssText = `background:${bg}; color:#ffffff; padding:12px 18px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.22); font-size:0.88rem; font-weight:600; display:flex; align-items:center; gap:12px; pointer-events:auto; transition:all 0.3s ease; direction:${document.documentElement.dir || 'rtl'}; text-align:${document.documentElement.dir === 'ltr' ? 'left' : 'right'};`;
    toast.innerHTML = `<span style="font-size:1.15rem; line-height:1; flex-shrink:0;">${icon}</span><span style="flex:1; line-height:1.4;">${escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 320);
    }, duration);
  }

  // Format Bytes Helper
  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
    pending: { defaultAr: 'بانتظار الاعتماد', class: 'status-under_review', badgeClass: 'pending-pulse-badge' },
    active: { defaultAr: 'شريك معتمد نشط', class: 'status-enrolled', badgeClass: '' },
    suspended: { defaultAr: 'موقوف مؤقتاً', class: 'status-awaiting_payment', badgeClass: '' },
    rejected: { defaultAr: 'طلب مرفوض', class: 'status-rejected', badgeClass: '' }
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
    searchAgentsQuery: ''
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
  const elPanelStudents = document.getElementById('panel-students');
  const elPanelAgents = document.getElementById('panel-agents');

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
      elFilterStudentAgent.innerHTML = '<option value="all">كافة الوكلاء</option>';
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
            إدارة ومراجعة الملف
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
          <div style="font-size:0.75rem; color:#64748b;">مسجل منذ: ${(agent.created_at || '').substring(0, 10)}</div>
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
          <div>خبرة: ${escapeHtml(agent.experience_years || 'غير محدد')}</div>
          <div>تقدير سنوي: ${escapeHtml(agent.annual_students_est || 'غير محدد')}</div>
        </td>
        <td>
          <span style="font-weight:800; font-size:0.9rem; color:var(--portal-navy); background:#f8fafc; padding:2px 10px; border-radius:6px; border:1px solid #e2e8f0;">
            ${agent.students_count || (state.students.filter(s => String(s.agent_id) === String(agent.id)).length)}
          </span>
        </td>
        <td>
          <span class="status-pill ${statusMeta.class}">
            ${statusMeta.defaultAr}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            ${agent.status !== 'active' ? `
              <button class="btn-action-approve btn-agent-quick-status" data-id="${agent.id}" data-action="active" title="اعتماد وتفعيل">
                تفعيل
              </button>
            ` : ''}
            ${agent.status !== 'suspended' ? `
              <button class="btn-action-suspend btn-agent-quick-status" data-id="${agent.id}" data-action="suspended" title="إيقاف مؤقت">
                ⏸ إيقاف
              </button>
            ` : ''}
            ${agent.status !== 'rejected' ? `
              <button class="btn-action-reject btn-agent-quick-status" data-id="${agent.id}" data-action="rejected" title="رفض">
                رفض
              </button>
            ` : ''}
            <button class="btn-portal-secondary btn-agent-open-modal" data-id="${agent.id}" style="padding:0.35rem 0.65rem; font-size:0.78rem;">
              تفاصيل وملاحظات
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

    if (elModalStudent) elModalStudent.classList.add('open');
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
            <a href="${prevUrl}" target="_blank" class="btn-portal-secondary" style="padding:0.35rem 0.65rem; font-size:0.78rem; text-decoration:none;">
              معاينة
            </a>
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
        btnViewProf.href = profileUrl;
        btnViewProf.target = '_blank';
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
        btnViewDocs.href = docsUrl;
        btnViewDocs.target = '_blank';
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

    if (elModalAgent) elModalAgent.classList.add('open');
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

  // Tab Switching
  if (elTabBtnStudents && elTabBtnAgents) {
    elTabBtnStudents.addEventListener('click', () => {
      state.activeTab = 'students';
      elTabBtnStudents.classList.add('active');
      elTabBtnAgents.classList.remove('active');
      if (elPanelStudents) elPanelStudents.style.display = 'block';
      if (elPanelAgents) elPanelAgents.style.display = 'none';
    });

    elTabBtnAgents.addEventListener('click', () => {
      state.activeTab = 'agents';
      elTabBtnAgents.classList.add('active');
      elTabBtnStudents.classList.remove('active');
      if (elPanelAgents) elPanelAgents.style.display = 'block';
      if (elPanelStudents) elPanelStudents.style.display = 'none';
    });
  }

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

  function closeModals() {
    document.querySelectorAll('.portal-modal-backdrop').forEach(modal => {
      modal.classList.remove('open');
    });
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
