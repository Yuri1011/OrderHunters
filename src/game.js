import Phaser from 'phaser'

import { OrderBaseScene } from './scenes/OrderBaseScene.js'
import { ContractBoardScene } from './scenes/ContractBoardScene.js'
import { ContractTravelScene } from './scenes/ContractTravelScene.js'
import { BattleScene } from './scenes/BattleScene.js'
import { ResultsScene } from './scenes/ResultsScene.js'

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#050505',

    // Базовое внутреннее разрешение игры
    width: 1600,
    height: 900,

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.NO_CENTER
    },

    scene: [
        OrderBaseScene,
        ContractBoardScene,
        ContractTravelScene,
        BattleScene,
        ResultsScene
    ]
}

export default new Phaser.Game(config)
