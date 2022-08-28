import adsk.core
import json

# Tree Folder Visible
def setTreeFolderVisible(key: str, value: bool):

    def getVisualAnalysesPaths() -> str:
        app: adsk.core.Application = adsk.core.Application.get()
        rootOccId = app.executeTextCommand(u'PEntity.ID rootInstance')
        rootComp = getPorpsKey(rootOccId, "rTargetComponent")
        analysesId = app.executeTextCommand(u'PEntity.ID VisualAnalyses')

        return f'{rootOccId}:{rootComp["entityId"]}:{analysesId}'

    def getIdsPaths() -> list:
        occPaths = getOccPaths()
        compIds = getTargetComponentIds(occPaths)
        originIds = getPorpsKeyIds(compIds, key)

        pathsLst = []
        for lst in zip(occPaths, compIds, originIds):
            pathsLst.append(':'.join(lst))

        return pathsLst
    # ************

    app: adsk.core.Application = adsk.core.Application.get()
    sels: adsk.core.Selections = app.userInterface.activeSelections
    sels.clear()

    ents: list = []
    if key == "VisualAnalyses":
        ents.append(getVisualAnalysesPaths())
    else:
        ents = getIdsPaths()

    ents = [paths for paths in ents if isVisible(paths) != value]
    if len(ents) < 1:
        return

    for paths in ents:
        try:
            app.executeTextCommand(u'Selections.Add {}'.format(paths))
        except:
            pass

    app.executeTextCommand(u'Commands.Start VisibilityToggleCmd')
    sels.clear()

# ****************
def isVisible(paths) -> bool:
    try:
        props = getPorps(paths)
        for visible_Key in ("isVisible", "visible"):
            if not visible_Key in props:
                continue
            return getPorpsKey(paths, visible_Key)

    except:
        return False
    # "isVisible", "visible" 以外はNone = Falseを返すが良いのか?


def getTargetComponentIds(lst) -> list:
    return getPorpsKeyIds(lst, "rTargetComponent")


def getPorpsKeyIds(lst, key) -> list:
    idsLst = []
    for paths in lst:
        try:
            res = getPorpsKey(paths, key)
            idsLst.append(str(res['entityId']))
        except:
            idsLst.append('-1')

    return idsLst


def getPorpsKey(paths, key = '') -> str:
    app: adsk.core.Application = adsk.core.Application.get()

    try:
        id = paths.split(':')[-1]

        props = getPorps(paths)
        return props[key]
    except:
        return '-1'


def getPorps(paths) -> dict:
    app: adsk.core.Application = adsk.core.Application.get()

    try:
        id = paths.split(':')[-1]

        props = json.loads(
            app.executeTextCommand(u'PEntity.Properties {}'.format(id))
        )

        return props
    except:
        return '-1'


def getOccPaths() -> list:
    app: adsk.core.Application = adsk.core.Application.get()

    def getAllOccIds() -> list:
        app: adsk.core.Application = adsk.core.Application.get()
        res = app.executeTextCommand(u'PEntity.Properties ComponentInstancesRoot')
        compInstancesProps = json.loads(res)

        ids = []
        for info in compInstancesProps["rooted"]:
            id = info["entityId"]
            if id < 0:
                continue
            ids.append(id)

        return ids

    def getOccFullPaths(id: int):
        entId = id
        stackIds = [id]
        while True:
            pass
            prop = getPorpsKey(str(entId), "rParent")
            if not 'entityId' in prop:
                break
            entId = prop['entityId']
            if entId < 0:
                break
            stackIds.append(entId)

        return ':'.join([str(id) for id in stackIds[::-1]])

    # *************
    occIds = getAllOccIds()
    pathsLst = [getOccFullPaths(id) for id in occIds]
    pathsLst.append(
        str(
            app.executeTextCommand(u'PEntity.ID rootInstance')
        )
    )
    return pathsLst