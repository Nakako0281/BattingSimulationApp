import LoadingSpinner from "./LoadingSpinner";

export default function LoadingScreen({ message = "読み込み中..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}
