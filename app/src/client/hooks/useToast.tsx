import * as React from 'react';

type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

type ToastContextType = {
  toast: (props: ToastProps) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: number })[]>([]);
  const [nextId, setNextId] = React.useState(0);

  const toast = React.useCallback((props: ToastProps) => {
    const id = nextId;
    setNextId(id + 1);
    setToasts((current) => [...current, { ...props, id }]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 5000);
  }, [nextId]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 z-50 m-4 flex flex-col gap-2 max-w-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-5 ${
              t.variant === 'destructive'
                ? 'border-red-500 bg-red-50 text-red-900'
                : 'border-gray-200 bg-white text-gray-900'
            }`}
          >
            <div className="font-semibold">{t.title}</div>
            {t.description && (
              <div className="mt-1 text-sm opacity-90">{t.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
