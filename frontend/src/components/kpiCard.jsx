export default function KpiCard({
  title = "Error loading",
  value = "Error loading",
  titleColor = "text-slate-500",
  valueColor = "text-slate-800",
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <span className={`font-semibold text-sm ${titleColor}`}>{title}</span>
      <div className={`text-2xl text-center mt-1 ${valueColor}`}>{value}</div>
    </div>
  );
}
