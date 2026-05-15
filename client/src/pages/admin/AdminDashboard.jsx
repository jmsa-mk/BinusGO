import { useEffect, useState } from 'react';
import { Users, Route as RouteIcon, Building2, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../../api/binusgo.js';

const PIE_COLORS = ['#5B5FEF', '#F59E0B', '#22C55E', '#8B5CF6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.adminStats().then(setStats).catch(() => {}); }, []);

  if (!stats) return <div className="p-10 text-textmuted">Memuat dashboard…</div>;

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Admin Dashboard</h1>
        <p className="text-textmuted text-sm">Ringkasan operasional BinusGO!</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard Icon={Users} label="Total Pengguna" value={stats.totalUsers} sub={stats.byRole.map((r) => `${r._id}: ${r.count}`).join(' · ')} />
        <StatCard Icon={RouteIcon} label="Total Rute" value={stats.totalRoutes} color="bg-tj/10 text-tj" />
        <StatCard Icon={Building2} label="Kampus Aktif" value={stats.totalCampuses} color="bg-lrt/10 text-lrt" />
        <StatCard Icon={Search} label="Pencarian Hari Ini" value={stats.searchesToday} color="bg-success/10 text-success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Pencarian per Mode Transit">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={stats.byMode} dataKey="count" nameKey="_id" outerRadius={80} label>
                {stats.byMode.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Tren Pengguna Harian (7 hari)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.trend}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#5B5FEF" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Rute Terpopuler">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-textmuted text-xs uppercase">
              <tr><th className="py-2">#</th><th>Asal</th><th>Tujuan</th><th>Mode</th><th className="text-right">Pencarian</th></tr>
            </thead>
            <tbody>
              {stats.topRoutes.map((r, i) => (
                <tr key={r._id} className="border-t border-slate-100">
                  <td className="py-2 font-mono">{i + 1}</td>
                  <td>{r.origin}</td>
                  <td className="truncate max-w-[260px]">{r.destinationCampus?.name}</td>
                  <td className="space-x-1">
                    {r.modes.map((m) => <span key={m} className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded">{m}</span>)}
                  </td>
                  <td className="text-right font-mono font-semibold">{r.searchCount}</td>
                </tr>
              ))}
              {stats.topRoutes.length === 0 && <tr><td colSpan="5" className="py-6 text-center text-textmuted">Belum ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ Icon, label, value, sub, color = 'bg-primary/10 text-primary' }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="font-heading text-2xl font-extrabold mt-3">{value}</div>
      <div className="text-xs text-textmuted">{label}</div>
      {sub && <div className="text-[10px] text-textmuted mt-1 truncate">{sub}</div>}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="font-heading font-bold mb-3">{title}</div>
      {children}
    </div>
  );
}
