import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";
import MusicBoxClient from "../../MusicBox.js";
import { Metadata } from "./Metadata.js";

interface CommandOptions {
    data: Pick<SlashCommandBuilder, "name" | "toJSON" | "options" | "description">;
    devsOnly?: boolean | undefined;
    subCommands?: string[];
    metadata: Metadata;
    run?: (interaction: ChatInputCommandInteraction) => Promise<any>;
    autocomplete?: (interaction: AutocompleteInteraction, client: MusicBoxClient) => Promise<void>;
}

export default class Command {
    constructor(options: CommandOptions) {
        this.data = options.data;
        this.devsOnly = options.devsOnly;
        this.subCommands = options.subCommands || [];
        this.metadata = options.metadata;
        this.run = options.run;
        this.autocomplete = options.autocomplete;
    }

    public readonly data: Pick<SlashCommandBuilder, "name" | "toJSON" | "options" | "description">;
    public readonly devsOnly: boolean | undefined;
    public readonly subCommands: string[];
    public readonly metadata: Metadata;
    public readonly run?: (interaction: ChatInputCommandInteraction) => Promise<void>;
    public readonly autocomplete?: (
        interaction: AutocompleteInteraction,
        client: MusicBoxClient
    ) => Promise<void>;
}