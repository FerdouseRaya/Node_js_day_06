const http = require ('http');
const path = require ('path');
const fs = require('fs');
const url = require('url');
const Queries = require('./Queries');
const { success, failure } = require('./util/common'); 
const { json } = require('stream/consumers');

const server = http.createServer(function(req,res){
    const getQueryParams =() =>{
        const params = new URLSearchParams(req.url.split('?')[1]);
        const queryParams = {};
        for(const param of params){
            queryParams[param[0]]=param[1];
        }
        return queryParams;
    }
    
    let body ='';
    req.on('data',(buffer) =>{
        body += buffer;
    });
    req.on('end', async() =>{
        res.setHeader('content-Type','application/json');

        const requestedURL = req.url.split('?')[0];
        if(requestedURL === '/products/get' && req.method === 'GET'){
                const getAll = await Queries.getAll();
                if(getAll.success){
                    const fetchData = JSON.parse(getAll.data);
                    res.writeHead(200);
                    res.write(success('Great! All product fetched!', fetchData));
                    res.end();
                }
                else{
                    res.writeHead(400);
                    res.write(failure('No Item found!')); 
                    res.end();
                }

        }
        //Add Item
        else if (requestedURL === '/products/add' && req.method === 'POST') {
            try {
                const data_body = JSON.parse(body);
                const addItemResult = await Queries.addItem(data_body);
                if (addItemResult.success) {
                    const item = data_body;
                   // console.log('Added Item:', item);
                    res.writeHead(200);
                    res.write(success('Great!Item Added',item));
                    res.end();
                } else {
                    res.writeHead(400);
                    res.write(failure(addItemResult.errors));
                    res.end();
                }
            } catch (error) {
                res.writeHead(500);
                res.write(failure('Server error...'));
                res.end();
            }
        }
        //Get Element By ID
        else if (requestedURL === '/products/getItem' && req.method === 'GET') {
            const queryParams = getQueryParams();
            const itemID = queryParams.id;                    
            if (itemID) {
        
                const ItemResult = await Queries.getItemById(itemID);              
                if (ItemResult.success) {  

                    res.writeHead(200);
                    res.write(success('Item fetched Successfully!', ItemResult));
                    res.end();
                } else {
                    res.writeHead(404);
                    res.write(failure('Item not Found!'));
                    return res.end();
                }    
            }
            else{
                res.writeHead(400);
                res.write(failure('ID parameter is required.'));
                return res.end();
            }     
        }

        //Delete Item by ID
        else if (requestedURL === '/products/deleteItem' && req.method === 'DELETE') {
            const queryParams = getQueryParams();
            const itemID = queryParams.id;        
            try {
                const deleteItemResult = await Queries.deleteById(itemID);
                if (deleteItemResult.success) {
                    res.writeHead(200);
                    res.write(success('Item deleted successfully!'));
                    res.end();
                } else {
                    res.writeHead(404);
                    res.write(failure('Item not found.'));
                    res.end();
                }
            } catch (error) {
                res.writeHead(500);
                res.write(failure('Server error...'));
                res.end();
            }
        }

        //Update By ID
        else if (requestedURL === '/products/update' && req.method === 'POST') {
            const logFilePath = path.join(__dirname, 'log', 'log.txt');

            const queryParams = getQueryParams();
            const itemID = queryParams.id;
            //const data_body = JSON.parse(body);
            const updateItemResult = await Queries.updateById(itemID, body);
            if (updateItemResult.success) {  
                function writeLog(message) {
                    const logMessage = `${message}\n`;
                    fs.appendFileSync(logFilePath, logMessage, 'utf-8');
                }
                const logMessage = `(Updated) Time: [${new Date().toISOString()}][${new Date()}]`;
                writeLog(logMessage);
                res.writeHead(200);
                res.write(success('Item updated successfully!'));
                res.end();
            } else {
                if (updateItemResult.errors && updateItemResult.errors.length > 0) {
                    res.writeHead(400);
                    res.write(failure(updateItemResult.errors));
                    res.end();
                } else {
                    res.writeHead(400);
                    res.write(failure('Item not found!'));
                    res.end();
                }
            }
            
        }
        else if(requestedURL === '/products/deleteAll' && req.method === 'DELETE')
        {
            const deleteAll = await Queries.deleteAll();
            if(deleteAll.success){
                res.writeHead(200);
                res.write(success('Deleted All item Successfully!'));
                res.end();
            }
            else{
                res.writeHead(400);
                res.write(failure('The file is already empty')); 
                res.end();
            }

        }
    
        else{
                res.writeHead(500);
                res.write(failure('Wrong URL')); 
                return res.end();  
        }
    });
})

server.listen(8000,()=>{
    console.log('Server is running on 8000...');
})