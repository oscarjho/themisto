const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatepost(data) {
  let errors = {};

  data.searchdata.query = !isEmpty(data.searchdata.query) ? data.searchdata.query : '';
  data.searchdata.provider = !isEmpty(data.searchdata.provider) ? data.searchdata.provider : '';
  data.searchdata.options.user = !isEmpty(data.searchdata.options.user) ? data.searchdata.options.user : '';
  data.searchdata.options.password = !isEmpty(data.searchdata.options.password) ? data.searchdata.options.password : '';
  data.searchdata.callbackurl = !isEmpty(data.searchdata.callbackurl) ? data.searchdata.callbackurl : '';

  if (Validator.isEmpty(data.searchdata.query)) {
    errors.query = 'Query field is required';
  }

  if (Validator.isEmpty(data.searchdata.provider)) {
    errors.provider = 'provider field is required';
  }

  if (Validator.isEmpty(data.searchdata.options.user)) {
    errors.optionsu = 'user field is required';
  }

  if (Validator.isEmpty(data.searchdata.options.password)) {
    errors.optionsp = 'password field is required';
  }

  if (Validator.isEmpty(data.searchdata.callbackurl)) {
    errors.callbackurl = 'callbackurl field is required';
  }

  if (!Validator.isLength(data.searchdata.query, { min: 2, max: 30 })) {
    errors.query = 'query must be between 2 and 30 characters';
  }

  if (!Validator.isLength(data.searchdata.provider, { min: 2, max: 30 })) {
    errors.provider = 'provider must be between 2 and 30 characters';
  }

  if (!Validator.isLength(data.searchdata.provider, { min: 2, max: 30 })) {
    errors.provider = 'provider must be between 2 and 30 characters';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
