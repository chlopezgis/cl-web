<center><h1>Importar datos a PostGIS</h1></center>

Los datos son el componente mas importante de un SIG ya que sin estos es imposible realizar cualquier análisis. Actualmente, existen muchas fuentes públicas de datos geoespaciales que podemos integrar dentro de nuestra base de datos para análisis posteriores. Por tal motivo, este tutorial tiene como objetivo mostrar las principales herramientas y procesos para importar datos espaciales, de diferentes formatos, a PostGIS.

## Antes de iniciar...

1. Crear una base de datos espacial (Ver capitulo [Crear base de datos espacial ](https://chlopezgis.github.io/postgis/create)).
2. Los datos utilizados en la práctica provienen del portal [Geollaqta](http://catastro.cofopri.gob.pe/geollaqta/) de COFOPRI. Puede descargar los datos usados en esta práctica del siguiente [link](https://chlopezgis.github.io/postgis/data/cap02.zip).

## 1. Importar datos tabulares con el comando COPY FROM

El comando **COPY FROM** permite copiar los datos de un archivo de texto plano a una tabla de PostgreSQL.

**Consideraciones**

* Cada campo del archivo se inserta, en orden, en la columna especificada.
* Las columnas de la tabla no especificadas recibirán sus valores predeterminados.

**Sintaxis**

```sql
COPY table_name [ ( column_name [, ...] ) ]
    FROM { 'filename' | PROGRAM 'command' | STDIN }
    [ [ WITH ] ( option [, ...] ) ]
    [ WHERE condition ]
```

**Parametros**

* **table_name**: El nombre de una tabla existente (Opcionalmente se puede indicar el esquema).
* **column_name**: Una lista opcional de columnas que se van a copiar. Si no se especifica ninguna lista de columnas, se copiarán todas las columnas de la tabla.
* **'filename'**: Para el comando COPY FROM este parámetro es el nombre y ruta del archivo de entrada. Puede ser una ruta absoluta o relativa.
* **PROGRAM \<'comando'\>**: Un comando a ejecutar. En COPY FROM, la entrada se lee desde la salida estándar del comando.
* **STDIN**: Especifica que la entrada proviene de la aplicación cliente.

**Opciones principales**

* **\<Formato\>**: Indica el formato de datos que se va a leer o escribir: TXT, CSV o binary. El valor predeterminado es txt.
* **DELIMITER \<'caracter delimitador'\>**: Especifica el carácter que separa las columnas del archivo. El valor predeterminado es un carácter de tabulación en el formato `TXT`, una coma en el formato `CSV`. Debe ser un solo carácter de un byte. Esta opción no está permitida cuando se usa el formato `binario`.
* **HEADER**: Especifica que el archivo contiene una primera línea de encabezado con los nombres de cada columna del archivo y se ignora en la importación. Esta opción solo está permitida cuando se usa el formato `CSV`.
* **ENCODING \<'codificación'\>**: Especifica la codificación de carácteres del archivo. Si se omite esta opción, se utiliza la codificación del cliente actual.
* **NULL \<'cadena nula'\>**: Especifica la cadena que representa un valor nulo. El valor predeterminado es \N (barra invertida-N) en formato de texto y una cadena vacía sin comillas en formato CSV. Es posible que prefiera una cadena vacía incluso en formato de texto para los casos en los que no desee distinguir los valores nulos de las cadenas vacías. Esta opción no está permitida cuando se utiliza el formato binario.

### PRACTICA

Para esta práctica, importaremos un archivo de texto plano que contiene un listado de comercios (archivo **comercios.csv**). A continuación, se detalla el flujo a seguir:

**Paso 1.**  Con un editor de texto, inspeccionar la estructura del archivo de texto plano.

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/178259319-4b5df6e8-54ec-4dfc-ab74-2100b49febc6.png"/></p>

El objetivo es identificar la estructura del archivo (campos y tipo de datos), la cantidad de registros (6,977) y el delimitador de campo (;):

**Paso 2.** Conectarse a la base de datos espacial. Para esta práctica se utilizará el cliente **psql** desde el simbolo del sistema

```
psql -U postgres lore
```

**Paso 3.** Crear un esquema de trabajo de nombre **data**

```sql
CREATE SCHEMA data;
```

**Paso 4.** Crear la tabla con la estructura del archivo CSV respetando el orden de los campos. Tambien, agregar al final un campo de tipo geometría puntual con el sistema de referencia correspondiente.

```sql
CREATE TABLE data.comercios(
            id integer PRIMARY KEY
            , ubigeo CHAR(6) NOT NULL
            , cod_sect CHAR(2) NOT NULL
            , cod_mzna CHAR(3) NOT NULL
            , cod_lote CHAR(3) NOT NULL
            , cod_piso CHAR(2) NOT NULL
            , cod_edificacion CHAR(2) NOT NULL
            , cod_uso VARCHAR(5)
            , desc_uso VARCHAR(150)
            , lon_x NUMERIC(10,6) NOT NULL
            , lat_y NUMERIC(10,6) NOT NULL
            , geom GEOMETRY(POINT, 4326)
);
```

**Paso 5.** Importar el archivo ejecutando el comando **COPY FROM**

```sql
COPY data.comercios(id
                    , ubigeo
                    , cod_sect
                    , cod_mzna
                    , cod_lote
                    , cod_piso
                    , cod_edificacion
                    , cod_uso
                    , desc_uso
                    , lon_x
                    , lat_y) 
FROM 'D:\Charlie\05_Articulos\SpatialDB\data\cap02\comercios.csv' 
WITH CSV HEADER DELIMITER ';' ENCODING 'UTF-8';
```

Nota: Si no es superusuario de la base de datos debe anteponer la barra invertida: **\COPY**

**Paso 6.** Verificar que los registros se insertaron correctamente

Contar la cantidad de registros:

```sql
SELECT COUNT(*) AS cantidad FROM data.comercios;
``` 

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/178388439-59ef9675-9ed2-4d3b-943b-16694f414d69.png"/></p>

Mostrar los primeros 10 registros:

```sql
SELECT 
        id
        , ubigeo
        , cod_uso
        , desc_uso
        , lon_x
        , lat_y
FROM data.comercios LIMIT 10;
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/178388694-5f50e1b0-afe5-4721-beb7-1909ebf48616.png"/></p>

**Paso 7.** Construir la geometría a partir de las coordenadas.

```sql
UPDATE data.comercios SET geom =
ST_GeomFromText('POINT('||lon_x||' '||lat_y||')', 4326);
```

**Paso 8.** Crear el índice espacial.

```sql
CREATE INDEX i_comercios_geom ON 
data.comercios USING GIST (geom);
```

**Paso 9.** Verificar que la geometría se creo correctamente. Utilizaremos el visualizador de PgAdmin4.

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/180436743-1b9cd2dc-2c74-4f09-8ef9-0e7a2fce4e4f.png"/></p>


## 2. Importar Shapefiles con el comando shp2pgsql

La utilidad **shp2pgsql** es una herramienta de linea de comandos que permite convertir archivos Shapefiles a un formato SQL especialmente diseñado para su insercción en una base de datos espacial.

**Sintaxis**

```
shp2pgsql [<options>] <shapefile> [[<schema>.]<table>]
 ```

Opciones:

* **-s \[\<from\>:\]\<srid\>**: Establece el Sistema de Coordenadas. El valor predeterminado es 0. Opcionalmente reproyecta desde un SRID dado.
* **(-d\|a\|c\|p)**: Estas son opciones mutuamente excluyentes:
    * **-d**: Elimina la tabla, luego la vuelve a crear y la completa con los datos del Shapefile actual.
    * **-a**: Agrega el Shapefile a la tabla actual. Debe ser exactamente el mismo esquema de tabla.
    * **-c**: Crea una nueva tabla y la llena con los datos. Este es el valor predeterminado.
    * **-p**: Modo preparar, solo crea la tabla.
* **-g \<geocolumn\>**: Especifica el nombre de la columna geometría/geografía (principalmente útil en el modo de adición "-a").
* **-D:** Usar el formato de volcado de postgresql. Es mucho más rápido de cargar que el "formato de inserción" predeterminado.
* **-e:** Ejecuta cada declaración individualmente, no usa una transacción. No compatible con -D.
* **-G**: Usar tipo geografía (requiere datos de longitud/latitud o -s para reproyectar).
* **-k**: Mantener mayúsculas y minúsculas en los identificadores de postgresql
* **-i**: Usa int4 para todos los campos enteros del dbf
* **-I**: Crea un índice spacial en la columna de la geometría
* **-S**: Genera geometrías simples en vez de geometrías MULTI
* **-t \<dimensionality\>**: Fuerza a la geometría a ser una de '2D', '3DZ', '3DM' o '4D'
* **-w**: Salida WKT en lugar de WKB. Tenga en cuenta que esto puede resultar en una desviación de coordenadas.
* **-W \<encoding\>**: Especifica la codificación de los caracteres (predeterminado: "UTF-8").
* **-N \<policy\>**: Política de manejo de geometrías NULL (insert*, skip, abort).
* **-n**: Solo importa el archivo DBF.
* **-T \<tablespace\>**: Especifique el tablespace para la nueva tabla. Tenga en cuenta que los índices seguirán utilizando el espacio de tabla predeterminado a menos que también se utilice el indicador -X.
* **-X \<tablespace\>**: Especifique el tablespace para los índices de la tabla. Esto se aplica a la clave principal y al índice espacial si se utiliza el indicador -I.
* **-Z**: Evita que se analicen las tablas.
* **-?**: Muestra la ayuda

### PRACTICA

Para esta práctica, importaremos una capa de polígonos de Habilitaciones Urbanas (hab_urbanas.shp). A continuación, se detalla el flujo a seguir:

**Paso 1.** Convertir el archivo Shapefile a SQL

```
shp2pgsql -s 4326 -D -I -g geom "data/cap02/hab_urbanas.shp" ^
data.hab_urbanas > "data/cap02/hab_urbanas.sql"
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/183413086-0b629f28-0a52-4881-a255-68f928d82086.png"/></p>

__Donde__:
* **-s**: Especificar el sistema de referencia WGS84 (EPSG 4326).
* **-I**: Crear un índice espacial.
* **-D**: Usar el formato de volcado para acelerar la carga
* **-g**: Especificar el nombre de la geocolumna como: "geom".
* **"cap02/hab_urbanas.shp"**: Indicar el Shapefile de entrada (incluye la ruta).
* **data.hab_urbanas**: Indicar el nombre con la que se creará la tabla SQL (incluye el esquema).
* **\>**: Redirigir la salida del comando shp2pgsql a un archivo (en este caso un archivo sql).
* **"data/cap02/hab_urbanas.sql"**: Indicar el nombre de salida del archivo SQL (incluye la ruta).
* **^**: Permite dividir comandos largos en varias líneas.

**Paso 2.** Inspeccionar el archivo "hab_urbanas.sql" con un editor de texto.

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/183415644-5d404f7d-d22f-4adb-ae0d-a64182a9d743.png"/></p>

Como se observa, el archivo tiene las sentencias SQL para crear la tabla e insertar los registros en esta.

**Paso 3.** Ejecutar el archivo SQL en la base de datos.

```
psql -U postgres -d lore -f "data/cap02/hab_urbanas.sql"
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/183415382-fafb8185-97e5-4900-a2f7-cf136fab9289.png"/></p>

**Paso 4.** Verificar que el archivo se importó correctamente.

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/179332178-48f8bf0c-a25d-4715-b776-fd7440bd04ea.png"/></p>

## 3. Importar otros formatos vectoriales con el comando GDAL/OGR

GDAL/OGR (Geospatial Data Abstraction Library) es una biblioteca traductora de formatos de datos geoespaciales ráster y vectorial. Es libre y de código abierto. 

OGR presenta los algoritmos para el manejo de datos geoespaciales vectoriales, siendo los mas importantes:

### ogrinfo

Obtiene la información de una fuente de datos soportada por OGR.

```
ogrinfo [--help-general] [-ro] [-q] [-where restricted_where|@filename]
        [-spat xmin ymin xmax ymax] [-geomfield field] [-fid fid]
        [-sql statement|@filename] [-dialect sql_dialect] [-al] [-rl] [-so] [-fields={YES/NO}]
        [-geom={YES/NO/SUMMARY}] [[-oo NAME=VALUE] ...]
        [-nomd] [-listmdd] [-mdd domain|`all`]*
        [-nocount] [-noextent] [-nogeomtype] [-wkt_format WKT1|WKT2|...]
        [-fielddomain name]
        datasource_name [layer [layer ...]]
```

### ogr2ogr

Conjunto de herramientas que permite la conversión de datos entre diferentes formatos. También puede realizar varias operaciones durante el proceso, como la selección espacial o de atributos, la reducción del conjunto de atributos, la configuración del sistema de coordenadas de salida o incluso la reproyección de las características durante la traducción.

```
ogr2ogr [--help-general] [-skipfailures] [-append] [-update]
        [-select field_list] [-where restricted_where|@filename]
        [-progress] [-sql <sql statement>|@filename] [-dialect dialect]
        [-preserve_fid] [-fid FID] [-limit nb_features]
        [-spat xmin ymin xmax ymax] [-spat_srs srs_def] [-geomfield field]
        [-a_srs srs_def] [-t_srs srs_def] [-s_srs srs_def] [-ct string]
        [-f format_name] [-overwrite] [[-dsco NAME=VALUE] ...]
        dst_datasource_name src_datasource_name
        [-lco NAME=VALUE] [-nln name]
        [-nlt type|PROMOTE_TO_MULTI|CONVERT_TO_LINEAR|CONVERT_TO_CURVE]
        [-dim XY|XYZ|XYM|XYZM|2|3|layer_dim] [layer [layer ...]]

        # Advanced options
        [-gt n]
        [[-oo NAME=VALUE] ...] [[-doo NAME=VALUE] ...]
        [-clipsrc [xmin ymin xmax ymax]|WKT|datasource|spat_extent]
        [-clipsrcsql sql_statement] [-clipsrclayer layer]
        [-clipsrcwhere expression]
        [-clipdst [xmin ymin xmax ymax]|WKT|datasource]
        [-clipdstsql sql_statement] [-clipdstlayer layer]
        [-clipdstwhere expression]
        [-wrapdateline] [-datelineoffset val]
        [[-simplify tolerance] | [-segmentize max_dist]]
        [-makevalid]
        [-addfields] [-unsetFid] [-emptyStrAsNull]
        [-relaxedFieldNameMatch] [-forceNullable] [-unsetDefault]
        [-fieldTypeToString All|(type1[,type2]*)] [-unsetFieldWidth]
        [-mapFieldType type1|All=type2[,type3=type4]*]
        [-fieldmap identity | index1[,index2]*]
        [-splitlistfields] [-maxsubfields val]
        [-resolveDomains]
        [-explodecollections] [-zfield field_name]
        [-gcp ungeoref_x ungeoref_y georef_x georef_y [elevation]]* [-order n | -tps]
        [[-s_coord_epoch epoch] | [-t_coord_epoch epoch] | [-a_coord_epoch epoch]]
        [-nomd] [-mo "META-TAG=VALUE"]* [-noNativeData]
```

### PRACTICA

Para esta práctica, importaremos a PostGIS 3 capas de diferentes formatos vectoriales (shapefile, geopackage y geojson). A continuación, se detalla el flujo a seguir:

#### 3.1. Importar Shapefile

**Paso 1.** Explorar la información del archivo **sectores** con el comando **ogrinfo**:

```
ogrinfo -al -so D:\datos\cap02\sectores.shp
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/179657744-8ca40005-c732-43dd-b6b7-648c69e89fbc.png"/></p>

Donde:
* **-al**: Enumera todas las características de la capa
* **-so**: Muestra información resumida como proyección, esquema, recuento de características y extensiones.

El objetivo es identificar el sistema de referencia de coordenadas, el tipo de geometría y la cantidad de registros. 

**Paso 2.** Importar la capa utilizando el comando **ogr2ogr**.

```
ogr2ogr ^
    -f PostgreSQL ^
    -a_srs EPSG:4326 ^
    PG:"host=localhost dbname=lore user=postgres password=postgres" ^
    -lco SCHEMA=data ^
    -lco GEOMETRY_NAME=geom ^
    -nln sectores ^
    D:\datos\cap02\sectores.shp
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/180756420-4221bdc7-7204-414f-9f88-dd11fd55ec86.png"/></p>

Donde:
* **-f \<nombre_de_formato\>**: Nombre del formato del archivo de salida.
* **-a_srs \<srs_def\>**: Asignar un SRS de salida, pero sin reproyectar.
* **PG:"\<conexión BD\>"**: Parámetro de conexión a la base de datos PostgreSQL
* **-lco NOMBRE=VALOR**: Opción de creación de capas. En el ejemplo se indica el nombre del esquema y de la geocolumna.
* **-nln \<nombre\>**: Nombre de la nueva capa.
* **-nlt \<tipo\>**: Define el tipo de geometría para la capa creada

**Paso 3.** Verificar que el archivo se importó correctamente.

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/180440476-1fffa800-f8a6-46e9-a0f4-7c0d25f5e464.png"/></p>

#### 3.2. Importar GeoPackage

**Paso 1**: Explorar la información de la capa **ejes_viales** que se encuentra dentro del geopackage "**cartobase.gpkg**"

```
ogrinfo -al -so D:\datos\cap02\cartobase.gkp ejes_viales
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/179659508-a4acc1eb-e5e9-4def-8f98-7f1f87f4dcaa.png"/></p>

**Paso 2.** Importar la capa utilizando el comando **ogr2ogr**.

```
ogr2ogr ^
    -f PostgreSQL ^
    -a_srs EPSG:4326 ^
    PG:"host=localhost dbname=lore user=postgres password=postgres" ^
    -lco SCHEMA=data ^
    -lco GEOMETRY_NAME=geom ^
    -nlt MULTILINESTRING ^
    -nln ejes_viales ^
    D:\datos\cap02\cartobase.gpkg ejes_viales
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/179660219-58819cfa-b5d0-433c-9635-0fead227a721.png"/></p>

**Paso 3.** Verificar que el archivo se importó correctamente.

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/180440704-fd9798ca-92e6-4cda-9d52-4f9444af6125.png"/></p>

#### 3.3. Importar GeoJSON

**Paso 1**: Repetir los pasos con la capa de "**manzanas**" que se encuentra en formato GeoJSON

```
ogrinfo -al -so D:\datos\cap02\manzanas.geojson
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/179657887-9e4725b5-7cf7-4aac-b297-1f9bb47f1d66.png"/></p>

**Paso 2.** Importar la capa utilizando el comando **ogr2ogr**.

```
ogr2ogr ^
    -f PostgreSQL ^
    -a_srs EPSG:4326 ^
    PG:"host=localhost dbname=lore user=postgres password=postgres" ^
    -lco SCHEMA=data ^
    -lco GEOMETRY_NAME=geom ^ 
    -nln manzanas ^
    D:\datos\cap02\manzanas.geojson
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/179660394-760f7c03-8fec-4ac1-848f-4f2f16693f05.png"/></p>

**Paso 3.** Verificar que el archivo se importó correctamente.

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/180440869-d7046e31-8ada-4f0a-8959-305616f8b170.png"/></p>

## 4. Importar ráster con el comando raster2pgsql

La utilidad **raster2pgsql** es una herramienta de linea de comandos que permite convertir archivos de formatos ráster, compatibles con GDAL, a SQL especialmente diseñado para su insercción en una base de datos espacial.

**Sintaxis**

```
raster2pgsql [<options>] <raster>[ <raster>[ ...]] [[<schema>.]<table>]

También se pueden especificar varios rásteres mediante comodines (*,?).
 ```

Opciones:

* **-s \<srid\>**: Establece el Sistema de Coordenadas (SRID). El valor predeterminado es 0. Si no se proporciona el SRID o es 0, se verificarán los metadatos del ráster para determinar un SRID apropiado.
* **-b \<banda\>**: Índice (Establecido en 1) de la banda para extraer del ráster. Para más de un índice de banda, sepárelos con una coma (,). Los rangos se pueden definir separándolos con un guión (-). Si no se especifica, se extraerán todas las bandas de ráster.
* **-t \<tamaño de mosaico\>**: Corta el ráster en mosaicos para insertar uno por fila en la tabla. El **\<tamaño de mosaico\>** se expresa como ANCHO x ALTO. El **\<tamaño de mosaico\>** también puede ser "automático" para permitir que al cargar calcule un tamaño de mosaico apropiado usando el primer ráster y aplicarlo a todos los rásteres.
* **-P**: Rellena los mosaicos más a la derecha y más abajo para garantizar que todos los mosaicos tengan el mismo ancho y alto.
* **-R**: Registra el ráster como un ráster de sistema de archivos (out-db). Solo los metadatos del ráster y la ubicación de la ruta al ráster se almacenan en la base de datos (no los píxeles).
* **(-d\|a\|c\|p)**: Estas son opciones mutuamente excluyentes:
    * **-d**: Elimina la tabla, luego la vuelve a crear y la completa con los datos ráster actuales.
    * **-a**: Agrega el ráster a la tabla actual. Debe ser exactamente el mismo esquema de tabla.
    * **-c**: Crea una nueva tabla y la llena con los datos. Este es el valor predeterminado.
    * **-p**: Modo preparar, solo crea la tabla.
* **-f \<columnna\>**: Especifica el nombre de la columna ráster (principalmente útil en el modo de adición "-a").
* **-F**: Agrega una columna con el nombre de archivo del ráster.
* **-n \<columna\>**: Especifica el nombre de la columna de nombre de archivo. Implica -F.
* **-I**: Crea un índice espacial GIST en la columna ráster. El comando ANALYZE se emitirá automáticamente para el índice creado.
* **-M**: Ejecuta un VACUUM ANALYZE en la tabla de la columna ráster. Es útil cuando se agrega un ráster a una tabla existente con -a.
* **-C**: Establece el conjunto estándar de restricciones en la columna de ráster después de cargar los rásteres. Algunas restricciones pueden fallar si uno o más rásteres violan la restricción.
* **-x**: Desactiva la configuración de la restricción de extensión máxima. Solo se aplica si también se usa el indicador -C.
* **-r**: Establece las restricciones (espacialmente único y mosaico de cobertura) para el bloqueo regular. Solo se aplica si también se usa el indicador -C.
* **-T \<tablespace\>**: Especifica el tablespace para la nueva tabla. Tenga en cuenta que los índices (incluida la clave principal) seguirán utilizando el espacio de tabla predeterminado a menos que también se utilice el indicador -X.
* **-X \<tablespace\>**: Especifica el tablespace para el nuevo índice de la tabla. Esto se aplica a la clave principal y al índice espacial si se usa el indicador -I.
* **-N \<nodata\>**: Valor NODATA para usar en bandas sin un valor.
* **-k**: Omite las comprobaciones de valor de NODATA para cada banda de ráster.
* **-e**: Ejecuta cada declaración individualmente, no usa una transacción.
* **-Y**: Usa sentencias COPY en lugar de sentencias INSERT.
* **-G**: Imprime los formatos de trama GDAL admitidos.
* **-?**: Muestra la ayuda.

### PRACTICA

Para esta práctica, importaremos un Modelo de Elevación Digital (DEM) descargado del geoservidor del MINAM. A continuación, se detalla el flujo a seguir:

**Paso 1.** Explorar el DEM con su GIS favorito. Para este ejemplo, consultaremos su información utilizando **gdalinfo**:

```
gdalinfo D:\datos\cap02\ASTGTM_S07W077_dem.tif
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/180761256-140ac713-b27a-4c6c-94b5-93be6fd6d7cf.png"/></p>

De la imagen observamos:

* Contolador: GTiff/GeoTIFF
* Tamaño: 3601X3601
* Bandas: 1 banda de tipo entero.
* Coordenadas: WGS 84 - EPSG:4326

**Paso 2.** Convertir el archivo ráster a SQL

```
raster2pgsql -s 4326 -I -C -F -M -t 100x100 ^
D:\datos\cap02\ASTGTM_S07W077_dem.tif data.dem_s07w007 > 
```

__Donde:__

* **-s**: Especificar el sistema de referencia WGS84 (EPSG 4326).
* **-I**: Crear un índice espacial.
* **-C**: Especificar el nombre de la geocolumna como: "geom".
* **-F**: Agregar una columna con el nombre de archivo del ráster.
* **-M**: Ejecutar un VACUUM ANALYZE en la tabla de la columna ráster.
* **-t**: Cortar el ráster en mosaicos de 100x100.
* **"D:\datos\cap02\ASTGTM_S07W077_dem.tif"**: Indicar el raster de entrada (incluye la ruta).
* **data.dem_s07w007**: Indicar el nombre con la que se creará la tabla SQL (incluye el esquema).
* **\>**: Redirigir la salida del comando raster2pgsql a un archivo (en este caso un archivo sql).
* **D:\datos\cap02\dem.sql**: Indicar el nombre de salida del archivo SQL (incluye la ruta).

**Paso 4.** Ejecutar el archivo SQL en la base de datos.

```
psql -U postgres -d lore -f "D:\datos\cap02\dem.sql"
```

**Paso 5.** Verificar que el archivo se importó correctamente.

Consultar la vista de metadatos ráster

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/180764628-1c88a70c-89c7-49fd-91bf-e7cf02a7968f.png"/></p>

Visualizar el raster con Qgis

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/180767923-08b18cb1-9bb6-4403-bc0a-bb47d46c7db0.png"/></p>

## Referencias

https://www.postgresql.org/docs/current/sql-copy.html

https://postgis.net/docs/using_postgis_dbmanagement.html

https://gdal.org/

https://postgis.net/docs/using_raster_dataman.html#RT_Loading_Rasters
