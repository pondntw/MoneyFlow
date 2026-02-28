"use client"

import { useState, useMemo, useEffect } from "react"
import { useFinance } from "@/components/finance-provider"
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
import { Plus, Trash2, TrendingUp, TrendingDown, Pencil, BarChart3, Loader2 } from "lucide-react"

export function InvestmentsPage() {
  const { stocks, addStock, updateStock, deleteStock } = useFinance()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

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
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ต้นทุนรวม</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(totalCost)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">USD</span>
            </p>
            {exchangeRate && (
              <p className="mt-1 text-[11px] font-medium text-muted-foreground/80">
                ≈ {formatCurrency(totalCost * exchangeRate)} THB
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">มูลค่าตลาดรวม</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(totalValue)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">USD</span>
            </p>
            {exchangeRate && (
              <p className="mt-1 text-[11px] font-medium text-muted-foreground/80">
                ≈ {formatCurrency(totalValue * exchangeRate)} THB
              </p>
            )}
          </CardContent>
        </Card>
        <Card className={`border-0 shadow-sm ${totalPnL >= 0 ? "bg-chart-1/5" : "bg-chart-2/5"}`}>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">กำไร/ขาดทุน</p>
            <div className="mt-2 flex items-center gap-2">
              {totalPnL >= 0 ? (
                <TrendingUp className="size-5 text-chart-1" />
              ) : (
                <TrendingDown className="size-5 text-chart-2" />
              )}
              <p className={`text-2xl font-bold tracking-tight ${totalPnL >= 0 ? "text-chart-1" : "text-chart-2"}`}>
                {totalPnL >= 0 ? "+" : ""}
                {formatCurrency(totalPnL)} <span className="text-sm font-normal">USD</span>
              </p>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <p className={`text-[11px] font-medium ${totalPnL >= 0 ? "text-chart-1" : "text-chart-2"}`}>
                {totalPnLPercent >= 0 ? "+" : ""}
                {totalPnLPercent.toFixed(2)}%
              </p>
              {exchangeRate && (
                <p className={`text-[11px] font-medium ${totalPnL >= 0 ? "text-chart-1/80" : "text-chart-2/80"}`}>
                  ≈ {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL * exchangeRate)} THB
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">พอร์ตการลงทุน</h2>
          {isFetchingPrices && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
        </div>
        <Button
          onClick={() => {
            resetForm()
            setOpen(true)
          }}
          className="gap-2 rounded-xl shadow-sm"
        >
          <Plus className="size-4" /> เพิ่มหุ้น
        </Button>
      </div>

      {stocks.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center py-16">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <BarChart3 className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">ยังไม่มีหุ้นในพอร์ต กดเพิ่มหุ้นเพื่อเริ่มต้น</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stocks.map((stock) => {
            const currentPrice = livePrices[stock.symbol.toUpperCase()] || stock.currentPrice
            const value = stock.shares * currentPrice
            const cost = stock.shares * stock.avgCost
            const pnl = value - cost
            const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0
            const isPositive = pnl >= 0

            return (
              <Card key={stock.id} className="group relative border-0 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                        {stock.symbol}
                      </span>
                      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? "text-chart-1" : "text-chart-2"}`}>
                        {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {isPositive ? "+" : ""}{pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{stock.name}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(stock.id)}
                      aria-label={`แก้ไข ${stock.symbol}`}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteStock(stock.id)}
                      aria-label={`ลบ ${stock.symbol}`}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <InfoCell label="จำนวน" value={`${formatCurrency(stock.shares)} หุ้น`} />
                    <InfoCell label="ราคาปัจจุบัน" value={`${formatCurrency(currentPrice)} USD`} />
                    <InfoCell label="ต้นทุนเฉลี่ย" value={`${formatCurrency(stock.avgCost)} USD`} />
                    <InfoCell label="มูลค่ารวม" value={`${formatCurrency(value)} USD`} />
                  </div>
                  <div className={`flex flex-col gap-1 rounded-xl p-3 ${isPositive ? "bg-chart-1/8" : "bg-chart-2/8"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">กำไร/ขาดทุน</span>
                      <span className={`text-sm font-bold tabular-nums ${isPositive ? "text-chart-1" : "text-chart-2"}`}>
                        {isPositive ? "+" : ""}
                        {formatCurrency(pnl)} <span className="text-[10px] font-normal opacity-80">USD</span>
                      </span>
                    </div>
                    {exchangeRate && (
                      <div className="flex items-center justify-end text-[10px] opacity-70">
                        <span className={`font-medium ${isPositive ? "text-chart-1" : "text-chart-2"}`}>
                          ≈ {isPositive ? "+" : ""}{formatCurrency(pnl * exchangeRate)} THB
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Stock Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "แก้ไขหุ้น" : "เพิ่มหุ้นใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="stock-symbol" className="text-xs font-medium">สัญลักษณ์หุ้น</Label>
                <Input
                  id="stock-symbol"
                  placeholder="เช่น PTT"
                  className="rounded-xl"
                  value={formSymbol}
                  onChange={(e) => setFormSymbol(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="stock-name" className="text-xs font-medium">ชื่อบริษัท</Label>
                <Input
                  id="stock-name"
                  placeholder="เช่น บมจ. ปตท."
                  className="rounded-xl"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stock-shares" className="text-xs font-medium">จำนวนหุ้น</Label>
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
              <Label htmlFor="stock-avg" className="text-xs font-medium">ต้นทุนเฉลี่ย (USD)</Label>
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
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} disabled={!formSymbol || !formShares || !formAvgCost} className="rounded-xl">
              {editId ? "บันทึก" : "เพิ่มหุ้น"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
