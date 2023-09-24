import { Colors, EmbedBuilder, Events, Interaction } from "discord.js";
import Event from "../../module/structures/Events.js";
import MusicBoxClient from "../../MusicBox.js";
import { BaseErrors } from "../../module/errors/index.js";
import Logger from "../../module/Logger.js";
import SubCommand from "../../module/structures/SubCommand.js";

async function handleSlashCommand(interaction: Interaction) {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

    const MusicBox = interaction.client as MusicBoxClient;

    const command = MusicBox.commands.get(interaction.commandName);
    if (!command) return;

    if (interaction.isAutocomplete()) {
        const subCommandName = interaction.options.getSubcommand(false);
        if (subCommandName) {
            const subCommand = MusicBox.subCommands.get(`${command.data.name}.${subCommandName}`);
            if (!subCommand || !subCommand.autocomplete) return;
            try {
                await subCommand.autocomplete(interaction, MusicBox);
            } catch {
                Logger.error(
                    `Error when autocompleting command ${command.data.name}.${subCommandName}`
                );
            }
        } else {
            if (!command.autocomplete) return;
            try {
                await command.autocomplete(interaction, MusicBox);
            } catch {
                Logger.error(`Error when autocompleting command ${command.data.name}`);
            }
        }
        return;
    }

    if (interaction.isChatInputCommand()) {
        try {
            const subCommandName = interaction.options.getSubcommand(false);
            if (subCommandName) {
                const subCommand = MusicBox.subCommands.get(
                    interaction.commandName + "." + subCommandName
                );
                if (!subCommand)
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setAuthor({
                                    name: "Error",
                                    iconURL: MusicBox.user?.displayAvatarURL(),
                                })
                                .setDescription("Command not found, please report this"),
                        ],
                        ephemeral: true,
                    });

                await subCommand.run(interaction);
            } else if (command.run) await command.run(interaction);
        } catch (error) {
            if (error instanceof BaseErrors.UserError)
                if (interaction.deferred) {
                    return interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setAuthor({
                                    name: error.message || "Error",
                                    iconURL: MusicBox.user?.displayAvatarURL(),
                                })
                                .setDescription(
                                    error.message +
                                        (error instanceof BaseErrors.UserInputError
                                            ? `\n\`\`\`${error.params}\`\`\``
                                            : "")
                                ),
                        ],
                    });
                } else if (interaction.replied) {
                    return interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setAuthor({
                                    name: error.message || "Error",
                                    iconURL: MusicBox.user?.displayAvatarURL(),
                                })
                                .setDescription(
                                    error.message +
                                        (error instanceof BaseErrors.UserInputError
                                            ? `\n\`\`\`${error.params}\`\`\``
                                            : "")
                                ),
                        ],
                        ephemeral: true,
                    });
                } else {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setAuthor({
                                    name: error.message || "Error",
                                    iconURL: MusicBox.user?.displayAvatarURL(),
                                })
                                .setDescription(
                                    error.message +
                                        (error instanceof BaseErrors.UserInputError
                                            ? `\n\`\`\`${error.params}\`\`\``
                                            : "")
                                ),
                        ],
                        ephemeral: true,
                    });
                }

            if (!interaction.replied || !interaction.deferred)
                interaction.reply({
                    content: "There was an error while executing this command",
                    ephemeral: true,
                });
            else if (interaction.replied) {
                interaction.followUp({
                    content: "There was an error while executing this command",
                    ephemeral: true,
                });
            } else
                interaction.editReply({
                    content: "There was an error while executing this command",
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
