import React from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';

export default function CogniWellLogo({
  width = 150,
  showText = true,
  style,
}) {
  const height = showText ? width * 0.8 : width * 0.54;

  return (
    <View
      style={[
        styles.plate,
        {
          width,
          height,
        },
        style,
      ]}
    >
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
