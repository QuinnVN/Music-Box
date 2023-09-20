import { Guild } from "discord.js";
import Event from "../../module/structures/Events.js";
import MusicBoxClient from "../../MusicBox.js";

async function handleGuildJoin(guild: Guild) {
    const MusicBox = guild.client as MusicBoxClient;
    await MusicBox.db.set(`guilds.${guild.id}`, {
        lang: guild.preferredLocale == "vi" ? "vi" : "en",
        cleanOutput: false,
        radio247: false,
    });
}

export default new Event({
    name: "guildCreate",
    run: handleGuildJoin,
});
