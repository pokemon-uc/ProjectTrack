export function AuthCard({ children }) {
  return (
    <div
      className="
        rounded-[18px] border border-slate-200/80 bg-white
        px-8 py-9
        shadow-[0_18px_50px_rgba(15,23,42,0.12)]
      "
    >
      {children}
    </div>
  );
}

export function AuthBrand() {
  return (
    <div className="mb-6 flex flex-col items-center">
      <ProjectTrackLogo />

      <h1 className="mt-3 text-[26px] font-bold tracking-[-0.04em]">
        <span className="text-[#4051c7]">Project</span>
        <span className="text-[#171a4a]">Track</span>
      </h1>
    </div>
  );
}

export function AuthField({ icon, error, children }) {
  return (
    <div
      className={`
        flex h-[48px] items-center gap-3 rounded-lg border-2
        bg-white px-3 transition-all
        focus-within:border-sky-400
        focus-within:shadow-[0_0_0_3px_rgba(56,189,248,0.15)]
        ${error ? "border-red-400" : "border-slate-200"}
      `}
    >
      {icon}
      {children}
    </div>
  );
}

export function MailIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="m3 7 9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" strokeWidth={1.8} />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <circle cx="12" cy="8" r="4" strokeWidth={1.8} />

      <path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProjectTrackLogo() {
  return (
    <svg
      width="66"
      height="66"
      viewBox="0 0 66 66"
      fill="none"
      aria-hidden="true"
    >
      <rect width="66" height="66" rx="16" fill="#F0F2FF" />

      <path
        d="M23 16h22v31H23z"
        stroke="#3443A8"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <rect x="28" y="12" width="12" height="8" rx="3" fill="#3443A8" />

      <path
        d="m28 31 5 5 9-11"
        stroke="#4051C7"
        strokeWidth="3.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="47"
        cy="47"
        r="10"
        fill="#F0F2FF"
        stroke="#4051C7"
        strokeWidth="3"
      />

      <path
        d="M47 42v10M42 47h10"
        stroke="#4051C7"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}