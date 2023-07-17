import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../../module/structures/Command.js";
import config from "../../config.js";
import MusicBoxClient from "../../MusicBox.js";

async function pingCommand(interaction: ChatInputCommandInteraction) {
    const MusicBox = interaction.client as MusicBoxClient;

    const msg = await interaction.deferReply({fetchReply: true})

    const msgPing = msg.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply({
        content: "",
        embeds: [
            new EmbedBuilder()
                .setColor(config.pallete.default)
                .setAuthor({
                    name: "Network Infomation",
                    iconURL: MusicBox.user?.displayAvatarURL(),
                })
                .setFields(
                    {
                        name: "📡 Bot to Discord Latency:",
                        value: MusicBox.ws.ping.toString() + 'ms',
                        inline: true,
                    },
                    {
                        name: "📶 Bot to You Latency:",
                        value: msgPing.toString() + 'ms',
                        inline: true,
                    }
                ),
        ],
    });
}

export default new Command({
    data: new SlashCommandBuilder().setName("ping").setDescription("Show bot's network infomation"),
    run: pingCommand,
});
