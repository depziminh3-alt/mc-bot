const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const mcDataLoader = require('minecraft-data')

const bot = mineflayer.createBot({
  host: 'Cug_mc.aternos.me',
  port: 18085,
  username: 'Cug_mc'
})

bot.loadPlugin(pathfinder)

let mcData
let defaultMove

bot.once('spawn', () => {
  mcData = mcDataLoader(bot.version)
  defaultMove = new Movements(bot, mcData)
  bot.pathfinder.setMovements(defaultMove)

  bot.chat('🤖 Survival bot online!')

  setInterval(mainLoop, 5000)
})

/* =========================
   🧠 MAIN LOOP
========================= */
async function mainLoop() {
  try {
    await checkHealth()
    await findAndChopWood()
    await wander()
  } catch (err) {
    console.log(err)
  }
}

/* =========================
   ❤️ CHECK HP
========================= */
async function checkHealth() {
  if (bot.health < 10) {
    bot.chat('⚠️ HP thấp, đứng yên hồi máu')
    bot.pathfinder.setGoal(null)
    await sleep(5000)
  }
}

/* =========================
   🌳 CHẶT GỖ
========================= */
async function findAndChopWood() {
  const log = bot.findBlock({
    matching: b => b.name.includes('log'),
    maxDistance: 32
  })

  if (!log) return

  bot.chat('🌳 Tìm thấy cây!')

  try {
    await bot.pathfinder.goto(
      new goals.GoalBlock(log.position.x, log.position.y, log.position.z)
    )

    await bot.dig(log)
    bot.chat('✔️ Đã chặt gỗ')
  } catch (e) {
    console.log('Không đào được cây')
  }
}

/* =========================
   🚶 ĐI LUNG TUNG
========================= */
async function wander() {
  const x = bot.entity.position.x + (Math.random() * 10 - 5)
  const z = bot.entity.position.z + (Math.random() * 10 - 5)

  bot.pathfinder.setGoal(
    new goals.GoalXZ(x, z)
  )
}

/* =========================
   ⏱ SLEEP
========================= */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}
