import moment from "moment-timezone";
import { registerExpiringMute } from "../../../data/loops/expiringMutesLoop.js";
import { MuteTypes } from "../../../data/MuteTypes.js";
import { noop } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { clearMute } from "../functions/clearMute.js";
import { getTimeoutExpiryTime } from "../functions/getTimeoutExpiryTime.js";
import { mutesEvt } from "../types.js";

/**
 * Reapply active mutes on join
 */
export const ReapplyActiveMuteOnJoinEvt = mutesEvt({
  event: "guildMemberAdd",
  async listener({ pluginData, args: { member } }) {
    const mute = await pluginData.state.mutes.findExistingMuteForUserId(member.id);
    const logs = pluginData.getPlugin(LogsPlugin);
    if (!mute) {
      return;
    }

    // If the mute has already expired, clean it up and don't reapply it
    if (mute.expires_at && moment.utc(mute.expires_at).isBefore(moment.utc())) {
      await clearMute(pluginData, mute, member);
      return;
    }

    if (mute.type === MuteTypes.Role) {
      const muteRoleId = pluginData.config.get().mute_role;
      if (muteRoleId) {
        pluginData.getPlugin(RoleManagerPlugin).addPriorityRole(member.id, muteRoleId);
        // Re-register the expiry timer in case it was lost due to a bot restart while the user was offline
        registerExpiringMute(mute);
      }
    } else {
      if (!member.isCommunicationDisabled()) {
        const expiresAt = mute.expires_at ? moment.utc(mute.expires_at).valueOf() : null;
        const timeoutExpiresAt = getTimeoutExpiryTime(expiresAt);
        if (member.moderatable) {
          await member.disableCommunicationUntil(timeoutExpiresAt).catch(noop);
        } else {
          logs.logBotAlert({
            body: `Cannot mute user, specified user is not moderatable`,
          });
        }
      }
    }

    logs.logMemberMuteRejoin({
      member,
    });
  },
});
