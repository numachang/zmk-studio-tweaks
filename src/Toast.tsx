import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export type ToastKind = "success" | "error" | "warning" | "info";

export interface NotifyOptions {
  /**
   * Supplemental call-to-action shown on its own line, emphasized so the user
   * doesn't miss it. Use for things like "Press Save to persist".
   */
  action?: string;
}

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  message: string;
  action?: string;
}

interface ToastContextValue {
  notify: (kind: ToastKind, message: string, options?: NotifyOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

const DURATION_MS: Record<ToastKind, number> = {
  success: 6000,
  error: 8000,
  warning: 8000,
  info: 5000,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (kind: ToastKind, message: string, options?: NotifyOptions) => {
      const id = ++idRef.current;
      setToasts((prev) => [
        ...prev,
        { id, kind, message, action: options?.action },
      ]);
      window.setTimeout(() => dismiss(id), DURATION_MS[kind]);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const KIND_CLASSES: Record<ToastKind, string> = {
  success: "bg-emerald-700 text-emerald-50 border-emerald-500",
  error: "bg-rose-700 text-rose-50 border-rose-500",
  warning: "bg-amber-700 text-amber-50 border-amber-500",
  info: "bg-sky-700 text-sky-50 border-sky-500",
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : "status"}
          className={`pointer-events-auto rounded-md border px-4 py-2 shadow-lg max-w-md text-sm ${KIND_CLASSES[t.kind]}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 whitespace-pre-wrap break-words">
              <span>{t.message}</span>
              {t.action && (
                <div className="mt-1 font-bold text-red-500 drop-shadow-[0_1px_0_rgba(0,0,0,0.4)]">
                  {t.action}
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => onDismiss(t.id)}
              className="opacity-70 hover:opacity-100 leading-none text-lg"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
