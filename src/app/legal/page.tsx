"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  EyeOff,
  User,
  AlertTriangle,
  Mail,
} from "lucide-react";

export default function LegalPage() {
  const legalCards = [
    {
      icon: <Search className="h-10 w-10 text-blue-500" />,
      subtitle: "SERVICE MODEL",
      title: "How We Operate",
      content: [
        "Stream Track functions as a personal media tracking application that aggregates metadata for movies and TV shows from across the internet.",
        "We don't host, store, or control any media files - everything is sourced from external third-party APIs that are already publicly accessible.",
        "Our automated systems simply provide an interface to organize content that's already available online, without bypassing any security measures.",
      ],
      footerLink: "/about",
      footerText: "Learn more about how Stream Track works",
    },
    {
      icon: <CheckCircle2 className="h-10 w-10 text-green-500" />,
      subtitle: "COPYRIGHT POLICY",
      title: "Content & Copyright",
      content: [
        "Since we don't host any content ourselves, all takedown requests must go directly to the websites that actually host the files.",
        "We respect intellectual property rights and will cooperate with valid legal requests within our technical capabilities.",
        "For content removal, please contact the original hosting platform - we cannot remove what we don't control.",
        "If you are a copyright holder and want to report a violation, we are more than happy to point you to where we found the content.",
      ],
    },
    {
      icon: <EyeOff className="h-10 w-10 text-purple-500" />,
      subtitle: "DATA PROTECTION",
      title: "Privacy & Data",
      content: [
        "User privacy is important to us. We collect minimal data (Name and email) but do not store, or track any personal information about our users.",
        "Optionally, users can store their bookmarks and watch history in our encrypted backend. But we don't store any personal information or identifying data.",
        "Stream Track is designed to be privacy-first.",
      ],
    },
    {
      icon: <User className="h-10 w-10 text-yellow-500" />,
      subtitle: "USER RESPONSIBILITIES",
      title: "User Guidelines",
      content: [
        "Users are responsible for ensuring their access complies with local laws and regulations in their jurisdiction.",
        "We strongly recommend to use secure connections while browsing. Importing or adding data manually should be done responsibly.",
        "Please respect intellectual property rights and be mindful of copyright laws in your area.",
      ],
    },
    {
      icon: <AlertTriangle className="h-10 w-10 text-red-500" />,
      subtitle: "TERMS & CONDITIONS",
      title: "Service Terms",
      content: [
        "Stream Track is licensed under the MIT license.",
        "By using our platform, you acknowledge these terms and agree that we're not responsible for third-party content.",
        "We operate in good faith compliance with applicable laws and regulations. We are not liable for any damages or losses incurred while using our service.",
      ],
    },
    {
      icon: <Mail className="h-10 w-10 text-cyan-500" />,
      subtitle: "LEGAL CONTACT",
      title: "Legal Inquiries",
      content: [
        "For legal matters related to specific content, please contact the hosting websites directly as they have control over their files.",
        "Stream Track operates within legal boundaries and cooperates with legitimate requests when technically feasible.",
      ],
      email: "streamtrack1@gmail.com",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="container relative mx-auto max-w-7xl px-4 py-12 md:py-20 pt-24 md:pt-32">
        {/* Header Section */}
        <div className="mb-16">
          <Button
            asChild
            variant="ghost"
            className="group mb-8 pl-0 text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
          </Button>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Legal & Compliance
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Transparency about how we operate, handle data, and respect content
            rights.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {legalCards.map((card, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-8 shadow-sm transition-colors duration-300 hover:border-primary/50"
            >
              {/* Hover Gradient Effect */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10 flex h-full flex-col">
                {/* Icon */}
                <div className="mb-8">{card.icon}</div>

                {/* Title Block */}
                <div className="mb-6">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {card.subtitle}
                  </h3>
                  <h2 className="text-2xl font-bold">{card.title}</h2>
                </div>

                {/* Content */}
                <div className="flex-grow space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                  {card.content.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {/* Footer Links/Contact */}
                {(card.footerLink || card.email) && (
                  <div className="mt-8 border-t border-border/50 pt-6">
                    {card.footerLink && (
                      <Link
                        href={card.footerLink}
                        className="group/link inline-flex items-center font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {card.footerText}
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    )}

                    {card.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Contact:</span>
                        <a
                          href={`mailto:${card.email}`}
                          className="text-primary transition-colors hover:underline"
                        >
                          {card.email}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Disclaimer */}
        <div className="mt-20 border-t border-border/50 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Stream Track is a project for educational purposes. All trademarks
            belong to their respective owners.
          </p>
        </div>
      </div>
    </div>
  );
}
