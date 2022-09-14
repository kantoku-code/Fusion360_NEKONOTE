// fusion360 api

const DEBUG = true

const SHOW_HIDE_INFO = {
    "Show" : {
        "button": 'btn btn-primary btn-sm customBtn',
        "value": true
    },
    "Hide" : {
        "button": 'btn btn-secondary btn-sm customBtn',
        "value": false
    },
};

const BTN_ICONS = {
    "Origin": '<i class="bi bi-asterisk"></i>',
    "Analysis": '<i class="bi bi-rulers"></i>',
    "Joint Origins": '<i class="bi bi-record-circle"></i>',
    "Joints": '<i class="bi bi-lock"></i>',
    "Bodies": '<i class="bi bi-box"></i>',
    "Canvases": '<i class="bi bi-image"></i>',
    "Decals": '<i class="bi bi-file-earmark-image"></i>',
    "Sketches": '<i class="bi bi-pencil"></i>',
    "Construction": '<i class="bi bi-square"></i>',
};

const BTN_VISIBLE = {
    "Origin": true,
    "Analysis": true,
    "Joint Origins": true,
    "Joints": true,
    "Bodies": true,
    "Canvases": true,
    "Decals": true,
    "Sketches": true,
    "Construction": true,
};

let BUTTON_INFO = ""

const SCOPE_SWITCH_ID = "scope_switch";
const SCOPE_CHILDREN_ID = "scope_children";

document.addEventListener("DOMContentLoaded", () => {
    let adskWaiter = setInterval(() => {
        dumpLog("DOMContentLoaded");
        if (window.adsk) {
            dumpLog("adsk ok");
            clearInterval(adskWaiter);

            adsk
            .fusionSendData("DOMContentLoaded", "{}")
            .then((data) => {
                const button_group = document.getElementById("button_group");
                dumpLog(data)
                BUTTON_INFO = JSON.parse(data)

                // button
                const buttons = document.createElement("div");
                buttons.setAttribute("class", "row g-1");
                buttons.setAttribute("id", "buttons");
                button_group.appendChild(buttons)

                init_Buttons(
                    BUTTON_INFO,
                    buttons
                );

                // scope
                // const scope_div = document.getElementById("scope_option");
                // const scope_row2 = document.createElement("div");
                // scope_row2.setAttribute("class", "row g-2");
                // scope_div.appendChild(scope_row2)

                // const scope_row = document.createElement("div");
                // scope_row.setAttribute("class", "btn-group btn-group-sm"); //"row g-1");
                // scope_row.setAttribute("role", "group");
                // scope_row.setAttribute("aria-label", "First group");
                // scope_row2.appendChild(scope_row)


                const scope_switch = initSwitch(
                    SCOPE_SWITCH_ID,
                    BUTTON_INFO["Active"],
                    BUTTON_INFO["All"] + "/" + BUTTON_INFO["Active"],
                    // scope_row
                    button_group
                );

                // scope children
                const scope_children = initCheck(
                    SCOPE_CHILDREN_ID,
                    BUTTON_INFO["Children"],
                    // scope_row
                    button_group
                );
                scope_children.checked = true;

                // modal
                init_Modal(
                    BUTTON_INFO,
                    // scope_row
                    button_group
                );

            });
        }
    }, 100);
});

window.fusionJavaScriptHandler = {
    handle: function (action, data) {
        try {
            if (action === "command_event") {
                let values = JSON.parse(data);
                dumpLog(values['value']);
                setDisabledByButton(toBoolean(values["value"]), "button");
            } else if (action === "debugger") {
                debugger;
            } else {
                return `Unexpected command type: ${action}`;
            }
        } catch (e) {
            console.log(e);
            console.log(`Exception caught with command: ${action}, data: ${data}`);
        }
        return "OK";
    },
};


function init_Modal(button_info, parent) {
    // button
    const btn = document.createElement("button");
    btn.setAttribute("class", "btn btn-secondary btn-sm customBtn");
    btn.setAttribute("data-bs-toggle", "modal");
    btn.setAttribute("data-bs-target", "#staticBackdrop");
    btn.innerHTML = '<i class="bi bi-gear"></i>';
    parent.appendChild(btn)

    // modal
    const modal_fade = document.createElement("div");
    modal_fade.setAttribute("class", "modal fade");
    modal_fade.setAttribute("id", "staticBackdrop");
    modal_fade.setAttribute("data-bs-backdrop", "static");
    modal_fade.setAttribute("data-bs-keyboard", "false");
    modal_fade.setAttribute("tabindex", "-1");
    modal_fade.setAttribute("aria-labelledby", "staticBackdropLabel");
    modal_fade.setAttribute("aria-hidden", "true");

    const modal_dialog = document.createElement("div");
    modal_dialog.setAttribute("class", "modal-dialog");
    modal_fade.appendChild(modal_dialog);

    const modal_content = document.createElement("div");
    modal_content.setAttribute("class", "modal-content");
    modal_dialog.appendChild(modal_content);

    const modal_header = document.createElement("div");
    modal_header.setAttribute("class", "modal-header");
    modal_content.appendChild(modal_header);

    const modal_title = document.createElement("h5");
    modal_title.setAttribute("class", "modal-title");
    modal_title.setAttribute("id", "staticBackdropLabel");
    modal_title.innerText = "TITLE"
    modal_header.appendChild(modal_title);

    const modal_close = document.createElement("button");
    modal_close.setAttribute("class", "btn-close");
    modal_close.setAttribute("data-bs-dismiss", "modal");
    modal_close.setAttribute("aria-label", "Close");
    modal_close.addEventListener('click',function(){
        setButtonVisible();
        const button_group = document.getElementById("buttons");
        button_group.innerHTML = "";
        init_Buttons(button_info, button_group);
    });
    modal_header.appendChild(modal_close);

    const modal_body = document.createElement("div");
    modal_body.setAttribute("class", "modal-body");
    modal_content.appendChild(modal_body);

    initOptionChecks(button_info, modal_body);

    parent.appendChild(modal_fade);
};

function setButtonVisible() {
    for (const key in BTN_ICONS) {
        let elem = document.getElementById("option" + key);
        BTN_VISIBLE[key] = elem.checked;
    }
};

function initOptionChecks(button_info, parent) {
    for (const key in BTN_ICONS) {
        const id = "option" + key
        // div
        const scope_div = document.createElement("div");
        scope_div.setAttribute("class", "form-check form-check-inline");
        // scope_div.setAttribute("id", id + "div");
        // scope_div.setAttribute("data-bs-toggle", "tooltip");
        // scope_div.setAttribute("data-bs-placement", "top");
        // scope_div.setAttribute("title", key);
        parent.appendChild(scope_div);

        // checkbox
        const scope_children = document.createElement("input");
        scope_children.setAttribute("class", "form-check-input");
        scope_children.setAttribute("id", id);
        scope_children.setAttribute("type", "checkbox");
        scope_children.setAttribute("value", "");
        scope_children.setAttribute("checked", "true");
        scope_div.appendChild(scope_children);

        // label
        const label_children = document.createElement("label");
        label_children.setAttribute("class", "form-check-label");
        label_children.setAttribute("for", id);
        label_children.innerHTML = button_info[key]
        scope_div.appendChild(label_children);
    }
};

function init_Buttons(button_info, parent) {
    for (const sh in SHOW_HIDE_INFO) {
        // button group
        const btnGrp = document.createElement("div");
        btnGrp.setAttribute("class", "btn-group btn-group-sm");
        btnGrp.setAttribute("role", "group");
        btnGrp.setAttribute("aria-label", "First group");

        // button
        for (const key in BTN_ICONS) {
            if (!BTN_VISIBLE[key]) {
                continue;
            }
            const btn = document.createElement("button");
            btn.setAttribute("class", SHOW_HIDE_INFO[sh]["button"]);
            btn.setAttribute("type", "button");
            btn.setAttribute("id", key + "_" + sh);
            btn.setAttribute("data-bs-toggle", "tooltip");
            btn.setAttribute("data-bs-placement", "top");
            btn.setAttribute("title", button_info[key] + " " + button_info[sh]);
            btn.innerHTML = BTN_ICONS[key];
            btn.addEventListener('click',function(){
                const scopeValue = getScopeValue();
                let args = {
                    value: SHOW_HIDE_INFO[sh]["value"],
                    scope: scopeValue
                };
                adsk.fusionSendData(key, JSON.stringify(args));
            });
            btnGrp.appendChild(btn);
        };
        parent.appendChild(btnGrp);
    };

    // parent.appendChild(row);
};

function initSwitch(id, text, tooltip, parent) {
    // div
    const scope_div = document.createElement("div");
    scope_div.setAttribute("class", "form-check form-switch form-check-inline");
    scope_div.setAttribute("data-bs-toggle", "tooltip");
    scope_div.setAttribute("data-bs-placement", "top");
    scope_div.setAttribute("title", tooltip);

    parent.appendChild(scope_div);

    // input
    const scope_input = document.createElement("input");
    scope_input.setAttribute("class", "form-check-input");
    scope_input.type = "checkbox";
    scope_input.id = id;
    scope_input.addEventListener('change',function(){
        setDisabledById(!scope_input.checked, SCOPE_CHILDREN_ID);
    });
    scope_div.appendChild(scope_input);

    // label
    const scope_label = document.createElement("label");
    scope_label.setAttribute("class", "form-check-label");
    scope_label.for = id;
    scope_label.textContent = text
    scope_div.appendChild(scope_label);

    return scope_input
};

function initCheck(id, text, parent) {
    // div
    const scope_div = document.createElement("div");
    scope_div.setAttribute("class", "form-check form-check-inline");
    scope_div.setAttribute("id", id + "div");
    scope_div.setAttribute("data-bs-toggle", "tooltip");
    scope_div.setAttribute("data-bs-placement", "top");
    scope_div.setAttribute("title", text);
    parent.appendChild(scope_div);

    // checkbox
    const scope_children = document.createElement("input");
    scope_children.setAttribute("class", "form-check-input");
    scope_children.setAttribute("id", id);
    scope_children.setAttribute("type", "checkbox");
    scope_children.setAttribute("value", "");
    scope_children.setAttribute("disabled", "true");
    scope_div.appendChild(scope_children);

    // label
    const label_children = document.createElement("label");
    label_children.setAttribute("class", "form-check-label");
    label_children.setAttribute("for", id);
    label_children.innerHTML = '<i class="bi bi-diagram-3"></i>'
    scope_div.appendChild(label_children);

    return scope_children
};

function getScopeValue() {
    const scope_active = document.getElementById(SCOPE_SWITCH_ID)
    if (scope_active.checked) {
        const scope_children = document.getElementById(SCOPE_CHILDREN_ID)
        if (scope_children.checked) {
            return "CHILDREN"
        } else {
            return "ACTIVE"
        }
    } else {
        return "ALL"
    }
};

function setDisabledByButton(value) {
    let buttons = document.getElementsByTagName("button");
    let len = buttons.length;
    for (let i = 0; i < len; i++){
        buttons.item(i).disabled = value
    };
};

function setDisabledById(value, id) {
    let elem = document.getElementById(id);
    elem.disabled = value;
};

function toBoolean(data) {
    return data.toLowerCase() === 'true';
};

function dumpLog(msg) {
    if (DEBUG) {
        console.log(msg);
    };
};