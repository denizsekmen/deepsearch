module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: [
    './assets/fonts/inter/',
    './assets/fonts/sora/',
    './assets/fonts/poppins/',
    './assets/fonts/sourceCode/',
    './assets/fonts/sfpro/',
    './assets/fonts/redHatDisplay/',
    './assets/fonts/proximaNova/',
  ],
  dependencies: {
    'react-native-image-crop-picker': {
      platforms: {
        ios: null, // disable iOS platform auto linking
      },
    },
  },
};
