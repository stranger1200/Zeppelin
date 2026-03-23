import type { TextExtractor, TextSourceFlags } from "./types.js";
import { customStatusExtractor } from "./customStatus.js";
import { embedExtractor } from "./embed.js";
import { messageContentExtractor } from "./messageContent.js";
import { nicknameExtractor } from "./nickname.js";
import { usernameExtractor } from "./username.js";
import { visibleNameExtractor } from "./visibleName.js";

export * from "./types.js";

/**
 * Registry of text extractors. Add new extractors here to support additional
 * text sources (e.g. polls, forwarded messages) without modifying the core matcher.
 */
export const TEXT_EXTRACTORS: TextExtractor[] = [
  messageContentExtractor,
  embedExtractor,
  visibleNameExtractor,
  usernameExtractor,
  nicknameExtractor,
  customStatusExtractor,
];
