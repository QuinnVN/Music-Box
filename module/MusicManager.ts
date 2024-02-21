import chalk from "chalk";
import MusicBoxClient from "../MusicBox.js";
import Logger from "./Logger.js";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  channelMention,
} from "discord.js";
import convertTime from "./utilities/convertTime.js";
import config from "../config.js";
import { NodeOptions, Manager, Player } from "erela.js";
import Spotify from "erela.js-spotify";

export class MusicManager extends Manager {
  constructor(client: MusicBoxClient, nodes: NodeOptions[]) {
    if (
      process.env.SPOTIFY_CLIENT_SECRET &&
      config.spotify.clientID.length > 0 &&
      process.env.SPOTIFY_CLIENT_SECRET.length > 0
    ) {
      super({
        nodes: nodes,
        defaultSearchPlatform: "ytsearch",
        plugins: [
          // new Spotify({
          //     clientID: config.spotify.clientID,
          //     clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
          // }),
        ],
        volumeDecrementer: 0.75,
        clientId: client.user?.id,
        clientName: client.user?.username,
        validUnresolvedUris: ["spotify.com"],
        send: (guildId, payload) => {
          const guild = client.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
      });
    } else
      super({
        nodes: nodes,
        defaultSearchPlatform: "ytsearch",
        plugins: [],
        volumeDecrementer: 0.75,
        clientId: client.user?.id,
        clientName: client.user?.username,
        send: (guildId, payload) => {
          const guild = client.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
      });

    this.on("nodeConnect", (node) =>
      Logger.info(
        `Lavalink Node ${chalk.bold(
          node.options.identifier,
        )} On ${chalk.underline(node.options.host)}: Connected`,
      ),
    );
    this.on("nodeError", (node, error) =>
      Logger.error(
        `Lavalink Node '${chalk.bold(
          node.options.identifier,
        )}': Error Caught, `,
        error,
      ),
    );
    this.on("nodeDisconnect", (node) => {
      Logger.warn(
        `Lavalink Node ${chalk.bold(
          node.options.identifier,
        )} On ${chalk.underline(node.options.host)}: disconnected`,
      );
    });
    this.on("nodeReconnect", (node) =>
      Logger.warn(
        `Lavalink Node ${chalk.bold(
          node.options.identifier,
        )} reconnecting on ${chalk.underline(node.options.host)}...`,
      ),
    );

    this.on("trackStart", async (player, track) => {
      const channel = await client.channels.fetch(player.textChannel || "");
      if (!channel || !channel?.isTextBased()) return;
      if (
        player.trackRepeat ||
        (player.queueRepeat && player.queue.length === 0)
      )
        return;

      Logger.music(
        `Started playing ${track.title} in ${
          (await client.guilds.fetch(player.guild)).name
        }`,
      );

      channel
        .send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Playing ${track.title}`,
                iconURL:
                  "https://cdn.discordapp.com/attachments/974976339914424382/1038789602930073662/711.gif",
                url: track.uri,
              })
              .setColor(config.pallete.default)
              .addFields(
                {
                  name: "🙍‍♂️ Author",
                  value: track.author || "Not Found",
                  inline: true,
                },
                {
                  name: "⏱️ Duration",
                  value: `${
                    track.duration ? convertTime(track.duration) : "Not Found"
                  }`,
                  inline: true,
                },
                {
                  name: "🔈 Volume:",
                  value: player.volume.toString() + "%",
                  inline: true,
                },
                {
                  name: "🔁 Loop Mode:",
                  value: player.queueRepeat ? "🔁 Queue" : "None",
                  inline: true,
                },
                {
                  name: "🎶 Music Channel:",
                  value: player.voiceChannel
                    ? channelMention(player.voiceChannel)
                    : "Unknown Channel",
                  inline: true,
                },
                {
                  name: "🎛️ Filters:",
                  value: `\`${player.get("activefilter") || "None"}\``,
                  inline: true,
                },
              )
              .setThumbnail(track.thumbnail),
          ],

          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId("music-previous")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("<:previous:1127226249358610432>"),

              new ButtonBuilder()
                .setCustomId("music-reverse")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("<:rewind:1209503975896911872>"),

              new ButtonBuilder()
                .setCustomId("music-play/pause")
                .setStyle(ButtonStyle.Success)
                .setEmoji("<:playpause:1128199382756511776>"),

              new ButtonBuilder()
                .setCustomId("music-forward")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("<:fastforward:1209503978090659921>"),

              new ButtonBuilder()
                .setCustomId("music-next")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("<:next:1127224333878689832>"),
            ),
          ],
        })
        .then((x) => player.set("message", x));
    });

    this.on("playerDestroy", async (player) => {
      Logger.music(
        `Player destroyed at ${(await client.guilds.fetch(player.guild)).name}`,
      );
      const originalMsg: Message = player.get("message");
      if (!originalMsg) return;
      originalMsg.edit({
        embeds: originalMsg.embeds,
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId("music-previous")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("<:previous:1127226249358610432>")
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("music-reverse")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("<:rewind:1209503975896911872>")
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("music-play/pause")
              .setStyle(ButtonStyle.Success)
              .setEmoji("<:playpause:1128199382756511776>")
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("music-forward")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("<:fastforward:1209503978090659921>")
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("music-next")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("<:next:1127224333878689832>")
              .setDisabled(true),
          ),
          // new ActionRowBuilder<ButtonBuilder>().setComponents(
          //   new ButtonBuilder()
          //     .setCustomId("music-")
          //     .setStyle(ButtonStyle.Primary)
          //     .setEmoji("<:rewindbutton:1127226249358610432>")
          //     .setDisabled(true),
          //   new ButtonBuilder()
          //     .setCustomId("music-reverse")
          //     .setStyle(ButtonStyle.Primary)
          //     .setEmoji("<:previoustrack:1127226427947884554>")
          //     .setDisabled(true),
          //   new ButtonBuilder()
          //     .setCustomId("music-play/pause")
          //     .setStyle(ButtonStyle.Success)
          //     .setEmoji("<:playpause:1128199382756511776>")
          //     .setDisabled(true),
          //   new ButtonBuilder()
          //     .setCustomId("music-forward")
          //     .setStyle(ButtonStyle.Primary)
          //     .setEmoji("<:nextbutton:1127223968605143170>")
          //     .setDisabled(true),
          //   new ButtonBuilder()
          //     .setCustomId("music-next")
          //     .setStyle(ButtonStyle.Primary)
          //     .setEmoji("<:fastforward:1127224333878689832>")
          //     .setDisabled(true),
          // ),
        ],
      });
      const channel = await client.channels.fetch(player.textChannel || "");
      if (!channel || !channel.isTextBased()) return;
      channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(config.pallete.default)
            .setDescription("Going offline... Goodbye!"),
        ],
      });
    });

    this.on("trackEnd", async (player) => {
      if (
        player.trackRepeat ||
        (player.queueRepeat && player.queue.length === 0)
      )
        return;
      Logger.music(
        `Track ended at ${(await client.guilds.fetch(player.guild)).name}`,
      );
      const originalMsg: Message = player.get("message");
      if (!originalMsg) return;
      originalMsg.edit({
        embeds: originalMsg.embeds,
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId("music-previous")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("<:rewindbutton:1127226249358610432>")
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("music-reverse")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("<:previoustrack:1127226427947884554>")
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("music-play/pause")
              .setStyle(ButtonStyle.Success)
              .setEmoji("<:playpause:1128199382756511776>")
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("music-forward")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("<:nextbutton:1127223968605143170>")
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("music-next")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("<:fastforward:1127224333878689832>")
              .setDisabled(true),
          ),
        ],
      });
    });

    this.on("queueEnd", async (player) => {
      const channel = await client.channels.fetch(player.textChannel || "");
      if (!channel || !channel?.isTextBased()) return;
      Logger.music(
        `Destroying a player in ${
          (await client.guilds.fetch(player.guild)).name
        } due to inactivity`,
      );
      player.destroy();
    });

    this.on("trackError", async (player, track, error) => {
      const channel = await client.channels.fetch(player.textChannel || "");
      if (!channel || !channel?.isTextBased()) return;

      Logger.error(
        `There was an error while resolving track '${track.title} in ${
          (await client.guilds.fetch(player.guild)).name
        }. Code: ${error.type}. Error: \n${error.exception?.message}`,
      );

      channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(config.pallete.fail)
            .setDescription(
              `There was an error while resolving your requested track **${track.title}**`,
            ),
        ],
      });
    });

    this.on("trackStuck", async (player, track) => {
      const channel = await client.channels.fetch(player.textChannel || "");
      if (!channel || !channel?.isTextBased()) return;
      Logger.error(
        `There was an error while playing track '${track.title} in ${
          (await client.guilds.fetch(player.guild)).name
        }.`,
      );

      channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(config.pallete.warn)
            .setDescription(
              `There was an error while playing your requested track **${track.title}**. Skipping...`,
            ),
        ],
      });

      await player.stop();
    });

    client.on("raw", (data) => {
      switch (data.t) {
        case "VOICE_SERVER_UPDATE":
        case "VOICE_STATE_UPDATE":
          client.musicManager.updateVoiceState(data.d);
          break;
      }
    });
  }

  async updateControlPanel(player: Player): Promise<void> {
    const msg: Message = await player.get("message");
    if (!msg) return;
    msg
      .edit({
        embeds: [
          EmbedBuilder.from(msg.embeds[0]).setFields(
            {
              name: "🙍‍♂️ Author",
              value: player.queue.current?.author || "Not Found",
              inline: true,
            },
            {
              name: "⏱️ Duration",
              value: `${
                player.queue.current?.duration
                  ? convertTime(player.queue.current.duration)
                  : "Not Found"
              }`,
              inline: true,
            },
            {
              name: "🔈 Volume:",
              value: player.volume.toString() + "%",
              inline: true,
            },
            {
              name: "🔁 Loop Mode:",
              value: player.trackRepeat
                ? "🔂 Track"
                : player.queueRepeat
                ? "🔁 Queue"
                : "None",
              inline: true,
            },
            {
              name: "🎶 Music Channel:",
              value: player.voiceChannel
                ? channelMention(player.voiceChannel)
                : "Unknown Channel",
              inline: true,
            },
            {
              name: "🎛️ Filters:",
              value: `\`${player.get<string>("activefilter") || "`None`"}\``,
              inline: true,
            },
          ),
        ],
      })
      .then((x) => player.set("message", x));
  }
}
