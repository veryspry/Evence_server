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

      try {
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
        done(null, profile)
      } catch (err) {
        done(err)
      }
    }
  )

  passport.use(strategy)

  // refresh.use(strategy)

  router.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
  })

  router.get('/', passport.authenticate('linkedin', (err, user, info) => {
    if (err) { return next(err) }
  }))

  router.get('/me', (req, res, next) => {
    // console.log('login', req)
    passport.authenticate('linkedin', (err, user, info) => {
      if (err) {
        return next(err)
      }
      if (!user) {
        return res.redirect('/auth/linkedin')
      }
      res.json(user)
    })(req, res, next)
  })

  router.get('/callback', passport.authenticate('linkedin', {
      // successRedirect: '/auth/linkedin/redirect',
      successRedirect: 'exp://3i-ear.veryspry.ui.exp.direct:80',
      failureRedirect: '/auth/linkedin'
    }), function() {
      console.log('hey, Im that middleware were testing');
      next()
    }, async (req, res, next) => {
  })


  // Redirect the user back to the
  router.get('/redirect', async (req, res, next) => {
    res.redirect('exp://8k-xp5.veryspry.evence.exp.direct:80')
  })

  // /auth/linkedin/clientid --> give you the linkedin client id
  router.get('/clientid', async(req, res, next) => {
      res.send(process.env.LINKEDIN_CLIENT_ID)
  })
  // /auth/linkedin/clientsecret --> gives you the linkedin client secret
  router.get('/clientsecret', async(req, res, next) => {
    res.send(process.env.LINKEDIN_CLIENT_SECRET)
  })
  // /auth/linkedin/appstate
  router.get('/appstate', (req, res, next) => {
    res.send(process.env.LINKEDIN_APP_STATE)
  })

}
