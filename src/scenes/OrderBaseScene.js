import Phaser from 'phaser'
import {
    playerState,
    isContractCompleted,
    restAtBase,
    buyBandageAtBase,
    REST_COST,
    BANDAGE_COST,
    MAX_BANDAGES,
    canTakeContract,
    getEffectiveMaxHP
} from '../data/playerState.js'
import { contracts } from '../data/contracts.js'

export class OrderBaseScene extends Phaser.Scene {
    constructor() {
        super('OrderBaseScene')
    }

    create() {
        this.cameras.main.setBackgroundColor('#080808')

        // Общий тёмный фон
        this.add.rectangle(640, 360, 1280, 720, 0x0b0b0b).setDepth(0)

        // Основная рамка экрана
        this.add.rectangle(640, 360, 1180, 640, 0x111111)
            .setStrokeStyle(2, 0x2f2f2f)
            .setDepth(1)

        // Верхняя панель
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
        this.drawHunterPanel()

        // Центральная область с контрактами
        this.add.text(440, 140, 'Доступные контракты', {
            fontSize: '32px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(440, 180, 'Выбери задание, которое Орден готов доверить охотнику.', {
            fontSize: '17px',
            color: '#999999'
        }).setDepth(3)

        const completedCount = contracts.filter((contract) => {
            return isContractCompleted(contract.id)
        }).length

        this.add.text(440, 205, 'Выполнено контрактов: ' + completedCount + ' / ' + contracts.length, {
            fontSize: '15px',
            color: '#777777'
        }).setDepth(3)

        // Рисуем карточки контрактов из массива contracts
        contracts.forEach((contract, index) => {
            this.drawContractCard(contract, index)
        })

        // Нижняя подпись
        this.add.text(640, 660, 'Контракты берутся из данных игры. Позже здесь появятся регионы, цепочки заданий и последствия выбора.', {
            fontSize: '14px',
            color: '#777777',
            align: 'center',
            wordWrap: {
                width: 760
            }
        })
            .setOrigin(0.5, 0)
            .setDepth(3)
    }

    drawHunterPanel() {
        const hunterPanel = this.add.graphics().setDepth(2)

        hunterPanel.fillStyle(0x151515, 0.95)
        hunterPanel.fillRoundedRect(80, 130, 300, 500, 18)

        hunterPanel.lineStyle(2, 0x444444, 1)
        hunterPanel.strokeRoundedRect(80, 130, 300, 500, 18)

        this.add.text(115, 165, playerState.name, {
            fontSize: '26px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(115, 205, playerState.title, {
            fontSize: '17px',
            color: '#b0b0b0'
        }).setDepth(3)

        this.add.text(115, 265, 'Состояние', {
            fontSize: '20px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(115, 305, 'Здоровье: ' + playerState.hp + ' / ' + getEffectiveMaxHP(), {
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

        this.add.text(115, 425, 'Бинты: ' + playerState.bandages + ' / ' + MAX_BANDAGES, {
            fontSize: '16px',
            color: '#cccccc'
        }).setDepth(3)

        this.add.text(115, 455, 'Шип Ордена', {
            fontSize: '20px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(115, 485, 'Редкий знак свободы.\nОрден больше не имеет\nправа удерживать его.', {
            fontSize: '14px',
            color: '#999999',
            lineSpacing: 5
        }).setDepth(3)

        // Кнопка отдыха на базе
        const restButton = this.add.text(115, 550, 'ОТДОХНУТЬ — ' + REST_COST + ' серебра', {
            fontSize: '14px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: {
                x: 10,
                y: 7
            }
        }).setInteractive().setDepth(4)

        restButton.on('pointerover', () => {
            restButton.setStyle({
                backgroundColor: '#555555'
            })
        })

        restButton.on('pointerout', () => {
            restButton.setStyle({
                backgroundColor: '#333333'
            })
        })

        restButton.on('pointerdown', () => {
            const result = restAtBase()

            this.showBaseMessage(result.message, result.success ? '#79ff79' : '#ff7777')

            if (result.success) {
                this.time.delayedCall(700, () => {
                    this.scene.restart()
                })
            }
        })

        // Кнопка покупки бинта
        const buyBandageButton = this.add.text(115, 590, 'КУПИТЬ БИНТ — ' + BANDAGE_COST + ' серебра', {
            fontSize: '14px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: {
                x: 10,
                y: 7
            }
        }).setInteractive().setDepth(4)

        buyBandageButton.on('pointerover', () => {
            buyBandageButton.setStyle({
                backgroundColor: '#555555'
            })
        })

        buyBandageButton.on('pointerout', () => {
            buyBandageButton.setStyle({
                backgroundColor: '#333333'
            })
        })

        buyBandageButton.on('pointerdown', () => {
            const result = buyBandageAtBase()

            this.showBaseMessage(result.message, result.success ? '#79ff79' : '#ff7777')

            if (result.success) {
                this.time.delayedCall(700, () => {
                    this.scene.restart()
                })
            }
        })
    }

    showBaseMessage(message, color = '#ffffff') {
        // Если старое сообщение уже есть — удаляем
        if (this.baseMessageText) {
            this.baseMessageText.destroy()
        }

        this.baseMessageText = this.add.text(440, 610, message, {
            fontSize: '17px',
            color: color
        }).setDepth(10)
    }

    isContractUnlocked(contract) {
        const requiredContracts = contract.requiredCompletedContracts || []

        return requiredContracts.every((contractId) => {
            return isContractCompleted(contractId)
        })
    }

    getLockedReason(contract) {
        const requiredContracts = contract.requiredCompletedContracts || []

        if (requiredContracts.length === 0) {
            return ''
        }

        const missingContracts = requiredContracts.filter((contractId) => {
            return !isContractCompleted(contractId)
        })

        if (missingContracts.length === 0) {
            return ''
        }

        const missingTitles = missingContracts.map((contractId) => {
            const requiredContract = contracts.find((item) => item.id === contractId)

            return requiredContract ? requiredContract.title : contractId
        })

        return 'Требуется: ' + missingTitles.join(', ')
    }

    drawContractCard(contract, index) {
        const isCompleted = isContractCompleted(contract.id)
        const isUnlocked = this.isContractUnlocked(contract)
        const canStart = canTakeContract() && isUnlocked && !isCompleted

        const x = 430
        const y = 240 + index * 130
        const width = 700
        const height = 115

        const contractPanel = this.add.graphics().setDepth(2)

        contractPanel.fillStyle(isCompleted || !isUnlocked ? 0x101010 : 0x191919, 0.96)
        contractPanel.fillRoundedRect(x, y, width, height, 16)

        contractPanel.lineStyle(2, 0x555555, 1)
        contractPanel.strokeRoundedRect(x, y, width, height, 16)

        this.add.text(x + 30, y + 18, contract.title, {
            fontSize: '22px',
            color: isUnlocked ? '#ffffff' : '#777777'
        }).setDepth(3)

        this.add.text(x + 30, y + 50, 'Регион: ' + contract.region, {
            fontSize: '14px',
            color: '#aaaaaa'
        }).setDepth(3)

        this.add.text(x + 30, y + 74, 'Опасность: ' + contract.danger, {
            fontSize: '14px',
            color: isUnlocked ? contract.dangerColor : '#777777'
        }).setDepth(3)

        if (isCompleted) {
            this.add.text(x + 190, y + 74, 'ВЫПОЛНЕН', {
                fontSize: '14px',
                color: '#79ff79'
            }).setDepth(3)
        }

        if (!isUnlocked && !isCompleted) {
            this.add.text(x + 190, y + 74, 'ЗАКРЫТ', {
                fontSize: '14px',
                color: '#ff7777'
            }).setDepth(3)
        }

        this.add.text(x + 30, y + 96, 'Награда: ' + contract.reward.silverMin + '-' + contract.reward.silverMax + ' серебра, опыт', {
            fontSize: '13px',
            color: '#cccccc'
        }).setDepth(3)

        this.add.text(x + 330, y + 34, isUnlocked ? contract.description[0] : this.getLockedReason(contract), {
            fontSize: '14px',
            color: isUnlocked ? '#bbbbbb' : '#ff9999',
            wordWrap: {
                width: 320
            }
        }).setDepth(3)

        let buttonText = 'ВЗЯТЬ'
        let buttonColor = '#333333'
        let textColor = '#ffffff'

        if (isCompleted) {
            buttonText = 'ВЫПОЛНЕН'
            buttonColor = '#222222'
            textColor = '#777777'
        } else if (!isUnlocked) {
            buttonText = 'ЗАКРЫТ'
            buttonColor = '#221111'
            textColor = '#ff7777'
        } else if (!canTakeContract()) {
            buttonText = 'НУЖЕН ОТДЫХ'
            buttonColor = '#221111'
            textColor = '#ff7777'
        }

        const startButton = this.add.text(x + 515, y + 74, buttonText, {
            fontSize: '17px',
            backgroundColor: buttonColor,
            color: textColor,
            padding: {
                x: 16,
                y: 8
            }
        }).setDepth(4)

        if (canStart) {
            startButton.setInteractive()

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
        }
    }
}
