function toggleColorScheme() {
    const htmlNode = document.documentElement;
    const operationalTheme = htmlNode.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    htmlNode.setAttribute('data-theme', operationalTheme);
    localStorage.setItem('dh-selected-theme', operationalTheme);
}
