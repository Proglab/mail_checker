const electron = require('electron');
const ipc = electron.ipcRenderer;
const parse = require('csv-parse/lib/sync');
const emailExistence = require('email-existence');
const ascii = /^[ -~\t\n\r]+$/;
let domaines = {};

var i = 0;
const $ = jQuery = require('jquery');


/*


        })
 */
function checkDomain()
{
    $('#operation').html('Vérification des noms de domaines...');

    for (var index in domaines ) {

        var records = domaines[index];
        console.log('checkDomain');
        console.log(records);
        console.log('emailExistence ' + domaines[index][0]['E-mail']);

        var mail = domaines[index][0]['E-mail'];

        emailExistence.check(mail, function (err, res, mailTreated) {
            console.log(mailTreated);
        });

        console.log('end - emailExistence' + domaines[index]['E-mail']);

        /*
        emailExistence.check(records[0]['E-mail'], function (err, res) {
            if (res) {
                res = 1;
            }
            else {
                res = 0;
            }
            var i = 0;
            records.forEach((record) => {
                record['checkdomain'] = res;
                if (i == records.length) {
                    console.log(domaines);
                }
                i++;
            });
            console.log(records);
        });

        if (i == records.length) {
            console.log('tous les domaines sont occupés à être checké');
        }
        i++;
        */
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

    var i =0;
    records.forEach((record) => {
        i++;
        var dom = record['E-mail'].split('@')[1].replace('.', '');
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


/*



    records.forEach((record) => {
        console.log('traitement '+record['E-mail']);
        Promise.all([
            checkDomain(record['E-mail'])
        ]).then(() => {

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
*/
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
    $('#num').html(parseInt($('#num').html()) + 1);
});