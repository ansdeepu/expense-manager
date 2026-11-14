"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, TrendingDown, Target, Wallet } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

type AdviceProps = {
  totalIncome: number;
  totalExpense: number;
  expenseByCategory: { [key: string]: number };
};

export function FinancialAdvice({ totalIncome, totalExpense, expenseByCategory }: AdviceProps) {
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const topCategories = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const getSavingsAdvice = () => {
    if (savingsRate > 20) {
      return {
        title: "Excellent Savings!",
        message: `You're saving ${savingsRate.toFixed(0)}% of your income. Keep up the great work! Consider investing these savings to grow your wealth.`,
      };
    }
    if (savingsRate > 0) {
      return {
        title: "Good Progress!",
        message: `You're saving ${savingsRate.toFixed(0)}% of your income. To save more, try to analyze your top spending categories.`,
      };
    }
    return {
      title: "Focus on Savings",
      message: "Your expenses are higher than your income this month. Let's find areas to cut back.",
    };
  };

  const savingsAdvice = getSavingsAdvice();

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Financial Advice</CardTitle>
            <CardDescription className="text-xs">
              Personalized tips based on your activity this month.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-5 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/60">
          <div className="space-y-1.5 pt-1 md:pt-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet className="h-4 w-4 text-primary flex-shrink-0" />
              <h4>{savingsAdvice.title}</h4>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground pl-6">
              {savingsAdvice.message}
            </p>
          </div>

          {totalExpense > 0 && (
            <div className="space-y-1.5 pt-4 md:pt-0 md:pl-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
                <h4>Top Spending Categories</h4>
              </div>
              <ul className="space-y-1 pl-6 text-xs text-muted-foreground">
                {topCategories.map(([category, amount]) => (
                  <li key={category} className="flex items-center justify-between gap-2">
                    <span className="truncate">{category}</span>
                    <span className="font-mono tabular-nums font-medium text-foreground whitespace-nowrap">
                      {formatCurrency(amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-1.5 pt-4 md:pt-0 md:pl-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Target className="h-4 w-4 text-primary flex-shrink-0" />
              <h4>Tips for Reducing Expenses</h4>
            </div>
            <ul className="list-disc pl-10 text-xs text-muted-foreground space-y-1 leading-relaxed">
              <li>Review your top categories. Can you find cheaper alternatives or reduce frequency?</li>
              <li>Look for subscriptions you no longer use and cancel them.</li>
              <li>Try setting a budget for your top 3 spending categories next month.</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
