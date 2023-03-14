const { ipcRender } = require("electron")

ipcRender.on("setFile", function(event, data){
	console.log(data)
})