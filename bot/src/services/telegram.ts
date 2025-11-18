import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import type { Config } from "../config";
import { createLogger } from "../logger";
import type { HarvestService } from "./harvest";

// Enable relative time plugin
dayjs.extend(relativeTime);

type HarvestSuccess = {
  success: true;
  hash: string;
};

type HarvestFailure = {
  success: false;
  error: string;
};

export class TelegramService {
  private readonly logger;
  private readonly config: Config["telegram"];
  private readonly explorerUrl: string | undefined;
  private readonly instances = new Map<string, HarvestService>();
  private readonly botStartTime: Date;
  private bot: Telegraf | null = null;

  constructor(config: Config) {
    this.logger = createLogger("telegram");
    this.explorerUrl = config.network.explorerUrl;
    this.config = config.telegram;
    this.botStartTime = new Date();

    if (this.config) {
      this.logger.info("Telegram bot enabled", {
        chatId: this.config.chatId,
      });
      this.initializeBot();
      this.launchBot();
    } else {
      this.logger.info("Telegram bot disabled (missing config)");
    }
  }

  private initializeBot() {
    if (!this.config) return;

    this.bot = new Telegraf(this.config.botToken);

    // Register command handlers
    this.bot.command("start", (ctx) => this.handleStartCommand(ctx));
    this.bot.command("help", (ctx) => this.handleHelpCommand(ctx));
    this.bot.command("status", (ctx) => this.handleStatusCommand(ctx));

    // Handle unknown commands
    this.bot.on(message("text"), (ctx) => {
      const text = ctx.message.text;
      if (text.startsWith("/")) {
        const command = text.split(" ")[0];
        ctx.reply(
          `❓ Unknown command: ${command}\n\nUse /help to see available commands.`,
          { parse_mode: "HTML" },
        );
      }
    });

    // Error handling
    this.bot.catch((err, ctx) => {
      this.logger.error("Telegraf error", { err, update: ctx.update });
    });
  }

  private async launchBot() {
    if (!this.bot) {
      return;
    }

    try {
      this.logger.info("Launching Telegraf bot");
      await this.bot.launch();
      this.logger.info("Telegraf bot launched successfully");
    } catch (error) {
      this.logger.error("Failed to launch Telegraf bot", error);
    }
  }

  private async handleStartCommand(ctx: any) {
    const message =
      "👋 <b>Welcome to Ern Bot!</b>\n\n" +
      "I'm an automated harvest bot for the Ern protocol.\n\n" +
      "Available commands:\n" +
      "/status - Show bot status and statistics\n" +
      "/help - Show this help message";

    await ctx.reply(message, { parse_mode: "HTML" });
  }

  private async handleHelpCommand(ctx: any) {
    const message =
      "📚 <b>Ern Bot Help</b>\n\n" +
      "<b>Available Commands:</b>\n" +
      "/status - Show bot uptime, harvest statistics, and vault information\n" +
      "/help - Show this help message\n\n" +
      "<b>About:</b>\n" +
      "This bot automatically monitors Ern vaults and executes daily harvests.";

    await ctx.reply(message, { parse_mode: "HTML" });
  }

  private async handleStatusCommand(ctx: any) {
    const now = new Date();
    const uptimeMs = now.getTime() - this.botStartTime.getTime();
    const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const uptimeMins = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const uptimeSecs = Math.floor((uptimeMs % (1000 * 60)) / 1000);

    let message = `📊 <b>Bot Status</b>\n\n`;
    message += `🚀 <b>Launched:</b> ${dayjs(this.botStartTime).fromNow()}\n`;
    message += `⏱ <b>Uptime:</b> ${uptimeHours}h ${uptimeMins}m ${uptimeSecs}s\n`;
    message += `🤖 <b>Active Bots:</b> ${this.instances.size}\n\n`;

    for (const [id, instance] of this.instances.entries()) {
      const stats = instance.getStats();
      const isHarvesting = instance.isHarvesting();
      const lastHarvestStr = stats.lastHarvestTime
        ? dayjs(stats.lastHarvestTime).fromNow()
        : "Never";
      const nextHarvestStr = stats.nextHarvestTime
        ? dayjs(stats.nextHarvestTime).fromNow()
        : "Unknown";
      const statusEmoji = isHarvesting
        ? "🔄"
        : stats.lastHarvestSuccess === true
          ? "✅"
          : stats.lastHarvestSuccess === false
            ? "❌"
            : "⏸";

      message += `${statusEmoji} <b>${id}</b>\n`;
      message += `  • Success: ${stats.successCount} | Failed: ${stats.failureCount}\n`;
      message += `  • Last Harvest: ${lastHarvestStr}\n`;
      message += `  • Next Harvest: ${nextHarvestStr}\n`;
      message += `  • Status: ${isHarvesting ? "Harvesting..." : "Idle"}\n\n`;
    }

    await ctx.reply(message, { parse_mode: "HTML" });
  }

  registerBot(instance: HarvestService) {
    this.instances.set(instance.id, instance);
    this.logger.debug(`Registered bot: ${instance.id}`);
  }

  private async stop() {
    if (!this.bot) {
      return;
    }

    try {
      this.logger.info("Stopping Telegraf bot");
      this.bot.stop();
      this.logger.info("Telegraf bot stopped");
    } catch (error) {
      this.logger.error("Error stopping Telegraf bot", error);
    }
  }

  async notifyStartup() {
    const botIds = Array.from(this.instances.keys());
    const message =
      `🚀 <b>Ern Bot Started</b>\n\n` +
      `Active bots: ${botIds.length}\n` +
      `Instances:\n${botIds.map((id) => `• ${id}`).join("\n")}\n\n`;

    await this.sendMessage(message);
  }

  async notifyShutdown(reason?: string) {
    await this.stop();

    const botIds = Array.from(this.instances.keys());
    const emoji = reason ? "❌" : "🛑";
    const title = reason ? "Bot Shutdown (Error)" : "Bot Shutdown";

    let message =
      `${emoji} <b>Ern ${title}</b>\n\n` +
      `Stopped bots: ${botIds.length}\n` +
      `Instances:\n${botIds.map((id) => `• ${id}`).join("\n")}\n`;

    if (reason) {
      message += `\nReason: ${reason}\n`;
    }

    await this.sendMessage(message);
  }

  async notifyHarvest(
    botId: string,
    result: HarvestSuccess | HarvestFailure,
    nextHarvestTime?: Date,
  ) {
    let message = `<b>Harvest Update</b>\nBot: <code>${botId}</code>\n`;

    if (result.success) {
      message += `Status: ✅ Success\n`;
      if (this.explorerUrl) {
        const txUrl = `${this.explorerUrl}/tx/${result.hash}`;
        message += `<a href="${txUrl}">${result.hash}</a>\n`;
      } else {
        message += `Transaction: <code>${result.hash}</code>\n`;
      }
    } else {
      message += `Status: ❌ Failed\n`;
      message += `Error: <pre>${result.error}</pre>\n`;
    }

    if (nextHarvestTime) {
      message += `\nNext harvest: ${dayjs(nextHarvestTime).fromNow()}`;
    }

    await this.sendMessage(message);
  }

  async notifyHarvestRetry(botId: string, retryInSeconds: number) {
    const minutes = Math.floor(retryInSeconds / 60);
    const seconds = retryInSeconds % 60;

    let timeStr = "";
    if (minutes > 0) {
      timeStr = `${minutes}m`;
      if (seconds > 0) {
        timeStr += ` ${seconds}s`;
      }
    } else {
      timeStr = `${seconds}s`;
    }

    const message =
      `🔄 <b>Harvest Retry Scheduled</b>\n` +
      `Bot: <code>${botId}</code>\n` +
      `Next attempt in: ${timeStr}`;

    await this.sendMessage(message);
  }

  async notifyHarvestConditionsNotMet(
    botId: string,
    lastHarvestTime: Date | null,
  ) {
    const timeSinceLastHarvest = lastHarvestTime
      ? dayjs().diff(dayjs(lastHarvestTime), "hour")
      : null;

    let message = `⚠️ <b>Harvest Conditions Not Met</b>\n`;
    message += `Bot: <code>${botId}</code>\n\n`;
    message += `Harvest conditions have not been met for more than 24 hours.\n\n`;

    if (lastHarvestTime) {
      message += `Last successful harvest: ${dayjs(lastHarvestTime).fromNow()}\n`;
      message += `Time elapsed: ${timeSinceLastHarvest}h`;
    } else {
      message += `No harvest has been executed yet.`;
    }

    await this.sendMessage(message);
  }

  private async sendMessage(text: string, chatId?: number) {
    if (!this.config || !this.bot) {
      this.logger.warn("Telegram msg skipped (missing config)", { text });
      return;
    }

    const targetChatId = chatId || this.config.chatId;

    try {
      await this.bot.telegram.sendMessage(targetChatId, text, {
        parse_mode: "HTML",
      });
      this.logger.debug("Telegram msg sent", { text, chatId: targetChatId });
    } catch (error) {
      this.logger.error("Telegram msg failed", { error, text });
    }
  }
}
