# Fusion360API Python

import traceback
import adsk.fusion
import adsk.core
import urllib
import json

# value(onk key, using link occ)
KEYMAP = {
    "Component": {
        'onkKey': "",
        'linkOcc' : True,
        },
    "Origin": {
        'onkKey': "OriginWorkGeometry",
        'linkOcc' : True,
        },
    "Analysis": {
        'onkKey': "VisualAnalyses",
        'linkOcc' : False,
        },
    "Joint Origins": {
        'onkKey': "JointOrigins",
        'linkOcc' : False,
        },
    "Joints": {
        'onkKey': "AssyConstraints",
        'linkOcc' : False,
        },
    "Bodies":{
        'onkKey': "Bds",
        'linkOcc' : True,
        },
    "Canvases":{
        'onkKey': "Canvases",
        'linkOcc' : False,
        },
    "Decals":{
        'onkKey': "Decals",
        'linkOcc' : False,
        },
    "Sketches":{
        'onkKey': "Sketches",
        'linkOcc' : True,
        },
    "Construction":{
        'onkKey': "WorkGeometries",
        'linkOcc' : True,
        },
}


# unit test
def run(context):
    ui = adsk.core.UserInterface.cast(None)
    try:
        app: adsk.core.Application = adsk.core.Application.get()
        ui = app.userInterface

        for key in KEYMAP.keys():
            setTreeFolderVisible(key, False)
        # # setAllVisible_Key('', False)
        ui.messageBox('全部消した！')

        for key in KEYMAP.keys():
            setTreeFolderVisible(key, True)
        # # setAllVisible_Key('', True)
        ui.messageBox('全部表示した！！')

    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))


# Tree Folder Visible
def setTreeFolderVisible(
    name: str,
    visible: bool) -> None:

    info = KEYMAP[name]
    onkKey = info['onkKey']
    linkOcc = info['linkOcc']

    # ここでlinkoccでリストを分ける
    onks = getAllOnk_Key_NotVisible(onkKey, visible, linkOcc)

    app: adsk.core.Application = adsk.core.Application.get()
    sels: adsk.core.Selections = app.userInterface.activeSelections
    sels.clear()

    for onk in onks:
        app.executeTextCommand(u'Commands.Select {}'.format(onk))

    app.executeTextCommand(u'NuComponents.VisibilityToggleCmd')
    sels.clear()


def getAllOnk_Key_NotVisible(
    key: str,
    visible: bool,
    linkOcc: bool) -> list:

    OccOnks = getAllOccOnk(linkOcc)
    if len(key) < 1:
        onks = OccOnks
    else:
        onks = [f'{o}/{key}' for o in OccOnks]

    # Analysisは別扱い
    fanc = isVisible_VisualAnalyses if key == 'VisualAnalyses' else isVisible_Onk
    return [onk for onk in onks if fanc(onk) != visible]


def isVisible_VisualAnalyses(
    onk: str) -> bool:

    try:
        app: adsk.core.Application = adsk.core.Application.get()
        sels: adsk.core.Selections = app.userInterface.activeSelections
        sels.clear()

        app.executeTextCommand(u'Commands.Select {}'.format(onk))

        paths = app.executeTextCommand(u'Selections.List')
        entId = paths.split(':')[-1]
        app.executeTextCommand(u'Selections.Clear')
        
        props = json.loads(
            app.executeTextCommand(u'PEntity.Properties {}'.format(entId))
        )

        for visible_Key in ("isVisible", "visible"):
            if not visible_Key in props:
                continue
            return 'TRUE' == f'{props[visible_Key]}'.upper()

        return False # これで良いのか？
    except:
        return False # これで良いのか？


def isVisible_Onk(
    onk: str) -> bool:

    try:
        app: adsk.core.Application = adsk.core.Application.get()
        sels: adsk.core.Selections = app.userInterface.activeSelections
        sels.clear()

        app.executeTextCommand(u'Commands.Select {}'.format(onk))
        # 解析だけ標示判断出来ていない！！
        res = app.executeTextCommand(u'VO.CheckPathVisibility')
        sels.clear()
        value = res.split('.')[0]

        return 'TRUE' == f'{value}'.upper()

    except:
        return False # これで良いのか？


def getAllOccOnk(
    linkOcc: bool) -> list:

    app: adsk.core.Application = adsk.core.Application.get()
    des: adsk.fusion.Design = app.activeProduct
    root: adsk.fusion.Component = des.rootComponent

    occ_comp_dict: dict = initDict_OccInfo()
    onks = [
        getRootOnk()
    ]

    if linkOcc:
        onks.extend(
            [getOccOnkDict(occ, occ_comp_dict)['onk'] for occ in root.allOccurrences]
        )
    else:
        for occ in root.allOccurrences:
            info = getOccOnkDict(occ, occ_comp_dict)
            if info['ref']:
                continue
        onks.extend(
            [info['onk'] for occ in root.allOccurrences]
        )

    return onks


def getOccOnkDict(
    occ: adsk.fusion.Occurrence,
    occ_comp_dict: dict) -> dict:

    onks = [
        getRootOnk(occ.component.parentDesign)
    ]

    paths = occ.fullPathName.split('+')
    refs = []
    for path in paths:
        onks.append(
            '/CmpInsts/CmpInst={}/Cmp={}'.format(
                urllib.parse.quote(path),
                urllib.parse.quote(occ_comp_dict[path]['name'])
            )
        )
        refs.append(occ_comp_dict[path]['ref'])
    
    return {
        'onk': ''.join(onks),
        'ref': any(refs)
    }


def initDict_OccInfo() -> dict:
    app: adsk.core.Application = adsk.core.Application.get()
    des: adsk.fusion.Design = app.activeProduct
    root: adsk.fusion.Component = des.rootComponent

    dict = {}
    for occ in root.allOccurrences:
        comp: adsk.fusion.Component = occ.component
        dict[occ.name] = {
            'name': comp.name,
            'ref': occ.isReferencedComponent
        }

    return dict


def getRootOnk(
    des: adsk.fusion.Design = None) -> str:

    if not des:
        app: adsk.core.Application = adsk.core.Application.get()
        des = app.activeProduct

    root: adsk.fusion.Component = des.rootComponent
    return ''.join(
        f'ONK::CmpInst={urllib.parse.quote(root.name)}/Cmp={urllib.parse.quote(root.name)}'
    )