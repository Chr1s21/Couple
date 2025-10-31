import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';

const API_URL = 'http://192.168.2.103:3000/api'; 

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('Backend bereit: IP anpassen!');
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') setIsPermissionGranted(true);
    })();
  }, []);

  // ✅ Upload Funktion
  const uploadImageToBackend = async (imageUri) => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadMessage('Wird hochgeladen...');

    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const fileExtension = filename.split('.').pop().toLowerCase();
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

      formData.append("image", {   // ✅ richtiger Feldname
        uri: imageUri,
        name: filename,
        type: mimeType,
      });

      formData.append("title", "Mein erster Upload");
      formData.append("description", "Getestet am " + new Date().toLocaleTimeString());

      const response = await fetch(`${API_URL}/memories/upload`, {
        method: 'POST',
        body: formData,
      });

      const rawText = await response.text();
      console.log("RAW RESPONSE:", rawText);  // ✅ Debug

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Server gab keine gültige JSON-Antwort zurück.");
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP Fehler: ${response.status}`);
      }

      setUploadMessage(`Upload erfolgreich! ID: ${data.memory.id}`);
      Alert.alert("Erfolg", "Bild erfolgreich gespeichert.");
    } 
    catch (error) {
      console.error("Fehler beim Upload:", error);
      setUploadMessage(`Fehler: ${error.message}.`);
      Alert.alert("Upload Fehler", error.message);
    } 
    finally {
      setIsUploading(false);
    }
  };

  // ✅ Neues ImagePicker API
  const pickImage = async () => {
    if (!isPermissionGranted) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.image], // ✅ Neuer Enum
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      uploadImageToBackend(uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Couple Memories</Text>
      <Button title="Bild auswählen & hochladen" onPress={pickImage} disabled={isUploading} />
      <Text style={styles.statusText}>{uploadMessage}</Text>

      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          {isUploading && <Text style={styles.uploadInfo}>Upload läuft...</Text>}
        </View>
      )}

      <Text style={styles.footer}>Docker Backend über Host-IP erreichbar.</Text>
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
    marginBottom: 30,
    color: '#333',
  },
  statusText: {
    marginTop: 20,
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

