import Phaser from 'phaser'
import { getContractById, contracts } from '../data/contracts.js'
import { playerState, completeContract } from '../data/playerState.js'

export class ContractResultScene extends Phaser.Scene {
    constructor() {
        super('ContractResultScene')
    }

    init(data) {
        this.contract = getContractById(data.contractId) || contracts[0]

        this.result = data.result || 'victory'
        this.silver = data.silver || 0
        this.exp = data.exp || 0
        this.remainingHP = typeof data.remainingHP === 'number'
            ? data.remainingHP
            : playerState.hp

        if (this.result === 'victory') {
            playerState.silver += this.silver
            playerState.exp += this.exp

            // После победы сохраняем фактическое HP после боя
            playerState.hp = Math.max(this.remainingHP, 1)

            completeContract(this.contract.id)
        } else {
            playerState.exp += this.exp

            // После поражения охотник выживает, но получает последствия
            playerState.hp = 1
            playerState.wounds = 'лёгкое ранение'
        }
    }

    create() {
        this.cameras.main.setBackgroundColor('#080808')

        this.add.rectangle(640, 360, 1180, 640, 0x111111)
            .setStrokeStyle(2, 0x444444)

        const isVictory = this.result === 'victory'

        this.add.text(430, 120, isVictory ? 'Контракт выполнен' : 'Контракт провален', {
            fontSize: '42px',
            color: isVictory ? '#ffffff' : '#ff5555'
        })

        this.add.text(380, 210, isVictory
            ? 'Охотник вернулся с дороги. Тролль больше не будет выходить к караванам.'
            : 'Охотник едва выжил. Орден запомнит эту ошибку.', {
            fontSize: '20px',
            color: '#cccccc',
            wordWrap: {
                width: 560
            },
            lineSpacing: 8
        })

        this.add.text(430, 330, 'Итог:', {
            fontSize: '28px',
            color: '#ffffff'
        })

        this.add.text(430, 380, 'Серебро: ' + this.silver, {
            fontSize: '22px',
            color: '#dddddd'
        })

        this.add.text(430, 420, 'Опыт: ' + this.exp, {
            fontSize: '22px',
            color: '#dddddd'
        })

        const backButton = this.add.text(470, 540, 'ВЕРНУТЬСЯ В ОРДЕН', {
            fontSize: '22px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: {
                x: 22,
                y: 12
            }
        }).setInteractive()

        backButton.on('pointerover', () => {
            backButton.setStyle({
                backgroundColor: '#555555'
            })
        })

        backButton.on('pointerout', () => {
            backButton.setStyle({
                backgroundColor: '#333333'
            })
        })

        backButton.on('pointerdown', () => {
            this.scene.start('OrderBaseScene')
        })
    }
}
