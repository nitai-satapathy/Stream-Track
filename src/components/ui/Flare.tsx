"use client";

import React, { useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FlareProps {
    className?: string;
    backgroundClass?: string;
    flareSize?: number;
    cssColorVar?: string;
    enabled?: boolean;
    gradientOpacity?: number;
    gradientSpread?: number;
}

const SIZE_DEFAULT = 200;
// Using a default color that matches our purple theme roughly (r g b)
// Tailwind blue-500 is 59 130 246
// Tailwind purple-500 is 168 85 247
const DEFAULT_RGB = "168, 85, 247"; // Purple-500

function Base(props: {
    className?: string;
    children?: ReactNode;
    tabIndex?: number;
    onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}) {
    return (
        <div
            tabIndex={props.tabIndex}
            className={cn("group relative", props.className)}
            onKeyUp={props.onKeyUp}
        >
            {props.children}
        </div>
    );
}

function Child(props: { className?: string; children?: ReactNode }) {
    return <div className={cn("relative z-10", props.className)}>{props.children}</div>;
}

function Light(props: FlareProps) {
    const outerRef = useRef<HTMLDivElement>(null);
    const size = props.flareSize ?? SIZE_DEFAULT;
    const rgb = props.cssColorVar ?? DEFAULT_RGB;
    const opacity = props.gradientOpacity ?? 1;
    const spread = props.gradientSpread ?? 70;

    useEffect(() => {
        function mouseMove(e: MouseEvent) {
            if (!outerRef.current) return;
            const rect = outerRef.current.getBoundingClientRect();
            const halfSize = size / 2;
            outerRef.current.style.setProperty(
                "--bg-x",
                `${(e.clientX - rect.left - halfSize).toFixed(0)}px`
            );
            outerRef.current.style.setProperty(
                "--bg-y",
                `${(e.clientY - rect.top - halfSize).toFixed(0)}px`
            );
        }
        window.addEventListener("mousemove", mouseMove);

        return () => window.removeEventListener("mousemove", mouseMove);
    }, [size]);

    return (
        <div
            ref={outerRef}
            className={cn(
                "pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100",
                props.className,
                {
                    "!opacity-100": props.enabled,
                }
            )}
            style={{
                backgroundImage: `radial-gradient(circle at center, rgba(${rgb}, ${opacity}), rgba(${rgb}, 0) ${spread}%)`,
                backgroundPosition: `var(--bg-x) var(--bg-y)`,
                backgroundRepeat: "no-repeat",
                backgroundSize: `${size}px ${size}px`,
            }}
        >
            <div
                className={cn(
                    "absolute inset-[1px] overflow-hidden",
                    props.backgroundClass
                )}
            >
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at center, rgba(${rgb}, ${opacity}), rgba(${rgb}, 0) ${spread}%)`,
                        backgroundPosition: `var(--bg-x) var(--bg-y)`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: `${size}px ${size}px`,
                    }}
                />
            </div>
        </div>
    );
}

export const Flare = {
    Base,
    Light,
    Child,
};
