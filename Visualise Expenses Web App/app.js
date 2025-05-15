// DOM elements
const addExpenseForm = document.getElementById('add-expense-form');
const expensesUl = document.getElementById('expenses-ul');
const chartCanvas = document.getElementById('expense-chart');
let expenseChart;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Initialise the app
function initApp() {
    displayExpenses();
    updateChart();
}

// Add expense
addExpenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    
    if (!description || isNaN(amount)) {
        alert('Please fill all fields correctly');
        return;
    }

    const newExpense = {
        id: Date.now(),
        description,
        amount,
        category,
        date: new Date().toLocaleDateString()
    };

    expenses.push(newExpense);
    saveExpenses();
    addExpenseForm.reset();
    displayExpenses();
    updateChart();
});

// Display expenses
function displayExpenses() {
    expensesUl.innerHTML = '';
    
    if (expenses.length === 0) {
        expensesUl.innerHTML = '<li>No expenses added yet</li>';
        return;
    }

    // Sort by most recent first
    const sortedExpenses = [...expenses].sort((a, b) => b.id - a.id);

    sortedExpenses.forEach(expense => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="desc">${expense.description}</span>
            <span class="amount">£${expense.amount.toFixed(2)}</span>
            <span class="category ${expense.category}">${expense.category}</span>
            <span class="date">${expense.date}</span>
            <button onclick="deleteExpense(${expense.id})">×</button>
        `;
        expensesUl.appendChild(li);
    });
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses();
        displayExpenses();
        updateChart();
    }
}

// Save to local storage
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function updateChart() {
    const categoryTotals = {
        food: 0,
        transport: 0,
        entertainment: 0,
        other: 0
    };

    // Calculate totals for each category
    expenses.forEach(expense => {
        if (categoryTotals.hasOwnProperty(expense.category)) {
            categoryTotals[expense.category] += expense.amount;
        }
    });

    const labels = Object.keys(categoryTotals).filter(cat => categoryTotals[cat] > 0);
    const data = labels.map(cat => categoryTotals[cat]);

    const categoryColors = {
        food: 'rgba(255, 99, 132, 0.7)',
        transport: 'rgba(54, 162, 235, 0.7)',
        entertainment: 'rgba(255, 206, 86, 0.7)',
        other: 'rgba(75, 192, 192, 0.7)'
    };

    const backgroundColors = labels.map(cat => categoryColors[cat]);

    // Destroy previous chart if it exists
    if (expenseChart) {
        expenseChart.destroy();
    }

    // Create new chart
    expenseChart = new Chart(chartCanvas, {
        type: 'pie',
        data: {
            labels: labels.length ? labels : ['No expenses'],
            datasets: [{
                data: labels.length ? data : [1],
                backgroundColor: labels.length ? backgroundColors : ['rgba(200, 200, 200, 0.7)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: £${context.raw.toFixed(2)}`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Expenses by Category',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}


// Initialise the app when page loads
initApp();