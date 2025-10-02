const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardim')
        .setDescription('Bot komutları hakkında yardım alın')
        .addStringOption(option =>
            option.setName('komut')
                .setDescription('Hangi komut hakkında yardım istiyorsunuz?')
                .setRequired(false)
                .addChoices(
                    { name: 'Genel Yardım', value: 'genel' },
                    { name: 'Kod Komutları', value: 'kod' },
                    { name: 'Stok Komutları', value: 'stok' },
                    { name: 'İstatistik Komutları', value: 'istatistik' },
                    { name: 'Yönetim Komutları', value: 'yonetim' }
                )),

    async execute(interaction) {
        const komut = interaction.options.getString('komut') || 'genel';

        switch (komut) {
            case 'genel':
                await this.showGenelYardim(interaction);
                break;
            case 'kod':
                await this.showKodYardim(interaction);
                break;
            case 'stok':
                await this.showStokYardim(interaction);
                break;
            case 'istatistik':
                await this.showIstatistikYardim(interaction);
                break;
            case 'yonetim':
                await this.showYonetimYardim(interaction);
                break;
        }
    },

    async showGenelYardim(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🤖 Teslimat Botu - Genel Yardım')
            .setDescription('Bu bot ile kod tabanlı stok teslimat sistemi yönetebilirsiniz.')
            .setColor(0x3498DB)
            .setTimestamp()
            .addFields(
                { name: '🔑 Kod Komutları', value: '`/kod` - Kod oluştur\n`/kodkullan` - Kod kullan\n`/aktifkod` - Aktif kodları gör', inline: true },
                { name: '📦 Stok Komutları', value: '`/stok` - Stok yönetimi\n`/stokduzenle` - Stok düzenle', inline: true },
                { name: '📊 İstatistik Komutları', value: '`/istatistik` - Bot istatistikleri\n`/profil` - Kullanıcı profili', inline: true },
                { name: '⚙️ Yönetim Komutları', value: '`/ayar` - Bot ayarları\n`/log` - Aktivite logları\n`/sure` - Cooldown ayarla', inline: true },
                { name: 'ℹ️ Bilgi', value: 'Daha detaylı yardım için `/yardim komut:[komut_adı]` kullanın.', inline: false }
            )
            .setFooter({ text: 'Bot versiyonu: 2.0 | Geliştirici: Zypheris' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_kod')
                    .setLabel('Kod Komutları')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔑'),
                new ButtonBuilder()
                    .setCustomId('help_stok')
                    .setLabel('Stok Komutları')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📦'),
                new ButtonBuilder()
                    .setCustomId('help_istatistik')
                    .setLabel('İstatistik')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📊')
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },

    async showKodYardim(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🔑 Kod Komutları Yardımı')
            .setColor(0xE74C3C)
            .setTimestamp()
            .addFields(
                { name: '/kod', value: '**Açıklama:** Yeni kod oluşturur\n**Yetki:** Yönetici\n**Kullanım:** Kategori seçip kod şifresi ve adet girin', inline: false },
                { name: '/kodkullan', value: '**Açıklama:** Mevcut kodu kullanarak stok alır\n**Yetki:** Herkes\n**Kullanım:** `/kodkullan kod:ŞİFRE`', inline: false },
                { name: '/aktifkod', value: '**Açıklama:** Aktif kodları listeler\n**Yetki:** Yönetici\n**Kullanım:** Direkt komutu çalıştırın', inline: false },
                { name: '💡 İpuçları', value: '• Kodlar tek kullanımlık değil, belirlenen adet kadar kullanılabilir\n• Cooldown süresi `/sure` komutu ile ayarlanabilir\n• Stoklar DM ile gönderilir', inline: false }
            );

        await interaction.reply({ embeds: [embed] });
    },

    async showStokYardim(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📦 Stok Komutları Yardımı')
            .setColor(0x2ECC71)
            .setTimestamp()
            .addFields(
                { name: '/stok kategori', value: '**Açıklama:** Yeni kategori oluşturur\n**Yetki:** Yönetici\n**Kullanım:** Kategori adı ve emoji girin', inline: false },
                { name: '/stok gir', value: '**Açıklama:** Kategoriye stok ekler\n**Yetki:** Yönetici\n**Kullanım:** Kategori seçip stokları alt alta girin', inline: false },
                { name: '/stok listele', value: '**Açıklama:** Tüm stokları listeler\n**Yetki:** Herkes\n**Kullanım:** Direkt komutu çalıştırın', inline: false },
                { name: '/stokduzenle', value: '**Açıklama:** Stokları düzenler veya siler\n**Yetki:** Yönetici\n**Kullanım:** Alt komutları kullanın', inline: false },
                { name: '💡 İpuçları', value: '• Stoklar kategori bazlı organize edilir\n• Her satır bir stok olarak sayılır\n• Stoklar sırayla dağıtılır (FIFO)', inline: false }
            );

        await interaction.reply({ embeds: [embed] });
    },

    async showIstatistikYardim(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📊 İstatistik Komutları Yardımı')
            .setColor(0x9B59B6)
            .setTimestamp()
            .addFields(
                { name: '/istatistik', value: '**Açıklama:** Bot kullanım istatistiklerini gösterir\n**Yetki:** Herkes\n**Alt Seçenekler:** genel, kod, stok, kullanici', inline: false },
                { name: '/profil', value: '**Açıklama:** Kullanıcı profil bilgilerini gösterir\n**Yetki:** Herkes (başka kullanıcı için yönetici)\n**Kullanım:** `/profil` veya `/profil kullanici:@kullanici`', inline: false },
                { name: '📈 İstatistik Türleri', value: '• **Genel:** Toplam sayılar ve bot durumu\n• **Kod:** Aktif kodlar ve dağılım\n• **Stok:** Kategori bazlı stok analizi\n• **Kullanıcı:** Aktif kullanıcı istatistikleri', inline: false }
            );

        await interaction.reply({ embeds: [embed] });
    },

    async showYonetimYardim(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Yönetim Komutları Yardımı')
            .setColor(0xF39C12)
            .setTimestamp()
            .addFields(
                { name: '/ayar', value: '**Açıklama:** Bot ayarlarını yönetir\n**Yetki:** Yönetici\n**Alt Seçenekler:** goster, cooldown, yetki, bot', inline: false },
                { name: '/log', value: '**Açıklama:** Bot aktivite loglarını gösterir\n**Yetki:** Yönetici\n**Alt Seçenekler:** son, hata, kod, stok, sistem', inline: false },
                { name: '/sure', value: '**Açıklama:** Kod kullanım cooldown süresini ayarlar\n**Yetki:** Yönetici\n**Kullanım:** `/sure zaman:"5 dk"`', inline: false },
                { name: '/sil', value: '**Açıklama:** Kategorileri siler\n**Yetki:** Yönetici\n**Kullanım:** Silinecek kategoriyi seçin', inline: false },
                { name: '🔧 Ayar Türleri', value: '• **Cooldown:** Kod kullanım arası bekleme süresi\n• **Yetki:** Hangi rollerin yönetim yapabileceği\n• **Bot:** Genel bot ayarları', inline: false }
            );

        await interaction.reply({ embeds: [embed] });
    }
};

