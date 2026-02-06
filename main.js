document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const startContainer = document.querySelector('.start-container');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const uploadOptions = document.querySelector('.upload-options');
    const uploadBtn = document.getElementById('uploadBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const imageInput = document.getElementById('imageInput');
    const cameraView = document.getElementById('cameraView');
    const video = document.getElementById('video');
    const captureBtn = document.getElementById('captureBtn');
    const cameraBackBtn = document.getElementById('cameraBackBtn');
    const cameraError = document.getElementById('cameraError');
    const cameraErrorText = document.getElementById('cameraErrorText');
    const cameraErrorBackBtn = document.getElementById('cameraErrorBackBtn');
    const capturedImage = document.getElementById('capturedImage');
    const startBtn = document.getElementById('startBtn');
    const status = document.getElementById('status');
    const confirmationArea = document.getElementById('confirmationArea');
    const wordList = document.getElementById('wordList');
    const confirmWordsBtn = document.getElementById('confirmWordsBtn');
    const backToUploadBtn = document.getElementById('backToUploadBtn');
    const mainPage = document.getElementById('mainPage');
    const gameArea = document.getElementById('gameArea');
    const gameBackBtn = document.getElementById('gameBackBtn');
    const resultsArea = document.getElementById('resultsArea');
    const audioPlayer = document.getElementById('audioPlayer');
    const wordInput = document.getElementById('wordInput');
    const feedbackIcon = document.getElementById('feedbackIcon');
    const submitBtn = document.getElementById('submitBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const totalTimeTaken = document.getElementById('totalTimeTaken');
    const backToStartBtn = document.getElementById('backToStartBtn');
    const pastTests = document.getElementById('pastTests');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackForm = document.getElementById('feedbackForm');
    const cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');

    let words = [];
    let currentWordIndex = 0;
    let timerInterval;
    let seconds = 0;
    let results = [];

    // --- UI Navigation ---
    getStartedBtn.addEventListener('click', () => {
        startContainer.style.display = 'none';
        uploadOptions.style.display = 'flex';
    });

    uploadBtn.addEventListener('click', () => imageInput.click());

    cameraBtn.addEventListener('click', () => {
        mainPage.style.display = 'none';
        cameraView.style.display = 'block';
        startCamera();
    });

    cameraBackBtn.addEventListener('click', () => {
        cameraView.style.display = 'none';
        mainPage.style.display = 'block';
        uploadOptions.style.display = 'flex';
        stopCamera();
    });

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                capturedImage.src = e.target.result;
                capturedImage.style.display = 'block';
                startBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });

    startBtn.addEventListener('click', () => {
        status.textContent = 'Recognizing text...';
        Tesseract.recognize(
            capturedImage.src,
            'eng',
            {
                logger: m => console.log(m)
            }
        ).then(({ data: { text } }) => {
            words = text.split(/\s+/).filter(word => word.length > 1);
            status.textContent = 'Text recognized!';
            displayWordConfirmation(words);
        });
    });

    confirmWordsBtn.addEventListener('click', () => {
        mainPage.style.display = 'none';
        confirmationArea.style.display = 'none';
        gameArea.style.display = 'block';
        startTest();
    });

    backToUploadBtn.addEventListener('click', () => {
        confirmationArea.style.display = 'none';
        uploadOptions.style.display = 'flex';
        imageInput.value = '';
        capturedImage.style.display = 'none';
        startBtn.disabled = true;
    });

    gameBackBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to end the current test?')) {
            clearInterval(timerInterval);
            gameArea.style.display = 'none';
            mainPage.style.display = 'block';
        }
    });

    submitBtn.addEventListener('click', checkWord);
    wordInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            checkWord();
        }
    });

    backToStartBtn.addEventListener('click', () => {
        resultsArea.style.display = 'none';
        mainPage.style.display = 'block';
        startContainer.style.display = 'block';
        uploadOptions.style.display = 'none';
        imageInput.value = '';
        capturedImage.style.display = 'none';
        startBtn.disabled = true;
    });

    // --- Camera Logic ---
    function startCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;
                    video.play();
                })
                .catch(err => {
                    console.error('Error accessing camera: ', err);
                    cameraErrorText.textContent = 'Could not access the camera. Please ensure you have a camera connected and have granted permission.';
                    cameraView.style.display = 'none';
                    cameraError.style.display = 'block';
                });
        }
    }

    function stopCamera() {
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
    }

    captureBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedImage.src = canvas.toDataURL('image/png');
        capturedImage.style.display = 'block';
        stopCamera();
        cameraView.style.display = 'none';
        mainPage.style.display = 'block';
        startBtn.disabled = false;
    });

    cameraErrorBackBtn.addEventListener('click', () => {
        cameraError.style.display = 'none';
        mainPage.style.display = 'block';
    });

    // --- Game Logic ---
    function startTest() {
        currentWordIndex = 0;
        results = [];
        seconds = 0;
        timerDisplay.textContent = '00:00';
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
        playWord(words[currentWordIndex]);
    }

    function playWord(word) {
        const utterance = new SpeechSynthesisUtterance(word);
        speechSynthesis.speak(utterance);
    }

    function checkWord() {
        const typedWord = wordInput.value.trim();
        const correctWord = words[currentWordIndex];
        const isCorrect = typedWord.toLowerCase() === correctWord.toLowerCase();

        feedbackIcon.className = ''; // Clear previous classes
        if (isCorrect) {
            feedbackIcon.classList.add('fas', 'fa-check-circle');
        } else {
            feedbackIcon.classList.add('fas', 'fa-times-circle');
        }

        results.push({ word: correctWord, typed: typedWord, isCorrect });

        setTimeout(() => {
            feedbackIcon.className = '';
            wordInput.value = '';
            currentWordIndex++;
            if (currentWordIndex < words.length) {
                playWord(words[currentWordIndex]);
            } else {
                endTest();
            }
        }, 1000);
    }

    function endTest() {
        clearInterval(timerInterval);
        gameArea.style.display = 'none';
        resultsArea.style.display = 'block';
        totalTimeTaken.textContent = timerDisplay.textContent;
        displayResults();
        saveTestHistory();
    }

    // --- Display and History ---
    function displayWordConfirmation(wordArray) {
        wordList.innerHTML = '';
        wordArray.forEach((word, index) => {
            const wordEl = document.createElement('div');
            wordEl.className = 'word-item';
            wordEl.innerHTML = `
                <span>${word}</span>
                <button class="delete-word-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
            `;
            wordList.appendChild(wordEl);
        });

        document.querySelectorAll('.delete-word-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const wordToRemove = e.currentTarget.parentElement.querySelector('span').textContent;
                words = words.filter(w => w !== wordToRemove);
                e.currentTarget.parentElement.remove();
            });
        });

        confirmationArea.style.display = 'block';
    }

    function displayResults() {
        const tableBody = resultsArea.querySelector('table tbody') || document.createElement('tbody');
        if (!resultsArea.querySelector('table')) {
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            thead.innerHTML = '<tr><th>Word</th><th>Your Answer</th><th></th></tr>';
            table.appendChild(thead);
            table.appendChild(tableBody);
            resultsArea.appendChild(table);
        }
        tableBody.innerHTML = '';

        results.forEach(result => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${result.word}</td>
                <td class="${!result.isCorrect ? 'crossed-out' : ''}">${result.typed}</td>
                <td><i class="fas ${result.isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i></td>
            `;
        });
    }

    function saveTestHistory() {
        const history = JSON.parse(localStorage.getItem('spellingHistory')) || [];
        const testRecord = {
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            duration: timerDisplay.textContent,
            results: results
        };
        history.push(testRecord);
        localStorage.setItem('spellingHistory', JSON.stringify(history));
        displayPastTests();
    }

    function displayPastTests() {
        const history = JSON.parse(localStorage.getItem('spellingHistory')) || [];
        pastTests.innerHTML = '<h3>Past Tests</h3>';
        if (history.length > 0) {
            history.forEach((test, index) => {
                const correctCount = test.results.filter(r => r.isCorrect).length;
                const totalCount = test.results.length;

                const testEl = document.createElement('div');
                testEl.className = 'past-test';
                testEl.innerHTML = `
                    <div class="past-test-info">
                        <h4>Test #${index + 1}</h4>
                        <p>Score: ${correctCount}/${totalCount}</p>
                    </div>
                    <div class="past-test-actions">
                        <button class="review-btn">Review</button>
                        <button class="retake-btn">Retake</button>
                    </div>
                `;
                testEl.querySelector('.review-btn').addEventListener('click', () => showPastTestResults(test));
                testEl.querySelector('.retake-btn').addEventListener('click', () => retakeTest(test));
                pastTests.appendChild(testEl);
            });
            clearHistoryBtn.style.display = 'block';
        } else {
            pastTests.innerHTML += '<p>No past tests found.</p>';
            clearHistoryBtn.style.display = 'none';
        }
    }

    function showPastTestResults(test) {
        results = test.results;
        totalTimeTaken.textContent = test.duration;
        mainPage.style.display = 'none';
        resultsArea.style.display = 'block';
        displayResults();
    }

    function retakeTest(test) {
        words = test.results.map(r => r.word);
        mainPage.style.display = 'none';
        gameArea.style.display = 'block';
        resultsArea.style.display = 'none';
        startTest();
    }

    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('spellingHistory');
        displayPastTests();
    });

    // --- Feedback Form ---
    feedbackBtn.addEventListener('click', () => {
        feedbackForm.style.display = 'block';
        mainPage.style.display = 'none';
    });

    cancelFeedbackBtn.addEventListener('click', () => {
        feedbackForm.style.display = 'none';
        mainPage.style.display = 'block';
    });

    // Initial Load
    displayPastTests();
});