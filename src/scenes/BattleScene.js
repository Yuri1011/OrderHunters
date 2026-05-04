import Phaser from 'phaser'

export class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene')
    }

    preload() {
        // Пока просто цвета, без картинок
    }

    create() {
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

        // Кнопка атаки
        const attackText = this.add.text(550, 600, 'АТАКА', {
            fontSize: '28px',
            backgroundColor: '#333',
            padding: 10
        }).setInteractive()

        attackText.on('pointerdown', () => {
            this.attack()
        })
    }

    attack() {
        // простая анимация удара
        this.tweens.add({
            targets: this.hunter,
            x: 500,
            duration: 200,
            yoyo: true
        })
    }
}