import { GuildTextBasedChannel, User } from "discord.js";
import { GuildPluginData } from "vety";
import moment from "moment-timezone";
import { LogType } from "../../../data/LogType.js";
import { ISavedMessageAttachmentData, SavedMessage } from "../../../data/entities/SavedMessage.js";
import { createTypedTemplateSafeValueContainer } from "../../../templateFormatter.js";
import { getCustomEmojiUrlsInMessage, messageSummary, UnknownUser, useMediaUrls } from "../../../utils.js";
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

  const poll = data.message.data.poll;
  const pollQuestion = poll?.question?.text ?? "";
  const maxEmoteLinks = config.max_emote_links ?? 10;
  const emoteLinkSeparator = config.emote_link_separator ?? "";
  const pollAnswerSeparator = config.poll_answer_separator ?? ", ";
  const pollAnswerFormat = config.poll_answer_format ?? "Answer {n}: `{text}`";
  const pollAnswerPrefix = config.poll_answer_prefix ?? ", ";

  const emoteUrls = getCustomEmojiUrlsInMessage(data.message).slice(0, maxEmoteLinks);
  const wrap = (url: string) => (url ? `<${url}>` : "");
  const emoteLinks = emoteUrls.map(wrap).join(emoteLinkSeparator);

  const pollAnswersArr = Array.from(poll?.answers ?? [], (a) => a?.text ?? "").filter((t) => t !== "");
  const pollAnswersJoined = pollAnswersArr
    .map((text, i) =>
      pollAnswerFormat.replace(/\{n\}/g, String(i + 1)).replace(/\{text\}/g, text),
    )
    .join(pollAnswerSeparator);
  const pollAnswersFormatted = pollAnswersArr.length ? pollAnswerPrefix + pollAnswersJoined : "";

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
      emoteLinks,
      pollAnswers: pollAnswersFormatted,
    }),
    {
      userId: data.user.id,
      messageTextContent: data.message.data.content,
      bot: data.user instanceof User ? data.user.bot : false,
      ...resolveChannelIds(data.channel),
    },
  );
}
