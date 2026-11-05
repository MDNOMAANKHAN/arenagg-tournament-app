
import LoginForm from './LoginForm';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { denied?: string };
}) {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ink px-4 py-10 sm:px-6">

      {/* BACKGROUND EFFECTS */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.08] blur-[120px]" />

      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-600/[0.06] blur-[100px]" />

      <div className="relative z-10 mx-auto w-full max-w-md">
        <LoginForm denied={searchParams.denied === '1'} />
      </div>

    </main>
  );
}
