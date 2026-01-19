'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Truck, Loader2 } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export default function Auth() {
    const router = useRouter();
    const { signIn, signUp, isAuthenticated, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Login form state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Signup form state
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
    const [displayName, setDisplayName] = useState("");

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/");
        }
    }, [isAuthenticated, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate inputs
        const emailResult = emailSchema.safeParse(loginEmail);
        if (!emailResult.success) {
            toast.error(emailResult.error.errors[0].message);
            return;
        }

        const passwordResult = passwordSchema.safeParse(loginPassword);
        if (!passwordResult.success) {
            toast.error(passwordResult.error.errors[0].message);
            return;
        }

        setIsLoading(true);
        const { error } = await signIn(loginEmail, loginPassword);
        setIsLoading(false);

        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                toast.error("Invalid email or password. Please try again.");
            } else if (error.message.includes("Email not confirmed")) {
                toast.error("Please confirm your email before logging in.");
            } else {
                toast.error(error.message);
            }
            return;
        }

        toast.success("Welcome back!");
        router.push("/");
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate inputs
        const emailResult = emailSchema.safeParse(signupEmail);
        if (!emailResult.success) {
            toast.error(emailResult.error.errors[0].message);
            return;
        }

        const passwordResult = passwordSchema.safeParse(signupPassword);
        if (!passwordResult.success) {
            toast.error(passwordResult.error.errors[0].message);
            return;
        }

        if (signupPassword !== signupConfirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        const { data, error } = await signUp(signupEmail, signupPassword, displayName || undefined);
        setIsLoading(false);

        if (error) {
            if (error.message.includes("User already registered")) {
                toast.error("An account with this email already exists. Please login instead.");
            } else {
                toast.error(error.message);
            }
            return;
        }

        if (data.user && !data.session) {
            toast.success("Check your email to confirm your account!");
        } else {
            toast.success("Account created successfully!");
            router.push("/");
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Truck className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Dispatch Control</CardTitle>
                    <CardDescription>
                        Sign in to manage your logistics operations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="mt-4">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup" className="mt-4">
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="display-name">Display Name (optional)</Label>
                                    <Input
                                        id="display-name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={signupConfirmPassword}
                                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
