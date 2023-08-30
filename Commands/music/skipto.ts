import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../../module/structures/Command.js";
import { GuildErrors, MusicErrors } from "../../module/errors/index.js";
import MusicBoxClient from "../../MusicBox.js";
import { UserInputError } from "../../module/errors/base.js";
import config from "../../config.js";
import ordinal_suffix_of from "../../module/utilities/ordinaSuffix.js";
async function skipToCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) throw new GuildErrors.NotInGuild();

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    if (
        player.voiceChannel !==
        (await interaction.guild.members.fetch(interaction.user.id)).voice.channel?.id
    )
        throw new MusicErrors.NotInCurrentVoice();

    const songIndex = interaction.options.getNumber("position", true);
    if (songIndex < 1 || songIndex > player.queue.length)
        throw new UserInputError("Selected song position is not in the queue!");

    player.stop(songIndex);

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(config.pallete.success)
                .setDescription(
                    `Skipped to the ${ordinal_suffix_of(songIndex)} song in the queue!`
                ),
        ],
        ephemeral: true,
    });
}

export default new Command({
    metadata: {
        catergory: "🎵 Music",
    },
    data: new SlashCommandBuilder()
        .setName("skipto")
        .setDescription("Skip to a song in the queue")
        .addNumberOption((options) =>
            options
                .setName("position")
                .setDescription("The position of the song in queue")
                .setRequired(true)
        ),
    run: skipToCommand,
});
