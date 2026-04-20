function ChartContainer({ title, data }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-100">{title}</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-orange-400"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ChartContainer;
