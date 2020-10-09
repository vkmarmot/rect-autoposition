import { Bounds, Point } from "tactic-geometry";

const findIntersections = (
  list: IBoundsData[],
  fullList: IBoundsData[]
): Map<string, Bounds[]> => {
  const result: Map<string, Bounds[]> = new Map<string, Bounds[]>();
  for (const bound of list) {
    const intersectionList: Bounds[] = [];
    for (const boundInner of fullList) {
      if (boundInner.id !== bound.id) {
        const intersection = bound.bounds.getIntersect(boundInner.bounds);
        if (intersection) {
          intersectionList.push(intersection);
        }
      }
    }
    if (intersectionList.length) {
      result.set(bound.id, intersectionList);
    }
  }

  return result;
};

const isSomeIntersection = (
  id: string,
  bounds: Bounds,
  fullList: IBoundsData[]
): boolean => {
  for (const boundInner of fullList) {
    if (boundInner.id !== id) {
      const intersection = bounds.intersects(boundInner.bounds);
      if (intersection) {
        return true;
      }
    }
  }

  return false;
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
  maxDistance: number;
  // in which direction move is prohibited (south, west, north, east, all)
  fix?: "s" | "w" | "n" | "e";
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
    // const scale = repelDecayCoefficient / vectorLengthSquared(diff);
    // const scaledDiff = normalizeVector(diff).multiplyBy(scale);

    return velocity.add(velocity);
  }
  return velocity;
};

const moveBounds = (bounds: Bounds, offset: Point): Bounds => {
  return new Bounds(bounds.min.add(offset), bounds.max.add(offset));
};

const getMove = (bounds1: Bounds, bounds2: Bounds) => {
  const intersection = bounds1.getIntersect(bounds2);
  if (!intersection) {
    return undefined;
  }

  const deltaCenter = bounds1.getCenter().subtract(bounds2.getCenter());
  // const size = intersection.getSize();
  // if (size.x > size.y) {
  //     return new Point(0, size.y * Math.sign(deltaCenter.y));
  // }
  // return new Point(size.x * Math.sign(deltaCenter.x), 0);
  return deltaCenter;
};

const STEP = 5;
const STEP_ANGLE = 45;

const freePositionBOunds = new Bounds([], []);

const fillBounds = (bounds: Bounds, offset: Point) => {
  freePositionBOunds.min.x = bounds.min.x + offset.x;
  freePositionBOunds.min.y = bounds.min.y + offset.y;
  freePositionBOunds.max.x = bounds.max.x + offset.x;
  freePositionBOunds.max.y = bounds.max.y + offset.y;
};

type PROHIBITION = "w" | "e" | "s" | "n";

const getProhibitionAngle = (
  prohibition: PROHIBITION | undefined
): [number, number] => {
  switch (prohibition) {
    case "w":
      return [315, 585];
    case "e":
      return [135, 405];
    case "n":
      return [45, 315];
    case "s":
      return [135, 405];
    default:
      return [0, 360];
  }
};

const findFreePosition = (
  forRect: IBoundsData,
  otherRects: IBoundsData[],
  resolution = STEP
): Point | undefined => {
  let distance = resolution;
  while (distance < forRect.maxDistance) {
    const prohibitionAngle = getProhibitionAngle(forRect.fix);
    let [angle] = prohibitionAngle;
    const [, max] = prohibitionAngle;
    const point = new Point(0, distance);
    while (angle < max) {
      const offset = point.rotate(angle)._round();
      angle += STEP_ANGLE;
      fillBounds(forRect.bounds, offset);
      if (!isSomeIntersection(forRect.id, freePositionBOunds, otherRects)) {
        return offset;
      }
    }
    distance += resolution;
  }

  return undefined;
};

function repositionLoop(
  stillIntersected: IBoundsData[],
  notIntersected: IBoundsData[],
  resolution: number
): IBoundsData[] {
  const count = stillIntersected.length;
  const fullList = [...stillIntersected, ...notIntersected];
  for (let i = 0; i < count; i++) {
    const room = stillIntersected[i];
    // for (let j = 0; j < fullList.length; j++) {
    //     if (i == j) {
    //         continue;
    //     }
    //
    //     const otherRoom = fullList[j];
    // if (otherRoom.bounds.in)
    // let move = getMove(room.bounds, otherRoom.bounds);
    let move = findFreePosition(room, fullList, resolution);
    while (move) {
      // const move = getMove(room.bounds, otherRoom.bounds);
      // if (!move) {
      //     continue;
      // }

      // const diff = correctProhibition(move, room.fix);
      // velocity = increaseVelocityByVector(velocity, diff);
      room.bounds = moveBounds(room.bounds, move);
      move = undefined;
      // if (vectorLength(velocity) > 0) {
      //     const offset = getOffsetByVelocity(velocity, resolution);
      //     if (Math.abs(offset.x) >=1 || Math.abs(offset.y) >= 1) {
      //         room.bounds = moveBounds(room.bounds, velocity);
      //         move = getMove(room.bounds, otherRoom.bounds);
      //     } else {
      //         move = undefined;
      //     }
      // } else {
      //     move = undefined;
      // }
    }
    // }
  }

  return stillIntersected;
}

const getIntersectionsCount = (list: any[] | undefined): number =>
  list ? list.length : 0;

const splitIntersections = (
  list: IBoundsData[],
  intersectionData: Map<string, Bounds[]>
): [IBoundsData[], IBoundsData[]] => {
  const notIntersectedList: IBoundsData[] = [];
  const stillIntersected: IBoundsData[] = [];
  for (const element of list) {
    if (getIntersectionsCount(intersectionData.get(element.id))) {
      stillIntersected.push(element);
    } else {
      notIntersectedList.push(element);
    }
  }

  return [notIntersectedList, stillIntersected];
};

export function reposition(
  list: IBoundsData[],
  resolution = _resolution
): IBoundsData[] {
  const startTime = Date.now();
  let iterList = list.slice();
  const result: IBoundsData[] = [];
  let intersectionsMap: Map<string, Bounds[]>;
  while (
    (intersectionsMap = findIntersections(iterList, [...result, ...iterList]))
      .size
  ) {
    const [iterNotInter, iterStillIntersect] = splitIntersections(
      iterList,
      intersectionsMap
    );
    iterList = iterStillIntersect;

    result.push(...iterNotInter);
    repositionLoop(iterList, result, resolution);
    if (Date.now() - startTime > 300) {
      return list;
    }
  }
  return list;
}
