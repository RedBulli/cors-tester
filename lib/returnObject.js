module.exports.getReturnObjectFromXhrNetworkEvents = function (xhrUrl, networkEvents) {
  if (networkEvents.requests.length < 2)
    return getNoXhrRequestMadeError();
  else
    return getXhrRequestAndResponseData(xhrUrl, networkEvents);
};

module.exports.convertToSimpleReturnValue = function(retval) {
  if (!retval.error)
    return 'Success!'
  else if (isOperationCanceled(retval.error))
    return 'Cors not allowed!';
  else
    return retval.error.errorString;
};

function isOperationCanceled(error) {
  if (error)
    return error.errorCode === 5;
  else
    return false;
}

function getXhrEventByUrl(xhrUrl, eventList) {
  for (var i=0; i<eventList.length; i++) {
    if (trimDashesFromEnd(eventList[i].url) === trimDashesFromEnd(xhrUrl)) {
      return eventList[i];
    }
  }
  return null;
}

function trimDashesFromEnd(url) {
  return url.replace(/\/$/, '');
}

function getXhrRequestAndResponseData(xhrUrl, networkEvents) {
  var returnObj = {};
  var xhrError = getXhrEventByUrl(xhrUrl, networkEvents.errors);
  if (xhrError) {
    returnObj.error = xhrError;
  } else {
    returnObj.success = 'Success';
  }
  returnObj.response = getXhrEventByUrl(xhrUrl, networkEvents.responses);
  return returnObj;
}

function getNoXhrRequestMadeError() {
  return {
    error: {
      errorString: 'No XHR requests made. This is most likely due to malformed URL'
    }
  };
}
