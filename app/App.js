import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

const API_URL = 'http://172.19.192.1:3000/api'; 


export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('Backend bereit: ' + API_URL);

  // Funktion zum Hochladen des Bildes an das Docker-Backend
  const uploadImageToBackend = async (imageUri) => {
    if (isUploading) return;
    
    setIsUploading(true);
    setUploadMessage('Wird hochgeladen...');

    try {
      // 1. Erstellung des FormData-Objekts (wie bei einem HTML-Formular-Upload)
      const formData = new FormData();
      
      // Dateiname aus URI ableiten
      const filename = imageUri.split('/').pop();

      // Das Bild-Objekt zur FormData hinzufügen
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg', // Oder 'image/png', je nach Dateityp
      });
      
      // Zusätzliche Metadaten hinzufügen (wie vom Backend erwartet)
      formData.append('title', 'Mein erster Upload');
      formData.append('description', 'Getestet am ' + new Date().toLocaleTimeString());

      // 2. Senden der POST-Anfrage an den Docker-Endpunkt
      const response = await fetch(`${API_URL}/memories/upload`, {
        method: 'POST',
        // ACHTUNG: 'Content-Type' NICHT manuell setzen. FormData macht das automatisch
        // und setzt den korrekten Boundary-Wert.
        body: formData, 
      });

      const data = await response.json();
      
      if (response.ok) {
        setUploadMessage(`Upload erfolgreich! ID: ${data.memory.id}`);
        Alert.alert('Erfolg', `Bild erfolgreich gespeichert. URL: ${API_URL}${data.public_url}`);
      } else {
        // Fehler vom Server
        setUploadMessage(`Upload fehlgeschlagen: ${data.error || response.statusText}`);
        Alert.alert('Fehler', `Upload fehlgeschlagen: ${data.error || 'Unbekannter Fehler'}`);
      }
      
    } catch (error) {
      console.error('Netzwerk- oder API-Fehler:', error);
      setUploadMessage('Netzwerkfehler: Konnte Backend nicht erreichen. IP/Port prüfen!');
      Alert.alert('Netzwerkfehler', 'Stellen Sie sicher, dass Docker läuft und die IP-Adresse in App.js korrekt ist.');
    } finally {
      setIsUploading(false);
    }
  };


  const pickImage = async () => {
    // Fragt nach Berechtigung und öffnet die Galerie
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung erforderlich', 'Wir brauchen Zugriff auf Ihre Fotos, um fortzufahren.');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      // Führt den Upload sofort aus
      uploadImageToBackend(uri); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Couple Memories</Text>
      
      <Button 
        title={isUploading ? "Wird hochgeladen..." : "Bild auswählen & hochladen"} 
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