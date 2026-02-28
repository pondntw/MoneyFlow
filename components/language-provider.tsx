"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type Language = "th" | "en"

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string, replacements?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const translations: Record<Language, Record<string, string>> = {
    th: {
        // Common
        "currency.thb": "บาท",
        "currency.usd": "USD",
        "logout": "ออกจากระบบ",
        // AppShell
        "nav.dashboard": "ภาพรวม",
        "nav.transactions": "รายรับ-รายจ่าย",
        "nav.accounts": "บัญชีธนาคาร",
        "nav.investments": "การลงทุน",
        // Dashboard
        "dash.totalBalance": "ยอดเงินทั้งหมด",
        "dash.incomeThisMonth": "รายรับเดือนนี้",
        "dash.expenseThisMonth": "รายจ่ายเดือนนี้",
        "dash.investValue": "มูลค่าการลงทุน",
        "dash.netBalance": "คงเหลือสุทธิเดือนนี้",
        "dash.monthlySummary": "สรุปรายเดือน",
        "dash.categoryExpense": "รายจ่ายตามหมวดหมู่",
        "dash.recentTransactions": "รายการล่าสุด",
        "dash.noData": "ยังไม่มีข้อมูล",
        "dash.income": "รายรับ",
        "dash.expense": "รายจ่าย",
        // Login
        "login.title": "เข้าสู่ระบบ",
        "login.desc": "ป้อนอีเมลและรหัสผ่านเพื่อเข้าสู่บัญชีของคุณ",
        "login.email": "อีเมล",
        "login.password": "รหัสผ่าน",
        "login.submit": "เข้าสู่ระบบ (Login)",
        "login.or": "หรือ",
        "login.noAccount": "ยังไม่มีบัญชีใช่ไหม?",
        "login.signupNow": "สมัครสมาชิกตอนนี้",
        // Signup
        "signup.title": "สร้างบัญชีเงินฝาก",
        "signup.desc": "ป้อนอีเมลและรหัสผ่านเพื่อสมัครสมาชิก MoneyFlow",
        "signup.confirmPassword": "ยืนยันรหัสผ่าน",
        "signup.submit": "สมัครสมาชิก (Sign Up)",
        "signup.hasAccount": "มีบัญชีอยู่แล้วใช่ไหม?",
        "signup.loginHere": "เข้าสู่ระบบที่นี่",
        // Hero Let
        "hero.manage": "จัดการและติดตาม",
        "hero.finance": "การเงินของคุณ",
        "hero.easily": "ได้อย่างง่ายดาย",
        "hero.desc1": "MoneyFlow ช่วยให้คุณเห็นภาพรวมการลงทุน แจกแจงสินทรัพย์ และวิเคราะห์การเติบโตของพอร์ตโฟลิโอของคุณในหน้าปัดเดียว พร้อมสรุปข้อมูลแบบเรียลไทม์",
        "hero.start": "เริ่มต้นจัดการความมั่งคั่ง",
        "hero.future": "เพื่ออนาคตของคุณ",
        "hero.desc2": "เปิดบัญชี MoneyFlow วันนี้เพื่อเข้าถึงเครื่องมือบริหารการเงินระดับแนวหน้า ให้การจัดการพอร์ตเป็นเรื่องง่าย",
        "hero.feature1Title": "วิเคราะห์ผลตอบแทน",
        "hero.feature1Desc": "ข้อมูลอัปเดตแบบเรียลไทม์ พร้อมกราฟแสดงผลที่เข้าใจง่าย ตอบโจทย์ทุกการลงทุน",
        "hero.feature2Title": "ความปลอดภัยระดับสากล",
        "hero.feature2Desc": "ข้อมูลส่วนตัวและรายการทั้งหมดของคุณถูกปกป้องด้วยมาตรฐานความปลอดภัยสูงสุด",
        "txn.all": "ทั้งหมด",
        "txn.income": "รายรับ",
        "txn.expense": "รายจ่าย",
        "txn.add": "เพิ่มรายการ",
        "txn.allTitle": "รายการทั้งหมด",
        "txn.noTxn": "ยังไม่มีรายการ",
        "txn.unspecified": "ไม่ระบุ",
        "txn.addTitle": "เพิ่มรายการใหม่",
        "txn.amountLabel": "จำนวนเงิน (บาท)",
        "txn.categoryLabel": "หมวดหมู่",
        "txn.selectCategory": "เลือกหมวดหมู่",
        "txn.descLabel": "รายละเอียด",
        "txn.descPlaceholder": "รายละเอียด (ไม่บังคับ)",
        "txn.dateLabel": "วันที่",
        "txn.accountLabel": "บัญชี",
        "txn.selectAccount": "เลือกบัญชี",
        "common.cancel": "ยกเลิก",
        "common.save": "บันทึก",
        "acc.totalBalance": "ยอดรวมทุกบัญชี",
        "acc.add": "เพิ่มบัญชี",
        "acc.noAcc": "ยังไม่มีบัญชี กดเพิ่มบัญชีเพื่อเริ่มต้น",
        "acc.addTitle": "เพิ่มบัญชีธนาคาร",
        "acc.nameLabel": "ชื่อบัญชี",
        "acc.namePlaceholder": "เช่น บัญชีเงินเดือน",
        "acc.bankLabel": "ธนาคาร",
        "acc.selectBank": "เลือกธนาคาร",
        "acc.numberLabel": "เลขบัญชี",
        "acc.initBalanceLabel": "ยอดเริ่มต้น (บาท)",
        "acc.colorLabel": "สีบัญชี",
        "inv.totalCost": "ต้นทุนรวม",
        "inv.totalValue": "มูลค่าตลาดรวม",
        "inv.pnl": "กำไร/ขาดทุน",
        "inv.portfolio": "พอร์ตการลงทุน",
        "inv.addStock": "เพิ่มหุ้น",
        "inv.noStock": "ยังไม่มีหุ้นในพอร์ต กดเพิ่มหุ้นเพื่อเริ่มต้น",
        "inv.sharesLabel": "จำนวน",
        "inv.sharesUnit": "หุ้น",
        "inv.currentPriceLabel": "ราคาปัจจุบัน",
        "inv.avgCostLabel": "ต้นทุนเฉลี่ย",
        "inv.totalValueLabel": "มูลค่ารวม",
        "inv.editStock": "แก้ไขหุ้น",
        "inv.addNewStock": "เพิ่มหุ้นใหม่",
        "inv.symbolLabel": "สัญลักษณ์หุ้น",
        "inv.symbolPlaceholder": "เช่น PTT",
        "inv.companyNameLabel": "ชื่อบริษัท",
        "inv.companyNamePlaceholder": "เช่น บมจ. ปตท.",
        "inv.numSharesLabel": "จำนวนหุ้น",
        "inv.avgCostFormLabel": "ต้นทุนเฉลี่ย (USD)",
    },
    en: {
        // Common
        "currency.thb": "THB",
        "currency.usd": "USD",
        "logout": "Log out",
        // AppShell
        "nav.dashboard": "Dashboard",
        "nav.transactions": "Transactions",
        "nav.accounts": "Bank Accounts",
        "nav.investments": "Investments",
        // Dashboard
        "dash.totalBalance": "Total Balance",
        "dash.incomeThisMonth": "Income This Month",
        "dash.expenseThisMonth": "Expense This Month",
        "dash.investValue": "Investment Value",
        "dash.netBalance": "Net Balance This Month",
        "dash.monthlySummary": "Monthly Summary",
        "dash.categoryExpense": "Expense by Category",
        "dash.recentTransactions": "Recent Transactions",
        "dash.noData": "No data available",
        "dash.income": "Income",
        "dash.expense": "Expense",
        // Login
        "login.title": "Welcome Back",
        "login.desc": "Enter your email and password to log in",
        "login.email": "Email",
        "login.password": "Password",
        "login.submit": "Log In",
        "login.or": "OR",
        "login.noAccount": "Don't have an account?",
        "login.signupNow": "Sign up now",
        // Signup
        "signup.title": "Create an Account",
        "signup.desc": "Enter your email and password to sign up for MoneyFlow",
        "signup.confirmPassword": "Confirm Password",
        "signup.submit": "Sign Up",
        "signup.hasAccount": "Already have an account?",
        "signup.loginHere": "Log in here",
        // Hero Let
        "hero.manage": "Manage and Track",
        "hero.finance": "Your Finances",
        "hero.easily": "with ease",
        "hero.desc1": "MoneyFlow helps you visualize your investments, categorize assets, and analyze portfolio growth in one dashboard with real-time data.",
        "hero.start": "Start managing wealth",
        "hero.future": "for your future",
        "hero.desc2": "Open a MoneyFlow account today to access top-tier financial management tools. Make portfolio management a breeze.",
        "hero.feature1Title": "Return Analysis",
        "hero.feature1Desc": "Real-time updates with easy-to-understand charts suited for every investment.",
        "hero.feature2Title": "Global Standard Security",
        "hero.feature2Desc": "Your personal data and all transactions are protected by the highest security standards.",
        "txn.all": "All",
        "txn.income": "Income",
        "txn.expense": "Expense",
        "txn.add": "Add Transaction",
        "txn.allTitle": "All Transactions",
        "txn.noTxn": "No transactions yet",
        "txn.unspecified": "Unspecified",
        "txn.addTitle": "Add New Transaction",
        "txn.amountLabel": "Amount ({currency})",
        "txn.categoryLabel": "Category",
        "txn.selectCategory": "Select Category",
        "txn.descLabel": "Description",
        "txn.descPlaceholder": "Description (Optional)",
        "txn.dateLabel": "Date",
        "txn.accountLabel": "Account",
        "txn.selectAccount": "Select Account",
        "common.cancel": "Cancel",
        "common.save": "Save",
        "acc.totalBalance": "Total Balance",
        "acc.add": "Add Account",
        "acc.noAcc": "No accounts yet. Click Add to start.",
        "acc.addTitle": "Add Bank Account",
        "acc.nameLabel": "Account Name",
        "acc.namePlaceholder": "e.g., Salary Account",
        "acc.bankLabel": "Bank",
        "acc.selectBank": "Select Bank",
        "acc.numberLabel": "Account Number",
        "acc.initBalanceLabel": "Initial Balance ({currency})",
        "acc.colorLabel": "Account Color",
        "inv.totalCost": "Total Cost",
        "inv.totalValue": "Total Market Value",
        "inv.pnl": "Profit/Loss",
        "inv.portfolio": "Investment Portfolio",
        "inv.addStock": "Add Stock",
        "inv.noStock": "No stocks in portfolio. Add a stock to start.",
        "inv.sharesLabel": "Shares",
        "inv.sharesUnit": "Shares",
        "inv.currentPriceLabel": "Current Price",
        "inv.avgCostLabel": "Average Cost",
        "inv.totalValueLabel": "Total Value",
        "inv.editStock": "Edit Stock",
        "inv.addNewStock": "Add New Stock",
        "inv.symbolLabel": "Stock Symbol",
        "inv.symbolPlaceholder": "e.g., AAPL",
        "inv.companyNameLabel": "Company Name",
        "inv.companyNamePlaceholder": "e.g., Apple Inc.",
        "inv.numSharesLabel": "Number of Shares",
        "inv.avgCostFormLabel": "Average Cost (USD)",
    },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("th")

    useEffect(() => {
        // Load from local storage
        const saved = localStorage.getItem("app-language") as Language
        if (saved && (saved === "th" || saved === "en")) {
            setLanguageState(saved)
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem("app-language", lang)
        if (typeof document !== "undefined") {
            document.documentElement.lang = lang
        }
    }

    const t = (key: string, replacements?: Record<string, string>) => {
        let str = translations[language]?.[key] || translations["en"]?.[key] || key
        if (replacements) {
            Object.entries(replacements).forEach(([k, v]) => {
                str = str.replace(`{${k}}`, v)
            })
        }
        return str
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
