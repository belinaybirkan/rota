import { useEffect, useRef } from "react";
import { X } from "lucide-react";
export default function Modal({ title, subtitle, children, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="modal-top">
        <div>
          <p className="eyebrow">SANA ÖZEL BİR YOLCULUK</p>
          <h2 id="dialog-title">{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Pencereyi kapat"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
