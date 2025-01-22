# Crear Linea a partir de 2 puntos

Para este ejemplo, necesitamos calcular la distancia de desplazamiento entre diferentes puntos. Contamos con 2 bases: original y desplazado, teniendo como llave el campo **ID**.

* **Paso 1.**: Importar las librerias a utilizar

```python
from shapely.geometry import Point, LineString
import pandas as pd
import geopandas as gpd
import os
```

* **Paso 2.** Especificar la ruta de los archivos csv

```python
original = 'data/original.csv'
desplazado = 'data/desplazado.csv'
```

* **Paso 3.** Convertir a dataframe

```python
dfOrg = pd.read_csv(original, sep=';')
dfDpz = pd.read_csv(desplazado, sep=';')
```

Visualizamos los archivos:

```python
dfOrg.head(3)
```

![image](https://user-images.githubusercontent.com/88239150/201785553-b7868061-b7fe-43a7-bde1-d35f1d1190e3.png)


```python
dfDpz.head(3)
```

![image](https://user-images.githubusercontent.com/88239150/201785598-1c4505c2-28bb-492e-9060-72d7e3faf34c.png)

* **Paso 4.** Unir los dataframe por el campo `id`

```python
# Merge: Unir dataframes
dfMerge = dfOrg.merge(dfDpz, on='id', how='left', suffixes=('_org', '_dpz'))

# Visualizar resultados
dfMerge.head()
```

![image](https://user-images.githubusercontent.com/88239150/201786009-e85a65da-d839-496c-9147-cb2792e7ba00.png)

* **Paso 5.** Funcion para crear un objeto LineString Shapely a partir de un par de coordenadas.

```python
funLineString = lambda lon_org, lat_org, lon_dpz, lat_dpz: LineString([(lon_org, lat_org), (lon_dpz, lat_dpz)])
```

* **Paso 6.** Aplicar la función al dataframe

```python
dfMerge['geometry'] = dfMerge.apply(lambda row: funLineString(row['lon_org'],
                                                              row['lat_org'],
                                                              row['lon_dpz'], 
                                                              row['lat_dpz']
                                                             ),                                    
                                    axis=1)
```

Visualizar los resultados:

```python
dfMerge.head()
```

![image](https://user-images.githubusercontent.com/88239150/201787448-99ac1679-fc8b-4c03-aa2e-9f924571d3b6.png)

* **Paso 7.** Convertir DataFrame a GeoDataFrame.

```pytho
ngeoDf = gpd.GeoDataFrame(dfMerge, geometry=dfMerge.geometry, crs='EPSG:4326')
```

Visualizar resultados:

```python
geoDf.head()
``` 

![image](https://user-images.githubusercontent.com/88239150/201787946-9a3c798f-1e6a-4003-aae0-64ad2476d552.png)

* **Paso 8.** Calculamos la longitud, que es la distancia entre ambos puntos. No olvidar reproyectar la capa

```python
geoDf['distancia'] = geoDf.geometry.to_crs(32718).length
```

Visualizar el resultado

```python
geoDf.head()
``` 

![image](https://user-images.githubusercontent.com/88239150/201788477-20eb7e05-4200-427e-9322-c13e96edc2b1.png)

* **Paso 9.** Exportar los resultados

```python
geoDf.to_file('out/gis.gpkg', layer='line_distance', driver='GPKG')
```

* **Paso 10.** Verificar desde QGIS

![image](https://user-images.githubusercontent.com/88239150/201790107-e2c268c0-d224-45c6-9256-efb54f378a52.png)

