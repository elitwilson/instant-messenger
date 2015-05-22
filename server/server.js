// SERVER 
// --------------------------------------------------------------------------

/* WHY THE FUCK........ FIX THIS SHIT
 - Can message yourself
 - 
*/

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

  Meteor.publish('allConversations', function() {
    return Conversations.find({});
  });
}

// METHODS 
// --------------------------------------------------------------------------

Meteor.methods({
  clearHistory: function() {
    Msgs.remove({});
  },
  findCurrentConversation: function(friend) {
    var convo = Conversations.find({ $and: [{ members: { $eq: friend }}, { members: { $eq: Meteor.user() } }]}).fetch();
    convo = convo[0];
    return convo;
  },
  submitMessage: function(msg, friend) {
    //Make sure message isn't blank and friend is selected
    if (msg.msgText != "" && friend != null) {

      //Current code here only allows for conversations to have 2 members. Obviously, if I want to change this later I'll have to fix this.
      var user1 = Meteor.user().username; //working
      var user2 = friend.username; //working

      // find the conversation where members contains usernames from user and friend.
      var convo = Conversations.find({'members.username': {$all: [user1, user2]}}).fetch();
      console.log("Here is the convo array returned: ");
      console.log(convo);
      // if convo array is not undefined
      if (typeof convo !== undefined && convo.length > 0) {
        convo[0].messages.push(msg);
        convo = convo[0];
        Meteor.call("updateConversation", convo);
      } else {
        Meteor.call("newConversation", msg, friend);
      }
    }
  },
  updateConversation: function(convo) {
    console.log("updating collection");
    return Conversations.update({ _id: convo._id }, { $set: {"messages": convo.messages }}, function(err, _id) {
      if (err != null) {
        console.log('error: ' + err);
        return err;
      }
    });
  },
  newConversation: function(msg, friend) {
    var convo = {
      messages: [],
      members: []
    }
    convo.members.push(friend);
    convo.members.push(Meteor.user());
    convo.messages.push(msg);
    return Conversations.insert(convo, function(err, _id) {
      if (err != null) {
        console.log('error: ' + err);
        return err;
      }
    });
  },
  findConversation: function(id) {
    console.log(Conversations.findOne({ _id: id }));
    return "test";
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