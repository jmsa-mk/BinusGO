import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Building2 } from 'lucide-react';
import { api } from '../../api/binusgo.js';
import Modal from '../../components/admin/Modal.jsx';

const CLUSTERS = ['KEMANGGISAN', 'ALAM SUTERA', 'BSD', 'BEKASI', 'BANDUNG', 'MALANG', 'SEMARANG', 'MEDAN', 'ONLINE'];
const EMPTY = { name: '', cluster: 'KEMANGGISAN', address: '', lat: -6.2088, lng: 106.8456, status: 'Aktif' };

export default function CampusManagement() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [cluster, setCluster] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() { setItems(await api.campuses()); }

  const filtered = useMemo(() => items.filter((c) => {
    if (cluster && c.cluster !== cluster) return false;
    if (q && !`${c.name} ${c.address}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, q, cluster]);

  function openNew() { setForm(EMPTY); setModal('new'); }
  function openEdit(c) { setForm({ ...c }); setModal(c); }
  function up(k, v) { setForm((s) => ({ ...s, [k]: v })); }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) };
      if (modal === 'new') await api.campusCreate(payload);
      else await api.campusUpdate(modal._id, payload);
      setModal(null);
      await load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function del(c) {
    if (!confirm(`Hapus "${c.name}"?`)) return;
    await api.campusDelete(c._id);
    await load();
  }

  return (
    <div className="p-6 md:p-10 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold flex items-center gap-2">
            <Building2 className="text-primary" /> Manajemen Kampus
          </h1>
          <p className="text-textmuted text-sm">Kelola data {items.length} kampus BINUS</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold flex items-center gap-2">
          <Plus size={16} /> Tambah Kampus
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 rounded-xl px-3 py-2">
          <Search size={16} className="text-textmuted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kampus/alamat..."
            className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <select value={cluster} onChange={(e) => setCluster(e.target.value)}
          className="bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none">
          <option value="">Semua Cluster</option>
          {CLUSTERS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-textmuted text-xs uppercase border-b border-slate-100">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th>Nama Kampus</th>
              <th>Cluster</th>
              <th>Alamat</th>
              <th>Koordinat</th>
              <th>Status</th>
              <th className="text-right pr-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c._id} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-[11px] text-textmuted">{c._id.slice(-6)}</td>
                <td className="font-semibold">{c.name}</td>
                <td><span className="text-[10px] font-bold font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">{c.cluster}</span></td>
                <td className="text-textmuted max-w-[260px] truncate">{c.address}</td>
                <td className="font-mono text-[11px]">{c.lat.toFixed(4)}, {c.lng.toFixed(4)}</td>
                <td>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    c.status === 'Aktif' ? 'bg-success/15 text-success' : 'bg-slate-200 text-textmuted'
                  }`}>{c.status}</span>
                </td>
                <td className="text-right pr-4">
                  <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-primary/10 text-primary rounded"><Pencil size={14} /></button>
                  <button onClick={() => del(c)} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" className="py-10 text-center text-textmuted">Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'new' ? 'Tambah Kampus' : 'Edit Kampus'} size="lg">
        <form onSubmit={save} className="space-y-3">
          <Input label="Nama Kampus" value={form.name} onChange={(v) => up('name', v)} required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-textmuted">Cluster</label>
              <select value={form.cluster} onChange={(e) => up('cluster', e.target.value)}
                className="w-full mt-1 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none">
                {CLUSTERS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-textmuted">Status</label>
              <select value={form.status} onChange={(e) => up('status', e.target.value)}
                className="w-full mt-1 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none">
                <option>Aktif</option><option>Nonaktif</option>
              </select>
            </div>
          </div>
          <Input label="Alamat" value={form.address} onChange={(v) => up('address', v)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Latitude" type="number" step="any" value={form.lat} onChange={(v) => up('lat', v)} required />
            <Input label="Longitude" type="number" step="any" value={form.lng} onChange={(v) => up('lng', v)} required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
