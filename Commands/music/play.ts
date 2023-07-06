import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import Command from "../../module/types/Command.js";
import MusicBoxClient from "../../MusicBox.js";
import { BaseErrors, MusicErrors } from "../../module/errors/index.js";
import { KazagumoTrack } from "kazagumo";
async function playCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const MusicBox = interaction.client as MusicBoxClient;

    await interaction.deferReply();

    const vc = (await interaction.guild?.members.fetch(interaction.user.id))?.voice.channel;
    if (!vc) throw new MusicErrors.NotInVoice();
    const req = interaction.options.getString("prompt");
    if (!req) throw new BaseErrors.UserInputError("You must to select a song name");

    let player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (player) {
        if (player.voiceId !== vc.id) throw new MusicErrors.NotInCurrentVoice();

        const res = await player.search(req, { requester: interaction.user });
        if (!res.tracks.length) throw new MusicErrors.TrackNotFound();
        if (res.type === "PLAYLIST")
            for (const track of res.tracks)
                player.queue.add(new KazagumoTrack(track.getRaw(), track.author));
        else player.queue.add(new KazagumoTrack(res.tracks[0].getRaw(), res.tracks[0].author));

        if (!player.playing && !player.paused) player.play();
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Purple")
                    .setDescription(
                        res.type === "PLAYLIST"
                            ? `Added **${res.tracks.length} tracks** from **${res.playlistName}** to the queue`
                            : `Added **${res.tracks[0].title}** to the queue`
                    ),
            ],
        });
    } else {
        const res = await MusicBox.musicManager.search(req, { requester: interaction.user });
        if (!res.tracks.length) throw new MusicErrors.TrackNotFound();

        player = await MusicBox.musicManager.createPlayer({
            guildId: interaction.guild.id,
            textId: interaction.channelId,
            voiceId: vc.id,
            volume: 40,
            deaf: true,
        });

        if (res.type === "PLAYLIST")
            for (const track of res.tracks)
                player.queue.add(new KazagumoTrack(track.getRaw(), track.author));
        else player.queue.add(new KazagumoTrack(res.tracks[0].getRaw(), res.tracks[0].author));

        if (!player.playing && !player.paused) player.play();
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Purple")
                    .setDescription(
                        res.type === "PLAYLIST"
                            ? `Added **${res.tracks.length} tracks** from **${res.playlistName}** to the queue`
                            : `Added **${res.tracks[0].title}** to the queue`
                    ),
            ],
        });
    }
}
async function autocompletePlayCommand(
    interaction: AutocompleteInteraction,
    client: MusicBoxClient
) {
    const focused = interaction.options.getFocused();

    try {
        const res = await client.musicManager.search(focused);
        const tracks = res.tracks.slice(0, 10).map((track) => ({
            name: track.title.length > 100 ? track.title.slice(0, 96) + "..." : track.title,
            value: track.title.length > 100 ? track.title.slice(0, 96) + "..." : track.title,
        }));

        await interaction.respond(tracks);
    } catch {}
}
export default new Command({
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Search and play music")
        .addStringOption((options) =>
            options
                .setName("prompt")
                .setDescription("Name of the song")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    autocomplete: autocompletePlayCommand,
    run: playCommand,
});
