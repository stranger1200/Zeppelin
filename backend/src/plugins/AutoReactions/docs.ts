import { ZeppelinPluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zAutoReactionsConfig } from "./types.js";

export const autoReactionsPluginDocs: ZeppelinPluginDocs = {
  type: "stable",
  configSchema: zAutoReactionsConfig,

  prettyName: "Auto-reactions",
  description: trimPluginDescription(`
    Allows setting up automatic reactions to all new messages on a channel.
    When set on a text channel, reactions apply to that channel and its threads.
    When set on a forum channel, reactions apply only to the first message of each new post (thread); replies in threads are not reacted to.
    Thread-specific config overrides the parent: set auto-reactions on a thread to use different (or no) reactions than the parent.
  `),
};
