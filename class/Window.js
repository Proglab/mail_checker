const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const app = electron.app;

let Window =  Object.create({
    window: null,
    create: (width, height) => {
        this.window = new BrowserWindow({
            width: width,
            height: height,
            resizable: false
        });

        //this.window.loadURL(`file://${__dirname}/../view/update.html#v${app.getVersion()}`);
        this.window.loadURL(`file://${__dirname}/../view/index.html#v${app.getVersion()}`);

        this.window.on('closed', function() {
            this.window = null;
            mainWindow = null;
        });
        return this;
    }
});
module.exports.Window = Window;