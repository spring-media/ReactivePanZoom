// @tcomb

import EventEmitter from "eventemitter3";
import {PanZoomHandlerEvent} from "./types";
import Kefir from "kefir";
import V from './VectorMath';
import {Vector} from "./types";

interface ReactivePanZoomOptions {
  minScaleFactor?: number;
  maxScaleFactor?: number;

  enableTouchEvents?: boolean;
  enableWheelEvents?: boolean;

  contentWidth?: number;
  contentHeight?: number;
}

export default class ReactivePanZoom {
  /**
   * indicates if the user is currently zooming
   */
  zoomIsActive: boolean;

  /**
   * the distance between first and second touch point
   */
  zoomDistance: number;
  zoomCenter: number;

  scaleFactor: number;
  oldScaleFactor: number;

  middlePoint: Vector;
  transform: Vector;
  oldTransform: Vector;

  elem: Element;
  elemWidth: number;
  elemHeight: number;

  pageHasZoom: boolean;

  /**
   * event emitter
   */
  eventEmitter: EventEmitter;

  maxScaleFactor: number;
  minScaleFactor: number;

  enableTouchEvents: boolean;
  enableWheelEvents: boolean;

  // sources

  constructor(elem: Element, options: ReactivePanZoomOptions = {}) {
    this.elem = elem;

    this.minScaleFactor = options.minScaleFactor || 1;
    this.maxScaleFactor = options.maxScaleFactor || 2.5;

    this.contentWidth = options.contentWidth || 250;
    this.contentHeight = options.contentHeight || 250;

    this.enableTouchEvents = options.enableTouchEvents !== undefined ? options.enableTouchEvents : true;
    this.enableWheelEvents = options.enableWheelEvents !== undefined ? options.enableWheelEvents : true;

    this.eventEmitter = new EventEmitter();
    this.scaleFactor = this.oldScaleFactor = 1;
    this.transform = this.oldTransform = [0, 0];
    this.middlePoint = [0, 0];

    this._setupSources();

    this._setupWheelHandler();
    this._setupTouchHandler();
  }

  _setupSources() {
    if(this.enableWheelEvents) {
      this.wheelSource = Kefir.fromEvents(this.elem, "wheel");
    }
  }

  _setupWheelHandler() {
    const changes = this.wheelSource
    // extract deltaY
      .map((wheelEvent) => {
        return (0 - wheelEvent.deltaY) / 100;
      })
      // get scaleFactor and filter out
      .scan((prev, next) => {
        let scaleFactor = prev - next;

        if (scaleFactor < this.minScaleFactor) {
          return this.minScaleFactor;
        }

        if (scaleFactor > this.maxScaleFactor) {
          return this.maxScaleFactor;
        }

        return scaleFactor;
      }, 1)
      .skipDuplicates();


    // side effects

    // emit zoom state
    changes
      .map(scaleFactor => scaleFactor > 1)
      .skipDuplicates()
      .observe((zoomActive) => {
        const zoomEvent = zoomActive ? "zoom-active" : "zoom-inactive";

        this.eventEmitter.emit(zoomEvent);
      });

    // update element
    changes
    // get transform matrix
      .map(scaleFactor => {
        return ReactivePanZoom._getTransformMatrix(0, 0, scaleFactor, scaleFactor);
      })
      .observe(transformMatrix => {
        this.elem.style.transform = transformMatrix;
      });
  }

  _setupTouchHandler(ev) {
    // SOURCES
    const touchStartSource = Kefir.fromEvents(this.elem, "touchstart");
    const touchMoveSource = Kefir.fromEvents(this.elem, "touchmove");
    const touchEndSource = Kefir.fromEvents(this.elem, "touchend");

    this.scaleFactor = 1;

    const oneFingerTouchStart = touchStartSource.filter(ev => ev.touches.length === 1);
    const twoFingerTouchStart = touchStartSource.filter(ev => ev.touches.length === 2);

    const oneFingerMoveSource = touchMoveSource.filter(ev => ev.touches.length === 1);
    const twoFingerMoveSource = touchMoveSource.filter(ev => ev.touches.length === 2);

    // COMPOSE
    const twoFingerMove = twoFingerTouchStart.flatMapFirst((ev) => {
      // init
      this.oldScaleFactor = this.scaleFactor;
      this.oldTransform = this.transform;
      this.elemWidth = this.elem.offsetWidth;
      this.elemHeight = this.elem.offsetHeight;

      let zoomFactorX: number = document.documentElement.clientWidth / window.innerWidth;
      let zoomFactorY: number = document.documentElement.clientHeight / window.innerHeight;
      this.pageHasZoom = zoomFactorX > 1 || zoomFactorY > 1;

      let
        vecA: Vector = V.fromValues(ev.touches[0].screenX, ev.touches[0].screenY),
        vecB: Vector = V.fromValues(ev.touches[1].screenX, ev.touches[1].screenY);

      this.middlePoint = V.getMiddlePoint(vecA, vecB);
      this.zoomDistance = V.distance(vecA, vecB);

      return twoFingerMoveSource.takeUntilBy(touchEndSource);
    });



    // one finger move
    const oneFingerMove = oneFingerTouchStart.filter(() => this.zoomIsActive).flatMapFirst((ev) => {

      this.elemWidth = this.elem.offsetWidth;
      this.elemHeight = this.elem.offsetHeight;
      this.oldTransform = this.transform;

      this.middlePoint = V.fromValues(ev.touches[0].screenX, ev.touches[0].screenY);

      // only handle one finger touch events, when element is zoomed
      return oneFingerMoveSource
        .takeUntilBy(touchEndSource)
        .filter(() => this.zoomIsActive);
    });

    const oneFingerTransform = oneFingerMove
      .map(ev => {
        let vecE: Float32Array = V.fromValues(ev.touches[0].screenX, ev.touches[0].screenY);

        this.transform = V.getTransformOffset(
          this.middlePoint,
          vecE,
          this.oldTransform
        );

        ev.preventDefault();
        ev.stopPropagation();

        return [this.scaleFactor, this.transform];
      });


    // two finger move
    const twoFingerTransform = twoFingerMove
    // extract coords and calc MiddlePoint and Distance
      .map(ev => {
        const
          f1 = V.fromValues(ev.touches[0].screenX, ev.touches[0].screenY),
          f2 = V.fromValues(ev.touches[1].screenX, ev.touches[1].screenY);

        const middlePoint = V.getMiddlePoint(f1, f2);
        const distance = V.distance(f1, f2);

        this.scaleFactor = V.getScaleFactor(
          this.oldScaleFactor,
          this.zoomDistance,
          distance,
          this.minScaleFactor,
          this.maxScaleFactor
        );

        this.transform = V.getTransformOffset(
          this.middlePoint,
          middlePoint,
          this.oldTransform
        );

        // allow to scale down, if page was zoomed before
        //console.log("zoom:", !this.pageHasZoom, distance > this.zoomDistance, distance, this.zoomDistance);
        if (distance > this.zoomDistance || !this.pageHasZoom) {
          ev.preventDefault();
          ev.stopPropagation();
        }

        return [this.scaleFactor, this.transform];
      })
      .skipDuplicates();

    const twoFingerZoomEventIsActive = twoFingerTransform.map((values) => {
      const [scaleFactor] = values;
      return scaleFactor !== 1;
    }).skipDuplicates();


    // ## Side Effects
    touchEndSource.observe(this._applyTouchEnd.bind(this));

    // emit zoom event
    twoFingerZoomEventIsActive.observe(this._applyEmitEvent.bind(this));

    // set transform values
    const mergedTransform = Kefir.merge([oneFingerTransform, twoFingerTransform]).throttle(10).map( values => {
      const [scaleFactor, transform] = values;

      this.transform = V.normalizeTransformOffset(
        V.fromValues(this.elemWidth, this.elemHeight),
        transform,
        scaleFactor
      );

      return [this.scaleFactor, this.transform];
    });

    this.zoomFactorProperty = mergedTransform.map( values => values [0]).toProperty(() => 1);
    this.transformProperty = mergedTransform.map( values => values [1]).toProperty(() => [0,0]);

    mergedTransform.observe(this._applyTransform.bind(this));
  }

  static _isZoomActive(values) {

  }

  _applyTouchEnd() {
    if (this.scaleFactor === 1) {
      this.eventEmitter.emit("zoom-inactive");
      let transformMatrix = ReactivePanZoom._getTransformMatrix(0, 0, 1, 1);
      this.elem.style.transform = transformMatrix;
      this.middlePoint = [0, 0];
    }
  }

  _applyEmitEvent(zoomIsActive: boolean) {
    this.zoomIsActive = zoomIsActive;
    this.eventEmitter.emit(zoomIsActive ? "zoom-active" : "zoom-inactive");
  }

  _applyTransform(values) {
    const [scaleFactor, transform] = values;

    this._updateTransformMatrix(this.transform);
  }

  _handleWheel(ev: Event) {
    this.oldScaleFactor = this.scaleFactor;

    this.scaleFactor = V.getScaleFactor(
      this.oldScaleFactor,

      0, // from
      ev.deltaY, // to

      this.minScaleFactor,
      this.maxScaleFactor
    );

    this._updateTransformMatrix(V.fromValues(0, 0));
  }

  _updateTransformMatrix(transform: Vector) {
    this.elem.style.transform = ReactivePanZoom._getTransformMatrix(
      transform[0],
      transform[1],
      this.scaleFactor,
      this.scaleFactor
    );
  }

  static _getTransformMatrix(transformX: number, transformY: number, scaleX: number, scaleY: number) {
    return `matrix(${scaleX}, 0, 0, ${scaleY}, ${transformX}, ${transformY})`;
  }

  /**
   * On Event
   */
  on(event: PanZoomHandlerEvent, callback) {
    this.eventEmitter.on(event, callback);
  }
}