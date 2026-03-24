import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { getConfigSnippets } from "../configSnippetsStore.js";
import { caseSnippetsCmd } from "../types.js";

export const SnippetCreateCmd = caseSnippetsCmd({
  trigger: "snippet",
  permission: "can_manage",

  signature: {
    name: ct.string(),
    text: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const name = args.name.toLowerCase();

    if (!/^[a-z0-9_-]+$/.test(name)) {
      void pluginData.state.common.sendErrorMessage(
        msg,
        "Snippet name may only contain letters, numbers, underscores, and hyphens",
      );
      return;
    }

    if (name.length > 100) {
      void pluginData.state.common.sendErrorMessage(msg, "Snippet name must be 100 characters or fewer");
      return;
    }

    const configSnippets = getConfigSnippets(pluginData.guild.id);
    if (Object.hasOwn(configSnippets, name)) {
      void pluginData.state.common.sendErrorMessage(
        msg,
        `\`${name}\` is a config-defined snippet and cannot be overridden via command`,
      );
      return;
    }

    await pluginData.state.snippets.set(name, args.text);
    void pluginData.state.common.sendSuccessMessage(msg, `Snippet \`${name}\` saved`);
  },
});
