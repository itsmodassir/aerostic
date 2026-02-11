const bcrypt = require('bcrypt');
const hash = '$2b$10$QP4erMvni2mk/Q2fQIqTse1O0hu/HtLXJsEXtKgjeU6xCbc1twdW6';
const password = 'Am5361$44';

bcrypt.compare(password, hash).then(result => {
    console.log('Match result for mdrive492@gmail.com:', result);
}).catch(err => {
    console.error('Error during comparison:', err);
});
