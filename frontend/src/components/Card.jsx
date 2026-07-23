export default function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm
        ${hover ? 'hover:shadow-md hover:border-gray-300 cursor-pointer transition-all duration-200' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon, label, value, color = 'indigo', onClick }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };
  const style = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      className={`border rounded-xl p-5 ${style} ${onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''}`}
    >
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1 opacity-80">{label}</p>
    </div>
  );
}
