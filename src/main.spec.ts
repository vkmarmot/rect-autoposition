import { reposition } from "./main";
import { Bounds, Point } from "tactic-geometry";

describe("main", () => {
  test("reposition", () => {
    const res = reposition([
      { bounds: new Bounds(new Point(0, 0), new Point(10, 10)), id: "foo" },
      { bounds: new Bounds(new Point(5, 5), new Point(15, 15)), id: "bar" },
      { bounds: new Bounds(new Point(12, 3), new Point(22, 13)), id: "baz" },
    ]);

    expect(res).toEqual([
      { bounds: { max: { x: 7, y: 7 }, min: { x: -3, y: -3 } }, id: "foo" },
      { bounds: { max: { x: 14, y: 18 }, min: { x: 4, y: 8 } }, id: "bar" },
      { bounds: { max: { x: 25, y: 13 }, min: { x: 15, y: 3 } }, id: "baz" },
    ]);
  });
  test("reposition with prohibition", () => {
    const res = reposition([
      {
        bounds: new Bounds(new Point(0, 0), new Point(10, 10)),
        fix: "w",
        id: "foo",
      },
      {
        bounds: new Bounds(new Point(5, 5), new Point(15, 15)),
        fix: "all",
        id: "bar",
      },
      {
        bounds: new Bounds(new Point(12, 3), new Point(22, 13)),
        fix: "w",
        id: "baz",
      },
    ]);

    expect(res).toEqual([
      {
        fix: "w",
        bounds: { max: { x: 10, y: 4 }, min: { x: 0, y: -6 } },
        id: "foo",
      },
      {
        fix: "all",
        bounds: { max: { x: 15, y: 15 }, min: { x: 5, y: 5 } },
        id: "bar",
      },
      {
        fix: "w",
        bounds: { max: { x: 26, y: 13 }, min: { x: 16, y: 3 } },
        id: "baz",
      },
    ]);
  });
});
