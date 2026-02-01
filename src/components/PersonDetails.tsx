"use client";

import * as React from "react";
import Image from "next/image";
import { fetchPersonDetails } from "@/lib/tmdb";
import type { Person, Movie } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Facebook, Instagram, Twitter, ExternalLink, Star } from "lucide-react";
import { FaImdb } from "react-icons/fa";

interface PersonDetailsProps {
    personId: number;
    onBack: () => void;
    onMovieSelect: (id: number, mediaType: "movie" | "tv") => void;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const PROFILE_BASE_URL = "https://image.tmdb.org/t/p/h632";

export function PersonDetails({ personId, onBack, onMovieSelect }: PersonDetailsProps) {
    const [person, setPerson] = React.useState<Person | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<'all' | 'movie' | 'tv'>('all');
    const [visibleCount, setVisibleCount] = React.useState(12);

    React.useEffect(() => {
        const loadPerson = async () => {
            setIsLoading(true);
            try {
                const data = await fetchPersonDetails(personId);
                setPerson(data);
            } catch (error) {
                console.error("Failed to fetch person details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPerson();
    }, [personId]);

    React.useEffect(() => {
        setVisibleCount(12);
    }, [filter]);

    const knownFor = React.useMemo(() => {
        if (!person) return [];
        return person.combined_credits?.cast
            ?.filter((item) => item.poster_path && (item.title || item.name))
            .reduce((acc, current) => {
                const x = acc.find(item => item.id === current.id);
                if (!x) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
            }, [] as Movie[])
            .sort((a, b) => {
                const getScore = (item: Movie) => {
                    const voteCount = item.vote_count || 0;
                    const popularity = item.popularity || 0;
                    const releaseDate = item.release_date || item.first_air_date;
                    const isRecent = releaseDate
                        ? new Date(releaseDate).getFullYear() >= new Date().getFullYear() - 2
                        : false;

                    // Weighting factors
                    return voteCount + (popularity * 20) + (isRecent ? 500 : 0);
                };
                return getScore(b) - getScore(a);
            }) || [];
    }, [person]);

    const filteredKnownFor = React.useMemo(() => {
        if (filter === 'all') return knownFor;
        return knownFor.filter(item => item.media_type === filter);
    }, [knownFor, filter]);

    const displayedKnownFor = React.useMemo(() => {
        return filteredKnownFor.slice(0, visibleCount);
    }, [filteredKnownFor, visibleCount]);

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-40" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="h-[400px] w-full rounded-lg" />
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </div>
        );
    }

    if (!person) return null;

    return (
        <div className="animate-in fade-in slide-in-from-right-10 duration-500 pb-10">
            <Button variant="ghost" className="mb-4 gap-2 pl-0 hover:bg-transparent hover:text-primary" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Profile & Stats */}
                <div className="flex flex-col gap-6">
                    {/* Profile Image - Rectangular/Portrait */}
                    <div className="relative aspect-[2/3] w-3/4 sm:w-full mx-auto overflow-hidden rounded-md shadow-xl">
                        {person.profile_path ? (
                            <Image
                                src={`${PROFILE_BASE_URL}${person.profile_path}`}
                                alt={person.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                <span className="text-muted-foreground">No Image</span>
                            </div>
                        )}
                    </div>


                    {/* Mobile Name Display */}
                    <h2 className="text-3xl font-bold text-center md:hidden">{person.name}</h2>

                    {/* Social Links */}
                    <div className="flex justify-center gap-4">
                        {person.external_ids?.facebook_id && (
                            <a href={`https://facebook.com/${person.external_ids.facebook_id}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#1877f2] transition-colors">
                                <Facebook className="h-6 w-6" />
                            </a>
                        )}
                        {person.external_ids?.instagram_id && (
                            <a href={`https://instagram.com/${person.external_ids.instagram_id}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#e4405f] transition-colors">
                                <Instagram className="h-6 w-6" />
                            </a>
                        )}
                        {person.external_ids?.twitter_id && (
                            <a href={`https://twitter.com/${person.external_ids.twitter_id}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#1da1f2] transition-colors">
                                <Twitter className="h-6 w-6" />
                            </a>
                        )}
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-3 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                        {person.birthday && (
                            <div className="flex justify-between border-b border-border/50 pb-2">
                                <span className="font-semibold text-foreground">Born</span>
                                <span className="text-right">{new Date(person.birthday).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                            </div>
                        )}
                        {person.place_of_birth && (
                            <div className="flex justify-between border-b border-border/50 pb-2">
                                <span className="font-semibold text-foreground shrink-0 pr-2">Place of Birth</span>
                                <span className="text-right">{person.place_of_birth}</span>
                            </div>
                        )}
                        {person.deathday && (
                            <div className="flex justify-between border-b border-border/50 pb-2">
                                <span className="font-semibold text-foreground">Died</span>
                                <span className="text-right">{new Date(person.deathday).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-1">
                            <span className="font-semibold text-foreground">Gender</span>
                            <span className="text-right">
                                {person.gender === 1 ? "Female" : person.gender === 2 ? "Male" : person.gender === 3 ? "Non-binary" : "Not specified"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Tabs */}
                <div className="md:col-span-2">
                    <h2 className="text-3xl font-bold mb-6 hidden md:block">{person.name}</h2>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="known_for">Known For</TabsTrigger>
                        </TabsList>

                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview" className="space-y-4 animate-in fade-in duration-300">
                            <div className="rounded-md border p-4 bg-muted/10">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    Biography
                                </h3>
                                <ScrollArea className="h-[400px] w-full">
                                    <div className="prose prose-invert max-w-none text-sm leading-relaxed text-muted-foreground">
                                        <p className="whitespace-pre-line text-justify">
                                            {person.biography || "No biography available."}
                                        </p>
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        {/* KNOWN FOR TAB */}
                        <TabsContent value="known_for" className="space-y-4 animate-in fade-in duration-300">
                            <div className="flex gap-2 mb-4">
                                <Button
                                    variant={filter === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('all')}
                                    className="h-8 rounded-full px-4"
                                >
                                    All
                                </Button>
                                <Button
                                    variant={filter === 'movie' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('movie')}
                                    className="h-8 rounded-full px-4"
                                >
                                    Movies
                                </Button>
                                <Button
                                    variant={filter === 'tv' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('tv')}
                                    className="h-8 rounded-full px-4"
                                >
                                    TV Shows
                                </Button>
                            </div>

                            {displayedKnownFor.length > 0 ? (
                                <ScrollArea className="h-[500px] w-full pr-4">
                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {displayedKnownFor.map((credit, index) => (
                                            <div
                                                key={`${credit.id}-${index}`}
                                                className="cursor-pointer transition-transform hover:scale-105 group"
                                                onClick={() => onMovieSelect(credit.id, credit.media_type || "movie")}
                                            >
                                                <div className="aspect-[2/3] w-full rounded-md overflow-hidden bg-muted relative">
                                                    {credit.poster_path ? (
                                                        <Image
                                                            src={`${IMAGE_BASE_URL}${credit.poster_path}`}
                                                            alt={credit.title || credit.name || "Poster"}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground p-2 text-center">
                                                            No Poster
                                                        </div>
                                                    )}
                                                    {credit.vote_average > 0 && (
                                                        <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 text-yellow-400">
                                                            <Star className="h-2.5 w-2.5 fill-current" />
                                                            {credit.vote_average.toFixed(1)}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors" title={credit.title || credit.name}>
                                                    {credit.title || credit.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                    {(credit.release_date || credit.first_air_date)?.slice(0, 4)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {visibleCount < filteredKnownFor.length && (
                                        <div className="flex justify-center mt-6 py-2">
                                            <Button
                                                variant="secondary"
                                                className="w-full sm:w-auto min-w-[200px]"
                                                onClick={() => setVisibleCount((prev) => prev + 12)}
                                            >
                                                Show More
                                            </Button>
                                        </div>
                                    )}
                                </ScrollArea>
                            ) : (
                                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                                    No {filter === 'all' ? 'known' : filter === 'movie' ? 'movie' : 'TV show'} credits available.
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
