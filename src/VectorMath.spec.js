// @tcomb

import test from 'ava';
import VectorMath from "./VectorMath";

test("divide", t => {
  t.deepEqual(
    VectorMath.divide([10, 10], [2, 5]),
    [5, 2]
  );
});

test("add", t => {
  t.deepEqual(
    VectorMath.add([-5, -5], [10, 20]),
    [5, 15]
  );
});

test("scale", t => {
  t.deepEqual(
    VectorMath.scale([5,5], 2),
    [10, 10]
  );
});

test("substract", t => {
  t.deepEqual(
    VectorMath.substract([10,10], [18,18]),
    [-8, -8]
  );
});

test("min", t => {
  t.deepEqual(
    VectorMath.min([5, 5], [10, 10]),
    [5, 5]
  );

  t.deepEqual(
    VectorMath.min([10, 10], [5, 5]),
    [5, 5]
  );

  t.deepEqual(
    VectorMath.min([-5, -5], [10, 10]),
    [-5, -5]
  );

  t.deepEqual(
    VectorMath.min([-5, 5], [5, -5]),
    [-5, -5]
  );
});

test("max", t => {
  t.deepEqual(
    VectorMath.max([5, 5], [10, 10]),
    [10, 10]
  );

  t.deepEqual(
    VectorMath.max([10, 10], [5, 5]),
    [10, 10]
  );

  t.deepEqual(
    VectorMath.max([-5, -5], [10, 10]),
    [10, 10]
  );

  t.deepEqual(
    VectorMath.max([-5, 5], [5, -5]),
    [5, 5]
  );
});

test("fromValues", t => {
  t.deepEqual(
    VectorMath.fromValues(5, 15),
    [5, 15]
  );
});


test("getMiddlePoint", t => {

  t.deepEqual(
    VectorMath.getMiddlePoint([0, 0], [10, 10]),
    [5, 5]
  );

  t.deepEqual(
    VectorMath.getMiddlePoint([5, 5], [10, 5]),
    [7.5, 5]
  );

  t.deepEqual(
    VectorMath.getMiddlePoint([-5, -5], [15, 10]),
    [5, 2.5]
  );

});


test("getScaleFactor", t => {
  t.is(
    VectorMath.getScaleFactor(1, 10, 120, 0, 3.5),
    2.1,
    "scale by factor 2.1, 100px = scale factor + 1"
  );

  t.is(
    VectorMath.getScaleFactor(2, 10, 120, 0, 3.5),
    3.1,
    "old scale factor is added"
  );

  t.is(
    VectorMath.getScaleFactor(3.5, 100, 50, 0, 3.5),
    3,
    "can scale down"
  );

});

test("getTransformOffset", t => {
  t.deepEqual(
    VectorMath.getTransformOffset( [0, 0], [10, 10], [0, 0] ),
    [10, 10]
  );

  t.deepEqual(
    VectorMath.getTransformOffset([10, 10], [0, 0], [0, 0]),
    [-10, -10]
  );

  t.deepEqual(
    VectorMath.getTransformOffset([5, 5], [10, 10], [-5, -5]),
    [0, 0]
  );

  t.deepEqual(
    VectorMath.getTransformOffset([-5, -5], [6, 6], [3, 3]),
    [14, 14]
  );
});


test("normalizeTransformOffset", t => {

  t.deepEqual(
    VectorMath.normalizeTransformOffset(
      500,
      500,
      [200, 200],
      1
    ),
    [0, 0],
    "should normalize coords to 0|0 in scaleFactor 1"
  );

  t.deepEqual(
    VectorMath.normalizeTransformOffset(
      500,
      500,
      [-200, -200],
      1
    ),
    [0, 0],
    "should normalize coords to 0|0 in scaleFactor 1"
  );

  t.deepEqual(
    VectorMath.normalizeTransformOffset(
      500,
      500,
      [300, 300],
      2
    ),
    [250, 250],
    "should normalize coordinates to the border within the scaled box"
  );

  t.deepEqual(
    VectorMath.normalizeTransformOffset(
      500,
      500,
      [-300, -300],
      2
    ),
    [-250, -250],
    "should normalize coordinates to the border within the scaled box"
  );

  t.deepEqual(
    VectorMath.normalizeTransformOffset(
      500,
      500,
      [100, 100],
      2
    ),
    [100, 100],
    "do not normalize, when coordinates are within the scaled box"
  );

});
