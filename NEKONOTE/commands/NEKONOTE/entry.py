import json
import adsk.core
import os
from ...lib import fusion360utils as futil
from ... import config
from datetime import datetime

app = adsk.core.Application.get()
ui = app.userInterface

# TODO ********************* Change these names *********************
CMD_ID = f'{config.COMPANY_NAME}_{config.ADDIN_NAME}_nekonote'
CMD_NAME = 'NEKONOTE'
CMD_Description = 'A Fusion 360 Add-in Palette'
PALETTE_NAME = '🐾 NEKONOTE 🐾'
IS_PROMOTED = False

# Using "global" variables by referencing values from /config.py
PALETTE_ID = config.sample_palette_id

# Specify the full path to the local html. You can also use a web URL
# such as 'https://www.autodesk.com/'
PALETTE_URL = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'resources', 'html', 'index.html')

# The path function builds a valid OS path. This fixes it to be a valid local URL.
PALETTE_URL = PALETTE_URL.replace('\\', '/')

# Set a default docking behavior for the palette
PALETTE_DOCKING = adsk.core.PaletteDockingStates.PaletteDockStateFloating #adsk.core.PaletteDockingStates.PaletteDockStateRight

# TODO *** Define the location where the command button will be created. ***
# This is done by specifying the workspace, the tab, and the panel, and the 
# command it will be inserted beside. Not providing the command to position it
# will insert it at the end.
WORKSPACE_ID = 'FusionSolidEnvironment'
PANEL_ID = 'SolidScriptsAddinsPanel'
COMMAND_BESIDE_ID = 'ScriptsManagerCommand'

# Resource location for command icons, here we assume a sub folder in this directory named "resources".
ICON_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'resources', '')

# Local list of event handlers used to maintain a reference so
# they are not released and garbage collected.
local_handlers = []


KEYMAP = {
    "OriginWorkGeometry": "rOriginWorkGeometry",
    "JointOrigins": "rJointOrigins",
    "AssyConstraints": "rAssyConstraints",
    "Bodies": "rBodies",
    "Sketches": "rSketches",
    "Canvases": "rCanvases",
    "DecalPatches": "rDecalPatches",
    "WorkGeometries": "rWorkGeometries",
    "WorkGeometries": "rWorkGeometries",
    "VisualAnalyses": "VisualAnalyses",
}



# Executed when add-in is run.
def start():
    # Create a command Definition.
    cmd_def = ui.commandDefinitions.addButtonDefinition(CMD_ID, CMD_NAME, CMD_Description, ICON_FOLDER)

    # Add command created handler. The function passed here will be executed when the command is executed.
    futil.add_handler(cmd_def.commandCreated, command_created)

    # ******** Add a button into the UI so the user can run the command. ********
    # Get the target workspace the button will be created in.
    workspace = ui.workspaces.itemById(WORKSPACE_ID)

    # Get the panel the button will be created in.
    panel = workspace.toolbarPanels.itemById(PANEL_ID)

    # Create the button command control in the UI after the specified existing command.
    control = panel.controls.addCommand(cmd_def, COMMAND_BESIDE_ID, False)

    # Specify if the command is promoted to the main toolbar. 
    control.isPromoted = IS_PROMOTED


# Executed when add-in is stopped.
def stop():
    # Get the various UI elements for this command
    workspace = ui.workspaces.itemById(WORKSPACE_ID)
    panel = workspace.toolbarPanels.itemById(PANEL_ID)
    command_control = panel.controls.itemById(CMD_ID)
    command_definition = ui.commandDefinitions.itemById(CMD_ID)
    palette = ui.palettes.itemById(PALETTE_ID)

    # Delete the button command control
    if command_control:
        command_control.deleteMe()

    # Delete the command definition
    if command_definition:
        command_definition.deleteMe()

    # Delete the Palette
    if palette:
        palette.deleteMe()


# Event handler that is called when the user clicks the command button in the UI.
# To have a dialog, you create the desired command inputs here. If you don't need
# a dialog, don't create any inputs and the execute event will be immediately fired.
# You also need to connect to any command related events here.
def command_created(args: adsk.core.CommandCreatedEventArgs):
    # General logging for debug.
    futil.log(f'{CMD_NAME}: Command created event.')

    # Create the event handlers you will need for this instance of the command
    futil.add_handler(args.command.execute, command_execute, local_handlers=local_handlers)
    futil.add_handler(args.command.destroy, command_destroy, local_handlers=local_handlers)


# Because no command inputs are being added in the command created event, the execute
# event is immediately fired.
def command_execute(args: adsk.core.CommandEventArgs):
    # General logging for debug.
    futil.log(f'{CMD_NAME}: Command execute event.')

    palettes = ui.palettes
    palette = palettes.itemById(PALETTE_ID)
    if palette is None:
        palette = palettes.add(
            id=PALETTE_ID,
            name=PALETTE_NAME,
            htmlFileURL=PALETTE_URL,
            isVisible=True,
            showCloseButton=True,
            isResizable=True,
            width=250,
            height=300,
            useNewWebBrowser=True
        )
        palette.setPosition(900,200)
        futil.add_handler(palette.closed, palette_closed)
        futil.add_handler(palette.navigatingURL, palette_navigating)
        futil.add_handler(palette.incomingFromHTML, palette_incoming)
        futil.log(f'{CMD_NAME}: Created a new palette: ID = {palette.id}, Name = {palette.name}')

    if palette.dockingState == adsk.core.PaletteDockingStates.PaletteDockStateFloating:
        palette.dockingState = PALETTE_DOCKING

    palette.isVisible = True


# Use this to handle a user closing your palette.
def palette_closed(args: adsk.core.UserInterfaceGeneralEventArgs):
    # General logging for debug.
    futil.log(f'{CMD_NAME}: Palette was closed.')


# Use this to handle a user navigating to a new page in your palette.
def palette_navigating(args: adsk.core.NavigationEventArgs):
    # General logging for debug.
    futil.log(f'{CMD_NAME}: Palette navigating event.')

    # Get the URL the user is navigating to:
    url = args.navigationURL

    log_msg = f"User is attempting to navigate to {url}\n"
    futil.log(log_msg, adsk.core.LogLevels.InfoLogLevel)

    # Check if url is an external site and open in user's default browser.
    if url.startswith("http"):
        args.launchExternally = True


# Use this to handle events sent from javascript in your palette.
def palette_incoming(html_args: adsk.core.HTMLEventArgs):
    # General logging for debug.
    futil.log(f'{CMD_NAME}: Palette incoming event.')

    message_data: dict = json.loads(html_args.data)
    message_action = html_args.action

    log_msg = f"Event received from {html_args.firingEvent.sender.name}\n"
    log_msg += f"Action: {message_action}\n"
    log_msg += f"Data: {message_data}"
    futil.log(log_msg, adsk.core.LogLevels.InfoLogLevel)

    # TODO ******** Your palette reaction code here ********

    # if message_action == 'originShow':
    #     setTreeFolderVisible("rOriginWorkGeometry", True)
    # elif message_action == 'originHide':
    #     setTreeFolderVisible("rOriginWorkGeometry", False)
    dd=message_data['value']
    ss=KEYMAP[message_action]
    setTreeFolderVisible(KEYMAP[message_action], message_data['value'])

# This event handler is called when the command terminates.
def command_destroy(args: adsk.core.CommandEventArgs):
    # General logging for debug.
    futil.log(f'{CMD_NAME}: Command destroy event.')

    global local_handlers
    local_handlers = []


# *********************
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