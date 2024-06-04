document.addEventListener('DOMContentLoaded', () => {
  const goalInput = document.getElementById('newgoal');
  const goalForm = document.querySelector('.ngform');
  const goalsContainer = document.querySelector('.goalg');
  const goalCountElement = document.getElementById('goal-count');
  const ongoingStreaksElement = document.getElementById('ongoing-streaks');
  const successRateElement = document.querySelector('.stats div:nth-child(3) span');

  let goals = JSON.parse(localStorage.getItem('goals')) || [];

  function saveGoalsToLocalStorage() {
    localStorage.setItem('goals', JSON.stringify(goals));
  }

  function updateStats() {
    const totalGoals = goals.length;
    const ongoingStreaks = goals.filter(goal => goal.streak > 0).length;

    // Calculate the new success rate
    const maxStreak = goals.length ? Math.max(...goals.map(goal => goal.streak)) : 0;
    const averageStreak = goals.length ? goals.reduce((sum, goal) => sum + goal.streak, 0) / goals.length : 0;
    const successRate = maxStreak ? Math.round((averageStreak / maxStreak) * 100) : 0;

    goalCountElement.textContent = totalGoals;
    ongoingStreaksElement.textContent = ongoingStreaks;
    successRateElement.textContent = `${successRate}%`;
  }

  function renderGoals() {
    goalsContainer.innerHTML = '';
    goals.forEach((goal, index) => {
      const goalElement = document.createElement('div');
      goalElement.classList.add('goal');

      goalElement.innerHTML = `
        <div class="card">
          <span class="card-day">Streak: ${goal.streak}</span>
          <span class="card-goal">${goal.text}</span>
          <button class="card-done" onclick="incrementStreak(${index})">Done</button>
          <button class="card-done" onclick="deleteGoal(${index})">Delete</button>
        </div>
      `;

      goalsContainer.appendChild(goalElement);
    });
  }

  function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  function isNextDay(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return (date2 - date1) <= oneDay;
  }

  function checkAndResetStreaks() {
    const today = new Date();
    goals.forEach(goal => {
      const lastUpdate = new Date(goal.lastUpdate);
      if (!isSameDay(today, lastUpdate) && !isNextDay(lastUpdate, today)) {
        goal.streak = 0;
        goal.lastUpdate = today.toISOString();
      }
    });
    saveGoalsToLocalStorage();
    renderGoals();
    updateStats();
  }

  window.incrementStreak = function(index) {
    const today = new Date();
    const lastUpdate = new Date(goals[index].lastUpdate);

    if (!isSameDay(today, lastUpdate)) {
      goals[index].streak += 1;
      goals[index].lastUpdate = today.toISOString();
      saveGoalsToLocalStorage();
      renderGoals();
      updateStats();
    } else {
      alert("You can only increment the streak once per day!");
    }
  };

  window.deleteGoal = function(index) {
    goals.splice(index, 1);
    saveGoalsToLocalStorage();
    renderGoals();
    updateStats();
  };

  goalForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const newGoalText = goalInput.value.trim();
    if (newGoalText !== '') {
      goals.push({ text: newGoalText, streak: 0, lastUpdate: new Date(0).toISOString() });
      goalInput.value = '';

      saveGoalsToLocalStorage();
      renderGoals();
      updateStats();
    }
  });

  checkAndResetStreaks();
});
