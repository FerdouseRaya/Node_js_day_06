const fs = require ('fs');
const fsPromise = require('fs').promises;
const path = require('path');
const { success } = require('../util/common');
const { constants } = require('http2');

const file = path.join(__dirname,'..','data','products.json');
const file1 = path.join(__dirname,'..','data','manga.js');
const logFile = path.join(__dirname, 'log', 'log.txt');
class Queries{
    // getAll function
    async getAll(){
         return fsPromise
        .readFile(file, {encoding:'utf-8'})
        .then((data)=>{
             return {success: true,data: data};
        })
        .catch((error)=>{
             return {success:false};
        })
    } ;
    
    //addItem

    async addItem(Product){

          const data = await fsPromise.readFile(file, { encoding: 'utf-8' });    
             
          const Data =JSON.parse(data);
          const addedData = {...Product,id: Product.id};
          const errors = [];

          const checkTitle = value => typeof value === 'string' && value.trim() !== '';
          const isPositiveNum = value =>Number.isFinite(value) && value>0;
          const checkPrice = value =>Number.isFinite(value) && value>=200 && value<=2000;
          const checkRating = value => Number.isFinite(value) && value >=0 && value<=5;
 
          const validationRules = [
               { attribute: 'id', message: 'ID is required!' },
               { attribute: 'title', message: 'Title is required and cannot be blank.',validate:checkTitle },
               { attribute: 'price', message: 'Price must be a positive number.', validate: isPositiveNum }, 
               { attribute: 'price', message: 'Price should be in between 200 to 2000.', validate: checkPrice },              
               { attribute: 'rating', message: 'Rating must be a number between 0 and 5.', validate: checkRating },
           ];

           for(const validity of validationRules){
               const {attribute,message, validate} = validity;
               const value = addedData[attribute];
               if (!value) {
                    errors.push(message);
                } else if (validate && !validate(value)) {
                    errors.push(message);
                }
           }
           if (errors.length > 0) {
               const errorMessage = errors.join('  ');
               return { success: false, errors: errorMessage };
           }

          Data.push(addedData);
          const stringifyData =JSON.stringify(Data)

          return fsPromise
          .writeFile(file,stringifyData)
          .then(()=>{
               return {success: true};
          })
          .catch((error)=>{
               return {success:false};
          })

    }//end of addItem function

    
// getItemByID
    async getItemById(id){
     return fsPromise
     .readFile(file, {encoding:'utf-8'})
     .then((data)=>{
          const parsedData = JSON.parse(data);
          const findItem = parsedData.filter((item) => item.id == id);
          if(findItem.length==0){
               return {success:false}
          }
          else{

               const itemIndex = parsedData.findIndex((item) => item.id == id)
               const val=parsedData[itemIndex];
               return { success:true, data:val};
          }
     })
     .catch((error)=>{
          return {success:false};
     })
    }

    //updateById
    async updateById(id, product) {     
     return fsPromise
     .readFile(file, {encoding:'utf-8'})
     .then((data)=>{
          const parsedData = JSON.parse(data);
          const productParsed = JSON.parse(product);          
          const findItem = parsedData.filter((item) => item.id != id);
          if(findItem.length==parsedData.length){
               return {success:false};
          }
          else{
               // if(!productParsed.id){
               //      return {success: false};
               // }
               const errors = [];

               const checkTitle = value => typeof value === 'string' && value.trim() !== '';
               const isPositiveNum = value =>Number.isFinite(value) && value>0;
               const checkPrice = value =>Number.isFinite(value) && value>=200 && value<=2000;
               const checkRating = value => Number.isFinite(value) && value >=0 && value<=5;
      
               const validationRules = [
                    { attribute: 'id', message: 'ID is required!' },
                    { attribute: 'title', message: 'Title is required and cannot be blank.',validate:checkTitle },
                    { attribute: 'price', message: 'Price must be a positive number.', validate: isPositiveNum }, 
                    { attribute: 'price', message: 'Price should be in between 200 to 2000.', validate: checkPrice },              
                    { attribute: 'rating', message: 'Rating must be a number between 0 and 5.', validate: checkRating },
                ];
     
                for(const validity of validationRules){
                    const {attribute,message, validate} = validity;
                    const value = pr[attribute];
                    if (!value) {
                         errors.push(message);
                     } else if (validate && !validate(value)) {
                         errors.push(message);
                     }
                }
                if (errors.length > 0) {
                    const errorMessage = errors.join('  ');
                    return { success: false, errors: errorMessage };
                }
               const itemIndex = parsedData.findIndex((item) => item.id == id)          
               parsedData[itemIndex]={...parsedData[itemIndex],...productParsed};

               const stringifyData = JSON.stringify(parsedData);
               return fsPromise
               .writeFile(file, stringifyData)
               .then(()=>{
                    return { success: true };
               })
               .catch((error)=>{
                    return { success: false };
                    }) 
          }
     })
     .catch((error)=>{
          return {success:false};
     })
     }

    //deleteByID   
 
    async deleteById(id){
          try {
              const data = await fsPromise.readFile(file, { encoding: 'utf-8' });
              const parsedData = JSON.parse(data);
 
              const updatedItem = parsedData.filter(item => item.id != id);
      
              if (updatedItem.length === parsedData.length) {
                  return { success: false};
              }
      
              const stringifyData = JSON.stringify(updatedItem);
      
              await fsPromise.writeFile(file, stringifyData);
      
              return { success: true};
          } catch (error) {
              return { success: false};
          }
         
    }

    //Delete All
    async deleteAll(){
          try{

               const data = await fsPromise.readFile(file, { encoding: 'utf-8' });
               const parsedData = JSON.parse(data);
       
               if (parsedData.length === 0) {
                    return {success:false};
               }

               const emptyString =[];
               const stringifyEmpty = JSON.stringify(emptyString);
               return fsPromise
               .writeFile(file, stringifyEmpty)
               .then(()=>{
                    return { success: true };
               })
               .catch((error)=>{
                    return { success: false };
                    }) 

          }catch(error){
               return {success:false};
          }
    }
   
 

 
}

module.exports = new Queries();