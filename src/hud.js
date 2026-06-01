//game stats window

export default class hud extends Phaser.Scene {
    constructor() {
        super({ key: 'hud', active: false });
        this.prevValues = {};
    }
    preload(){
         this.load.font(
            'PressStart2P',
            'https://raw.githubusercontent.com/google/fonts/refs/heads/main/ofl/pressstart2p/PressStart2P-Regular.ttf',
            'truetype');

            // this.load.image("hudbackground", "assets/hudbackground.png");

    }
    create() {
        this.scene.setVisible(false, 'hud');
        // this.scene.bringToTop('hud');
        // Store references to text objects so we can update them
        const { width } = this.scale;
        // this.add.image(150, 80, "hudbackground").setScrollFactor(0).setScale(2.5);

        // this.add.square(width - 200, 20, 180, 120, 0xffffff).setOrigin(0).setScrollFactor(0).setDepth(1);  
        this.moneyText = this.add.text(20, 20, '', { fontFamily: 'PressStart2P', fontSize: '13px', fill: '#ffffff' });
        this.corpText = this.add.text(20, 60, '', { fontFamily: 'PressStart2P', fontSize: '13px', fill: '#ffffff' });
        this.neighborText = this.add.text(20, 80, '', { fontFamily: 'PressStart2P', fontSize: '13px', fill: '#ffffff' });
        this.soilText = this.add.text(20, 100, '', { fontFamily: 'PressStart2P', fontSize: '13px', fill: '#ffffff' });
        this.crimeText = this.add.text(20, 60, '', { fontFamily: 'PressStart2P', fontSize: '13px', fill: '#ffffff' });
        this.certText = this.add.text(20, 40, '', { fontFamily: 'PressStart2P', fontSize: '13px', fill: '#ffffff' });
        this.seasonText = this.add.text(20, 20, '', { fontFamily: 'PressStart2P', fontSize: '13px', fill: '#ffffff' });

        console.log("HUD created");
        // First update
        this.updateStats();
    }

    animateIfChanged(textObj, key, newValue) {
        if (this.prevValues[key] !== newValue) {
            this.tweens && this.tweens.add({
                targets: textObj,
                scale: 1.3,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeInOut'
            });
            if (key === 'money') {
                try {
                    if (this.sound && typeof this.sound.play === 'function' &&
                        this.cache && this.cache.audio && typeof this.cache.audio.exists === 'function' &&
                        this.cache.audio.exists('money')) {
                        this.sound.play('money');
                    } else if (window && window.__globalMoneyAudio) {
                        try { window.__globalMoneyAudio.currentTime = 0; window.__globalMoneyAudio.play().catch(()=>{}); } catch(e){}
                    }
                } catch (e) { console.warn('Failed to play money sound', e); }
            }
            this.prevValues[key] = newValue;
        }
    }

    updateStats() {
        // Read global state
        const state = this.game.globalState;

        this.animateIfChanged(this.moneyText, 'money', state.money);
        this.animateIfChanged(this.corpText, 'corporateDependency', state.corporateDependency);
        this.animateIfChanged(this.neighborText, 'neighborScore', state.neighborScore);
        this.animateIfChanged(this.soilText, 'soilhealth', state.soilhealth);
        this.animateIfChanged(this.crimeText, 'criminality', state.criminality);
        this.animateIfChanged(this.certText, 'certified', state.certified);

        // this.seasonText.setText('SEASON ' + (state.season));
        this.moneyText.setText('MONEY: ' + state.money + ' G');
        // this.corpText.setText('CORPORATE DEPENDENCY: ' + state.corporateDependency);
        this.neighborText.setText('NEIGHBOUR SCORE: ' + state.neighborScore + '/10');
        // this.soilText.setText('SOIL HEALTH: ' + state.soilhealth);
        this.crimeText.setText('CRIMINALITY: ' + state.criminality + '/10');
        this.certText.setText('CERTIFIED: ' + (state.certified ? 'YES' : 'NO'));

    }
}
