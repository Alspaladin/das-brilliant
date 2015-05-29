
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

app.use('/public', express.static(__dirname + '/public'));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.set('port', (process.env.PORT || 5000));
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

app.get('/brands/:id', function (req, res) {
  res.render('brand', { page: 'brand', id: req.params.id });
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














