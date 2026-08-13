export type SimulationVector = { x: number; y: number };

export type WorldEntity = {
  id: string;
  position: SimulationVector;
  velocity: SimulationVector;
  mass?: number;
};

export type WorldScene = {
  time: number;
  entities: WorldEntity[];
};

export type SceneForce = (entity: WorldEntity, scene: WorldScene) => SimulationVector;

/** Shared scene/entity stepper used by dynamic, flow, and field worlds. */
export function stepScene(scene: WorldScene, dt: number, force: SceneForce): WorldScene {
  const safeDt = Number.isFinite(dt) ? Math.max(0, dt) : 0;
  return {
    time: scene.time + safeDt,
    entities: scene.entities.map(entity => {
      const acceleration = force(entity, scene);
      const mass = Math.max(1e-6, entity.mass ?? 1);
      const velocity = {
        x: entity.velocity.x + (acceleration.x / mass) * safeDt,
        y: entity.velocity.y + (acceleration.y / mass) * safeDt,
      };
      return {
        ...entity,
        velocity,
        position: {
          x: entity.position.x + velocity.x * safeDt,
          y: entity.position.y + velocity.y * safeDt,
        },
      };
    }),
  };
}

export function entityById(scene: WorldScene, id: string): WorldEntity | undefined {
  return scene.entities.find(entity => entity.id === id);
}

export function moveEntity(scene: WorldScene, id: string, position: SimulationVector): WorldScene {
  return { ...scene, entities: scene.entities.map(entity => entity.id === id ? { ...entity, position: { ...position } } : entity) };
}

export type ResourceReservoir = { current: number; capacity: number };

export function createReservoir(capacity: number, current = 0): ResourceReservoir {
  const safeCapacity = Math.max(0, capacity);
  return { capacity: safeCapacity, current: Math.max(0, Math.min(safeCapacity, current)) };
}

export function addResource(reservoir: ResourceReservoir, amount: number): ResourceReservoir {
  return { ...reservoir, current: Math.max(0, Math.min(reservoir.capacity, reservoir.current + amount)) };
}

export function reservoirFilled(reservoir: ResourceReservoir): boolean {
  return reservoir.current >= reservoir.capacity;
}
