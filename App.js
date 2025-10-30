import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// WICHTIG: Ersetzen Sie 172.19.192.1 durch die tatsächliche IP Ihres Computers (Host-PC)
// Die IP muss im selben lokalen Netzwerk wie Ihr Handy/Emulator liegen.
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const API_URL = 'http://172.19.192.1:3000/api'; 

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('Backend bereit: IP anpassen!');
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  // Berechtigung beim Start anfragen
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        setIsPermissionGranted(true);
      } else {
        // Meldet den Fehler, aber unterbricht nicht die App-Funktion
        console.warn('Medienbibliothek-Berechtigung wurde nicht erteilt.');
      }
    })();
  }, []);

  // Funktion zum Hochladen des Bildes an das Docker-Backend
  const uploadImageToBackend = async (imageUri) => {
    if (isUploading) return;
    
    setIsUploading(true);
    setUploadMessage('Wird hochgeladen...');

    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop();

      // Das Bild-Objekt zur FormData hinzufügen
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      });
      
      // Zusätzliche Metadaten hinzufügen (vom Backend erwartet)
      formData.append('title', 'Mein erster Upload');
      formData.append('description', 'Getestet am ' + new Date().toLocaleTimeString());

      // Senden der POST-Anfrage
      const response = await fetch(`${API_URL}/memories/upload`, {
        method: 'POST',
        // Content-Type wird von FormData automatisch korrekt gesetzt
        body: formData, 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server gab ungültige Antwort.' }));
        // Werfen Sie eine detailliertere Ausnahme
        throw new Error(errorData.error || `Serverfehler: HTTP ${response.status}`);
      }

      const data = await response.json();
      
      setUploadMessage(`Upload erfolgreich! ID: ${data.memory.id}`);
      Alert.alert('Erfolg', `Bild erfolgreich gespeichert.`);
      
    } catch (error) {
      console.error('Fehler beim Upload:', error);
      setUploadMessage(`Fehler: ${error.message}. IP/Port prüfen!`); 
      Alert.alert('Upload Fehler', `Upload konnte nicht abgeschlossen werden. Grund: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };


  const pickImage = async () => {
    // Falls Berechtigung nachträglich entzogen wurde
    if (!isPermissionGranted) {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
          Alert.alert('Berechtigung Fehlt', 'Bitte erlauben Sie den Zugriff auf die Galerie in den App-Einstellungen.');
          return;
      }
      setIsPermissionGranted(true);
    }
    
    // START: Öffnen der Galerie
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Korrekter Enum-Wert
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
  
  const buttonTitle = isUploading 
    ? "Wird hochgeladen..." 
    : (isPermissionGranted ? "Bild auswählen & hochladen" : "Berechtigung prüfen...");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Couple Memories</Text>
      
      <Button 
        title={buttonTitle} 
        onPress={pickImage} 
        disabled={isUploading}
      />
      
      <Text style={[styles.statusText, isUploading ? {color: 'orange'} : {color: 'green'}]}>
        {uploadMessage}
      </Text>

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
  }
});
