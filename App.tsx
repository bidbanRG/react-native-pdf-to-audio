import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Home from './src/Home';
import TextRefProvider from './src//TextRefProvider';



export default function App() {
  return (
    <TextRefProvider>
     <View style={styles.container} className='bg-red-400'>
      <Home/>
      <StatusBar style="light" />
     </View>
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
