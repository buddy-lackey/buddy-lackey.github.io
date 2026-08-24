const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");
const bootConsole = document.getElementById("bootConsole");

async function loadConfiguration() {

    try {

        const response = await fetch("./config/system.json");

        const configuration = await response.json();

        bootConsole.innerHTML +=
            "<br>SYS&gt; CONFIGURATION LOADED" +
            "<br>SYS&gt; STATION " +
            configuration.station +
            " READY";

    } catch (error) {

        bootConsole.innerHTML +=
            "<br><span class='alarm'>" +
            "SYS&gt; CONFIG LOAD FAILURE" +
            "</span>";
    }
}

loadConfiguration();


form.addEventListener("submit", function(event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;


    /*
        Demo credentials exist so the instructor can also
        demonstrate the legitimate authentication path.
    */

    if (
        username === "operator" &&
        password === "rtu-demo-17"
    ) {

        sessionStorage.setItem(
            "authenticated",
            "true"
        );

        sessionStorage.setItem(
            "user",
            "operator"
        );

        message.innerHTML =
            "<span class='ok'>" +
            "AUTHENTICATION ACCEPTED" +
            "</span>";

        setTimeout(function() {

            window.location.href =
                "dashboard.html";

        }, 400);

    }

    else {

        message.innerHTML =
            "<span class='alarm'>" +
            "AUTHENTICATION FAILURE // INVALID ACCESS KEY" +
            "</span>";

    }

});
