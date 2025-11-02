/* New Hero component using metallic headline. */
"use client";

export default function HeroSection() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-white">
      {/* The grid background is now controlled by the main page layout */}
      <section className="relative z-10 flex min-h-screen items-center justify-center pb-36 md:pb-8 lg:pb-12">
        {/* Content */}
        <div className="relative z-20 mx-auto w-full max-w-6xl px-10 py-6 text-center">
          {" "}
          {/* Increased max-w for more space */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {" "}
              {/* Increased padding and text size */}
              <span className="relative flex h-6 w-6 items-center justify-center">
                <span className="absolute h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              </span>
              CareerCortex - AI Career Coach
            </div>
          </div>
          {/* INCREASED FONT SIZES */}
          <h1
            // The only change is removing "text-balance" from this className
            className="mt-4 text-center text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl xl:text-8xl animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <span className="text-metallic animate-metallic">
              <span className="lg:whitespace-nowrap">
                Building Your Professional{" "}
              </span>

              <br className="hidden lg:block" />

              <span>Future, Intelligently</span>
            </span>
          </h1>
          {/* INCREASED FONT SIZE */}
          <p
            className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg md:text-xl animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            {/* BIGGER BUTTON */}
            <a
              href="/dashboard"
              aria-label="Get Started with CareerCortex"
              className="group relative inline-flex items-center justify-center rounded-full bg-cyan-500 px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="absolute inset-0 rounded-full ring-1 ring-cyan-300/70 transition-box-shadow group-hover:shadow-[0_0_28px_rgba(34,211,238,0.45)]" />
              <span className="absolute -inset-px rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.25),transparent_60%)] opacity-40" />
              Get Started
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
