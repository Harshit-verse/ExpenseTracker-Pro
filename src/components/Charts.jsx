import { useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { getCategoryExpenses, getMonthlyData, CHART_COLORS, getCategoryMeta, formatCurrency } from "../utils/helpers";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-medium">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Charts({ transactions, dark }) {
  const catData = useMemo(() => {
    const map = getCategoryExpenses(transactions);
    return Object.entries(map).map(([cat, value]) => ({
      name: getCategoryMeta(cat).label,
      value,
      icon: getCategoryMeta(cat).icon,
    }));
  }, [transactions]);

  const monthly = useMemo(() => {
    const { labels, income, expenses } = getMonthlyData(transactions);
    return labels.map((l, i) => ({ month: l, Income: income[i], Expenses: expenses[i] }));
  }, [transactions]);

  const axisStyle = {
    tick: { fill: dark ? "#9ca3af" : "#6b7280", fontSize: 11 },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Pie chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 text-sm uppercase tracking-wide">
          🥧 Spending by Category
        </h3>
        {catData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-300 dark:text-gray-600 text-sm">
            No expense data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={catData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {catData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bar chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 text-sm uppercase tracking-wide">
          📊 Monthly Overview
        </h3>
        {monthly.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-300 dark:text-gray-600 text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#f3f4f6"} />
              <XAxis dataKey="month" {...axisStyle} />
              <YAxis
                tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
                {...axisStyle}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="Income"   fill="#10b981" radius={[6,6,0,0]} />
              <Bar dataKey="Expenses" fill="#f43f5e" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
