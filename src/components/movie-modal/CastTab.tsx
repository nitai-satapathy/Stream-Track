import React from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CastMember } from "@/lib/tmdb";

interface CastTabProps {
    cast: CastMember[];
    onSelectPerson: (id: number) => void;
}

export function CastTab({ cast, onSelectPerson }: CastTabProps) {
    if (!cast || cast.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No cast information available
            </div>
        );
    }

    return (
        <ScrollArea className="h-[400px] w-full pr-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {cast.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/80 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-sm ring-1 ring-transparent hover:ring-border/50"
                        onClick={() => onSelectPerson(member.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View details for ${member.name}`}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onSelectPerson(member.id);
                            }
                        }}
                    >
                        <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md">
                            {member.profile_path ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                                    alt={member.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                                    No Img
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{member.name}</span>
                            <span className="text-xs text-muted-foreground truncate">{member.character}</span>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
