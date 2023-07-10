import { QuickDB } from "quick.db";
import { Client, ClientOptions, GatewayIntentBits } from "discord.js";
import loadCommands from "./Handlers/CommandLoader.js";
import Command from "./module/types/Command.js";
import loadEvents from "./Handlers/EventHandler.js";
import { readFileSync } from "fs";
import config from "./config.js";
import database from "./Handlers/DatabaseLoader.js";
import dotenv from "dotenv";
import { Manager } from "erela.js";
import { MusicManager } from "./Handlers/MusicLoader.js";
const package_json = JSON.parse(readFileSync("./package.json", "utf-8"));
dotenv.config();

interface MusicBoxOptions extends ClientOptions {
    Version: number;
    Developers: string[];
}

export default class MusicBoxClient extends Client {
    constructor(options: MusicBoxOptions) {
        super(options);
        this.developers = options.Developers;
        this.version = options.Version;

        this.db = database;

        this.commands = new Map();

        loadEvents(this, "./Events/");
        loadCommands(this, "./Commands/");
        this.musicManager = new MusicManager(this, config.lavalinkNodes);
    }

    public readonly developers: string[];
    public readonly version: number;
    public readonly commands: Map<string, Command>;
    public readonly db: QuickDB;
    public readonly musicManager: Manager;
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
    Version: package_json.version,
    Developers: ["735464638468063295"],
});

MusicBox.login(process.env.TOKEN);
