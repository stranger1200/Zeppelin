import { createChunkedMessage } from "../../../utils.js";
import { getConfigSnippets } from "../configSnippetsStore.js";
import { caseSnippetsCmd } from "../types.js";

export const SnippetsCmd = caseSnippetsCmd({
  trigger: "snippets",
  permission: "can_manage",

  signature: {},

  async run({ message: msg, pluginData }) {
    const configSnippets = getConfigSnippets(pluginData.guild.id);
    const configNames = Object.keys(configSnippets);

    const dbSnippets = await pluginData.state.snippets.all();
    const dbNames = dbSnippets.map((s) => s.name);

    const allNames = [...new Set([...configNames, ...dbNames])].sort();

    if (allNames.length === 0) {
      void pluginData.state.common.sendErrorMessage(msg, "No snippets have been configured");
      return;
    }

    const groups = allNames.reduce<Record<string, string[]>>((obj, name) => {
      const key = /[A-Z]/i.test(name[0]) ? name[0].toUpperCase() : "#";
      if (!(key in obj)) {
        obj[key] = [];
      }
      obj[key].push(name);
      return obj;
    }, {});

    const snippetList = Object.keys(groups)
      .sort()
      .map((key) => `[${key}] ${groups[key].join(", ")}`)
      .join("\n");

    createChunkedMessage(msg.channel, `Available snippets (use \`{{name}}\` in a case reason): \`\`\`${snippetList}\`\`\``);
  },
});
