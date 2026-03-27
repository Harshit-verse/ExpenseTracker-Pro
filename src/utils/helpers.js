export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);

export const CATEGORIES = [
  { value: "food",          label: "Food & Dining",    icon: "🍔", color: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
  { value: "transport",     label: "Transport",        icon: "🚗", color: "#3b82f6", bg: "#dbeafe", text: "#1e40af" },
  { value: "entertainment", label: "Entertainment",    icon: "🎬", color: "#ec4899", bg: "#fce7f3", text: "#9f1239" },
  { value: "shopping",      label: "Shopping",         icon: "🛍️", color: "#6366f1", bg: "#e0e7ff", text: "#3730a3" },
  { value: "bills",         label: "Bills & Utilities",icon: "💡", color: "#ef4444", bg: "#fee2e2", text: "#991b1b" },
  { value: "salary",        label: "Salary",           icon: "💼", color: "#10b981", bg: "#d1fae5", text: "#065f46" },
  { value: "freelance",     label: "Freelance",        icon: "💻", color: "#8b5cf6", bg: "#ddd6fe", text: "#5b21b6" },
  { value: "health",        label: "Health",           icon: "🏥", color: "#14b8a6", bg: "#ccfbf1", text: "#134e4a" },
  { value: "education",     label: "Education",        icon: "📚", color: "#f97316", bg: "#ffedd5", text: "#7c2d12" },
  { value: "other",         label: "Other",            icon: "📌", color: "#6b7280", bg: "#f3f4f6", text: "#374151" },
];

export const getCategoryMeta = (value) =>
  CATEGORIES.find((c) => c.value === value) || CATEGORIES[CATEGORIES.length - 1];

export const CHART_COLORS = [
  "#6366f1","#ec4899","#f59e0b","#10b981",
  "#3b82f6","#ef4444","#8b5cf6","#14b8a6","#f97316","#6b7280",
];

export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const getMonthlyData = (transactions) => {
  const map = {};
  transactions.forEach((t) => {
    const key = new Date(t.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (!map[key]) map[key] = { income: 0, expense: 0 };
    if (t.amount > 0) map[key].income += t.amount;
    else map[key].expense += Math.abs(t.amount);
  });
  const sorted = Object.entries(map).slice(-6);
  return {
    labels: sorted.map(([k]) => k),
    income: sorted.map(([, v]) => v.income),
    expenses: sorted.map(([, v]) => v.expense),
  };
};

export const getCategoryExpenses = (transactions) => {
  const map = {};
  transactions
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
    });
  return map;
};

export const exportToCSV = (transactions) => {
  const header = ["Date","Description","Category","Amount","Tags","Notes"];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString("en-IN"),
    `"${t.title}"`,
    t.category,
    t.amount,
    `"${(t.tags || []).join(", ")}"`,
    `"${t.notes || ""}"`,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
};
