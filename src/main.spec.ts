import { Bounds, Point } from "tactic-geometry";
import { reposition } from "./main";

describe("main", () => {
  test("reposition", () => {
    let res = reposition([
      { maxDistance: 100, bounds: new Bounds(new Point(0, 0), new Point(10, 10)), id: "foo" },
      { maxDistance: 100, bounds: new Bounds(new Point(5, 5), new Point(15, 15)), id: "bar" },
      { maxDistance: 100, bounds: new Bounds(new Point(12, 3), new Point(22, 13)), id: "baz" },
    ]);

    expect(res).toEqual([
      { maxDistance: 100, bounds: { max: { x: 10, y: 4 }, min: { x: 0, y: -6 } }, id: "foo" },
      { maxDistance: 100, bounds: { max: { x: 11, y: 15 }, min: { x: 1, y: 5 } }, id: "bar" },
      { maxDistance: 100, bounds: { max: { x: 22, y: 14 }, min: { x: 12, y: 4 } }, id: "baz" },
    ]);
    res = reposition(
      [
        { maxDistance: 100, bounds: new Bounds(new Point(0, 0), new Point(10, 10)), id: "foo" },
        { maxDistance: 100, bounds: new Bounds(new Point(5, 5), new Point(15, 15)), id: "bar" },
        { maxDistance: 100, bounds: new Bounds(new Point(12, 3), new Point(22, 13)), id: "baz" },
      ],
      1
    );
    expect(res).toEqual([
      { maxDistance: 100, bounds: { max: { x: 10, y: 4 }, min: { x: 0, y: -6 } }, id: "foo" },
      { maxDistance: 100, bounds: { max: { x: 11, y: 15 }, min: { x: 1, y: 5 } }, id: "bar" },
      { maxDistance: 100, bounds: { max: { x: 22, y: 14 }, min: { x: 12, y: 4 } }, id: "baz" },
    ]);
    res = reposition(
        [
          { maxDistance: 100, bounds: new Bounds(new Point(0, 0), new Point(10, 10)), id: "foo" },
          { bounds: new Bounds(new Point(5, 5), new Point(15, 15)), id: "bar" },
          { maxDistance: 100, bounds: new Bounds(new Point(12, 3), new Point(22, 13)), id: "baz" },
        ],
        1
    );
    expect(res).toEqual([
      { maxDistance: 100, bounds: { max: { x: 10, y: 4 }, min: { x: 0, y: -6 } }, id: "foo" },
      { bounds: new Bounds(new Point(5, 5), new Point(15, 15)), id: "bar" },
      { maxDistance: 100, bounds: { max: { x: 26, y: 13 }, min: { x: 16, y: 3 } }, id: "baz" },
    ]);
  });
  test("reposition with prohibition", () => {
    const res = reposition([
      {
        maxDistance: 100,
        bounds: new Bounds(new Point(0, 0), new Point(10, 10)),
        fix: "w",
        id: "foo",
      },
      {
        maxDistance: 100,
        bounds: new Bounds(new Point(5, 5), new Point(15, 15)),
        id: "bar",
      },
      {
        maxDistance: 100,
        bounds: new Bounds(new Point(12, 3), new Point(22, 13)),
        fix: "w",
        id: "baz",
      },
      {
        maxDistance: 100,
        bounds: new Bounds(new Point(33, 31), new Point(43, 41)),
        fix: "w",
        id: "baz",
      },
    ]);

    expect(res).toEqual(
        [ { maxDistance: 100, bounds: { max: { x: 10, y: 4 }, min: { x: 0, y: -6 } },
          fix: 'w',
          id: 'foo' },
          { maxDistance: 100, bounds: { max: { x: 11, y: 15 }, min: { x: 1, y: 5 } },
            id: 'bar' },
          { maxDistance: 100, bounds: { max: { x: 22, y: 14 }, min: { x: 12, y: 4 } },
            fix: 'w',
            id: 'baz' },
          { maxDistance: 100, bounds: { max: { x: 42, y: 42 }, min: { x: 32, y: 32 } },
            fix: 'w',
            id: 'baz' } ]
);
  });
});
