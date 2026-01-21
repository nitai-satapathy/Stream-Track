"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { updateUserProfile } from "@/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PROFILE_IMAGES = [
    "/profile/boy-1.webp",
    "/profile/boy-2.webp",
    "/profile/girl-1.webp",
    "/profile/girl-2.webp",
];

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { data: session, update } = useSession();
    const [name, setName] = useState("");
    const [selectedImage, setSelectedImage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setSelectedImage(session.user.image || PROFILE_IMAGES[0]);
        }
    }, [session, isOpen]);

    const handleSave = async () => {
        if (!session?.user) return;
        setIsLoading(true);
        setError(null);

        const result = await updateUserProfile((session.user as any).id, {
            name,
            image: selectedImage,
        });

        if (result.success) {
            await update({
                ...session,
                user: { ...session.user, name, image: selectedImage },
            });
            onClose();
        } else {
            setError(result.error || "Failed to update profile");
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95%] sm:max-w-[550px] p-6">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>
                    <div className="grid gap-4">
                        <Label className="text-center sm:text-left">Profile Picture</Label>
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                            {PROFILE_IMAGES.map((src) => (
                                <button
                                    key={src}
                                    type="button"
                                    onClick={() => setSelectedImage(src)}
                                    className={cn(
                                        "relative rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                        selectedImage === src
                                            ? "ring-4 ring-primary ring-offset-4"
                                            : "ring-1 ring-border opacity-70 hover:opacity-100 hover:ring-2 hover:ring-primary/50",
                                    )}
                                >
                                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-background">
                                        <AvatarImage
                                            src={src}
                                            alt="Profile option"
                                            className="object-cover"
                                        />
                                        <AvatarFallback>?</AvatarFallback>
                                    </Avatar>
                                </button>
                            ))}
                        </div>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <div className="flex justify-end gap-3">
                    <DialogClose asChild>
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
