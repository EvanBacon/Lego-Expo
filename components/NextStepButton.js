import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NextStepButton({ onPress, style, children = 'Next' }) {
  return (
    <TouchableOpacity style={style} onPress={onPress}>
      <View style={styles.container}>
        <Text style={styles.text}>{children}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
