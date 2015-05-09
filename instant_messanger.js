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
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

// --------------------------------------------------------------------------

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

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
  }
});