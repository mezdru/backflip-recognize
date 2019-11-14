exports.resAllowedToReadOrganisationOnly = async (req, res, next) => {
  var resData = req.backflipRecognize;

  if(
    (req.organisation.public) || 
    (req.user && req.user.superadmin) ||
    (req.user && req.user.belongsToOrganisation(req.organisation._id))
  ) return res.status(resData.status).json({message: resData.message, data: resData.data});

  return response403(res);
}

exports.resForUserGrantedOnly = async (req, res, next) => {
  var resData = req.backflipRecognize;
  
  if(resData.forceResponse)
    return res.status(resData.status).json({message: resData.message, data: resData.data});

  if(req.user.superadmin || (resData.owner && resData.owner.equals(req.user._id)))
    return res.status(resData.status).json({message: resData.message, data: resData.data});

  // all User in organisation can access the data
  if(resData.organisation && req.user.belongsToOrganisation(resData.organisation))
    return res.status(resData.status).json({message: resData.message, data: resData.data});

  return response403(res);
}

exports.clientOnly = async (req, res, next) => {
  if(req.user.clientId && req.user.scope.find(scopeElt => scopeElt === req.backflipRecognize.resource.model)) return next();
  return response403(res);
}

exports.superadminOnly = async (req, res, next) => {
  if(req.user.superadmin) return next();

  return response403(res);
}

exports.resForSuperadminOnly = async (req, res, next) => {
  var resData = req.backflipRecognize;
  if(req.user.superadmin)
    return res.status(resData.status).json({message: resData.message, data: resData.data});

  return response403(res);
}

exports.resForAllUser = async (req, res, next) => {
  var resData = req.backflipRecognize;
  return res.status(resData.status || 200).json({message: resData.message, data: resData.data})
}

let response403 = (res) => {
  return res.status(403).json({message: 'You have not access to this resource.'});
}