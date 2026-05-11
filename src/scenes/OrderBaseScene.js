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

    preload() {
        this.load.image('baseBg', '/assets/backgrounds/base-bg.png')
    }

    init(data) {
        this.selectedBuildingId = data?.selectedBuildingId || 'contracts'
    }

    create() {
        this.infoPanelObjects = []
        this.baseMessageText = null
        this.hoverLabel = null

        // Единая сетка экрана: панели вокруг, база в центре
        this.layout = {
            topX: 20,
            topY: 15,
            topW: 1240,
            topH: 58,

            leftX: 20,
            leftY: 90,
            leftW: 220,
            leftH: 540,

            baseX: 260,
            baseY: 90,
            baseW: 690,
            baseH: 388, // 16:9, чтобы фон не искажался

            rightX: 970,
            rightY: 90,
            rightW: 290,
            rightH: 540,

            bottomX: 260,
            bottomY: 645,
            bottomW: 690,
            bottomH: 55
        }

        this.cameras.main.setBackgroundColor('#050505')

        this.drawScreenBackground()
        this.drawTopBar()
        this.drawBaseView()
        this.drawPlayerPanel()
        this.drawHotspots()
        this.drawBottomNav()

        this.showBuildingInfo(this.selectedBuildingId)
    }

    drawScreenBackground() {
        this.add.rectangle(640, 360, 1280, 720, 0x050505).setDepth(0)

        // Едва заметный общий фон, чтобы экран не был пустым вокруг центральной базы
        this.add.rectangle(640, 360, 1240, 690, 0x0b0b0b)
            .setStrokeStyle(1, 0x202020)
            .setDepth(1)
    }

    drawTopBar() {
        const { topX, topY, topW, topH } = this.layout

        const panel = this.add.graphics().setDepth(5)

        panel.fillStyle(0x080808, 0.92)
        panel.fillRoundedRect(topX, topY, topW, topH, 10)

        panel.lineStyle(1, 0x333333, 1)
        panel.strokeRoundedRect(topX, topY, topW, topH, 10)

        this.add.text(45, 32, 'ОРДЕН ОХОТНИКОВ', {
            fontSize: '24px',
            color: '#ffffff'
        }).setDepth(6)

        this.add.text(330, 36, 'Серебро: ' + playerState.silver, {
            fontSize: '16px',
            color: '#cccccc'
        }).setDepth(6)

        this.add.text(500, 36, 'Бинты: ' + playerState.bandages + ' / ' + MAX_BANDAGES, {
            fontSize: '16px',
            color: '#cccccc'
        }).setDepth(6)

        this.add.text(680, 36, 'Опыт: ' + playerState.exp, {
            fontSize: '16px',
            color: '#cccccc'
        }).setDepth(6)

        const completedCount = contracts.filter((contract) => {
            return isContractCompleted(contract.id)
        }).length

        this.add.text(880, 36, 'Контракты: ' + completedCount + ' / ' + contracts.length, {
            fontSize: '16px',
            color: '#999999'
        }).setDepth(6)
    }

    drawBaseView() {
        const { baseX, baseY, baseW, baseH } = this.layout

        // Рамка центральной игровой области
        const frame = this.add.graphics().setDepth(3)

        frame.fillStyle(0x000000, 0.95)
        frame.fillRoundedRect(baseX - 8, baseY - 8, baseW + 16, baseH + 16, 10)

        frame.lineStyle(2, 0x343434, 1)
        frame.strokeRoundedRect(baseX - 8, baseY - 8, baseW + 16, baseH + 16, 10)

        // Чистый фон базы. Он больше не перекрывается панелями.
        this.add.image(baseX + baseW / 2, baseY + baseH / 2, 'baseBg')
            .setDisplaySize(baseW, baseH)
            .setDepth(4)

        // Лёгкое затемнение только внутри окна базы
        this.add.rectangle(baseX + baseW / 2, baseY + baseH / 2, baseW, baseH, 0x000000, 0.08)
            .setDepth(5)
    }

    drawPlayerPanel() {
        const { leftX, leftY, leftW, leftH } = this.layout

        const panel = this.add.graphics().setDepth(5)

        panel.fillStyle(0x080808, 0.9)
        panel.fillRoundedRect(leftX, leftY, leftW, leftH, 12)

        panel.lineStyle(1, 0x3f3f3f, 1)
        panel.strokeRoundedRect(leftX, leftY, leftW, leftH, 12)

        this.add.text(leftX + 25, leftY + 35, playerState.name, {
            fontSize: '20px',
            color: '#ffffff'
        }).setDepth(6)

        this.add.text(leftX + 25, leftY + 68, playerState.title, {
            fontSize: '14px',
            color: '#aaa'
        }).setDepth(6)

        this.add.text(leftX + 25, leftY + 120, 'Состояние', {
            fontSize: '17px',
            color: '#ffffff'
        }).setDepth(6)

        this.add.text(leftX + 25, leftY + 160, 'HP: ' + playerState.hp + ' / ' + getEffectiveMaxHP(), {
            fontSize: '14px',
            color: '#79ff79'
        }).setDepth(6)

        this.add.text(leftX + 25, leftY + 190, 'Раны: ' + playerState.wounds, {
            fontSize: '14px',
            color: playerState.wounds === 'нет' ? '#cccccc' : '#ffaa55'
        }).setDepth(6)

        this.add.text(leftX + 25, leftY + 220, 'Серебро: ' + playerState.silver, {
            fontSize: '14px',
            color: '#cccccc'
        }).setDepth(6)

        this.add.text(leftX + 25, leftY + 250, 'Бинты: ' + playerState.bandages + ' / ' + MAX_BANDAGES, {
            fontSize: '14px',
            color: '#cccccc'
        }).setDepth(6)

        this.add.text(leftX + 25, leftY + 320, 'Шип Ордена', {
            fontSize: '17px',
            color: '#ffffff'
        }).setDepth(6)

        this.add.text(leftX + 25, leftY + 355, 'Редкий знак свободы.\nОрден больше не имеет\nправа удерживать его.', {
            fontSize: '13px',
            color: '#999999',
            lineSpacing: 6,
            wordWrap: {
                width: leftW - 45
            }
        }).setDepth(6)
    }

    drawHotspots() {
        baseBuildings.forEach((building) => {
            const rect = this.getBuildingRect(building)
            const isSelected = building.id === this.selectedBuildingId

            // Невидимая зона клика по зданию
            const zone = this.add.rectangle(
                rect.x,
                rect.y,
                rect.width,
                rect.height,
                0x000000,
                0.001
            )
                .setInteractive()
                .setDepth(12)

            zone.on('pointerover', () => {
                this.drawBuildingHighlight(rect, building, true)
                this.showHoverLabel(building, rect)
            })

            zone.on('pointerout', () => {
                this.hideHoverLabel()
                this.redrawSelectedHighlight()
            })

            zone.on('pointerdown', () => {
                this.scene.restart({
                    selectedBuildingId: building.id
                })
            })

            // Постоянная маленькая метка локации
            this.drawBuildingIcon(building, rect, isSelected)
        })

        this.redrawSelectedHighlight()
    }

    getBuildingRect(building) {
        const { baseX, baseY, baseW, baseH } = this.layout

        return {
            x: baseX + building.xPercent * baseW,
            y: baseY + building.yPercent * baseH,
            width: building.widthPercent * baseW,
            height: building.heightPercent * baseH
        }
    }

    drawBuildingIcon(building, rect, isSelected) {
        const circleColor = isSelected ? 0xc49a4a : 0x111111
        const textColor = isSelected ? '#1a1a1a' : '#e0d0aa'

        const iconCircle = this.add.circle(rect.x, rect.y, isSelected ? 18 : 15, circleColor, isSelected ? 0.95 : 0.85)
            .setStrokeStyle(2, isSelected ? 0xffdd99 : 0x6a5630)
            .setDepth(14)

        const iconText = this.add.text(rect.x, rect.y - 1, building.icon, {
            fontSize: building.icon.length > 1 ? '11px' : '15px',
            color: textColor
        })
            .setOrigin(0.5)
            .setDepth(15)

        return {
            iconCircle,
            iconText
        }
    }

    drawBuildingHighlight(rect, building, isHover = false) {
        if (this.highlightBox) {
            this.highlightBox.destroy()
            this.highlightBox = null
        }

        const color = isHover ? 0xffdd99 : 0xc49a4a
        const alpha = isHover ? 0.16 : 0.1

        this.highlightBox = this.add.rectangle(rect.x, rect.y, rect.width, rect.height, color, alpha)
            .setStrokeStyle(2, color, 0.9)
            .setDepth(13)
    }

    redrawSelectedHighlight() {
        if (this.highlightBox) {
            this.highlightBox.destroy()
            this.highlightBox = null
        }

        const selectedBuilding = getBaseBuildingById(this.selectedBuildingId)

        if (!selectedBuilding) return

        const rect = this.getBuildingRect(selectedBuilding)

        this.drawBuildingHighlight(rect, selectedBuilding, false)
    }

    showHoverLabel(building, rect) {
        this.hideHoverLabel()

        this.hoverLabel = this.add.text(rect.x, rect.y - rect.height / 2 - 18, building.title, {
            fontSize: '14px',
            color: '#ffdd99',
            backgroundColor: '#111111',
            padding: {
                x: 9,
                y: 5
            }
        })
            .setOrigin(0.5)
            .setDepth(30)
    }

    hideHoverLabel() {
        if (this.hoverLabel) {
            this.hoverLabel.destroy()
            this.hoverLabel = null
        }
    }

    drawBottomNav() {
        const { bottomX, bottomY, bottomW, bottomH } = this.layout

        const panel = this.add.graphics().setDepth(5)

        panel.fillStyle(0x080808, 0.92)
        panel.fillRoundedRect(bottomX, bottomY, bottomW, bottomH, 10)

        panel.lineStyle(1, 0x333333, 1)
        panel.strokeRoundedRect(bottomX, bottomY, bottomW, bottomH, 10)

        const items = [
            'КОНТРАКТЫ',
            'ОХОТНИКИ',
            'ИНВЕНТАРЬ',
            'КАРТА',
            'УЛУЧШЕНИЯ'
        ]

        items.forEach((item, index) => {
            this.add.text(bottomX + 45 + index * 125, bottomY + 18, item, {
                fontSize: '14px',
                color: index === 0 ? '#ffffff' : '#888888'
            }).setDepth(6)
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

        if (buildingId === 'apartment') {
            this.drawApartmentInfo()
            return
        }

        if (buildingId === 'rest') {
            this.drawRestInfo()
            return
        }

        if (buildingId === 'forge') {
            this.drawPlaceholderInfo(
                'Кузница',
                'Здесь позже появятся улучшения оружия, брони и снаряжения охотников.'
            )
            return
        }

        if (buildingId === 'barracks') {
            this.drawPlaceholderInfo(
                'Казармы',
                'Здесь позже появится управление отрядом, найм и подготовка охотников.'
            )
            return
        }

        if (buildingId === 'training') {
            this.drawPlaceholderInfo(
                'Тренировочный двор',
                'Здесь позже появятся навыки, боевые черты и тренировки охотников.'
            )
            return
        }

        if (buildingId === 'council') {
            this.drawPlaceholderInfo(
                'Совет Ордена',
                'Здесь позже появятся решения Совета, репутация и крупные сюжетные выборы.'
            )
        }
    }

    drawInfoPanelFrame(title, subtitle) {
        const { rightX, rightY, rightW, rightH } = this.layout

        const panel = this.add.graphics().setDepth(20)

        panel.fillStyle(0x080808, 0.92)
        panel.fillRoundedRect(rightX, rightY, rightW, rightH, 12)

        panel.lineStyle(1, 0x444444, 1)
        panel.strokeRoundedRect(rightX, rightY, rightW, rightH, 12)

        this.infoPanelObjects.push(panel)

        this.addInfoText(rightX + 25, rightY + 30, title, 22, '#ffffff')
        this.addInfoText(rightX + 25, rightY + 64, subtitle, 14, '#999999')
    }

    drawContractsInfo() {
        const { rightX, rightY } = this.layout

        this.addInfoText(rightX + 25, rightY + 112, 'Задания Ордена', 17, '#ffffff')

        contracts.forEach((contract, index) => {
            this.drawContractRow(contract, index)
        })
    }

    drawContractRow(contract, index) {
        const { rightX, rightY, rightW } = this.layout
        const y = rightY + 150 + index * 112

        const isCompleted = isContractCompleted(contract.id)
        const isUnlocked = this.isContractUnlocked(contract)
        const canStart = canTakeContract() && isUnlocked && !isCompleted

        const row = this.add.graphics().setDepth(21)

        row.fillStyle(isCompleted || !isUnlocked ? 0x101010 : 0x1c1c1c, 0.94)
        row.fillRoundedRect(rightX + 20, y, rightW - 40, 98, 10)

        row.lineStyle(1, isUnlocked ? 0x555555 : 0x442222, 1)
        row.strokeRoundedRect(rightX + 20, y, rightW - 40, 98, 10)

        this.infoPanelObjects.push(row)

        this.addInfoText(rightX + 35, y + 12, contract.title, 14, isUnlocked ? '#ffffff' : '#777777')
        this.addInfoText(rightX + 35, y + 36, 'Опасность: ' + contract.danger, 12, isUnlocked ? contract.dangerColor : '#777777')

        if (isCompleted) {
            this.addInfoText(rightX + 35, y + 60, 'Статус: выполнен', 12, '#79ff79')
        } else if (!isUnlocked) {
            this.addInfoText(rightX + 35, y + 58, this.getLockedReason(contract), 11, '#ff9999', 145)
        } else if (!canTakeContract()) {
            this.addInfoText(rightX + 35, y + 60, 'Нужен отдых', 12, '#ff7777')
        } else {
            this.addInfoText(rightX + 35, y + 60, 'Статус: доступен', 12, '#cccccc')
        }

        const buttonText = isCompleted
            ? 'ВЫПОЛНЕН'
            : !isUnlocked
                ? 'ЗАКРЫТ'
                : !canTakeContract()
                    ? 'ОТДЫХ'
                    : 'ВЗЯТЬ'

        this.addInfoButton(rightX + 200, y + 58, buttonText, () => {
            this.scene.start('ContractTravelScene', {
                contractId: contract.id
            })
        }, !canStart)
    }

    drawInfirmaryInfo() {
        const { rightX, rightY } = this.layout

        this.addInfoText(rightX + 25, rightY + 112, 'Лазарет: уровень ' + playerState.base.infirmaryLevel, 17, '#ffffff')
        this.addInfoText(rightX + 25, rightY + 145, 'Отдых: ' + getRestCost() + ' серебра', 14, '#cccccc')
        this.addInfoText(rightX + 25, rightY + 175, 'Лечение снимает раны и полностью восстанавливает здоровье.', 13, '#999999', 235)

        this.addInfoButton(rightX + 25, rightY + 245, 'ОТДОХНУТЬ', () => {
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

        this.addInfoButton(rightX + 25, rightY + 295, 'КУПИТЬ БИНТ — ' + BANDAGE_COST, () => {
            const result = buyBandageAtBase()

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
            rightX + 25,
            rightY + 345,
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

    drawApartmentInfo() {
        const { rightX, rightY } = this.layout

        this.addInfoText(rightX + 25, rightY + 112, 'Рейнар Вельм', 17, '#ffffff')
        this.addInfoText(rightX + 25, rightY + 145, 'HP: ' + playerState.hp + ' / ' + getEffectiveMaxHP(), 14, '#79ff79')
        this.addInfoText(rightX + 25, rightY + 175, 'Раны: ' + playerState.wounds, 14, playerState.wounds === 'нет' ? '#cccccc' : '#ffaa55')
        this.addInfoText(rightX + 25, rightY + 205, 'Опыт: ' + playerState.exp, 14, '#cccccc')
        this.addInfoText(rightX + 25, rightY + 235, 'Серебро: ' + playerState.silver, 14, '#cccccc')
        this.addInfoText(rightX + 25, rightY + 290, 'Личная комната охотника. Позже здесь появятся дневник, снаряжение и личные решения.', 13, '#999999', 235)
    }

    drawRestInfo() {
        const { rightX, rightY } = this.layout

        this.addInfoText(rightX + 25, rightY + 112, 'Место отдыха', 17, '#ffffff')
        this.addInfoText(rightX + 25, rightY + 150, 'Здесь охотники приходят в себя после дороги и боя.', 13, '#999999', 235)
        this.addInfoText(rightX + 25, rightY + 220, 'Позже здесь появятся усталость, стресс и восстановление духа.', 13, '#777777', 235)
    }

    drawPlaceholderInfo(title, text) {
        const { rightX, rightY } = this.layout

        this.addInfoText(rightX + 25, rightY + 112, title, 17, '#ffffff')
        this.addInfoText(rightX + 25, rightY + 150, text, 13, '#999999', 235)
        this.addInfoText(rightX + 25, rightY + 250, 'Система будет добавлена позже.', 13, '#777777', 235)
    }

    addInfoText(x, y, text, fontSize, color, wrapWidth = null) {
        const textObject = this.add.text(x, y, text, {
            fontSize: fontSize + 'px',
            color,
            wordWrap: wrapWidth ? { width: wrapWidth } : undefined,
            lineSpacing: 6
        }).setDepth(22)

        this.infoPanelObjects.push(textObject)

        return textObject
    }

    addInfoButton(x, y, text, onClick, disabled = false) {
        const button = this.add.text(x, y, text, {
            fontSize: '13px',
            backgroundColor: disabled ? '#222222' : '#333333',
            color: disabled ? '#777777' : '#ffffff',
            padding: {
                x: 10,
                y: 7
            }
        }).setDepth(22)

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

        const { rightX, rightY } = this.layout

        this.baseMessageText = this.add.text(rightX + 25, rightY + 475, message, {
            fontSize: '13px',
            color,
            wordWrap: {
                width: 235
            }
        }).setDepth(30)
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
