import { View, Text, FlatList, Image } from 'react-native';
import { useEffect, useState } from 'react';

const API_URL = 'http://192.168.2.103:3000/api';

export default function MemoriesScreen({ route }) {
  const { year, month, monthName } = route.params;
  const [memories, setMemories] = useState([]);

  useEffect(() => {
  const url = `${API_URL}/memories/filter?year=${year}&month=${month}`;
  console.log("Requesting:", url);

  fetch(url)
    .then(async res => {
      console.log("Status:", res.status);

      const text = await res.text();
      console.log("Response text:", text);

      try {
        const data = JSON.parse(text);
        setMemories(data);
      } catch (err) {
        console.log("JSON parse error:", err);
        Alert.alert("Server error", "Die API hat kein JSON zurückgegeben — URL stimmt nicht.");
      }
    })
    .catch(err => console.error("Fetch error:", err));
  }, []);


  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:26, fontWeight:'bold', marginBottom:15 }}>
        {monthName} {year}
      </Text>

      {memories.length === 0 && (
        <Text>Keine Erinnerungen für diesen Monat 😢</Text>
      )}

      <FlatList
        data={memories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom:20, backgroundColor:"#fff", borderRadius:10, padding:10 }}>
            <Image
              source={{ uri: `http://192.168.2.103:3000/${item.file_path}` }}
              style={{ width:'100%', height:200, borderRadius:10 }}
            />
            <Text style={{ marginTop:10, fontSize:16 }}>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
}
