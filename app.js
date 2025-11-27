// DOM Elements
const daysContainer = document.getElementById('daysContainer');
const questionsContainer = document.getElementById('questionsContainer');
const dayTitle = document.getElementById('dayTitle');
const tabButtons = document.querySelectorAll('.tab-btn');

// State
let currentDay = null;
let currentTab = 'basic';
let quizData = null;

// Initialize the app
function init() {
    // Create day buttons
    for (let i = 1; i <= 10; i++) {
        const dayBtn = document.createElement('button');
        dayBtn.className = 'day-btn';
        dayBtn.textContent = `Day ${i}`;
        dayBtn.dataset.day = i;
        dayBtn.addEventListener('click', () => loadDay(i));
        daysContainer.appendChild(dayBtn);
    }

    // Set up tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            renderQuestions();
        });
    });

    // Load the first day by default
    loadDay(1);
}

// Load quiz data for a specific day
async function loadDay(dayNumber) {
    try {
        // Update active day button
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.day) === dayNumber);
        });

        // Update day title
        dayTitle.textContent = `Day ${dayNumber} Quiz`;
        currentDay = dayNumber;

        // Show loading state
        questionsContainer.innerHTML = '<p>Loading questions...</p>';

        // Load the JSON file
        const response = await fetch(`data/day${dayNumber}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load day ${dayNumber} data`);
        }
        
        quizData = await response.json();
        renderQuestions();
    } catch (error) {
        console.error('Error loading quiz data:', error);
        questionsContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load questions for Day ${dayNumber}.</p>
                <p>${error.message}</p>
                <p>Please make sure the JSON file exists in the data folder.</p>
            </div>
        `;
    }
}

// Render questions for the current tab
function renderQuestions() {
    if (!quizData) return;

    const questions = quizData[currentTab] || [];
    
    if (questions.length === 0) {
        questionsContainer.innerHTML = `<p>No ${currentTab} questions available for this day.</p>`;
        return;
    }

    questionsContainer.innerHTML = '';
    
    questions.forEach((question, index) => {
        const questionEl = document.createElement('div');
        questionEl.className = 'question-card';
        questionEl.innerHTML = `
            <h3 class="question-text">${index + 1}. ${question.question}</h3>
            <div class="options-container">
                ${question.options.map((option, i) => `
                    <div class="option" data-option="${String.fromCharCode(65 + i)}">
                        <strong>${String.fromCharCode(65 + i)}.</strong> ${option}
                    </div>
                `).join('')}
            </div>
            <button class="toggle-answer">Reveal Solution</button>
            <div class="answer-section">
                <p class="answer-text"><strong>Answer:</strong> ${question.answer}</p>
                ${question.explanation ? `<p class="explanation"><strong>Explanation:</strong> ${question.explanation}</p>` : ''}
            </div>
        `;

        // Add event listeners for answer toggling
        const toggleBtn = questionEl.querySelector('.toggle-answer');
        const answerSection = questionEl.querySelector('.answer-section');
        
        toggleBtn.addEventListener('click', () => {
            answerSection.classList.toggle('show');
            toggleBtn.textContent = answerSection.classList.contains('show') 
                ? 'Hide Answer' 
                : 'Show Answer';
        });

        // Add click handler for options (optional: mark correct/incorrect)
        const options = questionEl.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Remove any existing selection
                options.forEach(opt => {
                    opt.classList.remove('correct', 'incorrect');
                });
                
                // Mark selected option
                const selectedOption = option.dataset.option;
                if (selectedOption === question.answer) {
                    option.classList.add('correct');
                } else {
                    option.classList.add('incorrect');
                    // Find and highlight the correct answer
                    const correctOption = questionEl.querySelector(`[data-option="${question.answer}"]`);
                    if (correctOption) correctOption.classList.add('correct');
                }
                
                // Show the answer section
                answerSection.classList.add('show');
                toggleBtn.textContent = 'Hide Answer';
            });
        });

        questionsContainer.appendChild(questionEl);
    });
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
