/**
 * Web entry (react-native-web). The native apps use index.js; this file is the
 * Vite entry referenced by index.html and mounts the same <App/> into the DOM.
 *
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
