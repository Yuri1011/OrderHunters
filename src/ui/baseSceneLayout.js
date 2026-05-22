const UI_MARGIN = 12
const TOP_BAR_HEIGHT = 58
const SIDE_PANEL_WIDTH = 227
const BOTTOM_NAV_HEIGHT = 58
const GAP = 10

export function createBaseSceneLayout(scale) {
    const screenW = scale.width
    const screenH = scale.height

    const topX = UI_MARGIN
    const topY = UI_MARGIN
    const topW = screenW - UI_MARGIN * 2
    const topH = TOP_BAR_HEIGHT

    const leftX = UI_MARGIN
    const leftY = topY + topH + GAP
    const leftW = SIDE_PANEL_WIDTH
    const leftH = screenH - leftY - UI_MARGIN

    const mapX = leftX + leftW + GAP
    const mapY = topY + topH + GAP
    const mapW = screenW - UI_MARGIN - mapX
    const mapH = screenH - mapY - BOTTOM_NAV_HEIGHT - UI_MARGIN - GAP

    const locationPanelW = Math.min(460, mapW - 120)
    const locationPanelH = Math.min(360, mapH - 100)
    const locationPanelX = mapX + (mapW - locationPanelW) / 2
    const locationPanelY = mapY + (mapH - locationPanelH) / 2

    const bottomX = mapX
    const bottomY = mapY + mapH + GAP
    const bottomW = mapW
    const bottomH = BOTTOM_NAV_HEIGHT

    return {
        topX,
        topY,
        topW,
        topH,

        leftX,
        leftY,
        leftW,
        leftH,

        mapX,
        mapY,
        mapW,
        mapH,

        gameX: mapX,
        gameY: mapY,
        gameW: mapW,
        gameH: mapH,

        locationPanelX,
        locationPanelY,
        locationPanelW,
        locationPanelH,

        bottomX,
        bottomY,
        bottomW,
        bottomH
    }
}
