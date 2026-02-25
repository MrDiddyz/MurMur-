type Listener<T> = (payload: T) => void;

export function createStateBus<T>() {
  const listeners = new Set<Listener<T>>();

  return {
    emit(payload: T) {
      listeners.forEach((listener) => listener(payload));
    },
    subscribe(listener: Listener<T>) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
