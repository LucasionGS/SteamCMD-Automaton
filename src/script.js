const fs = require('fs');
const https = require('https');
const cProc = require('child_process');
const AdmZip = require('adm-zip');
const {Notif} = require("notif");
const {AutoComplete} = require("autocomplete");


// const { pour } = require('std-pour');
/**
 * @type {AutoComplete}
 */
var ac;

var appdata = process.env.APPDATA.replace(/\\+|\/\/+/g, "/")+"/";
const Directory = {
  "app": appdata+"SteamCMD Automaton/",
  "steamcmd": appdata+"SteamCMD Automaton/SteamCMD/",
  "servers": appdata+"SteamCMD Automaton/Servers/"
}

function AddPromptToCmdPanel() {
  const prompt = IonPrompt.CreatePrompt("cmdPrompt");
  console.log(prompt);
  document.querySelector("#cmdpanel").appendChild(prompt);
  ac = new AutoComplete(prompt.querySelector("#cmdPrompt_input"), 
  [ // Command List
    "steamcmd",
    "echo",
    "clear",
    "create",
    "idlist",
    "server",
    "dictionary",
    "dictionary add",
    "dictionary clear",
    "reload",
  ]);
  ac.onlyFullText = true;
  return prompt;
}

function LoadServerList(querySelector) {
  const listObject = document.querySelector(querySelector);
  fs.mkdirSync(Directory.app, {recursive: true});
  fs.mkdirSync(Directory.servers, {recursive: true});
  fs.mkdirSync(Directory.steamcmd, {recursive: true});

  // Download SteamCMD
  if(!fs.existsSync(Directory.steamcmd+"steamcmd.exe"))
  {
    https.get("https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip", (res) => {
      console.log("statusCode:", res.statusCode);
      console.log("headers:", +res.headers["content-length"]);
      const fileSize = +res.headers["content-length"];
      var bytesDownloaded = 0;
      IonPrompt.Execute(document.querySelector("#cmdPrompt_input"), "echo Downloading SteamCMD...");
      res.on("data", (d) => {
        //process.stdout.write(d);
        //console.log(d);
        bytesDownloaded += d.length;
        IonPrompt.Execute(document.querySelector("#cmdPrompt_input"), "echo "+Math.round(bytesDownloaded / fileSize * 100, 4) + "%");
      });

      const file = fs.createWriteStream(Directory.steamcmd+"steamcmd.zip");
      res.pipe(file);

      var workingCmd;
      file.on("finish", () => {
        IonPrompt.Execute(document.querySelector("#cmdPrompt_input"), "echo Extracting...");
        var zip = new AdmZip(Directory.steamcmd+"steamcmd.zip");
        var zipEntries = zip.getEntries();

        zipEntries.forEach(function(zipEntry) {
          console.log(zipEntry.entryName);
          fs.writeFileSync(Directory.steamcmd+"steamcmd.exe", zipEntry.getData());
          fs.unlinkSync(Directory.steamcmd+"steamcmd.zip");
        });
        IonPrompt.Execute(document.querySelector("#cmdPrompt_input"), "echo Download SteamCMD Complete and ready to use.");
      });
    })
    .on("error", (e) => {
      console.error(e);
    });
  }

  if (fs.existsSync(Directory.servers)) {
    listObject.innerHTML = "";
    fs.readdir(Directory.servers, function (err, files) {
      for (var i = 0; i < files.length; i++) {
        const div = document.createElement("div");
        div.setAttribute("class", "server");
        div.setAttribute("id", "server"+i);
        div.innerHTML = files[i];

        listObject.appendChild(div);
      }
    });
  }
}

class IonPrompt {
  static IonPromptStyle() {
    const style = document.createElement("style");
    style.setAttribute("id", "ionPromptStylingObject");
    style.innerHTML = 'div.ionPrompt{  width: 100%;  height: 100%;  background: black;}div.ionPrompt div.logScreen{  box-sizing: border-box;  padding: 5px;  width: 100%;  height: calc(100% - 32px);  overflow-y: auto;}div.ionPrompt div.logScreen p{  color: white;  padding: 0;  margin: 0;}div.ionPrompt div.inputField{  width: 100%;  height: 32px;  box-sizing: border-box;  border-top-style: solid;  border-color: white;  border-width: 1px;}div.ionPrompt div.inputField input.promptInput{  color: white;  font-size: 20px;  width: 100%;  background: black;}';
    document.getElementsByTagName("html")[0].firstChild.appendChild(style);
  }

  static CreatePrompt(identifier){
    if (!identifier) {
      identifier = "ionPrompt";
      if (document.querySelectorAll(".ionPrompt").length > 0) {
        identifier += document.querySelectorAll(".ionPrompt").length;
      }
    }

    const ionPrompt = document.createElement("div");
    ionPrompt.setAttribute("id", identifier);
    ionPrompt.setAttribute("class", "ionPrompt");

    const logScreen = document.createElement("div");
    logScreen.setAttribute("id", identifier+"_logScreen");
    logScreen.setAttribute("class", "logScreen");

    const logText = document.createElement("p");
    logText.setAttribute("id", identifier+"_logText");
    logText.innerHTML = "<span style='font-style:oblique; color:#aaaaaa;'>Console Controller</span>";
    logScreen.appendChild(logText);

    const inputField = document.createElement("div");
    inputField.setAttribute("id", identifier+"_inputField");
    inputField.setAttribute("class", "inputField");

    const input = document.createElement("input");
    input.setAttribute("class", "promptInput");
    input.setAttribute("id", identifier+"_input");
    input.setAttribute("type", "search");
    input.setAttribute("onkeydown",
      "if(event.keyCode == 13 && this.value.trim() != '') {IonPrompt.Execute(this, this.value.trim());}"+
      "else if (event.keyCode == 9) { event.preventDefault(); IonPrompt.AutoComplete(this, this.value, this.selectionStart);}"
    );
    inputField.appendChild(input);

    ionPrompt.appendChild(logScreen);
    ionPrompt.appendChild(inputField);

    return ionPrompt;
  }

  static AutoComplete(inputObject, text, caretPos)
  {
    var curData = this.GetCurrentWord(text, caretPos);

    var start = curData.start;
    var end = curData.end;
    var selectedWord = curData.selectedWord;
    inputObject.setSelectionRange(start, end);

    const startLine = text.substring(0, start);
    const endLine = text.substring(end, text.length);

    var possibleWords = [];

    for (var i = 0; i < validWords.length; i++) {
      if (selectedWord != "" && selectedWord != " " && validWords[i].toLowerCase().startsWith(selectedWord.toLowerCase())) {
        //notification("Replaced", "Changed \""+selectedWord+"\" to \""+validWords[i]+"\"", 1000);
        //selectedWord = validWords[i];
        possibleWords.push(validWords[i]);
      }
    }
    if (possibleWords.length == 1) {
      selectedWord = possibleWords[0];
      inputObject.value = startLine+selectedWord+endLine;
      inputObject.setSelectionRange(start+selectedWord.length, start+selectedWord.length);
    }
    else if (possibleWords.length > 1) {
      inputObject.setSelectionRange(caretPos, caretPos);
      this.Execute(inputObject, "echo Possible Auto Completes:", false);
      for (var i = 0; i < possibleWords.length; i++) {
        this.Execute(inputObject, "echo \t"+possibleWords[i], false);
      }
    }
  }

  static GetCurrentWord(text, caretPos)
  {
    var start = caretPos;
    var end = caretPos;
    while (start > 0 && text.substring(start-1, start) != " ") {
      start--;
    }

    while (end < text.length && text.substring(end, end+1) != " ") {
      end++;
    }

    var selectedWord = text.substring(start, end);
    return {
      "selectedWord": selectedWord,
      "start": start,
      "end": end
    };
  }

  static Execute(inputObject, cmd, clearConsoleOnFinish = true)
  {
    const promptObject = inputObject.parentNode.parentNode;
    const promptLog = promptObject.firstChild;
    const logText = promptLog.firstChild;
    const args = cmd.split(" ");
    const command = args[0].toLowerCase();
    const rest = cmd.substring(args[0].length+1);


    var clearInput = true;
    function WriteLine(text, color = "#FFFFFF")
    {
      logText.innerHTML += "\n<span style='color:"+color+";'>"+text+"</span>";
      promptLog.scrollTop = promptLog.scrollHeight;
    }

    function Error(errorText)
    {
      WriteLine(errorText, "#FF0000");
    }

    /**
     * 
     * @param {string} appPath Path to the app to open
     * @param {string} args An optional string of arguments
     */
    function RunInConsole(appPath, args = "") {
      var cmd = "start \"\" \""+appPath+"\" "+ args;
      console.log(cmd);
      var appProc = cProc.exec(cmd);
      return appProc;
    }

    /* Commands Section START */
    if (command == "steamcmd") {
      WriteLine("Running SteamCMD");
      var app = RunInConsole(Directory.steamcmd+"steamcmd.exe");
      app.stderr.on("data", function (chunk) {
        Error(chunk.toString());
      });

      app.stdout.on("data", function(chunk) {
        WriteLine(chunk.toString());
      });
    }
    else if (command == "echo") {
      WriteLine(rest);
    }
    else if (command == "idlist") {
      WriteLine("Loading...");
      fs.readFile("./api/id_list.json", (err, list) => {
        list = JSON.parse(list);

        for (var i = 0; i < list.length; i++) {
          if (list[i].name.toLowerCase().includes(rest.toLowerCase())) {
            WriteLine(list[i].appid + " - " + list[i].name);
          }
        }
      });
    }
    else if (command == "clear") {
      logText.innerHTML = "<span style='font-style:oblique; color:#aaaaaa;'>Console Controller</span>";
    }
    else if (command == "create") {
      const t = new Notif("Preparing...");
      // For getting server IDs
      fs.readFile("./api/id_list.json", (err, list) => {
        if (!err) {
          list = JSON.parse(list);
          var _html = "";
          for (var i = 0; i < list.length; i++) {
            _html += "<option value='"+list[i].appid+"'>"+list[i].name+"</option>";
          }
  
          _html = "<select id='serverid'>"+_html+"</select>";
        }
        else {
          _html = "Couldn't load id list, but you can write one manually<br><input id='serverid'>";
        }
        t.close();

        const serverName = document.createElement("input");
        serverName.type = "text";
        serverName.id = "servername";
        const n = new Notif("New Server", ["Server name<br>", serverName, "<br><br>Server type", _html]);
        n.buttonObject.innerHTML = "<p>Create Server</p>";
        n.buttonObject.addEventListener("click", function(e) {
          var app = RunInConsole(`${Directory.steamcmd}steamcmd.exe`, `+login anonymous +force_install_dir "${Directory.servers+n.object.querySelector("#servername").value}" +app_update ${n.object.querySelector("#serverid").value} validate +quit`);
          app.stdout.on("close", function() {
            WriteLine("The installation has finished. If it was correctly installed it should appear in the sidebar to the left. If it doesn't show up, "+
            "<a href=\"javascript:void();\" onclick=\"IonPrompt.Execute(document.querySelector('#cmdPrompt_input'), 'reload', false);\">Click here</a> "+
            "or type \"reload\" in the console.<br>If it still doesn't show up after that, something went wrong during the installation.");
          });
          IonPrompt.Execute(document.querySelector('#cmdPrompt_input'), 'reload', false);
        });
      });
    }
    else if (command == "dictionary") {
      if (args[1]) {
        if (args[1] == "add") {
          if (args[2]) {
            validWords.push(args[2]);
            WriteLine("Added \""+args[2]+"\" to Dictionary.");
          }
        }
        else if (args[1] == "clear") {
          validWords = [];
          WriteLine("Cleared Dictionary.");
        }

      }
      else {
        WriteLine("Usage:"+
          "\ndictionary add [Word]"+
          "\ndictionary clear"
        );
      }
    }
    else if (command == "reload") {
      LoadServerList(".serverlist");
    }
    //If command is unrecognized
    else {
      Error("Command not recognized");
      clearInput = false;
    }
    /* Commands Section END */

    if (clearConsoleOnFinish) {
      if (clearInput) {
        inputObject.value = "";
      }
      else {
        inputObject.setSelectionRange(0, inputObject.value.length);
      }
    }
  }
}

var validWords = [
  "steamcmd",
  "echo",
  "ping",
  "clear",
  "create",
  "idlist",
  "server",
  "dictionary",
  "add",
  "reload",
];