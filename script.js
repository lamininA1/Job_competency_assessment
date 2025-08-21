document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const gridContainer = document.getElementById('grid-container');
    const startBtn = document.getElementById('start-btn');
    const nToggleCheckbox = document.getElementById('n-toggle-checkbox');
    const scoreSpan = document.getElementById('score');
    const messageP = document.getElementById('message');
    const matchBtn = document.getElementById('match-btn');

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
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && gameRunning && !matchBtn.disabled) {
            e.preventDefault();
            handleUserResponse(true);
        }
    });

    matchBtn.disabled = true;

    function startGame() {
        if (gameRunning) return;

        gameRunning = true;
        n = nToggleCheckbox.checked ? 3 : 2;
        sequence = [];
        userResponses = Array(totalSteps).fill(false);
        evaluatedSteps = Array(totalSteps).fill(false); // Reset evaluated steps
        currentIndex = 0;
        score = 0;

        scoreSpan.textContent = '0';
        messageP.textContent = '게임 시작! 집중하세요.';
        messageP.style.color = 'black';
        startBtn.disabled = true;
        nToggleCheckbox.disabled = true;
        matchBtn.disabled = false;

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
    }

    function handleUserResponse(response) {
        if (!gameRunning || currentIndex === 0) return;
        userResponses[currentIndex - 1] = response;
        matchBtn.style.backgroundColor = '#ffc107';
        setTimeout(() => {
            matchBtn.style.backgroundColor = '#007bff';
        }, 200);
    }

    function evaluateResponse(stepIndex) {
        if (evaluatedSteps[stepIndex]) return; // Prevent double-counting

        const isMatch = stepIndex >= n && sequence[stepIndex] === sequence[stepIndex - n];
        const userClickedMatch = userResponses[stepIndex];

        if ((isMatch && userClickedMatch) || (!isMatch && !userClickedMatch)) {
            score++;
        }
        evaluatedSteps[stepIndex] = true; // Mark this step as evaluated
    }

    function endGame() {
        clearInterval(gameInterval);
        gameRunning = false;

        // Explicitly evaluate the final step to fix the review issue
        evaluateResponse(totalSteps - 1);

        startBtn.disabled = false;
        nToggleCheckbox.disabled = false;
        matchBtn.disabled = true;
        gridItems.forEach(item => item.classList.remove('active'));

        const mistakes = totalSteps - score;
        const finalMessage = `게임 종료! ${totalSteps}번 중 ${mistakes}개 틀렸습니다.`;
        messageP.textContent = finalMessage;
        messageP.style.color = 'black';
        scoreSpan.textContent = '0';
    }
});
