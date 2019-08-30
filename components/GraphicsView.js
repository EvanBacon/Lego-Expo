import { GLView } from 'expo-gl';
import * as React from 'react';
import { Renderer, TextureLoader, loadTextureAsync, THREE } from 'expo-three';

export default React.forwardRef(({ onCreate, onUpdate, ...props }, ref) => {
  let timeout;

  React.useEffect(() => {
    // Clear the animation loop when the component unmounts
    return () => clearTimeout(timeout);
  }, []);

  return (
    <GLView
      {...props}
      ref={ref}
      style={{ flex: 1 }}
      onContextCreate={async gl => {
        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
        const sceneColor = 0x6ad6f0;

        // Create a WebGLRenderer without a DOM element
        const renderer = new Renderer({ gl, antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(sceneColor);

        onCreate({
          renderer,
          width,
          height,
        });

        // Setup an animation loop
        const render = () => {
          timeout = requestAnimationFrame(render);
          onUpdate();
          gl.endFrameEXP();
        };
        render();
      }}
    />
  );
});
