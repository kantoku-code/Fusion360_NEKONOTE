# Fusion360API Python

import traceback
import adsk.fusion
import adsk.core
import urllib
import json
from .enums import Dirname, Scope

DIR_CONTAINER = {
    Dirname.Origin: {
        'onkKey': "OriginWorkGeometry",
        'linkOcc' : True,
        },
    Dirname.Analysis: {
        'onkKey': "VisualAnalyses",
        'linkOcc' : False,
        },
    Dirname.Joint_Origins: {
        'onkKey': "JointOrigins",
        'linkOcc' : False,
        },
    Dirname.Joints: {
        'onkKey': "AssyConstraints",
        'linkOcc' : False,
        },
    Dirname.Bodies:{
        'onkKey': "Bds",
        'linkOcc' : True,
        },
    Dirname.Canvases:{
        'onkKey': "Canvases",
        'linkOcc' : False,
        },
    Dirname.Decals:{
        'onkKey': "Decals",
        'linkOcc' : False,
        },
    Dirname.Sketches:{
        'onkKey': "Sketches",
        'linkOcc' : True,
        },
    Dirname.Construction:{
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
        des: adsk.fusion.Design = app.activeProduct
        root: adsk.fusion.Component = des.rootComponent

        scope = Scope.ALL

        for key in DIR_CONTAINER.keys():
            setTreeFolderVisible(key, False, scope)
        # # setAllVisible_Key('', False)
        ui.messageBox('全部消した！')

        for key in DIR_CONTAINER.keys():
            setTreeFolderVisible(key, True, scope)
        # # # setAllVisible_Key('', True)
        ui.messageBox('全部表示した！！')


    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))


# Tree Folder Visible
def setTreeFolderVisible(
    name: Dirname,
    visible: bool,
    scope: Scope) -> None:

    if not isLightBulbOn_RootComp():
        return []

    if not scope in Scope:
        return

    info = DIR_CONTAINER[name]
    onkKey = info['onkKey']
    linkOcc = info['linkOcc']

    onks = getAllOnk_Key_NotVisible(onkKey, visible, linkOcc, scope)

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
    linkOcc: bool,
    scope: Scope,) -> list:

    OccOnks = getAllOccOnk(linkOcc, scope)
    if len(key) < 1:
        onks = OccOnks
    else:
        onks = [f'{o}/{key}' for o in OccOnks]

    # Analysisは別扱い
    func = isVisible_VisualAnalyses if key == 'VisualAnalyses' else isVisible_Onk
    return [onk for onk in onks if func(onk) != visible]


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
        res = app.executeTextCommand(u'VO.CheckPathVisibility')
        sels.clear()
        value = res.split('.')[0]

        return 'TRUE' == f'{value}'.upper()

    except:
        return False # これで良いのか？


def getAllOccOnk(
    linkOcc: bool,
    scope: Scope,) -> list:

    app: adsk.core.Application = adsk.core.Application.get()
    des: adsk.fusion.Design = app.activeProduct
    root: adsk.fusion.Component = des.rootComponent

    occ_comp_dict: dict = initDict_OccInfo(scope)

    onks = []
    if scope == Scope.ALL:
        onks.append(getRootOnk())
    else:
        if des.activeComponent == root:
            onks.append(getRootOnk())
        else:
            occ: adsk.fusion.Occurrence = des.activeOccurrence

            if not occ.isLightBulbOn:
                return []

            info = getOccOnkDict(occ, occ_comp_dict)
            if all([not linkOcc, info['ref']]):
                return []

        if scope == Scope.ACTIVE:
            return [info['onk']]

    # RootでScope.CHILDRENはALLと同じ
    if des.activeComponent == root:
        scope = Scope.ALL

    actOcc: adsk.fusion.Occurrence = des.activeOccurrence
    for occ in root.allOccurrences:
        occ: adsk.fusion.Occurrence

        if not occ.isLightBulbOn:
            continue

        if scope == Scope.CHILDREN:
            if not (actOcc.name in occ.fullPathName.split('+')):
                continue

        info = getOccOnkDict(occ, occ_comp_dict)

        if all([not linkOcc, info['ref']]):
            continue

        onks.append(info['onk'])

    return set(onks)


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


def initDict_OccInfo(
    scope: Scope,) -> dict:

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

    # Scope.CHILDREN用にactiveOccurrenceは参照無しとする
    if scope != Scope.ALL:
        actOcc: adsk.fusion.Occurrence = des.activeOccurrence
        if actOcc:
            paths = actOcc.fullPathName.split('+')
            idx = paths.index(actOcc.name)
            for key in paths[:idx + 1]:
                dict[key]['ref'] = False

    return dict


def getRootOnk(
    des: adsk.fusion.Design = None) -> str:

    if not des:
        app: adsk.core.Application = adsk.core.Application.get()
        des = app.activeProduct

    root: adsk.fusion.Component = des.rootComponent
    return ''.join([
        f'ONK::CmpInst={urllib.parse.quote(root.name)}',
        f'/Cmp={urllib.parse.quote(root.name)}'
    ])


def isLightBulbOn_RootComp():
    app: adsk.core.Application = adsk.core.Application.get()

    sels: adsk.core.Selections = app.userInterface.activeSelections
    sels.clear()

    root: adsk.fusion.Component = app.activeProduct.rootComponent
    sels.add(root)

    res = app.executeTextCommand(u'VO.CheckPathVisibility')
    sels.clear()

    return res.split('.')[0].upper() == 'TRUE'