import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">⚾ 新規登録</h1>
          <p className="mt-2 text-sm text-gray-600">
            Baseball Batting Simulator
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
