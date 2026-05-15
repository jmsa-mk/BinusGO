import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, IdCard, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', nim: '', role: 'Mahasiswa', email: '', password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  function up(k, v) { setF((s) => ({ ...s, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (f.password !== f.confirm) return setErr('Password tidak cocok');
    setBusy(true);
    try {
      await register({ name: f.name, nim: f.nim, role: f.role, email: f.email, password: f.password });
      nav('/rute');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="skyline-bg text-white p-10 md:p-14 flex flex-col justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-heading font-extrabold">B!</div>
          <div className="font-heading font-extrabold text-xl">BinusGO!</div>
        </Link>
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-3">Daftar gratis,<br/>mulai bertransit.</h2>
          <p className="text-white/70">Khusus untuk mahasiswa, dosen, dan staff BINUS University.</p>
        </div>
        <div className="text-xs text-white/50">© BinusGO!</div>
      </div>

      <div className="bg-lightbg p-8 md:p-14 flex items-center justify-center">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h1 className="font-heading text-2xl font-extrabold mb-1">Buat akun baru</h1>
          <p className="text-textmuted text-sm mb-6">Lengkapi data berikut</p>

          {err && <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">{err}</div>}

          <Field Icon={User} placeholder="Nama lengkap" value={f.name} onChange={(v) => up('name', v)} />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Field Icon={IdCard} placeholder="NIM/NIK" value={f.nim} onChange={(v) => up('nim', v)} />
            <select value={f.role} onChange={(e) => up('role', e.target.value)}
              className="bg-white rounded-xl px-3 py-3 border border-slate-200 text-sm outline-none">
              <option>Mahasiswa</option>
              <option>Dosen</option>
              <option>Staff</option>
            </select>
          </div>
          <div className="mt-3"><Field Icon={Mail} type="email" placeholder="email@binus.ac.id" value={f.email} onChange={(v) => up('email', v)} /></div>
          <div className="mt-3"><Field Icon={Lock} type="password" placeholder="Password" value={f.password} onChange={(v) => up('password', v)} /></div>
          <div className="mt-3"><Field Icon={Lock} type="password" placeholder="Konfirmasi password" value={f.confirm} onChange={(v) => up('confirm', v)} /></div>

          <button disabled={busy}
            className="mt-5 w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
            {busy ? 'Memproses…' : <>Daftar <ArrowRight size={18} /></>}
          </button>

          <p className="mt-5 text-center text-sm text-textmuted">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary font-semibold">Masuk</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ Icon, ...p }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-3 border border-slate-200 focus-within:border-primary">
      <Icon size={16} className="text-textmuted" />
      <input className="flex-1 bg-transparent outline-none text-sm" {...p} onChange={(e) => p.onChange(e.target.value)} />
    </div>
  );
}
