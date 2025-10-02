const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const dataManager = require("../utils/dataManager");
const logger = require("../utils/logger");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sistem")
    .setDescription("Bot ve sistem durumu hakkında bilgi alın"),

  async execute(interaction) {
    await this.showSistemDurumu(interaction);
  },

  async showSistemDurumu(interaction) {
    try {
      const botUptime = process.uptime();
      const botUptimeStr = this.formatUptime(botUptime);
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsage = ((usedMem / totalMem) * 100).toFixed(2);
      const stokData = dataManager.getStoklar();
      const kodData = dataManager.getKodlar();
      const cooldownData = dataManager.getCooldowns();
      const logStats = logger.getLogStats();
      const toplamKategori = Object.keys(stokData.kategoriler || {}).length;
      const toplamStok = Object.values(stokData.stoklar || {}).reduce(
        (sum, stoklar) => sum + stoklar.length,
        0
      );
      const toplamKod = Object.keys(kodData.aktifKodlar || {}).length;
      const aktifKullanici = Object.keys(
        cooldownData.kullanicilar || {}
      ).length;
      const nodeVersion = process.version;
      const discordVersion = require("discord.js").version;

      const embed = new EmbedBuilder()
        .setTitle("🖥️ Sistem Durumu")
        .setColor(0x00ae86)
        .setTimestamp()
        .addFields(
          { name: "🤖 Bot Durumu", value: "🟢 Çevrimiçi", inline: true },
          { name: "⏰ Çalışma Süresi", value: botUptimeStr, inline: true },
          { name: "💾 Bellek Kullanımı", value: `${memUsage}%`, inline: true },
          {
            name: "📊 Bot İstatistikleri",
            value: `Kategori: ${toplamKategori}\nStok: ${toplamStok}\nKod: ${toplamKod}\nKullanıcı: ${aktifKullanici}`,
            inline: true,
          },
          {
            name: "📝 Log İstatistikleri",
            value: `Aktivite: ${logStats.aktiviteler}\nHata: ${logStats.hatalar}\nSistem: ${logStats.sistem}\nToplam: ${logStats.toplam}`,
            inline: true,
          },
          {
            name: "🔧 Teknik Bilgiler",
            value: `Node.js: ${nodeVersion}\nDiscord.js: v${discordVersion}\nPlatform: ${os.platform()}`,
            inline: true,
          }
        )
        .setFooter({ text: "Son güncelleme" });
      const healthStatus = this.getHealthStatus(memUsage, botUptime);
      embed.addFields({
        name: "🏥 Sistem Sağlığı",
        value: healthStatus,
        inline: false,
      });

      await interaction.reply({ embeds: [embed] });
      logger.logSystem(
        "Sistem Durumu",
        `Sistem durumu sorgulandı - Bellek: ${memUsage}%, Uptime: ${botUptimeStr}`
      );
    } catch (error) {
      console.error("Sistem durumu hatası:", error);
      logger.logError("Sistem Durumu Hatası", error.message, "sistem.js");

      await interaction.reply({
        content: "❌ Sistem durumu alınırken hata oluştu!",
        flags: 64,
      });
    }
  },

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days} gün ${hours} saat`;
    } else if (hours > 0) {
      return `${hours} saat ${minutes} dakika`;
    } else if (minutes > 0) {
      return `${minutes} dakika ${secs} saniye`;
    } else {
      return `${secs} saniye`;
    }
  },

  getHealthStatus(memUsage, uptime) {
    let status = "";
    let emoji = "";

    if (memUsage > 90) {
      status = "🔴 Kritik - Yüksek bellek kullanımı";
      emoji = "🔴";
    } else if (memUsage > 75) {
      status = "🟡 Uyarı - Orta bellek kullanımı";
      emoji = "🟡";
    } else if (uptime < 300) {
      // 5 dakikadan az
      status = "🟡 Uyarı - Bot yeni başlatılmış";
      emoji = "🟡";
    } else {
      status = "🟢 Sağlıklı - Normal çalışma";
      emoji = "🟢";
    }

    return `${emoji} ${status}`;
  },
};

