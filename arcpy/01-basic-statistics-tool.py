'''
Script:         Calcular Estadisticas Básicas
Descripción:    Script que tome un archivo vectorial y realiza un análisis
                exploratorio de datos para campos numéricos: Media, Min, Max, etc.
Autor:          Charlie Lopez (chlopezgis@gmail.com)
Version:        2.0
'''

# Importar librerías
import arcpy
import numpy as np
import pandas as pd

class AnalisisExploratorio:

    # Constructor
    def __init__(self):
        self.inLayer = arcpy.GetParameterAsText(0)       # Capa de entrada
        self.outTxt = arcpy.GetParameterAsText(1)        # Capa de salida
        # Cabecera del CSV de salida
        self.header = ['name', 'rows', 'not_null', 'not_zero', 
                       'max', 'min', 'mean', 'q1', 'q2', 'q3']

    # Función: Obtener una lista con los valores de un campo (solo de tipo numérico)
    def calculateListValues(self, nameField):
        # Variable de retorno
        self.listValueField = list()
        # Acceder a los valores del campo con el cursor de búsqueda
        with arcpy.da.SearchCursor(self.inLayer, nameField) as cursor:
            for row in cursor:
                self.listValueField.append(row[0])
        # Retorno de funcion
        return self.listValueField

    # Función: Calcular las estadisticas de un lista de valores (solo numéricos)
    def statsFields(self, listValues):
        # Convertir lista a un arreglo numpy
        self.arr = np.array(listValues)
        # Retorno de función
        return [self.arr.shape[0],             # total de registros
                (~np.isnan(self.arr)).sum(),   # cantidad de registros no nulos
                np.count_nonzero(self.arr),    # cantidad de registros diferente de zero
                np.max(self.arr),              # valor maximo
                np.min(self.arr),              # valor minimo
                np.mean(self.arr),             # Media
                np.quantile(self.arr, 0.25),   # Primer cuartil
                np.quantile(self.arr, 0.5),    # Segundo cuartil
                np.quantile(self.arr, 0.75)]   # Tercer cuartil

    # Funcion: Ejecutar calculo de estadisticas para todos los campos númericos
    def calculateStatsFields(self):
        # Lista que almacenará los estadisticos de todos los campos
        self.listStats = list()
        # Iterar los campos
        for field in arcpy.ListFields(self.inLayer):
            # Procesar solo campos de tipo numéricos
            if field.type in ('Double', 'Integer'):
                # Lista que almacenará los valores de un campo numérico
                self.listValues = self.calculateListValues(field.name)
                # Calculo de estatidicas a partir de una lista de valores numéricos
                self.statsField = self.statsFields(self.listValues)
                # Agregar a la lista con estadisticas el nombre del campo
                self.statsField = [field.name] + self.statsField
                # Agregar las estadistica del campo a lista que almacenará todos los resultados
                self.listStats.append(self.statsField)
        # Retorno de la función
        return self.listStats

    # Funcion: Ejecutar proceso
    def executeProcessing(self):
        # Calcular estadisticas para todos los campos numéricos
        self.listAllStats = self.calculateStatsFields()
        # Convertir lista a DataFrame
        self.dfResult = pd.DataFrame(self.listAllStats,
                                     columns=self.header)
        # Exportar como csv
        return self.dfResult.to_csv(self.outTxt,
                                    sep=',',
                                    index=False)

if __name__ == '__main__':
    obj = AnalisisExploratorio()
    obj.executeProcessing()
