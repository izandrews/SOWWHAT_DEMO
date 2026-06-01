import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { TYPEWRITER_SPEED, COLORS, OFFSETS, FONTSIZE } from "../constants.js";


export default class certify_choice extends Phaser.Scene {
    constructor() {
        super("certify_choice");
    }

    create() {
        // shows hud
        escapeReset(this);
        // this.scene.setVisible(true, 'hud');
        centerText(this, "RADIO ANNOUNCEMENT:", OFFSETS.SEASON_TITLE_Y, { fill: COLORS.TEXT, fontSize: FONTSIZE.HEADING, align: "center" });
        const messageText = "\'" + this.game.globalState.cropL + " seeds are now patented by Monsanto. all farmers MUST use certified seeds from corporate suppliers. penalties for planting uncertified seeds include fines and loss of land tenure.'";
        createTypewriterText(this, messageText, -40, {fill: "#ffffffff"}, TYPEWRITER_SPEED.FAST,
            () => {
        createMenu(this, {
            title: "DO YOU WANT TO CERTIFY YOUR " + this.game.globalState.cropU + " SEEDS?",
            options: [
                "[ CERTIFY SEEDS -10g ]",
                "[ DO NOT CERTIFY SEEDS ]"
            ],
            callbacks: [
                () => {
                    this.game.globalState.money -= 10;
                    this.game.globalState.criminality = Math.max(0, this.game.globalState.criminality - 2);
                    this.game.globalState.certified = true;
                    this.scene.get('hud').updateStats();
                    this.scene.start("neighbor_response");
                },
                () => {
                    this.game.globalState.criminality += 2;
                    this.game.globalState.neighborScore += 1;
                    this.game.globalState.certified = false;
                    this.scene.get('hud').updateStats();
                    this.scene.start("neighbor_response");
                }
            ]
        });
    });
    }
}
