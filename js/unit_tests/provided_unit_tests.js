'use strict';

var expect = chai.expect;
var modelModule = createModelModule();

describe('Provided unit tests', function() {
    it('Test listener fired when new image added to ImageCollectionModel', function() {
        var imageCollectionModel = new modelModule.ImageCollectionModel();
        var imageModel = new modelModule.ImageModel("image/GOPR0074-small.jpg", new Date("09/02/2015"), "GOPR0074-small", 0);
        var listener = sinon.spy();

        imageCollectionModel.addListener(listener);

        imageCollectionModel.addImageModel(imageModel);

        expect(listener.callCount, 'ImageCollectionModel listener should be called').to.equal(1);
    });

    it('Test listener fired when image removed from ImageCollectionModel', function() {
        var imageCollectionModel = new modelModule.ImageCollectionModel();
        var imageModel = new modelModule.ImageModel("image/GOPR0074-small.jpg", new Date("09/02/2015"), "GOPR0074-small", 0);
        var listener = sinon.spy();

        imageCollectionModel.addListener(listener);

        imageCollectionModel.addImageModel(imageModel);
        imageCollectionModel.removeImageModel(imageModel);

        expect(listener.callCount, 'ImageCollectionModel listener should be called twice (once for add once for remove)').to.equal(2);
        expect(listener.args[1][0] == modelModule.IMAGE_REMOVED_FROM_COLLECTION_EVENT, 'ImageCollectionModel listener second call should be IMAGE_REMOVED_FROM_COLLECTION_EVENT').to.be.true;
    });

    it('Test meta-data changed listener fired when ImageModel meta-data changes', function() {
        var imageModel = new modelModule.ImageModel("image/GOPR0074-small.jpg", new Date("09/02/2015"), "GOPR0074-small", 0);
        var listener = sinon.spy();

        imageModel.addListener(listener);

        imageModel.setRating(5);
        imageModel.setCaption("This is a better caption.");

        expect(listener.callCount, 'ImageModel listener should be called twice (once for rating once for caption)').to.equal(2);
    });

    it('Test ImageCollection listener fired when ImageModel attached to it has meta-data change', function() {
        var imageCollectionModel = new modelModule.ImageCollectionModel();
        var imageModel = new modelModule.ImageModel("image/GOPR0074-small.jpg", new Date("09/02/2015"), "GOPR0074-small", 0);
        var listener = sinon.spy();

        imageCollectionModel.addImageModel(imageModel);
        imageCollectionModel.addListener(listener);

        imageModel.setRating(5);
        imageModel.setCaption("This is a better caption.");

        expect(listener.callCount, 'ImageCollectionModel listener should be called twice (once for rating once for caption)').to.equal(2);
    });

    it('Test ImageCollection listener should NOT fire when ImageModel was added but later removed (tests un-register listeners in ImageModel for ImageModelCollection)', function() {
        var imageCollectionModel = new modelModule.ImageCollectionModel();
        var imageModel = new modelModule.ImageModel("image/GOPR0074-small.jpg", new Date("09/02/2015"), "GOPR0074-small", 0);
        var listener = sinon.spy();

        imageCollectionModel.addImageModel(imageModel);
        imageCollectionModel.addListener(listener);
        imageCollectionModel.removeImageModel(imageModel);

        imageModel.setRating(5);
        imageModel.setCaption("This is a better caption.");

        expect(listener.callCount, 'ImageCollectionModel listener should not be called when ImageModel meta-data changed. One call is for the removeImageModel').to.equal(1);
    });
});
