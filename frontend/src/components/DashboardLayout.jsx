import { useNavigate } from 'react-router-dom';

function DashboardLayout({ title, links, active, onNavigate, children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* blue top bar */}
      <header className="bg-blue-600 text-white flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <span>🎓</span> ProjectTrack
        </div>
        <button onClick={logout} className="text-sm hover:underline">Logout</button>
      </header>

      <div className="flex flex-1">
        {/* light-blue sidebar */}
        <aside className="bg-blue-100 w-52 p-4 space-y-1">
          {links.map((link) => (
            <button
              key={link.key}
              onClick={() => onNavigate(link.key)}
              className={`block w-full text-left px-3 py-2 rounded text-sm ${
                active === link.key ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-blue-200'
              }`}
            >
              {link.label}
            </button>
          ))}
        </aside>

        {/* main content */}
        <main className="flex-1 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">{title}</h2>
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
