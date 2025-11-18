import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "wagmi.generated.ts",
  contracts: [],
  plugins: [
    foundry({
      include: [
        "*/Ern.json",
        "*/ERC20.json",
        "*/IAggregatorV3.json",
        "*/MockAavePool.json",
        "*/MockAToken.json",
      ],
      project: "../../",
    }),
    react(),
  ],
});
