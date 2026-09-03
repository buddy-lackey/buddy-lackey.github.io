// ------------------------------------------------------
// BAALSTORM MFA FRONTEND
// ------------------------------------------------------

const API =
  "https://baalstorm-mfa-api.christer-l-s-andersson.workers.dev";


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

  let data;

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      "Backend returned invalid JSON"
    );
  }

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

    if (!username) {
      throw new Error(
        "Username is required"
      );
    }

    if (!password) {
      throw new Error(
        "Password is required"
      );
    }

    setStatus(
      "regPasswordStatus",
      "VERIFYING",
      "wait"
    );

    setStatus(
      "regKeyStatus",
      "LOCKED",
      ""
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

    if (!start.flowToken) {
      throw new Error(
        "Backend did not return flowToken"
      );
    }

    if (!start.options) {
      throw new Error(
        "Backend did not return WebAuthn options"
      );
    }

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

    logRegister("");

    logRegister(
      "ENROLLMENT COMPLETE."
    );

    logRegister("");

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

    if (!username) {
      throw new Error(
        "Username is required"
      );
    }

    if (!password) {
      throw new Error(
        "Password is required"
      );
    }

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

    if (!factor1.flowToken) {
      throw new Error(
        "Backend did not return flowToken"
      );
    }

    setStatus(
      "passwordStatus",
      "PASS",
      "pass"
    );

    logLogin(
      "[+] FACTOR 1 VERIFIED."
    );

    logLogin(
      "[+] Password accepted by backend."
    );

    // ------------------------------
    // FACTOR 2 OPTIONS
    // ------------------------------

    setStatus(
      "keyStatus",
      "WAITING FOR KEY",
      "wait"
    );

    logLogin(
      "[2] Requesting WebAuthn challenge..."
    );

    const factor2Options =
      await apiPost(
        "/login/start",
        {
          flowToken:
            factor1.flowToken
        }
      );

    if (!factor2Options.options) {
      throw new Error(
        "Backend did not return WebAuthn options"
      );
    }

    logLogin(
      "[+] WebAuthn challenge generated."
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

    logLogin(
      "[*] Sending signed response to backend..."
    );

    const factor2 =
      await apiPost(
        "/login/finish",
        {
          flowToken:
            factor1.flowToken,

          response:
            credential
        }
      );

    if (!factor2.verified) {
      throw new Error(
        "Factor 2 failed"
      );
    }

    if (!factor2.sessionToken) {
      throw new Error(
        "Backend did not issue session token"
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

    logLogin("");

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

    logLogin("");

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
        method: "GET",

        headers: {
          "Authorization":
            "Bearer " +
            sessionToken
        }
      }
    );

  let data;

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      "Protected endpoint returned invalid JSON"
    );
  }

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

  const factors =
    Array.isArray(data.factors)
      ? data.factors.join(", ")
      : "password + WebAuthn";

  output.textContent =
`USER: ${data.username}

BACKEND:
Authenticated session verified.

FACTORS:
${factors}

FLAG:
${data.flag}`;

  panel.style.display =
    "block";
}
