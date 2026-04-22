function Table({ columns, rows, emptyMessage = "No data available." }) {
  if (!rows || rows.length === 0) {
    return (
      <div
        className="flex h-40 items-center justify-center rounded-xl border text-sm"
        style={{
          borderColor: "var(--border-default)",
          backgroundColor: "var(--bg-subtle)",
          color: "var(--text-muted)",
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className="relative overflow-x-auto rounded-xl border animate-fade-in"
      style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
    >
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead>
          <tr
            className="border-b"
            style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-subtle)" }}
          >
            {columns.map(column => (
              <th
                key={column.key}
                className={`px-5 py-4 text-[11px] font-bold uppercase tracking-widest ${column.className || ""}`}
                style={{ color: "var(--text-muted)" }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${i}-${row[columns[0].key] ?? "row"}`}
              className="border-b last:border-0 transition-all duration-300 cursor-default hover:bg-toggle/50 group"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {columns.map(column => (
                <td
                  key={column.key}
                  className={`px-5 py-4 transition-transform duration-300 group-hover:translate-x-1 ${column.className || ""}`}
                  style={{ color: "var(--text-secondary)" }}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
