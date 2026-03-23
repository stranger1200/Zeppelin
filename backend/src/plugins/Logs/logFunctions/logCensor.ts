import { GuildTextBasedChannel, User } from "discord.js";
import { GuildPluginData } from "vety";
import { deactivateMentions, disableCodeBlocks } from "vety/helpers";
import { LogType } from "../../../data/LogType.js";
import { SavedMessage } from "../../../data/entities/SavedMessage.js";
import { createTypedTemplateSafeValueContainer } from "../../../templateFormatter.js";
import { UnknownUser } from "../../../utils.js";
import { resolveChannelIds } from "../../../utils/resolveChannelIds.js";
import {
  channelToTemplateSafeChannel,
  savedMessageToTemplateSafeSavedMessage,
  userToTemplateSafeUser,
} from "../../../utils/templateSafeObjects.js";
import { LogsPluginType } from "../types.js";
import { log } from "../util/log.js";

export type CensorSource = "message" | "forward" | "poll";

export interface LogCensorData {
  user: User | UnknownUser;
  channel: GuildTextBasedChannel;
  reason: string;
  message: SavedMessage;
  source?: CensorSource;
  /** When censoring forwards or polls, the censored content to display in the log */
  censoredText?: string;
}

const CENSOR_LOG_TYPE_BY_SOURCE: Record<CensorSource, "CENSOR" | "CENSOR_FORWARD" | "CENSOR_POLL"> = {
  message: LogType.CENSOR,
  forward: LogType.CENSOR_FORWARD,
  poll: LogType.CENSOR_POLL,
};

export function logCensor(pluginData: GuildPluginData<LogsPluginType>, data: LogCensorData) {
  const logType: "CENSOR" | "CENSOR_FORWARD" | "CENSOR_POLL" = data.source
    ? CENSOR_LOG_TYPE_BY_SOURCE[data.source]
    : LogType.CENSOR;
  return log(
    pluginData,
    logType,
    createTypedTemplateSafeValueContainer({
      user: userToTemplateSafeUser(data.user),
      channel: channelToTemplateSafeChannel(data.channel),
      reason: data.reason,
      message: savedMessageToTemplateSafeSavedMessage(data.message),
      messageText: disableCodeBlocks(
        deactivateMentions(data.censoredText ?? data.message.data.content ?? ""),
      ),
    }),
    {
      userId: data.user.id,
      bot: data.user instanceof User ? data.user.bot : false,
      ...resolveChannelIds(data.channel),
    },
  );
}
