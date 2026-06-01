import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";


export default class contract_terms extends Phaser.Scene {
    constructor() {
        super("contract_terms");
    }

    create() {
    escapeReset(this);
    centerText(this, "you have chosen to certify your " + this.game.globalState.crop + " seeds. please sign the contract below to proceed.", -150);
    createTypewriterText(this, "TERMS AND CONDITIONS:\nThe farmer may not save, sell, share, or plant any uncertified " + this.game.globalState.crop + " seeds. The farmer must purchase new " + this.game.globalState.crop + " seeds each farming season. Seeds cannot be reused. The farmer must purchase and use any products (ie chemical fertilisers) in the contract. We reserve the right to come and inspect seeds at any point. Any breaching of the contract may result in a fine of up to 2000 gold, criminal conviction, or jail time.",
        -50,
        {fontSize: '16px', fill: '#ffffff'},
        40);
        
    createMenu(this, {
        options: [
            "[ accept contract ]",
            ],
            callbacks: [
                () => {
                    this.scene.start("neighbor_response");
                }
            ]
        }
        );       
    }
}
