const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('Routing Tests', function(){
     suite('POST /api/issues/:project => Issues', function() {
     
        test('Post issue (with every field)', function(done) {
        chai.request(server)
        .post('/api/issues/:project')
        .send({issue_title: 'Contact Us', issue_text:"Page not found",created_by:"Vincent",assigned_to:"Mitch",status_text:"This is still open"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title,'Contact Us');
          assert.equal(res.body.issue_text,'Page not found');
          assert.equal(res.body.created_by,'Vincent');
          assert.equal(res.body.assigned_to,'Mitch');
          assert.equal(res.body.status_text,'This is still open');
          done();
        })
          
        })
          test('Post issue (with only required field)', function(done) {
        chai.request(server)
        .post('/api/issues/:project')
        .send({issue_title: "Contact Us", issue_text:"Page not found",created_by:"Vincent",assigned_to:"",status_text:""})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title,'Contact Us');
          assert.equal(res.body.issue_text,'Page not found');
          assert.equal(res.body.created_by,'Vincent');
          assert.equal(res.body.assigned_to,'');
          assert.equal(res.body.status_text,'');
          done();
        })
          
        })
          test('Post issue (with missing required field)', function(done) {
        chai.request(server)
        .post('/api/issues/:project')
        .send({issue_title: '', issue_text:'',created_by:'',assigned_to:'Mitch',status_text:'This is still open'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error,'required field(s) missing');
          done();
        })
          
        })
     })
    suite( 'GET /api/issues/:project => Issues',function(){
      
      test('Get issues on project',function(done){
        chai.request(server)
            .get('/api/issues/stockapp')
            .query({})
            .end(function(err,res){
             assert.equal(res.status, 200);
              assert.isArray(res.body,'Returned list is an array');
              done();
        })
      })
      test('Get issues with one filter',function(done){
        chai.request(server)
            .get('/api/issues/:project')
            .query({createdBy:'Vincent'})
            .end(function(err,res){
              assert.equal(res.status,200);
              assert.isArray(res.body,'Returned list is an array');
              done();
          
        })
      })
      test('Get issues with multiple filters',function(done){
        chai.request(server)
            .get('/api/issues/:project')
            .query({createdBy:'Vincent',issue_text:"Page not found",open:true})
            .end(function(err,res){
              assert.equal(res.status,200);
              assert.isArray(res.body,'Returned list is an array');
              done();
        })
      })
    })
   suite('PUT /api/issues/:project => Issues',function(){
      
      test('Update one field in an issue', function(done){
        chai.request(server)
            .put('/api/issues/:project')
            .send({_id:'6040c46c2c36ca23cd2fda79',issue_title:'Icon'})
            .end(function(err,res){
              assert.equal(res.status,200);
              assert.equal(res.body.result,'successfully updated');
              assert.equal(res.body._id,'6040c46c2c36ca23cd2fda79');
              done();
        })
      })
         test('Update multiple fields in an issue', function(done){
        chai.request(server)
            .put('/api/issues/:project')
            .send({_id:'6040c46c2c36ca23cd2fda79',issue_title:'Icon',issue_text:"Too small"})
            .end(function(err,res){
              assert.equal(res.status,200);
              assert.equal(res.body.result,'successfully updated');
              assert.equal(res.body._id,'6040c46c2c36ca23cd2fda79');
              done();  
        })
      })
        test('Update an issue with missing _id', function(done){
        chai.request(server)
            .put('/api/issues/:project')
            .send({_id:''})
            .end(function(err,res){
              assert.equal(res.status,200);
              assert.equal(res.body.error,'missing _id');
              done();
        })
      })
     test('update an issue with no fields to update',function(done){
       chai.request(server)
           .put('/api/issues/:project')
           .send({_id:'6039e51792ff8a0d14a9b23c'})
           .end(function(err,res){
              assert.equal(res.body.error,'no update field(s) sent');
                 assert.equal(res.body._id,'6039e51792ff8a0d14a9b23c');
              done();
        })
     })    
     
     test('update an issue with invalid id',function(done){
       chai.request(server)
             .put('/api/issues/:project')
             .send({_id:'6039e51792ff8a0d14a9b43w',issue_title:'Icon'})
             .end(function(err,res){
               assert.equal(res.status,200);
               assert.equal(res.body.error,'could not update');
               assert.equal(res.body._id,'6039e51792ff8a0d14a9b43w');
               done();
       })
     })
    })
   suite('DELETE /api/issues/stockapp  => Issues',function(){
      test('delete an issue',function(done){
        chai.request(server)
            .post('/api/issues/:project')
            .send({
            issue_title: 'Created for deletion',
            issue_text: 'To test delete issue',
            created_by: 'Ann'
          })
            .end(function(err,res){
                    var _idToDelete = res.body._id;
                    chai.request(server)
                       .delete('/api/issues/:project')
                       .send({_id:_idToDelete})
                       .end(function(err,res){
                         assert.equal(res.status,200);
                         assert.equal(res.body.result,'successfully deleted');
                         assert.equal(res.body._id,_idToDelete);
                         done();
                       })
             })
      })
      test('delete with invalid _id',function(done){
          chai.request(server)
              .delete('/api/issues/:project')
              .send({_id:'6039e51792ff8a0d14a9b43w'})
              .end(function(err,res){
              assert.equal(res.status,200);
              assert.equal(res.body.error,'could not delete');
              done();
          })
      })
        test('delete with missing id',function(done){
          chai.request(server)
              .delete('/api/issues/:project')
              .send({_id:undefined})
              .end(function(err,res){
              assert.equal(res.status,200);
              assert.equal(res.body.error,'missing _id');
              done();
          })
      })
    })
  })
});
