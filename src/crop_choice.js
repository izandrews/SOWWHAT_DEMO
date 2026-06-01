import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";


export default class crop_choice extends Phaser.Scene {
    constructor() {
        super("crop_choice");
    }

    preload() {
        // this.load.spritesheet('cassava', 'assets/crops/cassava.png', {
        //     frameWidth: 60,  // width of each frame
        //     frameHeight: 48  // height of each frame
        // });
        this.load.spritesheet('cowpea', 'assets/crops/cowpea.png', {
            frameWidth: 60,  // width of each frame
            frameHeight: 39  // height of each frame
        });
        this.load.spritesheet('corn', 'assets/crops/corn.png', {
            frameWidth: 56,  // width of each frame
            frameHeight: 60  // height of each frame
        });


    }

    create() {
        // shows hud
        // this.scene.setVisible(true, 'hud');
        escapeReset(this);
        // centerText(this, "choose your crop for season 1", +60);
        //     key: 'cassava_anim',
        //     frames: this.anims.generateFrameNumbers('cassava', { start: 0, end: 4 }),
        //     frameRate: 5,
        //     repeat: -1
        // });

        this.anims.create({
            key: 'cowpea_anim',
            frames: this.anims.generateFrameNumbers('cowpea', { start: 0, end: 4 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'corn_anim',
            frames: this.anims.generateFrameNumbers('corn', { start: 0, end: 4 }),
            frameRate: 5,
            repeat: -1
        });
        createMenu(this, {
            title: "choose which crop you want to plant this season",
            options: [
                "[ PLANT COWPEA ]",
                "[ PLANT CORN ]"
            ],
            callbacks: [
                //cassava
                // () => {
                //     this.game.globalState.neighborScore += 1;
                //     this.game.globalState.crop = "cassava";
                //     this.scene.get('hud').updateStats();
                //     this.scene.start("scene3");
                // },

                () => {
                    this.game.globalState.crop = "cowpea";
                    this.game.globalState.neighborScore = Math.min(10, this.game.globalState.neighborScore + 1);
                    this.game.globalState.certified = false;
                    this.scene.get('hud').updateStats();
                    this.scene.start("planting_minigame", { nextScene: "harvest_transition", sourceScene: "crop_choice" });
                },
                () => {
                    this.game.globalState.crop = "corn";
                    this.game.globalState.neighborScore = Math.max(0, this.game.globalState.neighborScore - 1);
                    this.game.globalState.certified = false;
                    this.scene.get('hud').updateStats();
                    this.scene.start("planting_minigame", { nextScene: "harvest_transition", sourceScene: "crop_choice" });
                }
            ]
        });
    }
}
