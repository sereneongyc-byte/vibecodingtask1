const mainPage = document.getElementById('mainPage');
const startBtn = document.getElementById('startBtn');
const imageInput = document.getElementById('imageInput');
const gameArea = document.getElementById('gameArea');
const audioPlayer = document.getElementById('audioPlayer');
const wordInput = document.getElementById('wordInput');
const submitBtn = document.getElementById('submitBtn');
const resultsArea = document.getElementById('resultsArea');
const status = document.getElementById('status');
const newTestBtn = document.getElementById('newTestBtn');
const pastTestsContainer = document.getElementById('pastTests');
const themeToggle = document.getElementById('theme-toggle');

const uploadBtn = document.getElementById('uploadBtn');
const cameraBtn = document.getElementById('cameraBtn');
const feedbackBtn = document.getElementById('feedbackBtn');
const cameraView = document.getElementById('cameraView');
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const capturedImage = document.getElementById('capturedImage');
const cameraError = document.getElementById('cameraError');
const cameraErrorText = document.getElementById('cameraErrorText');
const cameraErrorBackBtn = document.getElementById('cameraErrorBackBtn');

const confirmationArea = document.getElementById('confirmationArea');
const wordList = document.getElementById('wordList');
const confirmWordsBtn = document.getElementById('confirmWordsBtn');
const retryExtractionBtn = document.getElementById('retryExtractionBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const feedbackForm = document.getElementById('feedbackForm');
const cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');

let words = [];
let userAnswers = [];
let currentWordIndex = 0;
let imageForTesseract = null;

let startTime;
let timerInterval;
const timerDisplay = document.getElementById('timerDisplay');

document.addEventListener('DOMContentLoaded', () => {
    loadAndDisplayPastTests();
    const isNightMode = localStorage.getItem('nightMode') === 'true';
    if (isNightMode) {
        document.body.classList.add('night-mode');
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
    const isNightMode = document.body.classList.contains('night-mode');
    localStorage.setItem('nightMode', isNightMode);
});

feedbackBtn.addEventListener('click', () => {
    mainPage.style.display = 'none';
    feedbackForm.style.display = 'block';
});

cancelFeedbackBtn.addEventListener('click', () => {
    mainPage.style.display = 'block';
    feedbackForm.style.display = 'none';
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all past test history? This action cannot be undone.")) {
        localStorage.removeItem('pastSpellingTests');
        loadAndDisplayPastTests();
    }
});

function getPastTests() {
    let pastTests = JSON.parse(localStorage.getItem('pastSpellingTests')) || [];
    // Migration for very old data structure: array of word arrays
    if (pastTests.length > 0 && Array.isArray(pastTests[0])) {
        pastTests = pastTests.map(wordList => ({ words: wordList, lastAnswers: [], timeTaken: null }));
        localStorage.setItem('pastSpellingTests', JSON.stringify(pastTests));
    }
    // Migration for old data structure: array of objects without timeTaken
    else if (pastTests.length > 0 && !pastTests[0].hasOwnProperty('timeTaken')) {
        pastTests = pastTests.map(test => ({ ...test, timeTaken: null }));
        localStorage.setItem('pastSpellingTests', JSON.stringify(pastTests));
    }
    return pastTests;
}

function loadAndDisplayPastTests() {
    const pastTests = getPastTests();
    pastTestsContainer.innerHTML = '';
    if (pastTests.length > 0) {
        clearHistoryBtn.style.display = 'block';
        const title = document.createElement('h2');
        title.textContent = 'Past Tests';
        pastTestsContainer.appendChild(title);

        pastTests.forEach((test, index) => {
            const testDiv = document.createElement('div');
            testDiv.className = 'past-test';
            let buttonsHTML = `<button class="redoBtn" data-test-index="${index}">Redo Test</button>`;
            if (test.lastAnswers && test.lastAnswers.length > 0) {
                buttonsHTML += ` <button class="reviewBtn" data-test-index="${index}">Review Results</button>`;
            }

            testDiv.innerHTML = `
                <p>Test ${index + 1}: ${test.words.join(', ')}</p>
                ${buttonsHTML}
            `;
            pastTestsContainer.appendChild(testDiv);
        });
    } else {
        clearHistoryBtn.style.display = 'none';
    }
}

pastTestsContainer.addEventListener('click', (event) => {
    const pastTests = getPastTests();
    if (event.target.classList.contains('redoBtn')) {
        const testIndex = event.target.dataset.testIndex;
        const wordsToRedo = pastTests[testIndex].words;
        startGame(wordsToRedo);
    }
    if (event.target.classList.contains('reviewBtn')) {
        const testIndex = event.target.dataset.testIndex;
        const testToReview = pastTests[testIndex];
        mainPage.style.display = 'none';
        displayResultsTable(testToReview.words, testToReview.lastAnswers, testToReview.timeTaken);
        resultsArea.style.display = 'block';
        newTestBtn.style.display = 'block';
    }
});


uploadBtn.addEventListener('click', () => {
    imageInput.click();
});

cameraBtn.addEventListener('click', async () => {
    imageForTesseract = null;
    imageInput.value = '';
    capturedImage.src = '';
    capturedImage.style.display = 'none';
    startBtn.disabled = true;

    cameraView.style.display = 'block';
    uploadBtn.style.display = 'none';
    cameraBtn.style.display = 'none';

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const videoConstraints = {
        video: {
            facingMode: isMobile ? { exact: 'environment' } : 'user'
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
        video.srcObject = stream;
        video.play();
        video.style.display = 'block';
        captureBtn.style.display = 'block';
        cameraError.style.display = 'none';
    } catch (err) {
        console.error("Error accessing camera: ", err);
        video.style.display = 'none';
        captureBtn.style.display = 'none';
        cameraError.style.display = 'block';
        if (err.name === 'NotAllowedError') {
            cameraErrorText.innerHTML = "Camera access was denied. To use this feature, you'll need to go to your browser's settings and allow this page to access your camera.<br><br>Look for a camera icon in your address bar.";
        } else {
            cameraErrorText.textContent = `Could not access the camera. Error: ${err.name}. Please try again.`;
        }
    }
});

cameraErrorBackBtn.addEventListener('click', () => {
    hideCamera();
});

imageInput.addEventListener('change', () => {
    if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        imageForTesseract = file;
        capturedImage.src = URL.createObjectURL(file);
        capturedImage.style.display = 'block';
        startBtn.disabled = false;
        hideCamera();
    }
});

captureBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
        imageForTesseract = blob;
        capturedImage.src = URL.createObjectURL(blob);
        capturedImage.style.display = 'block';
        startBtn.disabled = false;
        hideCamera();
    }, 'image/png');
});

function hideCamera() {
    cameraView.style.display = 'none';
    uploadBtn.style.display = 'inline-block';
    cameraBtn.style.display = 'inline-block';
    cameraError.style.display = 'none';
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

function resetImageSelection() {
    imageForTesseract = null;
    imageInput.value = '';
    capturedImage.src = '';
    capturedImage.style.display = 'none';
    startBtn.disabled = true;
    hideCamera();
}

startBtn.addEventListener('click', async () => {
    if (imageForTesseract) {
        status.textContent = 'Recognizing words in the image...';
        uploadBtn.style.display = 'none';
        cameraBtn.style.display = 'none';
        capturedImage.style.display = 'none';
        startBtn.style.display = 'none';
        pastTestsContainer.style.display = 'none';

        try {
            const { data: { text } } = await Tesseract.recognize(
                imageForTesseract,
                'eng',
                { logger: m => console.log(m) }
            );
            status.textContent = '';
            const newWords = text.trim().split(/\s+/).filter(w => w.length > 0);
            if (newWords.length > 0) {
                showWordConfirmation(newWords);
            } else {
                status.textContent = 'Could not find any words in the image. Please try again.';
                resetUI();
            }
        } catch (err) {
            console.error(err);
            status.textContent = `An error occurred during word recognition: ${err.message}`;
            resetUI();
        }
    }
});

function showWordConfirmation(words) {
    wordList.innerHTML = '';
    words.forEach(word => {
        const wordWrapper = document.createElement('div');
        wordWrapper.className = 'word-wrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = word;

        const crossOutBtn = document.createElement('button');
        crossOutBtn.textContent = 'X';
        crossOutBtn.className = 'cross-out-btn';
        crossOutBtn.addEventListener('click', () => {
            input.classList.toggle('crossed-out');
        });

        wordWrapper.appendChild(input);
        wordWrapper.appendChild(crossOutBtn);
        wordList.appendChild(wordWrapper);
    });
    confirmationArea.style.display = 'block';
}

confirmWordsBtn.addEventListener('click', () => {
    const confirmedWords = [];
    const inputs = wordList.getElementsByTagName('input');
    for (let input of inputs) {
        if (!input.classList.contains('crossed-out')) {
            const word = input.value.trim();
            if (word) {
                confirmedWords.push(word);
            }
        }
    }

    if (confirmedWords.length > 0) {
        saveTest(confirmedWords);
        startGame(confirmedWords);
        confirmationArea.style.display = 'none';
    } else {
        status.textContent = "Please confirm at least one word.";
    }
});

retryExtractionBtn.addEventListener('click', () => {
    confirmationArea.style.display = 'none';
    resetImageSelection();
    resetUI();
});


function resetUI() {
    uploadBtn.style.display = 'inline-block';
    cameraBtn.style.display = 'inline-block';
    startBtn.style.display = 'inline-block';
    pastTestsContainer.style.display = 'block';
    startBtn.disabled = true; // Disable start until a new image is selected
}

function saveTest(wordList) {
    const pastTests = getPastTests();
    const isDuplicate = pastTests.some(test => JSON.stringify(test.words) === JSON.stringify(wordList));
    if (!isDuplicate) {
        pastTests.push({ words: wordList, lastAnswers: [], timeTaken: null });
        localStorage.setItem('pastSpellingTests', JSON.stringify(pastTests));
    }
}

function saveLatestTestResult(wordList, answerList, timeTaken) {
    const pastTests = getPastTests();
    const testIndex = pastTests.findIndex(test => JSON.stringify(test.words) === JSON.stringify(wordList));
    if (testIndex !== -1) {
        pastTests[testIndex].lastAnswers = answerList;
        pastTests[testIndex].timeTaken = timeTaken;
        localStorage.setItem('pastSpellingTests', JSON.stringify(pastTests));
    }
}

function startGame(wordList) {
    words = wordList;
    userAnswers = [];
    currentWordIndex = 0;

    mainPage.style.display = 'none';
    gameArea.style.display = 'block';
    resultsArea.style.display = 'none';
    newTestBtn.style.display = 'none';
    confirmationArea.style.display = 'none';

    startTime = Date.now();
    updateTimerDisplay(); // Display 00:00 immediately
    timerInterval = setInterval(updateTimerDisplay, 1000);

    nextWord();
}

submitBtn.addEventListener('click', () => {
    checkWord();
});

wordInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        checkWord();
    }
});

newTestBtn.addEventListener('click', () => {
    mainPage.style.display = 'block';
    uploadBtn.style.display = 'inline-block';
    cameraBtn.style.display = 'inline-block';
    startBtn.style.display = 'inline-block';
    pastTestsContainer.style.display = 'block';

    resultsArea.style.display = 'none';
    resultsArea.innerHTML = '';
    newTestBtn.style.display = 'none';
    resetImageSelection();
    loadAndDisplayPastTests();
    startBtn.disabled = true; // Re-disable start button
});

function speakWord(word) {
    const utterance = new SpeechSynthesisUtterance(`Spell the word: ${word}`);
    window.speechSynthesis.speak(utterance);
}

function nextWord() {
    if (currentWordIndex < words.length) {
        const word = words[currentWordIndex];
        speakWord(word);
        wordInput.value = '';
    } else {
        displayResults();
    }
}

function checkWord() {
    const typedWord = wordInput.value.trim();
    userAnswers.push(typedWord);
    currentWordIndex++;
    nextWord();
}

function displayResults() {
    gameArea.style.display = 'none';
    resultsArea.style.display = 'block';
    newTestBtn.style.display = 'block';

    clearInterval(timerInterval);
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    saveLatestTestResult(words, userAnswers, formattedTime);
    displayResultsTable(words, userAnswers, formattedTime);
    loadAndDisplayPastTests();
    timerDisplay.textContent = '00:00'; // Reset timer display
}

function displayResultsTable(wordList, answerList, timeTaken) {
    let score = 0;
    let table = '<table><tr><th>Original Word</th><th>Your Answer</th><th>Result</th></tr>';

    for (let i = 0; i < wordList.length; i++) {
        const originalWord = wordList[i];
        const userAnswer = answerList[i] || "";
        const isCorrect = originalWord.toLowerCase() === userAnswer.toLowerCase();
        if (isCorrect) {
            score++;
        }
        table += `<tr><td>${originalWord}</td><td>${userAnswer}</td><td>${isCorrect ? 'Correct' : 'Wrong'}</td></tr>`;
    }

    table += '</table>';
    let timeTakenHTML = '';
    if (timeTaken) {
        timeTakenHTML = `<p>Time taken: ${timeTaken}</p>`;
    }
    resultsArea.innerHTML = `<h2>Results</h2><p>Your score: ${score}/${wordList.length}</p>${timeTakenHTML}${table}`;
}

function updateTimerDisplay() {
    const elapsedTime = Date.now() - startTime;
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    timerDisplay.textContent = formattedTime;
}