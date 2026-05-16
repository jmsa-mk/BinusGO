import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bookmark, Clock, Bus, TrainFront, TramFront, Truck as Van, LogIn, LogOut, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const itemDesktop = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[10px] font-medium transition ${
      isActive ? 'bg-primary text-white' : 'text-textmuted hover:bg-primary/10 hover:text-primary'
    }`;

  const itemMobile = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive ? 'bg-primary text-white' : 'text-textmain hover:bg-primary/10 hover:text-primary'
    }`;

  async function doLogout() { await logout(); nav('/'); setOpen(false); }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 right-3 z-[60] w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 flex items-center justify-center"
        aria-label="Buka menu"
      >
        <Menu size={20} className="text-textmain" />
      </button>

      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-20 bg-white border-r border-slate-200 flex-col items-center py-4 z-30">
        <Link to="/" className="mb-6 w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-white">
          <img src="/logo.jpg" alt="BinusGO!" className="w-full h-full object-contain" />
        </Link>

        <nav className="flex flex-col gap-2 w-14">
          <NavLink to="/rute" className={itemDesktop}><Search size={20} /><span>Rute</span></NavLink>
          <NavLink to="/simpan" className={itemDesktop}><Bookmark size={20} /><span>Simpan</span></NavLink>
          <NavLink to="/riwayat" className={itemDesktop}><Clock size={20} /><span>Riwayat</span></NavLink>
          {user?.role === 'Admin' && (
            <NavLink to="/admin" className={itemDesktop}><Shield size={20} /><span>Admin</span></NavLink>
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
            <button onClick={doLogout} title="Keluar"
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

      <div className={`md:hidden fixed inset-0 z-[70] transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          className={`absolute top-0 left-0 h-full w-72 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <img src="/logo.jpg" alt="BinusGO!" className="w-10 h-10 rounded-xl object-contain bg-white" />
              <div>
                <div className="font-heading font-extrabold leading-none">BinusGO!</div>
                <div className="text-[10px] uppercase tracking-widest text-textmuted">Transit Planner</div>
              </div>
            </Link>
            <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
              <X size={20} />
            </button>
          </div>

          {user && (
            <div className="px-4 py-3 bg-primary/5 border-b border-slate-100">
              <div className="text-xs text-textmuted">Masuk sebagai</div>
              <div className="font-semibold truncate">{user.name}</div>
              <div className="text-[11px] text-textmuted">{user.role} · {user.email}</div>
            </div>
          )}

          <nav className="flex flex-col gap-1 p-3 flex-1">
            <NavLink to="/rute" className={itemMobile}><Search size={18} /><span>Cari Rute</span></NavLink>
            <NavLink to="/simpan" className={itemMobile}><Bookmark size={18} /><span>Lokasi Tersimpan</span></NavLink>
            <NavLink to="/riwayat" className={itemMobile}><Clock size={18} /><span>Riwayat Perjalanan</span></NavLink>
            {user?.role === 'Admin' && (
              <NavLink to="/admin" className={itemMobile}><Shield size={18} /><span>Admin Panel</span></NavLink>
            )}
          </nav>

          <div className="px-4 py-3 border-t border-slate-100">
            <div className="text-[10px] uppercase tracking-widest text-textmuted mb-2">Mode Transit Aktif</div>
            <div className="flex gap-3">
              <ModeBadge color="bg-tj" Icon={Bus} label="TJ" />
              <ModeBadge color="bg-krl" Icon={TrainFront} label="KRL" />
              <ModeBadge color="bg-lrt" Icon={TramFront} label="LRT" />
              <ModeBadge color="bg-mikro" Icon={Van} label="Mikro" />
            </div>
          </div>

          <div className="p-3 border-t border-slate-100">
            {user ? (
              <button onClick={doLogout}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                <LogOut size={16} /> Keluar
              </button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                <LogIn size={16} /> Masuk Sekarang
              </Link>
            )}
          </div>
        </aside>
      </div>
    </>
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

function ModeBadge({ color, Icon, label }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-lg">
      <div className={`w-6 h-6 rounded-md ${color} flex items-center justify-center text-white`}>
        <Icon size={12} />
      </div>
      <span className="text-[9px] font-bold text-textmuted">{label}</span>
    </div>
  );
}
