import Phaser from 'phaser'
import { getContractById, contracts } from '../data/contracts.js'

export class ContractTravelScene extends Phaser.Scene {
    constructor() {
        super('ContractTravelScene')
    }

    init(data) {
        this.contract = getContractById(data.contractId) || contracts[0]
        this.travelEvent = this.contract.travelEvent
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

        // Название события пути
        this.add.text(170, 205, this.travelEvent.title, {
            fontSize: '26px',
            color: '#ffffff'
        })

        // Описание события пути
        this.add.text(170, 255, this.travelEvent.text.join('\n'), {
            fontSize: '22px',
            color: '#dddddd',
            lineSpacing: 10,
            wordWrap: {
                width: 850
            }
        })

        this.add.text(170, 410, 'Что сделать?', {
            fontSize: '26px',
            color: '#ffffff'
        })

        // Рисуем варианты выбора из данных контракта
        this.travelEvent.choices.forEach((choice, index) => {
            const x = 170 + index * 300
            const y = 475

            const choiceButton = this.add.text(x, y, choice.text, {
                fontSize: '22px',
                backgroundColor: '#333333',
                color: '#ffffff',
                padding: {
                    x: 18,
                    y: 10
                }
            }).setInteractive()

            choiceButton.on('pointerover', () => {
                choiceButton.setStyle({
                    backgroundColor: '#555555'
                })
            })

            choiceButton.on('pointerout', () => {
                choiceButton.setStyle({
                    backgroundColor: '#333333'
                })
            })

            choiceButton.on('pointerdown', () => {
                this.scene.start('BattleScene', {
                    contractId: this.contract.id,

                    // Бонусы выбора передаются в бой
                    firstStrikeBonus: choice.firstStrikeBonus || 0,
                    travelBattleLog: choice.battleLog || ''
                })
            })
        })

        this.add.text(170, 585, this.travelEvent.hint, {
            fontSize: '16px',
            color: '#888888'
        })
    }
}
