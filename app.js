/**
 * Created by spmorgan on 11/10/14.
 */

(function() {
    var app = angular.module('rpgGame' , ['ngCookies', 'ngResource', 'ngRoute', 'ngMockE2E']);
    app.constant('EVENTS', {
        STATS_ROLLED: "stats_event"
    });

    app.value('CharacterService', {
    });

    app.factory('RPGRestServices', function($resource) {
        return {
            monsterResource: $resource('http://localhost:8081/api/monsters/:id', {
                id: "@id"
            })
        }
    })
    app.service('CharacterService', function() {
        //var this = {}
        this.character = {};
        this.rollStats = function () {
            var characterStats = [
                {name: 'str', value: Math.floor(Math.random()*18) + 3},
                {name: 'int', value: Math.floor(Math.random()*18) + 3},
                {name: 'wis', value: Math.floor(Math.random()*18) + 3}
            ];
            this.character.stats = characterStats;
        }
        //return this;
    });

    app.provider('MonsterFactory', function() {
        var level = 1;
        return {
            $get: function () {
                return function (myName) {
                    return {
                        name: myName,
                        hitPoints: Math.floor(Math.random() * 20) * level
                    }
                }
            },
            setLevel: function(newLevel) {
                level = newLevel;
            }
        }
    });

    //app.run(function() {
        //$httpBackend.when('GET', 'api/weapons')
        //    .respond([{name: "sword"}, {name: "bow"}]);
        //$httpBackend.whenGET(/.*/).passThrough();
    //})

    app.config(function($routeProvider, MonsterFactoryProvider,
                         $locationProvider) {

        $routeProvider.when('/', {
            templateUrl: "templates/_createCharacter.html",
            controller: "CreateCtrl"
            //resolve: {
            //    monsterList: monsterResource.query();
            //}
        })
            .when('/admin', {
                templateUrl: "templates/_admin.html",
                controller: "AdminCtrl",
                resolve: {
                    monsterList: function(RPGRestServices) {
                       return RPGRestServices.monsterResource.query().$promise;
                    }
                }
            })
            .otherwise(
            {
                redirectTo: "/"
            }
        );

        //$locationProvider.html5Mode(true);

        MonsterFactoryProvider.setLevel(10);
    })

    app.factory("GoogleAPIs", function ($http, $q) {
        return {
            getImage: function (characterClass) {
                var deferred = $q.defer();

                $http.jsonp('https://ajax.googleapis.com/ajax/services/search/images', {
                    params: {
                        v: "1.0",
                        q: characterClass,
                        callback: "JSON_CALLBACK"
                    }
                }).success(function (arrayOfImages) {
                    deferred.resolve(arrayOfImages.responseData.results[0].url)
                }).error(function (data, status) {
                    deferred.reject(status);
                });

                return deferred.promise;
            }
    }
    })
    app.controller('CreateCtrl', function($scope,
                                          EVENTS,
                                          CharacterService,
                                          $timeout, $rootScope, $cookieStore,
                                          MonsterFactory,
                                          GoogleAPIs) {
        $scope.troll = MonsterFactory("Troll");
        //$scope.troll.name = $filter('uppercase')($scope.troll.name);
        console.log($scope.troll);
        $scope.currentStep = 1;
        console.log(CharacterService.character);

        if ($cookieStore.get('character')) {
            CharacterService.character = $cookieStore.get('character');
            console.log(CharacterService.character, $scope.character);
        }
        $scope.character = CharacterService.character;

        var classList = [
            'Warrior',
            'Thief',
            'Mage'
        ];
        $scope.classList = classList;
        
        $scope.createCharacter = function () {
            $scope.characterCreated = true;
            $cookieStore.put('character', $scope.character);
            //$scope.character.stats = characterStats;
        }

        $scope.classChanged = function () {
            GoogleAPIs.getImage($scope.character.class)
                .then(
                    function (url) {
                        $scope.classImageUrl = url;
                    },
                    function (data, status) {
                    console.log('Error: ' + data + ":" + status);
                    }
            )

            console.log($scope.character.class);
        }

        $scope.$on(EVENTS.STATS_ROLLED, function (event, stats) {
            $scope.currentStep = $scope.currentStep+1;
            console.log(stats);
            $scope.character.stats = stats;
        })
    })
    app.controller('StatCtrl', function (CharacterService) {
        //var this = {};
        this.characterService = CharacterService;
        //return this;
        //$scope.rollStats = function () {
        //   CharacterService.rollStats();
        //}
    })

    app.controller('AdminCtrl', function($scope, RPGRestServices, $routeParams,
                                         $location, monsterList, $http){
        $http.get('api/weapons')
            .success(function(data) {
                console.log(data);
                $scope.weapons = data;
            })
            .error(function(data, status) {
                console.log(data, status);
            })


        console.log($routeParams.subScreen, $location.url());
        $scope.monsterList = monsterList;

        $scope.editMonster = function (monster) {
            $scope.monsterToEdit = RPGRestServices.monsterResource.get({id: monster.id});
        }

        $scope.saveMonster = function () {
            console.log('save');
            $scope.monsterToEdit.$save();
        }

        $scope.boxChanged = function () {
            console.log($scope.superPowerful);
        }
    })

})()