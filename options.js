function updateOptions() {
  localStorage.activated = document.getElementById("activated").value;
  localStorage.frequency = document.getElementById("frequency").value;
  localStorage.server = document.getElementById("server").value;
  console.log("saved: " + localStorage.activated + " | " + localStorage.frequency + " | " + localStorage.server + " | " + localStorage.channels);
}
function updateChannels() {
  var channelElements = document.getElementsByClassName("channels");
  var channels = [];
  for (key in channelElements) {
    if (channelElements[key].checked == 1) {
     channels.push(channelElements[key].value);
    }
  }
  localStorage.channels = channels;
}

function loadServersList() {
  var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4) {
        var select = document.getElementById("server");
        var data = JSON.parse(httpRequest.responseText);
        for (key in data) {
          val = data[key];
          var option = document.createElement("option");
          option.text = val.name;
          option.value = val.id;
          if (val.id == localStorage.server) {
            option.selected = true;
          }
          select.appendChild(option);
        }
      }
    };
    httpRequest.open('GET', 'http://guildwork.com/api/games/ffxiv/servers');
    httpRequest.send();
}

window.addEventListener('load', function() {
  loadServersList();
  console.log("read: " + localStorage.activated + " | " + localStorage.frequency + " | " + localStorage.server + " | " + localStorage.channels);

  var activatedElement = document.getElementById("activated");
  activatedElement.addEventListener("change", updateOptions);
  activatedElement.value = localStorage.activated;

  var frequencyElement = document.getElementById("frequency");
  frequencyElement.value = localStorage.frequency;
  frequencyElement.addEventListener("change", updateOptions);

  var channelElements = document.getElementsByClassName("channels");
  for (key in channelElements) {
    channelElement = channelElements[key];
    channelElement.addEventListener("change", updateChannels);
    if(localStorage.channels.indexOf(channelElements[key].value) >= 0) {
      channelElement.checked = true;
    }
  }

  document.getElementById("server").addEventListener("change", updateOptions);
});
