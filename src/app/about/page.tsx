"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Clapperboard, History, Sparkles } from "lucide-react";
import Atropos from "atropos/react";
import "atropos/css";

import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";
import type { Movie } from "@/lib/types";
import { useListManager } from "@/hooks/useListManager";

// Define ListType locally as it's not exported from types
type ListType = "watchlist" | "watching" | "watched";

export default function AboutPage() {
  const {
    watchlist,
    watching,
    watched,
    handleListUpdate
  } = useListManager();

  const headerLists = useMemo(
    () => ({ watchlist, watching, watched }),
    [watchlist, watching, watched]
  );

  const features = [
    {
      icon: <Clapperboard className="h-10 w-10 text-primary" />,
      title: "Track Your Watchlist",
      description:
        "Keep track of movies and TV shows you want to watch. Never forget a title again.",
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: <History className="h-10 w-10 text-primary" />,
      title: "History & Statistics",
      description:
        "Log what you've watched and get insights into your viewing habits over time.",
      color: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: "AI Recommendations",
      description:
        "Get personalized recommendations based on your unique taste using advanced AI.",
      color: "from-amber-500/20 to-orange-500/20",
    },
  ];

  const faqs = [
    {
      question: "Where does the content come from?",
      answer:
        "We source our movie and TV show data from reputable third-party databases (like TMDB) to ensure accurate and up-to-date information on cast, crew, release dates, and more.",
    },
    {
      question: "Do I need to create an account to use this site?",
      answer:
        "No, you can use Stream Track without an account. However, creating an account allows you to save your data across devices so that you can access from any device.",
    },
    {
      question: "Will my data be saved if I don't create an account?",
      answer:
        "Yes, if you choose not to create an account, your data will be saved locally in your browser's local storage. However, this means your data will only be accessible on the device and browser you used to add it.",
    },
    {
      question: "How do I make an account?",
      answer:
        "Simply click on the 'Sign Up' or 'Get Started' button on our homepage. You can create an account using your email address.",
    },
    {
      question: "Is Stream Track free to use?",
      answer:
        "Yes! Stream Track is completely free to use. You can track movies, shows, and get AI recommendations without any cost.",
    },
    {
      question: "Can I import my data from other platforms?",
      answer:
        "Currently, we don't support direct automated imports from other files, but you can easily add all your TV shows and movies by clicking the '+' icon in the header.",
    },
    {
      question: "How do I add a missing TV show or movie?",
      answer:
        "No—since we don't host content, we cannot add or change what's available. The content list is based on what's publicly accessible through the search mechanism.",
    },
    {
      question: "I can't find the movie/show I'm searching for!",
      answer:
        "Make sure you are typing the exact title. Sometimes slightly different spellings or localized titles can affect search results. Try searching for the main English title.",
    },
    {
      question: "Can I remove a film from my watched list?",
      answer:
        "Absolutely. You can manage your lists at any time by navigating to the specific page and updating its status.",
    },
    {
      question: "What about my data and stuff?",
      answer:
        "We take privacy seriously. Your data is used solely to provide you with the tracking and recommendation services. We do not sell your personal data to third parties.",
    },
    {
      question: "How should I use Stream Track?",
      answer:
        "Use it as your digital entertainment diary. Log what you've seen to keep a history, add things you want to see to your watchlist so you never forget them, and check your dashboard for stats on your viewing habits.",
    },
    {
      question: "Tips and tricks",
      answer:
        "Rate movies to improve your recommendations! The more you rate, the better our AI understands your genuine taste. Also, check your statistics page to see cool insights about your favorite genres.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-12 text-foreground">
      <Header lists={headerLists} onListUpdate={handleListUpdate} />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background px-4 pt-32 pb-24 md:px-6 lg:px-8">
        <div className="bg-grid-white/[0.02] absolute inset-0 bg-[length:50px_50px]" />
        <div className="container relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary duration-500 animate-in fade-in slide-in-from-bottom-3">
            v1.0 is now live
          </div>
          <h1 className="mb-8 text-5xl font-bold tracking-tight duration-700 animate-in fade-in slide-in-from-bottom-4 md:text-7xl">
            Track Your <span className="text-primary">Entertainment</span>{" "}
            Journey
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground duration-1000 animate-in fade-in slide-in-from-bottom-5 md:text-2xl">
            Stream Track is the ultimate companion for movie and TV show
            enthusiasts. Discover, track, and relive your favorite moments in
            cinema and television.
          </p>
          <div className="flex flex-wrap justify-center gap-4 delay-200 duration-1000 animate-in fade-in slide-in-from-bottom-6">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-8 text-lg shadow-lg transition-all hover:shadow-primary/25"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-full px-8 text-lg"
            >
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="h-full">
              <Atropos
                className="h-full rounded-xl"
                highlight={true}
                shadow={true}
                shadowScale={1.05}
              >
                <Card
                  className={`h-full bg-gradient-to-br ${feature.color} flex flex-col items-center justify-center border-border/50 p-6 text-center backdrop-blur-sm transition-colors hover:border-primary/50`}
                  data-atropos-offset="0"
                >
                  <div
                    className="mb-6 w-fit rounded-full bg-background/50 p-4 shadow-lg"
                    data-atropos-offset="5"
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="mb-3 text-2xl" data-atropos-offset="2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription
                    className="mx-auto max-w-xs text-base leading-relaxed"
                    data-atropos-offset="0"
                  >
                    {feature.description}
                  </CardDescription>
                </Card>
              </Atropos>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-muted/20 px-4 py-24 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8 text-center md:text-left">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-5xl">
              Why We Built Stream Track
            </h2>
            <div className="prose dark:prose-invert max-w-none space-y-6 text-center text-xl leading-loose text-muted-foreground md:text-left">
              <p>
                We know the struggle of endlessly scrolling through streaming
                services, trying to find something to watch. We wanted a single
                place where you could keep track of everything you’ve watched
                and everything you want to watch—no matter which platform it’s
                on.
              </p>
              <p>
                Stream Track is a media tracking web application designed to
                help you organize TV shows and movies you are currently
                watching, have already completed, or plan to watch in the
                future.
              </p>
              <p>
                We built Stream Track because many streaming platforms mix
                watched and unwatched content together, making it difficult to
                clearly see what you’ve already finished. With Stream Track,
                your viewing status is always clear, thanks to simple and
                well-defined categories that make managing your media
                effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto max-w-3xl px-4 py-24 md:px-6 lg:px-8">
        <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-lg border bg-card/40 px-4 transition-all duration-200 data-[state=open]:bg-card/80"
            >
              <AccordionTrigger className="py-4 text-left text-lg font-medium transition-colors hover:text-primary hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-base leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24 text-center">
        <div className="container relative mx-auto">
          <div className="pointer-events-none absolute inset-0 -translate-y-1/2 transform rounded-full bg-primary/20 opacity-20 blur-[100px]" />
          <h2 className="relative z-10 mb-8 text-4xl font-bold md:text-5xl">
            Ready to start tracking?
          </h2>
          <Button
            asChild
            size="lg"
            className="relative z-10 rounded-full px-10 py-8 text-xl shadow-2xl transition-all hover:shadow-primary/50"
          >
            <Link href="/signup">Join Stream Track Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
