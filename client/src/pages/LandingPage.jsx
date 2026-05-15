import { Link } from 'react-router-dom';
import { Bus, TrainFront, TramFront, Truck as Van, ArrowRight, MapPin, CircleDot } from 'lucide-react';

const MODES = [
  { Icon: Bus,        title: 'TransJakarta', desc: 'Seluruh koridor & BRT', color: 'bg-tj' },
  { Icon: TrainFront, title: 'KRL Commuter Line', desc: 'Jabodetabek', color: 'bg-krl' },
  { Icon: TramFront,  title: 'LRT Jabodebek', desc: 'Rute terbaru', color: 'bg-lrt' },
  { Icon: Van,        title: 'Mikrotrans', desc: 'Angkot & Feeder routes', color: 'bg-mikro' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen hero-bg text-white flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="BinusGO!" className="w-10 h-10 rounded-xl object-contain bg-white p-1" />
          <div>
            <div className="font-heading font-extrabold text-xl leading-none">BinusGO!</div>
            <div className="text-[10px] uppercase tracking-widest text-white/60">Transit Planner</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-success/20 border border-success/40 rounded-full text-xs font-medium text-success">
            <CircleDot size={12} /> Layanan Aktif
          </span>
          <Link to="/login" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm">Masuk</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-20">
        <h1 className="font-heading text-4xl md:text-6xl font-extrabold mb-3">
          Transit Cerdas <span className="text-primary">Menuju Kampus</span>
        </h1>
        <p className="max-w-xl text-white/70 mb-8">
          Cari rute terbaik ke seluruh kampus BINUS di Jabodetabek - TransJakarta, KRL, LRT, dan Mikrotrans dalam satu aplikasi.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 text-white mb-10">
          <Stat n="14" label="Kampus BINUS" />
          <Divider />
          <Stat n="4"  label="Mode Transit" />
          <Divider />
          <Stat n="100+" label="Rute Tersedia" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 w-full max-w-3xl">
          {MODES.map((m) => (
            <div key={m.title} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 text-left">
              <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-3`}>
                <m.Icon size={20} />
              </div>
              <div className="font-heading font-bold">{m.title}</div>
              <div className="text-xs text-white/60 mt-1">{m.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/rute" className="px-6 py-3 bg-accent hover:bg-accent/90 rounded-xl font-semibold text-white flex items-center gap-2">
            Mulai Sekarang <ArrowRight size={18} />
          </Link>
          <Link to="/rute" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold flex items-center gap-2">
            <MapPin size={18} /> Lihat Kampus
          </Link>
        </div>
      </main>

      <footer className="text-center text-white/40 text-xs py-6 border-t border-white/10">
        © {new Date().getFullYear()} BinusGO! - BINUS University. Dibuat untuk Mahasiswa, Dosen, & Staff.
      </footer>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="font-heading text-3xl font-extrabold">{n}</div>
      <div className="text-xs uppercase tracking-wider text-white/60">{label}</div>
    </div>
  );
}
function Divider() { return <div className="w-px h-8 bg-white/20" />; }
