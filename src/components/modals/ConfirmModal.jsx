import React from 'react';
import { AlertTriangle, Trash2, HelpCircle, Loader2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '¿ESTÁS SEGURO?',
  description = 'Esta acción no se puede deshacer.',
  confirmText = 'CONFIRMAR',
  cancelText = 'CANCELAR',
  variant = 'destructive',
  isLoading = false
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    if (variant === 'destructive') {
      return <Trash2 className="text-error" size={24} />;
    }
    if (variant === 'warning') {
      return <AlertTriangle className="text-warning" size={24} />;
    }
    return <HelpCircle className="text-primary" size={24} />;
  };

  const getBadgeStyle = () => {
    if (variant === 'destructive') {
      return 'bg-error/10 border-error/30 text-error';
    }
    if (variant === 'warning') {
      return 'bg-warning/10 border-warning/30 text-warning';
    }
    return 'bg-primary/10 border-primary/30 text-primary';
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-high w-full max-w-md rounded-sm border border-outline-variant/30 fade-in shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col p-5 sm:p-6 gap-5 my-auto">
        {/* Header con Icono */}
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-sm border flex items-center justify-center shrink-0 ${getBadgeStyle()}`}>
            {getIcon()}
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h3 className="font-headline font-bold text-base sm:text-lg uppercase tracking-wider text-white truncate">
              {title}
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/15 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-headline font-bold uppercase tracking-widest text-white bg-surface-container-highest hover:bg-surface-variant border border-outline-variant/30 transition-colors rounded-sm cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0 flex items-center justify-center"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-6 py-2.5 font-headline font-bold uppercase tracking-widest text-xs rounded-sm transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              variant === 'destructive'
                ? 'bg-error text-white hover:bg-error-container shadow-[0_0_20px_rgba(255,49,0,0.4)]'
                : 'bg-primary text-white hover:bg-primary-dim shadow-[0_0_20px_rgba(255,49,0,0.4)]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={15} />
                <span>PROCESANDO...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
