import Phaser from 'phaser'
import { getContractById, contracts } from '../data/contracts.js'

export class ContractTravelScene extends Phaser.Scene {
    constructor() {
        super('ContractTravelScene')
    }

    init(data) {
        this.contract = getContractById(data.contractId) || contracts[0]
    }

    create() {
        this.cameras.main.setBackgroundColor('#080808')

        // Основная рамка
        this.add.rectangle(640, 360, 1180, 640, 0x111111)
            .setStrokeStyle(2, 0x444444)

        // Заголовок
        this.add.text(120, 80, 'Путь к контракту', {
            fontSize: '38px',
            color: '#ffffff'
        })

        this.add.text(120, 135, this.contract.title, {
            fontSize: '24px',
            color: '#cccccc'
        })

        // Текст события
        this.add.text(170, 230,
            'Старая дорога тонет в сыром тумане.\n' +
            'На влажной земле видны глубокие следы.\n' +
            'Кто-то тяжёлый прошёл здесь совсем недавно.',
            {
                fontSize: '22px',
                color: '#dddddd',
                lineSpacing: 10,
                wordWrap: {
                    width: 850
                }
            }
        )

        this.add.text(170, 390, 'Что сделать?', {
            fontSize: '26px',
            color: '#ffffff'
        })

        // Кнопка: осмотреть следы
        const inspectButton = this.add.text(170, 455, 'ОСМОТРЕТЬ СЛЕДЫ', {
            fontSize: '22px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: {
                x: 18,
                y: 10
            }
        }).setInteractive()

        inspectButton.on('pointerover', () => {
            inspectButton.setStyle({ backgroundColor: '#555555' })
        })

        inspectButton.on('pointerout', () => {
            inspectButton.setStyle({ backgroundColor: '#333333' })
        })

        inspectButton.on('pointerdown', () => {
            this.scene.start('BattleScene', {
                contractId: this.contract.id,

                // Бонус за внимательность: первый удар будет сильнее
                firstStrikeBonus: 10
            })
        })

        // Кнопка: идти дальше
        const continueButton = this.add.text(470, 455, 'ИДТИ ДАЛЬШЕ', {
            fontSize: '22px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: {
                x: 18,
                y: 10
            }
        }).setInteractive()

        continueButton.on('pointerover', () => {
            continueButton.setStyle({ backgroundColor: '#555555' })
        })

        continueButton.on('pointerout', () => {
            continueButton.setStyle({ backgroundColor: '#333333' })
        })

        continueButton.on('pointerdown', () => {
            this.scene.start('BattleScene', {
                contractId: this.contract.id,
                firstStrikeBonus: 0
            })
        })

        this.add.text(170, 565, 'Осмотр следов может дать преимущество перед боем.', {
            fontSize: '16px',
            color: '#888888'
        })
    }
}
