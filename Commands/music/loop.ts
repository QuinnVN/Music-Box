import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";
import MusicBoxClient from "../../MusicBox.js";
import config from "../../config.js";
import { GuildErrors, MusicErrors } from "../../module/errors/index.js";
import Command from "../../module/structures/Command.js";

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

    await MusicBox.musicManager.updateControlPanel(player);

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
