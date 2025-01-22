# Mortalidad por COVID-19 en el Perú


## 1. Objetivos

* Determinar las tasa de mortalidad del COVID-19 a nivel distrial.
* Elaborar un mapa de Mortalidad por COVID-19.

## 2. Fuente de datos

Para la elaboración del proyecto utilizaremos la siguiente información:

1. Población al 2021 - INEI
2. Fallecidos por COVID-19 - MINSA
3. Capa vectorial de Distritos del Perú - INEI

Los dos primeros conjuntos de datos se descargan de forma directa desde la página de [Datos Abiertos](https://www.datosabiertos.gob.pe/dataset/poblaci%C3%B3n-peru) del Perú. 

La capa de **distritos** se obtiene a partir del servicio **WFS** que se encuentra publicado en la página de [Infraestructura de Datos Espaciales del Perú (IDEP)](https://geoidep.gob.pe/servicios-idep/servicios-de-publicacion-de-objetos-wfs) y cuya fuente oficial es el INEI

## 3. Desarrollo

### 3.1. Importar librerías

Como primer paso vamos a importar las librerias que utilizaremos para el desarrollo del proyecto


```python
# Importar librerias
import pandas as pd
import geopandas as gpd
import requests
import json
from owslib.wfs import WebFeatureService
import matplotlib.pyplot as plt
import numpy as np
```

### 3.2. Lectura de los datos

Todos los datos descargados seran convertidos en DataFrame. Comenzaremos con los archivos de descarga directa (se descargan en formato csv)

* Agregar encabezados de página para evitar rechazos a las solicitudes:


```python
# encabezados
hdr = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) ' +
       'AppleWebKit/537.36 (KHTML, like Gecko) ' +
       'Chrome/50.0.2661.102 Safari/537.36'}
hdr
```

#### 3.2.1. Obtener población

Realizar los siguientes pasos:
* Tener la URL de descarga
* Realizar la solicitud a la URL
* Descargar los datos localmente (en la PC) y almacenar el contenido en una variable
* Convertir el contenido de la descarga en un DataFrame


```python
# URL Poblacion: Data en formato CSV de descarga directa
url_pob = 'https://cloud.minsa.gob.pe/s/Jwck8Z59snYAK8S/download'

# Realizar solicitud
response_pob = requests.get(url_pob, headers = hdr)

# Descargar datos
file_pob = './poblacion.csv' # para almacenar el contenido
open(file_pob, 'wb').write(response_pob.content)

# Convertir a DataFrame
df_pob = pd.read_csv(file_pob, encoding='UTF-8', dtype={'ubigeo_inei':str})
df_pob.sample(3)
```


<table class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ubigeo_reniec</th>
      <th>ubigeo_inei</th>
      <th>Departamento</th>
      <th>Provincia</th>
      <th>Distrito</th>
      <th>Edad_Anio</th>
      <th>Sexo</th>
      <th>Cantidad</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>103773</th>
      <td>21205</td>
      <td>021707</td>
      <td>ANCASH</td>
      <td>RECUAY</td>
      <td>PAMPAS CHICO</td>
      <td>65-69</td>
      <td>F</td>
      <td>32</td>
    </tr>
    <tr>
      <th>108868</th>
      <td>10408</td>
      <td>010508</td>
      <td>AMAZONAS</td>
      <td>LUYA</td>
      <td>LONYA CHICO</td>
      <td>8</td>
      <td>F</td>
      <td>9</td>
    </tr>
    <tr>
      <th>15161</th>
      <td>110211</td>
      <td>120211</td>
      <td>JUNIN</td>
      <td>CONCEPCION</td>
      <td>MITO</td>
      <td>4</td>
      <td>F</td>
      <td>7</td>
    </tr>
  </tbody>
</table>



```python
# dimension (filas y columnas):
df_pob.shape
```
(123684, 8)



#### 3.2.2. Obtener fallecimientos por COVID-19

Repetir los pasos del puntos 3.2.1

```python
# Covid: Data en formato CSV de descarga directa
url_cov = 'https://files.minsa.gob.pe/s/t9AFqRbXw3F55Ho/download'

# Realizar solicitud
response_cov = requests.get(url_cov, headers = hdr)

# Descargar datos
file_cov = './covid.csv'  # para almacenar el contenido
open(file_cov, 'wb').write(response_cov.content)

# Convertir a DataFrame
df_cov = pd.read_csv(file_cov, sep=';', encoding='UTF-8', dtype={'UBIGEO':str})
df_cov.sample(3)
```

<table class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>FECHA_CORTE</th>
      <th>FECHA_FALLECIMIENTO</th>
      <th>EDAD_DECLARADA</th>
      <th>SEXO</th>
      <th>CLASIFICACION_DEF</th>
      <th>DEPARTAMENTO</th>
      <th>PROVINCIA</th>
      <th>DISTRITO</th>
      <th>UBIGEO</th>
      <th>UUID</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>191202</th>
      <td>20220916</td>
      <td>20200516</td>
      <td>72</td>
      <td>MASCULINO</td>
      <td>Criterio SINADEF</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>CARABAYLLO</td>
      <td>150106</td>
      <td>36920637.0</td>
    </tr>
    <tr>
      <th>190903</th>
      <td>20220916</td>
      <td>20200429</td>
      <td>82</td>
      <td>FEMENINO</td>
      <td>Criterio SINADEF</td>
      <td>LORETO</td>
      <td>MAYNAS</td>
      <td>PUNCHANA</td>
      <td>160108</td>
      <td>36920121.0</td>
    </tr>
    <tr>
      <th>5274</th>
      <td>20220916</td>
      <td>20210419</td>
      <td>51</td>
      <td>MASCULINO</td>
      <td>Criterio virolÃ³gico</td>
      <td>LIMA</td>
      <td>LIMA</td>
      <td>COMAS</td>
      <td>150110</td>
      <td>15717610.0</td>
    </tr>
  </tbody>
</table>



```python
# dimension (filas y columnas):
df_cov.shape
```
(216287, 10)



#### 3.2.3. Obtener capa de Distrito

Esta capa se obtendra a partir del servicio WFS publicado en el IDEP:
* Tener la URL del servicio WFS
* Inicializar el WFS
* Obtener la última capa disponible
* Realizar la solicitud al WFS (con los parámetros solicitados por el servicio)
* Convertir la respuesta del servicio en un GeoDataFrame


>Nota: Para obtener los metadatos del servicio podemos realizar la siguiente petición **GetCapabilities**
https://maps.inei.gob.pe/geoserver/T10Limites/ig_distrito/ows?service=wfs&version=2.0.0&request=GetCapabilities



```python
# URL del servicio WFS
url_dis = 'https://maps.inei.gob.pe/geoserver/T10Limites/ig_distrito/ows'

# Inicializar WFS
wfs_dis = WebFeatureService(url_dis)

# Obtener la ultima capa disponible
layer_dis = list(wfs_dis.contents)[-1]

# Completar los parámetros de solicitud del servicio
params = {'service':'WFS',
          'version':'2.0.0', 
          'request':'GetFeature',
          'typeName':layer_dis,
          'outputFormat':'json'}

# Realizar solicitud al servicio WFS (Retornará un JSON)
response_dis = requests.Request('GET', url_dis, params=params).prepare().url

# Convertir JSON a GeodataFrame
gdf_dis = gpd.read_file(response_dis)
gdf_dis.sample(3)
```

<table class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>id</th>
      <th>capital</th>
      <th>nombdep</th>
      <th>nombprov</th>
      <th>nombdist</th>
      <th>ubigeo</th>
      <th>tematica</th>
      <th>ccdd</th>
      <th>ccpp</th>
      <th>idprov</th>
      <th>fuente</th>
      <th>ccdi</th>
      <th>id_geografia</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>16</th>
      <td>ig_distrito.42</td>
      <td>Locumba</td>
      <td>Tacna</td>
      <td>Jorge Basadre</td>
      <td>Locumba</td>
      <td>230301</td>
      <td>T10</td>
      <td>23</td>
      <td>03</td>
      <td>2303</td>
      <td>INEI - CPV2017 RESULTADOS</td>
      <td>01</td>
      <td>4230301</td>
      <td>MULTIPOLYGON (((-70.50890 -17.54534, -70.50938...</td>
    </tr>
    <tr>
      <th>1680</th>
      <td>ig_distrito.1392</td>
      <td>Ongon</td>
      <td>La Libertad</td>
      <td>Pataz</td>
      <td>Ongon</td>
      <td>130807</td>
      <td>T10</td>
      <td>13</td>
      <td>08</td>
      <td>1308</td>
      <td>INEI - CPV2017 RESULTADOS</td>
      <td>07</td>
      <td>4130807</td>
      <td>MULTIPOLYGON (((-77.06870 -8.03951, -77.07034 ...</td>
    </tr>
    <tr>
      <th>473</th>
      <td>ig_distrito.1584</td>
      <td>Colasay</td>
      <td>Cajamarca</td>
      <td>Jaén</td>
      <td>Colasay</td>
      <td>060804</td>
      <td>T10</td>
      <td>06</td>
      <td>08</td>
      <td>0608</td>
      <td>INEI - CPV2017 RESULTADOS</td>
      <td>04</td>
      <td>4060804</td>
      <td>MULTIPOLYGON (((-78.97052 -5.69681, -78.97434 ...</td>
    </tr>
  </tbody>
</table>


```python
# Plotear distritos
gdf_dis.plot()
```
    
![png](img/output_14_1.png)

### 3.3. Resumir datos a nivel de distrito (ubigeo)

Ahora es necesario a resumir toda la información obtenida a nivel de distrito para realizar las estadisticas y el mapa solicitado. Utilizaremos el campo de código de UBIGEO (en formato INEI) como identificador del distrito.

* Poblacion total por Ubigeo


```python
df_pob_ubigeo = pd.DataFrame(df_pob.groupby(['ubigeo_inei'])['Cantidad'].sum())
df_pob_ubigeo.rename(columns={'Cantidad':'poblacion'}, inplace = True)
df_pob_ubigeo.head(3)
```

<table class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>poblacion</th>
    </tr>
    <tr>
      <th>ubigeo_inei</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>010101</th>
      <td>29041</td>
    </tr>
    <tr>
      <th>010102</th>
      <td>291</td>
    </tr>
    <tr>
      <th>010103</th>
      <td>1639</td>
    </tr>
  </tbody>
</table>



* Total de fallecidos por COVID-19 por Ubigeo 


```python
df_cov_ubigeo = pd.DataFrame(df_cov.groupby(['UBIGEO']).size())
df_cov_ubigeo.rename(columns={0:'fallecidos'}, inplace = True)
df_cov_ubigeo.drop(index='.', inplace = True)
df_cov_ubigeo.head(3)
```




<table class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>fallecidos</th>
    </tr>
    <tr>
      <th>UBIGEO</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>010101</th>
      <td>208</td>
    </tr>
    <tr>
      <th>010103</th>
      <td>3</td>
    </tr>
    <tr>
      <th>010105</th>
      <td>2</td>
    </tr>
  </tbody>
</table>



### 3.4. Unir reportes a la capa de Distrito

Realizar la únion utilizando el campo **ubigeo** como identificador para todas las bases.

Para realizar el **join** es necesario considerar que para la capa de **distritos** el ubigeo es un campo y para la población y fallecidos por covid es el índice del marco de datos. 


```python
# Join 1: distrito y poblacion total
gdf_dis = gdf_dis.merge(df_pob_ubigeo, how='left',left_on='ubigeo', right_index=True)

# Join 2: Join 1 y fallecidos por covid
gdf_dis = gdf_dis.merge(df_cov_ubigeo, how='left',left_on='ubigeo', right_index=True)

gdf_dis[['ubigeo','poblacion','fallecidos','geometry']].sample(5)
```


<table class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ubigeo</th>
      <th>poblacion</th>
      <th>fallecidos</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>83</th>
      <td>040304</td>
      <td>1073</td>
      <td>3.0</td>
      <td>MULTIPOLYGON (((-74.19374 -15.49166, -74.19450...</td>
    </tr>
    <tr>
      <th>261</th>
      <td>030303</td>
      <td>1599</td>
      <td>4.0</td>
      <td>MULTIPOLYGON (((-72.63622 -14.35623, -72.63747...</td>
    </tr>
    <tr>
      <th>100</th>
      <td>100510</td>
      <td>3578</td>
      <td>4.0</td>
      <td>MULTIPOLYGON (((-76.83681 -9.26348, -76.83824 ...</td>
    </tr>
    <tr>
      <th>857</th>
      <td>200702</td>
      <td>7274</td>
      <td>75.0</td>
      <td>MULTIPOLYGON (((-80.90893 -4.22452, -80.91014 ...</td>
    </tr>
    <tr>
      <th>602</th>
      <td>050114</td>
      <td>17439</td>
      <td>15.0</td>
      <td>MULTIPOLYGON (((-74.38568 -13.15052, -74.38648...</td>
    </tr>
  </tbody>
</table>



### 3.5. Calcular tasa de mortalidad por COVID

Para realizar el cálculo de la tasa de mortalidad utilizaremos la siguiente formula

> **Tasa de mortalidad = (N° de Fallecidos $\div$ Población Media) $\times$ 1000**


```python
gdf_dis['tasa_mortalidad'] = (gdf_dis.fallecidos/gdf_dis.poblacion)*1000
gdf_dis[['ubigeo','nombdist','nombprov','nombdep','tasa_mortalidad']].sample(5)
```


<table class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ubigeo</th>
      <th>nombdist</th>
      <th>nombprov</th>
      <th>nombdep</th>
      <th>tasa_mortalidad</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1657</th>
      <td>060502</td>
      <td>Chilete</td>
      <td>Contumazá</td>
      <td>Cajamarca</td>
      <td>9.259259</td>
    </tr>
    <tr>
      <th>1701</th>
      <td>021705</td>
      <td>Llacllín</td>
      <td>Recuay</td>
      <td>Ancash</td>
      <td>2.717391</td>
    </tr>
    <tr>
      <th>328</th>
      <td>100401</td>
      <td>Huacaybamba</td>
      <td>Huacaybamba</td>
      <td>Huánuco</td>
      <td>2.552048</td>
    </tr>
    <tr>
      <th>923</th>
      <td>040806</td>
      <td>Puyca</td>
      <td>La Unión</td>
      <td>Arequipa</td>
      <td>3.385240</td>
    </tr>
    <tr>
      <th>43</th>
      <td>210403</td>
      <td>Huacullani</td>
      <td>Chucuito</td>
      <td>Puno</td>
      <td>0.165968</td>
    </tr>
  </tbody>
</table>


## 4. Resultados

Para visualizar los resultados utilizaremos un Histograma y un mapa graduado de la tasa de Mortalidad


```python
# Determinar el número de clases
k = int(np.round(1 + 3.322*np.log(len(gdf_dis)),0))

# Tasa de mortalidad a nivel nacional:
tasa_mortalidad_nacional = (gdf_dis.fallecidos.sum()/gdf_dis.poblacion.sum())*1000

# Graficar Histograma
fig, ax = plt.subplots(1, figsize=(12,5))
ax.hist(gdf_dis.tasa_mortalidad, bins=k, color='Yellow', alpha=0.5, edgecolor='Black') # Histograma
ax.axvline(x = tasa_mortalidad_nacional, color='r', lw=2, ls='--') # tasa de mortalidad a nivel nacional
ax.set_ylabel('N° de distritos')
ax.set_xlabel('Tasa de Mortalidad\n(por cada 1,000 hab)')
fig.tight_layout()
plt.show()
```


    
![png](img/output_25_0.png)
    



```python
# Reclasificación de Tasa de Mortalidad
dic_reclass = {0:'1. Muy Bajo (0 - 2)',
               2:'2. Bajo (2 - 5)',
               5:'3. Medio (5 - 10)',
               10:'4. Alto (10 - 15)',
               15:'5. Muy Alto (15 a mas)'}

for key in dic_reclass:
    gdf_dis.loc[gdf_dis.tasa_mortalidad >= key, 'tasa_reclass'] = dic_reclass[key]

# Tamaño de la figura del mapa
fig_map, ax_map = plt.subplots(figsize=(20, 20))
 
# Título y los ejes
ax_map.set_title('Mortalidad por COVID - 19 En el Perú', pad = 10, fontdict={'fontsize':20, 'color': 'r'})
ax_map.set_xlabel('Longitud')
ax_map.set_ylabel('Latitud')
 
# Mostrar Mapa
gdf_dis.plot(column='tasa_reclass', cmap='Reds', ax=ax_map, zorder=10,
            legend=True)

plt.show()
```


    
![png](img/output_26_0.png)
    


### Descargo de Responsabilidad:

Toda la información y enlaces de este sitio web provienen de fuentes públicas Oficiales del Estado del Perú. El autor NO acepta ninguna responsabilidad por las posibles consecuencias, intencionadas o no, de las acciones realizadas mediante el uso de los materiales expuestos.

Las metodologías y resultados presentados en este tutorial tienen un fin netamente didactico, de ninguna manera pretende reemplazar las metodologías y estadísticas oficiales presentandas por el Estado Peruano. El autor NO se hace responsable del uso y aplicación de los resutaldos presentandos en este tutorial.

### Referencias

https://www.gob.pe/idep

https://www.datosabiertos.gob.pe/

### Contacto

* Autor: @Charlie Lopez Rengifo

* Email: chlopezgis@gmail.com

* Telefono: +51900502734

