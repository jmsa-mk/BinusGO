import { useEffect, useRef, useState } from 'react';

export default function MapBottomSheet({ open, onClose, children }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  useEffect(() => { if (open) setDrag(0); }, [open]);

  function onPointerDown(e) {
    startY.current = e.clientY;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragging) return;
    const dy = e.clientY - startY.current;
    if (dy > 0) setDrag(dy);
  }
  function onPointerUp() {
    setDragging(false);
    if (drag > 120) onClose();
    else setDrag(0);
  }

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={ref}
        style={{
          transform: `translateY(${drag}px)`,
          transition: dragging ? 'none' : 'transform 0.25s ease-out',
        }}
        className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl flex flex-col"
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="pt-3 pb-2 cursor-grab active:cursor-grabbing select-none touch-none"
        >
          <div className="mx-auto w-12 h-1.5 rounded-full bg-slate-300" />
          <div className="text-center text-xs text-textmuted mt-2 font-semibold">Peta Rute</div>
          <div className="text-center text-[10px] text-textmuted/70 mt-0.5">Tarik ke bawah untuk menutup</div>
        </div>
        <div style={{ height: '70vh' }}>{children}</div>
      </div>
    </div>
  );
}
