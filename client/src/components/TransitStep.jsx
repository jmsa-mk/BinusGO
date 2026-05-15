import { Footprints, Bus, TrainFront, TramFront, Truck as Van } from 'lucide-react';

const cfg = {
  walk:         { Icon: Footprints,  bg: 'bg-slate-200',  text: 'text-slate-700', label: '' },
  TransJakarta: { Icon: Bus,         bg: 'bg-tj/15',      text: 'text-tj',        label: 'TJ' },
  KRL:          { Icon: TrainFront,  bg: 'bg-krl/15',     text: 'text-krl',       label: 'KRL' },
  LRT:          { Icon: TramFront,   bg: 'bg-lrt/15',     text: 'text-lrt',       label: 'LRT' },
  Mikrotrans:   { Icon: Van,         bg: 'bg-mikro/15',   text: 'text-mikro',     label: 'JAK' },
};

export default function TransitStep({ step }) {
  const c = cfg[step.type] || cfg.walk;
  const { Icon } = c;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${c.bg} ${c.text}`}>
      <Icon size={14} />
      {c.label && <span className="font-mono">{c.label}</span>}
      <span className="font-mono">{step.durationMin}mnt</span>
    </span>
  );
}
