import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Route as RouteIcon, X } from 'lucide-react';
import { api } from '../../api/binusgo.js';
import Modal from '../../components/admin/Modal.jsx';

const MODES = ['TransJakarta', 'KRL', 'LRT', 'Mikrotrans'];
const STEP_TYPES = ['walk', 'TransJakarta', 'KRL', 'LRT', 'Mikrotrans'];
const WP_MODES = ['walk', 'TransJakarta', 'KRL', 'LRT', 'Mikrotrans'];
const EMPTY = {
  origin: '', destinationCampus: '', modes: [], durationMin: 0, price: 0,
  steps: [{ type: 'walk', durationMin: 5, stopName: '', line: '' }],
  jadwal: [], waypoints: [], status: 'Aktif',
};

export default function RouteManagement() {
  const [items, setItems] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [jadwalInput, setJadwalInput] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { load(); api.campuses().then(setCampuses); }, []);
  async function load() { setItems(await api.routes()); }

  const filtered = useMemo(() => items.filter((r) => {
    if (!q) return true;
    const s = `${r.origin} ${r.destinationCampus?.name} ${r.modes.join(' ')}`.toLowerCase();
    return s.includes(q.toLowerCase());
  }), [items, q]);

  function openNew() { setForm(EMPTY); setJadwalInput(''); setModal('new'); }
  function openEdit(r) {
    setForm({
      ...r,
      destinationCampus: r.destinationCampus?._id || r.destinationCampus,
      jadwal: r.jadwal || [], steps: r.steps || [], waypoints: r.waypoints || [],
    });
    setJadwalInput((r.jadwal || []).join(', '));
    setModal(r);
  }
  function up(k, v) { setForm((s) => ({ ...s, [k]: v })); }
  function toggleMode(m) {
    setForm((s) => ({ ...s, modes: s.modes.includes(m) ? s.modes.filter((x) => x !== m) : [...s.modes, m] }));
  }
  function updateStep(i, k, v) {
    setForm((s) => ({ ...s, steps: s.steps.map((st, idx) => idx === i ? { ...st, [k]: v } : st) }));
  }
  function addStep() { setForm((s) => ({ ...s, steps: [...s.steps, { type: 'walk', durationMin: 5, stopName: '', line: '' }] })); }
  function removeStep(i) { setForm((s) => ({ ...s, steps: s.steps.filter((_, idx) => idx !== i) })); }

  function updateWp(i, k, v) {
    setForm((s) => ({ ...s, waypoints: s.waypoints.map((w, idx) => idx === i ? { ...w, [k]: v } : w) }));
  }
  function addWp() {
    const last = form.waypoints[form.waypoints.length - 1];
    setForm((s) => ({ ...s, waypoints: [...s.waypoints, { lat: last?.lat || -6.2088, lng: last?.lng || 106.8456, stopName: '', transitMode: 'walk' }] }));
  }
  function removeWp(i) { setForm((s) => ({ ...s, waypoints: s.waypoints.filter((_, idx) => idx !== i) })); }

  function autoFillWaypoints() {
    const campus = campuses.find((c) => c._id === form.destinationCampus);
    if (!campus) return alert('Pilih kampus tujuan dulu.');
    const wps = form.steps
      .filter((s) => s.stopName)
      .map((s, i, arr) => ({
        lat: i === arr.length - 1 ? campus.lat : -6.2088 + (Math.random() - 0.5) * 0.1,
        lng: i === arr.length - 1 ? campus.lng : 106.8456 + (Math.random() - 0.5) * 0.1,
        stopName: s.stopName,
        transitMode: s.type,
      }));
    if (wps.length < 2) return alert('Minimal 2 step dengan nama stop diperlukan.');
    wps[wps.length - 1] = { ...wps[wps.length - 1], lat: campus.lat, lng: campus.lng, stopName: campus.name };
    setForm((s) => ({ ...s, waypoints: wps }));
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        durationMin: form.steps.reduce((sum, s) => sum + Number(s.durationMin || 0), 0),
        price: Number(form.price),
        jadwal: jadwalInput.split(',').map((s) => s.trim()).filter(Boolean),
        steps: form.steps.map((s) => ({ ...s, durationMin: Number(s.durationMin || 0) })),
      };
      if (modal === 'new') await api.routeCreate(payload);
      else await api.routeUpdate(modal._id, payload);
      setModal(null); await load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function del(r) {
    if (!confirm(`Hapus rute "${r.origin} → ${r.destinationCampus?.name}"?`)) return;
    await api.routeDelete(r._id); await load();
  }

  return (
    <div className="p-6 md:p-10 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold flex items-center gap-2">
            <RouteIcon className="text-primary" /> Manajemen Rute
          </h1>
          <p className="text-textmuted text-sm">Total {items.length} rute tersedia</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold flex items-center gap-2">
          <Plus size={16} /> Tambah Rute
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
          <Search size={16} className="text-textmuted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari asal/tujuan/mode..."
            className="flex-1 bg-transparent outline-none text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-textmuted text-xs uppercase border-b border-slate-100">
            <tr>
              <th className="px-4 py-3">Asal</th>
              <th>Tujuan</th>
              <th>Mode</th>
              <th>Durasi</th>
              <th>Harga</th>
              <th>Langkah</th>
              <th>Status</th>
              <th className="text-right pr-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-semibold">{r.origin}</td>
                <td className="max-w-[220px] truncate">{r.destinationCampus?.name}</td>
                <td className="space-x-1">{r.modes.map((m) => <span key={m} className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded">{m}</span>)}</td>
                <td className="font-mono text-xs">{r.durationMin} mnt</td>
                <td className="font-mono text-xs">Rp {r.price.toLocaleString('id-ID')}</td>
                <td className="font-mono text-xs">{r.steps?.length || 0}</td>
                <td>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    r.status === 'Aktif' ? 'bg-success/15 text-success' : 'bg-slate-200 text-textmuted'
                  }`}>{r.status}</span>
                </td>
                <td className="text-right pr-4">
                  <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-primary/10 text-primary rounded"><Pencil size={14} /></button>
                  <button onClick={() => del(r)} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="8" className="py-10 text-center text-textmuted">Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'new' ? 'Tambah Rute' : 'Edit Rute'} size="xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Asal (Origin)" value={form.origin} onChange={(v) => up('origin', v)} required />
            <div>
              <label className="text-xs font-semibold text-textmuted">Tujuan (Kampus)</label>
              <select value={form.destinationCampus} onChange={(e) => up('destinationCampus', e.target.value)} required
                className="w-full mt-1 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none">
                <option value="">Pilih kampus…</option>
                {campuses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-textmuted">Mode Transit (multi)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {MODES.map((m) => (
                <button type="button" key={m} onClick={() => toggleMode(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    form.modes.includes(m) ? 'bg-primary text-white' : 'bg-slate-100 text-textmuted'
                  }`}>{m}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Harga (Rp)" type="number" value={form.price} onChange={(v) => up('price', v)} required />
            <div>
              <label className="text-xs font-semibold text-textmuted">Status</label>
              <select value={form.status} onChange={(e) => up('status', e.target.value)}
                className="w-full mt-1 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none">
                <option>Aktif</option><option>Nonaktif</option>
              </select>
            </div>
          </div>

          <Input label="Jadwal (pisah koma, mis: 06:30, 07:15, 08:00)"
            value={jadwalInput} onChange={setJadwalInput} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-textmuted">Langkah (Steps)</label>
              <button type="button" onClick={addStep} className="text-xs text-primary font-semibold flex items-center gap-1">
                <Plus size={12} /> Tambah Step
              </button>
            </div>
            <div className="space-y-2">
              {form.steps.map((s, i) => (
                <div key={i} className="grid grid-cols-[auto_140px_90px_1fr_120px_auto] gap-2 items-center bg-slate-50 rounded-xl p-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  <select value={s.type} onChange={(e) => updateStep(i, 'type', e.target.value)}
                    className="bg-white rounded-lg px-2 py-1.5 text-xs outline-none">
                    {STEP_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <input type="number" value={s.durationMin} onChange={(e) => updateStep(i, 'durationMin', e.target.value)}
                    placeholder="menit" className="bg-white rounded-lg px-2 py-1.5 text-xs outline-none w-full" />
                  <input value={s.stopName} onChange={(e) => updateStep(i, 'stopName', e.target.value)}
                    placeholder="Nama stop" className="bg-white rounded-lg px-2 py-1.5 text-xs outline-none w-full" />
                  <input value={s.line || ''} onChange={(e) => updateStep(i, 'line', e.target.value)}
                    placeholder="Line/Koridor" className="bg-white rounded-lg px-2 py-1.5 text-xs outline-none w-full" />
                  <button type="button" onClick={() => removeStep(i)} className="text-red-400 hover:text-red-600 p-1"><X size={14} /></button>
                </div>
              ))}
            </div>
            <div className="text-xs text-textmuted mt-2">Total durasi otomatis = {form.steps.reduce((a, s) => a + Number(s.durationMin || 0), 0)} menit</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-textmuted">
                Waypoints <span className="font-normal">(koordinat untuk polyline di peta)</span>
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={autoFillWaypoints}
                  className="text-xs text-accent font-semibold">⚡ Auto-fill dari Steps</button>
                <button type="button" onClick={addWp} className="text-xs text-primary font-semibold flex items-center gap-1">
                  <Plus size={12} /> Tambah Waypoint
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {form.waypoints.map((w, i) => (
                <div key={i} className="grid grid-cols-[auto_100px_100px_1fr_130px_auto] gap-2 items-center bg-slate-50 rounded-xl p-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  <input type="number" step="any" value={w.lat} onChange={(e) => updateWp(i, 'lat', parseFloat(e.target.value))}
                    placeholder="lat" className="bg-white rounded-lg px-2 py-1.5 text-xs outline-none w-full font-mono" />
                  <input type="number" step="any" value={w.lng} onChange={(e) => updateWp(i, 'lng', parseFloat(e.target.value))}
                    placeholder="lng" className="bg-white rounded-lg px-2 py-1.5 text-xs outline-none w-full font-mono" />
                  <input value={w.stopName || ''} onChange={(e) => updateWp(i, 'stopName', e.target.value)}
                    placeholder="Stop name" className="bg-white rounded-lg px-2 py-1.5 text-xs outline-none w-full" />
                  <select value={w.transitMode || 'walk'} onChange={(e) => updateWp(i, 'transitMode', e.target.value)}
                    className="bg-white rounded-lg px-2 py-1.5 text-xs outline-none w-full">
                    {WP_MODES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <button type="button" onClick={() => removeWp(i)} className="text-red-400 hover:text-red-600 p-1"><X size={14} /></button>
                </div>
              ))}
              {form.waypoints.length === 0 && (
                <div className="text-xs text-textmuted bg-slate-50 rounded-xl p-3 text-center">
                  Belum ada waypoint. Tanpa waypoint, rute ini tidak akan tampil di peta.
                  Tekan <b>Auto-fill</b> untuk generate dari steps + koordinat kampus.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100">Batal</button>
            <button disabled={busy} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-60">
              {busy ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Input({ label, onChange, ...p }) {
  return (
    <div>
      <label className="text-xs font-semibold text-textmuted">{label}</label>
      <input {...p} onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
}
