import { LightningElement, track, api, wire } from 'lwc';
import getAllBreedsList from '@salesforce/apex/DogViewer.getAllBreedsList';
import getSubBreedsList from '@salesforce/apex/DogViewer.getSubBreedsList';
import getBreedImages from '@salesforce/apex/DogViewer.getBreedImages';
import createDogRecord from '@salesforce/apex/DogViewer.createDogRecord';
import getFavDogList from '@salesforce/apex/DogViewer.getFavDogList';

import { refreshApex } from '@salesforce/apex';

import FAV_LOGO from '@salesforce/resourceUrl/favicon';
export default class Dog_Viewer extends LightningElement {
    
    @track Dogdata = [];
    @track error;
    @track images = [];
    @track name;
    dogBreedList = [];
    dogSubBreedList = [];
    selectedDogBreed = '';
    selectedDogsubBreed = '';
    subBreedFound = false;
    favIcon = FAV_LOGO;
    @track favImageList = [];
    @track favImageListAll = [];

    @wire(getAllBreedsList)
    wiredDogeList({ error, data }) {
        if (data) {
            console.log('data', data);
            var result = JSON.parse(data);
            console.log('result', result);
            this.dogBreedList = result.message;
            console.log('data', this.dogBreedList);
        } else if (error) {
            this.error = error;
            this.Dogdata = undefined;
        }
    }

    @wire(getFavDogList)
    getAllFavDogList(result) {
        this.favImageListAll = result;
        if (result.data) {
            this.favImageList = result.data;
        } else if (result.error) {
            this.error = result.error;
        }
    }

    get options() {
        var tempoption = [];
        for(var i =0; i< this.dogBreedList.length; i++){
            var item = new Object();
            item.label =  this.dogBreedList[i];
            item.value =  this.dogBreedList[i];
            tempoption.push(item);
        }
        return tempoption;
    }

    get subBreedoptions() {
        var tempoption = [];
        for(var i =0; i< this.dogSubBreedList.length; i++){
            var item = new Object();
            item.label =  this.dogSubBreedList[i];
            item.value =  this.dogSubBreedList[i];
            tempoption.push(item);
        }
        return tempoption;
    }

    handleDogBreedSelection(event){
        this.selectedDogBreed = event.detail.value;
        this.selectedDogsubBreed = '';
        this.images = [];
        console.log('selectedDogBreed', this.selectedDogBreed);
        getSubBreedsList({BreedName: this.selectedDogBreed})
            .then(result => {
                console.log('data', result);
                var subresult = JSON.parse(result);
                console.log('result', subresult);
                this.dogSubBreedList = subresult.message;
                console.log('data', this.dogSubBreedList);
                if(subresult.message.length > 0){
                    this.subBreedFound = true;
                }else{
                    this.subBreedFound = false;
                }
            })
            .catch(error => {
                this.error = error;
            });
    }

    handleDogSubBreedSelection(event){
        this.selectedDogsubBreed = event.detail.value;
        console.log('selectedDogBreed', this.selectedDogsubBreed);
    }

    handleGetDogs(event){
        console.log('OUTPUT : ',this.selectedDogBreed, this.selectedDogsubBreed);
        getBreedImages({BreedName: this.selectedDogBreed, subBreedName: this.selectedDogsubBreed})
            .then(result => {
                console.log('data', result);
                var subresult = JSON.parse(result);
                console.log('result', subresult);
                this.images = subresult.message;
            })
            .catch(error => {
                console.log('OUTPUT : ', this.error);
                this.error = error;
            });
    }

    imageArr = [];
    handleAddtoFav(event){
        console.log(event.currentTarget.dataset.id);
        /*
        var item = new Object;
        item.src = this.images[event.currentTarget.dataset.id];
        item.dogBreed = this.selectedDogBreed;
        item.dogsubBreed = this.selectedDogsubBreed;
        
        if(!this.imageArr.includes(item.src)){
            this.favImageList.push(item);
            this.imageArr.push(item.src);
        }
        console.log('favImageList : ', this.favImageList);
        */
        createDogRecord({
                imgsrc: this.images[event.currentTarget.dataset.id],
                breed: this.selectedDogBreed,
                subBreed: this.selectedDogsubBreed,
                isFav: true
            })
            .then(result => {
                console.log('data', result);
                refreshApex(this.favImageListAll);
            })
            .catch(error => {
                this.error = error;
            });
    }

    handleFavClick(event){
        console.log(event.currentTarget.dataset.id);
        /*
        var item = new Object;
        item.src = this.images[event.currentTarget.dataset.id];
        item.dogBreed = this.selectedDogBreed;
        item.dogsubBreed = this.selectedDogsubBreed;
        
        if(!this.imageArr.includes(item.src)){
            this.favImageList.push(item);
            this.imageArr.push(item.src);
        }
        console.log('favImageList : ', this.favImageList);
        */
        createDogRecord({
                imgsrc: this.favImageList[event.currentTarget.dataset.id].Image_Link__c,
                breed: this.favImageList[event.currentTarget.dataset.id].Breed_Name__c,
                subBreed: this.favImageList[event.currentTarget.dataset.id].sub_Breed__c,
                isFav: false
            })
            .then(result => {
                console.log('data', result);
                refreshApex(this.favImageListAll);
            })
            .catch(error => {
                this.error = error;
            });
    }
}