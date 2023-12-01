const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/db/database.db',
  logging: false
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
})();

const GuildChannels = sequelize.define('guild_channels', {
  guild_id: Sequelize.TEXT,
  channel_id: Sequelize.TEXT,
  type: Sequelize.TEXT,
});

// sincroniza os modelos com o banco de dados
(async () => {
  try {
    await GuildChannels.sync();
    console.log('Tabelas sincronizadas com sucesso.');
  } catch (error) {
    console.error('Erro ao sincronizar a tabelas:', error);
  }
})();

module.exports = { GuildChannels }