'use strict';

// This should be your main point of entry for your app

window.addEventListener('load', function() {
    var modelModule = createModelModule();
    var viewModule = createViewModule();
    var appContainer = document.getElementById('app-container');
    var imgContainer = document.createElement('div');
    imgContainer.id = "img-container";
    var imageCollectionModel = modelModule.loadImageCollectionModel();
    var imageCollectionView = new viewModule.ImageCollectionView();
    var popup;
    imageCollectionView.setImageCollectionModel(imageCollectionModel);

    // Attach toolbar to page
    var toolbar = new viewModule.Toolbar();
    var toolbarElem = toolbar.getElement();
    toolbar.addListener(function(toolbarRef, eventType, eventDate) {
        if(eventType == viewModule.LIST_VIEW || eventType == viewModule.GRID_VIEW) {
            imageCollectionView.setToView(eventType);
            document.getElementById("img-container").innerHTML = imageCollectionView.getElement().outerHTML;
        } else {
            // It is rating filter
            document.getElementById("img-container").innerHTML = imageCollectionView.getElement().outerHTML;
            var images = document.querySelectorAll("img");
            for(var i = 0; i < images.length; i++) {
                images[i].addEventListener('click', function(event) {
                    popup = new viewModule.ImagePopup(event.target.src.toString());
                    document.body.appendChild(popup.getElement());
                });
            }
            var ratingStars = document.getElementsByClassName('rating-input');
            for (var i = 0; i < ratingStars.length; i++) {
                ratingStars[i].addEventListener('click', function (event) {
                    viewModule.ratingFactory.getRatingStars()[event.target.getAttribute("data-count")].getImageModel().setRating(parseInt(event.target.value));
                });
            }
        }
    });
    toolbarElem.getElementsByClassName('icon-list')[0].addEventListener('click', function() {
        if(toolbar.getCurrentView() != viewModule.LIST_VIEW) {
            toolbarElem.getElementsByClassName('active')[0].classList.remove('active');
            this.classList.add('active');
            toolbar.setToView(viewModule.LIST_VIEW);
        }
    });
    toolbarElem.getElementsByClassName('icon-table2')[0].addEventListener('click', function() {
        if(toolbar.getCurrentView() != viewModule.GRID_VIEW) {
            toolbarElem.getElementsByClassName('active')[0].classList.remove('active');
            this.classList.add('active');
            toolbar.setToView(viewModule.GRID_VIEW);
        }
    });
    appContainer.appendChild(toolbarElem);

    // We need a spacer after the toolbar to push down other content
    var spacer = document.createElement("div");
    spacer.classList.add("spacer");
    appContainer.appendChild(spacer);

    // Append on the container to our actual image list/grid
    appContainer.appendChild(imgContainer);

    // Attach the file chooser to the page. You can choose to put this elsewhere, and style as desired
    var fileChooser = new viewModule.FileChooser();
    toolbarElem.getElementsByClassName('file-chooser-container')[0].appendChild(fileChooser.getElement());

    // Demo that we can choose files and save to local storage. This can be replaced, later
    fileChooser.addListener(function(fileChooser, files, eventDate) {
        _.each(
            files,
            function(file) {
                imageCollectionModel.addImageModel(
                    new modelModule.ImageModel(
                        'images/' + file.name,
                        file.lastModifiedDate,
                        file.name,
                        0
                    ));
            }
        );
    });

    // Need to do an initial load when page loads. The change listener isn't wired up yet.
    document.getElementById("img-container").innerHTML = imageCollectionView.getElement().outerHTML;
    var images = document.querySelectorAll("img");
    for(var i = 0; i < images.length; i++) {
        images[i].addEventListener('click', function(event) {
            popup = new viewModule.ImagePopup(event.target.src.toString());
            document.body.appendChild(popup.getElement());
        });
    }
    var ratingStars = document.getElementsByClassName('rating-input');
    for (var i = 0; i < ratingStars.length; i++) {
        ratingStars[i].addEventListener('click', function (event) {
            viewModule.ratingFactory.getRatingStars()[event.target.getAttribute("data-count")].getImageModel().setRating(parseInt(event.target.value));
        });
    }

    // Any change in the collection model we repaint and re-save data. This should account for everything, rating, caption, addition, subtraction, etc.
    imageCollectionModel.addListener(function(eventType, imageModelCollection, imageModel, eventDate) {
        document.getElementById("img-container").innerHTML = imageCollectionView.getElement().outerHTML;
        modelModule.storeImageCollectionModel(imageCollectionModel);
        var images = document.querySelectorAll("img");
        for(var i = 0; i < images.length; i++) {
            images[i].addEventListener('click', function(event) {
                popup = new viewModule.ImagePopup(event.target.src.toString());
                document.body.appendChild(popup.getElement());
            });
        }
        var ratingStars = document.getElementsByClassName('rating-input');
        for (var i = 0; i < ratingStars.length; i++) {
            ratingStars[i].addEventListener('click', function (event) {
                viewModule.ratingFactory.getRatingStars()[event.target.getAttribute("data-count")].getImageModel().setRating(parseInt(event.target.value));
            });
        }
    });
});