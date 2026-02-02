"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

import Image from "next/image";

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            router.push("/");
            toast({ title: "Success", description: "Logged in successfully!" });
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
            {/* Animated Background Blobs */}
            <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] animate-blob rounded-full bg-primary/30 blur-[100px] filter" />
            <div className="absolute top-[20%] -right-[10%] h-[400px] w-[400px] animate-blob animation-delay-2000 rounded-full bg-purple-500/30 blur-[100px] filter" />
            <div className="absolute -bottom-[10%] left-[20%] h-[600px] w-[600px] animate-blob animation-delay-4000 rounded-full bg-blue-500/20 blur-[100px] filter" />

            <div className="relative z-10 w-full max-w-md px-4">
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-500">
                    <CardHeader className="space-y-3 text-center">
                        <Link
                            href="/"
                            className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 p-3 ring-1 ring-white/10 transition-transform hover:scale-105"
                        >
                            <Image
                                src="/icons/logo.svg"
                                alt="Logo"
                                width={48}
                                height={48}
                                className="h-full w-full"
                            />
                        </Link>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                            <CardDescription className="text-muted-foreground/80">
                                Enter your credentials to access your account
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label className="text-foreground/90">Email</Label>
                                            <FormControl>
                                                <Input
                                                    placeholder="name@example.com"
                                                    {...field}
                                                    className="border-white/10 bg-white/5 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-white/10 focus:ring-0"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label className="text-foreground/90">Password</Label>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    {...field}
                                                    className="border-white/10 bg-white/5 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-white/10 focus:ring-0"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 text-base py-5"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? "Logging in..." : "Login"}
                                </Button>
                            </form>
                        </Form>
                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Don&apos;t have an account yet 😬{" "}
                            <Link
                                href="/signup"
                                className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                            >
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
