import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Search, Bookmark, Clock, Bus, TrainFront, TramFront, Truck as Van, LogIn, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const item = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[10px] font-medium transition ${
      isActive ? 'bg-primary text-white' : 'text-textmuted hover:bg-primary/10 hover:text-primary'
    }`;

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-20 bg-white border-r border-slate-200 flex-col items-center py-4 z-30">
      <Link to="/" className="mb-6 w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-heading font-extrabold">
        B!
      </Link>

      <nav className="flex flex-col gap-2 w-14">
        <NavLink to="/rute" className={item}>
          <Search size={20} />
          <span>Rute</span>
        </NavLink>
        <NavLink to="/simpan" className={item}>
          <Bookmark size={20} />
          <span>Simpan</span>
        </NavLink>
        <NavLink to="/riwayat" className={item}>
          <Clock size={20} />
          <span>Riwayat</span>
        </NavLink>
        {user?.role === 'Admin' && (
          <NavLink to="/admin" className={item}>
            <Shield size={20} />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-3 pb-2">
        <div className="flex flex-col gap-2 mb-2">
          <Dot color="bg-tj" Icon={Bus} />
          <Dot color="bg-krl" Icon={TrainFront} />
          <Dot color="bg-lrt" Icon={TramFront} />
          <Dot color="bg-mikro" Icon={Van} />
        </div>
        {user ? (
          <button onClick={async () => { await logout(); nav('/'); }} title="Keluar"
            className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-textmuted">
            <LogOut size={20} />
          </button>
        ) : (
          <Link to="/login" title="Masuk"
            className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
            <LogIn size={20} />
          </Link>
        )}
      </div>
    </aside>
  );
}

function Dot({ color, Icon }) {
  return (
    <div className="relative w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
      <Icon size={14} />
      <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${color}`} />
    </div>
  );
}
