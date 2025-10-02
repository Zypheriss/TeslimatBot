const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');
const cooldownManager = require('../utils/cooldownManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('Kendi profil bilgilerinizi görüntüleyin')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Başka bir kullanıcının profilini görüntüle (sadece yetkili)')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('kullanici') || interaction.user;
        const userId = targetUser.id;
        const isOwnProfile = targetUser.id === interaction.user.id;
        if (!isOwnProfile) {
            const config = require('../config.json');
            const hasPermission = config.authorizedRoles.some(roleId => 
                interaction.member.roles.cache.has(roleId)
            );

            if (!hasPermission) {
                return await interaction.reply({
                    content: '❌ Başka kullanıcıların profilini görüntülemek için yetkiniz bulunmuyor!',
                    flags: 64
                });
            }
        }

        await this.showUserProfile(interaction, targetUser, userId);
    },

    async showUserProfile(interaction, user, userId) {
        const cooldownData = dataManager.getCooldowns();
        const kullanici = cooldownData.kullanicilar[userId];
        const kullaniciAdi = user.username;
        const kullaniciId = user.id;
        const hesapOlusturma = user.createdAt;
        const sunucuyaKatilma = interaction.guild.members.cache.get(userId)?.joinedAt;
        let cooldownDurumu = '✅ Kod kullanabilir';
        let kalanSure = 0;
        
        try {
            if (cooldownManager.isOnCooldown(userId)) {
                kalanSure = cooldownManager.getRemainingTime(userId);
                const formatliSure = cooldownManager.formatTime(kalanSure);
                cooldownDurumu = `⏳ Cooldown aktif (${formatliSure})`;
            }
        } catch (error) {
            console.error('Cooldown kontrol hatası:', error);
            cooldownDurumu = '❓ Cooldown durumu bilinmiyor';
        }
        let sonKullanim = 'Hiç kullanılmamış';
        if (kullanici && kullanici.sonKullanim) {
            const sonKullanimTarihi = new Date(kullanici.sonKullanim);
            sonKullanim = `<t:${Math.floor(sonKullanimTarihi.getTime() / 1000)}:R>`;
        }
        const simdi = new Date();
        const hesapYasi = Math.floor((simdi - hesapOlusturma) / (1000 * 60 * 60 * 24));
        let sunucuSuresi = 'Bilinmiyor';
        if (sunucuyaKatilma) {
            const sunucuYasi = Math.floor((simdi - sunucuyaKatilma) / (1000 * 60 * 60 * 24));
            sunucuSuresi = `${sunucuYasi} gün`;
        }

        const embed = new EmbedBuilder()
            .setTitle(`👤 ${kullaniciAdi} Profili`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor(0x3498DB)
            .setTimestamp()
            .addFields(
                { name: '🆔 Kullanıcı ID', value: `\`${kullaniciId}\``, inline: true },
                { name: '📅 Hesap Oluşturma', value: `<t:${Math.floor(hesapOlusturma.getTime() / 1000)}:D>`, inline: true },
                { name: '⏰ Hesap Yaşı', value: `${hesapYasi} gün`, inline: true },
                { name: '🏠 Sunucuya Katılma', value: sunucuyaKatilma ? `<t:${Math.floor(sunucuyaKatilma.getTime() / 1000)}:D>` : 'Bilinmiyor', inline: true },
                { name: '📊 Sunucu Süresi', value: sunucuSuresi, inline: true },
                { name: '🎯 Cooldown Durumu', value: cooldownDurumu, inline: true },
                { name: '🕐 Son Kod Kullanımı', value: sonKullanim, inline: true }
            )
            .setFooter({ text: `Profil ID: ${userId}` });
        if (!kullanici) {
            embed.addFields({
                name: 'ℹ️ Bilgi',
                value: 'Bu kullanıcı henüz hiç kod kullanmamış.',
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
