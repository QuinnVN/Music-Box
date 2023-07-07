import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../../module/types/Command.js";
import MusicBoxClient from "../../MusicBox.js";
import { MusicErrors } from "../../module/errors/index.js";
import { UserError } from "../../module/errors/base.js";
import config from "../../config.js";

async function loopCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    if (
        player.voiceId !==
        (await interaction.guild.members.fetch(interaction.user.id)).voice.channel?.id
    )
        throw new MusicErrors.NotInCurrentVoice();

    const choice = interaction.options.getString("mode", true);

    if (choice !== "queue" && choice !== "track" && choice !== "none")
        throw new UserError("loop mode must be queue, track or none");

    player.setLoop(choice);

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
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Toggle loop modes")
        .addStringOption((options) =>
            options
                .setName("mode")
                .setDescription("Choose your loop mode")
                .setChoices(
                    { name: "Repeat the current song", value: "track" },
                    { name: "Repeat the queue", value: "queue" },
                    { name: "Turn off repeat/loop mode", value: "none" }
                )
                .setRequired(true)
        ),
    run: loopCommand,
});
