import Phaser from 'phaser'
import { contracts } from '../data/contracts.js'
import { playerState } from '../data/playerState.js'

export class OrderBaseScene extends Phaser.Scene {
    constructor() {
        super('OrderBaseScene')
    }

    create() {
        const contract = contracts[0]

        this.cameras.main.setBackgroundColor('#080808')

        // Тёмный фон с лёгкими слоями
        this.add.rectangle(640, 360, 1280, 720, 0x0b0b0b).setDepth(0)

        this.add.rectangle(640, 360, 1180, 640, 0x111111)
            .setStrokeStyle(2, 0x2f2f2f)
            .setDepth(1)

        // Верхняя полоса
        this.add.rectangle(640, 65, 1180, 80, 0x151515)
            .setStrokeStyle(1, 0x3a3a3a)
            .setDepth(2)

        this.add.text(90, 38, 'ОРДЕН ОХОТНИКОВ', {
            fontSize: '30px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(940, 45, 'Морвальд ждёт охотника', {
            fontSize: '16px',
            color: '#999999'
        }).setDepth(3)

        // Левая панель персонажа
        const hunterPanel = this.add.graphics().setDepth(2)
        hunterPanel.fillStyle(0x151515, 0.95)
        hunterPanel.fillRoundedRect(80, 130, 300, 500, 18)
        hunterPanel.lineStyle(2, 0x444444, 1)
        hunterPanel.strokeRoundedRect(80, 130, 300, 500, 18)

        this.add.text(115, 165, 'Рейнар Вельм', {
            fontSize: '26px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(115, 205, 'Охотник Ордена', {
            fontSize: '17px',
            color: '#b0b0b0'
        }).setDepth(3)

        this.add.text(115, 265, 'Состояние', {
            fontSize: '20px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(115, 305, 'Здоровье: ' + playerState.hp + ' / ' + playerState.maxHP, {
            fontSize: '16px',
            color: '#79ff79'
        }).setDepth(3)

        this.add.text(115, 335, 'Раны: ' + playerState.wounds, {
            fontSize: '16px',
            color: '#cccccc'
        }).setDepth(3)

        this.add.text(115, 365, 'Опыт: ' + playerState.exp, {
            fontSize: '16px',
            color: '#cccccc'
        }).setDepth(3)

        this.add.text(115, 395, 'Серебро: ' + playerState.silver, {
            fontSize: '16px',
            color: '#cccccc'
        }).setDepth(3)

        this.add.text(115, 430, 'Шип Ордена', {
            fontSize: '20px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(115, 465, 'Редкий знак свободы.\nОрден больше не имеет\nправа удерживать его.', {
            fontSize: '15px',
            color: '#999999',
            lineSpacing: 7
        }).setDepth(3)

        // Центральная область
        this.add.text(440, 140, 'Доступные контракты', {
            fontSize: '32px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(440, 180, 'Выбери задание, которое Орден готов доверить охотнику.', {
            fontSize: '17px',
            color: '#999999'
        }).setDepth(3)

        // Карточка контракта
        const contractPanel = this.add.graphics().setDepth(2)
        contractPanel.fillStyle(0x191919, 0.96)
        contractPanel.fillRoundedRect(430, 240, 700, 300, 18)
        contractPanel.lineStyle(2, 0x666666, 1)
        contractPanel.strokeRoundedRect(430, 240, 700, 300, 18)

        this.add.text(470, 275, 'Контракт', {
            fontSize: '18px',
            color: '#999999'
        }).setDepth(3)

        this.add.text(470, 310, contract.title, {
            fontSize: '28px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(470, 360, contract.description.join('\n'), {
            fontSize: '17px',
            color: '#c7c7c7',
            lineSpacing: 8
        }).setDepth(3)

        this.add.text(470, 465, 'Опасность: ' + contract.danger, {
            fontSize: '16px',
            color: contract.dangerColor
        }).setDepth(3)

        this.add.text(470, 495, 'Награда: ' + contract.reward.silverMin + '-' + contract.reward.silverMax + ' серебра, опыт', {
            fontSize: '16px',
            color: '#d0d0d0'
        }).setDepth(3)

        // Кнопка
        const startButton = this.add.text(710, 570, 'ВЗЯТЬ КОНТРАКТ', {
            fontSize: '22px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: {
                x: 22,
                y: 12
            }
        }).setInteractive().setDepth(4)

        startButton.on('pointerover', () => {
            startButton.setStyle({
                backgroundColor: '#555555'
            })
        })

        startButton.on('pointerout', () => {
            startButton.setStyle({
                backgroundColor: '#333333'
            })
        })

        startButton.on('pointerdown', () => {
            this.scene.start('ContractTravelScene', {
                contractId: contract.id
            })
        })

        // Нижняя подпись
        this.add.text(640, 625, 'Пока доступен один тестовый контракт.\nПозже здесь появятся цепочки заданий, регионы и последствия выбора.', {
            fontSize: '14px',
            color: '#777777',
            align: 'center',
            lineSpacing: 6,
            wordWrap: {
                width: 620
            }
        })
        .setOrigin(0.5, 0)
        .setDepth(3)
    }
}
