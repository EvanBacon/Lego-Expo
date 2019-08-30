import React from 'react';
import { StyleSheet, View } from 'react-native';

import List from '../components/List';
import BrixModels from '../constants/LocalModels';

export default function ModelsScreen({ navigation }) {
  const data = (navigation.state.params || {}).data || BrixModels;
  const shouldRenderPage = typeof data === 'string';
  if (shouldRenderPage) {
    const url = `https://raw.githubusercontent.com/evanbacon/ldraw-parts/master/models/${data}`;
    return <View file={url} />;
  } else {
    return (
      <List
        data={Object.keys(data)}
        onPress={async item => {
          const nextData = data[item];
          const shouldRenderNextPage = typeof nextData === 'string';
          if (shouldRenderNextPage) {
            const url = `https://raw.githubusercontent.com/evanbacon/ldraw-parts/master/models/${encodeURIComponent(
              nextData,
            )}`;

            navigation.navigate('Home', {
              data: url,
              title: item,
            });
          } else {
            navigation.navigate('Select', {
              data: nextData,
              title: item,
            });
          }
        }}
      />
    );
  }
  return null;
}

ModelsScreen.navigationOptions = ({ navigation }) => ({
  title: ((navigation.state.params || {}).title || 'LEGO MODELS').toUpperCase(),
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});

function isFunction(functionToCheck) {
  var getType = {};
  return (
    functionToCheck &&
    getType.toString.call(functionToCheck) === '[object Function]'
  );
}
