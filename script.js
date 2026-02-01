// DOM Elements
const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
const transactionCountEl = document.getElementById("transaction-count");
const transactionListEl = document.getElementById("transaction-list");
const transactionFormEl = document.getElementById("transaction-form");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");
const categoryEl = document.getElementById("category");
const tagsEl = document.getElementById("tags");
const notesEl = document.getElementById("notes");
const currentDateEl = document.getElementById("current-date");
const totalDisplayEl = document.getElementById("total-display");
const themeToggleBtn = document.getElementById("theme-toggle");

// Budget elements
const budgetFormEl = document.getElementById("budget-form");
const budgetListEl = document.getElementById("budget-list");
const budgetOverviewListEl = document.getElementById("budget-overview-list");

// Goal elements
const goalFormEl = document.getElementById("goal-form");
const goalsListEl = document.getElementById("goals-list");
const goalsOverviewListEl = document.getElementById("goals-overview-list");

// Analytics elements
const analyticsPeriodEl = document.getElementById("analytics-period");
const insightsListEl = document.getElementById("insights-list");

// State
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let budgets = JSON.parse(localStorage.getItem("budgets")) || [];
let goals = JSON.parse(localStorage.getItem("goals")) || [];
let currentFilter = 'all';
let categoryChart = null;
let comparisonChart = null;
let trendChart = null;
let incomeTrendChart = null;

// Initialize
initializeApp();

function initializeApp() {
  // Display current date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateEl.textContent = new Date().toLocaleDateString('en-IN', options);

  // Load theme preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // Event Listeners
  transactionFormEl.addEventListener("submit", addTransaction);
  budgetFormEl.addEventListener("submit", addBudget);
  goalFormEl.addEventListener("submit", addGoal);
  themeToggleBtn.addEventListener("click", toggleTheme);
  analyticsPeriodEl.addEventListener("change", updateAnalytics);

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      updateTransactionList();
    });
  });

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = e.target.dataset.tab;
      switchTab(targetTab);
    });
  });

  // Initial render
  updateUI();
}

function switchTab(tabName) {
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    }
  });

  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');

  // Update specific tab content
  if (tabName === 'analytics') {
    updateAnalytics();
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
  
  // Recreate charts with new theme
  updateCharts();
  updateAnalytics();
}

// ============= TRANSACTIONS =============

function addTransaction(e) {
  e.preventDefault();

  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);
  const category = categoryEl.value;
  const tagsInput = tagsEl.value.trim();
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
  const notes = notesEl.value.trim();

  transactions.push({
    id: Date.now(),
    description,
    amount,
    category,
    tags,
    notes,
    date: new Date().toISOString()
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateUI();
  transactionFormEl.reset();
  checkBudgetAlerts();
}

function updateTransactionList() {
  transactionListEl.innerHTML = "";

  let filteredTransactions = transactions;
  if (currentFilter === 'income') {
    filteredTransactions = transactions.filter(t => t.amount > 0);
  } else if (currentFilter === 'expense') {
    filteredTransactions = transactions.filter(t => t.amount < 0);
  }

  const sortedTransactions = [...filteredTransactions].reverse();

  if (sortedTransactions.length === 0) {
    transactionListEl.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <p>No transactions yet</p>
      </div>
    `;
  } else {
    sortedTransactions.forEach((transaction) => {
      const transactionEl = createTransactionElement(transaction);
      transactionListEl.appendChild(transactionEl);
    });
  }

  totalDisplayEl.textContent = `${sortedTransactions.length} total`;
}

function createTransactionElement(transaction) {
  const li = document.createElement("li");
  li.classList.add("transaction");
  li.classList.add(transaction.amount > 0 ? "income" : "expense");

  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  const tagsHTML = transaction.tags && transaction.tags.length > 0 
    ? `<div class="transaction-tags">${transaction.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
    : '';

  const notesHTML = transaction.notes 
    ? `<div class="transaction-notes">📝 ${transaction.notes}</div>`
    : '';

  li.innerHTML = `
    <div class="transaction-info">
      <span class="transaction-desc">
        ${transaction.description}
        <span class="category-badge category-${transaction.category}">${getCategoryIcon(transaction.category)}</span>
      </span>
      <span class="transaction-date">${formattedDate}</span>
      ${tagsHTML}
      ${notesHTML}
    </div>
    <div class="transaction-amount-container">
      <span class="transaction-amount">${formatCurrency(transaction.amount)}</span>
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">×</button>
    </div>
  `;

  return li;
}

function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

// ============= BUDGETS =============

function addBudget(e) {
  e.preventDefault();

  const category = document.getElementById('budget-category').value;
  const amount = parseFloat(document.getElementById('budget-amount').value);
  const period = document.getElementById('budget-period').value;

  // Check if budget already exists for this category
  const existingIndex = budgets.findIndex(b => b.category === category && b.period === period);
  
  if (existingIndex !== -1) {
    budgets[existingIndex].amount = amount;
  } else {
    budgets.push({
      id: Date.now(),
      category,
      amount,
      period
    });
  }

  localStorage.setItem("budgets", JSON.stringify(budgets));
  updateBudgetDisplay();
  budgetFormEl.reset();
}

function updateBudgetDisplay() {
  // Update full budget list
  if (budgetListEl) {
    budgetListEl.innerHTML = "";
    
    if (budgets.length === 0) {
      budgetListEl.innerHTML = '<div class="empty-state"><p>No budgets set yet</p></div>';
    } else {
      budgets.forEach(budget => {
        const spent = calculateCategorySpending(budget.category, budget.period);
        const percentage = (spent / budget.amount) * 100;
        
        const budgetItem = document.createElement('div');
        budgetItem.className = 'budget-item';
        budgetItem.innerHTML = `
          <div class="budget-header">
            <span class="budget-name">${getCategoryIcon(budget.category)} ${capitalizeFirst(budget.category)}</span>
            <span class="budget-amount">${formatCurrency(spent)} / ${formatCurrency(budget.amount)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${percentage > 90 ? 'danger' : percentage > 75 ? 'warning' : ''}" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          <div class="progress-text">
            <span>${percentage.toFixed(1)}% used</span>
            <span>${budget.period}</span>
            <button class="delete-budget-btn" onclick="removeBudget(${budget.id})">Delete</button>
          </div>
        `;
        budgetListEl.appendChild(budgetItem);
      });
    }
  }

  // Update budget overview on dashboard
  if (budgetOverviewListEl) {
    budgetOverviewListEl.innerHTML = "";
    
    if (budgets.length === 0) {
      budgetOverviewListEl.innerHTML = '<div class="empty-state"><p>Set budgets to track your spending</p></div>';
    } else {
      budgets.slice(0, 3).forEach(budget => {
        const spent = calculateCategorySpending(budget.category, budget.period);
        const percentage = (spent / budget.amount) * 100;
        
        const budgetItem = document.createElement('div');
        budgetItem.className = 'budget-item';
        budgetItem.innerHTML = `
          <div class="budget-header">
            <span class="budget-name">${getCategoryIcon(budget.category)} ${capitalizeFirst(budget.category)}</span>
            <span class="budget-amount">${formatCurrency(spent)} / ${formatCurrency(budget.amount)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${percentage > 90 ? 'danger' : percentage > 75 ? 'warning' : ''}" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          <div class="progress-text">
            <span>${percentage.toFixed(1)}% used</span>
          </div>
        `;
        budgetOverviewListEl.appendChild(budgetItem);
      });
    }
  }
}

function removeBudget(id) {
  budgets = budgets.filter(b => b.id !== id);
  localStorage.setItem("budgets", JSON.stringify(budgets));
  updateBudgetDisplay();
}

function calculateCategorySpending(category, period) {
  const now = new Date();
  let startDate = new Date();
  
  if (period === 'weekly') {
    startDate.setDate(now.getDate() - 7);
  } else {
    startDate.setMonth(now.getMonth() - 1);
  }

  return transactions
    .filter(t => {
      const transDate = new Date(t.date);
      return t.category === category && 
             t.amount < 0 && 
             transDate >= startDate;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

function checkBudgetAlerts() {
  budgets.forEach(budget => {
    const spent = calculateCategorySpending(budget.category, budget.period);
    const percentage = (spent / budget.amount) * 100;
    
    if (percentage >= 100) {
      alert(`⚠️ Budget Alert: You've exceeded your ${budget.category} budget!`);
    } else if (percentage >= 90) {
      alert(`⚠️ Budget Warning: You've used ${percentage.toFixed(0)}% of your ${budget.category} budget.`);
    }
  });
}

// ============= GOALS =============

function addGoal(e) {
  e.preventDefault();

  const name = document.getElementById('goal-name').value.trim();
  const target = parseFloat(document.getElementById('goal-target').value);
  const current = parseFloat(document.getElementById('goal-current').value);
  const deadline = document.getElementById('goal-deadline').value;

  goals.push({
    id: Date.now(),
    name,
    target,
    current,
    deadline: deadline || null
  });

  localStorage.setItem("goals", JSON.stringify(goals));
  updateGoalsDisplay();
  goalFormEl.reset();
}

function updateGoalsDisplay() {
  // Update full goals list
  if (goalsListEl) {
    goalsListEl.innerHTML = "";
    
    if (goals.length === 0) {
      goalsListEl.innerHTML = '<div class="empty-state"><p>No savings goals yet</p></div>';
    } else {
      goals.forEach(goal => {
        const percentage = (goal.current / goal.target) * 100;
        const remaining = goal.target - goal.current;
        
        let deadlineText = '';
        if (goal.deadline) {
          const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
          deadlineText = daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed';
        }
        
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        goalItem.innerHTML = `
          <div class="goal-header">
            <span class="goal-name">🎯 ${goal.name}</span>
            <span class="goal-amount">${formatCurrency(goal.current)} / ${formatCurrency(goal.target)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${percentage >= 100 ? '' : ''}" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          <div class="progress-text">
            <span>${percentage.toFixed(1)}% complete</span>
            <span>${deadlineText}</span>
          </div>
          <div class="progress-text" style="margin-top: 8px;">
            <span>${formatCurrency(remaining)} remaining</span>
            <div>
              <button class="add-to-goal-btn" onclick="addToGoal(${goal.id})">Add Money</button>
              <button class="delete-goal-btn" onclick="removeGoal(${goal.id})">Delete</button>
            </div>
          </div>
        `;
        goalsListEl.appendChild(goalItem);
      });
    }
  }

  // Update goals overview on dashboard
  if (goalsOverviewListEl) {
    goalsOverviewListEl.innerHTML = "";
    
    if (goals.length === 0) {
      goalsOverviewListEl.innerHTML = '<div class="empty-state"><p>Create savings goals to track your progress</p></div>';
    } else {
      goals.slice(0, 3).forEach(goal => {
        const percentage = (goal.current / goal.target) * 100;
        
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        goalItem.innerHTML = `
          <div class="goal-header">
            <span class="goal-name">🎯 ${goal.name}</span>
            <span class="goal-amount">${formatCurrency(goal.current)} / ${formatCurrency(goal.target)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          <div class="progress-text">
            <span>${percentage.toFixed(1)}% complete</span>
          </div>
        `;
        goalsOverviewListEl.appendChild(goalItem);
      });
    }
  }
}

function addToGoal(id) {
  const amount = prompt("Enter amount to add to this goal:");
  if (amount && !isNaN(amount)) {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      goal.current += parseFloat(amount);
      localStorage.setItem("goals", JSON.stringify(goals));
      updateGoalsDisplay();
      
      if (goal.current >= goal.target) {
        alert(`🎉 Congratulations! You've reached your goal: ${goal.name}!`);
      }
    }
  }
}

function removeGoal(id) {
  goals = goals.filter(g => g.id !== id);
  localStorage.setItem("goals", JSON.stringify(goals));
  updateGoalsDisplay();
}

// ============= ANALYTICS =============

function updateAnalytics() {
  const period = analyticsPeriodEl.value;
  updateTrendCharts(period);
  generateInsights(period);
}

function updateTrendCharts(period) {
  const { labels, expenseData, incomeData } = getTrendData(period);
  
  const isDark = document.body.classList.contains('dark-mode');
  const textColor = isDark ? '#e8e8e8' : '#2d3436';
  const gridColor = isDark ? '#2d3748' : '#e2e8f0';

  // Spending Trend Chart
  const trendCtx = document.getElementById('trendChart');
  if (trendChart) trendChart.destroy();
  
  trendChart = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Expenses',
        data: expenseData,
        borderColor: '#eb3349',
        backgroundColor: 'rgba(235, 51, 73, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor, font: { family: 'Poppins' } }
        },
        tooltip: {
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });

  // Income Trend Chart
  const incomeCtx = document.getElementById('incomeTrendChart');
  if (incomeTrendChart) incomeTrendChart.destroy();
  
  incomeTrendChart = new Chart(incomeCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Income',
        data: incomeData,
        borderColor: '#56ab2f',
        backgroundColor: 'rgba(86, 171, 47, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor, font: { family: 'Poppins' } }
        },
        tooltip: {
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });
}

function getTrendData(period) {
  const now = new Date();
  let days, labels = [], expenseData = [], incomeData = [];

  switch(period) {
    case 'week':
      days = 7;
      break;
    case 'month':
      days = 30;
      break;
    case 'quarter':
      days = 90;
      break;
    case 'year':
      days = 365;
      break;
    default:
      days = 30;
  }

  const interval = days > 90 ? Math.floor(days / 12) : days > 30 ? 7 : 1;
  
  for (let i = days; i >= 0; i -= interval) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    labels.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + interval);
    
    const periodExpenses = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.amount < 0 && tDate >= startDate && tDate < endDate;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const periodIncome = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.amount > 0 && tDate >= startDate && tDate < endDate;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    expenseData.push(periodExpenses);
    incomeData.push(periodIncome);
  }

  return { labels, expenseData, incomeData };
}

function generateInsights(period) {
  const insights = [];
  const now = new Date();
  let startDate = new Date();
  
  switch(period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const periodTransactions = transactions.filter(t => new Date(t.date) >= startDate);
  
  // Total spending
  const totalExpenses = periodTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalIncome = periodTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  insights.push(`💰 Total income: ${formatCurrency(totalIncome)}`);
  insights.push(`💸 Total expenses: ${formatCurrency(totalExpenses)}`);
  insights.push(`${totalIncome > totalExpenses ? '✅' : '⚠️'} Net: ${formatCurrency(totalIncome - totalExpenses)}`);
  
  // Top spending category
  const categoryTotals = {};
  periodTransactions.filter(t => t.amount < 0).forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
  });
  
  if (Object.keys(categoryTotals).length > 0) {
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    insights.push(`📊 Highest spending: ${capitalizeFirst(topCategory[0])} (${formatCurrency(topCategory[1])})`);
  }
  
  // Average daily spending
  const days = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  const avgDaily = totalExpenses / days;
  insights.push(`📅 Average daily spending: ${formatCurrency(avgDaily)}`);
  
  // Transaction count
  insights.push(`📝 Total transactions: ${periodTransactions.length}`);

  // Display insights
  if (insightsListEl) {
    insightsListEl.innerHTML = insights.map(insight => `
      <div class="insight-item">
        <p>${insight}</p>
      </div>
    `).join('');
  }
}

// ============= SUMMARY & CHARTS =============

function updateSummary() {
  const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
  const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);

  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(Math.abs(expenses));
  transactionCountEl.textContent = transactions.length;
}

function updateCharts() {
  updateCategoryChart();
  updateComparisonChart();
}

function updateCategoryChart() {
  const ctx = document.getElementById('categoryChart');
  const isDark = document.body.classList.contains('dark-mode');
  
  const categoryTotals = {};
  transactions.filter(t => t.amount < 0).forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
  });

  const categories = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  if (categoryChart) categoryChart.destroy();

  if (categories.length === 0) {
    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
    return;
  }

  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories.map(c => capitalizeFirst(c)),
      datasets: [{
        data: values,
        backgroundColor: [
          '#667eea', '#764ba2', '#f093fb', '#4facfe',
          '#43e97b', '#fa709a', '#fee140', '#30cfd0'
        ],
        borderWidth: 3,
        borderColor: isDark ? '#0f3460' : '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 12, family: 'Poppins' },
            color: isDark ? '#e8e8e8' : '#2d3436'
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => context.label + ': ' + formatCurrency(context.parsed)
          }
        }
      }
    }
  });
}

function updateComparisonChart() {
  const ctx = document.getElementById('comparisonChart');
  const isDark = document.body.classList.contains('dark-mode');
  
  const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));

  if (comparisonChart) comparisonChart.destroy();

  comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{
        label: 'Amount (₹)',
        data: [income, expenses],
        backgroundColor: ['rgba(86, 171, 47, 0.8)', 'rgba(235, 51, 73, 0.8)'],
        borderColor: ['rgba(86, 171, 47, 1)', 'rgba(235, 51, 73, 1)'],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => '₹' + value.toLocaleString('en-IN'),
            color: isDark ? '#e8e8e8' : '#2d3436'
          },
          grid: { color: isDark ? '#2d3748' : '#e2e8f0' }
        },
        x: {
          ticks: { color: isDark ? '#e8e8e8' : '#2d3436' },
          grid: { color: isDark ? '#2d3748' : '#e2e8f0' }
        }
      }
    }
  });
}

// ============= UTILITIES =============

function getCategoryIcon(category) {
  const icons = {
    food: '🍔', transport: '🚗', entertainment: '🎬',
    shopping: '🛍️', bills: '💡', salary: '💼',
    freelance: '💻', other: '📌'
  };
  return icons[category] || '📌';
}

function formatCurrency(number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2
  }).format(number);
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateUI() {
  updateTransactionList();
  updateSummary();
  updateCharts();
  updateBudgetDisplay();
  updateGoalsDisplay();
}
