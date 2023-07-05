import { SlashCommandBuilder } from "discord.js";
import Command from "../../module/types/Command.js";
async function pingCommand(interaction) {
    interaction.reply(`Bot's ping: ${interaction.client.ws.ping}`);
}
export default new Command({
    data: new SlashCommandBuilder().setName("ping").setDescription("Show bot's ping"),
    run: pingCommand,
});
