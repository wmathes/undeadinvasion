import "phaser";
import { Preloader } from './scenes/Preloader';
import { Main } from './scenes/Main';

const defaultConfig: GameConfig = {
    type: Phaser.AUTO,
    parent: "canvas",
    width: 960,
    height: 540,
    scene: [
        Preloader,
        Main
    ]
};

export const Game = (config: GameConfig = {}) => new Phaser.Game(Object.assign({}, defaultConfig, config));
