import { ChatInputCommandInteraction, Message } from "discord.js";
import { resolveCaseSnippets } from "./resolveCaseSnippets.js";
import { waitForButtonConfirm } from "./waitForInteraction.js";

const SNIPPET_PATTERN = /\{\{([a-z0-9_-]+)\}\}/gi;

/**
 * If the reason contains {{name}} placeholders that don't resolve to a known snippet,
 * prompts the moderator with a confirmation button before continuing.
 * Returns true if the action should proceed, false if the moderator cancelled.
 */
export async function confirmUnresolvedSnippets(
  guildId: string,
  reason: string | null | undefined,
  context: Message | ChatInputCommandInteraction,
  authorId: string,
): Promise<boolean> {
  if (!reason || !reason.includes("{{")) {
    return true;
  }

  const resolved = await resolveCaseSnippets(guildId, reason);
  const unresolved = [...resolved.matchAll(SNIPPET_PATTERN)].map((m) => m[1]);

  if (unresolved.length === 0) {
    return true;
  }

  const snippetList = unresolved.map((n) => `\`{{${n}}}\``).join(", ");
  const label = unresolved.length === 1 ? "Snippet" : "Snippets";

  return waitForButtonConfirm(
    context,
    { content: `${label} not found: ${snippetList}. Continue anyway?` },
    { confirmText: "✓", cancelText: "✗", restrictToId: authorId },
  );
}
