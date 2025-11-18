"use client";

import { useState } from "react";
import FaqItem from "./faq-item";
import FeedbackCard from "./feedback-card";

const faqData = [
  {
    id: 1,
    question: "How is Ern different from other yield protocols?",
    answer:
      "Unlike most yield protocols that pay in kind, Ern pays daily Bitcoin yield on stablecoin deposits.",
  },
  {
    id: 2,
    question: "Where do the returns come from?",
    answer:
      "Returns are generated through battle-tested lending protocols on the Ethereum mainnet, chosen for their long track record, deep liquidity, and proven security.",
  },
  {
    id: 3,
    question: "Does Ern run on the Ethereum mainnet?",
    answer:
      "Yes, Ern operates on the Ethereum mainnet, leveraging the security and liquidity of the largest DeFi ecosystem.",
  },
  {
    id: 4,
    question: "Are my deposits and returns safe?",
    answer:
      "Ern doesn’t hold or control your funds. Your deposits and returns are safeguarded by open-source smart contracts reinforced with rigorous external security audits.",
  },
  {
    id: 5,
    question: "How do I track my position?",
    answer:
      "Get real-time on-chain data on your deposits, withdrawals, earnings, and overall performance by connecting your wallet.",
  },
  {
    id: 6,
    question: "How long does it take to withdraw?",
    answer:
      "Withdrawals are processed immediately with no lockup periods. You can withdraw your stablecoins and earned Bitcoin at any time.",
  },
];

export default function Faq() {
  const [expandedItems, setExpandedItems] = useState<number[]>([1]);

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="mx-auto mt-[124px] w-full px-2 md:px-20 lg:mt-[300px] 2xl:max-w-[1380px] 2xl:px-0">
      <h2 className="mb-8 text-center font-semibold text-xl sm:text-[36px] lg:mb-12 lg:text-start lg:text-[54px]">
        FAQ
      </h2>

      <div className="flex flex-col justify-between gap-x-10 lg:flex-row 2xl:gap-x-20">
        <div className="w-fit 2xl:w-[820px]">
          <div className="space-y-3">
            {faqData.map((item) => (
              <FaqItem
                key={item.id}
                id={item.id}
                question={item.question}
                answer={item.answer}
                isExpanded={expandedItems.includes(item.id)}
                onToggle={toggleExpanded}
              />
            ))}
          </div>
        </div>

        <FeedbackCard />
      </div>
    </div>
  );
}
