import { ZeppelinPluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zCaseSnippetsConfig } from "./types.js";

export const caseSnippetsPluginDocs: ZeppelinPluginDocs = {
  type: "stable",
  configSchema: zCaseSnippetsConfig,

  prettyName: "Case Snippets",
  description: trimPluginDescription(`
    Allows moderators to define reusable text snippets for use in mod action reasons.
    Use \`{{snippet_name}}\` anywhere in a reason to insert the snippet's text inline.
  `),

  configurationGuide: trimPluginDescription(`
    ### Hardcoded snippets
    Snippets can be defined directly in the server config. These are read-only and cannot be modified or deleted via commands.

    \`\`\`yaml
    case_snippets:
      config:
        snippets:
          spam: "Spamming or flooding channels"
          advertising: "Unauthorised advertising or self-promotion"
    \`\`\`
  `),
};
