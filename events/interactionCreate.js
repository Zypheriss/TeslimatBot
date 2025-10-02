const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../utils/dataManager');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`${interaction.commandName} komutu bulunamadı.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error('❌ Komut hatası:', error.message);
                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ 
                            content: 'Bu komutu çalıştırırken bir hata oluştu!', 
                            flags: 64 
                        });
                    } else {
                        await interaction.reply({ 
                            content: 'Bu komutu çalıştırırken bir hata oluştu!', 
                            flags: 64 
                        });
                    }
                } catch (replyError) {
                    console.error('❌ Hata yanıtı gönderilemedi:', replyError.message);
                }
            }
        }
        else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'stok_kategori_sec') {
                await handleStokKategoriSec(interaction);
            } else if (interaction.customId === 'kod_kategori_sec') {
                await handleKodKategoriSec(interaction);
            } else if (interaction.customId === 'kategori_sil_sec') {
                await handleKategoriSilSec(interaction);
            }
        }
        else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'kategori_ekle_modal') {
                await handleKategoriEkleModal(interaction);
            } else if (interaction.customId === 'stok_ekle_modal') {
                await handleStokEkleModal(interaction);
            } else if (interaction.customId === 'kod_olustur_modal') {
                await handleKodOlusturModal(interaction);
            } else if (interaction.customId === 'cooldown_ayar_modal') {
                await handleCooldownAyarModal(interaction);
            }
        }
        else if (interaction.isButton()) {
            if (interaction.customId.startsWith('stok_sil_')) {
                await handleStokSilButton(interaction);
            } else if (interaction.customId.startsWith('stok_tasima_')) {
                await handleStokTasimaButton(interaction);
            } else if (interaction.customId.startsWith('help_')) {
                await handleHelpButton(interaction);
            }
        }
        } catch (error) {
            console.error('❌ Interaction işleme hatası:', error.message);
        }
    }
};

async function handleStokKategoriSec(interaction) {
    const kategoriId = interaction.values[0];
    
    const modal = new ModalBuilder()
        .setCustomId('stok_ekle_modal')
        .setTitle('Stok Ekle');

    const stokInput = new TextInputBuilder()
        .setCustomId('stok_input')
        .setLabel('Stokları Alt Alta Girin (Her satır 1 adet)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setPlaceholder('Stok 1\nStok 2\nStok 3...');

    const kategoriInput = new TextInputBuilder()
        .setCustomId('kategori_id')
        .setLabel('Kategori ID (Değiştirmeyin)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue(kategoriId);

    const firstRow = new ActionRowBuilder().addComponents(stokInput);
    const secondRow = new ActionRowBuilder().addComponents(kategoriInput);

    modal.addComponents(firstRow, secondRow);

    await interaction.showModal(modal);
}

async function handleKodKategoriSec(interaction) {
    const kategoriId = interaction.values[0];
    
    const modal = new ModalBuilder()
        .setCustomId('kod_olustur_modal')
        .setTitle('Kod Oluştur');

    const sifreInput = new TextInputBuilder()
        .setCustomId('kod_sifre')
        .setLabel('Kod Şifresi')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('github.com/zypheriss');

    const adetInput = new TextInputBuilder()
        .setCustomId('kod_adet')
        .setLabel('Kaç Kez Kullanılabilir')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('10');

    const kategoriInput = new TextInputBuilder()
        .setCustomId('kategori_id')
        .setLabel('Kategori ID (Değiştirmeyin)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue(kategoriId);

    const firstRow = new ActionRowBuilder().addComponents(sifreInput);
    const secondRow = new ActionRowBuilder().addComponents(adetInput);
    const thirdRow = new ActionRowBuilder().addComponents(kategoriInput);

    modal.addComponents(firstRow, secondRow, thirdRow);

    await interaction.showModal(modal);
}

async function handleKategoriSilSec(interaction) {
    try {
        const kategoriId = interaction.values[0];
        const stokData = dataManager.getStoklar();
        const kodData = dataManager.getKodlar();
        
        if (!stokData.kategoriler[kategoriId]) {
            return await interaction.update({
                content: '❌ Kategori bulunamadı!',
                embeds: [],
                components: []
            });
        }

        const kategori = stokData.kategoriler[kategoriId];
        const stokSayisi = stokData.stoklar[kategoriId] ? stokData.stoklar[kategoriId].length : 0;
        delete stokData.kategoriler[kategoriId];
        delete stokData.stoklar[kategoriId];
        let silinenKodSayisi = 0;
        if (kodData.aktifKodlar) {
            for (const [kodSifre, kodBilgi] of Object.entries(kodData.aktifKodlar)) {
                if (kodBilgi.kategoriId === kategoriId) {
                    delete kodData.aktifKodlar[kodSifre];
                    silinenKodSayisi++;
                }
            }
        }
        const stokKaydedildi = dataManager.saveStoklar(stokData);
        const kodKaydedildi = dataManager.saveKodlar(kodData);

        if (stokKaydedildi && kodKaydedildi) {
            const embed = new EmbedBuilder()
                .setTitle('✅ Kategori Başarıyla Silindi')
                .setDescription(`**${kategori.emoji} ${kategori.name}** kategorisi tamamen silindi.`)
                .addFields(
                    { name: '🗂️ Silinen Stok Sayısı', value: `${stokSayisi} adet`, inline: true },
                    { name: '🔑 Silinen Kod Sayısı', value: `${silinenKodSayisi} adet`, inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            await interaction.update({
                embeds: [embed],
                components: []
            });
        } else {
            await interaction.update({
                content: '❌ Kategori silinirken hata oluştu!',
                embeds: [],
                components: []
            });
        }

    } catch (error) {
        console.error('❌ Kategori silme hatası:', error.message);
        try {
            await interaction.update({
                content: '❌ Kategori silinirken hata oluştu!',
                embeds: [],
                components: []
            });
        } catch (replyError) {
            console.error('❌ Hata yanıtı gönderilemedi:', replyError.message);
        }
    }
}

async function handleKategoriEkleModal(interaction) {
    try {
    const name = interaction.fields.getTextInputValue('kategori_name');
    let emoji = interaction.fields.getTextInputValue('kategori_emoji') || '📦';

    if (emoji.match(/^:[^:]+:$/)) {
        const emojiName = emoji.slice(1, -1);
        const customEmoji = interaction.guild.emojis.cache.find(e => e.name === emojiName);
        if (customEmoji) {
            emoji = customEmoji.toString();
        }
    }

    const stokData = dataManager.getStoklar();
    
    if (!stokData.kategoriler) {
        stokData.kategoriler = {};
    }
    if (!stokData.stoklar) {
        stokData.stoklar = {};
    }

    const kategoriId = Date.now().toString();
    stokData.kategoriler[kategoriId] = {
        name: name,
        emoji: emoji,
        createdAt: new Date().toISOString()
    };
    stokData.stoklar[kategoriId] = [];

    if (dataManager.saveStoklar(stokData)) {
        const logger = require('../utils/logger');
        logger.logStok('Kategori Eklendi', interaction.user.id, kategoriId, `Kategori: ${name}, Emoji: ${emoji}`);
        logger.logActivity('Kategori Eklendi', interaction.user.id, `Kategori: ${name}, Emoji: ${emoji}`);
        
        await interaction.reply({
            content: `✅ Kategori başarıyla eklendi!\n**${emoji} ${name}**`,
            flags: 64 
        });
    } else {
        await interaction.reply({
            content: '❌ Kategori eklenirken hata oluştu!',
            flags: 64 
        });
    }
    } catch (error) {
        console.error('❌ Kategori ekleme hatası:', error.message);
        try {
            await interaction.reply({
                content: '❌ Kategori eklenirken hata oluştu!',
                flags: 64 
            });
        } catch (replyError) {
            console.error('❌ Hata yanıtı gönderilemedi:', replyError.message);
        }
    }
}

async function handleStokEkleModal(interaction) {
    try {
    const stokInput = interaction.fields.getTextInputValue('stok_input');
    const kategoriId = interaction.fields.getTextInputValue('kategori_id');

    const stoklar = stokInput.split('\n').filter(stok => stok.trim() !== '');

    if (stoklar.length === 0) {
        return await interaction.reply({
            content: '❌ En az bir stok girmelisiniz!',
            flags: 64 
        });
    }

    const stokData = dataManager.getStoklar();
    
    if (!stokData.stoklar[kategoriId]) {
        stokData.stoklar[kategoriId] = [];
    }

    stokData.stoklar[kategoriId].push(...stoklar);

    if (dataManager.saveStoklar(stokData)) {
        const kategori = stokData.kategoriler[kategoriId];
        const logger = require('../utils/logger');
        logger.logStok('Stok Eklendi', interaction.user.id, kategoriId, `${stoklar.length} adet stok eklendi`);
        logger.logActivity('Stok Eklendi', interaction.user.id, `Kategori: ${kategori.name}, Adet: ${stoklar.length}`);
        
        await interaction.reply({
            content: `✅ **${stoklar.length}** adet stok başarıyla eklendi!\n**Kategori:** ${kategori.emoji} ${kategori.name}`,
            flags: 64 
        });
    } else {
        await interaction.reply({
            content: '❌ Stoklar eklenirken hata oluştu!',
            flags: 64 
        });
    }
    } catch (error) {
        console.error('❌ Stok ekleme hatası:', error.message);
        try {
            await interaction.reply({
                content: '❌ Stoklar eklenirken hata oluştu!',
                flags: 64 
            });
        } catch (replyError) {
            console.error('❌ Hata yanıtı gönderilemedi:', replyError.message);
        }
    }
}

async function handleKodOlusturModal(interaction) {
    try {
    const kodSifre = interaction.fields.getTextInputValue('kod_sifre');
    const adetStr = interaction.fields.getTextInputValue('kod_adet');
    const kategoriId = interaction.fields.getTextInputValue('kategori_id');

    const adet = parseInt(adetStr);
    if (isNaN(adet) || adet <= 0) {
        return await interaction.reply({
            content: '❌ Geçerli bir adet sayısı girin!',
            flags: 64 
        });
    }

    const kodData = dataManager.getKodlar();
    const stokData = dataManager.getStoklar();

    if (!kodData.aktifKodlar) {
        kodData.aktifKodlar = {};
    }
    if (kodData.aktifKodlar[kodSifre]) {
        return await interaction.reply({
            content: '❌ Bu kod şifresi zaten kullanılıyor!',
            flags: 64 
        });
    }

    kodData.aktifKodlar[kodSifre] = {
        kategoriId: kategoriId,
        adet: adet,
        createdAt: new Date().toISOString(),
        createdBy: interaction.user.id
    };

        if (dataManager.saveKodlar(kodData)) {
            const kategori = stokData.kategoriler[kategoriId];
            const logger = require('../utils/logger');
            logger.logKod('Kod Oluşturuldu', interaction.user.id, kodSifre, kategoriId, `Adet: ${adet}`);
            logger.logActivity('Kod Oluşturuldu', interaction.user.id, `Kod: ${kodSifre}, Kategori: ${kategori.name}, Adet: ${adet}`);
            
            await interaction.reply({
                content: `✅ Kod başarıyla oluşturuldu!\n**Kod:** \`${kodSifre}\`\n**Kategori:** ${kategori.emoji} ${kategori.name}\n**Adet:** ${adet}`,
                flags: 64 
            });
        } else {
            await interaction.reply({
                content: '❌ Kod oluşturulurken hata oluştu!',
                flags: 64 
            });
        }
    } catch (error) {
        console.error('❌ Kod oluşturma hatası:', error.message);
        try {
            await interaction.reply({
                content: '❌ Kod oluşturulurken hata oluştu!',
                flags: 64 
            });
        } catch (replyError) {
            console.error('❌ Hata yanıtı gönderilemedi:', replyError.message);
        }
    }
}

async function handleCooldownAyarModal(interaction) {
    try {
        const dakikaStr = interaction.fields.getTextInputValue('dakika');
        const saatStr = interaction.fields.getTextInputValue('saat');

        const dakika = parseInt(dakikaStr);
        const saat = parseInt(saatStr);

        if (isNaN(dakika) || isNaN(saat) || dakika < 0 || dakika > 59 || saat < 0 || saat > 23) {
            return await interaction.reply({
                content: '❌ Geçersiz değerler! Dakika: 0-59, Saat: 0-23 arasında olmalı.',
                flags: 64
            });
        }

        const cooldownManager = require('../utils/cooldownManager');
        cooldownManager.setSureAyari(dakika, saat);

        let sureMetni = '';
        if (saat > 0 && dakika > 0) {
            sureMetni = `${saat} saat ${dakika} dakika`;
        } else if (saat > 0) {
            sureMetni = `${saat} saat`;
        } else if (dakika > 0) {
            sureMetni = `${dakika} dakika`;
        } else {
            sureMetni = 'Cooldown kapatıldı';
        }

        await interaction.reply({
            content: `✅ Cooldown süresi **${sureMetni}** olarak ayarlandı!`,
            flags: 64
        });

    } catch (error) {
        console.error('❌ Cooldown ayar modal hatası:', error.message);
        await interaction.reply({
            content: '❌ Cooldown ayarlanırken hata oluştu!',
            flags: 64
        });
    }
}

async function handleStokSilButton(interaction) {
    await interaction.reply({
        content: 'Stok silme işlemi henüz tamamlanmadı.',
        flags: 64
    });
}

async function handleStokTasimaButton(interaction) {
    await interaction.reply({
        content: 'Stok taşıma işlemi henüz tamamlanmadı.',
        flags: 64
    });
}

async function handleHelpButton(interaction) {
    const buttonId = interaction.customId;
    
    try {
        const yardimCommand = require('../commands/yardim');
        
        if (buttonId === 'help_kod') {
            await yardimCommand.showKodYardim(interaction);
        } else if (buttonId === 'help_stok') {
            await yardimCommand.showStokYardim(interaction);
        } else if (buttonId === 'help_istatistik') {
            await yardimCommand.showIstatistikYardim(interaction);
        } else {
            await interaction.reply({
                content: '❌ Bilinmeyen yardım kategorisi!',
                flags: 64
            });
        }
    } catch (error) {
        console.error('Yardım buton hatası:', error);
        await interaction.reply({
            content: '❌ Yardım gösterilirken hata oluştu!',
            flags: 64
        });
    }
}