import { Events, VoiceState } from "discord.js";
import Event from "../../module/types/Events.js";
import MusicBoxClient from "../../MusicBox.js";

async function autoStopWhenEmpty(oldState: VoiceState, newState: VoiceState) {
    const MusicBox = oldState.client as MusicBoxClient;
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;
    //Leave the channel
    if (oldChannel && !newChannel) {
        const player = MusicBox.musicManager.players.get(oldChannel.guild.id);
        if (!player) return;
        try {
            player.queue.clear();
            player.skip();
            player.destroy();
        } catch {}
    }
    // Switch channel
    if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
        const player = MusicBox.musicManager.players.get(oldChannel.guild.id);
        if (!player) return;
        if (player.voiceId !== oldChannel.id) return;
        try {
            player.queue.clear();
            player.destroy();
        } catch {}
    }
}

export default new Event({
    name: Events.VoiceStateUpdate,
    run: autoStopWhenEmpty,
});
