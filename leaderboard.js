// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    var sortRules;
    if(Session.get("sort_direction") === "name") {
      sortRules = {score: -1, name: 1};
    } else {
      sortRules = {score: 1, name: -1}
    }
    return Players.find({}, {sort: sortRules});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };
  
  Session.set("sort_direction", "name");  //initialize 1 time
  Template.leaderboard.sort_direction = function() {
    return Session.get("sort_direction");     
  };

  Template.leaderboard.events({
    'click input.sort': function () {
      //console.log("before " + Session.get("sort_direction"));
      if(Session.get("sort_direction") === "name") {
        Session.set("sort_direction", "point");  
      } else {
        Session.set("sort_direction", "name");  
      }
      //console.log("after " + Session.get("sort_direction"));
    }
  });  

  Template.leaderboard.events({
    'click input.reset': function () {
      Meteor.call("clearData");
    }
  }); 

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
  var myRandom = function() {
    for (var i = 0; i < names.length; i++) {
      Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  };

  Meteor.startup(function () {
    if (Players.find().count() === 0) { //i need to clean up db if want to see the changes
      myRandom();
    }
  });
  Meteor.methods({
    clearData : function() {
      console.log("server side call");
      Players.remove({});
      myRandom();
    }  
  });
}
