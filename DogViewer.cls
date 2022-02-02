public class DogViewer {
  
  @AuraEnabled (cacheable=true)
  public  static String  getAllBreedsList(){
      HttpRequest req = new HttpRequest();
      req.setEndpoint('https://dog.ceo/api/breeds/list');
      req.setMethod('GET');
      
      Http http = new Http();
      HTTPResponse res = http.send(req);
      String responseBody = res.getBody();
      System.debug('response:' + responseBody); 
      return responseBody;
  }

  @AuraEnabled (cacheable=true)
  public  static String  getSubBreedsList(String BreedName){
      HttpRequest req = new HttpRequest();
      req.setEndpoint('https://dog.ceo/api/breed/' +BreedName+ '/list');
      req.setMethod('GET');
      
      Http http = new Http();
      HTTPResponse res = http.send(req);
      String responseBody = res.getBody();
      System.debug('response:' + responseBody); 
      return responseBody;
  }

  @AuraEnabled (cacheable=true)
  public  static String  getBreedImages(String BreedName, String subBreedName){
      HttpRequest req = new HttpRequest();
      String endpoint = 'https://dog.ceo/api/breed/' + BreedName;
      if(String.ISNOTBLANK(subBreedName)){
        endpoint += '/' + subBreedName;
      }
      endpoint += '/images';
      req.setEndpoint(endpoint);
      req.setMethod('GET');
      
      Http http = new Http();
      HTTPResponse res = http.send(req);
      String responseBody = res.getBody();
      System.debug('response:' + responseBody); 
      return responseBody;
  }

  @AuraEnabled
  public  static String  createDogRecord(String imgsrc, String breed, 
    String subBreed, boolean isFav){
    Dog__c dg = new Dog__c();
    try{
      dg = [
        SELECT Id
        FROM Dog__c
        WHERE Image_Link__c = :imgsrc
        LIMIT 1
      ];
    }catch(Exception e){}
    try{
      Dog__c dog = new Dog__c(
        Image_Link__c = imgsrc,
        Breed_Name__c = breed,
        sub_Breed__c = subBreed,
        Added_to_Fav__c = isFav
      );
      if(dg?.Id != NULL){
        dog.Id = dg.Id;
      }
      UPSERT dog;
    }catch(Exception e){
      throw new AuraException(e.getMessage());
    }
    return 'SUCCESS';
  }

  @AuraEnabled (cacheable=true)
  public  static List<Dog__c>  getFavDogList(){
    try{
      return [
        SELECT Id, Image_Link__c, Breed_Name__c, sub_Breed__c
        FROM Dog__c
        WHERE Added_to_Fav__c = true
      ];
    }catch(Exception e){
      throw new AuraException(e.getMessage());
    }
  }

}