import { useState } from "react";
import { CATEGORIES, formatCurrency, generateId } from "../utils/helpers";

function BudgetCard({ budget, spent, onDelete }) {
  const pct = Math.min((spent / budget.amount) * 100, 100);
  const remaining = budget.amount - spent;
  const isOver    = spent > budget.amount;
  const isWarn    = pct >= 75 && !isOver;

  const barColor = isOver
    ? "from-rose-500 to-pink-400"
    : isWarn
    ? "from-amber-400 to-orange-400"
    : "from-emerald-400 to-teal-400";

  const cat = CATEGORIES.find((c) => c.value === budget.category) || CATEGORIES[CATEGORIES.length - 1];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: cat.bg }}
          >
            {cat.icon}
          </span>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{cat.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{budget.period}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(budget.id)}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-lg"
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <span className={isOver ? "text-rose-500 font-semibold" : "text-gray-500 dark:text-gray-400"}>
          {isOver ? "⚠️ Over by " + formatCurrency(Math.abs(remaining)) : formatCurrency(spent) + " spent"}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {pct.toFixed(0)}% of {formatCurrency(budget.amount)}
        </span>
      </div>

      {isOver && (
        <p className="mt-2 text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-2 py-1">
          Budget exceeded! Consider reviewing your spending.
        </p>
      )}
    </div>
  );
}

export default function Budgets({ budgets, transactions, onAdd, onDelete }) {
  const [form, setForm] = useState({ category: "food", amount: "", period: "monthly" });
  const [error, setError] = useState("");

  const getSpent = (category, period) => {
    const now = new Date();
    const start = new Date();
    period === "weekly" ? start.setDate(now.getDate() - 7) : start.setMonth(now.getMonth() - 1);
    return transactions
      .filter((t) => t.category === category && t.amount < 0 && new Date(t.date) >= start)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setError("Enter a valid budget amount");
      return;
    }
    setError("");
    onAdd({ id: generateId(), ...form, amount: parseFloat(form.amount) });
    setForm((p) => ({ ...p, amount: "" }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-fadeIn">
      {/* Budget list */}
      <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-4 text-sm uppercase tracking-wide">
          🎯 Category Budgets
        </h2>

        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-gray-600 gap-3">
            <span className="text-5xl">🎯</span>
            <p className="text-sm font-medium">No budgets set yet</p>
            <p className="text-xs">Set a budget to track your category spending</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {budgets.map((b) => (
              <BudgetCard
                key={b.id}
                budget={b}
                spent={getSpent(b.category, b.period)}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-4 text-sm uppercase tracking-wide">
          ➕ Set Budget
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {CATEGORIES.filter((c) => !["salary", "freelance"].includes(c.value)).map((c) => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
              Budget Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="5000"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                className={`w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400 ${
                  error ? "border-rose-400" : "border-gray-200 dark:border-gray-700"
                }`}
              />
            </div>
            {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
              Period
            </label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {["monthly", "weekly"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, period: p }))}
                  className={`flex-1 py-2 text-sm font-semibold capitalize transition-all ${
                    form.period === p
                      ? "bg-violet-500 text-white"
                      : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 active:scale-95 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900"
          >
            🎯 Set Budget
          </button>
        </form>

        {/* Quick tip */}
        <div className="mt-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl p-3 text-xs text-violet-700 dark:text-violet-300">
          <p className="font-semibold mb-1">💡 Tip</p>
          <p>Setting a budget for each category helps you avoid overspending. You'll see a warning when you're at 75%.</p>
        </div>
      </div>
    </div>
  );
}
