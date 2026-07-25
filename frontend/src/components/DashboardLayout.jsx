import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  FileText,
  FileUp,
  Flag,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
} from "lucide-react";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const ROLE_LINKS = {
  guide: [
    { to: "/guide", label: "Assigned Projects", icon: FolderKanban },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  coordinator: [
    { to: "/coordinator", label: "Dashboard", icon: LayoutDashboard },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
};

function getStudentLinks(projectId) {
  const projectPath = projectId ? `/projects/${projectId}` : null;

  return [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard },
    { to: projectPath, label: "My Project", icon: FolderKanban },
    {
      to: projectPath && `${projectPath}#submissions`,
      label: "Submit Report",
      icon: FileUp,
    },
    {
      to: projectPath && `${projectPath}#milestones`,
      label: "Milestones",
      icon: Flag,
    },
    {
      to: projectPath && `${projectPath}#discussion`,
      label: "Discussion",
      icon: MessageCircle,
    },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings },
  ];
}

export default function DashboardLayout({ children, projectId }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const savedProjectId = localStorage.getItem("activeProjectId");
  const activeProjectId = projectId || savedProjectId;

  const links =
    user?.role === "student"
      ? getStudentLinks(activeProjectId)
      : ROLE_LINKS[user?.role] || [];

  useEffect(() => {
    if (projectId) {
      localStorage.setItem("activeProjectId", String(projectId));
    }
  }, [projectId]);

  useEffect(() => {
    const fetchNotifications = () => {
      api
        .get("/notifications")
        .then((response) => {
          setUnreadCount(Number(response.data.unread ?? 0));
        })
        .catch(() => {});
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("activeProjectId");
    logout();
    addToast("Logged out successfully", "info");
    navigate("/login", { replace: true });
  };

  const isLinkActive = (to) => {
    if (!to) return false;

    const [pathname, hashValue] = to.split("#");
    const expectedHash = hashValue ? `#${hashValue}` : "";

    return location.pathname === pathname && location.hash === expectedHash;
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fd]">
      <aside className="hidden w-64 shrink-0 flex-col bg-gradient-to-b from-[#171942] to-[#0f1730] text-slate-300 lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4051c7] text-white shadow-lg shadow-indigo-950/30">
              <FileText size={20} strokeWidth={2} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                ProjectTrack
              </h1>
              <p className="mt-0.5 text-xs capitalize text-slate-400">
                {user?.role} panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {links.map(({ to, label, icon: Icon }) => {
            const active = isLinkActive(to);

            if (!to) {
              return (
                <div
                  key={label}
                  title="Create a project to unlock this section"
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600"
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                </div>
              );
            }

            return (
              <NavLink
                key={label}
                to={to}
                className={() =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-[#4051c7] text-white shadow-lg shadow-indigo-950/25"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>

                {label === "Notifications" && unreadCount > 0 && (
                  <span className="ml-auto min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4051c7] text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
