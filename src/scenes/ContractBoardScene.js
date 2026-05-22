import Phaser from 'phaser'
import { contracts } from '../data/contracts.js'
import { createBaseSceneLayout } from '../ui/baseSceneLayout.js'
import { createNavButtonBackground } from '../ui/navButtonBackground.js'
import {
    playerState,
    savePlayerState,
    isContractCompleted,
    canTakeContract,
    MAX_BANDAGES,
    getEffectiveMaxHP
} from '../data/playerState.js'

export class ContractBoardScene extends Phaser.Scene {
    constructor() {
        super('ContractBoardScene')
    }

    preload() {
        this.load.image('contract_board_bg', '/assets/backgrounds/contract-board-bg.webp')
        this.load.image('contract_card_frame', '/assets/ui/contract-card-frame.webp')
        this.load.image('ui_player_panel_frame', '/assets/ui/player-panel-frame.webp')
        this.load.image('ui_top_panel_frame', '/assets/ui/top-panel-frame.webp')
        this.load.image('ui_nav_button', '/assets/ui/nav-button.webp')
        this.load.spritesheet('scribeWriting', '/assets/characters/scribe_writing_spritesheet.png', {
            frameWidth: 443,
            frameHeight: 443
        })

        this.load.image('icon_forge', '/assets/icons/base/forge.png')
        this.load.image('icon_council', '/assets/icons/base/council.png')
        this.load.image('icon_infirmary', '/assets/icons/base/infirmary.png')
        this.load.image('icon_quarters', '/assets/icons/base/apartment.png')
        this.load.image('icon_barracks', '/assets/icons/base/barracks.png')
        this.load.image('icon_rest', '/assets/icons/base/rest.png')
        this.load.image('icon_contracts', '/assets/icons/base/contracts.png')
        this.load.image('icon_training', '/assets/icons/base/training.png')
    }

    create() {
        this.bottomNavObjects = []

        this.calculateLayout()
        this.markVisibleContractsAsViewed()
        this.createScribeWritingAnimation()

        this.cameras.main.setBackgroundColor('#050505')
        this.drawScreenBackground()
        this.drawLocationBackground()
        this.drawScribe()
        this.drawBaseShell()
        this.drawPlayerPanel()
        this.drawBottomNav()
        this.drawHeader()
        this.drawContracts()
        this.drawBackButton()
    }

    calculateLayout() {
        this.layout = createBaseSceneLayout(this.scale)
    }

    createScribeWritingAnimation() {
        if (this.anims.exists('scribe_write_idle')) return

        this.anims.create({
            key: 'scribe_write_idle',
            frames: this.anims.generateFrameNumbers('scribeWriting', {
                start: 0,
                end: 7
            }),
            frameRate: 3,
            repeat: -1
        })
    }

    drawScribe() {
        const { gameX, gameY, gameW, gameH } = this.layout

        const scribe = this.add.sprite(gameX + gameW * 0.78, gameY + gameH * 0.66, 'scribeWriting')

        scribe.setScale(0.55)
        scribe.play('scribe_write_idle')
    }

    drawScreenBackground() {
        const screenW = this.scale.width
        const screenH = this.scale.height

        this.add.rectangle(screenW / 2, screenH / 2, screenW, screenH, 0x050505)
        this.add.rectangle(screenW / 2, screenH / 2, screenW - 40, screenH - 30, 0x0b0b0b)
            .setStrokeStyle(1, 0x202020)
    }

    drawBaseShell() {
        this.drawTopBar()
    }

    drawTopBar() {
        const { topX, topY, topW, topH } = this.layout

        this.add.image(topX, topY, 'ui_top_panel_frame')
            .setOrigin(0, 0)
            .setDisplaySize(topW, topH)

        this.add.text(topX + 92, topY + 24, 'Серебро: ' + playerState.silver, {
            fontSize: '16px',
            color: '#cccccc'
        })

        this.add.text(topX + 270, topY + 24, 'Бинты: ' + playerState.bandages + ' / ' + MAX_BANDAGES, {
            fontSize: '16px',
            color: '#cccccc'
        })

        this.add.text(topX + 455, topY + 24, 'Опыт: ' + playerState.exp, {
            fontSize: '16px',
            color: '#cccccc'
        })

        const completedCount = contracts.filter((contract) => {
            return isContractCompleted(contract.id)
        }).length

        this.add.text(topX + 650, topY + 24, 'Контракты: ' + completedCount + ' / ' + contracts.length, {
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
                label: 'КОНТРАКТЫ',
                icon: 'icon_contracts'
            },
            {
                id: 'hunters',
                label: 'ОХОТНИКИ',
                icon: 'icon_barracks'
            },
            {
                id: 'inventory',
                label: 'ИНВЕНТАРЬ',
                icon: 'icon_quarters'
            },
            {
                id: 'map',
                label: 'КАРТА',
                icon: 'icon_council'
            },
            {
                id: 'upgrades',
                label: 'УЛУЧШЕНИЯ',
                icon: 'icon_forge'
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
        const isActive = item.id === 'contracts'

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
        if (navId === 'contracts') return

        this.scene.start('OrderBaseScene', {
            selectedBuildingId: 'contracts'
        })
    }

    drawLocationBackground() {
        const { gameX, gameY, gameW, gameH } = this.layout

        const bg = this.add.image(gameX, gameY, 'contract_board_bg')
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

        // Затемнение только внутри игровой области
        this.add.rectangle(gameX, gameY, gameW, gameH, 0x000000, 0.22)
            .setOrigin(0)
    }

    drawHeader() {
        const { gameX, gameY } = this.layout

        this.add.text(gameX + 36, gameY + 30, 'Доска контрактов', {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '34px',
            color: '#e8d7b8'
        })

        this.add.text(gameX + 38, gameY + 74, 'Здесь охотники берут поручения Ордена.', {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '17px',
            color: '#c3b18f'
        })
    }

    drawContracts() {
        const { gameX, gameY, gameW, gameH } = this.layout

        const gap = 24
        const cardW = Math.min(300, Math.floor((gameW - 84 - gap * 2) / 3))
        const cardH = Math.min(430, gameH - 210, Math.round(cardW * 1.43))

        const totalW = contracts.length * cardW + (contracts.length - 1) * gap
        const centeredX = gameX + Math.floor((gameW - totalW) / 2)
        const startX = Math.max(gameX + 34, centeredX - 150)
        const startY = gameY + gameH - cardH - 42

        contracts.forEach((contract, index) => {
            const x = startX + index * (cardW + gap)
            const y = startY

            this.drawContractCard(contract, x, y, cardW, cardH)
        })
    }

    drawContractCard(contract, x, y, w, h) {
        const completed = isContractCompleted(contract.id)
        const unlocked = this.isContractUnlocked(contract)
        const canStart = unlocked && !completed && canTakeContract()

        const frame = this.add.image(x + w / 2, y + h / 2, 'contract_card_frame')
            .setDisplaySize(w, h)
            .setAlpha(unlocked ? 1 : 0.62)

        this.add.text(x + w / 2, y + 24, contract.title, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '20px',
            color: unlocked ? '#d8c49e' : '#777777',
            align: 'center',
            wordWrap: { width: w - 54 }
        }).setOrigin(0.5, 0)

        const previewX = x + 30
        const previewY = y + 78
        const previewW = w - 60
        const previewH = Math.round(w * 0.42)

        this.drawContractPreviewPlaceholder(previewX, previewY, previewW, previewH, unlocked)

        // Мини-описание
        const description = contract.description?.[0] || 'Описание контракта отсутствует.'

        this.add.text(x + 30, previewY + previewH + 14, description, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '14px',
            color: unlocked ? '#c4b18e' : '#626262',
            lineSpacing: 5,
            wordWrap: { width: w - 60 }
        })

        const statsY = y + h - 150
        const valueColor = unlocked ? '#d3bd82' : '#666666'

        this.drawContractStatRow(x + 30, statsY, w - 60, 'Опасность', contract.danger, unlocked ? contract.dangerColor : '#666666')
        this.drawContractStatRow(x + 30, statsY + 26, w - 60, 'Награда', `${contract.reward.silverMin}-${contract.reward.silverMax} серебра`, valueColor)
        this.drawContractStatRow(x + 30, statsY + 52, w - 60, 'Длительность', contract.duration || '1 д.', valueColor)

        if (completed) {
            this.add.text(x + w / 2, y + h - 92, 'ВЫПОЛНЕНО', {
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '13px',
                color: '#8fc58f'
            }).setOrigin(0.5)
        }

        let buttonText = 'ВЗЯТЬ КОНТРАКТ'

        if (completed) {
            buttonText = 'ВЫПОЛНЕНО'
        } else if (!unlocked) {
            buttonText = 'ЗАКРЫТО'
        } else if (!canTakeContract()) {
            buttonText = 'РЕЙНАР РАНЕН'
        }

        this.drawContractButton(x + 30, y + h - 62, w - 60, 40, buttonText, canStart, contract)

        if (!unlocked) {
            this.add.rectangle(x + w / 2, y + h / 2, w - 18, h - 18, 0x000000, 0.34)
        }
    }

    drawContractPreviewPlaceholder(x, y, w, h, unlocked) {
        const preview = this.add.graphics()

        preview.fillStyle(unlocked ? 0x161716 : 0x0d0d0d, 0.94)
        preview.fillRoundedRect(x, y, w, h, 4)
        preview.lineStyle(1, unlocked ? 0x5d4a33 : 0x333333, 1)
        preview.strokeRoundedRect(x, y, w, h, 4)

        preview.lineStyle(1, unlocked ? 0x343c38 : 0x202020, 0.7)
        preview.lineBetween(x + 10, y + h - 26, x + Math.round(w * 0.38), y + Math.round(h * 0.48))
        preview.lineBetween(x + Math.round(w * 0.26), y + h - 24, x + Math.round(w * 0.58), y + Math.round(h * 0.36))
        preview.lineBetween(x + Math.round(w * 0.48), y + h - 24, x + w - 12, y + Math.round(h * 0.42))

        this.add.text(x + w / 2, y + h / 2, 'ПРЕВЬЮ\nСКОРО', {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '13px',
            color: unlocked ? '#8f8068' : '#494949',
            align: 'center',
            lineSpacing: 4
        }).setOrigin(0.5)
    }

    drawContractStatRow(x, y, w, label, value, valueColor) {
        this.add.text(x, y, label, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '14px',
            color: '#9d8a6b'
        })

        this.add.text(x + w, y, value, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '14px',
            color: valueColor
        }).setOrigin(1, 0)
    }

    drawContractButton(x, y, w, h, label, enabled, contract) {
        const buttonBg = this.add.graphics()

        const draw = (hover = false) => {
            buttonBg.clear()

            if (!enabled) {
                buttonBg.fillStyle(0x202020, 0.9)
                buttonBg.lineStyle(1, 0x454545, 1)
            } else {
                buttonBg.fillStyle(hover ? 0x4e2b18 : 0x2d1b12, 0.96)
                buttonBg.lineStyle(1, hover ? 0xd0a96a : 0x7c5b35, 1)
            }

            buttonBg.fillRoundedRect(x, y, w, h, 2)
            buttonBg.strokeRoundedRect(x, y, w, h, 2)
        }

        draw(false)

        const text = this.add.text(x + w / 2, y + h / 2, label, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '14px',
            color: enabled ? '#f2e4c9' : '#777777'
        }).setOrigin(0.5)

        if (!enabled) return

        const hit = this.add.zone(x, y, w, h)
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

        hit.on('pointerdown', () => {
            this.scene.start('ContractTravelScene', {
                contractId: contract.id
            })
        })
    }

    drawBackButton() {
        const { gameX, gameY, gameW } = this.layout

        const x = gameX + gameW - 150
        const y = gameY + 26
        const w = 120
        const h = 40

        const bg = this.add.graphics()

        const draw = (hover = false) => {
            bg.clear()
            bg.fillStyle(hover ? 0x2b2118 : 0x111111, 0.9)
            bg.lineStyle(1, hover ? 0xc9a36a : 0x5a4630, 1)
            bg.fillRoundedRect(x, y, w, h, 8)
            bg.strokeRoundedRect(x, y, w, h, 8)
        }

        draw(false)

        const text = this.add.text(x + w / 2, y + h / 2, 'НАЗАД', {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '15px',
            color: '#e8d7b8'
        }).setOrigin(0.5)

        const hit = this.add.zone(x, y, w, h)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })

        hit.on('pointerover', () => {
            draw(true)
            text.setColor('#ffffff')
        })

        hit.on('pointerout', () => {
            draw(false)
            text.setColor('#e8d7b8')
        })

        hit.on('pointerdown', () => {
            this.scene.start('OrderBaseScene', {
                selectedBuildingId: 'contracts'
            })
        })
    }

    markVisibleContractsAsViewed() {
        let changed = false

        contracts.forEach((contract) => {
            const completed = isContractCompleted(contract.id)
            const unlocked = this.isContractUnlocked(contract)
            const alreadyViewed = playerState.viewedContracts.includes(contract.id)

            if (unlocked && !completed && !alreadyViewed) {
                playerState.viewedContracts.push(contract.id)
                changed = true
            }
        })

        if (changed) {
            savePlayerState()
        }
    }

    isContractUnlocked(contract) {
        return contract.requiredCompletedContracts.every((requiredContractId) => {
            return isContractCompleted(requiredContractId)
        })
    }
}
