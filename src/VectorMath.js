// @tcomb

import {Vector} from "./types";

export default class VectorMath {

  static getMiddlePoint(v1, v2) {
    return VectorMath.divide(
      VectorMath.add(v1, v2),
      [2, 2]
    );
  }

  static getScaleFactor(oldScaleFactor: number, distanceFrom: number, distanceTo: number, minScaleFactor: number, maxScaleFactor: number) {
    let scaleFactor: number = oldScaleFactor + (distanceTo - distanceFrom) / 100;

    if(scaleFactor < minScaleFactor) {
      return minScaleFactor;
    } else if(scaleFactor > maxScaleFactor) {
      return maxScaleFactor;
    }

    return scaleFactor;
  }

  static getTransformOffset(vecOld, vecCur, vecStart) {
    return VectorMath.add(
      vecStart,
      VectorMath.substract(vecCur, vecOld)
    );
  }

  static normalizeTransformOffset(elem: Vector, vecTransform, scaleFactor: number) {
    const [elemWidth, elemHeight] = elem;

    let scaledElemWidth = elemWidth * scaleFactor;
    let scaledElemHeight = elemHeight * scaleFactor;

    let maxLeftOffset = (scaledElemWidth - elemWidth) / 2,
      maxRightOffset = maxLeftOffset * -1,
      maxTopOffset = (scaledElemHeight - elemHeight) / 2,
      maxBottomOffset = maxTopOffset * -1;

    vecTransform = VectorMath.min(vecTransform, [maxLeftOffset, maxTopOffset]);
    vecTransform = VectorMath.max(vecTransform, [maxRightOffset, maxBottomOffset]);

    return vecTransform;
  }

  // ## low level vector methods
  // inspired/ported by gl-matrix, but without typed arrays for IE9 compatibility
  static divide(v1, v2) {
    return [
      v1[0] / v2[0],
      v1[1] / v2[1]
    ];
  }

  static add(v1, v2) {
    return [
      v1[0] + v2[0],
      v1[1] + v2[1]
    ];
  }

  static scale(v1, scale) {
    return [
      v1[0] * scale,
      v1[1] * scale,
    ];
  }

  static substract(v1, v2) {
    return [
      v1[0] - v2[0],
      v1[1] - v2[1]
    ]
  }

  static min(v1, v2) {
    return [
      Math.min(v1[0], v2[0]),
      Math.min(v1[1], v2[1])
    ];
  }

  static max(v1, v2) {
    return [
      Math.max(v1[0], v2[0]),
      Math.max(v1[1], v2[1])
    ];
  }

  static fromValues(x, y) {
    return [x, y];
  }

  static distance(v1, v2) {
    const x = v2[0] - v1[0],
          y = v2[1] - v1[1];

    return Math.sqrt(x*x + y*y);
  }
}
