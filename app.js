const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const port = 3000;
const app = express();

const user = 'todolist-app';
const pass = 'pass01';

// Database config 
const database = 'todolistDB';
// const dbServerURL = 'mongodb://localhost:27017/';

const dbServerURL = 'mongodb+srv://'+user+':'+pass+'@cluster0-w36vy.mongodb.net/'+database;
mongoose.connect(dbServerURL + database, {useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); 
app.set('view engine', 'ejs');

const itemSchema = new mongoose.Schema({
    name: String, 
    });
const Item = mongoose.model('Item', itemSchema);
 
var item1 = new Item({
    name: "Cook food"
});
var item2 = new Item({
    name: "Eat food"
});

var defaultItems = [item1,item2];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
const List = mongoose.model('List', listSchema);

 
// console.log(items);
// Routes 
app.get("/",function(req, res){
    
    var param = "default";

    Item.find({},function(err,items){
        if(items.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("default items added");
                }
            });
        } 
        res.render('list', {param:param, items: items});
    });

    
});

app.get("/:listName",function(req, res){
    

    var listName = _.capitalize( req.params.listName );

    List.findOne({name: listName},function(err,list){
        if(!list){
            new List({
                name:listName,
                items:defaultItems
            }).save();
            res.redirect("/"+listName);
        } 
        else{
            res.render('list', { param:list.name, items: list.items });
        }
        
    });

    
});

app.post("/",function(req,res){
    var newItem = req.body.newItem; 
    var list = req.body.list;
    
    const item = new Item({name : newItem});

    if(list === "default"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({ name: list }, function (err,foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+list);
        });
    }
    
    
});

app.post("/delete",function(req,res){
    var _id = req.body._id;
    var listName = req.body.typename;
    
    if(listName === "default"){
        Item.findByIdAndRemove(_id, function(err){
            console.log('deleted');
            
        });
        res.redirect("/");
    }
    else{
        var query = { name: listName };
        List.findOneAndUpdate(query, { $pull : {items: {_id:_id} } }, function(err,foundList){});
        res.redirect("/"+listName);
    }
    

    
});
 

// End 


app.listen(port, () => console.log(`Server listening on port ${port}!`));