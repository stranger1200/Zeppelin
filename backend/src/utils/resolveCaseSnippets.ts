import { getConfigSnippets } from "../plugins/CaseSnippets/configSnippetsStore.js";
import { GuildCaseSnippets } from "../data/GuildCaseSnippets.js";

const SNIPPET_PATTERN = /\{\{([a-z0-9_-]+)\}\}/gi;

/**
 * Replaces all {{snippet_name}} placeholders in the given text with their stored values
 * for the specified guild.
 * Config-defined snippets (set in the server YAML) take priority over DB snippets.
 * Placeholders with no matching snippet are left unchanged.
 */
export async function resolveCaseSnippets(guildId: string, text: string): Promise<string> {
  if (!text || !text.includes("{{")) {
    return text;
  }

  const names = new Set<string>();
  for (const match of text.matchAll(SNIPPET_PATTERN)) {
    names.add(match[1].toLowerCase());
  }

  if (names.size === 0) {
    return text;
  }

  const configSnippets = getConfigSnippets(guildId);
  const snippetRepo = GuildCaseSnippets.getGuildInstance(guildId);
  const snippetMap = new Map<string, string>();

  for (const name of names) {
    if (Object.hasOwn(configSnippets, name)) {
      snippetMap.set(name, configSnippets[name]);
    } else {
      const dbSnippet = await snippetRepo.get(name);
      if (dbSnippet) {
        snippetMap.set(name, dbSnippet.text);
      }
    }
  }

  return text.replace(SNIPPET_PATTERN, (_, name: string) => snippetMap.get(name.toLowerCase()) ?? `{{${name}}}`);
}
