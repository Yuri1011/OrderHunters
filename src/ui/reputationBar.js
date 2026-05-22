const SEGMENT_COUNT = 8

export function createReputationBar(scene, x, y, reputation, title, options = {}) {
    const width = options.width || 320
    const depth = options.depth || 0
    const maxReputation = options.maxReputation || 100
    const segmentGap = options.segmentGap || 4
    const segmentHeight = options.segmentHeight || 10
    const labelOffsetY = options.labelOffsetY || 0
    const barOffsetY = options.barOffsetY || 24

    const safeReputation = Math.max(0, Math.min(reputation, maxReputation))
    const segmentWidth = Math.floor((width - segmentGap * (SEGMENT_COUNT - 1)) / SEGMENT_COUNT)
    const barWidth = segmentWidth * SEGMENT_COUNT + segmentGap * (SEGMENT_COUNT - 1)
    const segmentValue = maxReputation / SEGMENT_COUNT

    const label = scene.add.text(x, y + labelOffsetY, 'Репутация: ' + title, {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '15px',
        color: '#d7c6a3'
    }).setDepth(depth)

    const bar = scene.add.graphics().setDepth(depth)

    for (let index = 0; index < SEGMENT_COUNT; index += 1) {
        const segmentX = x + index * (segmentWidth + segmentGap)
        const segmentY = y + barOffsetY
        const segmentStart = index * segmentValue
        const fillRatio = Math.max(0, Math.min((safeReputation - segmentStart) / segmentValue, 1))
        const fillWidth = Math.floor(segmentWidth * fillRatio)

        bar.fillStyle(0x070706, 0.95)
        bar.fillRoundedRect(segmentX, segmentY, segmentWidth, segmentHeight, 1)
        bar.lineStyle(1, 0x3d3426, 1)
        bar.strokeRoundedRect(segmentX, segmentY, segmentWidth, segmentHeight, 1)

        if (fillWidth > 0) {
            const innerWidth = Math.max(fillWidth - 2, 1)

            bar.fillStyle(0xb57729, 1)
            bar.fillRect(segmentX + 1, segmentY + 1, innerWidth, segmentHeight - 2)

            bar.fillStyle(0xe0a642, 0.9)
            bar.fillRect(segmentX + 1, segmentY + 1, innerWidth, 2)

            bar.fillStyle(0x6d421b, 0.7)
            bar.fillRect(segmentX + 1, segmentY + segmentHeight - 3, innerWidth, 2)
        }
    }

    bar.lineStyle(1, 0x211b13, 1)
    bar.strokeRoundedRect(x - 2, y + barOffsetY - 2, barWidth + 4, segmentHeight + 4, 2)

    return {
        parts: [label, bar],
        label,
        bar
    }
}
