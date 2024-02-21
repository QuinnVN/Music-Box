import { Events, VoiceState } from "discord.js";
import { Player } from "erela.js";
import MusicBoxClient from "../../MusicBox.js";
import Event from "../../module/structures/Events.js";

function fullStop(player: Player): void {
  player.queue.clear();
  player.stop();
}

async function autoStopWhenEmpty(oldState: VoiceState, newState: VoiceState) {
  const MusicBox = oldState.client as MusicBoxClient;
  const oldChannel = oldState.channel;
  const newChannel = newState.channel;
  //Leave the channel
  if (oldChannel && !newChannel) {
    const player = MusicBox.musicManager.players.get(oldChannel.guild.id);
    if (!player) return;
    if (oldState.member?.user.id === MusicBox.user?.id) {
      fullStop(player);
    }

    if (!(oldChannel.members.filter((member) => !member.user.bot).size < 1))
      return;
    if (oldChannel.id !== player.voiceChannel) return;
    try {
      fullStop(player);
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
      fullStop(player);
    } catch {}
  }
}

export default new Event({
  name: Events.VoiceStateUpdate,
  run: autoStopWhenEmpty,
});
