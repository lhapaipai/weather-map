# Carte du Vent WebGL2

<a href="https://maplibre-react-components.pentatrion.com">
<img src="https://raw.githubusercontent.com/lhapaipai/wind-map/main/screenshot.png" alt="Carte du Vent" />
</a>

## Récupération des données

On profitera des données ouvertes de Météo France : https://portail-api.meteofrance.fr

On se rendra donc dans la section :

- Prévision
  - Modèle AROME Prévision Immédiate.

on effectuera des requêtes `WCS` pour récupérer des images de données au format geotiff.

on cherche la meilleure résolution (même si après on la redimensionera...) on s'orientera donc vers les 3 requêtes

- `/wcs/MF-NWP-HIGHRES-AROMEPI-001-FRANCE-WCS/`
  - `GetCapabilities`  : nous donne la liste des calques disponible
  - `DescribeCoverage` : nous donne des informations sur les paramètres à fournir pour notre requête `GetCoverage`
  - `GetCoverage`      : requête qui permet de récupérer notre geotiff.


Pour effectuer toutes nos requêtes il faut créer un jeton sur leur site et l'inclure dans un en-tête http : `apikey`.

Après avoir effectué une requête `GetCapabilities` on sélectionne les calques qui concernent le vent.

```bash
# requête auquel on ajoutera un en-tête `apikey`.
https://public-api.meteofrance.fr/public/aromepi/1.0/wcs/MF-NWP-HIGHRES-AROMEPI-001-FRANCE-WCS/GetCapabilities?service=WCS&version=2.0.1&language=fre
```


`WIND_SPEED_GUST_15MIN__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND`
Rafale de vent sur 15 minutes en niveaux hauteur.

`WIND_SPEED_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND`
Rafale de vent en niveaux hauteur sur une heure

`WIND_SPEED_MAXIMUM_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND`
Rafale de vent en niveaux hauteur


`U_COMPONENT_OF_WIND_GUST_15MIN__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND`
composante zonale de la rafale du vent sur 15 minutes, en niveau hauteur. m/s

`V_COMPONENT_OF_WIND_GUST_15MIN__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND`
composante méridienne de la rafale du vent sur 15 minutes, en niveau hauteur. m/s


`U_COMPONENT_OF_WIND_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND`
composante zonale de la rafale du vent, en niveaux hauteur m/s (instantané)

`V_COMPONENT_OF_WIND_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND`
composante méridienne de la rafale du vent, en niveau hauteur m/s (instantané)


On prendra donc les 2 derniers.

- `U_COMPONENT_OF_WIND_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND`
- `V_COMPONENT_OF_WIND_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND`


Pour chaque calque est suffixé un horodatage et c'est la requête `GetCapabilities` qui nous donne les horodatages disponibles.

- `___2024-09-18T06.00.00Z_PT1H`
- `___2024-09-18T06.00.00Z_PT3H`
- `___2024-09-18T06.00.00Z_PT6H`


Récupération des composantes U et V de la rafale du vent

Exemple de récupération d'un geotiff dans l'emprise de la france métropolitaine

```bash
https://public-api.meteofrance.fr/public/aromepi/1.0/wcs/MF-NWP-HIGHRES-AROMEPI-001-FRANCE-WCS/GetCoverage?
service=WCS&
version=2.0.1&
coverageid=U_COMPONENT_OF_WIND_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND___2024-09-18T06.00.00Z&
format=image/tiff&
subset=long(-5.6,10.2)&
subset=lat(40.8,52)&
subset=time(2024-09-18T08:00:00Z)& # l'image est générée le 2024-09-18T06.00.00 et effectue une prévision pour 2024-09-18T08:00:00Z
subset=height(10) # on se place à 10m du sol (seule valeur disponible)
```

## Traitement de la donnée

le traitement peut être lancé via un script semi-automatisé voir `scripts/prepare.sh`.

le fichier brut fait 1581px x 1100px on va diviser sa taille par 4 : 388px x 275px.


Redimensionnement de nos fichiers tiff.

```bash
gdal_translate -outsize 0 275 raw/V_COMPONENT_OF_WIND_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND___2024-09-18T06.00.00Z.tiff export.tiff
```

## Choix techniques

Certains choix sont subjectifs, voici l'explication. 

### Donnée 

> u-component of wind m/s (instantané)
> convention : positif pour un vent provenant de l’ouest et négatif pour un vent provenant de l’est.

> v-component of wind m/s (instantané)
> convention : positif pour un vent provenant du sud et négatif pour un vent provenant du nord.

la donnée météo france a une précision à 2 chiffres après la virgule. La vitesse maximale enregistrée pour une rafale de vent au sol sur Terre est de 110 m/s. Nous souhaiterions stocker cette information dans une image PNG. Pour être précis, il nous faudrait donc pouvoir exprimer.

```
U -> -110.00 à +110.00
V -> -110.00 à +110.00

1 pixel = R + G + B + A
chaque canal est codé sur 8bits: 256 valeurs

2 canaux couplés = 16 bits -> 65535

À partir de ces contraintes, voyons comment on va normaliser cette donnée.

U -> 0.00 à 220.00
  -> 0 à 22 000
  -> proche de 0 à 65535

pareil pour V donc pour chaque composante.

Unormalisé = U * 100 + 32768
Vnormalisé = V * 100 + 32768 
```

stockage dans une texture

```js
pixel.Red   = Math.floor(normalizedU / 256);
pixel.Green = Math.floor(normalizedV / 256);
pixel.Blue  = Math.floor(normalizedU) % 256;
pixel.Alpha = Math.floor(normalizedV) % 256;
```

légende

```ts
const windSpeedRampColor = {
  0: "#3288bd",
  5: "#66c2a5",
  10: "#abdda4",
  20: "#e6f598",
  30: "#fee08b",
  40: "#fdae61",
  50: "#f46d43",
  60: "#d53e4f",
  80: "#9e0142",
  100: "#67001f",
  120: "#40000c",
};
```
pour faciliter nos affichages on va normer la vitesse du vent dans nos shaders en considérant qu'il ne peut dépasser 120 m/s.

0.0 -> 0 m/s
1.0 -> 120 m/s

### Shaders 

dans nos shaders l'origine a été placée en haut à gauche, ceci afin de faciliter la lecture de la donnée de vent depuis la texture `u_wind` qui a également son origine
en haut à gauche.

(0, 0) (1, 0)
(0, 1) (1, 1)

attention toutefois, un vent provenant du sud et allant vers le nord est positif d'après la donnée de météo france. pour faire un déplacement correct des particules dans notre shader il faudra donc multipler son déplacement vertical par -1.


pour récupérer la donnée de position depuis la texture particlePositionCurrent

en considérant R, G, B, A entre (0 et 1)

```
x = R + B / 255
y = G + A / 255

clipX = 2 * x - 1
clipY = (-1) * (2 * y - 1) // le -1 permet de considérer l'origine en haut à gauche.
```


## Debug

le dossier public contient une image de vent pour le debugage `public/wind_debug.png`.