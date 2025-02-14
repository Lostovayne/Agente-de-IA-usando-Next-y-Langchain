"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface NavigationContextType {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  closeMobileNav: () => void;
}

export const NavigationContext = createContext<NavigationContextType>({
  isMobileNavOpen: false,
  setIsMobileNavOpen: () => {},
  closeMobileNav: () => {},
});

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const closeMobileNav = () => setIsMobileNavOpen(false);

  return (
    <NavigationContext value={{ isMobileNavOpen, setIsMobileNavOpen, closeMobileNav }}>
      {children}
    </NavigationContext>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
