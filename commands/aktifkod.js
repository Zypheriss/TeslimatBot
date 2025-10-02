const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');
const permissionManager = require('../utils/permissionManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aktifkod')
        .setDescription('Aktif kodları görüntüle'),

    async execute(interaction) {
        if (!(await permissionManager.checkPermission(interaction))) {
            return;
        }

        const kodData = dataManager.getKodlar();
        const stokData = dataManager.getStoklar();
        const aktifKodlar = kodData.aktifKodlar || {};
        const kategoriler = stokData.kategoriler || {};

        if (Object.keys(aktifKodlar).length === 0) {
            return await interaction.reply({
                content: '❌ Aktif kod bulunmuyor!',
                flags: 64 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🔑 Aktif Kodlar')
            .setColor(0x3498DB)
            .setTimestamp();

        for (const [kodSifre, kod] of Object.entries(aktifKodlar)) {
            const kategori = kategoriler[kod.kategoriId];
            const kategoriAdi = kategori ? `${kategori.emoji || '📦'} ${kategori.name}` : 'Bilinmeyen Kategori';
            
            embed.addFields({
                name: `Kod: ${kodSifre}`,
                value: `**Kategori:** ${kategoriAdi}\n**Kalan Adet:** ${kod.adet}`,
                inline: true
            });
        }

        await interaction.reply({ embeds: [embed], flags: 64 }); 
    }
};