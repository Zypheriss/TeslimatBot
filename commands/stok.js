const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const dataManager = require("../utils/dataManager");
const permissionManager = require("../utils/permissionManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stok")
    .setDescription("Stok yönetimi")
    .addSubcommand((subcommand) =>
      subcommand.setName("gir").setDescription("Yeni stok ekle")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("kategori").setDescription("Yeni kategori ekle")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("listele").setDescription("Tüm stokları listele")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("adet").setDescription("Kategori adet sayıları")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (["gir", "kategori"].includes(subcommand)) {
      if (!(await permissionManager.checkPermission(interaction))) {
        return;
      }
    }

    switch (subcommand) {
      case "gir":
        await this.handleStokGir(interaction);
        break;
      case "kategori":
        await this.handleKategoriEkle(interaction);
        break;
      case "listele":
        await this.handleStokListele(interaction);
        break;
      case "adet":
        await this.handleAdetSayisi(interaction);
        break;
    }
  },

  async handleStokGir(interaction) {
    const stokData = dataManager.getStoklar();
    const kategoriler = stokData.kategoriler || {};

    if (Object.keys(kategoriler).length === 0) {
      return await interaction.reply({
        content:
          "❌ Henüz hiç kategori eklenmemiş! Önce `/stok kategori` komutu ile kategori ekleyin.",
        flags: 64,
      });
    }

    const options = Object.keys(kategoriler).map((kategoriId) => ({
      label: kategoriler[kategoriId].name,
      value: kategoriId,
      emoji: kategoriler[kategoriId].emoji,
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("stok_kategori_sec")
      .setPlaceholder("Stok eklenecek kategoriyi seçin")
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: "📦 Stok eklemek istediğiniz kategoriyi seçin:",
      components: [row],
      flags: 64,
    });
  },

  async handleKategoriEkle(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("kategori_ekle_modal")
      .setTitle("Yeni Kategori Ekle");

    const nameInput = new TextInputBuilder()
      .setCustomId("kategori_name")
      .setLabel("Kategori Adı")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const emojiInput = new TextInputBuilder()
      .setCustomId("kategori_emoji")
      .setLabel("Emoji (opsiyonel)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder("🎮");

    const firstRow = new ActionRowBuilder().addComponents(nameInput);
    const secondRow = new ActionRowBuilder().addComponents(emojiInput);

    modal.addComponents(firstRow, secondRow);

    await interaction.showModal(modal);
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
      .setTitle("📦 Stok Listesi")
      .setColor(0x00ae86)
      .setTimestamp();

    for (const [kategoriId, kategori] of Object.entries(kategoriler)) {
      const kategoriStoklar = stoklar[kategoriId] || [];
      const adet = kategoriStoklar.length;

      embed.addFields({
        name: `${kategori.emoji || "📦"} ${kategori.name}`,
        value: `**Adet:** ${adet}`,
        inline: true,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },

  async handleAdetSayisi(interaction) {
    await this.handleStokListele(interaction);
  },
};
