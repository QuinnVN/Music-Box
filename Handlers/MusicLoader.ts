import MusicBoxClient from "../MusicBox.js";
import Logger from "../module/Logger.js";
import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Message,
    channelMention,
} from "discord.js";
import convertTime from "../module/utilities/convertTime.js";
import config from "../config.js";
import { NodeOptions, Manager } from "erela.js";
import Spotify from "erela.js-spotify";

export class MusicManager extends Manager {
    constructor(client: MusicBoxClient, nodes: NodeOptions[]) {
        super({
            nodes: nodes,
            defaultSearchPlatform: "ytmsearch",
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

        this.on("nodeConnect", (node) =>
            Logger.info(
                `Lavalink Node ${node.options.identifier} On ${node.options.host}: Connected`
            )
        );
        this.on("nodeError", (node, error) =>
            Logger.error(`Lavalink Node '${node.options.identifier}': Error Caught, `, error)
        );
        this.on("nodeDisconnect", (node) => {
            Logger.warn(
                `Lavalink Node ${node.options.identifier} On ${node.options.host}: disconnected`
            );
        });
        this.on("nodeReconnect", (node) =>
            Logger.warn(
                `Lavalink Node ${node.options.identifier} reconnecting on ${node.options.host}...`
            )
        );
        this.on("nodeRaw", (payload) => {});

        this.on("trackStart", async (player, track) => {
            const channel = await client.channels.fetch(player.textChannel || "");
            if (!channel || !channel?.isTextBased()) return;
            if (player.trackRepeat) return;

            Logger.music(
                `Started playing ${track.title} in ${
                    (await client.guilds.fetch(player.guild)).name
                }`
            );

            console.log(track.identifier);

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
                                    name: "🎶 Current Channel:",
                                    value: player.voiceChannel
                                        ? channelMention(player.voiceChannel)
                                        : "Unknown Channel",
                                    inline: true,
                                }
                            )
                            .setThumbnail(track.thumbnail),
                    ],

                    components: [
                        new ActionRowBuilder<ButtonBuilder>().setComponents(
                            new ButtonBuilder()
                                .setCustomId("music-previous")
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji("<:rewindbutton:1127226249358610432>"),
                            new ButtonBuilder()
                                .setCustomId("music-reverse")
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji("<:previoustrack:1127226427947884554>"),
                            new ButtonBuilder()
                                .setCustomId("music-play/pause")
                                .setStyle(ButtonStyle.Success)
                                .setEmoji("<:playpause:1128199382756511776>"),
                            new ButtonBuilder()
                                .setCustomId("music-forward")
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji("<:nextbutton:1127223968605143170>"),
                            new ButtonBuilder()
                                .setCustomId("music-next")
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji("<:fastforward:1127224333878689832>")
                        ),
                    ],
                })
                .then((x) => player.set("message", x));
        });

        this.on("playerDestroy", async (player) => {
            Logger.music(`Player destroyed at ${(await client.guilds.fetch(player.guild)).name}`);
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
                            .setDisabled(true)
                    ),
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
            if (player.trackRepeat) return;
            Logger.music(`Track ended at ${(await client.guilds.fetch(player.guild)).name}`);
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
                            .setDisabled(true)
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
                } due to inactivity`
            );
            player.destroy();
        });

        this.on("trackError", async (player, track) => {
            const channel = await client.channels.fetch(player.textChannel || "");
            if (!channel || !channel?.isTextBased()) return;

            Logger.error(
                `There was an error while resolving track '${
                    track.title
                }' in ${await client.guilds.fetch(player.guild)}`
            );

            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.pallete.fail)
                        .setDescription(
                            `There was an error while resolving your requested track **${track.title}**`
                        ),
                ],
            });
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
}
