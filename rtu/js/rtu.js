const params =
    new URLSearchParams(window.location.search);

const serviceMode =
    params.get("mode") === "service";

const authenticated =
    sessionStorage.getItem("authenticated") === "true";


/*
    ============================================================
    INTENTIONALLY VULNERABLE TRAINING CODE
    ============================================================

    Legacy field-service compatibility allows the client
    to select SERVICE mode.

    This is deliberately broken authentication for the lab.
*/

if (!authenticated && !serviceMode) {

    window.location.replace("index.html");

}


const authContext =
    serviceMode ? "LEGACY SERVICE" : "AUTHENTICATED OPERATOR";


document.getElementById("authStatus").textContent =
    "AUTH: " + authContext;

document.getElementById("systemAuthContext").textContent =
    authContext;

document.getElementById("footerSession").textContent =
    "SESSION: " + authContext;


async function loadStatus() {

    const response =
        await fetch("./api/status.json");

    const status =
        await response.json();

    document.getElementById("pressureIn").textContent =
        status.process.inletPressure;

    document.getElementById("pressureOut").textContent =
        status.process.outletPressure;

    document.getElementById("flowRate").textContent =
        status.process.flowRate;

    document.getElementById("reservoir").textContent =
        status.process.reservoirLevel;

}

loadStatus();


async function loadEvents() {

    const log =
        document.getElementById("eventLog");

    try {

        const statusResponse =
            await fetch("./api/status.json");

        const status =
            await statusResponse.json();

        const eventsResponse =
            await fetch(status.eventSource);

        const data =
            await eventsResponse.json();

        log.innerHTML = "";

        for (const event of data.events) {

            const row =
                document.createElement("div");

            row.className =
                "event-row";

            const severityClass =
                event.severity === "WARN"
                    ? "warn"
                    : "ok";

            row.innerHTML =
                "<span>" + event.time + "</span>" +
                "<span class='" +
                severityClass +
                "'>" +
                event.severity +
                "</span>" +
                "<span>" +
                event.message +
                "</span>";

            log.appendChild(row);

        }

    } catch (error) {

        log.innerHTML =
            "<span class='alarm'>" +
            "EVENT LOG UNAVAILABLE" +
            "</span>";

    }

}


document
    .querySelectorAll(".tab")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".tab")
                    .forEach(function(tab) {

                        tab.classList.remove("active");

                    });

                document
                    .querySelectorAll(".content-panel")
                    .forEach(function(panel) {

                        panel.classList.remove(
                            "active-panel"
                        );

                    });

                button.classList.add("active");

                document
                    .getElementById(
                        button.dataset.panel
                    )
                    .classList.add("active-panel");


                if (
                    button.dataset.panel ===
                    "events"
                ) {

                    loadEvents();

                }

            }
        );

    });


function setPump(running) {

    const pump =
        document.getElementById("pumpDevice");

    const state =
        document.getElementById("pumpState");

    if (running) {

        pump.classList.remove("stopped");
        pump.classList.add("running");

        state.textContent =
            "RUNNING";

    }

    else {

        pump.classList.remove("running");
        pump.classList.add("stopped");

        state.textContent =
            "STOPPED";

    }

}


document
    .getElementById("pumpStart")
    .addEventListener(
        "click",
        function() {
            setPump(true);
        }
    );


document
    .getElementById("pumpStop")
    .addEventListener(
        "click",
        function() {
            setPump(false);
        }
    );


document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        function() {

            sessionStorage.clear();

            window.location.href =
                "index.html";

        }
    );
