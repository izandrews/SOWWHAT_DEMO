import { createMenu } from "../menu.js";
import { centerText } from "../ui.js";
import { FONTSIZE } from "../constants.js";

export default class title_scene extends Phaser.Scene {
    constructor() {
        super("title_scene");
    }

    preload() {
        // preload assets here
        this.load.audio('menuMove', 'assets/sounds/move.wav');
        this.load.audio('menuSelect', 'assets/sounds/select.wav');
        this.load.audio('backgroundMusic', 'assets/sounds/background_music.wav');
        this.load.font(
            'PressStart2P',
            'https://raw.githubusercontent.com/google/fonts/refs/heads/main/ofl/pressstart2p/PressStart2P-Regular.ttf',
            'truetype');
        // this.load.image("radio", "assets/ascii-art.jpeg");
    }
    create() {
        // const music = this.sound.get('backgroundMusic');

        // if (music) {
        //     music.resume(); // or play() if paused
        // } else {
        //     this.sound.add('backgroundMusic', {
        //         loop: true,
        //         volume: 0.6
        //     }).play();
        // }

        this.cameras.main.setBackgroundColor("#1645f5");
        // centerText(this, "SOW WHAT?!", -100, { fontFamily: 'PressStart2P', fontSize: FONTSIZE.TITLE, fill: '#ffb000', align: "center" });
        // centerText(this, "insert seed to begin\n('S' key)", 150, {fill: "#ffffffff", align: "center"});
        centerText(this, "PRESS BUTTON TO BEGIN", 180, { fill: "#ffffffff", align: "center" });
        const title = centerText(this, "SOW WHAT?!", -100, {
            fontFamily: 'PressStart2P',
            fontSize: FONTSIZE.TITLE,
            fill: '#ffb000',
            align: "center"
        });

        const demoText = this.add.text(
            title.x + title.width / 2 - 620,
            title.y + 10,
            "DEMO",
            {
                fontFamily: 'PressStart2P',
                fontSize: '40px',
                color: '#ff2a2a',
                stroke: '#000000',
                strokeThickness: 4
            }
        );

        demoText.setOrigin(0.5);
        demoText.setAngle(-30);
        createMenu(this, {
            options: [
                ""],
            callbacks: [
                () => {
                    this.scene.start("season1_intro");
                }]
        })
    }
    //     // uncomment below for mouse clicks to switch scene
    //     // this.input.once("pointerdown", () => {
    //     //     this.scene.start("season1_intro");
    //     // });

    //     // use space or enter to switch scene
    //     this.input.keyboard.on("keydown-S", () => this.scene.start("scene1"));
    //     this.input.keyboard.once("keydown-SPACE", () => this.scene.start("scene1"));
    //     this.input.keyboard.once("keydown-ENTER", () => this.scene.start("scene1"));
}
