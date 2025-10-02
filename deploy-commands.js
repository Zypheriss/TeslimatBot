const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`⚠️ ${file} komutunda 'data' veya 'execute' property'si eksik.`);
    }
}

const rest = new REST().setToken(config.token);

(async () => {
    try {
        console.log('🗑️ Eski komutlar siliniyor...');
        try {
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: [] }
            );
            console.log('✅ Guild komutları silindi');
        } catch (error) {
            console.log('⚠️ Guild komutları silinemedi (normal olabilir)');
        }
        try {
            await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: [] }
            );
            console.log('✅ Global komutlar silindi');
        } catch (error) {
            console.log('⚠️ Global komutlar silinemedi (normal olabilir)');
        }
        
        console.log('⏳ 2 saniye bekleniyor...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`🔄 ${commands.length} slash komutu yükleniyor...`);
        const data = await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );

        console.log(`✅ ${data.length} slash komutu global olarak başarıyla yüklendi!`);
        console.log('📝 Not: Global komutların aktif olması 1 saat kadar sürebilir.');
        console.log('🚀 Hemen test etmek için botu yeniden başlatın.');
    } catch (error) {
        console.error('❌ Komutlar yüklenirken hata:', error);
    }
})();