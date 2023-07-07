import { Colors, EmbedBuilder, Events, Interaction } from "discord.js";
import Event from "../../module/types/Events.js";
import MusicBoxClient from "../../MusicBox.js";
import { BaseErrors } from "../../module/errors/index.js";
import Logger from "../../module/Logger.js";

async function handleSlashCommand(interaction: Interaction) {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

    const MusicBox = interaction.client as MusicBoxClient;

    const command = MusicBox.commands.get(interaction.commandName);
    if (!command) return;

    if (interaction.isAutocomplete()) {
        if (!command.autocomplete) return;
        try {
            await command.autocomplete(interaction, MusicBox);
        } catch {
            console.error(`Error when autocompleting command ${interaction.commandName}`);
        }
        return;
    }

    if (interaction.isChatInputCommand()) {
        try {
            await command.run(interaction);
        } catch (error) {
            if (error instanceof BaseErrors.UserError)
                if (interaction.deferred) {
                    return interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setAuthor({
                                    name: "Error",
                                    iconURL: MusicBox.user?.displayAvatarURL(),
                                })
                                .setDescription(error.message),
                        ],
                    });
                } else if (interaction.replied) {
                    return interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setAuthor({
                                    name: "Error",
                                    iconURL: MusicBox.user?.displayAvatarURL(),
                                })
                                .setDescription(error.message),
                        ],
                    });
                } else {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setAuthor({
                                    name: "Error",
                                    iconURL: MusicBox.user?.displayAvatarURL(),
                                })
                                .setDescription(error.message),
                        ],
                    });
                }

            if (!interaction.replied)
                interaction.reply({
                    content: "There was an error while executing this command",
                    ephemeral: true,
                });
            else
                interaction.followUp({
                    content: "There was an error while executing this command",
                    ephemeral: true,
                });

            Logger.error(error instanceof Error ? error.stack || error.message : error);
        }

        return;
    }
}

export default new Event({
    name: Events.InteractionCreate,
    run: handleSlashCommand,
});
