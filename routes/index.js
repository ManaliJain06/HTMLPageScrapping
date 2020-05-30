var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var mongo = require("./mongoConnector");
var mongodb = require('mongodb');
var mongoLogin = "mongodb://localhost:27017";

router.get('/', function(req, res) {
  res.render('index', { title: 'HTML Page Scrape' });
});

router.post('/scrapePage', function(req, res, next){
    var url = req.body.url;
    console.log(url);

    //https://ndb.nal.usda.gov/ndb/search/list
    request(url, function(err, response, html){
        if(err){
            console.log(err);
        } else{
            var $ = cheerio.load(html);
            var NDBNo, description, manufacturer;
            // var json = { NDBNo : "", description : "", manufacturer : ""};
            var scrappedData = [];
            // var table = $('.table-bordered').DataTable();
            // var table = $('.list-left');

            // var x = table.children();

            // var t = x.rows().data();
            $('.odd').filter(function(){
                var data = $(this);
                NDBNo = data.children().eq(1).children().text();
                description = data.children().eq(2).children().text();
                manufacturer = data.children().eq(3).children().text();

                var json = {
                    "NDBNo" : NDBNo.trim(),
                    "description" : description.trim(),
                    "manufacturer" : manufacturer.trim()
                };
                scrappedData.push(json);
            });

            $('.even').filter(function(){
                var data = $(this);
                NDBNo = data.children().eq(1).children().text();
                description = data.children().eq(2).children().text();
                manufacturer = data.children().eq(3).children().text();

                var json = {
                    "NDBNo" : NDBNo.trim(),
                    "description" : description.trim(),
                    "manufacturer" : manufacturer.trim()
                };
                scrappedData.push(json);
            });

            mongo.connect(mongoLogin, function() {
                var collection = mongo.collections('FoodDetails');
                collection.insert(scrappedData, function (err, result) {
                    if (result) {
                        res.send({"response": "OK"});
                    } else {
                        res.send({"response": "ERROR"});
                    }
                });
            });
        }
    })
});
module.exports = router;
