import Phaser from 'phaser'
import { getContractById, contracts } from '../data/contracts.js'
import { playerState, completeContract, clearActiveContract, savePlayerState, splitRewardByParty, MAX_BANDAGES } from '../data/playerState.js'

export class ContractResultScene extends Phaser.Scene {
    constructor() {
        super('ContractResultScene')
    }

    init(data) {
        this.contract = getContractById(data.contractId) || contracts[0]

        this.result = data.result || 'victory'
        this.silver = data.silver || 0
        this.exp = data.exp || 0
        this.playerReward = this.silver
        this.playerExp = this.exp
        this.bandagesLoot = 0

        this.remainingHP = typeof data.remainingHP === 'number'
            ? data.remainingHP
            : playerState.hp

        if (this.result === 'victory') {
            const playerReward = splitRewardByParty(this.silver)

            // Рейнар получает только свою долю опыта.
            // Если он один — получает весь опыт.
            const playerExp = splitRewardByParty(this.exp)

            playerState.silver += playerReward
            playerState.exp += playerExp

            this.playerReward = playerReward
            this.playerExp = playerExp

            // После победы сохраняем фактическое HP после боя
            playerState.hp = Math.max(this.remainingHP, 1)

            // Ранения зависят от того, насколько тяжёлой была победа
            if (playerState.hp > 50) {
                playerState.wounds = 'нет'
            } else if (playerState.hp > 25) {
                playerState.wounds = 'ушибы'
            } else {
                playerState.wounds = 'лёгкое ранение'
            }

            // Добыча бинтов после победы
            const rolledBandages = Phaser.Math.Between(
                this.contract.reward.bandagesMin || 0,
                this.contract.reward.bandagesMax || 0
            )

            const freeBandageSlots = Math.max(MAX_BANDAGES - playerState.bandages, 0)

            this.bandagesLoot = Math.min(rolledBandages, freeBandageSlots)

            playerState.bandages += this.bandagesLoot

            completeContract(this.contract.id)
        } else {
            playerState.exp += this.exp

            // После поражения охотник выживает, но получает тяжёлые последствия
            playerState.hp = 1
            playerState.wounds = 'тяжёлое ранение'

            // Контракт провален, но не выполнен.
            // У героя больше нет активного контракта.
            clearActiveContract()
        }

        savePlayerState()
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

        const rewardText = isVictory
            ? 'Общая награда: ' + this.silver + ' серебра'
            : 'Серебро: ' + this.silver

        const expText = isVictory
            ? 'Твоя доля: +' + this.playerReward + ' серебра, +' + this.playerExp + ' опыта'
            : 'Опыт: ' + this.exp

        this.add.text(430, 380, rewardText, {
            fontSize: '22px',
            color: '#dddddd'
        })

        this.add.text(430, 420, expText, {
            fontSize: '22px',
            color: '#dddddd'
        })

        this.add.text(430, 460, 'Бинты: +' + this.bandagesLoot, {
            fontSize: '22px',
            color: '#dddddd'
        })

        this.add.text(430, 505, 'Состояние: ' + playerState.hp + ' / ' + playerState.maxHP, {
            fontSize: '22px',
            color: '#dddddd'
        })

        this.add.text(430, 545, 'Раны: ' + playerState.wounds, {
            fontSize: '22px',
            color: playerState.wounds === 'нет' ? '#79ff79' : '#ffaa55'
        })

        const backButton = this.add.text(470, 600, 'ВЕРНУТЬСЯ В ОРДЕН', {
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
