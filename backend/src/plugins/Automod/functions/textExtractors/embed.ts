import { Embed } from "discord.js";
import { SavedMessage } from "../../../../data/entities/SavedMessage.js";
import { DeepMutable } from "../../../../utils/typeUtils.js";
import { ExtractContext, TextExtractor } from "./types.js";

export const embedExtractor: TextExtractor = {
  key: "match_embeds",
  type: "embed",
  extract(msg: SavedMessage, _context: ExtractContext) {
    if (!msg.data.embeds?.length) return null;
    const copiedEmbed: DeepMutable<Embed> = JSON.parse(JSON.stringify(msg.data.embeds[0]));
    if (copiedEmbed.video) {
      copiedEmbed.description = ""; // The description is not rendered, hence it doesn't need to be matched
    }
    return JSON.stringify(copiedEmbed);
  },
};
