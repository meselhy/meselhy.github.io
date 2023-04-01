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
  var spl = `<span>guest@meselhy.dev:~$ RUN meselhy.dev/aprilfool's</span><br><span>Collecting April Fool's... Done</span><br><span>Building GIF... Done</span><br><span>FATAL ERROR!</span><br><span>AI detected suspicious activity</span><br><span>Do you want to proceed anyway? [ Y / N ]</span><br><span>Y</span><br><span>Attemping</span><br><span>Rendering GIF... Done </span><br><span>ABRACADABRA ...</span><br>`;
  text = spl.slice(0, i++);
  if (text === spl) return i = 0;
  $element.html(text + '&#x2759;');
  char = text.slice(-1);
  if (char === '<') isTag = true;
  if (char === '>') isTag = false;
  if (isTag) return renderA();
  return setTimeout(renderA, 35);
}

function renderB() {
  var splB = ``;
  txt = splB.slice(0, j++);
  if (txt === splB) return j = 0;
  $elementcode.html(txt + '&#x2759;');
  shar = txt.slice(-1);
  if (shar === '<') itTag = true;
  if (shar === '>') itTag = false;
  if (itTag) return renderB();
  return setTimeout(renderB, 5);
}


setVisible('.splash', true);
setVisible('.april', false);
let user = getCookie("april-desert");

window.addEventListener('DOMContentLoaded', (event) => {
  if (user !== "") {
    setVisible('.splash', true);
  } else {
    setCookie("april-desert", user, 7);
    setVisible('.splash', true);
    renderA();
    wait(9500).then(() => {
      renderB();
      wait(4500).then(() => {
        setVisible('.april', true);
      })
    })
  }
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
