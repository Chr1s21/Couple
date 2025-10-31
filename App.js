import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import YearsScreen from './src/screens/YearsScreen';
import MonthsScreen from './src/screens/MonthsScreen';
import MemoriesScreen from './src/screens/MemoriesScreen';
import UploadScreen from './src/screens/UploadScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TimelineStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Years" component={YearsScreen} />
      <Stack.Screen name="Months" component={MonthsScreen} />
      <Stack.Screen name="Memories" component={MemoriesScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tabs.Navigator>
        <Tabs.Screen name="Timeline" component={TimelineStack} />
        <Tabs.Screen name="Upload" component={UploadScreen} />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}
