// Types
export type TransactionType = "income" | "expense"

export type TransactionCategory =
  | "salary"
  | "freelance"
  | "investment_return"
  | "food"
  | "transport"
  | "housing"
  | "utilities"
  | "entertainment"
  | "healthcare"
  | "education"
  | "shopping"
  | "other"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: TransactionCategory
  description: string
  date: string
  accountId: string
}

export interface BankAccount {
  id: string
  name: string
  bank: string
  accountNumber: string
  balance: number
  color: string
}

export interface StockHolding {
  id: string
  symbol: string
  name: string
  shares: number
  avgCost: number
  currentPrice: number
}

// Category labels (Thai)
export const categoryLabels: Record<TransactionCategory, string> = {
  salary: "เงินเดือน",
  freelance: "ฟรีแลนซ์",
  investment_return: "ผลตอบแทนการลงทุน",
  food: "อาหาร",
  transport: "การเดินทาง",
  housing: "ที่พักอาศัย",
  utilities: "ค่าสาธารณูปโภค",
  entertainment: "ความบันเทิง",
  healthcare: "สุขภาพ",
  education: "การศึกษา",
  shopping: "ช้อปปิ้ง",
  other: "อื่นๆ",
}

export const incomeCategories: TransactionCategory[] = [
  "salary",
  "freelance",
  "investment_return",
  "other",
]

export const expenseCategories: TransactionCategory[] = [
  "food",
  "transport",
  "housing",
  "utilities",
  "entertainment",
  "healthcare",
  "education",
  "shopping",
  "other",
]

export const bankOptions = [
  "ธนาคารกสิกรไทย",
  "ธนาคารไทยพาณิชย์",
  "ธนาคารกรุงเทพ",
  "ธนาคารกรุงไทย",
  "ธนาคารทหารไทยธนชาต",
  "ธนาคารกรุงศรีอยุธยา",
  "ธนาคารออมสิน",
  "อื่นๆ",
]

export const accountColors = [
  "#4a9c6d",
  "#c75c3a",
  "#5b8fb9",
  "#d4a843",
  "#8b6bb3",
  "#c2785c",
]

// Sample Data
export const sampleAccounts: BankAccount[] = [
  {
    id: "acc-1",
    name: "บัญชีเงินเดือน",
    bank: "ธนาคารกสิกรไทย",
    accountNumber: "xxx-x-x1234-x",
    balance: 85400,
    color: "#4a9c6d",
  },
  {
    id: "acc-2",
    name: "บัญชีออมทรัพย์",
    bank: "ธนาคารไทยพาณิชย์",
    accountNumber: "xxx-x-x5678-x",
    balance: 250000,
    color: "#5b8fb9",
  },
  {
    id: "acc-3",
    name: "บัญชีใช้จ่าย",
    bank: "ธนาคารกรุงเทพ",
    accountNumber: "xxx-x-x9012-x",
    balance: 12300,
    color: "#d4a843",
  },
]

export const sampleTransactions: Transaction[] = [
  {
    id: "txn-1",
    type: "income",
    amount: 45000,
    category: "salary",
    description: "เงินเดือนประจำ",
    date: "2026-02-25",
    accountId: "acc-1",
  },
  {
    id: "txn-2",
    type: "expense",
    amount: 1200,
    category: "food",
    description: "อาหารกลางวัน",
    date: "2026-02-24",
    accountId: "acc-3",
  },
  {
    id: "txn-3",
    type: "expense",
    amount: 8500,
    category: "housing",
    description: "ค่าเช่าห้อง",
    date: "2026-02-01",
    accountId: "acc-1",
  },
  {
    id: "txn-4",
    type: "income",
    amount: 15000,
    category: "freelance",
    description: "งานออกแบบเว็บ",
    date: "2026-02-20",
    accountId: "acc-1",
  },
  {
    id: "txn-5",
    type: "expense",
    amount: 350,
    category: "transport",
    description: "BTS รายเดือน",
    date: "2026-02-01",
    accountId: "acc-3",
  },
  {
    id: "txn-6",
    type: "expense",
    amount: 2400,
    category: "utilities",
    description: "ค่าไฟฟ้า + น้ำ",
    date: "2026-02-05",
    accountId: "acc-1",
  },
  {
    id: "txn-7",
    type: "income",
    amount: 3500,
    category: "investment_return",
    description: "เงินปันผล SET50",
    date: "2026-02-15",
    accountId: "acc-2",
  },
  {
    id: "txn-8",
    type: "expense",
    amount: 890,
    category: "entertainment",
    description: "Netflix + Spotify",
    date: "2026-02-01",
    accountId: "acc-3",
  },
  {
    id: "txn-9",
    type: "expense",
    amount: 4200,
    category: "shopping",
    description: "เสื้อผ้า",
    date: "2026-02-18",
    accountId: "acc-3",
  },
  {
    id: "txn-10",
    type: "income",
    amount: 45000,
    category: "salary",
    description: "เงินเดือนประจำ",
    date: "2026-01-25",
    accountId: "acc-1",
  },
  {
    id: "txn-11",
    type: "expense",
    amount: 9500,
    category: "housing",
    description: "ค่าเช่าห้อง",
    date: "2026-01-01",
    accountId: "acc-1",
  },
  {
    id: "txn-12",
    type: "expense",
    amount: 5600,
    category: "food",
    description: "อาหาร",
    date: "2026-01-15",
    accountId: "acc-3",
  },
  {
    id: "txn-13",
    type: "income",
    amount: 8000,
    category: "freelance",
    description: "งานกราฟิก",
    date: "2026-01-18",
    accountId: "acc-1",
  },
]

export const sampleStocks: StockHolding[] = [
  {
    id: "stock-1",
    symbol: "SET50",
    name: "กองทุน SET50",
    shares: 500,
    avgCost: 85.5,
    currentPrice: 92.3,
  },
  {
    id: "stock-2",
    symbol: "PTT",
    name: "บมจ. ปตท.",
    shares: 200,
    avgCost: 32.75,
    currentPrice: 35.0,
  },
  {
    id: "stock-3",
    symbol: "CPALL",
    name: "บมจ. ซีพี ออลล์",
    shares: 100,
    avgCost: 58.25,
    currentPrice: 62.5,
  },
  {
    id: "stock-4",
    symbol: "AOT",
    name: "บมจ. ท่าอากาศยานไทย",
    shares: 300,
    avgCost: 64.0,
    currentPrice: 68.25,
  },
  {
    id: "stock-5",
    symbol: "SCC",
    name: "บมจ. ปูนซิเมนต์ไทย",
    shares: 50,
    avgCost: 280.0,
    currentPrice: 295.0,
  },
]

// Helper functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
