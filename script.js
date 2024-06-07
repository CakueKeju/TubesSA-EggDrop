document.getElementById('randomize_btn').addEventListener('click', function() {
    const floors = parseInt(document.getElementById('floors').value);
    if (!isNaN(floors) && floors > 0) {
        document.getElementById('egg_breaks_at').value = Math.floor(Math.random() * floors) + 1;
    } else {
        alert('Please enter a valid number of floors first.');
    }
});

document.getElementById('calculate_btn').addEventListener('click', function() {
    const floors = parseInt(document.getElementById('floors').value);
    const eggs = parseInt(document.getElementById('eggs').value);
    const budget = parseFloat(document.getElementById('budget').value);
    const drop_cost = parseFloat(document.getElementById('drop_cost').value);
    let egg_breaks_at = parseInt(document.getElementById('egg_breaks_at').value);

    if (isNaN(floors) || floors < 1 || isNaN(eggs) || eggs < 1 || isNaN(budget) || budget < 1 || isNaN(drop_cost) || drop_cost < 1) {
        alert('Please enter valid numbers for all fields.');
        return;
    }

    if (isNaN(egg_breaks_at) || egg_breaks_at < 1 || egg_breaks_at > floors) {
        egg_breaks_at = Math.floor(Math.random() * floors) + 1;
        document.getElementById('egg_breaks_at').value = egg_breaks_at;
    }

    const [min_attempts_bf, floor_bf, runtime_bf, cost_bf, exceeds_budget_bf] = eggDropBruteForce(floors, eggs, egg_breaks_at, budget, drop_cost);
    const [min_attempts_dp, floor_dp, runtime_dp, cost_dp, exceeds_budget_dp] = eggDropDP(floors, eggs, egg_breaks_at, budget, drop_cost);

    document.getElementById('bf_attempts').textContent = `Minimum attempts needed: ${min_attempts_bf}`;
    document.getElementById('bf_floor').textContent = `Floor at which the egg breaks: ${floor_bf}`;
    document.getElementById('bf_runtime').textContent = `Runtime: ${runtime_bf.toFixed(6)} seconds`;
    document.getElementById('bf_cost').textContent = `Total cost incurred: $${cost_bf.toFixed(2)}`;
    document.getElementById('bf_budget').textContent = `Exceeds budget: ${exceeds_budget_bf ? 'Yes' : 'No'}`;

    document.getElementById('dp_attempts').textContent = `Minimum attempts needed: ${min_attempts_dp}`;
    document.getElementById('dp_floor').textContent = `Floor at which the egg breaks: ${floor_dp}`;
    document.getElementById('dp_runtime').textContent = `Runtime: ${runtime_dp.toFixed(6)} seconds`;
    document.getElementById('dp_cost').textContent = `Total cost incurred: $${cost_dp.toFixed(2)}`;
    document.getElementById('dp_budget').textContent = `Exceeds budget: ${exceeds_budget_dp ? 'Yes' : 'No'}`;

    compareBudgets(exceeds_budget_bf, exceeds_budget_dp);
});

function compareBudgets(exceeds_budget_bf, exceeds_budget_dp) {
    let comparisonText = '';
    if (!exceeds_budget_bf && exceeds_budget_dp) {
        comparisonText = "Brute force solution is within the budget, while dynamic programming exceeds the budget.";
    } else if (exceeds_budget_bf && !exceeds_budget_dp) {
        comparisonText = "Dynamic programming solution is within the budget, while brute force exceeds the budget.";
    } else if (!exceeds_budget_bf && !exceeds_budget_dp) {
        comparisonText = "Both solutions are within the budget.";
    } else {
        comparisonText = "Both solutions exceed the budget.";
    }
    document.getElementById('comparison_result').textContent = comparisonText;
}

function eggDropBruteForce(floors, eggs, egg_breaks_at, budget, drop_cost) {
    const start_time = performance.now();
    let min_attempts = floors;
    let total_cost = 0.0;

    for (let floor = 1; floor <= floors; floor++) {
        const attempts = floor;
        if (floor >= egg_breaks_at) {
            total_cost += drop_cost;
            min_attempts = Math.min(min_attempts, attempts);
            break;
        } else {
            total_cost += drop_cost;
        }
    }

    const exceeds_budget = total_cost > budget;
    const end_time = performance.now();
    const runtime = (end_time - start_time) / 1000;

    return [min_attempts, egg_breaks_at, runtime, total_cost, exceeds_budget];
}

function eggDropDP(floors, eggs, egg_breaks_at, budget, drop_cost) {
    const start_time = performance.now();
    const dp = Array.from({ length: eggs + 1 }, () => Array(floors + 1).fill(0));

    for (let i = 1; i <= floors; i++) {
        dp[1][i] = i;
    }

    for (let i = 2; i <= eggs; i++) {
        for (let j = 1; j <= floors; j++) {
            dp[i][j] = Infinity;
            for (let x = 1; x <= j; x++) {
                dp[i][j] = Math.min(dp[i][j], 1 + Math.max(dp[i - 1][x - 1], dp[i][j - x]));
            }
        }
    }

    const min_attempts = dp[eggs][floors];
    let total_cost = 0.0;
    let floor = 1;

    for (let i = 1; i <= min_attempts; i++) {
        total_cost += drop_cost;
        if (floor >= egg_breaks_at) {
            break;
        }
        floor++;
    }

    const exceeds_budget = total_cost > budget;
    const end_time = performance.now();
    const runtime = (end_time - start_time) / 1000;

    return [min_attempts, egg_breaks_at, runtime, total_cost, exceeds_budget];
}
