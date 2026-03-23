import { SavedMessage } from "../../../../data/entities/SavedMessage.js";
import { ExtractContext, TextExtractor } from "./types.js";

export const messageContentExtractor: TextExtractor = {
  key: "match_messages",
  type: "message",
  extract(msg: SavedMessage, _context: ExtractContext) {
    return msg.data.content || null;
  },
};
