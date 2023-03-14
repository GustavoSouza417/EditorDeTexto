//propriedades do app, das páginas e do menu
const { app, BrowserWindow, Menu } = require("electron")
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
}



//funções gerais
var file = {}

//cria um novo arquivo
function createNewFile(){
	file = {
		name: "nomeArquivo.txt",
		content: "",
		saved: false,
		path: app.getPath("documents") + "/nomeArquivo.txt"
	}

	//nome do evento e valor que o daremos
	mainWindow.webContents.send("setFile", file)
}



//criação do menu
const templateMenu = [
	{
		label: "Arquivo",
		submenu: [
			{
				label: "Novo",

				click(){
					createNewFile()
				},
			},

			{
				label: "Abrir"
			},

			{
				label: "Salvar"
			},

			{
				label: "Salvar como"
			},

			{
				label: "Fechar",
				//verifica se é Windows ou Mac e executa o comando de cada SO para fechar
				role: process.platform === "darwin" ? "close" : "quit"
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