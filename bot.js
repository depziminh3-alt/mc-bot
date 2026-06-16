const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'Cug_mc.aternos.me',
  port: 18085,
  username: 'Cug_mc'
})

bot.on('spawn', () => {
  console.log('Cug_mc đã vào server!')
  bot.chat('Xin chào 👋')
})
