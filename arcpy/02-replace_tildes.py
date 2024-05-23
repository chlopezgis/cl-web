# Importar librerias
import arcpy

class DataCleaning:
    # Constructor
    def __init__(self):
        self.inLayer = arcpy.GetParameterAsText(0)
        self.dicReplace = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
                           'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'}

    # Función Obtener campos
    def getFields(self):
        return [field.name for field in arcpy.ListFields(self.inLayer, field_type='String')]

    # Funcion: Reemplazar Tildes
    def replaceTildes(self):
        # Obtener los campos
        self.nameFields = self.getFields()
        # Iterar columnas para reemplazar tildes:
        for field in self.nameFields:
            with arcpy.da.UpdateCursor(self.inLayer, field) as cursor:
                for row in cursor:
                    for key, value in self.dicReplace.items():
                        row[0] = row[0].replace(key, value)
                        cursor.updateRow(row)

if __name__ == '__main__':
    obj = DataCleaning()
    obj.replaceTildes()