import 'babel-polyfill';
import express from 'express';
import passport from 'passport';
import User from '../models/user';

const FacebookStrategy = require('passport-facebook').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const facebookRouter = express.Router();



facebookRouter.use(passport.initialize());
facebookRouter.use(passport.session());


passport.use(
    new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID ,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_CLIENT_CALLBACK_URL
        },
        
        function(accessToken, refreshToken, profile, done) {
            User.findOne({
            token: profile.id
        }, function(err, user) {
           
            if (err) {
                done(err);
            }
            if (user) {
                user.accessToken = accessToken;
                user.save(function(err){
                    return done(err, user);
                })
            }
            else {
                const newUser = new User({
                    username: profile.displayName,
                    accessToken: accessToken,
                    token: profile.id
                });
                newUser.save(function(err, res) {
                    if (err) return done(err, res);
                    return done(null, newUser);
                });
            }

        });
        }
    ));

facebookRouter.get(
  '/',
    passport.authenticate('facebook', { session: false, scope: ['email'] })
);

facebookRouter.get('/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: "/login" }),
  function(req, res) {
    var accessToken = req.user.accessToken;
    res.redirect("https://asyncin-client-surbi.c9users.io/home?access_token=" + accessToken);
  }
);

passport.use(
    new BearerStrategy(
        function(token, done) {
            User.findOne({
                    accessToken: token
                },
                function(err, user) {
                    if (err) {
                        return done(err)
                    }
                    if (!user) {
                        return done(null, false)
                    }

                    return done(null, user, {
                        scope: 'all'
                    })
                }
            );
        }
    )
);


module.exports = facebookRouter;