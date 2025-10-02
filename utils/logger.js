const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logPath = path.join(__dirname, '..', 'data', 'loglar.json');
        this.maxLogs = 1000;
    }
    getLogData() {
        try {
            if (!fs.existsSync(this.logPath)) {
                return { aktiviteler: [], hatalar: [], sistem: [], kod: [], stok: [] };
            }
            const data = fs.readFileSync(this.logPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Log verisi okuma hatası:', error);
            return { aktiviteler: [], hatalar: [], sistem: [], kod: [], stok: [] };
        }
    }
    saveLogData(data) {
        try {
            fs.writeFileSync(this.logPath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('Log verisi yazma hatası:', error);
            return false;
        }
    }
    addLog(type, logData) {
        const data = this.getLogData();
        
        if (!data[type]) {
            data[type] = [];
        }

        const log = {
            ...logData,
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        };

        data[type].push(log);
        if (data[type].length > this.maxLogs) {
            data[type] = data[type].slice(-this.maxLogs);
        }

        this.saveLogData(data);
    }
    logActivity(action, userId, details = '') {
        this.addLog('aktiviteler', {
            action,
            userId,
            details,
            emoji: this.getActionEmoji(action)
        });
    }
    logError(type, message, file = null) {
        this.addLog('hatalar', {
            type,
            message,
            file
        });
    }
    logSystem(type, message) {
        this.addLog('sistem', {
            type,
            message
        });
    }
    logKod(action, userId, kodSifre, kategoriId, details = '') {
        this.addLog('kod', {
            action,
            userId,
            kodSifre,
            kategoriId,
            details
        });
    }
    logStok(action, userId, kategoriId, details = '') {
        this.addLog('stok', {
            action,
            userId,
            kategoriId,
            details
        });
    }
    getActionEmoji(action) {
        const emojis = {
            'Kod Oluşturuldu': '🔑',
            'Kod Kullanıldı': '✅',
            'Stok Eklendi': '📦',
            'Kategori Eklendi': '📁',
            'Kategori Silindi': '🗑️',
            'Stok Silindi': '🗑️',
            'Cooldown Ayarlandı': '⏰',
            'Bot Başlatıldı': '🚀',
            'Bot Durduruldu': '⏹️',
            'Hata Oluştu': '❌',
            'Başarılı İşlem': '✅'
        };
        return emojis[action] || '📝';
    }
    clearLogs(type = null) {
        const data = this.getLogData();
        
        if (type) {
            data[type] = [];
        } else {
            data.aktiviteler = [];
            data.hatalar = [];
            data.sistem = [];
            data.kod = [];
            data.stok = [];
        }
        
        this.saveLogData(data);
    }
    getLogStats() {
        const data = this.getLogData();
        return {
            aktiviteler: data.aktiviteler.length,
            hatalar: data.hatalar.length,
            sistem: data.sistem.length,
            kod: data.kod.length,
            stok: data.stok.length,
            toplam: Object.values(data).reduce((sum, arr) => sum + arr.length, 0)
        };
    }
}

module.exports = new Logger();

