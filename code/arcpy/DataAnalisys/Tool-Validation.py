class ToolValidator:
  # Class to add custom behavior and properties to the tool and tool parameters.

    def __init__(self):
        # set self.params for use in other function
        self.params = arcpy.GetParameterInfo()

    def initializeParameters(self):
        # Customize parameter properties. 
        # This gets called when the tool is opened.
        return

    def updateParameters(self):
        # Modify parameter values and properties.
        # This gets called each time a parameter is modified, before 
        # standard validation.
        
        # Update params[0]
        inLayer = self.params[0].valueAsText
        fields = arcpy.ListFields(inLayer, field_type='String')
        self.params[1].filter.list = sorted([field.name for field in fields])
        
        # Update params[1]
        inField = self.params[1].valueAsText
        self.params[2].filter.list = sorted(
                                list(
                                    set([row[0] for row in arcpy.da.SearchCursor(inLayer, inField)])
                                    )
                                )

    def updateMessages(self):
        # Customize messages for the parameters.
        # This gets called after standard validation.
        return

    # def isLicensed(self):
    #     # set tool isLicensed.
    # return True

    # def postExecute(self):
    #     # This method takes place after outputs are processed and
    #     # added to the display.
    # return
