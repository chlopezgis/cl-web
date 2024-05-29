import arcpy
import numpy as np
import pandas as pd

class AnalysisData:

    def __init__(self):
        self.inLayer = arcpy.GetParameterAsText(0)
        self.inField = arcpy.GetParameterAsText(1)
        self.valueField = arcpy.GetParameterAsText(2)
        self.output = arcpy.GetParameterAsText(3)

    def selectFeatures(self):
        delimiter = arcpy.AddFieldDelimiters(self.inLayer, self.inField)
        sql_where = delimiter + " = '{0}'".format(self.valueField)
        selection = arcpy.Select_analysis(self.inLayer, 'selection', sql_where)
        return selection

    def getStats(self, layer, field):
        with arcpy.da.SearchCursor(layer, field.name) as cursor:
            valuesRow = list()
            for row in cursor:
                valuesRow.append(row[0])
            arr = np.array(valuesRow)
            return ([arr.shape[0],
                     np.sum(~np.isnan(arr)),
                     np.count_nonzero(arr),
                     np.max(arr),
                     np.min(arr)])

    def calculateStats(self):
        inLayer = self.selectFeatures()
        fields = [field for field in arcpy.ListFields(inLayer)]
        result = list()
        for field in fields:
            if field.type in ('Integer', 'Double'):
                result.append([field.name] + self.getStats(inLayer, field))
        return result

    def runProcess(self):
        stats = self.calculateStats()
        header = ['field', 'rows', 'no-nulos', 'no-ceros', 'max', 'min']
        data = pd.DataFrame(stats, columns=header)
        return data.to_csv(self.output, index=False)

if __name__ == '__main__':
    obj = AnalysisData()
    obj.runProcess()