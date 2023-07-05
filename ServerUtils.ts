import { QuickDB } from "quick.db";
import { Client, ClientOptions, GatewayIntentBits } from "discord.js";
import loadCommands from "./Handlers/CommandLoader.js";
import Command from "./module/types/Command.js";
import loadEvents from "./Handlers/EventHandler.js";
import { readFileSync } from "fs";
import config from "./config.js";
import database from "./Handlers/DatabaseLoader.js";
import dotenv from "dotenv";
const package_json = JSON.parse(readFileSync("./package.json", "utf-8"));
dotenv.config();

interface ServerUtilsOptions extends ClientOptions {
    Version: number;
    Developers: string[];
    Config: object;
}

export default class ServerUtilsClient extends Client {
    constructor(options: ServerUtilsOptions) {
        super(options);

        this.config = options.Config || {
            colors: {
                default: "",
                success: "",
                fail: "",
                warning: "",
            },
        };
        this.developers = options.Developers;
        this.version = options.Version;

        this.db = database;

        this.commands = new Map();

        loadEvents(this, "./Events/");
        loadCommands(this, "./Commands/");
    }

    public readonly config: object;
    public readonly developers: string[];
    public readonly version: number;
    public readonly commands: Map<string, Command>;
    public readonly db: QuickDB;
}

const ServerUtils = new ServerUtilsClient({
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
    Version: package_json.version,
    Developers: ["735464638468063295"],
    Config: config,
});

ServerUtils.login(process.env.TOKEN);
