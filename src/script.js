const fs = require('fs');
const https = require('https');
const cProc = require('child_process');
const AdmZip = require('adm-zip');
const { pour } = require('std-pour');

var appdata = process.env.APPDATA+"/";
const Directory = {
  "app": appdata+"SteamCMD Automaton/",
  "steamcmd": appdata+"SteamCMD Automaton/SteamCMD/",
  "servers": appdata+"SteamCMD Automaton/Servers/"
}

function AddPromptToCmdPanel() {
  const prompt = IonPrompt.CreatePrompt("cmdPrompt");
  console.log(prompt);
  document.querySelector("#cmdpanel").appendChild(prompt);
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
        IonPrompt.Execute(document.querySelector("#cmdPrompt_input"), "echo Download Complete.");
      });
    })
    .on("error", (e) => {
      console.error(e);
    });
  }

  if (fs.existsSync(Directory.servers)) {
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
