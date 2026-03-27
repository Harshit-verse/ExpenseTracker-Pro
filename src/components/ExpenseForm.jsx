import { useState } from "react";
import { CATEGORIES, generateId } from "../utils/helpers";

const INITIAL = {
  title: "", amount: "", category: "food",
  tags: "", notes: "", type: "expense",
};

export default function ExpenseForm({ onAdd }) {
  const [form, setForm]     = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [shake, setShake]   = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim())          errs.title  = "Description is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
                                     errs.amount = "Enter a valid positive amount";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setErrors({});

    const amount =
      form.type === "expense"
        ? -Math.abs(parseFloat(form.amount))
        :  Math.abs(parseFloat(form.amount));

    onAdd({
      id: generateId(),
      title: form.title.trim(),
      amount,
      category: form.category,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      notes: form.notes.trim(),
      date: new Date().toISOString(),
    });

    setForm(INITIAL);
  };

  const inputCls = (field) =>
    `w-full px-3 py-2 rounded-xl text-sm border transition focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 ${
      errors[field]
        ? "border-rose-400"
        : "border-gray-200 dark:border-gray-700"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${shake ? "animate-shake" : ""}`}
      noValidate
    >
      {/* Income / Expense toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {["expense", "income"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setForm((p) => ({ ...p, type: t }))}
            className={`flex-1 py-2 text-sm font-semibold transition-all ${
              form.type === t
                ? t === "expense"
                  ? "bg-rose-500 text-white"
                  : "bg-emerald-500 text-white"
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {t === "expense" ? "💸 Expense" : "💰 Income"}
          </button>
        ))}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
          Description *
        </label>
        <input
          className={inputCls("title")}
          placeholder="e.g. Grocery shopping"
          value={form.title}
          onChange={set("title")}
        />
        {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
          Amount (₹) *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
          <input
            className={`${inputCls("amount")} pl-7`}
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={set("amount")}
          />
        </div>
        {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
          Category
        </label>
        <select className={inputCls("category")} value={form.category} onChange={set("category")}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
          Tags <span className="text-gray-400 normal-case font-normal">(comma separated)</span>
        </label>
        <input
          className={inputCls("tags")}
          placeholder="work, urgent, personal"
          value={form.tags}
          onChange={set("tags")}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
          Notes
        </label>
        <textarea
          className={`${inputCls("notes")} resize-none`}
          rows={2}
          placeholder="Any additional notes…"
          value={form.notes}
          onChange={set("notes")}
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 active:scale-95 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900"
      >
        ➕ Add Transaction
      </button>
    </form>
  );
}
