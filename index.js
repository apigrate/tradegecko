/*
  Copyright 2019 Apigrate LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
const debug        = require('debug')('gr8:tradegecko');
const request      = require('request-promise-native');
/**
 * API connector for TradeGecko
 *
 * Supports get, post (create), put (update), delete operations.
 * After each request
 */
class TradeGecko{
  /**
   * @param {object} options object hash storing connector options
   * @example {
   *  apiToken: <privileged access token>
   * }
   */
  constructor(options){
    this.options = options;
    this.baseRequest = request.defaults({
      baseUrl: 'https://api.tradegecko.com/',
      headers:{
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + options.apiToken
      },
      //time: options.measureTiming || false,
      resolveWithFullResponse : true
    });

    this.rate_limit = 0;
    this.rate_limit_remaining = 0;
    this.rate_limit_reset = 0;
    this.request_id = 0;
  }


  async get(objectName, opts){

    try{

      let path = this.encodePath(objectName, opts);
      debug(`Listing objects. GET ${path}`);

      let resp = await this.baseRequest.get(path);
      return this.handleResponse(resp);

    }catch(ex){
      return this.handleResponse(ex);
    }


  }//get method


  async getById(objectName, id, opts){

    try {

      let path = this.encodePath(`${objectName}/${id}`, opts);
      debug(`Getting object. GET ${objectName}/${id}`);
      let resp = await this.baseRequest.get(path);
      return this.handleResponse(resp);

    }catch(ex){
      return this.handleResponse(ex);
    }

  }//getById method


  /**
    Issues a POST request to CREATE an item.
    @param {string} objectName name of the object (path on the TradeGecko API, e.g. Products, Invoices, Contacts, etc)
    @param {object} bodyContent the body of the request
    @param {object} options (optional) additional options to be sent, if any
    @example {
      summarizeErrors: true
    }
  */
  post(objectName, bodyContent, opts){

    try {
      debug(`Creating new object. POST ${objectName}\n  object to save:\n  ${JSON.stringify(bodyContent)}`);

      var qstring = '';
      if(opts){
        if(opts.summarizeErrors){
          qstring += 'summarizeErrors='+_.escape(opts.summarizeErrors);
        }
      }
      if(qstring !== '') qstring = '?' + qstring;

      this.baseRequest.post({ uri: objectName+qstring, body: bodyContent, json: true }, function(err, resp, body){

        if(err){
          console.error('  Error saving ' + singular(objectName) + '. Reason:\n'+JSON.stringify(err));
          console.error('    Response:\n'+JSON.stringify(resp));
          reject(err);
        } else {
          debug(JSON.stringify(resp));
          if(resp.statusCode != 200 && resp.statusCode != 201){
            reject(new Error('Error (HTTP-'+resp.statusCode+') saving ' + singular(objectName) +'. Details:\n'+JSON.stringify(body) ));
          } else {

            debug('  Response:\n' + JSON.stringify(body));
            var parsed = body;
            if(!_.isNil(parsed.ErrorNumber)){
              console.error('  Error saving ' + singular(objectName) + '. Reason: '+ parsed.Message);
              console.error( '    ' + JSON.stringify(parsed) );
              reject(new Error('Error saving ' + singular(objectName) + '. Details:\n' + JSON.stringify(parsed)) );

            } else {
              resolve(parsed);
            }
          }

        }
      });//baseRequest
    } catch (ex){
      console.error(ex);
      throw ex;
    }
  }// post method


  /**
    Issues a PUT to UPDATE an item
    @param {string} objectName name of the object (path on the TradeGecko API, e.g. Products, Invoices, Contacts, etc)
    @param {object} id the id of the entity.
    @param {object} bodyContent the body of the request (a JSON object)
    @param {object} options (optional) additional options to be sent, if any
    @example {
      summarizeErrors: true
    }
  */
  put(objectName, id, bodyContent, opts){

    try {

      debug(`Updating object. PUT ${objectName}\n  object to save:\n  ${JSON.stringify(bodyContent)}`);

      var idstring = '';
      if(!_.isNil(id)){
        debug('  where id=' + id );
        idstring = '/'+ _.escape(id);
      }

      var qstring = '';
      if(opts){
        if(opts.summarizeErrors){
          qstring += 'summarizeErrors='+_.escape(opts.summarizeErrors);
        }
      }
      if(qstring !== '') qstring = '?' + qstring;

      this.baseRequest.put({uri: objectName+idstring+qstring, body: bodyContent, json: true}, function(err, resp, body){

        if(err){
          console.error('  Error creating ' + singular(objectName) + '. Reason:\n'+JSON.stringify(err));
          console.error('    Response:\n'+JSON.stringify(resp));
          reject(err);
        } else {
          debug('  Response:\n' + JSON.stringify(body))
          var parsed = body;
          if(!_.isNil(parsed.ErrorNumber)){
            console.error('  Error creating ' + singular(objectName) + '. Reason: '+ parsed.Message);
            console.error( '    ' + JSON.stringify(parsed) );
            reject(new Error('Error creating ' + singular(objectName) + '. Details:\n' + JSON.stringify(parsed)) );

          } else {
            resolve(parsed);
          }

        }
      });//baseRequest
    } catch (ex){
      console.error(ex);
      throw ex;
    }
  }// put method


  delete(objectName, id, opts){

    try {

      debug(`Deleting object. DELETE ${objectName}/${id}`);

      var idstring = '';
      if(!_.isNil(id)){
        debug('  where id=' + id );
        idstring = '/'+ _.escape(id);
      }

      var qstring = '';
      if(opts){
        if(opts.summarizeErrors){
          qstring += 'summarizeErrors='+_.escape(opts.summarizeErrors);
        }
      }
      if(qstring !== '') qstring = '?' + qstring;

      this.baseRequest.delete({ uri: objectName+idstring+qstring, json: true }, function(err, resp, body){

        if(err){
          console.error('  Error deleting ' + singular(objectName) + '. Reason:\n'+JSON.stringify(err));
          console.error('    Response:\n'+JSON.stringify(resp));
          reject(err);
        } else {
          debug('  Response:\n' + body)
          var parsed = body;
          if(!_.isNil(parsed) && !_.isNil(parsed.ErrorNumber)){
            console.error('  Error deleting ' + singular(objectName) + '. Reason: '+ parsed.Message);
            console.error( '    ' + JSON.stringify(parsed) );
            throw new Error('Error deleting ' + singular(objectName) + '. Details:\n' + JSON.stringify(parsed));

          } else {
            return parsed;
          }

        }
      });//baseRequest
    } catch (ex){
      console.error(ex);
      throw ex;
    }
  }//delete method


  /**
   * Encodes common path options
   */
  encodePath(objecturi, opts){
    let path = "";
    if(opts){
      if(opts.ids){
        path += (path===''?'':'&') + 'ids=' + opts.ids.join(",");
      }
      if(opts.page){
        path += (path===''?'':'&') + 'page=' + encodeURIComponent(opts.page);
      }
      if(opts.limit){
        path += (path===''?'':'&') + 'limit=' + encodeURIComponent(opts.limit);
      }
      if(opts.updated_at_min){
        path += (path===''?'':'&') + 'updated_at_min=' + opts.updated_at_min;
      }
      if(opts.updated_at_max){
        path += (path===''?'':'&') + 'updated_at_max=' + opts.updated_at_max;
      }
      if(opts.created_at_min){
        path += (path===''?'':'&') + 'created_at_min=' + opts.created_at_min;
      }
      if(opts.created_at_max){
        path += (path===''?'':'&') + 'created_at_max=' + opts.created_at_max;
      }
      if(opts.include){
        path += (path===''?'':'&') + 'include=' + encodeURIComponent(opts.include);
      }

      if(opts.parms){
        for(parmKey in opts.parms){
          path += (path===''?'':'&') + parmKey+ '=' + encodeURIComponent(opts.parms[parmKey])
        }

      }
    }
    return `${objecturi}${path? '?'+path : ""}`;
  }


  //Note, this handles both the response and error payloads from request-promise-native.
  handleResponse(resp){

    if(resp.statusCode >=200 && resp.statusCode <300){
      debug(`HTTP-${resp.statusCode}`);
      this.rate_limit            = resp.headers['x-rate-limit-limit'];
      this.rate_limit_remaining  = resp.headers['x-rate-limit-remaining'];
      this.rate_limit_reset      = resp.headers['x-rate-limit-reset'];
      this.request_id            = resp.headers['x-request-id'];

      return JSON.parse(resp.body);
    } else {
      //Errors.
      this.rate_limit            = resp.response.headers['x-rate-limit-limit'];
      this.rate_limit_remaining  = resp.response.headers['x-rate-limit-remaining'];
      this.rate_limit_reset      = resp.response.headers['x-rate-limit-reset'];
      this.request_id            = resp.response.headers['x-request-id'];

      //resp is an error object, containing the response, which contains the body (which must be parsed).
      let responseBody = JSON.parse(resp.response.body);

      if (resp.statusCode >= 400 && resp.statusCode < 500) {
        debug(`Client error. HTTP-${resp.statusCode}`);
        if(resp.statusCode === 404){
          debug(responseBody.message)
          return null; //Don't throw an error, return null.
        }
        errorPayload = JSON.parse(resp.body);
        console.error(responseBody.message);
        throw new Error(responseBody.message)
      } else if( resp.statusCode >=500){
        debug(`Server error. HTTP-${resp.statusCode}`);
        //response body may not be parseable. Return error with raw body.
        throw new Error(`TradeGecko Server Error (HTTP-${resp.statusCode}). Details: ${resp.body}`);
      } else {
        debug(`HTTP-${resp.statusCode}`);
        //Some other potentially valid response. Return the payload.
        return responseBody;
      }
    }


  }


}//TradeGecko

module.exports = TradeGecko;
