import Phaser from 'phaser'

export class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene')
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

        // Фон сцены
        this.cameras.main.setBackgroundColor('#1a1a1a')

        // Фон боя
        this.add.image(640, 360, 'battleBg')
            .setDisplaySize(1280, 720)
            .setDepth(0)

        // Заголовок
        this.add.text(420, 35, 'Охотник vs Тролль', {
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
        this.troll = this.add.image(950, 600, 'troll')
            .setOrigin(0.5, 1)
            .setScale(0.30)
            .setDepth(2)

        // Здоровье персонажей
        this.hunterHP = 100
        this.trollHP = 150

        // Максимальное здоровье нужно для расчёта HP-полосок
        this.hunterMaxHP = this.hunterHP
        this.trollMaxHP = this.trollHP

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
        this.hunterHPText = this.add.text(190, 585, 'Охотник HP: 100', {
            fontSize: '20px',
            color: '#00ff00'
        }).setDepth(10)

        this.trollHPText = this.add.text(870, 585, 'Тролль HP: 150', {
            fontSize: '20px',
            color: '#ff0000'
        }).setDepth(10)

        // Первый рендер HP-полосок
        this.drawHPBars()

        // Кнопка: удар
        const attackText = this.add.text(470, 650, 'УДАР', {
            fontSize: '24px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: {
                x: 14,
                y: 8
            }
        }).setInteractive().setDepth(10)

        attackText.on('pointerdown', () => {
            this.attack()
        })

        // Кнопка: защита
        const defendText = this.add.text(600, 650, 'ЗАЩИТА', {
            fontSize: '24px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: {
                x: 14,
                y: 8
            }
        }).setInteractive().setDepth(10)

        defendText.on('pointerdown', () => {
            this.defend()
        })

        // Кнопка: навык
        const skillText = this.add.text(770, 650, 'НАВЫК', {
            fontSize: '24px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: {
                x: 14,
                y: 8
            }
        }).setInteractive().setDepth(10)

        skillText.on('pointerdown', () => {
            this.skillAttack()
        })

        // Сохраняем кнопки, чтобы отключать их во время хода врага
        this.actionButtons = [attackText, defendText, skillText]

        this.addBattleLog('Бой начался')
    }

    attack() {
        if (this.turn !== 'player') return
        if (this.trollHP <= 0) return

        this.setActionButtonsEnabled(false)
        this.setStatus('Охотник атакует')

        const damage = Phaser.Math.Between(10, 25)

        this.trollHP -= damage
        this.trollHP = Math.max(this.trollHP, 0)

        this.trollHPText.setText('Тролль HP: ' + this.trollHP)
        this.addBattleLog('Охотник нанёс ' + damage + ' урона')
        this.showDamage(this.troll.x, this.troll.y - 260, damage)
        this.hitEffect(this.troll)
        this.drawHPBars()

        // Анимация рывка охотника к врагу
        this.tweens.add({
            targets: this.hunter,
            x: 500,
            duration: 150,
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

    skillAttack() {
        if (this.turn !== 'player') return
        if (this.trollHP <= 0) return

        this.setActionButtonsEnabled(false)
        this.setStatus('Охотник использует навык')

        const damage = Phaser.Math.Between(20, 40)

        this.trollHP -= damage
        this.trollHP = Math.max(this.trollHP, 0)

        this.trollHPText.setText('Тролль HP: ' + this.trollHP)
        this.addBattleLog('Навык нанёс ' + damage + ' урона')
        this.showDamage(this.troll.x, this.troll.y - 260, damage)
        this.hitEffect(this.troll)
        this.drawHPBars()

        // Навык — более сильный рывок охотника
        this.tweens.add({
            targets: this.hunter,
            x: 540,
            duration: 200,
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

    defend() {
        if (this.turn !== 'player') return
        if (this.hunterHP <= 0 || this.trollHP <= 0) return

        this.setActionButtonsEnabled(false)
        this.setStatus('Охотник защищается')
        this.addBattleLog('Охотник приготовился к защите')

        this.isDefending = true
        this.turn = 'enemy'

        this.time.delayedCall(800, () => {
            this.enemyAttack()
        })
    }

    enemyAttack() {
        if (this.hunterHP <= 0) return
        if (this.trollHP <= 0) return

        this.setStatus('Тролль атакует', '#ffaaaa')

        let damage = Phaser.Math.Between(5, 20)

        // Если игрок выбрал защиту, урон уменьшается в 2 раза
        if (this.isDefending) {
            damage = Math.floor(damage / 2)
            this.isDefending = false
            this.addBattleLog('Защита снизила урон')
        }

        this.hunterHP -= damage
        this.hunterHP = Math.max(this.hunterHP, 0)

        this.hunterHPText.setText('Охотник HP: ' + this.hunterHP)
        this.addBattleLog('Тролль нанёс ' + damage + ' урона')
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
        this.setStatus('Ход охотника')
        this.setActionButtonsEnabled(true)
    }

    enemyDead() {
        this.turn = 'end'
        this.setActionButtonsEnabled(false)

        // Для image нельзя использовать setFillStyle, поэтому затемняем через tint
        this.troll.setTint(0x555555)
        this.troll.setAlpha(0.75)

        this.add.text(500, 300, 'Тролль повержен', {
            fontSize: '32px',
            color: '#ffffff'
        }).setDepth(20)

        this.setStatus('Победа', '#ffffff')
        this.addBattleLog('Тролль повержен')
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