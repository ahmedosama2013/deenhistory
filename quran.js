// Quran API Loader & Audio Player for DeenHistory
let quranSurahsCache = null;
let currentSurahAudioQueue = [];
let currentAudioIndex = 0;
let activeAudioElement = null;
let isPlayingFullSurah = false;

// Stop any playing audio when leaving or switching verses
function stopQuranAudio() {
    if (activeAudioElement) {
        activeAudioElement.pause();
        activeAudioElement.currentTime = 0;
        activeAudioElement = null;
    }
    isPlayingFullSurah = false;
    document.querySelectorAll('.verse-card-active').forEach(el => {
        el.classList.remove('verse-card-active');
    });
    const playBtn = document.getElementById('btn-play-full-surah');
    if (playBtn) playBtn.innerHTML = '▶ Play Entire Surah';
}

// Fetch and display list of all 114 Surahs
async function loadQuranSurahList() {
    stopQuranAudio();
    const container = document.getElementById('quran-injection-point');
    if (!container) return;

    try {
        if (!quranSurahsCache) {
            const res = await fetch('https://api.alquran.cloud/v1/surah');
            const data = await res.json();
            quranSurahsCache = data.data;
        }

        let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-top: 20px;">
        `;

        quranSurahsCache.forEach(surah => {
            html += `
                <div class="record-card" style="cursor: pointer; transition: transform 0.2s;" onclick="loadSurahVerses(${surah.number}, '${surah.englishName.replace(/'/g, "\\'")}')" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="badge">${surah.number}</span>
                        <span style="font-family: 'Amiri', serif; font-size: 1.2rem; color: var(--accent-gold);">${surah.name}</span>
                    </div>
                    <div class="record-title" style="margin-top: 10px; font-size: 1.1rem;">${surah.englishName}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${surah.englishNameTranslation} • ${surah.numberOfAyahs} Verses (${surah.revelationType})</div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<div style="color:var(--danger-text); padding: 20px;">Failed to load Quran index. Please check your internet connection.</div>`;
    }
}

// Play a single verse MP3
function playSingleVerse(audioUrl, verseElementId) {
    stopQuranAudio();
    activeAudioElement = new Audio(audioUrl);
    
    const cardNode = document.getElementById(verseElementId);
    if (cardNode) cardNode.classList.add('verse-card-active');

    activeAudioElement.play();
    activeAudioElement.onended = () => {
        if (cardNode) cardNode.classList.remove('verse-card-active');
    };
}

// Play the entire Surah sequentially
function togglePlayFullSurah() {
    const playBtn = document.getElementById('btn-play-full-surah');
    if (isPlayingFullSurah) {
        stopQuranAudio();
        return;
    }

    if (!currentSurahAudioQueue || currentSurahAudioQueue.length === 0) return;

    isPlayingFullSurah = true;
    currentAudioIndex = 0;
    if (playBtn) playBtn.innerHTML = '⏹ Stop Recitation';
    playNextVerseInQueue();
}

function playNextVerseInQueue() {
    if (!isPlayingFullSurah || currentAudioIndex >= currentSurahAudioQueue.length) {
        stopQuranAudio();
        return;
    }

    const verseData = currentSurahAudioQueue[currentAudioIndex];
    document.querySelectorAll('.verse-card-active').forEach(el => el.classList.remove('verse-card-active'));
    
    const currentCard = document.getElementById(`verse-card-${verseData.numberInSurah}`);
    if (currentCard) {
        currentCard.classList.add('verse-card-active');
        currentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    activeAudioElement = new Audio(verseData.audio);
    activeAudioElement.play();
    activeAudioElement.onended = () => {
        currentAudioIndex++;
        playNextVerseInQueue();
    };
}

// Fetch and display verses with real MP3 audio edition (Mishary Rashid Alafasy)
async function loadSurahVerses(surahNumber, englishName) {
    stopQuranAudio();
    const container = document.getElementById('quran-injection-point');
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
            Loading Surah ${englishName} with MP3 audio...
        </div>
    `;

    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,ar.alafasy`);
        const json = await response.json();

        const arabicVerses = json.data[0].ayahs;
        const englishVerses = json.data[1].ayahs;
        const audioVerses = json.data[2].ayahs;

        currentSurahAudioQueue = audioVerses;

        // Centered Header Container Layout
        let html = `
            <div style="margin-bottom: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: 100%;">
                <div style="width: 100%; display: flex; justify-content: flex-start; margin-bottom: 12px;">
                    <button class="btn-action" onclick="loadQuranSurahList()">← Back to All Surahs</button>
                </div>
                <h2 class="panel-heading" style="margin-bottom: 6px; text-align: center; width: 100%;">${json.data[0].englishName} (${json.data[0].name})</h2>
                <p class="panel-sub-heading" style="margin-bottom: 16px; color: var(--text-secondary); text-align: center; width: 100%;">${json.data[0].englishNameTranslation} • ${json.data[0].numberOfAyahs} Verses • Reciter: Mishary Rashid Alafasy</p>
                <div>
                    <button id="btn-play-full-surah" class="btn-action" style="background: var(--accent-primary); color: #fff; padding: 12px 24px; font-size: 1rem; border-radius: var(--radius-pill); cursor: pointer; display: inline-block;" onclick="togglePlayFullSurah()">▶ Play Entire Surah</button>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 20px;">
        `;

        // Display separate Bismillah header for all surahs except Fatihah (1) and At-Tawbah (9)
        if (surahNumber !== 1 && surahNumber !== 9) {
            html += `
                <div class="record-card" style="text-align: center; font-family: 'Amiri', serif; font-size: 1.8rem; color: var(--accent-gold); padding: 20px;">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>
            `;
        }

        arabicVerses.forEach((verse, index) => {
            const engText = englishVerses[index] ? englishVerses[index].text : '';
            const mp3Url = audioVerses[index] ? audioVerses[index].audio : '';
            
            let arText = verse.text;
            
            // Robust Bismillah cleaner for Verse 1 across all variations (Surah != 1 & Surah != 9)
            if (surahNumber !== 1 && surahNumber !== 9 && verse.numberInSurah === 1) {
                arText = arText
                    .replace(/^[\u0610-\u061A\u064B-\u065F\u0670-\u0672\s]*بِسْمِ[\s\S]*?الرَّحِيمِ[\s]*/u, '')
                    .replace(/بِسْمِ\s*[ٱا]للَّ?هِ\s*[ٱا]لرَّحْمَ[ٰا]نِ\s*[ٱا]لرَّحِيمِ/gu, '')
                    .replace(/بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ/g, '')
                    .trim();

                // Fallback word token check if any subtle character differences remain
                if (arText.startsWith('بِسْمِ') || arText.includes('بِسْمِ اللَّهِ')) {
                    const words = arText.split(/\s+/);
                    if (words.length > 4) {
                        arText = words.slice(4).join(' ');
                    }
                }
            }

            html += `
                <div id="verse-card-${verse.numberInSurah}" class="record-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span class="badge">Verse ${verse.numberInSurah}</span>
                        <button class="btn-action" style="padding: 4px 12px; font-size: 0.8rem;" onclick="playSingleVerse('${mp3Url}', 'verse-card-${verse.numberInSurah}')">🔊 Listen</button>
                    </div>
                    <div style="font-family: 'Amiri', serif; font-size: 1.7rem; direction: rtl; text-align: right; line-height: 2.2; color: var(--text-primary); margin-bottom: 12px;">
                        ${arText} ﴿${verse.numberInSurah}﴾
                    </div>
                    <div style="color: var(--text-secondary); font-size: 1rem; line-height: 1.6;">
                        ${engText}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        container.innerHTML = `<div style="color:var(--danger-text); padding: 20px;">Failed to load Surah verses and audio. Please try again.</div>`;
    }
}

// Auto-initialize Quran index when page loads
window.addEventListener('DOMContentLoaded', () => {
    loadQuranSurahList();
});