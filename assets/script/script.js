'use strict';

// ==================== COOKIES ====================
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

function getCookie(cname) {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let c of ca) {
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(name) === 0) return c.substring(name.length);
  }
  return '';
}

// ==================== SPLASH & VISITOR DATA ====================
const apiURL = 'https://api.ipstack.com/check?access_key=d887910b540221bf48501c957ee4b292';
let tempData = {};
let emailData;

const setIfValid = (obj, key, value) => {
  if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
    obj[key] = value;
  }
};

const getIP = async () => {
  try {
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error('IP fetch failed');
    const IPData = await response.json();

    setIfValid(tempData, 'ip', IPData.ip);
    setIfValid(tempData, 'city', IPData.city);
    setIfValid(tempData, 'region', IPData.region_name);
    setIfValid(tempData, 'country', IPData.country_name);
    setIfValid(tempData, 'isp', IPData.connection?.isp);
    setIfValid(tempData, 'connectionType', IPData.connection?.type);
    setIfValid(tempData, 'asn', IPData.connection?.asn);
    setIfValid(tempData, 'carrier', IPData.connection?.carrier);

    if (IPData.latitude && IPData.longitude) {
      tempData.loc = `${IPData.latitude},${IPData.longitude}`;
    }

    // Your full device/OS/browser/network detection kept intact
    const ua = navigator.userAgent;
    let deviceType = /smart-tv|smarttv|googletv|appletv/i.test(ua) ? 'Smart TV' : /tablet|ipad/i.test(ua) ? 'Tablet' : /mobile|iphone|android/i.test(ua) ? 'Mobile' : 'Desktop';
    setIfValid(tempData, 'deviceType', deviceType);

    // DEVICE NAME
    if (/iphone/i.test(ua)) {
        tempData.device = 'iPhone';
    } else if (/ipad/i.test(ua)) {
        tempData.device = 'iPad';
    } else if (/android/i.test(ua)) {
        tempData.device = 'Android';
    }

    // OS
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

    // BROWSER
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

    // IN-APP BROWSER
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

    // SCREEN
    setIfValid(tempData, 'screen', `${screen.width}x${screen.height}`);
    setIfValid(tempData, 'viewport', `${window.innerWidth}x${window.innerHeight}`);
    setIfValid(tempData, 'pixelRatio', window.devicePixelRatio);

    // LANGUAGE / TIMEZONE
    setIfValid(tempData, 'language', navigator.language);

    setIfValid(
        tempData,
        'timezone',
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    // NETWORK INFO
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

    // HARDWARE
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

    // LIGHT FINGERPRINT
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
    console.warn('Visitor fingerprint skipped:', err.message);
    return tempData;
  }
};
getIP();

const wait = (delay = 0) => new Promise(resolve => setTimeout(resolve, delay));

const setVisible = (elementOrSelector, visible) => {
  const el = typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector;
  if (el) el.style.display = visible ? 'inline-flex' : 'none';
};

// ==================== SPLASH ANIMATION ====================
let splashI = 0, splashJ = 0;
let $splashText = $('.splashtext');
let $splashCode = $('.splashcode');

function renderA() {
  const spl = `<span>${tempData.ip}@${tempData.city}:~$ RUN meselhy.dev</span><br><span>Reading Packages... Done</span><br><span>Building dependency... Done</span><br><span>FATAL ERROR!</span><br><span>AI detected suspicious activity</span><br><span>Do you want to proceed anyway? [ Y / N ]</span><br><span>Y</span><br><span>Attempting</span><br><span>Rendering GUI... Done</span><br><span>Launching...</span><br>`;
  const text = spl.slice(0, splashI++);
  if (text === spl) { splashI = 0; return; }
  $splashText.html(text + '&#x2759;');
  const char = text.slice(-1);
  if (char === '<' || char === '>') return renderA();
  setTimeout(renderA, 35);
}

function renderB() {
  const splB = `<p>010101110110010101101100011000110110111101101101011001010010000001110100011011110010000001101101011001010111001101100101011011000110100001111001001011100110010001100101011101100101011101100101011011000110001101101111011011010110010100100000011101000110111100100000011011010110010101110011011001010110110001101000011110010010111001100100011001010111011001010111011001010110110001100011011011110110110101100101001000000111010001101111001000000110110101100101011100110110010101101100011010000111100100101110011001000110010101110110</p>`;
  const txt = splB.slice(0, splashJ++);
  if (txt === splB) { splashJ = 0; return; }
  $splashCode.html(txt + '&#x2759;');
  const shar = txt.slice(-1);
  if (shar === '<' || shar === '>') return renderB();
  setTimeout(renderB, 15);
}

function startRenderSequence() {
  return new Promise(resolve => {
    setTimeout(() => {
      renderA();
      wait(10000).then(() => {
        renderB();
        wait(4000).then(resolve);
      });
    }, 800);
  });
}

// ==================== SOUNDS ====================
const sndClick = new Howl({ src: ['assets/audio/click.mp3'] });
const sndStart = new Howl({ src: ['assets/audio/start.mp3'] });

// ==================== SERVICE WORKER ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

// ==================== CLICK FREEZE ====================
let freezeClick = false;
document.addEventListener("click", freezeClickFn, true);
function freezeClickFn(e) {
  if (freezeClick) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}

function freezClicks(secs) {
  freezeClick = true;
  setTimeout(() => {
    freezeClick = false;
  }, secs);
}


// ==================== TAG ROTATOR ====================
const tags = [
  "SystemArchitect()",
  "PipelineSorcerer()",
  "ZeroDowntimeNinja()",
  "RealityDebugger()",
  "CodeAlchemist()"
];

function getRandomTag() {
  return tags[Math.floor(Math.random() * tags.length)];
}

function backspaceTagContent() {
  const el = $('#tag-content');
  el.html(el.html().slice(0, -1));
  if (el.html().length) setTimeout(backspaceTagContent, 50);
  else setTimeout(() => insertTagContent(getRandomTag()), 100);
}

function insertTagContent(tag) {
  const el = $('#tag-content');
  el.html(tag.substring(0, el.html().length + 1));
  if (el.html().length !== tag.length) setTimeout(() => insertTagContent(tag), 100);
  else setTimeout(backspaceTagContent, 5000);
}

// ==================== PAGES CONTENT (Clean & Structured) ====================
$(function () {
  let renderCounter = 0;
  const $content = $('#content');
  let htmlOutput = '';
  let renderI = 0;
  let isTag = false;
  let char = '';
  let text = '';

  const iframeGame = $('#game');
  const iframeModel = $('#model');

  function output(z) {
    try {
      if (z === "m") {
        htmlOutput = `<div class="about">
        <h3><span class="orange">class </span><span class="blue">Meselhy:</span></h3>
        <h5><span class="offgreen"># Code Alchemist.<br>Shipping robust systems since 2012</span></h5>
        
        <h4><span class="orange">def </span><span class="offblue">__init__</span><span class="yellow">(</span><span class="orange"><i>self</i></span><span class="sand">, name: str, speciality: str, nationality: str</span><span class="yellow">)</span><span class="white"> -&gt; None:</span></h4>
        <h5><span class="orange"><i>self.</i></span><span class="sand">name</span><span class="pink"> = </span><span class="offgreen">"Abdalla Meselhy"</span></h5>
        <h5><span class="orange"><i>self.</i></span><span class="sand">speciality</span><span class="pink"> = </span><span class="offgreen">"Full-Stack Code Alchemist"</span></h5>
        <h5><span class="orange"><i>self.</i></span><span class="sand">nationality</span><span class="pink"> = </span><span class="offgreen">"Egyptian"</span></h5>
        <h5><span class="orange"><i>self.</i></span><span class="sand">base</span><span class="pink"> = </span><span class="offgreen">"Dammam, Saudi Arabia"</span></h5>

        <h4><span class="orange">def </span><span class="offblue">skills</span><span class="yellow">(</span><span class="orange"><i>self</i></span><span class="yellow">)</span><span class="white"> -&gt; dict:</span></h4>
        <h5><span class="offgreen">"""Tools that ship real systems"""</span></h5>
        <h5><span class="sand">languages</span><span class="pink"> = </span><span class="offgreen">["C", "C++", "C#", "Python", "PHP", "TypeScript", "Bash"]</span></h5>
        <h5><span class="sand">databases</span><span class="pink"> = </span><span class="offgreen">["MySQL", "PostgreSQL", "Firebase", "Redis"]</span></h5>

        <h4><span class="orange">def </span><span class="offblue">qualities</span><span class="yellow">(</span><span class="orange"><i>self</i></span><span class="yellow">)</span><span class="white">:</span></h4>
        <h5><span class="offgreen">collaborated()</span></h5>
        <h5><span class="offgreen">architectural_acumen()</span></h5>
        <h5><span class="offgreen">creative_problem_solver()</span></h5>
        <h5><span class="offgreen">resilient_under_pressure()</span></h5>

        <h4><span class="orange">def </span><span class="offblue">enthusiasm</span><span class="yellow">(</span><span class="orange"><i>self</i></span><span class="yellow">)</span><span class="white">:</span></h4>
        <h5><span class="sand">hobbies</span><span class="pink"> = </span><span class="offgreen">["Chess", "Traveling", "Coffee", "Pizza"]</span></h5>
        </div>`;
      } else if (z === "t") {
        htmlOutput = `<div class="subcontent">
        <div class="experience1">
          <h3><span class="orange">class </span><span class="blue">Threads(Meselhy):</span></h3>
          <h5><span class="offgreen"># Career threads — reverse chrono, real systems shipped.</span></h5>
          
          <h4><span class="orange">def </span><span class="offblue">experience</span><span class="yellow">(</span><span class="orange"><i>self</i></span><span class="yellow">)</span><span class="white">:</span></h4>
          
          <h5><span class="orange" id="btnGetGame">full_stack_development()</span><span class="pink"> — present (freelancing)</span></h5>
          <h5><span class="offgreen"># End-to-end magic. Still shipping daily.</span></h5>
        </div>
        
        <div class="experience2">
          <h4><span class="orange">def </span><span class="offblue">devops</span><span class="yellow">(</span><span class="orange"><i>self</i></span><span class="yellow">)</span><span class="white">:</span></h4>
          <h5><span class="sand" id="btnGetModel">2022 → 2023<span class="pink"> @ Shapira Technologies</span></span></h5>
          <h5><span class="offgreen"># Infrastructure alchemy. Containers, pipelines, zero drama.</span></h5>
        </div>
        
        <div class="experience2">
          <h4><span class="orange">def </span><span class="offblue">backend_development</span><span class="yellow">(</span><span class="orange"><i>self</i></span><span class="yellow">)</span><span class="white">:</span></h4>
          <h5><span class="sand" id="btnGetGame">2021 → 2022</span></h5>
          <h5><span class="offgreen"># Servers, APIs, and systems that actually scale.</span></h5>
        </div>
        
        <div class="experience2">
          <h4><span class="orange">def </span><span class="offblue">web_development</span><span class="yellow">(</span><span class="orange"><i>self</i></span><span class="yellow">)</span><span class="white">:</span></h4>
          <h5><span class="sand" id="btnGetModel">2012 → 2016</span></h5>
          <h5><span class="offgreen"># First lines of code. Pure passion, no frameworks.</span></h5>
        </div>
      </div>`;
      } else if (z === "p") {
        htmlOutput = `<div class="subcontent">
        <div class="mpost">
          <h3><span class="orange">class </span><span class="blue">Post(Meselhy):</span></h3>
          <h5><span class="offgreen"># Drop a message — I reply faster than most APIs</span></h5>
          
          <h4><span class="orange">def </span><span class="offblue">email</span><span class="yellow">(</span><span class="orange"><i>self</i></span><span class="yellow">)</span><span class="white">:</span></h4>
          
          <h5><span class="pink">try:</span></h5>
          
          <form id="contactme">
            <h5><label class="orange">name</label><br>
            <input type="text" name="name" class="mspost" id="name"></h5>
            
            <h5><label class="orange">email</label><br>
            <input type="email" name="email" class="mspost" id="email"></h5>
            
            <h5><label class="orange">message</label><br>
            <textarea cols="20" rows="3" name="message" class="mspost" id="message"></textarea></h5>
            
            <button class="blue blur blur-text" type="button" accesskey="p" id="btnMail">SEND()</button>
          </form>
          <h5><span class="pink">except:</span></h5>          
          <h5 id="mrespond"></h5>
        </div>
      </div>`;
      }
      renderCounter++;
      render();
    } catch (err) {
      console.error("Output error:", err);
      $content.html('<span class="error">System glitch... try again.</span>');
    }
  }

  function render() {
    try {
      text = htmlOutput.slice(0, renderI++);
      if (text === htmlOutput) { renderI = 0; return; }
      $content.html(text + '&#x2759;');
      char = text.slice(-1);
      if (char === '<' || char === '>') return render();
      setTimeout(render, 25);
    } catch (err) {
      console.error("Render error:", err);
    }
  }

  // === Duplicate Listener Protection (.off() added) ===
  $('#btnMeselhy').off('click').on('click', () => { freezClicks(7000); sndClick.play(); setVisible('#am', false); output("m"); });
  $('#btnThreads').off('click').on('click', () => { freezClicks(4000); sndClick.play(); setVisible('#am', false); output("t"); });
  $('#btnPost').off('click').on('click', () => { freezClicks(4000); sndClick.play(); setVisible('#am', false); output("p"); });
  $('#btnHome').off('click').on('click', () => { freezClicks(1000); sndClick.play(); $content.empty(); setVisible('#am', true); });

  $('.content').off('click', '#btnGetModel').on('click', '#btnGetModel', () => {sndClick.play(); iframeModel.attr("src", iframeModel.data("src")); setVisible('.fortress', true); 
    document.querySelector('.armodel').style.display = "contents";
    wait(1200).then(() => {
      sndStart.play();
    })
  });
  $('.content').off('click', '#btnGetGame').on('click', '#btnGetGame', () => {sndClick.play(); iframeGame.attr("src", iframeGame.data("src")); setVisible('.fortress', true); document.querySelector('.armodel').style.display = "none"; setVisible('.game', true);});
  $('#btnCloseModel').off('click').on('click', () => {sndClick.play(); document.querySelector('.armodel').style.display = "none"; setVisible('.fortress', false);});
  $('#btnCloseGame').off('click').on('click', () => {sndClick.play(); setVisible('.game', false); setVisible('.fortress', false);});

});

// ==================== CONTACT FORM ====================
$(document).ready(function () {
  setTimeout(backspaceTagContent, 700);
  let isSubmitting = false;

  $('.content').off('click', '#btnMail').on('click', '#btnMail', function (e) {
    e.stopImmediatePropagation();
    if (isSubmitting) return;

    sndClick.play();
    freezClicks(3000);
    isSubmitting = true;

    try {
    // Gather input values and define validation patterns
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
        renderMsg(`Thank you, ${name}. Signal received. Compiling response... I'll be in touch before the next deploy.`);
        resetFormAfterDelay();
      })
      .catch((error) => {
        renderMsg(`OPS ${error}`);
        isSubmitting = false;
      });

    } catch (err) {
      console.error("Contact error:", err);
      isSubmitting = false;
    }
  });
});

function validateInputs(name, email, message, emailPattern, nameMessagePattern) {
    if (!name || !email || !message) {
      return { error: true, message: "Null input detected. All fields required, Human!" };
    }
    if (!nameMessagePattern.test(name)) {
      return { error: true, message: `Name validation failed. "${name}" is not a valid identifier!` };
    }
    if (!emailPattern.test(email)) {
      return { error: true, message: `Invalid email protocol. "${email}" rejected by the matrix` };
    }
    if (!nameMessagePattern.test(message)) {
      return { error: true, message: `Forbidden characters. No black magic in production!` };
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
    }, 15);
  }

  function resetFormAfterDelay() {
    wait(800).then(() => {
      $('#contactme').trigger("reset");
      isSubmitting = false;
    });
  }

// ==================== FINAL LOAD & EMAIL SEND (Point 1) ====================
window.addEventListener('load', () => {
  const user = getCookie("meselhy-legacy");

  if (user === "") {
    setCookie("ancient-desert", "visited", 7);
    startRenderSequence().then(() => {
      setVisible('.splash', false);
      // Send visit email ONLY after splash finishes
      wait(4000).then(() => {
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
      emailjs.send('service_gmail', 'template_visit', emailData).catch(err => console.warn("Visit email skipped", err));
      });
    });
  } else {
    setVisible('.splash', false);
  }
});

