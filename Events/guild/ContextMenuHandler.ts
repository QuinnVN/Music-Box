import { Colors, EmbedBuilder, Events, Interaction } from "discord.js";
import MusicBoxClient from "../../MusicBox.js";
import { BaseErrors } from "../../module/errors/index.js";
import Event from "../../module/structures/Events.js";

async function ContextMenuHandler(interaction: Interaction) {
  if (!interaction.isContextMenuCommand()) return;

  const MusicBox = interaction.client as MusicBoxClient;

  const contextMenu = MusicBox.contextMenus.get(interaction.commandName);
  console.log(contextMenu);
  if (!contextMenu) return;

  try {
    await contextMenu.run(interaction);
  } catch (error) {
    if (error instanceof BaseErrors.UserError)
      if (interaction.deferred) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Red)
              .setAuthor({
                name: error.message || "Error",
                iconURL: MusicBox.user?.displayAvatarURL(),
              })
              .setDescription(
                error.message +
                  (error instanceof BaseErrors.UserInputError
                    ? `\n\`\`\`${error.params}\`\`\``
                    : ""),
              ),
          ],
        });
      } else if (interaction.replied) {
        return interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Red)
              .setAuthor({
                name: error.message || "Error",
                iconURL: MusicBox.user?.displayAvatarURL(),
              })
              .setDescription(
                error.message +
                  (error instanceof BaseErrors.UserInputError
                    ? `\n\`\`\`${error.params}\`\`\``
                    : ""),
              ),
          ],
          ephemeral: true,
        });
      } else {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Red)
              .setAuthor({
                name: error.message || "Error",
                iconURL: MusicBox.user?.displayAvatarURL(),
              })
              .setDescription(
                error.message +
                  (error instanceof BaseErrors.UserInputError
                    ? `\n\`\`\`${error.params}\`\`\``
                    : ""),
              ),
          ],
          ephemeral: true,
        });
      }
  }
}

export default new Event({
  name: Events.InteractionCreate,
  run: ContextMenuHandler,
});
