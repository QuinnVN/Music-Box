import { lstatSync, readdirSync } from "fs";
//@ts-ignore
import AsciiTable from "ascii-table";
export const CommandTable = new AsciiTable("Commands").setHeading("", "Name", "Status", "Note");
export default async function loadCommands(client, dir) {
    let i = 1;
    async function loadCommand(root, item) {
        if (lstatSync(root + item).isDirectory()) {
            const newRoot = root + item + "/";
            return readdirSync(newRoot).forEach(async (item) => loadCommand(newRoot, item));
        }
        const command = (await import(`.${root}${item}`)).default;
        if (!command)
            return CommandTable.addRow(i.toString(), item, "Error", "No Data");
        client.commands.set(command.data.name, command);
        CommandTable.addRow(i.toString(), command.data.name, "Loaded", command.devsOnly ? "Dev" : "");
        i++;
    }
    readdirSync(dir).forEach((item) => {
        loadCommand(dir, item);
    });
}
