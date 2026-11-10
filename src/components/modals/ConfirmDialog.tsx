import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  accion: () => Promise<void>;
}

interface ConfirmDialogProps {
  datos: DatosConfirmacion | null;
  onCerrar: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ datos, onCerrar }) => {
  const [trabajando, setTrabajando] = useState(false);

  if (!datos) return null;

  const confirmar = async () => {
    setTrabajando(true);
    try {
      await datos.accion();
    } finally {
      setTrabajando(false);
      onCerrar();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-xs animate-in fade-in duration-150" role="alertdialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4 border border-[#E8E8E8]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0A0A0A]">{datos.titulo}</h2>
            <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{datos.mensaje}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onCerrar} disabled={trabajando} className="px-4 py-2 text-xs font-medium text-[#404040] hover:text-[#0A0A0A]">
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={trabajando}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white text-xs font-medium rounded-lg"
          >
            {trabajando && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {datos.textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};
