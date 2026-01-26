import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const MESSAGES = [
    "There's nothing here :(",
    "So empty...",
    "Such emptiness.",
];

export function EmptyState() {
    const [randomMessage, setRandomMessage] = useState(MESSAGES[0]);

    useEffect(() => {
        setRandomMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    }, []);

    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="mb-6 relative w-64 h-64 opacity-80 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <circle cx="100" cy="100" r="80" fill="currentColor" className="text-muted/20" />
                    <g className="animate-bounce-slow">
                        <path d="M70 110C70 110 80 130 100 130C120 130 130 110 130 110" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-muted-foreground" />
                        <circle cx="75" cy="80" r="8" fill="currentColor" className="text-muted-foreground" />
                        <circle cx="125" cy="80" r="8" fill="currentColor" className="text-muted-foreground" />
                    </g>
                    <path d="M150 50L170 30M30 150L50 170" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-muted/30" />
                </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold tracking-tight">{randomMessage}</h3>
            <p className="mb-6 text-muted-foreground max-w-sm">
                It looks like you haven&apos;t added anything to this list yet. Start exploring to fill it up!
            </p>
            <Link href="/">
                <Button size="lg" className="rounded-full px-8">
                    Start Browsing
                </Button>
            </Link>
        </div>
    );
}
