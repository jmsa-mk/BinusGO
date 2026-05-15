import { useEffect, useState } from 'react';
import { FileClock, Filter, RefreshCw } from 'lucide-react';
import { api } from '../../api/binusgo.js';

const ROLES = ['Mahasiswa', 'Dosen', 'Staff', 'Admin', 'Guest'];

const ACTION_COLORS = {
  LOGIN: 'bg-success/15 text-success',
  REGISTER: 'bg-primary/15 text-primary',
  ROUTE_SEARCH: 'bg-tj/15 text-tj',
  ROUTE_CREATE: 'bg-success/15 text-success',
  ROUTE_UPDATE: 'bg-amber-100 text-amber-700',
  ROUTE_DELETE: 'bg-red-100 text-red-600',
  CAMPUS_CREATE: 'bg-success/15 text-success',
  CAMPUS_UPDATE: 'bg-amber-100 text-amber-700',
  CAMPUS_DELETE: 'bg-red-100 text-red-600',
  USER_UPDATE: 'bg-amber-100 text-amber-700',
  USER_DELETE: 'bg-red-100 text-red-600',
  SETTINGS_UPDATE: 'bg-lrt/15 text-lrt',
};

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [filters, setFilters] = useState({ action: '', role: '', from: '', to: '' });
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      setLogs(await api.adminLogs(params));
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); api.adminLogActions().then(setActions).catch(() => {}); /* eslint-disable-next-line */ }, []);

  function up(k, v) { setFilters((s) => ({ ...s, [k]: v })); }

  return (
    <div className="p-6 md:p-10 space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold flex items-center gap-2">
          <FileClock className="text-primary" /> Log Aktivitas
        </h1>
        <p className="text-textmuted text-sm">{logs.length} entri ditampilkan</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs text-textmuted">
          <Filter size={14} /> Filter
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select value={filters.action} onChange={(e) => up('action', e.target.value)}
            className="bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none">
            <option value="">Semua Aksi</option>
            {actions.map((a) => <option key={a}>{a}</option>)}
          </select>
          <select value={filters.role} onChange={(e) => up('role', e.target.value)}
            className="bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none">
            <option value="">Semua Role</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <input type="date" value={filters.from} onChange={(e) => up('from', e.target.value)}
            className="bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none" />
          <input type="date" value={filters.to} onChange={(e) => up('to', e.target.value)}
            className="bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none" />
          <button onClick={load} disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-60">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Terapkan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-textmuted text-xs uppercase border-b border-slate-100">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Detail</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-[11px] text-textmuted whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleString('id-ID', { hour12: false })}
                </td>
                <td className="font-semibold">{l.userName || '-'}</td>
                <td className="text-xs">{l.userRole || '-'}</td>
                <td>
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${ACTION_COLORS[l.action] || 'bg-slate-100 text-textmuted'}`}>
                    {l.action}
                  </span>
                </td>
                <td className="text-textmuted text-xs max-w-[420px] truncate">{l.detail}</td>
                <td className="font-mono text-[11px] text-textmuted">{l.ip || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan="6" className="py-10 text-center text-textmuted">Tidak ada log.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
