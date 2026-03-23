import { LogType } from "../../../data/LogType.js";
import { SavedMessage } from "../../../data/entities/SavedMessage.js";

/** All message delete log types (for bulk ignore when message type is unknown). */
export const MESSAGE_DELETE_LOG_TYPES = [
  LogType.MESSAGE_DELETE,
  LogType.MESSAGE_DELETE_POLL,
  LogType.MESSAGE_DELETE_STICKER,
] as const;

/** Returns the appropriate message delete log type based on the message content (poll, sticker, or regular). Forwards use the same types based on top-level or snapshot content. */
export function getMessageDeleteLogType(
  message: SavedMessage,
): "MESSAGE_DELETE" | "MESSAGE_DELETE_POLL" | "MESSAGE_DELETE_STICKER" {
  const snapshot = message.data.message_snapshots?.[0]?.message as
    | { poll?: unknown; stickers?: unknown[] }
    | undefined;

  if (message.data.poll || snapshot?.poll) return LogType.MESSAGE_DELETE_POLL;
  if (message.data.stickers?.length || snapshot?.stickers?.length) return LogType.MESSAGE_DELETE_STICKER;
  return LogType.MESSAGE_DELETE;
}
