import Phaser from 'phaser'
import { contracts } from '../data/contracts.js'
import { createBaseSceneLayout } from '../ui/baseSceneLayout.js'
import { createNavButtonBackground } from '../ui/navButtonBackground.js'
import { createReputationBar } from '../ui/reputationBar.js'
import {
    playerState,
    isContractCompleted,
    MAX_BANDAGES,
    MAX_REPUTATION,
    getReputationTitle,
    getEffectiveMaxHP
} from '../data/playerState.js'

export default class BarracksScene extends Phaser.Scene {
    constructor() {
        super('BarracksScene')
    }

    preload() {
        this.loadImageIfMissing('barracks_bg', '/assets/backgrounds/barracks-bg.webp')
        this.loadImageIfMissing('ui_player_panel_frame', '/assets/ui/player-panel-frame.webp')
        this.loadImageIfMissing('ui_top_panel_frame', '/assets/ui/top-panel-frame.webp')
        this.loadImageIfMissing('ui_nav_button', '/assets/ui/nav-button.webp')
    }

    create() {
        this.bottomNavObjects = []
        this.barracksMessageText = null

        this.layout = createBaseSceneLayout(this.scale)

        this.cameras.main.setBackgroundColor('#050505')
        this.drawScreenBackground()
        this.drawLocationBackground()
        this.drawTopBar()
        this.drawPlayerPanel()
        this.drawBottomNav()
        this.drawHeader()
        this.drawActionButtons()
    }

    loadImageIfMissing(key, path) {
        if (!this.textures.exists(key)) {
            this.load.image(key, path)
        }
    }

    drawScreenBackground() {
        const screenW = this.scale.width
        const screenH = this.scale.height

        this.add.rectangle(screenW / 2, screenH / 2, screenW, screenH, 0x050505)
        this.add.rectangle(screenW / 2, screenH / 2, screenW - 40, screenH - 30, 0x0b0b0b)
            .setStrokeStyle(1, 0x202020)
    }

    drawLocationBackground() {
        const { gameX, gameY, gameW, gameH } = this.layout

        const bg = this.add.image(gameX, gameY, 'barracks_bg')
            .setOrigin(0, 0)

        const scaleX = gameW / bg.width
        const scaleY = gameH / bg.height
        const imageScale = Math.max(scaleX, scaleY)
        bg.setScale(imageScale)

        const maskShape = this.make.graphics({ x: 0, y: 0, add: false })
        maskShape.fillStyle(0xffffff)
        maskShape.fillRect(gameX, gameY, gameW, gameH)

        const mask = maskShape.createGeometryMask()
        bg.setMask(mask)

        this.add.rectangle(gameX, gameY, gameW, gameH, 0x000000, 0.24)
            .setOrigin(0)
    }

    drawTopBar() {
        const { topX, topY, topW, topH } = this.layout
        const reputationW = 318
        const reputationX = topX + topW / 2 - reputationW / 2

        this.add.image(topX, topY, 'ui_top_panel_frame')
            .setOrigin(0, 0)
            .setDisplaySize(topW, topH)

        createReputationBar(
            this,
            reputationX,
            topY + 12,
            playerState.reputation,
            getReputationTitle(),
            {
                width: reputationW,
                maxReputation: MAX_REPUTATION
            }
        )

        this.add.text(topX + 92, topY + 24, 'Серебро: ' + playerState.silver, {
            fontSize: '16px',
            color: '#cccccc'
        })

        this.add.text(topX + 250, topY + 24, 'Бинты: ' + playerState.bandages + ' / ' + MAX_BANDAGES, {
            fontSize: '16px',
            color: '#cccccc'
        })

        this.add.text(topX + topW - 430, topY + 24, 'Опыт: ' + playerState.exp, {
            fontSize: '16px',
            color: '#cccccc'
        })

        const completedCount = contracts.filter((contract) => {
            return isContractCompleted(contract.id)
        }).length

        this.add.text(topX + topW - 250, topY + 24, 'Контракты: ' + completedCount + ' / ' + contracts.length, {
            fontSize: '16px',
            color: '#999999'
        })
    }

    drawPlayerPanel() {
        const { leftX, leftY, leftW, leftH } = this.layout

        this.add.image(leftX, leftY, 'ui_player_panel_frame')
            .setOrigin(0, 0)
            .setDisplaySize(leftW, leftH)

        this.add.text(leftX + 25, leftY + 35, playerState.name, {
            fontSize: '20px',
            color: '#ffffff'
        })

        this.add.text(leftX + 25, leftY + 68, playerState.title, {
            fontSize: '14px',
            color: '#aaa'
        })

        this.add.text(leftX + 25, leftY + 120, 'Состояние', {
            fontSize: '17px',
            color: '#ffffff'
        })

        this.add.text(leftX + 25, leftY + 160, 'HP: ' + playerState.hp + ' / ' + getEffectiveMaxHP(), {
            fontSize: '14px',
            color: '#79ff79'
        })

        this.add.text(leftX + 25, leftY + 190, 'Раны: ' + playerState.wounds, {
            fontSize: '14px',
            color: playerState.wounds === 'нет' ? '#cccccc' : '#ffaa55'
        })

        this.add.text(leftX + 25, leftY + 220, 'Серебро: ' + playerState.silver, {
            fontSize: '14px',
            color: '#cccccc'
        })

        this.add.text(leftX + 25, leftY + 250, 'Бинты: ' + playerState.bandages + ' / ' + MAX_BANDAGES, {
            fontSize: '14px',
            color: '#cccccc'
        })

        this.add.text(leftX + 25, leftY + 320, 'Шип Ордена', {
            fontSize: '17px',
            color: '#ffffff'
        })

        this.add.text(leftX + 25, leftY + 355, 'Редкий знак свободы.\nОрден больше не имеет\nправа удерживать его.', {
            fontSize: '13px',
            color: '#999999',
            lineSpacing: 6,
            wordWrap: {
                width: leftW - 45
            }
        })
    }

    drawBottomNav() {
        this.bottomNavObjects.forEach((object) => {
            object.destroy()
        })

        this.bottomNavObjects = []

        const { bottomX, bottomY, bottomW, bottomH } = this.layout

        const panel = this.add.graphics().setDepth(40)

        panel.fillStyle(0x111211, 0.96)
        panel.fillRoundedRect(bottomX, bottomY, bottomW, bottomH, 10)

        panel.lineStyle(1, 0x47443d, 1)
        panel.strokeRoundedRect(bottomX, bottomY, bottomW, bottomH, 10)

        this.bottomNavObjects.push(panel)

        const navItems = [
            {
                id: 'contracts',
                label: 'КОНТРАКТЫ'
            },
            {
                id: 'hunters',
                label: 'ОХОТНИКИ'
            },
            {
                id: 'inventory',
                label: 'ИНВЕНТАРЬ'
            },
            {
                id: 'map',
                label: 'КАРТА'
            },
            {
                id: 'upgrades',
                label: 'УЛУЧШЕНИЯ'
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
        const isActive = item.id === 'hunters'

        const buttonBg = createNavButtonBackground(this, x, y, w, h, 41)

        const drawButtonBg = (isHover = false) => {
            buttonBg.setState(isActive || isHover)
        }

        drawButtonBg(false)
        this.bottomNavObjects.push(...buttonBg.parts)

        const text = this.add.text(x + w / 2, y + h / 2 + 1, item.label, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '14px',
            color: isActive ? '#f3e4c8' : '#aaa394'
        })
            .setOrigin(0.5)
            .setDepth(42)

        this.bottomNavObjects.push(text)

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
        if (navId === 'hunters') return

        if (navId === 'contracts') {
            this.scene.start('ContractBoardScene')
            return
        }

        const selectedBuildingByNavId = {
            inventory: 'quarters',
            map: 'council',
            upgrades: 'forge'
        }

        this.scene.start('OrderBaseScene', {
            selectedBuildingId: selectedBuildingByNavId[navId] || 'contracts'
        })
    }

    drawHeader() {
        const { gameX, gameY, gameW } = this.layout

        this.add.text(gameX + 36, gameY + 30, 'Казармы', {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '34px',
            color: '#e8d7b8'
        })

        this.add.text(gameX + 38, gameY + 74, 'Здесь охотники готовятся к походу.', {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '17px',
            color: '#c3b18f'
        })

        const activeContractText = playerState.activeContractId
            ? `Активный контракт: ${playerState.activeContractId}`
            : 'Активный контракт не выбран'

        this.add.text(gameX + 38, gameY + 112, activeContractText, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '16px',
            color: '#d8c49a',
            wordWrap: {
                width: gameW - 72
            }
        })
    }

    drawActionButtons() {
        const { gameX, gameY, gameW, gameH } = this.layout
        const buttonY = gameY + gameH - 68
        const buttonW = 220
        const buttonH = 44

        this.createButton(gameX + 36, buttonY, buttonW, buttonH, 'НАЗАД К ДОСКЕ', true, () => {
            this.scene.start('ContractBoardScene')
        })

        this.createButton(gameX + gameW - buttonW - 36, buttonY, buttonW, buttonH, 'В ПУТЬ', Boolean(playerState.activeContractId), () => {
            this.scene.start('ContractTravelScene', {
                contractId: playerState.activeContractId
            })
        })
    }

    createButton(x, y, width, height, label, enabled, onClick) {
        const bg = this.add.graphics()

        const draw = (hover = false) => {
            bg.clear()

            if (!enabled) {
                bg.fillStyle(0x202020, 0.9)
                bg.lineStyle(1, 0x454545, 1)
            } else {
                bg.fillStyle(hover ? 0x4e2b18 : 0x2d1b12, 0.96)
                bg.lineStyle(1, hover ? 0xd0a96a : 0x7c5b35, 1)
            }

            bg.fillRoundedRect(x, y, width, height, 2)
            bg.strokeRoundedRect(x, y, width, height, 2)
        }

        draw(false)

        const text = this.add.text(x + width / 2, y + height / 2, label, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '16px',
            color: enabled ? '#f2e4c9' : '#777777'
        }).setOrigin(0.5)

        if (!enabled) return

        const hit = this.add.zone(x, y, width, height)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })

        hit.on('pointerover', () => {
            draw(true)
            text.setColor('#ffffff')
        })

        hit.on('pointerout', () => {
            draw(false)
            text.setColor('#f2e4c9')
        })

        hit.on('pointerdown', onClick)
    }
}
