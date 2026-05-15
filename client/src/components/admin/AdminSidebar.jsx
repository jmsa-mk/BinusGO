import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Building2, Route as RouteIcon, Users, BarChart3, Settings, FileClock, ArrowLeft } from 'lucide-react';

const ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/kampus', icon: Building2, label: 'Kampus' },
  { to: '/admin/rute', icon: RouteIcon, label: 'Rute' },
  { to: '/admin/pengguna', icon: Users, label: 'Pengguna' },
  { to: '/admin/laporan', icon: BarChart3, label: 'Laporan' },
  { to: '/admin/pengaturan', icon: Settings, label: 'Setting' },
  { to: '/admin/log', icon: FileClock, label: 'Log' },
];

export default function AdminSidebar() {
  return (
    <aside className="hidden md:flex fixed top-0 left-20 h-screen w-56 bg-darkbg text-white flex-col py-5 px-3 z-20">
      <div className="px-2 mb-6">
        <div className="font-heading font-extrabold text-lg">Admin Panel</div>
        <div className="text-[10px] uppercase tracking-widest text-white/40">BinusGO!</div>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            onClick={(e) => it.disabled && e.preventDefault()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                it.disabled ? 'text-white/30 cursor-not-allowed' :
                isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/10'
              }`}
          >
            <it.icon size={16} />
            {it.label}
            {it.disabled && <span className="ml-auto text-[9px] bg-white/10 px-1 rounded">soon</span>}
          </NavLink>
        ))}
      </nav>
      <Link to="/rute" className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white">
        <ArrowLeft size={14} /> Kembali ke App
      </Link>
    </aside>
  );
}
