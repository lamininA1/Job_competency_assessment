document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const gridContainer = document.getElementById('grid-container');
    const startBtn = document.getElementById('start-btn');
    const nToggleCheckbox = document.getElementById('n-toggle-checkbox');
    const scoreSpan = document.getElementById('score');
    const messageP = document.getElementById('message');
    const matchBtn = document.getElementById('match-btn');
    const mismatchBtn = document.getElementById('mismatch-btn');
    const stopBtn = document.getElementById('stop-btn');
    const trialCounter = document.getElementById('trial-counter');

    // Game State Variables
    const gridSize = 12;
    let sequence = [];
    let userResponses = [];
    let evaluatedSteps = []; // To prevent double-counting scores
    let gameInterval;
    let currentIndex = 0;
    let score = 0;
    let n = 2;
    let gameRunning = false;
    let totalSteps = 40;

    // Create grid items
    for (let i = 0; i < gridSize; i++) {
        const item = document.createElement('div');
        item.classList.add('grid-item');
        item.dataset.index = i;
        gridContainer.appendChild(item);
    }
    const gridItems = document.querySelectorAll('.grid-item');

    // Event Listeners
    startBtn.addEventListener('click', startGame);
    matchBtn.addEventListener('click', () => handleUserResponse(true));
    mismatchBtn.addEventListener('click', () => handleUserResponse(false));
    stopBtn.addEventListener('click', endGame);

    document.addEventListener('keydown', (e) => {
        if (!gameRunning || matchBtn.disabled) return;
        if (e.code === 'ArrowLeft') {
            e.preventDefault();
            handleUserResponse(true); // Match
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            handleUserResponse(false); // Mismatch
        }
    });

    matchBtn.disabled = true;
    mismatchBtn.disabled = true;
    stopBtn.disabled = true;

    function startGame() {
        if (gameRunning) return;

        gameRunning = true;
        n = nToggleCheckbox.checked ? 3 : 2;
        sequence = [];
        userResponses = Array(totalSteps).fill(null); // null: no response, true: match, false: mismatch
        evaluatedSteps = Array(totalSteps).fill(false);
        currentIndex = 0;
        score = 0;

        scoreSpan.textContent = '0';
        trialCounter.textContent = `0/${totalSteps}`;
        messageP.textContent = '게임 시작! 집중하세요.';
        messageP.style.color = 'black';
        startBtn.disabled = true;
        nToggleCheckbox.disabled = true;
        matchBtn.disabled = false;
        mismatchBtn.disabled = false;
        stopBtn.disabled = false;

        generateSequence();
        setTimeout(() => {
            gameInterval = setInterval(nextStep, 2000);
        }, 1000);
    }

    function generateSequence() {
        for (let i = 0; i < totalSteps; i++) {
            let newPosition;
            if (i < n || Math.random() > 0.35) {
                do {
                    newPosition = Math.floor(Math.random() * gridSize);
                } while (i > 0 && newPosition === sequence[i - 1]);
            } else {
                newPosition = sequence[i - n];
            }
            sequence.push(newPosition);
        }
    }

    function nextStep() {
        if (currentIndex > 0) {
            evaluateResponse(currentIndex - 1);
        }

        if (currentIndex >= totalSteps) {
            endGame();
            return;
        }

        gridItems.forEach(item => item.classList.remove('active'));
        const currentPosition = sequence[currentIndex];
        gridItems[currentPosition].classList.add('active');

        currentIndex++;
        trialCounter.textContent = `${currentIndex}/${totalSteps}`;
        scoreSpan.textContent = score;
    }

    function handleUserResponse(response) {
        if (!gameRunning || currentIndex === 0) return;
        userResponses[currentIndex - 1] = response;

        const btn = response ? matchBtn : mismatchBtn;
        btn.style.backgroundColor = '#ffc107'; // Highlight button on click
        setTimeout(() => {
            btn.style.backgroundColor = response ? '#007bff' : '#6c757d';
        }, 200);
    }

    function evaluateResponse(stepIndex) {
        if (evaluatedSteps[stepIndex]) return;

        const isMatch = stepIndex >= n && sequence[stepIndex] === sequence[stepIndex - n];
        const userResponse = userResponses[stepIndex];

        // Correct if user identified the state correctly, or if user correctly identified no-match (by not responding)
        if ((isMatch && userResponse === true) || (!isMatch && userResponse === false)) {
            score++;
        }

        evaluatedSteps[stepIndex] = true;
    }

    function endGame() {
        if (!gameRunning) return;

        clearInterval(gameInterval);
        gameRunning = false;

        // Ensure the last step is evaluated
        if (currentIndex > 0 && !evaluatedSteps[currentIndex - 1]) {
            evaluateResponse(currentIndex - 1);
        }

        startBtn.disabled = false;
        nToggleCheckbox.disabled = false;
        matchBtn.disabled = true;
        mismatchBtn.disabled = true;
        stopBtn.disabled = true;
        gridItems.forEach(item => item.classList.remove('active'));

        const finalMessage = `게임 종료! ${totalSteps}번 중 ${score}개를 맞췄습니다.`;
        messageP.textContent = finalMessage;
        messageP.style.color = 'black';
        scoreSpan.textContent = score; // Final score
    }
});
