import { lstatSync, readdirSync } from "fs";
import MusicBoxClient from "../MusicBox.js";
import Command from "../module/structures/Command.js";
//@ts-ignore
import AsciiTable from "ascii-table";
export const CommandTable = new AsciiTable("Commands").setHeading("", "Name", "Status", "Note");
export default async function loadCommands(client: MusicBoxClient, dir: string) {
    let i = 1;
    async function loadCommand(root: string, item: string): Promise<any> {
        if (lstatSync(root + item).isDirectory()) {
            const newRoot = root + item + "/";

            return readdirSync(newRoot).forEach(async (item) => loadCommand(newRoot, item));
        }
        const command = (await import(`.${root}${item}`)).default as Command;
        if (!command || !command.data) {
            CommandTable.addRow(i.toString(), item.split(".")[0], "Error", "Cannot Load Data");
            i++;
            return;
        }

        client.commands.set(command.data.name, command);
        CommandTable.addRow(
            i.toString(),
            command.data.name,
            "Loaded",
            command.devsOnly ? "Dev" : ""
        );
        i++;
    }

    readdirSync(dir).forEach((item) => {
        loadCommand(dir, item);
    });
}
