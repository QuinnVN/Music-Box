import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../../module/types/Command.js";
import MusicBoxClient from "../../MusicBox.js";
import { MusicErrors } from "../../module/errors/index.js";
import config from "../../config.js";
async function skipCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    player.skip();

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(config.pallete.success)
                .setDescription("Skipped the current song"),
        ],
        ephemeral: true,
    });
}

export default new Command({
    data: new SlashCommandBuilder().setName("skip").setDescription("Skip the current song"),
    run: skipCommand,
});
