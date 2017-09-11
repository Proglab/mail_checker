const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;
const fs = require('fs');



let mainWindow;

// Adds debug features like hotkeys for triggering dev tools and reload
const Window = require('./class/Window').Window;
const File = require('./class/File').File;

let fileContent = '';



let filename = '';

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (!mainWindow) {
        mainWindow = Window.create(800,750);
    }
});

app.on('ready', () => {
    console.log('The application is ready.');
    mainWindow = Window.create(800,750);

});

ipc.on('open-file', function (event) {

    console.log('open-file');
    File.window = mainWindow;
    let file = File.open();
    if (file != null)
    {
        filename = file.file.replace('.csv', '_treated.csv');

        fs.writeFile(filename, "mail;civ;firstname;lastname;mail_exist;encoding_problem\r\n", function (err) {
            event.sender.send('file-opened', {file: file.file, content: file.content});
        });


    }
});


ipc.on('mail-save', function (event, t) {
    console.log('mail-save');
    fileContent += t.join(";") + "\r\n";
    event.sender.send('mail-saved', t);
});

ipc.on('check-email-finished',function (event) {
    fs.appendFileSync(filename, fileContent);
    console.log('check-email-finished');
    event.sender.send('finished');
    fileContent = '';
});
