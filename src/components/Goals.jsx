import { useState } from "react";
import { formatCurrency, generateId } from "../utils/helpers";

const GOAL_EMOJIS = ["🏖️","💻","🚗","🏠","✈️","📱","🎓","💍","🎮","💰"];

function GoalCard({ goal, onDelete, onAddMoney }) {
  const pct       = Math.min((goal.current / goal.target) * 100, 100);
  const remaining = goal.target - goal.current;
  const done      = goal.current >= goal.target;

  let daysLeft = null;
  if (goal.deadline) {
    daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / 86400000);
  }

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-4 border shadow-sm hover:shadow-md transition-shadow group ${
      done
        ? "border-emerald-300 dark:border-emerald-700"
        : "border-gray-100 dark:border-gray-700"
    }`}>
      {done && (
        <div className="absolute top-3 right-10 text-xs font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full">
          ✅ Achieved!
        </div>
      )}
      <button
        onClick={() => onDelete(goal.id)}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-lg"
      >
        ×
      </button>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{goal.emoji || "🎯"}</span>
        <div>
          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{goal.name}</p>
          {goal.deadline && (
            <p className={`text-xs ${daysLeft < 0 ? "text-rose-500" : daysLeft <= 30 ? "text-amber-500" : "text-gray-400 dark:text-gray-500"}`}>
              {daysLeft < 0 ? "⚠️ Deadline passed" : daysLeft === 0 ? "🔔 Due today!" : `⏳ ${daysLeft} days left`}
            </p>
          )}
        </div>
      </div>

      {/* Progress ring + bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span>{formatCurrency(goal.current)} saved</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">{pct.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              done
                ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                : "bg-gradient-to-r from-violet-500 to-indigo-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Goal: {formatCurrency(goal.target)} · {done ? "🎉 Done!" : formatCurrency(remaining) + " to go"}
        </p>
      </div>

      {!done && (
        <button
          onClick={() => onAddMoney(goal.id)}
          className="w-full py-1.5 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500 hover:text-white transition-all"
        >
          ➕ Add Money
        </button>
      )}
    </div>
  );
}

export default function Goals({ goals, onAdd, onDelete, onUpdate }) {
  const [form, setForm] = useState({
    name: "", target: "", current: "0",
    deadline: "", emoji: "🎯",
  });
  const [errors, setErrors] = useState({});
  const [addMoneyModal, setAddMoneyModal] = useState(null);
  const [addAmt, setAddAmt] = useState("");

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim())                                     errs.name   = "Name required";
    if (!form.target || isNaN(form.target) || +form.target<=0) errs.target = "Enter valid target";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onAdd({
      id:       generateId(),
      name:     form.name.trim(),
      target:   parseFloat(form.target),
      current:  parseFloat(form.current) || 0,
      deadline: form.deadline || null,
      emoji:    form.emoji,
    });
    setForm({ name: "", target: "", current: "0", deadline: "", emoji: "🎯" });
  };

  const handleAddMoney = () => {
    const amt = parseFloat(addAmt);
    if (!isNaN(amt) && amt > 0) {
      onUpdate(addMoneyModal, amt);
      setAddMoneyModal(null);
      setAddAmt("");
    }
  };

  const inputCls = (f) =>
    `w-full px-3 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400 ${
      errors[f] ? "border-rose-400" : "border-gray-200 dark:border-gray-700"
    }`;

  const totalSaved  = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const achieved    = goals.filter((g) => g.current >= g.target).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-fadeIn">
      {/* Goals list */}
      <div className="lg:col-span-3 space-y-4">
        {/* Summary strip */}
        {goals.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Goals",        value: goals.length,              icon: "🏆" },
              { label: "Total Saved",  value: formatCurrency(totalSaved), icon: "💰" },
              { label: "Achieved",     value: achieved,                   icon: "✅" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                <p className="text-xl mb-0.5">{s.icon}</p>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{s.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-4 text-sm uppercase tracking-wide">
            🏆 Your Savings Goals
          </h2>
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-gray-600 gap-3">
              <span className="text-5xl">🏆</span>
              <p className="text-sm font-medium">No goals yet</p>
              <p className="text-xs">Create a savings goal to stay motivated</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onDelete={onDelete}
                  onAddMoney={(id) => { setAddMoneyModal(id); setAddAmt(""); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm self-start">
        <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-4 text-sm uppercase tracking-wide">
          ✨ Create Goal
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
              Pick an Emoji
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, emoji: em }))}
                  className={`w-9 h-9 rounded-xl text-xl transition-all ${
                    form.emoji === em
                      ? "bg-violet-100 dark:bg-violet-900 ring-2 ring-violet-400 scale-110"
                      : "bg-gray-50 dark:bg-gray-700 hover:bg-violet-50 dark:hover:bg-violet-900/30"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Goal Name *</label>
            <input className={inputCls("name")} placeholder="e.g. New Laptop" value={form.name} onChange={set("name")} />
            {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Target (₹) *</label>
              <input type="number" min="1" step="0.01" className={inputCls("target")} placeholder="50000" value={form.target} onChange={set("target")} />
              {errors.target && <p className="text-rose-500 text-xs mt-1">{errors.target}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Saved So Far</label>
              <input type="number" min="0" step="0.01" className={inputCls("current")} placeholder="0" value={form.current} onChange={set("current")} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Target Date (Optional)</label>
            <input type="date" className={inputCls("deadline")} value={form.deadline} onChange={set("deadline")} />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 active:scale-95 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900"
          >
            🏆 Create Goal
          </button>
        </form>
      </div>

      {/* Add Money Modal */}
      {addMoneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">💰 Add Money to Goal</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              {goals.find((g) => g.id === addMoneyModal)?.name}
            </p>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
              <input
                autoFocus
                type="number"
                min="1"
                step="0.01"
                value={addAmt}
                onChange={(e) => setAddAmt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMoney()}
                placeholder="Enter amount"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAddMoneyModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMoney}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 active:scale-95 transition-all shadow"
              >
                ✓ Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
