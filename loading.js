function runLoadingScreenEngine() {
    const overlay = document.getElementById('loading-screen');
    const progressBar = document.getElementById('loader-progress');
    const progressNumber = document.getElementById('loader-number');
    const statusText = document.getElementById('loader-status');

    const loadingStatuses = [
        "Verifying Historical Records...",
        "Indexing Prophetic Timelines...",
        "Calibrating Golden Age Breakthrough Matrices...",
        "System Compilation Successful."
    ];

    let currentProgress = 10;

    const progressInterval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 12) + 5;

        if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(progressInterval);

            setTimeout(() => {
                overlay.style.opacity = '0';
                overlay.style.visibility = 'hidden';
            }, 200);
        }

        if (currentProgress > 30 && currentProgress < 60) statusText.innerText = loadingStatuses[1];
        if (currentProgress > 60 && currentProgress < 85) statusText.innerText = loadingStatuses[2];
        if (currentProgress > 85) statusText.innerText = loadingStatuses[3];

        progressBar.style.width = `${currentProgress}%`;
        progressNumber.innerText = `${currentProgress}%`;
    }, 40);
}
