import { LogType } from "../../../data/LogType.js";
import { SavedMessage } from "../../../data/entities/SavedMessage.js";

/** All message delete log types (for bulk ignore when message type is unknown). */
export const MESSAGE_DELETE_LOG_TYPES = [
  LogType.MESSAGE_DELETE,
  LogType.MESSAGE_DELETE_POLL,
  LogType.MESSAGE_DELETE_FORWARD,
] as const;

/** Returns the appropriate message delete log type based on the message content (poll, forward, or regular). */
export function getMessageDeleteLogType(message: SavedMessage): "MESSAGE_DELETE" | "MESSAGE_DELETE_POLL" | "MESSAGE_DELETE_FORWARD" {
  if (message.data.poll) return LogType.MESSAGE_DELETE_POLL;
  if (message.data.message_snapshots?.length) return LogType.MESSAGE_DELETE_FORWARD;
  return LogType.MESSAGE_DELETE;
}
