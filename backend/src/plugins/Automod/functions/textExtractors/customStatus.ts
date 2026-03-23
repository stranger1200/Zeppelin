import { ActivityType } from "discord.js";
import { SavedMessage } from "../../../../data/entities/SavedMessage.js";
import { ExtractContext, TextExtractor } from "./types.js";

export const customStatusExtractor: TextExtractor = {
  key: "match_custom_status",
  type: "customstatus",
  extract(msg: SavedMessage, context: ExtractContext) {
    const { member } = context;
    const activity = member?.presence?.activities?.find((a) => a.type === ActivityType.Custom);
    if (!activity) return null;
    return `${activity.emoji} ${activity.name}`;
  },
};
