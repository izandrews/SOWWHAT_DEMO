import { isButtonPressed, GAMEPAD } from "./src/gamepad.js";
export function escapeReset(scene) {
    const esc = scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ESC
    );

    const onDown = () => {
        if (scene.game.globalState?.reset) {
            scene.game.globalState.reset();
        }

        // Hide HUD if active
        if (scene.scene.isActive("hud")) {
            scene.scene.setVisible(false, "hud");
        }

        scene.scene.start("hud");
        scene.scene.start("title_scene");
    };

    esc.on("down", onDown);

    let resetWasDown = false;

    const gamepadResetUpdate = () => {
        const resetDown = isButtonPressed(scene, GAMEPAD.RESET_BUTTON);

        if (resetDown && !resetWasDown) {
            onDown();
        }

        resetWasDown = resetDown;
    };

    scene.events.on("update", gamepadResetUpdate);

    // --- Cleanup on scene shutdown/destroy ---
    const cleanup = () => {
        esc.off("down", onDown);
        // optional: esc.destroy();  (Phaser handles key destruction automatically)
        scene.events.off("update", gamepadResetUpdate);
        scene.events.off("shutdown", cleanup);
        scene.events.off("destroy", cleanup);
    };

    scene.events.once("shutdown", cleanup);
    scene.events.once("destroy", cleanup);
}
