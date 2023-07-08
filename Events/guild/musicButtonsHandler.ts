import { EmbedBuilder, Events, Interaction } from "discord.js";
import Event from "../../module/types/Events.js";
import config from "../../config.js";

async function musicButtonsHandler(interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("music-")) return;

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(config.pallete.warn)
                .setDescription("Buttons is a **Work In Progress** (W.I.P) feature"),
        ],
        ephemeral: true,
    });
}

export default new Event({
    name: Events.InteractionCreate,
    run: musicButtonsHandler,
});
