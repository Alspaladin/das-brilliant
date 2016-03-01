var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    config = require('./config.js');

var mongo = function(callback){
	MongoClient.connect(config.mongo_connect, callback);
};

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

var email   = require("emailjs/email");
var EmailServer  = email.server.connect({
   user:    "sendered@yandex.ru", 
   password:"qweadfD!$gt54Da!", 
   host:    "smtp.yandex.com",
   ssl:     true
});

//app.use('/public', express.static('/Users/alsold/work/das-brilliant/public'));
app.use('/public', express.static(config.app_dir));

app.set('port', (process.env.PORT || 80));
//app.set('views', '/Users/alsold/work/das-brilliant/develop/jade');
app.set('views', config.jade_dir);
app.set('view engine', 'jade');



var server = app.listen(app.get('port'), function() {
    console.log('Listening on port %d', server.address().port);
});


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.get('/', function (req, res) {
  res.render('index', { page: 'index' });
})

app.get('/brands', function (req, res) {
  res.render('brands', { page: 'brands' });
})

app.get('/brands/:id', function (req, res) {
  res.render('brand', { page: 'brand', id: req.params.id });
})

app.get('/brands/:brand_id/categories', function(req, res){
    return getProductCategories(req, function(err, data){
        console.log(err, data);
        if(err){
            res.redirect("/");
            res.end();
            return;
        }
        res.render('categories', { page: 'categories', categories: data, brand_id: req.params.brand_id });
    });  
});

app.get('/brands/:brand_id/category/:id', function (req, res) {
  res.render('category', { page: 'category', id: req.params.id, brand_id: req.params.brand_id });
})

app.get('/team', function (req, res) {
  res.render('team', { page: 'team' });
})

app.get('/contacts', function (req, res) {
  res.render('contacts', { page: 'contacts' });
})

app.post('/order/send', function (req, res) {




var params = req.body;
var text = "Новый заказ! <br><br><br>";
text += "Имя: "+params.name+"<br>";
text += "E-mail: "+params.email+"<br>";
text += "Телефон: "+params.phone+"<br>";
text += "Адрес: "+params.adress+"<br>";
text += "<br><br><br> Товары:";

var i = 0;
var price = 0;
for(i; i< params.products.length; i++){
  price += parseInt(params.products[i].col) * parseInt(params.products[i].price)
  text +=  params.products[i].category+" - "+params.products[i].name+" "+params.products[i].col+" шт. <br>"
}
text += "<br><br><br>Общая стоимость:"+price.toFixed(2)+" Руб.";

text = "<html><head></head><body>"+text+"</body></html>";

var message = {
   "text":    text, 
   from:    "Sender <sendered@yandex.ru>", 
   to:      "someone <alexandersvinin@gmail.com>, another <alexandersvinin@gmail.com>",
   subject: "Новый заказ на "+price.toFixed(2)+"руб",
   "MIME-Version": "1.0",
    "Organization": "dasbrilliant",
    "Content-Type": "text/html",
};


// send the message and get a callback with an error or details of the message that was sent
EmailServer.send(message, function(err, message) { });

res.json({"result":true});

})

app.get('/products/brands/',function(req, res, next){
     MongoClient.connect(config.mongo_connect,function(err,db){

      var options = {};

      if(req.query.limit){
        options['limit'] = parseInt(req.query.limit);
      }
      if(req.query.skip){
        options['skip'] = parseInt(req.query.skip);
      }

    var crystal = db.db(config.mongo_config['database']);
    var brands = crystal.collection("brands");

    brands.find({},options).toArray(function(err,item){
      	db.close();
	res.send(item);
    });

  });
});

app.get('/products/:id',getProduct)
app.get('/products/brand/:id',getProductBrands)
app.get('/products/brand/:brand_id/category/:id',getProductCategory)
app.get('/products/brand/:brand_id/categories', function(req, res){
    getProductCategories(req, function(err, data){
        if(err){
            return res.end(err);
        }
        res.send({categories: data, brand_id: req.params.brand_id });
    });
})
app.get('/find/',getProductSearch)

app.get('/products/image/:id',function(req, res, next){
    MongoClient.connect(config.mongo_connect,function(err,db){
    if(req.params.id.length != 24){res.redirect("/"); res.end();return;}

    var crystal = db.db(config.mongo_config['database']);

    var products = crystal.collection("products");

    products.findOne({"_id" : new ObjectID(req.params.id)}, { image_data: 1,image_name:1 },{safe:true},function(err,item){
      db.close();
	res.writeHead('200', {'Content-Type': 'image/jpeg'});
     res.end(item.image_data.value(),'binary');
    });

  });

})







 function getProduct(req, res, next) {
  //req.params.id;

    MongoClient.connect(config.mongo_connect,function(err,db){

      if(req.params.id.length != 24){res.redirect("/"); res.end();return;}




    var crystal = db.db(config.mongo_config['database']);

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
                          getProductAttributes(0,item,attrs,attributes_values,attributes_keys,res,db);
                        });        
            });

      });



    });
   





});


}


function getProductAttributes(count,item,attrs,attributes_values,attributes_keys,res,db)
{
  var arr = attrs[count];
  attributes_keys.findOne({"_id":new ObjectID(arr['key_id'])},{name:1},{lock:true},function(e,key)
  {
    item["attributes_values"].push({"key":key.name,"value":arr.name});
    if(count == (attrs.length - 1))
    { 
	db.close();
      res.send(item);
    }
    else
    {
      count++;
     getProductAttributes(count,item,attrs,attributes_values,attributes_keys,res,db); 
    }


  });
}



 function getProductSearch(req, res, next) {
  //req.params.id;
    MongoClient.connect(config.mongo_connect,function(err,db){




    var crystal = db.db(config.mongo_config['database']);

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
          finding(items,resut,brand,attributes_values,attributes_keys,categories,false,res,db);
    });
   

    }); 

}else{
db.close();
  res.send(resut);
}




});

}




function getAttributesSearch(count,attrs,item,items,resut,brand,attributes_values,attributes_keys,categories,end,res,db)
{
  var arr = attrs[count];
  attributes_keys.findOne({"_id":new ObjectID(arr['key_id'])},{name:1},{lock:true},function(e,key)
  {
    item["attributes_values"].push({"key":key.name,"value":arr.name});
    if(count == (attrs.length - 1))
    {
      resut['products'].push(item); 
      if(resut.good == (items.length - 1)){
	db.close();
        res.send(resut);
      }
      else{
          resut.good += 1;
          finding(items,resut,brand,attributes_values,attributes_keys,categories,end,res,db);
      }
    }
    else
    {
      count++;
     getAttributesSearch(count,attrs,item,items,resut,brand,attributes_values,attributes_keys,categories,end,res,db); 
    }


  });
}



function finding(items,resut,brand,attributes_values,attributes_keys,categories,end,res,db)
{
  var item = items[resut.good];
            if(!item['attributes_values']){
                item['attributes_values'] = [];
              }
      brand.findOne({"_id":new ObjectID(item.brand_id)},{name:1},{lock:true},function(e,brandFind)
      {
	if(brandFind) item['brand'] = brandFind.name;
        categories.findOne({"_id":new ObjectID(item.category_id)},{name:1},function(e,cat)
        {
          item['category'] = cat.name;
                      
          var cursor = attributes_values.find({"product_id":new ObjectID(item['_id'])},{name:1,key_id:1},{lock:true});
          
          cursor.toArray(function(e,attrs){
            getAttributesSearch(0,attrs,item,items,resut,brand,attributes_values,attributes_keys,categories,end,res,db);
          });

                     
        });

      });


}

         







 function getProductCategories(req, done) {
  //req.params.id;
    MongoClient.connect(config.mongo_connect,function(err,db){
        if(err){
            done(err);
        }

        if(req.params.brand_id.length != 24){
            done('wrong id type');
        }

        var crystal = db.db(config.mongo_config['database']);

        var products = crystal.collection("products");
        var categories = crystal.collection("categories");
        var brand = crystal.collection("brands");    

        var options = {};

        if(req.query.limit){
            options['limit'] = parseInt(req.query.limit);
        }
        if(req.query.skip){
            options['skip'] = parseInt(req.query.skip);
        }

        var prod = products.find({"brand_id" : new ObjectID(req.params.brand_id)}, { category_id:1 }, options);
        var category_ids = [];
        prod.toArray(function(err, items){
            if(items.length < 0){
                db.close();
                return done(err);
            }
            items.map(function(item){
                category_ids.push(new ObjectID(item.category_id));
            })
            categories.find({_id: {$in: category_ids}},{id:1, name:1},function(e,cat_data){
                cat_data.toArray(function(err, data){
                    if(!data){
                        return done(err);
                    }
                    db.close();
                    return done(null, data);
                })
            });
        }) 
    });
 }
 function getProductCategory(req, res, next){
  //req.params.id;
    MongoClient.connect(config.mongo_connect,function(err,db){
        if(err){
            res.end(null, err);
        }

        if(req.params.brand_id.length != 24){res.redirect("/"); res.end();return;}

        var crystal = db.db(config.mongo_config['database']);
        var attributes_values = crystal.collection("attributes_values");
        var attributes_keys = crystal.collection("attributes_keys");
        var products = crystal.collection("products");
        var categories = crystal.collection("categories");
        var brand = crystal.collection("brands");    

        var options = {};

        if(req.query.limit){
            options['limit'] = parseInt(req.query.limit);
        }
        if(req.query.skip){
            options['skip'] = parseInt(req.query.skip);
        }
        var prod = products.find({
            "brand_id" : new ObjectID(req.params.brand_id),
            "category_id": new ObjectID(req.params.id)},
            {}, options);
            
        prod.toArray(function(err, items){
            if(!items){
                res.redirect("/");
                res.end();
                return;
            }
            var resut = {"products":[],"good":0};
            finding(items,resut,brand,attributes_values,attributes_keys,categories,false,res,db);
        }) 
    });
 }

 function getProductBrands(req, res, next) {
  //req.params.id;
    MongoClient.connect(config.mongo_connect,function(err,db){

      if(req.params.id.length != 24){res.redirect("/"); res.end();return;}




    var crystal = db.db(config.mongo_config['database']);

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
          finding(items,resut,brand,attributes_values,attributes_keys,categories,false,res,db);
    });  




});

}
