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