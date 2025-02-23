<head>
  <link rel="stylesheet" type="text/css" href="../../css/templateArticles.css">
</head>

# Ajustar puntos a la geometría más cercana

## 1. Introducción

En el análisis geoespacial, asegurar la coherencia topológica entre distintas capas de
información es fundamental para garantizar la precisión y confiabilidad de los datos.
En entornos urbanos, es común que las direcciones no se alineen exactamente con los
límites de sus respectivas manzanas debido a errores de captura o a la integración de
datos provenientes de distintas fuentes. Estas discrepancias pueden impactar los análisis
espaciales y las visualizaciones, por lo que es necesario aplicar técnicas de ajuste
geométrico que corrijan estas inconsistencias y preserven la integridad topológica de la
información.

## 2. Objetivo

Implementar un procedimiento para ajustar la ubicación de las direcciones a su manzana 
correspondiente, garantizando la coherencia topológica y mejorando la precisión de los 
datos espaciales.

## 3. Alcance
            
En este artículo se trabajará con datos de direcciones y manzanas, representados como 
geometrías de puntos y polígonos, respectivamente. Cada entidad cuenta con un código 
que establece la relación entre ambas (código de manzana). El ajuste se aplicará únicamente 
a los puntos cuyo código de manzana coincida con el de la manzana correspondiente. Si los 
datos de direcciones no incluyen este código, se recomienda realizar una unión espacial 
con la manzana más cercana para asignarlo; sin embargo, este procedimiento queda fuera del 
alcance de este artículo.

## 4. Datos Utilizados

Para este proceso, utilizaremos dos capas geoespaciales:

* **Capa de direcciones**: Representa ubicaciones de direcciones con un código de manzana asociado.
* **Capa de manzanas**: Contiene los polígonos de las manzanas con su respectivo código.

El código de manzana en ambas capas es clave para garantizar que el ajuste se realice correctamente.

## 5. Herramientas para el Proceso

Para realizar el ajuste de los puntos, utilizaremos los siguientes módulos de Python:

* **GeoPandas**: Para manejar datos espaciales en formato vectorial.
* **Shapely**: Para encontrar el punto más cercano entre dos geometría.

A continuación, importamos los módulos:


```python
import geopandas as gpd
from shapely.ops import nearest_points
```

## 6. Preprocesamiento de Datos

### Inspeccionar archivos de entrada

Los datos se almacenan en un GeoPackage llamado `sample_data`. Para identificar el nombre de cada capa, primero inspeccionaremos el archivo utilizando el comando gdalinfo de la suite GDAL.


```python
!ogrinfo ../data/sample_data.gpkg
```

    INFO: Open of `../data/sample_data.gpkg'
          using driver `GPKG' successful.
    1: blocks (Multi Polygon)
    2: address_points (Point)
    

### Lectura de datos Geoespaciales

Una vez verificado los datos, procederemos a lectura de los datos geoespaciales utilizando para esto geopandas y su método **[read_file](https://geopandas.org/en/stable/docs/reference/api/geopandas.read_file.html)**


```python
blocks = gpd.read_file(filename='../data/sample_data.gpkg', layer='blocks')
apts = gpd.read_file(filename='../data/sample_data.gpkg', layer='address_points')
```

### Filtrar columnas de interes

A continuación, analizamos las columnas de ambos GeoDataFrames para identificar los campos relevantes para el proceso.


```python
blocks.columns.values
```




    array(['OBJECTID', 'CENESTE', 'CENNORTE', 'CODIGOSECTOR',
           'CODIGODISTRITO', 'CODIGOMANZANAINEI', 'CODIGOMANZANA',
           'CODIGOMALLA', 'NIVELSOCIOECONOMICO', 'CODIGOUNIDADLECTURA',
           'USUARIOCREACION', 'MAQUINA', 'FECHACREACION', 'ESTRATOINEI',
           'FUENTEESTRATO', 'FECHAESTRATOINICIAL', 'USUARIOMODIFICACION',
           'FECHAMODIFICACION', 'COMENTARIOESTRATO',
           'USUARIOMODIFICACIONINEI', 'FECHAMODIFICACIONINEI', 'TT_INEI',
           'NOMBREMANZANA', 'created_user', 'created_date',
           'last_edited_user', 'last_edited_date', 'SHAPE.STArea()',
           'SHAPE.STLength()', 'geometry'], dtype=object)




```python
apts.columns.values
```




    array(['OBJECTID', 'CODIGOPREDIO', 'NUMEROLOTE', 'ALTURATEXTO',
           'ANGULOTEXTOROTACION', 'NUMEROPUERTA', 'CODIGODISTRITO',
           'CODIGOSEGMENTOVIA', 'CODIGOMANZANA', 'CODIGOPUERTA',
           'USUARIOCREACION', 'MAQUINA', 'FECHACREACION',
           'USUARIOMODIFICACION', 'FECHAMODIFICACION', 'created_user',
           'created_date', 'last_edited_user', 'last_edited_date',
           'geometry.x', 'geometry.y', 'geometry'], dtype=object)



Para la capa de Manzanas, seleccionaremos los campos de "CODIGOMANZANA" y "geometry". Para las direcciones, los campos de "OBJECTID", "CODIGOMANZANA" y "geometry"


```python
blocks = blocks[['CODIGOMANZANA','geometry']]
blocks.head(1)
```




<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>CODIGOMANZANA</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>81054</td>
      <td>MULTIPOLYGON (((273136.019 8676687.525, 273128...</td>
    </tr>
  </tbody>
</table>
</div>




```python
apts = apts[['OBJECTID','CODIGOMANZANA','geometry']]
apts.head(1)
```




<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>OBJECTID</th>
      <th>CODIGOMANZANA</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>713601</td>
      <td>81183.0</td>
      <td>POINT (273444.79 8677076.237)</td>
    </tr>
  </tbody>
</table>
</div>



### Verificar el campo "CODIGOMANZANA"

El campo "CODIGOMANZANA" es el vínculo que relaciona las direcciones con las manzanas. Para unir ambas capas correctamente, este campo debe tener el mismo tipo de dato en ambas tablas. Verifiquemos que se cumpla esta condición


```python
blocks.dtypes
```




    CODIGOMANZANA       int64
    geometry         geometry
    dtype: object




```python
apts.dtypes
```




    OBJECTID            int64
    CODIGOMANZANA     float64
    geometry         geometry
    dtype: object



Observamos que el campo "CODIGOMANZANA" en la capa de direcciones es de tipo float, mientras que en la capa de manzanas es de tipo integer. Para asegurar la compatibilidad entre ambas, convertiremos el campo en la capa de direcciones de float a integer.


```python
# Convertir de float a entero
apts['CODIGOMANZANA'] = apts['CODIGOMANZANA'].astype('int64')
# Consultar el tipo de dato de los campos
apts.dtypes
```




    OBJECTID            int64
    CODIGOMANZANA       int64
    geometry         geometry
    dtype: object



### Verificar el sistema de referencia espacial

Para realizar el proceso de ajuste espacial, ambas capas deben estar en el mismo Sistema de Referencia. Evaluamos si ambas presentan el mismo CRS


```python
blocks.crs == apts.crs
```




    True



Ambas capas poseen el mismo CRS, veamos cual es:


```python
blocks.crs
```




    <Derived Projected CRS: EPSG:32718>
    Name: WGS 84 / UTM zone 18S
    Axis Info [cartesian]:
    - E[east]: Easting (metre)
    - N[north]: Northing (metre)
    Area of Use:
    - name: Between 78°W and 72°W, southern hemisphere between 80°S and equator, onshore and offshore. Argentina. Brazil. Chile. Colombia. Ecuador. Peru.
    - bounds: (-78.0, -80.0, -72.0, 0.0)
    Coordinate Operation:
    - name: UTM zone 18S
    - method: Transverse Mercator
    Datum: World Geodetic System 1984 ensemble
    - Ellipsoid: WGS 84
    - Prime Meridian: Greenwich



Ambas capas se encuentran en el CRS WGS 84 / UTM zone 18S (EPS: 32178)

### Calcular el anillo exterior para la manzanas

Para realizar el Snap al borde de la manzana necesitamos que la geometría sea de tipo lineal. Para esto, calcularemos el anillo exterior de los polígonos


```python
# Convertir de Multipolygon a Polygon
blocks = blocks.explode()

#Crear un campo con la geometría del anillo exterior
blocks['exterior'] = blocks.exterior

# Visualizar el primer registro
blocks[['CODIGOMANZANA','geometry','exterior']].head(1)
```




<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>CODIGOMANZANA</th>
      <th>geometry</th>
      <th>exterior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>81054</td>
      <td>POLYGON ((273136.019 8676687.525, 273128.05 86...</td>
      <td>LINEARRING (273136.019 8676687.525, 273128.05 ...</td>
    </tr>
  </tbody>
</table>
</div>



## 7. Proceso de Ajuste Espacial

Para realizar proceso de ajuste espacial utilizaremos la función **[nearest_points](https://shapely.readthedocs.io/en/2.0.4/manual.html#nearest-points)**  que se utiliza para encontrar los puntos más cercanos entre dos geometrías.

**Descripción:**

**`nearest_points(geom1, geom2)`** devuelve un par de puntos:

* El primer punto pertenece a geom1 y es el más cercano a geom2.
* El segundo punto pertenece a geom2 y es el más cercano a geom1.

Para garantizar que cada dirección se ajuste correctamente a su manzana correspondiente, primero alinearemos ambas capas utilizando el campo "CODIGOMANZANA". Dado que cada punto debe asociarse con la manzana que comparte el mismo código, primero incorporaremos la geometría de los polígonos al GeoDataFrame de las direcciones. Luego, utilizaremos **`apply`** para calcular el punto de ajuste de manera eficiente, optimizando el proceso al reducir comparaciones innecesarias.

Por lo tanto, el primer paso será alinear las manzanas con el siguiente código:


```python
aptsMerge = apts.merge(blocks[['CODIGOMANZANA','exterior']],
                       on='CODIGOMANZANA', 
                       how='left')
```

Visualicemos el resultado:


```python
aptsMerge[['OBJECTID','CODIGOMANZANA','geometry','exterior']].head(3)
```




<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>OBJECTID</th>
      <th>CODIGOMANZANA</th>
      <th>geometry</th>
      <th>exterior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>713601</td>
      <td>81183</td>
      <td>POINT (273444.79 8677076.237)</td>
      <td>LINEARRING (273476.439 8677064.485, 273472.341...</td>
    </tr>
    <tr>
      <th>1</th>
      <td>713604</td>
      <td>81197</td>
      <td>POINT (273615.384 8677148.195)</td>
      <td>LINEARRING (273626.013 8677073.934, 273622.729...</td>
    </tr>
    <tr>
      <th>2</th>
      <td>713605</td>
      <td>81197</td>
      <td>POINT (273611.117 8677140.769)</td>
      <td>LINEARRING (273626.013 8677073.934, 273622.729...</td>
    </tr>
  </tbody>
</table>
</div>



El siguiente código ajusta espacialmente cada punto a su manzana correspondiente, utilizando ambas geometrías.


```python
# Ajuste Espacial
aptsMerge["snap"] = aptsMerge.apply(lambda row: nearest_points(row["geometry"],
                                                                row["exterior"])[1],
                                     axis=1)
```

Como resultado, se agrega una nueva columna llamada "snap" al GeoDataFrame **`aptsMerge`**, donde cada fila almacena el punto más cercano en la geometría de referencia (el "exterior" de cada manzana).

<br>

>_**NOTA**: En versiones recientes de GeoPandas, es posible utilizar la función directamente:_
>
> _`aptsMerge['geom_snapp'] = list(nearest_points(aptsMerge['geometry'], aptsMerge['exterior']))[1]`_
>
> _No obstante, se recomienda el uso de `apply` para garantizar compatibilidad con versiones anteriores._

Luego, asignaremos la nueva geometría a la capa, estableceremos el CRS y eliminaremos las geometrías anteriores.


```python
# Actualizar la capa con la geometría ajustada
aptsMerge = aptsMerge.set_geometry('snap')
aptsMerge = aptsMerge.set_crs('32718')

# Eliminar geometrías anteriores:
del aptsMerge['exterior']
del aptsMerge['geometry']
```

Finalmente, exportaremos los resultados como GeoJSON


```python
aptsMerge.to_file('../data/apts_adj.gjson', driver='GeoJSON')
```

## 8. Visualización de Resultados

Para evaluar el ajuste, se comparan las ubicaciones antes y después del proceso utilizando Mapas interactivos con Folium que Facilitan la exploración de los datos ajustados en un entorno dinámico, permitiendo alternar entre la vista original y la corregida.

## 9. Recomendaciones Finales

Para asegurar un ajuste preciso y confiable, se deben considerar los siguientes puntos:

* Siempre verificar la coherencia de los códigos de manzana antes de aplicar el ajuste.
* Si los datos provienen de fuentes diferentes, realizar una validación previa antes de asignar puntos a manzanas.
* Visualizar los resultados antes y después, para asegurarse de que el ajuste ha sido exitoso.

## 10. Conclusión

El uso de Snap To Geometry en Python permite corregir la ubicación de direcciones respetando la relación punto-manzana mediante un código común. Gracias a herramientas como GeoPandas y Shapely, podemos automatizar este proceso y mejorar la calidad de nuestros datos espaciales.
