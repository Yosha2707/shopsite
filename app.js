var express = require('express');
const app = express()
const engine = require('ejs-locals');
const path = require('path')
const bodyParser = require('body-parser');
const request = require('request')
const fetch = require('node-fetch')




//var Permissions = require('./helper/permissions.js');

const oneDay = 86400000
app.use(express.static(path.join(__dirname, '/public'), {
    maxage: oneDay
}));




app.engine('ejs', engine);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json()); // support json encoded bodies
//set static path



var groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };


app.get('/', async function (req, res, next) {
    const response = await fetch("https://starapps-js-test.myshopify.com/products/product_1.json", {
        method: "get"
    })

    const messageData = await response.json();

    // the API frequently returns 201
    if ((response.status !== 200) && (response.status !== 201)) {
        console.error(`Invalid response status ${ response.status }.`);
        throw messageData;
    }

    var finalOutPut = {
        option1: []
    };

    var groubedByOption1=groupBy(messageData.product.variants, 'option1')
    var keysOption1 = Object.keys(groubedByOption1);

    var men = []
    var women = [];
    keysOption1.forEach(element => {
        finalOutPut.option1.push({
            name: "Fit Type",
            value: element,
            option2: []
        })
        if(element == "Men"){
            men = groupBy(groubedByOption1[element], 'option2')
        }else{
            women = groupBy(groubedByOption1[element], 'option2')
        }
    });

    keyoption2Men = Object.keys(men);
    keyoption2Women = Object.keys(women);

    var MenSize = []

    keyoption2Men.forEach((element, index) => {
        finalOutPut.option1[0].option2.push({
            name: "Color",
            value: element,
            option3: []
        })
        MenSize = groupBy(men[element], 'option3')
        var keys = Object.keys(MenSize);
        keys.forEach(elementS => {
            finalOutPut.option1[0].option2[index].option3.push({
                name: "size",
                value: elementS
            }) 
        });
    });

    var WoMenSize = []
    keyoption2Women.forEach((element, index) => {
        finalOutPut.option1[1].option2.push({
            name: "Color",
            value: element,
            option3: []
        })
        WoMenSize = groupBy(women[element], 'option3')
        var keys = Object.keys(WoMenSize);
        keys.forEach(elementS => {
            finalOutPut.option1[1].option2[index].option3.push({
                name: "size",
                value: elementS
            }) 
        });
    });

    console.log(JSON.stringify(finalOutPut))

    res.render('index', {
        'options': messageData.product.options,
        'variants': messageData.product.variants,
        'image': messageData.product.images,
        'result': messageData
    })
})



app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    //res.render('error');
    res.status(500).render('error');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))