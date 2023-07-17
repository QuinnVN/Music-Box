import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../../module/types/Command.js";
import MusicBoxClient from "../../MusicBox.js";
import { GuildErrors, MusicErrors } from "../../module/errors/index.js";
import config from "../../config.js";
async function pauseCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) throw new GuildErrors.NotInGuild();

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    if (
        player.voiceChannel !==
        (await interaction.guild.members.fetch(interaction.user.id)).voice.channel?.id
    )
        throw new MusicErrors.NotInCurrentVoice();

    player.pause(!player.paused);

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(config.pallete.success)
                .setDescription(`${player.paused ? "Paused" : "Unpaused"} the current song`),
        ],
        ephemeral: true,
    });
}

export default new Command({
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause/Resume the current song"),
    run: pauseCommand,
});
