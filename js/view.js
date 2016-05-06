'use strict';

/**
 * A function that creates and returns all of the model classes and constants.
  */
function createViewModule() {

    var LIST_VIEW = 'LIST_VIEW';
    var GRID_VIEW = 'GRID_VIEW';
    var RATING_CHANGE = 'RATING_CHANGE';

    // We need to re-define these constants here, they are used in the views and there is no way to nicely get them from model.js.
    var IMAGE_ADDED_TO_COLLECTION_EVENT = 'IMAGE_ADDED_TO_COLLECTION_EVENT';
    var IMAGE_REMOVED_FROM_COLLECTION_EVENT = 'IMAGE_REMOVED_FROM_COLLECTION_EVENT';
    var IMAGE_META_DATA_CHANGED_EVENT = 'IMAGE_META_DATA_CHANGED_EVENT';

    var RatingStar = function(counter, imageModel) {
        this.counter = counter;
        this.imageModel = imageModel;
        this._init();
    };

    _.extend(RatingStar.prototype, {
        _init: function() {
            this.ratingDiv = document.createElement('div');
            var ratingTemplate = document.getElementById('ratingTemplate');
            this.ratingDiv.appendChild(document.importNode(ratingTemplate.content, true));
            var ratingRadios = this.ratingDiv.getElementsByClassName('rating-input');
            var ratingLabels = this.ratingDiv.getElementsByClassName('rating-star');
            for(var i = 0; i < ratingRadios.length; i++) {
                ratingRadios[i].setAttribute("data-count", this.counter);
                ratingRadios[i].id = "rating-" + this.counter + i;
                ratingRadios[i].name = "rating-" + this.counter;
                ratingLabels[i].setAttribute('for', "rating-" + this.counter + i);
                if(parseInt(ratingRadios[i].value) == this.imageModel.getRating()) {
                    ratingRadios[i].setAttribute("checked", "true");
                }
            }
        },

        getElement: function() {
            return this.ratingDiv;
        },

        getImageModel: function() {
            return this.imageModel;
        }
    });

    /**
     * SHOULD ONLY BE ONE!
     * Generate rating stars for image models
     */
    var RatingStarFactory = function() {
        this.counter = 0;
        this.ratingStars = [];
    };

    _.extend(RatingStarFactory.prototype, {
        createRatingStars: function(imageModel) {
            var newStars = new RatingStar(this.counter, imageModel);
            this.ratingStars.push(newStars);
            this.counter = this.counter + 1;
            return newStars;
        },

        getRatingStars: function() {
            return this.ratingStars;
        }
    });

    // We need to create this factory to use in our image model view
    var ratingFactory = new RatingStarFactory();

    /**
     * An object representing a DOM element that will render the given ImageModel object.
     */
    var ImageRenderer = function(imageModel) {
        // Default view type will be GRID_VIEW
        this.viewType = GRID_VIEW;

        // Set ImageModel
        this.imageModel = imageModel;
    };

    _.extend(ImageRenderer.prototype, {

        /**
         * Returns an element representing the ImageModel, which can be attached to the DOM
         * to display the ImageModel.
         */
        getElement: function() {
            var listItem = document.createElement("div");
            var filterVal = 0;
            var filterRadios = document.getElementsByClassName('rating-filter')[0].getElementsByClassName('rating-input');
            for(var i = 0; i < filterRadios.length; i++) {
                if(filterRadios[i].checked) {
                    filterVal = parseInt(filterRadios[i].value);
                }
            }
            if(filterVal == 0 || this.imageModel.getRating() == filterVal) {

                listItem.getElementsByClassName
                var imageModelTemplate = document.getElementById('imageModelTemplate');
                var imageModelNode = document.importNode(imageModelTemplate.content, true);
                listItem.appendChild(imageModelNode);
                listItem.getElementsByClassName("image")[0].src = this.imageModel.getPath();
                listItem.getElementsByClassName("caption")[0].innerHTML = this.imageModel.getCaption();
                listItem.getElementsByClassName("dateModified")[0].innerHTML = this.imageModel.getModificationDate().toLocaleString().split(",")[0];
                listItem.getElementsByClassName("rating")[0].appendChild(ratingFactory.createRatingStars(this.getImageModel()).getElement());
            }
            return listItem;
        },

        /**
         * Returns the ImageModel represented by this ImageRenderer.
         */
        getImageModel: function() {
            return this.imageModel;
        },

        /**
         * Sets the ImageModel represented by this ImageRenderer, changing the element and its
         * contents as necessary.
         */
        setImageModel: function(imageModel) {
            this.imageModel = imageModel;
        },

        /**
         * Changes the rendering of the ImageModel to either list or grid view.
         * @param viewType A string, either LIST_VIEW or GRID_VIEW
         */
        setToView: function(viewType) {
            if(!_.isString(viewType) || viewType != LIST_VIEW && viewType != GRID_VIEW) {
                throw new Error("Incorrect argument in ImageRenderer.setToView");
            }
            this.viewType = viewType;
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type it is
         * currently rendering.
         */
        getCurrentView: function() {
            return this.viewType;
        }
    });

    /**
     * A factory is an object that creates other objects. In this case, this object will create
     * objects that fulfill the ImageRenderer class's contract defined above.
     */
    var ImageRendererFactory = function() {
    };

    _.extend(ImageRendererFactory.prototype, {

        /**
         * Creates a new ImageRenderer object for the given ImageModel
         */
        createImageRenderer: function(imageModel) {
            return new ImageRenderer(imageModel);
        }
    });

    /**
     * An object representing a DOM element that will render an ImageCollectionModel.
     * Multiple such objects can be created and added to the DOM (i.e., you shouldn't
     * assume there is only one ImageCollectionView that will ever be created).
     */
    var ImageCollectionView = function() {
        this.currentView = GRID_VIEW; // Default is GRID_VIEW
        this.imageRendererFactory = new ImageRendererFactory();
        this.imageRenderers = [];
        this.imageCollectionModel;
        var self = this;
        this.imageCollectionModelListener = function(eventType, imageModelCollection, imageModel, eventDate) {
            if(eventType == IMAGE_ADDED_TO_COLLECTION_EVENT) {
                // push a new renderer
                self.imageRenderers.push(self.imageRendererFactory.createImageRenderer(imageModel));
            } else if(eventType == IMAGE_REMOVED_FROM_COLLECTION_EVENT) {
                // Remove first renderer representing this image model which has been removed from collection
                var found = false;
                _.each(this.imageRenderers, function(imageRenderer) {
                    if(!found && imageRenderer.getImageModel() == imageModel) {
                        self.imageRenderers = _.without(imageRenderer);
                        found = true;
                    }
                });
            }
        };
    };

    _.extend(ImageCollectionView.prototype, {
        /**
         * Returns an element that can be attached to the DOM to display the ImageCollectionModel
         * this object represents.
         */
        getElement: function() {
            var container = document.createElement("div");
            if(this.getCurrentView() == GRID_VIEW) {
                container.classList.add("grid");
            } else if(this.getCurrentView() == LIST_VIEW) {
                container.classList.add("list");
            }
            _.each(this.imageRenderers, function(imageRenderer) {
                container.appendChild(imageRenderer.getElement());
            });
            return container;
        },

        /**
         * Gets the current ImageRendererFactory being used to create new ImageRenderer objects.
         */
        getImageRendererFactory: function() {
            return this.imageRendererFactory;
        },

        /**
         * Sets the ImageRendererFactory to use to render ImageModels. When a *new* factory is provided,
         * the ImageCollectionView should redo its entire presentation, replacing all of the old
         * ImageRenderer objects with new ImageRenderer objects produced by the factory.
         */
        setImageRendererFactory: function(imageRendererFactory) {
            if(this.imageRendererFactory == imageRendererFactory) {
                // This is not a new factory, return.
                return;
            }

            // Set new factory
            this.imageRendererFactory = imageRendererFactory;

            // Reset image renderers array
            this.imageRenderers = [];

            // Push new renderers
            var self = this;
            _.each(this.getImageCollectionModel().getImageModels(), function(imageModels) {
                self.imageRenderers.push(self.imageRendererFactory.createImageRenderer(imageModel));
            });
        },

        /**
         * Returns the ImageCollectionModel represented by this view.
         */
        getImageCollectionModel: function() {
            return this.imageCollectionModel;
        },

        /**
         * Sets the ImageCollectionModel to be represented by this view. When setting the ImageCollectionModel,
         * you should properly register/unregister listeners with the model, so you will be notified of
         * any changes to the given model.
         */
        setImageCollectionModel: function(imageCollectionModel) {
            // Unregister listener with image collection model, if it does exist.
            if(this.imageCollectionModel != undefined) {
                this.imageCollectionModel.removeListener(this.imageCollectionModelListener);
            }

            // Reset image renderers array
            this.imageRenderers = [];

            // Push new renderers
            var self = this;
            _.each(imageCollectionModel.getImageModels(), function(imageModel) {
                self.imageRenderers.push(self.imageRendererFactory.createImageRenderer(imageModel));
            });

            // Register listener with new model
            this.imageCollectionModel = imageCollectionModel;
            this.imageCollectionModel.addListener(this.imageCollectionModelListener);
        },

        /**
         * Changes the presentation of the images to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW.
         */
        setToView: function(viewType) {
            // Validate input
            if(!_.isString(viewType) || viewType != LIST_VIEW && viewType != GRID_VIEW) {
                throw new Error("Error in ImageCollectionView.setToView: incorrect arguments " + JSON.stringify(arguments));
            }

            // Set view of image collection view
            this.currentView = viewType;

            // We must also set view of all our renderers
            _.each(this.imageRenderers, function(imageRenderer) {
                imageRenderer.setToView(viewType);
            });
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type is currently
         * being rendered.
         */
        getCurrentView: function() {
            return this.currentView;
        }
    });

    /**
     * An object representing a DOM element that will render the toolbar to the screen.
     */
    var Toolbar = function() {
        this.currentView = GRID_VIEW;
        this.ratingFilter = 0;
        this.listeners = [];
        this._init();
    };

    _.extend(Toolbar.prototype, {
        _init: function() {
            var self = this;
            this.toolbarDiv = document.createElement('div');
            this.toolbarDiv.classList.add("toolbar");
            var toolbarTemplate = document.getElementById('toolbar');
            this.toolbarDiv.appendChild(document.importNode(toolbarTemplate.content, true));
        },

        /**
         * Returns an element representing the toolbar, which can be attached to the DOM.
         */
        getElement: function() {
            return this.toolbarDiv;
        }
        ,

        /**
         * Registers the given listener to be notified when the toolbar changes from one
         * view type to another.
         * @param listener_fn A function with signature (toolbar, eventType, eventDate), where
         *                    toolbar is a reference to this object, eventType is a string of
         *                    either, LIST_VIEW, GRID_VIEW, or RATING_CHANGE representing how
         *                    the toolbar has changed (specifically, the user has switched to
         *                    a list view, grid view, or changed the star rating filter).
         *                    eventDate is a Date object representing when the event occurred.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to Toolbar.addListener: " + JSON.stringify(arguments));
            }
            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from the toolbar.
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to Toolbar.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        },

        /**
         * Sets the toolbar to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW representing the desired view.
         */
        setToView: function(viewType) {
            // Validate input
            if(!_.isString(viewType) || viewType != LIST_VIEW && viewType != GRID_VIEW) {
                throw new Error("Invalid arguments to Toolbar.setToView: " + JSON.stringify(arguments));
            }

            // Set view
            this.currentView = viewType;

            // Notify listeners
            var self = this;
            var eventDate = new Date();
            _.each(this.listeners, function(listener_fn) {
                listener_fn(self, viewType, eventDate);
            });
        },

        /**
         * Returns the current view selected in the toolbar, a string that is
         * either LIST_VIEW or GRID_VIEW.
         */
        getCurrentView: function() {
            return this.currentView;
        },

        /**
         * Returns the current rating filter. A number in the range [0,5], where 0 indicates no
         * filtering should take place.
         */
        getCurrentRatingFilter: function() {
            return this.ratingFilter;
        },

        /**
         * Sets the rating filter.
         * @param rating An integer in the range [0,5], where 0 indicates no filtering should take place.
         */
        setRatingFilter: function(rating) {
            // Check if input is correct
            if(!_.isFinite(rating) || rating < 0 || rating > 5) {
                throw new Error("Error in Toolbar.setRatingFilter: filter must be an integer between 0 and 5.");
            }

            // Set new rating filter
            this.ratingFilter = rating;

            // Notify Listeners
            var self = this;
            var eventDate = new Date();
            _.each(this.listeners, function(listener_fn) {
                listener_fn(self, RATING_CHANGE, eventDate);
            });
        }
    });

    /**
     * An object that will allow the user to choose images to display.
     * @constructor
     */
    var FileChooser = function() {
        this.listeners = [];
        this._init();
    };

    _.extend(FileChooser.prototype, {
        // This code partially derived from: http://www.html5rocks.com/en/tutorials/file/dndfiles/
        _init: function() {
            var self = this;
            this.fileChooserDiv = document.createElement('div');
            var fileChooserTemplate = document.getElementById('file-chooser');
            this.fileChooserDiv.appendChild(document.importNode(fileChooserTemplate.content, true));
            var fileChooserInput = this.fileChooserDiv.querySelector('.files-input');
            fileChooserInput.addEventListener('change', function(evt) {
                var files = evt.target.files;
                var eventDate = new Date();
                _.each(
                    self.listeners,
                    function(listener_fn) {
                        listener_fn(self, files, eventDate);
                    }
                );
            });
        },

        /**
         * Returns an element that can be added to the DOM to display the file chooser.
         */
        getElement: function() {
            return this.fileChooserDiv;
        },

        /**
         * Adds a listener to be notified when a new set of files have been chosen.
         * @param listener_fn A function with signature (fileChooser, fileList, eventDate), where
         *                    fileChooser is a reference to this object, fileList is a list of files
         *                    as returned by the File API, and eventDate is when the files were chosen.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.addListener: " + JSON.stringify(arguments));
            }
            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from this object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        }
    });

    /*
     * An object that will allow to create a large 'popup' display of input picture
     * @param pathToFile The relative path to the image. A string.
     */
    var ImagePopup = function(pathToFile) {
        if (!(_.isString(pathToFile))) {
            throw new Error("Invalid arguments supplied to ImagePopup: " + JSON.stringify(arguments));
        }
        this.path = pathToFile;
        this._init();
    };

    _.extend(ImagePopup.prototype, {
        _init: function() {
            this.popupDiv = document.createElement('div');
            var popupTemplate = document.getElementById('popupTemplate');
            this.popupDiv.appendChild(document.importNode(popupTemplate.content, true));
            this.popupDiv.getElementsByClassName("popupImage")[0].src = this.path;
            var self = this;
            this.popupDiv.getElementsByClassName("popupExit")[0].addEventListener('click', function() {
                self.destroy();
            });
            this.popupDiv.classList.add("imagePopup");
        },

        /**
         * Returns an element that can be added to the DOM to display the popup.
         */
        getElement: function() {
            return this.popupDiv;
        },

        /**
         * Destroy this object
         */
        destroy: function() {
            document.body.removeChild(this.getElement());
            delete this;
        }
    });

    // Return an object containing all of our classes and constants
    return {
        ImageRenderer: ImageRenderer,
        ImageRendererFactory: ImageRendererFactory,
        ImageCollectionView: ImageCollectionView,
        ImagePopup: ImagePopup,
        Toolbar: Toolbar,
        FileChooser: FileChooser,

        RatingStar: RatingStar,

        ratingFactory: ratingFactory,

        LIST_VIEW: LIST_VIEW,
        GRID_VIEW: GRID_VIEW,
        RATING_CHANGE: RATING_CHANGE
    };
}