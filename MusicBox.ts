import { QuickDB, SqliteDriver } from "quick.db";
import {
    ActivityType,
    Client,
    ClientOptions,
    Collection,
    GatewayIntentBits,
    PresenceUpdateStatus,
    Status,
} from "discord.js";
import Command from "./module/structures/Command.js";
import { lstatSync, readFileSync, mkdirSync, existsSync } from "fs";
import config from "./config.js";
import dotenv from "dotenv";
import { Manager } from "erela.js";
import { MusicManager } from "./module/MusicManager.js";
import FastGlob from "fast-glob";
import { AsciiTable3 } from "ascii-table3";
import Event from "./module/structures/Events.js";
import SubCommand from "./module/structures/SubCommand.js";
import ExceptionHandler from "./module/ExceptionHandler.js";
import path from "path";
import { URL, fileURLToPath, pathToFileURL } from "url";
const package_json = JSON.parse(readFileSync("./package.json", "utf-8"));
dotenv.config();

interface MusicBoxOptions extends ClientOptions {
    version: number;
    developers: string[];
}

export default class MusicBoxClient extends Client {
    constructor(options: MusicBoxOptions) {
        super(options);
        this.developers = options.developers;
        this.version = options.version;
        this.db = this.loadDB(config.dataDirectory);

        this.commands = new Collection();
        this.subCommands = new Collection();
        this.CommandsTable = new AsciiTable3("Commands").setHeading("", "Name", "Status", "Note");
        this.EventsTable = new AsciiTable3("Events").setHeading("", "Name", "Status", "Note");

        ExceptionHandler.init(this);

        const __dirname = path.dirname(fileURLToPath(import.meta.url));

        this.loadCommands(this, FastGlob.convertPathToPattern(path.join(__dirname, "./Commands")));
        this.loadEvents(this, FastGlob.convertPathToPattern(path.join(__dirname, "./Events")));

        this.musicManager = new MusicManager(this, config.lavalinkNodes);
    }

    public readonly developers: string[];
    public readonly version: number;
    public readonly commands: Collection<string, Command>;
    public readonly subCommands: Collection<string, SubCommand>;
    public readonly db: QuickDB;
    public readonly musicManager: MusicManager;

    private async loadCommands(client: MusicBoxClient, dir: string) {
        let i = 1;
        FastGlob.globSync([`${dir}/**/*.js`, `${dir}/**/*.ts`]).forEach(async (item) => {
            const command = (await import(pathToFileURL(item).pathname)).default as Command;

            if (command.subCommands.length) {
                command.subCommands.forEach(async (subcmd) => {
                    const subCommand = (await import(pathToFileURL(item).pathname))[
                        subcmd
                    ] as SubCommand;
                    if (!subCommand || !subCommand.run) {
                        this.CommandsTable.addRow(
                            i.toString(),
                            `${command.data.name}.${subcmd}`,
                            "Error",
                            "Cannot Load Data/Run"
                        );
                    } else {
                        this.subCommands.set(`${command.data.name}.${subcmd}`, subCommand);
                        this.CommandsTable.addRow(
                            i.toString(),
                            `${command.data.name}.${subcmd}`,
                            "Loaded",
                            ""
                        );
                    }

                    i++;
                });
            }

            if (!command || !command.data || (!command.run && !command.subCommands.length)) {
                this.CommandsTable.addRow(
                    i.toString(),
                    item.split("/").find((x) => x.endsWith(".ts") || x.endsWith(".js")),
                    "Error",
                    "Cannot Load Data/Run"
                );
            } else {
                client.commands.set(command.data.name, command);
                this.CommandsTable.addRow(
                    i.toString(),
                    command.data.name,
                    "Loaded",
                    command.devsOnly ? "Dev" : ""
                );
            }
            i++;
        });
    }

    public readonly CommandsTable: AsciiTable3;

    private async loadEvents(client: MusicBoxClient, dir: string) {
        let i = 1;
        FastGlob.globSync([`${dir}/**/*.js`, `${dir}/**/*.ts`]).forEach(async (item) => {
            const event = (await import(pathToFileURL(item).pathname)).default as Event<any>;
            if (!event) {
                this.EventsTable.addRow(
                    i.toString(),
                    item
                        .split("/")
                        .filter((x) => x.endsWith(".ts") || x.endsWith(".js"))
                        .join("")
                        .split(".")[0],
                    "Error",
                    "Cannot Load Data"
                );
                i++;
                return;
            }

            if (event.once) {
                client.once(event.name, event.run);
                this.EventsTable.addRow(
                    i.toString(),
                    item
                        .split("/")
                        .filter((x) => x.endsWith(".ts") || x.endsWith(".js"))
                        .join("")
                        .split(".")[0],
                    "Loaded",
                    "Once"
                );
            } else {
                client.on(event.name, event.run);
                this.EventsTable.addRow(
                    i.toString(),
                    item
                        .split("/")
                        .filter((x) => x.endsWith(".ts") || x.endsWith(".js"))
                        .join("")
                        .split(".")[0],
                    "Loaded",
                    ""
                );
            }
            i++;
        });
    }

    public readonly EventsTable: AsciiTable3;

    private loadDB(dir: string): QuickDB {
        if (!existsSync(dir) || !lstatSync(dir).isDirectory()) {
            mkdirSync(dir);
        }

        const driver = new SqliteDriver(`${dir}/db.sqlite`);

        return new QuickDB({ driver });
    }
}

const MusicBox = new MusicBoxClient({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.Guilds,
    ],
    presence: {
        activities: [{ name: "🎶 Beta Testing", type: ActivityType.Playing }],
        status: PresenceUpdateStatus.Idle,
    },
    version: package_json.version,
    developers: ["735464638468063295"],
});

MusicBox.login(process.env.TOKEN);
