import Phaser from 'phaser'
import { contracts } from '../data/contracts.js'
import { baseBuildings, getBaseBuildingById } from '../data/baseBuildings.js'

import {
    playerState,
    isContractCompleted,
    restAtBase,
    buyBandageAtBase,
    getRestCost,
    upgradeInfirmary,
    BANDAGE_COST,
    MAX_BANDAGES,
    INFIRMARY_UPGRADE_COST,
    canTakeContract,
    getEffectiveMaxHP
} from '../data/playerState.js'

export class OrderBaseScene extends Phaser.Scene {
    constructor() {
        super('OrderBaseScene')
    }

    init(data) {
        this.selectedBuildingId = data?.selectedBuildingId || 'contracts'
    }

    create() {
        this.infoPanelObjects = []
        this.baseMessageText = null

        this.cameras.main.setBackgroundColor('#050505')

        this.drawBackground()
        this.drawTopBar()
        this.drawHunterPanel()
        this.drawBaseArea()
        this.drawBottomNav()

        this.showBuildingInfo(this.selectedBuildingId)
    }

    drawBackground() {
        this.add.rectangle(640, 360, 1280, 720, 0x080808).setDepth(0)

        this.add.rectangle(640, 360, 1220, 660, 0x111111)
            .setStrokeStyle(2, 0x2f2f2f)
            .setDepth(1)
    }

    drawTopBar() {
        this.add.rectangle(640, 55, 1220, 70, 0x151515)
            .setStrokeStyle(1, 0x3a3a3a)
            .setDepth(2)

        this.add.text(55, 30, 'ОРДЕН ОХОТНИКОВ', {
            fontSize: '28px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(390, 35, 'Серебро: ' + playerState.silver, {
            fontSize: '17px',
            color: '#cccccc'
        }).setDepth(3)

        this.add.text(560, 35, 'Бинты: ' + playerState.bandages + ' / ' + MAX_BANDAGES, {
            fontSize: '17px',
            color: '#cccccc'
        }).setDepth(3)

        this.add.text(740, 35, 'Опыт: ' + playerState.exp, {
            fontSize: '17px',
            color: '#cccccc'
        }).setDepth(3)

        const completedCount = contracts.filter((contract) => {
            return isContractCompleted(contract.id)
        }).length

        this.add.text(930, 35, 'Контракты: ' + completedCount + ' / ' + contracts.length, {
            fontSize: '17px',
            color: '#999999'
        }).setDepth(3)
    }

    drawHunterPanel() {
        const panel = this.add.graphics().setDepth(2)

        panel.fillStyle(0x141414, 0.96)
        panel.fillRoundedRect(50, 110, 270, 530, 16)

        panel.lineStyle(2, 0x444444, 1)
        panel.strokeRoundedRect(50, 110, 270, 530, 16)

        this.add.text(85, 145, playerState.name, {
            fontSize: '24px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(85, 180, playerState.title, {
            fontSize: '16px',
            color: '#999999'
        }).setDepth(3)

        this.add.text(85, 240, 'Состояние', {
            fontSize: '20px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(85, 280, 'Здоровье: ' + playerState.hp + ' / ' + getEffectiveMaxHP(), {
            fontSize: '15px',
            color: '#79ff79'
        }).setDepth(3)

        this.add.text(85, 310, 'Раны: ' + playerState.wounds, {
            fontSize: '15px',
            color: playerState.wounds === 'нет' ? '#cccccc' : '#ffaa55'
        }).setDepth(3)

        this.add.text(85, 340, 'Серебро: ' + playerState.silver, {
            fontSize: '15px',
            color: '#cccccc'
        }).setDepth(3)

        this.add.text(85, 370, 'Бинты: ' + playerState.bandages + ' / ' + MAX_BANDAGES, {
            fontSize: '15px',
            color: '#cccccc'
        }).setDepth(3)

        this.add.text(85, 430, 'Шип Ордена', {
            fontSize: '19px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(85, 465, 'Редкий знак свободы.\nОрден больше не имеет\nправа удерживать его.', {
            fontSize: '14px',
            color: '#999999',
            lineSpacing: 6
        }).setDepth(3)
    }

    drawBaseArea() {
        const area = this.add.graphics().setDepth(2)

        area.fillStyle(0x101010, 0.96)
        area.fillRoundedRect(350, 110, 540, 530, 16)

        area.lineStyle(2, 0x333333, 1)
        area.strokeRoundedRect(350, 110, 540, 530, 16)

        this.add.text(500, 135, 'База Ордена', {
            fontSize: '30px',
            color: '#ffffff'
        }).setDepth(3)

        this.add.text(440, 175, 'Двор крепости, здания и места службы охотников.', {
            fontSize: '15px',
            color: '#888888'
        }).setDepth(3)

        // Схематичный двор базы. Позже заменим это на полноценный арт-фон.
        this.add.rectangle(620, 390, 410, 300, 0x181818)
            .setStrokeStyle(1, 0x2f2f2f)
            .setDepth(2)

        this.add.rectangle(610, 260, 130, 80, 0x222222)
            .setStrokeStyle(1, 0x555555)
            .setDepth(2)

        this.add.rectangle(455, 455, 120, 75, 0x1c1c1c)
            .setStrokeStyle(1, 0x444444)
            .setDepth(2)

        this.add.rectangle(770, 360, 135, 200, 0x1c1c1c)
            .setStrokeStyle(1, 0x444444)
            .setDepth(2)

        this.add.rectangle(600, 545, 160, 70, 0x1b1b1b)
            .setStrokeStyle(1, 0x444444)
            .setDepth(2)

        baseBuildings.forEach((building) => {
            this.drawBuildingMarker(building)
        })
    }

    drawBuildingMarker(building) {
        const isSelected = building.id === this.selectedBuildingId

        const marker = this.add.rectangle(
            building.x,
            building.y,
            150,
            42,
            isSelected ? 0x3a2a16 : 0x191919
        )
            .setStrokeStyle(2, isSelected ? 0xc49a4a : 0x555555)
            .setInteractive()
            .setDepth(5)

        this.add.text(building.x, building.y - 9, building.title, {
            fontSize: '15px',
            color: isSelected ? '#ffdd99' : '#dddddd'
        })
            .setOrigin(0.5)
            .setDepth(6)

        this.add.text(building.x, building.y + 10, building.subtitle, {
            fontSize: '11px',
            color: '#888888'
        })
            .setOrigin(0.5)
            .setDepth(6)

        marker.on('pointerover', () => {
            marker.setFillStyle(0x2b2b2b)
        })

        marker.on('pointerout', () => {
            marker.setFillStyle(isSelected ? 0x3a2a16 : 0x191919)
        })

        marker.on('pointerdown', () => {
            this.scene.restart({
                selectedBuildingId: building.id
            })
        })
    }

    drawBottomNav() {
        this.add.rectangle(640, 675, 1220, 55, 0x151515)
            .setStrokeStyle(1, 0x333333)
            .setDepth(2)

        const items = [
            'КОНТРАКТЫ',
            'ОХОТНИКИ',
            'ИНВЕНТАРЬ',
            'КАРТА',
            'УЛУЧШЕНИЯ'
        ]

        items.forEach((item, index) => {
            this.add.text(360 + index * 140, 662, item, {
                fontSize: '15px',
                color: index === 0 ? '#ffffff' : '#888888'
            }).setDepth(3)
        })
    }

    showBuildingInfo(buildingId) {
        this.clearInfoPanel()

        const building = getBaseBuildingById(buildingId)

        if (!building) return

        this.drawInfoPanelFrame(building.title, building.subtitle)

        if (buildingId === 'contracts') {
            this.drawContractsInfo()
            return
        }

        if (buildingId === 'infirmary') {
            this.drawInfirmaryInfo()
            return
        }

        if (buildingId === 'storage') {
            this.drawStorageInfo()
            return
        }

        if (buildingId === 'training') {
            this.drawPlaceholderInfo(
                'Тренировочный двор',
                'Здесь охотники будут получать улучшения, новые приёмы и боевые черты.'
            )
            return
        }

        if (buildingId === 'council') {
            this.drawPlaceholderInfo(
                'Совет Ордена',
                'Здесь позже появятся решения Ордена, репутация и крупные сюжетные выборы.'
            )
            return
        }

        if (buildingId === 'rest') {
            this.drawPlaceholderInfo(
                'Место отдыха',
                'Здесь охотники будут восстанавливать дух, снимать усталость и готовиться к новым контрактам.'
            )
        }
    }

    drawInfoPanelFrame(title, subtitle) {
        const panel = this.add.graphics().setDepth(8)

        panel.fillStyle(0x141414, 0.97)
        panel.fillRoundedRect(925, 110, 300, 530, 16)

        panel.lineStyle(2, 0x444444, 1)
        panel.strokeRoundedRect(925, 110, 300, 530, 16)

        this.infoPanelObjects.push(panel)

        this.addInfoText(955, 140, title, 23, '#ffffff')
        this.addInfoText(955, 175, subtitle, 15, '#999999')
    }

    drawContractsInfo() {
        this.addInfoText(955, 220, 'Доступные задания', 18, '#ffffff')

        contracts.forEach((contract, index) => {
            this.drawContractRow(contract, index)
        })
    }

    drawContractRow(contract, index) {
        const y = 255 + index * 110

        const isCompleted = isContractCompleted(contract.id)
        const isUnlocked = this.isContractUnlocked(contract)
        const canStart = canTakeContract() && isUnlocked && !isCompleted

        const row = this.add.graphics().setDepth(9)

        row.fillStyle(isCompleted || !isUnlocked ? 0x101010 : 0x1c1c1c, 0.96)
        row.fillRoundedRect(950, y, 250, 95, 10)

        row.lineStyle(1, isUnlocked ? 0x555555 : 0x442222, 1)
        row.strokeRoundedRect(950, y, 250, 95, 10)

        this.infoPanelObjects.push(row)

        this.addInfoText(965, y + 12, contract.title, 15, isUnlocked ? '#ffffff' : '#777777')
        this.addInfoText(965, y + 37, 'Опасность: ' + contract.danger, 13, isUnlocked ? contract.dangerColor : '#777777')

        if (isCompleted) {
            this.addInfoText(965, y + 62, 'Статус: выполнен', 13, '#79ff79')
        } else if (!isUnlocked) {
            this.addInfoText(965, y + 62, this.getLockedReason(contract), 12, '#ff9999')
        } else if (!canTakeContract()) {
            this.addInfoText(965, y + 62, 'Нужен отдых', 13, '#ff7777')
        } else {
            this.addInfoText(965, y + 62, 'Статус: доступен', 13, '#cccccc')
        }

        const buttonText = isCompleted
            ? 'ВЫПОЛНЕН'
            : !isUnlocked
                ? 'ЗАКРЫТ'
                : !canTakeContract()
                    ? 'ОТДЫХ'
                    : 'ВЗЯТЬ'

        this.addInfoButton(1105, y + 55, buttonText, () => {
            this.scene.start('ContractTravelScene', {
                contractId: contract.id
            })
        }, !canStart)
    }

    drawInfirmaryInfo() {
        this.addInfoText(955, 220, 'Лазарет: уровень ' + playerState.base.infirmaryLevel, 18, '#ffffff')
        this.addInfoText(955, 255, 'Отдых: ' + getRestCost() + ' серебра', 15, '#cccccc')
        this.addInfoText(955, 285, 'Снимает раны и полностью восстанавливает здоровье.', 14, '#999999', 230)

        this.addInfoButton(955, 350, 'ОТДОХНУТЬ', () => {
            const result = restAtBase()

            this.showBaseMessage(result.message, result.success ? '#79ff79' : '#ff7777')

            if (result.success) {
                this.time.delayedCall(700, () => {
                    this.scene.restart({
                        selectedBuildingId: 'infirmary'
                    })
                })
            }
        })

        const isUpgraded = playerState.base.infirmaryLevel >= 1

        this.addInfoButton(
            955,
            405,
            isUpgraded ? 'ЛАЗАРЕТ УЛУЧШЕН' : 'УЛУЧШИТЬ — ' + INFIRMARY_UPGRADE_COST,
            () => {
                const result = upgradeInfirmary()

                this.showBaseMessage(result.message, result.success ? '#79ff79' : '#ff7777')

                if (result.success) {
                    this.time.delayedCall(700, () => {
                        this.scene.restart({
                            selectedBuildingId: 'infirmary'
                        })
                    })
                }
            },
            isUpgraded
        )
    }

    drawStorageInfo() {
        this.addInfoText(955, 220, 'Припасы', 18, '#ffffff')
        this.addInfoText(955, 255, 'Бинты: ' + playerState.bandages + ' / ' + MAX_BANDAGES, 15, '#cccccc')
        this.addInfoText(955, 285, 'Бинты нужны для перевязки кровотечения в бою.', 14, '#999999', 230)

        this.addInfoButton(955, 350, 'КУПИТЬ БИНТ — ' + BANDAGE_COST, () => {
            const result = buyBandageAtBase()

            this.showBaseMessage(result.message, result.success ? '#79ff79' : '#ff7777')

            if (result.success) {
                this.time.delayedCall(700, () => {
                    this.scene.restart({
                        selectedBuildingId: 'storage'
                    })
                })
            }
        })
    }

    drawPlaceholderInfo(title, text) {
        this.addInfoText(955, 220, title, 18, '#ffffff')
        this.addInfoText(955, 260, text, 14, '#999999', 230)
        this.addInfoText(955, 350, 'Система будет добавлена позже.', 14, '#777777', 230)
    }

    addInfoText(x, y, text, fontSize, color, wrapWidth = null) {
        const textObject = this.add.text(x, y, text, {
            fontSize: fontSize + 'px',
            color,
            wordWrap: wrapWidth ? { width: wrapWidth } : undefined,
            lineSpacing: 6
        }).setDepth(10)

        this.infoPanelObjects.push(textObject)

        return textObject
    }

    addInfoButton(x, y, text, onClick, disabled = false) {
        const button = this.add.text(x, y, text, {
            fontSize: '14px',
            backgroundColor: disabled ? '#222222' : '#333333',
            color: disabled ? '#777777' : '#ffffff',
            padding: {
                x: 12,
                y: 8
            }
        }).setDepth(10)

        this.infoPanelObjects.push(button)

        if (!disabled) {
            button.setInteractive()

            button.on('pointerover', () => {
                button.setStyle({
                    backgroundColor: '#555555'
                })
            })

            button.on('pointerout', () => {
                button.setStyle({
                    backgroundColor: '#333333'
                })
            })

            button.on('pointerdown', onClick)
        }

        return button
    }

    clearInfoPanel() {
        this.infoPanelObjects.forEach((object) => {
            object.destroy()
        })

        this.infoPanelObjects = []
    }

    showBaseMessage(message, color = '#ffffff') {
        if (this.baseMessageText) {
            this.baseMessageText.destroy()
        }

        this.baseMessageText = this.add.text(955, 585, message, {
            fontSize: '14px',
            color,
            wordWrap: {
                width: 230
            }
        }).setDepth(20)
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
}
