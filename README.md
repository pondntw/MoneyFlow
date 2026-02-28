# MoneyFlow

MoneyFlow is a modern financial dashboard and investment tracking application built with [Next.js](https://nextjs.org/) and powered by [Supabase](https://supabase.com).

## 🌟 Features
- **Dashboard Overview**: View key financial metrics at a glance.
- **Investments Tracking**: Monitor stock prices and investment portfolios.
- **Real-time Stock Data**: Integrated API for fetching up-to-date market information.
- **Secure Authentication**: Built-in and secure authentication flow using Supabase.
- **Modern UI**: Clean and responsive design built with Tailwind CSS.

## 🚀 Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend/Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **UI Components**: Radix UI / shadcn/ui
- **Icons**: Lucide React

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
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📝 License
This project is open-source and available under the MIT License.
