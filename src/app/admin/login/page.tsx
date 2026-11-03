import LoginForm from './LoginForm';
export default function LoginPage({ searchParams }: { searchParams: { denied?: string } }) {
  return <main className="flex min-h-screen items-center justify-center bg-ink p-6"><LoginForm denied={searchParams.denied === '1'} /></main>;
}
