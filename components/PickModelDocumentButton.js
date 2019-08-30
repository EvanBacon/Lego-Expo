import * as DocumentPicker from 'expo-document-picker';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PickModelDocumentButton({ onPick, style }) {
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
