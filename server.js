//propriedades do app, das janelas, do menu, de caixas de diálogo, de "envio e ouvimento"
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require("electron")

//cria e escreve arquivos
const fs = require("fs")

const path = require("path")

var mainWindow = null



//cria a janela
async function createWindow(){
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,

		//algumas funções do Node, como "require", não funcionam por padrão, então você precisa fazer isso para que elas rodem
		webPreferences: {
			contextIsolation: false,
		    nodeIntegration: true,
		    nodeIntegrationInWorker: true
		}
	})

	await mainWindow.loadFile("src/pages/editor/index.html")

	//serve para carregar o console js nativo da web
	mainWindow.webContents.openDevTools()


	//cria um novo arquivo sempre que o apk iniciar
	createNewFile()
	
	ipcMain.on("updateContent", function(event, data){
		file.content = data
	})
}



var file = {}

//funções gerais

//cria um novo arquivo
function createNewFile(){
	file = {
		name: "novo-arquivo.txt",
		content: "",
		saved: false,
		path: app.getPath("documents") + "/nomeArquivo.txt"
	}

	//nome do evento e valor que o daremos
	mainWindow.webContents.send("set-file", file)
}

function writeFile(filePath){
	try{		
		fs.writeFile(filePath + ".txt", file.content, function(error){
			if(error) throw error

			file.saved = true
			file.path  = filePath

			//obtém o nome que o usuário deu para o arquivo
			file.name  = path.basename(filePath)

			console.log("O que ser isso: " + JSON.stringify(file))

			//atualiza o nome do arquivo ao utilizar o "Save As"
			mainWindow.webContents.send("set-file", file)
		})
	}
	catch(error){
		console.log("Ocorreu um erro durante o processo: " + error)
	}
}

async function saveFileAs(){
	//exibe os arquivos do computador
	let dialogFile = await dialog.showSaveDialog({
		// title: "Salve aqui os seus arquivos",
		defaultPath: file.path
	})

	//verifica se o usuário fechou a tela sem salvar nenhum arquivo e, nesse caso, cancela a operação
	if(dialogFile.canceled){
		return false
	}

	//salva o arquivo
	writeFile(dialogFile.filePath)
}

function save(){
	//verifica se o arquivo já está salvo. Se sim, apenas o sobrescreve, e caso não, executa o "Save As"
	if(file.saved){
		return writeFile(file.path)
	}

	return saveFileAs()
}

function readFile(filePath){
	try{
		return fs.readFileSync(filePath, "utf8")
	}
	catch(error){
		console.log("Erro no readFile: " + error)
		return ""
	}
}

async function openFile(){
	let dialogFile = await dialog.showOpenDialog({
		defaultPath: file.path
	})

	//o "dialog.showSaveDialog" nos traz uma string, mas o "dialog.showOpenDialog" retorna um array
	console.log(dialogFile)

	//verificar cancelamento
	if(dialogFile.canceled) return false

	//abrir o arquivo
	file = {
		name: path.basename(dialogFile.filePaths[0]),
		content: readFile(dialogFile.filePaths[0]),
		saved: true,
		path: dialogFile.filePaths[0]
	}

	mainWindow.webContents.send("set-file", file)

	console.log(file)
}


//criação do menu
const templateMenu = [

	//funções padrões para arquivos
	{
		label: "Arquivo",
		submenu: [
			{
				label: "Novo", 
				accelerator: "CmdOrCtrl+N",
				click(){ createNewFile() },
			},

			{
				label: "Abrir", 
				accelerator: "CmdOrCtrl+O",
				click() { openFile() }
			},

			{
				label: "Salvar", 
				accelerator: "CmdOrCtrl+S",
				click(){ save() }
			},

			{
				label: "Salvar como",
				accelerator: "CmdOrCtrl+Shift+S",
				click(){ saveFileAs() }
			},

			{
				label: "Fechar",
				//verifica se é Windows ou Mac e executa o comando de cada SO para fechar
				role: process.platform === "darwin" ? "close" : "quit"
			}
		]
	},

	//comandos padrões de edição de texto
	{
		label: "Editar",
		submenu: [
			{
				label: "Desfazer",
				role: "undo"
			},

			{
				label: "Refazer",
				role: "redo"
			},

			//separador
			{
				type: "separator"
			},

			{
				label: "Copiar",
				role: "copy"
			},

			{
				label: "Cortar",
				role: "cut"
			},

			{
				label: "Colar",
				role: "paste"
			}
		]
	},

	//implementação de links externos
	{
		label: "Ajuda",
		submenu: [
			{
				label: "YouTube",
				click() { shell.openExternal("http://www.youtube.com") }
			}
		]
	}
]

const menu = Menu.buildFromTemplate(templateMenu)
Menu.setApplicationMenu(menu)



//abre a janela
app.whenReady().then(createWindow)




//só abre uma nova janela se o número de páginas for igual a zero. Isso funciona especificamente para Mac
app.on("activate", () => {
	if(BrowserWindow.getAllWindows().length === 0){
		createWindow()
	}
})