import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, OFFSETS, TYPEWRITER_SPEED, FONTSIZE } from "../constants.js";


export default class police_encounter extends Phaser.Scene {
    constructor() {
        super("police_encounter");
    }

    create() {

        escapeReset(this);
        this.cameras.main.setBackgroundColor(COLORS.RED);
        this.scene.setVisible(true, 'hud');
        this.inspectorText = centerText(this, "POLICEMAN INCOMING...", -60, { fontSize: FONTSIZE.HEADING, fill: COLORS.BLACK });
        this.tweens.add({
            targets: this.inspectorText,
            alpha: 0,
            duration: 300,
            yoyo: true,
            repeat: 3
        });

        if (this.game.globalState.certified == true) {
            createTypewriterText(this, "\n\"you are under arrest for breaching your seed certification contract and avoiding fines\"", OFFSETS.TYPEWRITER_BODY_Y, { fontSize: FONTSIZE.MENU, fill: COLORS.BLACK }, TYPEWRITER_SPEED.FAST);
        } else {
            createTypewriterText(this, "\n\"you are under arrest for illegal seed planting and avoiding fines!\"",
                OFFSETS.TYPEWRITER_BODY_Y, { fontSize: FONTSIZE.MENU, fill: COLORS.BLACK }, TYPEWRITER_SPEED.FAST);};
            createMenu(this, {
                title: [""],
                options: [
                    "[ SERVE JAIL TIME ]",
                ],
                callbacks: [
                    () => {
                        this.scene.start("escape_jail");
                    }
                ],
                fontColor: COLORS.WHITE, // normal option color (white)
                highlightColor: COLORS.PRIMARY_BLUE // highlighted option color (orange)            
            });
        }

    }

