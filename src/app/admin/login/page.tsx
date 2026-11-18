import LoginForm from './LoginForm';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { denied?: string };
}) {
  return (
    <main className="admin-login-scene relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="admin-login-orb admin-login-orb-one" aria-hidden="true" />
      <div className="admin-login-orb admin-login-orb-two" aria-hidden="true" />
      <div className="admin-login-orb admin-login-orb-three" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden="true">
        <div className="admin-login-grid h-full w-full" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-[460px]">
        <LoginForm denied={searchParams.denied === '1'} />
      </div>
    </main>
  );
}
