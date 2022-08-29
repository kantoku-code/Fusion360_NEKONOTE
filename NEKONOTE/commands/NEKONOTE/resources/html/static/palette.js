document.addEventListener("DOMContentLoaded", () => {
    let adskWaiter = setInterval(() => {
        console.log("DOMContentLoaded");
        if (window.adsk) {
            console.log("adsk ok");
            clearInterval(adskWaiter);

            let data
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
                    ["Joint Origins", '<i class="bi bi-record-circle">',],
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
                            let args = {
                                value: sh[2],
                            };
                            adsk.fusionSendData(key[0], JSON.stringify(args));
                        });
                        btnGrp.appendChild(btn);
                    });
                });
            });
        }
    }, 100);
});


function setDisabled(value) {
    let buttons = document.getElementsByTagName("button");
    let len = buttons.length;
    for (let i = 0; i < len; i++){
        buttons.item(i).disabled = value
        let a = value
        let b = 1
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