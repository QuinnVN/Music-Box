import { Kazagumo } from "kazagumo";
import MusicBoxClient from "../MusicBox.js";
import { Connectors, NodeOption } from "shoukaku";
import Logger from "../module/Logger.js";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import convertTime from "../module/utilities/convertTime.js";
import Spotify from "kazagumo-spotify";
import config from "../config.js";

export default function loadKazagumo(client: MusicBoxClient, nodes: NodeOption[]) {
    const kazagumo = new Kazagumo(
        {
            defaultSearchEngine: "youtube",
            plugins: [
                new Spotify({
                    clientId: config.spotify.clientID,
                    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
                }),
            ],
            send: (guildId, payload) => {
                const guild = client.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload);
            },
        },
        new Connectors.DiscordJS(client),
        nodes
    );

    kazagumo.shoukaku.on("ready", (name) => Logger.info(`Connected to Lavalink Node '${name}'`));
    kazagumo.shoukaku.on("error", (name, error) =>
        Logger.error(`Lavalink Node '${name}': Error Caught,`, error)
    );
    kazagumo.shoukaku.on("close", (name, code, reason) =>
        Logger.warn(
            `Lavalink Node '${name}': Closed, Code ${code}, Reason ${reason || "No reason"}`
        )
    );
    // kazagumo.shoukaku.on("debug", (name, info) =>
    //     Logger.log(`Lavalink Node '${name}': Debug`, info)
    // );

    kazagumo.on("playerStart", async (player, track) => {
        const channel = await client.channels.cache.get(player.textId);
        if (!channel || !channel?.isTextBased()) return;
        Logger.music(
            `Started playing ${track.title} in ${(await client.guilds.fetch(player.guildId)).name}`
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
                        .setColor("Purple")
                        .addFields(
                            {
                                name: "Author",
                                value: track.author || "Not Found",
                                inline: true,
                            },
                            {
                                name: "Duration",
                                value: `${track.length ? convertTime(track.length) : "Not Found"}`,
                                inline: true,
                            },
                            {
                                name: "Volume:",
                                value: (player.volume * 100).toString() + "%",
                                inline: true,
                            },
                            {
                                name: "Loop Mode:",
                                value: 'Off',
                                inline: true,
                            }
                        )
                        .setThumbnail(
                            `https://img.youtube.com/vi/${track.identifier}/mqdefault.jpg`
                        ),
                ],

                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId("music-play/pause")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("⏯️"),

                        new ButtonBuilder()
                            .setCustomId("music-stop")
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji("🛑"),

                        new ButtonBuilder()
                            .setCustomId("music-vol-up")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("🔊"),

                        new ButtonBuilder()
                            .setCustomId("music-vol-down")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("🔉"),

                        new ButtonBuilder()
                            .setCustomId("music-repeat")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("🔁")
                    ),
                ],
            })
            .then((x) => player.data.set("message", x));
    });

    kazagumo.on("playerDestroy", async (player) => {
        Logger.music(`Player destroyed at ${(await client.guilds.fetch(player.guildId)).name}`);
        const originalMsg: Message = player.data.get("message");
        if (!originalMsg) return;
        originalMsg.edit({
            embeds: originalMsg.embeds,
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("music-play/pause")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("⏯️")
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId("music-stop")
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("🛑")
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId("music-vol-up")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("🔊")
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId("music-vol-down")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("🔉")
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId("music-repeat")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("🔁")
                        .setDisabled(true)
                ),
            ],
        });
        const channel = await client.channels.fetch(player.textId);
        if (!channel || !channel.isTextBased()) return;
        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(config.pallete.default)
                    .setDescription("Going offline... Goodbye!"),
            ],
        });
    });

    kazagumo.on("playerEnd", async (player) => {
        Logger.music(`Track ended at ${(await client.guilds.fetch(player.guildId)).name}`);
        const originalMsg: Message = player.data.get("message");
        if (!originalMsg) return;
        originalMsg.edit({
            embeds: originalMsg.embeds,
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("music-play/pause")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("⏯️")
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId("music-stop")
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("🛑")
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId("music-vol-up")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("🔊")
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId("music-vol-down")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("🔉")
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId("music-repeat")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("🔁")
                        .setDisabled(true)
                ),
            ],
        });
    });

    kazagumo.on("playerEmpty", async (player) => {
        const channel = await client.channels.fetch(player.textId);
        if (!channel || !channel?.isTextBased()) return;
        Logger.music(
            `Destroying a player in ${
                (await client.guilds.fetch(player.guildId)).name
            } due to inactivity`
        );
        player.destroy();
    });

    return kazagumo;
}
