const electron = require('electron');
const ipc = electron.ipcRenderer;
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const shell = electron.shell;
const dir = __dirname + '/../files/';
const filename = 'treated.txt';
const emailExistence = require('email-existence');
const ascii = /^[ -~\t\n\r]+$/;
let domaines = {};

var i = 0;
const $ = jQuery = require('jquery');




function checkDomain(mail)
{
    var dom = mail.split('@')[1].replace('.', '');
    console.log('check '+dom);
    if (!domaines.hasOwnProperty(dom))
    {
        domaines[dom] = null;
        console.log('pas encore checké '+dom);
        emailExistence.check(mail, function (err, res) {
            if (res) {
                domaines[dom] = 1;
            }
            else {
                domaines[dom] = 0;
            }
            console.log('emailExistence '+mail+' '+domaines[dom]);
        })

    }
    else
    {
        if (domaines[dom] == null)
        {
            setTimeout(checkDomain(mail), 2000);
        }else{
            return true;
        }

    }
    console.log('fin check '+dom);
}


ipc.on('file-opened', function (event, file) {
    $('#operation').html('Fichier ouvert');
    var records = parse(file.content, {delimiter: ';', columns: true});
    $('#operation').html('Vérification en cours...');
    $('#total').html(records.length);
    records.forEach((record) => {
        console.log('traitement '+record['E-mail']);
        Promise.all([
            checkDomain(record['E-mail'])
        ]).then(() => {
            var dom = record['E-mail'].split('@')[1].replace('.', '');
            let t = [];
            t[0] = record['E-mail'];
            t[1] = record['Prénom'].toLowerCase().replace(/^(.)|\s+(.)/g, function ($1) {
                return $1.toUpperCase()
            });
            t[2] = record['Nom'].toLowerCase().replace(/^(.)|\s+(.)/g, function ($1) {
                return $1.toUpperCase()
            });
            t[3] = domaines[dom];
            if (!ascii.test(record['Prénom']) || !ascii.test(record['Nom'])) {
                t[4] = 1;
            }
            else {
                t[4] = 0;
            }

            console.log('save mail '+record['E-mail']);
            event.sender.send('mail-save', t);
            console.log('fin traitement '+record['E-mail']);

        })

    });

});

$('#version').html(window.location.hash.substring(1));

$('#file').click(() => {
    $('#operation').html('Traitement en cours ...');
    ipc.send('open-file');
});

ipc.on('message', function (event, text) {
    var container = document.getElementById('messages');
    var message = document.createElement('div');
    message.innerHTML = text;
    container.appendChild(message);
});

$('#close').click(function () {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    window.close();
});

ipc.on('mail-saved', function (event, args) {
    $('#num').html(parseInt($('#num').html()) + 1);
});