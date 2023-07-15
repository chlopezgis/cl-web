# Análisis de Vecino mas Cercano

Los SIG nos permiten analizar las relaciones espaciales que existen en la información geográfica. Uno de estos análisis es identificar que objetos espaciales están mas cerca uno de otro. En este tutorial vamos a replicar esta herramienta utilizando **Python** y sus librerías **[#geopandas](https://geopandas.org/en/stable/)** y **[#shapely](https://shapely.readthedocs.io/en/stable/manual.html)**.

## Objetivos

* El objetivo es identificar la comisaria mas cercana a cada una de las instituciones educativas de la provincia de Ica.

## Obtener los datos

Para este tutorial descargamos los conjuntos de datos de las siguientes fuentes:

* Comisarias: [Directorios de comisarias](https://www.mininter.gob.pe/ubica-tu-comisaria) del Ministerio del Interio del Perú
* Instituciones educativas: [Estadisticas de la calidad educativa](https://escale.minedu.gob.pe/padron-de-iiee) del Ministerio de Educación del Perú

## Procedimiento

### 1. Preparación de los datos

Importaremos los modulos a utilizar


```python
import pandas as pd
import geopandas as gpd
from shapely.ops import nearest_points
from shapely.geometry import LineString, Point
```

A continuación, vamos a leer los conjuntos de datos que utilizaremos. Las comisarias se encuentran en formato Shapefile y las instituciones educativas en valores separador por coma (csv).


```python
# Lectura de comisarias
gdfComisarias = gpd.read_file('data/comisarias_peru.shp')

# Lectura de colegios
dfColegios = pd.read_csv('data/Padron_web.csv', encoding='UTF-8', sep=';', low_memory=False)
```

Visualizaremos los datos:


```python
# Visualizar comisarias
gdfComisarias.head(3)
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>id</th>
      <th>nombre</th>
      <th>departamen</th>
      <th>provincia</th>
      <th>distrito</th>
      <th>ubigeo</th>
      <th>lon</th>
      <th>lat</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>32</td>
      <td>COMISARIA INDIANA</td>
      <td>LORETO</td>
      <td>MAYNAS</td>
      <td>INDIANA</td>
      <td>160104</td>
      <td>-73.042052</td>
      <td>-3.499631</td>
      <td>POINT (-73.04205 -3.49963)</td>
    </tr>
    <tr>
      <th>1</th>
      <td>33</td>
      <td>COMISARIA RURAL SINCHICUY</td>
      <td>LORETO</td>
      <td>MAYNAS</td>
      <td>INDIANA</td>
      <td>160104</td>
      <td>-73.139910</td>
      <td>-3.588879</td>
      <td>POINT (-73.13991 -3.58888)</td>
    </tr>
    <tr>
      <th>2</th>
      <td>34</td>
      <td>COMISARIA FRANCISCO DE ORELLANA</td>
      <td>LORETO</td>
      <td>MAYNAS</td>
      <td>LAS AMAZONAS</td>
      <td>160105</td>
      <td>-72.764743</td>
      <td>-3.422353</td>
      <td>POINT (-72.76474 -3.42235)</td>
    </tr>
  </tbody>
</table>
</div>



La capa de colegios contiene muchas columnas, vamos a listar los nombres para visualizar solo las columnas que contienen las coordenadas.


```python
# Listado de columnas de colegios
dfColegios.columns.values
```




    array(['COD_MOD', 'ANEXO', 'CODLOCAL', 'CEN_EDU', 'NIV_MOD', 'D_NIV_MOD',
           'D_FORMA', 'COD_CAR', 'D_COD_CAR', 'TIPSSEXO', 'D_TIPSSEXO',
           'GESTION', 'D_GESTION', 'GES_DEP', 'D_GES_DEP', 'DIRECTOR',
           'TELEFONO', 'EMAIL', 'PAGWEB', 'DIR_CEN', 'REFERENCIA',
           'LOCALIDAD', 'CODCP_INEI', 'CODCCPP', 'CEN_POB', 'AREA_CENSO',
           'DAREACENSO', 'CODGEO', 'D_DPTO', 'D_PROV', 'D_DIST', 'D_REGION',
           'CODOOII', 'D_DREUGEL', 'NLAT_IE', 'NLONG_IE', 'TIPOPROG',
           'D_TIPOPROG', 'COD_TUR', 'D_COD_TUR', 'ESTADO', 'D_ESTADO',
           'D_FTE_DATO', 'TALUM_HOM', 'TALUM_MUJ', 'TALUMNO', 'TDOCENTE',
           'TSECCION', 'FECHAREG', 'FECHA_ACT'], dtype=object)




```python
# Visualizar coordenadas de colegios
dfColegios[['NLAT_IE', 'NLONG_IE']].head(3)
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>NLAT_IE</th>
      <th>NLONG_IE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>-9.51885</td>
      <td>-77.53191</td>
    </tr>
    <tr>
      <th>1</th>
      <td>-9.53067</td>
      <td>-77.53196</td>
    </tr>
    <tr>
      <th>2</th>
      <td>-9.53110</td>
      <td>-77.52270</td>
    </tr>
  </tbody>
</table>
</div>



Observamos que las coordenadas estan expresadas grados decimales en el Sistema de Referencia geodésico WGS84 (EPSG: 4326).

Utilizando la clase **[geopandas.GeoDataFrame](https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoDataFrame.html)** y el método **[geopandas.points_from_xy](https://geopandas.org/en/stable/docs/reference/api/geopandas.points_from_xy.html)** realizaremos la conversion de las instituciones educativas de DataFrame a GeoDataFrame.


```python
# Crear arreglo de geometrias con points_from_xy
geometry = gpd.points_from_xy(x=dfColegios.NLONG_IE, y=dfColegios.NLAT_IE, crs="EPSG:4326")
print(f'Tipo de dato: {type(geometry)}')
```

    Tipo de dato: <class 'geopandas.array.GeometryArray'>
    


```python
# Convertir DataFrame a GeoDataFrame
gdfColegios = gpd.GeoDataFrame(dfColegios, geometry=geometry)
print(f'Tipo de dato: {type(gdfColegios)}')
```

    Tipo de dato: <class 'geopandas.geodataframe.GeoDataFrame'>
    


```python
# Visualizar GeoDataFrame
gdfColegios[['NLAT_IE', 'NLONG_IE', 'geometry']].head()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>NLAT_IE</th>
      <th>NLONG_IE</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>-9.518850</td>
      <td>-77.531910</td>
      <td>POINT (-77.53191 -9.51885)</td>
    </tr>
    <tr>
      <th>1</th>
      <td>-9.530670</td>
      <td>-77.531960</td>
      <td>POINT (-77.53196 -9.53067)</td>
    </tr>
    <tr>
      <th>2</th>
      <td>-9.531100</td>
      <td>-77.522700</td>
      <td>POINT (-77.52270 -9.53110)</td>
    </tr>
    <tr>
      <th>3</th>
      <td>-9.516673</td>
      <td>-77.531481</td>
      <td>POINT (-77.53148 -9.51667)</td>
    </tr>
    <tr>
      <th>4</th>
      <td>-9.513940</td>
      <td>-77.504026</td>
      <td>POINT (-77.50403 -9.51394)</td>
    </tr>
  </tbody>
</table>
</div>



Como solo necesitamos los datos de la provincia de **Ica** vamos a filtrar nuestros datos para esta provincia.


```python
# Filtrar comisarias
gdfComisariasIca = gdfComisarias.loc[gdfComisarias.provincia=='ICA']
gdfComisariasIca.shape
```




    (15, 9)




```python
# Filtrar colegios
gdfColegiosIca = gdfColegios.loc[gdfColegios.D_PROV=='ICA']
gdfColegiosIca.shape
```




    (1880, 51)



Proyectar la capa a WGS84 Zona 18 Sur (**EPSG:32718**)


```python
gdfComisariasIca = gdfComisariasIca.to_crs(epsg=32718)
gdfColegiosIca = gdfColegiosIca.to_crs(epsg=32718)
```

Verificar la proyección de ambas capas:


```python
# Verificar la geometria de las comisarias
gdfComisariasIca['geometry'].head(3)
```




    1230    POINT (420968.872 8444929.856)
    1231    POINT (420898.832 8444421.778)
    1232    POINT (423270.684 8448107.866)
    Name: geometry, dtype: geometry




```python
# Verificar la geometria de los colegios
gdfColegiosIca['geometry'].head(3)
```




    20230    POINT (419160.181 8446071.519)
    20231    POINT (419153.412 8443919.343)
    20232    POINT (420587.574 8441757.110)
    Name: geometry, dtype: geometry



### 2. Análisis del Vecino mas cercano

Utilizando la función shapely **[nearest_points](https://shapely.readthedocs.io/en/stable/manual.html#shapely.ops.nearest_points)**  vamos a crear una función que nos permita calcular el vecino mas cercanos entre dos GeoDataFrames.

La función **nearest_points** retorna una tupla con el par de puntos (**origen, destino**) mas cercanos entre sí.


```python
def vecino_mas_cercano(gdf_base, gdf_vecino, campo_retorno_vecino):
    '''Funcion que calcula el vecino mas cercano entre GeoDataFrames'''
    
    # Devolver la union de todas la geometrias de destino como Multipuntos
    geometrias_vecinos_multipuntos = gdf_vecino['geometry'].unary_union
    
    # Encontrar la tupla del par de puntos mas cercanos entre sí
    tupla_geometrias_cercanas = nearest_points(gdf_base['geometry'],geometrias_vecinos_multipuntos)
    
    # Obtener los datos de "vecino mas cercano". Utilizaremos el punto de destino de la tupla (1: destino)
    vecino_mas_cercano = gdf_vecino.loc[gdf_vecino['geometry'] == tupla_geometrias_cercanas[1]]
    
    # Capturar el campo a retornar del vecino mas cercano
    resultado = vecino_mas_cercano[campo_retorno_vecino].values[0]
    
    return resultado
```

Ejecutaremos la función para determinar el vecino mas cercano. El origen serán los **colegios** y el destino las **comisarias**, y vamos a recuperar el campo **"id"** identificador de las comisarias:


```python
gdfColegiosIca['id_vecino'] = gdfColegiosIca.apply(vecino_mas_cercano, 
                                                   gdf_vecino=gdfComisariasIca,
                                                   campo_retorno_vecino='id',
                                                   axis=1)
```

Visualizar los resultados


```python
gdfColegiosIca[['NLAT_IE', 'NLONG_IE', 'geometry', 'id_vecino']].head()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>NLAT_IE</th>
      <th>NLONG_IE</th>
      <th>geometry</th>
      <th>id_vecino</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>20230</th>
      <td>-14.054920</td>
      <td>-75.748740</td>
      <td>POINT (419160.181 8446071.519)</td>
      <td>1460</td>
    </tr>
    <tr>
      <th>20231</th>
      <td>-14.074378</td>
      <td>-75.748866</td>
      <td>POINT (419153.412 8443919.343)</td>
      <td>1461</td>
    </tr>
    <tr>
      <th>20232</th>
      <td>-14.093968</td>
      <td>-75.735645</td>
      <td>POINT (420587.574 8441757.110)</td>
      <td>1461</td>
    </tr>
    <tr>
      <th>20233</th>
      <td>-13.984630</td>
      <td>-75.772310</td>
      <td>POINT (416589.856 8453837.680)</td>
      <td>1473</td>
    </tr>
    <tr>
      <th>20234</th>
      <td>-14.066910</td>
      <td>-75.723760</td>
      <td>POINT (421861.416 8444753.801)</td>
      <td>1460</td>
    </tr>
  </tbody>
</table>
</div>



Y listo, como se observa se ha identificado cual es la comisaria mas cercana a cada Colegios. Ahora, trabajemos en la visualización.

### 3. Visualización

Vamos a trazar las líneas que **unen** a los **colegios** con las **comisarias**. Para esto, vamos a realizar un **[merge](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.merge.html)** para recuperar las geometrias de las comisarias al GeoDataFrame de colegios. Utilizaremos el campo **id_vecino** e **id** de las capas de **colegios** y **comisarias** respectivamente.


```python
dfColToCom = gdfColegiosIca.merge(gdfComisariasIca[['id','geometry']]
                                  , how='left'
                                  , left_on='id_vecino'
                                  , right_on='id'
                                  , suffixes=('_col', '_com')
                                 )
```


```python
dfColToCom[['geometry_col', 'geometry_com']].head()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>geometry_col</th>
      <th>geometry_com</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>POINT (419160.181 8446071.519)</td>
      <td>POINT (420968.872 8444929.856)</td>
    </tr>
    <tr>
      <th>1</th>
      <td>POINT (419153.412 8443919.343)</td>
      <td>POINT (420898.832 8444421.778)</td>
    </tr>
    <tr>
      <th>2</th>
      <td>POINT (420587.574 8441757.110)</td>
      <td>POINT (420898.832 8444421.778)</td>
    </tr>
    <tr>
      <th>3</th>
      <td>POINT (416589.856 8453837.680)</td>
      <td>POINT (416590.497 8453696.292)</td>
    </tr>
    <tr>
      <th>4</th>
      <td>POINT (421861.416 8444753.801)</td>
      <td>POINT (420968.872 8444929.856)</td>
    </tr>
  </tbody>
</table>
</div>



Un geodataframe no puede tener dos geometrías, es por eso que al unirlos el resultado devuelve un **DataFrame** y los campos de geometría se convierten en tipo Punto Shapely.


```python
type(dfColToCom)
```




    pandas.core.frame.DataFrame



Ahora, vamos a crear una función que genere una geometría **Shapely LineString** a partir de los **puntos shapely**.


```python
# Funcion crear lineas a partir de un par de puntos
crear_linea = lambda p1, p2: LineString([p1, p2])
```

Y Ahora crearemos una nueva capa de líneas que une los colegios con las comisarias


```python
cols=['CODLOCAL','id_vecino','geometry_col','geometry_com']
dfColToCom['geometry'] = dfColToCom[cols].apply(lambda row:crear_linea(row['geometry_col']
                                                                       , row['geometry_com'])
                                                , axis=1
                                               )
```

Y ahora vamos convertir este DataFrame en GeodataFrame tomando como geometría el campo `geometry`


```python
# Convertir a GeoDataFrame
gdfColToCom = gpd.GeoDataFrame(dfColToCom, geometry=dfColToCom['geometry'])

# Calcular la distancia que es la longitud
gdfColToCom['distancia'] = gdfColToCom.length

# Ver el tipo
type(gdfColToCom)
```




    geopandas.geodataframe.GeoDataFrame



Y Ahora si! Grafiquemos.


```python
# Trazando las distancia, colegios y comisarias
ax = gdfColToCom.plot(column='distancia'
                      , cmap='Wistia'
                      , scheme='quantiles'
                      , figsize=(20, 20)
                      , k=4
                      , alpha=0.8
                      , lw=0.7
                     )

gdfColegiosIca.plot(ax=ax
                    , color='white'
                    , markersize=5
                    , alpha=0.7
                        )

gdfComisariasIca.plot(ax=ax
                      , markersize=50
                      , color='blue'
                      , alpha=0.9
                      , zorder=3)

# Haciendo zoom a una zona
ax.set_xlim([415000, 427591])
ax.set_ylim([8440000, 8457500])

# Color del fondo
ax.set_facecolor('black')
```


    
![png](output_39_0.png)
    


### Elaborado por:

* **Autor**: Charlie Lopez Rengifo
* **Correo**: chlopezgis@gmail.com
* **Linkedin**: [chlopezgis](https://www.linkedin.com/in/chlopezgis/)

### Referencias

* Documentación [Geopandas](https://geopandas.org/en/stable/index.html)
* Documentación [Shapely](https://shapely.readthedocs.io/en/stable/manual.html)
* Automating GIS-processes (University of Helsinki)
