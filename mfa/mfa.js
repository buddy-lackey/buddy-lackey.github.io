// ------------------------------------------------------
// CHANGE THIS AFTER CLOUDFLARE DEPLOY
// ------------------------------------------------------

const API =
  "https://baalstorm-mfa-api.DITT_WORKERS_SUBDOMAIN.workers.dev";


// ------------------------------------------------------
// SIMPLEWEBAUTHN
// ------------------------------------------------------

const {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn
} = SimpleWebAuthnBrowser;


// ------------------------------------------------------
// UI
// ------------------------------------------------------

function showTab(name) {

  document
    .querySelectorAll(".tab-content")
    .forEach(el => {
      el.classList.remove("active");
    });

  document
    .getElementById(name)
    .classList.add("active");
}



function setStatus(
  id,
  text,
  type = ""
) {

  const el =
    document.getElementById(id);

  el.textContent = text;

  el.className =
    "status " + type;
}



function logRegister(message) {

  const el =
    document.getElementById(
      "registerConsole"
    );

  el.textContent +=
    "\n" + message;
}



function clearRegister() {

  document
    .getElementById(
      "registerConsole"
    )
    .textContent =
      "REGISTRATION CEREMONY STARTED.";
}



function logLogin(message) {

  const el =
    document.getElementById(
      "loginConsole"
    );

  el.textContent +=
    "\n" + message;
}



function clearLogin() {

  document
    .getElementById(
      "loginConsole"
    )
    .textContent =
      "AUTHENTICATION CEREMONY STARTED.";
}


// ------------------------------------------------------
// HTTP
// ------------------------------------------------------

async function apiPost(
  path,
  body
) {

  const response =
    await fetch(
      API + path,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(body)
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.error ||
      "API request failed"
    );
  }


  return data;
}


// ------------------------------------------------------
// REGISTRATION
// ------------------------------------------------------

async function registerKey() {

  const button =
    document.getElementById(
      "registerButton"
    );

  button.disabled = true;

  clearRegister();


  try {

    if (
      !browserSupportsWebAuthn()
    ) {
      throw new Error(
        "Browser does not support WebAuthn"
      );
    }


    const username =
      document
        .getElementById(
          "regUsername"
        )
        .value
        .trim();


    const password =
      document
        .getElementById(
          "regPassword"
        )
        .value;


    setStatus(
      "regPasswordStatus",
      "VERIFYING",
      "wait"
    );


    logRegister(
      "[*] Contacting Baalstorm backend..."
    );


    const start =
      await apiPost(
        "/register/start",
        {
          username,
          password
        }
      );


    setStatus(
      "regPasswordStatus",
      "PASS",
      "pass"
    );


    logRegister(
      "[+] Password accepted."
    );


    setStatus(
      "regKeyStatus",
      "TOUCH KEY",
      "wait"
    );


    logRegister(
      "[*] WebAuthn challenge received."
    );

    logRegister(
      "[*] Insert/touch your security key."
    );


    const credential =
      await startRegistration({
        optionsJSON:
          start.options
      });


    logRegister(
      "[+] Authenticator responded."
    );


    const finish =
      await apiPost(
        "/register/finish",
        {
          flowToken:
            start.flowToken,

          response:
            credential
        }
      );


    if (!finish.verified) {
      throw new Error(
        "Registration verification failed"
      );
    }


    setStatus(
      "regKeyStatus",
      "REGISTERED",
      "pass"
    );


    logRegister(
      "[+] Signature verified by backend."
    );

    logRegister(
      "[+] Credential public key stored."
    );

    logRegister(
      ""
    );

    logRegister(
      "ENROLLMENT COMPLETE."
    );

    logRegister(
      ""
    );

    logRegister(
      "Private key remained inside authenticator."
    );


  } catch (error) {

    console.error(error);

    setStatus(
      "regKeyStatus",
      "FAILED",
      "fail"
    );

    logRegister(
      "[!] " + error.message
    );

  } finally {

    button.disabled = false;
  }
}


// ------------------------------------------------------
// LOGIN
// ------------------------------------------------------

async function login() {

  const button =
    document.getElementById(
      "loginButton"
    );

  button.disabled = true;

  clearLogin();


  document
    .getElementById(
      "flagPanel"
    )
    .style.display =
      "none";


  try {

    if (
      !browserSupportsWebAuthn()
    ) {
      throw new Error(
        "Browser does not support WebAuthn"
      );
    }


    const username =
      document
        .getElementById(
          "loginUsername"
        )
        .value
        .trim();


    const password =
      document
        .getElementById(
          "loginPassword"
        )
        .value;


    // ------------------------------
    // FACTOR 1
    // ------------------------------

    setStatus(
      "passwordStatus",
      "VERIFYING",
      "wait"
    );

    setStatus(
      "keyStatus",
      "LOCKED",
      ""
    );

    setStatus(
      "sessionStatus",
      "LOCKED",
      ""
    );


    logLogin(
      "[1] Verifying password..."
    );


    const factor1 =
      await apiPost(
        "/login/password",
        {
          username,
          password
        }
      );


    setStatus(
      "passwordStatus",
      "PASS",
      "pass"
    );


    logLogin(
      "[+] FACTOR 1 VERIFIED."
    );


    // ------------------------------
    // FACTOR 2 OPTIONS
    // ------------------------------

    setStatus(
      "keyStatus",
      "WAITING FOR KEY",
      "wait"
    );


    const factor2Options =
      await apiPost(
        "/login/start",
        {
          loginToken:
            factor1.loginToken
        }
      );


    logLogin(
      "[2] WebAuthn challenge generated."
    );

    logLogin(
      "[*] Insert/touch registered security key."
    );


    // ------------------------------
    // PHYSICAL SECURITY KEY
    // ------------------------------

    const credential =
      await startAuthentication({
        optionsJSON:
          factor2Options.options
      });


    logLogin(
      "[+] Authenticator response received."
    );


    // ------------------------------
    // BACKEND VERIFICATION
    // ------------------------------

    const factor2 =
      await apiPost(
        "/login/finish",
        {
          loginToken:
            factor1.loginToken,

          response:
            credential
        }
      );


    if (!factor2.verified) {
      throw new Error(
        "Factor 2 failed"
      );
    }


    setStatus(
      "keyStatus",
      "PASS",
      "pass"
    );


    setStatus(
      "sessionStatus",
      "AUTHORIZED",
      "pass"
    );


    logLogin(
      "[+] FACTOR 2 VERIFIED."
    );

    logLogin(
      "[+] Session issued by backend."
    );

    logLogin(
      ""
    );

    logLogin(
      "ACCESS GRANTED."
    );


    // ------------------------------
    // ACTUAL PROTECTED ENDPOINT
    // ------------------------------

    await getProtectedResource(
      factor2.sessionToken
    );


  } catch (error) {

    console.error(error);


    if (
      document
        .getElementById(
          "passwordStatus"
        )
        .textContent
        !== "PASS"
    ) {

      setStatus(
        "passwordStatus",
        "FAIL",
        "fail"
      );

    } else {

      setStatus(
        "keyStatus",
        "FAIL",
        "fail"
      );
    }


    setStatus(
      "sessionStatus",
      "DENIED",
      "fail"
    );


    logLogin(
      "[!] " + error.message
    );

    logLogin(
      ""
    );

    logLogin(
      "ACCESS DENIED."
    );

  } finally {

    button.disabled = false;
  }
}


// ------------------------------------------------------
// PROTECTED ENDPOINT
// ------------------------------------------------------

async function getProtectedResource(
  sessionToken
) {

  const response =
    await fetch(
      API + "/protected",
      {
        headers: {
          "Authorization":
            "Bearer " +
            sessionToken
        }
      }
    );


  const data =
    await response.json();


  if (!response.ok) {
    throw new Error(
      data.error ||
      "Protected resource denied"
    );
  }


  const panel =
    document.getElementById(
      "flagPanel"
    );


  const output =
    document.getElementById(
      "protectedOutput"
    );


  output.textContent =
`USER: ${data.username}

BACKEND:
${data.message}

FLAG:
${data.flag}`;


  panel.style.display =
    "block";
}
