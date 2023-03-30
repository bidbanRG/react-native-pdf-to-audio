import {  StatusBar } from 'expo-status-bar';

import { Platform, SafeAreaView, StyleSheet } from 'react-native';
import Home from './src/Home';
import TextRefProvider from './src//TextRefProvider';



export default function App() {
  return (
    <TextRefProvider>
     <SafeAreaView 
       style={styles.container} 
       className='bg-red-400'>
      <Home/>
      <StatusBar style="light" backgroundColor='black'/>
     </SafeAreaView>
    </TextRefProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
    alignItems: 'center',
    justifyContent: 'center',
  },
});
