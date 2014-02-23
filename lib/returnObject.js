module.exports.getReturnObjectFromXhrNetworkEvents = function (xhrUrl, networkEvents) {
  var returnObj = {};
  if (networkEvents.requests.length < 2) {
    returnObj.error = {
      errorString: 'No XHR requests made. This is most likely due to malformed URL',
      errorCode: null
    };
  } else {
    var xhrError = getXhrErrorByUrl(xhrUrl, networkEvents.errors);
    if (xhrError) {
      returnObj.error = xhrError;
    } else {
      returnObj.success = 'Success';
    }
  }
  return returnObj;
};

function getXhrErrorByUrl(xhrUrl, errors) {
  for (var i=0; i<errors.length; i++) {
    if (trimDashesFromEnd(errors[i].url) === trimDashesFromEnd(xhrUrl)) {
      return errors[i];
    }
  }
  return null;
}

function trimDashesFromEnd(url) {
  return url.replace(/\/$/, '');
}