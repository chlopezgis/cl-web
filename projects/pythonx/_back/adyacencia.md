# **ANÁLISIS DE ADYACENCIA Y MATRIZ DE DISTANCIAS**

El análisis de adyacencia y la matriz de distancias son conceptos que se utilizan para examinar la conectividad espacial y calcular las distancias entre distintas ubicaciones.

**Ejemplo Práctico:**

Con el fin de ilustrar estos conceptos en la práctica, se trabajará con un conjunto de datos espaciales que representa municipios. En este escenario, se llevará a cabo un análisis de adyacencia entre los polígonos para comprender qué áreas comparten límites geográficos.

Comenzaremos importando las librería a utilizar:


```python
import pandas as pd
import geopandas as gpd
import os
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
import contextily as cx
plt.style.use('ggplot')
```

## **Lectura de datos**

A continuación, procederemos a la lectura de la capa de DISTRITOS que representa los límites municipales.


```python
# Ruta del shapefile
path = r'D:\Charlie\01_Cartografia\LIMITES\DISTRITOS.zip'

# Lectura del shapefile como GeoDataFrae
gdf = gpd.read_file(path, encoding='UTF-8')
gdf.shape
```




    (1873, 9)



El análisis se realizará sobre los distritos que conforman el área urbana de Lima Metropolitana


```python
# Filtraremos solo los distritos de Lima Metropolitana
gdf = gdf[gdf.PROVINCIA.isin(['LIMA','CALLAO'])]
gdf.shape
```




    (50, 9)




```python
# Visualizando atributos
gdf.head(3)
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>IDDPTO</th>
      <th>DEPARTAMEN</th>
      <th>IDPROV</th>
      <th>PROVINCIA</th>
      <th>IDDIST</th>
      <th>DISTRITO</th>
      <th>CAPITAL</th>
      <th>CODCCPP</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>378</th>
      <td>15</td>
      <td>LIMA</td>
      <td>1501</td>
      <td>LIMA</td>
      <td>150119</td>
      <td>LURIN</td>
      <td>LURIN</td>
      <td>0001</td>
      <td>POLYGON ((-76.70549 -12.17672, -76.70429 -12.1...</td>
    </tr>
    <tr>
      <th>426</th>
      <td>15</td>
      <td>LIMA</td>
      <td>1501</td>
      <td>LIMA</td>
      <td>150102</td>
      <td>ANCON</td>
      <td>ANCON</td>
      <td>0001</td>
      <td>POLYGON ((-77.06517 -11.57512, -77.06505 -11.5...</td>
    </tr>
    <tr>
      <th>544</th>
      <td>15</td>
      <td>LIMA</td>
      <td>1501</td>
      <td>LIMA</td>
      <td>150131</td>
      <td>SAN ISIDRO</td>
      <td>SAN ISIDRO</td>
      <td>0001</td>
      <td>POLYGON ((-77.04859 -12.08504, -77.04762 -12.0...</td>
    </tr>
  </tbody>
</table>
</div>




```python
# Seleccionando columnas
gdf = gdf[['IDDIST','DISTRITO', 'PROVINCIA', 'DEPARTAMEN','geometry']]
gdf.columns.values
```




    array(['IDDIST', 'DISTRITO', 'PROVINCIA', 'DEPARTAMEN', 'geometry'],
          dtype=object)




```python
# Visualizando
gdf.plot(figsize=(5,5),
         edgecolor='white',
         linewidth = 0.3,
         color='gray',
         alpha=0.7);
```


    
![png](img/output_8_0.png)
    


## **Pre-procesamiento de los datos**

Dado que llevaremos a cabo el cálculo de distancias entre los centroides de cada municipio, será necesario ajustar la capa a un Sistema de Referencia Cartesiano acorde con la región (UTM Zone 18 Sur). En este sentido, procederemos a realizar la reproyección de nuestra capa:


```python
gdf.to_crs(crs='epsg:32718', inplace=True)
```

Calcular el centroide de los polígonos nos posibilitará posteriormente determinar las distancias entre los centroides de polígonos adyacentes.


```python
gdf['centroide'] = gdf.centroid
```

## **Análisis de Adyacencia**

En el análisis de adyacencia, se aplicará el **método de la reina**, el cual se fundamenta en la premisa de que dos áreas geográficas son consideradas adyacentes si comparten un límite común. Este método encuentra similitudes con el movimiento de la reina en un tablero de ajedrez, ya que permite el desplazamiento libre en todas las direcciones.

En esta tarea, se llevará a cabo una **unión espacial** entre los polígonos de la misma capa (GeoDataFrame). Para ejecutar este geoproceso, se empleará la relación de **intersección**.


```python
# Columnas a utilizar en el análisis:
cols = ['IDDIST', 'centroide', 'geometry']

# Identificando poligonos adyacentes
dfNhb = gdf[cols].sjoin(gdf[cols],
                        how='inner',
                        predicate='intersects',
                        lsuffix='',
                        rsuffix='NHB')

# Renombrando columnas
dfNhb.rename(columns = {'IDDIST_':'IDDIST'}, inplace=True)
```

Excluiremos las intersecciones entre polígonos que comparten límites consigo mismos, empleando el identificador único de la capa (`IDDIST`).


```python
dfNhb = dfNhb[dfNhb['IDDIST'] != dfNhb['IDDIST_NHB']]
```

## **Cálculo de distancias** 

En el cálculo de distancias, emplearemos el centroide como punto representativo. Este centroide fue calculado y se asignó a cada polígono durante el proceso de unión espacial.


```python
dfNhb.head(3)
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>IDDIST</th>
      <th>centroide_</th>
      <th>geometry</th>
      <th>index_NHB</th>
      <th>IDDIST_NHB</th>
      <th>centroide_NHB</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>378</th>
      <td>150119</td>
      <td>POINT (304074.482 8646888.829)</td>
      <td>POLYGON ((314438.677 8653321.821, 314570.020 8...</td>
      <td>1140</td>
      <td>150126</td>
      <td>POINT (310337.384 8643056.726)</td>
    </tr>
    <tr>
      <th>1112</th>
      <td>150127</td>
      <td>POINT (314097.482 8639278.649)</td>
      <td>POLYGON ((321506.084 8649266.932, 321591.251 8...</td>
      <td>1140</td>
      <td>150126</td>
      <td>POINT (310337.384 8643056.726)</td>
    </tr>
    <tr>
      <th>1219</th>
      <td>150123</td>
      <td>POINT (303092.826 8655099.198)</td>
      <td>POLYGON ((295220.133 8664758.930, 297417.010 8...</td>
      <td>1140</td>
      <td>150126</td>
      <td>POINT (310337.384 8643056.726)</td>
    </tr>
  </tbody>
</table>
</div>



Como se evidencia en el "GeoDataFrame", se emplearán los campos **`centroide_`**, que representa el centroide del municipio, y **`centroide_NHB`**, que representa el centroide del municipio adyacente.


```python
# Cálculo de distancia
dfNhb['distancia'] = dfNhb.centroide_.distance(dfNhb.centroide_NHB).round(2).astype(str)

# Visualizar el resultado
dfNhb.head(3)
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>IDDIST</th>
      <th>centroide_</th>
      <th>geometry</th>
      <th>index_NHB</th>
      <th>IDDIST_NHB</th>
      <th>centroide_NHB</th>
      <th>distancia</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>378</th>
      <td>150119</td>
      <td>POINT (304074.482 8646888.829)</td>
      <td>POLYGON ((314438.677 8653321.821, 314570.020 8...</td>
      <td>1140</td>
      <td>150126</td>
      <td>POINT (310337.384 8643056.726)</td>
      <td>7342.27</td>
    </tr>
    <tr>
      <th>1112</th>
      <td>150127</td>
      <td>POINT (314097.482 8639278.649)</td>
      <td>POLYGON ((321506.084 8649266.932, 321591.251 8...</td>
      <td>1140</td>
      <td>150126</td>
      <td>POINT (310337.384 8643056.726)</td>
      <td>5330.31</td>
    </tr>
    <tr>
      <th>1219</th>
      <td>150123</td>
      <td>POINT (303092.826 8655099.198)</td>
      <td>POLYGON ((295220.133 8664758.930, 297417.010 8...</td>
      <td>1140</td>
      <td>150126</td>
      <td>POINT (310337.384 8643056.726)</td>
      <td>14053.64</td>
    </tr>
  </tbody>
</table>
</div>



## **Matríz de distancias**

Para construir la matriz de distancias, agruparemos en base al campo **`IDDIST`**, agregando los campos **`centroide_NHB`**, que contiene los códigos de los centroides adyacentes a los polígonos, y **`distancia`**, que refleja las distancias entre dichos polígonos adyacentes.


```python
# Cálculo de la matriz de distancia
matriz = dfNhb.groupby(by='IDDIST').agg({'IDDIST_NHB':','.join, 'distancia':','.join}).reset_index()

# Visualizando el resultado
matriz.head()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>IDDIST</th>
      <th>IDDIST_NHB</th>
      <th>distancia</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>070101</td>
      <td>070106,150101,070105,070104,070102,070103,150135</td>
      <td>15265.65,8736.52,7585.72,5948.28,4940.27,4422....</td>
    </tr>
    <tr>
      <th>1</th>
      <td>070102</td>
      <td>150136,150101,070101,070104</td>
      <td>2823.96,6720.13,4940.27,1321.61</td>
    </tr>
    <tr>
      <th>2</th>
      <td>070103</td>
      <td>150101,070101,150135</td>
      <td>4613.32,4422.12,5543.05</td>
    </tr>
    <tr>
      <th>3</th>
      <td>070104</td>
      <td>150136,070101,070102</td>
      <td>2915.72,5948.28,1321.61</td>
    </tr>
    <tr>
      <th>4</th>
      <td>070105</td>
      <td>070101</td>
      <td>7585.72</td>
    </tr>
  </tbody>
</table>
</div>



Finalmente, uniremos esta matriz resultante a la capa de municipio original, utilizando como llave el campo **`IDDIST`**:


```python
# Unir la matriz al "gdf" original
gdf = gdf.merge(matriz, on='IDDIST', how='left')

# Visualizar el resultado
gdf[['IDDIST','DISTRITO','IDDIST_NHB', 'distancia']].head()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>IDDIST</th>
      <th>DISTRITO</th>
      <th>IDDIST_NHB</th>
      <th>distancia</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>150119</td>
      <td>LURIN</td>
      <td>150126,150142,150143,150123</td>
      <td>7342.27,15776.28,14646.91,8268.85</td>
    </tr>
    <tr>
      <th>1</th>
      <td>150102</td>
      <td>ANCON</td>
      <td>150106,070106,150125,150139</td>
      <td>17722.14,19910.29,18791.93,13515.39</td>
    </tr>
    <tr>
      <th>2</th>
      <td>150131</td>
      <td>SAN ISIDRO</td>
      <td>150122,150141,150130,150116,150115,150120,150113</td>
      <td>2568.6,3034.69,4517.52,1463.46,3619.96,3318.2,...</td>
    </tr>
    <tr>
      <th>3</th>
      <td>150120</td>
      <td>MAGDALENA DEL MAR</td>
      <td>150131,150113,150136,150121</td>
      <td>3318.2,2661.27,3190.92,2077.74</td>
    </tr>
    <tr>
      <th>4</th>
      <td>150130</td>
      <td>SAN BORJA</td>
      <td>150141,150131,150115,150140,150134,150103</td>
      <td>2614.9,4517.52,3689.72,3467.38,2605.07,14697.69</td>
    </tr>
  </tbody>
</table>
</div>



## **Visualización**


```python
for index, row in gdf.sort_values(by='IDDIST').iterrows():
    # recuperar el ubigeo y el nombre
    ubigeo = row['IDDIST']
    name = row['DISTRITO']
    
    # Filtrar el gdf para el distrito iterado
    gdfFilter = gdf[gdf.IDDIST == ubigeo]
    
    # Obtener los distritos adyacentes
    gdfAdy = gdf[gdf['IDDIST'].isin(gdfFilter['IDDIST_NHB'].str.split(',').tolist()[0])]
    
    # Trazar mapa
    fig, ax = plt.subplots(figsize=(10,10))
    gdfFilter.plot(ax=ax, color='red', alpha = 0.6, edgecolor='black')
    gdfAdy.plot(ax=ax, color='grey', alpha=0.3, edgecolor='black')
    
    # Agregar titulo
    plt.title(f'Distrito de {name} y adyacentes')
       
    # Rotular distito
    plt.text(gdfFilter['geometry'].values.centroid.x[0],
             gdfFilter['geometry'].values.centroid.y[0], 
             gdfFilter['DISTRITO'].values[0].title(), 
             fontsize=9,
             horizontalalignment='center',
             verticalalignment='center',
             path_effects=[pe.withStroke(linewidth=3, foreground='white')],
             color='black',
             weight='bold')
    
    # Rotular distritos adyacentes
    for index, row in gdfAdy.iterrows():
        plt.text(row['geometry'].centroid.x,
                 row['geometry'].centroid.y, 
                 row['DISTRITO'].title(), 
                 fontsize=7,
                 horizontalalignment='center',
                 verticalalignment='center',
                 path_effects=[pe.withStroke(linewidth=2.5, foreground='white')],
                 color='dimgrey',
                 weight='bold')

    # Agregar basemap
    cx.add_basemap(ax,
                   crs=gdfAdy.crs.to_string(),
                   source=cx.providers.CartoDB.PositronNoLabels  
                  )
    
    # Mostrar mapa
    plt.show()
    print('\n')
```

   
![png](img/output_26_0.png)

![png](img/output_26_2.png)

![png](img/output_26_4.png)

![png](img/output_26_6.png)

![png](img/output_26_8.png)

![png](img/output_26_10.png)

![png](img/output_26_12.png)

![png](img/output_26_14.png)

![png](img/output_26_16.png)

![png](img/output_26_18.png)

![png](img/output_26_20.png)

![png](img/output_26_22.png)

![png](img/output_26_24.png)

![png](img/output_26_26.png)

![png](img/output_26_28.png)

![png](img/output_26_30.png)

![png](img/output_26_32.png)

![png](img/output_26_34.png)

![png](img/output_26_36.png)

![png](img/output_26_38.png)

![png](img/output_26_40.png)

![png](img/output_26_42.png)

![png](img/output_26_44.png)

![png](img/output_26_46.png)

![png](img/output_26_48.png)

![png](img/output_26_50.png)

![png](img/output_26_52.png)

![png](img/output_26_54.png)

![png](img/output_26_56.png)

![png](img/output_26_58.png)

![png](img/output_26_60.png)

![png](img/output_26_62.png)

![png](img/output_26_64.png)

![png](img/output_26_66.png)

![png](img/output_26_68.png)

![png](img/output_26_70.png)

![png](img/output_26_72.png)

![png](img/output_26_74.png)

![png](img/output_26_76.png)

![png](img/output_26_78.png)

![png](img/output_26_80.png)

![png](img/output_26_82.png)

![png](img/output_26_84.png)

![png](img/output_26_86.png)

![png](img/output_26_88.png)

![png](img/output_26_90.png)

![png](img/output_26_92.png)

![png](img/output_26_94.png)

![png](img/output_26_96.png)

![png](img/output_26_98.png)
    


    
    
    
