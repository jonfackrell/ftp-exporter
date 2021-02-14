'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

import { autoUpdater } from "electron-updater"
import * as Sentry from "@sentry/electron";

Sentry.init({ dsn: "https://44ff7db8ac8d44108835af6330bcb86d@o513378.ingest.sentry.io/5615143" });

import { ipcMain } from 'electron'
import { dialog } from 'electron'
import axios from 'axios'
import { match } from 'assert'
import { basename } from 'path'
const { ConcurrencyManager } = require("axios-concurrency");
const cheerio = require('cheerio');

const MAX_CONCURRENT_REQUESTS = 2;

const fs = require('fs');
const path = require('path');
const {shell} = require('electron')
const csv = require('csv-parser'); // https://stackabuse.com/reading-and-writing-csv-files-with-node-js/
const createCsvWriter = require('csv-writer').createObjectCsvWriter; // https://www.npmjs.com/package/csv-writer

const Store = require('electron-store');
const store = new Store();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    title: 'Exporter',
    width: 1200,
    height: 800,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true
    }
  }).webContents.on('did-finish-load', () => {
    win.webContents.send('updateFolders', store.get('woodruffpapers.folders'));
    win.webContents.send('updateSettings', store.get('settings'));
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')

    autoUpdater.checkForUpdatesAndNotify()
  }
  
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()

})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on('saveSettings', (event, data) => {
  store.set('settings', data);
});

ipcMain.on('createNewFolder', (event, folderName) => {
  if(! store.has('woodruffpapers.folders')){
    store.set('woodruffpapers.folders', {});
  }
  let folders = store.get('woodruffpapers.folders');
  folders[folderName] = ({
    'name': folderName, 'manifests': []
  });
  store.set('woodruffpapers.folders', folders);
  event.sender.webContents.send('updateFolders', store.get('woodruffpapers.folders'));
});

ipcMain.on('addItemsToFolder', (event, folderName, manifests) => {  
  let folder = store.get('woodruffpapers.folders.'+folderName);
  folder.manifests = folder.manifests.concat(manifests).filter(onlyUnique);
  store.set('woodruffpapers.folders.'+folderName, folder);
  event.sender.webContents.send('updateFolders', store.get('woodruffpapers.folders'));
});

ipcMain.on('removeItemsFromFolder', (event, folderName, manifests) => {  
  let folder = store.get('woodruffpapers.folders.'+folderName);
  manifests.forEach(manifest => {
    folder.manifests.splice(folder.manifests.indexOf(manifest), 1);
  });  
  store.set('woodruffpapers.folders.'+folderName, folder);
  event.sender.webContents.send('updateFolders', store.get('woodruffpapers.folders'));
});

ipcMain.on('update', (event, manifests) => {
  manifests.forEach(manifest => {
    axios
      .get(manifest)
      .then(response => {
        const within = getCollectionKey(response.data.within['@id']);
        const id = getManifestKey(response.data['@id']);
        store.set(within+'.manifests.'+id , response.data);
        console.log(store.get(within+'.manifests'));
      });
  });
});

ipcMain.on('export', (event, manifestUrls, imagesOnly) => {
  const manifests = manifestUrls.map( m => { return store.get('woodruffpapers.manifests.'+getManifestKey(m))});

  if(imagesOnly){
    exportImages(manifests);
  }else{
    exportTranscripts(manifests);
  }  
});

ipcMain.on('openExternalLink', (event, url) => {
  shell.openExternal(url);
});

ipcMain.on('createOmekaPages', (event) => {
  let transcriptExport = dialog.showOpenDialogSync({
    title: 'Choose Export File',
    filters: [
      {
        name: 'CSV',
        extensions: ['csv']
      }
    ],
    properties: [
      'openFile '
    ]
  });

  let subjectExport = dialog.showOpenDialogSync({
    title: 'Choose Subject File',
    filters: [
      {
        name: 'CSV',
        extensions: ['csv']
      }
    ],
    properties: [
      'openFile '
    ]
  });

  if (typeof transcriptExport === 'undefined' || typeof subjectExport === 'undefined') {
    return;
  }

  if (typeof transcriptExport === 'object') {
    transcriptExport = transcriptExport[0];
  }
  if (typeof subjectExport === 'object') {
    subjectExport = subjectExport[0];
  }

  let transcriptExportResults = [];
  let subjectExportResults = [];

  fs.createReadStream(transcriptExport)
    .pipe(csv())
    .on('data', (data) => {
        let subjects = data['dcterms:subject'].split('||');
        subjects = subjects.map(s => {
          return s.replace('[[', '').replace(']]', '').split('|')[0];
        });
        transcriptExportResults = transcriptExportResults.concat(subjects).filter(subject => { return typeof subject === 'string' && subject.length > 0; });
      })
    .on('end', () => {
      console.log('Export: ');
      console.log(transcriptExportResults);
      fs.createReadStream(subjectExport)
        .pipe(csv())
        .on('data', (data) => subjectExportResults.push(data))
        .on('end', () => {
          // console.log(subjectExportResults);
          let filteredSubjects = subjectExportResults.filter(subject => { return transcriptExportResults.indexOf(subject['Title']) > -1})
          console.log('Filtered: ');
          //console.log(filteredSubjects);

          // Todo: Create Omeka pages  
          // Check for page existance, this could be done by requesting all pages and then filtering on slug
          // Build json
          // Save page if doesn't already exist
          // Add to navigation based on topic 
          let pages = [];
          axios
            .get('http://omeka.local/api/site_pages?per_page=10000')
            .then(response => {
              let currentPages = response.data.map(page => { return page['o:slug']; });              
              filteredSubjects.forEach(subject => {                
                if(currentPages.indexOf(stringToSlug(subject['Title'])) < 0){
                  pages.push(subject);
                }
              });                 
              let newPages = [];
              let api = axios.create();  
              const pageManager = ConcurrencyManager(api, MAX_CONCURRENT_REQUESTS);
              Promise
                .all(pages.map(page => { 
                  return api
                            .post('http://omeka.local/api/site_pages?key_identity='+ store.get('settings.omeka.key_identity') +'&key_credential=' + store.get('settings.omeka.key_credential'), getPageJson(page['Title'])) 
                            .catch(function (error) {
                              console.log('Page Creation Error: ');
                              console.log(error);
                            });
                }))
                .then(results => {   
                  results.forEach(result => { 
                    newPages.push(result.data);
                    console.log(result);
                  });
                
                console.log('Newly create pages: ');
                console.log(newPages);

                pageManager.detach();

                  axios
                    .get('http://omeka.local/api/sites/1') 
                    .then(response => {
                      let site = response.data;
                      let documentsNavIndex = site['o:navigation'].findIndex(page => { return page.type == 'browseItemSets'; });
                      console.log(documentsNavIndex);
                      let peopleIndex = site['o:navigation'][documentsNavIndex].links.findIndex(page => { return page.data.id == 3; });
                      let placesIndex = site['o:navigation'][documentsNavIndex].links.findIndex(page => { return page.data.id == 4; });

                      // TODO: Not adding new pages to navigation
                      newPages.forEach(page => {
                        let category = filteredSubjects.filter(subject => { return subject['Title'] === page['o:title'] })[0]['Categories'];
                        console.log('Page Category: ');
                        console.log(category);
                        if(category.indexOf('People') >= 0){
                          
                          site['o:navigation'][documentsNavIndex].links[peopleIndex].links.push(getPageNavigationJson(page));
                        }
                        if(category.indexOf('Places') >= 0){
                          site['o:navigation'][documentsNavIndex].links[placesIndex].links.push(getPageNavigationJson(page));
                        }
                      });

                      console.log('New Navigation: ');
                      console.log(site['o:navigation'][documentsNavIndex].links[peopleIndex]);

                      axios
                        .put('http://omeka.local/api/sites/1?key_identity='+ store.get('settings.omeka.key_identity') +'&key_credential=' + store.get('settings.omeka.key_credential'), site) 
                        .catch(function (error) {
                          console.log(error);
                        });
                    })
                    .catch(function (error) {
                      console.log(error);
                    });                  
                });

                
            });

        });
    });
    
});

ipcMain.on('sync', (event, remoteManifests) => {  
  let localManifests = store.get('woodruffpapers.manifests');
  // Remove local manifests that are missing in remote
  if(store.has('woodruffpapers.manifests')){    
    for (const [key, manifest] of Object.entries(localManifests)) {
      if(remoteManifests.map( m => { return m['@id']}).indexOf(manifest['@id']) < 0 ){
        store.delete('woodruffpapers.manifests.'+getManifestKey(manifest['@id']));
        console.log('Removing: '+ getManifestKey(manifest['@id']));
      }
    }
  }
  
  // Add missing manifests to local from remote 
  let wait = 0;
  localManifests = store.get('woodruffpapers.manifests');
  remoteManifests.forEach( (manifest, key) => {
    if(! localManifests.hasOwnProperty(getManifestKey(manifest['@id']))){
      wait ++;
      setTimeout(function(){
        axios
        .get(manifest['@id'])
        .then(response => {        
          store.set(getCollectionKey(response.data.within['@id'])+'.manifests.'+getManifestKey(response.data['@id']) , response.data);  
          console.log('Adding: '+ getManifestKey(response.data['@id']));      
        });
      }, 500 * wait); 
    } else {
      console.log('Skipping: '+ getManifestKey(manifest['@id']));
    } 
  });
});

function exportTranscripts(manifests) {
  let requests = [];
  let transcribedManifests = {};
  
  manifests.forEach(manifest => {
    manifest['transcripts'] = [];
    transcribedManifests[manifest['@id']] = manifest;
    const canvases = manifest.sequences[0].canvases;
    canvases.forEach(canvas => {
      if(canvas.hasOwnProperty('otherContent') && canvas.otherContent.length > 0){
        const otherContentUrl = canvas.otherContent[0]['@id'];
        requests.push(otherContentUrl);
      }      
    });    
  });

  let canvases = [];
  
  let api = axios.create();  
  const manager = ConcurrencyManager(api, MAX_CONCURRENT_REQUESTS);

  Promise
    .all(requests.map(request => api.get(request)))
    .then(results => {
      results.forEach(result => {            
        const localManifest = manifests.filter(manifest => { return JSON.stringify(manifest).indexOf(result.config.url) > -1 })[0];
        const canvas = localManifest.sequences[0].canvases.filter(canvas => { return JSON.stringify(canvas).indexOf(result.config.url) > -1 })[0];
        canvas['within'] = localManifest['@id']
        canvas['transcript'] = result.data.resources[0].resource.chars;
        canvases.push(canvas);        
      });
    
      canvases.forEach(canvas => {
        transcribedManifests[canvas.within]['transcripts'].push(canvas);
      });
    
      const header = [
        {id: 'type', title: 'Resource Type'},
        {id: 'identifier', title: 'dcterms:identifier'},
        {id: 'itemIdentifier', title: 'Item [dcterms:identifier]'},
        {id: 'title', title: 'dcterms:title'},
        {id: 'transcriptOf', title: 'bibo:transcriptOf'},
        {id: 'subject', title: 'dcterms:subject'},
        {id: 'created', title: 'dcterms:created'},
        {id: 'url', title: 'Media source [URL]'},
      ];
      let rows = [];
      
      for (const [key, manifest] of Object.entries(transcribedManifests)) {
        rows.push({
          type: 'Item',
          identifier: manifest['@id'],
          itemIdentifier: '',
          title: manifest['label'],
          transcriptOf: '',
          subject: '',
          created: '',
          url: ''
        });
        manifest.transcripts.forEach(canvas => {
          rows.push({
            type: 'Media',
            identifier: canvas['@id'],
            itemIdentifier: manifest['@id'],
            title: canvas['label'],
            transcriptOf: replaceSubjects(canvas['transcript']),
            subject: extractSubjects(canvas['transcript']),
            created: extractDates(canvas['transcript']),
            url: canvas.images[0].resource['@id']
          });
        });
      };
      
      saveCSV(header, rows);
    });
  manager.detach();
}

function exportImages(manifests) {
  let requests = [];
  manifests.forEach(manifest => {
    const canvases = manifest.sequences[0].canvases;
    canvases.forEach(canvas => {      
        const imageUrl = canvas.images[0].resource['@id'];        
        requests.push(imageUrl);           
    });    
  });
  
  let canvases = [];
  
  let api = axios.create({
    responseType: 'stream'
  });  
  const manager = ConcurrencyManager(api, MAX_CONCURRENT_REQUESTS);

  let folderName = dialog.showOpenDialogSync({
      title: 'Export Directory',
      properties: [
        'openDirectory'
      ]
    });    

  if (typeof folderName === 'undefined') {
    return;
  }

  if (typeof folderName === 'object') {
    folderName = folderName[0];
  }

  Promise
    .all(requests.map(request => api.get(request)))
    .then(results => {
      results.forEach(result => {            
        const imagePath = path.resolve(folderName, path.basename(result.config.url.replace('/full/full/0/default.jpg', '')) + path.extname(result.config.url));
        const writer = fs.createWriteStream(imagePath)
        result.data.pipe(writer)
        //fs.writeFileSync(imagePath, result.data);  
      });        
    });
  manager.detach();
}

function saveCSV(headers, rows){
  const filename = dialog.showSaveDialogSync({
    title: 'Save CSV export',
    buttonLabel: 'Save',
    defaultPath: generateFilename(),
    filters: [
      {
        name: 'CSV',
        extensions: ['csv']
      }
    ],
    properties: [
      'createDirectory'
    ]
  });

  if (typeof filename === 'undefined') {
    return;
  }

  const csvWriter = createCsvWriter({
    path: filename,
    header: headers
  });

  csvWriter.writeRecords(rows)
    .then(() => {
      shell.showItemInFolder(filename);
    });
}

function extractDates(html){
  let dates = [];
  /*if(typeof html === "string"){
    var parser = new DomParser();
    let dom = parser.parseFromString(html);
    let elements = dom.getElementsByTagName('date');
    if(elements.length > 0){
      elements.forEach(element => {
        let date = element.attributes.filter(attribute => { return attribute.name == 'when'})[0].value;
        if(date.length > 0){
          dates.push(date);
        }      
      });
    }  
  }*/
  const $ = cheerio.load(html);
  $('date').each(function(i, elem){
    dates.push($(this).attr('when'));
  });   
  return dates.filter(date => { return date.length > 0}).join("||");
}

function replaceSubjects(html) {
  const $ = cheerio.load(html);
  $('a').replaceWith(function(){
    return '[[' + $(this).attr('title') + '|' + $(this).text() + ']]';
  });
  return $('body').html();
}

function extractSubjects(html){
  /*var parser = new DomParser();
  let subjects = [];  
  let dom = parser.parseFromString(html);
  let elements = dom.getElementsByTagName('a');
  if(elements.length > 0){
    elements.forEach(element => {
      subjects.push('[['+element.attributes.filter(attribute => { return attribute.name == 'title'})[0].value+'|'+element.textContent+']]')
    });
  }*/
  let subjects = [];
  const $ = cheerio.load(html);
  $('a').each(function(i, elem){
    subjects.push( '[[' + $(this).attr('title') + '|' + $(this).text() + ']]');
  });    
  return subjects.join("||");
}

function getCollectionKey(url) {
  return url.split("/")[(url.split("/").length - 1)];
}

function getManifestKey(url) {
  return url.split("/")[(url.split("/").length - 2)];
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function generateFilename() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();

  return yyyy + '-' + mm + '-' + dd + '-' + time + '_export';
}

function stringToSlug (str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes

  return str;
}

function getPageNavigationJson(page) {
  return {
    "type": "page",
    "data": {
        "label": "",
        "id": page['o:id']
    },
    "links": []
  }
}

function getPageJson(name){
    return {
      "o:slug": stringToSlug(name),
      "o:title": name,
      "o:is_public": true,
      "o:block": [
          {
              "o:layout": "pageTitle",
              "o:data": [],
              "o:attachment": []
          },
          {
              "o:layout": "html",
              "o:data": {
                  "html": ""
              },
              "o:attachment": []
          },
          {
              "o:layout": "browsePreview",
              "o:data": {
                  "resource_type": "media",
                  "query": "?property%5B0%5D%5Bjoiner%5D=and&property%5B0%5D%5Bproperty%5D=3&property%5B0%5D%5Btype%5D=in&property%5B0%5D%5Btext%5D=" +name,
                  "limit": "12",
                  "heading": "",
                  "link-text": "Browse all"
              },
              "o:attachment": []
          }
      ],
      "o:site": {
          "@id": "http://omeka.local/api/sites/" + 1,
          "o:id": 1
      }
  }
}
