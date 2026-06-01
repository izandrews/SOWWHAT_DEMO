import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";


export default class season1_harvest extends Phaser.Scene {
    constructor() {
        super("season1_harvest");
    }
    // preload() {
    // this.load.image("radio", "assets/animated-radio-image-0064.gif");
    //     }       
    create() {

        escapeReset(this);
        this.scene.setVisible(true, 'hud');

        // centerText(this, "you've had a great planting season with your " + this.game.globalState.crop + " seeds. you've sold your harvest at the local market. you still have an abundance of seeds. would you like to store surplus seeds for next year, or share some with your community?");
        createMenu(this, {
            title: ["HARVEST:\nYIELD:\nSOIL HEALTH:\n\nsell harvest at the market to make your season's profit."],
            options: [
                "[ sell harvest ]",
            ],
            callbacks: [
                () => {           
                this.scene.start("harvest_transition");
                }
            ]
        });
    }
}
