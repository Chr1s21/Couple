import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';

const API_URL = 'http://192.168.2.103:3000/api';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('Backend bereit: IP anpassen!');
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [memoryText, setMemoryText] = useState(""); // ✅ Text für das Bild

  // 🔐 Berechtigungen prüfen
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') setIsPermissionGranted(true);
    })();
  }, []);

  // 📤 Upload Funktion
  const uploadImageToBackend = async (imageUri) => {
    if (isUploading) return;

    setIsUploading(true);
    setUploadMessage('Wird hochgeladen...');

    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const fileExtension = filename.split('.').pop().toLowerCase();
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

      formData.append("image", { uri: imageUri, name: filename, type: mimeType });
      formData.append("title", "Mein erster Upload");
      formData.append("description", "Getestet am " + new Date().toLocaleTimeString());
      formData.append("text", memoryText); // ✅ Text mitsenden

      const response = await fetch(`${API_URL}/memories/upload`, {
        method: 'POST',
        body: formData,
        headers: { "Content-Type": "multipart/form-data" }
      });

      const text = await response.text();
      console.log("SERVER:", text);

      const data = JSON.parse(text);

      if (!response.ok) throw new Error(data.error);

      setUploadMessage(`✅ Upload erfolgreich! ID: ${data.memory.id}`);
      Alert.alert("Erfolg", "Bild & Text erfolgreich gespeichert.");

      setMemoryText(""); // ✅ Textfeld zurücksetzen
    } catch (err) {
      console.error(err);
      setUploadMessage(`❌ Fehler: ${err.message}`);
      Alert.alert("Upload Fehler", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 🖼️ Bild auswählen
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      setIsPermissionGranted(false);
      return Alert.alert(
        "Berechtigung fehlt",
        "Bitte erlaube der App Zugriff auf deine Galerie."
      );
    }

    setIsPermissionGranted(true);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      console.log("User canceled");
      return;
    }

    const uri = result.assets[0].uri;
    setSelectedImage(uri);
    uploadImageToBackend(uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Couple Memories</Text>

      {/* ✅ Text Input */}
      <TextInput
        style={styles.textInput}
        placeholder="Text zum Bild eingeben..."
        value={memoryText}
        onChangeText={setMemoryText}
        multiline
      />

      <Button 
        title={isUploading ? "Lädt..." : "Bild auswählen & hochladen"} 
        onPress={pickImage}
        disabled={isUploading}
      />

      <Text style={styles.statusText}>
        {isPermissionGranted ? uploadMessage : "❌ Galerie Berechtigung fehlt"}
      </Text>

      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          {isUploading && <Text style={styles.uploadInfo}>Upload läuft...</Text>}
        </View>
      )}

      <Text style={styles.footer}>Backend muss im gleichen WLAN sein.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  textInput: {
    width: '100%',
    minHeight: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  statusText: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  imageContainer: {
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 8,
  },
  uploadInfo: {
    marginTop: 10,
    fontWeight: 'bold',
    color: 'orange',
  },
  footer: {
    marginTop: 40,
    fontSize: 10,
    color: '#aaa',
  },
});
