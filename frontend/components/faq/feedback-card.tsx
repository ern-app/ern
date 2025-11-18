import Link from "next/link";
import Button from "@/components/shared/button";
import ChevronRight from "@/public/icons/chevron-right";

export default function FeedbackCard() {
  return (
    <div className="mt-8 h-fit w-full rounded-2xl bg-[#1B1B1B] p-7 lg:mt-0 lg:w-auto lg:min-w-[300px] lg:max-w-[460px]">
      <div className="mb-[60px] space-y-3.5 lg:mb-[240px]">
        <h2 className="text-white text-xl lg:text-[32px]">
          Feedback & Support
        </h2>

        <p className="font-inter text-sm text-white/40 tracking-tight lg:text-base">
          Have questions or suggestions? We&apos;re always listening and ready
          to help.
        </p>
      </div>

      <Link href="mailto:contact@ern.app" target="_blank">
        <Button className="flex w-full items-center justify-center gap-x-3 rounded-[6px] border border-white/45 bg-white/11 py-3.5 hover:bg-white/6">
          <ChevronRight className="h-3 w-[7px] text-white/60" />
          <span className="font-inter text-white">Contact</span>
        </Button>
      </Link>
    </div>
  );
}
