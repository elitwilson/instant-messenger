Msgs = new Mongo.Collection("msgs");

if (Meteor.isClient) {
  Template.conversation.helpers({
    msgs: function() {
      return Msgs.find({});
    }
  });

  Template.body.events({
    "submit #msg-entry": function(event) {
      var msg = event.target.text.value;

      Meteor.call("addMsg", msg);
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    },
    "click #clear-history": function (event, template) {
      Meteor.call("clearHistory");
    },
    "submit #add-friend": function() {
      Meteor.call("addFriend", event.target.text.value);
      return null;
    }
  });

  Template.body.helpers({
    users: function() {
      return null;
    }
  });

  Template.friendsList.helpers({
    friends: function() {
      //dummy data
      var friends = [
        { name: "Arlo", status: "online" },
        { name: "Bob", status: "offline" }
      ]
      return friends;
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

// SERVER 
// --------------------------------------------------------------------------

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

}

// METHODS 
// --------------------------------------------------------------------------

Meteor.methods({
  clearHistory: function() {
    Msgs.remove({});
  },
  addMsg: function(msg) {
    var date = new Date();

    Msgs.insert({
      msg: msg,
      senderId: Meteor.userId(),
      senderUsername: Meteor.user().username,
      timestamp: moment(date).format('l LT'), //Using moment.js package to format dates.
      createdAt: new Date()
    });
  },
  addFriend: function(name) {
    //check to see if username exists in collection of users
    try { 
      var user = Meteor.users.findOne({ username: name });
    }
    catch (e) {
      if (Meteor.users.findOne({ username: name }) == undefined) {
        alert("Person does not exist.");
      }
      else {
        console.log(e);
      }
    }

    //add username (or id maybe) to currentUser.profile.friends
    var currentUser = Meteor.user();
    var newFriend = {
      name: user.username,
      id: user._id
    }
    Meteor.users.update({ _id: currentUser._id }, { $set:{"profile":"test"}});

    //currentUser.profile.push(newFriend);
    console.log(currentUser);
    

    //provide feedback for success/failure.
  }
});