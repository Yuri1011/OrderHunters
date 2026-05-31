import Phaser from 'phaser'
import { contracts } from '../data/contracts.js'
import { hunters, getPartyHunters } from '../data/hunters.js'
import { createBaseSceneLayout } from '../ui/baseSceneLayout.js'
import { createNavButtonBackground } from '../ui/navButtonBackground.js'
import { createReputationBar } from '../ui/reputationBar.js'
import {
    playerState,
    isContractCompleted,
    MAX_BANDAGES,
    MAX_REPUTATION,
    getReputationTitle,
    getEffectiveMaxHP,
    addHunterToParty,
    removeHunterFromParty
} from '../data/playerState.js'

const BARRACKS_HUNTER_FRAME_ASPECT = 1209 / 1125
const BARRACKS_PANEL_BOTTOM_GAP = 10
const BARRACKS_SECTION_GAP = 8

export default class BarracksScene extends Phaser.Scene {
    constructor() {
        super('BarracksScene')
    }

    preload() {
        this.loadImageIfMissing('barracks_bg', '/assets/backgrounds/barracks-bg.webp')
        this.loadImageIfMissing('ui_player_panel_frame', '/assets/ui/player-panel-frame.webp')
        this.loadImageIfMissing('ui_top_panel_frame', '/assets/ui/top-panel-frame.webp')
        this.loadImageIfMissing('ui_nav_button', '/assets/ui/nav-button.webp')
        this.loadImageIfMissing('ui_barracks_panel_frame', '/assets/ui/ramka-barak.webp')
        this.loadImageIfMissing('ui_barracks_hunter_frame', '/assets/ui/ramka-barak-hero.webp')

        hunters.forEach((hunter) => {
            if (hunter.avatarKey && hunter.avatarPath) {
                this.loadImageIfMissing(hunter.avatarKey, hunter.avatarPath)
            }
        })
    }

    create() {
        this.bottomNavObjects = []
        this.barracksMessageText = null
        this.leftPanelInfoObjects = []
        this.squadUiObjects = []

        this.layout = createBaseSceneLayout(this.scale)

        this.cameras.main.setBackgroundColor('#050505')
        this.drawScreenBackground()
        this.drawLocationBackground()
        this.drawTopBar()
        this.drawPlayerPanel()
        this.drawBottomNav()
        this.drawHeader()
        this.drawSquadManagementPanel()
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

        this.leftPanelBounds = {
            x: leftX,
            y: leftY,
            width: leftW,
            height: leftH
        }

        this.renderPlayerPanelDefault()
    }

    clearLeftPanelInfo() {
        this.leftPanelInfoObjects.forEach((object) => {
            object.destroy()
        })

        this.leftPanelInfoObjects = []
    }

    addLeftPanelText(x, y, text, style = {}) {
        const label = this.add.text(x, y, text, style)

        this.leftPanelInfoObjects.push(label)

        return label
    }

    renderPlayerPanelDefault() {
        this.clearLeftPanelInfo()

        const { x: leftX, y: leftY, width: leftW } = this.leftPanelBounds

        this.addLeftPanelText(leftX + 25, leftY + 35, playerState.name, {
            fontSize: '20px',
            color: '#ffffff'
        })

        this.addLeftPanelText(leftX + 25, leftY + 68, playerState.title, {
            fontSize: '14px',
            color: '#aaa'
        })

        this.addLeftPanelText(leftX + 25, leftY + 120, 'Состояние', {
            fontSize: '17px',
            color: '#ffffff'
        })

        this.addLeftPanelText(leftX + 25, leftY + 160, 'HP: ' + playerState.hp + ' / ' + getEffectiveMaxHP(), {
            fontSize: '14px',
            color: '#79ff79'
        })

        this.addLeftPanelText(leftX + 25, leftY + 190, 'Раны: ' + playerState.wounds, {
            fontSize: '14px',
            color: playerState.wounds === 'нет' ? '#cccccc' : '#ffaa55'
        })

        this.addLeftPanelText(leftX + 25, leftY + 220, 'Серебро: ' + playerState.silver, {
            fontSize: '14px',
            color: '#cccccc'
        })

        this.addLeftPanelText(leftX + 25, leftY + 250, 'Бинты: ' + playerState.bandages + ' / ' + MAX_BANDAGES, {
            fontSize: '14px',
            color: '#cccccc'
        })

        this.addLeftPanelText(leftX + 25, leftY + 320, 'Шип Ордена', {
            fontSize: '17px',
            color: '#ffffff'
        })

        this.addLeftPanelText(leftX + 25, leftY + 355, 'Редкий знак свободы.\nОрден больше не имеет\nправа удерживать его.', {
            fontSize: '13px',
            color: '#999999',
            lineSpacing: 6,
            wordWrap: {
                width: leftW - 45
            }
        })
    }

    renderHunterPanelPreview(hunter, sectionType) {
        this.clearLeftPanelInfo()

        const { x: leftX, y: leftY, width: leftW } = this.leftPanelBounds
        const hpText = hunter.id === 'reynar'
            ? `${playerState.hp} / ${getEffectiveMaxHP()}`
            : String(hunter.maxHP)
        const statusText = sectionType === 'party' ? 'В отряде' : 'В резерве'

        this.addLeftPanelText(leftX + 25, leftY + 35, hunter.name, {
            fontSize: '20px',
            color: '#f3e4c8',
            wordWrap: {
                width: leftW - 45
            }
        })

        this.addLeftPanelText(leftX + 25, leftY + 74, hunter.role, {
            fontSize: '14px',
            color: '#c7baa4'
        })

        this.addLeftPanelText(leftX + 25, leftY + 122, 'Данные охотника', {
            fontSize: '17px',
            color: '#ffffff'
        })

        this.addLeftPanelText(leftX + 25, leftY + 160, `Уровень: ${hunter.level}`, {
            fontSize: '14px',
            color: '#d8c49a'
        })

        this.addLeftPanelText(leftX + 25, leftY + 190, `HP: ${hpText}`, {
            fontSize: '14px',
            color: '#79ff79'
        })

        this.addLeftPanelText(leftX + 25, leftY + 220, `Урон: ${hunter.damage}`, {
            fontSize: '14px',
            color: '#f0c078'
        })

        this.addLeftPanelText(leftX + 25, leftY + 250, `Статус: ${statusText}`, {
            fontSize: '14px',
            color: sectionType === 'party' ? '#9fcf76' : '#b5a58e'
        })

        this.addLeftPanelText(leftX + 25, leftY + 318, 'Описание', {
            fontSize: '17px',
            color: '#ffffff'
        })

        this.addLeftPanelText(leftX + 25, leftY + 352, hunter.description || 'Описание пока не заполнено.', {
            fontSize: '13px',
            color: '#b8afa0',
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
                id: 'travel',
                label: 'В ПУТЬ',
                enabled: Boolean(playerState.activeContractId)
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
        const isEnabled = item.enabled !== false

        const buttonBg = createNavButtonBackground(this, x, y, w, h, 41)

        const drawButtonBg = (isHover = false) => {
            buttonBg.setState(isEnabled && (isActive || isHover))

            if (!isEnabled) {
                buttonBg.parts.forEach((part) => {
                    part.setTint(0x77736b)
                    part.setAlpha(0.48)
                })
            }
        }

        drawButtonBg(false)
        this.bottomNavObjects.push(...buttonBg.parts)

        const baseTextColor = !isEnabled
            ? '#6d685f'
            : isActive
                ? '#f3e4c8'
                : '#aaa394'

        const text = this.add.text(x + w / 2, y + h / 2 + 1, item.label, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '14px',
            color: baseTextColor
        })
            .setOrigin(0.5)
            .setDepth(42)

        this.bottomNavObjects.push(text)

        const hitZone = this.add.zone(x + 4, y + 5, w - 8, h - 10)
            .setOrigin(0, 0)
            .setDepth(46)
            .setInteractive({ useHandCursor: isEnabled })

        hitZone.on('pointerover', () => {
            if (!isEnabled) return

            drawButtonBg(true)

            if (!isActive) {
                text.setColor('#e0d2b8')
            }
        })

        hitZone.on('pointerout', () => {
            drawButtonBg(false)

            if (!isActive) {
                text.setColor(baseTextColor)
            }
        })

        hitZone.on('pointerdown', () => {
            this.handleBottomNavClick(item.id)
        })

        this.bottomNavObjects.push(hitZone)
    }

    handleBottomNavClick(navId) {
        if (navId === 'hunters') return

        if (navId === 'travel') {
            if (!playerState.activeContractId) {
                this.showBarracksMessage('Сначала выбери контракт.')
                return
            }

            this.scene.start('ContractTravelScene', {
                contractId: playerState.activeContractId
            })
            return
        }

        if (navId === 'contracts') {
            this.scene.start('ContractBoardScene')
            return
        }

        const selectedBuildingByNavId = {
            inventory: 'quarters',
            map: 'council'
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

        // Ищем активный контракт по id, чтобы показать игроку нормальное название,
        // а не технический идентификатор вроде swamp_witch.
        const activeContract = contracts.find((contract) => {
            return contract.id === playerState.activeContractId
        })

        const activeContractText = activeContract
            ? `Активный контракт: ${activeContract.title}`
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

    clearSquadUi() {
        this.squadUiObjects.forEach((object) => {
            object.destroy()
        })

        this.squadUiObjects = []
    }

    drawSquadManagementPanel() {
        this.clearSquadUi()

        const { gameX, gameY, gameW, gameH } = this.layout

        const availableHunters = hunters.filter((hunter) => hunter.available)
        const partyHunters = getPartyHunters(playerState.party)

        const reserveHunters = availableHunters.filter((hunter) => {
            return !playerState.party.includes(hunter.id)
        })

        const frameInset = Phaser.Math.Clamp(Math.round(gameW * 0.018), 20, 32)
        const sectionH = Phaser.Math.Clamp(Math.round(gameH * 0.21), 148, 164)
        const desiredCardH = sectionH - 58
        const desiredCardW = Math.round(desiredCardH * BARRACKS_HUNTER_FRAME_ASPECT)
        const reserveLeftPad = Phaser.Math.Clamp(Math.round(gameW * 0.024), 28, 40)
        const reserveW = Math.min(
            gameW - frameInset * 2,
            reserveLeftPad + desiredCardW * 10 + BARRACKS_SECTION_GAP * 9 + 48
        )
        const reserveX = gameX + frameInset
        const reserveY = gameY + gameH - BARRACKS_PANEL_BOTTOM_GAP - sectionH
        const partyY = reserveY - BARRACKS_SECTION_GAP - sectionH
        const partyLeftPad = Phaser.Math.Clamp(Math.round(reserveW * 0.075), 74, 94)
        const partyW = Math.min(
            gameW - frameInset * 2,
            desiredCardW * 5 + BARRACKS_SECTION_GAP * 4 + partyLeftPad + 72
        )
        const partyX = reserveX + Math.round((reserveW - partyW) / 2)

        this.barracksMessageY = Math.max(gameY + 148, partyY - 18)

        this.drawSquadSection({
            x: partyX,
            y: partyY,
            width: partyW,
            height: sectionH,
            title: 'Отряд',
            countText: `${partyHunters.length} / 5`,
            hunters: partyHunters,
            slotCount: 5,
            sectionType: 'party',
            leftPad: partyLeftPad
        })

        this.drawSquadSection({
            x: reserveX,
            y: reserveY,
            width: reserveW,
            height: sectionH,
            title: 'Резерв',
            countText: `${reserveHunters.length} / 10`,
            hunters: reserveHunters,
            slotCount: 10,
            sectionType: 'reserve',
            leftPad: reserveLeftPad
        })
    }

    drawSquadSection({ x, y, width, height, title, countText, hunters, slotCount, sectionType, leftPad }) {
        const shadow = this.add.rectangle(x + 2, y + 4, width, height, 0x000000, 0.32)
            .setOrigin(0, 0)

        const frame = this.add.image(x, y, 'ui_barracks_panel_frame')
            .setOrigin(0, 0)
            .setDisplaySize(width, height)
            .setAlpha(0.96)

        this.squadUiObjects.push(shadow, frame)

        const titleText = this.add.text(x + width / 2, y + 12, title, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '18px',
            color: '#d8c29a'
        }).setOrigin(0.5, 0)

        this.squadUiObjects.push(titleText)

        const countLabel = this.add.text(x + width - 22, y + 13, countText, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '15px',
            color: '#86a660'
        }).setOrigin(1, 0)

        this.squadUiObjects.push(countLabel)

        const gap = BARRACKS_SECTION_GAP
        const rightPad = 18
        const desiredCardH = height - 58
        const desiredCardW = Math.round(desiredCardH * BARRACKS_HUNTER_FRAME_ASPECT)
        const maxCardW = Math.floor((width - leftPad - rightPad - gap * (slotCount - 1)) / slotCount)
        const cardW = Math.max(46, Math.min(desiredCardW, maxCardW))
        const cardH = Math.round(cardW / BARRACKS_HUNTER_FRAME_ASPECT)
        const cardY = y + 42 + Math.max(0, Math.floor((desiredCardH - cardH) / 2))

        for (let i = 0; i < slotCount; i += 1) {
            const cardX = x + leftPad + i * (cardW + gap)
            const hunter = hunters[i]

            if (hunter) {
                this.drawHunterCard(cardX, cardY, cardW, cardH, hunter, sectionType, i + 1)
            } else {
                this.drawEmptyHunterCard(cardX, cardY, cardW, cardH, sectionType)
            }
        }
    }

    drawHunterAvatar(x, y, width, height, hunter, targetObjects) {
        if (!hunter.avatarKey || !this.textures.exists(hunter.avatarKey)) {
            return null
        }

        const avatar = this.add.image(x + width / 2, y + height / 2, hunter.avatarKey)
            .setOrigin(0.5)

        const coverScale = Math.max(width / avatar.width, height / avatar.height)

        avatar.setDisplaySize(
            Math.ceil(avatar.width * coverScale),
            Math.ceil(avatar.height * coverScale)
        )

        const maskShape = this.make.graphics({ x: 0, y: 0, add: false })
        maskShape.fillStyle(0xffffff)
        maskShape.fillRect(x, y, width, height)
        avatar.setMask(maskShape.createGeometryMask())

        targetObjects.push(avatar, maskShape)

        return avatar
    }

    drawHunterCard(x, y, width, height, hunter, sectionType, indexLabel) {
        const isParty = sectionType === 'party'
        const isLockedLeader = hunter.id === 'reynar' && isParty

        const card = this.add.image(x, y, 'ui_barracks_hunter_frame')
            .setOrigin(0, 0)
            .setDisplaySize(width, height)
            .setAlpha(0.98)

        const avatarInset = Math.max(6, Math.round(width * 0.07))
        const avatar = this.drawHunterAvatar(
            x + avatarInset,
            y + avatarInset,
            width - avatarInset * 2,
            height - avatarInset * 2,
            hunter,
            this.squadUiObjects
        )

        if (avatar) {
            const levelBg = this.add.rectangle(
                x + width / 2,
                y + height - avatarInset - 10,
                width - avatarInset * 2,
                20,
                0x050505,
                0.62
            ).setOrigin(0.5)

            this.squadUiObjects.push(levelBg)
        }

        const hoverFrame = this.add.graphics()

        const drawHoverFrame = (hover = false) => {
            hoverFrame.clear()

            if (!hover) return

            hoverFrame.lineStyle(2, 0xd0a96a, 0.92)
            hoverFrame.strokeRect(x + 6, y + 6, width - 12, height - 12)
        }

        this.squadUiObjects.push(card, hoverFrame)

        // Номер слота — только для отряда
        if (isParty) {
            const slotLabel = this.add.text(x + 12, y + 9, String(indexLabel), {
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '11px',
                color: '#b89f76'
            })

            this.squadUiObjects.push(slotLabel)
        }

        if (!avatar) {
            const shortName = hunter.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)

            const placeholderText = this.add.text(x + width / 2, y + height / 2 - 2, shortName, {
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: `${Math.max(15, Math.round(width * 0.16))}px`,
                color: '#d8c49a'
            }).setOrigin(0.5)

            this.squadUiObjects.push(placeholderText)
        }

        const levelText = this.add.text(x + width / 2, y + height - 20, `Ур. ${hunter.level}`, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '12px',
            color: '#c8b08b'
        }).setOrigin(0.5)

        this.squadUiObjects.push(levelText)

        const hit = this.add.zone(x, y, width, height)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })

        hit.on('pointerover', () => {
            drawHoverFrame(true)
            card.setTint(0xfff0d0)
            if (avatar) {
                avatar.setTint(0xfff0d0)
            }
            this.renderHunterPanelPreview(hunter, sectionType)
        })

        hit.on('pointerout', () => {
            drawHoverFrame(false)
            card.clearTint()
            if (avatar) {
                avatar.clearTint()
            }
            this.renderPlayerPanelDefault()
        })

        hit.on('pointerdown', () => {
            if (sectionType === 'reserve') {
                const added = addHunterToParty(hunter.id)

                if (!added) {
                    this.showBarracksMessage('Отряд уже заполнен.')
                    return
                }

                this.showBarracksMessage(`${hunter.name} добавлен в отряд.`)
                this.drawSquadManagementPanel()
                return
            }

            if (isLockedLeader) {
                this.showBarracksMessage('Рейнар должен оставаться в отряде.')
                return
            }

            const removed = removeHunterFromParty(hunter.id)

            if (removed) {
                this.showBarracksMessage(`${hunter.name} переведён в резерв.`)
                this.drawSquadManagementPanel()
            }
        })

        this.squadUiObjects.push(hit)
    }

    drawEmptyHunterCard(x, y, width, height, sectionType) {
        const card = this.add.image(x, y, 'ui_barracks_hunter_frame')
            .setOrigin(0, 0)
            .setDisplaySize(width, height)
            .setAlpha(sectionType === 'party' ? 0.72 : 0.58)
            .setTint(0x8b8178)

        this.squadUiObjects.push(card)

        const text = this.add.text(
            x + width / 2,
            y + height / 2,
            sectionType === 'party' ? 'Свободно' : 'Пусто',
            {
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '12px',
                color: sectionType === 'party' ? '#766b5b' : '#665d52'
            }
        ).setOrigin(0.5)

        this.squadUiObjects.push(text)
    }

    showBarracksMessage(message) {
        if (this.barracksMessageText) {
            this.barracksMessageText.destroy()
        }

        const { gameX, gameY, gameW, gameH } = this.layout

        this.barracksMessageText = this.add.text(
            gameX + gameW / 2,
            this.barracksMessageY || gameY + gameH - 92,
            message,
            {
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '15px',
                color: '#d8c49a',
                backgroundColor: 'rgba(0,0,0,0.45)',
                padding: { left: 10, right: 10, top: 5, bottom: 5 }
            }
        ).setOrigin(0.5)

        this.time.delayedCall(1800, () => {
            if (this.barracksMessageText) {
                this.barracksMessageText.destroy()
                this.barracksMessageText = null
            }
        })
    }
}
