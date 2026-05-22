export function createNavButtonBackground(scene, x, y, w, h, depth) {
    const buttonX = x + 4
    const buttonY = y + 5
    const buttonW = w - 8
    const buttonH = h - 10

    const image = scene.add.image(buttonX + buttonW / 2, buttonY + buttonH / 2, 'ui_nav_button')
        .setDisplaySize(buttonW, buttonH)
        .setDepth(depth)

    const setState = (isHighlighted = false) => {
        image.setTint(isHighlighted ? 0xffffff : 0xd6d2c9)
        image.setAlpha(isHighlighted ? 0.96 : 0.82)
    }

    setState(false)

    return {
        parts: [image],
        setState
    }
}
