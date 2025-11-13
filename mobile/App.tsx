import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { store } from './src/store';
import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import GymListScreen from './src/screens/GymListScreen_new';
import GymDetailScreen from './src/screens/GymDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  Login: undefined;
  OTPVerification: undefined;
  Profile: undefined;
  EditProfile: undefined;
  GymList: undefined;
  GymDetail: { gymId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#667eea',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'GYMFU' }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Create Account' }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login' }}
          />
          <Stack.Screen
            name="OTPVerification"
            component={OTPVerificationScreen}
            options={{ title: 'Verify OTP' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ title: 'Edit Profile' }}
          />
          <Stack.Screen
            name="GymList"
            component={GymListScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GymDetail"
            component={GymDetailScreen}
            options={{ title: 'Gym Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
