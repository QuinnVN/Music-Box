import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import ContextMenu from "../module/structures/ContextMenu.js";
import { UserInputError } from "../module/errors/base.js";
import MusicBoxClient from "../MusicBox.js";
import { MusicErrors } from "../module/errors/index.js";
import config from "../config.js";
import { SearchResult } from "erela.js";

async function playContextMenu(interaction: ContextMenuCommandInteraction) {
  if (!interaction.isMessageContextMenuCommand()) return;
  if (!interaction.guild) return;

  const { content } = interaction.targetMessage;
  const MusicBox = interaction.client as MusicBoxClient;

  console.log(content);

  const regExp = new RegExp(
    "(\b(https?|ftp|file)://)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]",
  );

  const urls: string[] = [];
  const queries = content.replace(/\n/g, " ").split(" ");
  queries.forEach((query) => {
    const isURLs = regExp.exec(query);
    if (isURLs) isURLs.map((url) => urls.push(url));
  });
  console.log(urls);
  if (!urls || !urls.length)
    throw new UserInputError("No URL(s) found in this message");

  const vc = (await interaction.guild.members.fetch(interaction.user.id))!.voice
    .channel;
  if (!vc) throw new MusicErrors.NotInVoice();

  const player = MusicBox.musicManager.players.get(interaction.guildId!);
  if (!player) throw new MusicErrors.PlayerNotFound();
  urls.filter((url) => url !== undefined);
  await interaction.deferReply({ ephemeral: true });
  urls.forEach(async (url) => {
    let res: SearchResult;
    try {
      res = await player.search(url, interaction.user.id);
    } catch {
      throw new UserInputError("Cannot add song from this link(s)");
    }
    console.log(res);
    if (!res) return;
    if (res.loadType === "playlist")
      for (const track of res.tracks) player!.queue.add(track);
    else player!.queue.add(res.tracks[0]);

    interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setColor(config.pallete.default)
          .setDescription(
            res.loadType === "playlist"
              ? `Added **${res.tracks.length} tracks** from **${
                  res.playlist?.name || "Unknown Playlist"
                }** to the queue`
              : `Added **${res.tracks[0].title}** to the queue`,
          ),
      ],
      ephemeral: true,
    });
  });
}

export default new ContextMenu({
  data: new ContextMenuCommandBuilder()
    .setName("Add song from link (BETA)")
    .setType(ApplicationCommandType.Message),
  run: playContextMenu,
});
