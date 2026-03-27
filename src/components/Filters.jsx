const FILTERS = [
  { value: "all",     label: "All",      icon: "🔀" },
  { value: "income",  label: "Income",   icon: "💚" },
  { value: "expense", label: "Expenses", icon: "❤️" },
];

const SORTS = [
  { value: "date-desc",   label: "Newest" },
  { value: "date-asc",    label: "Oldest" },
  { value: "amount-desc", label: "Highest" },
  { value: "amount-asc",  label: "Lowest" },
];

export default function Filters({ filter, sort, onFilter, onSort }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              filter === f.value
                ? "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={(e) => onSort(e.target.value)}
        className="ml-auto text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
