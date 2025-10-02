const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Bot hazır! ${client.user.tag} olarak giriş yapıldı.`);
        client.user.setActivity('Teslimat sistemi aktif 📦', { 
            type: ActivityType.Custom 
        });
    },
};