import { View, Text, TouchableOpacity, FlatList } from 'react-native';

export default function MonthsScreen({ route, navigation }) {
  const { year } = route.params;

  const months = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:26, fontWeight:'bold', marginBottom:15 }}>
        Erinnerungen {year}
      </Text>

      <FlatList
        data={months}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={{
              padding:15,
              marginBottom:10,
              backgroundColor:'white',
              borderRadius:10,
              borderWidth:1,
              borderColor:'#ddd'
            }}
            onPress={() => {
              navigation.navigate("Memories", {
                year: year,
                month: index + 1,
                monthName: item
              });
            }}
          >
            <Text style={{ fontSize:20 }}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
