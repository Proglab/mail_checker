const electron = require('electron');
const ipc = electron.ipcRenderer;
const parse = require('csv-parse/lib/sync');
const emailExistence = require('email-existence');
var dns = require('dns');
const ascii = /^[ -~\t\n\r]+$/;
let domaines = {};
let total = '';

var save = 0;
const $ = jQuery = require('jquery');


function checkMx (email, index, callback) {
    if (!/^\S+@\S+$/.test(email)) {
        callback(null, false, index);
        return;
    }
    dns.resolveMx(email.split('@')[1], function(err, addresses){
        $('#operation').html('Vérification de '+email.split('@')[1]);
        if (err == null && addresses.length > 0)
        {
            callback(null, 1, index);
            return;
        }
        else
        {
            callback(err, 0, index);
            return;
        }
    });
};


function checkDomain()
{
    $('#operation').html('Vérification des noms de domaines...');

    for (var index in domaines ) {

        var records = domaines[index];
        console.log('checkDomain');
        console.log(records);
        console.log('emailExistence ' + domaines[index][0]['mail']);

        checkMx(domaines[index][0]['mail'], index, function(err, res, ind ){
            console.log(err);
            console.log(res);


            console.log('check ' + domaines[index][0]['mail'] + ' => ' + res);


            for (var recordId in domaines[ind] ) {

                console.log('----- traitement deb');
                console.log(domaines[ind][recordId]);

                let t = [];
                t[0] = domaines[ind][recordId].mail;
                t[1] = domaines[ind][recordId].civ;
                t[2] = domaines[ind][recordId].firstname.toLowerCase().replace(/^(.)|\s+(.)/g, function ($1) {
                    return $1.toUpperCase()
                });
                t[3] = domaines[ind][recordId].lastname.toLowerCase().replace(/^(.)|\s+(.)/g, function ($1) {
                    return $1.toUpperCase()
                });
                t[4] = res;
                console.log(domaines[ind][recordId].mail + ' -> ' + t[4]);
                if (!ascii.test(domaines[ind][recordId].firstname) || !ascii.test(domaines[ind][recordId].lastname) || !ascii.test(domaines[ind][recordId].mail)) {
                    t[5] = 1;
                }
                else {
                    t[5] = 0;
                }
                save++;
                ipc.send('mail-save', t);

                console.log(t);
                console.log('----- traitement fin');
            };


        });

    }
}

$('#close').click(function () {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    window.close();
});

ipc.on('file-opened', function (event, file) {
    var records = parse(file.content, {delimiter: ';', columns: true});
    $('#operation').html('Vérification en cours...');
    $('#progress_txt').html('0/' + records.length);
    total = records.length;

    var i =0;
    records.forEach((record) => {
        i++;
        try {
        var dom = record['mail'].split('@')[1].replace('.', '');
        }
        catch (e)
        {
            console.log(e);
            console.log(record);
        }
        if (!domaines.hasOwnProperty(dom))
        {
            domaines[dom] = [];
        }
        domaines[dom].push(record);


        if (i == records.length)
        {
            checkDomain();
        }
    });

});

$('#version').html(window.location.hash.substring(1));

$('#file').click(() => {
    $('#progress').removeClass('hidden');
    $('#operation').removeClass('hidden');
    $('#operation').html('Traitement en cours ...');
    ipc.send('open-file');
});

ipc.on('message', function (event, text) {
    var container = document.getElementById('messages');
    var message = document.createElement('div');
    message.innerHTML = text;
    container.appendChild(message);
});


ipc.on('mail-saved', function (event, args) {
    $('#operation').html('Sauvegarde en cours ...');
    $('#progress_txt').html(save+'/'+total)
    if (save == total)
    {
        $('#operation').html('Opération terminée');
        ipc.send('check-email-finished');
    }
});