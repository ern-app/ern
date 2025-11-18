const features = [
  {
    id: 1,
    title: "Trustless & Transparent",
    description:
      "Externally audited, on-chain <br class='hidden 2xl:block' /> and self-custodied.",
    image: "/images/why-earn/transparent.png",
    imageClassName: "absolute bottom-0 right-0 w-[260px] aspect-auto",
    imageWidth: 300,
    imageHeight: 235,
    alt: "transparent",
  },
  {
    id: 2,
    title: "Reliable & Liquid",
    description:
      "Built on top of proven, deep liquidity lending & <br class='hidden 2xl:block' /> borrowing protocols.",
    image: "/images/why-earn/reliable.png",
    imageClassName: "absolute bottom-0 right-6 w-[250px] h-full aspect-auto",
    imageWidth: 240,
    imageHeight: 235,
    alt: "reliable",
  },
  {
    id: 3,
    title: "Efficient & Safe",
    description:
      "Designed to deliver the highest returns with <br class='hidden 2xl:block' /> the lowest risk possible.",
    image: "/images/why-earn/safe.png",
    imageClassName: "absolute bottom-3 right-4 h-full w-[290px] aspect-auto",
    imageWidth: 280,
    imageHeight: 235,
    alt: "safe",
  },
  {
    id: 4,
    title: "Open to anyone",
    description:
      "Whether you're new to crypto or a pro, <br class='hidden 2xl:block' /> Ern makes it simple to earn more & better.",
    image: "/images/why-earn/open.png",
    imageClassName:
      "absolute top-1/2 -translate-y-1/2 right-8 w-[190px] aspect-auto",
    imageWidth: 190,
    imageHeight: 208,
    alt: "open",
  },
];

const gridLayouts = [
  {
    className: "grid lg:[grid-template-columns:64fr_87fr] gap-3 lg:gap-5",
    features: [features[0], features[1]],
  },
  {
    className: "grid lg:[grid-template-columns:87fr_64fr] gap-3 lg:gap-5",
    features: [features[2], features[3]],
  },
];

const bars = [
  {
    className: "absolute bottom-0 right-0 w-5 h-full bg-[var(--color-primary)]",
  },
  {
    className:
      "absolute bottom-0 right-5 w-5 h-[85%] bg-[var(--color-primary)]/30 group-hover:h-[95%] transition-all duration-300",
  },
  {
    className:
      "absolute bottom-0 right-10 w-5 h-[60%] bg-[var(--color-primary)]/60 group-hover:h-[68%] transition-all duration-300 delay-100",
  },
  {
    className:
      "absolute bottom-0 right-[60px] w-5 h-[20%] bg-[var(--color-primary)]/90 group-hover:h-[30%] transition-all duration-300 delay-150",
  },
];

export default function WhyErn() {
  return (
    <div className="mx-auto mt-[124px] w-full px-2 md:px-20 lg:mt-[300px] 2xl:max-w-[1380px] 2xl:px-0">
      <h2 className="mb-8 text-center font-semibold text-[#040404] text-xl sm:text-[36px] lg:mb-[50px]">
        Why Ern?
      </h2>

      <div className="space-y-3 lg:space-y-5">
        {gridLayouts.map((layout, layoutIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: previous team
          <div key={layoutIndex} className={layout.className}>
            {layout.features.map((feature, featureIndex) => {
              const globalIndex =
                gridLayouts
                  .slice(0, layoutIndex)
                  .reduce((sum, l) => sum + l.features.length, 0) +
                featureIndex;

              const count = Math.min(globalIndex + 1, bars.length);
              const barsToShow = bars.slice(0, count);

              return (
                <div
                  key={feature.id}
                  className="group relative flex h-[130px] flex-col justify-center space-y-2 overflow-hidden rounded-xl bg-[#F7F6F2] pr-24 pl-4 sm:h-[230px] sm:pl-8"
                >
                  <h4 className="font-medium text-[18px] sm:text-[30px]">
                    {feature.title}
                  </h4>
                  <p
                    className="text-[#747473] text-base sm:text-xl 2xl:text-[22px]"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: previous team
                    dangerouslySetInnerHTML={{ __html: feature.description }}
                  />

                  <div>
                    {barsToShow.map((bar, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: previous team
                      <div key={i} className={bar.className} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
