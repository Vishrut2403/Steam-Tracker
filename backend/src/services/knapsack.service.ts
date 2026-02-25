interface KnapsackItem {
  id: string;
  name: string;
  price: number;
  score: number;
  tags: string[];
  listPrice: number;
  discountPercent: number;
}

interface KnapsackResult {
  selectedGames: KnapsackItem[];
  totalCost: number;
  totalScore: number;
  remaining: number;
}

class KnapsackService {
  // 0/1 Knapsack Dynamic Programming 
  solve(items: KnapsackItem[], budget: number): KnapsackResult {
    const n = items.length;

    if (n === 0 || budget <= 0) {
      return {
        selectedGames: [],
        totalCost: 0,
        totalScore: 0,
        remaining: budget,
      };
    }

    const budgetCents = Math.floor(budget * 100);
    const itemsCents = items.map((item) => ({
      ...item,
      priceCents: Math.floor(item.price * 100),
    }));

    const dp: number[][] = Array(n + 1)
      .fill(0)
      .map(() => Array(budgetCents + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      const item = itemsCents[i - 1];

      for (let w = 0; w <= budgetCents; w++) {
        dp[i][w] = dp[i - 1][w];

        if (item.priceCents <= w) {
          const takeScore = dp[i - 1][w - item.priceCents] + item.score;
          dp[i][w] = Math.max(dp[i][w], takeScore);
        }
      }
    }

    const selected: KnapsackItem[] = [];
    let w = budgetCents;

    for (let i = n; i > 0 && w > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        const item = items[i - 1];
        selected.push(item);
        w -= itemsCents[i - 1].priceCents;
      }
    }

    const totalCost = selected.reduce((sum, item) => sum + item.price, 0);
    const totalScore = selected.reduce((sum, item) => sum + item.score, 0);

    return {
      selectedGames: selected,
      totalCost: Math.round(totalCost * 100) / 100,
      totalScore: Math.round(totalScore),
      remaining: Math.round((budget - totalCost) * 100) / 100,
    };
  }

  // Greedy approximation 
  solveGreedy(items: KnapsackItem[], budget: number): KnapsackResult {
    const sorted = [...items]
      .map((item) => ({
        ...item,
        ratio: item.price > 0 ? item.score / item.price : 0,
      }))
      .sort((a, b) => b.ratio - a.ratio);

    const selected: KnapsackItem[] = [];
    let remaining = budget;

    for (const item of sorted) {
      if (item.price <= remaining) {
        selected.push(item);
        remaining -= item.price;
      }
    }

    const totalCost = selected.reduce((sum, item) => sum + item.price, 0);
    const totalScore = selected.reduce((sum, item) => sum + item.score, 0);

    return {
      selectedGames: selected,
      totalCost: Math.round(totalCost * 100) / 100,
      totalScore: Math.round(totalScore),
      remaining: Math.round((budget - totalCost) * 100) / 100,
    };
  }

  // Smart solver: DP or greedy based on size 
  optimizeBudget(items: KnapsackItem[], budget: number): KnapsackResult {
    if (items.length <= 50 && budget <= 10000) {
      return this.solve(items, budget);
    } else {
      return this.solveGreedy(items, budget);
    }
  }
}

export default new KnapsackService();