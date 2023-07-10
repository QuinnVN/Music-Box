import MusicBoxClient from "../MusicBox.js";
import Logger from "../module/Logger.js";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import convertTime from "../module/utilities/convertTime.js";
import config from "../config.js";
import { Manager, NodeOptions } from "erela.js";
import Spotify from "erela.js-spotify";

export default function loadManager(client: MusicBoxClient, nodes: NodeOptions[]) {
    const manager = new Manager({
        defaultSearchPlatform: "ytmsearch",
        plugins: [
            new Spotify({
                clientID: config.spotify.clientID,
                clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
            }),
        ],
        send: (guildId: any, payload: any) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        volumeDecrementer: 0.75,
        clientId: client.user?.id,
        clientName: client.user?.username,
        nodes,
    });

    manager.on("nodeConnect", (node) =>
        Logger.info(`Lavalink Node ${node.options.identifier} On ${node.options.host}: Connected`)
    );
    manager.on("nodeError", (node, error) =>
        Logger.error(`Lavalink Node '${node.options.identifier}': Error Caught, `, error)
    );
    manager.on("nodeDisconnect", (node) => {
        Logger.warn(
            `Lavalink Node ${node.options.identifier} On ${node.options.host}: disconnected`
        );
    });
    manager.on("nodeReconnect", (node) =>
        Logger.warn(
            `Lavalink Node ${node.options.identifier} reconnecting on ${node.options.host}...`
        )
    );
    manager.on("nodeRaw", (payload) => {});

    manager.on("trackStart", async (player, track) => {
        const channel = await client.channels.fetch(player.textChannel || "");
        if (!channel || !channel?.isTextBased()) return;
        if (player.trackRepeat) return;

        Logger.music(
            `Started playing ${track.title} in ${(await client.guilds.fetch(player.guild)).name}`
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
                                name: "Author",
                                value: track.author || "Not Found",
                                inline: true,
                            },
                            {
                                name: "Duration",
                                value: `${
                                    track.duration ? convertTime(track.duration) : "Not Found"
                                }`,
                                inline: true,
                            },
                            {
                                name: "Volume:",
                                value: (player.volume * 100).toString() + "%",
                                inline: true,
                            },
                            {
                                name: "Loop Mode:",
                                value: "Off",
                                inline: true,
                            }
                        )
                        .setThumbnail(
                            `https://img.youtube.com/vi/${track.identifier}/mqdefault.jpg`
                        ),
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
                            .setEmoji("<:playpause:1127228066935078982>"),
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

    manager.on("playerDestroy", async (player) => {
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
                        .setEmoji("<:playpause:1127228066935078982>")
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

    manager.on("trackEnd", async (player) => {
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
                        .setEmoji("<:playpause:1127228066935078982>")
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

    manager.on("queueEnd", async (player) => {
        const channel = await client.channels.fetch(player.textChannel || "");
        if (!channel || !channel?.isTextBased()) return;
        Logger.music(
            `Destroying a player in ${
                (await client.guilds.fetch(player.guild)).name
            } due to inactivity`
        );
        player.destroy();
    });

    manager.on("trackError", async (player, track) => {
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

    return manager;
}
