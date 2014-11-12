/**
 * Created by spmorgan on 11/10/14.
 */
describe('Unit: CreateCtrl', function() {
    // Load the module with MainController
    beforeEach(module('rpgGame'));
    var ctrl, scope;
    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller('CreateCtrl', {
            $scope: scope
        })
    }))

    describe('my services', function() {
        it('should be one', inject(function () {
            expect(1).toEqual(1);
        }))
        it('should be', inject(function(CharacterService) {
            expect(scope.character).toEqual({});
        }))
        it('should call', inject(function() {
            spyOn(scope, "classChanged");
            scope.classChanged();
            expect(scope.classChanged).toHaveBeenCalled();
        }))
    })
})