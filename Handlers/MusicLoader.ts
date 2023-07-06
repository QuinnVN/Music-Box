import { Kazagumo } from "kazagumo";
import ServerUtilsClient from "../ServerUtils.js";
import { Connectors, NodeOption } from "shoukaku";
import Logger from "../module/Logger.js";

export default function loadKazagumo(client: ServerUtilsClient, nodes: NodeOption[]) {
    const kazagumo = new Kazagumo(
        {
            defaultSearchEngine: "youtube",
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
    kazagumo.shoukaku.on("debug", (name, info) =>
        Logger.log(`Lavalink Node '${name}': Debug`, info)
    );

    kazagumo.on("playerStart", async (player, track) => {
        const channel = await client.channels.cache.get(player.textId);
        if (!channel || !channel?.isTextBased()) return;
        channel
            .send({ content: `Now playing **${track.title}** by **${track.author}**` })
            .then((x) => player.data.set("message", x));
    });

    kazagumo.on("playerEnd", (player) => {
        player.data.get("message")?.edit({ content: `Finished playing` });
    });

    kazagumo.on("playerEmpty", async (player) => {
        const channel = await client.channels.cache.get(player.textId);
        if (!channel || !channel?.isTextBased()) return;
        channel
            .send({ content: `Destroyed player due to inactivity.` })
            .then((x) => player.data.set("message", x));
        player.destroy();
    });

    return kazagumo;
}
