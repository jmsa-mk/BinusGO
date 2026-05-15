import { useEffect, useMemo, useState } from 'react';
import { Search, Users, Trash2, Ban, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/binusgo.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ROLES = ['Mahasiswa', 'Dosen', 'Staff', 'Admin'];

export default function UserManagement() {
  const { user: me } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { setItems(await api.adminUsers()); }

  const filtered = useMemo(() => items.filter((u) => {
    if (role && u.role !== role) return false;
    if (q && !`${u.name} ${u.email} ${u.nim || ''}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, q, role]);

  async function toggleStatus(u) {
    const next = u.status === 'Aktif' ? 'Suspended' : 'Aktif';
    await api.adminUpdateUser(u._id, { status: next });
    await load();
  }
  async function changeRole(u, newRole) {
    await api.adminUpdateUser(u._id, { role: newRole });
    await load();
  }
  async function del(u) {
    if (u._id === me?.id) return alert('Tidak bisa hapus akun sendiri');
    if (!confirm(`Hapus user "${u.name}"?`)) return;
    await api.adminDeleteUser(u._id);
    await load();
  }

  return (
    <div className="p-6 md:p-10 space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold flex items-center gap-2">
          <Users className="text-primary" /> Manajemen Pengguna
        </h1>
        <p className="text-textmuted text-sm">Total {items.length} pengguna terdaftar</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-slate-50 rounded-xl px-3 py-2">
          <Search size={16} className="text-textmuted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / email / NIM..."
            className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none">
          <option value="">Semua Role</option>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-textmuted text-xs uppercase border-b border-slate-100">
            <tr>
              <th className="px-4 py-3">No</th>
              <th>Nama</th>
              <th>NIM/NIK</th>
              <th>Role</th>
              <th>Email</th>
              <th>Status</th>
              <th>Tanggal Daftar</th>
              <th className="text-right pr-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u._id} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-textmuted">{i + 1}</td>
                <td className="font-semibold">{u.name} {u._id === me?.id && <span className="text-[10px] text-primary">(you)</span>}</td>
                <td className="font-mono text-xs">{u.nim || '-'}</td>
                <td>
                  <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}
                    disabled={u._id === me?.id}
                    className="bg-slate-50 rounded-md px-2 py-1 text-xs outline-none disabled:opacity-60">
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td className="text-textmuted">{u.email}</td>
                <td>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    u.status === 'Aktif' ? 'bg-success/15 text-success' : 'bg-red-100 text-red-600'
                  }`}>{u.status}</span>
                </td>
                <td className="text-xs text-textmuted">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                <td className="text-right pr-4">
                  <button onClick={() => toggleStatus(u)} title={u.status === 'Aktif' ? 'Suspend' : 'Activate'}
                    className="p-1.5 hover:bg-slate-100 rounded">
                    {u.status === 'Aktif' ? <Ban size={14} className="text-amber-600" /> : <CheckCircle2 size={14} className="text-success" />}
                  </button>
                  <button onClick={() => del(u)} disabled={u._id === me?.id}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded disabled:opacity-30 disabled:cursor-not-allowed">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="8" className="py-10 text-center text-textmuted">Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
