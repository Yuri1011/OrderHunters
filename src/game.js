import Phaser from 'phaser'
import { BattleScene } from './scenes/BattleScene'

export function createGame() {
    const config = {
        type: Phaser.AUTO,
        parent: 'app',

        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1280,
            height: 720
        },

        backgroundColor: '#000000',
        scene: [BattleScene]
    }

    new Phaser.Game(config)
}