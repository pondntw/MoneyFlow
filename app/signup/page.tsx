import { signup } from '@/app/login/actions'
import { Wallet } from 'lucide-react'
import { AuthHero } from '@/components/auth-hero'
import { AuthForm } from '@/components/auth-form'

export default async function SignupPage({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    // Await searchParams in Next.js 15+
    const params = await searchParams;

    return (
        <div className="flex min-h-screen bg-background">
            <AuthHero />

            <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 sm:px-12 lg:px-20 py-12 relative bg-background">
                {/* Mobile Logo */}
                <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2 animate-in fade-in duration-500">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <Wallet className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">MoneyFlow</span>
                </div>

                <AuthForm type="signup" message={params?.message} actionFn={signup} />
            </div>
        </div>
    )
}
