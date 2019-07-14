module.exports = {
  isOwner: function(req, res) {
    if (req.user) {
      return true;
    } else {
      return false;
    }
  },
  statusUI: function(req, res) {
    let authStatusUI = `<a href="/auth/login">login</a>`;
    if (this.isOwner(req, res)) {
      authStatusUI = `${req.user.nickname} | <a href="/auth/logout">logout</a>`;
    }
    return authStatusUI;
  }
};
