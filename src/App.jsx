import { useState, useCallback } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import Balance from "./components/Balance";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Charts from "./components/Charts";
import Summary from "./components/Summary";
import Budgets from "./components/Budgets";
import Goals from "./components/Goals";
import { exportToCSV } from "./utils/helpers";

const TABS = [
  { id: "dashboard",    label: "Dashboard",    icon: "📊" },
  { id: "transactions", label: "Transactions", icon: "💳" },
  { id: "budgets",      label: "Budgets",      icon: "🎯" },
  { id: "goals",        label: "Goals",        icon: "🏆" },
  { id: "analytics",    label: "Analytics",    icon: "📈" },
];

export default function App() {
  const [transactions, setTransactions] = useLocalStorage("rct-transactions", []);
  const [budgets,      setBudgets]      = useLocalStorage("rct-budgets",      []);
  const [goals,        setGoals]        = useLocalStorage("rct-goals",        []);
  const [dark, setDark]   = useLocalStorage("rct-dark", false);
  const [tab, setTab]     = useState("dashboard");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const addTransaction = useCallback((tx) => {
    setTransactions((prev) => [tx, ...prev]);
    showToast("Transaction added ✓");
  }, [setTransactions]);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast("Transaction deleted", "error");
  }, [setTransactions]);

  // Budget handlers
  const addBudget = useCallback((b) => {
    setBudgets((prev) => {
      const exists = prev.findIndex((x) => x.category === b.category && x.period === b.period);
      if (exists !== -1) {
        const updated = [...prev];
        updated[exists] = { ...updated[exists], amount: b.amount };
        return updated;
      }
      return [...prev, b];
    });
    showToast("Budget saved ✓");
  }, [setBudgets]);

  const deleteBudget = useCallback((id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    showToast("Budget removed", "error");
  }, [setBudgets]);

  // Goal handlers
  const addGoal = useCallback((g) => {
    setGoals((prev) => [...prev, g]);
    showToast("Goal created ✓");
  }, [setGoals]);

  const deleteGoal = useCallback((id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    showToast("Goal removed", "error");
  }, [setGoals]);

  const updateGoal = useCallback((id, amount) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updated = { ...g, current: g.current + amount };
        if (updated.current >= updated.target) showToast("🎉 Goal achieved! Congratulations!");
        else showToast(`Added ${new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(amount)} ✓`);
        return updated;
      })
    );
  }, [setGoals]);

  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-violet-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 font-sans transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-6">

          {/* ── Header ── */}
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500">
                💰 Expense Tracker Pro
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{date}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(transactions)}
                title="Export CSV"
                className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:border-violet-400 hover:text-violet-500 transition shadow-sm"
              >
                ⬇️ CSV
              </button>
              <button
                onClick={() => setDark((d) => !d)}
                title="Toggle dark mode"
                className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg hover:border-violet-400 transition shadow-sm"
              >
                {dark ? "☀️" : "🌙"}
              </button>
            </div>
          </header>

          {/* ── Balance Cards ── */}
          <Balance transactions={transactions} />

          {/* ── Tabs ── */}
          <div className="flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  tab === t.id
                    ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <span className="hidden sm:inline">{t.icon} </span>{t.label}
              </button>
            ))}
          </div>

          {/* ── Dashboard Tab ── */}
          {tab === "dashboard" && (
            <div className="space-y-6 animate-fadeIn">
              <Summary transactions={transactions} />
              <Charts transactions={transactions} dark={dark} />

              {/* Budget + Goals quick view */}
              {(budgets.length > 0 || goals.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {budgets.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">🎯 Budget Status</h3>
                        <button onClick={() => setTab("budgets")} className="text-xs text-violet-500 hover:underline">View all</button>
                      </div>
                      <div className="space-y-3">
                        {budgets.slice(0,3).map((b) => {
                          const now = new Date(), start = new Date();
                          b.period === "weekly" ? start.setDate(now.getDate()-7) : start.setMonth(now.getMonth()-1);
                          const spent = transactions.filter(t => t.category===b.category && t.amount<0 && new Date(t.date)>=start).reduce((s,t)=>s+Math.abs(t.amount),0);
                          const pct = Math.min((spent/b.amount)*100,100);
                          const cat = [{value:"food",icon:"🍔"},{value:"transport",icon:"🚗"},{value:"entertainment",icon:"🎬"},{value:"shopping",icon:"🛍️"},{value:"bills",icon:"💡"},{value:"health",icon:"🏥"},{value:"education",icon:"📚"},{value:"other",icon:"📌"}].find(c=>c.value===b.category);
                          return (
                            <div key={b.id}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">{cat?.icon} {b.category}</span>
                                <span className={pct>=100?"text-rose-500 font-bold":"text-gray-400 dark:text-gray-500"}>{pct.toFixed(0)}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pct>=100?"bg-rose-400":pct>=75?"bg-amber-400":"bg-emerald-400"}`} style={{width:`${pct}%`}} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {goals.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">🏆 Savings Goals</h3>
                        <button onClick={() => setTab("goals")} className="text-xs text-violet-500 hover:underline">View all</button>
                      </div>
                      <div className="space-y-3">
                        {goals.slice(0,3).map((g) => {
                          const pct = Math.min((g.current/g.target)*100,100);
                          return (
                            <div key={g.id}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">{g.emoji} {g.name}</span>
                                <span className="text-gray-400 dark:text-gray-500">{pct.toFixed(0)}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full" style={{width:`${pct}%`}} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Transactions Tab ── */}
          {tab === "transactions" && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-fadeIn">
              {/* List — wider */}
              <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-4 text-sm uppercase tracking-wide">
                  💳 All Transactions
                </h2>
                <ExpenseList transactions={transactions} onDelete={deleteTransaction} />
              </div>
              {/* Form */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-4 text-sm uppercase tracking-wide">
                  ➕ Add Transaction
                </h2>
                <ExpenseForm onAdd={addTransaction} />
              </div>
            </div>
          )}

          {/* ── Budgets Tab ── */}
          {tab === "budgets" && (
            <Budgets
              budgets={budgets}
              transactions={transactions}
              onAdd={addBudget}
              onDelete={deleteBudget}
            />
          )}

          {/* ── Goals Tab ── */}
          {tab === "goals" && (
            <Goals
              goals={goals}
              onAdd={addGoal}
              onDelete={deleteGoal}
              onUpdate={updateGoal}
            />
          )}

          {/* ── Analytics Tab ── */}
          {tab === "analytics" && (
            <div className="space-y-6 animate-fadeIn">
              <Summary transactions={transactions} />
              <Charts transactions={transactions} dark={dark} />
              {/* Top transactions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 text-sm uppercase tracking-wide">
                  🔝 Top 5 Expenses
                </h3>
                <ul className="space-y-2">
                  {[...transactions]
                    .filter(t => t.amount < 0)
                    .sort((a,b) => a.amount - b.amount)
                    .slice(0,5)
                    .map((t,i) => (
                      <li key={t.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 w-5">#{i+1}</span>
                        <span className="flex-1 ml-2 text-gray-700 dark:text-gray-200 truncate">{t.title}</span>
                        <span className="font-bold text-rose-500 ml-4">
                          {new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(Math.abs(t.amount))}
                        </span>
                      </li>
                    ))}
                  {transactions.filter(t => t.amount < 0).length === 0 && (
                    <li className="text-gray-400 text-center py-6">No expenses recorded</li>
                  )}
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* ── Toast ── */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-2xl text-white text-sm font-semibold shadow-xl animate-fadeIn ${
              toast.type === "error"
                ? "bg-rose-500"
                : "bg-emerald-500"
            }`}
          >
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}
