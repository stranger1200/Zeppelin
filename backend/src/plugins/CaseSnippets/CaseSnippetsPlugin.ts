import { PluginOverride, guildPlugin } from "vety";
import { GuildCaseSnippets } from "../../data/GuildCaseSnippets.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { SnippetCreateCmd } from "./commands/SnippetCreateCmd.js";
import { SnippetSourceCmd } from "./commands/SnippetSourceCmd.js";
import { SnippetsCmd } from "./commands/SnippetsCmd.js";
import { clearConfigSnippets, setConfigSnippets } from "./configSnippetsStore.js";
import { CaseSnippetsPluginType, zCaseSnippetsConfig } from "./types.js";

const defaultOverrides: Array<PluginOverride<CaseSnippetsPluginType>> = [
  {
    level: ">=100",
    config: {
      can_manage: true,
    },
  },
];

export const CaseSnippetsPlugin = guildPlugin<CaseSnippetsPluginType>()({
  name: "case_snippets",

  configSchema: zCaseSnippetsConfig,
  defaultOverrides,

  messageCommands: [
    SnippetSourceCmd,
    SnippetCreateCmd,
    SnippetsCmd,
  ],

  beforeLoad(pluginData) {
    pluginData.state.snippets = GuildCaseSnippets.getGuildInstance(pluginData.guild.id);
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },

  afterLoad(pluginData) {
    const config = pluginData.config.get();
    setConfigSnippets(pluginData.guild.id, config.snippets);
  },

  beforeUnload(pluginData) {
    clearConfigSnippets(pluginData.guild.id);
  },
});
