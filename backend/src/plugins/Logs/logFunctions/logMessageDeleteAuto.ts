import { GuildBasedChannel, User } from "discord.js";
import { GuildPluginData } from "vety";
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
import { LogsPluginType } from "../types.js";
import { log } from "../util/log.js";
import { getMessageReplyLogInfo } from "../util/getMessageReplyLogInfo.js";

export interface LogMessageDeleteAutoData {
  message: SavedMessage;
  user: User | UnknownUser;
  channel: GuildBasedChannel;
  messageDate: string;
}

export async function logMessageDeleteAuto(pluginData: GuildPluginData<LogsPluginType>, data: LogMessageDeleteAutoData) {
  if (data.message.data.attachments) {
    for (const attachment of data.message.data.attachments as ISavedMessageAttachmentData[]) {
      attachment.url = useMediaUrls(attachment.url);
    }
  }

  const { originalMessageLink, forwardLink, forwardTimestamp, forwardSummary, reply } =
    await getMessageReplyLogInfo(pluginData, data.message);

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
    LogType.MESSAGE_DELETE_AUTO,
    createTypedTemplateSafeValueContainer({
      message: savedMessageToTemplateSafeSavedMessage(data.message),
      messageSummaryText: messageSummary(data.message),
      user: userToTemplateSafeUser(data.user),
      channel: channelToTemplateSafeChannel(data.channel),
      messageDate: data.messageDate,
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
      bot: data.user instanceof User ? data.user.bot : false,
      ...resolveChannelIds(data.channel),
    },
  );
}
