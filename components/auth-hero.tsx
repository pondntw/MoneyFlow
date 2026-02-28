"use client"

import { useLanguage } from '@/components/language-provider'
import { Wallet, ChartLine, ShieldCheck } from 'lucide-react'

export function AuthHero() {
    const { t } = useLanguage()

    return (
        <div className="hidden lg:flex w-1/2 bg-zinc-950 border-r border-border/10 flex-col justify-between p-12 relative overflow-hidden text-zinc-50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-zinc-950 to-zinc-950 z-0" />
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl z-0" />
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-900/10 rounded-full blur-3xl z-0" />

            <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <Wallet className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">MoneyFlow</span>
            </div>

            <div className="relative z-10 space-y-6 max-w-xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h2 className="text-4xl lg:text-5xl font-semibold leading-tight text-white tracking-tight">
                    {t("hero.manage")}<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">{t("hero.finance")}</span>
                    {t("hero.easily")}
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed">
                    {t("hero.desc1")}
                </p>
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-800/50">
                    <div className="space-y-3">
                        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-blue-400 shadow-inner">
                            <ChartLine size={24} />
                        </div>
                        <h3 className="font-semibold text-white text-lg">{t("hero.feature1Title")}</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">{t("hero.feature1Desc")}</p>
                    </div>
                    <div className="space-y-3">
                        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-blue-400 shadow-inner">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="font-semibold text-white text-lg">{t("hero.feature2Title")}</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">{t("hero.feature2Desc")}</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 text-zinc-500 text-sm font-medium">
                &copy; {new Date().getFullYear()} MoneyFlow. All rights reserved.
            </div>
        </div>
    )
}
