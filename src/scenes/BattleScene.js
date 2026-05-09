import Phaser from 'phaser'
import { combatants } from '../data/combatants.js'
import { getContractById, contracts } from '../data/contracts.js'
import { playerState, getEffectiveMaxHP, savePlayerState } from '../data/playerState.js'
import { skills, playerActions, getPlayerActionById } from '../data/skills.js'

export class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene')
    }

    init(data = {}) {
        this.contract = getContractById(data.contractId) || contracts[0]

        // Бонусы, которые приходят из сцены пути
        this.firstStrikeBonus = data.firstStrikeBonus || 0
        this.travelBattleLog = data.travelBattleLog || ''
    }

    preload() {
        // Загружаем фон и персонажей из папки public/assets
        this.load.image('battleBg', '/assets/backgrounds/battle-bg-1.png')
        this.load.image('hunter', '/assets/characters/hunter-1.png')
        this.load.image('troll', '/assets/enemies/troll-1.png')
    }

    create() {
        this.turn = 'player' // player | enemy
        this.isDefending = false
        this.activeEffects = {
            bleed: null
        }

        // Данные бойцов теперь берём из отдельных файлов
        this.hunterData = combatants.hunter
        this.enemyData = combatants[this.contract.enemyId]

        // Фон сцены
        this.cameras.main.setBackgroundColor('#1a1a1a')

        // Фон боя
        this.add.image(640, 360, 'battleBg')
            .setDisplaySize(1280, 720)
            .setDepth(0)

        // Заголовок
        this.add.text(420, 35, this.hunterData.name + ' vs ' + this.enemyData.name, {
            fontSize: '32px',
            color: '#ffffff'
        }).setDepth(10)

        // Охотник
        // setOrigin(0.5, 1) означает, что координата Y — это низ персонажа, то есть ноги стоят на земле
        this.hunter = this.add.image(330, 565, 'hunter')
            .setOrigin(0.5, 1)
            .setScale(0.23)
            .setDepth(2)

        // Тролль
        this.troll = this.add.image(950, 600, this.enemyData.assetKey)
            .setOrigin(0.5, 1)
            .setScale(0.30)
            .setDepth(2)

        // Максимальное HP охотника зависит от ранений
        this.hunterMaxHP = getEffectiveMaxHP()

        // Охотник начинает бой с тем HP, которое есть на базе,
        // но не выше текущего боевого максимума
        this.hunterHP = Math.min(playerState.hp, this.hunterMaxHP)

        // Враг всегда начинает бой с полным HP
        this.trollHP = this.enemyData.maxHP
        this.trollMaxHP = this.enemyData.maxHP

        // Нижняя боевая панель
        this.uiPanel = this.add.graphics().setDepth(8)

        this.uiPanel.fillStyle(0x000000, 0.65)
        this.uiPanel.fillRoundedRect(130, 550, 1020, 145, 18)

        this.uiPanel.lineStyle(2, 0x555555, 0.8)
        this.uiPanel.strokeRoundedRect(130, 550, 1020, 145, 18)

        // Текст состояния боя
        this.statusText = this.add.text(540, 565, 'Ход охотника', {
            fontSize: '22px',
            color: '#ffffff'
        }).setDepth(10)

        // Боевой журнал: храним последние сообщения боя
        this.battleLog = []

        this.battleLogTexts = [
            this.add.text(460, 592, '', {
                fontSize: '14px',
                color: '#cccccc'
            }).setDepth(10),

            this.add.text(460, 610, '', {
                fontSize: '14px',
                color: '#cccccc'
            }).setDepth(10),

            this.add.text(460, 628, '', {
                fontSize: '14px',
                color: '#cccccc'
            }).setDepth(10)
        ]

        // Графика для HP-полосок
        this.hunterHPBar = this.add.graphics().setDepth(10)
        this.trollHPBar = this.add.graphics().setDepth(10)

        // Текст HP
        this.hunterHPText = this.add.text(190, 585, 'Охотник HP: ' + this.hunterHP, {
            fontSize: '20px',
            color: '#00ff00'
        }).setDepth(10)

        this.trollHPText = this.add.text(870, 585, this.enemyData.name + ' HP: ' + this.trollHP, {
            fontSize: '20px',
            color: '#ff0000'
        }).setDepth(10)

        // Первый рендер HP-полосок
        this.drawHPBars()

        // Текст активных эффектов на охотнике
        this.effectsText = this.add.text(190, 645, 'Эффекты: нет', {
            fontSize: '15px',
            color: '#cccccc'
        }).setDepth(10)

        // Количество бинтов в бою
        this.bandagesText = this.add.text(190, 670, 'Бинты: ' + playerState.bandages, {
            fontSize: '15px',
            color: '#cccccc'
        }).setDepth(10)

        this.updateEffectsText()
        this.updateBandagesText()

        // Кнопки действий охотника теперь создаются из skills.js
        this.actionButtons = []

        const buttonStartX = 420
        const buttonY = 650
        const buttonGap = 135

        playerActions.forEach((action, index) => {
            const actionButton = this.add.text(buttonStartX + index * buttonGap, buttonY, action.label, {
                fontSize: '22px',
                backgroundColor: '#333333',
                color: '#ffffff',
                padding: {
                    x: 12,
                    y: 8
                }
            }).setInteractive().setDepth(10)

            actionButton.on('pointerdown', () => {
                this.handlePlayerAction(action.id)
            })

            this.actionButtons.push(actionButton)
        })

        this.addBattleLog('Бой начался')
    }

    handlePlayerAction(actionId) {
        const action = getPlayerActionById(actionId)

        if (!action) return

        if (action.type === 'damage') {
            this.runDamageAction(action)
            return
        }

        if (action.type === 'defend') {
            this.defend()
            return
        }

        if (action.type === 'bandage') {
            this.bandage()
        }
    }

    runDamageAction(action) {
        if (this.turn !== 'player') return
        if (this.trollHP <= 0) return

        this.setActionButtonsEnabled(false)
        this.setStatus(action.statusText)

        let damage = Phaser.Math.Between(
            action.minDamage,
            action.maxDamage
        )

        if (this.firstStrikeBonus > 0) {
            damage += this.firstStrikeBonus

            if (this.travelBattleLog) {
                this.addBattleLog(this.travelBattleLog + ': +' + this.firstStrikeBonus)
            }

            this.firstStrikeBonus = 0
        }

        this.trollHP -= damage
        this.trollHP = Math.max(this.trollHP, 0)

        this.trollHPText.setText(this.enemyData.name + ' HP: ' + this.trollHP)
        this.addBattleLog(action.logText + ' ' + damage + ' урона')

        this.showDamage(this.troll.x, this.troll.y - 260, damage)
        this.hitEffect(this.troll)
        this.drawHPBars()

        this.tweens.add({
            targets: this.hunter,
            x: action.moveX,
            duration: action.moveDuration,
            yoyo: true
        })

        if (this.trollHP <= 0) {
            this.enemyDead()
            return
        }

        this.turn = 'enemy'

        this.time.delayedCall(800, () => {
            this.enemyAttack()
        })
    }

    attack() {
        this.handlePlayerAction('attack')
    }

    skillAttack() {
        this.handlePlayerAction('powerStrike')
    }

    defend() {
        if (this.turn !== 'player') return
        if (this.hunterHP <= 0 || this.trollHP <= 0) return

        const action = getPlayerActionById('defend')

        this.setActionButtonsEnabled(false)
        this.setStatus(action.statusText)
        this.addBattleLog(action.logText)

        this.isDefending = true
        this.turn = 'enemy'

        this.time.delayedCall(800, () => {
            this.enemyAttack()
        })
    }

    bandage() {
        if (this.turn !== 'player') return
        if (this.hunterHP <= 0 || this.trollHP <= 0) return

        // Если кровотечения нет — ход не тратим
        if (!this.activeEffects.bleed) {
            this.setStatus('Перевязка не нужна', '#ffaa55')
            this.addBattleLog('Кровотечения нет')

            this.time.delayedCall(800, () => {
                if (this.turn === 'player') {
                    this.setStatus('Ход охотника')
                }
            })

            return
        }

        // Если бинтов нет — ход тоже не тратим
        if (playerState.bandages <= 0) {
            this.setStatus('Нет бинтов', '#ff7777')
            this.addBattleLog('Бинты закончились')

            this.time.delayedCall(800, () => {
                if (this.turn === 'player') {
                    this.setStatus('Ход охотника')
                }
            })

            return
        }

        // Если кровотечение есть и бинты есть — снимаем эффект, тратим ход
        this.setActionButtonsEnabled(false)

        playerState.bandages -= 1
        savePlayerState()
        this.updateBandagesText()

        this.activeEffects.bleed = null
        this.updateEffectsText()

        this.setStatus('Охотник делает перевязку')
        this.addBattleLog('Кровотечение остановлено. Бинтов: ' + playerState.bandages)

        this.turn = 'enemy'

        this.time.delayedCall(800, () => {
            this.enemyAttack()
        })
    }

    getEnemyAttack() {
        const specialAttack = this.enemyData.specialAttack

        // Если у врага есть особая атака — бросаем шанс
        if (specialAttack) {
            const roll = Phaser.Math.Between(1, 100)

            if (roll <= specialAttack.chance) {
                return {
                    name: specialAttack.name,
                    damage: Phaser.Math.Between(
                        specialAttack.damageMin,
                        specialAttack.damageMax
                    ),
                    logText: specialAttack.logText,
                    isSpecial: true,
                    effect: specialAttack.effect || null
                }
            }
        }

        // Обычная атака врага
        return {
            name: 'Обычная атака',
            damage: Phaser.Math.Between(
                this.enemyData.damageMin,
                this.enemyData.damageMax
            ),
            logText: this.enemyData.name + ' нанёс',
            isSpecial: false
        }
    }

    applyEffect(effect) {
        if (!effect) return

        if (effect.type === 'bleed') {
            this.activeEffects.bleed = {
                turns: effect.turns,
                damage: effect.damage
            }

            this.addBattleLog('Охотник истекает кровью')
            this.setStatus('Кровотечение', '#ff5555')
            this.updateEffectsText()
        }
    }

    updateEffectsText() {
        const effects = []

        const bleed = this.activeEffects.bleed

        if (bleed) {
            effects.push('кровотечение — ' + bleed.turns + ' хода')
        }

        if (effects.length === 0) {
            this.effectsText.setText('Эффекты: нет')
            this.effectsText.setColor('#cccccc')
            return
        }

        this.effectsText.setText('Эффекты: ' + effects.join(', '))
        this.effectsText.setColor('#ff7777')
    }

    updateBandagesText() {
        this.bandagesText.setText('Бинты: ' + playerState.bandages)

        if (playerState.bandages <= 0) {
            this.bandagesText.setColor('#ff7777')
        } else {
            this.bandagesText.setColor('#cccccc')
        }
    }

    processPlayerTurnEffects() {
        const bleed = this.activeEffects.bleed

        if (!bleed) return

        this.hunterHP -= bleed.damage
        this.hunterHP = Math.max(this.hunterHP, 0)

        bleed.turns -= 1

        this.hunterHPText.setText('Охотник HP: ' + this.hunterHP)
        this.showDamage(this.hunter.x, this.hunter.y - 260, bleed.damage)
        this.drawHPBars()

        this.addBattleLog('Кровотечение: ' + bleed.damage + ' урона')

        if (bleed.turns <= 0) {
            this.activeEffects.bleed = null
            this.addBattleLog('Кровотечение остановилось')
        }

        this.updateEffectsText()

        if (this.hunterHP <= 0) {
            this.playerDead()
        }
    }

    enemyAttack() {
        if (this.hunterHP <= 0) return
        if (this.trollHP <= 0) return

        this.setStatus(this.enemyData.name + ' атакует', '#ffaaaa')

        const enemyAttack = this.getEnemyAttack()
        let damage = enemyAttack.damage

        if (enemyAttack.isSpecial) {
            this.setStatus(enemyAttack.name, '#ff7777')
        }

        // Если игрок выбрал защиту, урон уменьшается в 2 раза
        if (this.isDefending) {
            damage = Math.floor(damage * skills.defend.damageMultiplier)
            this.isDefending = false
            this.addBattleLog('Защита снизила урон')
        }

        this.hunterHP -= damage
        this.hunterHP = Math.max(this.hunterHP, 0)

        this.hunterHPText.setText('Охотник HP: ' + this.hunterHP)

        if (enemyAttack.isSpecial) {
            this.addBattleLog(enemyAttack.logText + ': ' + damage + ' урона')
        } else {
            this.addBattleLog(enemyAttack.logText + ' ' + damage + ' урона')
        }

        if (enemyAttack.effect && this.hunterHP > 0) {
            this.applyEffect(enemyAttack.effect)
        }

        this.showDamage(this.hunter.x, this.hunter.y - 260, damage)
        this.hitEffect(this.hunter)
        this.drawHPBars()

        // Анимация рывка тролля к охотнику
        this.tweens.add({
            targets: this.troll,
            x: 760,
            duration: 150,
            yoyo: true
        })

        if (this.hunterHP <= 0) {
            this.playerDead()
            return
        }

        this.turn = 'player'

        // Эффекты состояния срабатывают в начале хода охотника
        this.processPlayerTurnEffects()

        if (this.hunterHP <= 0) return

        this.setStatus('Ход охотника')
        this.setActionButtonsEnabled(true)
    }

    enemyDead() {
        this.turn = 'end'
        this.setActionButtonsEnabled(false)

        // Для image нельзя использовать setFillStyle, поэтому затемняем через tint
        this.troll.setTint(0x555555)
        this.troll.setAlpha(0.75)

        this.add.text(500, 300, this.enemyData.name + ' повержен', {
            fontSize: '32px',
            color: '#ffffff'
        }).setDepth(20)

        this.setStatus('Победа', '#ffffff')
        this.addBattleLog(this.enemyData.name + ' повержен')

        this.time.delayedCall(1500, () => {
            this.scene.start('ContractResultScene', {
                result: 'victory',
                contractId: this.contract.id,
                silver: Phaser.Math.Between(
                    this.contract.reward.silverMin,
                    this.contract.reward.silverMax
                ),
                exp: this.contract.reward.exp,

                // Сохраняем здоровье после боя
                remainingHP: this.hunterHP
            })
        })
    }

    playerDead() {
        this.turn = 'end'
        this.setActionButtonsEnabled(false)

        this.hunter.setTint(0x555555)
        this.hunter.setAlpha(0.75)

        this.add.text(540, 300, 'Ты проиграл', {
            fontSize: '32px',
            color: '#ff0000'
        }).setDepth(20)

        this.setStatus('Поражение', '#ff3333')
        this.addBattleLog('Охотник пал в бою')

        this.time.delayedCall(1500, () => {
            this.scene.start('ContractResultScene', {
                result: 'defeat',
                contractId: this.contract.id,
                silver: 0,
                exp: this.contract.reward.defeatExp,

                // После поражения охотник выживает, но с минимальным HP
                remainingHP: 1
            })
        })
    }

    setStatus(text, color = '#ffffff') {
        this.statusText.setText(text)
        this.statusText.setColor(color)
    }

    addBattleLog(message) {
        // Добавляем новое сообщение в начало журнала
        this.battleLog.unshift(message)

        // Храним только последние 3 сообщения
        this.battleLog = this.battleLog.slice(0, 3)

        // Обновляем строки журнала на экране
        this.battleLogTexts.forEach((textObject, index) => {
            textObject.setText(this.battleLog[index] || '')
        })
    }

    hitEffect(target) {
        // Лёгкая тряска камеры при ударе
        this.cameras.main.shake(100, 0.004)

        // Быстрое мигание цели, чтобы удар чувствовался визуально
        this.tweens.add({
            targets: target,
            alpha: 0.35,
            duration: 80,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                target.setAlpha(1)
            }
        })
    }

    setActionButtonsEnabled(isEnabled) {
        // Во время хода врага кнопки затемняются и не нажимаются
        this.actionButtons.forEach((button) => {
            if (isEnabled) {
                button.setAlpha(1)
                button.setInteractive()
            } else {
                button.setAlpha(0.45)
                button.disableInteractive()
            }
        })
    }

    showDamage(x, y, damage) {
        const text = this.add.text(x, y, '-' + damage, {
            fontSize: '28px',
            color: '#ff3333'
        }).setOrigin(0.5).setDepth(20)

        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 600,
            onComplete: () => text.destroy()
        })
    }

    drawHPBars() {
        this.hunterHPBar.clear()
        this.trollHPBar.clear()

        this.hunterHPBar.setDepth(10)
        this.trollHPBar.setDepth(10)

        const barWidth = 200
        const barHeight = 18

        // --- ОХОТНИК ---
        const hunterRatio = Math.max(this.hunterHP, 0) / this.hunterMaxHP

        this.hunterHPBar.fillStyle(0x222222)
        this.hunterHPBar.fillRect(190, 620, barWidth, barHeight)

        this.hunterHPBar.fillStyle(0x00ff00)
        this.hunterHPBar.fillRect(190, 620, barWidth * hunterRatio, barHeight)

        // --- ТРОЛЛЬ ---
        const trollRatio = Math.max(this.trollHP, 0) / this.trollMaxHP

        this.trollHPBar.fillStyle(0x222222)
        this.trollHPBar.fillRect(870, 620, barWidth, barHeight)

        this.trollHPBar.fillStyle(0xff0000)
        this.trollHPBar.fillRect(870, 620, barWidth * trollRatio, barHeight)
    }
}
