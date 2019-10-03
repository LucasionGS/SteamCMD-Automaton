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
    logText.innerHTML = "<span style='font-style:oblique; color:#aaaaaa;'>Command Prompt</span>";
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
      "else if (event.keyCode == 9) { event.preventDefault(); AutoComplete();}"
    );
    inputField.appendChild(input);

    ionPrompt.appendChild(logScreen);
    ionPrompt.appendChild(inputField);

    return ionPrompt;
  }

  static AutoComplete()
  {

  }

  static Execute(inputObject, cmd)
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

    if (command == "ping") {
      WriteLine("pong!");
    }
    else if (command == "echo") {
      WriteLine(rest);
    }
    //If command is unrecognized
    else {
      Error("Command not recognized");
      clearInput = false;
    }

    if (clearInput) {
      inputObject.value = "";
    }
    else {
      inputObject.setSelectionRange(0, inputObject.value.length);
    }
  }
}
