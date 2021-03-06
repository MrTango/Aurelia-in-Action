import {bindable, inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'lodash';

@inject(EventAggregator)
export class EditBook{
    
    @bindable editMode;
    @bindable book;
    @bindable selectedGenre;
    @bindable genres;
    @bindable shelves;
    temporaryBook = {};

    constructor(eventAggregator ){
        this.eventAggregator = eventAggregator;
        this.ratingChangedListener =  e => this.temporaryBook.rating = e.detail.rating;
        this.editingShelves = false;
        this.saved = false;
    }

    bind(){
        this.resetTempBook();
        this.ratingElement.addEventListener("change", this.ratingChangedListener);
        this.selectedShelves = this.shelves.filter(shelf => this.temporaryBook.shelves.indexOf(shelf) !== -1);
        this.selectedGenre = this.genres.find(g => g.id == this.book.genre);
    }

    selectedGenreChanged(newValue, oldValue){
        if(!newValue) return;
        this.temporaryBook.genre = newValue.id;
    }

    attached(){
        this.bookSaveCompleteSubscription = 
            this.eventAggregator
            .subscribe(`book-save-complete-${this.book.Id}`, 
                        () =>  this.bookSaveComplete());
    }

    editModeChanged(editModeNew, editModeOld){
        if(editModeNew) this.resetTempBook();
    }

    @computedFrom('temporaryBook.title', 
                  'temporaryBook.description', 
                  'temporaryBook.rating', 
                  'temporaryBook.ownACopy', 
                  'temporaryBook.genre', 
                  'saved', 
                  'temporaryBook.shelves',
                  'temporaryBook.timesRead')
    get canSave(){
        if(!this.temporaryBook.Id) return false;
        
        return this.isDirty();
    }

    isDirty(){
     
        let differences = [];
        _.forIn(this.temporaryBook, (value, key) => {
            return differences.push({different : this.book[key] != value, key : key} );
        });

        return differences.filter(d => d.different).length > 0;
    }

    resetTempBook(){
        Object.assign(this.temporaryBook, this.book);
    }

    cancel(){
        let book = Object.assign(new Book(), this.book);
        this.temporaryBook = book;
        this.starRatingViewModel.applyRating(this.temporaryBook.rating);
        this.toggleEditMode();
    }
    
    save(){
        this.loading = true;
        this.publishBookSavedEvent();
    }

    toggleEditShelves(){
        this.editingShelves = !this.editingShelves;
    }

    unToggleEditShelves(){
        this.temporaryBook.shelves = this.selectedShelves;
        this.editingShelves = !this.editingShelves;
    }

    bookSaveComplete(){
        this.loading = false;
        this.saved = true;

        setTimeout(() => {
           this.resetTempBook();
           this.saved = false;
           this.toggleEditMode();  
        }, 500);  
    }

    publishBookSavedEvent(){
        this.eventAggregator.publish('save-book', this.temporaryBook);
    }

    toggleEditMode(){
        this.saved = false;
        this.eventAggregator.publish('edit-mode-changed', !this.editMode );
    }

    detached(){
        this.ratingElement.removeEventListener('change', this.ratingChangedListener);
        this.bookSaveCompleteSubscription.dispose();
    }
}