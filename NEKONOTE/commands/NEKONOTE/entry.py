import json
import adsk.core
import pathlib
from ...lib import fusion360utils as futil
from ... import config
from .show_hide_factry import setTreeFolderVisible
from .enums import Dirname, Scope


# ** debug **
DEBUG_LANG_MODE = False
LANGS = [
    "de-DE",
    "en-US",
    "es-ES",
    "fr-FR",
    "it-IT",
    "ja-JP",
    "ko-KR",
    "zh-CN",
    "pl-PL",# ポーランド
    "pt-BR",# ポルトガル-ブラジル
    "tr-TR",# トルコ
]
DEBUG_LANG = LANGS[10]

THIS_DIR = pathlib.Path(__file__).resolve().parent

app = adsk.core.Application.get()
ui = app.userInterface

# TODO ********************* Change these names *********************
CMD_ID = f'{config.COMPANY_NAME}_{config.ADDIN_NAME}_nekonote'
CMD_NAME = 'NEKONOTE'
CMD_Description = 'Show/Hide BrowserTree Folders'
PALETTE_NAME = "🐾 NEKO NO TE (Cat's hand)🐾"
IS_PROMOTED = True

# Using "global" variables by referencing values from /config.py
PALETTE_ID = config.sample_palette_id

# Specify the full path to the local html. You can also use a web URL
# such as 'https://www.autodesk.com/'
PALETTE_URL = str(THIS_DIR / 'resources' / 'html' / 'index.html')

# The path function builds a valid OS path. This fixes it to be a valid local URL.
PALETTE_URL = PALETTE_URL.replace('\\', '/')

# Set a default docking behavior for the palette
PALETTE_DOCKING = adsk.core.PaletteDockingStates.PaletteDockStateFloating

# TODO *** Define the location where the command button will be created. ***
# This is done by specifying the workspace, the tab, and the panel, and the 
# command it will be inserted beside. Not providing the command to position it
# will insert it at the end.
WORKSPACE_ID = 'FusionSolidEnvironment'
PANEL_ID = 'UtilityPanel'
COMMAND_BESIDE_ID = 'FusionComputeAllCommand'

# Resource location for command icons, here we assume a sub folder in this directory named "resources".
ICON_FOLDER = str(THIS_DIR / 'resources' / 'icon')

# Local list of event handlers used to maintain a reference so
# they are not released and garbage collected.
local_handlers = []

BUTTONSETTING = str(THIS_DIR / 'resources' / 'json' / 'button_setting.json')

DIR_MAP = {
    "Origin": Dirname.Origin,
    "Analysis": Dirname.Analysis,
    "Joint Origins": Dirname.Joint_Origins,
    "Joints": Dirname.Joints,
    "Bodies": Dirname.Bodies,
    "Canvases": Dirname.Canvases,
    "Decals": Dirname.Decals,
    "Sketches": Dirname.Sketches,
    "Construction": Dirname.Construction,
}

SCOPE_MAP = {
    'ALL' : Scope.ALL,
    'ACTIVE' : Scope.ACTIVE,
    'CHILDREN' : Scope.CHILDREN,
}

PRODUCT_TYPE_WHITE_LIST = (
    'DesignProductType'
)

_handlers = []

PALETTE_WIDTH = 260
PALETTE_HEIGHT_NORMAL = 160
PALETTE_HEIGHT_OPTION = 340


# ********

# Executed when add-in is run.
def start():
    global ui
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

    msg = [
        '         __           __    _  ________ ______  _  ______  __________  ',
        '    ___ / /____ _____/ /_  / |/ / __/ //_/ __ \/ |/ / __ \/_  __/ __/  ',
        '   (_-</ __/ _ `/ __/ __/ /    / _// ,< / /_/ /    / /_/ / / / / _/    ',
        '  /___/\__/\_,_/_/  \__/ /_/|_/___/_/|_|\____/_/|_/\____/ /_/ /___/    ',
    ]
    app.log('\n'.join(msg))


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

    msg = [
        '     __           ',
        '    / /  __ _____ ',
        '   / _ \/ // / -_)',
        '  /_.__/\_, /\__/ ',
        '       /___/      ',
    ]
    app.log('\n'.join(msg))


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

    onWorkspaceActivated = MyWorkspaceActivatedHandler()
    ui.workspaceActivated.add(onWorkspaceActivated)
    _handlers.append(onWorkspaceActivated)

# Because no command inputs are being added in the command created event, the execute
# event is immediately fired.
def command_execute(args: adsk.core.CommandEventArgs):
    # General logging for debug.
    futil.log(f'{CMD_NAME}: Command execute event.')

    createPalette()

# Use this to handle a user closing your palette.
def palette_closed(args: adsk.core.UserInterfaceGeneralEventArgs):
    # General logging for debug.
    futil.log(f'{CMD_NAME}: Palette was closed.')

    global _handlers
    _handlers = []

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

    if message_action == 'DOMContentLoaded':
        global app
        lang = app.executeTextCommand(u'Options.GetUserLanguage')
        with open(BUTTONSETTING, encoding='utf-8') as f:
            button_Dict = json.loads(f.read())

        if not lang in button_Dict:
            lang = 'en-US'

        # **debug **
        if DEBUG_LANG_MODE:
            lang = DEBUG_LANG

        # https://cortyuming.hateblo.jp/entry/20140920/p2
        html_args.returnData = json.dumps(button_Dict[lang], ensure_ascii=False)
    elif message_action in DIR_MAP:
        setTreeFolderVisible(
            DIR_MAP[message_action],
            message_data['value'],
            SCOPE_MAP[message_data['scope']],
            )

    elif message_action == 'option':
        global ui
        palette: adsk.core.Palette = ui.palettes.itemById(PALETTE_ID)
        palette.height = PALETTE_HEIGHT_OPTION if message_data['value'] else PALETTE_HEIGHT_NORMAL
        if not message_data['value']:
            palette.width = PALETTE_WIDTH

    elif message_action == 'response':
        pass

# This event handler is called when the command terminates.
def command_destroy(args: adsk.core.CommandEventArgs):
    # General logging for debug.
    futil.log(f'{CMD_NAME}: Command destroy event.')

    global local_handlers
    local_handlers = []


# *********
def createPalette():
    palettes = ui.palettes
    palette = palettes.itemById(PALETTE_ID)
    if palette is None:
        palette = palettes.add(
            id=PALETTE_ID,
            name=PALETTE_NAME,
            htmlFileURL=PALETTE_URL,
            isVisible=True,
            showCloseButton=True,
            isResizable=False,
            width=PALETTE_WIDTH,
            height=PALETTE_HEIGHT_NORMAL,
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


class MyWorkspaceActivatedHandler(adsk.core.WorkspaceEventHandler):
    def __init__(self):
        super().__init__()
    def notify(self, args: adsk.core.WorkspaceEventArgs):
        futil.log(f'{CMD_NAME}: {args.firingEvent.name}')

        global ui
        palettes = ui.palettes
        palette = palettes.itemById(PALETTE_ID)

        if not palette:
            return

        if not args.workspace.productType in PRODUCT_TYPE_WHITE_LIST:
            palette.sendInfoToHTML(
                'command_event',
                json.dumps({'value': 'True'}) 
            )
        else:
            palette.sendInfoToHTML(
                'command_event',
                json.dumps({'value': 'False'}) 
            )