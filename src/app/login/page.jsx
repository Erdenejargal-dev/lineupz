import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

function LoginFormWrapper() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <LoginFormWrapper />
    </Suspense>
  );
}
