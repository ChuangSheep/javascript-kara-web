// eslint-disable-next-line no-unused-vars
const { GameObject, Kara, Leaf, Mashroom, Tree, GameLogicError } = require("@/gameLogic.js");

export function getDataAsXML(obsolete = false) {
  var xmlDoc = document.implementation.createDocument("", "");

  var root = xmlDoc.createElement("XmlWorld");
  root.setAttribute("sizex", window.$app.$root.$data.boardWidth);
  root.setAttribute("sizey", window.$app.$root.$data.boardHeight);
  root.setAttribute("version", obsolete ? "KaraX 1.0 pythonkara" : window.GAMEVERSION);

  // Trees
  var wallPts = xmlDoc.createElement("XmlWallPoints");
  // Mashrooms
  var obstaclePts = xmlDoc.createElement("XmlObstaclePoints");
  // Leafs
  var paintedPts = xmlDoc.createElement("XmlPaintedfieldPoints");
  // Unused
  var xmlStreetList = xmlDoc.createElement("XmlStreetList");
  // Kara
  var karaPts = xmlDoc.createElement("XmlKaraList");

  let kara;
  for (let obj of window.$app.$root.$data.createdObjects) {
    let ptn = xmlDoc.createElement("XmlPoint");
    ptn.setAttribute("x", obj.x - 1);
    ptn.setAttribute("y", obj.y - 1);
    switch (obj.type) {
      case "Kara":
        kara = xmlDoc.createElement("XmlKara");
        kara.setAttribute("direction", obj.direction)
        kara.setAttribute("name", obj.type)
        kara.setAttribute("x", obj.x - 1);
        kara.setAttribute("y", obj.y - 1);
        karaPts.appendChild(kara);
        break;
      case "Leaf":
        ptn.setAttribute("type", "0")
        paintedPts.appendChild(ptn);
        break;
      case "Mashroom":
        obstaclePts.appendChild(ptn);
        break;
      case "Tree":
        wallPts.appendChild(ptn);
        break;
    }
  }

  root.appendChild(wallPts);
  root.appendChild(obstaclePts);
  root.appendChild(paintedPts);
  root.appendChild(karaPts);
  root.appendChild(xmlStreetList);

  xmlDoc.appendChild(root);
  return xmlDoc;
}

export function getDataAsXMLString(obsolete = false) {
  return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" + (new XMLSerializer().serializeToString(getDataAsXML(obsolete)));
}

export function setDataFromXML(xmlDoc) {
  var root = xmlDoc.querySelector("XmlWorld");
  var width = parseInt(root.getAttribute("sizex"));
  var height = parseInt(root.getAttribute("sizey"));
  var fileVersion = root.getAttribute("version");

  if (fileVersion !== window.GAMEVERSION) {
    console.warn("The saved or imported .world file does not fit the current version. \nFile Version: " + fileVersion + "\nCurrent Version: " + window.GAMEVERSION + "\nUsing outdated world file might cause game to crash. ")
  }

  window.$app.$root.$data.board.splice(0, window.$app.$root.$data.board.length);
  for (let i = 0; i < width; i++) {
    window.$app.$root.$data.board.push([]);
    for (let j = 0; j < height; j++) {
      window.$app.$root.$data.board[i].push([]);
    }
  }

  window.$app.$root.$data.boardWidth = width.valueOf();
  window.$app.$root.$data.boardHeight = height.valueOf();

  window.$app.$root.$emit("updateBoardInfo", {
    width: width,
    height: height,
  });

  var wallPts = xmlDoc.querySelector("XmlWallPoints");
  var obstaclePts = xmlDoc.querySelector("XmlObstaclePoints");
  var paintedPts = xmlDoc.querySelector("XmlPaintedfieldPoints");
  var karaList = xmlDoc.querySelector("XmlKaraList");


  for (let tree of wallPts.getElementsByTagName("XmlPoint")) {
    let x = parseInt(tree.getAttribute("x"));
    let y = parseInt(tree.getAttribute("y"));
    new Tree(x + 1, y + 1);
  }
  for (let mashroom of obstaclePts.getElementsByTagName("XmlPoint")) {
    let x = parseInt(mashroom.getAttribute("x"));
    let y = parseInt(mashroom.getAttribute("y"));
    new Mashroom(x + 1, y + 1);
  }
  for (let leaf of paintedPts.getElementsByTagName("XmlPoint")) {
    let x = parseInt(leaf.getAttribute("x"));
    let y = parseInt(leaf.getAttribute("y"));
    new Leaf(x + 1, y + 1)
  }
  for (let kara of karaList.getElementsByTagName("XmlKara")) {
    let x = parseInt(kara.getAttribute("x"));
    let y = parseInt(kara.getAttribute("y"));
    let direction = parseInt(kara.getAttribute("direction"));
    new Kara(x + 1, y + 1, { direction: direction });
  }

}

export function setDataFromXMLString(xmlString) {
  if (xmlString != '' && xmlString != null) {
    let xmlDoc;
    if (window.DOMParser) {
      var parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlString, "text/xml");
    }
    else // Internet Explorer
    {
      // eslint-disable-next-line no-undef
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = false;
      xmlDoc.loadXML(xmlString);
    }
    setDataFromXML(xmlDoc);
  }
}


export function errorHandling(scriptNode, funcName, lineno, colno, error, args = {}) {
  args.detailed === undefined ? args.detailed = false : 0;
  // Check if the false lineno is given
  let arr = null;
  const errLines = error.stack.split("\n");
  for (let l of errLines) {
    if (l.includes("at " + funcName)) {
      if (l.includes("eval at " + funcName)) continue;
      const regexErrLine = /:(\d+:\d+)[^\d]*$/;
      arr = regexErrLine.exec(l);
      break;
    }
  }

  //If there's syntax error, get the line and change it to the right lineno
  if (arr !== null && parseInt(arr[1].split(":")[0]) !== lineno) {
    lineno = parseInt(arr[1].split(":")[0]);
    colno = parseInt(arr[1].split(":")[1]);
  }

  window.$app.$root.$emit("userCodeError", { errorStack: error.stack, detail: { type: error.stack.split("\n")[0].split(':')[0], lineno: lineno - 1, colno} });

  scriptNode && console.log("Error at line: " + (lineno - 1) + "; column: " + colno);
  console.log(args.detailed ? error.stack : error.stack.split("\n")[0]);
  // Remove the evaluation node in html
  scriptNode && scriptNode.remove();

  // Change the state to not evaling to allow user to use buttons
  window.$app.$root.$data.isEvaling = false;

  // Stop every object
  for (let i of window.$app.$root.$data.timeoutPool) {
    window.clearTimeout(i);
  }
  window.$app.$root.$data.timeoutPool.splice(0, window.$app.$root.$data.timeoutPool.length);
  window.clearTimeout(window.$app.$root.$data.resetTimeout);
}

export function runUserCode() {
  window.$app.$root.$data.isEvaling = true;
  window.$app.$root.$data.currentBoard = copy(window.$app.$root.$data.board);

  let code = localStorage.getItem("userCode");

  // Check the syntax error
  let syntaxErr = false;
  let funcName =
    "js_kara_web_based_code_syntax_evaluation" +
    new Date().getTime().toString();
  var userScr = document.createElement("script");
  userScr.setAttribute("id", "usercodeEval");

  // Error Handler for syntax error
  window.onerror = function (message, source, lineno, colno, error) {
    syntaxErr = true;
    errorHandling(userScr, funcName, lineno, colno, error);
    // Reset window.onerror
    window.onerror = null;
    // prevent the default event handler being called
    return true;
  };

  userScr.appendChild(
    document.createTextNode(
      "var " + funcName + "= function () {\n" + code + "\n};"
    )
  );
  document.body.appendChild(userScr);

  const gameErrorHandler = function (e) {
    if (e.error.stack.includes("GameLogicError" || e.error.stack.includes("GameKernalError"))) {
      errorHandling(null, null, -1, -1, e.error);
      e.preventDefault();
    }
  }

  // Run the code if there is no syntax error
  if (!syntaxErr) {
    // Error Handler for runtime errors
    window.addEventListener("error", gameErrorHandler);
    try {
      eval(funcName + "();");
    } catch (error) {
      errorHandling(userScr, funcName, -1, -1, error);
    }

    if (getKaraInstance() !== null) {
      // Unlock the buttons if the eval is successful
      window.$app.$root.$data.resetTimeout = window.setTimeout(() => {
        window.$app.$root.$data.isEvaling = false;
        window.removeEventListener("error", gameErrorHandler);
        window.$app.$root.$data.timeoutPool.splice(0, window.$app.$root.$data.timeoutPool.length);
        window.$app.$root.$data.resetTimeout = null;
        window.$app.$root.$emit('saveWorld');
      }, getKaraInstance().processTimeoutCount * getKaraInstance().timeout + 600)
    }
  }
  // In case of successful evaluation, remove the evaluation node
  userScr.remove();
  window.onerror = null;
}

export function getKaraInstance() {
  for (let obj of window.$app.$root.$data.createdObjects) {
    if (obj.type === "Kara") {
      return obj;
    }
  }
  return null;
}

function copy(arr) {
  let rtr = [];

  for (let i = 0; i < arr.length; i++) {
    rtr.push([]);
    for (let j = 0; j < arr[i].length; j++) {
      rtr[i].push([]);
      for (let obj of arr[i][j]) {
        switch (obj.type) {
          case "Kara":
            rtr[i][j].push(Object.assign(new Kara(-1, -1, { init: false }), obj))
            break;
          case "Leaf":
            rtr[i][j].push(Object.assign(new Leaf(-1, -1, { init: false }), obj))
            break;
          case "Mashroom":
            rtr[i][j].push(Object.assign(new Mashroom(-1, -1, { init: false }), obj))
            break;
          case "Tree":
            rtr[i][j].push(Object.assign(new Tree(-1, -1, { init: false }), obj))
            break;
        }
      }
    }
  }

  return rtr;
}