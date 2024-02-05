# **Análisis del Vecino mas Cercano**

El análisis de vecino más cercano es una técnica que se utiliza para **evaluar la proximidad espacial entre elementos geográficos**. En esencia, busca identificar el vecino más cercano a cada entidad geoespacial en un conjunto de datos, **calculando la distancia entre ellas**. Esta distancia puede determinarse utilizando diversas métricas, como la **distancia euclidiana** o la **distancia de Manhattan**, según la naturaleza de los datos y los objetivos del análisis.

## **1. Problema**

En este estudio, nos proponemos abordar la problemática fundamental relacionada con la respuesta a emergencias en la ciudad de Lima Metropolitana. En específico, nos enfocaremos en realizar un análisis de los vecinos más cercanos entre las instituciones educativas y las comisarías. El objetivo principal es determinar cuál es la comisaría más próxima para responder eficazmente a cualquier emergencia que pueda surgir en las proximidades de cada institución educativa.

## **2. Objetivo**

* Determinar de manera precisa y eficiente cuál es la comisaría más cercana a cada institución educativa en la ciudad de Lima Metropolitana

## **3. Fuente de datos**

Para la elaboración de este tutorial, se han obtenido los conjuntos de datos de las siguientes fuentes de datos abiertos.

* Comisarias: [Directorios de comisarias](https://www.mininter.gob.pe/ubica-tu-comisaria) del Ministerio del Interior del Perú
* Instituciones educativas: [Estadisticas de la calidad educativa](https://escale.minedu.gob.pe/padron-de-iiee) del Ministerio de Educación del Perú

## **4. Procedimiento**

El análisis se llevará a cabo mediante Python y sus librerías especializadas en el manejo de datos geoespaciales y visualización. El objetivo es demostrar de manera clara y concisa cómo este tipo de análisis puede explorarse y analizarse eficientemente en un entorno de programación.

### **4.1. Lectura de datos**

Antes de iniciar con la lectura de los datos es necesario importar todas las librerías a utilizar:


```python
import pandas as pd
import geopandas as gpd
from shapely.geometry import LineString
import contextily as cx
import matplotlib.pyplot as plt
plt.style.use('ggplot')
```

A continuación, procederemos a la lectura de los conjuntos de datos que emplearemos en este análisis. Las comisarías se presentan en formato Shapefile, mientras que las instituciones educativas se encuentran en valores separados por coma (csv). Para realizar esta tarea, utilizaremos las librerías `geopandas` y `pandas` para la lectura de cada uno, respectivamente.


```python
# Lectura de comisarias
gdfComisarias = gpd.read_file('data/comisarias_peru.shp')

# Lectura de colegios
dfColegios = pd.read_csv('data/Padron_web.zip', encoding='UTF-8', sep=',', low_memory=False)
```

Visualizaremos los datos:


```python
# Visualizar comisarias
gdfComisarias.head(3)
```

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

```python
# Visualizar colegios
dfColegios.head(3)
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>COD_MOD</th>
      <th>ANEXO</th>
      <th>CODLOCAL</th>
      <th>CEN_EDU</th>
      <th>NIV_MOD</th>
      <th>D_NIV_MOD</th>
      <th>D_FORMA</th>
      <th>COD_CAR</th>
      <th>D_COD_CAR</th>
      <th>TIPSSEXO</th>
      <th>...</th>
      <th>COD_TUR</th>
      <th>D_COD_TUR</th>
      <th>ESTADO</th>
      <th>D_ESTADO</th>
      <th>D_FTE_DATO</th>
      <th>TALUM_HOM</th>
      <th>TALUM_MUJ</th>
      <th>TALUMNO</th>
      <th>TDOCENTE</th>
      <th>TSECCION</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2723696</td>
      <td>0</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 4</td>
      <td>A5</td>
      <td>Inicial - Programa no escolarizado</td>
      <td>No escolarizada</td>
      <td>a</td>
      <td>No aplica</td>
      <td>3</td>
      <td>...</td>
      <td>11</td>
      <td>Mañana</td>
      <td>1</td>
      <td>Activa</td>
      <td>Declarado</td>
      <td>5</td>
      <td>5</td>
      <td>10</td>
      <td>0</td>
      <td>1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2723695</td>
      <td>0</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 3</td>
      <td>A5</td>
      <td>Inicial - Programa no escolarizado</td>
      <td>No escolarizada</td>
      <td>a</td>
      <td>No aplica</td>
      <td>3</td>
      <td>...</td>
      <td>11</td>
      <td>Mañana</td>
      <td>1</td>
      <td>Activa</td>
      <td>Declarado</td>
      <td>4</td>
      <td>4</td>
      <td>8</td>
      <td>0</td>
      <td>1</td>
    </tr>
    <tr>
      <th>2</th>
      <td>1008614</td>
      <td>0</td>
      <td>725808.0</td>
      <td>DON BOSCO</td>
      <td>F0</td>
      <td>Secundaria</td>
      <td>Escolarizada</td>
      <td>a</td>
      <td>No aplica</td>
      <td>3</td>
      <td>...</td>
      <td>11</td>
      <td>Mañana</td>
      <td>1</td>
      <td>Activa</td>
      <td>Declarado</td>
      <td>28</td>
      <td>29</td>
      <td>57</td>
      <td>10</td>
      <td>5</td>
    </tr>
  </tbody>
</table>
<p>3 rows × 48 columns</p>

### **4.2. Preprocesamiento de los datos**

**Filtro de columnas**

La capa de colegios contiene muchas columnas, vamos a listar los nombres para luego seleccionar solo las columnas de interes.


```python
# Visualizar columnas de colegios
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
           'TSECCION'], dtype=object)



Tras realizar una revisión, se observa que la capa no cuenta con un campo identificador (ID). Por lo tanto, procederemos a construir uno:


```python
dfColegios['ID_CEN_EDU'] = dfColegios.index + 1
```

Finalmente, seleccionaremos solo aquellas columnas de interes para el análisis


```python
dfColegios = dfColegios[['ID_CEN_EDU','CODLOCAL','CEN_EDU','D_DPTO','D_PROV','D_DIST','NLAT_IE','NLONG_IE']]
dfColegios.head()
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ID_CEN_EDU</th>
      <th>CODLOCAL</th>
      <th>CEN_EDU</th>
      <th>D_DPTO</th>
      <th>D_PROV</th>
      <th>D_DIST</th>
      <th>NLAT_IE</th>
      <th>NLONG_IE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 4</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>-12.07358</td>
      <td>-76.99879</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 3</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>-12.07357</td>
      <td>-76.99879</td>
    </tr>
    <tr>
      <th>2</th>
      <td>3</td>
      <td>725808.0</td>
      <td>DON BOSCO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>-12.08059</td>
      <td>-77.00386</td>
    </tr>
    <tr>
      <th>3</th>
      <td>4</td>
      <td>81077.0</td>
      <td>VILLA MARIA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>-12.08064</td>
      <td>-77.00396</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 1</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>-12.07358</td>
      <td>-76.99878</td>
    </tr>
  </tbody>
</table>

**Conversión de datos**

El siguiente paso implica la conversión del DataFrame de Colegios en un GeoDataFrame, para lo cual emplearemos las funciones de geopandas: **[geopandas.points_from_xy](https://geopandas.org/en/stable/docs/reference/api/geopandas.points_from_xy.html)** y **[geopandas.GeoDataFrame](https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoDataFrame.html)**.

Iniciaremos la creación de un arreglo de geometrías utilizando la función **`points_from_xy`**:


```python
geometry = gpd.points_from_xy(x=dfColegios.NLONG_IE, y=dfColegios.NLAT_IE, crs='EPSG:4326')
```

Ahora procederemos a convertir el DataFrame de colegios en un GeoDataFrame mediante el uso de la función **`GeoDataFrame`**. Dicha función solicita dos parámetros: uno que contenga los datos o atributos (puede ser un DataFrame), y el otro que incluya las geometrías, como un arreglo de geometrías.


```python
gdfColegios = gpd.GeoDataFrame(dfColegios, geometry=geometry)
gdfColegios.head(3)
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ID_CEN_EDU</th>
      <th>CODLOCAL</th>
      <th>CEN_EDU</th>
      <th>D_DPTO</th>
      <th>D_PROV</th>
      <th>D_DIST</th>
      <th>NLAT_IE</th>
      <th>NLONG_IE</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 4</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>-12.07358</td>
      <td>-76.99879</td>
      <td>POINT (-76.99879 -12.07358)</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 3</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>-12.07357</td>
      <td>-76.99879</td>
      <td>POINT (-76.99879 -12.07357)</td>
    </tr>
    <tr>
      <th>2</th>
      <td>3</td>
      <td>725808.0</td>
      <td>DON BOSCO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>-12.08059</td>
      <td>-77.00386</td>
      <td>POINT (-77.00386 -12.08059)</td>
    </tr>
  </tbody>
</table>

**Filtro de registros**

Dado que únicamente requerimos los datos correspondientes a las provincias de Lima y Callao, procederemos a realizar un filtro en nuestros datos para seleccionar exclusivamente esta información.


```python
# Filtrar comisarias
gdfComLima = gdfComisarias.loc[gdfComisarias.provincia.isin(['LIMA','CALLAO'])]
gdfComLima.shape
```

    (147, 9)




```python
# Filtrar colegios
gdfColLima = gdfColegios.loc[gdfColegios.D_PROV.isin(['LIMA','CALLAO'])]
gdfColLima.shape
```

    (13512, 9)

**Reproyectar**

Realizar la proyección de las capas a WGS84 Zona 18 Sur (EPSG:32718).


```python
gdfComLima = gdfComLima.to_crs(epsg=32718)
gdfColLima = gdfColLima.to_crs(epsg=32718)
```

Verificar la proyección de ambas capas:


```python
print(f'CRS Comisarias {gdfComLima.crs}')
print(f'CRS Colegios {gdfColLima.crs}')
```

    CRS Comisarias EPSG:32718
    CRS Colegios EPSG:32718
    

### **4.3. Análisis del Vecino mas cercano**

Antes de comenzar el análisis, crearemos en el GeoDataFrame de comisarías un campo de tipo `shapely Point` que almacenara la geometria. Esta información será utilizada más adelante para construir un nuevo GeoDataFrame que incluirá el segmento de línea entre los colegios y la comisaría más cercana.


```python
gdfComLima['pointCom'] = gdfComLima['geometry']
```

Utilizando la función **[sjoin_nearest](https://geopandas.org/en/stable/docs/reference/api/geopandas.sjoin_nearest.html)**  de geopandas vamos a realizar una unión espacial entre la capa de colegios y comisarías.


```python
gdfNearLine = gpd.sjoin_nearest(gdfColLima[['ID_CEN_EDU','CODLOCAL','CEN_EDU','D_DPTO','D_PROV','D_DIST', 'geometry']], 
                                gdfComLima[['id','nombre','pointCom','geometry']],
                                distance_col = 'distancia',
                                lsuffix='L',
                                rsuffix='R')

del gdfNearLine['index_R']
```

Visualizar los resultados


```python
gdfNearLine.head()
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ID_CEN_EDU</th>
      <th>CODLOCAL</th>
      <th>CEN_EDU</th>
      <th>D_DPTO</th>
      <th>D_PROV</th>
      <th>D_DIST</th>
      <th>geometry</th>
      <th>id</th>
      <th>nombre</th>
      <th>pointCom</th>
      <th>distancia</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 4</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>POINT (282432.188 8664515.986)</td>
      <td>673</td>
      <td>COMISARIA SAN LUIS</td>
      <td>POINT (282346.236 8664555.375)</td>
      <td>94.548358</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 3</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>POINT (282432.180 8664517.092)</td>
      <td>673</td>
      <td>COMISARIA SAN LUIS</td>
      <td>POINT (282346.236 8664555.375)</td>
      <td>94.085419</td>
    </tr>
    <tr>
      <th>2</th>
      <td>3</td>
      <td>725808.0</td>
      <td>DON BOSCO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>POINT (281885.791 8663736.359)</td>
      <td>673</td>
      <td>COMISARIA SAN LUIS</td>
      <td>POINT (282346.236 8664555.375)</td>
      <td>939.573068</td>
    </tr>
    <tr>
      <th>3</th>
      <td>4</td>
      <td>81077.0</td>
      <td>VILLA MARIA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>POINT (281874.943 8663730.747)</td>
      <td>673</td>
      <td>COMISARIA SAN LUIS</td>
      <td>POINT (282346.236 8664555.375)</td>
      <td>949.804747</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 1</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>POINT (282433.277 8664515.994)</td>
      <td>673</td>
      <td>COMISARIA SAN LUIS</td>
      <td>POINT (282346.236 8664555.375)</td>
      <td>95.536065</td>
    </tr>
  </tbody>
</table>

Y listo, como se observa se ha identificado cual es la comisaria mas cercana a cada Colegio.

### **4.4. Construir lineas entre vecinos mas cercanos**

A continuación, procederemos a construir un GeoDataFrame que contendrá geometrías de tipo líneas, las cuales conectarán cada colegio con la comisaría más cercana. Para llevar a cabo este proceso, utilizaremos el GeoDataFrame `gdfNearLine`, junto con los campos `geometry` y `pointCom`, empleando además la función **`LineString`** proveniente de la biblioteca **Shapely**.


```python
gdfNearLine['geometry_line'] = gdfNearLine.apply(lambda row: LineString([row['geometry'],row['pointCom']]), axis=1)
```

Para finalizar, procederemos a actualizar la geometría, indicando que la nueva forma geométrica se alojará en el campo **`geometry_line`**.


```python
gdfNearLine.set_geometry('geometry_line', crs='EPSG:32718', inplace=True)
```

Visualizamos los atributos:


```python
gdfNearLine.head(3)
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ID_CEN_EDU</th>
      <th>CODLOCAL</th>
      <th>CEN_EDU</th>
      <th>D_DPTO</th>
      <th>D_PROV</th>
      <th>D_DIST</th>
      <th>geometry</th>
      <th>id</th>
      <th>nombre</th>
      <th>pointCom</th>
      <th>distancia</th>
      <th>geometry_line</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 4</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>POINT (282432.188 8664515.986)</td>
      <td>673</td>
      <td>COMISARIA SAN LUIS</td>
      <td>POINT (282346.236 8664555.375)</td>
      <td>94.548358</td>
      <td>LINESTRING (282432.188 8664515.986, 282346.236...</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2</td>
      <td>NaN</td>
      <td>MIS PRIMEROS PASOS 3</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>POINT (282432.180 8664517.092)</td>
      <td>673</td>
      <td>COMISARIA SAN LUIS</td>
      <td>POINT (282346.236 8664555.375)</td>
      <td>94.085419</td>
      <td>LINESTRING (282432.180 8664517.092, 282346.236...</td>
    </tr>
    <tr>
      <th>2</th>
      <td>3</td>
      <td>725808.0</td>
      <td>DON BOSCO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>SAN LUIS</td>
      <td>POINT (281885.791 8663736.359)</td>
      <td>673</td>
      <td>COMISARIA SAN LUIS</td>
      <td>POINT (282346.236 8664555.375)</td>
      <td>939.573068</td>
      <td>LINESTRING (281885.791 8663736.359, 282346.236...</td>
    </tr>
  </tbody>
</table>

## **5. Resultados**

A continuación, procederemos a calcular las distancias mínimas, máximas y medias desde los colegios hasta las comisarías más cercanas, centrándonos en esta evaluación a nivel de distrito. Este proceso brindará una perspectiva completa de la proximidad entre los centros educativos y las comisarías en cada municipio.

```python
# Agrupando y calculando valores max, min y promedio por distrito
gdfRep = gdfNearLine.groupby(['D_DIST','D_PROV','D_DPTO'])\
                    .agg({'distancia':[min,max,'mean']})\
                    .reset_index()

# Renombrar columnas:
gdfRep.columns = list(map('_'.join, gdfRep.columns.values))

# Ordenar columnas por el promedio de mayor a menos
gdfRep.sort_values(by='distancia_mean', ascending=False)
```


<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>D_DIST_</th>
      <th>D_PROV_</th>
      <th>D_DPTO_</th>
      <th>distancia_min</th>
      <th>distancia_max</th>
      <th>distancia_mean</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>10</th>
      <td>CIENEGUILLA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>117.366793</td>
      <td>8676.712484</td>
      <td>3161.313802</td>
    </tr>
    <tr>
      <th>31</th>
      <td>PUNTA HERMOSA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>320.461551</td>
      <td>7858.173749</td>
      <td>2843.794036</td>
    </tr>
    <tr>
      <th>27</th>
      <td>PACHACAMAC</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>29.057960</td>
      <td>6175.552735</td>
      <td>2202.402319</td>
    </tr>
    <tr>
      <th>6</th>
      <td>CARABAYLLO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>40.589519</td>
      <td>13888.839552</td>
      <td>2191.761812</td>
    </tr>
    <tr>
      <th>0</th>
      <td>ANCON</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>70.295993</td>
      <td>5821.136951</td>
      <td>2185.783353</td>
    </tr>
    <tr>
      <th>22</th>
      <td>LURIGANCHO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>60.603013</td>
      <td>5339.737847</td>
      <td>2006.764929</td>
    </tr>
    <tr>
      <th>8</th>
      <td>CHACLACAYO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>173.691354</td>
      <td>3876.169925</td>
      <td>2006.640734</td>
    </tr>
    <tr>
      <th>30</th>
      <td>PUENTE PIEDRA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>34.921697</td>
      <td>3853.402583</td>
      <td>1607.572113</td>
    </tr>
    <tr>
      <th>28</th>
      <td>PUCUSANA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>45.730198</td>
      <td>5355.865346</td>
      <td>1515.710822</td>
    </tr>
    <tr>
      <th>23</th>
      <td>LURIN</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>35.350361</td>
      <td>3405.771448</td>
      <td>1447.249279</td>
    </tr>
    <tr>
      <th>42</th>
      <td>SANTA ANITA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>123.158758</td>
      <td>2694.586296</td>
      <td>1433.699060</td>
    </tr>
    <tr>
      <th>1</th>
      <td>ATE</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>61.007035</td>
      <td>3451.549129</td>
      <td>1413.594102</td>
    </tr>
    <tr>
      <th>44</th>
      <td>SANTA ROSA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>216.687329</td>
      <td>2680.669667</td>
      <td>1404.592211</td>
    </tr>
    <tr>
      <th>15</th>
      <td>LA MOLINA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>73.214244</td>
      <td>3474.315708</td>
      <td>1368.214911</td>
    </tr>
    <tr>
      <th>47</th>
      <td>VENTANILLA</td>
      <td>CALLAO</td>
      <td>CALLAO</td>
      <td>39.020620</td>
      <td>4332.454726</td>
      <td>1313.059530</td>
    </tr>
    <tr>
      <th>40</th>
      <td>SAN MARTIN DE PORRES</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>42.482474</td>
      <td>2818.852601</td>
      <td>1304.610535</td>
    </tr>
    <tr>
      <th>37</th>
      <td>SAN JUAN DE LURIGANCHO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>17.155415</td>
      <td>6533.723766</td>
      <td>1245.427195</td>
    </tr>
    <tr>
      <th>45</th>
      <td>SANTIAGO DE SURCO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>88.043110</td>
      <td>2538.013484</td>
      <td>1219.213171</td>
    </tr>
    <tr>
      <th>48</th>
      <td>VILLA EL SALVADOR</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>55.864896</td>
      <td>4169.772956</td>
      <td>1215.908043</td>
    </tr>
    <tr>
      <th>21</th>
      <td>LOS OLIVOS</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>104.900547</td>
      <td>2082.970065</td>
      <td>1066.371867</td>
    </tr>
    <tr>
      <th>11</th>
      <td>COMAS</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>48.312575</td>
      <td>3588.279805</td>
      <td>1057.939226</td>
    </tr>
    <tr>
      <th>35</th>
      <td>SAN BORJA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>139.643640</td>
      <td>1808.758728</td>
      <td>1049.138884</td>
    </tr>
    <tr>
      <th>49</th>
      <td>VILLA MARIA DEL TRIUNFO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>33.944147</td>
      <td>4416.013268</td>
      <td>1045.592847</td>
    </tr>
    <tr>
      <th>32</th>
      <td>PUNTA NEGRA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>117.776176</td>
      <td>1970.956977</td>
      <td>1035.884954</td>
    </tr>
    <tr>
      <th>26</th>
      <td>MIRAFLORES</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>52.606835</td>
      <td>1733.577565</td>
      <td>954.324952</td>
    </tr>
    <tr>
      <th>9</th>
      <td>CHORRILLOS</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>17.971549</td>
      <td>3160.433960</td>
      <td>928.654332</td>
    </tr>
    <tr>
      <th>20</th>
      <td>LINCE</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>49.527211</td>
      <td>1817.062502</td>
      <td>925.208767</td>
    </tr>
    <tr>
      <th>16</th>
      <td>LA PERLA</td>
      <td>CALLAO</td>
      <td>CALLAO</td>
      <td>101.338900</td>
      <td>1733.845383</td>
      <td>910.756965</td>
    </tr>
    <tr>
      <th>14</th>
      <td>JESUS MARIA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>78.269306</td>
      <td>1807.769665</td>
      <td>889.530133</td>
    </tr>
    <tr>
      <th>36</th>
      <td>SAN ISIDRO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>22.248129</td>
      <td>1938.422099</td>
      <td>887.520649</td>
    </tr>
    <tr>
      <th>4</th>
      <td>BREÃ‘A</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>83.640317</td>
      <td>1537.233569</td>
      <td>867.547766</td>
    </tr>
    <tr>
      <th>41</th>
      <td>SAN MIGUEL</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>84.704777</td>
      <td>1988.385306</td>
      <td>867.344240</td>
    </tr>
    <tr>
      <th>46</th>
      <td>SURQUILLO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>115.677214</td>
      <td>1630.276900</td>
      <td>788.575860</td>
    </tr>
    <tr>
      <th>24</th>
      <td>MAGDALENA DEL MAR</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>74.259364</td>
      <td>1531.736475</td>
      <td>781.884195</td>
    </tr>
    <tr>
      <th>5</th>
      <td>CALLAO</td>
      <td>CALLAO</td>
      <td>CALLAO</td>
      <td>35.925819</td>
      <td>2619.187293</td>
      <td>777.363283</td>
    </tr>
    <tr>
      <th>38</th>
      <td>SAN JUAN DE MIRAFLORES</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>47.482438</td>
      <td>1761.049072</td>
      <td>763.590117</td>
    </tr>
    <tr>
      <th>2</th>
      <td>BARRANCO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>44.006493</td>
      <td>1524.625104</td>
      <td>721.651672</td>
    </tr>
    <tr>
      <th>29</th>
      <td>PUEBLO LIBRE</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>150.683525</td>
      <td>1430.387990</td>
      <td>713.818785</td>
    </tr>
    <tr>
      <th>43</th>
      <td>SANTA MARIA DEL MAR</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>695.624357</td>
      <td>695.624357</td>
      <td>695.624357</td>
    </tr>
    <tr>
      <th>17</th>
      <td>LA PUNTA</td>
      <td>CALLAO</td>
      <td>CALLAO</td>
      <td>57.539831</td>
      <td>938.580213</td>
      <td>688.352822</td>
    </tr>
    <tr>
      <th>12</th>
      <td>EL AGUSTINO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>25.847289</td>
      <td>2708.355572</td>
      <td>680.288292</td>
    </tr>
    <tr>
      <th>18</th>
      <td>LA VICTORIA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>60.563453</td>
      <td>1626.806821</td>
      <td>634.836408</td>
    </tr>
    <tr>
      <th>13</th>
      <td>INDEPENDENCIA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>14.016363</td>
      <td>1463.898899</td>
      <td>631.294847</td>
    </tr>
    <tr>
      <th>3</th>
      <td>BELLAVISTA</td>
      <td>CALLAO</td>
      <td>CALLAO</td>
      <td>92.247429</td>
      <td>1146.973587</td>
      <td>618.943144</td>
    </tr>
    <tr>
      <th>25</th>
      <td>MI PERU</td>
      <td>CALLAO</td>
      <td>CALLAO</td>
      <td>53.864330</td>
      <td>1518.278837</td>
      <td>568.336313</td>
    </tr>
    <tr>
      <th>19</th>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>21.275022</td>
      <td>1341.012719</td>
      <td>544.419735</td>
    </tr>
    <tr>
      <th>33</th>
      <td>RIMAC</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>14.458640</td>
      <td>1089.326223</td>
      <td>496.832686</td>
    </tr>
    <tr>
      <th>39</th>
      <td>SAN LUIS</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>50.321527</td>
      <td>1161.884477</td>
      <td>492.139108</td>
    </tr>
    <tr>
      <th>7</th>
      <td>CARMEN DE LA LEGUA REYNOSO</td>
      <td>CALLAO</td>
      <td>CALLAO</td>
      <td>115.309761</td>
      <td>805.793095</td>
      <td>451.253748</td>
    </tr>
    <tr>
      <th>34</th>
      <td>SAN BARTOLO</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>44.196745</td>
      <td>1146.194374</td>
      <td>367.390113</td>
    </tr>
  </tbody>
</table>

Como se observa, en un conjunto de 25 municipios, la distancia promedio entre un colegio y la comisaría supera el kilómetro, y en 9 de ellos, dicha distancia promedio excede los 1.5 kilómetros. Con el propósito de identificar posibles patrones, examinemos gráficamente esta situación:


```python
# Trazando las distancia, colegios y comisarias
fig, ax = plt.subplots(figsize=(20,20))

gdfNearLine.plot(ax=ax
                 , column='distancia'
                 , cmap='Wistia'
                 , scheme='natural_breaks'
                 , k=5
                 , alpha= 0.8
                 , lw=0.35
                )

gdfColLima.plot(ax=ax
                , color='gray'
                , markersize=0.5
                , alpha=0.7
               )

gdfComLima.plot(ax=ax
                , markersize=10
                , color='blue'
                , marker='s'
                , alpha=0.9
                )

# Agregar basemap
cx.add_basemap(ax
               , crs=gdfNearLine.crs.to_string()
               , source=cx.providers.CartoDB.DarkMatterNoLabels  
               )

plt.show()
```
    
![png](img/output_41_0.png)
  
Como se observa en el gráfico, las zonas periféricas tienden a presentar distancias promedio superiores al kilómetro entre colegios y comisarías. Este patrón resalta la importancia de idear estrategias específicas para mejorar la accesibilidad y la seguridad en estas áreas.

No obstante, para validar de manera más sólida esta suposición, se sugiere llevar a cabo estudios más detallados en estas zonas, abordando aspectos como el nivel delictivo y la peligrosidad. La inclusión de análisis más específicos permitirá llegar a conclusiones más certeras y respaldará de manera más completa las recomendaciones destinadas a optimizar la respuesta ante situaciones de emergencia y promover un entorno más seguro para la comunidad educativa en las zonas periféricas.

* **Elaborado por:** Charlie Lopez Rengifo
* **LinkedIN:** [chlopezgis](https://www.linkedin.com/in/chlopezgis/)
* **email:** chlopezgis@gmail.com
