import { SavedMessage } from "../../../../data/entities/SavedMessage.js";
import { ExtractContext, TextExtractor } from "./types.js";

export const visibleNameExtractor: TextExtractor = {
  key: "match_visible_names",
  type: "visiblename",
  extract(msg: SavedMessage, context: ExtractContext) {
    const { member } = context;
    if (!member) return null;
    return member.displayName || msg.data.author.username;
  },
};
