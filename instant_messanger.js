Msgs = new Mongo.Collection("msgs");
Conversations = new Mongo.Collection("conversations");

/* WHY THE FUCK........ FIX THIS SHIT
 - Can message yourself
 - 
*/
      


// METHODS 
// --------------------------------------------------------------------------

Meteor.methods({
  clearHistory: function() {
    Msgs.remove({});
  },
  submitMessage: function(msg, friend) {
    //Make sure message isn't blank and friend is selected
    if (msg.msgText != "" && friend != null) {
      var convo = Conversations.findOne({ friend: friend });
      //Figure out if conversation should be updated or created
      if (convo) {
        convo.messages.push(msg);
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
      friend: friend
    }
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