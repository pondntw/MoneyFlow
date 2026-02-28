"use client"

import { useState } from "react"
import { useFinance } from "@/components/finance-provider"
import {
  formatCurrency,
  categoryLabels,
  incomeCategories,
  expenseCategories,
  type TransactionType,
  type TransactionCategory,
} from "@/lib/store"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react"

export function TransactionsPage() {
  const { transactions, accounts, addTransaction, deleteTransaction } = useFinance()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")

  const [formType, setFormType] = useState<TransactionType>("expense")
  const [formAmount, setFormAmount] = useState("")
  const [formCategory, setFormCategory] = useState<TransactionCategory | "">("")
  const [formDescription, setFormDescription] = useState("")
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10))
  const [formAccountId, setFormAccountId] = useState(accounts[0]?.id ?? "")

  const filtered = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  function resetForm() {
    setFormAmount("")
    setFormCategory("")
    setFormDescription("")
    setFormDate(new Date().toISOString().slice(0, 10))
    setFormAccountId(accounts[0]?.id ?? "")
    setFormType("expense")
  }

  function handleSubmit() {
    if (!formAmount || !formCategory || !formAccountId) return
    addTransaction({
      type: formType,
      amount: parseFloat(formAmount),
      category: formCategory as TransactionCategory,
      description: formDescription || categoryLabels[formCategory as TransactionCategory],
      date: formDate,
      accountId: formAccountId,
    })
    setOpen(false)
    resetForm()
  }

  const categories = formType === "income" ? incomeCategories : expenseCategories

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="h-10 rounded-xl bg-secondary p-1">
            <TabsTrigger value="all" className="rounded-lg px-4 text-xs font-semibold">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="income" className="rounded-lg px-4 text-xs font-semibold">รายรับ</TabsTrigger>
            <TabsTrigger value="expense" className="rounded-lg px-4 text-xs font-semibold">รายจ่าย</TabsTrigger>
          </TabsList>
          <TabsContent value="all" />
          <TabsContent value="income" />
          <TabsContent value="expense" />
        </Tabs>
        <Button onClick={() => setOpen(true)} className="gap-2 rounded-xl shadow-sm">
          <Plus className="size-4" /> เพิ่มรายการ
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            รายการทั้งหมด ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">ยังไม่มีรายการ</p>
          ) : (
            <div className="flex flex-col">
              {filtered.map((txn, idx) => {
                const account = accounts.find((a) => a.id === txn.accountId)
                return (
                  <div
                    key={txn.id}
                    className={`group flex items-center justify-between py-3.5 ${idx !== filtered.length - 1 ? "border-b" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${txn.type === "income" ? "bg-chart-1/10" : "bg-chart-2/10"}`}
                      >
                        {txn.type === "income" ? (
                          <ArrowUpRight className="size-4 text-chart-1" />
                        ) : (
                          <ArrowDownRight className="size-4 text-chart-2" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{txn.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryLabels[txn.category]} &middot;{" "}
                          {account?.name ?? "ไม่ระบุ"} &middot; {txn.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold tabular-nums ${txn.type === "income" ? "text-chart-1" : "text-chart-2"}`}
                      >
                        {txn.type === "income" ? "+" : "-"}
                        {formatCurrency(txn.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                        onClick={() => deleteTransaction(txn.id)}
                        aria-label={`ลบรายการ ${txn.description}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>เพิ่มรายการใหม่</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Tabs value={formType} onValueChange={(v) => { setFormType(v as TransactionType); setFormCategory("") }}>
              <TabsList className="w-full rounded-xl bg-secondary p-1">
                <TabsTrigger value="income" className="flex-1 rounded-lg text-xs font-semibold">รายรับ</TabsTrigger>
                <TabsTrigger value="expense" className="flex-1 rounded-lg text-xs font-semibold">รายจ่าย</TabsTrigger>
              </TabsList>
              <TabsContent value="income" />
              <TabsContent value="expense" />
            </Tabs>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="txn-amount" className="text-xs font-medium">จำนวนเงิน (บาท)</Label>
              <Input
                id="txn-amount"
                type="number"
                placeholder="0.00"
                className="rounded-xl"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">หมวดหมู่</Label>
              <Select value={formCategory} onValueChange={(v) => setFormCategory(v as TransactionCategory)}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="txn-desc" className="text-xs font-medium">รายละเอียด</Label>
              <Input
                id="txn-desc"
                placeholder="รายละเอียด (ไม่บังคับ)"
                className="rounded-xl"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="txn-date" className="text-xs font-medium">วันที่</Label>
                <Input
                  id="txn-date"
                  type="date"
                  className="rounded-xl"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">บัญชี</Label>
                <Select value={formAccountId} onValueChange={setFormAccountId}>
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="เลือกบัญชี" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} disabled={!formAmount || !formCategory || !formAccountId} className="rounded-xl">
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
