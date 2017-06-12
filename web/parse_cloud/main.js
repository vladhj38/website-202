Parse.Cloud.define('getUserRole', function(request, response){
  
  if(!Parse.User.current()){
    response.error('Request did not have an authenticated user attached with it');
  }

  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("objectId", Parse.User.current().id);
  userQuery.include("role");
  userQuery.find({
    success: function(user)
    {
      if(userRetrieved[0]){
        response.success({role: user.get("role").get("name")});
      }
    },
    error: function(error)
    {
      response.error('Request failed: ' + JSON.stringify(error,null,2));
    }
  });
});

Parse.Cloud.define('hasRole', function(request, response){
  if(!Parse.User.current()){
    response.error('Request did not have an authenticated user attached with it');
  }
  else {
    userHasRole(request.params.parseSessionToken, request.params.role)
      .then(function(hasRole){
        response.success({hasRole: hasRole});
      },
      function(error){
        console.error('Request failed: ' + JSON.stringify(error,null,2));
        response.error('Request failed: ' + JSON.stringify(error,null,2));
      });
  }
});

var userHasRole = function(username, rolename) {
  Parse.Cloud.useMasterKey();
  var queryRole = new Parse.Query(Parse.Role);
  queryRole.equalTo('name', rolename);
  return queryRole.first({useMasterKey:true})
    .then(function(roleObject){
      var queryForUsername = roleObject.relation('users').query();
      queryForUsername.equalTo('username', username)
      return queryForUsername.first({useMasterKey:true})
        .then(function(userObject){
          if(userObject){
            console.log(username + ' has role: ' + rolename);
            return Parse.Promise.as(true);
          }
          else{
            console.log(username + ' does not have role: ' + rolename);
            return Parse.Promise.as(false);
          }
        });
    });
}