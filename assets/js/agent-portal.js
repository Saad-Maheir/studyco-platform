const API_BASE = window.STUDYCO_API_BASE || 'api';
/**
 * StudyCo Education Services — B2B Partner Portal JavaScript
 * StudyCo Partner Platform — Unified MySQL API & Offline Client State Engine
 * Full RBAC, Document Uploader, Previews, Deletions, and 9-Language i18n
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
      container.style.cssText = 'position:fixed; top:24px; left:50%; transform:translateX(-50%); z-index:99999; display:flex; flex-direction:column; gap:10px; max-width:92vw; width:420px; pointer-events:none;';
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

  // State Management
  const state = {
    isLiveApi: false, // auto-detected
    currentAgent: null,
    students: [],
    stats: {
      total_students: 0,
      in_review: 0,
      accepted: 0,
      enrolled: 0
    },
    activeFilterStatus: 'all',
    searchQuery: '',
    selectedStudent: null
  };

  // Client State Storage for Offline / Static Preview Mode
  const MOCK_STORAGE_KEY = 'studyco_agent_demo_data_v1';
  // Cryptographic SHA-256 helper for client-side hash checks (zero plaintext passwords)
  async function sha256(str) {
    if (!str) return '';
    try {
      const buffer = new TextEncoder().encode(str);
      const hash = await crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return '';
    }
  }

  const DEFAULT_PARTNER_HASH = 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea';

  
  function getInitialDefaultData() {
    const demoAgent = {
      id: 1,
      agency_name: 'StudyCo Global Partners',
      contact_name: 'أحمد المنصور',
      username: 'partner_riyadh',
      company_bio: 'وكالة رائدة في الشرق الأوسط وإندونيسيا للاستشارات والقبولات الجامعية.',
      company_profile_file: 'company_profile_preview.pdf',
      company_profile_name: 'StudyCo_Agency_Profile.pdf',
      company_docs_file: 'company_license_preview.pdf',
      company_docs_name: 'Commercial_Registration_Certificate.pdf',
      email: 'partner@studyco.com',
      password_hash: DEFAULT_PARTNER_HASH,
      phone: '+6281252223732',
      whatsapp: '+6281252223732',
      country: 'Indonesia',
      city: 'Jakarta',
      status: 'active',
      created_at: '2026-10-01 10:00:00'
    };
    const pendingAgent = {
      id: 2,
      agency_name: 'Al-Nour Educational Services (Under Review)',
      contact_name: 'طارق الزهراني',
      email: 'tariq@alnour-edu.com',
      password_hash: DEFAULT_PARTNER_HASH,
      phone: '+966551234567',
      whatsapp: '+966551234567',
      country: 'Saudi Arabia',
      city: 'Jeddah',
      experience_years: '3-5 years',
      annual_students_est: '50-100',
      status: 'pending',
      created_at: '2026-11-01 14:00:00'
    };
    return {
      agents: [demoAgent, pendingAgent],
      agent: demoAgent,
      students: [
        {
          id: 101,
          reference_code: 'STU-202611-8841',
          agent_id: 1,
          agency_name: 'StudyCo Global Partners',
          full_name: 'Zaid Tariq Al-Hashemi',
          nationality: 'Iraq',
          passport_number: 'N8892100',
          email: 'zaid.tariq@gmail.com',
          phone: '+9647801234567',
          whatsapp: '+9647801234567',
          destination_country: 'Malaysia',
          target_university: 'جامعة مالايا (Universiti Malaya)',
          target_program: 'Bachelor of Computer Science (AI)',
          degree_level: 'Bachelor',
          intake_date: 'September 2026',
          status: 'conditional_offer',
          documents_count: 3,
          agent_notes: 'طالب متفوق حاصل على معدل 94% في الثانوية ويرغب في سكن جامعي.',
          admin_feedback: 'تم استلام القبول المشروط من جامعة ملايا (UM). بانتظار إرسال شهادة الآيلتس لدفع رسوم التأشيرة.',
          created_at: '2026-10-25 10:30:00'
        },
        {
          id: 102,
          reference_code: 'STU-202611-9214',
          agent_id: 1,
          agency_name: 'StudyCo Global Partners',
          full_name: 'Maryam Huda Al-Nuaimi',
          nationality: 'Jordan',
          passport_number: 'A5519283',
          email: 'maryam.nuaimi@yahoo.com',
          phone: '+962791234567',
          whatsapp: '+962791234567',
          destination_country: 'United Kingdom',
          target_university: 'University of Manchester',
          target_program: 'MSc International Business',
          degree_level: 'Master',
          intake_date: 'September 2026',
          status: 'under_review',
          documents_count: 2,
          agent_notes: 'خريجة الجامعة الأردنية بتقدير جيد جداً وتوصيات قوية.',
          admin_feedback: 'الملف قيد الفحص لدى مكتب القبول الدولي بجامعة مانشستر.',
          created_at: '2026-10-28 14:15:00'
        }
      ],
      documents: {
        101: [
          { id: 1, doc_type: 'passport', original_name: 'Passport_Zaid_AlHashemi.pdf', file_size: 1420000, uploaded_at: '2026-10-25 10:35' },
          { id: 2, doc_type: 'transcript', original_name: 'HighSchool_Transcript_Final.pdf', file_size: 2150000, uploaded_at: '2026-10-25 10:36' },
          { id: 3, doc_type: 'english_cert', original_name: 'IELTS_Official_Score_Report.pdf', file_size: 890000, uploaded_at: '2026-10-26 12:20' }
        ],
        102: [
          { id: 4, doc_type: 'passport', original_name: 'Passport_Maryam_Huda.pdf', file_size: 1200000, uploaded_at: '2026-10-28 14:20' },
          { id: 5, doc_type: 'transcript', original_name: 'Bachelor_Degree_Transcript.pdf', file_size: 3400000, uploaded_at: '2026-10-28 14:21' }
        ]
      },
      timeline: {
        101: [
          { id: 1, old_status: null, new_status: 'submitted', comment: 'تم استلام أوراق الطالب من الوكيل وتوليد الرقم المرجعي.', changed_by: 'agent', created_at: '2026-10-25 10:30' },
          { id: 2, old_status: 'submitted', new_status: 'under_review', comment: 'تم إرسال الملف للتدقيق في جامعة ملايا (UM).', changed_by: 'admin', created_at: '2026-10-26 14:00' },
          { id: 3, old_status: 'under_review', new_status: 'conditional_offer', comment: 'صدور القبول المشروط (Conditional Offer Letter).', changed_by: 'admin', created_at: '2026-10-29 11:45' }
        ],
        102: [
          { id: 4, old_status: null, new_status: 'submitted', comment: 'تم تقديم طلب الطالبة بنجاح.', changed_by: 'agent', created_at: '2026-10-28 14:15' },
          { id: 5, old_status: 'submitted', new_status: 'under_review', comment: 'الملف قيد المراجعة الرسمية بالجامعة.', changed_by: 'admin', created_at: '2026-10-29 09:30' }
        ]
      }
    };
  }

  function getLocalStore() {
    try {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.agents || !Array.isArray(parsed.agents) || parsed.agents.length === 0) {
          const init = getInitialDefaultData();
          parsed.agents = init.agents;
          saveLocalStore(parsed);
        }
        if (parsed.students && Array.isArray(parsed.students)) {
          let hasFix = false;
          parsed.students.forEach(s => {
            if (!s.agent_id) {
              s.agent_id = 1;
              s.agency_name = 'StudyCo Global Partners';
              hasFix = true;
            }
          });
          if (hasFix) saveLocalStore(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage unavailable');
    }
    const init = getInitialDefaultData();
    saveLocalStore(init);
    return init;
  }

  function saveLocalStore(data) {
    try {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  // Pipeline Status Definitions
  const PIPELINE_STAGES = [
    { key: 'submitted', labelKey: 'status_submitted', defaultAr: 'تم الإرسال', num: 1 },
    { key: 'under_review', labelKey: 'status_under_review', defaultAr: 'قيد التدقيق', num: 2 },
    { key: 'conditional_offer', labelKey: 'status_conditional_offer', defaultAr: 'قبول مشروط', num: 3 },
    { key: 'unconditional_offer', labelKey: 'status_unconditional_offer', defaultAr: 'قبول نهائي', num: 4 },
    { key: 'awaiting_payment', labelKey: 'status_awaiting_payment', defaultAr: 'سداد الرسوم', num: 5 },
    { key: 'visa_processing', labelKey: 'status_visa_processing', defaultAr: 'التأشيرة', num: 6 },
    { key: 'enrolled', labelKey: 'status_enrolled', defaultAr: 'مكتمل ومسجل', num: 7 }
  ];

  const STATUS_META = {
    submitted: { key: 'status_submitted', defaultAr: 'تم الإرسال', class: 'status-submitted' },
    under_review: { key: 'status_under_review', defaultAr: 'قيد التدقيق الأكاديمي', class: 'status-under_review' },
    conditional_offer: { key: 'status_conditional_offer', defaultAr: 'قبول مشروط', class: 'status-conditional_offer' },
    unconditional_offer: { key: 'status_unconditional_offer', defaultAr: 'قبول غير مشروط', class: 'status-unconditional_offer' },
    awaiting_payment: { key: 'status_awaiting_payment', defaultAr: 'بانتظار سداد الرسوم', class: 'status-awaiting_payment' },
    visa_processing: { key: 'status_visa_processing', defaultAr: 'معالجة تأشيرة الطالب', class: 'status-visa_processing' },
    enrolled: { key: 'status_enrolled', defaultAr: 'تم الالتحاق وبدء الدراسة', class: 'status-enrolled' },
    rejected: { key: 'status_rejected', defaultAr: 'مرفوض', class: 'status-rejected' }
  };

  const DOC_TYPE_LABELS = {
    passport: { key: 'doc_type_passport', defaultAr: 'جواز السفر' },
    transcript: { key: 'doc_type_transcript', defaultAr: 'كشف الدرجات' },
    high_school_cert: { key: 'doc_type_high_school_cert', defaultAr: 'شهادة الثانوية' },
    bachelor_cert: { key: 'doc_type_bachelor_cert', defaultAr: 'وثيقة البكالوريوس' },
    english_cert: { key: 'doc_type_english_cert', defaultAr: 'شهادة اللغة (IELTS/TOEFL)' },
    personal_photo: { key: 'doc_type_personal_photo', defaultAr: 'صورة شخصية' },
    recommendation_letter: { key: 'doc_type_recommendation', defaultAr: 'خطاب توصية' },
    other: { key: 'doc_type_other', defaultAr: 'مستند إضافي' }
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

  // Format Bytes Helper
  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // DOM Elements
  const elAuthSection = document.getElementById('portal-auth-section');
  const elDashboardSection = document.getElementById('portal-dashboard-section');
  const elLoginForm = document.getElementById('portal-login-form');
  const elRegisterForm = document.getElementById('portal-register-form');
  const elTabLogin = document.getElementById('tab-login');
  const elTabRegister = document.getElementById('tab-register');
  const elAuthAlert = document.getElementById('portal-auth-alert');

  // Dashboard Elements
  const elAgentName = document.getElementById('portal-agent-name');
  const elAgencyName = document.getElementById('portal-agency-name');
  const elStatTotal = document.getElementById('stat-total-students');
  const elStatReview = document.getElementById('stat-in-review');
  const elStatAccepted = document.getElementById('stat-accepted');
  const elStatEnrolled = document.getElementById('stat-enrolled');
  const elStudentsTableBody = document.getElementById('portal-students-tbody');
  const elSearchInput = document.getElementById('portal-search-students');
  const elFilterStatus = document.getElementById('portal-filter-status');
  const elBtnLogout = document.getElementById('btn-portal-logout');
  const elBtnOpenAddModal = document.getElementById('btn-open-add-student');
  const elEmptyState = document.getElementById('portal-empty-state');

  // Modals
  const elAddModal = document.getElementById('modal-add-student');
  const elAddForm = document.getElementById('form-add-student');
  const elBtnSubmitAddStudent = document.getElementById('btn-submit-add-student');
  const elDetailsModal = document.getElementById('modal-student-details');
  const elInlineUploadForm = document.getElementById('form-inline-upload-doc');

  // Environment Detection (Live PHP Backend vs Static Client Environment)
  async function detectEnvironment() {
    try {
      const res = await fetch(API_BASE + '/auth.php?action=me', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.status === 200 || res.status === 401) {
        state.isLiveApi = true;
        const json = await res.json();
        if (json.success && json.data) {
          state.currentAgent = json.data;
        }
      } else {
        state.isLiveApi = false;
      }
    } catch (e) {
      state.isLiveApi = false;
    }

    // Environment detected silently

    if (state.currentAgent) {
      showDashboard();
    } else {
      showAuth();
    }
  }

  // View Switchers
  function showAuth() {
    if (elAuthSection) elAuthSection.style.display = 'block';
    if (elDashboardSection) elDashboardSection.style.display = 'none';
  }

  
  // Helper: Read File as Data URL for offline preview
  function readFileAsDataUrl(file) {
    return new Promise((resolve) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  // Real-Time Background Synchronization Engine for Partner Agents
  let agentSyncInterval = null;
  function initAgentRealTimeSync() {
    if (agentSyncInterval) clearInterval(agentSyncInterval);

    agentSyncInterval = setInterval(async () => {
      if (document.hidden || !state.currentAgent) return;
      try {
        if (typeof loadStudents === 'function') {
          await loadStudents();
        }
        if (state.selectedStudent && document.getElementById('modal-student-details')?.classList.contains('open')) {
          if (typeof openStudentDetails === 'function') {
            await openStudentDetails(state.selectedStudent.id);
          }
        }
      } catch (e) {
        console.warn('[Agent LiveSync] Silent sync skipped:', e.message);
      }
    }, 12000);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && state.currentAgent) {
        if (typeof loadStudents === 'function') loadStudents();
        if (state.selectedStudent && document.getElementById('modal-student-details')?.classList.contains('open')) {
          if (typeof openStudentDetails === 'function') openStudentDetails(state.selectedStudent.id);
        }
      }
    });

    window.addEventListener('storage', (e) => {
      if (e.key === MOCK_STORAGE_KEY || e.key === 'studyco_sync_trigger' || e.key === 'studyco_agent_sync_trigger') {
        if (state.currentAgent) {
          if (typeof loadStudents === 'function') loadStudents();
          if (state.selectedStudent && document.getElementById('modal-student-details')?.classList.contains('open')) {
            if (typeof openStudentDetails === 'function') openStudentDetails(state.selectedStudent.id);
          }
        }
      }
    });
  }

  function showDashboard() {
    if (elAuthSection) elAuthSection.style.display = 'none';
    if (elDashboardSection) elDashboardSection.style.display = 'block';

    if (elAgentName && state.currentAgent) {
      elAgentName.textContent = state.currentAgent.contact_name;
    }
    if (elAgencyName && state.currentAgent) {
      elAgencyName.textContent = state.currentAgent.agency_name;
    }

    loadStudents();
    initAgentRealTimeSync();
  }

  // Load Students Data
  async function loadStudents() {
    if (state.isLiveApi) {
      try {
        let url = API_BASE + '/students.php?action=list';
        if (state.activeFilterStatus && state.activeFilterStatus !== 'all') {
          url += '&status=' + encodeURIComponent(state.activeFilterStatus);
        }
        if (state.searchQuery) {
          url += '&search=' + encodeURIComponent(state.searchQuery);
        }

        const res = await fetch(url, { credentials: 'include' });
        const json = await res.json();
        if (json.success) {
          state.students = json.data.students || [];
          state.stats = json.data.stats || {};
          renderDashboard();
        }
      } catch (e) {
        console.error('Failed to load students from API', e);
      }
    } else {
      // Client State Management (Agent Scoping & Shared Persistence)
      const store = getLocalStore();
      const currentAgentId = (state.currentAgent && state.currentAgent.id) ? state.currentAgent.id : 1;
      
      // Filter students assigned to this agent (or default unassigned student records)
      const allAgentStudents = (store.students || []).filter(s => !s.agent_id || String(s.agent_id) === String(currentAgentId));
      let list = [...allAgentStudents];

      if (state.activeFilterStatus && state.activeFilterStatus !== 'all') {
        list = list.filter(s => s.status === state.activeFilterStatus);
      }

      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        list = list.filter(s => 
          (s.full_name && s.full_name.toLowerCase().includes(q)) ||
          (s.passport_number && s.passport_number.toLowerCase().includes(q)) ||
          (s.reference_code && s.reference_code.toLowerCase().includes(q)) ||
          (s.target_university && s.target_university.toLowerCase().includes(q))
        );
      }

      state.students = list;
      
      state.stats = {
        total_students: allAgentStudents.length,
        in_review: allAgentStudents.filter(s => ['submitted', 'under_review'].includes(s.status)).length,
        accepted: allAgentStudents.filter(s => ['conditional_offer', 'unconditional_offer'].includes(s.status)).length,
        enrolled: allAgentStudents.filter(s => s.status === 'enrolled').length
      };

      renderDashboard();
    }
  }

  // Render Dashboard
  function renderDashboard() {
    if (elStatTotal) elStatTotal.textContent = state.stats.total_students || 0;
    if (elStatReview) elStatReview.textContent = state.stats.in_review || 0;
    if (elStatAccepted) elStatAccepted.textContent = state.stats.accepted || 0;
    if (elStatEnrolled) elStatEnrolled.textContent = state.stats.enrolled || 0;

    if (!elStudentsTableBody) return;
    elStudentsTableBody.innerHTML = '';

    if (state.students.length === 0) {
      if (elEmptyState) elEmptyState.style.display = 'block';
      return;
    } else {
      if (elEmptyState) elEmptyState.style.display = 'none';
    }

    state.students.forEach(student => {
      const statusMeta = STATUS_META[student.status] || { key: 'status_submitted', defaultAr: student.status, class: 'status-submitted' };
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
          <div style="font-weight:600; color:#0f172a;">${escapeHtml(student.target_university)}</div>
          <div style="font-size:0.78rem; color:#64748b;">${escapeHtml(student.degree_level)} - ${escapeHtml(student.target_program)}</div>
        </td>
        <td style="font-size:0.85rem; color:#475569; white-space:nowrap;">
          ${(student.created_at || '').substring(0, 10)}
        </td>
        <td>
          <span style="display:inline-flex; align-items:center; gap:4px; font-weight:700; font-size:0.8rem; background:#f1f5f9; padding:2px 8px; border-radius:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            ${student.documents_count || 0}
          </span>
        </td>
        <td>
          <span class="status-pill ${statusMeta.class}">
            ${statusLabel}
          </span>
        </td>
        <td>
          <button class="btn-portal-secondary btn-view-student" data-id="${student.id}" style="padding:0.4rem 0.75rem; font-size:0.8rem;">
            ${t('portal_btn_preview', 'عرض المسار والمستندات')}
          </button>
        </td>
      `;

      elStudentsTableBody.appendChild(tr);
    });

    document.querySelectorAll('.btn-view-student').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openStudentDetails(id);
      });
    });
  }

  // Open Student Details Modal with Documents & Pipeline
  async function openStudentDetails(studentId) {
    let student = null;
    let documents = [];
    let timeline = [];

    if (state.isLiveApi) {
      try {
        const res = await fetch(API_BASE + '/students.php?action=get&id=' + studentId, { credentials: 'include' });
        const json = await res.json();
        if (json.success) {
          student = json.data.student;
          documents = json.data.documents || [];
          timeline = json.data.timeline || [];
        }
      } catch (e) {
        console.error('Error fetching student', e);
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
    const elModalTitle = document.getElementById('details-student-name');
    const elModalRef = document.getElementById('details-student-ref');
    const elModalUni = document.getElementById('details-target-uni');
    const elModalProgram = document.getElementById('details-target-program');
    const elModalPassport = document.getElementById('details-passport');
    const elModalCountry = document.getElementById('details-country');
    const elModalFeedback = document.getElementById('details-admin-feedback');
    const elModalDocsList = document.getElementById('details-docs-list');
    const elModalTimeline = document.getElementById('details-timeline-list');
    const elPipelineSteps = document.getElementById('details-pipeline-steps');

    if (elModalTitle) elModalTitle.textContent = student.full_name;
    if (elModalRef) elModalRef.textContent = student.reference_code;
    if (elModalUni) elModalUni.textContent = student.target_university;
    if (elModalProgram) elModalProgram.textContent = student.degree_level + ' - ' + student.target_program;
    if (elModalPassport) elModalPassport.textContent = student.passport_number;
    if (elModalCountry) elModalCountry.textContent = student.destination_country;

    if (elModalFeedback) {
      if (student.admin_feedback) {
        elModalFeedback.innerHTML = `
          <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:10px; padding:1rem; color:#92400e; font-size:0.88rem; line-height:1.5;">
            <strong>توجيه وملاحظات إدارة StudyCo:</strong><br>
            ${escapeHtml(student.admin_feedback)}
          </div>
        `;
      } else {
        elModalFeedback.innerHTML = `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:0.85rem; color:#64748b; font-size:0.85rem;">
            لا توجد ملاحظات إدارية جديدة حتى الآن. الملف قيد المعالجة الطبيعية.
          </div>
        `;
      }
    }

    // Render Pipeline Tracker
    if (elPipelineSteps) {
      let currentStageIdx = PIPELINE_STAGES.findIndex(s => s.key === student.status);
      if (currentStageIdx === -1) currentStageIdx = 0;

      elPipelineSteps.innerHTML = PIPELINE_STAGES.map((stage, idx) => {
        let stepClass = '';
        if (idx < currentStageIdx) stepClass = 'completed';
        else if (idx === currentStageIdx) stepClass = 'active';

        const label = t(stage.labelKey, stage.defaultAr);

        return `
          <div class="pipeline-step ${stepClass}">
            <div class="pipeline-step-circle">
              ${idx < currentStageIdx ? '✓' : stage.num}
            </div>
            <div class="pipeline-step-lbl">${label}</div>
          </div>
        `;
      }).join('');
    }

    // Render Attached Documents with Preview, Download, and Delete
    renderAttachedDocuments(documents, student);

    // Render Audit Timeline History
    if (elModalTimeline) {
      if (timeline.length === 0) {
        elModalTimeline.innerHTML = `<div style="color:#94a3b8; font-size:0.85rem;">لا توجد سجلات تاريخية سابقة.</div>`;
      } else {
        elModalTimeline.innerHTML = timeline.map(item => `
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
    }

    // Open Modal Dialog
    if (elDetailsModal) elDetailsModal.classList.add('open');
  }

  function renderAttachedDocuments(documents, student) {
    const elModalDocsList = document.getElementById('details-docs-list');
    if (!elModalDocsList) return;

    if (!documents || documents.length === 0) {
      elModalDocsList.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#94a3b8; font-size:0.85rem;">لم يتم رفع مستندات حتى الآن لهذا الطالب.</div>`;
      return;
    }

    const canDelete = (student.status === 'submitted' || student.status === 'under_review');
    const previewLabel = t('portal_btn_preview', 'معاينة');
    const downloadLabel = t('portal_btn_download', 'تحميل');
    const deleteLabel = t('portal_btn_delete', 'حذف');

    elModalDocsList.innerHTML = documents.map(doc => {
      const typeLabel = getDocTypeLabel(doc.doc_type);
      const prevUrl = doc.preview_url || doc.file_path || '#';
      const downUrl = doc.download_url || doc.file_path || '#';

      return `
        <div class="portal-doc-item" id="doc-item-${doc.id}" style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:0.75rem 1rem; margin-bottom:0.6rem;">
          <div class="portal-doc-info" style="display:flex; align-items:center; gap:10px; overflow:hidden;">
            <div class="portal-doc-icon" style="background:#f1f5f9; padding:8px; border-radius:6px; color:var(--portal-navy); flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
            </div>
            <div style="overflow:hidden;">
              <div class="portal-doc-name" style="font-weight:700; font-size:0.85rem; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(doc.original_name)}">
                ${escapeHtml(doc.original_name)}
              </div>
              <div class="portal-doc-meta" style="font-size:0.75rem; color:#64748b;">
                <span style="background:#e0f2fe; color:#0369a1; padding:1px 6px; border-radius:4px; font-weight:600;">${typeLabel}</span>
                • ${formatBytes(doc.file_size)} • ${doc.uploaded_at || ''}
              </div>
            </div>
          </div>
          
          <div style="display:flex; align-items:center; gap:0.4rem; flex-shrink:0;">
            <a href="${prevUrl}" target="_blank" class="btn-portal-secondary" style="padding:0.35rem 0.65rem; font-size:0.78rem; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              ${previewLabel}
            </a>
            <a href="${downUrl}" download="${escapeHtml(doc.original_name)}" class="btn-portal-secondary" style="padding:0.35rem 0.65rem; font-size:0.78rem; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              ${downloadLabel}
            </a>
            ${canDelete ? `
              <button class="btn-portal-danger btn-delete-single-doc" data-doc-id="${doc.id}" style="padding:0.35rem 0.65rem; font-size:0.78rem; background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; border-radius:6px; cursor:pointer; font-weight:600;">
                ${deleteLabel}
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Attach Delete Action Listeners
    elModalDocsList.querySelectorAll('.btn-delete-single-doc').forEach(btn => {
      btn.addEventListener('click', async function () {
        const docId = this.getAttribute('data-doc-id');
        if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المستند؟')) return;

        this.disabled = true;
        this.textContent = '...';

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
              showToast('تم حذف المستند بنجاح', 'success');
              openStudentDetails(student.id);
              loadStudents();
            } else {
              showToast(json.message || 'فشل في حذف المستند', 'danger');
              this.disabled = false;
              this.textContent = deleteLabel;
            }
          } catch (e) {
            showToast('تعذر الاتصال بالخادم لحذف المستند', 'danger');
            this.disabled = false;
            this.textContent = deleteLabel;
          }
        } else {
          // Offline Record Removal
          const store = getLocalStore();
          if (store.documents && store.documents[student.id]) {
            store.documents[student.id] = store.documents[student.id].filter(d => String(d.id) !== String(docId));
            const foundStu = store.students.find(s => String(s.id) === String(student.id));
            if (foundStu) {
              foundStu.documents_count = Math.max(0, (foundStu.documents_count || 1) - 1);
            }
            saveLocalStore(store);
            showToast('تم حذف المستند بنجاح', 'success');
            openStudentDetails(student.id);
            loadStudents();
          }
        }
      });
    });
  }

  // Handle Inline Upload inside Student Details Modal
  if (elInlineUploadForm) {
    elInlineUploadForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!state.selectedStudent) return;

      const fileInput = document.getElementById('inline-doc-file');
      const typeSelect = document.getElementById('inline-doc-type');
      const submitBtn = document.getElementById('btn-inline-upload-doc');

      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showToast('يرجى اختيار ملف لرفعه أولاً', 'warning');
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
            showToast('تم رفع واعتماد المستند بنجاح!', 'success');
            fileInput.value = '';
            openStudentDetails(state.selectedStudent.id);
            loadStudents();
          } else {
            showToast(json.message || 'فشل في رفع المستند', 'danger');
          }
        } catch (err) {
          showToast('تعذر الاتصال بالخادم لرفع المستند', 'danger');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = t('btn_upload_document', 'رفع المستند');
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

        showToast('تم رفع واعتماد المستند بنجاح', 'success');
        fileInput.value = '';
        submitBtn.disabled = false;
        submitBtn.textContent = t('btn_upload_document', 'رفع المستند');
        openStudentDetails(state.selectedStudent.id);
        loadStudents();
      }
    });
  }

  // Handle Login Submission
  if (elLoginForm) {
    elLoginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();

      if (!email || !password) return;

      if (state.isLiveApi) {
        try {
          const res = await fetch(API_BASE + '/auth.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success) {
            state.currentAgent = json.data;
            showDashboard();
            showToast(json.message || 'تم تسجيل الدخول بنجاح!', 'success');
          } else {
            showAuthAlert(json.message || 'بيانات الدخول غير صحيحة', 'danger');
            showToast(json.message || 'بيانات الدخول غير صحيحة', 'danger');
          }
        } catch (err) {
          showAuthAlert('تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.', 'danger');
        }
      } else {
        // Offline Verification across registered agents
        const store = getLocalStore();
        const agents = store.agents || (store.agent ? [store.agent] : []);
        const loginLower = email.toLowerCase();
        const foundAgent = agents.find(a => 
          (a.email && a.email.toLowerCase() === loginLower) || 
          (a.username && a.username.toLowerCase() === loginLower)
        );

        const inputHash = await sha256(password);

        if (foundAgent) {
          // Verify Password against cryptographic hash
          const expectedHash = foundAgent.password_hash || (foundAgent.password ? await sha256(foundAgent.password) : DEFAULT_PARTNER_HASH);
          if (inputHash !== expectedHash && inputHash !== DEFAULT_PARTNER_HASH) {
            showAuthAlert('البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'danger');
            showToast('كلمة المرور غير صحيحة', 'danger');
            return;
          }

          // Check Agent Account Status
          if (foundAgent.status === 'pending') {
            showAuthAlert('طلب وكالتك قيد المراجعة والاعتماد من قبل إدارة StudyCo المركزية.', 'warning');
            showToast('طلب الوكالة قيد الاعتماد من الإدارة', 'warning');
            return;
          } else if (foundAgent.status === 'suspended') {
            showAuthAlert('تم إيقاف حساب وكالتك مؤقتاً من قبل الإدارة المركزية. يرجى التواصل مع إدارة StudyCo.', 'danger');
            showToast('حساب الوكالة موقوف مؤقتاً', 'danger');
            return;
          } else if (foundAgent.status === 'rejected') {
            showAuthAlert('عذراً، تم رفض طلب الشراكة المقدم من قبل الإدارة المركزية.', 'danger');
            showToast('طلب الشراكة مرفوض', 'danger');
            return;
          }

          // Active Agent Login Success
          state.currentAgent = foundAgent;
          showDashboard();
          showToast('مرحباً بك مجدداً (' + (foundAgent.agency_name || '') + ')!', 'success');
        } else if ((loginLower === 'partner@studyco.com' || loginLower === 'partner_riyadh') && inputHash === DEFAULT_PARTNER_HASH) {
          state.currentAgent = store.agent || (agents[0]);
          showDashboard();
          showToast('تم تسجيل الدخول بنجاح!', 'success');
        } else {
          showAuthAlert('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'danger');
          showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'danger');
        }
      }
    });
  }

  // Handle Partner Application (Registration with Company Docs & Bio)
  if (elRegisterForm) {
    elRegisterForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const agencyName   = document.getElementById('reg-agency-name').value.trim();
      const contactName  = document.getElementById('reg-contact-name').value.trim();
      const email        = document.getElementById('reg-email').value.trim();
      const whatsapp     = document.getElementById('reg-whatsapp').value.trim();
      const country      = document.getElementById('reg-country').value.trim();
      const city         = document.getElementById('reg-city').value.trim();
      const website      = document.getElementById('reg-website').value.trim();
      const companyBio   = document.getElementById('reg-company-bio').value.trim();
      const experience   = document.getElementById('reg-experience').value.trim();
      const elStudentsEst = document.getElementById('reg-students-est') || document.getElementById('reg-students-count');
      const studentsEst  = elStudentsEst ? elStudentsEst.value.trim() : '10_to_25';

      const profileFileInput = document.getElementById('reg-company-profile');
      const docsFileInput    = document.getElementById('reg-company-docs');

      const profileFile = profileFileInput && profileFileInput.files ? profileFileInput.files[0] : null;
      const docsFile    = docsFileInput && docsFileInput.files ? docsFileInput.files[0] : null;

      if (!agencyName || !contactName || !email || !whatsapp || !country || !companyBio) {
        showAuthAlert('يرجى استكمال جميع الحقول الإلزامية بما في ذلك نبذة عن الشركة.', 'warning');
        return;
      }

      if (state.isLiveApi) {
        try {
          const fd = new FormData();
          fd.append('agency_name', agencyName);
          fd.append('contact_name', contactName);
          fd.append('email', email);
          fd.append('whatsapp', whatsapp);
          fd.append('country', country);
          fd.append('city', city);
          fd.append('website', website);
          fd.append('company_bio', companyBio);
          fd.append('experience_years', experience);
          fd.append('annual_students_est', studentsEst);

          if (profileFile) fd.append('company_profile', profileFile);
          if (docsFile) fd.append('company_docs', docsFile);

          const res = await fetch(API_BASE + '/auth.php?action=register', {
            method: 'POST',
            body: fd,
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success) {
            showAuthAlert(json.message, 'success');
            showToast(json.message, 'success');
            elRegisterForm.reset();
            setTimeout(() => {
              if (elTabLogin) elTabLogin.click();
            }, 3500);
          } else {
            showAuthAlert(json.message || 'فشل في تقديم الطلب', 'danger');
            showToast(json.message || 'فشل في تقديم الطلب', 'danger');
          }
        } catch (err) {
          showAuthAlert('تعذر الاتصال بالخادم', 'danger');
        }
      } else {
        // Offline Registration Processing - Persist with status: 'pending' and file metadata
        const store = getLocalStore();
        if (!store.agents) store.agents = [];

        const exists = store.agents.some(a => a.email && a.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          showAuthAlert('هذا البريد الإلكتروني مسجل بالفعل كوكيل في النظام!', 'danger');
          showToast('البريد الإلكتروني مسجل بالفعل', 'danger');
          return;
        }

        const profileDataUrl = await readFileAsDataUrl(profileFile);
        const docsDataUrl    = await readFileAsDataUrl(docsFile);

        const newAgent = {
          id: Date.now(),
          agency_name: agencyName,
          contact_name: contactName,
          email: email,
          username: null,
          password_hash: null,
          phone: whatsapp,
          whatsapp: whatsapp,
          country: country,
          city: city,
          website: website,
          company_bio: companyBio,
          company_profile_file: profileFile ? profileFile.name : 'Company_Profile.pdf',
          company_profile_name: profileFile ? profileFile.name : 'Company_Profile.pdf',
          company_profile_url: profileDataUrl || '',
          company_docs_file: docsFile ? docsFile.name : 'Commercial_Registration.pdf',
          company_docs_name: docsFile ? docsFile.name : 'Commercial_Registration.pdf',
          company_docs_url: docsDataUrl || '',
          experience_years: experience,
          annual_students_est: studentsEst,
          status: 'pending',
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        store.agents.push(newAgent);
        saveLocalStore(store);
        try { localStorage.setItem('studyco_sync_trigger', Date.now()); } catch(e){}

        showAuthAlert('تم إرسال طلب الشراكة وأوراق الشركة بنجاح! سيقوم فريق إدارة StudyCo بمراجعة الطلب وإصدار اسم المستخدم وكلمة المرور الخاصة بكم وتزويدكم بها عبر واتساب فور الاعتماد.', 'success');
        showToast('تم إرسال طلب الشراكة بنجاح!', 'success');
        elRegisterForm.reset();
        setTimeout(() => {
          if (elTabLogin) elTabLogin.click();
        }, 3500);
      }
    });
  }

  // Handle Adding New Student Form with Multi-file Uploads
  if (elAddForm) {
    elAddForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const studentData = {
        full_name: document.getElementById('stu-fullname').value.trim(),
        gender: document.getElementById('stu-gender').value,
        birth_date: document.getElementById('stu-birthdate').value,
        nationality: document.getElementById('stu-nationality').value.trim(),
        passport_number: document.getElementById('stu-passport').value.trim(),
        email: document.getElementById('stu-email').value.trim(),
        phone: document.getElementById('stu-phone').value.trim(),
        destination_country: document.getElementById('stu-destination').value,
        target_university: document.getElementById('stu-university').value.trim(),
        target_program: document.getElementById('stu-program').value.trim(),
        degree_level: document.getElementById('stu-degree').value,
        intake_date: document.getElementById('stu-intake').value.trim(),
        agent_notes: document.getElementById('stu-notes').value.trim()
      };

      // Collect initial attached documents
      const filesToUpload = [];
      const fPassport = document.getElementById('stu-doc-passport');
      const fTranscript = document.getElementById('stu-doc-transcript');
      const fCert = document.getElementById('stu-doc-cert');
      const fOther = document.getElementById('stu-doc-other');
      const fOtherType = document.getElementById('stu-doc-other-type');

      if (fPassport && fPassport.files && fPassport.files[0]) {
        filesToUpload.push({ type: 'passport', file: fPassport.files[0] });
      }
      if (fTranscript && fTranscript.files && fTranscript.files[0]) {
        filesToUpload.push({ type: 'transcript', file: fTranscript.files[0] });
      }
      if (fCert && fCert.files && fCert.files[0]) {
        const certType = (studentData.degree_level === 'Master' || studentData.degree_level === 'PhD') ? 'bachelor_cert' : 'high_school_cert';
        filesToUpload.push({ type: certType, file: fCert.files[0] });
      }
      if (fOther && fOther.files && fOther.files[0]) {
        filesToUpload.push({ type: (fOtherType ? fOtherType.value : 'other'), file: fOther.files[0] });
      }

      if (elBtnSubmitAddStudent) {
        elBtnSubmitAddStudent.disabled = true;
        elBtnSubmitAddStudent.textContent = filesToUpload.length > 0 ? 'جاري فتح الملف ورفع المستندات...' : 'جاري فتح ملف الطالب...';
      }

      if (state.isLiveApi) {
        try {
          const res = await fetch(API_BASE + '/students.php?action=create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData),
            credentials: 'include'
          });
          const json = await res.json();
          if (json.success) {
            const newStudentId = json.data.student_id;
            const refCode = json.data.reference_code;

            // Upload files sequentially if any
            if (filesToUpload.length > 0) {
              for (const item of filesToUpload) {
                try {
                  const fd = new FormData();
                  fd.append('student_id', newStudentId);
                  fd.append('doc_type', item.type);
                  fd.append('document', item.file);
                  await fetch(API_BASE + '/upload.php', { method: 'POST', body: fd, credentials: 'include' });
                } catch (upErr) {
                  console.warn('Failed to upload file: ' + item.file.name, upErr);
                }
              }
            }

            closeModals();
            elAddForm.reset();
            loadStudents();
            showToast('تم تسجيل الطالب بنجاح! الرقم المرجعي: ' + refCode, 'success');
          } else {
            showToast(json.message || 'حدث خطأ أثناء حفظ ملف الطالب', 'danger');
          }
        } catch (err) {
          showToast('تعذر حفظ الطالب على الخادم', 'danger');
        } finally {
          if (elBtnSubmitAddStudent) {
            elBtnSubmitAddStudent.disabled = false;
            elBtnSubmitAddStudent.textContent = 'حفظ وفتح ملف الطالب';
          }
        }
      } else {
        // Offline Record Persistence
        const store = getLocalStore();
        const newId = Date.now();
        const randomRef = 'STU-' + new Date().getFullYear() + '11-' + Math.floor(1000 + Math.random() * 9000);
        
        const currentAgentId = (state.currentAgent && state.currentAgent.id) ? state.currentAgent.id : 1;
        const currentAgencyName = (state.currentAgent && state.currentAgent.agency_name) ? state.currentAgent.agency_name : 'StudyCo Global Partners';
        
        const newStudent = {
          id: newId,
          reference_code: randomRef,
          agent_id: currentAgentId,
          agency_name: currentAgencyName,
          ...studentData,
          status: 'submitted',
          documents_count: filesToUpload.length,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        store.students.unshift(newStudent);

        // Retain attached documents with secure Object URLs
        if (!store.documents) store.documents = {};
        store.documents[newId] = filesToUpload.map((item, idx) => {
          const blobUrl = URL.createObjectURL(item.file);
          return {
            id: Date.now() + idx,
            doc_type: item.type,
            original_name: item.file.name,
            file_size: item.file.size,
            uploaded_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
            file_path: blobUrl,
            download_url: blobUrl,
            preview_url: blobUrl
          };
        });

        // Initial timeline log
        if (!store.timeline) store.timeline = {};
        store.timeline[newId] = [
          {
            id: Date.now(),
            old_status: null,
            new_status: 'submitted',
            comment: 'تم رفع ملف الطالب ووثائقه الأولية عبر الوكيل',
            changed_by: 'agent',
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          }
        ];

        saveLocalStore(store);

        closeModals();
        elAddForm.reset();
        loadStudents();
        showToast('تم حفظ ملف الطالب والمستندات بنجاح! الرقم: ' + randomRef, 'success');

        if (elBtnSubmitAddStudent) {
          elBtnSubmitAddStudent.disabled = false;
          elBtnSubmitAddStudent.textContent = 'حفظ وفتح ملف الطالب';
        }
      }
    });
  }

  // Handle Logout
  if (elBtnLogout) {
    elBtnLogout.addEventListener('click', async function () {
      if (state.isLiveApi) {
        try {
          await fetch(API_BASE + '/auth.php?action=logout', { method: 'POST', credentials: 'include' });
        } catch (e) {}
      }
      state.currentAgent = null;
      showAuth();
      showToast('تم تسجيل الخروج بنجاح', 'info');
    });
  }

  // Filter & Search Event Listeners
  if (elSearchInput) {
    elSearchInput.addEventListener('input', function () {
      state.searchQuery = this.value.trim();
      loadStudents();
    });
  }

  if (elFilterStatus) {
    elFilterStatus.addEventListener('change', function () {
      state.activeFilterStatus = this.value;
      loadStudents();
    });
  }

  // Modal Open & Close Triggers
  if (elBtnOpenAddModal) {
    elBtnOpenAddModal.addEventListener('click', () => {
      if (elAddModal) elAddModal.classList.add('open');
    });
  }

  document.querySelectorAll('.portal-modal-close, .btn-modal-cancel').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  function closeModals() {
    document.querySelectorAll('.portal-modal-backdrop').forEach(modal => {
      modal.classList.remove('open');
    });
  }

  // Auth Tab Switching
  if (elTabLogin && elTabRegister) {
    elTabLogin.addEventListener('click', () => {
      elTabLogin.classList.add('active');
      elTabRegister.classList.remove('active');
      if (elLoginForm) elLoginForm.style.display = 'block';
      if (elRegisterForm) elRegisterForm.style.display = 'none';
      if (elAuthAlert) elAuthAlert.style.display = 'none';
    });

    elTabRegister.addEventListener('click', () => {
      elTabRegister.classList.add('active');
      elTabLogin.classList.remove('active');
      if (elLoginForm) elLoginForm.style.display = 'none';
      if (elRegisterForm) elRegisterForm.style.display = 'block';
      if (elAuthAlert) elAuthAlert.style.display = 'none';
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

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Listen for language changes to update dynamic strings
  window.addEventListener('languageChanged', () => {
    renderDashboard();
    if (state.selectedStudent) {
      openStudentDetails(state.selectedStudent.id);
    }
  });

  // Initialize on Load
  document.addEventListener('DOMContentLoaded', detectEnvironment);
})();


    // Setup Standalone Portal Language Selector
  const portalLangSel = document.getElementById('portal-lang-select');
  if (portalLangSel) {
    const curLang = localStorage.getItem('studyco_lang') || 'ar';
    portalLangSel.value = curLang;

    portalLangSel.addEventListener('change', async function () {
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
      portalLangSel.value = active;
    });

    window.addEventListener('studyco:i18n-ready', (e) => {
      const active = (e.detail && e.detail.lang) || localStorage.getItem('studyco_lang') || 'ar';
      portalLangSel.value = active;
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
