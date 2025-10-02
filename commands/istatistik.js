const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');
const permissionManager = require('../utils/permissionManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('istatistik')
        .setDescription('Bot kullanım istatistiklerini görüntüle')
        .addStringOption(option =>
            option.setName('tür')
                .setDescription('Hangi istatistiği görmek istiyorsunuz?')
                .setRequired(false)
                .addChoices(
                    { name: 'Genel İstatistikler', value: 'genel' },
                    { name: 'Kod İstatistikleri', value: 'kod' },
                    { name: 'Stok İstatistikleri', value: 'stok' },
                    { name: 'Kullanıcı İstatistikleri', value: 'kullanici' }
                )),

    async execute(interaction) {
        const tur = interaction.options.getString('tür') || 'genel';
        
        if (tur === 'genel') {
            await this.showGenelIstatistik(interaction);
        } else if (tur === 'kod') {
            await this.showKodIstatistik(interaction);
        } else if (tur === 'stok') {
            await this.showStokIstatistik(interaction);
        } else if (tur === 'kullanici') {
            await this.showKullaniciIstatistik(interaction);
        }
    },

    async showGenelIstatistik(interaction) {
        const kodData = dataManager.getKodlar();
        const stokData = dataManager.getStoklar();
        const cooldownData = dataManager.getCooldowns();
        const toplamKod = Object.keys(kodData.aktifKodlar || {}).length;
        const toplamKategori = Object.keys(stokData.kategoriler || {}).length;
        let toplamStok = 0;
        for (const kategoriId in stokData.stoklar || {}) {
            toplamStok += (stokData.stoklar[kategoriId] || []).length;
        }
        const aktifKullanici = Object.keys(cooldownData.kullanicilar || {}).length;

        const embed = new EmbedBuilder()
            .setTitle('📊 Genel Bot İstatistikleri')
            .setColor(0x3498DB)
            .setTimestamp()
            .addFields(
                { name: '🔑 Aktif Kod Sayısı', value: `${toplamKod}`, inline: true },
                { name: '📦 Toplam Kategori', value: `${toplamKategori}`, inline: true },
                { name: '📋 Toplam Stok', value: `${toplamStok}`, inline: true },
                { name: '👥 Aktif Kullanıcı', value: `${aktifKullanici}`, inline: true },
                { name: '⚙️ Cooldown Süresi', value: this.formatCooldownTime(cooldownData.sureAyari), inline: true },
                { name: '🤖 Bot Durumu', value: '🟢 Çevrimiçi', inline: true }
            )
            .setFooter({ text: 'Son güncelleme' });

        await interaction.reply({ embeds: [embed] });
    },

    async showKodIstatistik(interaction) {
        const kodData = dataManager.getKodlar();
        const stokData = dataManager.getStoklar();
        const aktifKodlar = kodData.aktifKodlar || {};

        if (Object.keys(aktifKodlar).length === 0) {
            return await interaction.reply({
                content: '❌ Henüz hiç kod oluşturulmamış!',
                flags: 64
            });
        }

        let toplamKullanilabilir = 0;
        let kategoriKodlari = {};

        for (const [kodSifre, kod] of Object.entries(aktifKodlar)) {
            toplamKullanilabilir += kod.adet;
            
            const kategoriId = kod.kategoriId;
            if (!kategoriKodlari[kategoriId]) {
                kategoriKodlari[kategoriId] = 0;
            }
            kategoriKodlari[kategoriId] += kod.adet;
        }

        const embed = new EmbedBuilder()
            .setTitle('🔑 Kod İstatistikleri')
            .setColor(0xE74C3C)
            .setTimestamp()
            .addFields(
                { name: '📊 Toplam Aktif Kod', value: `${Object.keys(aktifKodlar).length}`, inline: true },
                { name: '🎯 Toplam Kullanılabilir', value: `${toplamKullanilabilir}`, inline: true }
            );
        for (const [kategoriId, adet] of Object.entries(kategoriKodlari)) {
            const kategori = stokData.kategoriler[kategoriId];
            if (kategori) {
                embed.addFields({
                    name: `${kategori.emoji || '📦'} ${kategori.name}`,
                    value: `${adet} kullanım hakkı`,
                    inline: true
                });
            }
        }

        await interaction.reply({ embeds: [embed] });
    },

    async showStokIstatistik(interaction) {
        const stokData = dataManager.getStoklar();
        const kategoriler = stokData.kategoriler || {};
        const stoklar = stokData.stoklar || {};

        if (Object.keys(kategoriler).length === 0) {
            return await interaction.reply({
                content: '❌ Henüz hiç kategori eklenmemiş!',
                flags: 64
            });
        }

        let toplamStok = 0;
        let enCokStokluKategori = { name: 'Yok', adet: 0 };
        let enAzStokluKategori = { name: 'Yok', adet: Infinity };

        const embed = new EmbedBuilder()
            .setTitle('📦 Stok İstatistikleri')
            .setColor(0x2ECC71)
            .setTimestamp();

        for (const [kategoriId, kategori] of Object.entries(kategoriler)) {
            const kategoriStoklar = stoklar[kategoriId] || [];
            const adet = kategoriStoklar.length;
            toplamStok += adet;

            if (adet > enCokStokluKategori.adet) {
                enCokStokluKategori = { name: kategori.name, adet: adet };
            }
            if (adet < enAzStokluKategori.adet) {
                enAzStokluKategori = { name: kategori.name, adet: adet };
            }

            embed.addFields({
                name: `${kategori.emoji || '📦'} ${kategori.name}`,
                value: `**${adet}** adet`,
                inline: true
            });
        }

        embed.addFields(
            { name: '📊 Toplam Stok', value: `${toplamStok}`, inline: true },
            { name: '📈 En Çok Stoklu', value: `${enCokStokluKategori.name} (${enCokStokluKategori.adet})`, inline: true },
            { name: '📉 En Az Stoklu', value: `${enAzStokluKategori.name} (${enAzStokluKategori.adet})`, inline: true }
        );

        await interaction.reply({ embeds: [embed] });
    },

    async showKullaniciIstatistik(interaction) {
        const cooldownData = dataManager.getCooldowns();
        const kullanicilar = cooldownData.kullanicilar || {};

        if (Object.keys(kullanicilar).length === 0) {
            return await interaction.reply({
                content: '❌ Henüz hiç kullanıcı aktivitesi bulunmuyor!',
                flags: 64
            });
        }
        const simdi = new Date();
        const son24Saat = new Date(simdi.getTime() - 24 * 60 * 60 * 1000);
        
        let son24SaatAktif = 0;
        let toplamKullanici = Object.keys(kullanicilar).length;

        for (const [userId, kullanici] of Object.entries(kullanicilar)) {
            const sonKullanim = new Date(kullanici.sonKullanim);
            if (sonKullanim > son24Saat) {
                son24SaatAktif++;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('👥 Kullanıcı İstatistikleri')
            .setColor(0x9B59B6)
            .setTimestamp()
            .addFields(
                { name: '👤 Toplam Kullanıcı', value: `${toplamKullanici}`, inline: true },
                { name: '🕐 Son 24 Saat Aktif', value: `${son24SaatAktif}`, inline: true },
                { name: '📊 Aktiflik Oranı', value: `%${Math.round((son24SaatAktif / toplamKullanici) * 100)}`, inline: true }
            );

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
