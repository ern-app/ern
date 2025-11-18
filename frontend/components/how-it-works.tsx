"use client";

import Link from "next/link";
import { useState } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ChevronRight from "@/public/icons/chevron-right";
import Button from "./shared/button";
import NoiseBackground from "./shared/noise-background";
import RiveComponent from "./shared/RiveComponent";
import "swiper/css";
import "swiper/css/pagination";

const steps = [
  {
    id: 1,
    riveSrc: "/illustrations/step1.riv",
    title: "Deposit Stablecoins",
    description: "USDC & USDT",
    alt: "deposit",
  },
  {
    id: 2,
    riveSrc: "/illustrations/step2.riv",
    title: "Earn Bitcoin",
    description: "Daily yield paid in Bitcoin (wBTC)",
    alt: "earn",
  },
  {
    id: 3,
    riveSrc: "/illustrations/step3.riv",
    title: "Withdraw Any Time",
    description: "Full deposit & earned Bitcoin",
    alt: "withdraw",
  },
];

const StepCard = ({ step }: { step: (typeof steps)[0] }) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#F7F6F2] md:max-h-[500px]">
      <NoiseBackground
        className="absolute inset-0"
        opacity={0.1}
        intensity="medium"
      />

      <div className="flex h-[300px] w-full items-center justify-center">
        <div className="h-[300px] w-[300px]">
          <RiveComponent
            src={step.riveSrc}
            className="aspect-square h-full w-full"
            width={500}
            height={500}
            loop={true}
          />
        </div>
      </div>

      <div className="space-y-4 px-4 pb-8 lg:px-8 lg:pt-10 lg:pb-14">
        <div className="w-fit rounded-full bg-black/6 px-5 py-2 font-inter font-medium text-lg uppercase">
          Step {step.id}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-[22px] lg:text-[30px]">
            {step.title}
          </h4>
          <p className="text-[#747474] text-base lg:text-[22px]">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function HowItWorks() {
  const [isLaunchAppHovered, setIsLaunchAppHovered] = useState(false);
  const [isLaunchAppPressed, setIsLaunchAppPressed] = useState(false);

  return (
    <div className="mx-auto w-full px-6 pt-[124px] md:px-20 lg:pt-[300px] 2xl:max-w-[1240px] 2xl:px-0">
      <h2 className="mb-[50px] text-center font-semibold text-[#040404] text-xl sm:text-[36px]">
        How It Works
      </h2>

      {/* Carousel for smaller screens (lg and below) */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{
            clickable: true,
            el: ".custom-pagination",
          }}
          className="pb-16"
        >
          {steps.map((step) => (
            <SwiperSlide key={step.id}>
              <StepCard step={step} />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="custom-pagination mt-6 flex justify-center gap-2"></div>
      </div>

      {/* Grid for larger screens */}
      <div className="hidden grid-cols-3 gap-x-5 lg:grid">
        {steps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
      </div>

      <div className="mt-[50px] flex justify-center">
        <Link href="/dashboard">
          <Button
            onMouseEnter={() => setIsLaunchAppHovered(true)}
            onMouseLeave={() => {
              setIsLaunchAppHovered(false);
              setIsLaunchAppPressed(false);
            }}
            onMouseDown={() => setIsLaunchAppPressed(true)}
            onMouseUp={() => setIsLaunchAppPressed(false)}
            className="relative flex items-center gap-x-3 rounded-[6px] bg-black px-4 py-3 hover:bg-black/80"
            style={{
              transform: isLaunchAppPressed
                ? "scale(1)"
                : isLaunchAppHovered
                  ? "scale(1.02)"
                  : "scale(1)",
              transition: "transform 0.15s ease-out",
            }}
          >
            <NoiseBackground
              className="absolute inset-0"
              opacity={0.2}
              intensity="high"
            />

            <span
              className="font-inter text-white"
              style={{
                transform: isLaunchAppPressed
                  ? "scale(1)"
                  : isLaunchAppHovered
                    ? "scale(1.04)"
                    : "scale(1)",
                transition: "transform 0.15s ease-out",
              }}
            >
              Launch App
            </span>
            <ChevronRight
              className="h-3 w-[7px] text-white/50"
              isHovered={isLaunchAppHovered}
              baseColor="bg-white/50"
              hoverColor="bg-white"
            />
          </Button>
        </Link>
      </div>

      <style jsx global>{`
        .custom-pagination {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .custom-pagination .swiper-pagination-bullet {
          width: 40px;
          height: 3px;
          border-radius: 2px;
          background: #d1d1d1;
          opacity: 1;
          transition: all 0.3s ease;
        }

        .custom-pagination .swiper-pagination-bullet-active {
          width: 60px;
          height: 3px;
          background: #000000;
        }
      `}</style>
    </div>
  );
}
