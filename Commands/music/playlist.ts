import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  Message,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  hyperlink,
} from "discord.js";
import { Player } from "erela.js";
import ms from "ms";
import MusicBoxClient from "../../MusicBox.js";
import config from "../../config.js";
import { GuildErrors, MusicErrors } from "../../module/errors/index.js";
import Command from "../../module/structures/Command.js";
import SubCommand from "../../module/structures/SubCommand.js";
import convertTime from "../../module/utilities/convertTime.js";
type PlaylistTrack = {
  title: string;
  trackURL: string;
  trackDuration: number;
};

async function addSubCommand(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const MusicBox = interaction.client as MusicBoxClient;

  let playlist: PlaylistTrack[] | null = await MusicBox.db.get(
    `playlists.${interaction.user.id}`,
  );
  if (!playlist) playlist = [];

  const res = await MusicBox.musicManager.search(
    interaction.options.getString("prompt", true),
  );

  if (!res.tracks.length || res.tracks[0] === null)
    throw new MusicErrors.TrackNotFound();
  if (res.loadType === "playlist")
    res.tracks.forEach((track) =>
      playlist.push({
        title: track.title,
        trackURL: track.uri,
        trackDuration: track.duration,
      }),
    );
  else
    playlist.push({
      title: res.tracks[0].title,
      trackURL: res.tracks[0].uri,
      trackDuration: res.tracks[0].duration,
    });

  await MusicBox.db.set(`playlists.${interaction.user.id}`, playlist);

  interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(config.pallete.success)
        .setDescription(
          `Successfully added ${
            res.loadType === "playlist"
              ? res.playlist?.name
              : res.tracks[0].title
          } to your playlist`,
        ),
    ],
  });
}

async function listSubCommand(interaction: ChatInputCommandInteraction) {
  let msg: Message | null = null;
  msg = await interaction.deferReply({ ephemeral: true, fetchReply: true });

  const MusicBox = interaction.client as MusicBoxClient;

  let playlist: PlaylistTrack[] | null = await MusicBox.db.get(
    `playlists.${interaction.user.id}`,
  );
  if (!playlist) playlist = [];

  if (playlist.length === 0) throw new MusicErrors.NoSongInPlaylist();

  const embeds: EmbedBuilder[] = [];
  const playlistShow = playlist.map(
    (track, i) =>
      `${i + 1}. ${
        track.trackURL
          ? hyperlink(
              track.title.length > 100
                ? track.title.slice(0, 96) + "..."
                : track.title,
              track.trackURL,
            )
          : track.title
      } **[${
        track.trackDuration ? convertTime(track.trackDuration) : "N/A"
      }]**`,
  );

  const pages = Math.ceil(playlist.length / 10);

  for (let i = 1; i <= pages; i++) {
    embeds.push(
      new EmbedBuilder()
        .setColor(config.pallete.default)
        .setAuthor({
          name: `${interaction.user.displayName}\'s playlist`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(playlistShow.slice(i * 10 - 10, i * 10).join("\n"))
        .setFooter({
          text: `Page ${i}/${pages}`,
        }),
    );
  }

  if (playlist.length > 10) {
    msg = await interaction.editReply({
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
    });
  } else {
    interaction.editReply({
      embeds: [embeds[0]],
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

  collector.on("end", () => {
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

async function playSubCommand(interaction: ChatInputCommandInteraction) {
  async function loadPlaylistIntoQueue(
    player: Player,
    playlist: Array<PlaylistTrack | undefined>,
    merge: boolean,
  ): Promise<Array<PlaylistTrack | undefined>> {
    playlist.forEach(async (track, i) => {
      const req = await player
        .search(track!.trackURL, interaction.user.id)
        .catch(() => {
          playlist[i] = undefined;
          return null;
        });
      if (!req) return;
      if (!merge) player.queue.clear();
      if (req.loadType === "playlist") player.queue.push(...req.tracks);
      else player.queue.push(req.tracks[0]);
    });
    return playlist.filter((list) => list !== undefined);
  }

  if (!interaction.guild) throw new GuildErrors.NotInGuild();

  const merge: boolean = interaction.options.getBoolean("merge") || true;

  const MusicBox = interaction.client as MusicBoxClient;

  await interaction.deferReply();

  const vc = (await interaction.guild?.members.fetch(interaction.user.id))
    ?.voice.channel;
  if (!vc) throw new MusicErrors.NotInVoice();

  const playlist = await MusicBox.db.get(`playlists.${interaction.user.id}`);

  let player = MusicBox.musicManager.players.get(interaction.guild.id);
  if (player) {
    if (player.voiceChannel !== vc.id)
      throw new MusicErrors.NotInCurrentVoice();

    await loadPlaylistIntoQueue(player, playlist, merge);

    if (!player.playing && !player.paused) player.play();
    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.pallete.default)
          .setDescription(
            `Added **${playlist.length} tracks** from your playlist to the queue`,
          ),
      ],
    });
  } else {
    player = MusicBox.musicManager.create({
      guild: interaction.guild.id,
      textChannel: interaction.channelId,
      voiceChannel: vc.id,
      volume: 40,
      selfDeafen: true,
      instaUpdateFiltersFix: true,
    });

    if (!player.connected) player.connect();

    await loadPlaylistIntoQueue(player, playlist, merge);

    if (!player.playing && !player.paused) player.play();
    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.pallete.default)
          .setDescription(
            `Added **${playlist.length} tracks** from your playlist to the queue`,
          ),
      ],
    });
  }
}

export default new Command({
  metadata: {
    catergory: "🎵 Music",
  },
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Manage your playlist")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("Add track to your playlist")
        .addStringOption(
          new SlashCommandStringOption()
            .setName("prompt")
            .setDescription("track's name or track's URL")
            .setAutocomplete(true)
            .setRequired(true),
        ),
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("List tracks in your playlist"),
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("remove")
        .setDescription("Remove track(s) from your playlist")
        .addStringOption(
          new SlashCommandStringOption()
            .setName("input")
            .setDescription("track(s) position in playlist (1;1,2,3;1-3)")
            .setRequired(true),
        ),
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("play")
        .setDescription("Play your playlist")
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName("merge")
            .setDescription(
              "Merge your playlist with the current queue (DEFAULT: true)",
            ),
        ),
    ),
  subCommands: ["add", "list", "remove", "play"],
});

export const add = new SubCommand({
  run: addSubCommand,
  async autocomplete(interaction, client) {
    const focused = interaction.options.getFocused();

    const res = await client.musicManager.search(focused, interaction.user.id);
    const tracks = res.tracks.slice(0, 10).map((track) => ({
      name:
        track.title.length > 100
          ? track.title.slice(0, 96) + "..."
          : track.title,
      value: track.uri,
    }));

    await interaction.respond(tracks);
  },
});

export const list = new SubCommand({
  run: listSubCommand,
});

export const play = new SubCommand({
  run: playSubCommand,
});
