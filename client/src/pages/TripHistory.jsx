import { useEffect, useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthGate from '../components/AuthGate.jsx';
import { api } from '../api/binusgo.js';

export default function TripHistory() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (user) api.history().then(setItems).catch(() => {});
  }, [user]);

  if (loading) return null;
  if (!user) return <AuthGate title="Login untuk melihat riwayat" message="Riwayat pencarianmu tersimpan aman dan bisa diakses kapan saja." />;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="text-primary" />
        <h1 className="font-heading text-2xl font-extrabold">Riwayat Perjalanan</h1>
      </div>
      <p className="text-textmuted mb-6">Pencarian terbaru</p>

      {items.length === 0 ? (
        <div className="text-center text-textmuted py-10">Belum ada riwayat pencarian.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((h) => (
            <li key={h._id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="text-sm font-medium truncate flex-1">
                {h.origin || '—'} <ArrowRight className="inline" size={14} /> {h.destinationName || h.destinationCampus?.name || '—'}
              </div>
              <div className="text-xs text-textmuted">
                {new Date(h.createdAt).toLocaleString('id-ID')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
