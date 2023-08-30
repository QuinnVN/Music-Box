import { ActivityType, Client, Events, SlashCommandBuilder } from "discord.js";
import MusicBoxClient from "../../MusicBox.js";
import Event from "../../module/structures/Events.js";
import Logger from "../../module/Logger.js";
import chalk from "chalk";

async function onReady(client: Client) {

    const MusicBox = client as MusicBoxClient;

    console.log(MusicBox.EventsTable.toString());
    console.log(MusicBox.CommandsTable.toString());
    const Commands: Pick<SlashCommandBuilder, "name" | "toJSON" | "options" | 'description'>[] = [];
    MusicBox.commands.forEach((command) => Commands.push(command.data));
    MusicBox.application?.commands.set(Commands);

    Logger.info(`Logged in as ${chalk.bold(MusicBox.user?.tag)}`);
    Logger.info("Sqlite DB loaded");

    MusicBox.musicManager.init(client.user?.id, {
        clientName: client.user?.username,
        clientId: client.user?.id,
    });

    MusicBox.user?.setActivity({
        name: "Beta Testing",
        type: ActivityType.Listening,
    });
}

export default new Event({
    name: Events.ClientReady,
    once: true,
    run: onReady,
});
