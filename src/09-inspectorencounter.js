import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, OFFSETS, TYPEWRITER_SPEED, FONTSIZE } from "../constants.js";


export default class inspector_encounter extends Phaser.Scene {
    constructor() {
        super("inspector_encounter");
    }

    create() {

        escapeReset(this);
        this.cameras.main.setBackgroundColor(COLORS.PRIMARY_BLUE);
        this.scene.setVisible(true, 'hud');
        this.inspectorText = centerText(this, "SEED INSPECTOR INCOMING...", -60, { fontSize: FONTSIZE.HEADING, fill: COLORS.BLACK });
        this.tweens.add({
            targets: this.inspectorText,
            alpha: 0,
            duration: 300,
            yoyo: true,
            repeat: 3
        });
        // createTypewriterText(this, "SEED INSPECTOR INCOMING...", -100, { fontSize: FONTSIZE.HEADING, fill: COLORS.BLACK }, TYPEWRITER_SPEED.DEFAULT, () => {
        if (this.game.globalState.certified == true) {
            this.newsText = createTypewriterText(this, "\"looks like you've breached your seed contract. you owe 22 gold in fines", OFFSETS.TYPEWRITER_BODY_Y, { fontSize: FONTSIZE.MENU, fill: COLORS.BLACK, wordWrap: { width: 900 }  }, TYPEWRITER_SPEED.FAST, () => {
            // createTypewriterText(this, "\n\"looks like you've breached your seed contract. pay 22 gold in fines to continue\"",
            //     OFFSETS.TYPEWRITER_BODY_Y, { fontSize: FONTSIZE.MENU, fill: COLORS.BLACK }, TYPEWRITER_SPEED.FAST, () => {
                    createMenu(this, {
                        title: [""],
                        options: [
                            "[ PAY FINES -22 G ]",
                            "[ RUN AWAY ]"
                        ],
                        callbacks: [
                            () => {
                                this.newsText.destroy();
                                this.inspectorText.destroy();
                                this.newsText = centerText(this, "YOU CANNOT AFFORD TO PAY YOUR FINES. YOU HAVE NO CHOICE BUT TO RUN", OFFSETS.TYPEWRITER_BODY_Y, { fontSize: '26px', fill: COLORS.RED }, TYPEWRITER_SPEED.FAST,);

                                this.game.globalState.money -= this.game.globalState.fines;
                                this.game.globalState.fines = 0;

                                this.scene.get('hud').updateStats();
                            },
                            () => {
                                this.game.globalState.fines *= 1.5;
                                this.game.globalState.criminality += 2;
                                this.game.globalState.neighborScore += 1;

                                this.scene.get('hud').updateStats();
                                this.scene.start("inspection_chase");
                            }
                        ],
                        startY: 240,
                        gap: 36,
                        fontColor: COLORS.WHITE, // normal option color (white)
                        highlightColor: COLORS.ACCENT_ORANGE // highlighted option color (orange)                
                    });
                });
        } else  {
            this.game.globalState.fines = 20;
            this.scene.get('hud').updateStats();
            this.newsText = createTypewriterText(this, "\"looks like you've been illegally planting seeds. pay 22 gold in fines to continue\"", OFFSETS.TYPEWRITER_BODY_Y, { fontSize: FONTSIZE.MENU, fill: COLORS.BLACK, wordWrap: { width: 900 }  }, TYPEWRITER_SPEED.FAST,() => {

            // createTypewriterText(this, "\n\"looks like you've been illegally planting seeds. pay 22 gold in fines to continue\"",
            //     OFFSETS.TYPEWRITER_BODY_Y, { fontSize: FONTSIZE.MENU, fill: COLORS.BLACK }, TYPEWRITER_SPEED.FAST, () => {
            createMenu(this, {
                title: [""],
                options: [
                    "[ PAY FINES -22 G ]",
                    "[ RUN AWAY ]"
                ],
                callbacks: [
                    () => {
                        this.newsText.destroy();
                        this.inspectorText.destroy();
                        this.newsText = centerText(this, "YOU CANNOT AFFORD TO PAY YOUR FINES. YOU MUST RUN", OFFSETS.TYPEWRITER_BODY_Y, { fontSize: '26px', fill: COLORS.RED, wordWrap: { width: 900 } }, TYPEWRITER_SPEED.FAST,);

                        // this.game.globalState.money = Math.max(0, this.game.globalState.money - 20);
                        // this.game.globalState.fines = 0;
                        // this.scene.get('hud').updateStats();
                        // this.scene.start("inspection_chase");
                    },
                    () => {
                        this.game.globalState.fines *= 1.5;
                        this.game.globalState.criminality += 2;
                        this.scene.get('hud').updateStats();
                        this.scene.start("inspection_chase");
                    }
                ],

                fontColor: COLORS.WHITE, // normal option color (white)
                highlightColor: COLORS.ACCENT_ORANGE // highlighted option color (orange)                
            });
            });

        }

    }
}
