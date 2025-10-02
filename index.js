const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ] 
});
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ ${command.data.name} komutu yüklendi`);
    } else {
        console.log(`⚠️ ${filePath} komutunda 'data' veya 'execute' property'si eksik.`);
    }
}
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`✅ ${event.name} eventi yüklendi`);
}
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Data dizini oluşturuldu');
}
process.on('uncaughtException', (error) => {
    console.error('❌ Yakalanmamış hata:', error.message);
});

process.on('unhandledRejection', error => {
    console.error('❌ Promise hatası:', error.message);
});
client.on('error', error => {
    console.error('❌ Discord client hatası:', error.message);
});

client.on('warn', warning => {
    console.warn('⚠️ Discord uyarısı:', warning);
});
client.login(config.token).catch(error => {
    console.error('❌ Bot giriş hatası:', error);
    console.log('\n🔧 Çözüm adımları:');
    console.log('1. config.json dosyasındaki token\'i kontrol edin');
    console.log('2. Bot\'un gerekli yetkilere sahip olduğundan emin olun');
    console.log('3. Bot\'un sunucuya davet edildiğinden emin olun');
});

console.log('🚀 Discord Teslimat Botu başlatılıyor...');