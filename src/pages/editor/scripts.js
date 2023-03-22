const { ipcRenderer } = require("electron")

const textarea = document.querySelector("#text")
const title    = document.querySelector("#title")

ipcRenderer.on("set-file", function(event, data){
	textarea.value = data.content
	title.innerHTML = data.name + " | Dev Editor"
})

//salva o conteúdo do arquivo toda vez que ele é alterado
function saveNewText(){
	//nome do evento e valor
	ipcRenderer.send("updateContent", textarea.value)
}