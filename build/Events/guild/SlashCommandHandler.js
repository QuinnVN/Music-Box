import { Colors, EmbedBuilder, Events } from "discord.js";
import Event from "../../module/types/Events.js";
import { BaseErrors } from "../../module/errors/index.js";
async function handleSlashCommand(interaction) {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete())
        return;
    const ServerUtils = interaction.client;
    const command = ServerUtils.commands.get(interaction.commandName);
    if (!command)
        return;
    if (interaction.isAutocomplete()) {
        if (!command.autocomplete)
            return;
        try {
            await command.autocomplete(interaction);
        }
        catch {
            console.error(`Error when autocompleting command ${interaction.commandName}`);
        }
        return;
    }
    if (interaction.isChatInputCommand()) {
        try {
            await command.run(interaction);
        }
        catch (error) {
            if (error instanceof BaseErrors.UserError)
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setAuthor({
                            name: "Error",
                            iconURL: ServerUtils.user?.displayAvatarURL(),
                        })
                            .setDescription(error.message),
                    ],
                });
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
        }
        return;
    }
}
export default new Event({
    name: Events.InteractionCreate,
    run: handleSlashCommand,
});
