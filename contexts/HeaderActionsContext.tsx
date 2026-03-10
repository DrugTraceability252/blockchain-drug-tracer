// layout/HeaderActionContext.tsx
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface HeaderActionContextType {
    setHeaderActions: (node: ReactNode) => void;
}

export const HeaderActionContext = createContext<HeaderActionContextType | null>(null);

export const useHeaderActions = () => {
    const ctx = useContext(HeaderActionContext);
    if (!ctx) {
        throw new Error("useHeaderActions must be used inside MainLayout");
    }
    return ctx;
};