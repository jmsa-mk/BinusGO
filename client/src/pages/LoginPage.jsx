import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Bus, TrainFront, TramFront, Truck as Van, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const u = await login(email, password);
      nav(u.role === 'Admin' ? '/admin' : '/rute');
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
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">
            Perjalanan cerdas<br/>dimulai dari sini.
          </h2>
          <p className="text-white/70 mb-6 max-w-sm">Akses 100+ rute transit ke kampus BINUS — di mana pun kamu berada.</p>
          <ul className="space-y-2 text-sm">
            <ModeLi color="text-tj" Icon={Bus} t="TransJakarta" />
            <ModeLi color="text-krl" Icon={TrainFront} t="KRL Commuter Line" />
            <ModeLi color="text-lrt" Icon={TramFront} t="LRT Jabodebek" />
            <ModeLi color="text-mikro" Icon={Van} t="Mikrotrans" />
          </ul>
        </div>
        <div className="text-xs text-white/50">© BinusGO! · BINUS University</div>
      </div>

      <div className="bg-lightbg p-8 md:p-14 flex items-center justify-center">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h1 className="font-heading text-2xl font-extrabold mb-1">Masuk ke akunmu</h1>
          <p className="text-textmuted text-sm mb-6">Selamat datang kembali!</p>

          {err && <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">{err}</div>}

          <Field Icon={Mail} type="email" value={email} onChange={setEmail} placeholder="something@mail.com" />
          <div className="flex justify-between text-xs mb-1 mt-3">
            <span className="text-textmuted">Password</span>
            <a href="#" className="text-primary">Lupa Password?</a>
          </div>
          <Field Icon={Lock} type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          <label className="flex items-center gap-2 text-sm text-textmuted mt-3">
            <input type="checkbox" className="accent-primary" /> Ingat saya di perangkat ini
          </label>

          <button disabled={busy}
            className="mt-5 w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
            {busy ? 'Memproses…' : <>Masuk Sekarang <ArrowRight size={18} /></>}
          </button>

          <div className="flex items-center gap-3 my-5 text-xs text-textmuted">
            <div className="flex-1 h-px bg-slate-200" /> atau <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="py-2 border border-slate-200 rounded-xl text-sm hover:bg-white">Google</button>
            <button type="button" className="py-2 border border-slate-200 rounded-xl text-sm hover:bg-white">Microsoft</button>
          </div>

          <p className="mt-5 text-center text-sm text-textmuted">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary font-semibold">Daftar Sekarang</Link>
          </p>
          <p className="mt-4 text-center text-[11px] text-textmuted/70">
            Dengan masuk, kamu menyetujui Ketentuan & Kebijakan Privasi BinusGO!.
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

function ModeLi({ Icon, t, color }) {
  return <li className="flex items-center gap-2"><Icon size={16} className={color} /> {t}</li>;
}
