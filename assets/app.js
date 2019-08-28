var firebaseConfig = {
   apiKey: "AIzaSyAGxUgOUK8okF7wl197ZfWJadz_UF9TYuE",
   authDomain: "take2tuesday.firebaseapp.com",
   databaseURL: "https://take2tuesday.firebaseio.com",
   projectId: "take2tuesday",
   storageBucket: "",
   messagingSenderId: "896372061968",
   appId: "1:896372061968:web:4157a26038bca110"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var subjectVal = "git";
$(".other-wrapper").hide();

var userId = localStorage.getItem("trilogy-id");
if (!userId) {
   userId = (Math.random() + " ").substring(2, 10) + (Math.random() + " ").substring(2, 10);
   localStorage.setItem("trilogy-id", userId);
}

var openTopic = null;
var userVotes = localStorage.getItem("trilogy-votes");
var userVotesArr = [];

if (userVotes) {
   userVotesArr = userVotes.split(",");
}

function displayTopic(topic) {
   switch (topic) {
      case "git": {
         return "Git";
      }
      case "console": {
         return "Console Commands";
      }
      case "html": {
         return "HTML";
      }
      case "css": {
         return "CSS";
      }
      case "bootstrap": {
         return "Bootstrap";
      }
      case "other": {
         return "Other";
      }
   }
};

database.ref().on("value", function(snapshot) {
   console.log(snapshot.val());
   var bulkData = snapshot.val();
   $("#votes-body").empty();

   console.log("arr firebase is using: ", userVotesArr);

   for (var topic in bulkData) {
      var topicTotalVotes = 0;
      var listStr = ``;
      for (var suggestionId in bulkData[topic]) {
         if (bulkData[topic][suggestionId].user === userId) {
            userVotesArr.push(suggestionId);
         }
         topicTotalVotes += bulkData[topic][suggestionId].votes;
         var badgeColor = userVotesArr.includes(suggestionId) ? "badge-secondary" : "badge-primary";
         var thumb = userVotesArr.includes(suggestionId) ? "👎" : "👍";
         var listItem = `
            <p class="ml-4">
               <span
                  class="badge badge-pill ${badgeColor} mr-2 click-badge"
                  data-id="${suggestionId}"
                  data-topic="${topic}"
               >
                  ${thumb} ${bulkData[topic][suggestionId].votes}
               </span>
               ${bulkData[topic][suggestionId].description}
            </p>`;
         listStr = listStr + listItem;
      }

      var topicBulk = $(`
         <div class="card accordion-card">
            <div class="card-header" id="${topic}-heading">
               <h2 class="mb-0">
                  <button class="btn btn-link topic-click" type="button" data-toggle="collapse" data-topic="${topic}" data-target="#${topic}-collapse">
                     <span class="badge badge-pill badge-primary mr-2">${topicTotalVotes}</span>${displayTopic(topic)}
                  </button>
               </h2>
            </div>
         
            <div id="${topic}-collapse" class="collapse ${openTopic === topic ? "show" : ""}" data-parent="#votes-body">
               <div class="card-body">
                  ${listStr}
               </div>
            </div>
         </div>
      `);

      $("#votes-body").append(topicBulk);
   }
});

function addIdToLocal(id) {
   userVotesArr.push(id);
   userVotes = userVotesArr.join(",");
   console.log('updated arr:', userVotesArr)
   localStorage.setItem("trilogy-votes", userVotes);
}

function removeIdFromLocal(id) {
   userVotesArr = userVotesArr.filter(function(elem) {
      return id !== elem;
   });
   console.log('updated arr:', userVotesArr)
   userVotes = userVotesArr.join(",");
   localStorage.setItem("trilogy-votes", userVotes);
}


$(".form-check-input").on("click", function(event) {
   subjectVal = $(this).val();

   if (subjectVal === "other") {
      $(".other-wrapper").show();
   }
   else {
      $(".other-wrapper").hide();
   }
});

$(document).on("click", ".click-badge", function() {
   var id = $(this).data("id");
   var topic = $(this).data("topic");
   var votes = parseInt($(this).text().trim().slice(-1));
   console.log({ id, topic, votes })
   if (!userVotesArr.includes(id)) {
      addIdToLocal(id);
      votes++;
      database.ref(`${topic}/${id}`).update({ votes });
   }
   else {
      removeIdFromLocal(id);
      votes--;
      database.ref(`${topic}/${id}`).update({ votes });
   }
});

$(document).on("click", ".topic-click", function() {
   var topic = $(this).data("topic");
   console.log('topic:', topic)
   console.log('openTopic:', openTopic)
   if (openTopic === topic) {
      localStorage.setItem("trilogy-topic", "");
      openTopic = "";
   }
   else {
      localStorage.setItem("trilogy-topic", topic);
      openTopic = topic;
   }
})

$("#topic-form").on("submit", function(event) {
   event.preventDefault();
   var topicObj = {
      description: $("#topic-description").val(),
      votes: 1,
      user: userId
   };

   database.ref("/" + subjectVal).push(topicObj);
})