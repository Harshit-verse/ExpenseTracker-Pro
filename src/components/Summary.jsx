import { useMemo } from "react";
import { formatCurrency, getCategoryMeta } from "../utils/helpers";

export default function Summary({ transactions }) {
  const insights = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });

    const thisExp  = thisMonth.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);
    const lastExp  = lastMonth.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);
    const thisInc  = thisMonth.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);

    const savRate  = thisInc > 0 ? ((thisInc - thisExp) / thisInc * 100).toFixed(1) : null;

    const catMap = {};
    thisMonth.filter(t => t.amount < 0).forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount);
    });
    const topCat = Object.entries(catMap).sort((a,b) => b[1]-a[1])[0];

    const diff = lastExp > 0 ? ((thisExp - lastExp) / lastExp * 100).toFixed(1) : null;

    return { thisExp, lastExp, thisInc, savRate, topCat, diff };
  }, [transactions]);

  const cards = [
    {
      emoji: "📅",
      title: "This Month's Spending",
      value: formatCurrency(insights.thisExp),
      sub: insights.diff !== null
        ? `${insights.diff > 0 ? "▲" : "▼"} ${Math.abs(insights.diff)}% vs last month`
        : "First recorded month",
      color: insights.diff > 0 ? "text-rose-500" : "text-emerald-500",
    },
    {
      emoji: "💰",
      title: "This Month's Income",
      value: formatCurrency(insights.thisInc),
      sub: `Net: ${formatCurrency(insights.thisInc - insights.thisExp)}`,
      color: "text-emerald-500",
    },
    {
      emoji: "🏆",
      title: "Top Spending Category",
      value: insights.topCat
        ? `${getCategoryMeta(insights.topCat[0]).icon} ${getCategoryMeta(insights.topCat[0]).label}`
        : "—",
      sub: insights.topCat ? formatCurrency(insights.topCat[1]) : "No expenses yet",
      color: "text-violet-500",
    },
    {
      emoji: "📊",
      title: "Savings Rate",
      value: insights.savRate !== null ? `${insights.savRate}%` : "—",
      sub: insights.savRate >= 20 ? "🎉 Great saving habit!" : insights.savRate !== null ? "Try to save more" : "Add income first",
      color: insights.savRate >= 20 ? "text-emerald-500" : "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.title}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-2xl mb-2">{c.emoji}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{c.title}</p>
          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{c.value}</p>
          <p className={`text-xs mt-1 ${c.color}`}>{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
