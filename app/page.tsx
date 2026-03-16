import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-gray-50 to-white px-4">
      <main className="text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900">
          CodeSensei
        </h1>
        <p className="mb-2 text-xl text-blue-600 font-medium">
          AI Coding Tutor
        </p>
        <p className="mx-auto mb-8 max-w-md text-lg text-gray-600">
          Learn to code through guided practice. Our Socratic AI tutor helps you
          discover solutions — never just gives you the answer.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-full bg-blue-600 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700"
        >
          Get Started
        </Link>
      </main>
    </div>
  );
}
