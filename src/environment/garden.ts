import { TransformNode, Mesh, AnimationGroup } from 'babylonjs';
import { Spawner } from '../assets/spawner';
import { Navigation } from '../gameplay/navigation';
import { BaseCollidable } from '../collision/baseCollidable';
import { CollisionGroup } from '../collision/collisionManager';
import { MathUtil } from '../util/mathUtil';
import { RadarManager, BlipType } from '../ui/radar';

/**
 * Tha main Garden scene.
 */
export class Garden extends BaseCollidable {
    #_rootNodes: TransformNode[];
    #_burrowSpawnPoints: TransformNode[] = [];
    #_carrotSpawnPoints: TransformNode[] = [];
    #_harvestBasket: Mesh;
    #_animation: AnimationGroup;

    /**
     * Constructor.
     */
    public constructor() {
        super(CollisionGroup.Environment);

        const gardenSpawner = Spawner.getSpawner('Garden');
        this.#_rootNodes = gardenSpawner.instantiate().rootNodes;
        const burrowParent = this.#_rootNodes[0].getChildTransformNodes(false, n => n.name === 'SpawnPoints_Burrows' );
        this.#_burrowSpawnPoints = burrowParent[0].getChildTransformNodes();
        const carrotParent = this.#_rootNodes[0].getChildTransformNodes(false, n => n.name === 'SpawnPoints_Plants');
        this.#_carrotSpawnPoints = carrotParent[0].getChildTransformNodes();

        // Tree spawn points.
        const tree1Spawner = Spawner.getSpawner('Tree1');
        const tree2Spawner = Spawner.getSpawner('Tree2');

        const tree1SpawnPoints = this.#_rootNodes[0].getChildTransformNodes(false, n => n.name.startsWith('SpawnPoint_Tree01'));
        const tree2SpawnPoints = this.#_rootNodes[0].getChildTransformNodes(false, n => n.name.startsWith('SpawnPoint_Tree02'));

        const tree1 = tree1Spawner.instantiate().rootNodes[0].getChildMeshes() as Mesh[];
        tree1.forEach(t => t.isVisible = false);
        const tree2 = tree2Spawner.instantiate().rootNodes[0].getChildMeshes() as Mesh[];
        tree2.forEach(t => t.isVisible = false);
        tree1SpawnPoints.forEach(t => {
            const transform = new TransformNode('Tree');
            const instances = tree1.map(t => t.createInstance(t.name));
            instances.forEach(i => i.parent = transform);
            transform.parent = t;
        });
        tree2SpawnPoints.forEach(t => {
            const transform = new TransformNode('Tree');
            const instances = tree2.map(t => t.createInstance(t.name));
            instances.forEach(i => i.parent = transform);
            transform.parent = t;
        });
        
        let colliders = this.#_rootNodes[0].getChildMeshes(false, m => m.name.startsWith('Collider'));

        const wellSpawner = Spawner.getSpawner('Well');
        wellSpawner.instantiate();

        const meteoriteSpawner = Spawner.getSpawner('Meteorite');
        meteoriteSpawner.instantiate();

        const gardenGround = Spawner.getSpawner('Ground');
        gardenGround.instantiate();

        const fencing = Spawner.getSpawner('Fencing');
        fencing.instantiate();

        const shedSpawner = Spawner.getSpawner('Shed');
        const shed = shedSpawner.instantiate();
        const shedCollider = shed.rootNodes[0].getChildMeshes(false, m => m.name === 'Collider_Shed');
        colliders = colliders.concat(shedCollider);

        const basket = Spawner.getSpawner('Basket');
        const instantiate = basket.instantiate();
        const root = instantiate.rootNodes[0];
        const basketCollider = root.getChildMeshes(false, m => m.name === 'Collider_CarrotSiren');
        colliders = colliders.concat(basketCollider);
        this.#_animation = instantiate.animationGroups[0];
        this.#_animation.play(true);
        
        root.scaling = root.scaling.scale(3);
        this.#_harvestBasket = root.getChildMeshes()[0] as Mesh;

        RadarManager.createBlip(root, BlipType.Basket);

        colliders.forEach(c => {            
            c.isVisible = false;
            super.registerMesh(c, c.name);
        });

        const navMesh = this.#_rootNodes[0].getChildMeshes(false, m => m.name === 'GroundNavMesh');
        navMesh.forEach(n => n.setEnabled(false));
        Navigation.init(navMesh as Mesh[]);
    }

    /**
     * Disables the garden and all of it's animations.
     * @param value True if disabled, false if enabled.
     */
    public set disabled(value: boolean) {
        if(value)
            this.#_animation.pause();
        else
            this.#_animation.play();
    }

    /**
     * Gets a random burrow node.
     * @returns The TransformNode that is a spawn point for a burrow.
     */
    public getRandomBurrowNode(): TransformNode {
        let node: TransformNode;
        while(!node || node.getChildMeshes().length != 0) {
            // Generates a random integer to pass into burrow spawn points array.
            node = this.#_burrowSpawnPoints[MathUtil.randomInt(0, this.#_burrowSpawnPoints.length - 1)];
        }
        return node;
    }

    /**
     * Gets a random carrot node.
     * @returns The TransformNode that is a spawn point for a carrot.
     */
    public getRandomCarrotNode(): TransformNode {
        let node: TransformNode;
        while(!node || node.getChildMeshes().length != 0) {
            // Generates a random integer to pass into carrot spawn points array.
            node = this.#_carrotSpawnPoints[MathUtil.randomInt(0, this.#_carrotSpawnPoints.length - 1)];
        }
        return node;
    }

    /**
     * Gets the mesh of the harvest basket.
     * @returns The mesh of the harvest basket.
     */
    public get harvestBasket(): Mesh {
        return this.#_harvestBasket;
    }

    /**
     * Release all resources associated with this Garden.
     */
    public dispose(): void {
        super.dispose();
        RadarManager.removeBlip(this.#_harvestBasket.parent as TransformNode);
        this.#_harvestBasket.dispose();
        this.#_rootNodes.forEach(n => n.dispose());
        this.#_animation.dispose();
    }
}