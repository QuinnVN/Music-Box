import {
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
} from "discord.js";

interface ContextMenuOptions {
  data: Pick<ContextMenuCommandBuilder, "name" | "toJSON" | "type">;
  run: (interaction: ContextMenuCommandInteraction) => Promise<any>;
}

export default class ContextMenu {
  constructor(options: ContextMenuOptions) {
    this.data = options.data;
    this.run = options.run;
  }

  public readonly data: Pick<
    ContextMenuCommandBuilder,
    "name" | "toJSON" | "type"
  >;
  public readonly run: (
    interaction: ContextMenuCommandInteraction,
  ) => Promise<any>;
}
