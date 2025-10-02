const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');
const permissionManager = require('../utils/permissionManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kod')
        .setDescription('Kod oluştur'),

    async execute(interaction) {
        if (!(await permissionManager.checkPermission(interaction))) {
            return;
        }

        const stokData = dataManager.getStoklar();
        const kategoriler = stokData.kategoriler || {};

        if (Object.keys(kategoriler).length === 0) {
            return await interaction.reply({
                content: '❌ Henüz hiç kategori eklenmemiş! Önce `/stok kategori` komutu ile kategori ekleyin.',
                flags: 64
            });
        }

        const options = Object.keys(kategoriler).map(kategoriId => ({
            label: kategoriler[kategoriId].name,
            value: kategoriId,
            emoji: kategoriler[kategoriId].emoji
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('kod_kategori_sec')
            .setPlaceholder('Kod için kategori seçin')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: '🔑 Kod oluşturmak istediğiniz kategoriyi seçin:',
            components: [row],
            flags: 64
        });
    }
};