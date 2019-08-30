// @flow
import React from 'react';

/* global Alert */
import useTouches from './useTouches';

const _emit = (type, props) => {
  if (window.document && window.document.emitter) {
    window.document.emitter.emit(type, props);
  }
};

const _transformEvent = event => {
  event.preventDefault = event.preventDefault || (_ => {});
  event.stopPropagation = event.stopPropagation || (_ => {});
  return event;
};

export default function useWindowTouches({
  onTouchesBegan = () => {},
  onTouchesMoved = () => {},
  onTouchesEnded = () => {},
  onTouchesCancelled = () => {},
  onStartShouldSetPanResponderCapture = () => true,
} = {}) {
  return useTouches({
    onTouchesBegan: nativeEvent => {
      const event = _transformEvent(nativeEvent);
      _emit('touchstart', event);
      onTouchesBegan(event);
    },
    onTouchesMoved: nativeEvent => {
      const event = _transformEvent(nativeEvent);
      _emit('touchmove', event);
      onTouchesMoved(event);
    },
    onTouchesEnded: nativeEvent => {
      const event = _transformEvent(nativeEvent);
      _emit('touchend', event);
      onTouchesEnded(event);
    },
    onTouchesCancelled: nativeEvent => {
      const event = _transformEvent(nativeEvent);
      _emit('touchcancel', event);

      onTouchesCancelled ? onTouchesCancelled(event) : onTouchesEnded(event);
    },
    onStartShouldSetPanResponderCapture,
  });
}
