const router = require('express').Router()
const passport = require('passport')
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
const {User} = require('../db/models')
const refresh = require('passport-oauth2-refresh')

module.exports = router

if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
  console.log('Linkedin client ID / secret not found. Skipping Linkedin Oauth')
} else {
  const linkedinConfig = {
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK,
    scope: ['r_emailaddress', 'r_basicprofile'],
    state: true
  }
  const strategy = new LinkedInStrategy(
    linkedinConfig,
    (accessToken, refreshToken, profile, done) => {
      const linkedinId = profile._json.id
      const nameFirst = profile._json.firstName
      const nameLast = profile._json.lastName
      const email = profile._json.emailAddress
      const industry = profile._json.industry
      const linkedinToken = accessToken
      const headline = profile._json.headline
      const area = profile._json.location.name
      const numConnections = profile._json.numConnections
      const positions = profile._json.positions._total
      const summary = profile._json.summary
      const picUrl = profile._json.pictureUrl
      // console.log(' this is the profile from linkedin', profile._json)
      // console.log('this is the access token:', accessToken)
      // console.log('this is the refreshToken:', refreshToken)
      console.log('linkedinId', linkedinId)
      console.log('positions', profile._json.positions)
      User.findOrCreate({
        where: {linkedinId},
        defaults: {
          nameFirst,
          nameLast,
          email,
          industry,
          linkedinToken,
          headline,
          area,
          numConnections,
          positions,
          summary,
          picUrl
        }
      })
        // asynchronous verification, for effect...
        .then(() => {
          done(null, profile)
        })
        .catch(done)
    }
  )

  passport.use(strategy)

  // refresh.use(strategy)

  router.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
  })

  router.get('/', passport.authenticate('linkedin'), function(req, res) {
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  })

  router.get(
    '/callback',
    passport.authenticate('linkedin', {
      successRedirect: '/',
      failureRedirect: '/login'
    })
  )
}
