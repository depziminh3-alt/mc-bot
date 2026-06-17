const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const collectBlock = require('mineflayer-collectblock').plugin
const autoEat = require('mineflayer-auto-eat').plugin

const bot = mineflayer.createBot({
  host: 'cug_mc.aternos.me',
  port: 25565,
  username: 'SurvivalBot'
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(collectBlock)
bot.loadPlugin(autoEat)

let mcData, move

bot.once('spawn', () => {
  mcData = require('minecraft-data')(bot.version)
  move = new Movements(bot, mcData)
  bot.pathfinder.setMovements(move)

  bot.autoEat.options = {
    priority: 'foodPoints',
    startAt: 14,
    bannedFood: []
  }

  bot.chat("I am alive...")

  setInterval(mainLoop, 3000)
})

/* =========================
   🧠 SURVIVAL BRAIN
========================= */
async function mainLoop () {
  if (bot.food < 14) return findFood()
  if (!hasTools()) return getWood()

  if (needsStoneTools()) return mineStone()
  if (needsHouse()) return buildSimpleHouse()

  wander()
}

/* =========================
   🌳 1. KIẾM GỖ
========================= */
async function getWood () {
  const log = bot.findBlock({
    matching: b => b.name.includes('log'),
    maxDistance: 32
  })

  if (!log) return wander()

  await bot.collectBlock.collect(log)
  bot.chat("got wood")
}

/* =========================
   ⛏️ 2. ĐÀO ĐÁ
========================= */
async function mineStone () {
  const stone = bot.findBlock({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 32
  })

  if (!stone) return wander()

  await bot.collectBlock.collect(stone)
  bot.chat("stone collected")
}

/* =========================
   🍖 3. KIẾM ĐỒ ĂN
========================= */
function findFood () {
  bot.chat("hungry...")
  const food = bot.inventory.items().find(i =>
    i.name.includes('bread') ||
    i.name.includes('apple') ||
    i.name.includes('beef')
  )

  if (food) bot.equip(food, 'hand', () => bot.consume())
}

/* =========================
   🏠 4. XÂY NHÀ CƠ BẢN
========================= */
function buildSimpleHouse () {
  bot.chat("building house...")

  const pos = bot.entity.position

  // đặt block đơn giản (demo)
  const dirt = bot.inventory.items().find(i => i.name.includes('dirt'))

  if (dirt) {
    bot.equip(dirt, 'hand', () => {
      bot.chat("place block")
    })
  }
}

/* =========================
   🚶 5. LANG THANG
========================= */
function wander () {
  const x = bot.entity.position.x + rand(-8, 8)
  const z = bot.entity.position.z + rand(-8, 8)

  bot.pathfinder.setGoal(new goals.GoalXZ(x, z))
}

/* =========================
   🔧 CHECK LOGIC
========================= */
function hasTools () {
  return bot.inventory.items().some(i =>
    i.name.includes('pickaxe') ||
    i.name.includes('axe')
  )
}

function needsStoneTools () {
  return hasTools() && bot.heldItem == null
}

function needsHouse () {
  return true // demo đơn giản
}

function rand (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
