const fs = require('fs');
const path = require('path');

class DataManager {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.ensureDataDir();
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    readData(fileName) {
        try {
            const filePath = path.join(this.dataDir, fileName);
            if (!fs.existsSync(filePath)) {
                return {};
            }
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Veri okuma hatası (${fileName}):`, error);
            return {};
        }
    }

    writeData(fileName, data) {
        try {
            const filePath = path.join(this.dataDir, fileName);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error(`Veri yazma hatası (${fileName}):`, error);
            return false;
        }
    }

    // Stok işlemleri
    getStoklar() {
        return this.readData('stoklar.json');
    }

    saveStoklar(data) {
        return this.writeData('stoklar.json', data);
    }

    // Kod işlemleri
    getKodlar() {
        return this.readData('kodlar.json');
    }

    saveKodlar(data) {
        return this.writeData('kodlar.json', data);
    }

    // Cooldown işlemleri
    getCooldowns() {
        return this.readData('cooldowns.json');
    }

    saveCooldowns(data) {
        return this.writeData('cooldowns.json', data);
    }
}

module.exports = new DataManager();