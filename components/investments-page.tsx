"use client"

import { useState, useMemo, useEffect } from "react"
import { useFinance } from "@/components/finance-provider"
import { useLanguage } from "@/components/language-provider"
import { formatCurrency } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Trash2, TrendingUp, TrendingDown, Pencil, BarChart3, Loader2, Eye, EyeOff, PieChart } from "lucide-react"

export function InvestmentsPage() {
  const { stocks, addStock, updateStock, deleteStock } = useFinance()
  const { language, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showValue, setShowValue] = useState(true)

  const [formSymbol, setFormSymbol] = useState("")
  const [formName, setFormName] = useState("")
  const [formShares, setFormShares] = useState("")
  const [formAvgCost, setFormAvgCost] = useState("")

  const [livePrices, setLivePrices] = useState<Record<string, number>>({})
  const [isFetchingPrices, setIsFetchingPrices] = useState(false)

  const totalCost = useMemo(() => stocks.reduce((s, st) => s + st.shares * st.avgCost, 0), [stocks])
  const totalValue = useMemo(() => stocks.reduce((s, st) => {
    const cp = livePrices[st.symbol.toUpperCase()] || st.currentPrice
    return s + st.shares * cp
  }, 0), [stocks, livePrices])
  const totalPnL = totalValue - totalCost
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

  const [exchangeRate, setExchangeRate] = useState<number | null>(null)

  useEffect(() => {
    async function fetchExchangeRate() {
      try {
        // USD/THB via Yahoo Finance (same source as yfinance)
        const res = await fetch(`/api/stock-price?symbols=THB%3DX`)
        const data = await res.json()
        if (data && data["THB=X"] != null) {
          setExchangeRate(data["THB=X"])
        }
      } catch (err) {
        console.error("Failed to fetch USD/THB exchange rate:", err)
      }
    }
    fetchExchangeRate()
  }, [])

  useEffect(() => {
    async function fetchAllPrices() {
      if (stocks.length === 0) return
      setIsFetchingPrices(true)
      const symbols = Array.from(new Set(stocks.map(s => s.symbol.toUpperCase()))).join(',')
      try {
        // ดึงราคาจาก /api/stock-price (Yahoo Finance — ข้อมูลเดียวกับ yfinance)
        const res = await fetch(`/api/stock-price?symbols=${encodeURIComponent(symbols)}`)
        const data: Record<string, number | null> = await res.json()

        const newPrices: Record<string, number> = {}
        for (const [key, price] of Object.entries(data)) {
          if (price != null) {
            newPrices[key.toUpperCase()] = price
          }
        }

        if (Object.keys(newPrices).length > 0) {
          setLivePrices(prev => ({ ...prev, ...newPrices }))
        }
      } catch (err) {
        console.error("Failed to fetch live prices:", err)
      } finally {
        setIsFetchingPrices(false)
      }
    }

    fetchAllPrices()
    const interval = setInterval(fetchAllPrices, 60000)
    return () => clearInterval(interval)
  }, [stocks.map(s => s.symbol).join(',')])

  function resetForm() {
    setFormSymbol("")
    setFormName("")
    setFormShares("")
    setFormAvgCost("")
    setEditId(null)
  }

  function handleOpenEdit(id: string) {
    const stock = stocks.find((s) => s.id === id)
    if (!stock) return
    setFormSymbol(stock.symbol)
    setFormName(stock.name)
    setFormShares(String(stock.shares))
    setFormAvgCost(String(stock.avgCost))
    setEditId(id)
    setOpen(true)
  }

  function handleSubmit() {
    if (!formSymbol || !formShares || !formAvgCost) return
    const data = {
      symbol: formSymbol.toUpperCase(),
      name: formName || formSymbol.toUpperCase(),
      shares: parseFloat(formShares),
      avgCost: parseFloat(formAvgCost),
      currentPrice: editId ? stocks.find((s) => s.id === editId)?.currentPrice || 0 : 0,
    }
    if (editId) {
      updateStock(editId, data)
    } else {
      addStock(data)
    }
    setOpen(false)
    resetForm()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {/* Gradient Header Bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
        <CardContent className="p-5 sm:p-6">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground tracking-wide">
              {language === 'th' ? 'มูลค่าสินทรัพย์ทั้งหมด' : 'Total Asset Value'}
              <span className="ml-1.5 text-muted-foreground/60">
                ({new Date().toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                {' - '}
                {new Date().toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                {language === 'th' ? ' น.' : ''})
              </span>
            </p>
            <Button variant="ghost" size="sm" onClick={() => setShowValue(!showValue)} className="gap-1.5 text-muted-foreground hover:text-foreground -mr-2">
              {showValue ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              <span className="text-[10px] font-semibold uppercase hidden sm:inline">
                {showValue ? (language === 'th' ? 'ซ่อน' : 'Hide') : (language === 'th' ? 'แสดง' : 'Show')}
              </span>
            </Button>
          </div>

          {/* Main Value */}
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
            {showValue ? formatCurrency(totalValue) : '***'}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">USD</span>
          </p>

          {/* THB + Exchange Rate Row */}
          {exchangeRate && (
            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium tabular-nums">
                ≈ {showValue ? formatCurrency(totalValue * exchangeRate) : '***'} THB
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="tabular-nums">
                1 USD = {exchangeRate.toFixed(2)} THB
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="my-4 border-t border-border/30" />

          {/* Total Cost Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {language === 'th' ? 'ต้นทุนรวม' : 'Total Cost'}
            </span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {showValue ? formatCurrency(totalCost) : '***'}
              <span className="ml-1 text-xs font-normal text-muted-foreground">USD</span>
              {exchangeRate && (
                <span className="ml-2 text-[11px] font-normal text-muted-foreground/70 tabular-nums">
                  (≈ {showValue ? formatCurrency(totalCost * exchangeRate) : '***'} THB)
                </span>
              )}
            </span>
          </div>

          {/* P&L Row */}
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {language === 'th' ? 'กำไรของสินทรัพย์ที่ถือ' : 'Unrealized P&L'}
            </span>
            <span className={`text-sm font-bold flex items-center gap-1 tabular-nums ${totalPnL >= 0 ? 'text-chart-1' : 'text-chart-2'}`}>
              {totalPnL >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
              <span className="font-semibold ml-1">
                ({showValue ? `${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL)} USD` : '***'})
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Holdings */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("inv.portfolio")}</h2>
          {isFetchingPrices && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
        </div>
        <Button
          onClick={() => {
            resetForm()
            setOpen(true)
          }}
          className="gap-2 rounded-xl shadow-sm"
        >
          <Plus className="size-4" /> {t("inv.addStock")}
        </Button>
      </div>

      {stocks.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center py-16">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <BarChart3 className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("inv.noStock")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="flex items-center px-4 sm:px-5 py-3 border-b border-border/40">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-muted-foreground">
                  {stocks.length} {language === 'th' ? 'สินทรัพย์' : 'Assets'}
                </span>
              </div>
              <div className="w-28 sm:w-36 text-right">
                <span className="text-xs font-medium text-muted-foreground">
                  {language === 'th' ? 'มูลค่าสินทรัพย์ (USD)' : 'Value (USD)'}
                </span>
              </div>
              <div className="w-28 sm:w-32 text-right">
                <span className="text-xs font-medium text-muted-foreground">
                  {language === 'th' ? '% กำไรและมูลค่า' : '% P&L'}
                </span>
              </div>
            </div>

            {/* Stock Rows */}
            {stocks.map((stock, idx) => {
              const currentPrice = livePrices[stock.symbol.toUpperCase()] || stock.currentPrice
              const value = stock.shares * currentPrice
              const cost = stock.shares * stock.avgCost
              const pnl = value - cost
              const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0
              const isPositive = pnl >= 0
              const weight = totalValue > 0 ? (value / totalValue) * 100 : 0

              return (
                <div
                  key={stock.id}
                  className={`group relative flex items-center px-4 sm:px-5 py-4 transition-colors hover:bg-muted/30 ${idx < stocks.length - 1 ? 'border-b border-border/20' : ''
                    }`}
                >
                  {/* Left: Logo + Symbol + Weight */}
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    <div className="size-10 shrink-0 rounded-full bg-muted/60 flex items-center justify-center ring-1 ring-border/30 overflow-hidden">
                      <img
                        src={`https://assets.parqet.com/logos/symbol/${stock.symbol.toUpperCase()}`}
                        alt={stock.symbol}
                        className="size-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                      <span className="text-[11px] font-bold text-muted-foreground hidden items-center justify-center size-full">
                        {stock.symbol.slice(0, 3)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <PieChart className="size-3 opacity-60" />
                        {weight.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Middle: Asset Value */}
                  <div className="w-28 sm:w-36 text-right shrink-0">
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      {showValue ? formatCurrency(value) : '***'}
                    </p>
                    {exchangeRate && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                        ≈ {showValue ? formatCurrency(value * exchangeRate) : '***'} THB
                      </p>
                    )}
                  </div>

                  {/* Right: P&L % + Amount */}
                  <div className="w-28 sm:w-32 text-right shrink-0">
                    <p className={`text-sm font-bold flex items-center justify-end gap-1 tabular-nums ${isPositive ? 'text-chart-1' : 'text-chart-2'}`}>
                      {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </p>
                    <p className={`text-[11px] mt-0.5 tabular-nums ${isPositive ? 'text-chart-1/80' : 'text-chart-2/80'}`}>
                      ({showValue ? `${isPositive ? '+' : ''}${formatCurrency(pnl)} USD` : '***'})
                    </p>
                  </div>

                  {/* Hover Edit/Delete */}
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-0.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/40 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(stock.id)}
                      aria-label={`Edit ${stock.symbol}`}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteStock(stock.id)}
                      aria-label={`Delete ${stock.symbol}`}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Stock Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? t("inv.editStock") : t("inv.addNewStock")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="stock-symbol" className="text-xs font-medium">{t("inv.symbolLabel")}</Label>
                <Input
                  id="stock-symbol"
                  placeholder={t("inv.symbolPlaceholder")}
                  className="rounded-xl"
                  value={formSymbol}
                  onChange={(e) => setFormSymbol(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="stock-name" className="text-xs font-medium">{t("inv.companyNameLabel")}</Label>
                <Input
                  id="stock-name"
                  placeholder={t("inv.companyNamePlaceholder")}
                  className="rounded-xl"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stock-shares" className="text-xs font-medium">{t("inv.numSharesLabel")}</Label>
              <Input
                id="stock-shares"
                type="number"
                placeholder="0"
                className="rounded-xl"
                value={formShares}
                onChange={(e) => setFormShares(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stock-avg" className="text-xs font-medium">{t("inv.avgCostFormLabel")}</Label>
              <Input
                id="stock-avg"
                type="number"
                placeholder="0.00"
                className="rounded-xl"
                value={formAvgCost}
                onChange={(e) => setFormAvgCost(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => { setOpen(false); resetForm() }} className="rounded-xl">
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={!formSymbol || !formShares || !formAvgCost} className="rounded-xl">
              {editId ? t("common.save") : t("inv.addStock")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

