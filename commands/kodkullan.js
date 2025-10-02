const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');
const cooldownManager = require('../utils/cooldownManager');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kodkullan')
        .setDescription('Kod kullanarak stok al')
        .addStringOption(option =>
            option.setName('kod')
                .setDescription('Kod şifresi')
                .setRequired(true)),

    async execute(interaction) {
        const kodSifre = interaction.options.getString('kod');
        const userId = interaction.user.id;
        if (cooldownManager.isOnCooldown(userId)) {
            const kalanSure = cooldownManager.getRemainingTime(userId);
            const formatliSure = cooldownManager.formatTime(kalanSure);
            
            return await interaction.reply({
                content: `⏳ Henüz tekrar kod kullanamazsınız! Kalan süre: **${formatliSure}**`,
                flags: 64 
            });
        }

        const kodData = dataManager.getKodlar();
        const stokData = dataManager.getStoklar();
        if (!kodData.aktifKodlar || !kodData.aktifKodlar[kodSifre]) {
            return await interaction.reply({
                content: '❌ Geçersiz kod!',
                flags: 64 
            });
        }

        const kod = kodData.aktifKodlar[kodSifre];
        const kategoriId = kod.kategoriId;
        const kategoriStoklar = stokData.stoklar[kategoriId] || [];
        if (kategoriStoklar.length === 0) {
            return await interaction.reply({
                content: '❌ Bu kategoride stok kalmamış!',
                flags: 64 
            });
        }
        const alinanStok = kategoriStoklar.shift();
        stokData.stoklar[kategoriId] = kategoriStoklar;
        kod.adet--;
        if (kod.adet <= 0) {
            delete kodData.aktifKodlar[kodSifre];
        }
        cooldownManager.setCooldown(userId);
        logger.logKod('Kod Kullanıldı', userId, kodSifre, kategoriId, `Stok alındı: ${alinanStok}`);
        logger.logActivity('Kod Kullanıldı', userId, `Kod: ${kodSifre}, Stok: ${alinanStok}`);
        dataManager.saveStoklar(stokData);
        dataManager.saveKodlar(kodData);
        try {
            const kategori = stokData.kategoriler[kategoriId];
            
            const dmEmbed = new EmbedBuilder()
                .setTitle('🎉 Stok Teslimatı')
                .setDescription('Kod kullanımınız başarılı!')
                .addFields(
                    { name: 'Kategori', value: `${kategori.emoji || '📦'} ${kategori.name}`, inline: true },
                    { name: 'Stok', value: `\`\`\`${alinanStok}\`\`\``, inline: false }
                )
                .setColor(0x00AE86)
                .setTimestamp();

            await interaction.user.send({ embeds: [dmEmbed] });

            await interaction.reply({
                content: '✅ Kod başarıyla kullanıldı! Stok DM üzerinden gönderildi.',
                flags: 64 
            });

        } catch (error) {
            await interaction.reply({
                content: `✅ Kod başarıyla kullanıldı!\n\n**Stoğunuz:**\n\`\`\`${alinanStok}\`\`\``,
                flags: 64 
            });
        }
    }
};