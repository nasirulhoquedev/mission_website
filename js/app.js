// Main Application JavaScript for M R Public Mission
(function() {
  'use strict';

  // Global State
  const state = {
    lang: localStorage.getItem('mrpm_lang') || 'en',
    activePage: 'home',
    fontSize: localStorage.getItem('mrpm_fontsize') || 'normal',
    highContrast: localStorage.getItem('mrpm_contrast') === 'true',
    admissionStep: 1,
    galleryFilter: 'all',
    noticeFilter: 'all'
  };

  // DOM Loaded
  document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initAccessibility();
    initRouter();
    initTicker();
    initMobileDrawer();
    initAdmissionForm();
    initNoticeBoard();
    initCurriculumAndHolidays();
    initTeachers();
    initGallery();
    initSearch();
    initModals();
    initPortalsSimulator();
    initProspectusModal();
    initScrollToTop();
    renderAllDynamicSections();
  });

  // Language Engine
  function initLanguage() {
    applyLanguage(state.lang);
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        state.lang = state.lang === 'en' ? 'bn' : 'en';
        localStorage.setItem('mrpm_lang', state.lang);
        applyLanguage(state.lang);
        renderAllDynamicSections();
      });
    }
  }

  function applyLanguage(lang) {
    document.body.classList.toggle('lang-bn', lang === 'bn');
    const strings = window.TRANSLATIONS[lang];
    if (!strings) return;

    // Update text for all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (strings[key]) {
        el.textContent = strings[key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (strings[key]) {
        el.setAttribute('placeholder', strings[key]);
      }
    });

    // Update Language toggle button label
    const langLabel = document.getElementById('langLabel');
    if (langLabel) {
      langLabel.textContent = lang === 'en' ? 'বাংলা' : 'English';
    }
  }

  // Accessibility Controls
  function initAccessibility() {
    const a11ySmall = document.getElementById('a11ySmall');
    const a11yNormal = document.getElementById('a11yNormal');
    const a11yLarge = document.getElementById('a11yLarge');
    const a11yContrast = document.getElementById('a11yContrast');

    // Restore saved settings
    if (state.fontSize === 'large') document.body.classList.add('font-lg');
    if (state.fontSize === 'small') document.body.classList.add('font-sm');
    if (state.highContrast) document.body.classList.add('high-contrast');

    if (a11ySmall) {
      a11ySmall.addEventListener('click', () => {
        document.body.classList.remove('font-lg');
        document.body.classList.add('font-sm');
        localStorage.setItem('mrpm_fontsize', 'small');
      });
    }

    if (a11yNormal) {
      a11yNormal.addEventListener('click', () => {
        document.body.classList.remove('font-lg', 'font-sm');
        localStorage.setItem('mrpm_fontsize', 'normal');
      });
    }

    if (a11yLarge) {
      a11yLarge.addEventListener('click', () => {
        document.body.classList.remove('font-sm');
        document.body.classList.add('font-lg');
        localStorage.setItem('mrpm_fontsize', 'large');
      });
    }

    if (a11yContrast) {
      a11yContrast.addEventListener('click', () => {
        const isContrast = document.body.classList.toggle('high-contrast');
        localStorage.setItem('mrpm_contrast', isContrast);
      });
    }
  }

  // Router for SPA Multi-Page experience
  function initRouter() {
    function handleHash() {
      const hash = window.location.hash.replace('#', '') || 'home';
      showPage(hash);
    }

    window.addEventListener('hashchange', handleHash);
    handleHash();

    // Bind link clicks
    document.querySelectorAll('[data-nav-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-nav-target');
        window.location.hash = target;
        closeMobileDrawer();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function showPage(pageId) {
    const pages = document.querySelectorAll('.page-view');
    let targetPage = document.getElementById('page-' + pageId);
    if (!targetPage) {
      pageId = 'home';
      targetPage = document.getElementById('page-home');
    }

    state.activePage = pageId;

    pages.forEach(p => p.style.display = 'none');
    if (targetPage) {
      targetPage.style.display = 'block';
    }

    // Update active nav links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const target = link.getAttribute('data-nav-target');
      link.classList.toggle('active', target === pageId);
    });
  }

  // Marquee Ticker
  function initTicker() {
    const tickerContent = document.getElementById('tickerContent');
    if (!tickerContent || !window.SCHOOL_DATA) return;

    const notices = window.SCHOOL_DATA.notices;
    tickerContent.innerHTML = notices.map(n => {
      const title = state.lang === 'bn' ? n.titleBn : n.titleEn;
      return `<div class="ticker-item" data-notice-id="${n.id}">
        <span class="ticker-dot"></span>
        <span>${title}</span>
      </div>`;
    }).join('');

    // Click on ticker opens notice
    tickerContent.querySelectorAll('.ticker-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-notice-id');
        openNoticeModal(id);
      });
    });
  }

  // Mobile Drawer
  function initMobileDrawer() {
    const toggleBtn = document.getElementById('mobileToggleBtn');
    const closeBtn = document.getElementById('mobileDrawerClose');
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('drawerBackdrop');

    if (toggleBtn && drawer && backdrop) {
      toggleBtn.addEventListener('click', () => {
        drawer.classList.add('open');
        backdrop.classList.add('open');
      });

      const closeHandler = () => {
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
      };

      if (closeBtn) closeBtn.addEventListener('click', closeHandler);
      backdrop.addEventListener('click', closeHandler);
    }
  }

  function closeMobileDrawer() {
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }

  // Dynamic Content Renders
  function renderAllDynamicSections() {
    renderPrincipalCard();
    renderSmartFeatures();
    renderAchievements();
    renderHomeNoticesPreview();
    renderNoticeBoardPage();
    renderCurriculum();
    renderHolidaysTable();
    renderTeachers();
    renderDownloads();
    renderFeeTable();
    renderParentPortalData();
    renderTeacherPortalData();
    initTicker();
  }

  function renderPrincipalCard() {
    const nameEl = document.getElementById('principalName');
    const titleEl = document.getElementById('principalTitle');
    const qualEl = document.getElementById('principalQual');
    const msgEl = document.getElementById('principalMsgBody');
    if (!nameEl) return;

    if (state.lang === 'bn') {
      nameEl.textContent = 'মিঃ ফারুক আব্দুল্লাহ';
      if (titleEl) titleEl.textContent = 'প্রধান শিক্ষক ও অধ্যক্ষ, এম. আর. পাবলিক মিশন';
      if (qualEl) qualEl.textContent = 'এম.এ. (ইংরেজি), বি.এড | ৮ বছরের শিক্ষাদান ও প্রশাসনিক নেতৃত্ব';
      if (msgEl) msgEl.textContent = '"এম. আর. পাবলিক মিশনে আমরা বিশ্বাস করি যে প্রকৃত শিক্ষা শিশুর মাতৃভাষার সাংস্কৃতিক শিকড় এবং আধুনিক ইংরেজি ভাষার প্রাতিষ্ঠানিক দক্ষতার সুষম মেলবন্ধন ঘটায়। শ্রেণী ০ (নার্সারি) থেকে পঞ্চম শ্রেণী পর্যন্ত প্রতিটি শিশুকে আমরা আনন্দঘন পরিবেশে স্নেহ, সুশৃঙ্খল চরিত্র গঠন এবং ভবিষ্যৎমুখী মেধা বিকাশে যত্নসহকারে গড়ে তুলি।"';
    } else {
      nameEl.textContent = 'Mr. Faruk Abdullah';
      if (titleEl) titleEl.textContent = 'Principal & Headmaster, M.R. PUBLIC MISSION';
      if (qualEl) qualEl.textContent = 'M.A. (English), B.Ed | 8 Years of Academic Leadership';
      if (msgEl) msgEl.textContent = '"At M.R. PUBLIC MISSION, we believe that education must cultivate both rooted cultural identity and fluent modern skills. With Bengali as our medium of warmth and understanding, combined with strong English communication, character building, and scientific curiosity, our children from Class 0 (Nursery) to Class V develop confidence, moral discipline, and academic brilliance in a loving environment."';
    }
  }

  // Smart School Features Renderer
  function renderSmartFeatures() {
    const container = document.getElementById('smartFeaturesContainer');
    if (!container || !window.SCHOOL_DATA || !window.SCHOOL_DATA.smartFeatures) return;

    container.innerHTML = window.SCHOOL_DATA.smartFeatures.map(f => {
      const title = state.lang === 'bn' ? f.titleBn : f.titleEn;
      const desc = state.lang === 'bn' ? f.descBn : f.descEn;
      return `
        <div class="smart-feature-card">
          <div class="smart-feature-icon">${f.icon}</div>
          <h4>${title}</h4>
          <p>${desc}</p>
        </div>
      `;
    }).join('');
  }

  // Student Achievements Renderer
  function renderAchievements() {
    const container = document.getElementById('achievementsContainer');
    if (!container || !window.SCHOOL_DATA || !window.SCHOOL_DATA.achievements) return;

    container.innerHTML = window.SCHOOL_DATA.achievements.map(a => {
      const title = state.lang === 'bn' ? a.titleBn : a.titleEn;
      const student = state.lang === 'bn' ? a.studentBn : a.studentEn;
      const desc = state.lang === 'bn' ? a.descBn : a.descEn;
      return `
        <div class="achievement-card">
          <div class="achievement-header">
            <span class="achievement-badge">${a.category}</span>
            <span class="achievement-year">★ ${a.year}</span>
          </div>
          <h4>${title}</h4>
          <div class="achievement-student">
            <span>🏅</span>
            <span>${student}</span>
          </div>
          <p>${desc}</p>
        </div>
      `;
    }).join('');
  }

  // 1. Home Notices Preview
  function renderHomeNoticesPreview() {
    const container = document.getElementById('homeNoticesPreview');
    if (!container || !window.SCHOOL_DATA) return;

    const notices = window.SCHOOL_DATA.notices.slice(0, 4);
    container.innerHTML = notices.map(n => {
      const title = state.lang === 'bn' ? n.titleBn : n.titleEn;
      const typeLabel = (window.TRANSLATIONS[state.lang]['category' + n.category.charAt(0).toUpperCase() + n.category.slice(1)]) || n.category;
      return `
        <div class="notice-item-card" data-notice-id="${n.id}">
          <div class="notice-meta-left">
            <div class="notice-date-badge">${n.date}</div>
            <div>
              <span class="notice-type-tag ${n.category}">${typeLabel}</span>
              <div class="notice-title-text">${title}</div>
            </div>
          </div>
          <button class="notice-view-btn" type="button">
            <span>${state.lang === 'bn' ? 'বিস্তারিত' : 'View'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.notice-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-notice-id');
        openNoticeModal(id);
      });
    });
  }

  // 2. Notice Board Page
  function initNoticeBoard() {
    const filterChips = document.querySelectorAll('.filter-chip[data-filter]');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.noticeFilter = chip.getAttribute('data-filter');
        renderNoticeBoardPage();
      });
    });

    const searchInput = document.getElementById('noticeSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderNoticeBoardPage(e.target.value.toLowerCase());
      });
    }
  }

  function renderNoticeBoardPage(searchQuery = '') {
    const list = document.getElementById('noticesFullList');
    if (!list || !window.SCHOOL_DATA) return;

    let filtered = window.SCHOOL_DATA.notices;
    if (state.noticeFilter !== 'all') {
      filtered = filtered.filter(n => n.category === state.noticeFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(n => {
        const title = (state.lang === 'bn' ? n.titleBn : n.titleEn).toLowerCase();
        const desc = (state.lang === 'bn' ? n.contentBn : n.contentEn).toLowerCase();
        return title.includes(searchQuery) || desc.includes(searchQuery);
      });
    }

    if (filtered.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-muted);">
        <p>${state.lang === 'bn' ? 'কোন নোটিশ পাওয়া যায়নি।' : 'No notices match your criteria.'}</p>
      </div>`;
      return;
    }

    list.innerHTML = filtered.map(n => {
      const title = state.lang === 'bn' ? n.titleBn : n.titleEn;
      const desc = state.lang === 'bn' ? n.contentBn : n.contentEn;
      const typeLabel = (window.TRANSLATIONS[state.lang]['category' + n.category.charAt(0).toUpperCase() + n.category.slice(1)]) || n.category;

      return `
        <div class="notice-item-card" data-notice-id="${n.id}">
          <div class="notice-meta-left">
            <div class="notice-date-badge">${n.date}</div>
            <div>
              <span class="notice-type-tag ${n.category}">${typeLabel}</span>
              <div class="notice-title-text" style="font-size:1.05rem;">${title}</div>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">${desc.substring(0, 110)}...</p>
            </div>
          </div>
          <button class="notice-view-btn" type="button">
            <span>${state.lang === 'bn' ? 'সম্পূর্ণ নোটিশ' : 'Read Notice'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.notice-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-notice-id');
        openNoticeModal(id);
      });
    });
  }

  // 3. Notice Modal Popup
  window.openNoticeModal = function(noticeId) {
    const notice = window.SCHOOL_DATA.notices.find(n => n.id === noticeId);
    if (!notice) return;

    const modal = document.getElementById('noticeModal');
    const body = document.getElementById('noticeModalBody');
    if (!modal || !body) return;

    const title = state.lang === 'bn' ? notice.titleBn : notice.titleEn;
    const content = state.lang === 'bn' ? notice.contentBn : notice.contentEn;
    const schoolName = state.lang === 'bn' ? window.SCHOOL_DATA.info.nameBn : window.SCHOOL_DATA.info.name;
    const address = state.lang === 'bn' ? window.SCHOOL_DATA.info.addressBn : window.SCHOOL_DATA.info.address;

    body.innerHTML = `
      <div class="official-letterhead">
        <div class="official-header">
          <h3>${schoolName}</h3>
          <p>${address}</p>
          <p style="font-weight:700; color:var(--primary); margin-top:2px;">
            ${state.lang === 'bn' ? 'অফিসিয়াল নোটিশ ও বিজ্ঞপ্তি' : 'OFFICIAL NOTICE & CIRCULAR'}
          </p>
        </div>
        <div class="official-meta">
          <span><strong>Memo No:</strong> MRPM/${notice.id}</span>
          <span><strong>Date:</strong> ${notice.date}</span>
        </div>
        <h4 style="font-size:1.15rem; color:var(--primary-dark); margin-bottom:14px; text-decoration: underline;">
          ${title}
        </h4>
        <div style="font-size:0.95rem; line-height:1.75; color:var(--text-body); margin-bottom: 24px;">
          ${content}
        </div>
        <div class="official-seal">
          <div>
            <div class="seal-stamp">
              M R PUBLIC<br>MISSION<br>★ ESTD 2012 ★
            </div>
            <p style="font-weight:800; font-size:0.85rem; color:var(--primary-dark);">${state.lang === 'bn' ? 'মিঃ ফারুক আব্দুল্লাহ' : 'Mr. Faruk Abdullah'}</p>
            <p style="font-size:0.75rem; color:var(--text-muted);">${state.lang === 'bn' ? 'প্রধান শিক্ষক ও অধ্যক্ষ' : 'Headmaster & Principal'}</p>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
  };

  // 4. Curriculum
  function initCurriculumAndHolidays() {
    // Tab Pill Switcher (Curriculum vs Calendar vs Exams)
    document.querySelectorAll('.tab-pill-btn[data-tab-group="acad"]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-pill-btn[data-tab-group="acad"]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-tab-target');
        document.querySelectorAll('.acad-tab-content').forEach(c => c.style.display = 'none');
        const showEl = document.getElementById(target);
        if (showEl) showEl.style.display = 'block';
      });
    });
  }

  function renderCurriculum() {
    const container = document.getElementById('curriculumList');
    if (!container || !window.SCHOOL_DATA) return;

    container.innerHTML = window.SCHOOL_DATA.curriculum.map(c => {
      const level = state.lang === 'bn' ? c.levelBn : c.level;
      const age = state.lang === 'bn' ? c.ageBn : c.age;
      const focus = state.lang === 'bn' ? c.focusBn : c.focus;
      const desc = state.lang === 'bn' ? c.descriptionBn : c.descriptionEn;

      return `
        <div class="curriculum-card">
          <div class="curriculum-header">
            <div>
              <h3 style="font-size:1.35rem; color:var(--primary-dark); font-weight:800;">${level}</h3>
              <p style="font-size:0.88rem; color:var(--secondary-dark); font-weight:600;">${focus}</p>
            </div>
            <span class="curriculum-badge">${age}</span>
          </div>
          <p style="color:var(--text-body); font-size:0.95rem; margin-bottom:14px; line-height:1.65;">
            ${desc}
          </p>
          <div>
            <h5 style="font-size:0.85rem; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.05em; margin-bottom:8px;">
              ${state.lang === 'bn' ? 'মূল বিষয়সমূহ:' : 'Key Subjects & Focus Areas:'}
            </h5>
            <div class="curriculum-subjects-taglist">
              ${c.subjects.map(s => `<span class="subject-tag">✓ ${s}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 5. Holidays Table
  function renderHolidaysTable() {
    const tbody = document.getElementById('holidaysTableBody');
    if (!tbody || !window.SCHOOL_DATA) return;

    tbody.innerHTML = window.SCHOOL_DATA.holidays.map((h, i) => {
      const name = state.lang === 'bn' ? h.nameBn : h.nameEn;
      return `
        <tr>
          <td style="font-weight:700; color:var(--text-muted);">${i + 1}</td>
          <td style="font-weight:700; color:var(--primary-dark);">${name}</td>
          <td><span style="background:var(--primary-soft); padding:3px 8px; border-radius:4px; font-weight:600; font-size:0.85rem;">${h.date}</span></td>
          <td style="font-weight:600; color:var(--secondary-dark);">${h.days}</td>
        </tr>
      `;
    }).join('');
  }

  // 6. Teachers Page
  function renderTeachers() {
    const container = document.getElementById('teachersGrid');
    if (!container || !window.SCHOOL_DATA) return;

    container.innerHTML = window.SCHOOL_DATA.teachers.map(t => {
      const name = state.lang === 'bn' ? t.nameBn : t.name;
      const role = state.lang === 'bn' ? t.roleBn : t.role;
      const qual = state.lang === 'bn' ? t.qualificationBn : t.qualification;
      const exp = state.lang === 'bn' ? t.experienceBn : t.experience;

      let avatarMarkup = '';
      if (t.avatar) {
        avatarMarkup = `<img src="${t.avatar}" alt="${name}">`;
      } else {
        const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
        avatarMarkup = `<div class="teacher-avatar-placeholder">${initials}</div>`;
      }

      return `
        <div class="teacher-card">
          <div class="teacher-avatar-holder">
            ${avatarMarkup}
          </div>
          <div class="teacher-card-content">
            <h4 class="teacher-name">${name}</h4>
            <span class="teacher-role-tag">${role}</span>
            <p class="teacher-qual"><strong>${state.lang === 'bn' ? 'যোগ্যতা:' : 'Qualification:'}</strong> ${qual}</p>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px;">
              <strong>${state.lang === 'bn' ? 'বিশেষত্ব:' : 'Focus:'}</strong> ${t.specialty}
            </p>
            <div class="teacher-exp">💼 ${exp}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 7. Downloads Center
  function renderDownloads() {
    const container = document.getElementById('downloadsGrid');
    if (!container || !window.SCHOOL_DATA) return;

    container.innerHTML = window.SCHOOL_DATA.downloads.map(d => {
      const title = state.lang === 'bn' ? d.titleBn : d.titleEn;
      return `
        <div class="download-card">
          <div>
            <span class="download-badge">${d.format} • ${d.size}</span>
            <h4 style="font-size:1.05rem; font-weight:700; color:var(--primary-dark);">${title}</h4>
          </div>
          <button class="download-action-btn" type="button" onclick="triggerMockDownload('${d.id}', '${title}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            <span>${state.lang === 'bn' ? 'ডাউনলোড করুন' : 'Download Now'}</span>
          </button>
        </div>
      `;
    }).join('');
  }

  window.triggerMockDownload = function(id, title) {
    const toast = document.getElementById('toastNotification');
    if (toast) {
      toast.textContent = (state.lang === 'bn' ? 'ডাউনলোড শুরু হয়েছে: ' : 'Downloading document: ') + title;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3500);
    }
  };

  // 8. Fee Table
  function renderFeeTable() {
    const tbody = document.getElementById('feeTableBody');
    if (!tbody || !window.SCHOOL_DATA) return;

    tbody.innerHTML = window.SCHOOL_DATA.feeStructure.map(f => {
      return `
        <tr>
          <td style="font-weight:700; color:var(--primary-dark);">${f.classLevel}</td>
          <td style="font-weight:600;">${f.admFee}</td>
          <td style="font-weight:700; color:var(--green-dark);">${f.monthlyFee}</td>
          <td>${f.computerFee}</td>
          <td>${f.devFee}</td>
          <td>${f.sessionCharge}</td>
        </tr>
      `;
    }).join('');
  }

  // 9. Gallery Filtering & Lightbox
  function initGallery() {
    const filterBtns = document.querySelectorAll('.gallery-filter-chips .filter-chip');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-gallery-filter');
        filterGalleryItems(filter);
      });
    });

    document.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        const title = card.querySelector('h4')?.textContent || 'School Gallery';
        if (img) openLightbox(img.src, title);
      });
    });
  }

  function filterGalleryItems(cat) {
    document.querySelectorAll('.gallery-grid-full .gallery-card').forEach(card => {
      if (cat === 'all' || card.getAttribute('data-cat') === cat) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function openLightbox(src, title) {
    const modal = document.getElementById('lightboxModal');
    const imgEl = document.getElementById('lightboxImg');
    const capEl = document.getElementById('lightboxCaption');
    if (modal && imgEl) {
      imgEl.src = src;
      if (capEl) capEl.textContent = title;
      modal.classList.add('open');
    }
  }

  // 10. Admission Form Wizard
  function initAdmissionForm() {
    const nextBtn1 = document.getElementById('admNext1');
    const prevBtn2 = document.getElementById('admPrev2');
    const nextBtn2 = document.getElementById('admNext2');
    const prevBtn3 = document.getElementById('admPrev3');
    const nextBtn3 = document.getElementById('admNext3');
    const prevBtn4 = document.getElementById('admPrev4');
    const form = document.getElementById('onlineAdmissionForm');

    if (nextBtn1) nextBtn1.addEventListener('click', () => validateAndGoStep(1, 2));
    if (prevBtn2) prevBtn2.addEventListener('click', () => goToStep(1));
    if (nextBtn2) nextBtn2.addEventListener('click', () => validateAndGoStep(2, 3));
    if (prevBtn3) prevBtn3.addEventListener('click', () => goToStep(2));
    if (nextBtn3) nextBtn3.addEventListener('click', () => validateAndGoStep(3, 4));
    if (prevBtn4) prevBtn4.addEventListener('click', () => goToStep(3));

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const decl = document.getElementById('formDeclCheckbox');
        if (!decl.checked) {
          alert(state.lang === 'bn' ? 'দয়া করে শপথ বাক্সে টিক দিন।' : 'Please check the declaration checkbox.');
          return;
        }

        // Collect form data & generate Slip
        generateAdmissionReceipt();
      });
    }

    // Step indicators click
    document.querySelectorAll('.step-indicator').forEach(ind => {
      ind.addEventListener('click', () => {
        const targetStep = parseInt(ind.getAttribute('data-step'), 10);
        if (targetStep < state.admissionStep) {
          goToStep(targetStep);
        }
      });
    });
  }

  function validateAndGoStep(current, next) {
    const currentPanel = document.getElementById('stepPanel' + current);
    const requiredInputs = currentPanel.querySelectorAll('[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = '#EF4444';
        isValid = false;
      } else {
        input.style.borderColor = 'var(--border-color)';
      }
    });

    if (!isValid) {
      alert(state.lang === 'bn' ? 'দয়া করে প্রয়োজনীয় সমস্ত ঘর পূরণ করুন।' : 'Please fill all required fields.');
      return;
    }

    goToStep(next);
  }

  function goToStep(step) {
    state.admissionStep = step;
    document.querySelectorAll('.form-step-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('stepPanel' + step);
    if (panel) panel.classList.add('active');

    // Update indicator styling
    document.querySelectorAll('.step-indicator').forEach(ind => {
      const s = parseInt(ind.getAttribute('data-step'), 10);
      ind.classList.toggle('active', s === step);
      ind.classList.toggle('completed', s < step);
    });

    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function generateAdmissionReceipt() {
    const studentName = document.getElementById('studentNameInput').value;
    const dob = document.getElementById('dobInput').value;
    const gender = document.getElementById('genderSelect').value;
    const classApply = document.getElementById('classApplySelect').value;
    const fatherName = document.getElementById('fatherNameInput').value;
    const motherName = document.getElementById('motherNameInput').value;
    const phone = document.getElementById('phoneInput').value;
    const address = document.getElementById('addressInput').value;

    const appId = 'MRPM/2026/' + Math.floor(1000 + Math.random() * 9000);
    const submitDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const slipModal = document.getElementById('receiptSlipModal');
    const slipBody = document.getElementById('receiptSlipBody');

    slipBody.innerHTML = `
      <div class="admission-slip-printable" style="border:2px solid var(--primary); padding:26px; border-radius:12px; background:#FFF;">
        <div style="text-align:center; border-bottom:2px solid var(--primary); padding-bottom:14px; margin-bottom:20px;">
          <h2 style="color:var(--primary-dark); font-size:1.5rem; margin-bottom:4px;">M R PUBLIC MISSION</h2>
          <p style="font-size:0.85rem; color:var(--text-muted);">Bengali Medium Co-Educational Institution | Class 0 to VI</p>
          <p style="font-size:0.8rem; color:var(--text-muted);">Hooghly, West Bengal - 712101</p>
          <div style="display:inline-block; margin-top:8px; background:var(--green-soft); color:var(--green-dark); font-weight:800; padding:4px 14px; border-radius:20px; font-size:0.85rem;">
            ONLINE ADMISSION REGISTRATION SLIP (SESSION 2026-27)
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:20px; background:var(--bg-alt); padding:12px 18px; border-radius:8px;">
          <div>
            <span style="font-size:0.8rem; color:var(--text-muted); display:block;">APPLICATION NUMBER:</span>
            <strong style="font-size:1.2rem; color:var(--primary); font-family:monospace;">${appId}</strong>
          </div>
          <div style="text-align:right;">
            <span style="font-size:0.8rem; color:var(--text-muted); display:block;">DATE OF SUBMISSION:</span>
            <strong>${submitDate}</strong>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:0.92rem;">
          <tr style="border-bottom:1px solid #E2E8F0;">
            <td style="padding:8px 0; color:var(--text-muted); width:35%;">Applicant Name:</td>
            <td style="padding:8px 0; font-weight:700; color:var(--text-dark);">${studentName}</td>
          </tr>
          <tr style="border-bottom:1px solid #E2E8F0;">
            <td style="padding:8px 0; color:var(--text-muted);">Class Applied For:</td>
            <td style="padding:8px 0; font-weight:700; color:var(--primary);">${classApply}</td>
          </tr>
          <tr style="border-bottom:1px solid #E2E8F0;">
            <td style="padding:8px 0; color:var(--text-muted);">Date of Birth & Gender:</td>
            <td style="padding:8px 0;">${dob} (${gender})</td>
          </tr>
          <tr style="border-bottom:1px solid #E2E8F0;">
            <td style="padding:8px 0; color:var(--text-muted);">Father's Name:</td>
            <td style="padding:8px 0;">${fatherName}</td>
          </tr>
          <tr style="border-bottom:1px solid #E2E8F0;">
            <td style="padding:8px 0; color:var(--text-muted);">Mother's Name:</td>
            <td style="padding:8px 0;">${motherName}</td>
          </tr>
          <tr style="border-bottom:1px solid #E2E8F0;">
            <td style="padding:8px 0; color:var(--text-muted);">WhatsApp / Contact No:</td>
            <td style="padding:8px 0; font-weight:600;">${phone}</td>
          </tr>
          <tr style="border-bottom:1px solid #E2E8F0;">
            <td style="padding:8px 0; color:var(--text-muted);">Residential Address:</td>
            <td style="padding:8px 0;">${address}</td>
          </tr>
        </table>

        <div style="background:#FFFBEB; border-left:4px solid #F59E0B; padding:12px; border-radius:6px; font-size:0.82rem; margin-bottom:24px;">
          <strong>Next Step:</strong> Please visit the school office with this acknowledgement slip, original birth certificate, 2 passport photos, and Aadhaar card within 7 working days between 9:00 AM and 2:00 PM for child interaction and enrollment.
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:1px dashed #CBD5E1; padding-top:16px;">
          <div style="font-size:0.75rem; color:var(--text-muted);">
            System Generated E-Slip • M R Public Mission
          </div>
          <div style="text-align:center;">
            <div style="height:40px; border-bottom:1px solid #000; width:150px; margin-bottom:4px;"></div>
            <span style="font-size:0.75rem; font-weight:600;">Authorized Signatory</span>
          </div>
        </div>
      </div>
    `;

    slipModal.classList.add('open');
    document.getElementById('onlineAdmissionForm').reset();
    goToStep(1);
  }

  // 11. Search Dialog & Keyboard Shortcut (Ctrl+K)
  function initSearch() {
    const searchTrigger = document.getElementById('searchTriggerBtn');
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('globalSearchInput');
    const resultsContainer = document.getElementById('searchResultsList');

    if (searchTrigger && searchModal) {
      searchTrigger.addEventListener('click', () => {
        searchModal.classList.add('open');
        setTimeout(() => searchInput.focus(), 150);
      });
    }

    // Ctrl+K shortcut
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchModal.classList.add('open');
        setTimeout(() => searchInput.focus(), 150);
      }
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          resultsContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem; padding:10px;">${state.lang === 'bn' ? 'খুঁজতে টাইপ করুন...' : 'Type to search across notices, teachers, curriculum...'}</p>`;
          return;
        }

        const matches = [];

        // Search notices
        window.SCHOOL_DATA.notices.forEach(n => {
          if (n.titleEn.toLowerCase().includes(query) || n.titleBn.toLowerCase().includes(query)) {
            matches.push({
              title: state.lang === 'bn' ? n.titleBn : n.titleEn,
              type: state.lang === 'bn' ? 'নোটিশ' : 'Notice',
              action: () => {
                closeAllModals();
                openNoticeModal(n.id);
              }
            });
          }
        });

        // Search teachers
        window.SCHOOL_DATA.teachers.forEach(t => {
          if (t.name.toLowerCase().includes(query) || t.nameBn.toLowerCase().includes(query) || t.role.toLowerCase().includes(query)) {
            matches.push({
              title: (state.lang === 'bn' ? t.nameBn : t.name) + ' (' + (state.lang === 'bn' ? t.roleBn : t.role) + ')',
              type: state.lang === 'bn' ? 'শিক্ষক' : 'Teacher',
              action: () => {
                closeAllModals();
                window.location.hash = 'teachers';
              }
            });
          }
        });

        // Search curriculum
        window.SCHOOL_DATA.curriculum.forEach(c => {
          if (c.level.toLowerCase().includes(query) || c.levelBn.toLowerCase().includes(query) || c.descriptionEn.toLowerCase().includes(query)) {
            matches.push({
              title: state.lang === 'bn' ? c.levelBn : c.level,
              type: state.lang === 'bn' ? 'পাঠ্যক্রম' : 'Curriculum',
              action: () => {
                closeAllModals();
                window.location.hash = 'academics';
              }
            });
          }
        });

        if (matches.length === 0) {
          resultsContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem; padding:10px;">${state.lang === 'bn' ? 'কিছু খুঁজে পাওয়া যায়নি।' : 'No matches found.'}</p>`;
        } else {
          resultsContainer.innerHTML = matches.map((m, i) => `
            <div class="search-result-item" data-index="${i}">
              <div style="font-weight:700; color:var(--primary-dark); font-size:0.95rem;">${m.title}</div>
              <span style="font-size:0.75rem; color:var(--secondary-dark); font-weight:700; text-transform:uppercase;">${m.type}</span>
            </div>
          `).join('');

          resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
              const idx = parseInt(item.getAttribute('data-index'), 10);
              matches[idx].action();
            });
          });
        }
      });
    }
  }

  // 12. Modal Utility
  function initModals() {
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAllModals();
      });
    });

    // Contact Form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const toast = document.getElementById('toastNotification');
        if (toast) {
          toast.textContent = state.lang === 'bn' ? 'আপনার বার্তা সফলভাবে গৃহীত হয়েছে! শীঘ্রই যোগাযোগ করা হবে।' : 'Thank you! Your message has been sent to school administration.';
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 4000);
        }
        contactForm.reset();
      });
    }
  }

  // 13. Smart Portals & Dashboards Simulator
  function initPortalsSimulator() {
    // Global function to open portals modal at specific tab
    window.openPortalModal = function(tabName = 'parent') {
      const modal = document.getElementById('portalsModal');
      if (!modal) return;
      modal.classList.add('open');

      // Activate requested tab
      document.querySelectorAll('.portal-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-portal-tab') === tabName);
      });
      document.querySelectorAll('.portal-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === 'portal-tab-' + tabName);
      });
    };

    // Header & Hero buttons trigger
    const navPortalBtn = document.getElementById('navPortalBtn');
    if (navPortalBtn) {
      navPortalBtn.addEventListener('click', () => window.openPortalModal('parent'));
    }

    const launchSimulatorBtn = document.getElementById('btnLaunchPortalSimulator');
    if (launchSimulatorBtn) {
      launchSimulatorBtn.addEventListener('click', () => window.openPortalModal('parent'));
    }

    // Portal Tab Switcher
    document.querySelectorAll('.portal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-portal-tab');
        window.openPortalModal(targetTab);
      });
    });

    // Teacher Attendance Submission
    const submitAttBtn = document.getElementById('teacherSubmitAttendanceBtn');
    if (submitAttBtn) {
      submitAttBtn.addEventListener('click', () => {
        showToast(state.lang === 'bn' 
          ? 'উপস্থিতি সফলভাবে সংরক্ষিত হয়েছে! সকল অভিভাবকদের ফোনে এসএমএস অ্যালার্ট পাঠানো হয়েছে।' 
          : 'Attendance recorded for Class IV-A! Instant SMS notifications sent to 7 parent mobile numbers.');
      });
    }

    // Teacher Add Homework Form
    const addHwForm = document.getElementById('teacherAddHomeworkForm');
    if (addHwForm) {
      addHwForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('thwSubject').value;
        const title = document.getElementById('thwTitle').value;
        const due = document.getElementById('thwDue').value;

        if (window.SCHOOL_DATA && window.SCHOOL_DATA.portalData && window.SCHOOL_DATA.portalData.parent) {
          window.SCHOOL_DATA.portalData.parent.homeworkList.unshift({
            id: 'hw-' + Date.now(),
            subject: subject,
            taskEn: title,
            due: due,
            status: 'Pending',
            teacher: 'Smt. Sharmistha Sen'
          });
          renderParentPortalData();
        }

        showToast(state.lang === 'bn' 
          ? 'নতুন হোমওয়ার্ক সফলভাবে পেরেন্ট পোর্টালে প্রকাশ করা হয়েছে!' 
          : `New ${subject} assignment published and pushed to parent app!`);
        addHwForm.reset();
      });
    }

    // Parent-Teacher Live Chat Simulation
    const chatForm = document.getElementById('portalChatForm');
    const chatInput = document.getElementById('portalChatInput');
    const chatContainer = document.getElementById('portalChatMessages');

    if (chatForm && chatInput && chatContainer) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        // Append parent bubble
        const pBubble = document.createElement('div');
        pBubble.className = 'chat-bubble parent';
        pBubble.innerHTML = `
          <strong>You (Debasish Roy)</strong><br>
          ${escapeHtml(text)}
          <div style="font-size:0.7rem; opacity:0.7; margin-top:4px;">Just now</div>
        `;
        chatContainer.appendChild(pBubble);
        chatInput.value = '';
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Simulated reply from Teacher after 800ms
        setTimeout(() => {
          const tBubble = document.createElement('div');
          tBubble.className = 'chat-bubble teacher';
          const replyText = state.lang === 'bn'
            ? 'ধন্যবাদ আপনার বার্তার জন্য! বিষয়টি আমি শ্রেণী পর্যবেক্ষণে রাখছি এবং ক্লাসে যথাযথ যত্ন নেওয়া হবে।'
            : 'Thank you for reaching out, Mr. Roy! Message noted. We will ensure Souvik is guided carefully in class.';
          tBubble.innerHTML = `
            <strong>Mrs. Sharmistha Sen (Class Teacher)</strong><br>
            ${replyText}
            <div style="font-size:0.7rem; opacity:0.7; margin-top:4px;">Just now</div>
          `;
          chatContainer.appendChild(tBubble);
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 800);
      });
    }

    // Admin Emergency Broadcast Form
    const adminBroadcastForm = document.getElementById('adminBroadcastForm');
    if (adminBroadcastForm) {
      adminBroadcastForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('adminBroadcastTitle').value;
        showToast(state.lang === 'bn' 
          ? `জরুরি সার্কুলার "${title}" সফলভাবে সকল অভিভাবকদের ফোনে এসএমএস ও পুশ নোটিফিকেশন মাধ্যমে পাঠানো হয়েছে!` 
          : `Emergency Alert "${title}" broadcasted via SMS and Mobile Push to all registered school guardians!`);
        adminBroadcastForm.reset();
      });
    }
  }

  // Render Parent Portal Homework
  function renderParentPortalData() {
    const container = document.getElementById('parentHomeworkContainer');
    const countEl = document.getElementById('parentPendingHwCount');
    if (!container || !window.SCHOOL_DATA || !window.SCHOOL_DATA.portalData) return;

    const list = window.SCHOOL_DATA.portalData.parent.homeworkList;
    const pendingCount = list.filter(t => t.status === 'Pending').length;
    if (countEl) countEl.textContent = `${pendingCount} Tasks`;

    container.innerHTML = list.map((item, idx) => `
      <div class="portal-task-item ${item.status.toLowerCase()}" data-hw-idx="${idx}">
        <div style="display:flex; align-items:flex-start; gap:12px;">
          <input type="checkbox" ${item.status === 'Completed' ? 'checked' : ''} style="margin-top:4px; width:18px; height:18px; cursor:pointer;" class="hw-check-input" data-hw-idx="${idx}">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-weight:800; color:#0A346C; font-size:0.95rem;">${item.subject}</span>
              <span style="font-size:0.72rem; padding:1px 6px; border-radius:4px; font-weight:700; ${item.status === 'Completed' ? 'background:#DCFCE7; color:#15803D;' : 'background:#FFF7ED; color:#EA580C;'}">
                ${item.status}
              </span>
            </div>
            <div style="font-size:0.88rem; color:var(--text-body); margin-top:2px;">${item.taskEn}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Assigned by: ${item.teacher}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.8rem; font-weight:700; color:#EA580C;">Due: ${item.due}</span>
        </div>
      </div>
    `).join('');

    // Toggle status on checkbox click
    container.querySelectorAll('.hw-check-input').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-hw-idx'), 10);
        list[idx].status = e.target.checked ? 'Completed' : 'Pending';
        renderParentPortalData();
        showToast(e.target.checked ? 'Task marked as completed!' : 'Task set to pending.');
      });
    });
  }

  // Render Teacher Portal Roster
  function renderTeacherPortalData() {
    const container = document.getElementById('teacherRosterContainer');
    if (!container || !window.SCHOOL_DATA || !window.SCHOOL_DATA.portalData) return;

    const roster = window.SCHOOL_DATA.portalData.teacher.studentsList;
    container.innerHTML = roster.map((s, idx) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#F8FAFC; border-radius:8px; border:1px solid var(--border-color); flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="background:#0A346C; color:#FFF; font-size:0.78rem; font-weight:800; padding:3px 8px; border-radius:4px;">Roll ${s.roll}</span>
          <span style="font-weight:700; color:var(--primary-dark); font-size:0.95rem;">${s.name}</span>
        </div>
        <div style="display:flex; gap:6px;" data-student-idx="${idx}">
          <button type="button" class="btn-att-toggle ${s.status === 'present' ? 'active-present' : ''}" data-val="present" style="padding:4px 10px; border-radius:4px; font-size:0.78rem; font-weight:700; cursor:pointer; border:1px solid #16A34A; ${s.status === 'present' ? 'background:#16A34A; color:#FFF;' : 'background:#FFF; color:#16A34A;'}">Present</button>
          <button type="button" class="btn-att-toggle ${s.status === 'absent' ? 'active-absent' : ''}" data-val="absent" style="padding:4px 10px; border-radius:4px; font-size:0.78rem; font-weight:700; cursor:pointer; border:1px solid #DC2626; ${s.status === 'absent' ? 'background:#DC2626; color:#FFF;' : 'background:#FFF; color:#DC2626;'}">Absent</button>
          <button type="button" class="btn-att-toggle ${s.status === 'late' ? 'active-late' : ''}" data-val="late" style="padding:4px 10px; border-radius:4px; font-size:0.78rem; font-weight:700; cursor:pointer; border:1px solid #D97706; ${s.status === 'late' ? 'background:#D97706; color:#FFF;' : 'background:#FFF; color:#D97706;'}">Late</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-att-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest('[data-student-idx]');
        const sIdx = parseInt(group.getAttribute('data-student-idx'), 10);
        roster[sIdx].status = btn.getAttribute('data-val');
        renderTeacherPortalData();
      });
    });
  }

  // 14. Prospectus Modal Handlers
  function initProspectusModal() {
    const pModal = document.getElementById('prospectusModal');
    if (!pModal) return;

    window.openProspectusModal = function() {
      pModal.classList.add('open');
    };

    const heroProspectusBtn = document.getElementById('heroProspectusBtn');
    if (heroProspectusBtn) {
      heroProspectusBtn.addEventListener('click', window.openProspectusModal);
    }

    const mobileProspectusBtn = document.getElementById('mobileProspectusBtn');
    if (mobileProspectusBtn) {
      mobileProspectusBtn.addEventListener('click', window.openProspectusModal);
    }

    const downloadPdfBtn = document.getElementById('downloadProspectusPdfBtn');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', () => {
        showToast(state.lang === 'bn' 
          ? 'এম. আর. পাবলিক মিশন প্রসপেক্টাস ২০২৬-২৭ (পিডিএফ) ডাউনলোড প্রস্তুত হচ্ছে...' 
          : 'Preparing official M.R. Public Mission Prospectus (Class 0-V) PDF for download...');
        setTimeout(() => {
          showToast(state.lang === 'bn' 
            ? '✓ প্রসপেক্টাস সফলভাবে ডাউনলোড হয়েছে!' 
            : '✓ Prospectus downloaded successfully to your device!');
        }, 1200);
      });
    }
  }

  function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3800);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }

  // Scroll to Top
  function initScrollToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
