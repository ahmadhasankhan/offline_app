var myApp = angular.module('myapplication', ['ngRoute', 'ngResource']);

//Factory
myApp.factory('Users', ['$resource', function ($resource) {
    return $resource('/users.json', {}, {
        query: {method: 'GET', isArray: true},
        create: {method: 'POST'}
    })
}]);

myApp.factory('User', ['$resource', function ($resource) {
    return $resource('/users/:id.json', {}, {
        show: {method: 'GET'},
        update: {method: 'PUT', params: {id: '@id'}},
        delete: {method: 'DELETE', params: {id: '@id'}}
    });
}]);

myApp.factory('fetchRemoteUsers', function ($http) {
    return function (callback) {
        $http.get("/users.json")
            .then(function (res) {
                callback && callback(res.data);
            });
    };
});

myApp.factory('localList', function () {
    return {
        "get": function (key) {
            var userString = window.localStorage.getItem(key);
            if (userString) {
                return JSON.parse(userString);
            } else {
                return [];
            }
        },
        "set": function (key, UserList) {
            window.localStorage.setItem(key, JSON.stringify(UserList));
        },
        "delete": function (key, id) {
            var userString = window.localStorage.getItem(key);
            //Remove the item from list
            //window.localStorage.removeItem(key);
            if (userString) {
                return JSON.parse(userString);
            } else {
                return [];
            }
        }
    };
});

//Controller


myApp.controller("UserListCtr", ['$scope', '$http', '$resource', 'Users', 'User', '$location', 'localList', 'fetchRemoteUsers', function ($scope, $http, $resource, Users, User, $location, localList, fetchRemoteUsers) {
    $scope.users = localList.get("users-list");

    $scope.syncData = function () {
        fetchRemoteUsers(function (users) {
            localList.set("users-list", users);
            $scope.users = users;
        });
    };

    $scope.deleteUser = function (userId) {
        if (confirm("Are you sure you want to delete this user?")) {
            //User.delete({id: userId}, function () {
            //    $scope.users = Users.query();
            //    $location.path('/');
            //});

            var usersList = [];
            var usersListString = localStorage.getItem("users-list");
            if (usersListString) {
                usersList = JSON.parse(usersListString);
                //usersList.pop($scope.user);
            }

            localStorage.setItem("users-list", JSON.stringify(usersList));
            $location.path('/');

        }
    };
}]);

myApp.controller("UserUpdateCtr", ['$scope', '$resource', 'User', '$location', '$routeParams', function ($scope, $resource, User, $location, $routeParams) {
    $scope.user = User.get({id: $routeParams.id})
    $scope.update = function () {
        if ($scope.userForm.$valid) {
            User.update({id: $scope.user.id}, {user: $scope.user}, function () {
                $location.path('/');
            }, function (error) {
                console.log(error)
            });
        }
    };

    $scope.addAddress = function () {
        $scope.user.addresses.push({street1: '', street2: '', city: '', state: '', country: '', zipcode: ''})
    };

    $scope.removeAddress = function (index, user) {
        var address = user.addresses[index];
        if (address.id) {
            address._destroy = true;
        } else {
            user.addresses.splice(index, 1);
        }
    };

}]);

myApp.controller("UserAddCtr", ['$scope', '$resource', 'Users', '$location', function ($scope, $resource, Users, $location) {
    $scope.user = {addresses: [{street1: '', street2: '', city: '', state: '', country: '', zipcode: ''}]};
    $scope.save = function () {
        if ($scope.userForm.$valid) {
            //if (!$scope.online) {
            //    Users.create({user: $scope.user}, function () {
            //        $location.path('/');
            //    }, function (error) {
            //        console.log(error)
            //    });
            //} else {
            //    var usersList = [];
            //    var usersListString = localStorage.getItem("users-list");
            //    if (usersListString) {
            //        usersList = JSON.parse(usersListString);
            //    }
            //    usersList.push($scope.user);
            //    localStorage.setItem("users-list", JSON.stringify(usersList));
            //    $location.path('/');
            //}

            var usersList = [];
            var usersListString = localStorage.getItem("users-list");
            if (usersListString) {
                usersList = JSON.parse(usersListString);
            }
            usersList.push($scope.user);
            localStorage.setItem("users-list", JSON.stringify(usersList));
            $location.path('/');

        }
    };

    $scope.addAddress = function () {
        $scope.user.addresses.push({street1: '', street2: '', city: '', state: '', country: '', zipcode: ''})
    };

    $scope.removeAddress = function (index, user) {
        var address = user.addresses[index];
        if (address.id) {
            address._destroy = true;
        } else {
            user.addresses.splice(index, 1);
        }
    };

}]);


//Check internet connection
myApp.run(function ($window, $rootScope) {
    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function () {
            $rootScope.online = false;
        });
    }, false);

    $window.addEventListener("online", function () {
        $rootScope.$apply(function () {
            $rootScope.online = true;
        });
    }, false);
});

//Routes
myApp.config([
    '$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when('/users', {
            templateUrl: '/templates/users/index.html',
            controller: 'UserListCtr'
        });
        $routeProvider.when('/users/new', {
            templateUrl: '/templates/users/new.html',
            controller: 'UserAddCtr'
        });
        $routeProvider.when('/users/:id/edit', {
            templateUrl: '/templates/users/edit.html',
            controller: "UserUpdateCtr"
        });
        $routeProvider.otherwise({
            redirectTo: '/users'
        });
    }
]);



