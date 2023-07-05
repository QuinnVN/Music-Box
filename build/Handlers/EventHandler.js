import { lstatSync, readdirSync } from "fs";
//@ts-ignore
import AsciiTable from "ascii-table";
export const EventTable = new AsciiTable("Events").setHeading("", "Name", "Status", "Note");
export default async function loadEvents(client, dir) {
    let i = 1;
    async function loadEvent(root, item) {
        if (lstatSync(root + item).isDirectory()) {
            const newRoot = root + item + "/";
            return readdirSync(newRoot).forEach(async (item) => loadEvent(newRoot, item));
        }
        const event = (await import(`.${root}${item}`)).default;
        if (!event)
            return EventTable.addRow(i.toString(), item.split(".")[0], "Error", "No Data");
        if (event.once) {
            client.once(event.name, event.run);
            EventTable.addRow(i.toString(), item.split(".")[0], "Loaded", "Once");
        }
        else {
            client.on(event.name, event.run);
            EventTable.addRow(i.toString(), item.split(".")[0], "Loaded", "");
        }
        i++;
    }
    readdirSync(dir).forEach((item) => {
        loadEvent(dir, item);
    });
}
