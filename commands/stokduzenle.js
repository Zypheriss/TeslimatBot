const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const dataManager = require("../utils/dataManager");
const permissionManager = require("../utils/permissionManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stokduzenle")
    .setDescription("Mevcut stokları düzenle veya sil")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("listele")
        .setDescription("Düzenlenebilir stokları listele")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("sil").setDescription("Belirli stokları sil")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("tasima")
        .setDescription("Stokları başka kategoriye taşı")
    ),

  async execute(interaction) {
    if (!(await permissionManager.checkPermission(interaction))) {
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "listele":
        await this.handleStokListele(interaction);
        break;
      case "sil":
        await this.handleStokSil(interaction);
        break;
      case "tasima":
        await this.handleStokTasima(interaction);
        break;
    }
  },

  async handleStokListele(interaction) {
    const stokData = dataManager.getStoklar();
    const kategoriler = stokData.kategoriler || {};
    const stoklar = stokData.stoklar || {};

    if (Object.keys(kategoriler).length === 0) {
      return await interaction.reply({
        content: "❌ Henüz hiç kategori eklenmemiş!",
        flags: 64,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("📦 Düzenlenebilir Stoklar")
      .setColor(0x3498db)
      .setTimestamp();

    for (const [kategoriId, kategori] of Object.entries(kategoriler)) {
      const kategoriStoklar = stoklar[kategoriId] || [];

      if (kategoriStoklar.length > 0) {
        const gosterilecekStoklar = kategoriStoklar.slice(0, 5);
        const stokListesi = gosterilecekStoklar
          .map((stok, index) => `${index + 1}. \`${stok}\``)
          .join("\n");

        const ekstraStok =
          kategoriStoklar.length > 5
            ? `\n... ve ${kategoriStoklar.length - 5} stok daha`
            : "";

        embed.addFields({
          name: `${kategori.emoji || "📦"} ${kategori.name} (${
            kategoriStoklar.length
          } adet)`,
          value: stokListesi + ekstraStok,
          inline: false,
        });
      } else {
        embed.addFields({
          name: `${kategori.emoji || "📦"} ${kategori.name}`,
          value: "❌ Bu kategoride stok bulunmuyor",
          inline: false,
        });
      }
    }

    await interaction.reply({ embeds: [embed] });
  },

  async handleStokSil(interaction) {
    const stokData = dataManager.getStoklar();
    const kategoriler = stokData.kategoriler || {};
    const stoklar = stokData.stoklar || {};
    const stokluKategoriler = Object.entries(kategoriler).filter(
      ([kategoriId]) => stoklar[kategoriId] && stoklar[kategoriId].length > 0
    );

    if (stokluKategoriler.length === 0) {
      return await interaction.reply({
        content: "❌ Silinecek stok bulunamadı!",
        flags: 64,
      });
    }

    const options = stokluKategoriler.map(([kategoriId, kategori]) => {
      const stokSayisi = stoklar[kategoriId].length;
      return {
        label: `${kategori.name} (${stokSayisi} stok)`,
        description: `Kategori ID: ${kategoriId}`,
        value: kategoriId,
        emoji: kategori.emoji,
      };
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("stok_sil_kategori_sec")
      .setPlaceholder("Stok silinecek kategoriyi seçin")
      .addOptions(options.slice(0, 25));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle("🗑️ Stok Silme")
      .setDescription("Aşağıdaki menüden stok silinecek kategoriyi seçin.")
      .setColor(0xff6b6b)
      .setFooter({ text: "Bu işlem geri alınamaz!" });

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: 64,
    });
  },

  async handleStokTasima(interaction) {
    const stokData = dataManager.getStoklar();
    const kategoriler = stokData.kategoriler || {};
    const stoklar = stokData.stoklar || {};
    const stokluKategoriler = Object.entries(kategoriler).filter(
      ([kategoriId]) => stoklar[kategoriId] && stoklar[kategoriId].length > 0
    );

    if (stokluKategoriler.length === 0) {
      return await interaction.reply({
        content: "❌ Taşınacak stok bulunamadı!",
        flags: 64,
      });
    }

    if (Object.keys(kategoriler).length < 2) {
      return await interaction.reply({
        content: "❌ Stok taşımak için en az 2 kategori olmalı!",
        flags: 64,
      });
    }

    const options = stokluKategoriler.map(([kategoriId, kategori]) => {
      const stokSayisi = stoklar[kategoriId].length;
      return {
        label: `${kategori.name} (${stokSayisi} stok)`,
        description: `Kategori ID: ${kategoriId}`,
        value: kategoriId,
        emoji: kategori.emoji,
      };
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("stok_tasima_kaynak_sec")
      .setPlaceholder("Stok taşınacak kaynak kategoriyi seçin")
      .addOptions(options.slice(0, 25));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle("📦 Stok Taşıma")
      .setDescription("Önce stok taşınacak kaynak kategoriyi seçin.")
      .setColor(0xf39c12)
      .setFooter({ text: "Adım 1/2" });

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: 64,
    });
  },
};

