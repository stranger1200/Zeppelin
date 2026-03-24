import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { getConfigSnippets } from "../configSnippetsStore.js";
import { caseSnippetsCmd } from "../types.js";

export const SnippetSourceCmd = caseSnippetsCmd({
  trigger: "snippet",
  permission: "can_manage",

  signature: {
    name: ct.string(),
    d: ct.bool({ option: true, isSwitch: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const name = args.name.toLowerCase();

    if (args.d) {
      const configSnippets = getConfigSnippets(pluginData.guild.id);
      if (Object.hasOwn(configSnippets, name)) {
        void pluginData.state.common.sendErrorMessage(
          msg,
          `\`${name}\` is a config-defined snippet and cannot be removed via command`,
        );
        return;
      }

      const existing = await pluginData.state.snippets.get(name);
      if (!existing) {
        void pluginData.state.common.sendErrorMessage(msg, `No snippet named \`${name}\` exists`);
        return;
      }

      await pluginData.state.snippets.delete(name);
      void pluginData.state.common.sendSuccessMessage(msg, `Snippet \`${name}\` deleted`);
      return;
    }

    const configSnippets = getConfigSnippets(pluginData.guild.id);
    const configText = configSnippets[name];
    if (configText !== undefined) {
      void msg.channel.send(`Snippet source:\n\`\`\`${configText}\`\`\``);
      return;
    }

    const existing = await pluginData.state.snippets.get(name);
    if (existing) {
      void msg.channel.send(`Snippet source:\n\`\`\`${existing.text}\`\`\``);
      return;
    }

    void pluginData.state.common.sendErrorMessage(msg, `No snippet named \`${name}\` exists`);
  },
});
