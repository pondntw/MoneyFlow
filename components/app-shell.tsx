"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { LayoutDashboard, ArrowLeftRight, Landmark, TrendingUp, Moon, Sun, LogOut, Loader2, Wallet } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { FinanceProvider, useFinance } from "@/components/finance-provider"
import { Dashboard } from "@/components/dashboard"
import { TransactionsPage } from "@/components/transactions-page"
import { AccountsPage } from "@/components/accounts-page"
import { InvestmentsPage } from "@/components/investments-page"
import { Button } from "@/components/ui/button"
import { signout } from "@/app/login/actions"

type Page = "dashboard" | "transactions" | "accounts" | "investments"

import { useLanguage } from "@/components/language-provider"

function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  return (
    <Button
      variant="ghost"
      className="h-9 px-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground font-semibold"
      onClick={() => setLanguage(language === "th" ? "en" : "th")}
      aria-label="Toggle language"
    >
      {language === "th" ? "EN" : "TH"}
    </Button>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="size-[18px] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-[18px] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  )
}

function AppContent() {
  const [activePage, setActivePage] = useState<Page>("dashboard")
  const { loading } = useFinance()
  const { t } = useLanguage()

  const navItems = [
    { id: "dashboard" as Page, label: t("nav.dashboard"), icon: LayoutDashboard },
    { id: "transactions" as Page, label: t("nav.transactions"), icon: ArrowLeftRight },
    { id: "accounts" as Page, label: t("nav.accounts"), icon: Landmark },
    { id: "investments" as Page, label: t("nav.investments"), icon: TrendingUp },
  ]

  const pageTitle = navItems.find((n) => n.id === activePage)?.label ?? ""

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <Wallet className="size-4" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
                MoneyFlow
              </span>
              <span className="text-[11px] text-sidebar-foreground/50">
                Personal Finance
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activePage === item.id}
                      onClick={() => setActivePage(item.id)}
                      tooltip={item.label}
                      className="h-10 rounded-xl"
                    >
                      <item.icon className="size-[18px]" />
                      <span className="font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-3">
          <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="group-data-[collapsible=icon]:hidden size-9 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-red-500"
              onClick={async () => await signout()}
              title={t("logout")}
            >
              <LogOut className="size-[18px]" />
            </Button>
            <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/80 px-6 backdrop-blur-xl">
          <SidebarTrigger className="-ml-2" />
          <div className="h-5 w-px bg-border" />
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {pageTitle}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {activePage === "dashboard" && <Dashboard />}
          {activePage === "transactions" && <TransactionsPage />}
          {activePage === "accounts" && <AccountsPage />}
          {activePage === "investments" && <InvestmentsPage />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function AppShell() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </ThemeProvider>
  )
}
