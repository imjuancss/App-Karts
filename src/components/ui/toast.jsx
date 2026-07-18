import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'success', duration = 4000 }) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 backdrop-blur-xl rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 fade-in ${
              t.variant === 'success'
                ? 'bg-gradient-to-r from-[rgba(202,253,0,0.08)] to-[rgba(18,18,18,0.95)] border-l-[3px] border-l-tertiary-fixed'
                : t.variant === 'error'
                ? 'bg-gradient-to-r from-[rgba(255,110,132,0.08)] to-[rgba(18,18,18,0.95)] border-l-[3px] border-l-error'
                : 'bg-gradient-to-r from-[rgba(255,49,0,0.08)] to-[rgba(18,18,18,0.95)] border-l-[3px] border-l-primary-dim'
            }`}
          >
            <div className="flex-1 flex flex-col gap-1 mt-0.5">
              {t.title && (
                <span className="font-headline font-bold text-sm tracking-wide text-white uppercase leading-tight">
                  {t.title}
                </span>
              )}
              {t.description && (
                <span className="font-body text-xs text-on-surface-variant leading-relaxed">
                  {t.description}
                </span>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-on-surface-variant hover:text-white transition-colors shrink-0 cursor-pointer"
              title="Cerrar"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
