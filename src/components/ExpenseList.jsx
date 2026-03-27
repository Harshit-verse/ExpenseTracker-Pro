import ExpenseItem from "./ExpenseItem";
import SearchBar from "./SearchBar";
import Filters from "./Filters";
import { useState, useMemo } from "react";

export default function ExpenseList({ transactions, onDelete }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort]     = useState("date-desc");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    let list = [...transactions];

    // filter
    if (filter === "income")  list = list.filter(t => t.amount > 0);
    if (filter === "expense") list = list.filter(t => t.amount < 0);

    // search
    if (search.trim())
      list = list.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );

    // sort
    list.sort((a, b) => {
      if (sort === "date-desc")   return new Date(b.date) - new Date(a.date);
      if (sort === "date-asc")    return new Date(a.date) - new Date(b.date);
      if (sort === "amount-desc") return Math.abs(b.amount) - Math.abs(a.amount);
      if (sort === "amount-asc")  return Math.abs(a.amount) - Math.abs(b.amount);
      return 0;
    });

    return list;
  }, [transactions, filter, sort, search]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <SearchBar value={search} onChange={setSearch} />
      </div>
      <Filters filter={filter} sort={sort} onFilter={setFilter} onSort={setSort} />

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
        {visible.length} transaction{visible.length !== 1 ? "s" : ""}
      </p>

      {visible.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 py-16 gap-3">
          <span className="text-6xl">🪹</span>
          <p className="text-sm font-medium">
            {search ? "No results found" : "No transactions yet"}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-violet-500 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 max-h-[460px] custom-scroll">
          {visible.map((t) => (
            <ExpenseItem key={t.id} transaction={t} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}
