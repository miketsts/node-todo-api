const jwt = require('jsonwebtoken');

var data = {
  id: 10
}

var token = jwt.sign(data, '1234asdf');
console.log(token);

var decoded = jwt.verify(token, '1234asdf');
console.log(decoded);