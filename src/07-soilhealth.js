import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, OFFSETS, TYPEWRITER_SPEED } from "../constants.js";


export default class season4_collapse extends Phaser.Scene {
    constructor() {
        super("season4_collapse");
    }

    preload() {
        this.load.font(
            'PressStart2P',
            'https://raw.githubusercontent.com/google/fonts/refs/heads/main/ofl/pressstart2p/PressStart2P-Regular.ttf',
            'truetype');
    }

    create() {
        escapeReset(this);
        // this.game.globalState.season = 4;
        // this.scene.get('hud').updateStats();

        // centerText(this, "SEASON 4", OFFSETS.SEASON_TITLE_Y, { fontSize: "40px" });

        // const plantedValue = this.game.globalState.planting;
        // const soilString = this.game.globalState.soilhealth;
        // const buildSummary = () => [
        //     `yield: ${this.game.globalState.yield}`,
        //     `planted: ${plantedValue}`,
        //     `soil: ${soilString}`
        // ];

        if (this.game.globalState.usedPesticides) {
            createTypewriterText(this, "your use of pesticides has severely damaged your soil health. your plants are not receiving adequate nutrients, leading to crop failure. you consider asking your neighbours for spare seeds to replant this season.", OFFSETS.TYPEWRITER_NOTICE_Y, {}, TYPEWRITER_SPEED.FAST,
                () => {
                    this.game.globalState.soilhealthIndex = 0;
                    this.game.globalState.yield = Math.max(0, this.game.globalState.yield - 3);
                    this.scene.get('hud').updateStats();
                    createMenu(this, {
                        title: [""],
                        options: ["[ ASK NEIGHBOURS FOR SEEDS ]"],
                        callbacks: [
                            () => this.scene.start("trade_slots")
                        ],
                        fontColor: COLORS.WHITE,
                        highlightColor: COLORS.PRIMARY_BLUE
                    });
                });
        } else {
            createTypewriterText(this, "your neighbour's pesticides have run off into your farm, damaging your soil. your plants have not been receiving adequate nutrients, leading to crop failure. you consider asking your neighbours for spare seeds to replant this season.", OFFSETS.TYPEWRITER_NOTICE_Y, {}, TYPEWRITER_SPEED.FAST,
                () => {
                    this.game.globalState.yield = Math.max(0, this.game.globalState.yield - 3);
                    this.scene.get('hud').updateStats();
                    createMenu(this, {
                        title: [],
                        options: ["[ ASK NEIGHBOURS FOR SEEDS ]"],
                        callbacks: [
                            () => this.scene.start("trade_slots")
                        ],
                        fontColor: COLORS.WHITE,
                        highlightColor: COLORS.PRIMARY_BLUE
                    });
                });
        } 
    }
}