function openTab(targetUrl) {
  chrome.tabs.create({ url: targetUrl });
}

var baseUrl = 'http://guildwork.com/games/' + localStorage.server.replace('/', '#/');

document.getElementById("party-finder").addEventListener("click", function() { openTab(baseUrl + '/parties') });
document.getElementById("fates").addEventListener("click", function() { openTab(baseUrl + '/fates') });
document.getElementById("shouts").addEventListener("click", function() { openTab(baseUrl + '/shouts') });
document.getElementById("nexus-lights").addEventListener("click", function() { openTab(baseUrl + '/nexus-lights') });