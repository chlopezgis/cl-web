# Corregir superposición

Para este ejemplo vamos a depurar la superposición de una misma capa vectorial de tipo **poligono**:

Comenzaremos importando las librerías a utilizar:


```python
import geopandas as gpd
import pandas as pd
```

A continuación, cargaremos la capa de **Sectores**


```python
sectores = gpd.read_file('datos/sectores.shp')
```


```python
sectores.head()
```

<div>
<table border="0" class="dataframe">
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
</div>


Visualizando la superposición entre polígonos:


```python
sectores.plot(color='red',
              alpha=.3,
              edgecolor='red',
              figsize= (5,5)
              );
```
  
![png](output_6_0.png)
    
Como se observa en el gráfico, existen varios polígonos que presentan superposición.

A continuación, vamos a crear una función que tome como parámetros el **GeoDataFrame** y el nombre del campo que almacena la **geometría** y retorne un nuevo **GeoDataFrame** con la superposición corregida.


```python
def cleanOverlay(gdfIn, geom):
    # Copiamos el GeoDataFrame de entrada
    gdf = gdfIn.copy()
    # Iteramos el GeoDataFrame
    for idx, row in gdf.iterrows():
        # Iteramos nuevamente el GeoDataFrame para realizar el análisis de 
        # 1 geometría vs las otras
        for idx2, row2 in gdf.iterrows():
            # Validamos que las geometrías NO sean iguales
            noEquals = not row[geom].equals(row2[geom])
            # Validamos que las geometrias se intersectan
            siIntersects = row[geom].intersects(row2[geom])
            # Si cumplen las dos condiciones ejecutamos una diferencia entre 
            # las geometrías y actualizamos la geometría de la capa de salida
            if noEquals and siIntersects:
                gdf.at[idx, geom] = gdf.at[idx, geom].difference(row2[geom])
    return gdf
```

Ejecutando la función


```python
sectoresClean = cleanOverlay(sectores, 'geometry')
```

Visualizando el resultado

```python
sectoresClean.plot(color='red',
                   alpha=.3,
                   edgecolor='red',
                   figsize= (5,5)
                   );
```
    
![png](output_12_0.png)

Antes de exportar los datos visualizemos los tipos de geometría:

```python
sectoresClean.geometry.geom_type.value_counts()
```

    Polygon    7
    dtype: int64



Como se observan todos son de tipo poligono, asi que no realizaremos ningun proceso de homologación de geometrias.

Finalmente, exportaremos la nueva capa como shapefile


```python
sectoresClean.to_file('datos/SectoresClean.shp')
```

## **Reutilizando la funcion**

Reutilizaremos la función para corregir la superposición de una capa de Zonas Catastrales


```python
zonas = gpd.read_file('datos/zonas.shp')
```

Visualizaremos los atributos

```python
zonas.head()
```

<div>
<table border="0" class="dataframe">
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
</div>

Reutilizando la función:

```python
zonasClean = cleanOverlay(zonas, 'geometry')
```

Verificando los tipos de geometría:


```python
zonasClean.geometry.geom_type.value_counts()
```


    Polygon               851
    MultiPolygon            5
    GeometryCollection      1
    dtype: int64


Como se observa existe un geometria de tipo **"GeometryCollection"**, para quedarnos con geometrias de tipo poligonal, vamos a realizar un **explode** y luego eliminar las geometrias que nos sean polígonos:


```python
# Explotando la geometria
zonasClean = zonasClean.explode(ignore_index=True, 
                                index_parts=True)
```

Verificamos nuevamente el tipo de geometría:

```python
zonasClean.geometry.geom_type.value_counts()
```

    Polygon       894
    LineString      1
    dtype: int64


Eliminando las geometrias diferentes a "Polygon" y "MultiPolygon"


```python
# Obtener el indice a eliminar
indexDrop = zonasClean[zonasClean.geometry.geom_type == 'LineString'].index
# Eliminando
zonasClean.drop(index=indexDrop, inplace=True)
# Verificando
zonasClean.geometry.geom_type.value_counts()
```

    Polygon    894
    dtype: int64


Exportar capa:


```python
zonasClean.to_file('datos/zonas_clean.shp')
```

**DISCLAIMER**

Este script se ha elaborado en base a experiencia propia, por lo cual, probablemente se requiera adaptar y optimizar para su reutilización. Además, se requiere de mayor casos de uso para identificar bugs en su ejecución.

Por tal motivo, la finalidad de esta publicación es mostrar las potencialidades de python para el manejo de datos espaciales.

* **Elaborado por:** Charlie Lopez Rengifo
* **email:** chlopezgis@gmail.com
* **[Linkedin](https://www.linkedin.com/in/chlopezgis/)**
* **[GitHub](https://github.com/chlopezgis/)**
