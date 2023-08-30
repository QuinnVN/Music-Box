import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../../module/structures/Command.js";
import { GuildErrors, MusicErrors } from "../../module/errors/index.js";
import MusicBoxClient from "../../MusicBox.js";
import ms from "ms";
import { UserInputError } from "../../module/errors/base.js";
import config from "../../config.js";
import convertTime from "../../module/utilities/convertTime.js";

async function seekCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) throw new GuildErrors.NotInGuild();

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    if (
        player.voiceChannel !==
        (await interaction.guild.members.fetch(interaction.user.id)).voice.channel?.id
    )
        throw new MusicErrors.NotInCurrentVoice();

    const position = ms(interaction.options.getString("position", true));

    if (isNaN(position))
        throw new UserInputError(
            `'${interaction.options.getString("position", true)}' is not a valid position`
        );

    player.seek(position);

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(config.pallete.success)
                .setDescription(
                    `The current song\'s progress had been set to \`${convertTime(position)}\``
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
        .setName("seek")
        .setDescription("Set the current song's progress")
        .addStringOption((options) =>
            options
                .setName("position")
                .setDescription("The position of the track (1s, 1m, 1h,...)")
                .setRequired(true)
        ),
    run: seekCommand,
});
