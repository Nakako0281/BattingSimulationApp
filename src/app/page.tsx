export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-center">
          ⚾ Baseball Batting Simulator
        </h1>
        <p className="text-lg text-center text-gray-600">
          野球の打撃成績から試合結果をシミュレーション
        </p>
        <div className="flex gap-4">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ログイン
          </a>
          <a
            href="/register"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            新規登録
          </a>
        </div>
      </main>
    </div>
  );
}
