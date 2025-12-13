import { AnimatedBlurBackground } from '@/components/AnimatedBlurBackground'
import { FeatureGrid, Hero } from '@/components/home'

/**
 * Home page - Landing page with hero section and features
 */
export default function Home() {
  return (
    <>
      <div className="relative z-10 flex flex-col justify-center pt-20">
        {/* Hero Section */}
        <section
          className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 text-center"
          aria-labelledby="hero-title"
        >
          <Hero />
          <FeatureGrid />
        </section>
      </div>

      {/* Animated Blur Background */}
      <AnimatedBlurBackground />

      {/* Static Grid Overlay (Optional texturizer) */}
      <div
        className="pointer-events-none fixed inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px] opacity-10"
        aria-hidden="true"
      />
    </>
  )
}
