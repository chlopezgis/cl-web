# Corregir superposición V2

Esta publicación es una actualización del primer articulo de [Correción de Superposicion](https://chlopezgis.github.io/articulos/python/topologia/superposicion/clean_overlay). Se ha rediseñado la función para mejorar los tiempos del procesamiento

Se requiere tener instalado **`Shapely >= 2.0`** y **`geopandas >= 0.12`**


```python
import os
os.environ['USE_PYGEOS'] = '0'
import geopandas as gpd
import pandas as pd
```

A continuación, cargaremos la capa de tipo polígono **Sectores**


```python
sectores = gpd.read_file('datos/sectores.shp')
```


```python
sectores.head()
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>id</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>POLYGON ((-77.07715 -11.94747, -77.07402 -11.9...</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2</td>
      <td>POLYGON ((-77.07166 -11.94596, -77.07132 -11.9...</td>
    </tr>
    <tr>
      <th>2</th>
      <td>3</td>
      <td>POLYGON ((-77.07695 -11.94743, -77.07589 -11.9...</td>
    </tr>
    <tr>
      <th>3</th>
      <td>4</td>
      <td>POLYGON ((-77.07979 -11.95468, -77.07602 -11.9...</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5</td>
      <td>POLYGON ((-77.07400 -11.95397, -77.07387 -11.9...</td>
    </tr>
  </tbody>
</table>



Vamos a plotear la capa de modo tal que nos permita verifica si esta presenta superposición:


```python
sectores.plot(color='red', alpha=.3, edgecolor='red', figsize= (5,5));
```


    
![png](img1.png)
    


Como se observa en el gráfico, existen varios polígonos que presentan superposición.

A continuación, vamos a crear dos funciones:

* **`diferenceRows`**: Toma 2 geometrias en formato WKT y retorna la diferencia
* **`cleanOverlay`**: Toma como parámetros el **GeoDataFrame** y un **identificador de registro** y retorna un nuevo **GeoDataFrame** con la superposición corregida. Internamente llama a la función **`diferenceRows`**


```python
import shapely.wkt
from shapely.ops import unary_union
import time

def diferenceRows(geomWktA, geomWktB):
    diff = shapely.wkt.loads(geomWktA).difference(unary_union(shapely.wkt.loads(geomWktB)))
    return diff

def cleanOverlay(inGdf, gid):
    # Copiar data:
    gdf = inGdf.copy()
    
    # Crear campo geometria WKT:
    gdf['wkt'] = gdf.geometry.astype(str)
    
    # Identificar polígonos superpuestos por intersección
    gdfInts = gdf.overlay(gdf, how='intersection', keep_geom_type=True)
    # Eliminar duplicados de polígonos superpuestos
    gdfInts = gdfInts.loc[gdfInts[gid+'_1'] < gdfInts[gid+'_2']]
    # Agrupar poligonos para identificar la superposición por cada registro
    gdfOvers = gdfInts.groupby([gid+'_1','wkt_1'])['wkt_2'].agg('unique').reset_index()

    # Identificar geometrias sin superposición
    gdfNotOvers = gdf[~gdf[gid].isin(list(gdfOvers[gid+'_1']))]
    
    # Deupurar la superposición de poligonos
    gdfOversClean = gpd.GeoDataFrame(gdfOvers, geometry=None) # Convertir df a gdf
    # Invocando a la funcion "differenceRows"
    start = time.time()
    gdfOversClean['geometry'] = gdfOversClean.apply(lambda row: diferenceRows(row['wkt_1'], 
                                                                              row['wkt_2']),
                                                    axis=1)
    end = time.time()
    print(f'Tiempo para realizar la corrección: {end-start}')
    # Actualizar crs de "gdfOvers"
    gdfOversClean.set_crs(gdfNotOvers.crs, inplace=True)
    # Renombrar campos
    gdfOversClean = gdfOversClean.rename(columns={gid+'_1':gid})
    # Retorno
    return pd.concat([gdfOversClean[[gid,'geometry']],gdfNotOvers[[gid,'geometry']]])
```

Ejecutando la función


```python
start = time.time()

# Ejecuón de funcion
sectoresClean = cleanOverlay(sectores, 'id')

end = time.time()
print(f'Tiempo de todo el proceso: {end-start}')
```

    Tiempo para realizar la corrección: 0.008028030395507812
    Tiempo de todo el proceso: 0.11079764366149902
    

**Comparemos los tiempos con la anterior función que realizaba la corrección**:

![png](oldimg1.PNG)

* Vemos que la nueva función es 10 veces más rápido que la anterior función. Sin embargo, se demora un poco mas en todo el procesamiento al realizar diferentes operaciones de preparación de la data.

Visualizando el resultado


```python
sectoresClean.plot(color='red', alpha=.3, edgecolor='red', figsize= (5,5));
```


    
![png](img2.png)
    











## **Ejemplo 2**

Reutilizaremos la función para corregir la superposición de una capa de Zonas Catastrales que contiene un mayor volumen de registros: 857


```python
zonas = gpd.read_file('datos/zonas.shp')
```


```python
zonas.shape
```




    (857, 7)



Visualizaremos los atributos


```python
zonas.head()
```





<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>OBJECTID</th>
      <th>ID_DIST</th>
      <th>COD_ZONA</th>
      <th>ID_ZONA</th>
      <th>SHAPE.AREA</th>
      <th>SHAPE.LEN</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>200605</td>
      <td>99</td>
      <td>20060599</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>POLYGON ((-80.76846 -4.84790, -80.76869 -4.847...</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2</td>
      <td>200401</td>
      <td>06</td>
      <td>20040106</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>POLYGON ((-80.16641 -5.09945, -80.16684 -5.100...</td>
    </tr>
    <tr>
      <th>2</th>
      <td>3</td>
      <td>140113</td>
      <td>05</td>
      <td>14011305</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>POLYGON ((-79.81545 -6.88408, -79.81983 -6.891...</td>
    </tr>
    <tr>
      <th>3</th>
      <td>4</td>
      <td>200104</td>
      <td>15</td>
      <td>20010415</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>POLYGON ((-80.62272 -5.21333, -80.62684 -5.220...</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5</td>
      <td>200104</td>
      <td>03</td>
      <td>20010403</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>POLYGON ((-80.60302 -5.18579, -80.60187 -5.189...</td>
    </tr>
  </tbody>
</table>


Reutilizando la función:


```python
start = time.time()

# Ejecuón de funcion
zonasClean = cleanOverlay(zonas, 'OBJECTID')

end = time.time()
print(f'Tiempo de todo el proceso: {end-start}')
```

    Tiempo para realizar la corrección: 0.12502741813659668
    Tiempo de todo el proceso: 1.575824499130249
    

**Comparemos los tiempos con la anterior función**:

![png](oldimg2.PNG)

Y es aquí donde se observa la mejora en el rendimiento, el proceso de corrección es mas de 1200 veces mas rápido, mientras que todo el proceso es 100 veces mas rápido










**DISCLAIMER**

Este script se ha elaborado en base a experiencia propia, por lo cual, probablemente se requiera adaptar y optimizar para su reutilización. Además, se requiere de mayor casos de uso para identificar bugs en su ejecución.

Por tal motivo, la finalidad de esta publicación es mostrar las potencialidades de python para el manejo de datos espaciales.

* **Elaborado por:** Charlie Lopez Rengifo
* **email:** chlopezgis@gmail.com
* **[Linkedin](https://www.linkedin.com/in/chlopezgis/)**
* **[GitHub](https://github.com/chlopezgis/)**
