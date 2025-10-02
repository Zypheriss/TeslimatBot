const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const dataManager = require('../utils/dataManager');
const permissionManager = require('../utils/permissionManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayar')
        .setDescription('Bot ayarlarını yönet')
        .addSubcommand(subcommand =>
            subcommand
                .setName('goster')
                .setDescription('Mevcut bot ayarlarını göster'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('cooldown')
                .setDescription('Cooldown süresini ayarla'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('yetki')
                .setDescription('Yetkili rolleri yönet'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('bot')
                .setDescription('Genel bot ayarlarını yönet')),

    async execute(interaction) {
        if (!(await permissionManager.checkPermission(interaction))) {
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'goster':
                await this.showAyarlar(interaction);
                break;
            case 'cooldown':
                await this.handleCooldownAyar(interaction);
                break;
            case 'yetki':
                await this.handleYetkiAyar(interaction);
                break;
            case 'bot':
                await this.handleBotAyar(interaction);
                break;
        }
    },

    async showAyarlar(interaction) {
        const cooldownData = dataManager.getCooldowns();
        const config = require('../config.json');
        const stokData = dataManager.getStoklar();
        const kodData = dataManager.getKodlar();
        const cooldownAyari = cooldownData.sureAyari || { dakika: 0, saat: 0 };
        const cooldownMetni = this.formatCooldownTime(cooldownAyari);
        const yetkiliRoller = config.authorizedRoles || [];
        const yetkiliRolMetni = yetkiliRoller.length > 0 
            ? yetkiliRoller.map(roleId => `<@&${roleId}>`).join(', ')
            : 'Hiç yetkili rol ayarlanmamış';
        const toplamKategori = Object.keys(stokData.kategoriler || {}).length;
        const toplamStok = Object.values(stokData.stoklar || {}).reduce((toplam, stoklar) => toplam + stoklar.length, 0);
        const toplamKod = Object.keys(kodData.aktifKodlar || {}).length;

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Bot Ayarları')
            .setColor(0x3498DB)
            .setTimestamp()
            .addFields(
                { name: '⏰ Cooldown Süresi', value: cooldownMetni, inline: true },
                { name: '🔐 Yetkili Roller', value: yetkiliRolMetni, inline: false },
                { name: '📊 Bot İstatistikleri', value: `Kategori: ${toplamKategori}\nStok: ${toplamStok}\nAktif Kod: ${toplamKod}`, inline: true },
                { name: '🤖 Bot ID', value: `\`${config.clientId}\``, inline: true },
                { name: '🏠 Sunucu ID', value: `\`${config.guildId}\``, inline: true }
            )
            .setFooter({ text: 'Ayar değiştirmek için /ayar komutlarını kullanın' });

        await interaction.reply({ embeds: [embed] });
    },

    async handleCooldownAyar(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('cooldown_ayar_modal')
            .setTitle('Cooldown Süresi Ayarla');

        const dakikaInput = new TextInputBuilder()
            .setCustomId('dakika')
            .setLabel('Dakika (0-59)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('5')
            .setMinLength(1)
            .setMaxLength(2);

        const saatInput = new TextInputBuilder()
            .setCustomId('saat')
            .setLabel('Saat (0-23)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('1')
            .setMinLength(1)
            .setMaxLength(2);

        const firstRow = new ActionRowBuilder().addComponents(dakikaInput);
        const secondRow = new ActionRowBuilder().addComponents(saatInput);

        modal.addComponents(firstRow, secondRow);

        await interaction.showModal(modal);
    },

    async handleYetkiAyar(interaction) {
        const config = require('../config.json');
        const yetkiliRoller = config.authorizedRoles || [];

        if (yetkiliRoller.length === 0) {
            return await interaction.reply({
                content: '❌ Henüz hiç yetkili rol ayarlanmamış!\n\n**Ayarlama:** `config.json` dosyasındaki `authorizedRoles` bölümünü düzenleyin.',
                flags: 64
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🔐 Yetkili Roller')
            .setDescription('Mevcut yetkili roller:')
            .setColor(0xE74C3C)
            .setTimestamp();

        for (let i = 0; i < yetkiliRoller.length; i++) {
            const roleId = yetkiliRoller[i];
            embed.addFields({
                name: `Rol ${i + 1}`,
                value: `<@&${roleId}> (\`${roleId}\`)`,
                inline: true
            });
        }

        embed.addFields({
            name: 'ℹ️ Bilgi',
            value: 'Yetkili rolleri değiştirmek için `config.json` dosyasını düzenleyin ve botu yeniden başlatın.',
            inline: false
        });

        await interaction.reply({ embeds: [embed] });
    },

    async handleBotAyar(interaction) {
        const config = require('../config.json');
        
        const embed = new EmbedBuilder()
            .setTitle('🤖 Bot Ayarları')
            .setColor(0x9B59B6)
            .setTimestamp()
            .addFields(
                { name: '🆔 Bot ID', value: `\`${config.clientId}\``, inline: true },
                { name: '🏠 Sunucu ID', value: `\`${config.guildId}\``, inline: true },
                { name: '🔑 Token', value: `\`${config.token.substring(0, 10)}...\``, inline: true }
            )
            .addFields({
                name: 'ℹ️ Bilgi',
                value: 'Bot ayarlarını değiştirmek için `config.json` dosyasını düzenleyin ve botu yeniden başlatın.\n\n**Dikkat:** Token değişikliği yaparken dikkatli olun!',
                inline: false
            });

        await interaction.reply({ embeds: [embed] });
    },

    formatCooldownTime(sureAyari) {
        if (!sureAyari) return 'Ayarlanmamış';
        
        const { dakika = 0, saat = 0 } = sureAyari;
        if (saat > 0 && dakika > 0) {
            return `${saat} saat ${dakika} dakika`;
        } else if (saat > 0) {
            return `${saat} saat`;
        } else if (dakika > 0) {
            return `${dakika} dakika`;
        } else {
            return 'Ayarlanmamış';
        }
    }
};

