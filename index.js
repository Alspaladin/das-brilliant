var express = require('express');
var app = express();

app.use('/public', express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 5000))
app.set('views', './develop/jade');
app.set('view engine', 'jade');

var server = app.listen(app.get('port'), function() {
    console.log('Listening on port %d', server.address().port);
});

app.get('/', function (req, res) {
  res.render('index', { page: 'index' });
})

app.get('/team', function (req, res) {
  res.render('team', { page: 'team' });
})

app.get('/contacts', function (req, res) {
  res.render('contacts', { page: 'contacts' });
})