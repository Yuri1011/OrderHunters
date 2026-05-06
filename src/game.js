import Phaser from 'phaser'
import { OrderBaseScene } from './scenes/OrderBaseScene'
import { BattleScene } from './scenes/BattleScene'
import { ContractResultScene } from './scenes/ContractResultScene'

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
        scene: [OrderBaseScene, BattleScene, ContractResultScene]
    }

    new Phaser.Game(config)
}
