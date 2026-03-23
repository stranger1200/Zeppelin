import { Invite } from "discord.js";
import escapeStringRegexp from "escape-string-regexp";
import { GuildPluginData } from "vety";
import { allowTimeout } from "../../../RegExpRunner.js";
import { ZalgoRegex } from "../../../data/Zalgo.js";
import { ISavedMessageEmbedData, SavedMessage } from "../../../data/entities/SavedMessage.js";
import {
  getInviteCodesInString,
  getUrlsInString,
  inputPatternToRegExp,
  isGuildInvite,
  resolveInvite,
  resolveMember,
} from "../../../utils.js";
import type { CensorSource } from "../../Logs/logFunctions/logCensor.js";
import { CensorPluginType } from "../types.js";
import { censorMessage } from "./censorMessage.js";

type ManipulatedEmbedData = Partial<ISavedMessageEmbedData>;

interface ContentSource {
  text: string;
  source: CensorSource;
  label: string;
}

function buildContentSources(savedMessage: SavedMessage): ContentSource[] {
  const sources: ContentSource[] = [];

  let mainContent = savedMessage.data.content || "";
  if (savedMessage.data.attachments) mainContent += " " + JSON.stringify(savedMessage.data.attachments);
  if (savedMessage.data.embeds) {
    const embeds = (savedMessage.data.embeds as ManipulatedEmbedData[]).map((e) => structuredClone(e));
    for (const embed of embeds) {
      if (embed.type === "video") delete embed.description;
    }
    mainContent += " " + JSON.stringify(embeds);
  }
  sources.push({ text: mainContent, source: "message", label: "message" });

  if (savedMessage.data.message_snapshots?.length) {
    for (const snap of savedMessage.data.message_snapshots) {
      let snapText = "";
      const m = snap.message;
      if (m?.content) snapText += " " + m.content;
      if (m?.embeds?.length) snapText += " " + JSON.stringify(m.embeds);
      if (m?.attachments?.length) snapText += " " + JSON.stringify(m.attachments);
      if (snapText) sources.push({ text: snapText.trim(), source: "forward", label: "forward" });
    }
  }

  if (savedMessage.data.poll) {
    const p = savedMessage.data.poll;
    if (p.question?.text) {
      sources.push({ text: p.question.text, source: "poll", label: "poll question" });
    }
    for (let i = 0; i < (p.answers ?? []).length; i++) {
      const a = p.answers![i];
      if (a?.text) {
        sources.push({ text: a.text, source: "poll", label: `poll option ${i + 1}` });
      }
    }
  }

  return sources;
}

export async function applyFiltersToMsg(
  pluginData: GuildPluginData<CensorPluginType>,
  savedMessage: SavedMessage,
): Promise<boolean> {
  const member = await resolveMember(pluginData.client, pluginData.guild, savedMessage.user_id);
  const config = await pluginData.config.getMatchingConfig({ member, channelId: savedMessage.channel_id });
  const contentSources = buildContentSources(savedMessage);

  const findMatchingSource = (
    predicate: (text: string) => boolean,
  ): { source: ContentSource; index: number } | null => {
    for (let i = 0; i < contentSources.length; i++) {
      if (predicate(contentSources[i].text)) return { source: contentSources[i], index: i };
    }
    return null;
  };

  const censorWithSource = (reason: string, src: ContentSource) => {
    const censoredText = src.source === "forward" || src.source === "poll" ? src.text : undefined;
    censorMessage(pluginData, savedMessage, reason, src.source, censoredText);
  };

  // Filter zalgo
  if (config.filter_zalgo) {
    const match = findMatchingSource((text) => ZalgoRegex.test(text));
    if (match) {
      censorWithSource(`zalgo detected in ${match.source.label}`, match.source);
      return true;
    }
  }

  // Filter invites
  if (config.filter_invites) {
    const allText = contentSources.map((s) => s.text).join(" ");
    const inviteCodes = getInviteCodesInString(allText);
    const invites: Array<Invite | null> = await Promise.all(
      inviteCodes.map((code) => resolveInvite(pluginData.client, code)),
    );
    for (let i = 0; i < invites.length; i++) {
      const invite = invites[i];
      if (invite == null) {
        censorMessage(pluginData, savedMessage, `unknown invite not found in whitelist`);
        return true;
      }
      if (!isGuildInvite(invite) && !config.allow_group_dm_invites) {
        censorMessage(pluginData, savedMessage, `group dm invites are not allowed`);
        return true;
      }
      if (isGuildInvite(invite)) {
        if (config.invite_guild_whitelist && !config.invite_guild_whitelist.includes(invite.guild!.id)) {
          censorMessage(
            pluginData,
            savedMessage,
            `invite guild (**${invite.guild!.name}** \`${invite.guild!.id}\`) not found in whitelist`,
          );
          return true;
        }
        if (config.invite_guild_blacklist?.includes(invite.guild!.id)) {
          censorMessage(
            pluginData,
            savedMessage,
            `invite guild (**${invite.guild!.name}** \`${invite.guild!.id}\`) found in blacklist`,
          );
          return true;
        }
      }
      if (config.invite_code_whitelist && !config.invite_code_whitelist.includes(invite.code)) {
        censorMessage(pluginData, savedMessage, `invite code (\`${invite.code}\`) not found in whitelist`);
        return true;
      }
      if (config.invite_code_blacklist?.includes(invite.code)) {
        censorMessage(pluginData, savedMessage, `invite code (\`${invite.code}\`) found in blacklist`);
        return true;
      }
    }
  }

  // Filter domains
  if (config.filter_domains) {
    const allText = contentSources.map((s) => s.text).join(" ");
    const urls = getUrlsInString(allText);
    for (const thisUrl of urls) {
      if (config.domain_whitelist && !config.domain_whitelist.includes(thisUrl.hostname)) {
        censorMessage(pluginData, savedMessage, `domain (\`${thisUrl.hostname}\`) not found in whitelist`);
        return true;
      }
      if (config.domain_blacklist?.includes(thisUrl.hostname)) {
        censorMessage(pluginData, savedMessage, `domain (\`${thisUrl.hostname}\`) found in blacklist`);
        return true;
      }
    }
  }

  // Filter tokens
  for (const token of config.blocked_tokens ?? []) {
    const match = findMatchingSource((text) => text.toLowerCase().includes(token.toLowerCase()));
    if (match) {
      censorWithSource(`blocked token in ${match.source.label} (\`${token}\`) found`, match.source);
      return true;
    }
  }

  // Filter words
  for (const word of config.blocked_words ?? []) {
    const regex = new RegExp(`\\b${escapeStringRegexp(word)}\\b`, "i");
    const match = findMatchingSource((text) => regex.test(text));
    if (match) {
      censorWithSource(`blocked word in ${match.source.label} (\`${word}\`) found`, match.source);
      return true;
    }
  }

  // Filter regex
  for (const pattern of config.blocked_regex ?? []) {
    const regex = inputPatternToRegExp(pattern);
    for (const src of contentSources) {
      const matches = await pluginData.state.regexRunner.exec(regex, src.text).catch(allowTimeout);
      if (matches) {
        censorWithSource(`blocked regex in ${src.label} (\`${regex.source}\`) found`, src);
        return true;
      }
    }
    // Also test raw content for regexes that use ^ and $
    const rawContent = savedMessage.data.content || "";
    if (rawContent) {
      const matches = await pluginData.state.regexRunner.exec(regex, rawContent).catch(allowTimeout);
      if (matches) {
        censorWithSource(`blocked regex in message (\`${regex.source}\`) found`, {
          text: rawContent,
          source: "message",
          label: "message",
        });
        return true;
      }
    }
  }

  return false;
}
