import { GuildTextBasedChannel, Snowflake } from "discord.js";
import { z } from "zod";
import { noop } from "../../../utils.js";
import { MESSAGE_DELETE_LOG_TYPES } from "../../Logs/util/getMessageDeleteLogType.js";
import { automodAction } from "../helpers.js";

export const CleanAction = automodAction({
  configSchema: z.boolean().default(false),

  async apply({ pluginData, contexts, ruleName }) {
    const messageIdsToDeleteByChannelId: Map<string, string[]> = new Map();
    for (const context of contexts) {
      if (context.message) {
        if (!messageIdsToDeleteByChannelId.has(context.message.channel_id)) {
          messageIdsToDeleteByChannelId.set(context.message.channel_id, []);
        }

        if (messageIdsToDeleteByChannelId.get(context.message.channel_id)!.includes(context.message.id)) {
          // FIXME: Debug
          // tslint:disable-next-line:no-console
          console.warn(`Message ID to delete was already present: ${pluginData.guild.name}, rule ${ruleName}`);
          continue;
        }

        messageIdsToDeleteByChannelId.get(context.message.channel_id)!.push(context.message.id);
      }
    }

    for (const [channelId, messageIds] of messageIdsToDeleteByChannelId.entries()) {
      for (const id of messageIds) {
        for (const logType of MESSAGE_DELETE_LOG_TYPES) {
          pluginData.state.logs.ignoreLog(logType, id);
        }
      }

      const channel = pluginData.guild.channels.cache.get(channelId as Snowflake) as GuildTextBasedChannel;
      await channel.bulkDelete(messageIds as Snowflake[]).catch(noop);
    }
  },
});
