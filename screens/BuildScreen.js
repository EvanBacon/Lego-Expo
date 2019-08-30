import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/LDrawLoader';

import { Asset } from 'expo-asset';
import React from 'react';
import {
  Picker,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getNode, useDimensions } from 'react-native-web-hooks';

import GraphicsView from '../components/GraphicsView';
import NextStepButton from '../components/NextStepButton';
import PickModelDocumentButton from '../components/PickModelDocumentButton';
import useWindowTouches from '../utils/useWindowTouches';

let camera, scene, renderer, controls, model, textureCube;
let envMapActivated = false;

const ldrawPath = '../assets/ldraw/officialLibrary/';

const DEFAULT_MODEL = require('../assets/ldraw/officialLibrary/models/30051-1-X-wingFighter-Mini.mpd_Packed.mpd');
// const DEFAULT_MODEL = require('../assets/ldraw/officialLibrary/models/4915-1-MiniConstruction.mpd_Packed.mpd');
// const DEFAULT_MODEL = require('../assets/ldraw/officialLibrary/models/batwing.ldr');
// const DEFAULT_MODEL = require('../assets/ldraw/officialLibrary/models/5935-1-IslandHopper.mpd_Packed.mpd');

const modelFileList = {
  Car: require('../assets/ldraw/officialLibrary/models/car.ldr_Packed.mpd'),
  'Lunar Vehicle': require('../assets/ldraw/officialLibrary/models/1621-1-LunarMPVVehicle.mpd_Packed.mpd'),
  'Radar Truck': require('../assets/ldraw/officialLibrary/models/889-1-RadarTruck.mpd_Packed.mpd'),
  Trailer: require('../assets/ldraw/officialLibrary/models/4838-1-MiniVehicles.mpd_Packed.mpd'),
  Bulldozer: require('../assets/ldraw/officialLibrary/models/4915-1-MiniConstruction.mpd_Packed.mpd'),
  Helicopter: require('../assets/ldraw/officialLibrary/models/4918-1-MiniFlyers.mpd_Packed.mpd'),
  Plane: require('../assets/ldraw/officialLibrary/models/5935-1-IslandHopper.mpd_Packed.mpd'),
  Lighthouse: require('../assets/ldraw/officialLibrary/models/30023-1-Lighthouse.ldr_Packed.mpd'),
  'X-Wing mini': require('../assets/ldraw/officialLibrary/models/30051-1-X-wingFighter-Mini.mpd_Packed.mpd'),
  'AT-ST mini': require('../assets/ldraw/officialLibrary/models/30054-1-AT-ST-Mini.mpd_Packed.mpd'),
  'AT-AT mini': require('../assets/ldraw/officialLibrary/models/4489-1-AT-AT-Mini.mpd_Packed.mpd'),
  Shuttle: require('../assets/ldraw/officialLibrary/models/4494-1-Imperial Shuttle-Mini.mpd_Packed.mpd'),
  'TIE Interceptor': require('../assets/ldraw/officialLibrary/models/6965-1-TIEIntercep_4h4MXk5.mpd_Packed.mpd'),
  'Star fighter': require('../assets/ldraw/officialLibrary/models/6966-1-JediStarfighter-Mini.mpd_Packed.mpd'),
  'X-Wing': require('../assets/ldraw/officialLibrary/models/7140-1-X-wingFighter.mpd_Packed.mpd'),
  'AT-ST': require('../assets/ldraw/officialLibrary/models/10174-1-ImperialAT-ST-UCS.mpd_Packed.mpd'),
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

function ModelPicker({ values, onSelect, style, ...props }) {
  const [selected, setSelected] = React.useState(values[0]);
  return (
    <Picker
      {...props}
      selectedValue={selected}
      style={[{}, style]}
      onValueChange={(itemValue, itemIndex) => {
        setSelected(itemValue);
        onSelect(itemValue);
      }}
    >
      {values.map((item, index) => (
        <Picker.Item label={item} value={item} key={index} />
      ))}
    </Picker>
  );
}

function ModelView({
  setProgress,
  setLoading,
  setError,
  currentStep,
  modelFile,
}) {
  const {
    window: { width, height, scale },
  } = useDimensions();
  const [layout, setLayout] = React.useState({ width, height });

  let timer;

  function animate() {
    timer = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  React.useEffect(() => {
    return () => clearTimeout(timer);
  }, []);

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

    console.log('load: ', asset.localUri);
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
  const ref = React.useRef(null);

  return (
    <View
      style={{ flex: 1 }}
      onLayout={({ nativeEvent: { layout } }) => setLayout(layout)}
    >
      <GraphicsView
        {...handlers}
        ref={ref}
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
          if (Platform.OS === 'web') {
            console.log(ref.current);

            controls = new THREE.OrbitControls(camera, getNode(ref));
          } else {
            controls = new THREE.OrbitControls(camera);
          }
          // load materials and then the model
          reloadObject(true);
        }}
        onUpdate={() => {
          if (renderer) renderer.render(scene, camera);
        }}
      />
    </View>
  );
}

function HomeScreen({ navigation }) {
  const {
    window: { width, height, scale },
  } = useDimensions();
  const [isLoading, setLoading] = React.useState(false);
  const [currentStep, setStep] = React.useState(-1);
  const [modelFile, pickModel] = React.useState({
    uri: (navigation && navigation.getParam('data')) || DEFAULT_MODEL,
    name: 'X-Wing',
  });
  const [progress, setProgress] = React.useState(0);
  const [errorMessage, setError] = React.useState(null);

  React.useEffect(() => {
    setStep(-1);
    // navigation.setParams({ title: modelFile ? modelFile.name : 'Lego Brix' });
  }, [modelFile]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ModelView
        setProgress={setProgress}
        setLoading={setLoading}
        setError={setError}
        currentStep={currentStep}
        modelFile={modelFile}
      />

      {Platform.OS === 'web' && (
        <SafeAreaView
          style={{
            position: 'absolute',
            top: Platform.select({ web: 12, default: 0 }),
            right: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <ModelPicker
            mode="dropdown"
            values={Object.keys(modelFileList)}
            onSelect={value => {
              setLoading(true);
              pickModel({ uri: modelFileList[value], name: value });
            }}
          />
        </SafeAreaView>
      )}

      <SafeAreaView
        style={{
          position: 'absolute',
          bottom: Platform.select({ web: 12, default: 0 }),
          left: 12,
          right: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        {model && (
          <NextStepButton onPress={() => setStep(Math.max(currentStep - 1, 0))}>
            Prev
          </NextStepButton>
        )}
        {model && (
          <NextStepButton
            onPress={() =>
              setStep(
                Math.min(currentStep + 1, model.children[0].children.length),
              )
            }
          />
        )}
      </SafeAreaView>

      {false && (
        <LinkButton style={{ position: 'absolute', top: 8, right: 8 }} />
      )}

      <PickModelDocumentButton
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
