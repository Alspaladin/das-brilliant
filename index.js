var mongoConfig = {
	host:"127.0.0.1",
	port:"27017",
	login:"test_user",
	password:"1234",
	database:"crystal"
};

var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary;

var mongoConnect = "mongodb://"+mongoConfig['login']+":"+mongoConfig['password']+"@"+mongoConfig['host']+":"+mongoConfig['port'];

/*var server = new Server(mongoConfig['host'],mongoConfig['port'],{auto_reconnect:true,safe:false});
var db = new Db(mongoConfig['database'],server);

db.open(function(err,dbb){
  if(!err){
var products = dbb.collection("products");
var attributes_values = dbb.collection("attributes_values");
var attributes_keys = dbb.collection("attributes_keys");
var categories = dbb.collection("categories");
var brand = dbb.collection("brands");

dbb.close();
}else console.log(err);
});*/

var mongo = function(callback){

	MongoClient.connect(mongoConnect,callback);
};


var express = require('express');
var app = express();

app.use('/public', express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 80));
app.set('views', './develop/jade');
app.set('view engine', 'jade');

var server = app.listen(app.get('port'), function() {
    console.log('Listening on port %d', server.address().port);
});

app.get('/', function (req, res) {
  res.render('index', { page: 'index' });
})

app.get('/brands', function (req, res) {
  res.render('brands', { page: 'brands' });
})

app.get('/brands/id', function (req, res) {
  res.render('brand', { page: 'brand' });
})

app.get('/team', function (req, res) {
  res.render('team', { page: 'team' });
})

app.get('/contacts', function (req, res) {
  res.render('contacts', { page: 'contacts' });
})



app.get('/products/brands/',function(req, res, next){
     MongoClient.connect(mongoConnect,function(err,db){

      var options = {};

      if(req.query.limit){
        options['limit'] = parseInt(req.query.limit);
      }
      if(req.query.skip){
        options['skip'] = parseInt(req.query.skip);
      }

    var crystal = db.db(mongoConfig['database']);
    var brands = crystal.collection("brands");

    brands.find({},options).toArray(function(err,item){
      res.send(item);
    });

  });
});

app.get('/products/:id',getProduct)
app.get('/products/brand/:id',getProductBrands)
app.get('/find/',getProductSearch)

app.get('/products/image/:id',function(req, res, next){

    MongoClient.connect(mongoConnect,function(err,db){
    if(req.params.id.length != 24){res.redirect("/"); res.end();return;}

    var crystal = db.db(mongoConfig['database']);

    var products = crystal.collection("products");

    products.findOne({"_id" : new ObjectID(req.params.id)}, { image_data: 1,image_name:1 },{safe:true},function(err,item){
      res.writeHead('200', {'Content-Type': 'image/jpeg'});
     res.end(item.image_data.value(),'binary');
    });

  });

})







 function getProduct(req, res, next) {
  //req.params.id;

    MongoClient.connect(mongoConnect,function(err,db){

      if(req.params.id.length != 24){res.redirect("/"); res.end();return;}




    var crystal = db.db(mongoConfig['database']);

    var products = crystal.collection("products");
    var attributes_values = crystal.collection("attributes_values");
    var attributes_keys = crystal.collection("attributes_keys");
    var categories = crystal.collection("categories");
    var brand = crystal.collection("brands");
    var ended = false;    



  
    var prod = products.findOne({"_id" : new ObjectID(req.params.id)}, { _id: 1, brand_id: 1,price:1,name:1,type:1,category_id:1 },function(err,item){
       
       
      item["attributes_values"] = [];


  

      brand.findOne({"_id":new ObjectID(item.brand_id)},{name:1},function(e,brandFind){
            item['brand'] = brandFind.name;

            categories.findOne({"_id":new ObjectID(item.category_id)},{name:1},function(e,cat){
                        item['category'] = cat.name;
                      //
                       
                        var cursor = attributes_values.find({"product_id":new ObjectID(req.params.id)},{name:1,key_id:1},{safe:true});

                        cursor.toArray(function(e,attrs){
                          getProductAttributes(0,item,attrs,attributes_values,attributes_keys,res);
                        });        
            });

      });



    });
   





});


}


function getProductAttributes(count,item,attrs,attributes_values,attributes_keys,res)
{
  var arr = attrs[count];
  attributes_keys.findOne({"_id":new ObjectID(arr['key_id'])},{name:1},{lock:true},function(e,key)
  {
    item["attributes_values"].push({"key":key.name,"value":arr.name});
    if(count == (attrs.length - 1))
    { 
      res.send(item);
    }
    else
    {
      count++;
     getProductAttributes(count,item,attrs,attributes_values,attributes_keys,res); 
    }


  });
}



 function getProductSearch(req, res, next) {
  //req.params.id;
    MongoClient.connect(mongoConnect,function(err,db){




    var crystal = db.db(mongoConfig['database']);

    var products = crystal.collection("products");
    var attributes_values = crystal.collection("attributes_values");
    var attributes_keys = crystal.collection("attributes_keys");
    var categories = crystal.collection("categories");
    var brand = crystal.collection("brands");
    var ended = false;    


      var options = {};

      if(req.query.limit){
        options['limit'] = parseInt(req.query.limit);
      }
      if(req.query.skip){
        options['skip'] = parseInt(req.query.skip);
      }

    var query = new String(req.query.query);
    var resut = {"brands":[],"products":[],"good":0};
    if(query.length >= 2){
    var brandSeach = brand.find({'name':new RegExp(query,'i')}).toArray(function(e,bs){

      var searchParam = [];
      for(var g = 0; g < bs.length;g++) {
        searchParam.push({"brand_id":bs[g]['_id']});
      }
      searchParam.push({"type":new RegExp(query,'i')});
      searchParam.push({"name":new RegExp(query,'i')});
      resut.brands = bs;

      options['lock'] = true;

  
    var prod = products.find({"$or":searchParam}, { _id: 1, brand_id: 1,price:1,name:1,type:1,category_id:1 },options);
    var results = [];

   
      prod.toArray(function(err,items)
      {
          finding(items,resut,brand,attributes_values,attributes_keys,categories,false,res);
    });
   

    }); 

}else{
  res.send(resut);
}




});

}




function getAttributesSearch(count,attrs,item,items,resut,brand,attributes_values,attributes_keys,categories,end,res)
{
  var arr = attrs[count];
  attributes_keys.findOne({"_id":new ObjectID(arr['key_id'])},{name:1},{lock:true},function(e,key)
  {
    item["attributes_values"].push({"key":key.name,"value":arr.name});
    if(count == (attrs.length - 1))
    {
      resut['products'].push(item); 
      if(resut.good == (items.length - 1)){
        res.send(resut);
      }
      else{
          resut.good += 1;
          finding(items,resut,brand,attributes_values,attributes_keys,categories,end,res);
      }
    }
    else
    {
      count++;
     getAttributesSearch(count,attrs,item,items,resut,brand,attributes_values,attributes_keys,categories,end,res); 
    }


  });
}



function finding(items,resut,brand,attributes_values,attributes_keys,categories,end,res)
{
  var item = items[resut.good];
            if(!item['attributes_values']){
                item['attributes_values'] = [];
              }
      brand.findOne({"_id":new ObjectID(item.brand_id)},{name:1},{lock:true},function(e,brandFind)
      {
        item['brand'] = brandFind.name;
        categories.findOne({"_id":new ObjectID(item.category_id)},{name:1},function(e,cat)
        {
          item['category'] = cat.name;
                      
          var cursor = attributes_values.find({"product_id":new ObjectID(item['_id'])},{name:1,key_id:1},{lock:true});
          
          cursor.toArray(function(e,attrs){
            getAttributesSearch(0,attrs,item,items,resut,brand,attributes_values,attributes_keys,categories,end,res);
          });

                     
        });

      });


}

         













 function getProductBrands(req, res, next) {
  //req.params.id;
    MongoClient.connect(mongoConnect,function(err,db){

      if(req.params.id.length != 24){res.redirect("/"); res.end();return;}




    var crystal = db.db(mongoConfig['database']);

    var products = crystal.collection("products");
    var attributes_values = crystal.collection("attributes_values");
    var attributes_keys = crystal.collection("attributes_keys");
    var categories = crystal.collection("categories");
    var brand = crystal.collection("brands");    

      var options = {};

      if(req.query.limit){
        options['limit'] = parseInt(req.query.limit);
      }
      if(req.query.skip){
        options['skip'] = parseInt(req.query.skip);
      }

  
    var prod = products.find({"brand_id" : new ObjectID(req.params.id)}, { _id: 1, brand_id: 1,price:1,name:1,type:1,category_id:1 },options);
    var resut = {"products":[],"good":0};
     prod.toArray(function(err,items)
      {
          finding(items,resut,brand,attributes_values,attributes_keys,categories,false,res);
    });  




});

}