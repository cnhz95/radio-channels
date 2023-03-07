"use strict";

var baseURL = "http://api.sr.se/api/v2/";
var audio = new Audio();

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => { 
    // Read SR channels and dynamically create list of channels
    let channelsURL = baseURL + "channels?size=100&format=json";
    fetch(channelsURL, {method: "GET"})
    .then(response => response.text())
    .then(data => {
        let jsonData = JSON.parse(data);
        let channels = jsonData.channels;
        for (let i = 0; i < channels.length; i++) {
            let image = "<img src='" + channels[i].image + "'width=30 height=30>";
            document.getElementById("mainnavlist").innerHTML += "<li id='" + channels[i].id + "'>" + image + channels[i].name + "</li>";
            document.getElementById("searchProgram").innerHTML += "<option value='" + channels[i].id + "'>" + channels[i].name + "</option>";
        }
    })
    .catch(error => {
        alert("There was an error " + error);
    });
    
    // Create eventlistener for click on search program
    document.getElementById("searchbutton").onclick = () => {
        let elem = document.getElementById("info");
        let prog = document.getElementById("searchProgram").value;
        // Set the information about the selected channel's tableau
        let scheduleURL = baseURL + "scheduledepisodes?size=100&channelid=" + prog + "&format=json"; // Default size = 10
        fetch(scheduleURL, {method: "GET"})
        .then(response => response.text())
        .then(data => {
            let jsonData = JSON.parse(data);
            let schedule = jsonData.schedule;
            for (let i = 0; i < schedule.length; i++) {
                elem.innerHTML += "<h2>" + schedule[i].title + "</h2>" + "<h3>" + schedule[i].description + "</h3>"
                + "<p>" + new Date(parseInt(schedule[i].starttimeutc.substr(6))) + "</p>" + "<hr>";
            }
        })
        .catch(error => {
            alert("There was an error " + error);
        })
        elem.innerHTML = ""; // Reset the content of the element
    }
    
    // Create eventlistener for clicks on dynamically created list of channels in mainnavlist
    document.getElementById("mainnavlist").onclick = (event) => {
        let elem = document.getElementById("info");
        let channelID = event.target.id;
        // Set the elements for the selected channel 
        let channelURL = baseURL + "channels/" + channelID + "?&format=json";
        fetch(channelURL, {method: "GET"})
        .then(response => response.text())
        .then(data => {
            let jsonData = JSON.parse(data);
            let channel = jsonData.channel;
            document.getElementById("searchProgram").value = channelID; // Update the channel displayed in the dropdown list
            elem.innerHTML = "<h2>" + channel.name + "</h2>" + "<h3>" + channel.tagline + "</h3>" + "<hr>";
            audio.src = channel.liveaudio.url; // URL to the audio resource
            audio.play();
        })
        .catch(error => {
            alert("There was an error " + error);
        })

        // Set the playlist elements that are available for the selected channel
        let playlistURL = baseURL + "playlists/rightnow?channelid=" + channelID + "&format=json";
        fetch(playlistURL, {method: "GET"})
        .then(response => response.text())
        .then(data => {
            let jsonData = JSON.parse(data);
            let playlist = jsonData.playlist;
            if (playlist.song) { // Add the current song if it exists
                elem.innerHTML += "<p>" + "Current song: " + playlist.song.description + "</p>";
            }
            if (playlist.previoussong) {
                elem.innerHTML += "<p>" + "Previous song: " + playlist.previoussong.description + "</p>";
            }
            if (playlist.nextsong) {
                elem.innerHTML += "<p>" + "Next song: " + playlist.nextsong.description + "</p";
            }
        })
        .catch(error => {
            alert("There was an error " + error);
        })
        elem.innerHTML = "";
    }
}) // End of DOM content loaded