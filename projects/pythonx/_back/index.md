# Desafío de análisis espacial

La siguiente pregunta fue realizada por **[Spatial Thoughts](https://twitter.com/spatialthoughts/status/1644731633571106818)**:

**¿Puede averiguar cómo almacenar en búfer cada punto en la Capa A para que el búfer contenga exactamente 5 puntos de la Capa B?**

A continuación los pasos propuestos para la solución:

**Import módulos a utilizar**

```python
# import modules
import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt
```

**Lectura de los datos**

```python
# Read data
layer_a = gpd.read_file('data/sample_data.gpkg', layer='LayerA', driver='GPKG')
layer_b = gpd.read_file('data/sample_data.gpkg', layer='LayerB', driver='GPKG')
```

**Función para crear Buffer según la cantidad de puntos que deba contener**

```python
# Function Buffer:
def bufferCount(inGdf, countGdf, numPoints):
    # Calculate distances
    distances = [pd.DataFrame(inGdf.geometry.distance(countGdf.geometry[i])) for i in range(len(countGdf))]
    distances = pd.concat(distances)
    distances = distances.sort_values(by=0) # Sort distances

    # Update distance in result
    result = inGdf.copy()
    for i in list(distances.index.unique()):
        distA = float(distances[distances.index==i].iloc[numPoints - 1]) # Distance N
        distB = float(distances[distances.index==i].iloc[numPoints])     # Distance N + 1
        result.loc[[i],'distance'] = distA + (distB - distA)/2

    # Calculate Buffer
    result['geometry'] = result.buffer(result['distance'])
    
    # Return
    return result
```

**Utilizando la función**

```python
# Ejecutando la función para crear buffer que contenga 3 puntos
layer_a_buffer = bufferCount(layer_a, layer_b, 3)

# Plot
fig, ax = plt.subplots(figsize=(8,8))
layer_a_buffer.plot(ax=ax, color='Orange', edgecolor='Gray', alpha=.4);
layer_b.plot(ax=ax, markersize=12, color='Black', edgecolor='White');
```
    
![png](output_7_0.png)
  
```python
# Ejecutando la función para crear buffer que contenga 5 puntos
layer_a_buffer = bufferCount(layer_a, layer_b, 5)

# Plot
fig, ax = plt.subplots(figsize=(8,8))
layer_a_buffer.plot(ax=ax, color='Orange', edgecolor='Gray', alpha=.4);
layer_b.plot(ax=ax, markersize=12, color='Black', edgecolor='White');
```
  
![png](output_8_0.png)
    
```python
# Ejecutando la función para crear buffer que contenga 10 puntos
layer_a_buffer = bufferCount(layer_a, layer_b, 10)

# Plot
fig, ax = plt.subplots(figsize=(8,8))
layer_a_buffer.plot(ax=ax, color='Orange', edgecolor='Gray', alpha=.4);
layer_b.plot(ax=ax, markersize=12, color='Black', edgecolor='White');
```
   
![png](output_9_0.png)
