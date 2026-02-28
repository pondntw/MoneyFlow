"use client"

import { useMemo, useState, useEffect } from "react"
import { useFinance } from "@/components/finance-provider"
import { formatCurrency, categoryLabels, type TransactionCategory } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, Wallet, LineChart } from "lucide-react"

const monthNames = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
]

const areaChartConfig: ChartConfig = {
  income: { label: "รายรับ", color: "var(--chart-1)" },
  expense: { label: "รายจ่าย", color: "var(--chart-2)" },
}

const pieColors = [
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-1)",
  "var(--chart-4)",
  "var(--chart-5)",
  "oklch(0.55 0.15 200)",
  "oklch(0.65 0.12 340)",
  "oklch(0.60 0.15 120)",
]

export function Dashboard() {
  const { transactions, accounts, stocks } = useFinance()

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyData = useMemo(() => {
    const months: { month: string; income: number; expense: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1)
      const m = d.getMonth()
      const y = d.getFullYear()
      const monthTxns = transactions.filter((t) => {
        const td = new Date(t.date)
        return td.getMonth() === m && td.getFullYear() === y
      })
      months.push({
        month: monthNames[m],
        income: monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      })
    }
    return months
  }, [transactions, currentMonth, currentYear])

  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchExchangeRate() {
      try {
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
      const symbols = Array.from(new Set(stocks.map(s => s.symbol.toUpperCase()))).join(',')
      try {
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
      }
    }

    fetchAllPrices()
    const interval = setInterval(fetchAllPrices, 60000)
    return () => clearInterval(interval)
  }, [stocks.map(s => s.symbol).join(',')])

  const thisMonthIncome = monthlyData[monthlyData.length - 1]?.income ?? 0
  const thisMonthExpense = monthlyData[monthlyData.length - 1]?.expense ?? 0
  const netThisMonth = thisMonthIncome - thisMonthExpense
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  const totalInvestment = stocks.reduce((s, st) => {
    const cp = livePrices[st.symbol.toUpperCase()] || st.currentPrice
    return s + st.shares * cp
  }, 0)

  const expenseByCategory = useMemo(() => {
    const map = new Map<TransactionCategory, number>()
    transactions
      .filter((t) => {
        const td = new Date(t.date)
        return t.type === "expense" && td.getMonth() === currentMonth && td.getFullYear() === currentYear
      })
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount)
      })
    return Array.from(map.entries())
      .map(([category, amount]) => ({
        name: categoryLabels[category],
        value: amount,
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, currentMonth, currentYear])

  const pieConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {}
    expenseByCategory.forEach((item, i) => {
      config[item.name] = {
        label: item.name,
        color: pieColors[i % pieColors.length],
      }
    })
    return config
  }, [expenseByCategory])

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6),
    [transactions]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="ยอดเงินทั้งหมด"
          value={formatCurrency(totalBalance)}
          suffix="บาท"
          icon={<Wallet className="size-5" />}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <SummaryCard
          label="รายรับเดือนนี้"
          value={`+${formatCurrency(thisMonthIncome)}`}
          suffix="บาท"
          icon={<TrendingUp className="size-5" />}
          iconBg="bg-chart-1/10"
          iconColor="text-chart-1"
          valueColor="text-chart-1"
        />
        <SummaryCard
          label="รายจ่ายเดือนนี้"
          value={`-${formatCurrency(thisMonthExpense)}`}
          suffix="บาท"
          icon={<TrendingDown className="size-5" />}
          iconBg="bg-chart-2/10"
          iconColor="text-chart-2"
          valueColor="text-chart-2"
        />
        <SummaryCard
          label="มูลค่าการลงทุน"
          value={formatCurrency(totalInvestment)}
          suffix="USD"
          icon={<LineChart className="size-5" />}
          iconBg="bg-chart-3/10"
          iconColor="text-chart-3"
          subtext={exchangeRate ? `≈ ${formatCurrency(totalInvestment * exchangeRate)} THB` : undefined}
        />
      </div>

      {/* Net this month badge */}
      <div className="flex items-center gap-2 rounded-xl border bg-card px-5 py-3">
        <span className="text-sm text-muted-foreground">คงเหลือสุทธิเดือนนี้</span>
        <span className={`ml-auto text-lg font-bold ${netThisMonth >= 0 ? "text-chart-1" : "text-chart-2"}`}>
          {netThisMonth >= 0 ? "+" : ""}{formatCurrency(netThisMonth)} บาท
        </span>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Monthly Area Chart */}
        <Card className="xl:col-span-3 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              สรุปรายเดือน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areaChartConfig} className="h-[280px] w-full">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  className="text-xs"
                  width={45}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `${formatCurrency(Number(value))} บาท`}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="var(--color-income)"
                  fill="url(#fillIncome)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="var(--color-expense)"
                  fill="url(#fillExpense)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-2.5 rounded-full bg-chart-1" />
                รายรับ
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-2.5 rounded-full bg-chart-2" />
                รายจ่าย
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Pie */}
        <Card className="xl:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              รายจ่ายตามหมวดหมู่
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <>
                <ChartContainer config={pieConfig} className="mx-auto h-[200px] w-full">
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => `${formatCurrency(Number(value))} บาท`}
                        />
                      }
                    />
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      strokeWidth={3}
                      stroke="var(--card)"
                      paddingAngle={2}
                    >
                      {expenseByCategory.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 flex flex-col gap-2">
                  {expenseByCategory.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: pieColors[i % pieColors.length] }}
                        />
                        {item.name}
                      </div>
                      <span className="font-medium text-foreground">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            รายการล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {recentTransactions.map((txn, idx) => {
              const account = accounts.find((a) => a.id === txn.accountId)
              return (
                <div
                  key={txn.id}
                  className={`flex items-center justify-between py-3.5 ${idx !== recentTransactions.length - 1 ? "border-b" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="size-9 rounded-lg"
                      style={{ backgroundColor: account?.color ? account.color + "20" : "var(--muted)" }}
                    >
                      <div className="flex size-full items-center justify-center">
                        <div
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: account?.color ?? "var(--muted-foreground)" }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoryLabels[txn.category]} &middot; {txn.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums ${txn.type === "income" ? "text-chart-1" : "text-chart-2"}`}
                  >
                    {txn.type === "income" ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  suffix,
  icon,
  iconBg,
  iconColor,
  valueColor,
  subtext,
}: {
  label: string
  value: string
  suffix: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  valueColor?: string
  subtext?: string
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className={`mt-0.5 text-xl font-bold tracking-tight ${valueColor ?? "text-foreground"}`}>
            {value}{" "}
            <span className="text-xs font-normal text-muted-foreground">{suffix}</span>
          </p>
          {subtext && (
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground/80">
              {subtext}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
