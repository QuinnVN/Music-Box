import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import Command from "../../module/structures/Command.js";
import SubCommand from "../../module/structures/SubCommand.js";
import { GuildErrors, MusicErrors } from "../../module/errors/index.js";
import MusicBoxClient from "../../MusicBox.js";
import config from "../../config.js";

async function setSubcommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) throw new GuildErrors.NotInGuild();

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    if (
        player.voiceChannel !==
        (await interaction.guild.members.fetch(interaction.user.id)).voice.channel?.id
    )
        throw new MusicErrors.NotInCurrentVoice();

    await interaction.deferReply({ ephemeral: true });

    const chosenFilter = interaction.options.getString("filter", true);
    try {
        if (player.checkFiltersState()) await player.resetFilters();
        switch (chosenFilter) {
            case "Echo":
                await player.toggleEcho();
                break;
            case "Karaoke":
                await player.toggleKaraoke();
                break;
            case "Low Pass":
                await player.toggleLowPass();
                break;
            case "Nightcore":
                await player.toggleNightcore();
                break;
            case "Reverb":
                await player.toggleReverb();
                break;
            case "Rotating":
                await player.toggleRotating();
                break;
            case "Rotation":
                await player.toggleRotation();
                break;
            case "Tremelo":
                await player.toggleTremolo();
                break;
            case "Vaporwave":
                await player.toggleVaporwave();
                break;
            case "Vibrato":
                await player.toggleVibrato();
                break;
        }

        await player.updatePlayerFilters();
        player.set("activefilter", chosenFilter);

        MusicBox.musicManager.updateControlPanel(player);

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(config.pallete.success)
                    .setDescription(`Applied filter \`${chosenFilter}\``),
            ],
        });
    } catch (e) {
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(config.pallete.fail)
                    .setDescription(
                        `Cannot apply filter \`${chosenFilter}\`, please try another filter or try again later.`
                    ),
            ],
        });
    }
}

async function removeSubCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) throw new GuildErrors.NotInGuild();

    const MusicBox = interaction.client as MusicBoxClient;

    const player = MusicBox.musicManager.players.get(interaction.guild.id);
    if (!player) throw new MusicErrors.PlayerNotFound();

    if (
        player.voiceChannel !==
        (await interaction.guild.members.fetch(interaction.user.id)).voice.channel?.id
    )
        throw new MusicErrors.NotInCurrentVoice();

    await player.resetFilters();
    player.set("activefilter", null);

    await MusicBox.musicManager.updateControlPanel(player);

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(config.pallete.success)
                .setDescription("Removed all filters"),
        ],
        ephemeral: true,
    });
}

async function addSubCommand(interaction: ChatInputCommandInteraction) {
    interaction.reply("hi");
}

export default new Command({
    metadata: {
        catergory: "🎵 Music",
    },
    data: new SlashCommandBuilder()
        .setName("filter")
        .setDescription("Filter Command")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("set")
                .setDescription("Set the bot's sound filter")
                .addStringOption((options) =>
                    options
                        .setName("filter")
                        .setDescription("The filter you want to set")
                        .setRequired(true)
                        .setChoices(
                            {
                                name: "Echo",
                                value: "Echo",
                            },
                            {
                                name: "Karaoke",
                                value: "Karaoke",
                            },
                            {
                                name: "Low Pass",
                                value: "Low Pass",
                            },
                            {
                                name: "Nightcore",
                                value: "Nightcore",
                            },
                            {
                                name: "Reverb",
                                value: "Reverb",
                            },
                            {
                                name: "Rotating",
                                value: "Rotating",
                            },
                            {
                                name: "Rotation",
                                value: "Rotation",
                            },
                            {
                                name: "Tremelo",
                                value: "Tremelo",
                            },
                            {
                                name: "Vaporwave",
                                value: "Vaporwave",
                            },
                            {
                                name: "Vibrato",
                                value: "Vibrato",
                            }
                        )
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("remove")
                .setDescription("Remove all sound filters")
        ),
    // .addSubcommand(
    //     new SlashCommandSubcommandBuilder()
    //         .setName("add")
    //         .setDescription("Add filter to bot's current playinng sound")
    //         .addStringOption((options) =>
    //             options
    //                 .setName("filter")
    //                 .setDescription("The filter you want to add")
    //                 .setRequired(true)
    //                 .setAutocomplete(true)
    //         )
    // ),
    subCommands: ["set", "remove"],
});

export const set = new SubCommand({
    run: setSubcommand,
});

export const remove = new SubCommand({
    run: removeSubCommand,
});

export const add = new SubCommand({
    run: addSubCommand,
});
