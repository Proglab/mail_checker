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

function checkDomainPromise(email, index)
{
    return new Promise((resolve, reject) => {
        dns.resolveMx(email.split('@')[1], function(err, addresses){
            $('#operation').html('Vérification de '+email.split('@')[1]);
            if (err == null && addresses.length > 0)
            {
                resolve({err: null, res: 1, index: index});
            }
            else
            {
                resolve({err: err, res: 0, index: index});
            }
        });
    });
}

function checkDomain()
{
    $('#operation').html('Vérification des noms de domaines...');

    for (var index in domaines ) {

        var records = domaines[index];
        console.log('checkDomain');
        console.log(records);
        console.log('emailExistence ' + domaines[index][0]['mail']);


        checkDomainPromise(domaines[index][0]['mail'], index).then(
            (value) => {
                for (var recordId in domaines[value.index] ) {
                    let t = [];
                    t[0] = domaines[value.index][recordId].mail;
                    t[1] = domaines[value.index][recordId].civ;
                    t[2] = domaines[value.index][recordId].firstname.toLowerCase().replace(/^(.)|\s+(.)/g, function ($1) {
                        return $1.toUpperCase()
                    });
                    t[3] = domaines[value.index][recordId].lastname.toLowerCase().replace(/^(.)|\s+(.)/g, function ($1) {
                        return $1.toUpperCase()
                    });
                    t[4] = value.res;
                    if (!ascii.test(domaines[value.index][recordId].firstname) || !ascii.test(domaines[value.index][recordId].lastname) || !ascii.test(domaines[value.index][recordId].mail)) {
                        t[5] = 1;
                    }
                    else {
                        t[5] = 0;
                    }
                    save++;
                    ipc.send('mail-save', t);
                }
            }
        )
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
    console.log('mail-saved');
    $('#progress_txt').html(save+'/'+total);
    var pourcent = Math.floor(save / total * 100);
    $('#progress_bar').html('<span class="bar-width" id="progress_value">'+pourcent+'%</span>');
    $('#progress_bar').attr('aria-valuenow', pourcent);
    $('#progress_bar').attr('style', 'width: '+pourcent+'%');


    if (save == total)
    {
        $('#operation').html('Sauvegarde en cours');
        ipc.send('check-email-finished');
    }
});

ipc.on('finished', function (event, args) {
    save = 0;
    domaines = {};
    total = 0;
    $('#progress_bar').html('<span class="bar-width" id="progress_value">0%</span>');
    $('#progress_bar').attr('aria-valuenow', 0);
    $('#progress_bar').attr('style', 'width: 0%');
    $('#operation').html('Traitement terminé');
});