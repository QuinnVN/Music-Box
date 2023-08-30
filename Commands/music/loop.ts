import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    SlashCommandBuilder,
    channelMention,
} from "discord.js";
import Command from "../../module/structures/Command.js";
import MusicBoxClient from "../../MusicBox.js";
import config from "../../config.js";
import convertTime from "../../module/utilities/convertTime.js";
import { GuildErrors, MusicErrors } from "../../module/errors/index.js";

async function loopCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) throw new GuildErrors.NotInGuild();

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    if (
        player.voiceChannel !==
        (await interaction.guild.members.fetch(interaction.user.id)).voice.channel?.id
    )
        throw new MusicErrors.NotInCurrentVoice();

    const choice = interaction.options.getString("mode", true);
    switch (choice) {
        case "🔂 Track": {
            player.setTrackRepeat(true);
            break;
        }
        case "🔁 Queue": {
            player.setQueueRepeat(true);
            break;
        }
        default: {
            if (player.trackRepeat) player.setTrackRepeat(false);
            else player.setQueueRepeat(false);
            break;
        }
    }

    const msg: Message = player.get("message");
    msg.edit({
        embeds: [
            EmbedBuilder.from(msg.embeds[0]).setFields(
                {
                    name: "🙍‍♂️ Author",
                    value: player.queue.current?.author || "Not Found",
                    inline: true,
                },
                {
                    name: "⏱️ Duration",
                    value: `${
                        player.queue.current?.duration
                            ? convertTime(player.queue.current?.duration)
                            : "Not Found"
                    }`,
                    inline: true,
                },
                {
                    name: "🔈 Volume:",
                    value: player.volume.toString() + "%",
                    inline: true,
                },
                {
                    name: "🔁 Loop Mode:",
                    value: choice,
                    inline: true,
                },
                {
                    name: "🎶 Music Channel:",
                    value: player.voiceChannel
                        ? channelMention(player.voiceChannel)
                        : "Unknown Channel",
                    inline: true,
                },
                {
                    name: "🎛️ Filters:",
                    value: `\`${player.get("activefilter") || "None"}\``,
                    inline: true,
                }
            ),
        ],
        components: msg.components,
    }).then((x) => player.set("message", x));

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(config.pallete.success)
                .setDescription(`Loop mode had been set to \`${choice}\``),
        ],
        ephemeral: true,
    });
}

export default new Command({
    metadata: {
        catergory: "🎵 Music",
    },
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Toggle loop modes")
        .addStringOption((options) =>
            options
                .setName("mode")
                .setDescription("Choose your loop mode")
                .setChoices(
                    { name: "Repeat the current song", value: "🔂 Track" },
                    { name: "Repeat the queue", value: "🔁 Queue" },
                    { name: "Turn off repeat/loop mode", value: "None" }
                )
                .setRequired(true)
        ),
    run: loopCommand,
});
