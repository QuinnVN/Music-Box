import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { Metadata } from "./Metadata.js";
import MusicBoxClient from "../../MusicBox.js";

interface SubCommandOptions {
    run: (interaction: ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction, client: MusicBoxClient) => Promise<void>;
}

export default class SubCommand {
    constructor(options: SubCommandOptions) {
        this.run = options.run;
        this.autocomplete = options.autocomplete;
    }
    public readonly run: (interaction: ChatInputCommandInteraction) => Promise<void>;
    public readonly autocomplete?: (
        interaction: AutocompleteInteraction,
        client: MusicBoxClient
    ) => Promise<void>;
}
