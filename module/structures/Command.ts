import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";
import MusicBoxClient from "../../MusicBox.js";

interface CommandOptions {
    data: Pick<SlashCommandBuilder, "name" | "toJSON">;
    devsOnly?: boolean | undefined;

    run: (interaction: ChatInputCommandInteraction) => Promise<any>;
    autocomplete?: (interaction: AutocompleteInteraction, client: MusicBoxClient) => Promise<any>;
}

export default class Command {
    constructor(options: CommandOptions) {
        this.data = options.data;
        this.devsOnly = options.devsOnly;
        this.run = options.run;
        this.autocomplete = options.autocomplete;
    }

    public readonly data: Pick<SlashCommandBuilder, "name" | "toJSON">;
    public readonly devsOnly: boolean | undefined;
    public readonly run: (interaction: ChatInputCommandInteraction) => Promise<any>;
    public readonly autocomplete?: (
        interaction: AutocompleteInteraction,
        client: MusicBoxClient
    ) => Promise<any>;
}
