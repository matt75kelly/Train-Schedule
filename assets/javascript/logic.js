var config = {
    apiKey: "AIzaSyDXe-ZotW8mOk7M5P8RzoZscJ8ciTSyI6E",
    authDomain: "trainschedules-2e181.firebaseapp.com",
    databaseURL: "https://trainschedules-2e181.firebaseio.com",
    projectId: "trainschedules-2e181",
    storageBucket: "",
    messagingSenderId: "980568192627"
  };
  firebase.initializeApp(config);

  var database = firebase.database();
  
  var arrivalTimes = [];
  var remainingMins = [];
  
  var userData = {
    nameTrain: "",
    destination: "",
    frequency: 0,
    startTime: "00:00 AM",
    dateEntered: "01/01/2000",
  }

  function updateTimes(){

  }
  function convertCurrent(currentTime){
    var indexSplit = currentTime.indexOf(":");
    var prefix = currentTime.slice(0, indexSplit + 3);
    var suffix = currentTime.slice(-3);

    var current = prefix + suffix;

    return current;
  }

  function diffDate (stampDate, stampTime){
    var n = "|";
    var year = stampDate.slice(-4);
    var month = stampDate.slice(0,2);
    var day = stampDate.slice(3,5);
    var hour = stampTime.slice(0,2);
    var minutes = stampTime.slice(3,5);
    var halfDay = stampTime.slice(-2);

    if (halfDay === "PM") hour += 12;
    var currentDate = moment().format("L");
    var currentTime = moment().format('HH:mm');
    var index = currentTime.indexOf(":");

    var currYear = currentDate.slice(-4);
    var currMonth = currentDate.slice(0,2);
    var currDay = currentDate.slice(3,5);
    var currHour = currentTime.slice(0, index);
    var currMin = currentTime.slice(index + 1, index + 3);
    
    var diffYear = (currYear - year);
    var diffMonth = (currMonth - month);
    var diffDay = (currDay - day);
    var diffHour = (currHour - hour);
    var diffMin = (currMin- minutes);

    if(diffMin < 0) {
      diffHour--;
      diffMin = 60 + diffMin;
    }
    if (diffHour < 0){
      diffDay--;
      diffHour = 24 + diffHour;
      if(diffHour > 12) {
        diffHour -= 12;
      }
    }
    if (diffDay < 0){
      temp = diffMonth;
      diffMonth--;
      if(temp == 4 || temp == 6 || temp == 9 || temp == 11){
        diffDay = 30 + diffDay;
      }
      else if (temp == 2){
        diffDay = 28 + diffDay;
      }
      else {
        diffDay = 31 + diffDay;
      }
    }
    if (diffMonth < 0){
      diffYear--;
      diffMonth = 12 + diffMonth;
      if(diffMonth < 10) diffMonth = "0" + diffMonth;
    }
    var result = (diffYear * 525600) + (diffMonth * 43800) + (diffDay * 1440) + (diffHour * 60) + diffMin;
    return result;
  }
  function arrivingNext(stampDate, startTime, frequency){
    var arrival = "";
    var remaining = remainingTime(stampDate, startTime, frequency);
    var time = moment().format('HH:mm');
    var arrHour = parseInt(time.slice(0,2));
    var arrMin = parseInt(time.slice(3,5));

    arrMin += remaining;
    if( arrMin >= 60){
      arrHour++;
      arrMin = 60 - arrMin;
    }
    if( arrHour >= 24){
      arrHour = 24 - arrHour;
    }
    var arrNext = ` ` + arrHour + ":" + arrMin;
    arrival = convertTime(arrNext);
    return arrival;
  }

  function remainingTime(stampDate, startTime, frequency){
    var timeFromStart = diffDate(stampDate, startTime);
    var timeFromPrev = timeFromStart % frequency;
    return frequency - timeFromPrev;
  }
  // Function that converts the Time from 24 hour military time into 12 hour format
  function convertTime(string){
    var prepString = string.trim();
    var indexSplit = prepString.indexOf(":");
    var hours = parseInt(prepString.slice(0, indexSplit));
    var minutes = prepString.slice(indexSplit, prepString.length);
    var dayHalf = "";

    if (hours > 12){
      hours -= 12;
      dayHalf = " PM";
    }
    else dayHalf = " AM";
    newTime = hours + minutes + dayHalf;
    return newTime;
  }
  // Main Program and Event Handlers


  $(document).on("click", ".submit", function(event){
    event.preventDefault();

    userData.nameTrain = $("#userTrainName").val().trim();
    userData.destination = $("#userDestination").val().trim();
    userData.startTime = $("#userStartTime").val().trim();
    userData.frequency = $("#userFrequency").val().trim();
    userData.dateEntered = moment().format("L");
    database.ref().push(userData);
  });

  database.ref().on("child_added", function(childSnapshot){
    var data = childSnapshot.val();

      var newEntry = $("<tr>");
      var name = $("<th>");
      var dest = $("<td>");
      var freq = $("<td>");
      var arrival = $("<td>");
      var remaining = $("<td>");
      var duration = data.frequency;
      var currentTime = moment().format('HH:mm');

      console.log ("Current: " + currentTime);

      diffDate(data.dateEntered, data.startTime);
      name.text(data.nameTrain);
      dest.text(data.destination);
      freq.text(duration);
      
      remainingMins.push(remainingTime(data.dateEntered, data.startTime,duration));
      remaining.text(remainingMins[remainingMins.length - 1]);

      arrivalTimes.push(arrivingNext(data.dateEntered, data.startTime, duration));
      arrival.text(arrivalTimes[arrivalTimes.length -1]);
      
      newEntry.append(name);
      newEntry.append(dest);
      newEntry.append(freq);
      newEntry.append(arrival);
      newEntry.append(remaining);

      $("tbody").append(newEntry);
    
  });