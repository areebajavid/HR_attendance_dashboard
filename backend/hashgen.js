const bcrypt = require('bcrypt');
bcrypt.hash('Hr@1234', 10).then(h => console.log(h));