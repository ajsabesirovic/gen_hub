import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

type NavigationHandler = (path: string) => boolean | void;

interface NavigationContextValue {
  setUnsavedChangesHandler: (handler: NavigationHandler | null) => void;
  requestNavigation: (path: string) => boolean;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined,
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<NavigationHandler | null>(null);

  const setUnsavedChangesHandler = useCallback(
    (handler: NavigationHandler | null) => {
      handlerRef.current = handler;
    },
    [],
  );

  const requestNavigation = useCallback((path: string) => {
    if (handlerRef.current) {
      const shouldPrevent = handlerRef.current(path);
      return Boolean(shouldPrevent);
    }
    return false;
  }, []);

  const value = useMemo(
    () => ({
      setUnsavedChangesHandler,
      requestNavigation,
    }),
    [requestNavigation, setUnsavedChangesHandler],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

