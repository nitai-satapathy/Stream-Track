import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideosTabProps {
    videos?: any[];
}

export function VideosTab({ videos }: VideosTabProps) {
    if (!videos || videos.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No videos available
            </div>
        );
    }

    return (
        <ScrollArea className="h-[400px] w-full pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((video) => (
                    <div key={video.id} className="space-y-2">
                        <div className="aspect-video w-full rounded-md overflow-hidden bg-black/10 relative group shadow-sm hover:shadow-md transition-shadow">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${video.key}`}
                                title={video.name}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="border-none"
                            />
                        </div>
                        <p className="text-sm font-medium line-clamp-1" title={video.name}>
                            {video.name}
                        </p>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
