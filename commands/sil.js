const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Aktif kategorileri sil'),

    async execute(interaction) {
        try {
            const hasPermission = config.authorizedRoles.some(roleId => 
                interaction.member.roles.cache.has(roleId)
            );

            if (!hasPermission) {
                return await interaction.reply({
                    content: '❌ Bu komutu kullanmak için yetkiniz bulunmuyor!',
                    flags: 64
                });
            }

            const stokData = dataManager.getStoklar();
            
            if (!stokData.kategoriler || Object.keys(stokData.kategoriler).length === 0) {
                return await interaction.reply({
                    content: '❌ Silinecek kategori bulunamadı!',
                    flags: 64 
                });
            }
            const options = Object.entries(stokData.kategoriler).map(([id, kategori]) => {
                const stokSayisi = stokData.stoklar[id] ? stokData.stoklar[id].length : 0;
                return {
                    label: `${kategori.name} (${stokSayisi} stok)`,
                    description: `Kategori ID: ${id}`,
                    value: id,
                    emoji: kategori.emoji
                };
            });
            if (options.length > 25) {
                options.splice(25);
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('kategori_sil_sec')
                .setPlaceholder('Silmek istediğiniz kategoriyi seçin')
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const embed = new EmbedBuilder()
                .setTitle('🗑️ Kategori Silme')
                .setDescription('Aşağıdaki menüden silmek istediğiniz kategoriyi seçin.\n\n⚠️ **DİKKAT:** Bu işlem geri alınamaz!')
                .setColor(0xFF6B6B)
                .setFooter({ text: 'Kategori silindiğinde tüm stokları da silinecektir!' });

            await interaction.reply({
                embeds: [embed],
                components: [row],
                flags: 64 
            });

        } catch (error) {
            console.error('❌ Sil komutu hatası:', error.message);
            await interaction.reply({
                content: '❌ Komut çalıştırılırken bir hata oluştu!',
                flags: 64 
            });
        }
    }
};