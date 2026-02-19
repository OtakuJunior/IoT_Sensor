export default function KpiCard({ title, value, subtitle, color }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5">
      <span className="text-slate-500 text-sm">{title}</span>
      <div className={`text-3xl font-bold mt-1 ${color}`}>{value}</div>
      <span className="text-slate-400 text-xs">{subtitle}</span>
    </div>
  );
}
