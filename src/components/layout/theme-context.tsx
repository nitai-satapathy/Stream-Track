"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { themes as importedThemes, Theme } from "@/lib/themes-data";
export type { Theme } from "@/lib/themes-data";

const streamTrackDefaultTheme: Theme = {
    id: "default",
    name: "Default",
    cssVars: {},
};

const validImportedThemes = importedThemes.filter(t => t.cssVars["--background"] !== "0 0% 0%");

export const allThemes: Theme[] = [streamTrackDefaultTheme, ...validImportedThemes];

interface ThemeContextType {
    currentTheme: Theme;
    setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<Theme>(streamTrackDefaultTheme);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedId = localStorage.getItem("stream-track-theme-id");
        if (savedId) {
            const found = allThemes.find(t => t.id === savedId);
            if (found) {
                setCurrentTheme(found);
            }
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        if (currentTheme.id === "default") {
            const keys = Object.keys(validImportedThemes[0]?.cssVars || {});
            keys.forEach(k => root.style.removeProperty(k));
            localStorage.removeItem("stream-track-theme-id");
        } else {
            Object.entries(currentTheme.cssVars).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
            localStorage.setItem("stream-track-theme-id", currentTheme.id);
        }
    }, [currentTheme, mounted]);

    const setTheme = (id: string) => {
        const found = allThemes.find(t => t.id === id);
        if (found) {
            setCurrentTheme(found);
        }
    };
    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
