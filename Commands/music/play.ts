import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import Command from "../../module/structures/Command.js";
import MusicBoxClient from "../../MusicBox.js";
import { BaseErrors, GuildErrors, MusicErrors } from "../../module/errors/index.js";
import config from "../../config.js";
async function playCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) throw new GuildErrors.NotInGuild();

    const MusicBox = interaction.client as MusicBoxClient;

    await interaction.deferReply();

    const vc = (await interaction.guild?.members.fetch(interaction.user.id))?.voice.channel;
    if (!vc) throw new MusicErrors.NotInVoice();
    const req = interaction.options.getString("prompt");
    if (!req) throw new BaseErrors.UserInputError("You must to select a song name");

    let player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (player) {
        if (player.voiceChannel !== vc.id) throw new MusicErrors.NotInCurrentVoice();

        const res = await player.search(req, interaction.user.id);
        if (!res.tracks.length || res.tracks[0] === null) throw new MusicErrors.TrackNotFound();
        if (res.loadType === "PLAYLIST_LOADED")
            for (const track of res.tracks) player.queue.add(track);
        else player.queue.add(res.tracks[0]);

        if (!player.playing && !player.paused) player.play();
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(config.pallete.default)
                    .setDescription(
                        res.loadType === "PLAYLIST_LOADED"
                            ? `Added **${res.tracks.length} tracks** from **${
                                  res.playlist?.name || "Unknown Playlist"
                              }** to the queue`
                            : `Added **${res.tracks[0].title}** to the queue`
                    ),
            ],
        });
    } else {
        const res = await MusicBox.musicManager.search(req, interaction.user.id);
        if (!res.tracks.length || res.tracks[0] === null) throw new MusicErrors.TrackNotFound();

        player = MusicBox.musicManager.create({
            guild: interaction.guild.id,
            textChannel: interaction.channelId,
            voiceChannel: vc.id,
            volume: 40,
            selfDeafen: true,
            instaUpdateFiltersFix: false,
        });

        if (!player.connected) player.connect();

        if (res.loadType === "PLAYLIST_LOADED")
            for (const track of res.tracks) player.queue.add(track);
        else player.queue.add(res.tracks[0]);

        if (!player.playing && !player.paused) player.play();
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(config.pallete.default)
                    .setDescription(
                        res.loadType === "PLAYLIST_LOADED"
                            ? `Added **${res.tracks.length} tracks** from **${
                                  res.playlist?.name || "Unknown Playlist"
                              }** to the queue`
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

    const res = await client.musicManager.search(focused, interaction.user.id);
    const tracks = res.tracks.slice(0, 10).map((track) => ({
        name: track.title.length > 100 ? track.title.slice(0, 96) + "..." : track.title,
        value: track.uri,
    }));

    await interaction.respond(tracks);
}
export default new Command({
    metadata: {
        catergory: "🎵 Music",
    },
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Search and play music")
        .addStringOption((options) =>
            options
                .setName("prompt")
                .setDescription("Name/link of the song")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    autocomplete: autocompletePlayCommand,
    run: playCommand,
});
