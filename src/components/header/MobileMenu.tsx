"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import {
    Menu,
    X,
    BadgePlus,
    Settings,
    HelpCircle,
    Layers,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
    SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileMenuProps {
    user: any;
    logout: () => void;
    onBulkAddOpen: () => void;
    onSettingsOpen: () => void;
    onThemeOpen: () => void;
}

export function MobileMenu({
    user,
    logout,
    onBulkAddOpen,
    onSettingsOpen,
    onThemeOpen,
}: MobileMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const isBackRef = React.useRef(false);
    const isNavigatingRef = React.useRef(false);

    React.useEffect(() => {
        if (isOpen) {
            isNavigatingRef.current = false;
            window.history.pushState({ mobileMenu: true }, "", window.location.href);

            const handlePopState = () => {
                isBackRef.current = true;
                setIsOpen(false);
            };

            window.addEventListener("popstate", handlePopState);

            return () => {
                window.removeEventListener("popstate", handlePopState);
                if (!isBackRef.current && !isNavigatingRef.current) {
                    // Check if we can go back (simple check logic, usually safe to just back if we pushed state)
                    window.history.back();
                }
                isBackRef.current = false;
            };
        }
    }, [isOpen]);

    const handleMobileNav = () => {
        isNavigatingRef.current = true;
        setIsOpen(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="full"
                className="flex flex-col items-center border-none bg-background/95 backdrop-blur-xl [&>button]:hidden overflow-y-auto"
            >
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>

                <div className="absolute top-4 right-4 z-50">
                    <SheetClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-white/10"
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6 sm:h-8 sm:w-8" />
                        </Button>
                    </SheetClose>
                </div>

                <div className="flex min-h-full w-full flex-col items-center justify-center gap-6 p-4 py-12 text-center animate-in fade-in zoom-in-50 duration-500 sm:gap-8">
                    <Link href="/" className="flex flex-col items-center gap-3 sm:gap-4">
                        <Image
                            src="/icons/logo.svg"
                            alt="Logo"
                            width={64}
                            height={64}
                            className="h-16 w-16 shadow-[0_0_40px_-5px_var(--primary)] rounded-full sm:h-20 sm:w-20"
                        />
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Stream Track
                        </h1>
                    </Link>

                    <div className="flex flex-col gap-4 w-full max-w-sm sm:gap-6">
                        <Link
                            href="/"
                            onClick={handleMobileNav}
                            className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl"
                        >
                            Home
                        </Link>
                        <Link
                            href="/watching"
                            onClick={handleMobileNav}
                            className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl"
                        >
                            Watching
                        </Link>
                        <Link
                            href="/watched-movies"
                            onClick={handleMobileNav}
                            className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl"
                        >
                            Watched Movies
                        </Link>
                        <Link
                            href="/watched-tv"
                            onClick={handleMobileNav}
                            className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl"
                        >
                            Watched TV
                        </Link>
                        <Link
                            href="/watchlist"
                            onClick={handleMobileNav}
                            className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl"
                        >
                            Watchlist
                        </Link>
                        <Link
                            href="/recommendation"
                            onClick={handleMobileNav}
                            className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl"
                        >
                            For You
                        </Link>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mt-4 w-full max-w-xs sm:gap-4 sm:mt-8">
                        <Button
                            variant="outline"
                            className="h-12 w-[calc(50%-0.5rem)] rounded-2xl flex flex-col gap-1 hover:border-primary/50 sm:h-14 sm:w-[calc(50%-0.5rem)]"
                            onClick={() => {
                                onBulkAddOpen();
                            }}
                        >
                            <BadgePlus className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-[10px] sm:text-xs">Bulk Add</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 w-[calc(50%-0.5rem)] rounded-2xl flex flex-col gap-1 hover:border-primary/50 sm:h-14 sm:w-[calc(50%-0.5rem)]"
                            onClick={onSettingsOpen}
                        >
                            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-[10px] sm:text-xs">Settings</span>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="h-12 w-[calc(50%-0.5rem)] rounded-2xl flex flex-col gap-1 hover:border-primary/50 sm:h-14 sm:w-[calc(50%-0.5rem)]"
                            onClick={handleMobileNav}
                        >
                            <Link href="/about">
                                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="text-[10px] sm:text-xs">About</span>
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 w-[calc(50%-0.5rem)] rounded-2xl flex flex-col gap-1 hover:border-primary/50 sm:h-14 sm:w-[calc(50%-0.5rem)]"
                            onClick={onThemeOpen}
                        >
                            <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-[10px] sm:text-xs">Theme</span>
                        </Button>
                    </div>

                    {user && (
                        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                            <div className="h-[1px] w-full bg-border/50" />
                            <Link
                                href="/profile"
                                onClick={handleMobileNav}
                                className="flex items-center gap-4 w-full p-2 rounded-xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
                            >
                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border border-white/10">
                                    <AvatarImage
                                        src={user.photoURL || undefined}
                                        alt={user.displayName || "User"}
                                    />
                                    <AvatarFallback>
                                        {user.displayName?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-left overflow-hidden">
                                    <span className="font-semibold text-sm sm:text-base truncate">
                                        {user.displayName || "User"}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">
                                        {user.email}
                                    </span>
                                </div>
                            </Link>

                            <Button
                                variant="ghost"
                                onClick={() => {
                                    handleMobileNav();
                                    logout();
                                }}
                                className="text-red-400 hover:text-red-500 hover:bg-red-500/10 w-full"
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Log Out
                            </Button>
                        </div>
                    )}

                    {!user && (
                        <Button
                            asChild
                            className="mt-4 rounded-full px-8"
                            onClick={handleMobileNav}
                        >
                            <Link href="/login">Log In / Sign Up</Link>
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
