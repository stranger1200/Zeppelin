/**
 * In-memory store of config-defined snippets per guild.
 * Populated when CaseSnippetsPlugin loads and cleared when it unloads.
 * Allows resolveCaseSnippets to check config snippets without needing a plugin reference.
 */
const store = new Map<string, Record<string, string>>();

export function setConfigSnippets(guildId: string, snippets: Record<string, string>): void {
  store.set(guildId, snippets);
}

export function getConfigSnippets(guildId: string): Record<string, string> {
  return store.get(guildId) ?? {};
}

export function clearConfigSnippets(guildId: string): void {
  store.delete(guildId);
}
