// DOM Elements
const startBtn = document.getElementById('start-exam-btn');
const examInterface = document.getElementById('exam-interface');
const alertBox = document.getElementById('alert-box');
const warningBox = document.getElementById('warning-box');
const violationCountDisplay = document.getElementById('violation-count');
const beepSound = document.getElementById('beep-sound'); // Beep sound element
const submitBtn = document.getElementById('submit-btn');

let violations = 0;
const maxViolations = 3; // Set maximum allowed warnings
const maxScore = 50; // Each question is worth 10 marks, 5 questions
let examStarted = false; // Track if the exam has started
let score = maxScore; // Initial score is max score
let answersCount = 0; // Count of questions answered

// Correct answers for each question
const correctAnswers = {
    q1: "4",            // Answer to "What is 2 + 2?"
    q2: "paris",        // Answer to "What is the capital of France?"
    q3: "jupiter",      // Answer to "What is the largest planet?"
    q4: "shakespeare",  // Answer to "Who wrote 'Hamlet'?"
    q5: "h2o"           // Answer to "What is the chemical symbol for water?"
};

startBtn.addEventListener('click', () => {
    // Start the exam and enforce fullscreen mode
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    }
    examInterface.classList.remove('hidden');
    startBtn.classList.add('hidden');
    violationCountDisplay.classList.remove('hidden');
    examStarted = true; // Exam has officially started
    violations = 0; // Reset violations count on exam start
    updateViolationCount(); // Ensure count starts at 0/3
    score = maxScore; // Reset score to max
    answersCount = 0; // Reset answers count
});

// Detect tab switching or leaving fullscreen
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && examStarted) {
        handleViolation("tabSwitch");
    }
});

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && examStarted) {
        handleViolation("fullscreenExit");
    }
});

// Handle violations
function handleViolation(type) {
    if (!examStarted) return; // Ignore violations if exam hasn't started yet

    // Play beep sound
    beep.play();

    if (type === "tabSwitch" || type === "fullscreenExit") {
        alertBox.classList.remove('hidden');
        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, 3000);
    } else if (type === "movement") {
        warningBox.classList.remove('hidden');
        setTimeout(() => {
            warningBox.classList.add('hidden');
        }, 3000);
    }

    violations += 1;
    score -= 2; // Deduct 2 marks for each violation
    updateViolationCount();

    if (violations >= maxViolations) {
        alert("You have violated the exam rules too many times. The exam will be terminated.");
        document.exitFullscreen();
        // Terminate the exam or take action
        examInterface.classList.add('hidden');
        startBtn.classList.remove('hidden');
        examStarted = false; // End the exam session
    }
}

// Update warning count display
function updateViolationCount() {
    violationCountDisplay.textContent = `Warnings: ${violations}/${maxViolations}`;
}

// Hide each question after answering
document.querySelectorAll('.question input').forEach(input => {
    input.addEventListener('input', function () {
        if (this.value.trim() !== "") {
            this.closest('.question').classList.add('hidden');
            answersCount += 1;
            
            // Check if all questions are answered
            if (answersCount === Object.keys(correctAnswers).length) {
                displayResults();
            }
        }
    });
});

// Display results after all questions are answered
function displayResults() {
    let answersCorrect = 0;

    // Fetch user answers from input fields
    const userAnswers = {
        q1: document.getElementById('q1').value.trim().toLowerCase(),
        q2: document.getElementById('q2').value.trim().toLowerCase(),
        q3: document.getElementById('q3').value.trim().toLowerCase(),
        q4: document.getElementById('q4').value.trim().toLowerCase(),
        q5: document.getElementById('q5').value.trim().toLowerCase(),
    };

    // Check each answer against the correct answers
    for (let question in correctAnswers) {
        if (userAnswers[question] === correctAnswers[question]) {
            answersCorrect += 1;
        }
    }

    // Each correct answer is worth 10 marks
    const totalScore = (answersCorrect * 10) - (violations * 2);
    const finalScore = Math.max(0, totalScore); // Ensure score doesn't go negative

    // Replace the exam interface with the result
    examInterface.innerHTML = `<h2>Your final score is: ${finalScore} / ${maxScore}</h2>`;
    examStarted = false; // End the exam session
    document.exitFullscreen();
}
// Display results after all questions are answered
function displayResults() {
    let answersCorrect = 0;

    // Fetch user answers from input fields
    const userAnswers = {
        q1: document.getElementById('q1').value.trim().toLowerCase(),
        q2: document.getElementById('q2').value.trim().toLowerCase(),
        q3: document.getElementById('q3').value.trim().toLowerCase(),
        q4: document.getElementById('q4').value.trim().toLowerCase(),
        q5: document.getElementById('q5').value.trim().toLowerCase(),
    };

    // Check each answer against the correct answers
    for (let question in correctAnswers) {
        if (userAnswers[question] === correctAnswers[question]) {
            answersCorrect += 1;
        }
    }

    // Each correct answer is worth 10 marks
    const totalScore = (answersCorrect * 10) - (violations * 2);
    const finalScore = Math.max(0, totalScore); // Ensure score doesn't go negative

    // Determine result based on the score
    let result;
    if (finalScore < 18) {
        result = "Fail";
    } else if (finalScore >= 18 && finalScore <= 23) {
        result = "Pass";
    } else if (finalScore > 23 && finalScore <= 30) {
        result = "Good";
    } else if (finalScore > 30) {
        result = "Excellent";
    }

    // Replace the exam interface with the result and feedback
    examInterface.innerHTML = `
        <h2>Your final score is: ${finalScore} / ${maxScore}</h2>
        <h3>Result: ${result}</h3>
    `;
    
    examStarted = false; // End the exam session
    document.exitFullscreen();
}


// Disable right-click, copy, and paste
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('cut', (e) => e.preventDefault());
document.addEventListener('paste', (e) => e.preventDefault());

// Detecting user movement (optional webcam monitoring)
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        document.body.appendChild(video); // Optional webcam feed for proctoring

        // Example: Detect user movement using the webcam stream
        let lastMotion = null;

        setInterval(() => {
            if (!examStarted) return; // Only track movement if the exam has started
            const motionDetected = detectMotion(video);
            if (motionDetected && !lastMotion) {
                handleViolation("movement");
            }
            lastMotion = motionDetected;
        }, 2000);
    })
    .catch((err) => {
        console.error('Failed to access webcam:', err);
    });

// Dummy function to simulate motion detection
function detectMotion(videoElement) {
    // Implement actual motion detection logic here
    // For demo purposes, randomly return true/false
    return Math.random() > 0.5;
}






