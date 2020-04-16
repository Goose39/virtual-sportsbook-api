const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { password, user_name, full_name} = req.body

    for (const field of ['full_name', 'user_name', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })

    const passwordError = UsersService.validatePassword(password)

    if (passwordError)
      return res.status(400).json({ error: passwordError });

    UsersService.hasUserWithUserName(
      req.app.get('db'),
      user_name
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` });

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              user_name,
              password: hashedPassword,
              full_name,
            };

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
            .then(result =>  
              res
                .status(201)
                .json(result[0])
                .end()
            )
          })
      })
      .catch(next)
  });

  usersRouter 
  .get('/:user_id/balance', requireAuth, (req, res, next) => {
    const user_id = req.params.user_id;

    if (user_id == null )
        return res.status(400).json({
          error: `Missing 'user_id' in request body`
        });

    return UsersService.getUserBalance(req.app.get('db'), user_id)
      .then(balance => {
            res
            .status(200)
            .json(balance)
            .end()
        })
        .catch(next)
      });

  usersRouter 
  .patch('/:user_id/balance', jsonBodyParser, requireAuth, (req, res, next) => {
    const user_id = req.params.user_id;
    
    return UsersService.reloadUserBalance(req.app.get('db'), user_id)
      .then(balance => {
            res
            .status(200)
            .json(balance)
            .end()
        })
        .catch(next)
      });

module.exports = usersRouter;
