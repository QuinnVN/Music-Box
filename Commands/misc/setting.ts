import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../../module/structures/Command.js";
import { GuildErrors } from "../../module/errors/index.js";
import MusicBoxClient from "../../MusicBox.js";
import { Settings } from "../../module/structures/Settings.js";
import config from "../../config.js";

async function settingCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) throw new GuildErrors.NotInGuild();

    const MusicBox = interaction.client as MusicBoxClient;

    let guildSetting: Settings | null = await MusicBox.db.get(`guilds.${interaction.guildId}`);
    if (!guildSetting) {
        await MusicBox.db.set(`guilds.${interaction.guild.id}`, {
            lang: interaction.guild.preferredLocale == "vi" ? "vi" : "en",
            cleanOutput: false,
            radio247: false,
        });
        guildSetting = {
            lang: interaction.guild.preferredLocale == "vi" ? "vi" : "en",
            cleanOutput: false,
            radio247: false,
        };
    }

    const settingsList = Object.keys(guildSetting);

    const embed = new EmbedBuilder()
        .setColor(config.pallete.default)
        .setAuthor({ name: "Settings Menu", iconURL: MusicBox.user?.displayAvatarURL() });
    console.log(settingsList);
    settingsList.forEach((setting) => {
        embed.addFields({
            name: setting[0].toUpperCase() + setting.slice(1, setting.length),
            value: `Current Value: ${
                guildSetting
                    ? typeof guildSetting[setting] === "string"
                        ? guildSetting[setting]
                        : guildSetting[setting]
                        ? "On"
                        : "Off"
                    : "N/A"
            }`,
        });
    });

    interaction.reply({
        embeds: [embed],
    });
}

export default new Command({
    data: new SlashCommandBuilder()
        .setName("setting")
        .setDescription("Configure the bot's setting and fetures"),
    metadata: {
        catergory: "❓ Miscellaneous",
    },
    run: settingCommand,
});
