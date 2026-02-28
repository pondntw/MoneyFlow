import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    return (
        <div className="flex h-screen w-screen items-center justify-center p-4">
            <form className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">เข้าสู่ระบบ / สมัครสมาชิก</h1>
                    <p className="text-sm text-muted-foreground">ป้อนอีเมลและรหัสผ่านของคุณเพื่อเข้าสู่ระบบบัญชี</p>
                </div>
                {resolvedSearchParams?.message && (
                    <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {resolvedSearchParams.message}
                    </div>
                )}
                <div className="grid gap-2 mt-4">
                    <Label htmlFor="email">อีเมล</Label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">รหัสผ่าน</Label>
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    />
                </div>
                <div className="mt-4 flex flex-col gap-2">
                    <Button formAction={login}>เข้าสู่ระบบ</Button>
                    <Button variant="outline" formAction={signup}>
                        สมัครสมาชิก
                    </Button>
                </div>
            </form>
        </div>
    )
}
