import { 
  View, Text, Button, Image, Alert, TextInput, StyleSheet, 
  Keyboard, TouchableOpacity 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect, useRef } from 'react';

const API_URL = 'http://192.168.2.103:3000/api';

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [memoryText, setMemoryText] = useState("");

  const textInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("📱 Init Permission status:", status);
      if (status === 'granted') setIsPermissionGranted(true);
    })();
  }, []);

  const resetForm = () => {
    console.log("🔄 Reset form");
    setMemoryText("");
    setSelectedImage(null);
    textInputRef.current?.blur();
    Keyboard.dismiss();
    setUploadMessage("");
  };

  const uploadImageToBackend = async (uri) => {
    console.log("📤 Upload gestartet");

    setIsUploading(true);
    setUploadMessage("Upload läuft...");
    textInputRef.current?.blur();
    Keyboard.dismiss();

    try {
      const filename = uri.split('/').pop();
      const ext = filename.split('.').pop().toLowerCase();
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

      const formData = new FormData();
      formData.append("image", { uri, name: filename, type: mime });
      formData.append("text", memoryText);

      const res = await fetch(`${API_URL}/memories/upload`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" }
      });

      const raw = await res.text();
      console.log("📩 Server Antwort:", raw);

      const data = JSON.parse(raw);
      if (!res.ok) throw new Error(data.error);

      Alert.alert("✅ Erfolgreich", "Memory gespeichert!");
      resetForm();
      setUploadMessage("✅ Fertig");

    } catch (err) {
      console.log("❌ Upload Fehler:", err);
      Alert.alert("Fehler", err.message);
    }

    setIsUploading(false);
  };

  const pickImage = async () => {
    console.log("📸 Button gedrückt (pickImage startet)");

    textInputRef.current?.blur();
    Keyboard.dismiss();

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("📱 Permission status:", status);

    if (status !== "granted") {
      Alert.alert("Zugriff benötigt", "Bitte Fotos-Zugriff erlauben");
      return;
    }

    console.log("✅ Berechtigung ok — öffne Galerie...");

    try {
      // ✅ Expo Version-Sicher (alte + neue MediaType API)
      const mediaType =
        ImagePicker.MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType,
        allowsEditing: false, // iOS fix
        quality: 0.8,
      });

      console.log("📥 Picker Ergebnis:", result);

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        uploadImageToBackend(uri);
      } else {
        console.log("↩️ Auswahl abgebrochen");
      }

    } catch (e) {
      console.log("❌ Picker Fehler:", e);
      Alert.alert("Fehler beim Öffnen der Galerie");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Neue Erinnerung</Text>

      <TextInput
        ref={textInputRef}
        style={styles.input}
        placeholder="Text eingeben..."
        value={memoryText}
        onChangeText={setMemoryText}
        multiline
      />

      <View style={styles.row}>
        <Button 
          title="Bild auswählen & hochladen" 
          onPress={pickImage} 
          disabled={isUploading} 
        />

        <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Abbrechen</Text>
        </TouchableOpacity>
      </View>

      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.img} />}

      {uploadMessage !== "" && (
        <Text style={{ marginTop: 10 }}>{uploadMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, alignItems:'center', marginTop:30 },
  input: { width:"100%", borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10, minHeight:80, marginBottom:10 },
  img: { width:250, height:250, marginTop:20, borderRadius:10 },
  title: { fontSize:22, marginBottom:10 },
  row: { width:"100%", flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  cancelBtn: { padding:10 },
  cancelText: { color:"red", fontWeight:"bold" }
});
