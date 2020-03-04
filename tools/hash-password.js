import bcrypt from 'bcrypt';

bcrypt.hash('1234567890', 12, (err, encrypted) => {
    if (err) console.log(err);
    console.log(encrypted);
});
