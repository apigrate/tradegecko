# TradeGecko NodeJS API Connector
A NodeJS connector for simplifying interactions with the TradeGecko API.

### Usage

You will need an api token to instantiate the connector.
```javascript
const TradeGecko  = require('@apigrate/tradegecko');
let tg = new TradeGecko({
  apiToken: 'your API token from secure storage'
});
```

### List Objects

Use the `get` method to list objects. Sideloading is supported. When nothing is found that matches the search criteria, the method returns an empty array response (see example below).

Example request:
```javascript
let result = await tg.get('/products', {ids:[31438119,31479255], include: 'variants'});
```

Example response (fields omitted):
```javascript
{
  "variants": [ //sideloading supported
    {
      "id": 59476653,
      //...additional fields
    },
    {
      "id": 59354382,
      //...additional fields
    }
  ],
  "products": [
    {
      "id": 31479255,
      //...additional fields
      "variant_ids": [
        59476653
      ]
    },
    {
      "id": 31538119,
      //...additional fields
      "variant_ids": [
        59354382
      ]
    }
  ]
}
```

Example empty response:
```javascript
{
  "products": []
}
```


### Get Object by ID

Use the `getById` method to get a single object by id. Sideloading is supported. When an object is not found, this method returns `null`.

Example request:
```javascript
let result = await tg.getById('/products', 31479255, {include: 'variants'});
```
Example response (fields omitted):
```javascript
{
  "variants": [ //sideloading supported
    {
      "id": 59476653,
      //...additional fields
    }
  ],
  "product": { //<-- IMPORTANT! note singular "product", NOT "products"
    "id": 31479255,
    //...additional fields
    "variant_ids": [
      59476653
    ]
  }
}
```

### Create an Object

Use the `post` method to create an object.

```javascript

```

### Update an Object

Use the `put` method to update an object.

```javascript

```

### Delete an Object

Use the `delete` method to delete an object.

```javascript

```


### Rate Limiting and Request IDs

The connector captures rate limits internally from the last request. It does not implement any specific rate-limiting logic-this is left as a choice for developer to implement.

Get the rate limit information from the last request:
```javascript
console.log(
`
Last Request ID: ${tg.request_id}
Rate Limit: ${tg.rate_limit}
Rate Limit Remaining: ${tg.rate_limit_remaining}
Rate Limit Resets: ${moment.unix(tg.rate_limit_reset).format("M/D/YYYY HH:mm:ssZ")}
`);
// note, use of moment is not a bundled dependency
```

### Debug Available

You can enable debugging (courtesy of the debug module):

```javascript
process.env.DEBUG = 'gr8:tradegecko';
```

Debugging information includes the raw response data.

## This connector brought to you by...
[Apigrate](https://www.apigrate.com) develops applications that make businesses of all sizes more efficient.
