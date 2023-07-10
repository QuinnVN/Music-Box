import { EmbedBuilder, Events, Interaction } from "discord.js";
import Event from "../../module/types/Events.js";
import config from "../../config.js";
import MusicBoxClient from "../../MusicBox.js";

async function musicButtonsHandler(interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("music-")) return;
    if (!interaction.guild) return;

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) return;

    switch (interaction.customId.split("-")[1]) {
        case "play/pause": {
            player.pause(!player.paused);

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.pallete.success)
                        .setDescription(
                            `${player.paused ? "Unpaused" : "Paused"} the current song`
                        ),
                ],
                ephemeral: true,
            });
            break;
        }

        case "forward": {
            player.seek(player.position + 10 * 1000);

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.pallete.success)
                        .setDescription("The song had been forwarded 10 seconds"),
                ],
                ephemeral: true,
            });
            break;
        }

        case "reverse": {
            player.seek(player.position - 10 * 1000);

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.pallete.success)
                        .setDescription("The song had been rewinded 10 seconds"),
                ],
                ephemeral: true,
            });
            break;
        }

        case "next": {
            player.stop();

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.pallete.success)
                        .setDescription("Skipped the current song"),
                ],
                ephemeral: true,
            });
            break;
        }

        case "previous": {
            if (!player.queue.previous)
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(config.pallete.fail)
                            .setDescription("There's no previous song to play"),
                    ],
                    ephemeral: true,
                });

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.pallete.success)
                        .setDescription("Playing previous song..."),
                ],
                ephemeral: true,
            });

            player.queue.unshift(player.queue.previous);
            player.stop();

            break;
        }
    }
}

export default new Event({
    name: Events.InteractionCreate,
    run: musicButtonsHandler,
});
