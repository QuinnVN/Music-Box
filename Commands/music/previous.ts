import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../../module/structures/Command.js";
import { GuildErrors, MusicErrors } from "../../module/errors/index.js";
import MusicBoxClient from "../../MusicBox.js";
import config from "../../config.js";

async function previousCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) throw new GuildErrors.NotInGuild();

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    if (!player.queue.previous) throw new MusicErrors.NoPreviousSong();

    player.queue.unshift(player.queue.previous);
    player.stop();
    player.queue.unshift(player.queue.previous);

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(config.pallete.success)
                .setDescription("Playing your previous song..."),
        ],
        ephemeral: true,
    });
}

export default new Command({
    metadata: {
        catergory: "🎵 Music",
    },
    data: new SlashCommandBuilder().setName("previous").setDescription("Play the previous song"),
    run: previousCommand,
});
