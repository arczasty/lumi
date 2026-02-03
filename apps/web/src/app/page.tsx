import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles, Moon, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />

      <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Moon className="w-5 h-5 text-[#030014]" />
          </div>
          <span className="font-bold text-xl tracking-tight">Lumi</span>
        </div>

        <nav className="flex items-center gap-6">
          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium hover:text-teal-400 transition-colors">
              Journal
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-md border border-white/10">
                Enter Sanctuary
              </button>
            </SignInButton>
          </SignedOut>
        </nav>
      </header>

      <div className="text-center z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-8 uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          Powered by Gemini 1.5 Flash
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
          The OS for the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-white to-purple-400">
            Subconscious
          </span>
        </h1>

        <p className="text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          Lumi hears your whispers and weaves them into patterns. <br className="hidden md:block" />
          A sacred space for your dreams and Jungian insights.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button className="w-full md:w-auto px-8 py-4 bg-white text-[#030014] rounded-2xl font-bold text-lg hover:bg-teal-50 transition-all shadow-xl shadow-white/5">
            Download the App
          </button>
          <SignedIn>
            <Link href="/dashboard">
              <button className="w-full md:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-lg transition-all backdrop-blur-md border border-white/10 flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" />
                Open Journal
              </button>
            </Link>
          </SignedIn>
        </div>
      </div>

      <footer className="absolute bottom-8 text-gray-500 text-sm font-light">
        © 2026 Go Feral Studio. All rights reserved.
      </footer>
    </main>
  );
}
