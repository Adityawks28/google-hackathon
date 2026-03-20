import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FFFCFB]-light">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 md:px-20 lg:px-40 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Logo size={36} />
          <h2 className="text-slate-900 text-xl font-bold tracking-tight">
            UriCode
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-slate-600 text-sm font-medium hover:text-[#630000] transition-colors"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="bg-[#630000] hover:bg-[#630000]/90 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32 bg-gradient-to-b from-white to-[#FFFCFB]-light">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-blue-600/20">
              AI Coding Tutor
            </div>
            <h1 className="text-slate-900 text-5xl md:text-7xl font-black tracking-tight leading-none">
              UriCode
            </h1>
            <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Learn to code through guided practice. Our Socratic AI tutor helps
              you discover solutions —{" "}
              <span className="text-slate-900 font-semibold">
                never just gives you the answer.
              </span>
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-block bg-[#630000] hover:bg-[#630000]/90 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-xl shadow-[#630000]/20 transition-all hover:scale-105 active:scale-95"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 lg:px-40">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Why UriCode?
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Experience a new way of learning that emphasizes understanding
              over memorization.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#630000]/10 rounded-xl flex items-center justify-center text-[#630000] mb-6">
                <span className="material-symbols-outlined">
                  psychology_alt
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Socratic Method
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Our AI asks the right questions to lead you to the solution,
                building deep mental models.
              </p>
            </div>
            <div className="p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#630000]/10 rounded-xl flex items-center justify-center text-[#630000] mb-6">
                <span className="material-symbols-outlined">terminal</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Guided Practice
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Build real projects with a tutor that understands your code and
                logic in real-time.
              </p>
            </div>
            <div className="p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#630000]/10 rounded-xl flex items-center justify-center text-[#630000] mb-6">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Instant Feedback
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get hints and explanations the moment you get stuck. No more
                waiting for stack overflow.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 bg-[#630000]/5">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900">
              Ready to master coding?
            </h2>
            <p className="text-slate-600 text-lg">
              Join thousands of students learning with their personal AI tutor.
              Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/login"
                className="bg-[#630000] hover:bg-[#630000]/90 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md"
              >
                Start Learning Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 px-6 py-12 md:px-20 lg:px-40">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-bold text-slate-900">UriCode</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
