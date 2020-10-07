import { Bounds, Point } from "tactic-geometry";


const findIntersections = (list: Bounds[]) => {
  const result: Map<Bounds, Bounds[]> = new Map<Bounds, Bounds[]>();
  for (const bound of list) {
    const intersectionList: Bounds[] = [];
    for (const boundInner of list) {
      if (boundInner !== bound) {
        const intersection = bound.getIntersect(boundInner);
        if (intersection) {
          intersectionList.push(intersection);
        }
      }
    }
    if (intersectionList.length) {
      result.set(bound, intersectionList);
    }
  }

  return result;
};

const vectorLengthSquared = (vector: Point): number => {
  return vector.x * vector.x + vector.y * vector.y;
};

const vectorLength = (vector: Point): number => {
  return Math.sqrt(vectorLengthSquared(vector));
};

const normalizeVector = (vector: Point): Point => {
  const max = vectorLength(vector);
  return new Point(vector.x / max, vector.y / max);
};

export interface IBoundsData {
  id: string;
  // in which direction move is prohibited (south, west, north, east, all)
  fix?: "s" | "w" | "n" | "e" | "all";
  bounds: Bounds;
}

const _resolution = 1.0;

function correctProhibition(
  point: Point,
  border: "s" | "w" | "n" | "e" | "all" | undefined
) {
  switch (border) {
    case "s":
      return point.y > 0
        ? new Point(vectorLength(point) * Math.sign(point.x), 0)
        : point;
    case "w":
      return point.x < 0
        ? new Point(0, vectorLength(point) * Math.sign(point.y))
        : point;
    case "n":
      return point.y < 0
        ? new Point(vectorLength(point) * Math.sign(point.x), 0)
        : point;
    case "e":
      return point.x > 0
        ? new Point(0, vectorLength(point) * Math.sign(point.y))
        : point;
    case "all":
      return new Point(0, 0);
    default:
      return point;
  }
}

const normOffsetValue = (value: number, resolution: number): number =>
  Math.abs(value) < 0.5 ? 0 : value > 0 ? resolution : -resolution;

const getOffsetByVelocity = (velocity: Point, resolution: number): Point => {
  const normVelocity = normalizeVector(velocity);
  return new Point(
    normOffsetValue(normVelocity.x, resolution),
    normOffsetValue(normVelocity.y, resolution)
  );
};

const repelDecayCoefficient = 1.0;

const increaseVelocityByVector = (velocity: Point, diff: Point) => {
  if (vectorLength(diff) > 0) {
    const scale = repelDecayCoefficient / vectorLengthSquared(diff);
    const scaledDiff = normalizeVector(diff).multiplyBy(scale);

    return velocity.add(scaledDiff);
  }
  return velocity;
};

const moveBounds = (bounds: Bounds, offset: Point): Bounds => {
  return new Bounds(bounds.min.add(offset), bounds.max.add(offset));
};

function repositionLoop(
  list: IBoundsData[],
  resolution: number
): IBoundsData[] {
  const count = list.length;
  for (let i = 0; i < count; i++) {
    const room = list[i];
    if (room.fix === "all") {
      continue;
    }
    const center = room.bounds.getCenter();
    let velocity = new Point(0, 0);

    for (let j = 0; j < count; j++) {
      if (i == j) {
        continue;
      }

      const otherRoom = list[j];
      const intersection = room.bounds.getIntersect(otherRoom.bounds);

      if (!intersection) {
        continue;
      }

      const otherCenter = otherRoom.bounds.getCenter();
      const diff = correctProhibition(
        center.subtract(otherCenter),
        room.fix
      );
      velocity = increaseVelocityByVector(velocity, diff);
    }

    if (vectorLength(velocity) > 0) {
      const offset = getOffsetByVelocity(velocity, resolution);
      room.bounds = moveBounds(room.bounds, offset);
    }
  }

  return list;
}

export function reposition(
  list: IBoundsData[],
  resolution = _resolution
): IBoundsData[] {
  while (findIntersections(list.map(({ bounds }) => bounds)).size) {
    repositionLoop(list, resolution);
  }
  return list;
}

