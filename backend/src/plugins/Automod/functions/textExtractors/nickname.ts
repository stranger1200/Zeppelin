import { SavedMessage } from "../../../../data/entities/SavedMessage.js";
import { ExtractContext, TextExtractor } from "./types.js";

export const nicknameExtractor: TextExtractor = {
  key: "match_nicknames",
  type: "nickname",
  extract(msg: SavedMessage, context: ExtractContext) {
    const { member } = context;
    if (!member?.nickname) return null;
    return member.nickname;
  },
};
