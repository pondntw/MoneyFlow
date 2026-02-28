"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { createClient } from '@/utils/supabase/client'
import {
  type Transaction,
  type BankAccount,
  type StockHolding,
  generateId, // We might not need this if supabase handles id generation, but keep for optimistic updates
} from "@/lib/store"

interface FinanceContextType {
  transactions: Transaction[]
  accounts: BankAccount[]
  stocks: StockHolding[]
  addTransaction: (txn: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void
  addAccount: (acc: Omit<BankAccount, "id">) => void
  deleteAccount: (id: string) => void
  addStock: (stock: Omit<StockHolding, "id">) => void
  updateStock: (id: string, updates: Partial<StockHolding>) => void
  deleteStock: (id: string) => void
  loading: boolean
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider")
  return ctx
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [stocks, setStocks] = useState<StockHolding[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch accounts
      const { data: accountsData } = await supabase.from('bank_accounts').select('*').order('created_at', { ascending: true })
      if (accountsData) {
        setAccounts(accountsData.map(a => ({
          id: a.id,
          name: a.name,
          bank: a.bank,
          accountNumber: a.account_number,
          balance: Number(a.balance),
          color: a.color
        })))
      }

      // Fetch transactions
      const { data: txnsData } = await supabase.from('transactions').select('*').order('date', { ascending: false })
      if (txnsData) {
        setTransactions(txnsData.map(t => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          category: t.category as any,
          description: t.description || '',
          date: t.date,
          accountId: t.account_id
        })))
      }

      // Fetch stocks
      const { data: stocksData } = await supabase.from('stock_holdings').select('*').order('created_at', { ascending: true })
      if (stocksData) {
        setStocks(stocksData.map(s => ({
          id: s.id,
          symbol: s.symbol,
          name: s.name,
          shares: Number(s.shares),
          avgCost: Number(s.avg_cost),
          currentPrice: Number(s.current_price)
        })))
      }

      setLoading(false)
    }

    loadData()
  }, [supabase])

  const addTransaction = useCallback(async (txn: Omit<Transaction, "id">) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Find account to update balance locally
    const targetAccount = accounts.find(a => a.id === txn.accountId)
    if (!targetAccount) return

    // Determine new balance
    const newBalance = txn.type === "income" ? targetAccount.balance + txn.amount : targetAccount.balance - txn.amount

    // Insert to supabase
    const { data: newDbTxn, error } = await supabase.from('transactions').insert({
      user_id: user.id,
      account_id: txn.accountId,
      type: txn.type,
      amount: txn.amount,
      category: txn.category,
      description: txn.description,
      date: txn.date,
    }).select().single()

    if (!error && newDbTxn) {
      // Update account balance in DB
      await supabase.from('bank_accounts').update({ balance: newBalance }).eq('id', txn.accountId)

      const newTxn: Transaction = {
        id: newDbTxn.id,
        type: newDbTxn.type,
        amount: Number(newDbTxn.amount),
        category: newDbTxn.category as any,
        description: newDbTxn.description || '',
        date: newDbTxn.date,
        accountId: newDbTxn.account_id
      }

      setTransactions((prev) => [newTxn, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      setAccounts((prev) =>
        prev.map((acc) => acc.id === txn.accountId ? { ...acc, balance: newBalance } : acc)
      )
    }
  }, [supabase, accounts])

  const deleteTransaction = useCallback(async (id: string) => {
    const txn = transactions.find((t) => t.id === id)
    if (!txn) return

    const { error } = await supabase.from('transactions').delete().eq('id', id)

    if (!error) {
      // Update account balance
      const targetAccount = accounts.find(a => a.id === txn.accountId)
      if (targetAccount) {
        const newBalance = txn.type === "income" ? targetAccount.balance - txn.amount : targetAccount.balance + txn.amount
        await supabase.from('bank_accounts').update({ balance: newBalance }).eq('id', txn.accountId)

        setAccounts((prev) =>
          prev.map((acc) => acc.id === txn.accountId ? { ...acc, balance: newBalance } : acc)
        )
      }
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    }
  }, [supabase, transactions, accounts])

  const addAccount = useCallback(async (acc: Omit<BankAccount, "id">) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: newDbAcc, error } = await supabase.from('bank_accounts').insert({
      user_id: user.id,
      name: acc.name,
      bank: acc.bank,
      account_number: acc.accountNumber,
      balance: acc.balance,
      color: acc.color,
    }).select().single()

    if (!error && newDbAcc) {
      const newAcc: BankAccount = {
        id: newDbAcc.id,
        name: newDbAcc.name,
        bank: newDbAcc.bank,
        accountNumber: newDbAcc.account_number,
        balance: Number(newDbAcc.balance),
        color: newDbAcc.color
      }
      setAccounts((prev) => [...prev, newAcc])
    }
  }, [supabase])

  const deleteAccount = useCallback(async (id: string) => {
    const { error } = await supabase.from('bank_accounts').delete().eq('id', id)
    if (!error) {
      setAccounts((prev) => prev.filter((a) => a.id !== id))
      // Also delete associated transactions locally
      setTransactions((prev) => prev.filter(t => t.accountId !== id))
    }
  }, [supabase])

  const addStock = useCallback(async (stock: Omit<StockHolding, "id">) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: newDbStock, error } = await supabase.from('stock_holdings').insert({
      user_id: user.id,
      symbol: stock.symbol,
      name: stock.name,
      shares: stock.shares,
      avg_cost: stock.avgCost,
      current_price: stock.currentPrice
    }).select().single()

    if (!error && newDbStock) {
      const newStock: StockHolding = {
        id: newDbStock.id,
        symbol: newDbStock.symbol,
        name: newDbStock.name,
        shares: Number(newDbStock.shares),
        avgCost: Number(newDbStock.avg_cost),
        currentPrice: Number(newDbStock.current_price)
      }
      setStocks((prev) => [...prev, newStock])
    }
  }, [supabase])

  const updateStock = useCallback(async (id: string, updates: Partial<StockHolding>) => {
    const dbUpdates: any = {}
    if (updates.symbol !== undefined) dbUpdates.symbol = updates.symbol
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.shares !== undefined) dbUpdates.shares = updates.shares
    if (updates.avgCost !== undefined) dbUpdates.avg_cost = updates.avgCost
    if (updates.currentPrice !== undefined) dbUpdates.current_price = updates.currentPrice

    const { error } = await supabase.from('stock_holdings').update(dbUpdates).eq('id', id)
    if (!error) {
      setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    }
  }, [supabase])

  const deleteStock = useCallback(async (id: string) => {
    const { error } = await supabase.from('stock_holdings').delete().eq('id', id)
    if (!error) {
      setStocks((prev) => prev.filter((s) => s.id !== id))
    }
  }, [supabase])

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts,
        stocks,
        addTransaction,
        deleteTransaction,
        addAccount,
        deleteAccount,
        addStock,
        updateStock,
        deleteStock,
        loading,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}
