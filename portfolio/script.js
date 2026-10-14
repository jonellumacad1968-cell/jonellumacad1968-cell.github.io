/**
 * MARK JONEL LUMACAD — BAKI THE GRAPPLER NO-SCROLL PORTFOLIO SCRIPT
 * Single-Screen View Switcher, Deep Hash Routing, Clipboard Copy, and Brief Dispatch
 */

document.addEventListener('DOMContentLoaded', () => {
    const validViews = ['home', 'about', 'skills', 'projects', 'contact'];
    const dockTabs = document.querySelectorAll('.dock-tab');
    const viewPanels = document.querySelectorAll('.view-panel');
    const navButtons = document.querySelectorAll('[data-nav]');

    /**
     * Switch to a target view without any page scrolling
     * @param {string} targetView - ID of view ('home', 'about', etc.)
     */
    function switchView(targetView) {
        if (!validViews.includes(targetView)) {
            targetView = 'home';
        }

        // 1. Update Tabs
        dockTabs.forEach(tab => {
            if (tab.getAttribute('data-nav') === targetView) {
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
            } else {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            }
        });

        // 2. Switch Panels with clean fade/slide transition and animation reset
        viewPanels.forEach(panel => {
            if (panel.id === `view-${targetView}`) {
                panel.classList.remove('active');
                void panel.offsetWidth; // Reflow to re-trigger staggered entrance animation
                panel.classList.add('active');
                panel.scrollTop = 0;
            } else {
                panel.classList.remove('active');
            }
        });

        // 3. Update URL Hash without trigger loop
        if (window.location.hash.replace('#', '') !== targetView) {
            history.pushState(null, null, `#${targetView}`);
        }
    }

    // Attach click listeners to all elements with data-nav (tabs, hero CTAs, etc.)
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-nav');
            if (target) {
                e.preventDefault();
                switchView(target);
            }
        });
    });

    // Handle Browser Back / Forward buttons via hashchange
    window.addEventListener('hashchange', () => {
        const hashTarget = window.location.hash.replace('#', '');
        if (hashTarget && validViews.includes(hashTarget)) {
            switchView(hashTarget);
        }
    });

    // Initialize from URL hash or default to 'home'
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && validViews.includes(initialHash)) {
        switchView(initialHash);
    } else {
        switchView('home');
    }

    // Number key shortcuts (1-5) when not typing in form inputs
    document.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
            return;
        }

        const keyMap = {
            '1': 'home',
            '2': 'about',
            '3': 'skills',
            '4': 'projects',
            '5': 'contact'
        };

        if (keyMap[e.key]) {
            switchView(keyMap[e.key]);
        }
    });

    // -------------------------------------------------------------
    // Interactive 1-Click Email Copy
    // -------------------------------------------------------------
    const copyTrigger = document.getElementById('copyEmailTrigger');
    const emailVal = document.getElementById('emailVal');
    const copyBtnText = document.getElementById('copyBtnText');
    const copyNotification = document.getElementById('copyNotification');

    if (copyTrigger && emailVal) {
        copyTrigger.addEventListener('click', async () => {
            const emailStr = emailVal.innerText.trim();

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(emailStr);
                } else {
                    const temp = document.createElement('textarea');
                    temp.value = emailStr;
                    temp.style.position = 'fixed';
                    temp.style.opacity = '0';
                    document.body.appendChild(temp);
                    temp.focus();
                    temp.select();
                    document.execCommand('copy');
                    document.body.removeChild(temp);
                }

                if (copyBtnText) copyBtnText.textContent = 'COPIED!';
                if (copyNotification) copyNotification.textContent = '✓ EMAIL COPIED TO CLIPBOARD. READY TO PASTE!';

                setTimeout(() => {
                    if (copyBtnText) copyBtnText.textContent = 'COPY';
                    if (copyNotification) copyNotification.textContent = '';
                }, 3500);
            } catch (err) {
                console.error('Clipboard copy failed:', err);
                if (copyNotification) copyNotification.textContent = 'Direct email: ' + emailStr;
            }
        });
    }

    // -------------------------------------------------------------
    // Web3Forms Direct Email Submission
    // -------------------------------------------------------------
    const bakiForm = document.getElementById('bakiInquiryForm');
    const bakiSubmit = document.getElementById('bakiSubmit');
    const bakiFeedback = document.getElementById('bakiFeedback');

    if (bakiForm && bakiFeedback) {
        bakiForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('bakiName').value.trim();
            const email = document.getElementById('bakiEmail').value.trim();
            const msg = document.getElementById('bakiMsg').value.trim();

            if (!name || !email || !msg) {
                bakiFeedback.className = 'form-feedback-baki error';
                bakiFeedback.textContent = '[ERROR]: All required fields must be filled.';
                return;
            }

            bakiSubmit.disabled = true;
            bakiSubmit.innerHTML = `<span>TRANSMITTING MESSAGE...</span>`;
            bakiFeedback.className = 'form-feedback-baki';
            bakiFeedback.textContent = '[SYSTEM]: Sending message via Web3Forms...';

            try {
                const formData = new FormData(bakiForm);
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.status === 200 && data.success) {
                    bakiFeedback.className = 'form-feedback-baki success';
                    bakiFeedback.textContent = '✓ MESSAGE SENT SUCCESSFULLY! Mark Jonel will get back to you within 24 hours.';
                    bakiForm.reset();
                } else {
                    bakiFeedback.className = 'form-feedback-baki error';
                    bakiFeedback.textContent = data.message || '[ERROR]: Transmission failed. Please email directly at jonellumacad@gmail.com.';
                }
            } catch (err) {
                console.error('Web3Forms dispatch error:', err);
                bakiFeedback.className = 'form-feedback-baki error';
                bakiFeedback.textContent = '[OFFLINE]: Network error. Please email directly at jonellumacad@gmail.com.';
            } finally {
                bakiSubmit.disabled = false;
                bakiSubmit.innerHTML = `<span>SEND MESSAGE</span> <span class="btn-arrow">→</span>`;
            }
        });
    }
});
