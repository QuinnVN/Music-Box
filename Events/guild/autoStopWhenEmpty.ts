import { Events, VoiceState } from "discord.js";
import Event from "../../module/structures/Events.js";
import MusicBoxClient from "../../MusicBox.js";

async function autoStopWhenEmpty(oldState: VoiceState, newState: VoiceState) {
    const MusicBox = oldState.client as MusicBoxClient;
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;
    //Leave the channel
    if (oldChannel && !newChannel) {
        if (!(oldChannel.members.filter((member) => !member.user.bot).size < 1)) return;
        const player = MusicBox.musicManager.players.get(oldChannel.guild.id);
        if (!player) return;
        if (oldChannel.id !== player.voiceChannel) return;
        try {
            player.queue.clear();
            player.stop();
        } catch {}
    }
    // Switch channel
    if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
        if (!(oldChannel.members.filter((member) => !member.user.bot).size < 1)) return;
        const player = MusicBox.musicManager.players.get(oldChannel.guild.id);
        if (!player) return;
        if (oldChannel.id !== player.voiceChannel) return;
        try {
            player.queue.clear();
            player.stop();
            
        } catch {}
    }
}

export default new Event({
    name: Events.VoiceStateUpdate,
    run: autoStopWhenEmpty,
});
