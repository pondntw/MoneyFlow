# MoneyFlow

MoneyFlow is a modern financial dashboard and investment tracking application built with [Next.js](https://nextjs.org/), styled with Tailwind CSS & shadcn/ui, and powered by [Supabase](https://supabase.com) Authentication.

## 🌟 Features
- **Dashboard Overview**: View key financial metrics at a glance, including recent transactions, spending by category charts, and comprehensive bank balances.
- **Transactions Management**: Record your daily income and expenses categorized logically.
- **Bank Accounts Management**: Monitor multiple accounts with distinctive colors, adding starting balances, and observing overall liquidity.
- **Investments Tracking**: Track stock portfolios containing your average cost, calculate live Profit / Loss, and keep your data private using the new "Hide Balance" toggle. 
- **Real-time Stock Data Integration**: Live stock ticker and currency exchange rate (USD/THB) fetcher via Yahoo Finance internal data API.
- **Multi-language Support (i18n)**: Fully supported in Thai (`TH`) and English (`EN`) across the entire web application platform. 
- **Dark & Light Mode**: Seamlessly switch between themes with `next-themes` and deeply integrated `globals.css` variable design tokens.
- **Secure Authentication**: Split-screen beautiful authentication flow for Login and Sign Up powered by Supabase Auth with server-side validation.
- **Modern UI Edge**: A sophisticated "Blue" accent design language combined with glassmorphic cards and dynamic micro-animations.

## 🚀 Tech Stack
- **Frontend Framework**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS (v4), Tailwind Animate
- **UI Components**: Radix UI primitives / shadcn/ui
- **Icons**: Lucide React
- **Authentication**: [Supabase](https://supabase.com/) SSR
- **Charts**: Recharts

## 📦 Getting Started

### Prerequisites
Make sure you have Node.js and **npm** installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **View the App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 License
This project is open-source and available under the MIT License.
