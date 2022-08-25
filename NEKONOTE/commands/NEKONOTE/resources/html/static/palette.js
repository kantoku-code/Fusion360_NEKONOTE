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

            let element = document.getElementById("xxx");
            adsk
            .fusionSendData("DOMContentLoaded", "{}")
            .then((data) =>
                element.insertAdjacentHTML("afterend", "<p>" + data + "</p>")
            );
        }
    }, 100);
})

$(document).ready(function() {
    $('#container').append('<input type="button" id="submit" value="Submit" class="btn">');
});

document.addEventListener("DOMContentLoaded", () => {
    let adskWaiter = setInterval(() => {
        console.log("DOMContentLoaded");
        if (window.adsk) {
            console.log("adsk ok");
            clearInterval(adskWaiter);

            let element = document.getElementById("xxx");
            adsk
            .fusionSendData("DOMContentLoaded", "{}")
            .then((data) =>
                element.insertAdjacentHTML("afterend", "<p>" + data + "</p>")
            );
        }
    }, 100);
});

//   $(document).ready(function() {
//     $('<input type="button" id="submit" value="Submit" class="btn">').appendTo('#container');
// });