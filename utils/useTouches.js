// // @flow
// /* global Alert */
import React from 'react';
import { PanResponder } from 'react-native';

export default function useTouches({
  onTouchesBegan = () => {},
  onTouchesMoved = () => {},
  onTouchesEnded = () => {},
  onTouchesCancelled = () => {},
  onStartShouldSetPanResponderCapture = () => true,
  onResponderTerminationRequest,
} = {}) {
  const [panResponder, setResponder] = React.useState(
    PanResponder.create({
      // onResponderTerminate: onResponderTerminate ,
      // onStartShouldSetResponder: () => true,
      onResponderTerminationRequest: onResponderTerminationRequest,
      onStartShouldSetPanResponderCapture: onStartShouldSetPanResponderCapture,
      // onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderGrant: ({ nativeEvent }, gestureState) =>
        onTouchesBegan({ ...nativeEvent, gestureState }),
      onPanResponderMove: ({ nativeEvent }, gestureState) =>
        onTouchesMoved({ ...nativeEvent, gestureState }),
      onPanResponderRelease: ({ nativeEvent }, gestureState) =>
        onTouchesEnded({ ...nativeEvent, gestureState }),
      onPanResponderTerminate: ({ nativeEvent }, gestureState) =>
        onTouchesCancelled
          ? onTouchesCancelled({ ...nativeEvent, gestureState })
          : onTouchesEnded({ ...nativeEvent, gestureState }),
    }),
  );

  return panResponder.panHandlers;
}
