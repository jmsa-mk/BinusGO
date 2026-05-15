import { useEffect, useState } from 'react';
import { Rocket, Trash2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthGate from '../components/AuthGate.jsx';
import { api } from '../api/binusgo.js';

export default function SavedLocations() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (user) api.saved().then(setItems).catch(() => {});
  }, [user]);

  async function remove(id) {
    await api.unsave(id);
    setItems((s) => s.filter((x) => x._id !== id));
  }

  if (loading) return null;
  if (!user) return <AuthGate title="Login untuk menyimpan lokasi" message="Simpan kampus favoritmu dan akses lebih cepat setiap saat." />;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Rocket className="text-primary" />
        <h1 className="font-heading text-2xl font-extrabold">Lokasi Tersimpan</h1>
      </div>
      <p className="text-textmuted mb-6">Kampus BINUS favoritmu</p>

      {items.length === 0 ? (
        <div className="text-center text-textmuted py-10">Belum ada lokasi tersimpan.</div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {items.map((s) => (
            <li key={s._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <MapPin size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{s.campus?.name}</div>
                <div className="text-xs text-textmuted truncate">{s.campus?.address}</div>
              </div>
              <button onClick={() => remove(s._id)} className="text-textmuted hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
