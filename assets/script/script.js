// Cookies

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname;
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


// SPLASH

let apiURL = 'https://api.ipstack.com/check?access_key=bc1da7650f133274f0267cb8a06ad8d2';
let IPData = {};
let tempData = {};
let emailData;

const setIfValid = (obj, key, value) => {
    if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        value !== 'undefined'
    ) {
        obj[key] = value;
    }
};

const getIP = async () => {
    try {

        // =========================
        // IPSTACK
        // =========================
        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error('Failed to fetch IP data');
        }

        IPData = await response.json();

        // =========================
        // BASIC NETWORK INFO
        // =========================
        setIfValid(tempData, 'ip', IPData.ip);
        setIfValid(tempData, 'country', IPData.country_name);
        setIfValid(tempData, 'countryCode', IPData.country_code);
        setIfValid(tempData, 'city', IPData.city);
        setIfValid(tempData, 'region', IPData.region_name);
        setIfValid(tempData, 'zip', IPData.zip);

        // GEO
        if (IPData.latitude && IPData.longitude) {
            tempData.loc = `${IPData.latitude},${IPData.longitude}`;
        }

        // ISP / CONNECTION
        setIfValid(tempData, 'isp', IPData.connection?.isp);
        setIfValid(tempData, 'connectionType', IPData.connection?.type);

        // ASN
        setIfValid(tempData, 'asn', IPData.connection?.asn);

        // CARRIER
        setIfValid(tempData, 'carrier', IPData.connection?.carrier);

        // =========================
        // DEVICE DETECTION
        // =========================
        const ua = navigator.userAgent;

        let deviceType = 'Desktop';

        if (/tablet|ipad/i.test(ua)) {
            deviceType = 'Tablet';
        } else if (/mobile|iphone|android/i.test(ua)) {
            deviceType = 'Mobile';
        }

        if (/smart-tv|smarttv|googletv|appletv/i.test(ua)) {
            deviceType = 'Smart TV';
        }

        setIfValid(tempData, 'deviceType', deviceType);

        // DEVICE NAME
        if (/iphone/i.test(ua)) {
            tempData.device = 'iPhone';
        } else if (/ipad/i.test(ua)) {
            tempData.device = 'iPad';
        } else if (/android/i.test(ua)) {
            tempData.device = 'Android';
        }

        // =========================
        // OS
        // =========================
        let os = 'Unknown';

        if (/windows/i.test(ua)) {
            os = 'Windows';
        } else if (/android/i.test(ua)) {
            os = 'Android';
        } else if (/iphone|ipad|ipod/i.test(ua)) {
            os = 'iOS';
        } else if (/mac/i.test(ua)) {
            os = 'macOS';
        } else if (/linux/i.test(ua)) {
            os = 'Linux';
        }

        setIfValid(tempData, 'os', os);

        // =========================
        // BROWSER
        // =========================
        let browser = 'Unknown';

        if (/edg/i.test(ua)) {
            browser = 'Edge';
        } else if (/opr|opera/i.test(ua)) {
            browser = 'Opera';
        } else if (/chrome/i.test(ua)) {
            browser = 'Chrome';
        } else if (/safari/i.test(ua)) {
            browser = 'Safari';
        } else if (/firefox/i.test(ua)) {
            browser = 'Firefox';
        }

        setIfValid(tempData, 'browser', browser);

        // =========================
        // IN-APP BROWSER
        // =========================
        if (/FBAN|FBAV/i.test(ua)) {
            tempData.inAppBrowser = 'Facebook';
        } else if (/Instagram/i.test(ua)) {
            tempData.inAppBrowser = 'Instagram';
        } else if (/Twitter/i.test(ua)) {
            tempData.inAppBrowser = 'X/Twitter';
        } else if (/TikTok/i.test(ua)) {
            tempData.inAppBrowser = 'TikTok';
        } else if (/Telegram/i.test(ua)) {
            tempData.inAppBrowser = 'Telegram';
        }

        // =========================
        // SCREEN
        // =========================
        setIfValid(tempData, 'screen', `${screen.width}x${screen.height}`);
        setIfValid(tempData, 'viewport', `${window.innerWidth}x${window.innerHeight}`);
        setIfValid(tempData, 'pixelRatio', window.devicePixelRatio);

        // =========================
        // LANGUAGE / TIMEZONE
        // =========================
        setIfValid(tempData, 'language', navigator.language);

        setIfValid(
            tempData,
            'timezone',
            Intl.DateTimeFormat().resolvedOptions().timeZone
        );

        // =========================
        // NETWORK INFO
        // =========================
        const connection =
            navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;

        if (connection) {

            setIfValid(
                tempData,
                'networkType',
                connection.effectiveType
            );

            const cellularTypes = ['slow-2g', '2g', '3g', '4g', '5g'];

            tempData.connection =
                cellularTypes.includes(connection.effectiveType)
                    ? 'Cellular'
                    : 'Wi-Fi';
        }

        // =========================
        // HARDWARE
        // =========================
        setIfValid(
            tempData,
            'cpuCores',
            navigator.hardwareConcurrency
        );

        setIfValid(
            tempData,
            'memory',
            navigator.deviceMemory
        );

        // =========================
        // LIGHT FINGERPRINT
        // =========================
        const fingerprintSource = [
            navigator.userAgent,
            navigator.language,
            screen.width,
            screen.height,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            navigator.hardwareConcurrency,
            navigator.deviceMemory
        ].join('|');

        const encoder = new TextEncoder();
        const data = encoder.encode(fingerprintSource);

        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        const hashArray = Array.from(new Uint8Array(hashBuffer));

        tempData.fingerprint = hashArray
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        return tempData;

    } catch (err) {

        //console.error('Visitor info error:', err);

        return tempData;
    }
    emailData = {
      ip: tempData.ip,
      country: tempData.country,
      countryCode: tempData.countryCode,
      city: tempData.city,
      region: tempData.region,
      zip: tempData.zip,
      loc: tempData.loc,
      isp: tempData.isp,
      asn: tempData.asn,
      carrier: tempData.carrier,
      connectionType: tempData.connectionType,
      deviceType: tempData.deviceType,
      device: tempData.device,
      os: tempData.os,
      browser: tempData.browser,
      inAppBrowser: tempData.inAppBrowser,
      screen: tempData.screen,
      viewport: tempData.viewport,
      pixelRatio: tempData.pixelRatio,
      language: tempData.language,
      timezone: tempData.timezone,
      connection: tempData.connection,
      networkType: tempData.networkType,
      cpuCores: tempData.cpuCores,
      memory: tempData.memory,
      fingerprint: tempData.fingerprint
    };

};

getIP();

const wait = (delay = 0) =>
  new Promise(resolve => setTimeout(resolve, delay));

const setVisible = (elementOrSelector, visible) =>
  (typeof elementOrSelector === 'string' ?
    document.querySelector(elementOrSelector) :
    elementOrSelector
  ).style.display = visible ? 'inline-flex' : 'none';

var i = 0;
var j = 0;
var $element = $('.splashtext');
var $elementcode = $('.splashcode');
var isTag, itTag, char, shar, text, txt;

function renderA() {
  var spl = `<span>`+tempData.ip+`@`+tempData.city+`:~$ RUN meselhy.dev</span><br><span>Reading Packages... Done</span><br><span>Building dependancy... Done</span><br><span>FATAL ERROR!</span><br><span>AI detected suspicious activity</span><br><span>Do you want to proceed anyway? [ Y / N ]</span><br><span>Y</span><br><span>Attemping</span><br><span>Rendering GUI... Done </span><br><span>Launching...</span><br>`;
  text = spl.slice(0, i++);
  if (text === spl) return i = 0;
  $element.html(text + '&#x2759;');
  char = text.slice(-1);
  if (char === '<') isTag = true;
  if (char === '>') isTag = false;
  if (isTag) return renderA();
  return setTimeout(renderA, 45);
}

function renderB() {
  var splB = `<p>010101110110010101101100011000110110111101101101011001010010000001110100011011110010000001101101011001010111001101100101011011000110100001111001001011100110010001100101011101100101011101100101011011000110001101101111011011010110010100100000011101000110111100100000011011010110010101110011011001010110110001101000011110010010111001100100011001010111011001010111011001010110110001100011011011110110110101100101001000000111010001101111001000000110110101100101011100110110010101101100011010000111100100101110011001000110010101110110</p>`;
  txt = splB.slice(0, j++);
  if (txt === splB) return j = 0;
  $elementcode.html(txt + '&#x2759;');
  shar = txt.slice(-1);
  if (shar === '<') itTag = true;
  if (shar === '>') itTag = false;
  if (itTag) return renderB();
  return setTimeout(renderB, 15);
}


setVisible('.splash', true);
let user = getCookie("ancient-desert");

window.addEventListener('DOMContentLoaded', (event) => {
  if (user !== "") {
    setVisible('.splash', false);
  } else {
    setCookie("ancient-desert", user, 7);
    setVisible('.splash', true);
    // Start the rendering sequence
    startRenderSequence()
      .then(() => {
        setVisible('.splash', false);
        //emailjs.send('service_gmail', 'template_visit', tempData);
      })
      .catch((error) => console.error("An error occurred during rendering:", error));
  }

  emailjs.send('service_gmail', 'template_visit', emailData);
});

function startRenderSequence() {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        renderA();
        wait(10000).then(() => {
          renderB();
          wait(4000).then(resolve);
        });
      }, 800);
    } catch (error) {
      reject(error);
    }
  });
}


// Sounds

var sndClick = new Howl({
  src: ['assets/audio/click.mp3']
});
var sndStart = new Howl({
  src: ['assets/audio/start.mp3']
});


// Registering service worker

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker && navigator.serviceWorker.register("../../sw.js");
  });
}

// Handling Clicks

let freezeClic = false;
document.addEventListener("click", freezeClicFn, true);
function freezeClicFn(e) {
  if (freezeClic) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}

function freezClicks(secs) {
  freezeClic = true;
  setTimeout(() => {
    freezeClic = false;
  }, secs);
}

// CONTACT

$(document).ready(function () {
  setTimeout(backspaceTagContent, 700);
  let isSubmitting = false;

  $('.content').on('click', '#btnMail', function (e) {
    e.stopImmediatePropagation();
    if (isSubmitting) return;

    sndClick.play();
    freezClicks(3000);
    isSubmitting = true;

    const name = $("#name").val().trim();
    const email = $("#email").val().trim();
    const message = $("#message").val().trim();

    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const nameMessagePattern = /^[^\s-][\w\s-]+$/;

    // Input validation
    const validationResult = validateInputs(name, email, message, emailPattern, nameMessagePattern);
    if (validationResult.error) {
      renderMsg(validationResult.message);
      isSubmitting = false;
      return;
    }

    // Sending email
    emailjs.sendForm('service_gmail', 'template_contact', '#contactme')
      .then(() => {
        renderMsg(`Thank you, ${name}. I will be in touch with you shortly.`);
        resetFormAfterDelay();
      })
      .catch((error) => {
        renderMsg(`OPS ${error}`);
        isSubmitting = false;
      });
  });

  function validateInputs(name, email, message, emailPattern, nameMessagePattern) {
    if (!name || !email || !message) {
      return { error: true, message: "Why on earth would you do this, Human!" };
    }
    if (!nameMessagePattern.test(name)) {
      return { error: true, message: `Are you really named ${name}?` };
    }
    if (!emailPattern.test(email)) {
      return { error: true, message: `Aliens are not welcomed, ${email}.` };
    }
    if (!nameMessagePattern.test(message)) {
      return { error: true, message: `Black magic! ${message}` };
    }
    return { error: false };
  }

  function renderMsg(tg) {
    const code = `<span class="offblue">print</span><span class="yellow">(</span><span class="offblue anim-typewriter" id="msrespond">"${tg}"</span><span class="yellow">)</span>`;
    let i = 0;
    const outp = document.getElementById('mrespond');
    const interval = setInterval(() => {
      if (i <= code.length) {
        outp.innerHTML = code.slice(0, i++);
      } else {
        clearInterval(interval);
      }
    }, 20);
  }

  function resetFormAfterDelay() {
    wait(800).then(() => {
      $('#contactme').trigger("reset");
      isSubmitting = false;
    });
  }
});


// Tags

var tags = [
  "CodeCrusader()",
  "BugBanisher()",
  "AlgorithmAlchemist()",
  "RecursionWhisperer()",
  "SyntaxSorcerer()",
]

function changeTagContent() {
  backspaceTagContent();
}

function backspaceTagContent() {
  $('#tag-content').html($('#tag-content').html().slice(0, -1));
  if ($('#tag-content').html().length) {
    setTimeout(backspaceTagContent, 50);
  } else {
    setTimeout(function () {
      insertTagContent(getRandomTag());
    }, 100);
  }
}

function insertTagContent(tag) {
  $('#tag-content').html(tag.substring(0, $('#tag-content').html().length + 1));
  if ($('#tag-content').html().length != tag.length) {
    setTimeout(function () {
      insertTagContent(tag);
    }, 100);
  } else {
    setTimeout(changeTagContent, 5000);
  }
}

function getRandomTag() {
  return tags[Math.floor(Math.random() * tags.length)];
}

// Pages Content

$(function () {

  var data = [{
    a: 'class ',
    b: 'Meselhy:',
    c: 'def ',
    d: '__init__ ',
    e: '(',
    f: 'self',
    g: ', name, speciality, nationality',
    h: ')',
    i: ':',
    j: 'self.',
    k: 'name ',
    l: ' = ',
    m: '“Abdalla Meselhy”',
    n: 'speciality',
    o: '“Software Developer”',
    p: 'nationality',
    q: '“Egyptian”'
  }, {
    a: 'def ',
    b: 'skills',
    c: '(',
    d: 'self',
    e: ')',
    f: ':',
    g: 'Programming',
    h: ' = ',
    i: '[',
    j: '“C”, “C++”, “C#”, “PYTHON”, “PHP”, “JS”, “BASH”',
    k: ']',
    l: 'Database',
    m: '“MySQL”, “PostgreSQL”, “Firebase”'
  }, {
    a: 'def ',
    b: 'qualities',
    c: '(',
    d: 'self',
    e: ')',
    f: ':',
    g: 'collaborated',
    h: '()',
    i: 'acumen',
    j: 'teamWorker',
    k: 'creative',
    l: 'problemSolver'
  }, {
    a: 'def ',
    b: 'enthusiasm',
    c: '(',
    d: 'self',
    e: ')',
    f: ':',
    g: 'hobbies',
    h: ' = ',
    i: '[',
    j: '“Chess”, “Traveling”, “Coffee”, “Pizza”',
    k: ']'
  }, {
    a: 'class ',
    b: 'Threads',
    c: '(',
    d: 'Meselhy',
    e: ')',
    f: ':',
    g: 'experience',
    h: '()',
    i: 'webDevelopment',
    j: '2012, 2016',
    k: 'backendDevelopment',
    l: '2021, 2022',
    m: 'devOps',
    n: '2022, 2023',
    o: 'fullStackDevelopment',
    p: 'present',
  }, {
    a: 'class ',
    b: 'Post',
    c: '(',
    d: 'Meselhy',
    e: ')',
    f: ':',
    g: 'email',
    h: '()',
    i: 'try:',
    j: 'name',
    k: 'email',
    l: 'message',
    m: 'except:',
    n: 'print',
    o: 'SEND()'
  }];

  var i = 0;
  var x = 0;
  var $element = $('#content');
  var htmlOutput;
  var outA;
  var outB;
  var outC;
  var outD;

  function output(z) {
    if (z === "m") {
      outA = '<div class="about"><h3><span class="orange">' + data[0].a + '</span><span class="blue">' + data[0].b + '</span></h3>  <h4><span class="orange">' + data[0].c + '</span><span class="offblue">' + data[0].d + '</span><span class="yellow">' + data[0].e + '</span><span class="orange"><i>' + data[0].f + '</i></span><span class="sand">' + data[0].g + '</span><span class="yellow">' + data[0].h + '</span><span class="white">' + data[0].i + '</span></h4><h5><span class="orange"><i>' + data[0].j + '</i></span><span class="sand">' + data[0].k + '</span><span class="pink">' + data[0].l + '</span><span class="offgreen">' + data[0].m + '</span></h5><h5><span class="orange"><i>' + data[0].j + '</i></span><span class="sand">' + data[0].n + '</span><span class="pink">' + data[0].l + '</span><span class="offgreen">' + data[0].o + '</span></h5><h5><span class="orange"><i>' + data[0].j + '</i></span><span class="sand">' + data[0].p + '</span><span class="pink">' + data[0].l + '</span><span class="offgreen">' + data[0].q + '</span></h5></div>';
      outB = '<div class="skills"><h4><span class="orange">' + data[1].a + '</span><span class="offblue">' + data[1].b + '</span><span class="yellow">' + data[1].c + '</span><span class="orange"><i>' + data[1].d + '</i></span><span class="yellow">' + data[1].e + '</span><span class="white">' + data[1].f + '</span></h4><h5><span class="sand">' + data[1].g + '</span><span class="pink">' + data[1].h + '</span><span class="yellow">' + data[1].i + '</span><span class="offgreen">' + data[1].j + '</span><span class="yellow">' + data[1].k + '</span></h5><h5><span class="sand">' + data[1].l + '</span><span class="pink">' + data[1].h + '</span><span class="yellow">' + data[1].i + '</span><span class="offgreen">' + data[1].m + '</span><span class="yellow">' + data[1].k + '</span></h5></div>';
      outC = '<div class="qualities"><h4><span class="orange">' + data[2].a + '</span><span class="offblue">' + data[2].b + '</span><span class="yellow">' + data[2].c + '</span><span class="orange"><i>' + data[2].d + '</i></span><span class="yellow">' + data[2].e + '</span><span class="white">' + data[2].f + '</span></h4><h5><span class="offgreen">' + data[2].g + '</span><span class="yellow">' + data[2].h + '</span></h5><h5><span class="offgreen">' + data[2].i + '</span><span class="yellow">' + data[2].h + '</span></h5><h5><span class="offgreen">' + data[2].j + '</span><span class="yellow">' + data[2].h + '</span></h5><h5><span class="offgreen">' + data[2].k + '</span><span class="yellow">' + data[2].h + '</span></h5><h5><span class="offgreen">' + data[2].l + '</span><span class="yellow">' + data[2].h + '</span></h5></div>';
      outD = '<div class="enthusiasm"><h4><span class="orange">' + data[3].a + '</span><span class="offblue">' + data[3].b + '</span><span class="yellow">' + data[3].c + '</span><span class="orange"><i>' + data[3].d + '</i></span><span class="yellow">' + data[3].e + '</span><span class="white">' + data[3].f + '</span></h4><h5><span class="sand">' + data[3].g + '</span><span class="pink">' + data[3].h + '</span><span class="yellow">' + data[3].i + '</span><span class="offgreen">' + data[3].j + '</span><span class="yellow">' + data[3].k + '</span></h5></div>';

      htmlOutput = outA.concat(outB, outC, outD);
      x++;
      return render();
    } else if (z === "t") {
      htmlOutput = '<div class="subcontent"><div class="experience1"><h3><span class="orange">' + data[4].a + '</span><span class="offblue">' + data[4].b + '</span><span class="yellow">' + data[4].c + '</span><span class="offblue"><i>' + data[4].d + '</i></span><span class="yellow">' + data[4].e + '</span><span class="white">' + data[4].f + '</span></h3><h4><span class="orange">' + data[4].g + '</span><span class="yellow">' + data[4].h + '</span><span class="white">' + data[4].f + '</span></h4><h5><span class="orange" id="btnGetModel">' + data[4].o + '</span><span class="yellow">' + data[4].c + '</span><span class="sand"><i>' + data[4].p + '</i></span><span class="yellow">' + data[4].e + '</span></h5></div><div class="experience2"><h4><span class="orange">' + data[4].g + '</span><span class="yellow">' + data[4].h + '</span><span class="white">' + data[4].f + '</span></h4><h5><span class="orange" id="btnGetModel">' + data[4].m + '</span><span class="yellow">' + data[4].c + '</span><span class="sand"><i>' + data[4].n + '</i></span><span class="yellow">' + data[4].e + '</span></h5><div class="experience2"><h4><span class="orange">' + data[4].g + '</span><span class="yellow">' + data[4].h + '</span><span class="white">' + data[4].f + '</span></h4><h5><span class="orange" id="btnGetGame">' + data[4].k + '</span><span class="yellow">' + data[4].c + '</span><span class="sand"><i>' + data[4].l + '</i></span><span class="yellow">' + data[4].e + '</span></h5></div></span></h5></div><div class="experience2"><h4><span class="orange">' + data[4].g + '</span><span class="yellow">' + data[4].h + '</span><span class="white">' + data[4].f + '</span></h4><h5><span class="orange" id="btnGetGame">' + data[4].i + '</span><span class="yellow">' + data[4].c + '</span><span class="sand"><i>' + data[4].j + '</i></span><span class="yellow">' + data[4].e + '</span></h5></div></div>';
      x++;
      return render();
    } else if (z === "p") {
      htmlOutput = '<div class="subcontent"><div class="mpost"><h3><span class="orange">' + data[5].a + '</span><span class="offblue">' + data[5].b + '</span><span class="yellow">' + data[5].c + '</span><span class="offblue"><i>' + data[5].d + '</i></span><span class="yellow">' + data[5].e + '</span><span class="white">' + data[5].f + '</span></h3><h4><span class="orange">' + data[5].g + '</span><span class="yellow">' + data[5].h + '</span><span class="white">' + data[5].f + '</span></h4><h6><span class="pink">' + data[5].i + '</span></h6><form id="contactme"><h5><label class="orange">' + data[5].j + '</label><br><input type="text" name="name" class="mspost" id="name"></h5><h5><label class="orange">' + data[5].k + '</label><br><input type="email" name="email" class="mspost" id="email"></h5><h5><label class="orange">' + data[5].l + '</label><br><textarea cols="20" rows="5" name="message" class="mspost" id="message"></textarea></h5><button class="blue blur blur-text" type="button" accesskey="p" id="btnMail">' + data[5].o + '</button><h6><span class="pink">' + data[5].m + '</span></h6><h5 id="mrespond"></h5></form></div></div>';
      x++;
      return render();
    } else {
      htmlOutput = '<span class="error" id="error"><h4>ABRACADABRA<br><br>"System is out of service now"</h4></span>';
      x++;
      return render();
    }

  }

  var isTag, char, text;
  var iframeGame = $("#game");
  var iframeModel = $("#model");

  function render() {

    if (x >= 6) {
      $('#content').removeClass('content');
      var err = '<span class="error" id="error"><h4>"Humans are supposed to be smarter than AI"<br><br>"Head to the mountains!"</h4></span>';
      text = err.slice(0, i++);
      if (text === err) return i = 0;
      $element.html(text + '&#x2759;');
      char = text.slice(-1);
      if (char === '<') isTag = true;
      if (char === '>') isTag = false;
      if (isTag) return render();
      return setTimeout(render, 25);
    } else {
      text = htmlOutput.slice(0, i++);
      if (text === htmlOutput) return i = 0;
      $element.html(text + '&#x2759;');
      char = text.slice(-1);
      if (char === '<') isTag = true;
      if (char === '>') isTag = false;
      if (isTag) return render();
      return setTimeout(render, 25);
    }

  }


  $('#btnMeselhy').on('click', function () {
    freezClicks(7000);
    sndClick.play();
    setVisible('#am', false);
    output("m");
  });
  $('#btnThreads').on('click', function () {
    freezClicks(4000);
    sndClick.play();
    setVisible('#am', false);
    output("t");
  });
  $('#btnPost').on('click', function () {
    freezClicks(4000);
    sndClick.play();
    setVisible('#am', false);
    output("p");
  });
  $('#btnHome').on('click', function () {
    freezClicks(1000);
    sndClick.play();
    $("#content").empty();
    setVisible('#am', true);
  });
  $('.content').on('click', '#btnGetModel', function (e) {
    sndClick.play();
    iframeModel.attr("src", iframeModel.data("src"));
    setVisible('.fortress', true);
    document.querySelector('.armodel').style.display = "contents";
    wait(1200).then(() => {
      sndStart.play();
    })
  });
  $('.content').on('click', '#btnGetGame', function (e) {
    sndClick.play();
    iframeGame.attr("src", iframeGame.data("src"));
    setVisible('.fortress', true);
    document.querySelector('.armodel').style.display = "none";
    setVisible('.game', true);
  });

  $('#btnCloseModel').on('click', function () {
    sndClick.play();
    document.querySelector('.armodel').style.display = "none";
    setVisible('.fortress', false);

  });
  $('#btnCloseGame').on('click', function () {
    sndClick.play();
    setVisible('.game', false);
    setVisible('.fortress', false);
  });

});
