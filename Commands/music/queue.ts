import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  Message,
  SlashCommandBuilder,
  hyperlink,
} from "discord.js";
import ms from "ms";
import MusicBoxClient from "../../MusicBox.js";
import config from "../../config.js";
import { GuildErrors, MusicErrors } from "../../module/errors/index.js";
import Command from "../../module/structures/Command.js";
import convertTime from "../../module/utilities/convertTime.js";

async function queueCommand(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) throw new GuildErrors.NotInGuild();
  const MusicBox = interaction.client as MusicBoxClient;

  const player = MusicBox.musicManager.players.get(interaction.guild.id);
  if (!player) throw new MusicErrors.PlayerNotFound();

  if (!player.queue.length) throw new MusicErrors.NoSongInQueue();

  const embeds: EmbedBuilder[] = [];
  const queue = player.queue.map(
    (track, i) =>
      `${i + 1}. ${
        track.uri
          ? hyperlink(
              track.title.length > 100
                ? track.title.slice(0, 96) + "..."
                : track.title,
              track.uri,
            )
          : track.title
      } **[${track.duration ? convertTime(track.duration) : "N/A"}]**`,
  );

  const pages = Math.ceil(player.queue.length / 10);

  for (let i = 1; i <= pages; i++) {
    embeds.push(
      new EmbedBuilder()
        .setColor(config.pallete.default)
        .setAuthor({
          name: "Current Queued Song(s)",
          iconURL: MusicBox.user?.displayAvatarURL(),
        })
        .setDescription(queue.slice(i * 10 - 10, i * 10).join("\n"))
        .setFooter({
          text: `Page ${i}/${pages}`,
        }),
    );
  }
  let msg: Message | null = null;
  if (player.queue.length > 10) {
    msg = await interaction.reply({
      embeds: [embeds[0]],
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId("queue-previous")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("<:leftarrow:1129267022673490010>")
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("queue-next")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("<:rightarrow:1129266974262820925>"),
        ),
      ],
      fetchReply: true,
      ephemeral: true,
    });
  } else {
    interaction.reply({
      embeds: [embeds[0]],
      ephemeral: true,
    });
  }

  if (!msg) return;
  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: ms("15m"),
  });

  let currentPage = 0;
  collector.on("collect", (i) => {
    i.deferUpdate();

    if (i.customId.split("-")[1] === "next") {
      currentPage++;
      if (currentPage === pages - 1)
        interaction.editReply({
          embeds: [embeds[currentPage]],
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId("queue-previous")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("<:leftarrow:1129267022673490010>"),

              new ButtonBuilder()
                .setCustomId("queue-next")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("<:rightarrow:1129266974262820925>")
                .setDisabled(true),
            ),
          ],
        });
      else
        interaction.editReply({
          embeds: [embeds[currentPage]],
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId("queue-previous")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("<:leftarrow:1129267022673490010>"),

              new ButtonBuilder()
                .setCustomId("queue-next")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("<:rightarrow:1129266974262820925>"),
            ),
          ],
        });
    } else {
      currentPage--;
      if (currentPage === 0)
        interaction.editReply({
          embeds: [embeds[currentPage]],
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId("queue-previous")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("<:leftarrow:1129267022673490010>")
                .setDisabled(true),

              new ButtonBuilder()
                .setCustomId("queue-next")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("<:rightarrow:1129266974262820925>"),
            ),
          ],
        });
      else interaction.editReply({ embeds: [embeds[currentPage]] });
    }
  });

  collector.on("end", (collected, reason) => {
    interaction.editReply({
      content: "Menu has been disabled",
      embeds: msg?.embeds,
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId("queue-previous")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("<:leftarrow:1129267022673490010>")
            .setDisabled(true),

          new ButtonBuilder()
            .setCustomId("queue-next")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("<:rightarrow:1129266974262820925>")
            .setDisabled(true),
        ),
      ],
    });
  });
}

export default new Command({
  metadata: {
    catergory: "🎵 Music",
  },
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("View the current queue"),
  run: queueCommand,
});
