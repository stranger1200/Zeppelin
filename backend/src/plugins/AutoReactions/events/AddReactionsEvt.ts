import { ChannelType, GuildTextBasedChannel, PermissionsBitField } from "discord.js";
import { AutoReaction } from "../../../data/entities/AutoReaction.js";
import { isDiscordAPIError, isDiscordJsTypeError } from "../../../utils.js";
import { getMissingChannelPermissions } from "../../../utils/getMissingChannelPermissions.js";
import { missingPermissionError } from "../../../utils/missingPermissionError.js";
import { readChannelPermissions } from "../../../utils/readChannelPermissions.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { autoReactionsEvt } from "../types.js";

const p = PermissionsBitField.Flags;

export const AddReactionsEvt = autoReactionsEvt({
  event: "messageCreate",
  allowBots: true,
  allowSelf: true,

  async listener({ pluginData, args: { message } }) {
    const channel = (await message.guild?.channels.fetch(message.channelId)) as
      | GuildTextBasedChannel
      | null
      | undefined;
    if (!channel) {
      return;
    }

    let autoReaction: AutoReaction | null = null;
    const lock = await pluginData.locks.acquire(`auto-reactions-${channel.id}`);
    if (pluginData.state.cache.has(channel.id)) {
      autoReaction = pluginData.state.cache.get(channel.id) ?? null;
    } else {
      autoReaction = (await pluginData.state.autoReactions.getForChannel(channel.id)) ?? null;
      if (!autoReaction && channel.isThread() && channel.parentId) {
        const parent = channel.parent ?? (await message.guild?.channels.fetch(channel.parentId));
        if (parent) {
          autoReaction =
            (await pluginData.state.autoReactions.getForChannel(channel.parentId)) ?? null;
        }
      }
      pluginData.state.cache.set(channel.id, autoReaction);
    }
    lock.unlock();

    if (!autoReaction) {
      return;
    }

    // Forum threads: only react to the first message (the post content), not subsequent replies
    if (channel.isThread() && channel.parentId) {
      const parent = channel.parent ?? (await message.guild?.channels.fetch(channel.parentId));
      if (parent?.type === ChannelType.GuildForum) {
        try {
          const starterMessage = await channel.fetchStarterMessage();
          if (starterMessage) {
            if (starterMessage.id !== message.id) {
              return;
            }
          } else {
            throw new Error("Starter message unavailable");
          }
        } catch {
          // Starter message not yet available or other error; use timestamp heuristic
          const createdTimestamp = channel.createdTimestamp ?? 0;
          const threadAgeSeconds = (Date.now() - createdTimestamp) / 1000;
          if (threadAgeSeconds > 5) {
            return;
          }
        }
      }
    }

    const me = pluginData.guild.members.cache.get(pluginData.client.user!.id)!;
    if (me) {
      const missingPermissions = getMissingChannelPermissions(me, channel, readChannelPermissions | p.AddReactions);
      if (missingPermissions) {
        const logs = pluginData.getPlugin(LogsPlugin);
        logs.logBotAlert({
          body: `Cannot apply auto-reactions in <#${channel.id}>. ${missingPermissionError(missingPermissions)}`,
        });
        return;
      }
    }

    for (const reaction of autoReaction.reactions) {
      try {
        await message.react(reaction);
      } catch (e) {
        if (isDiscordJsTypeError(e)) {
          const logs = pluginData.getPlugin(LogsPlugin);
          logs.logBotAlert({
            body: `Could not apply auto-reactions in <#${channel.id}> for message \`${message.id}\`: ${e.message}.`,
          });
        } else if (isDiscordAPIError(e)) {
          const logs = pluginData.getPlugin(LogsPlugin);
          if (e.code === 10008) {
            logs.logBotAlert({
              body: `Could not apply auto-reactions in <#${channel.id}> for message \`${message.id}\`. Make sure nothing is deleting the message before the reactions are applied.`,
            });
          } else {
            logs.logBotAlert({
              body: `Could not apply auto-reactions in <#${channel.id}> for message \`${message.id}\`. Error code ${e.code}.`,
            });
          }

          break;
        } else {
          throw e;
        }
      }
    }
  },
});
