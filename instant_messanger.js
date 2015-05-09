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

      Msgs.insert({
        msg: msg,
        createdAt: new Date()
      });
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}