import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    SlashCommandBuilder,
    channelMention,
} from "discord.js";
import Command from "../../module/structures/Command.js";
import MusicBoxClient from "../../MusicBox.js";
import { GuildErrors, MusicErrors } from "../../module/errors/index.js";
import { UserError, UserInputError } from "../../module/errors/base.js";
import config from "../../config.js";
import convertTime from "../../module/utilities/convertTime.js";

async function volumeCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) throw new GuildErrors.NotInGuild();

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    if (
        player.voiceChannel !==
        (await interaction.guild.members.fetch(interaction.user.id)).voice.channel?.id
    )
        throw new MusicErrors.NotInCurrentVoice();

    const volume = interaction.options.getNumber("level") || 40;

    if (volume < 0 || volume > 150) throw new UserInputError("Input > 0 && Input < 150");

    player.setVolume(volume);

    MusicBox.musicManager.updateControlPanel(player);

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(config.pallete.success)
                .setDescription(`Volume is now \`${volume}\`%`),
        ],
        ephemeral: true,
    });
}

export default new Command({
    metadata: {
        catergory: "🎵 Music",
    },
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Adjust the bot's volume")
        .addNumberOption((options) =>
            options
                .setName("level")
                .setDescription("The volume level you want to set (Default is 40)")
                .setRequired(true)
        ),
    run: volumeCommand,
});
