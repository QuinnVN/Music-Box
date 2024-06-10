import { Events, VoiceState } from "discord.js";
import { Player } from "erela.js";
import MusicBoxClient from "../../MusicBox.js";
import Event from "../../module/structures/Event.js";

async function autoStopWhenEmpty(oldState: VoiceState, newState: VoiceState) {
  const MusicBox = oldState.client as MusicBoxClient;
  const oldChannel = oldState.channel;
  const newChannel = newState.channel;
  //Leave the channel
  if (oldChannel && !newChannel) {
    const player = MusicBox.musicManager.players.get(oldChannel.guild.id);
    if (!player) return;
    if (oldState.member?.user.id === MusicBox.user?.id) {
      player.destroy(true);
    }

    if (!(oldChannel.members.filter((member) => !member.user.bot).size < 1))
      return;
    if (oldChannel.id !== player.voiceChannel) return;
    try {
      player.destroy(true);
    } catch {}
  }
  // Switch channel
  if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
    if (!(oldChannel.members.filter((member) => !member.user.bot).size < 1))
      return;
    const player = MusicBox.musicManager.players.get(oldChannel.guild.id);
    if (!player) return;
    if (oldChannel.id !== player.voiceChannel) return;
    try {
      player.destroy(true);
    } catch {}
  }
}

export default new Event({
  name: Events.VoiceStateUpdate,
  run: autoStopWhenEmpty,
});
