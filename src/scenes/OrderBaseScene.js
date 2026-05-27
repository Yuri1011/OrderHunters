import Phaser from 'phaser'
import { contracts } from '../data/contracts.js'
import { baseBuildings, getBaseBuildingById } from '../data/baseBuildings.js'
import { createBaseSceneLayout } from '../ui/baseSceneLayout.js'
import { createNavButtonBackground } from '../ui/navButtonBackground.js'
import { createReputationBar } from '../ui/reputationBar.js'

import {
    playerState,
    savePlayerState,
    isContractCompleted,
    canTakeContract,
    MAX_BANDAGES,
    MAX_REPUTATION,
    getReputationTitle,
    getEffectiveMaxHP
} from '../data/playerState.js'

const MAP_ICON_SIZE = 72
const MAP_ICON_HOVER_SIZE = 82
const MESSENGER_ASPECT = 805 / 1626
const MESSENGER_MAX_HEIGHT = 606

export class OrderBaseScene extends Phaser.Scene {
    constructor() {
        super('OrderBaseScene')
    }

    preload() {
        this.load.image('hunter_base', '/assets/backgrounds/base-bg.png')
        this.load.image('barracks_bg', 'assets/backgrounds/barracks-bg.webp')
        this.load.image('parchment_panel', '/assets/ui/panel-building-card.png')
        this.load.image('ui_messenger_order', '/assets/ui/vwstovoi.webp')
        this.load.image('ui_close_x', '/assets/ui/close-x.webp')
        this.load.image('ui_player_panel_frame', '/assets/ui/player-panel-frame.webp')
        this.load.image('ui_top_panel_frame', '/assets/ui/top-panel-frame.webp')
        this.load.image('ui_nav_button', '/assets/ui/nav-button.webp')

        // Иконки локаций базы
        this.load.image('icon_forge', '/assets/icons/base/forge.png')
        this.load.image('icon_council', '/assets/icons/base/council.png')
        this.load.image('icon_infirmary', '/assets/icons/base/infirmary.png')
        this.load.image('icon_quarters', '/assets/icons/base/apartment.png')
        this.load.image('icon_barracks', '/assets/icons/base/barracks.png')
        this.load.image('icon_rest', '/assets/icons/base/rest.png')
        this.load.image('icon_contracts', '/assets/icons/base/contracts.png')
        this.load.image('icon_training', '/assets/icons/base/training.png')
    }

    init(data) {
        this.selectedBuildingId = data?.selectedBuildingId || 'contracts'
    }

    create() {
        this.infoPanelObjects = []
        this.baseMessageText = null
        this.hoverLabel = null
        this.hotspotObjects = []
        this.locationIcons = {}
        this.activeLocationId = null
        this.locationPanel = null
        this.locationPanelType = null
        this.locationPanelTitle = null
        this.locationPanelSubtitle = null
        this.locationPanelBody = null
        this.locationPanelActionObjects = []
        this.baseImage = null
        this.mapImage = null
        // Объекты доски контрактов, чтобы потом можно было их удалить
        this.contractBoardObjects = []
        // Объекты нижнего меню, чтобы можно было перерисовывать панель
        this.bottomNavObjects = []
        this.messengerPanel = null

        // Нижнее меню не держит активную вкладку: кнопки выделяются только при наведении
        this.activeNavId = null

        this.layout = createBaseSceneLayout(this.scale)

        this.cameras.main.setBackgroundColor('#050505')

        this.drawScreenBackground()
        this.drawTopBar()
        this.drawBaseView()
        this.drawPlayerPanel()
        this.createLocationPanel()
        this.drawHotspots()
        this.drawBottomNav()

        // Если есть новый доступный контракт — Вестовой сообщает о нём
        this.showContractMessengerIfNeeded()
    }

    drawScreenBackground() {
        const screenW = this.scale.width
        const screenH = this.scale.height

        this.add.rectangle(screenW / 2, screenH / 2, screenW, screenH, 0x050505).setDepth(0)

        // Едва заметный общий фон, чтобы экран не был пустым вокруг центральной базы
        this.add.rectangle(screenW / 2, screenH / 2, screenW - 40, screenH - 30, 0x0b0b0b)
            .setStrokeStyle(1, 0x202020)
            .setDepth(1)
    }

    drawTopBar() {
        const { topX, topY, topW, topH } = this.layout
        const reputationW = 318
        const reputationX = topX + topW / 2 - reputationW / 2

        this.add.image(topX, topY, 'ui_top_panel_frame')
            .setOrigin(0, 0)
            .setDisplaySize(topW, topH)
            .setDepth(5)

        createReputationBar(
            this,
            reputationX,
            topY + 12,
            playerState.reputation,
            getReputationTitle(),
            {
                width: reputationW,
                depth: 6,
                maxReputation: MAX_REPUTATION
            }
        )

        this.add.text(topX + 92, topY + 24, 'Серебро: ' + playerState.silver, {
            fontSize: '16px',
            color: '#cccccc'
        }).setDepth(6)

        this.add.text(topX + 250, topY + 24, 'Бинты: ' + playerState.bandages + ' / ' + MAX_BANDAGES, {
            fontSize: '16px',
            color: '#cccccc'
        }).setDepth(6)

        this.add.text(topX + topW - 430, topY + 24, 'Опыт: ' + playerState.exp, {
            fontSize: '16px',
            color: '#cccccc'
        }).setDepth(6)

        const completedCount = contracts.filter((contract) => {
            return isContractCompleted(contract.id)
        }).length

        this.add.text(topX + topW - 250, topY + 24, 'Контракты: ' + completedCount + ' / ' + contracts.length, {
            fontSize: '16px',
            color: '#999999'
        }).setDepth(6)
    }

    drawBaseView() {
        const { mapX, mapY, mapW, mapH } = this.layout

        this.baseImage = this.add.image(mapX, mapY, 'hunter_base')
            .setOrigin(0, 0)
            .setDepth(1)

        this.mapImage = this.baseImage

        // Вписываем изображение в область карты
        const scaleX = mapW / this.baseImage.width
        const scaleY = mapH / this.baseImage.height

        // cover, чтобы не было пустот внутри рамки
        const imageScale = Math.max(scaleX, scaleY)
        this.baseImage.setScale(imageScale)

        const mapMaskShape = this.make.graphics({ x: 0, y: 0, add: false })
        mapMaskShape.fillStyle(0xffffff)
        mapMaskShape.fillRect(mapX, mapY, mapW, mapH)

        const mapMask = mapMaskShape.createGeometryMask()
        this.baseImage.setMask(mapMask)

        this.add.rectangle(mapX, mapY, mapW, mapH, 0x000000, 0.06)
            .setOrigin(0, 0)
            .setDepth(5)

    }

    drawPlayerPanel() {
        const { leftX, leftY, leftW, leftH } = this.layout

        this.add.image(leftX, leftY, 'ui_player_panel_frame')
            .setOrigin(0, 0)
            .setDisplaySize(leftW, leftH)
            .setDepth(5)

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
        // Удаляем старые иконки/зоны перед перерисовкой
        this.hotspotObjects.forEach((object) => {
            object.destroy()
        })

        this.hotspotObjects = []
        this.locationIcons = {}
        this.hideHoverLabel()

        const { mapX, mapY, mapW, mapH } = this.layout

        baseBuildings.forEach((location) => {
            const iconX = mapX + location.x * mapW
            const iconY = mapY + location.y * mapH

            const icon = this.add.image(iconX, iconY, location.icon)
                .setDisplaySize(MAP_ICON_SIZE, MAP_ICON_SIZE)
                .setDepth(30)
                .setInteractive({ useHandCursor: true })

            icon.on('pointerover', () => {
                icon.setDisplaySize(MAP_ICON_HOVER_SIZE, MAP_ICON_HOVER_SIZE)
                this.showHoverLabel(location, {
                    x: iconX,
                    y: iconY
                })
            })

            icon.on('pointerout', () => {
                icon.setDisplaySize(MAP_ICON_SIZE, MAP_ICON_SIZE)
                this.hideHoverLabel()
            })

            icon.on('pointerdown', () => {
                // Повторный клик по открытой локации закрывает её окно
                if (this.activeLocationId === location.id) {
                    this.closeLocationPanel()
                    this.closeContractBoard()
                    this.activeLocationId = null
                    return
                }

                // Сначала открываем карточку доски контрактов справа
                if (location.id === 'contracts') {
                    this.closeContractBoard()
                    this.openLocationPanel(location)
                    return
                }

                // Остальные здания
                this.closeContractBoard()
                this.openLocationPanel(location)
            })

            this.locationIcons[location.id] = icon
            this.hotspotObjects.push(icon)
        })
    }

    showHoverLabel(building, rect) {
        this.hideHoverLabel()

        this.hoverLabel = this.add.text(rect.x, rect.y - 42, building.title, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '14px',
            color: '#f0e2cb',
            backgroundColor: '#111111',
            padding: {
                x: 9,
                y: 5
            }
        })
            .setOrigin(0.5)
            .setDepth(60)
    }

    hideHoverLabel() {
        if (this.hoverLabel) {
            this.hoverLabel.destroy()
            this.hoverLabel = null
        }
    }

    drawBottomNav() {
        // Удаляем старые элементы нижнего меню перед новой отрисовкой
        this.bottomNavObjects.forEach((object) => {
            object.destroy()
        })

        this.bottomNavObjects = []

        const { bottomX, bottomY, bottomW, bottomH } = this.layout

        const panel = this.add.graphics().setDepth(40)

        // Общая тёмная подложка нижней панели
        panel.fillStyle(0x111211, 0.96)
        panel.fillRoundedRect(bottomX, bottomY, bottomW, bottomH, 10)

        panel.lineStyle(1, 0x47443d, 1)
        panel.strokeRoundedRect(bottomX, bottomY, bottomW, bottomH, 10)

        this.bottomNavObjects.push(panel)

        const navItems = [
            {
                id: 'contracts',
                label: 'КОНТРАКТЫ',
                icon: 'icon_contracts',
                badge: false
            },
            {
                id: 'hunters',
                label: 'ОХОТНИКИ',
                icon: 'icon_barracks',
                badge: false
            },
            {
                id: 'inventory',
                label: 'ИНВЕНТАРЬ',
                icon: 'icon_quarters',
                badge: false
            },
            {
                id: 'map',
                label: 'КАРТА',
                icon: 'icon_council',
                badge: false
            },
            {
                id: 'upgrades',
                label: 'УЛУЧШЕНИЯ',
                icon: 'icon_forge',
                badge: false
            }
        ]

        const itemW = bottomW / navItems.length

        navItems.forEach((item, index) => {
            const x = bottomX + itemW * index
            const y = bottomY

            this.drawBottomNavButton(item, x, y, itemW, bottomH)
        })
    }

    drawBottomNavButton(item, x, y, w, h) {
        const isActive = false

        const buttonBg = createNavButtonBackground(this, x, y, w, h, 41)

        const drawButtonBg = (isHover = false) => {
            buttonBg.setState(isHover)
        }

        drawButtonBg(false)

        this.bottomNavObjects.push(...buttonBg.parts)

        // Текст кнопки
        const text = this.add.text(x + w / 2, y + h / 2 + 1, item.label, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '14px',
            color: isActive ? '#f3e4c8' : '#aaa394'
        })
            .setOrigin(0.5)
            .setDepth(42)

        this.bottomNavObjects.push(text)

        // Красная точка-уведомление
        if (item.badge) {
            const badge = this.add.circle(x + 18, y + 14, 6, 0x8f1d16, 1)
                .setStrokeStyle(1, 0xffb0a0, 0.85)
                .setDepth(44)

            const badgeText = this.add.text(x + 18, y + 13, '!', {
                fontFamily: 'Arial, sans-serif',
                fontSize: '10px',
                color: '#ffffff'
            })
                .setOrigin(0.5)
                .setDepth(45)

            this.bottomNavObjects.push(badge, badgeText)
        }

        // Интерактивная зона всей кнопки
        const hitZone = this.add.zone(x + 4, y + 5, w - 8, h - 10)
            .setOrigin(0, 0)
            .setDepth(46)
            .setInteractive({ useHandCursor: true })

        hitZone.on('pointerover', () => {
            drawButtonBg(true)

            if (!isActive) {
                text.setColor('#e0d2b8')
            }
        })

        hitZone.on('pointerout', () => {
            drawButtonBg(false)

            if (!isActive) {
                text.setColor('#aaa394')
            }
        })

        hitZone.on('pointerdown', () => {
            this.handleBottomNavClick(item.id)
        })

        this.bottomNavObjects.push(hitZone)
    }

    handleBottomNavClick(navId) {
        this.activeNavId = null
        this.drawBottomNav()

        // При переходе по нижнему меню закрываем большие окна
        this.closeContractBoard()

        if (navId === 'contracts') {
            // Из нижнего меню сразу открываем большую доску контрактов
            const contractsBuilding = getBaseBuildingById('contracts')
            this.openContractBoard(contractsBuilding)
            return
        }

        if (navId === 'hunters') {
            this.showBaseMessage('Раздел охотников пока в разработке.')
            return
        }

        if (navId === 'inventory') {
            this.showBaseMessage('Инвентарь пока в разработке.')
            return
        }

        if (navId === 'map') {
            this.showBaseMessage('Карта Морвальда пока в разработке.')
            return
        }

        if (navId === 'upgrades') {
            this.showBaseMessage('Улучшения базы пока в разработке.')
        }
    }

    showBaseMessage(message) {
        if (this.baseMessageText) {
            this.baseMessageText.destroy()
            this.baseMessageText = null
        }

        const { mapX, mapY, mapW } = this.layout

        this.baseMessageText = this.add.text(mapX + mapW / 2, mapY + 28, message, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '16px',
            color: '#f0e2cb',
            backgroundColor: '#111111',
            padding: {
                x: 14,
                y: 8
            }
        })
            .setOrigin(0.5, 0)
            .setDepth(90)

        // Сообщение само исчезает через 2 секунды
        this.time.delayedCall(2000, () => {
            if (this.baseMessageText) {
                this.baseMessageText.destroy()
                this.baseMessageText = null
            }
        })
    }

    hasAvailableContracts() {
        return contracts.some((contract) => {
            const completed = isContractCompleted(contract.id)
            const unlocked = this.isContractUnlocked(contract)

            return unlocked && !completed && canTakeContract()
        })
    }

    getNewContractForNotification() {
        // Ищем первый контракт, который:
        // 1. открыт игроку
        // 2. ещё не выполнен
        // 3. ещё не был показан через Вестового
        // 4. может быть взят сейчас
        return contracts.find((contract) => {
            const completed = isContractCompleted(contract.id)
            const unlocked = this.isContractUnlocked(contract)
            const alreadyViewed = playerState.viewedContracts.includes(contract.id)

            return unlocked && !completed && !alreadyViewed && canTakeContract()
        })
    }

    showContractMessengerIfNeeded() {
        const newContract = this.getNewContractForNotification()

        if (!newContract) return

        this.showContractMessenger(newContract)
    }

    showContractMessenger(contract) {
        // Закрываем другие панели
        this.closeLocationPanel()
        this.closeContractBoard()

        // Если Вестовой уже есть на экране — удаляем
        this.hideMessengerPanel()

        const { mapX, mapY, mapW, mapH } = this.layout

        // Размер и позиция окна Вестового
        let panelH = Math.min(MESSENGER_MAX_HEIGHT, mapH - 80)
        let panelW = Math.round(panelH * MESSENGER_ASPECT)

        if (panelW > mapW - 96) {
            panelW = mapW - 96
            panelH = Math.round(panelW / MESSENGER_ASPECT)
        }

        const panelX = mapX + mapW / 2
        const panelY = mapY + mapH / 2

        this.messengerPanel = this.add.container(0, 0)
        this.messengerPanel.setDepth(2500)

        const blocker = this.add.rectangle(mapX, mapY, mapW, mapH, 0x000000, 0.46)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: false })

        // Само изображение Вестового
        const messengerImage = this.add.image(panelX, panelY, 'ui_messenger_order')
            .setDisplaySize(panelW, panelH)

        // Заголовок над головой персонажа
        const roleText = this.add.text(panelX, panelY - panelH * 0.36, 'ВЕСТОВОЙ ОРДЕНА', {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '12px',
            color: '#8b3f28',
            align: 'center'
        }).setOrigin(0.5)

        const titleText = this.add.text(panelX, panelY + panelH * 0.22, 'Есть работа', {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '24px',
            color: '#2b1a10',
            align: 'center'
        }).setOrigin(0.5)

        const bodyText = this.add.text(panelX, panelY + panelH * 0.30,
            'На доске появился новый контракт.\n' +
            'Загляни, как будет минутка.',
            {
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '15px',
                color: '#3a2618',
                align: 'center',
                lineSpacing: 8,
                wordWrap: { width: panelW * 0.72 }
            }
        ).setOrigin(0.5)

        const closeSize = 42
        const closeX = panelX + panelW / 2 - closeSize - 10
        const closeY = panelY - panelH / 2 + 14
        const closeButton = this.add.image(closeX + closeSize / 2, closeY + closeSize / 2, 'ui_close_x')
            .setDisplaySize(closeSize, closeSize)

        const closeHitZone = this.add.zone(closeX, closeY, closeSize, closeSize)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true })

        closeHitZone.on('pointerover', () => {
            closeButton.setDisplaySize(closeSize + 4, closeSize + 4)
            closeButton.setAlpha(1)
        })

        closeHitZone.on('pointerout', () => {
            closeButton.setDisplaySize(closeSize, closeSize)
            closeButton.setAlpha(0.92)
        })

        closeHitZone.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation()
            this.dismissMessengerContract(contract)
        })

        this.messengerPanel.add([
            blocker,
            messengerImage,
            roleText,
            titleText,
            bodyText,
            closeButton,
            closeHitZone
        ])
    }

    dismissMessengerContract(contract) {
        if (contract && !playerState.viewedContracts.includes(contract.id)) {
            playerState.viewedContracts.push(contract.id)
            savePlayerState()
        }

        this.hideMessengerPanel()
    }

    hideMessengerPanel() {
        if (this.messengerPanel) {
            this.messengerPanel.destroy(true)
            this.messengerPanel = null
        }
    }

    markVisibleContractsAsViewed() {
        let changed = false

        contracts.forEach((contract) => {
            const completed = isContractCompleted(contract.id)
            const unlocked = this.isContractUnlocked(contract)
            const alreadyViewed = playerState.viewedContracts.includes(contract.id)

            // Просмотренным считаем только тот контракт, который реально доступен игроку
            if (unlocked && !completed && !alreadyViewed) {
                playerState.viewedContracts.push(contract.id)
                changed = true
            }
        })

        if (changed) {
            savePlayerState()
        }
    }

    createLocationPanel() {
        const {
            mapX,
            mapY,
            mapW,
            mapH,
            locationPanelX,
            locationPanelY,
            locationPanelW,
            locationPanelH
        } = this.layout

        this.locationPanel = this.add.container(0, 0)
            .setDepth(2400)
            .setVisible(false)

        const blocker = this.add.rectangle(mapX, mapY, mapW, mapH, 0x000000, 0.46)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: false })

        const parchment = this.add.image(locationPanelX, locationPanelY, 'parchment_panel')
            .setOrigin(0, 0)
            .setDisplaySize(locationPanelW, locationPanelH)

        this.locationPanel.add(blocker)
        this.locationPanel.add(parchment)

        const closeSize = 42
        const closeX = locationPanelX + locationPanelW - closeSize - 14
        const closeY = locationPanelY + 14
        const closeButton = this.add.image(closeX + closeSize / 2, closeY + closeSize / 2, 'ui_close_x')
            .setDisplaySize(closeSize, closeSize)

        const closeHitZone = this.add.zone(closeX, closeY, closeSize, closeSize)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true })

        closeHitZone.on('pointerover', () => {
            closeButton.setDisplaySize(closeSize + 4, closeSize + 4)
            closeButton.setAlpha(1)
        })

        closeHitZone.on('pointerout', () => {
            closeButton.setDisplaySize(closeSize, closeSize)
            closeButton.setAlpha(0.92)
        })

        closeHitZone.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation()
            this.closeLocationPanel()
        })

        this.locationPanel.add(closeButton)
        this.locationPanel.add(closeHitZone)

        // Верхний маленький тип локации
        this.locationPanelType = this.add.text(locationPanelX + 34, locationPanelY + 30, '', {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#7b3d25'
        })

        this.locationPanel.add(this.locationPanelType)

        // Название
        this.locationPanelTitle = this.add.text(locationPanelX + 34, locationPanelY + 74, '', {
            fontFamily: 'serif',
            fontSize: '24px',
            color: '#2b1b12',
            wordWrap: {
                width: locationPanelW - 68
            }
        })

        this.locationPanel.add(this.locationPanelTitle)

        // Подзаголовок
        this.locationPanelSubtitle = this.add.text(locationPanelX + 34, locationPanelY + 136, '', {
            fontFamily: 'serif',
            fontSize: '16px',
            color: '#5a4332',
            wordWrap: {
                width: locationPanelW - 68
            }
        })

        this.locationPanel.add(this.locationPanelSubtitle)

        // Основной текст
        this.locationPanelBody = this.add.text(locationPanelX + 34, locationPanelY + 188, '', {
            fontFamily: 'serif',
            fontSize: '16px',
            color: '#3a2a1f',
            lineSpacing: 8,
            wordWrap: {
                width: locationPanelW - 68
            }
        })

        this.locationPanel.add(this.locationPanelBody)
    }

    showBuildingInfo(buildingId) {
        const location = getBaseBuildingById(buildingId)

        if (!location) return

        this.openLocationPanel(location)
    }

    openLocationPanel(location) {
        this.hideMessengerPanel()

        if (!location) return

        this.clearLocationPanelActions()

        this.selectedBuildingId = location.id
        this.activeLocationId = location.id

        this.locationPanel.setVisible(true)

        this.locationPanelType.setText(this.getLocationType(location.id))
        this.locationPanelTitle.setText(location.title)
        this.locationPanelSubtitle.setText(location.subtitle)
        this.locationPanelBody.setText(this.getLocationDescription(location.id))

        if (location.id === 'contracts') {
            this.addContractPanelButton(location)
        }
    }

    closeLocationPanel() {
        this.activeLocationId = null

        this.clearLocationPanelActions()

        if (this.locationPanel) {
            this.locationPanel.setVisible(false)
        }

        this.closeContractBoard()
    }

    addContractPanelButton(location) {
        const { locationPanelX, locationPanelY, locationPanelW, locationPanelH } = this.layout
        const buttonX = locationPanelX + 34
        const buttonY = locationPanelY + locationPanelH - 78
        const buttonW = locationPanelW - 68
        const buttonH = 46

        const buttonBg = this.add.graphics()
        const drawButton = (isHover = false) => {
            buttonBg.clear()
            buttonBg.fillStyle(isHover ? 0x5a3520 : 0x3a2418, 0.96)
            buttonBg.fillRoundedRect(buttonX, buttonY, buttonW, buttonH, 8)
            buttonBg.lineStyle(1, isHover ? 0xd3ae73 : 0x8a6843, 1)
            buttonBg.strokeRoundedRect(buttonX, buttonY, buttonW, buttonH, 8)
        }

        drawButton()

        const buttonText = this.add.text(buttonX + buttonW / 2, buttonY + buttonH / 2, 'КОНТРАКТЫ', {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '15px',
            color: '#f4ead8'
        }).setOrigin(0.5)

        const buttonHitZone = this.add.zone(buttonX, buttonY, buttonW, buttonH)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true })

        buttonHitZone.on('pointerover', () => {
            drawButton(true)
            buttonText.setColor('#ffffff')
        })

        buttonHitZone.on('pointerout', () => {
            drawButton(false)
            buttonText.setColor('#f4ead8')
        })

        buttonHitZone.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation()
            this.openContractBoard(location)
        })

        this.locationPanel.add(buttonBg)
        this.locationPanel.add(buttonText)
        this.locationPanel.add(buttonHitZone)

        this.locationPanelActionObjects.push(buttonBg, buttonText, buttonHitZone)
    }

    clearLocationPanelActions() {
        this.locationPanelActionObjects.forEach((object) => {
            object.destroy()
        })

        this.locationPanelActionObjects = []
    }

    getLocationType(id) {
        const types = {
            forge: 'КУЗНИЦА',
            council: 'СОВЕТ',
            infirmary: 'ЛАЗАРЕТ',
            barracks: 'КАЗАРМЫ',
            quarters: 'ОХОТНИК',
            rest: 'ОТДЫХ',
            contracts: 'КОНТРАКТЫ',
            training: 'ТРЕНИРОВКА'
        }

        return types[id] || ''
    }

    getLocationDescription(id) {
        const descriptions = {
            forge: 'Здесь можно улучшать оружие, броню и снаряжение охотников.',
            council: 'Здесь позже появятся решения Совета, репутация и крупные сюжетные выборы.',
            infirmary: 'Здесь лечат раны, снимают последствия контрактов и восстанавливают охотников.',
            barracks: 'Здесь находятся охотники Ордена. Позже здесь можно будет собирать отряд.',
            quarters: 'HP: ' + playerState.hp + ' / ' + getEffectiveMaxHP() +
                '\nРаны: ' + playerState.wounds +
                '\nОпыт: ' + playerState.exp +
                '\nСеребро: ' + playerState.silver +
                '\n\nПозже здесь появятся дневник, снаряжение и личные решения.',
            rest: 'Здесь охотники отдыхают после контрактов и восстанавливают силы.',
            contracts: 'Здесь можно выбрать контракт, принять задание и отправиться в путь.',
            training: 'Здесь охотники тренируются и улучшают боевые навыки.'
        }

        return descriptions[id] || ''
    }

    openContractBoard(location) {
        this.scene.start('ContractBoardScene')
        return

        // старый код ниже пока не трогаем

        // Игрок открыл доску — новые контракты считаем просмотренными
        this.markVisibleContractsAsViewed()

        this.hideMessengerPanel()

        this.closeLocationPanel()
        this.closeContractBoard()

        this.selectedBuildingId = location.id
        this.activeLocationId = location.id

        const { mapX, mapY, mapW, mapH } = this.layout

        const boardX = mapX
        const boardY = mapY
        const boardW = mapW
        const boardH = mapH

        // Затемнение всей области карты.
        // ВАЖНО: оно интерактивное и блокирует клики по иконкам под окном.
        const blocker = this.add.rectangle(mapX, mapY, mapW, mapH, 0x000000, 0.72)
            .setOrigin(0, 0)
            .setDepth(78)
            .setInteractive({ useHandCursor: false })

        // Клик по затемнению вне доски закрывает окно
        blocker.on('pointerdown', () => {
            this.closeContractBoard()
            this.activeLocationId = null
        })

        this.contractBoardObjects.push(blocker)

        // Невидимая зона самой доски.
        // Она нужна, чтобы клик внутри окна НЕ закрывал окно и НЕ проходил сквозь него.
        const boardHitZone = this.add.zone(boardX, boardY, boardW, boardH)
            .setOrigin(0, 0)
            .setDepth(79)
            .setInteractive()

        boardHitZone.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation()
        })

        this.contractBoardObjects.push(boardHitZone)

        const bg = this.add.graphics().setDepth(80)

        bg.fillStyle(0x080808, 0.97)
        bg.fillRoundedRect(boardX, boardY, boardW, boardH, 16)

        bg.lineStyle(2, 0x5a4630, 1)
        bg.strokeRoundedRect(boardX, boardY, boardW, boardH, 16)

        this.contractBoardObjects.push(bg)

        const title = this.add.text(boardX + 32, boardY + 24, 'ДОСКА КОНТРАКТОВ', {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '28px',
            color: '#f0e2cb'
        }).setDepth(81)

        this.contractBoardObjects.push(title)

        const subtitle = this.add.text(boardX + 32, boardY + 62, 'Выбери задание для охотника', {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '15px',
            color: '#9f927f'
        }).setDepth(81)

        this.contractBoardObjects.push(subtitle)

        const closeSize = 42
        const closeX = boardX + boardW - closeSize - 24
        const closeY = boardY + 22
        const closeButton = this.add.image(closeX + closeSize / 2, closeY + closeSize / 2, 'ui_close_x')
            .setDisplaySize(closeSize, closeSize)
            .setDepth(83)

        this.contractBoardObjects.push(closeButton)

        const closeHitZone = this.add.zone(closeX, closeY, closeSize, closeSize)
            .setOrigin(0, 0)
            .setDepth(84)
            .setInteractive({ useHandCursor: true })

        closeHitZone.on('pointerover', () => {
            closeButton.setDisplaySize(closeSize + 4, closeSize + 4)
            closeButton.setAlpha(1)
        })

        closeHitZone.on('pointerout', () => {
            closeButton.setDisplaySize(closeSize, closeSize)
            closeButton.setAlpha(0.92)
        })

        closeHitZone.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation()
            this.closeContractBoard()
            this.activeLocationId = null
        })

        this.contractBoardObjects.push(closeHitZone)

        contracts.forEach((contract, index) => {
            this.drawContractCard(contract, index, boardX + 32, boardY + 105, boardW - 64)
        })
    }

    drawContractCard(contract, index, x, startY, width) {
        const cardH = 118
        const gap = 14
        const y = startY + index * (cardH + gap)

        const completed = isContractCompleted(contract.id)
        const unlocked = this.isContractUnlocked(contract)
        const canStart = unlocked && !completed && canTakeContract()

        const card = this.add.graphics().setDepth(81)

        let fillColor = 0x151515
        let borderColor = 0x4a3a28

        if (completed) {
            fillColor = 0x102010
            borderColor = 0x3d6b3d
        } else if (!unlocked) {
            fillColor = 0x101010
            borderColor = 0x292929
        }

        card.fillStyle(fillColor, 0.94)
        card.fillRoundedRect(x, y, width, cardH, 10)

        card.lineStyle(1, borderColor, 1)
        card.strokeRoundedRect(x, y, width, cardH, 10)

        this.contractBoardObjects.push(card)

        const titleColor = unlocked ? '#ffffff' : '#666666'

        const title = this.add.text(x + 18, y + 14, contract.title, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '20px',
            color: titleColor
        }).setDepth(82)

        this.contractBoardObjects.push(title)

        const danger = this.add.text(x + 18, y + 43, 'Регион: ' + contract.region + '   Опасность: ' + contract.danger, {
            fontSize: '14px',
            color: unlocked ? contract.dangerColor : '#555555'
        }).setDepth(82)

        this.contractBoardObjects.push(danger)

        const rewardText =
            'Награда: ' +
            contract.reward.silverMin +
            '-' +
            contract.reward.silverMax +
            ' серебра, опыт: ' +
            contract.reward.exp

        const reward = this.add.text(x + 18, y + 68, rewardText, {
            fontSize: '14px',
            color: unlocked ? '#c9b27d' : '#555555'
        }).setDepth(82)

        this.contractBoardObjects.push(reward)

        let statusText = ''

        if (completed) {
            statusText = 'ВЫПОЛНЕНО'
        } else if (!unlocked) {
            statusText = 'ЗАКРЫТО'
        } else if (!canTakeContract()) {
            statusText = 'РЕЙНАР РАНЕН'
        } else {
            statusText = 'ПРИНЯТЬ'
        }

        const buttonColor = canStart ? '#3a2418' : '#222222'
        const buttonTextColor = canStart ? '#ffffff' : '#777777'

        const button = this.add.text(x + width - 135, y + 40, statusText, {
            fontSize: '15px',
            color: buttonTextColor,
            backgroundColor: buttonColor,
            padding: {
                x: 16,
                y: 10
            }
        })
            .setDepth(83)
            .setOrigin(0.5, 0)

        this.contractBoardObjects.push(button)

        if (canStart) {
            button.setInteractive({ useHandCursor: true })

            button.on('pointerover', () => {
                button.setStyle({
                    backgroundColor: '#5a3520'
                })
            })

            button.on('pointerout', () => {
                button.setStyle({
                    backgroundColor: buttonColor
                })
            })

            button.on('pointerdown', () => {
                this.scene.start('ContractTravelScene', {
                    contractId: contract.id
                })
            })
        }

        if (!unlocked && contract.requiredCompletedContracts.length > 0) {
            const lockText = this.add.text(x + 18, y + 93, 'Сначала нужно выполнить предыдущий контракт.', {
                fontSize: '12px',
                color: '#666666'
            }).setDepth(82)

            this.contractBoardObjects.push(lockText)
        }
    }

    isContractUnlocked(contract) {
        // Контракт открыт, если все нужные предыдущие контракты выполнены
        return contract.requiredCompletedContracts.every((requiredContractId) => {
            return isContractCompleted(requiredContractId)
        })
    }

    closeContractBoard() {
        this.contractBoardObjects.forEach((object) => {
            object.destroy()
        })

        this.contractBoardObjects = []
    }
}
