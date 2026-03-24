import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { CaseSnippet } from "./entities/CaseSnippet.js";

export class GuildCaseSnippets extends BaseGuildRepository {
  private snippets: Repository<CaseSnippet>;

  constructor(guildId: string) {
    super(guildId);
    this.snippets = dataSource.getRepository(CaseSnippet);
  }

  async all(): Promise<CaseSnippet[]> {
    return this.snippets.find({
      where: { guild_id: this.guildId },
      order: { name: "ASC" },
    });
  }

  async get(name: string): Promise<CaseSnippet | null> {
    return this.snippets.findOne({
      where: { guild_id: this.guildId, name },
    });
  }

  async set(name: string, text: string): Promise<void> {
    const existing = await this.get(name);
    if (existing) {
      await this.snippets.update({ guild_id: this.guildId, name }, { text });
    } else {
      await this.snippets.insert({ guild_id: this.guildId, name, text });
    }
  }

  async delete(name: string): Promise<void> {
    await this.snippets.delete({ guild_id: this.guildId, name });
  }
}
