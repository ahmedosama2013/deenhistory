// Global variables to manage audio queues and prevent overlap
let currentDuaAudio = null;
let currentDuaQueue = [];
let currentDuaQueueIndex = 0;

function playDuaAudio(audioUrls, arabicText = '', isHadith = false) {
    // 1. Stop any currently playing audio immediately
    if (currentDuaAudio) {
        currentDuaAudio.pause();
        currentDuaAudio.currentTime = 0;
        currentDuaAudio = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    // 2. If it's a Hadith dua or lacks MP3 URLs, use TTS
    if (isHadith || !audioUrls || audioUrls.length === 0) {
        if (arabicText) {
            const encodedText = encodeURIComponent(arabicText);
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=${encodedText}`;
            currentDuaAudio = new Audio(ttsUrl);
            currentDuaAudio.play().catch(() => {
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(arabicText);
                    utterance.lang = 'ar-SA';
                    utterance.rate = 0.85;
                    window.speechSynthesis.speak(utterance);
                }
            });
        }
        return;
    }

    // 3. Otherwise, play Quran audio queue sequentially
    currentDuaQueue = audioUrls;
    currentDuaQueueIndex = 0;
    playNextDuaInQueue();
}

function playNextDuaInQueue() {
    if (currentDuaQueueIndex >= currentDuaQueue.length) {
        currentDuaAudio = null;
        return;
    }

    currentDuaAudio = new Audio(currentDuaQueue[currentDuaQueueIndex]);
    currentDuaAudio.play().catch(error => {
        console.warn("Dua audio playback error:", error);
    });

    currentDuaAudio.onended = () => {
        currentDuaQueueIndex++;
        playNextDuaInQueue();
    };
}

function compileArchivePlatform() {
    // 1. Compile Prophets View
    const prophetsContainer = document.getElementById('prophets-injection-point');
    if (prophetsContainer && typeof prophetsDatabase !== 'undefined') {
        prophetsContainer.innerHTML = prophetsDatabase.map(p => `
            <div class="record-card">
                <div class="record-title">
                    ${p.name}
                    <div class="badge-container">
                        <span class="badge">Archival Verified</span>
                        <span class="badge gold">${p.titleBadge}</span>
                    </div>
                </div>
                <div class="record-meta-callout">${p.metaCallout}</div>
                <div class="section-divider">Historical Narrative</div>
                <p class="record-narrative">${p.narrative}</p>
                <div class="section-divider">Chronological Milestones</div>
                <ul class="chronology-list">
                    ${p.chronology.map(c => `<li class="chronology-step">${c}</li>`).join('')}
                </ul>
                <div class="insight-box">
                    <div class="insight-box-title">Universal Ethical Wisdom</div>
                    <ul>
                        ${p.lessons.map(l => `<li>${l}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    // 2. Compile Seerah View
    const seerahContainer = document.getElementById('seerah-injection-point');
    if (seerahContainer && typeof seerahDatabase !== 'undefined') {
        seerahContainer.innerHTML = seerahDatabase.map(s => `
            <div class="record-card">
                <div class="record-title">
                    ${s.name}
                    <div class="badge-container">
                        <span class="badge">Prophetic Era</span>
                        <span class="badge gold">${s.titleBadge}</span>
                    </div>
                </div>
                <div class="record-meta-callout">${s.metaCallout}</div>
                <div class="section-divider">Phase Analysis</div>
                <p class="record-narrative">${s.narrative}</p>
                <div class="section-divider">Key Milestones</div>
                <ul class="chronology-list">
                    ${s.chronology.map(c => `<li class="chronology-step">${c}</li>`).join('')}
                </ul>
                <div class="insight-box">
                    <div class="insight-box-title">Strategic Wisdom</div>
                    <ul>
                        ${s.lessons.map(l => `<li>${l}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    // 3. Compile Duas View
    const duasContainer = document.getElementById('duas-injection-point');
    if (duasContainer && typeof duasDatabase !== 'undefined') {
        duasContainer.innerHTML = duasDatabase.map(d => `
            <div class="record-card">
                <div class="record-title">
                    ${d.name}
                    <div class="badge-container">
                        <span class="badge">Prophetic Supplication</span>
                        <span class="badge gold">${d.titleBadge}</span>
                    </div>
                </div>
                <div class="record-meta-callout">${d.metaCallout}</div>
                <div class="section-divider">Context & Crisis</div>
                <p class="record-narrative">${d.narrative}</p>
                
                <div style="background-color: var(--bg-sidebar); padding: 16px; border-radius: 12px; margin: 16px 0;">
                    <div style="font-family: 'Amiri', serif; font-size: 1.6rem; direction: rtl; text-align: right; line-height: 2; color: var(--text-primary); margin-bottom: 8px;">
                        ${d.arabic}
                    </div>
                    <div style="color: var(--text-secondary); font-style: italic;">
                        "${d.translation}"
                    </div>
                </div>

                <div class="section-divider">Key Takeaways</div>
                <ul class="chronology-list">
                    ${d.chronology.map(c => `<li class="chronology-step">${c}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    // 4. Compile Sahabah View
    const sahabahContainer = document.getElementById('sahabah-injection-point');
    if (sahabahContainer && typeof sahabahDatabase !== 'undefined') {
        sahabahContainer.innerHTML = sahabahDatabase.map(s => `
            <div class="record-card">
                <div class="record-title">
                    ${s.name}
                    <div class="badge-container">
                        <span class="badge">Companion Record</span>
                        <span class="badge gold">${s.titleBadge}</span>
                    </div>
                </div>
                <div class="record-meta-callout">${s.metaCallout}</div>
                <div class="section-divider">Biographical Profile</div>
                <p class="record-narrative">${s.narrative}</p>
                <div class="section-divider">Leadership & Contributions</div>
                <ul class="chronology-list">
                    ${s.chronology.map(c => `<li class="chronology-step">${c}</li>`).join('')}
                </ul>
                <div class="insight-box">
                    <div class="insight-box-title">Character Lesson</div>
                    <ul>
                        ${s.lessons.map(l => `<li>${l}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    // 5. Compile Battles View
    const battlesContainer = document.getElementById('battles-injection-point');
    if (battlesContainer && typeof battlesDatabase !== 'undefined') {
        battlesContainer.innerHTML = battlesDatabase.map(b => `
            <div class="record-card">
                <div class="record-title">
                    ${b.name}
                    <div class="badge-container">
                        <span class="badge">Military Defense</span>
                        <span class="badge gold">${b.titleBadge}</span>
                    </div>
                </div>
                <div class="record-meta-callout">${b.metaCallout}</div>
                <div class="section-divider">Tactical Overview</div>
                <p class="record-narrative">${b.narrative}</p>
                <div class="section-divider">Engagement Milestones</div>
                <ul class="chronology-list">
                    ${b.chronology.map(c => `<li class="chronology-step">${c}</li>`).join('')}
                </ul>
                <div class="insight-box">
                    <div class="insight-box-title">Strategic Lesson</div>
                    <ul>
                        ${b.lessons.map(l => `<li>${l}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    // 6. Compile Eras View
    const erasContainer = document.getElementById('eras-injection-point');
    if (erasContainer && typeof empiresDatabase !== 'undefined') {
        erasContainer.innerHTML = empiresDatabase.map(e => `
            <div class="record-card">
                <div class="record-title">
                    ${e.name}
                    <div class="badge-container">
                        <span class="badge">Civilizational Era</span>
                        <span class="badge gold">${e.titleBadge}</span>
                    </div>
                </div>
                <div class="record-meta-callout">${e.metaCallout}</div>
                <div class="section-divider">Governance & Expansion</div>
                <p class="record-narrative">${e.narrative}</p>
                <div class="section-divider">Historical Milestones</div>
                <ul class="chronology-list">
                    ${e.chronology.map(c => `<li class="chronology-step">${c}</li>`).join('')}
                </ul>
                ${e.polymaths ? `
                    <div class="section-divider">Key Polymaths & Scholars</div>
                    <ul>
                        ${e.polymaths.map(p => `<li><strong>${p.name}</strong> (${p.field}): ${p.contribution}</li>`).join('')}
                    </ul>
                ` : ''}
                <div class="insight-box">
                    <div class="insight-box-title">Civilizational Lesson</div>
                    <ul>
                        ${e.lessons.map(l => `<li>${l}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    // 7. Compile Tyrants View
    const tyrantsContainer = document.getElementById('opponents-injection-point');
    if (tyrantsContainer && typeof tyrantsDatabase !== 'undefined') {
        tyrantsContainer.innerHTML = tyrantsDatabase.map(t => `
            <div class="record-card">
                <div class="record-title">
                    ${t.name}
                    <div class="badge-container">
                        <span class="badge">Ethical Warning</span>
                        <span class="badge gold">${t.titleBadge}</span>
                    </div>
                </div>
                <div class="record-meta-callout">${t.metaCallout}</div>
                <div class="section-divider">Historical Narrative</div>
                <p class="record-narrative">${t.narrative}</p>
                <div class="section-divider">Failure Sequence</div>
                <ul class="chronology-list">
                    ${t.chronology.map(c => `<li class="chronology-step">${c}</li>`).join('')}
                </ul>
                <div class="insight-box" style="border-left-color: var(--accent-gold);">
                    <div class="insight-box-title">Historical Verdict</div>
                    <p style="margin: 0; color: var(--text-secondary);">${t.verdict}</p>
                </div>
            </div>
        `).join('');
    }

    // 8. Compile 10 Major Signs View
    const tenSignsContainer = document.getElementById('tensigns-injection-point');
    if (tenSignsContainer && typeof tenSignsDatabase !== 'undefined') {
        tenSignsContainer.innerHTML = tenSignsDatabase.map(s => `
            <div class="record-card">
                <div class="record-title">
                    ${s.name}
                    <div class="badge-container">
                        <span class="badge">Eschatological Sign</span>
                        <span class="badge gold">${s.titleBadge}</span>
                    </div>
                </div>
                <div class="record-meta-callout">${s.metaCallout}</div>
                <div class="section-divider">Authentic Record & Narrative</div>
                <p class="record-narrative">${s.narrative}</p>
                <div class="section-divider">Sequence & Manifestations</div>
                <ul class="chronology-list">
                    ${s.chronology.map(c => `<li class="chronology-step">${c}</li>`).join('')}
                </ul>
                <div class="insight-box">
                    <div class="insight-box-title">Spiritual Lessons & Guidance</div>
                    <ul>
                        ${s.lessons.map(l => `<li>${l}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }
}

function compileGeometricStarfield() {
    const canvasContainer = document.getElementById('starfield-canvas-container');
    if (!canvasContainer) return;
    canvasContainer.innerHTML = '';

    for (let idx = 0; idx < 45; idx++) {
        const starElement = document.createElement('div');
        const horizontalRandom = Math.floor(Math.random() * 100);
        const verticalRandom = Math.floor(Math.random() * 100);
        const scaleRandom = (Math.random() * 3 + 1).toFixed(1);

        starElement.style.position = 'absolute';
        starElement.style.left = `${horizontalRandom}%`;
        starElement.style.top = `${verticalRandom}%`;
        starElement.style.width = `${scaleRandom}px`;
        starElement.style.height = `${scaleRandom}px`;
        starElement.style.backgroundColor = 'rgba(255,255,255,0.7)';
        starElement.style.borderRadius = '50%';
        starElement.style.pointerEvents = 'none';

        canvasContainer.appendChild(starElement);
    }
}

// Touch gesture detection for swiping open/close the mobile sidebar
function initializeTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeDistance = touchEndX - touchStartX;
        const sidebar = document.getElementById('global-sidebar');
        const isSidebarOpen = sidebar && sidebar.classList.contains('open');

        // Swipe right from the left screen edge to open menu
        if (!isSidebarOpen && touchStartX < 40 && swipeDistance > minSwipeDistance) {
            if (typeof toggleMobileSidebar === 'function') toggleMobileSidebar();
        }

        // Swipe left to close an open menu
        if (isSidebarOpen && swipeDistance < -minSwipeDistance) {
            if (typeof toggleMobileSidebar === 'function') toggleMobileSidebar();
        }
    }, { passive: true });
}

// Bootstrap execution sequence on page load
window.addEventListener('DOMContentLoaded', () => {
    const systemThemeCache = localStorage.getItem('dh-selected-theme');
    if (systemThemeCache === 'dark' || (!systemThemeCache && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    compileArchivePlatform();
    compileGeometricStarfield();
    initializeTouchGestures();
    
    if (typeof runLoadingScreenEngine === 'function') {
        runLoadingScreenEngine();
    }

    if (typeof processDeepLinkInitialization === 'function') {
        processDeepLinkInitialization();
    }

    // --- CAPACITOR ANDROID BACK GESTURE SUPPORT ---
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        const { App } = window.Capacitor.Plugins;
        App.addListener('backButton', ({ canGoBack }) => {
            const activeSidebar = document.querySelector('aside.open');
            const activeOverlay = document.querySelector('.sidebar-overlay.visible');

            // 1. Close sidebar menu if open
            if (activeSidebar || activeOverlay) {
                if (typeof toggleMobileSidebar === 'function') {
                    toggleMobileSidebar();
                }
            } 
            // 2. Navigate back in web history if possible
            else if (canGoBack) {
                window.history.back();
            } 
            // 3. Otherwise minimize app to home screen
            else {
                App.minimizeApp();
            }
        });
    }
});