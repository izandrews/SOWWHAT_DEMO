import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, OFFSETS, TYPEWRITER_SPEED } from "../constants.js";


export default class season3_choice extends Phaser.Scene {
    constructor() {
        super("season3_choice");
    }

    create() {
        escapeReset(this);

        if (this.game.globalState.certified == true) {
            createTypewriterText(this, "your certification contract requires that you purchase and use pesticides on your " + this.game.globalState.cropL + " crops. failure to comply may result in a fine.", 0, { fill: '#ffffff' }, TYPEWRITER_SPEED.FAST,
                () => {
                    createMenu(this, {
                        title: ["use pesticides?"],
                        options: [
                            "[ USE PESTICIDES -8G]",
                            "[ REFUSE ]"
                        ],
                        callbacks: [
                            () => {
                                this.game.globalState.usedPesticides = true;
                                this.game.globalState.money = Math.max(0, this.game.globalState.money - 8);
                                this.game.globalState.soilhealthIndex = Math.max(0, this.game.globalState.soilhealthIndex - 2);
                                this.game.globalState.neighborScore = Math.max(0, this.game.globalState.neighborScore - 2);
                                this.game.globalState.yield += 2;
                                this.game.globalState.usedPesticides = true;

                                this.scene.get('hud').updateStats();
                                this.scene.start("season4_collapse");
                            },

                            () => {
                                this.game.globalState.criminality += 2;
                                this.game.globalState.yield = Math.max(0, this.game.globalState.yield - 1);
                                this.game.globalState.fines += 10;
                                this.game.globalState.usedPesticides = false;

                                this.scene.get('hud').updateStats();
                                this.scene.start("season4_collapse");
                            }
                        ]
                    });
                });
        } else {
            createTypewriterText(this, "pests begin come onto your farm and infest your crops, reducing your yield and damaging your soil health. you question whether to purchase pesticides to protect your crops.", 0, { fill: '#ffffff' }, TYPEWRITER_SPEED.FAST,
                () => {
                    createMenu(this, {

                        title: ["DO YOU CHOOSE TO USE PESTICIDES?"],
                        options: [
                            "[ USE PESTICIDES -8G]",
                            "[ STAY ORGANIC ]"
                        ],
                        callbacks: [
                            () => {
                                this.game.globalState.money = Math.max(0, this.game.globalState.money - 8);
                                this.game.globalState.neighborScore = Math.max(0, this.game.globalState.neighborScore - 1);
                                this.game.globalState.soilhealthIndex = Math.max(0, this.game.globalState.soilhealthIndex - 2);
                                this.game.globalState.usedPesticides = true;
                                this.scene.get('hud').updateStats();
                                this.scene.start("season4_collapse");
                            },
                            () => {
                                this.game.globalState.neighborScore = Math.max(0, this.game.globalState.neighborScore + 1);
                                this.game.globalState.usedPesticides = false;

                                this.scene.get('hud').updateStats();
                                this.scene.start("season4_collapse");
                            }
                        ]
                    });
                });
        }
    }
}
