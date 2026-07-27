import AuthLayout from '@/layouts/AuthLayout';
import RegisterForm from '@/components/features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
