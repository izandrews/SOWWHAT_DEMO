import { isButtonPressed, GAMEPAD } from "./src/gamepad.js";
export function escapeReset(scene) {
    const esc = scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ESC
    );

    let resetWasDown = isButtonPressed(scene, GAMEPAD.RESET_BUTTON);

    const onDown = () => {
        try {
            if (scene.game.globalState?.reset) {
                scene.game.globalState.reset();
            }
        } catch (e) { }

        // Hide HUD if active
        if (scene.scene.isActive("hud")) {
            scene.scene.setVisible(false, "hud");
        }

        // Hard restart: clear storage/caches and reload with cache-busting query
        const doHardRestart = () => {
            try {
                try { localStorage.clear(); sessionStorage.clear(); } catch (e) { }

                if (typeof caches !== 'undefined' && caches && typeof caches.keys === 'function') {
                    caches.keys()
                        .then(keys => Promise.all(keys.map(k => caches.delete(k))))
                        .finally(() => {
                            window.location.href = window.location.pathname + '?_=' + Date.now();
                        });
                } else {
                    window.location.href = window.location.pathname + '?_=' + Date.now();
                }
            } catch (e) {
                try { window.location.reload(); } catch (e) { /* ignore */ }
            }
        };

        doHardRestart();
    };

    esc.on("down", onDown);

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
