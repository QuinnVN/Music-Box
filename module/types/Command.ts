import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";

interface CommandOptions {
    data: SlashCommandBuilder;
    devsOnly?: boolean | undefined;

    run: (interaction: ChatInputCommandInteraction) => Promise<any>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<any>;
}

export default class Command {
    constructor(options: CommandOptions) {
        this.data = options.data;
        this.devsOnly = options.devsOnly;
        this.run = options.run;
        this.autocomplete = options.autocomplete;
    }

    public readonly data: SlashCommandBuilder;
    public readonly devsOnly: boolean | undefined;
    public readonly run: (interaction: ChatInputCommandInteraction) => Promise<any>;
    public readonly autocomplete?: (interaction: AutocompleteInteraction) => Promise<any>
}
