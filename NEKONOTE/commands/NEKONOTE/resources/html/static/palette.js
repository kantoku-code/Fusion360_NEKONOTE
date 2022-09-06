document.addEventListener("DOMContentLoaded", () => {
    let adskWaiter = setInterval(() => {
        console.log("DOMContentLoaded");
        if (window.adsk) {
            console.log("adsk ok");
            clearInterval(adskWaiter);

            adsk
            .fusionSendData("DOMContentLoaded", "{}")
            .then((data) => {
                const button_group = document.getElementById("button_group");
                console.log(data)
                let button_info = JSON.parse(data)

                const row = document.createElement("div");
                row.setAttribute("class", "row g-1");
                button_group.appendChild(row);

                const showhide = [
                    ["Show", 'btn btn-primary btn-sm customBtn', true],
                    ["Hide", 'btn btn-secondary btn-sm customBtn', false],
                ];

                const keys = [
                    ["Origin", '<i class="bi bi-asterisk"></i>',],
                    ["Analysis", '<i class="bi bi-rulers"></i>',],
                    ["Joint Origins", '<i class="bi bi-record-circle"></i>',],
                    ["Joints", '<i class="bi bi-lock"></i>',],
                    ["Bodies", '<i class="bi bi-box"></i>',],
                    ["Canvases", '<i class="bi bi-image"></i>',],
                    ["Decals", '<i class="bi bi-file-earmark-image"></i>',],
                    ["Sketches", '<i class="bi bi-pencil"></i>',],
                    ["Construction", '<i class="bi bi-square"></i>',]
                ];
                showhide.forEach((sh) => {
                    const btnGrp = document.createElement("div");
                    btnGrp.setAttribute("class", "btn-group btn-group-sm");
                    btnGrp.setAttribute("role", "group");
                    btnGrp.setAttribute("aria-label", "First group");
                    row.appendChild(btnGrp);

                    keys.forEach((key) => {
                        const btn = document.createElement("button");
                        btn.setAttribute("class", sh[1]);
                        btn.setAttribute("type", "button");
                        btn.setAttribute("id", key[0] + "_" + sh[0]);
                        btn.setAttribute("data-bs-toggle", "tooltip");
                        btn.setAttribute("data-bs-placement", "top");
                        btn.setAttribute("title", button_info[key[0]] + " " + button_info[sh[0]]);
                        btn.innerHTML = key[1];
                        btn.addEventListener('click',function(){
                            const scope = getScopeValue();
                            let args = {
                                value: sh[2],
                                scope: scope
                            };
                            adsk.fusionSendData(key[0], JSON.stringify(args));
                        });
                        btnGrp.appendChild(btn);
                    });
                });

                const div_scope1 = document.createElement("div");
                div_scope1.setAttribute("class", "form-check form-check-inline");
                div_scope1.setAttribute("id", "scope_all");
                button_group.appendChild(div_scope1);

                const scope_radio1 = document.createElement("input");
                scope_radio1.setAttribute("class", "form-check-input");
                scope_radio1.setAttribute("type", "radio");
                scope_radio1.setAttribute("name", "flexRadioScope");
                scope_radio1.setAttribute("id", "flexRadioDefault1");
                scope_radio1.setAttribute("value", "option1");
                scope_radio1.addEventListener(`change`, function(){
                    let checkbox = document.getElementById("flexCheckDefault")
                    checkbox.disabled = scope_radio1.checked
                });
                scope_radio1.checked=true;
                div_scope1.appendChild(scope_radio1);

                const scope_label1 = document.createElement("label");
                scope_label1.setAttribute("class", "form-check-label");
                scope_label1.setAttribute("for", "flexRadioDefault1");
                scope_label1.appendChild(document.createTextNode("全体"));
                div_scope1.appendChild(scope_label1);

                const div_scope2 = document.createElement("div");
                div_scope2.setAttribute("class", "form-check form-check-inline");
                div_scope2.setAttribute("id", "scope_active");
                button_group.appendChild(div_scope2);

                const scope_radio2 = document.createElement("input");
                scope_radio2.setAttribute("class", "form-check-input");
                scope_radio2.setAttribute("type", "radio");
                scope_radio2.setAttribute("name", "flexRadioScope");
                scope_radio2.setAttribute("id", "flexRadioDefault2");
                scope_radio2.setAttribute("value", "option2");
                scope_radio2.addEventListener(`change`, function(){
                    let checkbox = document.getElementById("flexCheckDefault")
                    checkbox.disabled = !scope_radio2.checked
                });
                div_scope2.appendChild(scope_radio2);

                const scope_label2 = document.createElement("label");
                scope_label2.setAttribute("class", "form-check-label");
                scope_label2.setAttribute("for", "flexRadioDefault2");
                scope_label2.appendChild(document.createTextNode("アクティブ"));
                div_scope2.appendChild(scope_label2);

                const div_scope3 = document.createElement("div");
                div_scope3.setAttribute("class", "form-check form-check-inline");
                div_scope3.setAttribute("id", "scope_checkbox");
                button_group.appendChild(div_scope3);

                const scope_children = document.createElement("input");
                scope_children.setAttribute("class", "form-check-input");
                scope_children.setAttribute("id", "flexCheckDefault");
                scope_children.setAttribute("type", "checkbox");
                scope_children.setAttribute("value", "");
                scope_children.setAttribute("disabled", "true");
                div_scope3.appendChild(scope_children);

                const label_children = document.createElement("label");
                label_children.setAttribute("class", "form-check-label");
                label_children.setAttribute("for", "flexCheckDefault");
                label_children.appendChild(document.createTextNode("子も含む"));
                div_scope3.appendChild(label_children);

            });
        }
    }, 100);
});


function getScopeValue() {
    const scope_radio2 = document.getElementById("flexRadioDefault2")
    if (scope_radio2.checked) {
        const scope_children = document.getElementById("flexCheckDefault")
        if (scope_children.checked) {
            return "CHILDREN"
        } else {
            return "ACTIVE"
        }
    } else {
        return "ALL"
    }
}

function setScopeCheckboxDisabled(value) {
    let checkbox = document.getElementById("scope_checkbox")
    checkbox.disabled = value
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

window.fusionJavaScriptHandler = {
    handle: function (action, data) {
        try {
            if (action === "command_event") {
                let values = JSON.parse(data);
                console.log(values['value']);
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