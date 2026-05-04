import Phaser from 'phaser'

export class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene')
    }

    preload() {
        // Пока просто цвета, без картинок
    }

    create() {
        this.turn = 'player' // player | enemy

        this.isDefending = false

        // Фон
        this.cameras.main.setBackgroundColor('#1a1a1a')

        // Текст
        this.add.text(400, 50, 'Охотник vs Тролль', {
            fontSize: '32px',
            color: '#ffffff'
        })

        // Заглушка "охотник"
        this.hunter = this.add.rectangle(300, 400, 80, 120, 0x00aa00)

        // Заглушка "тролль"
        this.troll = this.add.rectangle(900, 400, 120, 160, 0xaa0000)

        // контейнеры для баров
        this.hunterHPBar = this.add.graphics()
        this.trollHPBar = this.add.graphics()

        // здоровье персонажей
        this.hunterHP = 100
        this.trollHP = 150

        // максимальное HP
        this.hunterMaxHP = this.hunterHP
        this.trollMaxHP = this.trollHP

        // первый рендер
        this.drawHPBars()

        this.hunterHPText = this.add.text(250, 500, 'HP: 100', {
            fontSize: '20px',
            color: '#00ff00'
        })

        this.trollHPText = this.add.text(850, 500, 'HP: 150', {
            fontSize: '20px',
            color: '#ff0000'
        })

        // Кнопка атаки
        const attackText = this.add.text(420, 600, 'УДАР', {
            fontSize: '24px',
            backgroundColor: '#333',
            padding: 10
        }).setInteractive()

        attackText.on('pointerdown', () => {
            this.attack()
        })

        const defendText = this.add.text(570, 600, 'ЗАЩИТА', {
            fontSize: '24px',
            backgroundColor: '#333',
            padding: 10
        }).setInteractive()

        defendText.on('pointerdown', () => {
            this.defend()
        })

        const skillText = this.add.text(760, 600, 'НАВЫК', {
            fontSize: '24px',
            backgroundColor: '#333',
            padding: 10
        }).setInteractive()

        skillText.on('pointerdown', () => {
            this.skillAttack()
        })
    }

    defend() {
        if (this.turn !== 'player') return
        if (this.hunterHP <= 0 || this.trollHP <= 0) return

        this.isDefending = true
        this.turn = 'enemy'

        this.time.delayedCall(800, () => {
            this.enemyAttack()
        })
    }

    skillAttack() {
        if (this.turn !== 'player') return
        if (this.trollHP <= 0) return

        const damage = Phaser.Math.Between(20, 40)
        this.trollHP -= damage
        this.trollHP = Math.max(this.trollHP, 0)

        this.trollHPText.setText('HP: ' + Math.max(this.trollHP, 0))

        this.showDamage(this.troll.x, this.troll.y - 100, damage)

        this.drawHPBars()

        this.tweens.add({
            targets: this.hunter,
            x: 520,
            duration: 200,
            yoyo: true
        })

        if (this.trollHP <= 0) {
            this.troll.setFillStyle(0x555555)

            this.add.text(500, 300, 'Тролль повержен', {
                fontSize: '32px',
                color: '#ffffff'
            })

            return
        }

        this.turn = 'enemy'

        this.time.delayedCall(800, () => {
            this.enemyAttack()
        })
    }

    attack() {
        if (this.turn !== 'player') return
        if (this.trollHP <= 0) return

        const damage = Phaser.Math.Between(10, 25)
        this.trollHP -= damage
        this.trollHP = Math.max(this.trollHP, 0)

        this.trollHPText.setText('HP: ' + Math.max(this.trollHP, 0))

        this.showDamage(this.troll.x, this.troll.y - 100, damage)

        this.drawHPBars()

        this.tweens.add({
            targets: this.hunter,
            x: 500,
            duration: 150,
            yoyo: true
        })

        if (this.trollHP <= 0) {
            this.troll.setFillStyle(0x555555)

            this.add.text(500, 300, 'Тролль повержен', {
                fontSize: '32px',
                color: '#ffffff'
            })

            return
        }

        // передаём ход врагу
        this.turn = 'enemy'

        // задержка перед атакой врага
        this.time.delayedCall(800, () => {
            this.enemyAttack()
        })
    }

    enemyAttack() {
        if (this.hunterHP <= 0) return

        let damage = Phaser.Math.Between(5, 20)

        if (this.isDefending) {
            damage = Math.floor(damage / 2)
            this.isDefending = false
        }

        this.hunterHP -= damage
        this.hunterHP = Math.max(this.hunterHP, 0)

        this.hunterHPText.setText('HP: ' + Math.max(this.hunterHP, 0))

        this.showDamage(this.hunter.x, this.hunter.y - 100, damage)

        this.drawHPBars()

        this.tweens.add({
            targets: this.troll,
            x: 700,
            duration: 150,
            yoyo: true
        })

        if (this.hunterHP <= 0) {
            this.hunter.setFillStyle(0x555555)

            this.add.text(500, 300, 'Ты проиграл', {
                fontSize: '32px',
                color: '#ff0000'
            })

            return
        }

        // возвращаем ход игроку
        this.turn = 'player'
    }

    showDamage(x, y, damage) {
        const text = this.add.text(x, y, '-' + damage, {
            fontSize: '24px',
            color: '#ff0000'
        }).setOrigin(0.5)

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

        const barWidth = 200
        const barHeight = 20

        // --- ОХОТНИК ---
        const hunterRatio = Math.max(this.hunterHP, 0) / this.hunterMaxHP

        this.hunterHPBar.fillStyle(0x222222)
        this.hunterHPBar.fillRect(200, 550, barWidth, barHeight)

        this.hunterHPBar.fillStyle(0x00ff00)
        this.hunterHPBar.fillRect(200, 550, barWidth * hunterRatio, barHeight)

        // --- ТРОЛЛЬ ---
        const trollRatio = Math.max(this.trollHP, 0) / this.trollMaxHP

        this.trollHPBar.fillStyle(0x222222)
        this.trollHPBar.fillRect(800, 550, barWidth, barHeight)

        this.trollHPBar.fillStyle(0xff0000)
        this.trollHPBar.fillRect(800, 550, barWidth * trollRatio, barHeight)
    }
}