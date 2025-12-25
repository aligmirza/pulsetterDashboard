import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', duration = 2500) => {
    setToast({ message, type });
    if (duration) {
      setTimeout(() => setToast(null), duration);
    }
  };

  const value = useMemo(() => ({ showToast, toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
