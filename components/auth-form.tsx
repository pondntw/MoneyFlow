"use client"

import Link from 'next/link'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuthForm({ type, message, actionFn }: { type: 'login' | 'signup', message?: string, actionFn?: any }) {
    const { t } = useLanguage()

    return (
        <form className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-3 text-center lg:text-left">
                <h1 className="text-3xl font-bold tracking-tight">{type === 'login' ? t("login.title") : t("signup.title")}</h1>
                <p className="text-muted-foreground">{type === 'login' ? t("login.desc") : t("signup.desc")}</p>
            </div>

            {message && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                    {message}
                </div>
            )}

            <div className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">{t("login.email")}</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className="h-12 bg-muted/50 border-border/50 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 transition-all rounded-xl"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium">{t("login.password")}</Label>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="h-12 bg-muted/50 border-border/50 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 transition-all rounded-xl"
                        required
                    />
                </div>
                {type === 'signup' && (
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium">{t("signup.confirmPassword")}</Label>
                        <Input
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            className="h-12 bg-muted/50 border-border/50 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 transition-all rounded-xl"
                            required
                        />
                    </div>
                )}
            </div>

            <div className="space-y-4 pt-4">
                <Button formAction={actionFn} className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-all bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    {type === 'login' ? t("login.submit") : t("signup.submit")}
                </Button>

                <div className="text-center text-sm text-muted-foreground mt-6">
                    {type === 'login' ? t("login.noAccount") : t("signup.hasAccount")}{' '}
                    <Link href={type === 'login' ? "/signup" : "/login"} className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                        {type === 'login' ? t("login.signupNow") : t("signup.loginHere")}
                    </Link>
                </div>
            </div>
        </form>
    )
}
