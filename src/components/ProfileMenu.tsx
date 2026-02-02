"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, UserCircle, Layers, HelpCircle } from "lucide-react";
import Link from "next/link";

interface ProfileMenuProps {
  user: any;
  logout: () => Promise<void>;
  onSettings: () => void;
  onChangelog: () => void;
  onTheme?: () => void;
}

export function ProfileMenu({
  user,
  logout,
  onSettings,
  onChangelog,
  onTheme,
}: ProfileMenuProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onSettings}>
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        {onTheme && (
          <Button variant="ghost" size="icon" onClick={onTheme}>
            <Layers className="h-5 w-5" />
            <span className="sr-only">Theme</span>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL} alt={user.displayName} />
            <AvatarFallback>
              {user.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <div className="flex items-center gap-3 border-b border-border/50 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL} alt={user.displayName} />
            <AvatarFallback>
              {user.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-medium leading-none">{user.displayName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="p-1">
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          {onTheme && (
            <DropdownMenuItem onClick={onTheme}>
              <Layers className="mr-2 h-4 w-4" />
              <span>Appearance</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/about" className="w-full cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>About & FAQ</span>
            </Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <div className="p-1">
          <DropdownMenuItem onClick={onChangelog}>
            <Layers className="mr-2 h-4 w-4" />
            <span>Changelog</span>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <div className="p-1">
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
