# buddy-lackey.github.io

# ALEF-93 – Cyber Security Course Website

## Purpose of this file

This README is also context for ChatGPT.

If this file is provided in a future conversation, use it to understand the
style, structure and pedagogical idea behind the ALEF-93 course website.

The teacher should be able to say something like:

> "Lecture 6 is about cryptography. Create lecture6.html."

and ChatGPT should be able to continue in the same style without needing
the previous conversation.

---

# 1. Project overview

ALEF-93 is a small cyber-security teaching website hosted using GitHub Pages.

The site is intentionally simple.

It is NOT intended to look like:

- a commercial LMS
- a corporate cyber-security website
- an AI-generated marketing page
- a complicated CTF platform

The desired feeling is:

> Minimal cyber-security training terminal / lab page.

The website consists of a landing page and one HTML page per lecture.

Typical structure:

```text
index.html
lecture1.html
lecture2.html
lecture3.html
lecture4.html
...
alef93.pngREADME.md
```

Pages should normally be self-contained HTML files with their CSS and
JavaScript inside the file.

Avoid unnecessary frameworks and dependencies.

---

# 2. General visual identity

The site uses a dark, restrained cyber-security aesthetic.

Typical palette:

```text
Background:       #05070a
Panel:            #080d0c
Secondary panel:  #0b1411
Green accent:     #00e89d
Soft green:       #7dffcf
Text:             #d8eee7
Muted text:       #77968b
Borders:          #163c31
```

Other colors may be used sparingly when they have a purpose.

Typography should preferably use:

```css
font-family: Consolas, "Courier New", monospace;
```

The design should be:

- clean
- dark
- technical
- spacious
- readable
- slightly playful
- not overloaded with "hacker" clichés

Avoid excessive:

- neon
- Matrix effects
- skulls
- fake code everywhere
- glowing animations
- gradients
- decorative icons
- AI-looking infographic aesthetics

A little personality is welcome.

---

# 3. Common page structure

A lecture page normally starts with:

```text
< RETURN TO HOME

LECTURE XX

LECTURE TITLE

● SYSTEM/NETWORK/THREAT/... ONLINE_
```

The blinking underscore is part of the ALEF-93 visual identity.

Each lecture should contain a short introduction followed by practical
challenges related directly to the lecture material.

Example:

```text
// NETWORK LAYERS

CHALLENGE 01
Know your layers

[scenario]

[question]

Reveal discussion
```

Sections can use terminal-style headings such as:

```text
// ATTACK SURFACE
// ENCAPSULATION
// FIREWALLS
// THREAT ACTORS
```

---

# 4. Pedagogical philosophy

The exercises are intended for students learning introductory
IT/cyber security.

They should reinforce concepts from the lecture rather than introduce
large amounts of unrelated material.

The desired progression is:

```text
Understand
    ↓
Recognise
    ↓
Reason
    ↓
Investigate
    ↓
Apply
```

Do NOT make every exercise a multiple-choice quiz.

Prefer:

- scenarios
- interpreting logs
- reading simplified packet information
- matching concepts to situations
- investigating browser information
- analysing configurations
- deciding which security principle applies
- explaining why something is insecure
- small technical puzzles

Questions should encourage reasoning.

For example, instead of:

> Which layer does TCP use?

prefer eventually:

```text
Source:      10.0.0.15
Destination: 203.0.113.20
Protocol:    TCP
Dst port:    443

Which parts of this information can a Layer 3/4 firewall use?
```

---

# 5. Difficulty progression

The course should gradually become more technical.

Early lectures:

- conceptual reasoning
- terminology
- simple browser investigation
- simple flags

Later lectures can include:

- packet analysis
- hashes
- Base64/hex
- certificates
- HTTP headers
- DNS
- firewall rules
- logs
- simple command output
- cryptographic concepts
- intentionally vulnerable examples
- CTF-style investigation

Do not suddenly turn an introductory lecture into an advanced penetration
testing lab.

Difficulty should follow the material students have already learned.

---

# 6. Answers

Challenges commonly contain:

```html
<details>
    <summary>Reveal discussion</summary>
    ...
</details>
```

The wording "Reveal discussion" is intentional.

The answer should usually explain WHY rather than simply provide a word.

For example:

Bad:

> Availability.

Better:

> Availability is primarily affected because legitimate users can no
> longer access the service. Confidentiality and integrity may remain
> unaffected.

Some questions may deliberately have no single correct answer.

This is especially appropriate for:

- risk
- asset valuation
- security architecture
- threat modelling
- choice of controls

---

# 7. Hidden gems and flags

Each lecture page should contain a few hidden elements.

They are intended to reward curiosity and introduce the idea:

> Security professionals inspect more than what the interface presents.

Typical flag syntax:

```text
FLAG{example_flag}
```

Flags should be fun and related to the lecture where possible.

Examples:

```text
FLAG{inspect_all_the_layers}
FLAG{encapsulation_is_layering}
FLAG{port_number_is_not_application_identity}
```

---

# 8. Where flags can be hidden

Possible locations include:

### HTML comments

```html
<!-- FLAG{viewing_source_is_useful} -->
```

### JavaScript console

```javascript
console.log("FLAG{the_browser_is_a_tool}");
```

### CSS comments

```css
/* FLAG{look_everywhere} */
```

### Encoded strings

For example Base64 or hex.

### Nearly invisible page elements

Use sparingly.

### HTML attributes

Example:

```html
<div data-note="FLAG{metadata_matters}">
```

### JavaScript variables

Example:

```javascript
const diagnostic = "FLAG{read_the_code}";
```

### robots.txt

Can be used in later exercises to teach that:

> robots.txt is not access control.

### HTTP/browser concepts

Later lectures may hide clues in concepts such as:

- headers
- cookies
- certificates
- DNS
- page source
- network requests

---

# 9. Important rule about hidden flags

DO NOT use exactly the same hiding technique in every lecture.

Students should gradually learn new investigative techniques.

For example:

```text
Lecture 1
HTML source + console

Lecture 2
HTML + console + Base64 + hidden element

Lecture 3
HTML + CSS + console + encoded payload

Later lectures
Network requests, HTTP headers, DNS, certificates, hashes, etc.
```

Flags should increasingly connect to the subject being taught.

Example:

A cryptography lecture should preferably hide a flag using cryptography
or encoding rather than simply hiding another HTML comment.

A networking lecture can hide clues in packet-like structures.

A PKI lecture can make students inspect a real certificate.

---

# 10. Hidden challenges should teach something

Flags are NOT only Easter eggs.

Whenever possible they should demonstrate a security lesson.

Examples:

```text
FLAG{comments_are_not_access_control}
```

teaches that information in client-side source is visible.

```text
FLAG{port_number_is_not_application_identity}
```

reinforces a networking concept.

```text
FLAG{robots_txt_is_not_security}
```

reinforces an access-control concept.

A student finding a flag should ideally learn something.

---

# 11. Current course structure

## Lecture 1 – Introduction to IT Security

Main structure:

```text
WHAT?
WHY?
HOW?
```

### WHAT?

Security properties including:

- Confidentiality
- Integrity
- Availability

CIA is treated as describing WHAT we want to protect/preserve.

Other security properties may also be discussed.

### WHY?

Security exists because we have:

- assets
- threats
- threat actors
- vulnerabilities
- risk

### HOW?

Security is implemented through:

- principles
- mechanisms
- techniques
- concrete controls

Topics introduced include:

- AAA
- access control
- encryption
- monitoring/detection
- Defense in Depth
- Least Privilege
- Zero Trust
- Secure by Default
- hardening

Lecture 1 challenges introduce basic reasoning and simple browser
investigation.

---

## Lecture 2 – Online threats

Main concept:

> The Internet is a shared medium.

Topics include:

- threat
- threat actor
- vulnerability
- exploit
- zero-day vulnerability/exploit
- assets
- attack surface
- Internet exposure

Threat actors include examples such as:

- state actors
- cybercriminals
- hacktivists
- opportunistic attackers
- insiders

Common attacks include:

- DDoS
- ransomware
- data breaches
- system compromise

Students connect attacks to CIA properties.

Security principles from Lecture 1 are revisited to discuss how attacks
can be prevented, limited, detected or responded to.

Risk assessment and risk matrices may also be introduced around this
part of the course.

---

## Lecture 3 – OSI model and firewalls

Focus is mainly:

```text
Layer 7  Application
Layer 4  Transport
Layer 3  Network
Layer 2  Data Link
Layer 1  Physical
```

Layers 5 and 6 are mentioned but are not the main focus.

Topics include:

- OSI model
- TCP/IP model
- relationship between OSI and TCP/IP
- encapsulation
- decapsulation
- common protocols
- MAC addresses
- IP addresses
- TCP/UDP
- ports
- application protocols

Example conceptual stack:

```text
HTTP
 ↓
TCP
 ↓
IP
 ↓
Ethernet
```

Students learn to recognise information belonging to different layers.

### Firewalls

Lecture 3 introduces:

- packet filtering
- stateless firewalls
- stateful firewalls
- connection/state tables
- firewall rules
- filtering using IP/protocol/port
- application-aware inspection

An important lesson is:

> A firewall does not necessarily operate at only one OSI layer.

Another important lesson:

> TCP port 443 is conventionally HTTPS, but seeing port 443 alone does
> not prove that the application protocol is HTTPS.

Simplified Wireshark-like output may be used in exercises.

---

# 12. Security concepts used throughout the course

The teacher uses several broad security principles.

## Least Privilege

Give users, systems and processes only the access they need.

## Separation of Duties

Critical actions should not unnecessarily depend on a single person
having complete control.

## Defense in Depth

Use multiple independent layers of protection so failure of one control
does not automatically result in complete compromise.

## Varied protection

Do not depend unnecessarily on one type of control, technology or
supplier.

## Zero Trust

Do not grant implicit trust simply because a user or device is located
"inside" the network.

Verify access explicitly and limit access to what is required.

Important:

> Zero Trust does NOT mean that network segmentation, security zones or
> Defense in Depth are obsolete.

Segmentation and multiple defensive layers remain valuable.

## Secure by Default

Systems should start in a secure configuration. Access and functionality
should not be enabled unless required.

## Hardening

Hardening is the practical process of reducing attack surface and
strengthening configuration.

Examples:

- disable unused services
- remove unnecessary software
- patch systems
- restrict permissions
- remove default accounts
- configure firewalls
- disable insecure protocols

Secure by Default is primarily a principle.

Hardening is primarily a process/practice used to achieve a safer system.

---

# 13. Security mechanisms

The course distinguishes principles from mechanisms.

A principle describes HOW WE SHOULD THINK.

A mechanism is something that IMPLEMENTS OR ENFORCES SECURITY.

Examples include:

### AAA

- Authentication
- Authorization
- Accounting

### Access control

Authorization determines what an identity is permitted to do.

Access-control mechanisms enforce those decisions.

Examples:

- ACLs
- file permissions
- firewall rules
- application permissions
- RBAC
- network access rules

### Encryption

Simple explanation:

> Encryption makes information unreadable to someone who does not have
> the correct key.

It primarily protects confidentiality.

Important distinction:

```text
Access control:
Who may access the information?

Encryption:
Who can understand the information?
```

### Monitoring and detection

Monitoring provides visibility into what is happening.

Detection analyses activity to identify something interesting or
suspicious.

Simple model:

```text
SYSTEM
   ↓
MONITORING
"What is happening?"
   ↓
DATA
   ↓
DETECTION
"Does something look suspicious?"
   ↓
ALERT
```

Examples include:

- logging
- network monitoring
- IDS
- SIEM
- EDR

Modern tools often perform both monitoring and detection.

---

# 14. Security strategy / timing

Security controls can also be discussed according to WHEN or HOW they
affect an attack.

Examples:

```text
Prevent
Delay
Detect
Respond
Recover
```

Another useful distinction is:

### Proactive

Measures taken before something happens to reduce likelihood,
vulnerability or impact.

Examples:

- patching
- hardening
- MFA
- segmentation
- security awareness
- least privilege

### Reactive

Measures used after or during an incident to limit damage and restore
normal operations.

Examples:

- incident response
- containment
- investigation
- log analysis
- restoring backups
- reporting

These classifications overlap.

A security control may serve more than one purpose.

Do not force every security technology into exactly one conceptual box.

---

# 15. Tone of the course

The teacher wants technically correct explanations without making
introductory concepts unnecessarily complicated.

Prefer:

> "An IP address belongs to Layer 3."

Then later introduce nuance when useful.

Avoid turning every simple statement into:

> "Well technically..."

Nuance should be introduced when it teaches something important.

The course should encourage curiosity.

Students should gradually develop the instinct:

```text
What am I actually looking at?

What assumptions am I making?

What information is available?

What is hidden?

What layer am I observing?

What could an attacker do?

What could a defender do?
```

---

# 16. Language

The teacher's presentation material is mainly Swedish.

The ALEF-93 challenge pages created so far use primarily English
headings/questions because they are intended to feel like small
technical labs.

Continue the existing language of a page unless asked otherwise.

If creating explanatory material for the teacher, Swedish is preferred.

---

# 17. Creating a new lecture page

When ChatGPT is asked to create:

```text
lectureX.html
```

first understand the lecture topics supplied by the teacher.

Then:

1. Identify the main concepts students should understand.
2. Divide them into logical sections.
3. Create approximately 6–12 challenges depending on the material.
4. Start with recognition/comprehension.
5. Progress toward reasoning/application.
6. Include practical-looking material where appropriate.
7. Include "Reveal discussion" answers.
8. Add several hidden gems/flags.
9. Make hidden flags relevant to the lecture where possible.
10. Avoid simply cloning the previous lecture.
11. Keep the ALEF-93 visual identity.
12. Return a complete self-contained HTML file.

Where possible, make the page itself part of the exercise.

---

# 18. Important design principle for future lectures

The website should evolve together with the students.

Early in the course:

> "Look at the HTML source."

Later:

> "Inspect this HTTP request."

Later:

> "Why does this certificate fail validation?"

Later:

> "Which firewall rule allowed this traffic?"

Later:

> "What can you infer from this packet capture?"

The browser, network and web page can therefore become part of the
learning environment.

This is preferable to simply adding more quiz questions.

---

# 19. Do not overdo the CTF elements

The course is an IT-security course, not primarily a CTF.

Flags are secondary.

The primary goal is understanding.

A good lecture page should still be useful if a student ignores every
hidden flag.

Hidden challenges are there to reward students who investigate further.

---

# 20. Final instruction to future ChatGPT

When this README is provided in a future conversation:

**Continue the project rather than redesigning it.**

Preserve:

- the visual identity
- the pedagogical progression
- the terminal/lab feeling
- the use of scenarios
- hidden gems
- technical correctness
- concise explanations
- increasing practical depth

Do not assume every lecture should look identical.

The course should gradually move from conceptual security toward
practical investigation.

When the teacher provides the subject of the next lecture, create
exercises that make students USE what was taught rather than merely
repeat definitions.

The guiding idea is:

> **Teach the concept in the lecture. Let the student discover what it
> means in the lab.**
