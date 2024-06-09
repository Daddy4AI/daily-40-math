// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let isStarted = false;
let timerInterval;
let startTime;
let currentTime;
let correctAnswers = 0;
let totalQuestions = 40;

const animals = [
  "Pics/dog-icon.png",
  "Pics/horse-icon.png",
  "Pics/bee-icon.png",
  "Pics/donkey-icon.png",
  "Pics/tiger-icon.png",
  "Pics/pig-icon.png"
];

document.getElementById('animal').src = animals[Math.floor(Math.random() * animals.length)];

document.getElementById('start-check-btn').addEventListener('click', () => {
  if (!isStarted) {
    startQuiz();
  } else {
    checkAnswers();
  }
});

document.getElementById('view-history-btn').addEventListener('click', () => {
  clearQuestions();
  loadHistory();
});

function startQuiz() {
  const tester = document.getElementById('tester').value;
  if (!tester) {
    alert('请选择测试人员');
    return;
  }
  isStarted = true;
  startTime = new Date();
  document.getElementById('start-check-btn').textContent = 'Check';
  document.getElementById('tester-name').textContent = tester;
  generateQuestions(tester);
  startTimer();
}

function checkAnswers() {
  clearInterval(timerInterval);
  document.getElementById('start-check-btn').textContent = 'Restart';
  document.getElementById('start-check-btn').addEventListener('click', () => {
    location.reload();
  });
  const rows = document.querySelectorAll('#questions-table tbody tr');
  rows.forEach(row => {
    const userAnswerInput = row.querySelector('.user-answer');
    const userAnswer = userAnswerInput.value;
    const correctAnswer = row.querySelector('.correct-answer');
    const isCorrect = row.querySelector('.is-correct');

    userAnswerInput.disabled = true; // Lock the input area

    if (userAnswer == correctAnswer.dataset.answer) {
      isCorrect.textContent = 'Yes';
      isCorrect.classList.add('correct');
      correctAnswers++;
    } else {
      isCorrect.textContent = 'No';
      isCorrect.classList.add('incorrect');
    }
    correctAnswer.textContent = correctAnswer.dataset.answer; // Show the correct answer
  });
  showResults();
  saveResults();
}

function startTimer() {
  const tenMinutes = 10 * 60 * 1000;
  timerInterval = setInterval(() => {
    currentTime = new Date();
    let elapsed = currentTime - startTime;
    let remaining = tenMinutes - elapsed;

    if (remaining <= 0) {
      remaining = 0;
      clearInterval(timerInterval);
      document.getElementById('timer').classList.add('highlight');
    }

    let minutes = Math.floor(remaining / (1000 * 60));
    let seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    document.getElementById('timer').textContent = `${pad(minutes)}:${pad(seconds)}`;

  }, 1000);
}

function pad(num) {
  return num < 10 ? '0' + num : num;
}

function generateQuestions(tester) {
  const tableBody = document.querySelector('#questions-table tbody');
  const trainingType = document.getElementById('training-type').value;
  tableBody.innerHTML = '';
  for (let i = 1; i <= totalQuestions; i++) {
    const row = document.createElement('tr');
    const question = generateQuestion(i, trainingType, tester);
    row.innerHTML = `
      <td>${i}</td>
      <td>${question.question}</td>
      <td><input type="number" class="user-answer" /></td>
      <td class="correct-answer" data-answer="${question.answer}"></td>
      <td class="is-correct"></td>
    `;
    tableBody.appendChild(row);
  }
}

function generateQuestion(index, trainingType, tester) {
  let num1, num2, question, answer;
  const ranges = {
    A: {
      addition: { num1: [1, 999], num2: [1, 999], sum: 999 },
      subtraction: { num1: [1, 999], num2: [1, 999] },
      multiplication: { num1: [1, 99], num2: [2, 11] },
      division: { num1: [1, 99], num2: [2, 11] }
    },
    Z: {
      addition: { num1: [1, 9999], num2: [1, 9999], sum: 9999 },
      subtraction: { num1: [1, 9999], num2: [1, 9999] },
      multiplication: { num1: [1, 999], num2: [2, 39] },
      division: { num1: [1, 199], num2: [2, 39] }
    },
    D: {
      addition: { num1: [1, 9999], num2: [1, 9999] },
      subtraction: { num1: [1, 9999], num2: [1, 9999] },
      multiplication: { num1: [1, 999], num2: [2, 99] },
      division: { num1: [1, 199], num2: [2, 99] }
    }
  };

  const range = ranges[tester];
  if (trainingType === '乘除训练') {
    if (index <= 20) { // multiplication
      num1 = getRandomInt(range.multiplication.num1[0], range.multiplication.num1[1]);
      num2 = getRandomInt(range.multiplication.num2[0], range.multiplication.num2[1]);
      question = `${num1} * ${num2} =`;
      answer = num1 * num2;
    } else { // division
      num2 = getRandomInt(range.division.num2[0], range.division.num2[1]);
      num1 = getRandomInt(range.division.num1[0], range.division.num1[1]) * num2;
      question = `${num1} / ${num2} =`;
      answer = num1 / num2;
    }
  } else {
    if (index <= 10) { // multiplication
      num1 = getRandomInt(range.multiplication.num1[0], range.multiplication.num1[1]);
      num2 = getRandomInt(range.multiplication.num2[0], range.multiplication.num2[1]);
      question = `${num1} * ${num2} =`;
      answer = num1 * num2;
    } else if (index <= 20) { // division
      num2 = getRandomInt(range.division.num2[0], range.division.num2[1]);
      num1 = getRandomInt(range.division.num1[0], range.division.num1[1]) * num2;
      question = `${num1} / ${num2} =`;
      answer = num1 / num2;
    } else if (index <= 30) { // subtraction
      num1 = getRandomInt(range.subtraction.num1[0], range.subtraction.num1[1]);
      num2 = getRandomInt(range.subtraction.num2[0], Math.min(num1, range.subtraction.num2[1]));
      question = `${num1} - ${num2} =`;
      answer = num1 - num2;
    } else { // addition
      num1 = getRandomInt(range.addition.num1[0], range.addition.num1[1]);
      num2 = getRandomInt(range.addition.num2[0], Math.min(range.addition.sum - num1, range.addition.num2[1]));
      question = `${num1} + ${num2} =`;
      answer = num1 + num2;
    }
  }
  return { question, answer };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showResults() {
  const endTime = new Date();
  const testTime = new Date(endTime - startTime);
  document.getElementById('today-date').textContent = new Date().toLocaleDateString();
  document.getElementById('start-time').textContent = startTime.toLocaleTimeString();
  document.getElementById('test-time').textContent = `${pad(testTime.getUTCMinutes())}:${pad(testTime.getUTCSeconds())}`;
  document.getElementById('correct-answers').textContent = correctAnswers;
  document.getElementById('incorrect-answers').textContent = totalQuestions - correctAnswers;
  document.getElementById('total-score').textContent = ((correctAnswers / totalQuestions) * 100).toFixed(2);
  document.getElementById('test-results').style.display = 'block';
  document.getElementById('view-history-btn').style.display = 'block';
}

function saveResults() {
  const endTime = new Date();
  const testTime = new Date(endTime - startTime);
  const tester = document.getElementById('tester').value;
  const resultData = {
    tester,
    date: new Date().toLocaleDateString(),
    startTime: startTime.toLocaleTimeString(),
    testTime: `${pad(testTime.getUTCMinutes())}:${pad(testTime.getUTCSeconds())}`,
    correct: correctAnswers,
    incorrect: totalQuestions - correctAnswers,
    score: ((correctAnswers / totalQuestions) * 100).toFixed(2)
  };

  // Save result to Firebase
  database.ref('results').push(resultData);
}

function clearQuestions() {
  const tableBody = document.querySelector('#questions-table tbody');
  tableBody.innerHTML = '';
}

function loadHistory() {
  const summaryTbody = document.getElementById('summary-tbody');
  const historyTbody = document.getElementById('history-tbody');
  summaryTbody.innerHTML = '';
  historyTbody.innerHTML = '';

  database.ref('results').once('value', (snapshot) => {
    const results = snapshot.val();
    const summary = { A: { correct: 0, score: 0 }, Z: { correct: 0, score: 0 }, D: { correct: 0, score: 0 } };
    let index = 0;

    for (let key in results) {
      const result = results[key];
      summary[result.tester].correct += result.correct;
      summary[result.tester].score += parseFloat(result.score);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${++index}</td>
        <td>${result.tester}</td>
        <td>${result.date}</td>
        <td>${result.startTime}</td>
        <td>${result.testTime}</td>
        <td>${result.correct}</td>
        <td>${result.incorrect}</td>
        <td>${result.score}</td>
      `;
      historyTbody.appendChild(row);
    }

    for (let key in summary) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${key}</td>
        <td>${summary[key].correct}</td>
        <td>${summary[key].score.toFixed(2)}</td>
      `;
      summaryTbody.appendChild(row);
    }

    document.getElementById('history-results').style.display = 'block';
  });
}
