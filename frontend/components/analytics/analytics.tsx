"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "../shared/button";
import NoiseBackground from "../shared/noise-background";
import HistoricalChart from "./historical-chart";
import PerformanceChart from "./performance-chart";
import Table from "./table";
import YieldSimulator from "./yield-simulator";

export default function Analytics() {
  const [view, setView] = useState<"chart" | "table">("table");

  return (
    <div className="mx-auto mt-[80px] px-2 md:px-20 lg:mt-[180px] 2xl:max-w-[1100px] 2xl:px-0">
      <h2 className="hidden pb-[50px] text-center font-semibold text-[#040404] text-[36px] lg:block">
        Engineered To Outperform
      </h2>

      {/* Desktop Layout (lg and above) */}
      <div className="hidden lg:block">
        <div className="grid gap-x-[34px] gap-y-10 lg:grid-cols-[16fr_26fr]">
          <YieldSimulator />
          <PerformanceChart />
        </div>

        <div className="w-full space-y-10">
          {view === "chart" ? (
            <div className="mx-auto lg:max-w-[760px] xl:max-w-[1000px]">
              <HistoricalChart />
            </div>
          ) : (
            <div className="w-full">
              <Table />
            </div>
          )}

          <div className="mx-auto flex w-fit items-center gap-x-3 rounded-full bg-[#F7F6F2] p-0.5">
            <Button
              className={cn("relative rounded-full px-4 py-1 font-medium", {
                "bg-[#404038] text-white": view === "table",
                "text-black": view === "chart",
              })}
              onClick={() => setView("table")}
            >
              {view === "table" && (
                <NoiseBackground
                  className="absolute inset-0 rounded-full"
                  opacity={0.2}
                  intensity="high"
                />
              )}
              Table
            </Button>

            <Button
              className={cn("relative rounded-full px-4 py-1 font-medium", {
                "bg-[#404038] text-white": view === "chart",
                "text-black": view === "table",
              })}
              onClick={() => setView("chart")}
            >
              {view === "chart" && (
                <NoiseBackground
                  className="absolute inset-0 rounded-full"
                  opacity={0.2}
                  intensity="high"
                />
              )}
              Chart
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Layout (below lg) */}
      <div className="space-y-10 lg:hidden">
        <YieldSimulator />

        <div className="space-y-10">
          {view === "chart" ? (
            <div className="mx-auto w-full sm:max-w-[520px]">
              <HistoricalChart />
            </div>
          ) : (
            <Table />
          )}

          <div className="mx-auto flex w-fit items-center gap-x-3 rounded-full bg-[#F7F6F2] p-0.5">
            <Button
              className={cn("relative rounded-full px-4 py-1 font-medium", {
                "bg-[#404038] text-white": view === "table",
                "text-black": view === "chart",
              })}
              onClick={() => setView("table")}
            >
              {view === "table" && (
                <NoiseBackground
                  className="absolute inset-0 rounded-full"
                  opacity={0.2}
                  intensity="high"
                />
              )}
              Table
            </Button>

            <Button
              className={cn("relative rounded-full px-4 py-1 font-medium", {
                "bg-[#404038] text-white": view === "chart",
                "text-black": view === "table",
              })}
              onClick={() => setView("chart")}
            >
              {view === "chart" && (
                <NoiseBackground
                  className="absolute inset-0 rounded-full"
                  opacity={0.2}
                  intensity="high"
                />
              )}
              Chart
            </Button>
          </div>
        </div>

        <PerformanceChart />
      </div>
    </div>
  );
}
