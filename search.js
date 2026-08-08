let globalSearchMatchesCache = [];

function handleSearchEngineInput(query) {
    const autocompletePanel = document.getElementById('search-autocomplete-panel');
    if (!query.trim()) {
        autocompletePanel.style.display = 'none';
        return;
    }

    const searchTokens = query.toLowerCase().split(/\s+/);
    let matches = [];

    function scanDataset(array, categoryName, panelTarget) {
        array.forEach(item => {
            const matchedName = searchTokens.every(t => item.name.toLowerCase().includes(t));
            const matchedNarrative = searchTokens.every(t => (item.narrative || '').toLowerCase().includes(t));
            if (matchedName || matchedNarrative) {
                matches.push({
                    name: item.name,
                    category: categoryName,
                    targetPanel: panelTarget,
                    rawObject: item
                });
            }
        });
    }

    // Scan standard databases
    if (typeof prophetsDatabase !== 'undefined') scanDataset(prophetsDatabase, "Prophet", "panel-prophets");
    if (typeof seerahDatabase !== 'undefined') scanDataset(seerahDatabase, "Seerah Phase", "panel-seerah");
    if (typeof sahabahDatabase !== 'undefined') scanDataset(sahabahDatabase, "Companion", "panel-sahabah");
    if (typeof battlesDatabase !== 'undefined') scanDataset(battlesDatabase, "Battle", "panel-battles");
    if (typeof empiresDatabase !== 'undefined') scanDataset(empiresDatabase, "Empire", "panel-eras");
    if (typeof tyrantsDatabase !== 'undefined') scanDataset(tyrantsDatabase, "Tyrant / Broken Empire", "panel-opponents");
    if (typeof duasDatabase !== 'undefined') scanDataset(duasDatabase, "Prophetic Dua", "panel-duas");
    if (typeof tenSignsDatabase !== 'undefined') scanDataset(tenSignsDatabase, "Major Sign of Judgment Day", "panel-tensigns");

    // Scan Quran Surahs cache if available
    if (typeof quranSurahsCache !== 'undefined' && quranSurahsCache) {
        quranSurahsCache.forEach(surah => {
            const matchedSurah = searchTokens.every(t => surah.name.toLowerCase().includes(t) || surah.englishName.toLowerCase().includes(t));
            if (matchedSurah) {
                matches.push({
                    name: `Surah ${surah.number}. ${surah.englishName} (${surah.name})`,
                    category: "Quran Surah",
                    targetPanel: "panel-quran",
                    rawObject: surah
                });
            }
        });
    }

    globalSearchMatchesCache = matches;

    if (matches.length > 0) {
        autocompletePanel.innerHTML = matches.slice(0, 8).map((m, idx) => `
            <div class="autocomplete-item" onclick="displayFullSearchResultCard(${idx})">
                <span class="autocomplete-title">${m.name}</span>
                <span class="autocomplete-badge">${m.category}</span>
            </div>
        `).join('');
        autocompletePanel.style.display = 'block';
    } else {
        autocompletePanel.innerHTML = `<div class="autocomplete-item" style="color:var(--text-secondary);">No matching archival records found.</div>`;
        autocompletePanel.style.display = 'block';
    }
}

function displayFullSearchResultCard(index) {
    const found = globalSearchMatchesCache[index];
    if (!found) return;

    const container = document.getElementById('search-results-injection-point');
    const countLabel = document.getElementById('search-results-count');
    if (countLabel) countLabel.innerText = `1 record displayed for: ${found.name}`;

    const item = found.rawObject;
    
    container.innerHTML = `
        <div class="record-card">
            <div class="record-title">
                ${item.name || found.name}
                <div class="badge-container">
                    <span class="badge">Archival Discovery</span>
                    <span class="badge gold">${item.titleBadge || found.category}</span>
                </div>
            </div>
            <div class="record-meta-callout">${item.metaCallout || item.translation || ''}</div>
            <div class="section-divider">Historical Narrative</div>
            <p class="record-narrative">${item.narrative || item.arabic || ''}</p>
            ${item.chronology ? `
                <div class="section-divider">Chronological Breakdown</div>
                <ul class="chronology-list">
                    ${item.chronology.map(c => `<li class="chronology-step">${c}</li>`).join('')}
                </ul>
            ` : ''}
            ${item.lessons ? `
                <div class="insight-box">
                    <div class="insight-box-title">Spiritual Guidance</div>
                    <ul>
                        ${item.lessons.map(l => `<li>${l}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;

    switchArchiveTab('panel-search-results', null);
}

function clearSearchAndReturn() {
    document.getElementById('global-search-bar').value = '';
    switchArchiveTab('panel-landing', document.getElementById('nav-landing'));
}

function showAutocompletePanel() {
    const val = document.getElementById('global-search-bar').value;
    if (val.trim()) document.getElementById('search-autocomplete-panel').style.display = 'block';
}

function hideAutocompletePanelDelayed() {
    setTimeout(() => {
        document.getElementById('search-autocomplete-panel').style.display = 'none';
    }, 250);
}