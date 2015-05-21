Msgs = new Mongo.Collection("msgs");
Conversations = new Mongo.Collection("conversations");

/*
var converstion = {
  messages: [],
  members: [],
  id: 123
}
*/
/* WHY THE FUCK........ FIX THIS SHIT
 - Can message yourself
 - 
*/
      
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

  /*Deps.autorun(function() {
    Meteor.subscribe('allConversations');
  })*/
  //END SUBSCRIPTIONS

  Template.body.events({
    "submit #msg-entry": function(event) {
      var msgText = event.target.text.value;
      var date = new Date();
      var convo = Session.get("currentConversation");
      var message = {
        msgText: msgText,
        sender: Meteor.user(),
        timestamp: moment(date).format('l LT'), //Using moment.js package to format dates.
        createdAt: new Date()
      }
      convo.messages.push(message);


      /*var message = {
        msgText: msg,
        senderId: Meteor.userId(),
        senderUsername: Meteor.user().username,
        timestamp: moment(date).format('l LT'), //Using moment.js package to format dates.
        createdAt: new Date()
      }*/


      console.log(convo);
      Meteor.call("updateConversation", convo);
      Session.setPersistent("currentConversation", convo);
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
      selectedFriend = Meteor.users.findOne({_id: this._id});
      Session.set("selectedFriend", selectedFriend);
      currentConversation.friend = selectedFriend;
      console.log(currentConversation);
      Session.setPersistent("currentConversation", currentConversation);
    }
  });

  Template.conversation.helpers({
    msgs: function() {
      return Msgs.find({});
    },
    conversation: function() {

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
      var convo = Session.get("currentConversation");
      return convo.friend;
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
  Meteor.publish('currentUserFriends', function () {
    if(!this.userId) return null;
    return Meteor.users.find(this.userId, {fields: {
      friends: 1,
    }});
  });

  Meteor.publish('msgs', function() {
    return Msgs.find({});
  });

  Meteor.publish('allUsers', function() {
    return Meteor.users.find({});
  });

  /*Meteor.publish('allConversations', function() {
    return Meteor.Conversations.find({});
  });*/
}

// METHODS 
// --------------------------------------------------------------------------

Meteor.methods({
  clearHistory: function() {
    Msgs.remove({});
  },
  addMsg: function(msg) {
    // Code is deprecated and to be replaced with sendMsg
    var date = new Date();

    Msgs.insert({
      msg: msg,
      senderId: Meteor.userId(),
      senderUsername: Meteor.user().username,
      timestamp: moment(date).format('l LT'), //Using moment.js package to format dates.
      createdAt: new Date()
    });
  },
  updateConversation: function(convo) {
  },
  newConversation: function(convo) {
    console.log("starting new conversation") ;
    //Conversations.insert({
    //});
  },
  findConversation: function(id) {
    console.log(id);
    return "complete";
  },
  archiveConversation: function () {
    //TODO
  },
  deleteConversation: function () {

  },
  addFriend: function(name) {
    //check to see if username exists in collection of users
    //If undefined, that means it doesn't exist.
    if (Meteor.users.findOne({ username: name }) != undefined) {
      var currentUser = Meteor.user();
      var user = Meteor.users.findOne({ username: name });

      //If user has no friends yet, create an array to add to
      if (!currentUser.friends) {
        Meteor.users.update({ _id: currentUser._id }, { $set:{"friends":[]}});  
        currentUser = Meteor.user();    
      }

      //add new friend to currentUser.friends only if friend doesn't already exist
      var newFriend = {
        name: user.username,
        _id: user._id
      }

      //if this comes back undefined, it means friend doesn't already exist.
      if (_.findWhere(currentUser.friends, { _id: newFriend._id }) == undefined) {
        currentUser.friends.push(newFriend);
        Meteor.users.update({ _id: currentUser._id }, { $set:{"friends":currentUser.friends}});
      }
      else {
      }
    }
    //"Here, we have this $set operator that we can use to modify the value of a field 
    //(or multiple fields) without deleting the document. So after the colon, we just 
    //pass through the fields we want to modify and their new values:"
    //Meteor.users.update({ _id: currentUser._id }, { $set:{"profile":{}}}); 

    //provide feedback for success/failure.
  },
  removeFriend: function(id) {
    /*
      TODO:
        - If this friend is in the current conversation, make sure to remove them from current convo.
        - 
    */
    var currentUser = Meteor.user();
    var friends = Meteor.user().friends;
    friends = _.without(friends, _.findWhere(friends, { _id: id}));
    Meteor.users.update({ _id: currentUser._id }, { $set:{"friends":friends}});
  }
});