function createNotification(displayId, displayName, displayIcon, displayBody, displayHref, seconds) {
  if (shouldShowNotification()) {
    var notification = new Notification(displayName, {
      icon: displayIcon,
      body: displayBody,
      tag: 'guildwork_ffxiv_notifier_' + displayId
    });
    notification.onclick = function () {
      window.open(displayHref);
    };
    notification.onshow = function () {
      setTimeout(function() { notification.close(); }, seconds * 1000);
    };
  }
}

function processHuntObject(object, add) {
  if (add == 0) {
    huntTitle = object.name;
    huntIcon = 'boss.png';
    huntBody = 'Was KILLED :( ' + "\n";
    huntBody += 'zone: ' + object.zone.name + ' (X: ' + object.pos.x + ', Y:' + object.pos.y + ')';
	huntDbUrl = 'http://xivdb.com/?monster/' + object.id;
    createNotification('hunt_' + object.id, huntTitle, huntIcon, huntBody, huntDbUrl, 10);
    delete openedHunts[object.id];
    return;
  }
  if (add == 1 && openedHunts[object.id] != undefined) {
    return;
  }
  openedHunts[object.id] = object;

  huntTitle = object.name;
  huntIcon = 'boss.png';
  huntBody = 'A rank! ';
  if (object.rank == 's') {
    huntBody = 'S RANK! ';
  }
  huntBody += 'Spawned at ' + parseDate(object.spawn_at * 1000) + "\n";
  huntBody += 'zone: ' + object.zone.name + ' (X: ' + object.pos.x + ', Y:' + object.pos.y + ')';
  huntDbUrl = 'http://xivdb.com/?monster/' + object.id;
  createNotification('hunt_' + object.id, huntTitle, huntIcon, huntBody, huntDbUrl, 30);
}

function processFateObject(object, add) {
  if (add == 0) {
    fateTitle = object.name;
    fateIcon = 'fate.png';
    fateBody = 'Has ENDED :( ' + "\n";
    fateBody += 'zone: ' + object.zone.name + ' (X: ' + object.pos.x + ', Y:' + object.pos.y + ')';
	fateDbUrl = 'http://xivdb.com/?fate/' + object.id;
    createNotification('fate_' + object.id, fateTitle, fateIcon, fateBody, fateDbUrl, 8);
    delete openedFates[object.id];
    return;
  }
  if (add == 1 && openedFates[object.id] != undefined) {
    return;
  }
  openedFates[object.id] = object;
  if (initialFateLaunch == 1) {
    return;
  }
  
  fateTitle = object.name;
  fateIcon = 'fate.png';
  fateBody = 'Started at ' + parseDate(object.spawn_at * 1000) + "\n";
  fateBody += 'zone: ' + object.zone.name + ' (X: ' + object.pos.x + ', Y:' + object.pos.y + ')';
  fateDbUrl = 'http://xivdb.com/?fate/' + object.id;
  createNotification('fate_' + object.id, fateTitle, fateIcon, fateBody, fateDbUrl, 8);
}

function processWeatherObject(object) {
  if (object.name == '???' || object.weather.name == '???') {
    return;
  }
  if (currentWeather[object.id] != undefined) {
    if (currentWeather[object.id].weather.id == object.weather.id) {
      return;
    }
  }
  currentWeather[object.id] = object;
  // for initial processing dont show notifications
  if (initialWeatherLaunch == 1) {
    return;
  }

  weatherTitle = object.name;
  weatherIcon = 'weather/' + object.weather.id + '.png';
  if (object.weather.id > 34) {
    weatherIcon = 'weather/default.png';
  }
  weatherBody = parseDate(object.updated_at * 1000) + "\n" +'changed to ' + object.weather.name;
  weatherGwUrl = 'http://guildwork.com/games/' + localStorage.server.replace('/', '#/') + '/weather';
  createNotification(object.id, weatherTitle, weatherIcon, weatherBody, weatherGwUrl, 8);
}

function processGuildworkResponse(data, channel) {
  var huntArr = [];
  var fateArr = [];
  for (key in data) {
    var record = data[key];
    if (channel == 'hunts') {
      huntArr[record.id] = 1;
      processHuntObject(record, 1);
    }
	if (channel == 'fates') {
      fateArr[record.id] = 1;
      processFateObject(record, 1);
    }
    if (channel == 'zones') {
      processWeatherObject(record);
    }
  }
  // cleanup for hunts
  if (channel == 'hunts') {
    for (key in openedHunts) {
      if (huntArr[key] == undefined) {
        processHuntObject(openedHunts[key], 0);
      }
    }
	initialFateLaunch = 0;
  }
  if (channel == 'fates') {
    for (key in openedFates) {
      if (fateArr[key] == undefined) {
        processFateObject(openedFates[key], 0);
      }
    }
  }
  if (channel == 'zones') {
    initialWeatherLaunch = 0;
  }
}

function showChannel(channel) {
  var url = 'http://guildwork.com/api/games/' + localStorage.server + '/' + channel;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    try {
      if (xhr.readyState === 4) {
        var resp = JSON.parse(xhr.responseText);
        processGuildworkResponse(resp, channel)
      }
    } catch (e) {
      console.log(e);
    }
  };
  xhr.open("GET", url);
  xhr.send();
}

function show() {
  showChannel('hunts');
  showChannel('fates');
  showChannel('zones');
}

function shouldShowNotification() {
  return localStorage.activated == 1;
}

function parseDate(timestamp) {
  date = new Date(timestamp);
  day = date.getFullYear() + '-' + (date.getMonth()<10?'0':'') + date.getMonth() + '-' + (date.getDay()<10?'0':'') + date.getDay();
  time = date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes() + ':' + (date.getSeconds()<10?'0':'') + date.getSeconds();
  return day + ' ' + time;
}

// Conditionally initialize the options.
var initialWeatherLaunch = 1;
var initialFateLaunch = 1;
if (!localStorage.isInitialized) {
  localStorage.activated = 1;
  localStorage.frequency = 30;
  localStorage.server = 'ffxiv/moogle'
  localStorage.isInitialized = true;
}

var interval = 0; // The display interval, in seconds.
var openedHunts = [];
var openedFates = [];
var currentWeather = [];

setInterval(function () {
  interval++;
  if (localStorage.frequency <= interval) {
    show();
    interval = 0;
  }
}, 1000);

chrome.browserAction.setPopup({"popup": "popup.html"});