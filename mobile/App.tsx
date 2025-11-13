import React, { useEffect, useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, RootState } from './src/store';
import { useAppDispatch } from './src/store/hooks';
import { setCredentials } from './src/store/authSlice';
import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import GymListScreen from './src/screens/GymListScreen_new';
import GymDetailScreen from './src/screens/GymDetailScreen';

// Auth Stack (Login/Register)
export type AuthStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  OTPVerification: undefined;
};

// Main Stack (After Login)
export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  GymList: undefined;
  GymDetail: { gymId: number };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

// Welcome Screen (Login/Register choice)
function WelcomeScreen({ navigation }: any) {
  return (
    <HomeScreen />
  );
}

// Auth Navigator (for non-authenticated users)
function AuthNavigator() {
  return (
    <AuthStack.Navigator
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
      <AuthStack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ title: 'GYMFU', headerShown: false }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Create Account' }}
      />
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
      <AuthStack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={{ title: 'Verify OTP' }}
      />
    </AuthStack.Navigator>
  );
}

// Main Navigator (for authenticated users)
function MainNavigator() {
  return (
    <MainStack.Navigator
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
      <MainStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'GYMFU' }}
      />
      <MainStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <MainStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <MainStack.Screen
        name="GymList"
        component={GymListScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="GymDetail"
        component={GymDetailScreen}
        options={{ title: 'Gym Details' }}
      />
    </MainStack.Navigator>
  );
}

// Root Navigator that switches between Auth and Main
function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth token on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          dispatch(setCredentials({ user, token }));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
}
