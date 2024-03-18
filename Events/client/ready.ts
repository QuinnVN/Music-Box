import {
  ActivityType,
  Client,
  ContextMenuCommandBuilder,
  Events,
  SlashCommandBuilder,
} from "discord.js";
import MusicBoxClient from "../../MusicBox.js";
import Event from "../../module/structures/Event.js";
import Logger from "../../module/Logger.js";
import chalk from "chalk";

async function onReady(client: Client) {
  const MusicBox = client as MusicBoxClient;

  console.log(MusicBox.EventsTable.toString());
  console.log(MusicBox.CommandsTable.toString());
  console.log(MusicBox.ContextMenuTable.toString());
  const Commands: Pick<
    SlashCommandBuilder,
    "name" | "toJSON" | "options" | "description"
  >[] = [];
  const ContextMenus: Pick<ContextMenuCommandBuilder, "name" | "type">[] = [];
  MusicBox.commands.forEach((command) => Commands.push(command.data));
  MusicBox.contextMenus.forEach((contextMenu) =>
    ContextMenus.push(contextMenu.data),
  );
  MusicBox.application?.commands.set(
    Array.prototype.concat(Commands, ContextMenus),
  );

  Logger.info(`Logged in as ${chalk.bold(MusicBox.user?.tag)}`);
  Logger.info("Sqlite DB loaded");

  MusicBox.musicManager.init(client.user?.id, {
    clientName: client.user?.username,
    clientId: client.user?.id,
  });
}

export default new Event({
  name: Events.ClientReady,
  once: true,
  run: onReady,
});
