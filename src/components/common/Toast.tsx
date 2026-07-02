import { create } from 'zustand';

interface ToastState {
  message: string;
  visible: boolean;
  showToast: (msg: string) => void;
  hideToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: '',
  visible: false,
  showToast: (msg) => {
    set({ message: msg, visible: true });
    setTimeout(() => set({ visible: false }), 2500);
  },
  hideToast: () => set({ visible: false }),
}));

export function Toast() {
  const { message, visible } = useToast();

  if (!visible) return null;

  return (
    <div className="toast">
      {message}
    </div>
  );
}
