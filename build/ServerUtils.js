import { Client, GatewayIntentBits } from "discord.js";
import loadCommands from "./Handlers/CommandLoader.js";
import loadEvents from "./Handlers/EventHandler.js";
import { readFileSync } from "fs";
import config from "./config.js";
import database from "./Handlers/DatabaseLoader.js";
import dotenv from "dotenv";
import loadKazagumo from "./Handlers/MusicLoader.js";
const package_json = JSON.parse(readFileSync("./package.json", "utf-8"));
dotenv.config();
export default class ServerUtilsClient extends Client {
    constructor(options) {
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
        loadKazagumo(this, config.lavalinkNodes);
    }
    config;
    developers;
    version;
    commands;
    db;
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
