const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema
const SearchOrderSchema = new Schema({
  searchdata: { 
    query: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      required: true
    },
    options: {
      user: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      } },
      //close options
      callbackurl: {
        type: String,
        required: true
      }
    },
  //Close searchdata 
  orderstatus: {
    type: String,
    default: 'received'
  },
  productresult: {

  }
}, { versionKey: false } );
    


module.exports = SearchOrder = mongoose.model('SearchOrder', SearchOrderSchema);