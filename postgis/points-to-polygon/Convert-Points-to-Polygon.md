# **Ejercicio**

En este ejercicio, crearemos un polígono que represente una parcela utilizando puntos obtenidos mediante un levantamiento GPS. En primer lugar, transformaremos estos puntos en una línea y luego la utilizaremos como base para crear el polígono correspondiente a la parcela. PostGIS será nuestra herramienta principal para llevar a cabo esta tarea.

![png](img/convert.png)

## **1. Explorando los datos**

Empecemos por explorar la capa utilizando el comando **`ogrinfo`** de GDAL/OGR.


```python
!ogrinfo .\data\waypoints.shp -al -fid 1
```

    INFO: Open of `.\data\waypoints.shp'
          using driver `ESRI Shapefile' successful.
    
    Layer name: waypoints
    Metadata:
      DBF_DATE_LAST_UPDATE=2024-02-16
    Geometry: Point
    Feature Count: 23
    Extent: (33218.979710, 9133574.181029) - (35175.662935, 9135173.301031)
    Layer SRS WKT:
    PROJCRS["WGS 84 / UTM zone 18S",
        BASEGEOGCRS["WGS 84",
            DATUM["World Geodetic System 1984",
                ELLIPSOID["WGS 84",6378137,298.257223563,
                    LENGTHUNIT["metre",1]]],
            PRIMEM["Greenwich",0,
                ANGLEUNIT["degree",0.0174532925199433]],
            ID["EPSG",4326]],
        CONVERSION["UTM zone 18S",
            METHOD["Transverse Mercator",
                ID["EPSG",9807]],
            PARAMETER["Latitude of natural origin",0,
                ANGLEUNIT["Degree",0.0174532925199433],
                ID["EPSG",8801]],
            PARAMETER["Longitude of natural origin",-75,
                ANGLEUNIT["Degree",0.0174532925199433],
                ID["EPSG",8802]],
            PARAMETER["Scale factor at natural origin",0.9996,
                SCALEUNIT["unity",1],
                ID["EPSG",8805]],
            PARAMETER["False easting",500000,
                LENGTHUNIT["metre",1],
                ID["EPSG",8806]],
            PARAMETER["False northing",10000000,
                LENGTHUNIT["metre",1],
                ID["EPSG",8807]]],
        CS[Cartesian,2],
            AXIS["(E)",east,
                ORDER[1],
                LENGTHUNIT["metre",1]],
            AXIS["(N)",north,
                ORDER[2],
                LENGTHUNIT["metre",1]],
        ID["EPSG",32718]]
    Data axis to CRS axis mapping: 1,2
    id: Integer64 (10.0)
    x: Real (11.6)
    y: Real (11.6)
    OGRFeature(waypoints):1
      id (Integer64) = 2
      x (Real) = 33788.012110
      y (Real) = 9134885.095000
      POINT (33788.0121127489 9134885.09546332)
    
    

Como se puede apreciar, la capa dispone del campo **`id`**, que actúa como identificador de los datos y refleja el orden de registro de los puntos.

Además, observamos que la capa está definida en el sistema de coordenadas UTM Zona 18 S (EPSG:32718).

### **2. Importar los datos a PostGIS**

Utilizaremos los comandos **`shp2pgsql`** y **`psql`** para importar los datos a PostGIS, teniendo en cuenta las consideraciones mencionadas anteriormente.


```python
!shp2pgsql -s 32718 -I -D -g geom .\data\waypoints.shp gis.waypoints \
|psql -U postgres training
```

    SET
    SET
    BEGIN
    CREATE TABLE
    ALTER TABLE
                    addgeometrycolumn                 
    --------------------------------------------------
     gis.waypoints.geom SRID:32718 TYPE:POINT DIMS:2 
    (1 row)
    
    COPY 23
    CREATE INDEX
    COMMIT
    ANALYZE
    

    Field id is an FTDouble with width 10 and precision 0
    Field x is an FTDouble with width 11 and precision 6
    Field y is an FTDouble with width 11 and precision 6
    Shapefile type: Point
    Postgis type: POINT[2]
    

Para validar la carga, primero cargamos la extensión y nos conectamos a la base de datos.


```python
# cargar la extension
%load_ext sql
```


```python
# Conectarse a la BD
%sql postgresql://postgres:postgres@localhost/training
```


<span style="None">Connecting to &#x27;postgresql://postgres:***@localhost/training&#x27;</span>


Finalmente, realizamos la consultas necesaria para su validación:


```python
# número de registros importados
%sql SELECT COUNT(*) AS cantidad FROM gis.waypoints;
```


<span style="None">Running query in &#x27;postgresql://postgres:***@localhost/training&#x27;</span>



<span style="color: green">1 rows affected.</span>





<table>
    <thead>
        <tr>
            <th>cantidad</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>23</td>
        </tr>
    </tbody>
</table>




```python
# Metadatos de la geometría
%sql SELECT * FROM geometry_columns WHERE f_table_name = 'waypoints';
```


<span style="None">Running query in &#x27;postgresql://postgres:***@localhost/training&#x27;</span>



<span style="color: green">1 rows affected.</span>





<table>
    <thead>
        <tr>
            <th>f_table_catalog</th>
            <th>f_table_schema</th>
            <th>f_table_name</th>
            <th>f_geometry_column</th>
            <th>coord_dimension</th>
            <th>srid</th>
            <th>type</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>training</td>
            <td>gis</td>
            <td>waypoints</td>
            <td>geom</td>
            <td>2</td>
            <td>32718</td>
            <td>POINT</td>
        </tr>
    </tbody>
</table>



### **3. De puntos a Línea**

A continuación vamos a construir segmento de línea que representan las rutas recorridas. Para ello es necesario ordenar la capa por el campo `id`. Utilizaremos la función PostGIS **[ST_MakeLine](https://postgis.net/docs/ST_MakeLine.html)**, la cual permite crear un objeto `LineString` a partir de una **secuencia de puntos**. Esta función toma como entrada una serie de geometrías de tipo `Point`, `MultiPoint` o `LineString` y las une para formar una línea continua.


```sql
%%sql
    CREATE TABLE gis.route AS 
        SELECT 
            ROW_NUMBER () OVER (ORDER BY 1) as id
            , ST_MakeLine(w.geom) AS geom
        FROM (SELECT * FROM gis.waypoints ORDER BY id) w
        ;
```


<span style="None">Running query in &#x27;postgresql://postgres:***@localhost/training&#x27;</span>



<span style="color: green">1 rows affected.</span>





<table>
    <thead>
        <tr>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>



Para visualizar el resultado, vamos a leer la tabla **`gis.route`** utilizando `geopandas` y `SQLAlchemy`. Comenzaremos importando las bibliotecas necesarias:


```python
# Importar librerías
import geopandas as gpd
from sqlalchemy import create_engine
import matplotlib.pyplot as plt
plt.style.use('ggplot')
```

A continuación, configuramos los parámetros de conexión y la consulta a la tabla especificada:


```python
# Url con los parámetros de conexión
url = 'postgresql://postgres:postgres@localhost:5432/training'
# Realizando la conexión
engine = create_engine(url)
# Consulta a retonar
sql = 'SELECT * FROM gis.route'
```

Empleando la función **[geopandas.read_postgis](https://geopandas.org/en/stable/docs/reference/api/geopandas.read_postgis.html)**, llevamos a cabo la lectura desde PostGIS hacia un GeoDataFrame.


```python
gdf = gpd.read_postgis(sql, engine);
```

Finalmente, visualizamos gráficamente la capa "gis.gps_tracks"


```python
gdf.plot();
```


    
![png](img/output_19_0.png)
    


Como se puede apreciar la línea que construida presenta una auto-intersección y no está cerrada (es decir, el primer y último punto no coinciden). Para poder generar un polígono, es necesario cerrar un anillo.

### **4. De línea a Polígono**

Como ya se indicó, para crear un polígono a partir de una línea, es necesario que esta forme un anillo cerrado. A partir del gráfico anterior, emplearemos la auto-intersección para identificar los segmentos de líneas que efectivamente forma un anillo, descartando aquellos que no lo hacen.

#### **4.1. Identificar el nodo de auto-intersección**

El primer paso consiste en indentificar el nodo de auto-intersección. Para llevar a cabo esta tarea, utilizaremos la función **[ST_UnaryUnion](https://postgis.net/docs/ST_UnaryUnion.html)** o **[ST_Node](https://postgis.net/docs/ST_Node.html)**. Ambas funciones permiten trabajar con objetos `LineString`, lo que facilita la **identificación de nodos** y la **fusión de colecciones de cadenas de líneas** que se intersectan o se superponen, con el objetivo de simplificarlas.

Para una comprensión más clara, se recomienda verificar tanto el tipo de geometría actual como el tipo de geometría resultante después de aplicar las funciones **`ST_UnaryUnion`** o **`ST_Node`**.


```sql
%%sql
    SELECT  ST_AsText(geom) geom_original,
            ST_NumGeometries(geom) geom_original_numgeom,
            ST_AsText(ST_UnaryUnion(geom)) geom_unary,
            ST_NumGeometries(ST_AsText(ST_UnaryUnion(geom))) geom_unary_numgeom
    FROM gis.route;
```


<span style="None">Running query in &#x27;postgresql://postgres:***@localhost/training&#x27;</span>



<span style="color: green">1 rows affected.</span>





<table>
    <thead>
        <tr>
            <th>geom_original</th>
            <th>geom_original_numgeom</th>
            <th>geom_unary</th>
            <th>geom_unary_numgeom</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>LINESTRING(33651.19545280875 9134860.041309932,33788.012112748926 9134885.095463324,33980.385461749334 9134916.62663321,35029.46814354323 9135092.902132425,35096.88298607868 9135105.416985331,35175.6629351555 9135173.30103146,34895.98872158042 9134337.726020778,34681.646800781076 9133723.830562903,34236.613021932426 9133731.206204744,33825.382555959804 9133734.97050271,33749.92513263383 9133732.239037164,33718.3038337825 9133716.134189352,33690.694693241036 9133696.122849517,33677.06859543541 9133668.358451976,33534.991309303674 9133574.181028768,33395.93439624761 9133574.75617647,33346.13932475977 9133588.069135953,33218.979710162326 9133590.736837003,33254.17644088704 9133646.34605444,33420.65350322693 9134056.449233072,33599.537618534116 9134474.70698704,33699.12163372518 9134741.970295437,33833.57612380362 9134948.565091738)</td>
            <td>1</td>
            <td>MULTILINESTRING((33651.19545280875 9134860.041309932,33788.012112748926 9134885.095463324,33792.77764112615 9134885.876562607),(33792.77764112615 9134885.876562607,33980.385461749334 9134916.62663321,35029.46814354323 9135092.902132425,35096.88298607868 9135105.416985331,35175.6629351555 9135173.30103146,34895.98872158042 9134337.726020778,34681.646800781076 9133723.830562903,34236.613021932426 9133731.206204744,33825.382555959804 9133734.97050271,33749.92513263383 9133732.239037164,33718.3038337825 9133716.134189352,33690.694693241036 9133696.122849517,33677.06859543541 9133668.358451976,33534.991309303674 9133574.181028768,33395.93439624761 9133574.75617647,33346.13932475977 9133588.069135953,33218.979710162326 9133590.736837003,33254.17644088704 9133646.34605444,33420.65350322693 9134056.449233072,33599.537618534116 9134474.70698704,33699.12163372518 9134741.970295437,33792.77764112615 9134885.876562607),(33792.77764112615 9134885.876562607,33833.57612380362 9134948.565091738))</td>
            <td>3</td>
        </tr>
    </tbody>
</table>



El resultado anterior proporciona información sobre la `geometría original` y las `geometría resultante` después de aplicar las funciones **`ST_UnaryUnion`**, incluyendo el número de geometrías en cada una de ellas. Se observa que la `geometría original` es una **línea** compuesta por una secuencia de nodos. Tras ejecutar la función, la `geometría resultante` es una **multilinea** compuesta por tres segmentos lineales originados a partir del nodo de autointersección.

Con esta información, procederemos a actualizar la geometría original de la capa **`route`** utilizando la función **`ST_UnaryUnion`**


```python
%sql UPDATE gis.route SET geom = ST_UnaryUnion(geom);
```


<span style="None">Running query in &#x27;postgresql://postgres:***@localhost/training&#x27;</span>



<span style="color: green">1 rows affected.</span>





<table>
    <thead>
        <tr>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>



#### **4.2. Descomponer geometría**

Una vez actualizada la geometría en multipartes, procederemos a descomponerla para obtener un registro por cada parte individual. Para lograr esto, emplearemos la función de PostgreSQL **[generate_series(start, end, step)](https://www.postgresql.org/docs/current/functions-srf.html)**, la cual genera una secuencia de valores dentro de un rango especificado. Por ejemplo:


```sql
%%sql
    SELECT generate_series(1,3);
```


<span style="None">Running query in &#x27;postgresql://postgres:***@localhost/training&#x27;</span>



<span style="color: green">3 rows affected.</span>





<table>
    <thead>
        <tr>
            <th>generate_series</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
        </tr>
        <tr>
            <td>2</td>
        </tr>
        <tr>
            <td>3</td>
        </tr>
    </tbody>
</table>



Al analizar esta función, notamos que devuelve resultados dentro de un rango específico, comenzando siempre desde el valor 1. Para determinar el límite final de esta secuencia, utilizaremos la función **[ST_NumGeometries(geom)](https://postgis.net/docs/ST_NumGeometries.html)**, que retorna el número de elementos en una colección de geometrías.

Además, emplearemos la función **[ST_GeometryN(geom, n)](https://postgis.net/docs/ST_GeometryN.html)**. Esta función devuelve la geometría del enésimo elemento basado en una geometría de entrada de una capa múltiple. La geometría será obtenida de la capa, y el valor "n" será extraído del resultado de la función **`generate_series`** como se muestra a continuación:


```sql
%%sql
    select 
            generate_series(1, ST_NumGeometries(geom)) as gid,
            ST_Astext(ST_GeometryN(
                         geom,
                         generate_series(1, ST_NumGeometries(geom))
                        )) as geomtext
    from gis.route;
```


<span style="None">Running query in &#x27;postgresql://postgres:***@localhost/training&#x27;</span>



<span style="color: green">3 rows affected.</span>





<table>
    <thead>
        <tr>
            <th>gid</th>
            <th>geomtext</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
            <td>LINESTRING(33651.19545280875 9134860.041309932,33788.012112748926 9134885.095463324,33792.77764112615 9134885.876562607)</td>
        </tr>
        <tr>
            <td>2</td>
            <td>LINESTRING(33792.77764112615 9134885.876562607,33980.385461749334 9134916.62663321,35029.46814354323 9135092.902132425,35096.88298607868 9135105.416985331,35175.6629351555 9135173.30103146,34895.98872158042 9134337.726020778,34681.646800781076 9133723.830562903,34236.613021932426 9133731.206204744,33825.382555959804 9133734.97050271,33749.92513263383 9133732.239037164,33718.3038337825 9133716.134189352,33690.694693241036 9133696.122849517,33677.06859543541 9133668.358451976,33534.991309303674 9133574.181028768,33395.93439624761 9133574.75617647,33346.13932475977 9133588.069135953,33218.979710162326 9133590.736837003,33254.17644088704 9133646.34605444,33420.65350322693 9134056.449233072,33599.537618534116 9134474.70698704,33699.12163372518 9134741.970295437,33792.77764112615 9134885.876562607)</td>
        </tr>
        <tr>
            <td>3</td>
            <td>LINESTRING(33792.77764112615 9134885.876562607,33833.57612380362 9134948.565091738)</td>
        </tr>
    </tbody>
</table>



Como vemos, la geometría multiparte se descompuso en las 3 geometrías lineales que la componen. Podemos visualizarla gráficamente


```python
# Consulta SQL
sql_lineas = '''
                select 
                        generate_series(1, ST_NumGeometries(geom)) as gid,
                        ST_GeometryN(
                                     geom,
                                     generate_series(1, ST_NumGeometries(geom))
                                    ) as geom
                from gis.route;
             '''

# Lectura de consultas postgis como GeoDataFrame
gdfLines = gpd.read_postgis(sql_lineas, engine)

# Trazar las lineas
gdfLines.plot('gid');
```


    
![png](img/output_29_0.png)

#### **4.3. Conversión de línea a polígono**

Como necesitamos construir un polígono solo necesitamos filtrar aquellas geometría que se cierran y forman un anillo. Para esto, podemos utilizar la función **[ST_IsRing(geom)](https://postgis.net/docs/ST_IsRing.html)** que retorna verdadero si es un anillo y falso si no lo es. Veamos a continuación:


```sql
%%sql
    select 
            generate_series(1, ST_NumGeometries(geom)) as gid,
            ST_IsRing(ST_GeometryN(
                         geom,
                         generate_series(1, ST_NumGeometries(geom))
                        )) as es_anillo,
            ST_Astext(ST_GeometryN(
                         geom,
                         generate_series(1, ST_NumGeometries(geom))
                        )) as geomtext
    from gis.route;
```


<span style="None">Running query in &#x27;postgresql://postgres:***@localhost/training&#x27;</span>



<span style="color: green">3 rows affected.</span>





<table>
    <thead>
        <tr>
            <th>gid</th>
            <th>es_anillo</th>
            <th>geomtext</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
            <td>False</td>
            <td>LINESTRING(33651.19545280875 9134860.041309932,33788.012112748926 9134885.095463324,33792.77764112615 9134885.876562607)</td>
        </tr>
        <tr>
            <td>2</td>
            <td>True</td>
            <td>LINESTRING(33792.77764112615 9134885.876562607,33980.385461749334 9134916.62663321,35029.46814354323 9135092.902132425,35096.88298607868 9135105.416985331,35175.6629351555 9135173.30103146,34895.98872158042 9134337.726020778,34681.646800781076 9133723.830562903,34236.613021932426 9133731.206204744,33825.382555959804 9133734.97050271,33749.92513263383 9133732.239037164,33718.3038337825 9133716.134189352,33690.694693241036 9133696.122849517,33677.06859543541 9133668.358451976,33534.991309303674 9133574.181028768,33395.93439624761 9133574.75617647,33346.13932475977 9133588.069135953,33218.979710162326 9133590.736837003,33254.17644088704 9133646.34605444,33420.65350322693 9134056.449233072,33599.537618534116 9134474.70698704,33699.12163372518 9134741.970295437,33792.77764112615 9134885.876562607)</td>
        </tr>
        <tr>
            <td>3</td>
            <td>False</td>
            <td>LINESTRING(33792.77764112615 9134885.876562607,33833.57612380362 9134948.565091738)</td>
        </tr>
    </tbody>
</table>



Como vemos, la función anterior nos identifica que geometría es un anillo, por lo tanto, podemos utilizar esta función para filtrar solo las geometrías que conforman un anillo para convertirlas en poligono, como se muestra a continuación:


```sql
%%sql
    create table gis.parcela as
        with lines as
            (select 
                    generate_series(1, ST_NumGeometries(geom)) as gid,
                    ST_GeometryN(geom,
                                 generate_series(1, ST_NumGeometries(geom))) as geom
            from gis.route)
            select gid, st_buildarea(geom) as geom from lines
            where st_isring(geom)
            ;
```


<span style="None">Running query in &#x27;postgresql://postgres:***@localhost/training&#x27;</span>



<span style="color: green">1 rows affected.</span>





<table>
    <thead>
        <tr>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>



Finalmente, podemos visualizar el resultado:


```python
# Consulta
sql3 = 'select * from gis.parcela'
# Lectura como geodataframe
gdfPlg = gpd.read_postgis(sql3, engine)
# Trazar
gdfPlg.plot(edgecolor='black', alpha=0.6);
```


    
![png](img/output_35_0.png)
    


**Referencias**

* "Prácticas de Sistemas de Información Geográfica" por CentroGeo. Disponible en: https://centrogeo.github.io/practicas_sig/. Licencia GPL-2.0.
