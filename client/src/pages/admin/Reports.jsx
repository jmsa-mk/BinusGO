import { useEffect, useState } from 'react';
import { BarChart3, Download, FileDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import { api } from '../../api/binusgo.js';

const PIE_COLORS = ['#F97316', '#3B82F6', '#8B5CF6', '#14B8A6', '#5B5FEF'];

function defaultRange() {
  const to = new Date();
  const from = new Date(); from.setDate(from.getDate() - 30);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default function Reports() {
  const init = defaultRange();
  const [from, setFrom] = useState(init.from);
  const [to, setTo] = useState(init.to);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try { setData(await api.adminReports(from, to)); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function exportCSV() {
    if (!data) return;
    const rows = [
      ['Laporan BinusGO!'],
      ['Periode', `${from} s/d ${to}`],
      [],
      ['Ringkasan'],
      ['Total Pencarian', data.summary.totalSearches],
      ['User Baru', data.summary.totalNewUsers],
      ['Kampus Aktif', data.summary.activeCampuses],
      ['Rute Aktif', data.summary.activeRoutes],
      [],
      ['Top Tujuan Kampus'],
      ['Kampus', 'Jumlah Pencarian'],
      ...data.topCampuses.map((c) => [c._id || '-', c.count]),
      [],
      ['Mode Transit Populer'],
      ['Mode', 'Jumlah'],
      ...data.modeUsage.map((m) => [m._id, m.count]),
      [],
      ['Pertumbuhan Pengguna (per Bulan)'],
      ['Bulan', 'User Baru'],
      ...data.userGrowth.map((m) => [m.month, m.count]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `binusgo-laporan-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    window.print();
  }

  if (!data) return <div className="p-10 text-textmuted">Memuat laporan…</div>;

  return (
    <div className="p-6 md:p-10 space-y-5 print:p-4">
      <div className="flex items-end justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h1 className="font-heading text-2xl font-extrabold flex items-center gap-2">
            <BarChart3 className="text-primary" /> Laporan & Statistik
          </h1>
          <p className="text-textmuted text-sm">Analisa penggunaan BinusGO! per rentang tanggal</p>
        </div>
        <div className="flex items-end gap-2 flex-wrap">
          <div>
            <label className="text-xs font-semibold text-textmuted block">Dari</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-textmuted block">Sampai</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
          </div>
          <button onClick={load} disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-60">
            {loading ? 'Memuat…' : 'Terapkan'}
          </button>
          <button onClick={exportCSV} className="px-3 py-2 bg-success/15 text-success rounded-xl text-sm font-semibold flex items-center gap-1">
            <Download size={14} /> CSV
          </button>
          <button onClick={exportPDF} className="px-3 py-2 bg-tj/15 text-tj rounded-xl text-sm font-semibold flex items-center gap-1">
            <FileDown size={14} /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Summary label="Total Pencarian" value={data.summary.totalSearches} />
        <Summary label="User Baru" value={data.summary.totalNewUsers} color="text-tj" />
        <Summary label="Kampus Aktif" value={data.summary.activeCampuses} color="text-lrt" />
        <Summary label="Rute Aktif" value={data.summary.activeRoutes} color="text-success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Mode Transit Paling Sering Digunakan">
          {data.modeUsage.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.modeUsage} dataKey="count" nameKey="_id" outerRadius={90} label>
                  {data.modeUsage.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Kampus Tujuan Terbanyak">
          {data.topCampuses.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.topCampuses} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="_id" width={140} fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#5B5FEF" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Pertumbuhan Pengguna per Bulan (6 bulan)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Rute Terpopuler (Periode Ini)">
          {data.topRoutes.length === 0 ? <Empty /> : (
            <table className="w-full text-sm">
              <thead className="text-left text-textmuted text-xs uppercase border-b border-slate-100">
                <tr><th className="py-2">#</th><th>Tujuan</th><th className="text-right">Pencarian</th></tr>
              </thead>
              <tbody>
                {data.topRoutes.map((r, i) => (
                  <tr key={i} className="border-t border-slate-50">
                    <td className="py-2 font-mono">{i + 1}</td>
                    <td className="truncate max-w-[260px]">{r.destName || '-'}</td>
                    <td className="text-right font-mono font-semibold">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <Card title="Ringkasan Statistik">
        <table className="w-full text-sm">
          <tbody>
            <Row k="Periode" v={`${from} s/d ${to}`} />
            <Row k="Total pencarian rute" v={data.summary.totalSearches} />
            <Row k="User baru terdaftar" v={data.summary.totalNewUsers} />
            <Row k="Mode transit terpopuler" v={data.modeUsage[0]?._id || '-'} />
            <Row k="Kampus tujuan #1" v={data.topCampuses[0]?._id || '-'} />
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Summary({ label, value, color = 'text-primary' }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className={`font-heading text-3xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-textmuted mt-1">{label}</div>
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
function Row({ k, v }) {
  return <tr className="border-t border-slate-50"><td className="py-2 text-textmuted">{k}</td><td className="text-right font-semibold">{v}</td></tr>;
}
function Empty() { return <div className="py-12 text-center text-textmuted text-sm">Belum ada data dalam rentang ini.</div>; }
