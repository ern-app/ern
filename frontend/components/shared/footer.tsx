"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TwitterIcon from "@/public/icons/twitter";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <>
      <footer className="relative mx-2 mt-[95px] h-[215px] overflow-hidden rounded-2xl bg-[#F7F6F2] md:mx-20 lg:mt-[150px] lg:h-[280px] xl:h-[364px] 2xl:mx-auto 2xl:max-w-[1450px]">
        <Image
          src="/images/footer-overlay-mobile.svg"
          width={302}
          height={214}
          className="absolute top-0 left-0 object-fill object-left lg:hidden"
          alt="footer-overlay-mobile"
        />
        <Image
          src="/images/footer-overlay-desktop.svg"
          width={1450}
          height={364}
          className="absolute top-0 left-0 hidden h-full object-fill object-left lg:block"
          alt="footer-overlay-desktop"
        />

        <div className="relative z-10 flex h-full flex-col p-4 sm:px-6 md:px-12 md:py-6 lg:py-9">
          <div className="flex justify-end">
            <div className="mt-0 flex items-start gap-x-8 lg:gap-x-[70px]">
              {/* LEGAL Column */}
              <div className="flex flex-col items-end gap-y-2.5 font-medium text-xs sm:text-base">
                <p className="text-black/30">Legal</p>

                <div className="flex flex-col items-end gap-y-2.5">
                  <Link
                    href="/terms"
                    className="text-black/70 opacity-90 transition-all duration-300 hover:text-black/85"
                  >
                    Terms of Service
                  </Link>

                  <Link
                    href="/privacy-policy"
                    className="text-black/70 opacity-90 transition-all duration-300 hover:text-black/85"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>

              {/* MENU Column */}
              <div className="flex flex-col items-end gap-y-2.5 font-medium text-xs sm:text-base">
                <p className="text-black/30">Resources</p>
                <div className="flex flex-col items-end gap-y-2.5">
                  <Link
                    href="mailto:contact@ern.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black/70 opacity-90 transition-all duration-300 hover:text-black/85"
                  >
                    Contact
                  </Link>
                  <Link
                    href="https://github.com/ern-app/ern"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black/70 opacity-90 transition-all duration-300 hover:text-black/85"
                  >
                    Github
                  </Link>
                  <Link
                    href="https://github.com/ern-app/ern/blob/main/audits/CREED-2025.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black/70 opacity-90 transition-all duration-300 hover:text-black/85"
                  >
                    Audit
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-4 bottom-4 sm:right-6 md:right-12 md:bottom-6 lg:bottom-9">
            <Link
              href="https://x.com/ernapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterIcon className="aspect-square w-3.5 text-black/45 transition-colors duration-300 hover:text-black/89" />
            </Link>
          </div>

          {/* Copyright pushed to bottom */}
          <div className="flex-1" />
          <p className="text-black/45 text-xs sm:text-base">
            © Ern {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* gradient lines effect */}
      <div className="relative mx-2 mt-3 flex flex-col items-center overflow-hidden pb-4 md:mx-20 md:mt-6 md:pb-12 2xl:mx-auto 2xl:max-w-[1450px]">
        <div className="h-1 w-[95%] rounded-full bg-[var(--color-primary)]" />
        <div className="my-4 h-1 w-[85%] rounded-full bg-[var(--color-primary)] md:my-5" />
        <div className="h-1 w-[75%] rounded-full bg-[var(--color-primary)]" />
        <div className="mt-4 h-1 w-[65%] rounded-full bg-[var(--color-primary)] md:mt-5" />

        <div className="absolute left-[200px] h-[300px] w-[150px] rotate-[40deg] bg-white/80 blur-[60px]" />
        <div className="absolute h-[300px] w-[150px] rotate-[40deg] bg-white/80 blur-[60px]" />
        <div className="absolute right-[200px] h-[300px] w-[150px] rotate-[40deg] bg-white/80 blur-[60px]" />
      </div>
    </>
  );
}
