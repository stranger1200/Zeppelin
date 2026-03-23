import { GuildMember } from "discord.js";
import { GuildPluginData } from "vety";
import { SavedMessage } from "../../../../data/entities/SavedMessage.js";
import { AutomodPluginType } from "../../types.js";

export type MatchableTextType =
  | "message"
  | "embed"
  | "visiblename"
  | "username"
  | "nickname"
  | "customstatus";

export type TextSourceFlags = {
  match_messages: boolean;
  match_embeds: boolean;
  match_visible_names: boolean;
  match_usernames: boolean;
  match_nicknames: boolean;
  match_custom_status: boolean;
};

export interface ExtractContext {
  member: GuildMember | null;
  pluginData: GuildPluginData<AutomodPluginType>;
}

export interface TextExtractor {
  key: keyof TextSourceFlags;
  type: MatchableTextType;
  extract(msg: SavedMessage, context: ExtractContext): string | string[] | null;
}
