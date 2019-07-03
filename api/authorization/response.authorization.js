exports.resForUserGrantedOnly = async (req, res, next) => {
  var resData = req.backflipRecognize;

  if(req.user.superadmin || (resData.owner && resData.owner.equals(req.user._id)))
    return res.status(resData.status).json({message: resData.message, data: resData.data});

  // all User in organisation can access the data
  if(resData.organisation && req.user.belongsToOrganisation(resData.organisation))
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