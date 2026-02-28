"use client"

import { useState } from "react"
import { useFinance } from "@/components/finance-provider"
import { useLanguage } from "@/components/language-provider"
import { formatCurrency, bankOptions, accountColors } from "@/lib/store"
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
import { Plus, Trash2, Landmark, CreditCard } from "lucide-react"

export function AccountsPage() {
  const { accounts, addAccount, deleteAccount } = useFinance()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [formName, setFormName] = useState("")
  const [formBank, setFormBank] = useState("")
  const [formNumber, setFormNumber] = useState("")
  const [formBalance, setFormBalance] = useState("")
  const [formColor, setFormColor] = useState(accountColors[0])

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  function resetForm() {
    setFormName("")
    setFormBank("")
    setFormNumber("")
    setFormBalance("")
    setFormColor(accountColors[0])
  }

  function handleSubmit() {
    if (!formName || !formBank) return
    addAccount({
      name: formName,
      bank: formBank,
      accountNumber: formNumber || "xxx-x-xxxxx-x",
      balance: parseFloat(formBalance) || 0,
      color: formColor,
    })
    setOpen(false)
    resetForm()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("acc.totalBalance")}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {formatCurrency(totalBalance)}{" "}
            <span className="text-base font-normal text-muted-foreground">{t("currency.thb")}</span>
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 rounded-xl shadow-sm">
          <Plus className="size-4" /> {t("acc.add")}
        </Button>
      </div>

      {/* Account Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {accounts.map((acc) => (
          <Card key={acc.id} className="group relative overflow-hidden border-0 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl" style={{ backgroundColor: acc.color }} />
            <CardHeader className="flex flex-row items-start justify-between pt-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: acc.color + "15" }}
                >
                  <Landmark className="size-5" style={{ color: acc.color }} />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{acc.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{acc.bank}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                onClick={() => deleteAccount(acc.id)}
                aria-label={`ลบบัญชี ${acc.name}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CreditCard className="size-3" />
                {acc.accountNumber}
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(acc.balance)}{" "}
                <span className="text-xs font-normal text-muted-foreground">{t("currency.thb")}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center py-16">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Landmark className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("acc.noAcc")}</p>
          </CardContent>
        </Card>
      )}

      {/* Add Account Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("acc.addTitle")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acc-name" className="text-xs font-medium">{t("acc.nameLabel")}</Label>
              <Input
                id="acc-name"
                placeholder={t("acc.namePlaceholder")}
                className="rounded-xl"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">{t("acc.bankLabel")}</Label>
              <Select value={formBank} onValueChange={setFormBank}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder={t("acc.selectBank")} />
                </SelectTrigger>
                <SelectContent>
                  {bankOptions.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="acc-number" className="text-xs font-medium">{t("acc.numberLabel")}</Label>
                <Input
                  id="acc-number"
                  placeholder="xxx-x-xxxxx-x"
                  className="rounded-xl"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="acc-balance" className="text-xs font-medium">{t("acc.initBalanceLabel", { currency: t("currency.thb") })}</Label>
                <Input
                  id="acc-balance"
                  type="number"
                  placeholder="0.00"
                  className="rounded-xl"
                  value={formBalance}
                  onChange={(e) => setFormBalance(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium">{t("acc.colorLabel")}</Label>
              <div className="flex gap-2.5">
                {accountColors.map((c) => (
                  <button
                    key={c}
                    className={`size-8 rounded-full transition-all ${formColor === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setFormColor(c)}
                    aria-label={`เลือกสี ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={!formName || !formBank} className="rounded-xl">
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
