const { SlashCommandBuilder } = require('discord.js');
const cooldownManager = require('../utils/cooldownManager');
const permissionManager = require('../utils/permissionManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sure')
        .setDescription('Kod kullanımı arasındaki bekleme süresini ayarla')
        .addStringOption(option =>
            option.setName('zaman')
                .setDescription('Süre (örn: "5 dk", "2 saat", "1 saat 30 dk")')
                .setRequired(true)),

    async execute(interaction) {
        if (!(await permissionManager.checkPermission(interaction))) {
            return;
        }

        const zamanStr = interaction.options.getString('zaman').toLowerCase();
        let dakika = 0;
        let saat = 0;
        const saatMatch = zamanStr.match(/(\d+)\s*saat/);
        if (saatMatch) {
            saat = parseInt(saatMatch[1]);
        }
        const dakikaMatch = zamanStr.match(/(\d+)\s*dk|(\d+)\s*dakika/);
        if (dakikaMatch) {
            dakika = parseInt(dakikaMatch[1] || dakikaMatch[2]);
        }
        if (saat === 0 && dakika === 0) {
            return await interaction.reply({
                content: '❌ Geçersiz zaman formatı! Örnek kullanım: `5 dk`, `2 saat`, `1 saat 30 dk`',
                flags: 64 
            });
        }
        cooldownManager.setSureAyari(dakika, saat);

        let sureMetni = '';
        if (saat > 0 && dakika > 0) {
            sureMetni = `${saat} saat ${dakika} dakika`;
        } else if (saat > 0) {
            sureMetni = `${saat} saat`;
        } else {
            sureMetni = `${dakika} dakika`;
        }

        await interaction.reply({
            content: `✅ Kod kullanımı arasındaki bekleme süresi **${sureMetni}** olarak ayarlandı!`,
            flags: 64 
        });
    }
};