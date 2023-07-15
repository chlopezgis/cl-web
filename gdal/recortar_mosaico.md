# Recortar un mosaico de imagenes con GDAL

Hace poco, en un grupo de SIG, leí un post donde preguntaban como recortar un mosaico de gran tamaño de forma eficiente. El usuario indicaba que al tratar de realizar este proceso desde un SIG de escritorio el proceso tardaba horas e incluso días sin ejecutarse.

Existen muchas formas eficientes de abordar este problema, como usar softwares especializados en el procesamiento digital de imágenes. Sin embargo, en este tutorial abordaremos el uso de la biblioteca GDAL como alternativa de solución a este problema.

## ¿Porqué usar GDAL?

GDAL/OGR es una biblioteca traductora para formatos de datos geoespaciales, que además proporciona un conjunto de herramientas para el tratamiento de estos datos. Se publica bajo una licencia de código abierto de estilo MIT por parte de la Fundación Geoespacial de Código Abierto (OSGEO).

A continuación se detallan los motivos para utilizar GDAL:

* Procesar datos Geospaciales de manera eficiente.
* Repetir los pasos de procesamiento para diferentes conjuntos de datos.

## Fuente de datos

Para el desarrollo de este tutorial se utilizaron las imagenes ASTER GDEM de descarga de gratuita, desde los geoservidores del Ministerio del Ambiente de Perú (MINAM). Puedes realizar la descarga del siguiente [link](https://geoservidorperu.minam.gob.pe/geoservidor/download_raster.aspx)

## Empezemos...

Como primer paso debemos guardar todas las imagenes en una carpeta de trabajo

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/190855386-b4e57497-47fc-4c64-bc84-481fd6e340f6.png"/></p>

Acceder a esta carpeta utilizando el simbolo del sistema de windows (cmd)

```
>D:
>cd <ruta_de_la_carpeta>
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/190856203-29402f7a-3f09-4869-9b52-d068a262a246.png"/></p>

Podemos inspeccionar las imagenes con `gdalinfo` para comprobar que tengan las misma carácteristicas: Número de bandas (Como son DEM tienen 1 banda), sistemas de referencia, tamaño del pixel, entre otros.

```
gdalinfo S09W078.tif
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/190857092-66138c42-0cea-4f2d-b5a2-364de4d7d1e7.png"/></p>

Para generar el mosaico de imagenes utilizaremos el programa `gdalbuildvrt`. Este programa construye un conjunto de datos virtual (VTR) a partir de una lista de conjuntos de datos de entrada. La lista de conjuntos de datos se puede especificar al final de la línea de comando, o colocarse en un **archivo de texto** para listas muy largas.

> Es necesario indicar que `gdalbuildvrt` realiza una serie de comprobaciones para asegurarse de que todos los archivos que se colocarán en el VRT resultante tengan características similares: número de bandas, sistema de referencia, interpretación del color. De lo contrario, se omitirán los archivos que no coincidan con las características comunes.

Para este ejercicio utilizaremos un archivo de texto con el nombre de los archivos de entrada que formaran el mosaico. Para esto debemos ejecutar, desde el simbolo del sistema, el comando dir con un patron que liste los archivos .tif como se muestra a continuación:

```
dir /b *.tif > lista_dems.txt
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/190856226-27eece55-0468-4412-ad2d-dba8a63385fa.png"/></p>

Verificar que el archivo contenga los nombres de los archivos .tif que formaran el mosaico

```
type lista_dems.txt
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/190856261-86786d96-ff42-41f2-b146-ddcf4fa27943.png"/></p>

Con esto, ya estamos listo para generar el mosaico virtual, para ello ejecutar el siguiente comando:

```
gdalbuildvrt -input_file_list lista_dems.txt -vrtnodata 9999 mosaico.vrt
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/190856437-0ee2eb13-7d49-4b2f-bfe9-29e058b46b48.png"/></p>

Podemos comparar las imagenes originales y el mosaico virtual que hemos fusionado.

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/190856643-cc4cba19-8cee-46da-9f72-793e2ddb8905.png"/></p>

Ahora, con la utilidad `gdalwarp` vamos a recortar el mosasico virtual. El recorte se realizará con la capa del departamento de Ancash.

```
gdalwarp -cutline D:\SHP\Ancash.shp -crop_to_cutline mosaico.vrt -dstnodata 9999 mosaico_cut.tif
```

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/190856960-6b534fe7-66e4-4c91-aded-b805cb3267a1.png"/></p>

Una vez finalizado el proceso, tendremos como resultado la imagen enmascarada y en formato TIF

<p align="center"><img src = "https://user-images.githubusercontent.com/88239150/190856909-cc7c0208-244f-45d2-bdad-6143e7bd9a85.png"/></p>

## Referencias

https://gdal.org/programs/gdalbuildvrt.html

https://gdal.org/programs/gdalwarp.html


