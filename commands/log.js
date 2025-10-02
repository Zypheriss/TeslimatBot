const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');
const permissionManager = require('../utils/permissionManager');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Bot aktivite loglarını görüntüle')
        .addStringOption(option =>
            option.setName('tür')
                .setDescription('Hangi log türünü görmek istiyorsunuz?')
                .setRequired(false)
                .addChoices(
                    { name: 'Son Aktiviteler', value: 'son' },
                    { name: 'Hata Logları', value: 'hata' },
                    { name: 'Kod Kullanım Logları', value: 'kod' },
                    { name: 'Stok İşlem Logları', value: 'stok' },
                    { name: 'Sistem Logları', value: 'sistem' }
                ))
        .addIntegerOption(option =>
            option.setName('adet')
                .setDescription('Kaç adet log gösterilsin? (1-50)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(50)),

    async execute(interaction) {
        if (!(await permissionManager.checkPermission(interaction))) {
            return;
        }

        const tur = interaction.options.getString('tür') || 'son';
        const adet = interaction.options.getInteger('adet') || 10;

        switch (tur) {
            case 'son':
                await this.showSonAktiviteler(interaction, adet);
                break;
            case 'hata':
                await this.showHataLoglari(interaction, adet);
                break;
            case 'kod':
                await this.showKodLoglari(interaction, adet);
                break;
            case 'stok':
                await this.showStokLoglari(interaction, adet);
                break;
            case 'sistem':
                await this.showSistemLoglari(interaction, adet);
                break;
        }
    },

    async showSonAktiviteler(interaction, adet) {
        const logData = logger.getLogData();
        const sonAktiviteler = logData.aktiviteler || [];

        if (sonAktiviteler.length === 0) {
            return await interaction.reply({
                content: '❌ Henüz hiç aktivite logu bulunmuyor!',
                flags: 64
            });
        }

        const gosterilecekLoglar = sonAktiviteler.slice(-adet).reverse();
        
        const embed = new EmbedBuilder()
            .setTitle('📋 Son Aktiviteler')
            .setColor(0x3498DB)
            .setTimestamp();

        for (const log of gosterilecekLoglar) {
            const tarih = new Date(log.timestamp);
            const tarihStr = `<t:${Math.floor(tarih.getTime() / 1000)}:R>`;
            
            embed.addFields({
                name: `${log.emoji} ${log.action}`,
                value: `**Kullanıcı:** <@${log.userId}>\n**Zaman:** ${tarihStr}\n**Detay:** ${log.details || 'Detay yok'}`,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async showHataLoglari(interaction, adet) {
        const logData = logger.getLogData();
        const hataLoglari = logData.hatalar || [];

        if (hataLoglari.length === 0) {
            return await interaction.reply({
                content: '✅ Henüz hiç hata logu bulunmuyor!',
                flags: 64
            });
        }

        const gosterilecekHatalar = hataLoglari.slice(-adet).reverse();
        
        const embed = new EmbedBuilder()
            .setTitle('❌ Hata Logları')
            .setColor(0xE74C3C)
            .setTimestamp();

        for (const hata of gosterilecekHatalar) {
            const tarih = new Date(hata.timestamp);
            const tarihStr = `<t:${Math.floor(tarih.getTime() / 1000)}:R>`;
            
            embed.addFields({
                name: `🚨 ${hata.type}`,
                value: `**Zaman:** ${tarihStr}\n**Hata:** \`${hata.message}\`\n**Dosya:** ${hata.file || 'Bilinmiyor'}`,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async showKodLoglari(interaction, adet) {
        const logData = logger.getLogData();
        const stokData = dataManager.getStoklar();
        const kodLoglari = logData.kod || [];

        if (kodLoglari.length === 0) {
            return await interaction.reply({
                content: '❌ Henüz hiç kod kullanım logu bulunmuyor!',
                flags: 64
            });
        }

        const gosterilecekLoglar = kodLoglari.slice(-adet).reverse();
        
        const embed = new EmbedBuilder()
            .setTitle('🔑 Kod Kullanım Logları')
            .setColor(0x2ECC71)
            .setTimestamp();

        for (const log of gosterilecekLoglari) {
            const tarih = new Date(log.timestamp);
            const tarihStr = `<t:${Math.floor(tarih.getTime() / 1000)}:R>`;
            const kategori = stokData.kategoriler[log.kategoriId];
            const kategoriAdi = kategori ? `${kategori.emoji} ${kategori.name}` : 'Bilinmeyen';
            
            embed.addFields({
                name: `🎯 ${log.action}`,
                value: `**Kullanıcı:** <@${log.userId}>\n**Kod:** \`${log.kodSifre}\`\n**Kategori:** ${kategoriAdi}\n**Zaman:** ${tarihStr}`,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async showStokLoglari(interaction, adet) {
        const logData = logger.getLogData();
        const stokData = dataManager.getStoklar();
        const stokLoglari = logData.stok || [];

        if (stokLoglari.length === 0) {
            return await interaction.reply({
                content: '❌ Henüz hiç stok işlem logu bulunmuyor!',
                flags: 64
            });
        }

        const gosterilecekLoglar = stokLoglari.slice(-adet).reverse();
        
        const embed = new EmbedBuilder()
            .setTitle('📦 Stok İşlem Logları')
            .setColor(0xF39C12)
            .setTimestamp();

        for (const log of gosterilecekLoglari) {
            const tarih = new Date(log.timestamp);
            const tarihStr = `<t:${Math.floor(tarih.getTime() / 1000)}:R>`;
            const kategori = stokData.kategoriler[log.kategoriId];
            const kategoriAdi = kategori ? `${kategori.emoji} ${kategori.name}` : 'Bilinmeyen';
            
            embed.addFields({
                name: `📋 ${log.action}`,
                value: `**Kullanıcı:** <@${log.userId}>\n**Kategori:** ${kategoriAdi}\n**Detay:** ${log.details || 'Detay yok'}\n**Zaman:** ${tarihStr}`,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async showSistemLoglari(interaction, adet) {
        const logData = logger.getLogData();
        const sistemLoglari = logData.sistem || [];

        if (sistemLoglari.length === 0) {
            return await interaction.reply({
                content: '❌ Henüz hiç sistem logu bulunmuyor!',
                flags: 64
            });
        }

        const gosterilecekLoglar = sistemLoglari.slice(-adet).reverse();
        
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Sistem Logları')
            .setColor(0x9B59B6)
            .setTimestamp();

        for (const log of gosterilecekLoglari) {
            const tarih = new Date(log.timestamp);
            const tarihStr = `<t:${Math.floor(tarih.getTime() / 1000)}:R>`;
            
            embed.addFields({
                name: `🔧 ${log.type}`,
                value: `**Mesaj:** ${log.message}\n**Zaman:** ${tarihStr}`,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
