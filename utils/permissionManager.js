const config = require('../config.json');

class PermissionManager {
    hasPermission(member) {
        if (!member || !member.roles) return false;
        
        return config.authorizedRoles.some(roleId => 
            member.roles.cache.has(roleId)
        );
    }

    async checkPermission(interaction) {
        if (!this.hasPermission(interaction.member)) {
            try {
                await interaction.reply({
                    content: '❌ Bu komutu kullanmak için yetkiniz yok!',
                    flags: 64 
                });
            } catch (error) {
                console.error('❌ Yetki hatası yanıtı gönderilemedi:', error.message);
            }
            return false;
        }
        return true;
    }
}

module.exports = new PermissionManager();