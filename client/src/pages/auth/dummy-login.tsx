import DummyLoginForm from '@/components/auth/dummy-login'

export default function DummyLoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <DummyLoginForm />
      </div>
    </div>
  )
}
