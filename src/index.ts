import { Vector3, ActionManager, HemisphericLight } from 'babylonjs';
import { BabylonStore } from './store/babylonStore';
import { ProxyGround } from './environment/proxyGround';
import { ProxyCube } from './environment/proxyCube';
import { Spawner } from './util/spawner';
import { Farmer } from './player/farmer';

/**
 * The entrypoint for the game.
 */
export class Game {
    /**
     * Constructor.
     * @param canvas The canvas element used to initialize the Babylon engine.
     */
    constructor(canvas: HTMLCanvasElement) {
        BabylonStore.createEngine(canvas);

        BabylonStore.createScene(BabylonStore.engine);
        BabylonStore.scene.actionManager = new ActionManager(BabylonStore.scene);
        BabylonStore.scene.collisionsEnabled = true;
        BabylonStore.scene.useRightHandedSystem = true;

        BabylonStore.createCamera('mainCamera', new Vector3(0, 15, -5), BabylonStore.scene);
        BabylonStore.camera.setTarget(Vector3.Zero());

        new HemisphericLight("light1", new Vector3(0, 1, 0), BabylonStore.scene);

        // Pre-proxy environment.
        new ProxyGround('ground', 20, 20);
        new ProxyCube('cube1', new Vector3(5, 0, 5), 2);
        new ProxyCube('cube2', new Vector3(-5, 0, 5), 2);
        new ProxyCube('cube3', new Vector3(-5, 0, -5), 2);
        new ProxyCube('cube4', new Vector3(5, 0, -5), 2);

        // Create the player.
        Spawner.create('Farmer', 'https://storage.googleapis.com/farmer-assets/farmer/2/Farmer_high.gltf').then(() => {
            new Farmer();
        });

        BabylonStore.scene.debugLayer.show({embedMode: true})

        window.addEventListener('resize', () => {
            BabylonStore.engine.resize();
        });
    }

    /**
     * Runs the game loop.
     */
    public run(): void {
        BabylonStore.engine.runRenderLoop(() => {
            BabylonStore.scene.render();
        });
    }
}