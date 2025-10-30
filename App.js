import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// WICHTIG: Ersetzen Sie 172.19.192.1:3000 durch die tatsächliche IP Ihres Computers und den Port.
// Achten Sie auf die IP, da 172.x.x.x oft nicht von mobilen Geräten erreicht wird.
// Verwenden Sie die IP, die Sie über 'ipconfig' (Windows) gefunden haben (meist 192.168.x.x).
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const API_URL = 'http://172.19.192.1:3000/api'; 


export default function UploadPage() { // Komponente umbenannt, um Verwirrung zu vermeiden
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('Backend bereit: IP anpassen!');

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
      
      // Zusätzliche Metadaten hinzufügen (vom Backend in routes.js erwartet)
      formData.append('title', 'Mein erster Upload');
      formData.append('description', 'Getestet am ' + new Date().toLocaleTimeString());

      // 2. Senden der POST-Anfrage an den Docker-Endpunkt
      const response = await fetch(`${API_URL}/memories/upload`, {
        method: 'POST',
        body: formData, 
      });

      // Wenn die Antwort nicht 200-299 ist, wirf einen Fehler.
      if (!response.ok) {
         // Versuche, eine Fehlermeldung vom Server zu lesen
        const errorData = await response.json().catch(() => ({ error: 'Server gab ungültige Antwort.' }));
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      
      setUploadMessage(`Upload erfolgreich! ID: ${data.memory.id}`);
      Alert.alert('Erfolg', `Bild erfolgreich gespeichert.`);
      
    } catch (error) {
      console.error('Fehler beim Upload:', error);
      // Detailreichere Fehlermeldung im Statusfeld
      setUploadMessage(`Fehler: ${error.message}. IP/Port prüfen!`); 
      Alert.alert('Upload Fehler', `Upload konnte nicht abgeschlossen werden. Grund: ${error.message}`);
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
      // FIX: Hier verwenden wir ImagePicker.MediaTypeOptions.Images,
      // was als korrekter Wert für den Enum in dieser Version erwartet wird.
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
