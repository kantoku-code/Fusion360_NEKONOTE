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
                let button_info = JSON.parse(data)

                // button
                const row = init_Buttons(button_info);
                button_group.appendChild(row);

                const scope_switch = initSwitch(
                    SCOPE_SWITCH_ID,
                    button_info["Active"],
                    button_info["All"] + "/" + button_info["Active"],
                    button_group
                );

                // scope children
                const scope_children = initCheck(
                    SCOPE_CHILDREN_ID,
                    button_info["Children"],
                    button_group);
                scope_children.checked = true;

                const xxx = initSelect(
                    "kkk",
                    button_group,
                    ["1","2","3"]
                )

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

function init_Buttons(button_info) {
    // div
    const row = document.createElement("div");
    row.setAttribute("class", "row g-1");

    for (const sh in SHOW_HIDE_INFO) {
        // button group
        const btnGrp = document.createElement("div");
        btnGrp.setAttribute("class", "btn-group btn-group-sm");
        btnGrp.setAttribute("role", "group");
        btnGrp.setAttribute("aria-label", "First group");

        // button
        for (const key in BTN_ICONS) {
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
        row.appendChild(btnGrp);
    };

    return row;
}

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
}

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
    // label_children.appendChild(document.createTextNode(text));
    scope_div.appendChild(label_children);

    return scope_children
}

function getScopeValue() {
    // const scope_active = document.getElementById(SCOPE_ACTIVE_ID)
    // if (scope_active.checked) {
    //     const scope_children = document.getElementById(SCOPE_CHILDREN_ID)
    //     if (scope_children.checked) {
    //         return "CHILDREN"
    //     } else {
    //         return "ACTIVE"
    //     }
    // } else {
    //     return "ALL"
    // }
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
}

function setDisabledByButton(value) {
    let buttons = document.getElementsByTagName("button");
    let len = buttons.length;
    for (let i = 0; i < len; i++){
        buttons.item(i).disabled = value
    }
}

function setDisabledById(value, id) {
    let elem = document.getElementById(id);
    elem.disabled = value
}

function toBoolean(data) {
    return data.toLowerCase() === 'true';
}

function dumpLog(msg) {
    if (DEBUG) {
        console.log(msg);
    }
}