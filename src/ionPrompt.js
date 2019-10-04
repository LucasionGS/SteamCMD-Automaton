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
      promptLog.scrollTop = promptLog.scrollHeight
    }

    function Error(errorText)
    {
      WriteLine(errorText, "#FF0000");
    }

    /* Commands Section START */
    if (command == "ping") {
      WriteLine("pong!");
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
      window.location.href = "createServer.html";
      if (args[1]) {

      }
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
  "echo",
  "ping",
  "clear",
  "create",
  "idlist",
  "server",
  "dictionary",
  "add",
];
