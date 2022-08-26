// function getDateString() {
//     const today = new Date();
//     const date = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
//     const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
//     return `Date: ${date}, Time: ${time}`;
// }

// function sendInfoToFusion() {
//     const args = {
//         arg1: document.getElementById("sampleData").value,
//         arg2: getDateString()
//     };

//     // Send the data to Fusion as a JSON string. The return value is a Promise.
//     adsk.fusionSendData("messageFromPalette", JSON.stringify(args)).then((result) =>
//         document.getElementById("returnValue").innerHTML = `${result}`
//     );

// }

// function updateMessage(messageString) {
//     // Message is sent from the add-in as a JSON string.
//     const messageData = JSON.parse(messageString);

//     // Update a paragraph with the data passed in.
//     document.getElementById("fusionMessage").innerHTML =
//         `<b>Your text</b>: ${messageData.myText} <br/>` +
//         `<b>Your expression</b>: ${messageData.myExpression} <br/>` +
//         `<b>Your value</b>: ${messageData.myValue}`;
// }

window.addEventListener('DOMContentLoaded',function(){
    const btn = document.getElementsByClassName('btn btn-primary btn-sm customBtn');
    addEventListener_Button(btn, true)
});

window.addEventListener('DOMContentLoaded',function(){
    const btn = document.getElementsByClassName('btn btn-secondary btn-sm customBtn');
    addEventListener_Button(btn, false)
});

function addEventListener_Button(btn, value) {
    for(let i = 0; i < btn.length; i++){
        btn[i].addEventListener('click',function(){
            let values = btn[i].id.split('_');
            let args = {
                value: value,
            };
            adsk.fusionSendData(values[0], JSON.stringify(args));
        });
    };
}

// window.fusionJavaScriptHandler = {
//     handle: function (action, data) {
//         try {
//             if (action === "updateMessage") {
//                 updateMessage(data);
//             } else if (action === "debugger") {
//                 debugger;
//             } else {
//                 return `Unexpected command type: ${action}`;
//             }
//         } catch (e) {
//             console.log(e);
//             console.log(`Exception caught with command: ${action}, data: ${data}`);
//         }
//         return "OK";
//     },
// };

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
                // element.insertAdjacentHTML("afterend", "<p>" + data + "</p>")
                console.log("hoge")
            // );

                const button_group = document.getElementById("button_group");
                console.log(data)
                const row = document.createElement("div");
                row.setAttribute("class", "row g-1");
                button_group.appendChild(row);

                const showhide = ['btn btn-primary btn-sm customBtn', 'btn btn-secondary btn-sm customBtn'];
                const arr = [
                    '<i class="bi bi-asterisk"></i>',
                    '<i class="bi bi-lock"></i>',
                    '<i class="bi bi-record-circle">',
                    '<i class="bi bi-box"></i>',
                    '<i class="bi bi-pencil"></i>',
                    '<i class="bi bi-image"></i>',
                    '<i class="bi bi-file-earmark-image"></i>',
                    '<i class="bi bi-square"></i>',
                    '<i class="bi bi-rulers"></i>',
                ];

                showhide.forEach((sh) => {
                    const btnGrp = document.createElement("div");
                    btnGrp.setAttribute("class", "btn-group btn-group-sm"); //me-1");
                    btnGrp.setAttribute("role", "group");
                    btnGrp.setAttribute("aria-label", "First group");
                    row.appendChild(btnGrp);

                    arr.forEach((elem) => {
                        const btn = document.createElement("button");
                        btn.setAttribute("class", sh);
                        btn.setAttribute("type", "button");
                        btn.setAttribute("id", "OriginWorkGeometry_Show");
                        btn.setAttribute("data-bs-toggle", "tooltip");
                        btn.setAttribute("data-bs-placement", "top");
                        btn.setAttribute("title", "OriginWorkGeometry Show");
                        btn.innerHTML = elem;
                        btnGrp.appendChild(btn);
                    });
                });
            });
        }
    }, 100);
});

// document.addEventListener("DOMContentLoaded", () => {
//     let adskWaiter = setInterval(() => {
//         console.log("DOMContentLoaded");
//         if (window.adsk) {
//             console.log("adsk ok");
//             clearInterval(adskWaiter);

//             let element = document.getElementById("xxx");
//             adsk
//             .fusionSendData("DOMContentLoaded", "{}")
//             .then((data) =>
//                 element.insertAdjacentHTML("afterend", "<p>" + data + "</p>")
//             );
//         }
//     }, 100);
// });

//   $(document).ready(function() {
//     $('<input type="button" id="submit" value="Submit" class="btn">').appendTo('#container');
// });