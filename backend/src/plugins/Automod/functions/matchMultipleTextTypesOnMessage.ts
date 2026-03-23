import { GuildPluginData } from "vety";
import { SavedMessage } from "../../../data/entities/SavedMessage.js";
import { resolveMember } from "../../../utils.js";
import { AutomodPluginType } from "../types.js";
import { MatchableTextType, TEXT_EXTRACTORS, type TextSourceFlags } from "./textExtractors/index.js";

type TextTriggerWithMultipleMatchTypes = TextSourceFlags;

type YieldedContent = [MatchableTextType, string];

/**
 * Generator function that allows iterating through matchable pieces of text of a SavedMessage.
 * Uses a pluggable extractor registry so new text sources can be added without editing this file.
 */
export async function* matchMultipleTextTypesOnMessage(
  pluginData: GuildPluginData<AutomodPluginType>,
  trigger: TextTriggerWithMultipleMatchTypes,
  msg: SavedMessage,
): AsyncIterableIterator<YieldedContent> {
  const member = await resolveMember(pluginData.client, pluginData.guild, msg.user_id);
  if (!member) return;

  const context = { member, pluginData };

  for (const extractor of TEXT_EXTRACTORS) {
    const enabled = trigger[extractor.key];
    if (!enabled) continue;

    const result = extractor.extract(msg, context);
    if (result === null) continue;

    const strings = Array.isArray(result) ? result : [result];
    for (const str of strings) {
      yield [extractor.type, str];
    }
  }
}

export type { MatchableTextType };
