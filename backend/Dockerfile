# Verwende ein stabiles Node-Image als Basis
FROM node:20-alpine

# Setze das Arbeitsverzeichnis im Container
WORKDIR /usr/src/app

# Kopiere nur die package.json und installiere die Abhängigkeiten.
# npm install erzeugt die package-lock.json
COPY package.json ./ 
RUN npm install

# Kopiere den gesamten Quellcode
COPY src src/
COPY uploads uploads/

# Setze den Befehl zum Starten des Servers
CMD [ "npm", "start" ]