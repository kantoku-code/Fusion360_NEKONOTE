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

const SCOPE_ALL_ID = "scope_all";
const SCOPE_ACTIVE_ID = "scope_active";
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

                // スコープ多言語化していない
                // scope all
                const scope_all = initRadio(SCOPE_ALL_ID, "全体", button_group);
                scope_all.checked=true;
                scope_all.addEventListener(`change`, function(){
                    let checkbox = document.getElementById(SCOPE_CHILDREN_ID)
                    checkbox.disabled = scope_all.checked
                });

                // scope active
                const scope_active = initRadio(SCOPE_ACTIVE_ID, "アクティブ", button_group);
                scope_active.addEventListener(`change`, function(){
                    let checkbox = document.getElementById(SCOPE_CHILDREN_ID)
                    checkbox.disabled = !scope_active.checked
                });

                // scope children
                const scope_children = initCheck(SCOPE_CHILDREN_ID, "子も含む", button_group)
                scope_children.checked = true
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
                setDisabled(toBoolean(values["value"]));
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

function initRadio(id, text, parent) {
    // div
    const div_scope = document.createElement("div");
    div_scope.setAttribute("class", "form-check form-check-inline");
    div_scope.setAttribute("id", id + "div");
    parent.appendChild(div_scope);

    // radio
    const scope_radio = document.createElement("input");
    scope_radio.setAttribute("class", "form-check-input");
    scope_radio.setAttribute("type", "radio");
    scope_radio.setAttribute("name", "flexRadioScope");
    scope_radio.setAttribute("id", id);
    div_scope.appendChild(scope_radio);

    // label
    const scope_label = document.createElement("label");
    scope_label.setAttribute("class", "form-check-label");
    scope_label.setAttribute("for", id);
    scope_label.appendChild(document.createTextNode(text));
    div_scope.appendChild(scope_label);

    return scope_radio
}

function initCheck(id, text, parent) {
    // div
    const div_scope = document.createElement("div");
    div_scope.setAttribute("class", "form-check form-check-inline");
    div_scope.setAttribute("id", id + "div");
    parent.appendChild(div_scope);

    // checkbox
    const scope_children = document.createElement("input");
    scope_children.setAttribute("class", "form-check-input");
    scope_children.setAttribute("id", id);
    scope_children.setAttribute("type", "checkbox");
    scope_children.setAttribute("value", "");
    scope_children.setAttribute("disabled", "true");
    div_scope.appendChild(scope_children);

    // label
    const label_children = document.createElement("label");
    label_children.setAttribute("class", "form-check-label");
    label_children.setAttribute("for", id);
    label_children.appendChild(document.createTextNode(text));
    div_scope.appendChild(label_children);

    return scope_children
}

function getScopeValue() {
    const scope_active = document.getElementById(SCOPE_ACTIVE_ID)
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

function setDisabled(value) {
    let buttons = document.getElementsByTagName("button");
    let len = buttons.length;
    for (let i = 0; i < len; i++){
        buttons.item(i).disabled = value
    }
}

function toBoolean(data) {
    return data.toLowerCase() === 'true';
}

function dumpLog(msg) {
    if (DEBUG) {
        console.log(msg);
    }
}