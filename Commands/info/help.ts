import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    SlashCommandBuilder,
    codeBlock,
} from "discord.js";
import Command from "../../module/structures/Command.js";
import MusicBoxClient from "../../MusicBox.js";
import { UserInputError } from "../../module/errors/base.js";

async function helpCommand(interaction: ChatInputCommandInteraction) {
    const MusicBox = interaction.client as MusicBoxClient;

    const isSpecificCommandQuery = interaction.options.getString("command");

    if (isSpecificCommandQuery && isSpecificCommandQuery !== "") {
        const selectedCommand = MusicBox.commands.find(
            (cmd) => cmd.data.name === isSpecificCommandQuery?.toLowerCase().trim()
        );
        if (!selectedCommand)
            throw new UserInputError(`Cannot find command ${isSpecificCommandQuery}`);

        const commandEmbed = new EmbedBuilder()
            .setColor(Colors.White)
            .setAuthor({
                name: `${
                    selectedCommand.data.name[0].toUpperCase() +
                    selectedCommand.data.name.slice(1, selectedCommand.data.name.length)
                }'s Information`,
                iconURL: MusicBox.user?.displayAvatarURL(),
            })
            .setDescription(selectedCommand.data.description)
            .addFields({
                name: "Catergory:",
                value: selectedCommand.metadata.catergory,
            })
            .setFooter({ text: "<>: Required | []: Optional" });

        let commandSyntax = ``;

        const options = selectedCommand.data.options.map((option) => option.toJSON());

        if (selectedCommand.subCommands.length) {
            options.forEach((option) => {
                if (option.type === ApplicationCommandOptionType.Subcommand) {
                    commandSyntax += `\`/${selectedCommand.data.name} ${option.name}`;
                    option.options?.forEach((opt) => {
                        commandSyntax += `${
                            opt.required ? " <" + opt.name + ">" : " [" + opt.name + "]"
                        }`;
                    });
                    commandSyntax += `\`\n> ${option.description}`;
                    option.options?.forEach((opt) => {
                        commandSyntax += `\n- \`${
                            opt.required ? "<" + opt.name + ">" : "[" + opt.name + "]"
                        }\`: ${opt.description}`;
                    });
                }
                commandSyntax += "\n\n";
            });
        } else {
            commandSyntax = `\`/${selectedCommand.data.name}`;
            options.forEach((option) => {
                commandSyntax += `${
                    option.required ? " <" + option.name + ">" : " [" + option.name + "]"
                }`;
            });
            commandSyntax += "`";
            options.forEach(
                (option) =>
                    (commandSyntax += `\n- \`${
                        option.required ? "<" + option.name + ">" : "[" + option.name + "]"
                    }\`: ${option.description}`)
            );
        }
        commandEmbed.addFields({
            name: "Syntax:",
            value: commandSyntax,
        });

        interaction.reply({
            embeds: [commandEmbed],
            ephemeral: true,
        });
    } else {
        const rawCatergories: string[] = [];
        MusicBox.commands.forEach((cmd) => rawCatergories.push(cmd.metadata.catergory));
        const catergories = [...new Set(rawCatergories)];

        const helpEmbed = new EmbedBuilder()
            .setColor(Colors.White)
            .setTitle("Help Menu")
            .setThumbnail(MusicBox.user?.displayAvatarURL() || "")
            .setDescription(
                "You can see specific command's page by using `/help <command>` or browse the command's list below."
            );

        catergories.forEach((catergory) => {
            const commandsInCatergory = MusicBox.commands.filter(
                (cmd) => cmd.metadata.catergory === catergory
            );

            helpEmbed.addFields({
                name: `${catergory} commands:`,
                value: Array.from(commandsInCatergory.keys())
                    .map((cmd) => `\`/${cmd}\``)
                    .join(","),
            });
        });

        interaction.reply({
            embeds: [helpEmbed],
            ephemeral: true,
        });
    }
}
export default new Command({
    metadata: {
        catergory: "📑 Info",
    },
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("See all commands and it's functionality")
        .addStringOption((options) =>
            options.setName("command").setDescription("Quick navigation to a command's help page")
        ),

    run: helpCommand,
});
