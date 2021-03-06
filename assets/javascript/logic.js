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
  
  var intervalId;

  var userData = {
    nameTrain: "",
    destination: "",
    frequency: "",
    startTime: "",
    dateEntered: "",
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
    var year = stampDate.slice(-4);
    var month = stampDate.slice(0,3);
    var day = stampDate.slice(4,6);
    var hour = stampTime.slice(0,2);
    var minutes = stampTime.slice(3,5);

    var currentDate = moment().format("ll");
    var currentTime = moment().format('HH:mm');
    var index = currentTime.indexOf(":");

    var currYear = currentDate.slice(-4);
    var currMonth = currentDate.slice(0,3);
    var currDay = currentDate.slice(4,6);
    var currHour = currentTime.slice(0, index);
    var currMin = currentTime.slice(index + 1, index + 3);
    
    var stampCount = dateCrunch(year, month, day) + (parseInt(hour) * 60) + parseInt(minutes);
    var currentCount = dateCrunch (currYear, currMonth, currDay) + (parseInt(currHour) * 60) + parseInt(currMin);

    var result = currentCount - stampCount;
    return result;
  }

  function dateCrunch( year, month, day){
    var totalMin = 0;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    switch (month){
      case  months[0]:
        totalMin = 0;
      case  months[1]:
        totalMin = 44640;
      case  months[2]:
        totalMin = 84960;
      case  months[3]:
        totalMin = 129620;
      case  months[4]:
        totalMin = 172800;
      case  months[5]:
        totalMin = 217440;
      case  months[6]:
        totalMin = 260640;
      case  months[7]:
        totalMin = 305280;
      case  months[8]:
        totalMin = 349920;
      case  months[9]:
        totalMin = 393120;
      case  months[10]:
        totalMin = 437760;
      case  months[11]:
        totalMin = 480960;
    }
    totalMin += (parseInt(year) * 525600) + (Math.floor(parseInt(year)/4)*1440) + (parseInt(day) * 1440);
  
    return totalMin;
  }
  function arrivingNext(stampDate, startTime, frequency){
    var arrival = "";
    var remaining = remainingTime(stampDate, startTime, frequency);
    var time = moment().format('HH:mm');
    var arrHour = parseInt(time.slice(0,2));
    var arrMin = parseInt(time.slice(3,5));

    arrMin += remaining;
    if( arrMin >= 60){
      arrHour += Math.floor(arrMin / 60);
      arrMin = arrMin % 60;
    }
    if(arrMin < 10){
      arrMin = "0" + arrMin;
    }
    if( arrHour >= 24){
      arrHour = arrHour % 24;
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
    if (hours === 0){
      hours = 12;
    }
    newTime = hours + minutes + dayHalf;
    return newTime;
  }

  function validFreq(value){
    console.log(Number(value));
    var valid = true;
    if (value <= 0) {
      valid = false;
    }
    if (!Number(value)){
      valid = false;
    }
    return valid;
  }
  function validStartTime (time){
    console.log(time);
    var valid = true;
    var index = time.indexOf(":");
    var hours = time.slice(0, index);
    var mins = time.slice(index + 1, index + 3);
    if (hours == "") valid = false;
    if (mins == "") valid = false;
    if (parseInt(hours) < 0) valid = false;
    if (parseInt(mins) < 0) valid = false;

    return valid;
  }
  function updateTimes(){
    for( var i = 0; i < arrivalTimes.length; i++){
      var arrival = $("#arrival-" + i);
      var remaining = $("#remaining-" + i);
      var dateEntered = arrival.attr("data-entered");
      var startTime = arrival.attr("data-start");
      var frequency = arrival.attr("data-freq");

      remainingMins[i] = remainingTime(dateEntered, startTime, frequency);
      var remTime = remainingMins[i];
      var remHours = Math.floor(remTime / 60);
      var remMins = remTime % 60;
      if (remHours >= 1) {
        remaining.text(remHours + " Hours & " + remMins + " Minutes");
      }
      else if (remHours < 1) {
        remaining.text(remMins + " Minutes");
      }

      arrivalTimes[i] = arrivingNext(dateEntered, startTime, frequency);
      arrival.text(arrivalTimes[i]);
    }
    console.log("Interval Expired");
  }
  // Main Program and Event Handlers
  clearInterval(intervalId);
  intervalId = setInterval(updateTimes, 60000);

  $(document).on("click", ".submit", function(event){
    event.preventDefault();

    var testTime = $("#userStartTime").val().trim();
    var testFreq = $("#userFrequency").val().trim();

    if(validFreq(testFreq) && validStartTime(testTime)){
      userData.nameTrain = $("#userTrainName").val().trim();
      userData.destination = $("#userDestination").val().trim();
      userData.frequency = Math.floor(parseInt(testFreq));
      userData.dateEntered = moment().format("ll");
      userData.startTime = moment().format("HH:mm");
      database.ref().push(userData);
    }
    else{
      confirm("Input Invalid, Please Enter Valid Values");
    }
    $("#userTrainName").val("");
    $("#userDestination").val("");
    $("#userFrequency").val("");
    $("#userStartTime").val(""); 
  });

  database.ref().on("child_added", function(childSnapshot){
    var data = childSnapshot.val();
    var duration = data.frequency;
    var newEntry = $("<tr>");
    var name = $("<th>");
    var dest = $("<td>");
    var freq = $("<td>");
    var arrival = $("<td>");
    arrival.attr("id", "arrival-" + arrivalTimes.length);
    arrival.attr("data-entered", data.dateEntered);
    arrival.attr("data-start", data.startTime);
    arrival.attr("data-freq", duration);
    var remaining = $("<td>");
    remaining.attr("id", "remaining-" + remainingMins.length);
    name.text(data.nameTrain);
    dest.text(data.destination);
    freq.text(duration);
    
    remainingMins.push(remainingTime(data.dateEntered, data.startTime,duration));
    var remTime = remainingMins[remainingMins.length - 1];
      var remHours = Math.floor(remTime / 60);
      var remMins = remTime % 60;
      if (remHours >= 1) {
        remaining.text(remHours + " Hours & " + remMins + " Minutes");
      }
      else {
        remaining.text(remMins + " Minutes");
      }

    arrivalTimes.push(arrivingNext(data.dateEntered, data.startTime, duration));
    arrival.text(arrivalTimes[arrivalTimes.length -1]);
    
    newEntry.append(name);
    newEntry.append(dest);
    newEntry.append(freq);
    newEntry.append(arrival);
    newEntry.append(remaining);

    $("tbody").append(newEntry);
    
  });