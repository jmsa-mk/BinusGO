import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthGate({ title, message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <Lock className="text-primary" size={36} />
      </div>
      <h2 className="font-heading text-xl font-bold mb-2">{title}</h2>
      <p className="text-textmuted max-w-sm mb-6">{message}</p>
      <Link to="/login" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90">
        Masuk Sekarang
      </Link>
      <Link to="/rute" className="mt-4 text-sm text-textmuted hover:text-primary">
        Lanjut tanpa login →
      </Link>
    </div>
  );
}
