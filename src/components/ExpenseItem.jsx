import { formatCurrency, getCategoryMeta } from "../utils/helpers";

export default function ExpenseItem({ transaction, onDelete }) {
  const { icon, bg, text } = getCategoryMeta(transaction.category);
  const isIncome = transaction.amount > 0;
  const date = new Date(transaction.date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <li className="group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-md transition-all duration-150 animate-fadeIn">
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: bg, color: text }}
      >
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">
          {transaction.title}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          <span className="text-xs text-gray-400 dark:text-gray-500">{date}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: bg, color: text }}
          >
            {icon} {getCategoryMeta(transaction.category).label}
          </span>
          {(transaction.tags || []).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300"
            >
              #{tag}
            </span>
          ))}
        </div>
        {transaction.notes && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-0.5 truncate">
            📝 {transaction.notes}
          </p>
        )}
      </div>

      {/* Amount & delete */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={`font-bold text-sm ${
            isIncome ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(Math.abs(transaction.amount))}
        </span>
        <button
          onClick={() => onDelete(transaction.id)}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-150 flex items-center justify-center text-lg leading-none"
          title="Delete"
        >
          ×
        </button>
      </div>
    </li>
  );
}
