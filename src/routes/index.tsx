import React, { useEffect } from 'react';
// import { ActivityIndicator, View } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import AppRoutes from './app.routes';
import AuthRoutes from './auth.routes';

import { useAuth } from '../hooks/auth';

const Routes: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hide();
    }
  }, [loading]);

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" color="#999" />
  //     </View>
  //   );
  // }

  return user ? <AppRoutes /> : <AuthRoutes />;
};

export default Routes;
