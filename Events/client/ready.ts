import { ActivityType, Client, Events, SlashCommandBuilder } from "discord.js";
import MusicBoxClient from "../../MusicBox.js";
import Event from "../../module/types/Events.js";
import { EventTable } from "../../Handlers/EventHandler.js";
import { CommandTable } from "../../Handlers/CommandLoader.js";
import Logger from "../../module/Logger.js";

async function onReady(client: Client) {
    const MusicBox = client as MusicBoxClient;

    console.log(EventTable.toString());
    console.log(CommandTable.toString());
    const Commands: Pick<SlashCommandBuilder, "name" | "toJSON">[] = [];
    MusicBox.commands.forEach((command) => Commands.push(command.data));
    MusicBox.application?.commands.set(Commands);

    Logger.info(`Logged in as ${MusicBox.user?.tag}`);
    Logger.info("Sqlite DB loaded");

    MusicBox.musicManager.init(client.user?.id, {
        clientName: client.user?.username,
        clientId: client.user?.id,
    });

    MusicBox.user?.setActivity({
        name: "Closed Alpha Testing",
        type: ActivityType.Listening,
    });
}

export default new Event({
    name: Events.ClientReady,
    once: true,
    run: onReady,
});
