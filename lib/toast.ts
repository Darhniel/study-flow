export type ToastType = "success" | "error";

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

type Listener = (toast: ToastMessage) => void;

const listeners = new Set<Listener>();
let nextId = 1;

export function toast(message: string, type: ToastType = "success"): void {
    const msg: ToastMessage = { id: nextId++, message, type };
    listeners.forEach((l) => l(msg));
}

export function subscribeToast(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}