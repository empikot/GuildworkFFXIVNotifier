function updateOptions() {
  localStorage.activated = document.getElementById("activated").value;
  localStorage.frequency = document.getElementById("frequency").value;
  localStorage.server = document.getElementById("server").value;
  console.log("saved: " + localStorage.activated + " | " + localStorage.frequency + " | " + localStorage.server);
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
  console.log("read: " + localStorage.activated + " | " + localStorage.frequency + " | " + localStorage.server);

  var activatedElement = document.getElementById("activated");
  activatedElement.addEventListener("change", updateOptions);
  activatedElement.value = localStorage.activated;

  var frequencyElement = document.getElementById("frequency");
  frequencyElement.value = localStorage.frequency;
  frequencyElement.addEventListener("change", updateOptions);

  document.getElementById("server").addEventListener("change", updateOptions);
});
