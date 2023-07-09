import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    SlashCommandBuilder,
} from "discord.js";
import Command from "../../module/types/Command.js";
import MusicBoxClient from "../../MusicBox.js";
import { MusicErrors } from "../../module/errors/index.js";
import { UserError } from "../../module/errors/base.js";
import config from "../../config.js";
import convertTime from "../../module/utilities/convertTime.js";

async function volumeCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    if (
        player.voiceId !==
        (await interaction.guild.members.fetch(interaction.user.id)).voice.channel?.id
    )
        throw new MusicErrors.NotInCurrentVoice();

    const volume = interaction.options.getNumber("level") || 40;

    if (volume < 0 || volume > 150)
        throw new UserError("Your chosen volume is too high/low (Max: 150 | Min: 0)");

    player.setVolume(volume);

    const msg: Message = player.data.get("message");
    msg.edit({
        embeds: [
            EmbedBuilder.from(msg.embeds[0]).setFields(
                {
                    name: "Author",
                    value: player.queue.current?.author || "Not Found",
                    inline: true,
                },
                {
                    name: "Duration",
                    value: `${
                        player.queue.current?.length
                            ? convertTime(player.queue.current?.length)
                            : "Not Found"
                    }`,
                    inline: true,
                },
                {
                    name: "Volume:",
                    value: (player.volume * 100).toString() + "%",
                    inline: true,
                },
                {
                    name: "Loop Mode:",
                    value:
                        player.loop === "track"
                            ? "Track"
                            : player.loop === "queue"
                            ? "Queue"
                            : "None",
                    inline: true,
                }
            ),
        ],
        components: msg.components,
    }).then((x) => player.data.set("message", x));

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
