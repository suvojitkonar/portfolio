"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

type PortfolioNavContextValue = {
  goTo: (screenId: string) => void;
};

const PortfolioNavContext = createContext<PortfolioNavContextValue | null>(
  null
);

export function PortfolioNavProvider({
  children,
  goTo,
}: {
  children: ReactNode;
  goTo: (screenId: string) => void;
}) {
  const value = useMemo(() => ({ goTo }), [goTo]);
  return (
    <PortfolioNavContext.Provider value={value}>
      {children}
    </PortfolioNavContext.Provider>
  );
}

export function usePortfolioNav() {
  const ctx = useContext(PortfolioNavContext);
  if (!ctx) {
    throw new Error("usePortfolioNav must be used within PortfolioNavProvider");
  }
  return ctx;
}
