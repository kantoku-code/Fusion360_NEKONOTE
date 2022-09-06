# Fusion360API Python
# NEKONOTE

from enum import Enum, auto

class Dirname(Enum):
    Origin = auto()
    Analysis = auto()
    Joint_Origins = auto()
    Joints = auto()
    Bodies = auto()
    Canvases = auto()
    Decals = auto()
    Sketches = auto()
    Construction = auto()

class Scope(Enum):
    ALL = auto()
    ACTIVE = auto()
    CHILDREN = auto()

# FOLDER_NAME_INFO = {
#     # "Component": {
#     #     'onkKey': "",
#     #     'linkOcc' : True,
#     #     },
#     "Origin": {
#         'onkKey': "OriginWorkGeometry",
#         'linkOcc' : True,
#         },
#     "Analysis": {
#         'onkKey': "VisualAnalyses",
#         'linkOcc' : False,
#         },
#     "Joint Origins": {
#         'onkKey': "JointOrigins",
#         'linkOcc' : False,
#         },
#     "Joints": {
#         'onkKey': "AssyConstraints",
#         'linkOcc' : False,
#         },
#     "Bodies":{
#         'onkKey': "Bds",
#         'linkOcc' : True,
#         },
#     "Canvases":{
#         'onkKey': "Canvases",
#         'linkOcc' : False,
#         },
#     "Decals":{
#         'onkKey': "Decals",
#         'linkOcc' : False,
#         },
#     "Sketches":{
#         'onkKey': "Sketches",
#         'linkOcc' : True,
#         },
#     "Construction":{
#         'onkKey': "WorkGeometries",
#         'linkOcc' : True,
#         },
# }


# SCOPE_TYPE = {
#     'all': 'all',
#     'active': 'active',
#     'children': 'children',
# }