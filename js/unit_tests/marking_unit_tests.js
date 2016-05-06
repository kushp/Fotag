'use strict';

var expect = chai.expect;

// This file will be overwritten at marking time with our own tests, so
// don't use this for anything
describe('Marking Unit Tests', function() {
  describe('Model Module', function() {

    var modelModule;

    beforeEach(function() {
      modelModule = createModelModule();
    });

    afterEach(function() {
      modelModule = null;
    })

    describe('ImageModel', function() {

      var imageModel;
      var date = new Date();
      var path = 'images/GOPR0042-small.jpg';
      var listener_fn;

      beforeEach(function() {
        imageModel = new modelModule.ImageModel(
          path,
          date,
          '',
          0);
        listener_fn = sinon.spy();
      });

      it('should set and get caption and rating correctly', function() {
        imageModel.setCaption('example caption');
        expect(imageModel.getCaption()).to.eql('example caption');
        imageModel.setRating(2);
        expect(imageModel.getRating()).to.eql(2);
      });

      it('should be able to add a listener and the listener should be notified when the model gets changed', function() {
        imageModel.addListener(listener_fn);
        imageModel.setRating(1);
        expect(listener_fn.calledOnce, 
          'listener_fn should have been called exactly once for notification of rating change').to.be.true;
        expect(listener_fn.calledWith(imageModel, sinon.match.any), 
          'listener_fn should have been called with the first argument being imageModel').to.be.true;
        imageModel.setCaption("example caption");
        expect(listener_fn.calledTwice,
          'listener_fn should have been called twice by now').to.be.true;
      });

      it('should not notify the listener when model does not get changed', function() {
        imageModel.addListener(listener_fn);
        imageModel.setRating(1);
        imageModel.setRating(1);
        expect(listener_fn.calledOnce,
          'listener_fn should have been called exactly once for notification of rating change').to.be.true;
      });

      it('should not notify the listener when it gets removed', function() {
        imageModel.addListener(listener_fn);
        imageModel.removeListener(listener_fn);
        imageModel.setRating(3);
        expect(listener_fn.notCalled, 
          'a removed listener_fn should not be called when the model gets changed').to.be.true;
      });

      it('should return the path and modification date when corresponding functions get called', function() {
        expect(imageModel.getPath()).to.eql(path);
        expect(imageModel.getModificationDate()).to.eql(date);
      });
    });

    describe('ImageCollectionModel', function() {

      var imageCollectionModel = null; 
      var imageModel = null;
      var listener_fn = null;

      beforeEach(function() {
        var date = new Date();
        var path = 'images/GOPR0042-small.jpg';
        imageCollectionModel = new modelModule.ImageCollectionModel();
        imageModel = new modelModule.ImageModel(
          path,
          date,
          '',
          0);
        listener_fn = sinon.spy();
      });

      afterEach(function() {
        imageCollectionModel = null;
        imageModel = null;
        listener_fn = null;
      });

      it('should be able to add a listener and the listener should get notified with proper arguments when an imageModel is added', function() {
        imageCollectionModel.addListener(listener_fn);
        imageCollectionModel.addImageModel(imageModel);
        expect(listener_fn.calledOnce, 
          'listener_fn should have been called exactly once').to.be.true;
        expect(listener_fn.calledWith(
          modelModule.IMAGE_ADDED_TO_COLLECTION_EVENT, imageCollectionModel, imageModel, sinon.match.any),
          'listener_fn should have been called with proper arguments').to.be.true;
      });


      it('should be able to add a listener and the listener should get notified with proper arguments when an imageModel is changed', function() {
        imageCollectionModel.addImageModel(imageModel);
        imageCollectionModel.addListener(listener_fn);
        imageModel.setRating(1);
        expect(listener_fn.calledOnce, 
          'listener_fn should have been called exactly once').to.be.true;
        expect(listener_fn.calledWith(
          modelModule.IMAGE_META_DATA_CHANGED_EVENT, imageCollectionModel, imageModel, sinon.match.any),
          'listener_fn should have been called with proper arguments').to.be.true;
        imageModel.setCaption('something else');
        expect(listener_fn.calledTwice, 
          'listener_fn should have been called twice by now').to.be.true;
        expect(listener_fn.calledWith(
          modelModule.IMAGE_META_DATA_CHANGED_EVENT, imageCollectionModel, imageModel, sinon.match.any),
          'listener_fn should have been called with proper arguments').to.be.true;
      });

      it('should be able to add a listener and the listener should get notified with proper arguments when an imageModel is removed', function() {
        imageCollectionModel.addImageModel(imageModel);
        imageCollectionModel.addListener(listener_fn);
        imageCollectionModel.removeImageModel(imageModel);
        expect(listener_fn.calledOnce, 
          'listener_fn should have been called exactly once').to.be.true;
        expect(listener_fn.calledWith(
          modelModule.IMAGE_REMOVED_FROM_COLLECTION_EVENT, imageCollectionModel, imageModel, sinon.match.any),
          'listener_fn should have been called with proper arguments').to.be.true;
        imageModel.setCaption('something else');
        expect(listener_fn.calledOnce, 
          'listener_fn should still have been called exactly once').to.be.true;
      });

      it('should not notify a listener when it gets removed', function() {
        imageCollectionModel.addImageModel(imageModel);
        imageCollectionModel.addListener(listener_fn);
        imageCollectionModel.removeListener(listener_fn);
        imageModel.setCaption('something else');
        imageCollectionModel.removeImageModel(imageModel);
        expect(listener_fn.notCalled, 
          'listener_fn should have not been called').to.be.true;
      });

      it('should be able to acquire all the image models stored inside', function() {
        var models = [];
        for (var i = 0; i < 5; ++i) {
          var model = new modelModule.ImageModel(
            'path/to/image_' + i, 
            new Date(),
            'caption_' + i,
            i);
          models.push(model);
          imageCollectionModel.addImageModel(model);
          expect(models).to.eql(imageCollectionModel.getImageModels());
        }
      });
    });
  });

});
