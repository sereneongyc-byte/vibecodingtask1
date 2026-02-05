const startBtn = document.getElementById('startBtn');
const imageInput = document.getElementById('imageInput');
const gameArea = document.getElementById('gameArea');
const audioPlayer = document.getElementById('audioPlayer');
const wordInput = document.getElementById('wordInput');
const submitBtn = document.getElementById('submitBtn');
const resultsArea = document.getElementById('resultsArea');
const status = document.getElementById('status');

let words = [];
let userAnswers = [];
let currentWordIndex = 0;

imageInput.addEventListener('change', () => {
    if (imageInput.files[0]) {
        startBtn.disabled = false;
    }
});

startBtn.addEventListener('click', () => {
    const image = imageInput.files[0];
    if (image) {
        status.textContent = 'Recognizing words in the image...';
        Tesseract.recognize(
            image,
            'eng',
            {
                logger: m => console.log(m)
            }
        ).then(({ data: { text } }) => {
            status.textContent = '';
            words = text.trim().split(/\s+/);
            document.getElementById('imageInput').style.display = 'none';
            startBtn.style.display = 'none';
            gameArea.style.display = 'block';
            nextWord();
        });
    }
});

submitBtn.addEventListener('click', () => {
    checkWord();
});

wordInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        checkWord();
    }
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

    let score = 0;
    let table = '<table><tr><th>Original Word</th><th>Your Answer</th><th>Result</th></tr>';

    for (let i = 0; i < words.length; i++) {
        const originalWord = words[i];
        const userAnswer = userAnswers[i] || "";
        const isCorrect = originalWord.toLowerCase() === userAnswer.toLowerCase();
        if (isCorrect) {
            score++;
        }
        table += `<tr><td>${originalWord}</td><td>${userAnswer}</td><td>${isCorrect ? 'Correct' : 'Wrong'}</td></tr>`;
    }

    table += '</table>';
    resultsArea.innerHTML = `<h2>Results</h2><p>Your score: ${score}/${words.length}</p>${table}`;
}