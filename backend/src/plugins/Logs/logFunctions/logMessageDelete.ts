import { GuildTextBasedChannel, User } from "discord.js";
import { GuildPluginData } from "vety";
import moment from "moment-timezone";
import { LogType } from "../../../data/LogType.js";
import { ISavedMessageAttachmentData, SavedMessage } from "../../../data/entities/SavedMessage.js";
import { createTypedTemplateSafeValueContainer } from "../../../templateFormatter.js";
import { messageSummary, UnknownUser, useMediaUrls } from "../../../utils.js";
import { resolveChannelIds } from "../../../utils/resolveChannelIds.js";
import {
  channelToTemplateSafeChannel,
  savedMessageToTemplateSafeSavedMessage,
  userToTemplateSafeUser,
} from "../../../utils/templateSafeObjects.js";
import { TimeAndDatePlugin } from "../../TimeAndDate/TimeAndDatePlugin.js";
import { LogsPluginType } from "../types.js";
import { log } from "../util/log.js";
import { getMessageDeleteLogType } from "../util/getMessageDeleteLogType.js";
import { getMessageReplyLogInfo } from "../util/getMessageReplyLogInfo.js";

export interface LogMessageDeleteData {
  user: User | UnknownUser;
  channel: GuildTextBasedChannel;
  message: SavedMessage;
  logType?: "MESSAGE_DELETE" | "MESSAGE_DELETE_POLL" | "MESSAGE_DELETE_FORWARD";
}

export async function logMessageDelete(pluginData: GuildPluginData<LogsPluginType>, data: LogMessageDeleteData) {
  // Replace attachment URLs with media URLs
  if (data.message.data.attachments) {
    for (const attachment of data.message.data.attachments as ISavedMessageAttachmentData[]) {
      attachment.url = useMediaUrls(attachment.url);
    }
  }

  // See comment on FORMAT_NO_TIMESTAMP in types.ts
  const config = pluginData.config.get();
  const timestampFormat = config.timestamp_format ?? undefined;

  const { originalMessageLink, forwardLink, forwardTimestamp, forwardSummary, reply } =
    await getMessageReplyLogInfo(pluginData, data.message);
  const logType = data.logType ?? getMessageDeleteLogType(data.message);

  // Extract poll data for conditional display (pollAnswer1-10; use if() to hide null/empty)
  const poll = data.message.data.poll;
  const pollAnswers = poll?.answers ?? [];
  const pollQuestion = poll?.question?.text ?? "";
  const pollAnswer1 = pollAnswers[0]?.text ?? "";
  const pollAnswer2 = pollAnswers[1]?.text ?? "";
  const pollAnswer3 = pollAnswers[2]?.text ?? "";
  const pollAnswer4 = pollAnswers[3]?.text ?? "";
  const pollAnswer5 = pollAnswers[4]?.text ?? "";
  const pollAnswer6 = pollAnswers[5]?.text ?? "";
  const pollAnswer7 = pollAnswers[6]?.text ?? "";
  const pollAnswer8 = pollAnswers[7]?.text ?? "";
  const pollAnswer9 = pollAnswers[8]?.text ?? "";
  const pollAnswer10 = pollAnswers[9]?.text ?? "";

  return log(
    pluginData,
    logType,
    createTypedTemplateSafeValueContainer({
      user: userToTemplateSafeUser(data.user),
      channel: channelToTemplateSafeChannel(data.channel),
      message: savedMessageToTemplateSafeSavedMessage(data.message),
      messageSummaryText: messageSummary(data.message),
      messageDate: pluginData
        .getPlugin(TimeAndDatePlugin)
        .inGuildTz(moment.utc(data.message.data.timestamp, "x"))
        .format(timestampFormat),
      originalMessageLink,
      forwardLink,
      forwardTimestamp,
      forwardSummary,
      reply,
      pollQuestion,
      pollAnswer1,
      pollAnswer2,
      pollAnswer3,
      pollAnswer4,
      pollAnswer5,
      pollAnswer6,
      pollAnswer7,
      pollAnswer8,
      pollAnswer9,
      pollAnswer10,
    }),
    {
      userId: data.user.id,
      messageTextContent: data.message.data.content,
      bot: data.user instanceof User ? data.user.bot : false,
      ...resolveChannelIds(data.channel),
    },
  );
}
