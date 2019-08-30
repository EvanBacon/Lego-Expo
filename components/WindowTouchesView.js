// @flow
import { PropTypes } from 'prop-types';
import React from 'react';
import { PanResponder, View } from 'react-native';

/* global Alert */

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

function TouchableView({
    onTouchesBegan: () => {},
    onTouchesMoved: () => {},
    onTouchesEnded: () => {},
    onTouchesCancelled: () => {},
    onStartShouldSetPanResponderCapture: () => true,
}) {
 
    const handlers = useTouches({
        onTouchesBegan: (nativeEvent) => {
            const event = _transformEvent(nativeEvent);
            _emit('touchstart', event);
            onTouchesBegan(event);
          },
onTouchesMoved: (nativeEvent) => {
    const event = _transformEvent(nativeEvent);
    _emit('touchmove', event);
    onTouchesMoved(event);
  },
onTouchesEnded: nativeEvent => {
    const event = _transformEvent(nativeEvent);
    _emit('touchend', event);
    onTouchesEnded(event);
  },
onTouchesCancelled:  nativeEvent => {
    const event = _transformEvent(nativeEvent);
    _emit('touchcancel', event);

    onTouchesCancelled
      ? onTouchesCancelled(event)
      : onTouchesEnded(event);
  },,
onStartShouldSetPanResponderCapture,
    })

    return (
      <View {...props} style={[style]} {...this._panResponder.panHandlers}>
        {children}
      </View>
    );
}
export default TouchableView;
