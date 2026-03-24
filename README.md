![Zeppelin Banner](assets/zepbanner.png)
# Zeppelin
Zeppelin is a moderation bot for Discord, designed with large servers and reliability in mind.

## Fork Changes

This is a personal fork of Zeppelin with the following changes and fixes applied on top of the upstream codebase:

### New Features
- **Auto Reactions — all channel types**: Auto reactions now support forum channels and threads, not just text channels. Reactions on a forum channel apply to the first message of each new post. Threads can also have their own auto reaction config, which overrides the parent forum behaviour and reacts to all messages in that thread.
- **Case Snippets**: A new `case_snippets` plugin that allows custom text snippets to be used in mod action reasons via `{{snippet_name}}` placeholders. Snippets can be defined in config (hardcoded, non-deletable) or managed per-server via commands (`!!snippet`, `!!snippets`). A confirmation prompt is shown if an unrecognised snippet is used.

### Bug Fixes
- **Mutes — `@everyone` role assigned on expiry**: After a mute expired, the bot would attempt to restore the `@everyone` role (whose ID equals the guild ID) as a regular role, causing a BOT ALERT. The `@everyone` role is now excluded when storing and restoring roles on mute/unmute.
- **Mutes — sticky mute role after leaving with an expired mute**: If a user left the server while muted and rejoined after their mute duration had elapsed, the mute role was incorrectly reapplied. The bot now checks whether the mute has already expired on rejoin and cleans it up rather than reapplying it.
- **Mutes — mute role not applied after user rejoins within 15 minutes**: A `resolveMember` cache (`unknownMembers`) was preventing the bot from finding a member for up to 15 minutes after they had been seen offline. This caused mute role assignments and DM notifications to silently fail for recently rejoined users. The cache is now bypassed when a fresh lookup is explicitly requested.
- **Role assignment loop — silent batch drop**: If any member in a role assignment batch could not be fetched, the entire remaining batch was silently dropped. The loop now skips the unfetchable member and continues processing the rest of the batch.

**Main features include:**
- Extensive automoderator features (automod)
  - Word filters, spam detection, etc.
- Detailed moderator action tracking and notes (cases)
- Customizable server logs
- Tags/custom commands
- Reaction roles
- Tons of utility commands, including a granular member search
- Full configuration via a web dashboard
  - Override specific settings and permissions on e.g. a per-user, per-channel, or per-permission-level basis
- Bot-managed slowmodes
  - Automatically switches between native slowmodes (for 6h or less) and bot-enforced (for longer slowmodes)
- Starboard
- And more!

See https://zeppelin.gg/ for more details.

## Usage documentation
For information on how to use the bot, see https://zeppelin.gg/docs

## Development
See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for instructions on running the development environment.

Once you have the environment up and running, see [docs/MANAGEMENT.md](docs/MANAGEMENT.md) for how to manage your bot.

## Production
See [docs/PRODUCTION.md](docs/PRODUCTION.md) for instructions on how to run the bot in production.

Once you have the environment up and running, see [docs/MANAGEMENT.md](docs/MANAGEMENT.md) for how to manage your bot.
