import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { api } from '../../api/binusgo.js';

export default function Settings() {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.adminSettings().then(setS); }, []);

  function up(k, v) { setS((st) => ({ ...st, [k]: v })); }

  async function save(e) {
    e.preventDefault();
    setBusy(true); setSaved(false);
    try {
      const updated = await api.adminSettingsUpdate({
        ...s,
        allowedDomains: typeof s.allowedDomains === 'string'
          ? s.allowedDomains.split(',').map((x) => x.trim()).filter(Boolean)
          : s.allowedDomains,
        maxRoutesPerSearch: Number(s.maxRoutesPerSearch),
      });
      setS(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  if (!s) return <div className="p-10 text-textmuted">Memuat pengaturan…</div>;

  const domainsStr = Array.isArray(s.allowedDomains) ? s.allowedDomains.join(', ') : s.allowedDomains;

  return (
    <div className="p-6 md:p-10 max-w-2xl space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold flex items-center gap-2">
          <SettingsIcon className="text-primary" /> Pengaturan Sistem
        </h1>
        <p className="text-textmuted text-sm">Konfigurasi global aplikasi BinusGO!</p>
      </div>

      <form onSubmit={save} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <Section title="Identitas Aplikasi">
          <Field label="Nama Aplikasi" value={s.appName} onChange={(v) => up('appName', v)} />
          <Field label="Tagline" value={s.tagline} onChange={(v) => up('tagline', v)} />
          <Field label="Email Kontak / Support" value={s.contactEmail} onChange={(v) => up('contactEmail', v)} type="email" />
        </Section>

        <Section title="Status Layanan">
          <div>
            <label className="text-xs font-semibold text-textmuted">Status</label>
            <select value={s.serviceStatus} onChange={(e) => up('serviceStatus', e.target.value)}
              className="w-full mt-1 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none">
              <option value="Aktif">Aktif</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <p className="text-xs text-textmuted mt-1">
              Jika "Maintenance", landing page akan menampilkan banner peringatan.
            </p>
          </div>
        </Section>

        <Section title="Autentikasi">
          <Field
            label="Domain Email yang Diizinkan (pisah koma)"
            value={domainsStr}
            onChange={(v) => up('allowedDomains', v)}
            placeholder="binus.ac.id, binus.edu"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-primary" checked={!!s.enableOAuth}
              onChange={(e) => up('enableOAuth', e.target.checked)} />
            Aktifkan login OAuth (Google & Microsoft)
          </label>
        </Section>

        <Section title="Performa">
          <Field
            label="Maksimum hasil rute per pencarian"
            value={s.maxRoutesPerSearch}
            onChange={(v) => up('maxRoutesPerSearch', v)}
            type="number"
          />
        </Section>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {saved && <span className="text-success text-sm font-semibold">✓ Tersimpan</span>}
          <button disabled={busy}
            className="ml-auto px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white rounded-xl font-semibold flex items-center gap-2">
            <Save size={16} /> {busy ? 'Menyimpan…' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
      <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-textmuted">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, ...p }) {
  return (
    <div>
      <label className="text-xs font-semibold text-textmuted">{label}</label>
      <input value={value ?? ''} {...p} onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
}
