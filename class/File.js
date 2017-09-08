const electron = require('electron');
const app = electron.app;
const fs = require('fs');
const dialog = electron.dialog;

let File =  Object.create({
    file: null,
    content:null,
    window:null,
    open: () => {

        let files = dialog.showOpenDialog(this.window, {
            properties: ['openFile'],
            filters: [
                { name: 'Moka File', extensions: ['csv'] }
            ]
        });

        if (!files) { return; }

        this.file = files[0];
        this.content = fs.readFileSync(this.file).toString();
        return this;
    },
    save: (content) => {

        let fileName = dialog.showSaveDialog(this.window, {
            title: 'Save Popsy Output',
            filters: [
                { name: 'Popsy Files', extensions: ['txt'] }
            ]
        });

        if (!fileName) { return; }

        fs.writeFileSync(fileName, this.content);
    }
});
module.exports.File = File;