import { GuildPluginData } from "vety";
import { ISavedMessageAttachmentData, SavedMessage } from "../../../data/entities/SavedMessage.js";
import { messageLink, messageSummary, summariseMessageLikeData, useMediaUrls } from "../../../utils.js";
import { TemplateSafeValueContainer } from "../../../templateFormatter.js";
import { savedMessageToTemplateSafeSavedMessage, TemplateSafeSavedMessage } from "../../../utils/templateSafeObjects.js";
import { LogsPluginType } from "../types.js";

export interface MessageReplyLogInfo {
  /** Raw URL to the original message (no formatting) */
  originalMessageLink: string;
  /** Forward/reply metadata for custom formatting */
  forwardLink: string;
  forwardTimestamp: string;
  forwardSummary: string;
  reply: TemplateSafeValueContainer | null;
}

/** Reference type: 0 = reply, 1 = forward */
const MESSAGE_REFERENCE_TYPE_FORWARD = 1;

export async function getMessageReplyLogInfo(
  pluginData: GuildPluginData<LogsPluginType>,
  message: SavedMessage,
): Promise<MessageReplyLogInfo> {
  const reference = message.data.reference;
  if (!reference?.messageId || !reference.channelId) {
    return { originalMessageLink: "", forwardLink: "", forwardTimestamp: "", forwardSummary: "", reply: null };
  }

  const isForward = reference.type === MESSAGE_REFERENCE_TYPE_FORWARD;
  const link = messageLink(reference.guildId ?? message.guild_id, reference.channelId, reference.messageId);
  let timestamp: string | null = null;
  let summary = "";
  let timestampMs: number | null = null;
  let templateSafeMessage: TemplateSafeSavedMessage | null = null;

  // For forwards, use the snapshot from the current message (we have it saved). Don't fetch the
  // referenced message—it may be in another guild.
  if (isForward && message.data.message_snapshots?.length) {
    const snapshot = message.data.message_snapshots[0]?.message;
    if (snapshot) {
      if (snapshot.timestamp) {
        timestampMs = snapshot.timestamp;
        timestamp = `<t:${Math.floor(timestampMs / 1000)}>`;
      }
      summary = summariseMessageLikeData(snapshot);
    }
  } else {
    const referencedMessage = await pluginData.state.savedMessages.find(reference.messageId, true);
    if (referencedMessage) {
      if (referencedMessage.data.attachments) {
        for (const attachment of referencedMessage.data.attachments as ISavedMessageAttachmentData[]) {
          attachment.url = useMediaUrls(attachment.url);
        }
      }

      timestampMs = referencedMessage.data.timestamp;
      timestamp = `<t:${Math.floor(timestampMs / 1000)}>`;
      summary = messageSummary(referencedMessage);
      templateSafeMessage = savedMessageToTemplateSafeSavedMessage(referencedMessage);
    }
  }

  const reply = new TemplateSafeValueContainer({
    link,
    timestamp,
    timestampMs,
    summary,
    message: templateSafeMessage,
  });

  return {
    originalMessageLink: link,
    forwardLink: isForward ? link : "",
    forwardTimestamp: isForward ? (timestamp ?? "") : "",
    forwardSummary: isForward ? summary : "",
    reply,
  };
}
