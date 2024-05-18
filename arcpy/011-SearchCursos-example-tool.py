'''
Ejercicio:
----------------------------------------------------------------------
Hacer una script que tome un archivo vectorial y realice un análisis
exploratorio de datos para campos numéricos: Media, Min, Max, etc.
'''
# Importar librerías
import arcpy
import numpy as np
import pandas as pd

# Parametros
inLayer = arcpy.GetParameterAsText(0)       # Capa de entrada
outTxt = arcpy.GetParameterAsText(1)        # Capa de salida

# Geoprocesamiento: Fields: Iterar los campos
listStats = list()      # Lista que almacenará los estadisticos de todos los campos
for field in arcpy.ListFields(inLayer):
    # Lista que almacenará los valores de cada campo
    valueField = list()
    # Procesar solo campos de tipo numéricos
    if field.type in ('Double', 'Integer'):
        # Acceder a los atributos con el cursor de búsqueda
        with arcpy.da.SearchCursor(inLayer, field.name) as cursor:
            # Iterar el cursor para acceder a la fila
            for row in cursor:
                valueField.append(row[0])    # Agregar los valores del campo a una lista
            # Convertir lista a np.array para realizar calculos estadisticos
            arr = np.array(valueField)
            # Agregar al resultado
            listStats.append([field.name,              # nombre del campo
                              arr.shape[0],             # total de registros
                              (~np.isnan(arr)).sum(),   # cantidad de registros no nulos
                              np.count_nonzero(arr),    # cantidad de registros diferente de zero
                              arr.max(),                # valor maximo
                              arr.min(),                # valo minimo
                              arr.mean(),               # Media
                              np.quantile(arr, 0.25),   # Primer cuartil
                              np.quantile(arr, 0.5),    # Segundo cuartil
                              np.quantile(arr, 0.75)]   # Tercer cuartil
                            )

# Output: Capa de salida
header = ['name', 'rows', 'not_null', 'not_zero', 'max', 'min', 'mean', 'q1', 'q2', 'q3']
dfResult = pd.DataFrame(listStats, columns=header)
# Exportar como csv
dfResult.to_csv(outTxt, sep=',', index=False)

