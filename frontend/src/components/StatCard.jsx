function StatCard({ value, label }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-6 py-4 text-center shadow-sm min-w-[140px]">
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}

export default StatCard;
