const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

const findOrCreateOAuthUser = async ({ provider, profile, emailFromProfile }) => {
  const providerIdField = provider === "google" ? "googleId" : "githubId";

  let user = await User.findOne({ [providerIdField]: profile.id });
  if (user) return user;

  if (emailFromProfile) {
    user = await User.findOne({ email: emailFromProfile.toLowerCase() });
    if (user) {
      user[providerIdField] = profile.id;
      await user.save();
      return user;
    }
  }

  const username =
    profile.username ||
    profile.displayName?.replace(/\s+/g, "_").toLowerCase() ||
    `user_${Date.now()}`;

  const newUser = await User.create({
    username,
    email: emailFromProfile || `${provider}_${profile.id}@placeholder.local`,
    role: "buyer",
    [providerIdField]: profile.id,
    authProvider: provider
  });

  return newUser;
};

const configurePassport = () => {
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
  ) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const user = await findOrCreateOAuthUser({
              provider: "google",
              profile,
              emailFromProfile: email
            });
            done(null, user);
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
  }

  if (
    process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET &&
    process.env.GITHUB_CALLBACK_URL
  ) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL,
          scope: ["user:email"]
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const primaryEmail =
              profile.emails?.find((item) => item.primary)?.value ||
              profile.emails?.[0]?.value;

            const user = await findOrCreateOAuthUser({
              provider: "github",
              profile,
              emailFromProfile: primaryEmail
            });
            done(null, user);
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
  }
};

module.exports = { configurePassport, passport };
