module.exports = {
  isOwner: function(req, res) {
    if (req.user) {
      return true;
    } else {
      return false;
    }
  },
  statusUI: function(req, res) {
    let authStatusUI = `<a href="/auth/login">login</a> | <a href="/auth/register">register</a> | <a href="/auth/facebook">Login with Facebook</a> | <a href="/auth/google">Login with Google</a>`;
    if (this.isOwner(req, res)) {
      authStatusUI = `${
        req.user.displayName
      } | <a href="/auth/logout">logout</a>`;
    }
    return authStatusUI;
  }
};
