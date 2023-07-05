import { Events } from "discord.js";
import Event from "../../module/types/Events.js";
import { EventTable } from "../../Handlers/EventHandler.js";
import { CommandTable } from "../../Handlers/CommandLoader.js";
import Logger from "../../module/Logger.js";
async function onReady(client) {
    const ServerUtils = client;
    console.log(EventTable.toString());
    console.log(CommandTable.toString());
    const Commands = [];
    ServerUtils.commands.forEach((command) => Commands.push(command.data));
    ServerUtils.application?.commands.set(Commands);
    Logger.info(`Logged in as ${ServerUtils.user?.tag}`);
    Logger.info("Sqlite DB loaded");
}
export default new Event({
    name: Events.ClientReady,
    once: true,
    run: onReady,
});
