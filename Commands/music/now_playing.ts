import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    SlashCommandBuilder,
    hyperlink,
} from "discord.js";
import Command from "../../module/types/Command.js";
import MusicBoxClient from "../../MusicBox.js";
import { GuildErrors, MusicErrors } from "../../module/errors/index.js";

async function now_playingCommannd(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) throw new GuildErrors.NotInGuild();

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    const msg: Message = player.get("message");

    interaction.reply({
        embeds: [
            EmbedBuilder.from(msg.embeds[0]).addFields({
                name: "Control Panel:",
                value: hyperlink("Click here", msg.url),
                inline: true,
            }),
        ],
        ephemeral: true,
    });
}

export default new Command({
    data: new SlashCommandBuilder()
        .setName("now_playing")
        .setDescription("Show infomation about the currently playing song"),
    run: now_playingCommannd,
});
