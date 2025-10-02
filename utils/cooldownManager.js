const dataManager = require('./dataManager');

class CooldownManager {
    isOnCooldown(userId) {
        const cooldowns = dataManager.getCooldowns();
        const kullanici = cooldowns.kullanicilar[userId];
        
        if (!kullanici) return false;
        
        const { dakika = 0, saat = 0 } = cooldowns.sureAyari;
        const cooldownMs = (saat * 60 * 60 * 1000) + (dakika * 60 * 1000);
        
        if (cooldownMs === 0) return false;
        
        const sonKullanim = new Date(kullanici.sonKullanim);
        const simdikiZaman = new Date();
        const fark = simdikiZaman - sonKullanim;
        
        return fark < cooldownMs;
    }

    getRemainingTime(userId) {
        const cooldowns = dataManager.getCooldowns();
        const kullanici = cooldowns.kullanicilar[userId];
        
        if (!kullanici) return 0;
        
        const { dakika = 0, saat = 0 } = cooldowns.sureAyari;
        const cooldownMs = (saat * 60 * 60 * 1000) + (dakika * 60 * 1000);
        
        const sonKullanim = new Date(kullanici.sonKullanim);
        const simdikiZaman = new Date();
        const fark = simdikiZaman - sonKullanim;
        const kalan = cooldownMs - fark;
        
        return Math.max(0, Math.ceil(kalan / 1000));
    }

    setCooldown(userId) {
        const cooldowns = dataManager.getCooldowns();
        
        if (!cooldowns.kullanicilar) {
            cooldowns.kullanicilar = {};
        }
        
        cooldowns.kullanicilar[userId] = {
            sonKullanim: new Date().toISOString()
        };
        
        dataManager.saveCooldowns(cooldowns);
    }

    setSureAyari(dakika, saat) {
        const cooldowns = dataManager.getCooldowns();
        cooldowns.sureAyari = { dakika, saat };
        dataManager.saveCooldowns(cooldowns);
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours} saat ${minutes} dakika`;
        } else if (minutes > 0) {
            return `${minutes} dakika ${remainingSeconds} saniye`;
        } else {
            return `${remainingSeconds} saniye`;
        }
    }
}

module.exports = new CooldownManager();