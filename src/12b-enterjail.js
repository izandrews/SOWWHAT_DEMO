import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, FONTSIZE } from "../constants.js";

export default class enter_jail extends Phaser.Scene {
    constructor() {
        super("enter_jail");
    }

    preload() {
        this.load.atlas("farmer", "assets/farmer.png", "assets/farmer.json");
        this.load.atlas("inspector", "assets/inspector.png", "assets/inspector.json");
        this.load.audio('runjump_background', 'assets/sounds/runjump_background.wav');
        this.load.audio('youlost', 'assets/sounds/youlost.wav');
        this.load.audio('youwin', 'assets/sounds/youwin.wav');
    }

    create() {
        escapeReset(this);

        this.cameras.main.setBackgroundColor(COLORS.RED);

        // Create a filled rectangular frame centered on screen
        const frameGraphics = this.add.graphics();
        const centerX = this.scale.width / 2 - 400;
        const centerY = this.scale.height / 2 - 240;
        const frameWidth = 800;
        const frameHeight = 450;
        this.field = {
            x: centerX,
            y: centerY,
            width: frameWidth,
            height: frameHeight
        };
        frameGraphics.fillStyle(0x1645f5, 0.8); // fill color and alpha
        frameGraphics.fillRect(this.field.x, this.field.y, this.field.width, this.field.height);
        frameGraphics.lineStyle(4, 0xffffff, 1); // 4px white border
        frameGraphics.strokeRect(this.field.x, this.field.y, this.field.width, this.field.height);
        const borderInset = -10;
        centerText(this, "plan your getaway!", 40, { fill: "#ffffff", fontSize: FONTSIZE.MENU });
        this.titleText = centerText(this, "YOU ARE IMPRISONED", -40, { fill: COLORS.RED, fontFamily: "PressStart2P", fontSize: "30px", align: "center" });
        this.titleTween = this.tweens.add({
            targets: this.titleText,
            alpha: 0,
            duration: 800,
            // yoyo: true,
            repeat: -1
        });
        createMenu(this, {
            title: [""],
            options: ["[ ESCAPE! ]"],
            callbacks: [
                () => this.scene.start("escape_jail"),

            ],
            startY: 240,
            gap: 36,
            fontColor: "#ffffff",
            highlightColor: "#1645f5"
        });

    }


}