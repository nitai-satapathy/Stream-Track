"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme, allThemes, Theme } from "@/components/theme-context";
import { Check } from "lucide-react";

interface ThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
    const { currentTheme, setTheme } = useTheme();
    const [selectedThemeId, setSelectedThemeId] = useState(currentTheme.id);

    useEffect(() => {
        if (isOpen) {
            setSelectedThemeId(currentTheme.id);
        }
    }, [isOpen, currentTheme]);

    const handleSave = () => {
        setTheme(selectedThemeId);
        onClose();
    };

    const handleReset = () => {
        setSelectedThemeId("default");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 bg-[#111] border-gray-800 text-white overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-semibold">Appearance</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allThemes.map((theme) => {
                            const isSelected = selectedThemeId === theme.id;

                            // Helper to get color style
                            const getStyle = (variable: string, fallback = "transparent") => {
                                if (theme.id === "default") {
                                    // Default theme Fallbacks if unknown (simulated)
                                    if (variable === "--background") return "hsl(222.2 84% 4.9%)";
                                    if (variable === "--card") return "hsl(222.2 84% 4.9%)";
                                    if (variable === "--primary") return "hsl(263.4 90.4% 56.9%)";
                                    return fallback;
                                }
                                const val = theme.cssVars[variable];
                                return val ? `hsl(${val})` : fallback;
                            };

                            return (
                                <div key={theme.id} className="space-y-3">
                                    <div
                                        onClick={() => setSelectedThemeId(theme.id)}
                                        className={cn(
                                            "relative aspect-video rounded-xl border-2 cursor-pointer transition-all overflow-hidden group",
                                            isSelected
                                                ? "border-purple-500 ring-2 ring-purple-500/20"
                                                : "border-transparent hover:border-white/20"
                                        )}
                                        style={{
                                            backgroundColor: getStyle("--background"),
                                        }}
                                    >
                                        {/* Preview UI Mockup */}
                                        <div className="absolute inset-4 rounded-lg flex flex-col gap-2 opacity-80"
                                            style={{ backgroundColor: getStyle("--card", "#222") }}
                                        >
                                            {/* Header Mock */}
                                            <div className="h-3 w-1/3 rounded-full mt-3 ml-3 opacity-40" style={{ backgroundColor: getStyle("--foreground", "#fff") }} />

                                            {/* Body Mock */}
                                            <div className="flex gap-2 mt-2 ml-3">
                                                <div className="h-8 w-8 rounded-full" style={{ backgroundColor: getStyle("--primary", "purple") }} />
                                                <div className="flex flex-col gap-1 w-full pr-4">
                                                    <div className="h-2 w-3/4 rounded-full opacity-30" style={{ backgroundColor: getStyle("--foreground", "#fff") }} />
                                                    <div className="h-2 w-1/2 rounded-full opacity-30" style={{ backgroundColor: getStyle("--foreground", "#fff") }} />
                                                </div>
                                            </div>

                                            {/* Buttons Mock */}
                                            <div className="mt-auto mb-3 mx-3 flex gap-2">
                                                <div className="h-6 w-16 rounded opacity-80" style={{ backgroundColor: getStyle("--secondary", "#333") }} />
                                                <div className="h-6 w-16 rounded opacity-80" style={{ backgroundColor: getStyle("--secondary", "#333") }} />
                                            </div>
                                        </div>

                                        {/* Checkmark Overlay */}
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 bg-purple-500 rounded-full p-1 shadow-lg">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between px-1">
                                        <span className="font-medium text-sm text-gray-200">{theme.name}</span>
                                        {isSelected && (
                                            <span className="text-[10px] font-bold bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">Active</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DialogFooter className="p-6 border-t border-gray-800 bg-[#0a0a0a] flex justify-end gap-3 z-10">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="text-gray-400 hover:text-white hover:bg-white/5"
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-purple-600 hover:bg-purple-700 text-white min-w-[80px]"
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
