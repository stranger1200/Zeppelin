import { SavedMessage } from "../../../../data/entities/SavedMessage.js";
import { renderUsername } from "../../../../utils.js";
import { ExtractContext, TextExtractor } from "./types.js";

export const usernameExtractor: TextExtractor = {
  key: "match_usernames",
  type: "username",
  extract(msg: SavedMessage, _context: ExtractContext) {
    return renderUsername(msg.data.author.username, msg.data.author.discriminator);
  },
};
