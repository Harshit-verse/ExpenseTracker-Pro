import { formatCurrency } from "../utils/helpers";

export default function Balance({ transactions }) {
  const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
  const income  = transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const expense = transactions.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);

  const cards = [
    {
      label: "Net Balance",
      value: formatCurrency(balance),
      icon: "⚖️",
      gradient: "from-emerald-500 to-teal-400",
      shadow: "shadow-emerald-200 dark:shadow-emerald-900",
    },
    {
      label: "Total Income",
      value: formatCurrency(income),
      icon: "📈",
      gradient: "from-green-500 to-lime-400",
      shadow: "shadow-green-200 dark:shadow-green-900",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(expense),
      icon: "📉",
      gradient: "from-rose-500 to-pink-400",
      shadow: "shadow-rose-200 dark:shadow-rose-900",
    },
    {
      label: "Transactions",
      value: transactions.length,
      icon: "🔄",
      gradient: "from-violet-500 to-indigo-400",
      shadow: "shadow-violet-200 dark:shadow-violet-900",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg ${card.shadow} hover:-translate-y-1 transition-transform duration-200 cursor-default`}
        >
          {/* Decorative circle */}
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -right-2 w-28 h-28 rounded-full bg-white/5" />

          <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1 relative z-10">
            {card.label}
          </p>
          <p className="text-xl sm:text-2xl font-bold relative z-10 truncate">
            {card.icon} {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
