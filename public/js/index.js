///////////////////////////////////////////////////////
//
// File: index.js
// This is application file for login page to accept login credentials
//
// Last Updated: 29-11-2018
// Reformat, Indentation, Inline Comments
//
/////////////////////////////////////////////////////


window.onload = function () {

    document.querySelector("#version_num").innerText = EnxRtc.version;
    $(".login_join_div").show();

}
var username = "demo";
var password = "enablex";

EnxRtc.getDevices(function (arg) {
    let camlist = '';
    let miclist = '';
    if (arg.result === 0) {
        arg.devices.cam.forEach(element => {
            var camId = element.deviceId.toString();
            if (element.deviceId !== '') {
                camlist += `<input type="radio" id="${element.deviceId}" name="camera" value="${element.label}" onclick="switchcam(this)"> <label for="${element.deviceId}">${element.label}</label><br>`
            }
        });

        arg.devices.mic.forEach(element => {
            var micId = element.deviceId.toString();
            if (element.deviceId !== '') {
                miclist += `<input type="radio" id="${element.deviceId}" name="mic" value="${element.label}" onclick="switchmic(this)"> <label for="${element.deviceId}">${element.label}</label><br>`
            }
        });

        if (camlist === '') {
            toastr.options.positionClass = 'toast-bottom-right';
            toastr.options.timout = '10000000';
            toastr.error("Camera not found");
            document.querySelector('.btn').disabled = true;
            return false;
        }
        if (miclist === '') {
            toastr.options.positionClass = 'toast-bottom-right';
            toastr.options.timout = '10000000';
            toastr.error("Mic not found");
            document.querySelector('.btn').disabled = true;
            return false;
        }

    } else if (arg.result === 1145) {
        toastr.options.positionClass = 'toast-bottom-right';
        toastr.options.timout = '10000000';
        toastr.error("Your media devices might be in use with some other application.");
        // $(".error_div").html(
        //     "Your media devices might be in use with some other application."
        // );
        // $(".error_div").show();
        document.querySelect('.btn').disabled = true;
        return false;
    } else {
        $(".error_div").show();
        // toastr.options.timout = '10000000';
        document.querySelector('.btn').disabled = true;

        return false;
    }
});


// Verifies login credentials before moving to Conference page

document.getElementById('joinRoom').addEventListener('click', function (event) {
    // event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('invite');

    if (myParam === '') {
        toastr.error("Room Not found");
        return false;
    }

    else if (myParam === null) {

        createRoom(function (result) {
            document.getElementById("roomName").value = result;
            document.getElementById("create_room_div").style.display = "none";
            // document.getElementById("message").innerHTML = "We have prefilled the form with room-id. Share it with someone you want to talk to";
            $("#joinRoom").attr("disabled", "disabled");
            var name = document.querySelector('#nameText'), room = document.querySelector('#roomName'), agree = document.querySelector('[name="agree"]'), errors = [];
            if (name.value.trim() === '') {
                errors.push('Enter your name.');
            }
            if (room.value.trim() === '') {
                errors.push('Enter your Room Id.');
            }

            if (!agree.checked) {
                errors.push('Accept terms of use and privacy policy.')
            }

            if (errors.length > 0) {
                var mappederrors = errors.map(function (item) {
                    return item + "</br>";
                });
                var allerrors = mappederrors.join('').toString();
                toastr.error(allerrors);

                $("#joinRoom").removeAttr("disabled");
                return false;
            }


            joinRoom(document.getElementById('roomName').value, function (data) {

                if (!jQuery.isEmptyObject(data)) {

                    room_id = data.room_id;
                    var user_ref = document.getElementById('nameText').value;
                    var role = 'moderator';
                    var retData = {
                        name: user_ref,
                        role: role,
                        roomId: room_id,
                        user_ref: user_ref,
                    };

                    createToken(retData, function (response) {
                        var token = response;
                        window.location.href = "confo.html?token=" + token;

                    });



                } else {
                    toastr.error("Room Not Found");

                }
            });
        });
    }
    else {
        document.getElementById("roomName").value = myParam;
        document.getElementById("create_room_div").style.display = "none";
        // document.getElementById("message").innerHTML = "We have prefilled the form with room-id. Share it with someone you want to talk to";
        $("#joinRoom").attr("disabled", "disabled");
        var name = document.querySelector('#nameText'), room = document.querySelector('#roomName'), agree = document.querySelector('[name="agree"]'), errors = [];
        if (name.value.trim() === '') {
            errors.push('Enter your name.');
        }
        if (room.value.trim() === '') {
            errors.push('Enter your Room Id.');
        }

        if (!agree.checked) {
            errors.push('Accept terms of use and privacy policy.')
        }

        if (errors.length > 0) {
            var mappederrors = errors.map(function (item) {
                return item + "</br>";
            });
            var allerrors = mappederrors.join('').toString();
            toastr.error(allerrors);

            $("#joinRoom").removeAttr("disabled");
            return false;
        }


        joinRoom(document.getElementById('roomName').value, function (data) {

            if (!jQuery.isEmptyObject(data)) {

                room_id = data.room_id;
                var user_ref = document.getElementById('nameText').value;
                var role = 'participant';
                var retData = {
                    name: user_ref,
                    role: role,
                    roomId: room_id,
                    user_ref: user_ref,
                };

                createToken(retData, function (response) {
                    var token = response;
                    window.location.href = "confo.html?token=" + token;

                });



            } else {
                toastr.error("Room Not Found");

            }
        });
    }
});

var loadingElem = document.querySelector('.loading');

// window.document.onload = function (event) {
//     loadingElem.classList.add('yes');
//     createRoom(function (result) {
//         document.getElementById("roomName").value = result;
//         document.getElementById("create_room_div").style.display = "none";
//         // document.getElementById("message").innerHTML = "We have prefilled the form with room-id. Share it with someone you want to talk to";
//     });
// }

// document.getElementById('create_room').addEventListener('click', function (event) {
//     loadingElem.classList.add('yes');
//     createRoom(function (result) {
//         document.getElementById("roomName").value = result;
//         document.getElementById("create_room_div").style.display = "none";
//         // document.getElementById("message").innerHTML = "We have prefilled the form with room-id. Share it with someone you want to talk to";
//     });
// });

// create room api call using XML request

var createRoom = function (callback) {
    var apiUrl = '/api/create-room/';
    if (typeof baseUrl !== 'undefined') {
        // todo - to support PHP app api url
        apiUrl = baseUrl + apiUrl;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            if (response.error) {
                toastr.error(response.error);

            }
            else {
                callback(response.room.room_id);
                loadingElem.classList.remove('yes');
            }
        }
    };
    xhttp.open("POST", '/api/room/multi/', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
    xhttp.send();



    //     const xhttp = new XMLHttpRequest();
    //   xhttp.onreadystatechange = function () {
    //     if (this.readyState == 4 && this.status == 200) {
    //       const response = JSON.parse(this.responseText);
    //       if (response.error) {
    //         $.toast({
    //           heading: 'Error',
    //           text: response.error,
    //           showHideTransition: 'fade',
    //           icon: 'error',
    //           position: 'top-right',
    //         });
    //       } else {
    //         callback(response.room.room_id);
    //         loadingElem.classList.remove('yes');
    //       }
    //     }
    //   };
    //   xhttp.open('POST', '/api/room/multi/', true);
    //   xhttp.setRequestHeader('Content-Type', 'application/json');
    //   xhttp.setRequestHeader('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
    //   xhttp.send();
};

var createToken = function (details, callback) {
    var apiUrl = '/api/create-token/';
    if (typeof baseUrl !== 'undefined') {
        // todo - to support PHP app api url
        apiUrl = baseUrl + apiUrl;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            if (response.error) {
                toastr.error(response.error);

            }
            else {
                callback(response.token);
            }
        }
    };
    xhttp.open("POST", apiUrl, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(details));
};


