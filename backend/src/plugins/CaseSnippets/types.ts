import { BasePluginType, guildPluginMessageCommand, pluginUtils } from "vety";
import { z } from "zod";
import { GuildCaseSnippets } from "../../data/GuildCaseSnippets.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zCaseSnippetsConfig = z.strictObject({
  can_manage: z.boolean().default(false),
  // Hardcoded snippets defined in the server config. These cannot be created or deleted via commands.
  snippets: z.record(z.string(), z.string()).default({}),
});

export interface CaseSnippetsPluginType extends BasePluginType {
  configSchema: typeof zCaseSnippetsConfig;
  state: {
    snippets: GuildCaseSnippets;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
  };
}

export const caseSnippetsCmd = guildPluginMessageCommand<CaseSnippetsPluginType>();
