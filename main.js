import {
    hud,
    title_scene,
    season1_intro,
    crop_choice,
    harvest_transition,
    certify_choice,
    season1_planting,
    season1_harvest,
    season1_stats,
    seedlaw_announcement,
    contract_terms,
    neighbor_response,
    season2_planting,
    season2_warning,
    season2_wait,
    season2_stats,
    season2_harvest,
    season3_intro,
    season3_choice,
    inspector_encounter,
    weather_event,
    season3_stats,
    market_sale,
    uncertified_market,
    season4_collapse,
    demo_ending,
    planting_minigame,
    trade_slots,
    inspection_chase,
    escape_jail,
    police_encounter,
    enter_jail

} from "./src/SCENES.js";
import musicscene from "./src/musicscene.js";

// Set this to a scene key (example: "planting_minigame") to jump directly there during development.
// Leave as null to keep normal startup flow.
const DEBUG_START_SCENE = "trade_slots"; // or "season1_stats", "season1_planting", etc. for testing specific scenes

var config = {
    type: Phaser.AUTO,
    backgroundColor: "#ffb000",
    width: 1280,
    height: 720,

    scene: [
        hud,
        harvest_transition,
        season1_intro,
        crop_choice,
        certify_choice,
        season1_planting,
        season1_harvest,
        season1_stats,
        seedlaw_announcement,
        contract_terms,
        neighbor_response,
        season2_planting,
        season2_warning,
        season2_wait,
        season2_stats,
        season2_harvest,
        season3_intro,
        season3_choice,
        inspector_encounter,
        weather_event,
        season3_stats,
        market_sale,
        uncertified_market,
        season4_collapse,
        demo_ending,
        planting_minigame,
        trade_slots,
        title_scene,
        inspection_chase,
        escape_jail,
        police_encounter,
        enter_jail

    ],
    // scale: {
    //     mode: Phaser.Scale.RESIZE,
    //     autoCenter: Phaser.Scale.CENTER_BOTH
    // },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    input: {
        keyboard: true,
        gamepad: true
    }
    
};


// global state object
const globalState = {
    money: 20,
    corporateDependency: 0,
    neighborScore: 5,
    criminality: 0,
    certified: false,
    cropU: "SEEDS",
    cropL: "seeds",
    fines: 0,
    pesticides: false,
    usedPesticides: false,
    escapedJail: false,
    failedInspectorChase: false,
    biodiversity: 5,
    planting: 0,
    yield: 0,
    season: 1,
    soilhealthStates: ["deteriorated", "poor", "fair", "good", "excellent"],
    soilhealthIndex: 4, // start healthy for demo
    get soilhealth() {
        return this.soilhealthStates[this.soilhealthIndex];
    },
    set soilhealth(val) {
        const idx = this.soilhealthStates.indexOf(val);
        if (idx !== -1) this.soilhealthIndex = idx;
    },
    reset(){
        this.neighborScore = 5;
        this.corporateDependency = 0;
        this.money = 20;
        this.cropU = "seeds";
        this.cropL = "seeds";
        this.certified = false;
        this.criminality = 0;
        this.fines = 0;
        this.pesticides = false;
        this.usedPesticides = false;
        this.escapedJail = false;
        this.failedInspectorChase = false;
        this.planting = 0;
        this.yield = 0;
        this.season = 1;
        this.biodiversity = 5;
        this.soilhealthIndex = 4;
    }
};

var game = new Phaser.Game(config);
game.globalState = globalState;

const LOG_GLOBALSTATE_ON_SCENE_CHANGE = true;

if (LOG_GLOBALSTATE_ON_SCENE_CHANGE) {
    const snapshotGlobalState = () => JSON.parse(JSON.stringify(game.globalState));

    const logStateAfterTransition = (methodName, sceneKey, data) => {
        const stateSnapshot = snapshotGlobalState();
        console.groupCollapsed(`[Scene ${methodName}] -> ${sceneKey}`);
        console.log("scene data:", data ?? null);
        console.table(stateSnapshot);
        console.groupEnd();
    };

    const originalStart = game.scene.start;
    game.scene.start = function (key, data) {
        const result = originalStart.call(this, key, data);
        logStateAfterTransition("start", key, data);
        return result;
    };

    const originalRestart = game.scene.restart;
    game.scene.restart = function (data) {
        const targetKey = this.scene && this.scene.key ? this.scene.key : "(current scene)";
        const result = originalRestart.call(this, data);
        logStateAfterTransition("restart", targetKey, data);
        return result;
    };
}

// Create lightweight global HTML5 Audio objects for select and move sounds
// so any scene can trigger them regardless of Phaser preload order.
window.__globalSelectAudio = new Audio('assets/sounds/select.wav');
window.__globalSelectAudio.preload = 'auto';
window.__globalMoveAudio = new Audio('assets/sounds/move.wav');
window.__globalMoveAudio.preload = 'auto';
window.__globalMoneyAudio = new Audio('assets/sounds/money.wav');
window.__globalMoneyAudio.preload = 'auto';
window.addEventListener('keydown', (e) => {
    // Spacebar handler no longer plays select sound globally
    // Sound effect now handled in menu selection logic
});

// ===== ENABLE/DISABLE MUSIC =====
const ENABLE_MUSIC = true;  // Set to true to enable background music
// ================================

if (ENABLE_MUSIC) {
    game.scene.add('musicscene', musicscene);
    game.scene.start('musicscene');
}

game.scene.start('hud');

if (DEBUG_START_SCENE) {
    game.scene.start(DEBUG_START_SCENE);
} else {
    game.scene.start('title_scene');
}
