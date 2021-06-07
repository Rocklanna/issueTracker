 'use strict';

const mongoose = require("mongoose");

mongoose.connect(process.env.DB,{useNewUrlParser:true, useUnifiedTopology:true});

const tracker = new mongoose.Schema({
  project:String,
  issue_title:{type:String, required:true},
  issue_text:{type:String,required:true},
  created_by:{type:String,required:true},
  assigned_to:String,
  status_text:String,
  created_on:Date,
  updated_on:Date,
  open:Boolean
})

const savedIssues = mongoose.model("savedIssue", tracker);


module.exports = function (app) {

  app.route('/api/issues/:project')
  
   .get(function (req, res){
      
     let project = req.params.project;
    
   // res.send(project);
    
      let query = {
          project:project,
           _id:"",
          issue_title:"",
          issue_text:"",
          created_by:"",
          assigned_to:"",
          status_text:"",
          created_on:"",
          updated_on:"",
          open:""
      } ;
      
        (req.query._id)?query._id=req.query._id: delete query._id;    
        (req.query.issue_title)?query.issue_title=req.query.issue_title : delete query.issue_title;
        (req.query.issue_text)?query.issue_text=req.query.issue_text : delete query.issue_text;
        (req.query.created_by)?query.created_by=req.query.created_by : delete query.created_by;
        (req.query.assigned_to)?query.assigned_to=req.query.assigned_to: delete query.assigned_to;
        (req.query.status_text)?query.status_text=req.query.status_text: delete query.status_text;
        (req.query.created_on)?query.created_on=req.query.created_on: delete query.created_on;
        (req.query.updated_on)?query.updated_on=req.query.updated_on: delete query.updated_on;
        (req.query.open)?query.open=req.query.open: delete query.open;
    
      savedIssues.find(query)
                .then(foundList=>{
                    res.json(foundList);
      })
      .catch(err=>
            res.send("Error occured, cannot find issue list"));
        
    })
  

    
    .post(function (req, res){
    
    
     let project = req.params.project;
   
      let title= (req.body.issue_title=="" || req.body.issue_title==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.issue_title ;
      let text= (req.body.issue_text=="" || req.body.issue_text==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.issue_text ;
      let createdBy= (req.body.created_by=="" || req.body.created_by==undefined)
                  ? res.json({error: 'required field(s) missing'})
                  : req.body.created_by;
          
      let assignedTo=  (req.body.assigned_to=="" || req.body.assigned_to==undefined)
                        ? ""
                        : req.body.assigned_to;
       
      let status= (req.body.status_text=="" || req.body.status_text==undefined)
                        ? ""
                        : req.body.status_text;
   
    
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    
    
    const datatoDB = new savedIssues({project:project, issue_title:title,issue_text:text,created_by:createdBy, assigned_to:assignedTo,status_text:status, created_on:today.toISOString(),
                     updated_on:today.toISOString(), open:true});
    
  datatoDB.save()
          .then(savedIssue=>{
     res.json({_id:savedIssue["_id"], created_on:savedIssue["created_on"],updated_on:savedIssue["updated_on"], open:savedIssue["open"],
                issue_title:title,issue_text:text,created_by:createdBy,assigned_to:assignedTo,status_text:status              
               });
  //  res.json({updated_on:typeof Date.parse(savedIssue["updated_on"]),created_on:typeof Date.parse(savedIssue["created_on"]), open:typeof savedIssue["open"] })
           })
          .catch(err=>{
          res.send("cannot save to Database,try again");
  })
    
    

      
    })
    
    .put(function (req, res){
    
          
     let project = req.params.project;
    
       const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    
  if (req.body._id=="" || req.body._id==undefined){
    
    res.json({error:'missing _id'})
  }  
    
     let id =  req.body._id;
    

          let query = {
          project:project,
          issue_title:"",
          issue_text:"",
          created_by:"",
          assigned_to:"",
          status_text:"",
          open:"",
          updated_on: today.toISOString() 
      } ;
        
    
        (req.body.issue_title)?query.issue_title=req.body.issue_title : delete query.issue_title;
        (req.body.issue_text)?query.issue_text=req.body.issue_text : delete query.issue_text;
        (req.body.created_by)?query.created_by=req.body.created_by : delete query.created_by;
        (req.body.assigned_to)?query.assigned_to=req.body.assigned_to: delete query.assigned_to;
        (req.body.status_text)?query.status_text=req.body.status_text: delete query.status_text;
        (req.body.open)?query.open=req.body.open: delete query.open;
    
    if(Object.keys(query).length<=2){
     return  res.json({error: 'no update field(s) sent', _id: id});
    }
    
savedIssues.findByIdAndUpdate(id,query,{new: true}) // By default new is set to false so the updated list isnt returned, set new to true so the returned list is the updated list not original
            .then(foundList=>{
  
             //return res.send(foundList);
             if(Object.keys(foundList).length>0){ // findByIdAndUpdate also returns null so check this checks that the returned object actually contains something
               
               return res.json({result: 'successfully updated', '_id': id})
             }
            else{
               return   res.json({error: 'could not update', _id: id});
            }
})
            .catch(err=>{
                   return   res.json({error: 'could not update', _id: id});
})
      
    
 
    })
    
    .delete(function (req, res){
      //let project = req.params.project;
    
    
    if(req.body._id==="" || req.body._id===undefined){
      res.json({error:'missing _id'})
    }
    else{
    
       let id = req.body._id;
 
    savedIssues.findByIdAndRemove({_id:id})
              .then(deleted=>{
      
      //return  res.json({  result: 'successfully deleted', _id: id});
                 if(Object.keys(deleted).length>0){
           return res.json({  result: 'successfully deleted', _id: id});
                  } 
                  else{
               return   res.json({error: 'could not delete', _id: id});
            }
                    
         })
     .catch(err=>{
      res.json({ error:'could not delete', _id: id });
    })
    }   
    });
    
};
