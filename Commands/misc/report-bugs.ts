import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ModalBuilder,
    ModalSubmitFields,
    ModalSubmitInteraction,
    SlashCommandBuilder,
    TextInputBuilder,
    TextInputStyle,
    TimestampStyles,
    WebhookClient,
    time,
} from "discord.js";
import Command from "../../module/types/Command.js";
import config from "../../config.js";
import { UserError } from "../../module/errors/base.js";
import MusicBoxClient from "../../MusicBox.js";

type Reports = {
    title: string;
    description: string;
    date: Date;
    author: string;
};

async function report_bugsCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    interaction.showModal(
        new ModalBuilder()
            .setTitle("Bug Report Form")
            .setCustomId("bug-report")
            .setComponents(
                new ActionRowBuilder<TextInputBuilder>().setComponents(
                    new TextInputBuilder()
                        .setLabel("Title")
                        .setCustomId("report-title")
                        .setPlaceholder("Show the main point of the bug")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder<TextInputBuilder>().setComponents(
                    new TextInputBuilder()
                        .setLabel("Detail")
                        .setCustomId("report-detail")
                        .setPlaceholder("Include pictures or videos of the bug happening.")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            )
    );

    interaction
        .awaitModalSubmit({ time: 1_800_000 })
        .then(async (i: ModalSubmitInteraction) => {
            i.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.pallete.success)
                        .setDescription("Bug report has been sent!"),
                ],
                ephemeral: true,
            });

            const webhook = new WebhookClient({
                url: "https://discord.com/api/webhooks/1126521957102399548/CX1K8T0T4NMMhYFV2la1e7xn1ZQsoByZ0-T7J1YQxoz7ydBkgfjtrNOsNeUSF--MIdr3",
            });

            const MusicBox = i.client as MusicBoxClient;

            const reports: Reports[] | null = (await MusicBox.db.get("reports")) || [];

            const date = new Date();

            reports.push({
                title: i.fields.getTextInputValue("report-title"),
                description: i.fields.getTextInputValue("report-detail"),
                date,
                author: interaction.user.id,
            });

            await MusicBox.db.set("reports", reports);

            webhook.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.pallete.default)
                        .setAuthor({
                            name: `Bug Report #${reports?.length || "1"}`,
                            iconURL: interaction.client.user.displayAvatarURL(),
                        })
                        .setTitle(i.fields.getTextInputValue("report-title"))
                        .setFields(
                            {
                                name: "Reported by:",
                                value: interaction.user.tag + ` (${interaction.user.id})`,
                                inline: true,
                            },
                            {
                                name: "Reported time:",
                                value: time(date, TimestampStyles.LongDateTime),
                                inline: true,
                            },
                            {
                                name: "Details:",
                                value: i.fields.getTextInputValue("report-detail"),
                            }
                        )
                        .setFooter({ text: "'✅' react means the bug has been resolved" }),
                ],
            });
        })
        .catch(() => {
            throw new UserError(
                "There was and error while submitting the form or you have ran out of time to fill in the form"
            );
        });
}

export default new Command({
    data: new SlashCommandBuilder().setName("report-bug").setDescription("Report bugs to me"),
    run: report_bugsCommand,
});
