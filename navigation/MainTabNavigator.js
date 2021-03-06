import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  createStackNavigator,
  createBottomTabNavigator,
} from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import BuildScreen from '../screens/BuildScreen';
import ModelsScreen from '../screens/ModelsScreen';
import SettingsScreen from '../screens/SettingsScreen';

import Colors from '../constants/Colors';

const HomeStack = createStackNavigator(
  {
    // Select: ModelsScreen,
    Home: BuildScreen,
  },
  {
    headerMode: 'screen',
    defaultNavigationOptions: {
      title: 'RUBRICK',
      headerTitleStyle: {
        fontFamily: 'lego',
        color: Colors.yellow,
        fontSize: 33,
        overflow: 'visible',
      },

      headerStyle: {
        backgroundColor: Colors.red,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(156, 156, 156, 0.56)',
        boxShadow: undefined,
      },
    },
  },
);

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const LinksStack = createStackNavigator({
  Links: ModelsScreen,
});

LinksStack.navigationOptions = {
  tabBarLabel: 'Links',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'}
    />
  ),
};

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

export default HomeStack;
// export default createBottomTabNavigator({
//   HomeStack,
//   LinksStack,
//   SettingsStack,
// });
