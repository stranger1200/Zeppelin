import { GuildTextBasedChannel, Snowflake } from "discord.js";
import { GuildPluginData } from "vety";
import { SavedMessage } from "../../../data/entities/SavedMessage.js";
import { resolveUser } from "../../../utils.js";
import { getMessageDeleteLogType } from "../../Logs/util/getMessageDeleteLogType.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import type { CensorSource } from "../../Logs/logFunctions/logCensor.js";
import { CensorPluginType } from "../types.js";

export async function censorMessage(
  pluginData: GuildPluginData<CensorPluginType>,
  savedMessage: SavedMessage,
  reason: string,
  source?: CensorSource,
  censoredText?: string,
) {
  pluginData.state.serverLogs.ignoreLog(getMessageDeleteLogType(savedMessage), savedMessage.id);

  try {
    const resolvedChannel = pluginData.guild.channels.resolve(savedMessage.channel_id as Snowflake);
    if (resolvedChannel?.isTextBased()) await resolvedChannel.messages.delete(savedMessage.id as Snowflake);
  } catch {
    return;
  }

  const user = await resolveUser(pluginData.client, savedMessage.user_id, "Censor:censorMessage");
  const channel = pluginData.guild.channels.resolve(savedMessage.channel_id as Snowflake)! as GuildTextBasedChannel;

  pluginData.getPlugin(LogsPlugin).logCensor({
    user,
    channel,
    reason,
    message: savedMessage,
    source,
    censoredText,
  });
}
