import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function YearsScreen({ navigation }) {
  const [startYear, setStartYear] = useState(null);
  const [inputYear, setInputYear] = useState("");

  // Falls kein Jahr gesetzt → Eingabe anzeigen
  if (!startYear) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:20 }}>
        <Text style={{ fontSize:22, marginBottom:10 }}>Startjahr eurer Beziehung</Text>

        <TextInput
          style={{
            borderWidth:1, borderColor:'#aaa', borderRadius:8,
            padding:10, width:'60%', textAlign:'center', marginBottom:10
          }}
          placeholder="z.B. 2020"
          keyboardType="numeric"
          value={inputYear}
          onChangeText={setInputYear}
        />

        <Button
          title="Speichern"
          onPress={() => setStartYear(Number(inputYear))}
        />
      </View>
    );
  }

  // Jahre berechnen
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  ).reverse();

  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:26, fontWeight:'bold', marginBottom:15 }}>
        Eure Erinnerungsjahre
      </Text>

      <FlatList
        data={years}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding:15,
              borderRadius:10,
              backgroundColor:'#fff',
              marginBottom:10,
              borderWidth:1,
              borderColor:'#ddd'
            }}
            onPress={() => navigation.navigate("Months", { year: item })}

          >
            <Text style={{ fontSize:20 }}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
