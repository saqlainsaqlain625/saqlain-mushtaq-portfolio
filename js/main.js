/**
 * ============================================================================
 * PORTFOLIO JAVASCRIPT LOGIC
 * Clean, lightweight Vanilla JavaScript for interactive portfolio features
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initTypewriter();
  initMobileNavClose();
  initAboutTabs();
  initSmoothScroll();
  initScrollSpy();
  initContactForm();
  initCvDownload();
});

/**
 * 1. Navbar Scroll Transition
 * Changes the navbar background from transparent to royal blue when scrolled.
 */
function initNavbarScroll() {
  const navbar = document.querySelector('.custom-navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  // Run once on load and attach to scroll event
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * 2. Dynamic Typewriter Effect
 * Cycles through titles with human-like typing and deleting animations.
 */
function initTypewriter() {
  const typewriterElement = document.getElementById('typewriter-text');
  if (!typewriterElement) return;

  const phrases = [
    'An AI/ML Engineer.',
    'A Python Developer.',
    'A Software Engineer.',
    'A Deep Learning Enthusiast.'
  ];

  let phraseIndex = 0;
  let characterIndex = 0;
  let isDeleting = false;
  const typingSpeed = 100;    // Milliseconds per character while typing
  const deletingSpeed = 50;   // Milliseconds per character while erasing
  const pauseAfterTyping = 1800; // Pause before erasing
  const pauseBeforeNext = 400;   // Pause before typing next word

  function tick() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      // Erase character
      typewriterElement.textContent = currentPhrase.substring(0, characterIndex - 1);
      characterIndex--;
    } else {
      // Add character
      typewriterElement.textContent = currentPhrase.substring(0, characterIndex + 1);
      characterIndex++;
    }

    let delay = isDeleting ? deletingSpeed : typingSpeed;

    // Word completely typed
    if (!isDeleting && characterIndex === currentPhrase.length) {
      delay = pauseAfterTyping;
      isDeleting = true;
    } else if (isDeleting && characterIndex === 0) {
      // Word completely erased
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = pauseBeforeNext;
    }

    setTimeout(tick, delay);
  }

  // Start the typewriter sequence
  setTimeout(tick, 300);
}

/**
 * 3. Mobile Navigation Auto-Close
 * Automatically collapses the mobile navbar when a user clicks on any nav link.
 */
function initMobileNavClose() {
  const navLinks = document.querySelectorAll('.custom-navbar .nav-link');
  const navbarCollapse = document.querySelector('.navbar-collapse');

  if (!navbarCollapse) return;

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navbarCollapse.classList.contains('show')) {
        // Use Bootstrap's collapse API if available or toggle class
        if (window.bootstrap && window.bootstrap.Collapse) {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse);
          bsCollapse.hide();
        } else {
          navbarCollapse.classList.remove('show');
        }
      }
    });
  });
}

// State tracker to temporarily prevent ScrollSpy from overriding active link during click-triggered smooth scroll
let isClickScrolling = false;
let clickScrollTimer = null;

/**
 * Helper: Updates the active navbar link indicator
 */
function setActiveNavLink(targetHref) {
  if (!targetHref) return;
  const navLinks = document.querySelectorAll('#portfolioNavbar .nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === targetHref) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Helper: Activates tab inside About section and syncs content pane
 */
function activateAboutTab(tabButtonSelector) {
  const tabBtn = document.querySelector(tabButtonSelector);
  if (!tabBtn) return;

  if (window.bootstrap && window.bootstrap.Tab) {
    const tabInstance = bootstrap.Tab.getOrCreateInstance(tabBtn);
    tabInstance.show();
  } else {
    tabBtn.click();
  }

  // Fallback explicit activation to ensure active class and aria-selected are set
  const targetId = tabBtn.getAttribute('data-bs-target');
  const allTabs = document.querySelectorAll('#aboutTabs button');
  allTabs.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });
  tabBtn.classList.add('active');
  tabBtn.setAttribute('aria-selected', 'true');

  const tabPanes = document.querySelectorAll('#aboutTabContent .tab-pane');
  tabPanes.forEach(pane => pane.classList.remove('show', 'active'));
  const targetPane = document.querySelector(targetId);
  if (targetPane) {
    targetPane.classList.add('show', 'active');
  }
}

/**
 * 4. About Section Tabs
 * Ensures robust tab switching between About Me, Skills, and Experience,
 * and synchronizes navbar active indicator when inside About section.
 */
function initAboutTabs() {
  const tabButtons = document.querySelectorAll('#aboutTabs button[data-bs-toggle="tab"]');
  if (!tabButtons.length) return;

  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const targetId = button.getAttribute('data-bs-target');

      // Update navbar active state if about section is currently in view
      const aboutSection = document.querySelector('#about');
      if (aboutSection) {
        const rect = aboutSection.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          if (targetId === '#skills') {
            setActiveNavLink('#skills');
          } else if (targetId === '#experience') {
            setActiveNavLink('#experience');
          } else {
            setActiveNavLink('#about');
          }
        }
      }

      // Fallback tab activation if Bootstrap Tab JS is unavailable
      if (!window.bootstrap || !window.bootstrap.Tab) {
        e.preventDefault();
        tabButtons.forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');

        const tabPanes = document.querySelectorAll('#aboutTabContent .tab-pane');
        tabPanes.forEach(pane => pane.classList.remove('show', 'active'));

        const targetPane = document.querySelector(targetId);
        if (targetPane) {
          targetPane.classList.add('show', 'active');
        }
      }
    });
  });
}

/**
 * 5. Smooth Anchor Scrolling & Navbar Click Handling
 * Immediately updates active navbar pill on click, activates corresponding About tabs for Skills/Experience,
 * and scrolls smoothly to target section.
 */
function initSmoothScroll() {
  const allAnchorLinks = document.querySelectorAll('a[href^="#"]');

  allAnchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const isNavLink = link.classList.contains('nav-link');

      // 1. Immediately update active class on navbar links
      if (isNavLink) {
        setActiveNavLink(targetId);
      } else {
        const matchingNavLink = document.querySelector(`#portfolioNavbar a[href="${targetId}"]`);
        if (matchingNavLink) {
          setActiveNavLink(targetId);
        }
      }

      // 2. Temporarily lock ScrollSpy during smooth scroll animation
      isClickScrolling = true;
      clearTimeout(clickScrollTimer);
      clickScrollTimer = setTimeout(() => {
        isClickScrolling = false;
      }, 950);

      // 3. Handle direct deep-linking to About section tabs
      if (targetId === '#skills') {
        activateAboutTab('#skills-tab');
      } else if (targetId === '#experience') {
        activateAboutTab('#experience-tab');
      } else if (targetId === '#about') {
        activateAboutTab('#aboutme-tab');
      }

      // 4. Scroll smoothly to target section
      const targetElement = (targetId === '#skills' || targetId === '#experience')
        ? document.querySelector('#about')
        : document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();
        const navOffset = 70; // Height of the fixed navbar
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 6. Dynamic ScrollSpy
 * Automatically updates navbar active pill as user scrolls through sections,
 * with bottom-of-page contact highlighting and tab-awareness for About/Skills/Experience.
 */
function initScrollSpy() {
  const sections = [
    { href: '#home', el: document.querySelector('#home') },
    { href: '#about', el: document.querySelector('#about') },
    { href: '#services', el: document.querySelector('#services') },
    { href: '#portfolio', el: document.querySelector('#portfolio') },
    { href: '#contact', el: document.querySelector('#contact') }
  ];

  function onScroll() {
    if (isClickScrolling) return;

    const scrollPos = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Check if user is scrolled near bottom of page -> ensure Contact is active
    if (windowHeight + scrollPos >= documentHeight - 60) {
      setActiveNavLink('#contact');
      return;
    }

    // Determine currently visible section (checking bottom-most sections first)
    const navOffset = 110;
    let currentHref = '#home';

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section.el) {
        const top = section.el.offsetTop - navOffset;
        if (scrollPos >= top) {
          currentHref = section.href;
          break;
        }
      }
    }

    // When inside #about, reflect the currently active tab (About Me, Skills, or Experience)
    if (currentHref === '#about') {
      const activeTab = document.querySelector('#aboutTabs button.active');
      if (activeTab) {
        const tabTarget = activeTab.getAttribute('data-bs-target');
        if (tabTarget === '#skills') {
          currentHref = '#skills';
        } else if (tabTarget === '#experience') {
          currentHref = '#experience';
        } else {
          currentHref = '#about';
        }
      }
    }

    setActiveNavLink(currentHref);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Run once initially on load
  onScroll();
}

/**
 * 7. Contact Form Validation & Confirmation
 * Handles client-side validation, asynchronous Web3Forms submission,
 * loading state indicators, and confirmation feedback.
 */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const alertContainer = document.getElementById('contactFormAlert');
  const submitBtn = document.getElementById('contactSubmitBtn');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;
    let errorMessage = '';

    // Field-level validation
    if (!name) {
      isValid = false;
      errorMessage = 'Please provide your full name.';
      nameInput.classList.add('is-invalid');
    } else {
      nameInput.classList.remove('is-invalid');
    }

    if (!email || !emailRegex.test(email)) {
      isValid = false;
      if (!errorMessage) errorMessage = 'Please provide a valid email address.';
      emailInput.classList.add('is-invalid');
    } else {
      emailInput.classList.remove('is-invalid');
    }

    if (!subject) {
      isValid = false;
      if (!errorMessage) errorMessage = 'Please enter a message subject.';
      subjectInput.classList.add('is-invalid');
    } else {
      subjectInput.classList.remove('is-invalid');
    }

    if (!message || message.length < 5) {
      isValid = false;
      if (!errorMessage) errorMessage = 'Please enter a message with at least 5 characters.';
      messageInput.classList.add('is-invalid');
    } else {
      messageInput.classList.remove('is-invalid');
    }

    if (!alertContainer) return;

    if (!isValid) {
      alertContainer.className = 'alert alert-danger d-flex align-items-center gap-2 mb-4';
      alertContainer.innerHTML = `<i class="bi bi-exclamation-triangle-fill fs-5"></i><div>${errorMessage}</div>`;
      alertContainer.classList.remove('d-none');
      return;
    }

    // Success: Clear validation errors
    [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
      if (input) input.classList.remove('is-invalid');
    });

    const safeName = name.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));

    // Button loading state
    const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'SEND MESSAGE <i class="bi bi-arrow-right"></i>';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>SENDING...';
    }

    // Prepare FormData for Web3Forms API
    const formData = new FormData(contactForm);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alertContainer.className = 'alert alert-success d-flex align-items-center gap-2 mb-4';
        alertContainer.innerHTML = `<i class="bi bi-check-circle-fill fs-5"></i><div><strong>Thank you, ${safeName}!</strong> Your message has been sent successfully. Saqlain will get back to you shortly.</div>`;
        alertContainer.classList.remove('d-none');
        contactForm.reset();
      } else {
        alertContainer.className = 'alert alert-danger d-flex align-items-center gap-2 mb-4';
        alertContainer.innerHTML = `<i class="bi bi-exclamation-triangle-fill fs-5"></i><div>${result.message || 'Something went wrong while sending your message. Please try again or email directly.'}</div>`;
        alertContainer.classList.remove('d-none');
      }
    } catch (error) {
      alertContainer.className = 'alert alert-danger d-flex align-items-center gap-2 mb-4';
      alertContainer.innerHTML = `<i class="bi bi-exclamation-triangle-fill fs-5"></i><div>Network error encountered. Please check your connection or email directly at <a href="mailto:saqlain.mushtaqbalti@gmail.com" class="text-danger fw-bold">saqlain.mushtaqbalti@gmail.com</a>.</div>`;
      alertContainer.classList.remove('d-none');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }
    }
  });

  // Clear invalid styling on input typing
  ['contactName', 'contactEmail', 'contactSubject', 'contactMessage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        el.classList.remove('is-invalid');
        if (alertContainer && alertContainer.classList.contains('alert-danger')) {
          alertContainer.classList.add('d-none');
        }
      });
    }
  });
}

/**
 * 8. Reliable PDF CV Download Handler
 * Forces programmatic blob download over HTTP/HTTPS with clean fallback for file:// protocol.
 */
function initCvDownload() {
  const cvButtons = document.querySelectorAll('.cv-download-btn');
  if (!cvButtons.length) return;

  cvButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const pdfUrl = btn.getAttribute('href') || 'assets/Saqlain_Mushtaq_CV.pdf';
      const fileName = btn.getAttribute('download') || 'Saqlain_Mushtaq_CV.pdf';

      // Fallback for local file:// protocol testing
      if (window.location.protocol === 'file:') {
        e.preventDefault();
        window.open(pdfUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      e.preventDefault();

      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobUrl;
        tempLink.download = fileName;
        document.body.appendChild(tempLink);
        tempLink.click();

        setTimeout(() => {
          if (tempLink.parentNode) {
            document.body.removeChild(tempLink);
          }
          window.URL.revokeObjectURL(blobUrl);
        }, 200);
      } catch (err) {
        // Fallback: open in a new tab without navigating away from the current page
        window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      }
    });
  });
}
