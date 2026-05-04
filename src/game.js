import Phaser from 'phaser'
import { BattleScene } from './scenes/BattleScene'

export function createGame() {
    const config = {
        type: Phaser.AUTO,
        width: 1280,
        height: 720,
        parent: 'app',
        scene: [BattleScene]
    }

    new Phaser.Game(config)
}