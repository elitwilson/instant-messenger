if (Meteor.isClient) {
  var selectedFriend = null;
  var currentConversation = {
    messages: []
  };
  //SUBSCRIPTIONS
  // --------------------------------------------------------------
  Meteor.subscribe('msgs');
  Deps.autorun(function() {
    Meteor.subscribe('currentUserFriends');
  });

  Deps.autorun(function() {
    Meteor.subscribe('allUsers');
  });

  Deps.autorun(function() {
    Meteor.subscribe('allConversations');
  })
  //END SUBSCRIPTIONS

  Template.body.events({
    "submit #msg-entry": function(event) {
      var msgText = event.target.text.value;
      var date = new Date();
      var friend = Session.get("selectedFriend");
      // *****var convo = Session.get("currentConversation");
      //Format nicely packaged message object for use in the conversation
      var message = {
        msgText: msgText,
        sender: Meteor.user(),
        timestamp: moment(date).format('l LT'), //Using moment.js package to format dates.
        createdAt: new Date()
      }
      Meteor.call("submitMessage", message, friend);
      
      //reset text field to blank
      event.target.text.value = "";
      // Prevent default form submit
      return false;
    },
    "click #clear-history": function (event, template) {
      Meteor.call("clearHistory");
    },
    "submit #add-friend": function() {
      Meteor.call("addFriend", event.target.text.value);
      event.target.text.value = "";
      return false;
    },
    "click .remove": function () {
      Meteor.call("removeFriend", this._id);
    },
    "click .friendLink": function() {
      Session.set("selectedFriend", Meteor.users.findOne({_id: this._id}));
    },
    "click .clearSelectedFriend": function() {
      Session.set("selectedFriend", null);
    }
  });

  Template.conversation.helpers({
    conversation: function() {
      var friend = Session.get("selectedFriend");
      if (friend) {
        return Conversations.findOne({ friend: friend });
      }
    }
  });

  Template.friendsList.helpers({
    friends: function() {
      if (Meteor.user() != null || Meteor.user() != undefined) {
        return _.sortBy(Meteor.user().friends, 'name');  
      }
      else {
        return null;
      }
    }
  });

  Template.body.helpers({
    selectedFriend: function() {
      return Session.get("selectedFriend");
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}