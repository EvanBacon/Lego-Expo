import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/LDrawLoader';

import * as DocumentPicker from 'expo-document-picker';
import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getNode, useDimensions } from 'react-native-web-hooks';
import GraphicsView from '../components/GraphicsView';
import { Asset } from 'expo-asset';
import useWindowTouches from '../utils/useWindowTouches';

let camera, scene, renderer, controls, model, textureCube;
let envMapActivated = false;

const ldrawPath = '../assets/ldraw/officialLibrary/';

const DEFAULT_MODEL = require('../assets/ldraw/officialLibrary/models/30051-1-X-wingFighter-Mini.mpd_Packed.mpd');

const modelFileList = {
  Car: require('../assets/ldraw/officialLibrary/models/car.ldr_Packed.mpd'),
  'Lunar Vehicle': 'models/1621-1-LunarMPVVehicle.mpd_Packed.mpd',
  'Radar Truck': 'models/889-1-RadarTruck.mpd_Packed.mpd',
  Trailer: 'models/4838-1-MiniVehicles.mpd_Packed.mpd',
  Bulldozer: 'models/4915-1-MiniConstruction.mpd_Packed.mpd',
  Helicopter: 'models/4918-1-MiniFlyers.mpd_Packed.mpd',
  Plane: 'models/5935-1-IslandHopper.mpd_Packed.mpd',
  Lighthouse: 'models/30023-1-Lighthouse.ldr_Packed.mpd',
  'X-Wing mini': 'models/30051-1-X-wingFighter-Mini.mpd_Packed.mpd',
  'AT-ST mini': 'models/30054-1-AT-ST-Mini.mpd_Packed.mpd',
  'AT-AT mini': 'models/4489-1-AT-AT-Mini.mpd_Packed.mpd',
  Shuttle: 'models/4494-1-Imperial Shuttle-Mini.mpd_Packed.mpd',
  'TIE Interceptor': 'models/6965-1-TIEIntercep_4h4MXk5.mpd_Packed.mpd',
  'Star fighter': 'models/6966-1-JediStarfighter-Mini.mpd_Packed.mpd',
  'X-Wing': 'models/7140-1-X-wingFighter.mpd_Packed.mpd',
  'AT-ST': 'models/10174-1-ImperialAT-ST-UCS.mpd_Packed.mpd',
};

const guiData = {
  modelFileName: modelFileList['Car'],
  envMapActivated: false,
  separateObjects: false,
  displayLines: true,
  conditionalLines: true,
  smoothNormals: true,
};

function updateLineSegments({ model, conditionalLines, displayLines }) {
  model.traverse(c => {
    if (c.isLineSegments) {
      if (c.isConditionalLine) {
        c.visible = conditionalLines;
      } else {
        c.visible = displayLines;
      }
    }
  });
}

function HomeScreen({ navigation }) {
  const {
    window: { width, height, scale },
  } = useDimensions();
  const [isLoading, setLoading] = React.useState(false);
  const [currentStep, setStep] = React.useState(-1);
  const [modelFile, pickModel] = React.useState({
    uri: DEFAULT_MODEL,
    name: 'X-Wing',
  });
  const [progress, setProgress] = React.useState(0);
  const [errorMessage, setError] = React.useState(null);
  const [layout, setLayout] = React.useState({ width, height });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  React.useEffect(() => {
    if (camera) {
      camera.aspect = layout.width / layout.height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(scale);
      renderer.setSize(layout.width, layout.height);
    }
  }, [layout, scale]);

  async function reloadObject(resetCamera) {
    if (model) {
      scene.remove(model);
    }
    if (!modelFile) {
      setProgress(0);
      setLoading(false);
      return;
    }
    model = null;
    setProgress(0);
    setLoading(true);
    const lDrawLoader = new THREE.LDrawLoader();
    lDrawLoader.separateObjects = true;
    lDrawLoader.smoothNormals = guiData.smoothNormals;

    const asset = Asset.fromModule(modelFile.uri);
    await asset.downloadAsync();

    lDrawLoader.load(
      asset.localUri,
      group2 => {
        if (model) {
          scene.remove(model);
        }
        model = group2;
        // console.log(model);
        // Convert from LDraw coordinates: rotate 180 degrees around OX
        model.rotation.x = Math.PI;
        scene.add(model);

        // const children = [...model.children[0].children];
        // for (const child of children) {
        //   // const object = new THREE.Mesh(
        //   //   child,
        //   //   new THREE.MeshBasicMaterial(0xff0000),
        //   // );
        //   model.children[0].add(new THREE.BoxHelper(child, 0xffff00));
        // }

        // Adjust materials
        const { materials } = lDrawLoader;
        if (envMapActivated) {
          if (!textureCube) {
            // Envmap texture
            const r = 'textures/cube/Bridge2/';
            const urls = [
              r + 'posx.jpg',
              r + 'negx.jpg',
              r + 'posy.jpg',
              r + 'negy.jpg',
              r + 'posz.jpg',
              r + 'negz.jpg',
            ];
            textureCube = new THREE.CubeTextureLoader().load(urls);
            textureCube.format = THREE.RGBFormat;
            textureCube.mapping = THREE.CubeReflectionMapping;
          }
          for (const material of materials) {
            if (material.userData.canHaveEnvMap) material.envMap = textureCube;
          }
        }
        updateLineSegments({
          model,
          conditionalLines: guiData.conditionalLines,
          displayLines: guiData.displayLines,
        });
        // Adjust camera and light
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const radius = Math.max(size.x, Math.max(size.y, size.z)) * 0.5;
        if (resetCamera) {
          controls.target0.copy(bbox.getCenter(new THREE.Vector3()));
          controls.position0
            .set(-2.3, 2, 2)
            .multiplyScalar(radius)
            .add(controls.target0);
          controls.reset();
        }
        setLoading(false);
      },
      ({ lengthComputable, loaded, total }) => {
        if (lengthComputable) {
          setProgress(loaded / total);
          console.log(Math.round((loaded / total) * 100, 2) + '% downloaded');
        }
      },
      () => setError('Error loading model'),
    );
  }

  React.useEffect(() => {
    setStep(-1);
    reloadObject(true);
    // navigation.setParams({ title: modelFile ? modelFile.name : 'Lego Brix' });
  }, [modelFile]);

  React.useEffect(() => {
    if (!model) return;

    const children = [...model.children[0].children];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.visible = i <= currentStep;
      // console.log('parse child', child);
    }
  }, [currentStep]);

  const handlers = useWindowTouches();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <GraphicsView
        {...handlers}
        style={{ flex: 1 }}
        onCreate={props => {
          renderer = props.renderer;

          camera = new THREE.PerspectiveCamera(
            45,
            props.width / props.height,
            1,
            10000,
          );
          camera.position.set(150, 200, 250);
          // scene
          scene = new THREE.Scene();
          scene.background = new THREE.Color(0xdeebed);
          const ambientLight = new THREE.AmbientLight(0xdeebed, 0.4);
          scene.add(ambientLight);
          const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
          directionalLight.position.set(-1000, 1200, 1500);
          scene.add(directionalLight);
          controls = new THREE.OrbitControls(camera);

          scene.add(new THREE.GridHelper(10, 10));
          // load materials and then the model
          reloadObject(true);
        }}
        onUpdate={() => {
          if (renderer) renderer.render(scene, camera);
        }}
        onLayout={({ nativeEvent: { layout } }) => setLayout(layout)}
      />

      <SafeAreaView
        style={{
          position: 'absolute',
          bottom: 0,
          left: 12,
          right: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        {model && (
          <NextButton onPress={() => setStep(Math.max(currentStep - 1, 0))}>
            Prev
          </NextButton>
        )}
        {model && (
          <NextButton
            onPress={() =>
              setStep(
                Math.min(currentStep + 1, model.children[0].children.length),
              )
            }
          />
        )}
      </SafeAreaView>

      <LinkButton style={{ position: 'absolute', top: 8, right: 8 }} />

      <PickerButton
        style={{ position: 'absolute', top: 8, left: 8 }}
        onPick={({ uri, name, size }) => {
          pickModel({ uri, name });
        }}
      />

      {isLoading && <LoadingView progress={progress} />}
      {errorMessage && <ErrorView />}
    </View>
  );
}

function LinkButton({ onPress, style, children = 'Next' }) {
  return (
    <View
      style={[
        style,
        {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: 'rgba(255,255,255,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      <Text
        accessibilityRole="link"
        href="https://github.com/EvanBacon/Lego-Expo"
        style={{ fontWeight: 'bold', textAlign: 'center' }}
      >
        Info on Github ⭐️
      </Text>
    </View>
  );
}

function NextButton({ onPress, style, children = 'Next' }) {
  return (
    <TouchableOpacity style={style} onPress={onPress}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: 'rgba(255,255,255,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function PickerButton({ onPick, style }) {
  return (
    <TouchableOpacity
      style={style}
      onPress={async () => {
        const { type, uri, name, size } = await DocumentPicker.getDocumentAsync(
          {
            type: `application/x-ldraw`,
            //application/x-multipart-ldraw
            //application/x-ldlite
          },
        );
        if (type === 'success') {
          onPick && onPick({ uri, name, size });
        }
      }}
    >
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: 'rgba(255,255,255,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Pick a model
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function ErrorView({ message }) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
      }}
    >
      <Text style={{ padding: 16 }}>Error: {errorMessage}</Text>
    </View>
  );
}

function LoadingView({ progress }) {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.5)',
          alignItems: 'center',
        },
      ]}
    >
      <Text>Loading... {Math.round(progress * 100, 2)}%</Text>
    </View>
  );
}

// HomeScreen.navigationOptions = ({ navigation }) => ({
//   title: navigation.getParam('title'),
// });

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
});
