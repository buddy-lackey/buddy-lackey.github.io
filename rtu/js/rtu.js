/*
=================================================================
 RTU-17 TRAINING SIMULATOR
-----------------------------------------------------------------
 Static GitHub Pages simulation.

 Everything here is simulated and only affects the browser.

 The authentication weakness in this lab is intentional.
=================================================================
*/


/* ===============================================================
   AUTHENTICATION CONTEXT
   =============================================================== */

const params =
    new URLSearchParams(window.location.search);

const serviceMode =
    params.get("mode") === "service";

const authenticated =
    sessionStorage.getItem("authenticated") === "true";


/*
    INTENTIONALLY VULNERABLE TRAINING LOGIC

    Normal access requires authentication.

    Legacy service mode trusts a client-controlled URL parameter.
*/

if (!authenticated && !serviceMode) {

    window.location.replace("index.html");

}


const authContext =
    serviceMode
        ? "LEGACY SERVICE"
        : "AUTHENTICATED OPERATOR";


document.getElementById("authStatus").textContent =
    "AUTH: " + authContext;

document.getElementById("systemAuthContext").textContent =
    authContext;

document.getElementById("footerSession").textContent =
    "SESSION: " + authContext;


/* ===============================================================
   PROCESS MODEL
   =============================================================== */

const process = {

    pumpRunning: true,

    flow: 184,
    inletPressure: 3.82,
    outletPressure: 5.14,
    reservoir: 72,

    targetFlow: 184,
    targetInletPressure: 3.82,
    targetOutletPressure: 5.14,
    targetReservoir: 72,

    processState: "NORMAL",

    stoppedSeconds: 0,

    activeAlarms: new Map(),

    eventHistory: [],

    initialEventsLoaded: false

};


/* ===============================================================
   DOM REFERENCES
   =============================================================== */

const flowRate =
    document.getElementById("flowRate");

const pressureIn =
    document.getElementById("pressureIn");

const pressureOut =
    document.getElementById("pressureOut");

const reservoir =
    document.getElementById("reservoir");

const diagramFlow =
    document.getElementById("diagramFlow");


const metricFlow =
    document.getElementById("metricFlow");

const metricInlet =
    document.getElementById("metricInlet");

const metricOutlet =
    document.getElementById("metricOutlet");

const metricReservoir =
    document.getElementById("metricReservoir");


const flowState =
    document.getElementById("flowState");

const pressureInState =
    document.getElementById("pressureInState");

const pressureOutState =
    document.getElementById("pressureOutState");

const reservoirState =
    document.getElementById("reservoirState");


const pumpDevice =
    document.getElementById("pumpDevice");

const pumpState =
    document.getElementById("pumpState");

const pumpControlStatus =
    document.getElementById("pumpControlStatus");


const processStatus =
    document.getElementById("processStatus");

const processMessage =
    document.getElementById("processMessage");

const systemProcessState =
    document.getElementById("systemProcessState");


const activeAlarmPanel =
    document.getElementById("activeAlarmPanel");

const alarmCount =
    document.getElementById("alarmCount");


const digitalPump =
    document.getElementById("digitalPump");

const digitalLowFlow =
    document.getElementById("digitalLowFlow");

const digitalCritical =
    document.getElementById("digitalCritical");

const digitalCommand =
    document.getElementById("digitalCommand");


const flowTracks = [
    document.getElementById("flowTrack1"),
    document.getElementById("flowTrack2")
];


/* ===============================================================
   UTILITY FUNCTIONS
   =============================================================== */

function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );

}


function approach(
    current,
    target,
    speed
) {

    if (
        Math.abs(target - current)
        <= speed
    ) {

        return target;

    }

    return current +
        Math.sign(target - current)
        * speed;

}


function randomNoise(amount) {

    return (
        Math.random() - 0.5
    ) * amount;

}


function getTimestamp() {

    return new Date()
        .toLocaleTimeString(
            "sv-SE",
            {
                hour12: false
            }
        );

}


/* ===============================================================
   PROCESS SIMULATION
   =============================================================== */

function updateProcess() {

    if (process.pumpRunning) {

        /*
            Pump running:
            process gradually returns to nominal values.
        */

        process.stoppedSeconds = 0;


        process.flow =
            approach(
                process.flow,
                process.targetFlow,
                9
            );


        process.outletPressure =
            approach(
                process.outletPressure,
                process.targetOutletPressure,
                0.18
            );


        process.inletPressure =
            approach(
                process.inletPressure,
                process.targetInletPressure,
                0.07
            );


        /*
            Reservoir slowly settles back toward nominal.
        */

        process.reservoir =
            approach(
                process.reservoir,
                process.targetReservoir,
                0.08
            );

    }

    else {

        /*
            Pump stopped:
            flow and outlet pressure collapse gradually.
        */

        process.stoppedSeconds++;


        process.flow =
            clamp(
                process.flow - 12,
                0,
                250
            );


        process.outletPressure =
            clamp(
                process.outletPressure - 0.22,
                0.45,
                8
            );


        /*
            Inlet pressure changes much less dramatically.
        */

        process.inletPressure =
            approach(
                process.inletPressure,
                3.35,
                0.035
            );


        /*
            Simulated reservoir begins rising because
            water is no longer being pumped away.
        */

        process.reservoir =
            clamp(
                process.reservoir + 0.32,
                0,
                100
            );

    }


    /*
        Small measurement noise makes the RTU feel alive.
    */

    let displayedFlow =
        process.flow;

    let displayedInlet =
        process.inletPressure;

    let displayedOutlet =
        process.outletPressure;

    let displayedReservoir =
        process.reservoir;


    if (process.pumpRunning) {

        displayedFlow +=
            randomNoise(2.6);

        displayedInlet +=
            randomNoise(0.035);

        displayedOutlet +=
            randomNoise(0.04);

        displayedReservoir +=
            randomNoise(0.035);

    }


    updateDisplay(
        displayedFlow,
        displayedInlet,
        displayedOutlet,
        displayedReservoir
    );


    evaluateProcess();

}


/* ===============================================================
   DISPLAY VALUES
   =============================================================== */

function updateDisplay(
    displayedFlow,
    displayedInlet,
    displayedOutlet,
    displayedReservoir
) {

    flowRate.textContent =
        Math.round(
            Math.max(0, displayedFlow)
        );


    diagramFlow.textContent =
        Math.round(
            Math.max(0, displayedFlow)
        );


    pressureIn.textContent =
        Math.max(
            0,
            displayedInlet
        ).toFixed(2);


    pressureOut.textContent =
        Math.max(
            0,
            displayedOutlet
        ).toFixed(2);


    reservoir.textContent =
        clamp(
            displayedReservoir,
            0,
            100
        ).toFixed(1);

}


/* ===============================================================
   PROCESS CONDITIONS
   =============================================================== */

function evaluateProcess() {

    resetMetricClasses();


    /*
        FLOW CONDITIONS
    */

    if (process.flow < 30) {

        setMetricCritical(
            metricFlow,
            flowState,
            "CRITICAL LOW"
        );

        setAlarm(
            "FLOW_CRITICAL",
            "CRITICAL",
            "FT-101 PROCESS FLOW CRITICALLY LOW"
        );

    }

    else if (process.flow < 100) {

        setMetricWarning(
            metricFlow,
            flowState,
            "LOW FLOW"
        );

        clearAlarm(
            "FLOW_CRITICAL",
            "FT-101 critical flow condition cleared"
        );

        setAlarm(
            "FLOW_LOW",
            "WARN",
            "FT-101 PROCESS FLOW BELOW OPERATIONAL LIMIT"
        );

    }

    else {

        flowState.textContent =
            "NORMAL";

        clearAlarm(
            "FLOW_LOW",
            "FT-101 flow returned to normal"
        );

        clearAlarm(
            "FLOW_CRITICAL",
            "FT-101 critical flow condition cleared"
        );

    }


    /*
        OUTLET PRESSURE
    */

    if (process.outletPressure < 2.0) {

        setMetricCritical(
            metricOutlet,
            pressureOutState,
            "CRITICAL LOW"
        );

        setAlarm(
            "PRESSURE_CRITICAL",
            "CRITICAL",
            "PT-102 OUTLET PRESSURE CRITICALLY LOW"
        );

    }

    else if (process.outletPressure < 3.8) {

        setMetricWarning(
            metricOutlet,
            pressureOutState,
            "LOW PRESSURE"
        );

        clearAlarm(
            "PRESSURE_CRITICAL",
            "PT-102 critical pressure condition cleared"
        );

        setAlarm(
            "PRESSURE_LOW",
            "WARN",
            "PT-102 OUTLET PRESSURE BELOW WARNING LIMIT"
        );

    }

    else {

        pressureOutState.textContent =
            "NORMAL";

        clearAlarm(
            "PRESSURE_LOW",
            "PT-102 outlet pressure returned to normal"
        );

        clearAlarm(
            "PRESSURE_CRITICAL",
            "PT-102 critical pressure condition cleared"
        );

    }


    /*
        INLET PRESSURE

        Not normally expected to go critical in this simple model,
        but the metric stays alive.
    */

    if (process.inletPressure < 3.5) {

        setMetricWarning(
            metricInlet,
            pressureInState,
            "LOW"
        );

    }

    else {

        pressureInState.textContent =
            "NORMAL";

    }


    /*
        RESERVOIR

        Designed to become a secondary consequence if the
        pump remains stopped for a long time.
    */

    if (process.reservoir >= 85) {

        setMetricCritical(
            metricReservoir,
            reservoirState,
            "HIGH-HIGH"
        );

        setAlarm(
            "LEVEL_HIGH_HIGH",
            "CRITICAL",
            "LT-101 RESERVOIR LEVEL HIGH-HIGH"
        );

    }

    else if (process.reservoir >= 78) {

        setMetricWarning(
            metricReservoir,
            reservoirState,
            "HIGH"
        );

        clearAlarm(
            "LEVEL_HIGH_HIGH",
            "LT-101 high-high condition cleared"
        );

        setAlarm(
            "LEVEL_HIGH",
            "WARN",
            "LT-101 RESERVOIR LEVEL HIGH"
        );

    }

    else {

        reservoirState.textContent =
            "NORMAL";

        clearAlarm(
            "LEVEL_HIGH",
            "LT-101 reservoir level returned to normal"
        );

        clearAlarm(
            "LEVEL_HIGH_HIGH",
            "LT-101 high-high condition cleared"
        );

    }


    updateOverallProcessState();
    updateFlowAnimation();
    updateDigitalInputs();
    renderActiveAlarms();

}


/* ===============================================================
   METRIC APPEARANCE
   =============================================================== */

function resetMetricClasses() {

    [
        metricFlow,
        metricInlet,
        metricOutlet,
        metricReservoir

    ].forEach(
        function(metric) {

            metric.classList.remove(
                "warning",
                "critical-state"
            );

        }
    );

}


function setMetricWarning(
    metric,
    label,
    text
) {

    metric.classList.add(
        "warning"
    );

    label.textContent =
        text;

}


function setMetricCritical(
    metric,
    label,
    text
) {

    metric.classList.add(
        "critical-state"
    );

    label.textContent =
        text;

}


/* ===============================================================
   OVERALL PROCESS STATE
   =============================================================== */

function updateOverallProcessState() {

    const hasCritical =
        Array
            .from(
                process.activeAlarms.values()
            )
            .some(
                alarm =>
                    alarm.severity ===
                    "CRITICAL"
            );


    const hasWarning =
        Array
            .from(
                process.activeAlarms.values()
            )
            .some(
                alarm =>
                    alarm.severity ===
                    "WARN"
            );


    let newState =
        "NORMAL";


    if (hasCritical) {

        newState =
            "CRITICAL";

    }

    else if (hasWarning) {

        newState =
            "WARNING";

    }

    else if (!process.pumpRunning) {

        newState =
            "DEGRADED";

    }


    if (
        newState !==
        process.processState
    ) {

        process.processState =
            newState;

        if (newState === "CRITICAL") {

            addEvent(
                "CRITICAL",
                "PROCESS CONDITION ENTERED CRITICAL STATE"
            );

        }

        else if (newState === "WARNING") {

            addEvent(
                "WARN",
                "PROCESS CONDITION ENTERED WARNING STATE"
            );

        }

        else if (newState === "NORMAL") {

            addEvent(
                "INFO",
                "PROCESS RETURNED TO NORMAL OPERATING STATE"
            );

        }

    }


    processStatus.textContent =
        newState;

    systemProcessState.textContent =
        newState;


    processStatus.className = "";
    systemProcessState.className = "";
    processMessage.className =
        "process-message";


    document.body.classList.remove(
        "process-critical"
    );


    if (newState === "CRITICAL") {

        processStatus.classList.add(
            "critical"
        );

        systemProcessState.classList.add(
            "critical"
        );

        processMessage.classList.add(
            "critical"
        );

        processMessage.textContent =
            "PROCESS CONDITION CRITICAL";

        document.body.classList.add(
            "process-critical"
        );

    }

    else if (
        newState === "WARNING"
    ) {

        processStatus.classList.add(
            "warn"
        );

        systemProcessState.classList.add(
            "warn"
        );

        processMessage.classList.add(
            "warn"
        );

        processMessage.textContent =
            "PROCESS LIMIT WARNING";

    }

    else if (
        newState === "DEGRADED"
    ) {

        processStatus.classList.add(
            "warn"
        );

        systemProcessState.classList.add(
            "warn"
        );

        processMessage.classList.add(
            "warn"
        );

        processMessage.textContent =
            "PUMP OFFLINE // PROCESS DECAY";

    }

    else {

        processStatus.classList.add(
            "ok"
        );

        systemProcessState.classList.add(
            "ok"
        );

        processMessage.classList.add(
            "ok"
        );

        processMessage.textContent =
            "SYSTEM STABLE";

    }

}


/* ===============================================================
   ALARM MANAGEMENT
   =============================================================== */

function setAlarm(
    id,
    severity,
    message
) {

    if (
        process.activeAlarms.has(id)
    ) {

        return;

    }


    process.activeAlarms.set(
        id,
        {
            severity,
            message
        }
    );


    addEvent(
        severity,
        message
    );

}


function clearAlarm(
    id,
    clearMessage
) {

    if (
        !process.activeAlarms.has(id)
    ) {

        return;

    }


    process.activeAlarms.delete(id);


    addEvent(
        "INFO",
        clearMessage
    );

}


function renderActiveAlarms() {

    alarmCount.textContent =
        process.activeAlarms.size;


    if (
        process.activeAlarms.size === 0
    ) {

        activeAlarmPanel.innerHTML =
            "<div class='no-alarms'>" +
            "NO ACTIVE ALARMS" +
            "</div>";

        return;

    }


    activeAlarmPanel.innerHTML =
        "";


    for (
        const alarm
        of process.activeAlarms.values()
    ) {

        const row =
            document.createElement("div");


        row.className =
            "active-alarm " +
            (
                alarm.severity ===
                "CRITICAL"

                ? "critical"

                : "warning"
            );


        row.innerHTML =
            "<span>" +
            alarm.severity +
            "</span>" +

            "<span>" +
            alarm.message +
            "</span>";


        activeAlarmPanel.appendChild(
            row
        );

    }

}


/* ===============================================================
   EVENT LOG
   =============================================================== */

function addEvent(
    severity,
    message
) {

    const event = {

        time:
            getTimestamp(),

        severity:
            severity,

        message:
            message,

        live:
            true

    };


    /*
        Newest events first.
    */

    process.eventHistory.unshift(
        event
    );


    /*
        Prevent endless growth.
    */

    if (
        process.eventHistory.length >
        100
    ) {

        process.eventHistory.pop();

    }


    renderEventLog();

}


async function loadEvents() {

    if (
        process.initialEventsLoaded
    ) {

        renderEventLog();
        return;

    }


    try {

        const statusResponse =
            await fetch(
                "./api/status.json"
            );


        const status =
            await statusResponse.json();


        const eventsResponse =
            await fetch(
                status.eventSource
            );


        const data =
            await eventsResponse.json();


        /*
            Existing static events are preserved.
        */

        const historical =
            data.events.map(
                function(event) {

                    return {
                        time:
                            event.time,

                        severity:
                            event.severity,

                        message:
                            event.message,

                        live:
                            false
                    };

                }
            );


        process.eventHistory =
            [
                ...process.eventHistory,
                ...historical
            ];


        process.initialEventsLoaded =
            true;


        renderEventLog();

    }

    catch (error) {

        document
            .getElementById(
                "eventLog"
            )
            .innerHTML =

            "<div class='event-row'>" +
            "<span>--:--:--</span>" +
            "<span class='alarm'>ERROR</span>" +
            "<span>EVENT LOG UNAVAILABLE</span>" +
            "</div>";

    }

}


function renderEventLog() {

    const log =
        document.getElementById(
            "eventLog"
        );


    if (!log) {

        return;

    }


    log.innerHTML =
        "";


    for (
        const event
        of process.eventHistory
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "event-row" +
            (
                event.live
                    ? " live-event"
                    : ""
            );


        let severityClass =
            "ok";


        if (
            event.severity ===
            "WARN"
        ) {

            severityClass =
                "warn";

        }


        if (
            event.severity ===
            "CRITICAL"
        ) {

            severityClass =
                "alarm";

        }


        row.innerHTML =

            "<span>" +
            event.time +
            "</span>" +

            "<span class='" +
            severityClass +
            "'>" +
            event.severity +
            "</span>" +

            "<span>" +
            event.message +
            "</span>";


        log.appendChild(
            row
        );

    }

}


/* ===============================================================
   PUMP CONTROL
   =============================================================== */

function stopPump() {

    if (
        !process.pumpRunning
    ) {

        addEvent(
            "INFO",
            "STOP COMMAND IGNORED // P-101 ALREADY STOPPED"
        );

        return;

    }


    addEvent(
        "INFO",
        "REMOTE STOP COMMAND ISSUED TO P-101"
    );


    process.pumpRunning =
        false;


    pumpDevice.classList.remove(
        "running"
    );

    pumpDevice.classList.add(
        "stopped"
    );


    pumpState.textContent =
        "STOPPED";

    pumpControlStatus.textContent =
        "STOPPED";

    pumpControlStatus.className =
        "alarm";


    addEvent(
        "WARN",
        "P-101 STATE CHANGED RUNNING -> STOPPED"
    );


    updateDigitalInputs();

}


function startPump() {

    if (
        process.pumpRunning
    ) {

        addEvent(
            "INFO",
            "START COMMAND IGNORED // P-101 ALREADY RUNNING"
        );

        return;

    }


    addEvent(
        "INFO",
        "REMOTE START COMMAND ISSUED TO P-101"
    );


    process.pumpRunning =
        true;


    pumpDevice.classList.remove(
        "stopped"
    );

    pumpDevice.classList.add(
        "running"
    );


    pumpState.textContent =
        "RUNNING";

    pumpControlStatus.textContent =
        "RUNNING";

    pumpControlStatus.className =
        "ok";


    addEvent(
        "INFO",
        "P-101 STATE CHANGED STOPPED -> RUNNING"
    );


    addEvent(
        "INFO",
        "PROCESS RECOVERY IN PROGRESS"
    );


    updateDigitalInputs();

}


document
    .getElementById(
        "pumpStart"
    )
    .addEventListener(
        "click",
        startPump
    );


document
    .getElementById(
        "pumpStop"
    )
    .addEventListener(
        "click",
        stopPump
    );


/* ===============================================================
   FLOW ANIMATION
   =============================================================== */

function updateFlowAnimation() {

    let className =
        "flowing";


    if (
        process.flow < 15
    ) {

        className =
            "no-flow";

    }

    else if (
        process.flow < 100
    ) {

        className =
            "slow-flow";

    }


    flowTracks.forEach(
        function(track) {

            track.classList.remove(
                "flowing",
                "slow-flow",
                "no-flow"
            );

            track.classList.add(
                className
            );

        }
    );

}


/* ===============================================================
   DIGITAL I/O DISPLAY
   =============================================================== */

function updateDigitalInputs() {

    const running =
        process.pumpRunning;


    digitalPump.textContent =
        running ? "1" : "0";

    digitalCommand.textContent =
        running ? "1" : "0";


    digitalPump.className =
        running
            ? "ok"
            : "alarm";


    digitalCommand.className =
        running
            ? "ok"
            : "alarm";


    const lowFlow =
        process.flow < 100;


    digitalLowFlow.textContent =
        lowFlow ? "1" : "0";

    digitalLowFlow.className =
        lowFlow
            ? "warn"
            : "";


    const critical =
        process.processState ===
        "CRITICAL";


    digitalCritical.textContent =
        critical ? "1" : "0";

    digitalCritical.className =
        critical
            ? "alarm"
            : "";

}


/* ===============================================================
   TABS
   =============================================================== */

document
    .querySelectorAll(".tab")
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    document
                        .querySelectorAll(
                            ".tab"
                        )
                        .forEach(
                            function(tab) {

                                tab.classList.remove(
                                    "active"
                                );

                            }
                        );


                    document
                        .querySelectorAll(
                            ".content-panel"
                        )
                        .forEach(
                            function(panel) {

                                panel.classList.remove(
                                    "active-panel"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    document
                        .getElementById(
                            button.dataset.panel
                        )
                        .classList.add(
                            "active-panel"
                        );


                    if (
                        button.dataset.panel ===
                        "events"
                    ) {

                        loadEvents();

                    }

                }
            );

        }
    );


/* ===============================================================
   LOGOUT
   =============================================================== */

document
    .getElementById(
        "logoutButton"
    )
    .addEventListener(
        "click",
        function() {

            sessionStorage.clear();

            window.location.href =
                "index.html";

        }
    );


/* ===============================================================
   CLOCK
   =============================================================== */

function updateClock() {

    document
        .getElementById(
            "clock"
        )
        .textContent =
        new Date()
            .toLocaleString(
                "sv-SE"
            );

}


/* ===============================================================
   INITIALIZE
   =============================================================== */

function initialize() {

    flowTracks.forEach(
        function(track) {

            track.classList.add(
                "flowing"
            );

        }
    );


    updateClock();

    updateDigitalInputs();

    renderActiveAlarms();


    /*
        Initial station event.
    */

    addEvent(
        "INFO",
        "RTU-17 PROCESS TELEMETRY ONLINE"
    );


    if (serviceMode) {

        addEvent(
            "WARN",
            "SESSION ACTIVE UNDER LEGACY SERVICE CONTEXT"
        );

    }


    /*
        Load historical event data including the CTF trail.
    */

    loadEvents();


    /*
        One RTU scan per second.
    */

    setInterval(
        updateProcess,
        1000
    );


    setInterval(
        updateClock,
        1000
    );

}


initialize();
