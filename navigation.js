function switchArchiveTab(targetPanelId, navigationMenuAnchor, preventHistoryPush = false) {
    // 1. Deactivate all active historical panels
    const structuralPanels = document.querySelectorAll('.archive-panel');
    structuralPanels.forEach(panel => panel.classList.remove('active'));

    // 2. Clear active sidebar link typography highlights
    const navigationMenuItems = document.querySelectorAll('.nav-item');
    navigationMenuItems.forEach(item => item.classList.remove('active'));

    // 3. Mount and display target panel coordinates
    const destinationPanel = document.getElementById(targetPanelId);
    if (destinationPanel) destinationPanel.classList.add('active');

    // 4. Fallback tracking: Find navigation menu anchor if not explicitly provided
    if (!navigationMenuAnchor && targetPanelId) {
        const sidebarLinks = document.querySelectorAll('.nav-item');
        sidebarLinks.forEach(link => {
            const clickAttr = link.getAttribute('onclick');
            if (clickAttr && clickAttr.includes(targetPanelId)) {
                navigationMenuAnchor = link;
            }
        });
    }

    if (navigationMenuAnchor) {
        navigationMenuAnchor.classList.add('active');
    }

    // 5. Update browser window location hash to support swipe gestures and back buttons
    if (!preventHistoryPush && targetPanelId) {
        window.location.hash = targetPanelId;
    }

    // 6. Close mobile menu sidebar overlays
    document.getElementById('global-sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('visible');

    // 7. Smoothly scroll viewport back to top coordinates
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Global Browser Engine Listener for Swipe Left Actions & Navigation Buttons
window.addEventListener('hashchange', () => {
    const activeRouteHash = window.location.hash.replace('#', '');
    if (activeRouteHash) {
        switchArchiveTab(activeRouteHash, null, true);
    } else {
        switchArchiveTab('panel-landing', null, true);
    }
});

// Structural deep-linking verification on initialization
function processDeepLinkInitialization() {
    const executionHash = window.location.hash.replace('#', '');
    if (executionHash) {
        switchArchiveTab(executionHash, null, true);
    } else {
        switchArchiveTab('panel-landing', null, true);
    }
}

function triggerWidgetNavigation(panelId) {
    switchArchiveTab(panelId, null);
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('global-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('visible');
    }
}