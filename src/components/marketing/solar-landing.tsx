/**
 * Marketing layout baseline inspired by premium solar product pages (e.g. tesla.com/solarroof).
 * Not affiliated with Tesla — replace all imagery, headlines, and copy for Duck4 Solar / Georgeo_Solar.
 */
import Image from "next/image";
import { TeslaButton } from "@/components/marketing/tesla-button";

const IMG_HERO =
  "https://images.unsplash.com/photo-1508514177221-188b1f16e752?auto=format&fit=crop&w=2400&q=80";
const IMG_SPLIT_A =
  "https://images.unsplash.com/photo-1613665813444-6a85c8876f5f?auto=format&fit=crop&w=1600&q=80";
const IMG_SPLIT_B =
  "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1600&q=80";
const IMG_FULLBLEED =
  "https://images.unsplash.com/photo-1613665813444-6a85c8876f5f?auto=format&fit=crop&w=2400&q=80";

export function SolarLanding() {
  return (
    <>
      {/* Hero — full viewport, Tesla-style */}
      <section className="relative min-h-[100dvh] w-full">
        <div className="absolute inset-0">
          <Image
            src={IMG_HERO}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black" />
        </div>
        <div className="relative flex min-h-[100dvh] flex-col items-center justify-between px-4 pt-28 pb-16 text-center sm:pt-32">
          <div className="max-w-4xl pt-8 sm:pt-16">
            <h1 className="text-[40px] font-medium leading-[1.05] tracking-[-0.02em] text-white sm:text-[56px] md:text-[64px]">
              Solar Roof
            </h1>
            <p className="mt-3 text-[17px] font-normal text-white/95 sm:text-[20px]">
              Transform your roof. Power your home.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <TeslaButton href="/quote" variant="primary">
              Order now
            </TeslaButton>
            <TeslaButton href="/projects" variant="outline">
              Learn more
            </TeslaButton>
          </div>
        </div>
      </section>

      {/* Intro copy — narrow column on black */}
      <section className="bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[28px] font-medium leading-snug tracking-tight text-white sm:text-[36px]">
            Powered and protected
          </h2>
          <p className="mt-6 text-[17px] leading-[1.6] text-[#a2a3a5] sm:text-[18px]">
            Placeholder paragraph — replace with your value proposition. A seamless glass roof that
            collects energy while protecting your home. Engineering and aesthetics, unified.
          </p>
        </div>
      </section>

      {/* Split: image | text */}
      <section className="grid bg-black md:grid-cols-2">
        <div className="relative min-h-[320px] md:min-h-[560px]">
          <Image
            src={IMG_SPLIT_A}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-center px-8 py-16 md:px-16 md:py-24">
          <h3 className="text-[24px] font-medium tracking-tight text-white sm:text-[32px]">
            Durability
          </h3>
          <p className="mt-5 max-w-md text-[15px] leading-[1.65] text-[#a2a3a5] sm:text-[16px]">
            Placeholder — describe tile rating, weather resistance, or warranty. Swap image in{" "}
            <code className="text-[13px] text-white/60">solar-landing.tsx</code>.
          </p>
        </div>
      </section>

      {/* Split: text | image */}
      <section className="grid bg-black md:grid-cols-2">
        <div className="order-2 flex flex-col justify-center px-8 py-16 md:order-1 md:px-16 md:py-24">
          <h3 className="text-[24px] font-medium tracking-tight text-white sm:text-[32px]">
            Efficiency
          </h3>
          <p className="mt-5 max-w-md text-[15px] leading-[1.65] text-[#a2a3a5] sm:text-[16px]">
            Placeholder — describe kW output, savings, or monitoring. Text and image are easy to
            change later.
          </p>
        </div>
        <div className="relative order-1 min-h-[320px] md:order-2 md:min-h-[560px]">
          <Image
            src={IMG_SPLIT_B}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* Full-bleed + overlay caption */}
      <section className="relative min-h-[70dvh] w-full">
        <div className="absolute inset-0">
          <Image
            src={IMG_FULLBLEED}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>
        <div className="relative flex min-h-[70dvh] flex-col justify-end px-6 pb-16 md:px-16 md:pb-24">
          <div className="max-w-xl">
            <h3 className="text-[28px] font-medium text-white sm:text-[36px]">Designed as a system</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-white/90 sm:text-[16px]">
              Placeholder overlay line — e.g. inverter, battery, or installation story.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA strip */}
      <section className="bg-black px-6 py-20 text-center sm:py-28">
        <h2 className="text-[24px] font-medium text-white sm:text-[32px]">Ready to order?</h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] text-[#a2a3a5]">
          Placeholder subline for quote flow.
        </p>
        <div className="mt-10 flex justify-center">
          <TeslaButton href="/quote" variant="primary">
            Order now
          </TeslaButton>
        </div>
      </section>
    </>
  );
}
